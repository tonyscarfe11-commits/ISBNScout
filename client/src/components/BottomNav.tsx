import { BarChart3, Camera, Clock, Package, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

const navItems = [
  { path: "/app/scan", icon: Camera, label: "Scan" },
  { path: "/app/history", icon: Clock, label: "History" },
  { path: "/app/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/app/listings", icon: Package, label: "Listings" },
  { path: "/app/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-40">
      <div className="flex items-center justify-around h-16 max-w-full mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              data-testid={`link-nav-${item.label.toLowerCase()}`}
            >
              <button
                className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-md transition-colors min-h-9 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover-elevate"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
