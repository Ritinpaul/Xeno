import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  json,
  pgEnum,
  bigint,
  index,
} from "drizzle-orm/pg-core";

// ── Enums ───────────────────────────────────────────────────────────
export const channelPreferenceEnum = pgEnum("channel_preference", ["whatsapp", "sms", "email"]);
export const personaEnum = pgEnum("persona", [
  "office_regular",
  "weekend_enthusiast",
  "gift_buyer",
  "subscription_loyalist",
  "lapsed_explorer",
  "new",
]);
export const orderStatusEnum = pgEnum("order_status", ["completed", "pending", "cancelled"]);
export const orderChannelEnum = pgEnum("order_channel", ["online", "in_store", "subscription"]);
export const segmentSourceEnum = pgEnum("segment_source", ["manual", "nl_query", "ai_suggested"]);
export const campaignChannelEnum = pgEnum("campaign_channel", ["whatsapp", "sms", "email"]);
export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "scheduled",
  "running",
  "paused",
  "completed",
  "failed",
]);
export const messageChannelEnum = pgEnum("message_channel", ["whatsapp", "sms", "email"]);
export const messageStatusEnum = pgEnum("message_status", [
  "pending",
  "queued",
  "sent",
  "delivered",
  "opened",
  "read",
  "clicked",
  "converted",
  "failed",
  "bounced",
]);
export const eventTypeEnum = pgEnum("event_type", [
  "sent",
  "delivered",
  "opened",
  "read",
  "clicked",
  "converted",
  "failed",
  "bounced",
]);
export const confidenceEnum = pgEnum("confidence", ["low", "medium", "high"]);

// ── 1. Brand Profiles ───────────────────────────────────────────────
export const brandProfiles = pgTable("brand_profiles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 255 }),
  originStory: text("origin_story"),
  toneOfVoice: text("tone_of_voice"),
  visualIdentity: json("visual_identity"),
  contactInfo: json("contact_info"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── 2. Products ─────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  story: text("story"),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── 3. Customers ────────────────────────────────────────────────────
export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    channelPreference: channelPreferenceEnum("channel_preference").default("email"),
    persona: personaEnum("persona").default("new"),
    totalOrders: integer("total_orders").notNull().default(0),
    totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).notNull().default("0.00"),
    lastOrderAt: timestamp("last_order_at"),
    firstOrderAt: timestamp("first_order_at"),
    healthScore: integer("health_score").default(50),
    aiSummary: text("ai_summary"),
    metadata: json("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_customers_persona").on(table.persona),
    index("idx_customers_health").on(table.healthScore),
    index("idx_customers_last_order").on(table.lastOrderAt),
  ]
);

// ── 4. Orders ───────────────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    customerId: bigint("customer_id", { mode: "number" }).notNull(),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum("status").notNull().default("completed"),
    channel: orderChannelEnum("channel").notNull().default("online"),
    items: json("items").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_orders_customer").on(table.customerId),
    index("idx_orders_created").on(table.createdAt),
    index("idx_orders_status").on(table.status),
  ]
);

// ── 5. Segments ─────────────────────────────────────────────────────
export const segments = pgTable(
  "segments",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    filterJson: json("filter_json"),
    aiReasoning: text("ai_reasoning"),
    customerCount: integer("customer_count").notNull().default(0),
    isAiSuggested: integer("is_ai_suggested").notNull().default(0),
    source: segmentSourceEnum("source").notNull().default("manual"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("idx_segments_source").on(table.source)]
);

// ── 6. Segment Customers (junction) ─────────────────────────────────
export const segmentCustomers = pgTable(
  "segment_customers",
  {
    id: serial("id").primaryKey(),
    segmentId: bigint("segment_id", { mode: "number" }).notNull(),
    customerId: bigint("customer_id", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_seg_cust_segment").on(table.segmentId),
    index("idx_seg_cust_customer").on(table.customerId),
  ]
);

// ── 7. Campaigns ────────────────────────────────────────────────────
export const campaigns = pgTable(
  "campaigns",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    segmentId: bigint("segment_id", { mode: "number" }),
    channel: campaignChannelEnum("channel").notNull(),
    status: campaignStatusEnum("status").notNull().default("draft"),
    messageVariants: json("message_variants"),
    selectedVariant: integer("selected_variant").default(0),
    goal: text("goal"),
    predictedSent: integer("predicted_sent").default(0),
    predictedDelivered: integer("predicted_delivered").default(0),
    predictedOpened: integer("predicted_opened").default(0),
    predictedClicked: integer("predicted_clicked").default(0),
    predictedConverted: integer("predicted_converted").default(0),
    actualSent: integer("actual_sent").default(0),
    actualDelivered: integer("actual_delivered").default(0),
    actualOpened: integer("actual_opened").default(0),
    actualClicked: integer("actual_clicked").default(0),
    actualConverted: integer("actual_converted").default(0),
    actualRevenue: decimal("actual_revenue", { precision: 12, scale: 2 }).default("0.00"),
    scheduledAt: timestamp("scheduled_at"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_campaigns_status").on(table.status),
    index("idx_campaigns_segment").on(table.segmentId),
  ]
);

// ── 8. Messages ─────────────────────────────────────────────────────
export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    campaignId: bigint("campaign_id", { mode: "number" }).notNull(),
    customerId: bigint("customer_id", { mode: "number" }).notNull(),
    channel: messageChannelEnum("channel").notNull(),
    content: text("content").notNull(),
    subject: varchar("subject", { length: 255 }),
    status: messageStatusEnum("status").notNull().default("pending"),
    failureReason: text("failure_reason"),
    personalizedData: json("personalized_data"),
    sentAt: timestamp("sent_at"),
    deliveredAt: timestamp("delivered_at"),
    openedAt: timestamp("opened_at"),
    clickedAt: timestamp("clicked_at"),
    convertedAt: timestamp("converted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_messages_campaign").on(table.campaignId),
    index("idx_messages_customer").on(table.customerId),
    index("idx_messages_status").on(table.status),
  ]
);

// ── 9. Events (event sourcing) ──────────────────────────────────────
export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    messageId: bigint("message_id", { mode: "number" }).notNull(),
    campaignId: bigint("campaign_id", { mode: "number" }).notNull(),
    eventType: eventTypeEnum("event_type").notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_events_message").on(table.messageId),
    index("idx_events_campaign").on(table.campaignId),
    index("idx_events_type").on(table.eventType),
  ]
);

// ── 10. Campaign Insights ───────────────────────────────────────────
export const campaignInsights = pgTable("campaign_insights", {
  id: serial("id").primaryKey(),
  campaignId: bigint("campaign_id", { mode: "number" }).notNull(),
  insight: text("insight").notNull(),
  recommendation: text("recommendation"),
  confidence: confidenceEnum("confidence").default("medium"),
  metricsBreakdown: json("metrics_breakdown"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
