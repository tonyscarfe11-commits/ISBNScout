import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BrandText } from "@/components/icons";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send reset email");
      }

      setEmailSent(true);
      toast({
        title: "Reset email sent",
        description: "If your email is registered, you'll receive a password reset link shortly",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
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
            Reset your password
          </p>
        </div>

        <Card className="p-8 card-elevated">
          {!emailSent ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
                <p className="text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                <Mail className="h-12 w-12 mx-auto mb-2 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                <p className="text-muted-foreground">
                  If your email is registered, you'll receive a password reset link shortly.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth">
              <a className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </a>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
