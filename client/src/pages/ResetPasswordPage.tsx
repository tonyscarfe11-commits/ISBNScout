import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BrandText } from "@/components/icons";
import { Lock, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast({
        title: "Invalid reset link",
        description: "Please request a new password reset link",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reset password");
      }

      setResetSuccess(true);
      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        setLocation("/auth");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <div className="w-full max-w-md animate-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandText className="text-4xl font-bold gradient-text" />
          </div>
          <p className="text-muted-foreground text-lg">
            Create a new password
          </p>
        </div>

        <Card className="p-8 card-elevated">
          {!resetSuccess ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
                <p className="text-muted-foreground">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-medium">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 text-base"
                      required
                      disabled={isLoading}
                      minLength={8}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-11 h-12 text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-md"
                  disabled={isLoading || !token}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold mb-2">Password Reset!</h3>
                <p className="text-muted-foreground">
                  Your password has been successfully reset. Redirecting to login...
                </p>
              </div>
            </div>
          )}

          {!resetSuccess && (
            <div className="mt-6 text-center">
              <Link href="/auth">
                <a className="text-sm text-primary hover:underline">
                  Back to login
                </a>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
