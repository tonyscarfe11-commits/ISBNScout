import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BrandText } from "@/components/icons";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const token = searchParams.get("token");
  const { toast } = useToast();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending");
  const [userEmail, setUserEmail] = useState("");

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  // Get user email from session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.user.email);

          // If already verified, redirect to app
          if (data.user.emailVerified === 'true') {
            setLocation("/app");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleVerify = async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationToken }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Verification failed");
      }

      setVerificationStatus("success");
      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified. Redirecting...",
      });

      // Redirect to app after 2 seconds
      setTimeout(() => {
        setLocation("/app");
      }, 2000);
    } catch (error: any) {
      setVerificationStatus("error");
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired verification link",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!userEmail) {
      toast({
        title: "Email not found",
        description: "Please log in again",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to resend email");
      }

      toast({
        title: "Verification email sent",
        description: `Check your inbox at ${userEmail}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend",
        description: error.message || "Could not resend verification email",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <BrandText className="h-8" />
          </div>

          {/* Icon based on status */}
          <div className="flex justify-center">
            {isVerifying ? (
              <Loader2 className="h-16 w-16 text-emerald-600 animate-spin" />
            ) : verificationStatus === "success" ? (
              <CheckCircle2 className="h-16 w-16 text-emerald-600" />
            ) : verificationStatus === "error" ? (
              <AlertCircle className="h-16 w-16 text-red-600" />
            ) : (
              <Mail className="h-16 w-16 text-emerald-600" />
            )}
          </div>

          {/* Message based on status */}
          {isVerifying ? (
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Verifying your email...
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Please wait while we verify your email address.
              </p>
            </div>
          ) : verificationStatus === "success" ? (
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Email Verified!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Your email has been successfully verified. You can now access all features.
              </p>
            </div>
          ) : verificationStatus === "error" ? (
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Verification Failed
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                The verification link is invalid or has expired. Please request a new verification email.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Verify Your Email
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                We've sent a verification email to <strong>{userEmail}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Please check your inbox and click the verification link to access your account.
              </p>
            </div>
          )}

          {/* Action buttons */}
          {!isVerifying && verificationStatus !== "success" && (
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
                variant="default"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                onClick={() => setLocation("/auth")}
                variant="outline"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          )}

          {/* Help text */}
          <div className="pt-4 border-t text-sm text-slate-500 dark:text-slate-400">
            <p>
              Didn't receive the email? Check your spam folder or click the resend button above.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
