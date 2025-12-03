import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: 'include',
        });

        if (!response.ok) {
          // Not logged in, redirect to auth
          setLocation("/auth");
          return;
        }

        const data = await response.json();

        // Check if email is verified
        if (data.user.emailVerified !== 'true') {
          // Email not verified, redirect to verify page
          setLocation("/verify-email");
          return;
        }

        // All good, allow access
        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        setLocation("/auth");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
