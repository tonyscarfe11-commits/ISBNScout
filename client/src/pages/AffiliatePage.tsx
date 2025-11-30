import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Percent, Users, PoundSterling, CheckCircle2, Send } from "lucide-react";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";

export default function AffiliatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    socialMedia: "",
    audience: "",
    howDidYouHear: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/affiliates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you within 48 hours.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or email us directly at affiliates@isbnscout.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <CheckCircle2 className="h-20 w-20 text-teal-500 mx-auto" />
            <h1 className="text-3xl font-bold">Application Received!</h1>
            <p className="text-muted-foreground text-lg">
              Thanks for your interest in the ISBNScout Affiliate Program. We'll review your application and get back to you within 48 hours.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-slate-700 border-b border-slate-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="ISBN Scout" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">ISBNScout</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Become an Affiliate</h1>
          <p className="text-xl text-muted-foreground">
            Earn commission by referring book sellers to ISBNScout
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Percent className="h-10 w-10 text-teal-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">25% Commission</h3>
            <p className="text-muted-foreground">
              Earn 25% of the first month's subscription for every referral
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Users className="h-10 w-10 text-teal-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">30-Day Cookie</h3>
            <p className="text-muted-foreground">
              Get credit for referrals up to 30 days after they click your link
            </p>
          </Card>

          <Card className="p-6 text-center">
            <PoundSterling className="h-10 w-10 text-teal-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Monthly Payouts</h3>
            <p className="text-muted-foreground">
              Receive payments via PayPal on the 1st of each month
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Apply Now</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  data-testid="input-affiliate-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  data-testid="input-affiliate-email"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="website">Website or Blog (optional)</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourblog.com"
                  data-testid="input-affiliate-website"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialMedia">Social Media Handles</Label>
                <Input
                  id="socialMedia"
                  value={formData.socialMedia}
                  onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                  placeholder="@yourhandle on YouTube, Facebook, etc."
                  data-testid="input-affiliate-social"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Tell us about your audience *</Label>
              <Textarea
                id="audience"
                required
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="min-h-[100px]"
                placeholder="e.g., I run a Facebook group of 2,000 UK book sellers, or I have a YouTube channel about reselling..."
                data-testid="input-affiliate-audience"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="howDidYouHear">How did you hear about ISBNScout?</Label>
              <Input
                id="howDidYouHear"
                value={formData.howDidYouHear}
                onChange={(e) => setFormData({ ...formData, howDidYouHear: e.target.value })}
                placeholder="Facebook, Google, friend referral, etc."
                data-testid="input-affiliate-source"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              data-testid="button-submit-affiliate"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </Card>

        <div className="mt-12 text-center text-muted-foreground">
          <p>Questions? Email us at <a href="mailto:affiliates@isbnscout.com" className="text-teal-600 hover:underline">affiliates@isbnscout.com</a></p>
        </div>
      </main>
    </div>
  );
}
