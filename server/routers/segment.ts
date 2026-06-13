import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { segments, segmentCustomers, customers } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type { customers as customersType } from "@db/schema";

type CustomerRow = typeof customersType.$inferSelect;
type Persona = NonNullable<CustomerRow["persona"]>;
type ChannelPref = NonNullable<CustomerRow["channelPreference"]>;

export const segmentRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const allSegments = await db
      .select()
      .from(segments)
      .orderBy(desc(segments.createdAt));
    return allSegments;
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const segment = await db
        .select()
        .from(segments)
        .where(eq(segments.id, input.id))
        .limit(1);

      if (!segment[0]) return null;

      const segCustomers = await db
        .select({
          customerId: segmentCustomers.customerId,
        })
        .from(segmentCustomers)
        .where(eq(segmentCustomers.segmentId, input.id));

      const customerIds = segCustomers.map((sc) => sc.customerId);

      const customersList: CustomerRow[] = [];
      if (customerIds.length > 0) {
        const rows = await db
          .select()
          .from(customers)
          .where(sql`${customers.id} IN (${sql.join(customerIds)})`);
        customersList.push(...rows);
      }

      return {
        ...segment[0],
        customers: customersList,
      };
    }),

  discover: publicQuery
    .input(
      z.object({
        filters: z.object({
          minTotalSpent: z.number().optional(),
          maxTotalSpent: z.number().optional(),
          minOrders: z.number().optional(),
          lastOrderBefore: z.string().optional(),
          lastOrderAfter: z.string().optional(),
          persona: z.string().optional(),
          channelPreference: z.string().optional(),
        }),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { filters } = input;
      const conditions: ReturnType<typeof sql>[] = [];

      if (filters.minTotalSpent) {
        conditions.push(sql`CAST(${customers.totalSpent} AS DECIMAL) >= ${filters.minTotalSpent}`);
      }
      if (filters.maxTotalSpent) {
        conditions.push(sql`CAST(${customers.totalSpent} AS DECIMAL) <= ${filters.maxTotalSpent}`);
      }
      if (filters.minOrders) {
        conditions.push(sql`${customers.totalOrders} >= ${filters.minOrders}`);
      }
      if (filters.lastOrderBefore) {
        conditions.push(sql`${customers.lastOrderAt} < ${new Date(filters.lastOrderBefore)}`);
      }
      if (filters.lastOrderAfter) {
        conditions.push(sql`${customers.lastOrderAt} > ${new Date(filters.lastOrderAfter)}`);
      }
      if (filters.persona) {
        conditions.push(eq(customers.persona, filters.persona as Persona));
      }
      if (filters.channelPreference) {
        conditions.push(eq(customers.channelPreference, filters.channelPreference as ChannelPref));
      }

      const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

      const result = await db
        .select()
        .from(customers)
        .where(whereClause)
        .orderBy(desc(customers.lastOrderAt))
        .limit(100);

      return {
        customers: result,
        count: result.length,
      };
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        filterJson: z.record(z.string(), z.any()).optional(),
        aiReasoning: z.string().optional(),
        customerIds: z.array(z.number()),
        source: z.string().default("manual"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const segment = await db.insert(segments).values([{
        name: input.name,
        description: input.description,
        filterJson: input.filterJson,
        aiReasoning: input.aiReasoning,
        customerCount: input.customerIds.length,
        source: input.source as "manual" | "nl_query" | "ai_suggested",
      }]).returning({ id: segments.id });

      const segmentId = segment[0].id;

      if (input.customerIds.length > 0) {
        await db.insert(segmentCustomers).values(
          input.customerIds.map((id) => ({
            segmentId,
            customerId: id,
          }))
        );
      }

      return { id: segmentId, name: input.name, customerCount: input.customerIds.length };
    }),

  nlDiscover: publicQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const raw = input.query;
      const query = raw.toLowerCase();
      const now = new Date();
      const filters: Record<string, any> = {};
      const reasoningParts: string[] = [];

      // ── Extract numbers from query ───────────────────────────────
      // Matches: "over 2000", "above ₹3000", "more than 5000", "spent 1500"
      const spentOverMatch = query.match(/(?:over|above|more than|spent|minimum|min)\s*[₹rs.]?\s*(\d[\d,]*)/i);
      const spentUnderMatch = query.match(/(?:under|below|less than|maximum|max|up to)\s*[₹rs.]?\s*(\d[\d,]*)/i);
      // Matches: "last 45 days", "60 days ago", "past 90 days", "45 days"
      const daysMatch = query.match(/(\d+)\s*days?\s*(?:ago|back|old)?/i);
      // Matches: "at least 3 orders", "more than 5 purchases", "2+ orders"
      const ordersMatch = query.match(/(?:at least|more than|min(?:imum)?|\+)?\s*(\d+)\s*(?:orders?|purchases?|times?)/i);

      if (spentOverMatch) {
        filters.minTotalSpent = parseInt(spentOverMatch[1].replace(/,/g, ""));
        reasoningParts.push(`spent over ₹${filters.minTotalSpent}`);
      }
      if (spentUnderMatch) {
        filters.maxTotalSpent = parseInt(spentUnderMatch[1].replace(/,/g, ""));
        reasoningParts.push(`spent under ₹${filters.maxTotalSpent}`);
      }
      if (ordersMatch) {
        filters.minOrders = parseInt(ordersMatch[1]);
        reasoningParts.push(`${filters.minOrders}+ orders`);
      }

      // ── Detect time-based intent ─────────────────────────────────
      const isLapsed = /lapsed|haven.t|not returned|win back|re.engage|inactive|churned|lost/i.test(query);
      const isNew = /new|recent|just joined|just signed|onboard|welcome|first time/i.test(query);
      const isActive = /active|engaged|frequent|regular|returning/i.test(query);

      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        const cutoff = new Date(now.getTime() - days * 86400000);
        if (isLapsed) {
          filters.lastOrderBefore = cutoff.toISOString();
          reasoningParts.push(`no order in ${days}+ days`);
        } else if (isNew) {
          filters.lastOrderAfter = cutoff.toISOString();
          reasoningParts.push(`active in last ${days} days`);
        } else {
          // Default: treat days as inactivity cutoff if query implies lapse
          filters.lastOrderBefore = cutoff.toISOString();
          reasoningParts.push(`no order in ${days}+ days`);
        }
      } else if (isLapsed) {
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);
        filters.lastOrderBefore = sixtyDaysAgo.toISOString();
        if (!filters.minOrders) filters.minOrders = 1;
        reasoningParts.push("lapsed 60+ days");
      } else if (isNew) {
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
        filters.lastOrderAfter = fourteenDaysAgo.toISOString();
        reasoningParts.push("joined in last 14 days");
      } else if (isActive) {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
        filters.lastOrderAfter = thirtyDaysAgo.toISOString();
        reasoningParts.push("active in last 30 days");
      }

      // ── Detect persona ────────────────────────────────────────────
      if (/subscription|loyalist|loyal/i.test(query)) {
        filters.persona = "subscription_loyalist";
        reasoningParts.push("subscription loyalists");
        if (!filters.minTotalSpent) filters.minTotalSpent = 1500;
      } else if (/weekend|enthusiast/i.test(query)) {
        filters.persona = "weekend_enthusiast";
        reasoningParts.push("weekend enthusiasts");
      } else if (/office|regular|daily/i.test(query)) {
        filters.persona = "office_regular";
        reasoningParts.push("office regulars");
      } else if (/gift|gifter/i.test(query)) {
        filters.persona = "gift_buyer";
        reasoningParts.push("gift buyers");
      } else if (/explorer|lapsed explorer/i.test(query)) {
        filters.persona = "lapsed_explorer";
        reasoningParts.push("lapsed explorers");
      }

      // ── High-value fallback ───────────────────────────────────────
      const isHighValue = /high.?value|vip|premium|top|best|big spend/i.test(query);
      if (isHighValue && !filters.minTotalSpent) {
        filters.minTotalSpent = 3000;
        reasoningParts.push("high-value (₹3000+)");
      }

      // ── If nothing matched, use broad recent active ───────────────
      if (reasoningParts.length === 0) {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
        filters.lastOrderAfter = thirtyDaysAgo.toISOString();
        reasoningParts.push("recently active");
      }

      const description = `Customers matching: ${reasoningParts.join(", ")}`;
      const aiReasoning = generateAiReasoning(filters, reasoningParts, raw);

      const db = getDb();
      const conditions: ReturnType<typeof sql>[] = [];

      if (filters.minTotalSpent) {
        conditions.push(sql`CAST(${customers.totalSpent} AS DECIMAL) >= ${filters.minTotalSpent}`);
      }
      if (filters.maxTotalSpent) {
        conditions.push(sql`CAST(${customers.totalSpent} AS DECIMAL) <= ${filters.maxTotalSpent}`);
      }
      if (filters.minOrders) {
        conditions.push(sql`${customers.totalOrders} >= ${filters.minOrders}`);
      }
      if (filters.lastOrderBefore) {
        conditions.push(sql`${customers.lastOrderAt} < ${new Date(filters.lastOrderBefore)}`);
      }
      if (filters.lastOrderAfter) {
        conditions.push(sql`${customers.lastOrderAt} > ${new Date(filters.lastOrderAfter)}`);
      }
      if (filters.persona) {
        conditions.push(eq(customers.persona, filters.persona as Persona));
      }

      const result = await db
        .select()
        .from(customers)
        .where(conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined)
        .orderBy(desc(customers.lastOrderAt))
        .limit(100);

      return {
        customers: result,
        count: result.length,
        filters,
        description,
        aiReasoning,
      };
    }),
});

function generateAiReasoning(
  filters: Record<string, any>,
  parts: string[],
  originalQuery: string
): string {
  const reasons: string[] = [];

  if (filters.persona === "subscription_loyalist") {
    reasons.push("Subscription loyalists are your highest-LTV customers. Reward their loyalty to reduce churn.");
  } else if (filters.persona === "weekend_enthusiast") {
    reasons.push("Weekend enthusiasts treat coffee as a ritual. Equipment and premium roast upsells work well for them.");
  } else if (filters.persona === "office_regular") {
    reasons.push("Office regulars prioritise convenience and consistency. Bulk offers and subscription nudges convert well.");
  } else if (filters.persona === "gift_buyer") {
    reasons.push("Gift buyers are seasonal. A timely campaign before festivals or holidays maximises conversion.");
  }

  if (filters.lastOrderBefore) {
    reasons.push("These customers previously engaged but have gone quiet — a win-back offer with urgency (e.g., expiring discount) is highly effective.");
  }
  if (filters.minTotalSpent && filters.minTotalSpent >= 2000) {
    reasons.push(`High spenders (₹${filters.minTotalSpent}+) respond well to exclusivity: early access, limited roasts, and loyalty perks.`);
  }
  if (filters.lastOrderAfter && !filters.lastOrderBefore) {
    reasons.push("Recent customers are primed for nurturing. A welcome sequence or a 'complete the ritual' upsell can convert them to repeat buyers.");
  }

  if (reasons.length === 0) {
    reasons.push(`Parsed from: "${originalQuery}". Found customers matching ${parts.join(", ")}. Consider a personalised message referencing their last order.`);
  }

  return reasons.join(" ");
}
