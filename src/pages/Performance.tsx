import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  BarChart3,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Megaphone,
  ArrowRight,
  Smartphone,
  MessageSquare,
  Mail,
  Users,
  Zap,
} from "lucide-react";

function MetricCard({
  label,
  value,
  predicted,
  icon: Icon,
  delay,
}: {
  label: string;
  value: number;
  predicted: number;
  icon: React.ElementType;
  delay: number;
}) {
  const pct = predicted > 0 ? Math.round((value / predicted) * 100) : 0;
  const isOver = value > predicted;
  return (
    <div
      className="bloom-card p-4 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-bloom-warm-gray" />
        <span className="text-xs font-medium text-bloom-warm-gray uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-display font-bold text-bloom-charcoal">
        {value}
      </p>
      <div className="flex items-center gap-1 mt-1">
        {isOver ? (
          <TrendingUp className="w-3 h-3 text-bloom-olive" />
        ) : pct < 70 ? (
          <TrendingDown className="w-3 h-3 text-bloom-rust" />
        ) : (
          <Minus className="w-3 h-3 text-bloom-warm-gray" />
        )}
        <span
          className={`text-xs font-medium ${
            isOver
              ? "text-bloom-olive"
              : pct < 70
              ? "text-bloom-rust"
              : "text-bloom-warm-gray"
          }`}
        >
          {pct}% of predicted
        </span>
      </div>
      {/* Mini progress bar */}
      <div className="mt-2 h-1.5 bg-bloom-light-warm rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isOver ? "bg-bloom-olive" : pct < 70 ? "bg-bloom-rust" : "bg-bloom-amber"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function CampaignDetail({ campaignId }: { campaignId: number }) {
  const { data: campaign, isLoading } = trpc.campaign.getById.useQuery(
    { id: campaignId },
    {
      // Poll while running so the channel service callbacks update the UI live
      refetchInterval: (query) =>
        query.state.data?.status === "running" ? 800 : false,
    }
  );
  const { data: insight } = trpc.campaign.generateInsight.useQuery(
    { id: campaignId },
    { enabled: campaign?.status === "completed" || (campaign?.actualSent ?? 0) > 0 }
  );
  const utils = trpc.useUtils();

  // Invalidate campaign list when campaign completes
  useEffect(() => {
    if (campaign?.status === "completed") {
      utils.campaign.list.invalidate();
    }
  }, [campaign?.status]);

  if (isLoading || !campaign) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-bloom-terracotta animate-spin" />
      </div>
    );
  }

  const isRunning = campaign.status === "running";
  const c = campaign;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold text-bloom-charcoal">
              {c.name}
            </h2>
            <span
              className={`bloom-badge capitalize ${
                isRunning
                  ? "bg-bloom-olive/10 text-bloom-olive"
                  : c.status === "completed"
                  ? "bg-bloom-brown/10 text-bloom-brown"
                  : "bg-bloom-warm-gray/10 text-bloom-warm-gray"
              }`}
            >
              {c.status}
            </span>
          </div>
          <p className="text-sm text-bloom-warm-gray mt-1">
            {c.goal} · {c.channel} · {campaign.segment?.name}
          </p>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bloom-olive/10">
            <Zap className="w-4 h-4 text-bloom-olive animate-pulse" />
            <span className="text-xs font-medium text-bloom-olive">
              Live Simulation Running
            </span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-6 gap-4">
        <MetricCard label="Sent" value={c.actualSent ?? 0} predicted={c.predictedSent ?? 1} icon={Megaphone} delay={0} />
        <MetricCard label="Delivered" value={c.actualDelivered ?? 0} predicted={c.predictedDelivered ?? 1} icon={Smartphone} delay={50} />
        <MetricCard label="Opened" value={c.actualOpened ?? 0} predicted={c.predictedOpened ?? 1} icon={Mail} delay={100} />
        <MetricCard label="Clicked" value={c.actualClicked ?? 0} predicted={c.predictedClicked ?? 1} icon={Zap} delay={150} />
        <MetricCard label="Converted" value={c.actualConverted ?? 0} predicted={c.predictedConverted ?? 1} icon={Users} delay={200} />
        <MetricCard label="Revenue" value={Number(c.actualRevenue ?? 0)} predicted={Number(c.predictedConverted ?? 0) * 200} icon={BarChart3} delay={250} />
      </div>

      {/* AI Insight */}
      {insight && (
        <div
          className="p-5 rounded-xl bg-gradient-to-r from-bloom-cream/60 to-bloom-cream/30 border border-bloom-terracotta/20 animate-slide-up"
          style={{ animationDelay: "300ms", animationFillMode: "backwards" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-bloom-terracotta" />
            <h3 className="font-display font-semibold text-bloom-brown">
              AI Insight
            </h3>
            <span className="bloom-badge bg-white/60 text-bloom-warm-gray capitalize text-[10px]">
              {insight.confidence} confidence
            </span>
          </div>
          <p className="text-sm text-bloom-charcoal leading-relaxed mb-3">
            {insight.insight}
          </p>
          <div className="p-3 rounded-lg bg-white/60 border border-bloom-light-warm">
            <p className="text-xs font-semibold text-bloom-olive mb-1">
              Recommendation
            </p>
            <p className="text-xs text-bloom-warm-gray leading-relaxed">
              {insight.recommendation}
            </p>
          </div>
          {insight.metrics && (
            <div className="flex gap-6 mt-3 pt-3 border-t border-bloom-light-warm/50">
              <div>
                <span className="text-[10px] text-bloom-warm-gray">Open Rate</span>
                <p className="text-sm font-semibold text-bloom-brown">{insight.metrics.openRate}%</p>
              </div>
              <div>
                <span className="text-[10px] text-bloom-warm-gray">Click Rate</span>
                <p className="text-sm font-semibold text-bloom-brown">{insight.metrics.clickRate}%</p>
              </div>
              <div>
                <span className="text-[10px] text-bloom-warm-gray">Conv. Rate</span>
                <p className="text-sm font-semibold text-bloom-brown">{insight.metrics.conversionRate}%</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Performance() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = trpc.campaign.list.useQuery();
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-bloom-terracotta animate-spin" />
      </div>
    );
  }

  if (selectedCampaign) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCampaign(null)}
          className="bloom-btn-ghost text-sm flex items-center gap-1"
        >
          <ArrowRight className="w-3 h-3 rotate-180" /> Back to campaigns
        </button>
        <CampaignDetail campaignId={selectedCampaign} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-bloom-charcoal">
          Performance Center
        </h2>
        <p className="text-sm text-bloom-warm-gray mt-1">
          Track campaign results and uncover AI-powered insights
        </p>
      </div>

      {campaigns?.length === 0 ? (
        <div className="bloom-card p-12 text-center">
          <BarChart3 className="w-12 h-12 text-bloom-light-warm mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg text-bloom-charcoal mb-2">
            No campaigns yet
          </h3>
          <p className="text-sm text-bloom-warm-gray mb-4">
            Launch a campaign to see performance metrics
          </p>
          <button
            onClick={() => navigate("/campaigns")}
            className="bloom-btn-accent inline-flex items-center gap-2"
          >
            <Megaphone className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns?.map((campaign: any) => (
            <div
              key={campaign.id}
              className="bloom-card p-5 flex items-center gap-5 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedCampaign(campaign.id)}
            >
              <div className="w-10 h-10 rounded-lg bg-bloom-cream flex items-center justify-center">
                {campaign.channel === "whatsapp" ? (
                  <MessageSquare className="w-5 h-5 text-bloom-brown" />
                ) : campaign.channel === "sms" ? (
                  <Smartphone className="w-5 h-5 text-bloom-brown" />
                ) : (
                  <Mail className="w-5 h-5 text-bloom-brown" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-semibold text-bloom-charcoal">
                    {campaign.name}
                  </h3>
                  <span
                    className={`bloom-badge capitalize ${
                      campaign.status === "running"
                        ? "bg-bloom-olive/10 text-bloom-olive"
                        : campaign.status === "completed"
                        ? "bg-bloom-brown/10 text-bloom-brown"
                        : "bg-bloom-warm-gray/10 text-bloom-warm-gray"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <p className="text-xs text-bloom-warm-gray mt-1 capitalize">
                  {campaign.channel} · {campaign.goal}
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-bloom-brown">{campaign.actualSent}</p>
                  <p className="text-[10px] text-bloom-warm-gray">Sent</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-bloom-brown">{campaign.actualOpened}</p>
                  <p className="text-[10px] text-bloom-warm-gray">Opened</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-bloom-brown">{campaign.actualConverted}</p>
                  <p className="text-[10px] text-bloom-warm-gray">Conv.</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-bloom-brown">
                    Rs.{Number(campaign.actualRevenue ?? 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-bloom-warm-gray">Revenue</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-bloom-light-warm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
