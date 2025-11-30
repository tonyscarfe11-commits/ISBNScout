import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  BookOpen,
  Camera,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  Wifi,
  WifiOff,
  ScanLine,
} from "lucide-react";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: ScanLine,
      title: "Scan Any Book Spine",
      description: "Point your phone at a shelf. Our AI reads spines instantly. The only app that can do this.",
    },
    {
      icon: Camera,
      title: "Cover & Spine AI",
      description: "Can't see the spine clearly? Photograph the cover. AI identifies ISBNs, titles, and authors instantly.",
    },
    {
      icon: TrendingUp,
      title: "Real Sales Velocity",
      description: "Know exactly how fast books sell. See Amazon BSR data. Only scout books worth your time.",
    },
    {
      icon: WifiOff,
      title: "Works Without Signal",
      description: "Car boots, charity shops, friend's houses – scout anywhere offline. Auto-syncs when online.",
    },
    {
      icon: BarChart3,
      title: "Quick Profit Calculator",
      description: "See your profit margin instantly. Know your costs, market price, and profit before you buy.",
    },
    {
      icon: Zap,
      title: "Lightning Fast Workflow",
      description: "Scan → See profitability → Make decision. One-handed operation. Built for speed.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Car Boot & Charity Shop Scout",
      content: "Spine scanning is a game-changer. I used to manually check every ISBN. Now I scan shelves in seconds.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Independent Book Scout",
      content: "Finally an app that works offline in the actual places I scout. No more network anxiety.",
      rating: 5,
    },
    {
      name: "Emma Williams",
      role: "Full-Time Scouter",
      content: "Knowing real sales velocity before I buy means I don't waste time on books that won't move.",
      rating: 5,
    },
  ];

  const stats = [
    { value: "Scan", label: "Book Spines Instantly" },
    { value: "Check", label: "Profitability in Seconds" },
    { value: "Decide", label: "Before You Buy" },
    { value: "Offline", label: "Works Everywhere" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="ISBN Scout" className="h-10 w-10" />
            <span className="text-xl font-bold text-foreground">ISBN Scout</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/subscription")}
              data-testid="link-pricing"
            >
              Pricing
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/auth")}
              data-testid="link-login"
            >
              Login
            </Button>
            <Button 
              onClick={() => setLocation("/auth")}
              data-testid="button-start-trial"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-muted" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered Book Scouting
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Scout smarter,{" "}
              <span className="text-primary">offline</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI scans book spines instantly. Check profitability with real sales data. 
              Works in car boots, charity shops, anywhere – no internet required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setLocation("/auth")}
                className="text-lg px-8"
                data-testid="button-get-started"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setLocation("/app/scan")}
                className="text-lg px-8"
                data-testid="button-try-demo"
              >
                Try Demo
              </Button>
            </div>

            <div className="pt-8">
              <img 
                src={logoImage} 
                alt="ISBN Scout App" 
                className="mx-auto h-32 w-32 drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              The fastest scouting workflow
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Designed for UK book scouts. Offline-first. AI-powered. Lightning fast.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Trusted by book sellers
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-muted">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Start scouting smarter today
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Free trial. No credit card needed. Works offline from day one.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setLocation("/auth")}
            className="text-lg px-8"
            data-testid="button-start-trial-bottom"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <footer className="py-12 bg-foreground text-background/70">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoImage} alt="ISBN Scout" className="h-8 w-8" />
                <span className="text-background font-bold">ISBN Scout</span>
              </div>
              <p className="text-sm">
                The book scouting app that works without signal.
              </p>
            </div>
            <div>
              <h4 className="text-background font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setLocation("/subscription")} className="hover:text-background transition-colors">Pricing</button></li>
                <li><button onClick={() => setLocation("/app/scan")} className="hover:text-background transition-colors">Demo</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-background font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setLocation("/blog")} className="hover:text-background transition-colors">Blog</button></li>
                <li><button onClick={() => setLocation("/about")} className="hover:text-background transition-colors">About</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-background font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setLocation("/privacy")} className="hover:text-background transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setLocation("/terms")} className="hover:text-background transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-12 pt-8 text-center text-sm">
            <p>2024 ISBN Scout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
