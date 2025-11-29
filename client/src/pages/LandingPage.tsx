import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  BookOpen,
  Camera,
  TrendingUp,
  Sparkles,
  Zap,
  Shield,
  Clock,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      icon: Camera,
      title: "Barcode Scanner",
      description: "Point. Scan. Decide. Instant ISBN detection with your phone camera. Fast, accurate, and works in low light. Get pricing and profit calculations in under 2 seconds.",
    },
    {
      icon: Sparkles,
      title: "AI Cover Recognition",
      description: "Just take a photo. Our AI extracts title, author, and ISBN from book covers automatically. No more typing – perfect for books with damaged or missing barcodes.",
    },
    {
      icon: BookOpen,
      title: "AI Spine Recognition",
      description: "Scan the whole shelf. Point your camera at a bookshelf and our AI reads every spine at once. Find profitable books 10x faster without pulling each one off the shelf.",
    },
    {
      icon: Clock,
      title: "Offline-First Engine",
      description: "Scout anywhere, even with zero signal. SQLite storage with local profit calculations using cached pricing. Auto-sync to cloud when connection restores. Never miss a profitable find.",
    },
    {
      icon: TrendingUp,
      title: "Real Profit Calculator",
      description: "See actual profit after Amazon/eBay fees, Royal Mail postage, and Evri costs. Includes sales velocity data so you know what sells fast. Make data-driven buying decisions.",
    },
    {
      icon: BarChart3,
      title: "Export & Analytics",
      description: "Export your scan history to CSV for record-keeping and tax purposes. Track your scouting performance with detailed stats: scans per day, profit margins, and top-performing categories.",
    },
  ];


  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-slate-800 sticky top-0 bg-slate-900 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/isbnscout-icon-transparent.png" alt="ISBNScout" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">ISBNScout</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => scrollToSection("pricing")} className="text-white hover:text-white hover:bg-slate-800">
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/auth")} className="text-white hover:text-white hover:bg-slate-800">
              Login
            </Button>
            <Button onClick={() => setLocation("/auth")}>
              Start Free Trial
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="w-fit">
                <Sparkles className="h-3 w-3 mr-1" />
                Book scouting, upgraded
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Scan books.
                <span className="text-primary"> Even offline.</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                ISBNScout helps UK book resellers find profitable books in seconds
                with barcode, cover, and AI spine recognition. Built for charity shops,
                car-boot sales, and anywhere signal drops.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => setLocation("/auth")} className="text-lg">
                  Start 14-Day Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollToSection("demo")}>
                  Watch 30s Demo
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm">Cancel anytime</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 backdrop-blur">
                <div className="bg-background rounded-lg shadow-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Introduction to Cognitive Science</div>
                      <div className="text-sm text-muted-foreground">3rd Edition</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Amazon Used</div>
                      <div className="text-xl font-bold text-green-600">£12.99</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">eBay Sold Avg</div>
                      <div className="text-xl font-bold text-blue-600">£11.50</div>
                    </div>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Net Profit (after fees & postage)</div>
                    <div className="text-2xl font-bold text-primary">£7.90</div>
                    <div className="text-xs text-muted-foreground mt-1">18 sales / 30 days</div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                    <div className="text-sm font-semibold text-green-600">Strong buy – high demand</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-20 bg-muted/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              See It In Action
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Watch ISBNScout in action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how book sellers scan, price, and list books in under 30 seconds
            </p>
          </div>
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Placeholder for demo video - replace with actual video embed when available */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  <Camera className="h-10 w-10 text-primary" />
                </div>
                <p className="text-muted-foreground text-lg">
                  30s demo video coming soon
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Shelf scanning → spine recognition → profit preview → buy decision
                </p>
              </div>
            </div>
            {/* Uncomment when video is ready:
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
              title="ISBNScout 30s Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for book sellers and scouts
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              14-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pro Plan */}
            <Card className="relative p-8 border-primary shadow-lg">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">Pro</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Perfect for UK sellers sourcing weekly in charity shops
              </p>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">£14.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  or £149/year (save ~2 months)
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited scans",
                  "Offline mode",
                  "Barcode, cover & AI spine recognition",
                  "Amazon + eBay UK profit calculator",
                  "Royal Mail & Evri postage estimates",
                  "Scan history",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="w-full" onClick={() => setLocation("/auth")}>
                Start 14-Day Free Trial
              </Button>
            </Card>

            {/* Elite Plan */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Elite</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                For professional scouts who need advanced automation and analytics
              </p>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">£19.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  or £199/year (save ~2½ months)
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Pro",
                  "Buy / Don't Buy triggers",
                  "Custom profit rules",
                  "CSV export",
                  "Multi-device access",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="outline" className="w-full" onClick={() => setLocation("/auth")}>
                Start 14-Day Free Trial
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-4">
              Ready to find profitable books faster?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of book scouts using ISBNScout
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setLocation("/auth")}>
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection("demo")}>
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold">ISBNScout</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Scan books. Even offline.
              </p>
              <p className="text-xs text-muted-foreground">
                Made in the UK for book sellers worldwide
              </p>
              <div className="mt-3 text-xs text-muted-foreground space-y-1">
                <div><a href="mailto:support@isbnscout.com" className="hover:text-foreground">support@isbnscout.com</a></div>
                <div><a href="mailto:contact@isbnscout.com" className="hover:text-foreground">contact@isbnscout.com</a></div>
                <div><a href="mailto:info@isbnscout.com" className="hover:text-foreground">info@isbnscout.com</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-foreground">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-foreground">Pricing</button></li>
                <li><button onClick={() => scrollToSection('demo')} className="hover:text-foreground">Demo</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setLocation('/about')} className="hover:text-foreground">About Us</button></li>
                <li><a href="mailto:contact@isbnscout.com" className="hover:text-foreground">Contact</a></li>
                <li><button onClick={() => setLocation('/blog')} className="hover:text-foreground">Blog</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setLocation('/privacy')} className="hover:text-foreground">Privacy Policy</button></li>
                <li><button onClick={() => setLocation('/terms')} className="hover:text-foreground">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 ISBNScout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
