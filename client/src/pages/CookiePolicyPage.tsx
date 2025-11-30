import { useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";

export default function CookiePolicyPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
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
        <h1 className="text-4xl font-bold mb-4 text-foreground">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">1. What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences, login status, and other information to improve your browsing experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">2. How We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              ISBNScout uses cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly, including maintaining your login session and security tokens.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences, such as dark/light mode and language preferences.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website so we can improve the user experience.</li>
              <li><strong>Affiliate Tracking Cookies:</strong> Track referrals from our affiliate partners to ensure they receive proper credit for new subscriptions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">3. Types of Cookies We Use</h2>
            
            <div className="space-y-4 mt-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Session Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  These are temporary cookies that expire when you close your browser. We use these to maintain your login session while you use ISBNScout.
                </p>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Persistent Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  These cookies remain on your device for a set period. We use these to remember your preferences and for affiliate tracking (30-day duration).
                </p>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Third-Party Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  Some cookies are placed by third-party services we use, such as Stripe for payment processing. These are governed by the respective third party's privacy policy.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">4. Specific Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-muted-foreground mt-4">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-2 font-semibold text-foreground">Cookie Name</th>
                    <th className="text-left py-2 font-semibold text-foreground">Purpose</th>
                    <th className="text-left py-2 font-semibold text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-muted/50">
                    <td className="py-2">connect.sid</td>
                    <td className="py-2">Session authentication</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="py-2">isbn_ref</td>
                    <td className="py-2">Affiliate referral tracking</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="py-2">theme</td>
                    <td className="py-2">Dark/light mode preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">5. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Browser Settings:</strong> Most browsers allow you to refuse cookies or delete existing cookies. Check your browser's help section for instructions.</li>
              <li><strong>Opt-Out:</strong> You can opt out of analytics cookies while still using our essential services.</li>
              <li><strong>Private Browsing:</strong> Using private/incognito mode will prevent cookies from being stored after your session ends.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Please note that disabling essential cookies may affect the functionality of ISBNScout, including your ability to log in and use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">6. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. We will notify you of any significant changes by posting a notice on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-foreground">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about our use of cookies, please contact us at{" "}
              <a href="mailto:privacy@isbnscout.com" className="text-teal-600 hover:text-teal-700 hover:underline">
                privacy@isbnscout.com
              </a>
            </p>
          </section>
        </div>
      </div>

      <footer className="bg-slate-700 text-slate-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="ISBN Scout" className="h-6 w-6" />
              <span className="text-white font-semibold">ISBNScout</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <button onClick={() => setLocation("/")} className="hover:text-white transition-colors" data-testid="button-footer-home">Home</button>
              <button onClick={() => setLocation("/privacy")} className="hover:text-white transition-colors" data-testid="button-footer-privacy">Privacy</button>
              <button onClick={() => setLocation("/terms")} className="hover:text-white transition-colors" data-testid="button-footer-terms">Terms</button>
              <button onClick={() => setLocation("/cookies")} className="text-white font-medium" data-testid="button-footer-cookies">Cookies</button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-sm">
            <p>© 2025 ISBNScout. All rights reserved. LillyWhiteTech</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
