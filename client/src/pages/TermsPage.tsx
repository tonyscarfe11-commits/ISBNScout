import { useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";

export default function TermsPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Matching Landing Page */}
      <nav className="sticky top-0 bg-slate-700 border-b border-slate-600 z-50">
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
        <h1 className="text-4xl font-bold mb-4 text-slate-700 dark:text-slate-200">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using ISBNScout, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ISBNScout provides tools for book sellers to scan, price, and list books on various e-commerce platforms including Amazon (FBA & FBM) and eBay. We offer AI-powered features including photo recognition, keyword optimization, and automated listing creation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">3. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To use ISBNScout, you must:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password and account</li>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Not use the service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">4. Subscription and Billing</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Paid subscriptions are billed monthly or annually in advance. You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide current and accurate billing information</li>
              <li>Authorize us to charge your payment method</li>
              <li>Pay all fees on time</li>
              <li>Cancel before your next billing date to avoid charges</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We offer a 14-day money-back guarantee for new subscriptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">5. Platform Integration</h2>
            <p className="text-muted-foreground leading-relaxed">
              When connecting your Amazon (FBA or FBM) or eBay accounts, you authorize ISBNScout to access these platforms on your behalf to create and manage listings. You remain responsible for all listings created through our service and must comply with each platform's terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">6. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Share your account with others</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Use the service to violate any laws or regulations</li>
              <li>Abuse, harass, or harm another person through the service</li>
              <li>Use automated means to access the service beyond our API</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The ISBNScout service, including its original content, features, and functionality, is owned by ISBNScout and protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              ISBNScout is provided "as is" without warranties of any kind. We are not responsible for any losses, including lost profits, that result from using our service. Our AI-generated content should be reviewed before use, and pricing data should be verified independently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by the laws of England and Wales, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">12. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@isbnscout.com" className="text-teal-600 hover:text-teal-700 hover:underline">
                legal@isbnscout.com
              </a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer - Matching Landing Page */}
      <footer className="bg-slate-700 text-slate-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="ISBN Scout" className="h-6 w-6" />
              <span className="text-white font-semibold">ISBNScout</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <button onClick={() => setLocation("/")} className="hover:text-teal-400">Home</button>
              <button onClick={() => setLocation("/privacy")} className="hover:text-teal-400">Privacy</button>
              <button onClick={() => setLocation("/terms")} className="text-teal-400">Terms</button>
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
