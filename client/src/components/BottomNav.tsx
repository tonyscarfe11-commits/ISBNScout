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
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40">
      <div className="flex items-center justify-around h-20 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.path === "/app/dashboard" && location === "/app");
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              data-testid={`link-nav-${item.label.toLowerCase()}`}
            >
              <button
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[70px] ${
                  isActive
                    ? "text-teal-400 bg-teal-500/10"
                    : "text-slate-400 hover:text-teal-300 hover:bg-slate-800"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
