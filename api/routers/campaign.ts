import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { campaigns, messages, segments, customers } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

// Channel simulation models
const CHANNEL_MODELS = {
  whatsapp: {
    deliveryRate: 0.95,
    openRate: 0.85,
    clickRate: 0.35,
    conversionRate: 0.12,
    avgDeliveryTime: 2000,
    avgOpenTime: 15000,
    avgClickTime: 45000,
    avgConversionTime: 120000,
  },
  sms: {
    deliveryRate: 0.98,
    openRate: 0.90,
    clickRate: 0.20,
    conversionRate: 0.08,
    avgDeliveryTime: 1500,
    avgOpenTime: 10000,
    avgClickTime: 30000,
    avgConversionTime: 90000,
  },
  email: {
    deliveryRate: 0.88,
    openRate: 0.25,
    clickRate: 0.08,
    conversionRate: 0.03,
    avgDeliveryTime: 3000,
    avgOpenTime: 60000,
    avgClickTime: 120000,
    avgConversionTime: 300000,
  },
};

const BRAND_TONE = {
  voice: "warm, slightly poetic, never corporate",
  greeting: ["Hey there", "Hello", "Hi", "Namaste"],
  closing: ["Warmly, Team Bloom", "With love from Bangalore", "Happy brewing", "From our roastery to your cup"],
};

function generatePersonalizedMessage(
  customer: typeof customers.$inferSelect,
  channel: string,
  campaignGoal: string,
  variant: number
): { content: string; subject?: string } {
  const name = customer.name.split(" ")[0];
  const tone = BRAND_TONE;

  // Template-based personalization with AI-like quality
  const templates: Record<string, string[]> = {
    reengagement: [
      `${tone.greeting[variant % tone.greeting.length]} ${name}, we miss you at Bloom. Your last cup of ${customer.metadata ? JSON.parse(customer.metadata as string).favoriteProduct || "our Monsoon Malabar" : "our Monsoon Malabar"} was a while ago. Come back and get 15% off your next order. We've been roasting something special. Use code COMEBACK15. ${tone.closing[variant % tone.closing.length]}`,
      `${name}, your coffee ritual is calling. We noticed you haven't stopped by in a while — your usual ${customer.persona === "subscription_loyalist" ? "subscription" : "order"} is waiting. Here's 15% off to welcome you back: COMEBACK15. ${tone.closing[variant % tone.closing.length]}`,
      `We saved your spot, ${name}. The Monsoon Malabar is tasting better than ever, and we thought of you. 15% off with COMEBACK15 — because some cups are worth coming back for. ${tone.closing[variant % tone.closing.length]}`,
    ],
    retention: [
      `${name}, as one of our most cherished customers, we wanted you to be the first to know — our limited Monsooned AA Roast is back. Only 50 bags. Your loyalty means everything to us. ${tone.closing[variant % tone.closing.length]}`,
      `${tone.greeting[variant % tone.greeting.length]} ${name}! Your loyalty hasn't gone unnoticed. We're setting aside a bag of our new seasonal roast just for you. Reply YES to reserve yours. ${tone.closing[variant % tone.closing.length]}`,
      `${name}, great coffee is better shared. Refer a friend and you both get 20% off your next order. Because the best discoveries are shared over a cup. ${tone.closing[variant % tone.closing.length]}`,
    ],
    upsell: [
      `${name}, we noticed you love our single origins. Have you tried brewing with a French Press? It brings out notes you didn't know existed. 10% off equipment with code BREWUPGRADE. ${tone.closing[variant % tone.closing.length]}`,
      `Your ${customer.persona === "weekend_enthusiast" ? "weekend ritual" : "morning cup"} deserves an upgrade, ${name}. The AeroPress Go is perfect for your lifestyle. Check it out with 10% off: BREWUPGRADE. ${tone.closing[variant % tone.closing.length]}`,
      `${name}, pair your favorite Monsoon Malabar with our Cold Brew Kit. Summer in Bangalore calls for cold coffee. 10% off with BREWUPGRADE. ${tone.closing[variant % tone.closing.length]}`,
    ],
    welcome: [
      `Welcome to the Bloom family, ${name}! Your first order is just the beginning. Here's a guide to getting the most out of your beans. Welcome home. ${tone.closing[variant % tone.closing.length]}`,
      `${name}, thank you for choosing Bloom. We wanted to share our story with you — from the hills of Chikmagalur to your cup. Every bean has a journey. ${tone.closing[variant % tone.closing.length]}`,
      `Hey ${name}! Welcome to Bloom Coffee Co. As a thank you, enjoy free shipping on your next 3 orders. No code needed — it's automatic. ${tone.closing[variant % tone.closing.length]}`,
    ],
  };

  // Determine campaign type
  let type = "retention";
  if (campaignGoal.includes("re-engage") || campaignGoal.includes("win back") || campaignGoal.includes("lapsed")) {
    type = "reengagement";
  } else if (campaignGoal.includes("up") || campaignGoal.includes("cross") || campaignGoal.includes("equipment")) {
    type = "upsell";
  } else if (campaignGoal.includes("new") || campaignGoal.includes("welcome") || campaignGoal.includes("onboard")) {
    type = "welcome";
  }

  const content = templates[type]?.[variant % 3] || templates.retention[variant % 3];

  if (channel === "email") {
    const subjects = {
      reengagement: ["We miss you, " + name, "Your coffee is waiting", "Come back for 15% off"],
      retention: ["Exclusive: New roast just for you", "Your loyalty reward is here", "A special surprise inside"],
      upsell: ["Upgrade your brew, " + name, "The perfect pairing for your favorite coffee", "10% off brewing equipment"],
      welcome: ["Welcome to Bloom Coffee Co.", "Your coffee journey begins now", "Thanks for joining us, " + name],
    };
    return {
      content,
      subject: subjects[type as keyof typeof subjects]?.[variant % 3] || "A message from Bloom Coffee Co.",
    };
  }

  return { content };
}

export const campaignRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const allCampaigns = await db
      .select()
      .from(campaigns)
      .orderBy(desc(campaigns.createdAt));
    return allCampaigns;
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const campaign = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, input.id))
        .limit(1);

      if (!campaign[0]) return null;

      const campaignMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.campaignId, input.id));

      const segment = campaign[0].segmentId
        ? await db
            .select()
            .from(segments)
            .where(eq(segments.id, campaign[0].segmentId))
            .limit(1)
        : null;

      return {
        ...campaign[0],
        messages: campaignMessages,
        segment: segment?.[0] || null,
      };
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        segmentId: z.number(),
        channel: z.enum(["whatsapp", "sms", "email"]),
        goal: z.string(),
        messageVariant: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get segment customers
      const { segmentCustomers: segCustTable } = await import("@db/schema");
      const segCustomers = await db
        .select({ customerId: segCustTable.customerId })
        .from(segCustTable)
        .where(eq(segCustTable.segmentId, input.segmentId));

      const customerIds = segCustomers.map((sc) => sc.customerId);

      // Get customer details
      const customerDetails = await db
        .select()
        .from(customers)
        .where(sql`${customers.id} IN (${sql.join(customerIds)})`);

      // Predict metrics
      const channelModel = CHANNEL_MODELS[input.channel];
      const count = customerIds.length;
      const predictedSent = count;
      const predictedDelivered = Math.round(count * channelModel.deliveryRate);
      const predictedOpened = Math.round(predictedDelivered * channelModel.openRate);
      const predictedClicked = Math.round(predictedOpened * channelModel.clickRate);
      const predictedConverted = Math.round(predictedClicked * channelModel.conversionRate);

      // Generate personalized messages for each customer
      const messageVariants: string[] = [];
      for (let v = 0; v < 3; v++) {
        const sampleMsg = generatePersonalizedMessage(
          customerDetails[0] || { name: "there", persona: "new", metadata: null, totalSpent: "0", totalOrders: 0, healthScore: 50, id: 0, email: "", phone: null, channelPreference: "email", lastOrderAt: null, firstOrderAt: null, aiSummary: null, createdAt: new Date(), updatedAt: new Date() },
          input.channel,
          input.goal,
          v
        );
        messageVariants.push(sampleMsg.content);
      }

      // Create campaign
      const campaign = await db.insert(campaigns).values({
        name: input.name,
        description: input.description,
        segmentId: input.segmentId,
        channel: input.channel,
        goal: input.goal,
        status: "draft",
        predictedSent,
        predictedDelivered,
        predictedOpened,
        predictedClicked,
        predictedConverted,
        selectedVariant: input.messageVariant,
      }).returning({ id: campaigns.id });

      const campaignId = campaign[0].id;


      // Update campaign with message variants
      await db
        .update(campaigns)
        .set({ messageVariants })
        .where(eq(campaigns.id, campaignId));

      // Create messages for each customer
      const messageValues = customerDetails.map((customer) => {
        const msg = generatePersonalizedMessage(customer, input.channel, input.goal, input.messageVariant);
        return {
          campaignId,
          customerId: customer.id,
          channel: input.channel,
          content: msg.content,
          subject: msg.subject || null,
          status: "pending" as const,
          personalizedData: JSON.stringify({
            customerName: customer.name.split(" ")[0],
            variant: input.messageVariant,
          }),
        };
      });

      // Batch insert messages
      for (let i = 0; i < messageValues.length; i += 50) {
        const batch = messageValues.slice(i, i + 50);
        await db.insert(messages).values(batch);
      }

      return {
        id: campaignId,
        name: input.name,
        customerCount: count,
        predictedMetrics: {
          sent: predictedSent,
          delivered: predictedDelivered,
          opened: predictedOpened,
          clicked: predictedClicked,
          converted: predictedConverted,
        },
        messageVariants,
      };
    }),

  launch: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get the campaign with channel info
      const campaign = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, input.id))
        .limit(1);

      if (!campaign[0]) throw new Error("Campaign not found");

      // Update campaign status to running
      await db
        .update(campaigns)
        .set({ status: "running", startedAt: new Date() })
        .where(eq(campaigns.id, input.id));

      // Get all pending message IDs for this campaign
      const pendingMessages = await db
        .select({ id: messages.id })
        .from(messages)
        .where(eq(messages.campaignId, input.id));

      const messageIds = pendingMessages.map((m) => m.id);

      /**
       * ── Channel Service Integration ──────────────────────────────
       * The CRM hands off the message batch to the Channel Service.
       * The channel service processes them asynchronously and fires
       * callbacks back to update CRM receipt state.
       *
       * Architecture: CRM → Channel Service → CRM Receipt (callback loop)
       *
       * In production: POST to a separate service endpoint.
       * Here: import the channel service module directly (same process,
       * clearly separated concern with its own router + dispatch function).
       */
      const { dispatchCampaign } = await import("./channel");
      // Fire-and-forget: channel service takes over from here
      dispatchCampaign(input.id, campaign[0].channel, messageIds).catch(
        (err: unknown) =>
          console.error(
            `[CRM] Channel service dispatch failed for campaign ${input.id}:`,
            err
          )
      );

      return {
        success: true,
        campaignId: input.id,
        messageCount: messageIds.length,
        channel: campaign[0].channel,
        channelService: "Handed off to channel service — callbacks will update delivery status asynchronously",
      };
    }),

  simulateStep: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get campaign
      const campaign = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, input.id))
        .limit(1);

      if (!campaign[0] || campaign[0].status !== "running") {
        return { done: true };
      }

      const channel = campaign[0].channel;
      const model = CHANNEL_MODELS[channel];

      // Get pending messages for this campaign
      const pendingMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.campaignId, input.id))
        .limit(20);

      if (pendingMessages.length === 0) {
        // All messages processed, mark campaign as completed
        await db
          .update(campaigns)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(campaigns.id, input.id));
        return { done: true };
      }

      // Process each message through the lifecycle
      for (const msg of pendingMessages) {
        const rng = Math.random();

        if (msg.status === "queued") {
          // Simulate send
          if (rng < model.deliveryRate) {
            await db
              .update(messages)
              .set({ status: "sent", sentAt: new Date() })
              .where(eq(messages.id, msg.id));
            await db
              .update(campaigns)
              .set({ actualSent: sql`${campaigns.actualSent} + 1` })
              .where(eq(campaigns.id, input.id));
          } else {
            await db
              .update(messages)
              .set({ status: "failed", failureReason: "Channel delivery failed" })
              .where(eq(messages.id, msg.id));
          }
        } else if (msg.status === "sent") {
          // Simulate delivery
          await db
            .update(messages)
            .set({ status: "delivered", deliveredAt: new Date() })
            .where(eq(messages.id, msg.id));
          await db
            .update(campaigns)
            .set({ actualDelivered: sql`${campaigns.actualDelivered} + 1` })
            .where(eq(campaigns.id, input.id));
        } else if (msg.status === "delivered") {
          // Simulate open
          if (rng < model.openRate) {
            await db
              .update(messages)
              .set({ status: "opened", openedAt: new Date() })
              .where(eq(messages.id, msg.id));
            await db
              .update(campaigns)
              .set({ actualOpened: sql`${campaigns.actualOpened} + 1` })
              .where(eq(campaigns.id, input.id));
          }
        } else if (msg.status === "opened") {
          // Simulate click
          if (rng < model.clickRate) {
            await db
              .update(messages)
              .set({ status: "clicked", clickedAt: new Date() })
              .where(eq(messages.id, msg.id));
            await db
              .update(campaigns)
              .set({ actualClicked: sql`${campaigns.actualClicked} + 1` })
              .where(eq(campaigns.id, input.id));
          }
        } else if (msg.status === "clicked") {
          // Simulate conversion
          if (rng < model.conversionRate) {
            const revenue = (50 + Math.random() * 500).toFixed(2);
            await db
              .update(messages)
              .set({ status: "converted", convertedAt: new Date() })
              .where(eq(messages.id, msg.id));
            await db
              .update(campaigns)
              .set({
                actualConverted: sql`${campaigns.actualConverted} + 1`,
                actualRevenue: sql`${campaigns.actualRevenue} + ${revenue}`,
              })
              .where(eq(campaigns.id, input.id));
          }
        }
      }

      return { done: false, processed: pendingMessages.length };
    }),

  generateInsight: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const campaign = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, input.id))
        .limit(1);

      if (!campaign[0]) return null;

      const c = campaign[0];
      const channel = c.channel;
      const pOpen = (c.predictedOpened ?? 0);
      const pConv = (c.predictedConverted ?? 0);
      const aDel = (c.actualDelivered ?? 0);
      const aOpen = (c.actualOpened ?? 0);
      const aClick = (c.actualClicked ?? 0);
      const aConv = (c.actualConverted ?? 0);

      // Generate insight based on actual vs predicted
      let insight = "";
      let recommendation = "";
      let confidence: "low" | "medium" | "high" = "medium";

      const openRate = aDel > 0 ? (aOpen / aDel * 100).toFixed(1) : "0";
      const clickRate = aOpen > 0 ? (aClick / aOpen * 100).toFixed(1) : "0";
      const convRate = aClick > 0 ? (aConv / aClick * 100).toFixed(1) : "0";

      if (aOpen > pOpen * 1.2) {
        insight = `Your ${channel} campaign overperformed on opens by ${((aOpen / Math.max(pOpen, 1) - 1) * 100).toFixed(0)}%. The subject lines resonated strongly.`;
        recommendation = "Reuse similar messaging themes in your next campaign. Consider A/B testing the best-performing variant.";
        confidence = "high";
      } else if (aConv > pConv * 1.3) {
        insight = `Excellent conversion rate! ${convRate}% of clicked messages led to purchases — well above the ${(CHANNEL_MODELS[channel].conversionRate * 100).toFixed(0)}% benchmark.`;
        recommendation = "This segment is highly responsive. Schedule a follow-up campaign within 7 days while engagement is high.";
        confidence = "high";
      } else if (aOpen < pOpen * 0.7) {
        insight = `Open rates were below expectations at ${openRate}%. The timing or subject may need adjustment.`;
        recommendation = "Try sending during morning hours (8-10 AM) and test more personalized subject lines.";
        confidence = "medium";
      } else {
        insight = `Solid performance overall. ${aDel} messages delivered, ${openRate}% open rate, ${convRate}% conversion rate from clicks. This aligns with typical ${channel} benchmarks.`;
        recommendation = "Consider segmenting further by purchase history for more targeted messaging next time.";
        confidence = "medium";
      }

      return {
        insight,
        recommendation,
        confidence,
        metrics: {
          openRate,
          clickRate,
          conversionRate: convRate,
          totalRevenue: c.actualRevenue,
        },
      };
    }),
});
