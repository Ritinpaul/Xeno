import { createRouter, publicQuery } from "./middleware";
import { customerRouter } from "./routers/customer";
import { segmentRouter } from "./routers/segment";
import { campaignRouter } from "./routers/campaign";
import { analyticsRouter } from "./routers/analytics";
import { channelRouter } from "./routers/channel";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  customer: customerRouter,
  segment: segmentRouter,
  campaign: campaignRouter,
  analytics: analyticsRouter,
  channel: channelRouter,
});

export type AppRouter = typeof appRouter;
