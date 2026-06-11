import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  ArrowRight,
  Loader2,
  Send,
  MessageSquare,
  Smartphone,
  Mail,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";

function ChannelIcon({ channel }: { channel: string }) {
  if (channel === "whatsapp") return <MessageSquare className="w-4 h-4" />;
  if (channel === "sms") return <Smartphone className="w-4 h-4" />;
  return <Mail className="w-4 h-4" />;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-bloom-warm-gray/10 text-bloom-warm-gray",
    running: "bg-bloom-olive/10 text-bloom-olive",
    completed: "bg-bloom-brown/10 text-bloom-brown",
    failed: "bg-bloom-rust/10 text-bloom-rust",
  };
  return (
    <span className={`bloom-badge capitalize ${colors[status] || colors.draft}`}>
      {status}
    </span>
  );
}

export default function Campaigns() {
  const navigate = useNavigate();
  const [showComposer, setShowComposer] = useState(false);
  const [step, setStep] = useState<"segment" | "compose" | "confirm">("segment");
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<"whatsapp" | "sms" | "email">("whatsapp");
  const [campaignName, setCampaignName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [messageVariant, setMessageVariant] = useState(0);
  const [campaignResult, setCampaignResult] = useState<{
    id: number;
    name: string;
    customerCount: number;
    predictedMetrics: { sent: number; delivered: number; opened: number; clicked: number; converted: number };
    messageVariants: string[];
  } | null>(null);

  const utils = trpc.useUtils();
  const { data: campaigns, isLoading } = trpc.campaign.list.useQuery();
  const { data: segments } = trpc.segment.list.useQuery();
  const createCampaign = trpc.campaign.create.useMutation({
    onSuccess: (data) => {
      setCampaignResult(data);
      setStep("confirm");
    },
  });
  const launchCampaign = trpc.campaign.launch.useMutation({
    onSuccess: (data) => {
      utils.campaign.list.invalidate();
      setShowComposer(false);
      setStep("segment");
      setCampaignResult(null);
      setSelectedSegment(null);
      setCampaignName("");
      setCampaignGoal("");
      toast.success(`Campaign launched! ${data.messageCount ?? 0} messages dispatched to channel service.`);
      // Navigate to performance
      navigate("/performance");
    },
    onError: () => toast.error("Failed to launch campaign. Please try again."),
  });

  const handleCreate = () => {
    if (!selectedSegment || !campaignName || !campaignGoal) return;
    createCampaign.mutate({
      name: campaignName,
      segmentId: selectedSegment,
      channel: selectedChannel,
      goal: campaignGoal,
      messageVariant,
    });
  };

  const handleLaunch = () => {
    if (!campaignResult) return;
    launchCampaign.mutate({ id: campaignResult.id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-bloom-terracotta animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-bloom-charcoal">
            Campaigns
          </h2>
          <p className="text-sm text-bloom-warm-gray mt-1">
            Create and manage your marketing campaigns
          </p>
        </div>
        <button
          onClick={() => { setShowComposer(true); setStep("segment"); }}
          className="bloom-btn-accent flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Campaign List */}
      {!showComposer && (
        <div className="space-y-3">
          {campaigns?.length === 0 ? (
            <div className="bloom-card p-12 text-center">
              <Megaphone className="w-12 h-12 text-bloom-light-warm mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg text-bloom-charcoal mb-2">
                No campaigns yet
              </h3>
              <p className="text-sm text-bloom-warm-gray mb-4">
                Create your first campaign to start engaging customers
              </p>
              <button
                onClick={() => { setShowComposer(true); setStep("segment"); }}
                className="bloom-btn-accent inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Campaign
              </button>
            </div>
          ) : (
            campaigns?.map((campaign) => (
              <div
                key={campaign.id}
                className="bloom-card p-5 flex items-center gap-5 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate("/performance")}
              >
                <div className="w-10 h-10 rounded-lg bg-bloom-cream flex items-center justify-center">
                  <ChannelIcon channel={campaign.channel} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-semibold text-bloom-charcoal">
                      {campaign.name}
                    </h3>
                    <StatusBadge status={campaign.status} />
                  </div>
                  <p className="text-xs text-bloom-warm-gray mt-1 capitalize">
                    {campaign.channel} · Goal: {campaign.goal}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-bloom-brown">
                      {campaign.actualSent}
                    </p>
                    <p className="text-[10px] text-bloom-warm-gray">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-bloom-brown">
                      {campaign.actualOpened}
                    </p>
                    <p className="text-[10px] text-bloom-warm-gray">Opened</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-bloom-brown">
                      {campaign.actualConverted}
                    </p>
                    <p className="text-[10px] text-bloom-warm-gray">Conv.</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-bloom-light-warm" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Campaign Composer */}
      {showComposer && (
        <div className="bloom-card p-6">
          {/* Progress */}
          <div className="flex items-center gap-4 mb-8">
            {(["segment", "compose", "confirm"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s
                      ? "bg-bloom-brown text-white"
                      : i < ["segment", "compose", "confirm"].indexOf(step)
                      ? "bg-bloom-olive text-white"
                      : "bg-bloom-light-warm text-bloom-warm-gray"
                  }`}
                >
                  {i < ["segment", "compose", "confirm"].indexOf(step) ? (
                    <Sparkles className="w-3 h-3" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs font-medium capitalize ${
                    step === s ? "text-bloom-brown" : "text-bloom-warm-gray"
                  }`}
                >
                  {s === "compose" ? "Compose" : s}
                </span>
                {i < 2 && (
                  <ArrowRight className="w-3 h-3 text-bloom-light-warm ml-1" />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Select Segment */}
          {step === "segment" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-bloom-charcoal">
                Select Your Audience
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {segments?.map((seg) => (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedSegment(seg.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedSegment === seg.id
                        ? "border-bloom-brown bg-bloom-cream/30"
                        : "border-bloom-light-warm hover:border-bloom-warm-gray/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-bloom-brown">
                        {seg.name}
                      </h4>
                      {seg.isAiSuggested && (
                        <Sparkles className="w-3.5 h-3.5 text-bloom-terracotta" />
                      )}
                    </div>
                    <p className="text-xs text-bloom-warm-gray mt-1 line-clamp-1">
                      {seg.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Users className="w-3 h-3 text-bloom-warm-gray" />
                      <span className="text-xs text-bloom-warm-gray">
                        {seg.customerCount} customers
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => selectedSegment && setStep("compose")}
                  disabled={!selectedSegment}
                  className="bloom-btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Compose */}
          {step === "compose" && (
            <div className="space-y-5">
              <h3 className="font-display font-semibold text-lg text-bloom-charcoal">
                Compose Your Campaign
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-bloom-warm-gray mb-1.5">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Win Back Spring 2026"
                    className="bloom-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-bloom-warm-gray mb-1.5">
                    Campaign Goal
                  </label>
                  <input
                    type="text"
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    placeholder="e.g., Re-engage lapsed customers"
                    className="bloom-input"
                  />
                </div>
              </div>

              {/* Channel Selection */}
              <div>
                <label className="block text-xs font-medium text-bloom-warm-gray mb-2">
                  Channel
                </label>
                <div className="flex gap-3">
                  {(["whatsapp", "sms", "email"] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setSelectedChannel(ch)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                        selectedChannel === ch
                          ? "border-bloom-brown bg-bloom-cream/30 text-bloom-brown"
                          : "border-bloom-light-warm text-bloom-warm-gray hover:border-bloom-warm-gray/30"
                      }`}
                    >
                      <ChannelIcon channel={ch} />
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Variant */}
              <div>
                <label className="block text-xs font-medium text-bloom-warm-gray mb-2">
                  AI Message Variant
                </label>
                <div className="flex gap-3">
                  {[0, 1, 2].map((v) => (
                    <button
                      key={v}
                      onClick={() => setMessageVariant(v)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        messageVariant === v
                          ? "border-bloom-terracotta bg-bloom-terracotta/5 text-bloom-terracotta"
                          : "border-bloom-light-warm text-bloom-warm-gray"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Variant {v + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep("segment")}
                  className="bloom-btn-ghost"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!campaignName || !campaignGoal || createCampaign.isPending}
                  className="bloom-btn-accent flex items-center gap-2 disabled:opacity-50"
                >
                  {createCampaign.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {createCampaign.isPending ? "Generating..." : "Generate Messages"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm & Launch */}
          {step === "confirm" && campaignResult && (
            <div className="space-y-5">
              <h3 className="font-display font-semibold text-lg text-bloom-charcoal">
                Review & Launch
              </h3>

              {/* Campaign Summary */}
              <div className="p-4 rounded-lg bg-bloom-cream/30 border border-bloom-light-warm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-bloom-brown flex items-center justify-center">
                    <ChannelIcon channel={selectedChannel} />
                    <span className="text-white text-xs font-bold capitalize ml-1">
                      {selectedChannel}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-bloom-charcoal">
                      {campaignResult.name}
                    </h4>
                    <p className="text-xs text-bloom-warm-gray">
                      Reaching {campaignResult.customerCount} customers via{" "}
                      {selectedChannel}
                    </p>
                  </div>
                </div>

                {/* Predicted Metrics */}
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {Object.entries(campaignResult.predictedMetrics).map(
                    ([key, value]) => (
                      <div key={key} className="text-center p-2 rounded-lg bg-white">
                        <p className="text-lg font-display font-bold text-bloom-brown">
                          {value}
                        </p>
                        <p className="text-[10px] text-bloom-warm-gray capitalize">
                          {key}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <label className="block text-xs font-medium text-bloom-warm-gray mb-2">
                  AI-Generated Message Preview
                </label>
                <div className="p-4 rounded-lg bg-white border border-bloom-light-warm">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-bloom-terracotta" />
                    <span className="text-xs font-semibold text-bloom-terracotta">
                      Variant {messageVariant + 1}
                    </span>
                  </div>
                  <p className="text-sm text-bloom-charcoal leading-relaxed">
                    {campaignResult.messageVariants[messageVariant]}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep("compose")}
                  className="bloom-btn-ghost"
                >
                  Back
                </button>
                <button
                  onClick={handleLaunch}
                  disabled={launchCampaign.isPending}
                  className="bloom-btn-primary flex items-center gap-2 disabled:opacity-50 px-8"
                >
                  {launchCampaign.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {launchCampaign.isPending ? "Launching..." : "Launch Campaign"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
