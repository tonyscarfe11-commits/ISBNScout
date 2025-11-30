import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Barcode, Camera, Eye, Check, Play, ChevronDown, Menu, X, Star, Wifi, WifiOff, Zap } from "lucide-react";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";
import demoVideo from "@assets/generated_videos/uk_book_scanning_app.mp4";
import { useState, useRef, useEffect } from "react";

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
    question: "Is the AI spine recognition real?",
    answer: "Absolutely. AI spine recognition is ready for launch and currently in final testing. Photograph entire shelves without pulling books out—no other scouting app offers this.",
  },
  {
    question: "What platforms does it support?",
    answer: "Both Amazon MFN and eBay UK. You'll see profit forecasts for both platforms side-by-side, including all fees and Royal Mail postage costs.",
  },
  {
    question: "Who is ISBNScout for?",
    answer: "UK book resellers: weekend charity shop hunters, professional pickers, anyone who wants to make smarter buy/don't-buy decisions at the point of sale.",
  },
];

const testimonials = [
  {
    quote: "Finally, an app that works in charity shop basements. I've doubled my sourcing speed.",
    name: "Mark T.",
    role: "Full-time book seller, Manchester",
    rating: 5,
  },
  {
    quote: "The spine recognition is a game-changer. I can scan an entire shelf in seconds instead of pulling every book out.",
    name: "Sarah K.",
    role: "Weekend reseller, Bristol",
    rating: 5,
  },
  {
    quote: "Accurate profit calculations that actually account for all the fees. No more nasty surprises.",
    name: "James P.",
    role: "Amazon seller, London",
    rating: 5,
  },
];

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      <nav className="sticky top-0 bg-slate-900 border-b border-slate-800 z-50">
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
                  className="bg-teal-600 hover:bg-teal-700 text-white"
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
                  className="bg-teal-600 hover:bg-teal-700 text-white"
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
              <Badge className="bg-teal-100 text-teal-800 border-teal-200 w-fit">
                UK BOOK SCOUTING APP
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Scan books.<br/><span className="text-teal-600">Even offline.</span>
              </h1>
              
              <p className="text-base md:text-lg text-muted-foreground max-w-lg">
                Find profitable books in seconds with barcode, cover, and AI spine recognition. Built for charity shops, car-boots, and anywhere signal drops.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  onClick={() => scrollToSection("pricing")}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
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
              <Card className="bg-slate-900 border-slate-800 p-4 md:p-6 text-white">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse" />
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
                      <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 text-xs">AI Spine</Badge>
                      <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 text-xs">Charity shop – £2.50</Badge>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-700">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Net Profit</div>
                      <div className="text-2xl font-bold text-teal-400">£7.90</div>
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
                          <span>Postage</span>
                          <span className="text-slate-300">-£2.80</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t border-slate-700 pt-1 text-teal-400">
                          <span>Net</span>
                          <span>£4.88</span>
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
                          <span>Postage</span>
                          <span className="text-slate-300">-£2.80</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t border-slate-700 pt-1 text-teal-400">
                          <span>Net</span>
                          <span>£4.34</span>
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

      {/* Social Proof Strip */}
      <section className="py-6 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-900">M</div>
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-900">S</div>
                <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-900">J</div>
              </div>
              <span className="text-sm text-muted-foreground">Trusted by UK book scouts</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-muted-foreground ml-1">4.9 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-teal-600" />
              <span className="text-sm text-muted-foreground">Works offline</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
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
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                  <Barcode className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Barcode Scanner</h3>
                  <p className="text-sm text-muted-foreground">
                    Point and scan. Instant ISBN lookup with profit calculations. The fastest method for high-volume sessions.
                  </p>
                </div>
              </div>
            </Card>

            {/* Cover */}
            <Card className="p-6 hover-elevate">
              <div className="space-y-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                  <Camera className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Cover Recognition</h3>
                  <p className="text-sm text-muted-foreground">
                    Snap the front cover. AI extracts title, author, and edition—perfect for older books or damaged barcodes.
                  </p>
                </div>
              </div>
            </Card>

            {/* Spine */}
            <Card className="p-6 hover-elevate border-teal-600 border-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                    <Eye className="h-6 w-6 text-teal-600" />
                  </div>
                  <Badge className="bg-teal-600 text-white text-xs">EXCLUSIVE</Badge>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">AI Spine Recognition</h3>
                  <p className="text-sm text-muted-foreground">
                    Photograph entire shelves. ISBNScout reads the spines for you. No other scouting app offers this.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Offline Highlight */}
          <div className="mt-12 p-6 bg-slate-900 rounded-lg text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-600/20 rounded-lg">
                  <Wifi className="h-8 w-8 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Works when your signal doesn't</h3>
                  <p className="text-sm text-slate-400">Scan hundreds of books offline. Everything syncs when you're back online.</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-teal-400">100%</div>
                  <div className="text-xs text-slate-400">Offline capable</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-teal-400">&lt;1s</div>
                  <div className="text-xs text-slate-400">Scan time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-teal-400">UK</div>
                  <div className="text-xs text-slate-400">Built for</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              What UK sellers are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section id="demo" className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              See it in action
            </h2>
            <p className="text-muted-foreground">
              Watch how ISBNScout works in a real charity shop
            </p>
          </div>

          <div className="bg-slate-900 rounded-lg aspect-video relative overflow-hidden">
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
                  className="p-6 bg-teal-600 hover:bg-teal-700 rounded-full transition-transform hover:scale-105"
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
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Simple, honest pricing
            </h2>
            <p className="text-muted-foreground">
              14-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Pro Plan */}
            <Card className="p-6 border-teal-600 border-2 bg-teal-50 dark:bg-teal-950/30">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">Pro</h3>
                  <Badge className="bg-teal-600 text-white">POPULAR</Badge>
                </div>
                <p className="text-sm text-muted-foreground">For weekly sourcing in charity shops and car-boots.</p>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">£14.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">or £149/year (save 2 months)</p>
                </div>
                <ul className="space-y-2">
                  {["Unlimited scans", "Offline mode", "Barcode, cover & AI spine", "Amazon + eBay profit calculator", "Scan history"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-teal-600 shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  size="lg" 
                  onClick={() => setLocation("/auth")}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  data-testid="button-pricing-pro"
                >
                  Start Free Trial
                </Button>
              </div>
            </Card>

            {/* Elite Plan */}
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Elite</h3>
                <p className="text-sm text-muted-foreground">For high-volume sellers needing advanced tools.</p>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">£19.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">or £199/year (save 2 months)</p>
                </div>
                <ul className="space-y-2">
                  {["Everything in Pro", "Buy/Don't Buy triggers", "Custom profit rules", "CSV export", "Multi-device access"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-teal-600 shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
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
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Common questions
            </h2>
          </div>
          
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index}>
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full text-left p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-600 dark:hover:border-teal-600 transition-colors flex items-center justify-between gap-4"
                  data-testid={`button-faq-${index}`}
                >
                  <h3 className="font-semibold text-foreground">{item.question}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-teal-600 flex-shrink-0 transition-transform ${
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
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to find profitable books faster?</h2>
          <p className="text-lg text-slate-300">
            Scan shelves, see net profit, and make smarter buy decisions—even without signal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg"
              onClick={() => scrollToSection("pricing")}
              className="bg-teal-600 hover:bg-teal-700 text-white"
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
      <footer className="bg-slate-950 text-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="ISBN Scout" className="h-6 w-6" />
              <span className="text-white font-semibold">ISBNScout</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
              <button onClick={() => scrollToSection("features")} className="hover:text-teal-400 transition-colors" data-testid="button-footer-features">Features</button>
              <button onClick={() => scrollToSection("pricing")} className="hover:text-teal-400 transition-colors" data-testid="button-footer-pricing">Pricing</button>
              <button onClick={() => scrollToSection("faq")} className="hover:text-teal-400 transition-colors" data-testid="button-footer-faq">FAQ</button>
              <a href="mailto:support@isbnscout.com" className="hover:text-teal-400 transition-colors">Support</a>
              <button onClick={() => setLocation("/affiliates")} className="hover:text-teal-400 transition-colors" data-testid="button-footer-affiliates">Affiliates</button>
              <button onClick={() => setLocation("/privacy")} className="hover:text-teal-400 transition-colors" data-testid="button-footer-privacy">Privacy</button>
              <button onClick={() => setLocation("/terms")} className="hover:text-teal-400 transition-colors" data-testid="button-footer-terms">Terms</button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700 text-center text-base text-slate-300">
            <p>© 2025 ISBNScout. All rights reserved. LillyWhiteTech</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
