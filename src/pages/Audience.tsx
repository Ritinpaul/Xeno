import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import {
  Search,
  Sparkles,
  Filter,
  Users,
  Loader2,
  MessageSquare,
  Save,
  X,
} from "lucide-react";

type FilterMode = "manual" | "nl";

export default function Audience() {
  const [mode, setMode] = useState<FilterMode>("manual");
  const [nlQuery, setNlQuery] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredCustomers, setDiscoveredCustomers] = useState<
    Array<{ id: number; name: string; totalSpent: string; totalOrders: number; lastOrderAt: Date | null; persona: string | null; healthScore: number | null }>
  >([]);
  const [aiReasoning, setAiReasoning] = useState("");
  const [segmentName, setSegmentName] = useState("");
  const [showSave, setShowSave] = useState(false);

  // Manual filters
  const [minSpent, setMinSpent] = useState("");
  const [maxSpent, setMaxSpent] = useState("");
  const [persona, setPersona] = useState("");
  const [minOrders, setMinOrders] = useState("");

  const utils = trpc.useUtils();
  const createSegment = trpc.segment.create.useMutation({
    onSuccess: (data) => {
      utils.segment.list.invalidate();
      setShowSave(false);
      setSegmentName("");
      setDiscoveredCustomers([]);
      setNlQuery("");
      toast.success(`Segment "${data.name}" saved with ${data.customerCount} customers.`);
    },
    onError: () => toast.error("Failed to save segment. Please try again."),
  });

  const { data: existingSegments } = trpc.segment.list.useQuery();

  const nlDiscover = trpc.segment.nlDiscover.useQuery(
    { query: nlQuery },
    { enabled: false }
  );

  const manualDiscover = trpc.segment.discover.useQuery(
    {
      filters: {
        minTotalSpent: minSpent ? parseInt(minSpent) : undefined,
        maxTotalSpent: maxSpent ? parseInt(maxSpent) : undefined,
        persona: persona || undefined,
        minOrders: minOrders ? parseInt(minOrders) : undefined,
      },
    },
    { enabled: false }
  );

  const handleNLSearch = async () => {
    if (!nlQuery.trim()) return;
    setIsDiscovering(true);
    const result = await nlDiscover.refetch();
    setIsDiscovering(false);
    if (result.data) {
      setDiscoveredCustomers(result.data.customers);
      setAiReasoning(result.data.aiReasoning);
    }
  };

  const handleManualSearch = async () => {
    setIsDiscovering(true);
    const result = await manualDiscover.refetch();
    setIsDiscovering(false);
    if (result.data) {
      setDiscoveredCustomers(result.data.customers);
      setAiReasoning(
        `Found ${result.data.count} customers matching your filters.`
      );
    }
  };

  const handleSaveSegment = () => {
    if (!segmentName || discoveredCustomers.length === 0) return;
    createSegment.mutate({
      name: segmentName,
      description: aiReasoning,
      aiReasoning,
      customerIds: discoveredCustomers.map((c) => c.id),
      source: mode === "nl" ? "nl_query" : "manual",
    });
  };

  const nlExamples = [
    "Customers who spent over 3000 but haven't returned in 60 days",
    "Win back lapsed subscription loyalists",
    "High-value VIP customers above ₹5000",
    "New customers who joined in the last 14 days",
    "Active weekend enthusiasts with 3+ orders",
    "Lapsed office regulars inactive for 90 days",
  ];

  return (
    <div className="space-y-6">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-bloom-charcoal">
            Build Your Audience
          </h2>
          <p className="text-sm text-bloom-warm-gray mt-1">
            Define who you want to reach with your campaign
          </p>
        </div>
        <div className="flex bg-white rounded-lg border border-bloom-light-warm p-1">
          <button
            onClick={() => { setMode("manual"); setDiscoveredCustomers([]); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "manual"
                ? "bg-bloom-brown text-white"
                : "text-bloom-warm-gray hover:text-bloom-brown"
            }`}
          >
            <Filter className="w-4 h-4" />
            Manual
          </button>
          <button
            onClick={() => { setMode("nl"); setDiscoveredCustomers([]); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "nl"
                ? "bg-bloom-brown text-white"
                : "text-bloom-warm-gray hover:text-bloom-brown"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Natural Language
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Builder Panel */}
        <div className="col-span-3">
          <div className="bloom-card p-6">
            {mode === "nl" ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-bloom-charcoal">
                  Describe who you want to reach
                </label>
                <div className="relative">
                  <textarea
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    placeholder="e.g., 'Customers who spent over Rs.2000 but haven't returned in 60 days'"
                    className="bloom-input min-h-[100px] resize-none pr-12"
                  />
                  <Sparkles className="absolute right-4 top-4 w-5 h-5 text-bloom-terracotta/40" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {nlExamples.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setNlQuery(ex)}
                      className="text-xs px-3 py-1.5 rounded-full bg-bloom-cream/50 text-bloom-warm-gray hover:bg-bloom-cream hover:text-bloom-brown transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleNLSearch}
                  disabled={!nlQuery.trim() || isDiscovering}
                  className="bloom-btn-accent flex items-center gap-2 disabled:opacity-50"
                >
                  {isDiscovering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isDiscovering ? "Discovering..." : "Discover Audience"}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-bloom-warm-gray mb-1.5">
                      Min Total Spent (Rs.)
                    </label>
                    <input
                      type="number"
                      value={minSpent}
                      onChange={(e) => setMinSpent(e.target.value)}
                      placeholder="e.g. 2000"
                      className="bloom-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-bloom-warm-gray mb-1.5">
                      Max Total Spent (Rs.)
                    </label>
                    <input
                      type="number"
                      value={maxSpent}
                      onChange={(e) => setMaxSpent(e.target.value)}
                      placeholder="e.g. 10000"
                      className="bloom-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-bloom-warm-gray mb-1.5">
                      Persona
                    </label>
                    <select
                      value={persona}
                      onChange={(e) => setPersona(e.target.value)}
                      className="bloom-input"
                    >
                      <option value="">Any persona</option>
                      <option value="office_regular">Office Regular</option>
                      <option value="weekend_enthusiast">Weekend Enthusiast</option>
                      <option value="gift_buyer">Gift Buyer</option>
                      <option value="subscription_loyalist">Subscription Loyalist</option>
                      <option value="lapsed_explorer">Lapsed Explorer</option>
                      <option value="new">New Customer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-bloom-warm-gray mb-1.5">
                      Min Orders
                    </label>
                    <input
                      type="number"
                      value={minOrders}
                      onChange={(e) => setMinOrders(e.target.value)}
                      placeholder="e.g. 2"
                      className="bloom-input"
                    />
                  </div>
                </div>
                <button
                  onClick={handleManualSearch}
                  disabled={isDiscovering}
                  className="bloom-btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {isDiscovering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {isDiscovering ? "Searching..." : "Find Customers"}
                </button>
              </div>
            )}
          </div>

          {/* Existing Segments */}
          <div className="mt-6">
            <h3 className="font-display font-semibold text-sm text-bloom-charcoal mb-3">
              Saved Segments
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {existingSegments?.map((seg) => (
                <div
                  key={seg.id}
                  className="bloom-card p-4 cursor-pointer hover:shadow-md transition-all"
                  onClick={async () => {
                    setIsDiscovering(true);
                    // Load segment customers via the segment getById endpoint
                    const result = await utils.segment.getById.fetch({ id: seg.id });
                    setIsDiscovering(false);
                    if (result && result.customers) {
                      setDiscoveredCustomers(
                        result.customers.map((c) => ({
                          id: c.id,
                          name: c.name,
                          totalSpent: c.totalSpent,
                          totalOrders: c.totalOrders,
                          lastOrderAt: c.lastOrderAt,
                          persona: c.persona,
                          healthScore: c.healthScore,
                        }))
                      );
                      setAiReasoning(
                        seg.aiReasoning ||
                          `Loaded segment "${seg.name}" — ${seg.customerCount} customers.`
                      );
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-bloom-brown">
                      {seg.name}
                    </h4>
                    {seg.isAiSuggested ? (
                      <Sparkles className="w-3.5 h-3.5 text-bloom-terracotta" />
                    ) : null}
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
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Preview Panel */}
        <div className="col-span-2">
          <div className="bloom-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-bloom-brown" />
                <h3 className="font-display font-semibold text-sm text-bloom-charcoal">
                  Audience Preview
                </h3>
              </div>
              {discoveredCustomers.length > 0 && (
                <span className="bloom-badge bg-bloom-cream text-bloom-brown">
                  {discoveredCustomers.length} customers
                </span>
              )}
            </div>

            {aiReasoning && (
              <div className="mb-4 p-3 rounded-lg bg-bloom-cream/40 border border-bloom-light-warm">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-bloom-terracotta" />
                  <span className="text-xs font-semibold text-bloom-terracotta">
                    AI Insight
                  </span>
                </div>
                <p className="text-xs text-bloom-warm-gray leading-relaxed">
                  {aiReasoning}
                </p>
              </div>
            )}

            {discoveredCustomers.length > 0 ? (
              <>
                <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
                  {discoveredCustomers.slice(0, 20).map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-bloom-cream/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-bloom-brown/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-bloom-brown">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-bloom-charcoal truncate">
                          {customer.name}
                        </p>
                        <p className="text-[10px] text-bloom-warm-gray capitalize">
                          {customer.persona?.replace(/_/g, " ")} ·{" "}
                          {customer.totalOrders} orders
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-bloom-brown">
                        Rs.{Number(customer.totalSpent).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                  {discoveredCustomers.length > 20 && (
                    <p className="text-center text-xs text-bloom-warm-gray py-2">
                      +{discoveredCustomers.length - 20} more customers
                    </p>
                  )}
                </div>

                {/* Save Segment */}
                <div className="mt-4 pt-4 border-t border-bloom-light-warm">
                  {!showSave ? (
                    <button
                      onClick={() => setShowSave(true)}
                      className="w-full bloom-btn-primary flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save as Segment
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={segmentName}
                        onChange={(e) => setSegmentName(e.target.value)}
                        placeholder="Segment name..."
                        className="bloom-input text-sm py-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveSegment}
                          disabled={!segmentName || createSegment.isPending}
                          className="flex-1 bloom-btn-primary text-sm py-2 disabled:opacity-50"
                        >
                          {createSegment.isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setShowSave(false)}
                          className="px-3 py-2 rounded-lg border border-bloom-light-warm hover:bg-bloom-cream/50"
                        >
                          <X className="w-4 h-4 text-bloom-warm-gray" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-bloom-light-warm mx-auto mb-3" />
                <p className="text-sm text-bloom-warm-gray">
                  {isDiscovering
                    ? "Discovering customers..."
                    : "Use the builder to discover your audience"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
