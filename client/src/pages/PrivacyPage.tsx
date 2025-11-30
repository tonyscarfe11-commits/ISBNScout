import { useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";

export default function PrivacyPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Matching Landing Page */}
      <nav className="sticky top-0 bg-slate-800 border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")} 
            className="flex items-center gap-3 text-white hover:text-teal-400 transition-colors"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-5 w-5" />
            <img src={logoImage} alt="ISBN Scout" className="h-8 w-8" />
            <span className="text-lg font-bold">ISBNScout</span>
          </button>
          <Button 
            onClick={() => setLocation("/auth")}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            data-testid="button-header-trial"
          >
            Start Free Trial
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly to us, including your name, email address, and payment information when you create an account. We also collect data about your usage of ISBNScout, including books you scan, listings you create, and platform interactions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">3. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your personal information. All payment processing is handled by secure third-party providers (Stripe). We never store your full credit card details on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              ISBNScout integrates with Amazon (FBA & FBM) and eBay to provide listing services. When you connect these accounts, we access only the information necessary to create and manage your listings. We do not share your data with these platforms beyond what's required for the integration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to maintain your session, remember your preferences, and analyze how you use our service. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">7. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">8. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@isbnscout.com" className="text-teal-600 hover:text-teal-700 hover:underline">
                privacy@isbnscout.com
              </a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer - Matching Landing Page */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="ISBN Scout" className="h-6 w-6" />
              <span className="text-white font-semibold">ISBNScout</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <button onClick={() => setLocation("/")} className="hover:text-teal-400">Home</button>
              <button onClick={() => setLocation("/privacy")} className="text-teal-400">Privacy</button>
              <button onClick={() => setLocation("/terms")} className="hover:text-teal-400">Terms</button>
              <a href="mailto:support@isbnscout.com" className="hover:text-teal-400">Support</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-sm">
            <p>© 2025 ISBNScout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
