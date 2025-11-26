import { BrandText } from "./icons";
import { Button } from "./ui/button";
import { useLocation } from "wouter";
import { User } from "lucide-react";

export function AppHeader() {
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <BrandText className="text-lg text-white" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/auth")}
          className="text-white hover:bg-slate-800"
        >
          <User className="w-4 h-4 mr-2" />
          Login
        </Button>
      </div>
    </header>
  );
}
