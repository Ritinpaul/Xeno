import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { customers, orders, campaigns, messages, segments } from "@db/schema";
import { desc, sql, eq } from "drizzle-orm";

export const analyticsRouter = createRouter({
  dashboard: publicQuery.query(async () => {
    const db = getDb();

    // Customer stats
    const customerStats = await db
      .select({
        totalCustomers: sql<number>`count(*)`,
        totalRevenue: sql<string>`COALESCE(SUM(CAST(total_spent AS DECIMAL(12,2))), 0)`,
        avgSpent: sql<string>`COALESCE(AVG(CAST(total_spent AS DECIMAL(12,2))), 0)`,
        active30d: sql<number>`count(CASE WHEN last_order_at > NOW() - INTERVAL '30 days' THEN 1 END)`,
        lapsed60d: sql<number>`count(CASE WHEN last_order_at < NOW() - INTERVAL '60 days' OR last_order_at IS NULL THEN 1 END)`,
        new14d: sql<number>`count(CASE WHEN first_order_at > NOW() - INTERVAL '14 days' THEN 1 END)`,
      })
      .from(customers);

    // Order stats
    const orderStats = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        avgOrderValue: sql<string>`COALESCE(AVG(CAST(total_amount AS DECIMAL(10,2))), 0)`,
        recentOrders: sql<number>`count(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END)`,
      })
      .from(orders);

    // Campaign stats
    const campaignStats = await db
      .select({
        totalCampaigns: sql<number>`count(*)`,
        running: sql<number>`count(CASE WHEN status = 'running' THEN 1 END)`,
        completed: sql<number>`count(CASE WHEN status = 'completed' THEN 1 END)`,
        totalRevenue: sql<string>`COALESCE(SUM(CAST(actual_revenue AS DECIMAL(12,2))), 0)`,
      })
      .from(campaigns);

    // Channel distribution
    const channelDist = await db
      .select({
        channel: customers.channelPreference,
        count: sql<number>`count(*)`,
      })
      .from(customers)
      .groupBy(customers.channelPreference);

    // Persona distribution
    const personaDist = await db
      .select({
        persona: customers.persona,
        count: sql<number>`count(*)`,
      })
      .from(customers)
      .groupBy(customers.persona);

    // Top products
    const topProducts = await db
      .select({
        productName: sql<string>`items->0->>'productName'`,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .groupBy(sql`items->0->>'productName'`)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    // AI-suggested segments
    const aiSegments = await db
      .select()
      .from(segments)
      .where(eq(segments.isAiSuggested, 1))
      .orderBy(desc(segments.createdAt))
      .limit(5);

    // Recent activity
    const recentActivity = await db
      .select({
        id: messages.id,
        customerName: customers.name,
        status: messages.status,
        channel: messages.channel,
        updatedAt: messages.updatedAt,
      })
      .from(messages)
      .innerJoin(customers, eq(messages.customerId, customers.id))
      .orderBy(desc(messages.updatedAt))
      .limit(10);

    return {
      customers: customerStats[0],
      orders: orderStats[0],
      campaigns: campaignStats[0],
      channelDistribution: channelDist,
      personaDistribution: personaDist,
      topProducts,
      aiSegments,
      recentActivity,
    };
  }),

  campaignPerformance: publicQuery.query(async () => {
    const db = getDb();
    const performance = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        channel: campaigns.channel,
        status: campaigns.status,
        actualSent: campaigns.actualSent,
        actualDelivered: campaigns.actualDelivered,
        actualOpened: campaigns.actualOpened,
        actualClicked: campaigns.actualClicked,
        actualConverted: campaigns.actualConverted,
        actualRevenue: campaigns.actualRevenue,
        createdAt: campaigns.createdAt,
      })
      .from(campaigns)
      .orderBy(desc(campaigns.createdAt))
      .limit(10);

    return performance;
  }),
});
