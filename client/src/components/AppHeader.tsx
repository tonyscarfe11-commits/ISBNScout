import { BrandText } from "./icons";
import { Button } from "./ui/button";
import { useLocation } from "wouter";
import { User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export function AppHeader() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/me', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setLocation('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <BrandText className="text-lg text-white" />
        {!isLoading && (
          user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-white">
                {user.username || user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/auth")}
              className="text-white hover:bg-slate-800"
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
          )
        )}
      </div>
    </header>
  );
}
