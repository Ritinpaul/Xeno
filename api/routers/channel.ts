/**
 * Channel Service — Stubbed Delivery Service
 *
 * Architecture: CRM → [channel.send] → Channel Service (this router)
 *               Channel Service → [async callbacks] → CRM receipt (updates DB directly)
 *
 * This simulates a real messaging provider (WhatsApp, SMS, Email).
 * The channel service receives send requests, then asynchronously fires
 * callbacks back to update CRM state, simulating the full delivery lifecycle:
 *   queued → sent → delivered → opened → clicked → converted
 *
 * In production: this would be a separately deployed microservice that calls back
 * via HTTP webhooks. Here it runs in the same process as a clearly separated module.
 */

import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { messages, campaigns } from "@db/schema";
import { eq, sql } from "drizzle-orm";

// ── Channel Delivery Models ──────────────────────────────────────────
export const CHANNEL_MODELS = {
  whatsapp: {
    deliveryRate: 0.95,
    openRate: 0.82,
    clickRate: 0.32,
    conversionRate: 0.12,
    // Simulated timing (ms) — compressed for demo realism
    sentDelayMs: 400,
    deliveredDelayMs: 900,
    openedDelayMs: 1800,
    clickedDelayMs: 3000,
    convertedDelayMs: 4500,
  },
  sms: {
    deliveryRate: 0.98,
    openRate: 0.88,
    clickRate: 0.18,
    conversionRate: 0.07,
    sentDelayMs: 300,
    deliveredDelayMs: 700,
    openedDelayMs: 1400,
    clickedDelayMs: 2500,
    convertedDelayMs: 4000,
  },
  email: {
    deliveryRate: 0.87,
    openRate: 0.24,
    clickRate: 0.07,
    conversionRate: 0.025,
    sentDelayMs: 600,
    deliveredDelayMs: 1300,
    openedDelayMs: 2800,
    clickedDelayMs: 4500,
    convertedDelayMs: 7000,
  },
} as const;

type Channel = keyof typeof CHANNEL_MODELS;

/**
 * processMessageReceipt — Simulates the channel service sending callbacks
 * back to the CRM for a single message.
 *
 * Each step mimics a real callback from the channel provider:
 *   1. "Message sent"       → CRM updates actualSent
 *   2. "Message delivered"  → CRM updates actualDelivered
 *   3. "Message opened"     → CRM updates actualOpened (if user opened)
 *   4. "Message clicked"    → CRM updates actualClicked (if user clicked)
 *   5. "Message converted"  → CRM updates actualConverted + revenue
 */
async function processMessageReceipt(
  messageId: number,
  campaignId: number,
  channel: Channel
): Promise<void> {
  const db = getDb();
  const model = CHANNEL_MODELS[channel];
  const rng = Math.random();
  const rng2 = Math.random();
  const rng3 = Math.random();
  const rng4 = Math.random();

  try {
    // Step 1: Sent callback
    await new Promise((r) => setTimeout(r, model.sentDelayMs + Math.random() * 200));
    await db
      .update(messages)
      .set({ status: "sent", sentAt: new Date() })
      .where(eq(messages.id, messageId));
    await db
      .update(campaigns)
      .set({ actualSent: sql`${campaigns.actualSent} + 1` })
      .where(eq(campaigns.id, campaignId));

    // Step 2: Delivery callback
    await new Promise((r) => setTimeout(r, model.deliveredDelayMs - model.sentDelayMs));
    if (rng > model.deliveryRate) {
      // Delivery failure callback
      await db
        .update(messages)
        .set({
          status: "failed",
          failureReason: "Channel delivery failed — recipient unreachable or blocked",
        })
        .where(eq(messages.id, messageId));
      return; // No further callbacks for failed messages
    }
    await db
      .update(messages)
      .set({ status: "delivered", deliveredAt: new Date() })
      .where(eq(messages.id, messageId));
    await db
      .update(campaigns)
      .set({ actualDelivered: sql`${campaigns.actualDelivered} + 1` })
      .where(eq(campaigns.id, campaignId));

    // Step 3: Open callback (not all delivered messages are opened)
    await new Promise((r) => setTimeout(r, model.openedDelayMs - model.deliveredDelayMs));
    if (rng2 > model.openRate) return;
    await db
      .update(messages)
      .set({ status: "opened", openedAt: new Date() })
      .where(eq(messages.id, messageId));
    await db
      .update(campaigns)
      .set({ actualOpened: sql`${campaigns.actualOpened} + 1` })
      .where(eq(campaigns.id, campaignId));

    // Step 4: Click callback
    await new Promise((r) => setTimeout(r, model.clickedDelayMs - model.openedDelayMs));
    if (rng3 > model.clickRate) return;
    await db
      .update(messages)
      .set({ status: "clicked", clickedAt: new Date() })
      .where(eq(messages.id, messageId));
    await db
      .update(campaigns)
      .set({ actualClicked: sql`${campaigns.actualClicked} + 1` })
      .where(eq(campaigns.id, campaignId));

    // Step 5: Conversion callback
    await new Promise((r) => setTimeout(r, model.convertedDelayMs - model.clickedDelayMs));
    if (rng4 > model.conversionRate) return;
    const revenueAmount = (80 + Math.random() * 600).toFixed(2);
    await db
      .update(messages)
      .set({ status: "converted", convertedAt: new Date() })
      .where(eq(messages.id, messageId));
    await db
      .update(campaigns)
      .set({
        actualConverted: sql`${campaigns.actualConverted} + 1`,
        actualRevenue: sql`${campaigns.actualRevenue} + ${revenueAmount}`,
      })
      .where(eq(campaigns.id, campaignId));
  } catch (err) {
    console.error(
      `[ChannelService] Receipt callback failed for message ${messageId}:`,
      err
    );
  }
}

/**
 * dispatchCampaign — The main entry point called by the CRM when launching.
 *
 * Accepts the full message batch, marks them queued, then fire-and-forgets
 * the async simulation with controlled concurrency.
 */
export async function dispatchCampaign(
  campaignId: number,
  channel: Channel,
  messageIds: number[]
): Promise<{ accepted: number }> {
  const db = getDb();

  if (messageIds.length === 0) {
    return { accepted: 0 };
  }

  // Mark all messages as queued (CRM acknowledges hand-off to channel service)
  await db
    .update(messages)
    .set({ status: "queued" })
    .where(eq(messages.campaignId, campaignId));

  // Fire-and-forget: async batch processing with concurrency control
  // Simulates the channel service processing messages in parallel batches
  const CONCURRENCY = 8;
  const STAGGER_MS = 80;

  const runAsync = async () => {
    for (let i = 0; i < messageIds.length; i += CONCURRENCY) {
      if (i > 0) await new Promise((r) => setTimeout(r, STAGGER_MS));
      const batch = messageIds.slice(i, i + CONCURRENCY);
      // Concurrent processing within batch (channel sends multiple at once)
      await Promise.all(
        batch.map((msgId) => processMessageReceipt(msgId, campaignId, channel))
      );
    }

    // All messages processed — mark campaign complete
    await new Promise((r) => setTimeout(r, 500));
    await db
      .update(campaigns)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(campaigns.id, campaignId));

    console.log(
      `[ChannelService] Campaign ${campaignId} completed. ${messageIds.length} messages processed via ${channel}.`
    );
  };

  // Non-blocking: hand off to channel service and return immediately
  runAsync().catch((err) =>
    console.error(`[ChannelService] Campaign ${campaignId} batch error:`, err)
  );

  return { accepted: messageIds.length };
}

// ── Channel Router (tRPC surface) ────────────────────────────────────
export const channelRouter = createRouter({
  /**
   * channel.send — CRM calls this to hand off a campaign to the channel service.
   * Returns immediately; delivery simulation runs asynchronously.
   */
  send: publicQuery
    .input(
      z.object({
        campaignId: z.number(),
        channel: z.enum(["whatsapp", "sms", "email"]),
        messageIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      const result = await dispatchCampaign(
        input.campaignId,
        input.channel as Channel,
        input.messageIds
      );
      return {
        ...result,
        campaignId: input.campaignId,
        channel: input.channel,
        status: "queued" as const,
        message: `Channel service accepted ${result.accepted} messages for ${input.channel} delivery. Callbacks will update CRM asynchronously.`,
      };
    }),

  /**
   * channel.status — Query the delivery breakdown for a campaign.
   * Simulates calling the channel provider's status API.
   */
  status: publicQuery
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select({
          status: messages.status,
          count: sql<number>`count(*)`,
        })
        .from(messages)
        .where(eq(messages.campaignId, input.campaignId))
        .groupBy(messages.status);

      return {
        campaignId: input.campaignId,
        breakdown: result,
        total: result.reduce((sum, r) => sum + Number(r.count), 0),
      };
    }),
});
