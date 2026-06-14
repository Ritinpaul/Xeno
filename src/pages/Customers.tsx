import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import {
  Search,
  Users,
  Heart,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Filter,
  Plus,
  X,
} from "lucide-react";

const PERSONAS = [
  { value: "", label: "All personas" },
  { value: "office_regular", label: "Office Regular" },
  { value: "weekend_enthusiast", label: "Weekend Enthusiast" },
  { value: "gift_buyer", label: "Gift Buyer" },
  { value: "subscription_loyalist", label: "Subscription Loyalist" },
  { value: "lapsed_explorer", label: "Lapsed Explorer" },
  { value: "new", label: "New Customer" },
];

function HealthBar({ score }: { score: number | null }) {
  const s = score ?? 50;
  const color = s > 70 ? "bg-bloom-olive" : s > 40 ? "bg-bloom-amber" : "bg-bloom-rust";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-bloom-light-warm rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${s}%` }} />
      </div>
      <span
        className={`text-xs font-semibold ${
          s > 70 ? "text-bloom-olive" : s > 40 ? "text-bloom-amber" : "text-bloom-rust"
        }`}
      >
        {s}
      </span>
    </div>
  );
}

export default function Customers() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [persona, setPersona] = useState("");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");

  const { data, isLoading } = trpc.customer.list.useQuery({
    search: search || undefined,
    persona: persona || undefined,
    page,
    limit: 20,
  });

  const { data: stats } = trpc.customer.getStats.useQuery();

  const createCustomerMutation = trpc.customer.create.useMutation({
    onSuccess: () => {
      toast.success("Customer added successfully!");
      setIsAddModalOpen(false);
      setNewCustomerName("");
      setNewCustomerEmail("");
      utils.customer.list.invalidate();
      utils.customer.getStats.invalidate();
    },
    onError: () => {
      toast.error("Failed to add customer. Please try again.");
    },
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handlePersonaChange = (val: string) => {
    setPersona(val);
    setPage(1);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomerMutation.mutate({
      name: newCustomerName,
      email: newCustomerEmail,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-bloom-charcoal">
            Customer Intelligence
          </h2>
          <p className="text-sm text-bloom-warm-gray mt-1">
            Browse and explore your shoppers, their purchase history, and health scores.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bloom-btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 animate-slide-up">
          <div className="bloom-card p-4 text-center">
            <Users className="w-5 h-5 text-bloom-brown mx-auto mb-2" />
            <p className="text-xl font-display font-bold text-bloom-charcoal">
              {stats.totalCustomers.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-bloom-warm-gray">Total Shoppers</p>
          </div>
          <div className="bloom-card p-4 text-center">
            <TrendingUp className="w-5 h-5 text-bloom-olive mx-auto mb-2" />
            <p className="text-xl font-display font-bold text-bloom-charcoal">
              {stats.activeCustomers.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-bloom-warm-gray">Active (30d)</p>
          </div>
          <div className="bloom-card p-4 text-center">
            <ShoppingBag className="w-5 h-5 text-bloom-amber mx-auto mb-2" />
            <p className="text-xl font-display font-bold text-bloom-charcoal">
              {stats.newCustomers.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-bloom-warm-gray">New (14d)</p>
          </div>
          <div className="bloom-card p-4 text-center">
            <Heart className="w-5 h-5 text-bloom-terracotta mx-auto mb-2" />
            <p className="text-xl font-display font-bold text-bloom-charcoal">
              {stats.lapsedCustomers.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-bloom-warm-gray">At-Risk (60d+)</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bloom-card p-4 flex items-center gap-4 animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "backwards" }}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bloom-warm-gray" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name..."
            className="bloom-input pl-10 py-2.5"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bloom-warm-gray" />
          <select
            value={persona}
            onChange={(e) => handlePersonaChange(e.target.value)}
            className="bloom-input pl-10 py-2.5 pr-8 appearance-none min-w-[180px]"
          >
            {PERSONAS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleSearch} className="bloom-btn-secondary flex items-center gap-2 px-6 py-2.5">
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {/* Customer List */}
      <div className="bloom-card overflow-hidden animate-slide-up" style={{ animationDelay: "150ms", animationFillMode: "backwards" }}>
        {/* Table Header */}
        <div className="grid grid-cols-12 px-5 py-3 border-b border-bloom-light-warm bg-bloom-bg/50">
          <div className="col-span-4 text-xs font-semibold text-bloom-warm-gray uppercase tracking-wider">
            Customer
          </div>
          <div className="col-span-2 text-xs font-semibold text-bloom-warm-gray uppercase tracking-wider">
            Persona
          </div>
          <div className="col-span-2 text-xs font-semibold text-bloom-warm-gray uppercase tracking-wider">
            Total Spent
          </div>
          <div className="col-span-1 text-xs font-semibold text-bloom-warm-gray uppercase tracking-wider text-center">
            Orders
          </div>
          <div className="col-span-2 text-xs font-semibold text-bloom-warm-gray uppercase tracking-wider">
            Health
          </div>
          <div className="col-span-1" />
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-bloom-terracotta animate-spin" />
          </div>
        ) : data?.customers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-bloom-light-warm mx-auto mb-3" />
            <p className="text-sm text-bloom-warm-gray">No customers found.</p>
          </div>
        ) : (
          <div className="divide-y divide-bloom-light-warm/60">
            {data?.customers.map((customer, i) => (
              <div
                key={customer.id}
                className="grid grid-cols-12 px-5 py-4 items-center hover:bg-bloom-cream/20 transition-colors cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${i * 30}ms`, animationFillMode: "backwards" }}
                onClick={() => navigate(`/customer/${customer.id}`)}
              >
                {/* Name + Avatar */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-bloom-brown/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-bloom-brown">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-bloom-charcoal truncate">
                      {customer.name}
                    </p>
                    <p className="text-[11px] text-bloom-warm-gray truncate">{customer.email}</p>
                  </div>
                </div>

                {/* Persona */}
                <div className="col-span-2">
                  <span className="bloom-badge bg-bloom-cream/60 text-bloom-brown capitalize text-[10px]">
                    {customer.persona?.replace(/_/g, " ") || "new"}
                  </span>
                </div>

                {/* Spent */}
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-bloom-charcoal">
                    Rs.{Number(customer.totalSpent).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Orders */}
                <div className="col-span-1 text-center">
                  <p className="text-sm font-semibold text-bloom-charcoal">{customer.totalOrders}</p>
                </div>

                {/* Health */}
                <div className="col-span-2">
                  <HealthBar score={customer.healthScore} />
                </div>

                {/* Arrow */}
                <div className="col-span-1 flex justify-end">
                  <ArrowRight className="w-4 h-4 text-bloom-light-warm group-hover:text-bloom-terracotta transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between animate-fade-in">
          <p className="text-xs text-bloom-warm-gray">
            Showing page {data.page} of {data.totalPages} ({data.total.toLocaleString("en-IN")} customers)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bloom-btn-ghost px-3 py-2 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-xs font-medium text-bloom-charcoal px-3 py-2 rounded-lg bg-bloom-cream/40">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="bloom-btn-ghost px-3 py-2 disabled:opacity-40 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-charcoal/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-bloom-warm-gray hover:text-bloom-charcoal transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-bloom-charcoal mb-1">
                Add New Customer
              </h3>
              <p className="text-sm text-bloom-warm-gray mb-6">
                Enter the customer's details to manually add them to your intelligence hub.
              </p>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-bloom-charcoal mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="bloom-input w-full"
                    placeholder="e.g. Jane Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-bloom-charcoal mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="bloom-input w-full"
                    placeholder="e.g. jane@example.com"
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="bloom-btn-secondary px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCustomerMutation.isPending}
                    className="bloom-btn-primary px-6 py-2 flex items-center gap-2"
                  >
                    {createCustomerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Add Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
