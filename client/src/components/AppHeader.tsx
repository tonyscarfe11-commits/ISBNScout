import { Button } from "./ui/button";
import { useLocation } from "wouter";
import { LogOut, ArrowLeft, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAuthToken, clearAuthToken } from "@/lib/queryClient";

export function AppHeader() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAuthToken();
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/user/me', { 
          credentials: 'include',
          headers,
        });
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
      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers,
      });
      
      // Clear the localStorage token
      clearAuthToken();
      
      setUser(null);
      setLocation('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAppRoute = location.startsWith('/app');

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Button 
          variant="ghost"
          onClick={() => setLocation(isAppRoute ? '/app/dashboard' : '/')}
          className="flex items-center gap-2 text-white hover:text-teal-400 hover:bg-slate-800 px-2"
          data-testid="button-home"
        >
          {!isAppRoute && <ArrowLeft className="h-4 w-4" />}
          <img src={logoImage} alt="ISBNScout" className="h-7 w-7" />
          <span className="text-base font-bold">ISBNScout</span>
        </Button>
        
        {!isLoading && (
          user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-300 hidden sm:block">
                {user.username || user.email}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      localStorage.removeItem('hasSeenWelcome');
                      localStorage.removeItem('onboardingCompleted');
                      setLocation('/app/scan');
                      window.location.reload();
                    }}
                    className="text-slate-400 hover:text-teal-400 hover:bg-slate-800"
                    data-testid="button-help"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show welcome guide</p>
                </TooltipContent>
              </Tooltip>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setLocation("/auth")}
              className="bg-teal-600 hover:bg-teal-700 text-white"
              data-testid="button-login"
            >
              Log In
            </Button>
          )
        )}
      </div>
    </header>
  );
}
