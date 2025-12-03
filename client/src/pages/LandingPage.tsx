import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Barcode, Camera, Eye, Check, Play, ChevronDown, Menu, X, Star, Wifi, WifiOff, Zap, Moon, Sun } from "lucide-react";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";
import demoVideo from "@assets/generated_videos/uk_book_scanning_app.mp4";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { CookieConsent } from "@/components/CookieConsent";

const REFERRAL_COOKIE_NAME = "isbn_ref";
const REFERRAL_COOKIE_DAYS = 30;

function setReferralCookie(affiliateId: string, referralCode: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + REFERRAL_COOKIE_DAYS);
  document.cookie = `${REFERRAL_COOKIE_NAME}=${affiliateId}:${referralCode};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getReferralCookie(): { affiliateId: string; referralCode: string } | null {
  const match = document.cookie.match(new RegExp(`(^| )${REFERRAL_COOKIE_NAME}=([^;]+)`));
  if (match) {
    const [affiliateId, referralCode] = match[2].split(':');
    return { affiliateId, referralCode };
  }
  return null;
}

const faqItems = [
  {
    question: "Does it work without WiFi or mobile data?",
    answer: "Yes, that's the core feature. ISBNScout is built offline-first. Scan books at charity shops or car-boot sales without any signal, then sync when you're back online.",
  },
  {
    question: "What platforms does it support?",
    answer: "Both Amazon MFN and eBay UK. You'll see profit forecasts for both platforms side-by-side, including all fees and Royal Mail postage costs.",
  },
  {
    question: "Is the AI spine recognition real?",
    answer: "Absolutely. AI spine recognition is ready for launch and currently in final testing. Photograph entire shelves without pulling books out—no other scouting app offers this.",
  },
];

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode && !getReferralCookie()) {
      fetch(`/api/affiliates/validate/${encodeURIComponent(refCode)}`)
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setReferralCookie(data.affiliateId, data.referralCode);
            
            fetch('/api/affiliates/track-click', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                referralCode: refCode,
                landingPage: window.location.pathname,
              }),
            }).catch(console.error);
            
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
          }
        })
        .catch(console.error);
    }
  }, []);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setVideoPlaying(true);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 bg-[#0f172a] border-b border-slate-600 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="ISBN Scout" className="h-8 w-8" />
              <span className="text-lg font-bold text-white">ISBNScout</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection("features")} className="text-slate-300 hover:text-white text-sm" data-testid="button-header-features">Features</button>
              <button onClick={() => scrollToSection("pricing")} className="text-slate-300 hover:text-white text-sm" data-testid="button-header-pricing">Pricing</button>
              <button onClick={() => scrollToSection("faq")} className="text-slate-300 hover:text-white text-sm" data-testid="button-header-faq">FAQ</button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="flex gap-2 ml-4">
                <Button 
                  variant="ghost"
                  onClick={() => setLocation("/auth")}
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                  data-testid="button-login"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => scrollToSection("pricing")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="button-header-trial"
                >
                  Start Free Trial
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 space-y-3">
              <button onClick={() => scrollToSection("features")} className="block w-full text-left text-slate-300 hover:text-white py-2" data-testid="button-mobile-features">Features</button>
              <button onClick={() => scrollToSection("pricing")} className="block w-full text-left text-slate-300 hover:text-white py-2" data-testid="button-mobile-pricing">Pricing</button>
              <button onClick={() => scrollToSection("faq")} className="block w-full text-left text-slate-300 hover:text-white py-2" data-testid="button-mobile-faq">FAQ</button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-2 w-full text-left text-slate-300 hover:text-white py-2"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  variant="ghost"
                  onClick={() => { setLocation("/auth"); setMobileMenuOpen(false); }}
                  className="text-slate-300 hover:text-white hover:bg-slate-800 justify-start"
                  data-testid="button-mobile-login"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => scrollToSection("pricing")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="button-mobile-trial"
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column */}
            <div className="space-y-6">
              <Badge className="bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-600 w-fit font-semibold">
                UK's Premier Book Scouting App
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-700 dark:text-slate-200 leading-tight">
                Know if it's profitable<br/><span className="text-emerald-600">before you buy.</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-lg">
                Scan books in seconds with barcode, cover, or AI spine recognition. See net profit for Amazon & eBay instantly—even without signal.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={() => scrollToSection("pricing")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="button-hero-trial"
                >
                  Start 14-Day Free Trial
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => scrollToSection("demo")}
                  className="gap-2"
                  data-testid="button-hero-demo"
                >
                  <Play className="h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                No credit card required. Cancel anytime.
              </p>
            </div>

            {/* Right Column - Product Demo Card */}
            <div>
              <Card className="bg-slate-700 border-slate-600 p-4 md:p-6 text-white">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="font-semibold text-sm">LIVE SCAN</span>
                    </div>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                      <WifiOff className="h-3 w-3 mr-1" />
                      OFFLINE
                    </Badge>
                  </div>

                  {/* Book Info */}
                  <div className="space-y-2 pb-3 border-b border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Best Candidate</div>
                    <div className="text-sm font-semibold">"Intro to Cognitive Science" – 3rd Ed.</div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-slate-700 border-slate-600 text-slate-300 text-xs">AI Spine</Badge>
                      <Badge variant="outline" className="bg-slate-700 border-slate-600 text-slate-300 text-xs">Charity shop – £2.50</Badge>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-700">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Net Profit</div>
                      <div className="text-2xl font-bold text-amber-500">£7.68</div>
                      <div className="text-xs text-slate-500 mt-0.5">Best: Amazon</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Sales Velocity</div>
                      <div className="text-sm font-semibold text-slate-300">10 sales / 30 days</div>
                    </div>
                  </div>

                  {/* Platform Comparison */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="text-slate-500 uppercase tracking-wide font-semibold">Amazon MFN</div>
                      <div className="space-y-1 pl-2 border-l border-slate-700">
                        <div className="flex justify-between text-slate-400">
                          <span>Price</span>
                          <span className="text-slate-300">£12.90</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Fees</span>
                          <span className="text-slate-300">-£2.72</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Your cost</span>
                          <span className="text-slate-300">-£2.50</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Postage</span>
                          <span className="text-green-400 text-xs">Buyer pays</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t border-slate-700 pt-1 text-amber-500">
                          <span>Net</span>
                          <span>£7.68</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-slate-500 uppercase tracking-wide font-semibold">eBay UK</div>
                      <div className="space-y-1 pl-2 border-l border-slate-700">
                        <div className="flex justify-between text-slate-400">
                          <span>Sold Avg</span>
                          <span className="text-slate-300">£11.50</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Fees</span>
                          <span className="text-slate-300">-£1.86</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Your cost</span>
                          <span className="text-slate-300">-£2.50</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Postage</span>
                          <span className="text-green-400 text-xs">Buyer pays</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t border-slate-700 pt-1 text-amber-500">
                          <span>Net</span>
                          <span>£7.14</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decision */}
                  <div className="pt-3 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs font-semibold text-green-400">Strong buy – high demand, good margin</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight Strip */}
      <section className="py-8 bg-emerald-600 border-y border-emerald-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center text-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-lg">
                <WifiOff className="h-7 w-7 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Works offline - scan anywhere, sync later</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-3">
              Three ways to identify books
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ISBNScout finds books in seconds—barcode, cover photo, or AI spine recognition. All work offline.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Barcode */}
            <Card className="p-6 hover-elevate">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-fit">
                  <Barcode className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">Barcode Scanner</h3>
                  <p className="text-sm text-muted-foreground">
                    Point and scan. Instant ISBN lookup with profit calculations. The fastest method for high-volume sessions.
                  </p>
                </div>
              </div>
            </Card>

            {/* Cover */}
            <Card className="p-6 hover-elevate">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-fit">
                  <Camera className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">Cover Recognition</h3>
                  <p className="text-sm text-muted-foreground">
                    Snap the front cover. AI extracts title, author, and edition—perfect for older books or damaged barcodes.
                  </p>
                </div>
              </div>
            </Card>

            {/* Spine */}
            <Card className="p-6 hover-elevate border-emerald-600 border-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-fit">
                    <Eye className="h-6 w-6 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-600 text-white text-xs">EXCLUSIVE</Badge>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">AI Spine Recognition</h3>
                  <p className="text-sm text-muted-foreground">
                    Photograph entire shelves. ISBNScout reads the spines for you. No other scouting app offers this.
                  </p>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </section>

      {/* Video Section */}
      <section id="demo" className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-3">
              See it in action
            </h2>
            <p className="text-muted-foreground">
              Watch how ISBNScout works in a real charity shop
            </p>
          </div>

          <div className="bg-slate-700 rounded-lg aspect-video relative overflow-hidden">
            <video
              ref={videoRef}
              src={demoVideo}
              className="w-full h-full object-cover"
              controls={videoPlaying}
              playsInline
              onEnded={() => setVideoPlaying(false)}
              data-testid="video-demo"
            />
            {!videoPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                onClick={handlePlayVideo}
              >
                <button 
                  className="p-6 bg-emerald-600 hover:bg-emerald-700 rounded-full transition-transform hover:scale-105"
                  data-testid="button-play-video"
                >
                  <Play className="h-10 w-10 text-white fill-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-3">
              Simple, honest pricing
            </h2>
            <p className="text-muted-foreground">
              14-day free trial. No credit card required. Cancel anytime.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">14-Day Money-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <Check className="h-5 w-5 text-slate-600 dark:text-slate-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <Check className="h-5 w-5 text-slate-600 dark:text-slate-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cancel Anytime</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Pro Plan */}
            <Card className="p-6 border-emerald-600 border-2 bg-emerald-50 dark:bg-emerald-950/30">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Pro</h3>
                  <Badge className="bg-emerald-600 text-white">POPULAR</Badge>
                </div>
                <p className="text-sm text-muted-foreground">For weekly sourcing in charity shops and car-boots.</p>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-700 dark:text-slate-200">£14.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">or £149/year (save 2 months)</p>
                </div>
                <ul className="space-y-2">
                  {["Unlimited scans", "Offline mode", "Barcode, cover & AI spine", "Amazon + eBay profit calculator", "Scan history"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  size="lg" 
                  onClick={() => setLocation("/auth")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="button-pricing-pro"
                >
                  Start Free Trial
                </Button>
              </div>
            </Card>

            {/* Elite Plan */}
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Elite</h3>
                <p className="text-sm text-muted-foreground">For high-volume sellers needing advanced tools.</p>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-700 dark:text-slate-200">£19.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">or £199/year (save 2 months)</p>
                </div>
                <ul className="space-y-2">
                  {["Everything in Pro", "Buy/Don't Buy triggers", "Custom profit rules", "CSV export", "Multi-device access"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  size="lg" 
                  onClick={() => setLocation("/auth")}
                  className="w-full"
                  data-testid="button-pricing-elite"
                >
                  Start Free Trial
                </Button>
              </div>
            </Card>
          </div>

          {/* Security Badge */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-2 px-8 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Secure Payments</span>
                <Badge variant="secondary" className="text-xs">Stripe Verified</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                256-bit SSL encryption • PCI compliant
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-3">
              Common questions
            </h2>
          </div>
          
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index}>
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full text-left p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-600 transition-colors flex items-center justify-between gap-4"
                  data-testid={`button-faq-${index}`}
                >
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200">{item.question}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-emerald-600 flex-shrink-0 transition-transform ${
                      expandedIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedIndex === index && (
                  <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-[#0f172a] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to find profitable books faster?</h2>
          <p className="text-lg text-slate-300">
            Scan shelves, see net profit, and make smarter buy decisions—even without signal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg"
              onClick={() => scrollToSection("pricing")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="button-cta-trial"
            >
              Start 14-Day Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("demo")}
              className="border-slate-600 text-white hover:bg-slate-800 gap-2"
              data-testid="button-cta-demo"
            >
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-slate-400">
            No credit card required. Built for UK book sellers.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="ISBN Scout" className="h-6 w-6" />
              <span className="text-white font-semibold">ISBNScout</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
              <button onClick={() => scrollToSection("features")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-features">Features</button>
              <button onClick={() => scrollToSection("pricing")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-pricing">Pricing</button>
              <button onClick={() => scrollToSection("faq")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-faq">FAQ</button>
              <button onClick={() => setLocation("/blog")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-blog">Blog</button>
              <a href="mailto:support@isbnscout.com" className="hover:text-emerald-400 transition-colors">Support</a>
              <button onClick={() => setLocation("/affiliates")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-affiliates">Affiliates</button>
              <button onClick={() => setLocation("/privacy")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-privacy">Privacy</button>
              <button onClick={() => setLocation("/terms")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-terms">Terms</button>
              <button onClick={() => setLocation("/cookies")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-cookies">Cookies</button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-600 text-center text-base text-slate-300">
            <p>© 2025 ISBNScout. All rights reserved. LillyWhiteTech</p>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
