import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  BarChart3,
  Sparkles,
  Coffee,
  UserCircle,
  UserCheck,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const navItems = [
  { path: "/", label: "Intelligence Hub", icon: LayoutDashboard },
  { path: "/customers", label: "Customers", icon: UserCheck },
  { path: "/audience", label: "Audience Builder", icon: Users },
  { path: "/campaigns", label: "Campaigns", icon: Megaphone },
  { path: "/performance", label: "Performance", icon: BarChart3 },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: stats } = trpc.analytics.dashboard.useQuery();

  return (
    <div className="flex h-screen bg-bloom-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-bloom-light-warm flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-bloom-light-warm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-bloom-brown flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-bloom-brown leading-tight">
                Bloom Coffee
              </h1>
              <p className="text-[10px] text-bloom-warm-gray font-medium tracking-wide uppercase">
                Co.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`bloom-nav-item w-full ${isActive ? "active" : ""}`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* AI Status */}
        <div className="px-4 py-4 border-t border-bloom-light-warm">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bloom-cream/40">
            <Sparkles className="w-4 h-4 text-bloom-terracotta" />
            <span className="text-xs font-medium text-bloom-brown">
              AI Agent Online
            </span>
            <span className="status-dot running ml-auto" />
          </div>
          {stats && (
            <div className="mt-3 px-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-bloom-warm-gray">Customers</span>
                <span className="font-semibold text-bloom-brown">
                  {stats.customers.totalCustomers}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-bloom-warm-gray">Revenue</span>
                <span className="font-semibold text-bloom-brown">
                  Rs.{Number(stats.customers.totalRevenue).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-bloom-bg/80 backdrop-blur-md border-b border-bloom-light-warm px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-bloom-charcoal">
                {navItems.find((n) => n.path === location.pathname)?.label ||
                  "Astra"}
              </h2>
              <p className="text-xs text-bloom-warm-gray mt-0.5">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-bloom-light-warm">
                <span className="status-dot running" />
                <span className="text-xs font-medium text-bloom-olive">
                  All systems operational
                </span>
              </div>
              <button className="w-9 h-9 rounded-full bg-white border border-bloom-light-warm flex items-center justify-center hover:bg-bloom-cream/50 transition-colors">
                <UserCircle className="w-5 h-5 text-bloom-warm-gray" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
