import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Users,
  TrendingUp,
  Megaphone,
  AlertTriangle,
  UserPlus,
  ArrowRight,
  Sparkles,
  Zap,
  Mail,
  CheckCircle,
} from "lucide-react";

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  return (
    <div
      className="bloom-card p-5 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-bloom-warm-gray uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-display font-bold text-bloom-charcoal mt-2">
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-bloom-olive mt-1 font-medium">{subtext}</p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + "15" }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function AISegmentCard({
  segment,
  index,
}: {
  segment: {
    id: number;
    name: string;
    description: string | null;
    aiReasoning: string | null;
    customerCount: number;
  };
  index: number;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="bloom-card-hover p-4 cursor-pointer animate-slide-up"
      style={{
        animationDelay: `${300 + index * 100}ms`,
        animationFillMode: "backwards",
      }}
      onClick={() => navigate("/audience")}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-bloom-terracotta" />
        <span className="text-xs font-semibold text-bloom-terracotta uppercase tracking-wider">
          AI Suggested
        </span>
      </div>
      <h3 className="font-display font-semibold text-bloom-brown text-sm mb-1">
        {segment.name}
      </h3>
      <p className="text-xs text-bloom-warm-gray line-clamp-2 mb-3">
        {segment.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-bloom-charcoal">
          {segment.customerCount}{" "}
          <span className="text-bloom-warm-gray font-normal">customers</span>
        </span>
        <div className="flex items-center gap-1 text-xs text-bloom-terracotta font-medium">
          Explore <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = trpc.analytics.dashboard.useQuery();

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-bloom-terracotta animate-pulse" />
          <span className="text-sm text-bloom-warm-gray">
            Loading your intelligence hub...
          </span>
        </div>
      </div>
    );
  }

  const customerStats = stats.customers;
  const orderStats = stats.orders;
  const campaignStats = stats.campaigns;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="animate-fade-in">
        <h2 className="font-display text-2xl font-bold text-bloom-charcoal">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 17
            ? "afternoon"
            : "evening"}
          , Brewmaster
        </h2>
        <p className="text-sm text-bloom-warm-gray mt-1">
          Here's what's happening at Bloom Coffee Co. today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Customers"
          value={customerStats.totalCustomers.toLocaleString("en-IN")}
          subtext={`+${customerStats.new14d} new this fortnight`}
          icon={Users}
          color="#5C3D2E"
          delay={0}
        />
        <StatCard
          label="Total Revenue"
          value={`Rs.${Number(customerStats.totalRevenue).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`}
          subtext={`Avg order: Rs.${Number(orderStats.avgOrderValue).toFixed(0)}`}
          icon={TrendingUp}
          color="#6B7F3A"
          delay={100}
        />
        <StatCard
          label="Active Campaigns"
          value={campaignStats.running.toString()}
          subtext={`${campaignStats.completed} completed`}
          icon={Megaphone}
          color="#C75B39"
          delay={200}
        />
        <StatCard
          label="At-Risk Customers"
          value={customerStats.lapsed60d.toString()}
          subtext="No order in 60+ days"
          icon={AlertTriangle}
          color="#D4A03A"
          delay={300}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* AI Suggested Segments */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-bloom-charcoal flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-bloom-terracotta" />
              AI-Discovered Opportunities
            </h3>
            <button
              onClick={() => navigate("/audience")}
              className="text-xs text-bloom-terracotta font-medium flex items-center gap-1 hover:underline"
            >
              View all segments <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.aiSegments.map((segment: any, i: number) => (
              <AISegmentCard key={segment.id} segment={segment} index={i} />
            ))}
          </div>
        </div>

        {/* Right Column - Activity + Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bloom-card p-5 animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
            <h3 className="font-display font-semibold text-sm text-bloom-charcoal mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/audience")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-bloom-cream/40 hover:bg-bloom-cream transition-colors text-left"
              >
                <UserPlus className="w-4 h-4 text-bloom-terracotta" />
                <div>
                  <p className="text-xs font-semibold text-bloom-brown">
                    Build Audience
                  </p>
                  <p className="text-[10px] text-bloom-warm-gray">
                    Create a new customer segment
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate("/campaigns")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-bloom-cream/40 hover:bg-bloom-cream transition-colors text-left"
              >
                <Mail className="w-4 h-4 text-bloom-olive" />
                <div>
                  <p className="text-xs font-semibold text-bloom-brown">
                    Launch Campaign
                  </p>
                  <p className="text-[10px] text-bloom-warm-gray">
                    Send personalized messages
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bloom-card p-5 animate-slide-up" style={{ animationDelay: "500ms", animationFillMode: "backwards" }}>
            <h3 className="font-display font-semibold text-sm text-bloom-charcoal mb-3">
              Live Activity Feed
            </h3>
            <div className="space-y-3 max-h-[280px] overflow-auto">
              {stats.recentActivity.length === 0 ? (
                <p className="text-xs text-bloom-warm-gray text-center py-4">
                  No activity yet. Launch a campaign to see updates.
                </p>
              ) : (
                stats.recentActivity.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b border-bloom-light-warm/50 last:border-0"
                  >
                    <div className="mt-0.5">
                      {activity.status === "delivered" ? (
                        <CheckCircle className="w-3.5 h-3.5 text-bloom-olive" />
                      ) : activity.status === "opened" ? (
                        <Mail className="w-3.5 h-3.5 text-bloom-terracotta" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-bloom-amber" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-bloom-charcoal truncate">
                        {activity.customerName}
                      </p>
                      <p className="text-[10px] text-bloom-warm-gray capitalize">
                        {activity.status} via {activity.channel}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
