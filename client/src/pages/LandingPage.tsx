import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Barcode, Camera, Eye, Check, Play, Zap, Crown } from "lucide-react";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Dark Navy Header */}
      <nav className="sticky top-0 bg-slate-900 border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="ISBN Scout" className="h-8 w-8" />
            <span className="text-lg font-bold text-white">ISBNScout</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setLocation("/about")} className="text-slate-300 hover:text-white text-sm">Features</button>
            <button onClick={() => setLocation("/offline-mode")} className="text-slate-300 hover:text-white text-sm">Offline Mode</button>
            <button onClick={() => setLocation("/subscription")} className="text-slate-300 hover:text-white text-sm">Pricing</button>
            <button onClick={() => setLocation("/faq")} className="text-slate-300 hover:text-white text-sm">FAQ</button>
            <button onClick={() => setLocation("/faq")} className="text-slate-300 hover:text-white text-sm">Contact</button>
            <div className="flex gap-2 ml-4">
              <Button 
                variant="ghost"
                onClick={() => setLocation("/auth")}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Log In
              </Button>
              <Button 
                onClick={() => setLocation("/auth")}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column */}
            <div className="space-y-6">
              <Badge className="bg-teal-100 text-teal-800 border-teal-200 w-fit">
                BOOK SCOUTING, UPGRADED
              </Badge>
              
              <h1 className="text-5xl font-bold text-foreground leading-tight">
                Scan books.<span className="text-teal-600"> Even offline.</span>
              </h1>
              
              <p className="text-base text-muted-foreground max-w-lg">
                ISBNScout helps UK book resellers find profitable books in seconds with barcode, cover, and AI spine recognition. Built for charity shops, car-boot sales, and anywhere signal drops.
              </p>
              
              <Button 
                size="lg" 
                onClick={() => setLocation("/auth")}
                className="bg-teal-600 hover:bg-teal-700 text-white w-fit"
              >
                Start 14-Day Free Trial
              </Button>
              
              <p className="text-xs text-muted-foreground">
                No credit card required. Cancel anytime.
              </p>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-xs text-muted-foreground font-semibold">Sources: <span className="text-slate-600 dark:text-slate-400">Amazon UK • eBay UK • Google Books • AI Vision</span></p>
                <p className="text-xs text-muted-foreground font-semibold">Built for: <span className="text-slate-600 dark:text-slate-400">Charity shop hunters • Amazon sellers • eBay booksellers</span></p>
              </div>
            </div>

            {/* Right Column - Product Demo */}
            <div>
              <Card className="bg-slate-900 border-slate-800 p-6 text-white">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse" />
                      <span className="font-semibold text-sm">LIVE SCAN</span>
                    </div>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">OFFLINE READY</Badge>
                  </div>

                  {/* Best Candidate */}
                  <div className="space-y-2 pb-3 border-b border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Best Candidate</div>
                    <div className="text-sm font-semibold">"Intro to Cognitive Science" – 3rd Ed.</div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 text-xs">AI Spine Recognition</Badge>
                      <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 text-xs">Charity shop – £2.50</Badge>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-700">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Net Profit (after fees & postage)</div>
                      <div className="text-xl font-bold text-teal-400">£7.90</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Sales Velocity</div>
                      <div className="text-sm font-semibold text-slate-300">10 sales / 30 days</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Amazon Used</div>
                      <div className="text-sm font-semibold text-slate-300">£12.90</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">eBay Sold Avg</div>
                      <div className="text-sm font-semibold text-slate-300">£11.50</div>
                    </div>
                  </div>

                  {/* Fees Breakdown */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="text-slate-500 uppercase tracking-wide font-semibold">Amazon Breakdown</div>
                      <div className="space-y-1 pl-2 border-l border-slate-700">
                        <div className="flex justify-between text-slate-400">
                          <span>List Price</span>
                          <span className="text-slate-300">£12.90</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Referral (15.3%)</span>
                          <span className="text-slate-300">-£1.97</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Closing Fee</span>
                          <span className="text-slate-300">-£0.75</span>
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
                      <div className="text-slate-500 uppercase tracking-wide font-semibold">eBay Breakdown</div>
                      <div className="space-y-1 pl-2 border-l border-slate-700">
                        <div className="flex justify-between text-slate-400">
                          <span>Avg Sold</span>
                          <span className="text-slate-300">£11.50</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Final Value (12.8%)</span>
                          <span className="text-slate-300">-£1.47</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>PayPal Fee (3.4%)</span>
                          <span className="text-slate-300">-£0.39</span>
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
                      <span className="text-xs font-semibold text-green-400">Strong buy - high demand</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            The fastest way to scout books.
          </h2>
          
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            ISBNScout identifies books in seconds using barcode, cover photo, or exclusive AI spine recognition – so you can single books or scan entire shelves.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Barcode Scanner */}
            <Card className="p-6 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                  <Barcode className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-teal-600 font-semibold uppercase tracking-wide mb-1">BARCODE SCANNER</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Point. Scan. Decide.</h3>
                  <p className="text-sm text-muted-foreground mb-3">Lightning-fast ISBN detection with a mobile-first camera flow. Ideal for high-volume scanning sessions in shops and warehouses.</p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>Instant ISBN lookup to Amazon & eBay</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>Fallback manual ISBN entry when barcodes are damaged</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Cover Recognition */}
            <Card className="p-6 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                  <Camera className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-teal-600 font-semibold uppercase tracking-wide mb-1">AI COVER RECOGNITION</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Just take a photo.</h3>
                  <p className="text-sm text-muted-foreground mb-3">Snap the front cover and let AI extract title, author, and edition – perfect for older books or missing barcodes.</p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>Ideal for vintage and collectible books</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>Works even when barcodes are faded or covered</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Spine Recognition */}
            <Card className="p-6 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                  <Eye className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-teal-600 font-semibold uppercase tracking-wide mb-1">AI SPINE RECOGNITION</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Scan the whole shelf.</h3>
                  <p className="text-sm text-muted-foreground mb-3">Photograph a single spine or entire shelf. ISBNScout reads the titles for you. No other scouting app offers this.</p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>Rapid shelf scanning without pulling books out</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>Huge time-saver on big charity shop trips</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Offline Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Works even when your signal doesn't.
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mb-12">
            Most scouting apps stop the moment your phone loses reception. ISBNScout is built as offline-first, so you keep working in basements, back rooms, and concrete warehouses.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Offline Scanning */}
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                  <Barcode className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Scan offline</h3>
                  <p className="text-sm text-muted-foreground">
                    Barcode, cover, and spine scanning work completely offline. Every scan is stored locally on your device until you sync.
                  </p>
                </div>
              </div>
            </Card>

            {/* Offline Calculations */}
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                  <Zap className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Instant calculations</h3>
                  <p className="text-sm text-muted-foreground">
                    Profit estimates, fee breakdowns, and buy/don't-buy decisions all happen instantly—no network needed.
                  </p>
                </div>
              </div>
            </Card>

            {/* Sync when ready */}
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                  <Crown className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Sync when you're ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Head back online and sync your scans in seconds. No data loss, no friction—just continuous scouting.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* From Scan to Profit Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            From scan to profit, in one flow.
          </h2>

          <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-teal-600 text-white font-bold text-lg">
                  1
                </div>
                <h3 className="font-bold text-foreground">Scan</h3>
                <p className="text-sm text-muted-foreground">
                  Point your phone at a barcode, cover, or shelf spine. ISBNScout identifies the book in milliseconds.
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-end pb-4 justify-center">
                <div className="text-3xl text-slate-300 dark:text-slate-600">→</div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-teal-600 text-white font-bold text-lg">
                  2
                </div>
                <h3 className="font-bold text-foreground">Analyze</h3>
                <p className="text-sm text-muted-foreground">
                  Instant profit calculations show net return after fees and postage. Sales velocity tells you demand.
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-end pb-4 justify-center">
                <div className="text-3xl text-slate-300 dark:text-slate-600">→</div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-teal-600 text-white font-bold text-lg">
                  3
                </div>
                <h3 className="font-bold text-foreground">Decide</h3>
                <p className="text-sm text-muted-foreground">
                  Buy/don't-buy recommendation based on profit margins and historical sales data. You stay in control.
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                size="lg"
                onClick={() => setLocation("/auth")}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Start Your First Scan
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              See ISBNScout in action.
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              A quick 20-30 second walkthrough: shelf scan, spine recognition, profit preview, and listing pushed live.
            </p>
          </div>

          {/* Video Placeholder */}
          <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center mb-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white/10 rounded-full">
                  <Play className="h-8 w-8 text-white fill-white" />
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Embed your Capcut / YouTube demo here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Simple pricing for serious UK book flippers
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Try ISBNScout free for 14 days. No nonsense, full access — test it in real charity shops before committing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
            {/* Pro Plan */}
            <Card className="p-6 border-teal-600 border-2 bg-teal-50 dark:bg-teal-950/30">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Pro</h3>
                  <p className="text-sm text-muted-foreground">Perfect for UK sellers sourcing weekly in charity shops</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">£14.99</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Unlimited scans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Offline mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Barcode, cover & AI spine recognition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Amazon + eBay UK profit calculator</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Royal Mail & Evri postage estimates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Scan history</span>
                  </li>
                </ul>
                <Button 
                  size="lg" 
                  onClick={() => setLocation("/auth")}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Start 14-Day Pro Trial
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Prefer yearly? £189/year (save ~2 months)
                </p>
              </div>
            </Card>

            {/* Elite Plan */}
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Elite</h3>
                  <p className="text-sm text-muted-foreground">For high-volume sellers who need automation and advanced tools</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">£19.99</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Everything in Pro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Buy / Don't Buy triggers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Custom profit rules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">CSV export</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">Multi-device access</span>
                  </li>
                </ul>
                <Button 
                  size="lg" 
                  onClick={() => setLocation("/auth")}
                  className="w-full"
                >
                  Start 14-Day Elite Trial
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Prefer yearly? £199/year (save ~2½ months)
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to scout smarter?</h2>
          <p className="text-lg opacity-90">
            Start your 14-day free trial. No credit card. Cancel anytime.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              size="lg"
              onClick={() => setLocation("/auth")}
              className="bg-white text-teal-700 hover:bg-slate-100"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setLocation("/subscription")}
              className="border-white text-white hover:bg-white/20"
            >
              View Plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
