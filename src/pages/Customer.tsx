import { useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  ArrowLeft,
  Loader2,
  ShoppingBag,
  Mail,
  Smartphone,
  MessageSquare,
  Calendar,
  Heart,
  TrendingUp,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Customer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = parseInt(id || "0");

  const { data: customer, isLoading } = trpc.customer.getById.useQuery({
    id: customerId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-bloom-terracotta animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-bloom-warm-gray">Customer not found</p>
        <button onClick={() => navigate("/")} className="bloom-btn-primary mt-4">
          Go Home
        </button>
      </div>
    );
  }

  const metadata = customer.metadata ? JSON.parse(customer.metadata as string) : {};
  const personaLabel = customer.persona?.replace(/_/g, " ") || "Unknown";
  const channel = customer.channelPreference || "email";

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="bloom-btn-ghost text-sm flex items-center gap-1"
      >
        <ArrowLeft className="w-3 h-3" /> Back
      </button>

      {/* Customer Header */}
      <div className="bloom-card p-6">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-bloom-brown flex items-center justify-center shrink-0">
            <span className="text-2xl font-display font-bold text-white">
              {customer.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold text-bloom-charcoal">
                {customer.name}
              </h2>
              <span className="bloom-badge bg-bloom-cream text-bloom-brown capitalize">
                {personaLabel}
              </span>
            </div>
            <div className="flex items-center gap-6 mt-2 text-sm text-bloom-warm-gray">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  {customer.phone}
                </span>
              )}
              <span className="flex items-center gap-1 capitalize">
                {channel === "whatsapp" ? (
                  <MessageSquare className="w-3.5 h-3.5" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                Prefers {channel}
              </span>
            </div>
          </div>
          {/* Health Score */}
          <div className="text-center px-4 py-3 rounded-lg bg-bloom-cream/40">
            <div className="flex items-center gap-1 mb-1">
              <Heart className="w-3.5 h-3.5 text-bloom-terracotta" />
              <span className="text-xs font-medium text-bloom-warm-gray">
                Health
              </span>
            </div>
            <p
              className={`text-2xl font-display font-bold ${
                (customer.healthScore ?? 50) > 70
                  ? "text-bloom-olive"
                  : (customer.healthScore ?? 50) > 40
                  ? "text-bloom-amber"
                  : "text-bloom-rust"
              }`}
            >
              {customer.healthScore}
            </p>
            <p className="text-[10px] text-bloom-warm-gray">
              {(customer.healthScore ?? 50) > 70
                ? "Healthy"
                : (customer.healthScore ?? 50) > 40
                ? "At Risk"
                : "Critical"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bloom-card p-4 text-center">
          <TrendingUp className="w-5 h-5 text-bloom-olive mx-auto mb-2" />
          <p className="text-xl font-display font-bold text-bloom-charcoal">
            Rs.{Number(customer.totalSpent).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-bloom-warm-gray">Lifetime Value</p>
        </div>
        <div className="bloom-card p-4 text-center">
          <ShoppingBag className="w-5 h-5 text-bloom-brown mx-auto mb-2" />
          <p className="text-xl font-display font-bold text-bloom-charcoal">
            {customer.totalOrders}
          </p>
          <p className="text-xs text-bloom-warm-gray">Total Orders</p>
        </div>
        <div className="bloom-card p-4 text-center">
          <Calendar className="w-5 h-5 text-bloom-terracotta mx-auto mb-2" />
          <p className="text-lg font-display font-bold text-bloom-charcoal">
            {customer.lastOrderAt
              ? new Date(customer.lastOrderAt).toLocaleDateString("en-IN")
              : "Never"}
          </p>
          <p className="text-xs text-bloom-warm-gray">Last Order</p>
        </div>
        <div className="bloom-card p-4 text-center">
          <Package className="w-5 h-5 text-bloom-amber mx-auto mb-2" />
          <p className="text-lg font-display font-bold text-bloom-charcoal">
            {metadata.discoveryChannel
              ? metadata.discoveryChannel.replace(/_/g, " ")
              : "Online"}
          </p>
          <p className="text-xs text-bloom-warm-gray">Discovery</p>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bloom-card p-5 border-l-4 border-l-bloom-terracotta">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-bloom-terracotta" />
          <h3 className="font-display font-semibold text-sm text-bloom-brown">
            AI Summary
          </h3>
        </div>
        <p className="text-sm text-bloom-charcoal leading-relaxed">
          {customer.aiSummary ||
            `${customer.name} is a ${personaLabel} who discovered Bloom through ${
              metadata.discoveryChannel || "online"
            }. With ${customer.totalOrders} orders and a lifetime spend of Rs.${Number(
              customer.totalSpent
            ).toLocaleString("en-IN")}, they $${
              (customer.healthScore ?? 50) > 60
                ? "show strong loyalty and are likely to respond well to exclusive offers"
                : "need re-engagement — consider a personalized comeback campaign"
            }.`}
        </p>
      </div>

      {/* Order Timeline */}
      <div>
        <h3 className="font-display font-semibold text-lg text-bloom-charcoal mb-4">
          Order Timeline
        </h3>
        <div className="space-y-3">
          {customer.orders.length === 0 ? (
            <p className="text-sm text-bloom-warm-gray text-center py-8">
              No orders yet
            </p>
          ) : (
            customer.orders.map((order, i) => {
              const items = order.items ? JSON.parse(order.items as string) : [];
              return (
                <div
                  key={order.id}
                  className="bloom-card p-4 flex items-start gap-4 animate-slide-up"
                  style={{
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-bloom-cream flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-bloom-brown" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-bloom-charcoal">
                        Order {order.orderNumber}
                      </p>
                      <span className="text-sm font-semibold text-bloom-brown">
                        Rs.{Number(order.totalAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {items.map((item: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-full bg-bloom-cream/50 text-bloom-warm-gray"
                        >
                          {item.quantity}x {item.productName}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-bloom-warm-gray">
                      <span className="capitalize">{order.channel?.replace(/_/g, " ")}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                      <span className={`capitalize ${order.status === "completed" ? "text-bloom-olive" : order.status === "cancelled" ? "text-bloom-rust" : "text-bloom-amber"}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
