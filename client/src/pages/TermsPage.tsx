import { useLocation } from "wouter";
import { useEffect } from "react";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ISBNScout</span>
            </div>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using ISBNScout, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ISBNScout provides tools for book sellers to scan, price, and list books on various e-commerce platforms including Amazon (FBA & FBM) and eBay. We offer AI-powered features including photo recognition, keyword optimization, and automated listing creation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. Account Registration</h2>
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
            <h2 className="text-2xl font-bold mb-3">4. Subscription and Billing</h2>
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
            <h2 className="text-2xl font-bold mb-3">5. Platform Integration</h2>
            <p className="text-muted-foreground leading-relaxed">
              When connecting your Amazon (FBA or FBM) or eBay accounts, you authorize ISBNScout to access these platforms on your behalf to create and manage listings. You remain responsible for all listings created through our service and must comply with each platform's terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">6. Acceptable Use</h2>
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
            <h2 className="text-2xl font-bold mb-3">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The ISBNScout service, including its original content, features, and functionality, is owned by ISBNScout and protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              ISBNScout is provided "as is" without warranties of any kind. We are not responsible for any losses, including lost profits, that result from using our service. Our AI-generated content should be reviewed before use, and pricing data should be verified independently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by the laws of England and Wales, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">12. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@isbnscout.com" className="text-primary hover:underline">
                legal@isbnscout.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
