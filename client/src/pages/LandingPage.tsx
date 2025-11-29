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
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Smartphone,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Premium Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                ISBNScout
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection("features")} className="text-slate-700 hover:text-teal-600 font-medium transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection("pricing")} className="text-slate-700 hover:text-teal-600 font-medium transition-colors">
                Pricing
              </button>
              <button onClick={() => scrollToSection("about")} className="text-slate-700 hover:text-teal-600 font-medium transition-colors">
                About
              </button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setLocation("/auth")} className="text-slate-700 hover:text-teal-600">
                Sign In
              </Button>
              <Button onClick={() => setLocation("/auth")} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-md">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Professional */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-white to-blue-50/30" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-teal-100 text-teal-700 border-teal-200">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              Professional Book Scouting Platform
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Discover Profitable Books
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                Anywhere, Anytime
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              The UK's most advanced book scouting platform. Scan ISBNs, analyze profitability instantly,
              and make informed buying decisions—even without an internet connection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => setLocation("/auth")}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Start Your Free 14-Day Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("features")}
                className="px-8 py-6 text-lg border-2 border-slate-300 hover:border-teal-500 hover:text-teal-600"
              >
                See How It Works
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <span>Full offline access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Professional Grid */}
      <section id="features" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need to Scout Smarter
            </h2>
            <p className="text-xl text-slate-600">
              Purpose-built tools for professional book scouts and resellers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-teal-200 group">
              <div className="h-14 w-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Camera className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Lightning-Fast Scanning
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Scan barcodes instantly with your phone camera. Get real-time pricing, profit margins,
                and sales rank data in under 2 seconds.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-teal-200 group">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                AI-Powered Recognition
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Advanced AI reads book covers and spines automatically. Perfect for books with
                damaged barcodes or scanning entire shelves at once.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-teal-200 group">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <WifiOff className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Fully Offline Mode
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Scout anywhere without signal. Local database with cached pricing data automatically
                syncs when you're back online.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-teal-200 group">
              <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Accurate Profit Calculator
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Real profit calculations including Amazon/eBay fees, Royal Mail postage, and
                packaging costs. Know your true margins before buying.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-teal-200 group">
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Advanced Analytics
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Track your scouting performance with detailed reports. Export to CSV for accounting
                and tax purposes. Optimize your buying strategy.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-teal-200 group">
              <div className="h-14 w-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Mobile-First Design
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Built specifically for on-the-go scouting. Works seamlessly on any device with
                a responsive, intuitive interface.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Start with a 14-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 border-2 border-slate-200 hover:shadow-lg transition-all">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">£19</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Unlimited book scans</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Barcode & AI scanning</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Offline mode</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Basic analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">CSV export</span>
                </li>
              </ul>
              <Button onClick={() => setLocation("/auth")} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                Start Free Trial
              </Button>
            </Card>

            <Card className="p-8 border-2 border-teal-500 hover:shadow-xl transition-all relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Elite</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">£35</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">Everything in Pro, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Advanced analytics & reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Inventory management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Automated repricing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Priority support</span>
                </li>
              </ul>
              <Button onClick={() => setLocation("/auth")} className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white">
                Start Free Trial
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Book Scouting?
          </h2>
          <p className="text-xl text-teal-50 mb-8">
            Join professional book scouts who are already finding more profitable books with ISBNScout.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/auth")}
            className="bg-white text-teal-600 hover:bg-slate-50 px-8 py-6 text-lg shadow-xl"
          >
            Start Your Free 14-Day Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ISBNScout</span>
              </div>
              <p className="text-sm">
                Professional book scouting platform for the modern reseller.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection("features")} className="hover:text-teal-400 transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection("pricing")} className="hover:text-teal-400 transition-colors">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setLocation("/about")} className="hover:text-teal-400 transition-colors">About</button></li>
                <li><button onClick={() => setLocation("/blog")} className="hover:text-teal-400 transition-colors">Blog</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setLocation("/privacy")} className="hover:text-teal-400 transition-colors">Privacy</button></li>
                <li><button onClick={() => setLocation("/terms")} className="hover:text-teal-400 transition-colors">Terms</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2025 ISBNScout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
