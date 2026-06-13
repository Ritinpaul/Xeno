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
      const query = input.query.toLowerCase();
      const now = new Date();
      const filters: Record<string, any> = {};
      let description = "";
      let aiReasoning = "";

      if (query.includes("lapsed") || query.includes("haven't") || query.includes("not returned") || query.includes("60")) {
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);
        filters.lastOrderBefore = sixtyDaysAgo.toISOString();
        filters.minOrders = 1;
        description = "Lapsed customers who haven't ordered in 60+ days";
        aiReasoning = "Identified customers with no recent activity who previously showed engagement.";
      } else if (query.includes("high value") || query.includes("spent over") || query.includes("vip")) {
        filters.minTotalSpent = 2000;
        description = "High-value customers with significant lifetime spend";
        aiReasoning = "These are your most valuable customers — focus on retention and exclusive offers.";
      } else if (query.includes("new") || query.includes("recent") || query.includes("just joined")) {
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
        filters.firstOrderAfter = fourteenDaysAgo.toISOString();
        description = "New customers who joined in the last 14 days";
        aiReasoning = "Fresh customers need nurturing — a welcome sequence can convert them to repeat buyers.";
      } else if (query.includes("weekend") || query.includes("enthusiast")) {
        filters.persona = "weekend_enthusiast";
        filters.minTotalSpent = 500;
        description = "Weekend enthusiasts who buy premium coffees";
        aiReasoning = "These customers treat coffee as a weekend ritual. Equipment recommendations can boost AOV.";
      } else if (query.includes("subscription") || query.includes("loyal")) {
        filters.persona = "subscription_loyalist";
        filters.minTotalSpent = 1500;
        description = "Subscription loyalists with highest lifetime value";
        aiReasoning = "Your backbone customers. Reward their loyalty with exclusive previews and early access.";
      } else {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
        filters.lastOrderAfter = thirtyDaysAgo.toISOString();
        description = "Recently active customers (last 30 days)";
        aiReasoning = "Broad segment of recently engaged customers — good for general announcements.";
      }

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
      if (filters.firstOrderAfter) {
        conditions.push(sql`${customers.firstOrderAt} > ${new Date(filters.firstOrderAfter)}`);
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
