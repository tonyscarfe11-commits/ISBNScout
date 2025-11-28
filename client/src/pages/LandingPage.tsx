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
      title: "AI-Powered Photo Recognition",
      description: "Simply photograph any book cover and watch our advanced AI instantly extract the title, author, ISBN, and even assess the book's condition. No more manual typing - scan dozens of books in minutes, not hours. Perfect for scouting at car boot sales, charity shops, or bulk purchases.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Pricing",
      description: "Know exactly what a book is worth before you buy it. Our system pulls live pricing data from Amazon and eBay simultaneously, showing you current market values, recent sold prices, and demand trends. Make informed buying decisions and never overpay again.",
    },
    {
      icon: Sparkles,
      title: "AI Listing Optimization",
      description: "Our intelligent system generates SEO-optimized titles, compelling product descriptions, and targeted keywords tailored to each platform. Boost your visibility in search results and convert more browsers into buyers. The AI learns what sells and applies those insights to your listings.",
    },
    {
      icon: Zap,
      title: "Multi-Platform Quick Listing",
      description: "Post to Amazon and eBay simultaneously with a single click. The system auto-fills all required fields, formats descriptions correctly for each platform, and handles all technical requirements. Save hours on data entry and focus on sourcing more inventory.",
    },
    {
      icon: BarChart3,
      title: "Comprehensive Analytics",
      description: "Track every metric that matters: profit margins, inventory turnover, top-performing categories, and seasonal trends. Visual dashboards show your business performance at a glance. Export detailed reports for tax time or to identify your most profitable sourcing channels.",
    },
    {
      icon: Clock,
      title: "Offline Scouting Mode",
      description: "Scout anywhere, even without internet. Scan books at locations with poor signal, and the app queues your scans for later. When you're back online, all pricing data syncs automatically. Never miss a profitable find because of connectivity issues.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Full-Time Book Seller • £8K/month",
      content: "ISBNScout has completely transformed my book business. The AI photo recognition is incredibly accurate - I can scan an entire car boot sale in under an hour. I went from listing 50 books a week to over 200, and my monthly revenue tripled. The offline mode is a game-changer at charity shops with no signal.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Part-Time Reseller • Evenings & Weekends",
      content: "As someone with a full-time job, I don't have hours to spend on listings. The AI-generated descriptions are better than what I used to write myself, and they're done in seconds. I've increased my sell-through rate by 40% and now make an extra £1,500/month working just 10 hours a week.",
      rating: 5,
    },
    {
      name: "Emma Williams",
      role: "Professional Book Scout • 5 Years Experience",
      content: "I've tried every scouting app on the market, and ISBNScout is simply the best. The profit calculator accounts for all fees automatically, the pricing data is always current, and I love that it shows both Amazon and eBay prices side-by-side. My ROI has gone from 100% to 180% since switching. Worth every penny.",
      rating: 5,
    },
  ];

  const stats = [
    { value: "10K+", label: "Books Scanned Daily" },
    { value: "£2M+", label: "Revenue Generated" },
    { value: "500+", label: "Active Sellers" },
    { value: "99%", label: "Accuracy Rate" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-slate-800 sticky top-0 bg-slate-900 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-white">ISBNScout</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/subscription")} className="text-white hover:text-white hover:bg-slate-800">
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
                AI-Powered Book Scouting
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Scan. Analyze. List.
                <span className="text-primary"> Profit.</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                The smartest way to buy and sell books online. Powered by AI,
                built for serious sellers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => setLocation("/auth")} className="text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setLocation("/subscription")}>
                  View Pricing
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm">14-day free trial</span>
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
                      <div className="font-semibold">The Great Gatsby</div>
                      <div className="text-sm text-muted-foreground">F. Scott Fitzgerald</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Amazon Price</div>
                      <div className="text-xl font-bold text-green-600">£12.99</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">eBay Price</div>
                      <div className="text-xl font-bold text-blue-600">£11.50</div>
                    </div>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Estimated Profit</div>
                    <div className="text-2xl font-bold text-primary">£8.75</div>
                  </div>
                  <Button className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    List on Both Platforms
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Loved by book sellers worldwide
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-4">
              Ready to scale your book business?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of successful sellers using ISBNScout
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setLocation("/auth")}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/subscription")}>
                View Plans & Pricing
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
                The smartest way to buy and sell books online.
              </p>
              <p className="text-xs text-muted-foreground">
                Made in the UK for book sellers worldwide
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                <a href="mailto:hello@isbnscout.com" className="hover:text-foreground">
                  hello@isbnscout.com
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-foreground">Features</button></li>
                <li><button onClick={() => setLocation('/subscription')} className="hover:text-foreground">Pricing</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="hover:text-foreground">Testimonials</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setLocation('/about')} className="hover:text-foreground">About Us</button></li>
                <li><a href="mailto:hello@isbnscout.com" className="hover:text-foreground">Contact</a></li>
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
