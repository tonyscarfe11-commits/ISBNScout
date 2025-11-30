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

      {/* Feature boxes before From Scan to Profit */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Offline-First Engine */}
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <Badge className="bg-teal-100 text-teal-700 border-teal-200 w-fit text-xs">
                  OFFLINE-FIRST ENGINE
                </Badge>
                <h3 className="text-xl font-bold text-foreground">Scan anywhere.</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  SQLite on-device storage keeps your scans, profit estimates, and notes safe while you're offline. Work like usual, everything syncs to the cloud.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Offline scanning for barcode, cover, and spine.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Local profit calculations using cached pricing.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Auto-sync to PostgreSQL when connection restores.</span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Real-World Sourcing */}
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <Badge className="bg-teal-100 text-teal-700 border-teal-200 w-fit text-xs">
                  REAL-WORLD SOURCING
                </Badge>
                <h3 className="text-xl font-bold text-foreground">Made for UK book hunters.</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Built specifically for how UK resellers actually work: charity shops, car-boot sales, library clear-outs, and house clearances.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Offline banner so you always know your status.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>"Syncing..." indicator when data catches up.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Designed for one-handed use on mobile.</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* From Scan to Profit Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            From scan to profit, in one flow.
          </h2>
          
          <p className="text-base text-muted-foreground max-w-3xl mb-12">
            ISBNScout combines live pricing, sales velocity, and automated repricing so you can decide quickly, list instantly, and stay competitive without manual price changes.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profit Engine */}
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <Badge className="bg-teal-100 text-teal-700 border-teal-200 w-fit text-xs">
                  PROFIT ENGINE
                </Badge>
                <h3 className="text-lg font-bold text-foreground">Real profit, not guesswork.</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  See net profit after fees and postage, estimated ROI, and buyshop recommendations based on real sales data.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Amazon used price + eBay sold averages.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Sales velocity: how fast books actually move.</span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Multi-Platform Listing */}
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <Badge className="bg-teal-100 text-teal-700 border-teal-200 w-fit text-xs">
                  MULTI-PLATFORM LISTING
                </Badge>
                <h3 className="text-lg font-bold text-foreground">List directly from ISBNScout.</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Turn scans into live listings in a few taps—without bouncing between different apps and tabs.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Amazon FBM listing support.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>eBay UK listing with titles, prices, and details filled.</span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Automated Repricing */}
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <Badge className="bg-teal-100 text-teal-700 border-teal-200 w-fit text-xs">
                  AUTOMATED REPRICING
                </Badge>
                <h3 className="text-lg font-bold text-foreground">Stay competitive on autopilot.</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Let ISBNScout monitor and update your prices automatically to protect margins and speed up sales.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Match lowest, beat by %, or beat by £.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Target-margin mode with min/max limits.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Full repricing history per listing.</span>
                  </li>
                </ul>
              </div>
            </Card>
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
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Simple pricing for serious UK book flippers
          </h2>
          <p className="text-base text-muted-foreground max-w-3xl mb-12">
            Try ISBNScout free for 14 days. No nonsense, full access — test it in real charity shops before committing.
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - 14 Day Free Trial */}
            <div>
              <Card className="p-6 border-slate-200 dark:border-slate-700 h-full">
                <div className="space-y-4">
                  <Badge className="bg-teal-100 text-teal-700 border-teal-200 w-fit text-xs">
                    14-DAY FREE TRIAL
                  </Badge>
                  <h3 className="text-lg font-bold text-foreground">Test it during real sourcing runs</h3>
                  <p className="text-sm text-muted-foreground">
                    Scan books in charity shops, car-boots, and libraries with full features enabled.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">Full Pro & Elite access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">No card required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">Cancel anytime</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>

            {/* Middle Column - Pro Plan */}
            <div>
              <Card className="p-6 border-teal-600 border-2 bg-teal-50 dark:bg-teal-950/30 h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Pro</h3>
                    <p className="text-xs text-muted-foreground">Perfect for UK sellers sourcing weekly in charity shops and car-boots.</p>
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
                    Prefer yearly? £149/year (save ~2 months)
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column - Elite Plan */}
            <div>
              <Card className="p-6 border-slate-200 dark:border-slate-700 h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Elite</h3>
                    <p className="text-xs text-muted-foreground">For high-volume sellers sourcing automation and advanced tools.</p>
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
                    Prefer yearly? £199/year (save ~2 months)
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Contact Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Frequently asked questions.
            </h2>
            
            <div className="space-y-3">
              <div className="text-sm font-semibold text-foreground cursor-pointer hover:text-teal-600">
                Does ISBNScout work without WiFi or mobile data?
              </div>
              <div className="text-sm font-semibold text-foreground cursor-pointer hover:text-teal-600">
                Is this built for Amazon UK sellers?
              </div>
              <div className="text-sm font-semibold text-foreground cursor-pointer hover:text-teal-600">
                Does it support eBay UK?
              </div>
              <div className="text-sm font-semibold text-foreground cursor-pointer hover:text-teal-600">
                Is the AI spine recognition real?
              </div>
              <div className="text-sm font-semibold text-foreground cursor-pointer hover:text-teal-600">
                Can I export my inventory or scan history?
              </div>
              <div className="text-sm font-semibold text-foreground cursor-pointer hover:text-teal-600">
                Who is ISBNScout for?
              </div>
            </div>
          </div>

          {/* Get in Touch */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Get in touch.
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mb-12">
              Have questions about ISBNScout? Need help getting started? We're here to help.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Support Card */}
              <Card className="p-6 border-slate-200 dark:border-slate-700">
                <div className="space-y-4">
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                    <div className="w-6 h-6 text-teal-600">
                      <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Questions about your account, technical issues, or how to use ISBNScout.
                  </p>
                  <a href="mailto:support@isbnscout.com" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                    support@isbnscout.com
                  </a>
                </div>
              </Card>

              {/* General Inquiries Card */}
              <Card className="p-6 border-slate-200 dark:border-slate-700">
                <div className="space-y-4">
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                    <div className="w-6 h-6 text-teal-600">
                      <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">General Inquiries</h3>
                  <p className="text-sm text-muted-foreground">
                    General questions, partnerships, or business inquiries.
                  </p>
                  <a href="mailto:contact@isbnscout.com" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                    contact@isbnscout.com
                  </a>
                </div>
              </Card>

              {/* Information Card */}
              <Card className="p-6 border-slate-200 dark:border-slate-700">
                <div className="space-y-4">
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                    <div className="w-6 h-6 text-teal-600">
                      <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn more about ISBNScout, features, and pricing options.
                  </p>
                  <a href="mailto:info@isbnscout.com" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                    info@isbnscout.com
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2025 ISBNScout. All rights reserved.</p>
            <div className="flex gap-6 text-slate-300 hover:text-white">
              <a href="/pricing" className="hover:text-teal-400">Pricing</a>
              <a href="/faq" className="hover:text-teal-400">Docs</a>
              <a href="#contact" className="hover:text-teal-400">Contact</a>
              <a href="#privacy" className="hover:text-teal-400">Privacy</a>
              <a href="#terms" className="hover:text-teal-400">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to find profitable books faster?</h2>
          <p className="text-lg opacity-90">
            Scan shelves, see net profit, and list to Amazon and eBay — even when your phone has no signal.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              size="lg"
              onClick={() => setLocation("/auth")}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Start 14-Day Free Trial
            </Button>
          </div>
          <p className="text-sm opacity-75">
            No credit card required. Designed for UK sellers.
          </p>
        </div>
      </section>
    </div>
  );
}
