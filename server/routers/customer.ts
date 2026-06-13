import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { customers, orders } from "@db/schema";
import { eq, like, desc, sql, gte, lte } from "drizzle-orm";

export const customerRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        persona: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
        minSpent: z.number().optional(),
        maxSpent: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { search, persona, page, limit, minSpent, maxSpent } = input;
      const offset = (page - 1) * limit;

      let query = db.select().from(customers);

      const conditions = [];
      if (search) {
        conditions.push(like(customers.name, `%${search}%`));
      }
      if (persona) {
        conditions.push(eq(customers.persona, persona as NonNullable<typeof customers.$inferSelect.persona>));
      }
      if (minSpent !== undefined) {
        conditions.push(gte(customers.totalSpent, minSpent.toString()));
      }
      if (maxSpent !== undefined) {
        conditions.push(lte(customers.totalSpent, maxSpent.toString()));
      }

      const allCustomers = await query
        .where(conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined)
        .orderBy(desc(customers.lastOrderAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined);

      return {
        customers: allCustomers,
        total: countResult[0].count,
        page,
        totalPages: Math.ceil(countResult[0].count / limit),
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const customer = await db
        .select()
        .from(customers)
        .where(eq(customers.id, input.id))
        .limit(1);

      if (!customer[0]) return null;

      const customerOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.customerId, input.id))
        .orderBy(desc(orders.createdAt));

      return {
        ...customer[0],
        orders: customerOrders,
      };
    }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({
        totalCustomers: sql<number>`count(*)`,
        totalRevenue: sql<string>`COALESCE(SUM(CAST(total_spent AS DECIMAL(12,2))), 0)`,
        avgOrderValue: sql<string>`COALESCE(AVG(CAST(total_spent AS DECIMAL(12,2))), 0)`,
        activeCustomers: sql<number>`count(CASE WHEN last_order_at > NOW() - INTERVAL '30 days' THEN 1 END)`,
        lapsedCustomers: sql<number>`count(CASE WHEN last_order_at < NOW() - INTERVAL '60 days' OR last_order_at IS NULL THEN 1 END)`,
        newCustomers: sql<number>`count(CASE WHEN first_order_at > NOW() - INTERVAL '14 days' THEN 1 END)`,
      })
      .from(customers);

    return result[0];
  }),

  getBySegment: publicQuery
    .input(z.object({ segmentId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const { segmentCustomers } = await import("@db/schema");

      const segmentCustomerIds = await db
        .select({ customerId: segmentCustomers.customerId })
        .from(segmentCustomers)
        .where(eq(segmentCustomers.segmentId, input.segmentId));

      const ids = segmentCustomerIds.map((sc) => sc.customerId);
      if (ids.length === 0) return [];

      const segmentCustomersList = await db
        .select()
        .from(customers)
        .where(sql`${customers.id} IN (${sql.join(ids)})`);

      return segmentCustomersList;
    }),
});
