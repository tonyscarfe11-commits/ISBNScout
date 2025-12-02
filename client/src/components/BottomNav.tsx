import { Camera, Clock, Settings, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "wouter";

const navItems = [
  { path: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/app/scan", icon: Camera, label: "Scan" },
  { path: "/app/history", icon: Clock, label: "History" },
  { path: "/app/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.path === "/app/dashboard" && location === "/app");
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[72px] ${
                isActive
                  ? "text-emerald-400 bg-emerald-500/15 scale-105"
                  : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60 active:scale-95"
              }`}
              data-testid={`link-nav-${item.label.toLowerCase()}`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[11px] tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
