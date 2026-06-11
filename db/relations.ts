import { relations } from "drizzle-orm";
import {
  customers,
  orders,
  segments,
  segmentCustomers,
  campaigns,
  messages,
  events,
  campaignInsights,
} from "./schema";

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  messages: many(messages),
  segmentMemberships: many(segmentCustomers),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
}));

export const segmentsRelations = relations(segments, ({ many }) => ({
  segmentCustomers: many(segmentCustomers),
  campaigns: many(campaigns),
}));

export const segmentCustomersRelations = relations(
  segmentCustomers,
  ({ one }) => ({
    segment: one(segments, {
      fields: [segmentCustomers.segmentId],
      references: [segments.id],
    }),
    customer: one(customers, {
      fields: [segmentCustomers.customerId],
      references: [customers.id],
    }),
  })
);

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  segment: one(segments, {
    fields: [campaigns.segmentId],
    references: [segments.id],
  }),
  messages: many(messages),
  insights: many(campaignInsights),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [messages.campaignId],
    references: [campaigns.id],
  }),
  customer: one(customers, {
    fields: [messages.customerId],
    references: [customers.id],
  }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  message: one(messages, {
    fields: [events.messageId],
    references: [messages.id],
  }),
}));

export const campaignInsightsRelations = relations(
  campaignInsights,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [campaignInsights.campaignId],
      references: [campaigns.id],
    }),
  })
);
