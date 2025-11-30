import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Barcode, Camera, Eye, ArrowRight } from "lucide-react";
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
            <button onClick={() => setLocation("/about")} className="text-slate-300 hover:text-white text-sm" data-testid="link-features">Features</button>
            <button onClick={() => setLocation("/app")} className="text-slate-300 hover:text-white text-sm" data-testid="link-offline">Offline Mode</button>
            <button onClick={() => setLocation("/subscription")} className="text-slate-300 hover:text-white text-sm" data-testid="link-pricing">Pricing</button>
            <button onClick={() => setLocation("/blog")} className="text-slate-300 hover:text-white text-sm" data-testid="link-faq">FAQ</button>
            <button onClick={() => setLocation("/contact")} className="text-slate-300 hover:text-white text-sm" data-testid="link-contact">Contact</button>
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
                onClick={() => setLocation("/auth")}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                data-testid="button-nav-trial"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                data-testid="button-hero-trial"
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
                    {/* Net Profit */}
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Net Profit (after fees & postage)</div>
                      <div className="text-xl font-bold text-teal-400">£7.90</div>
                    </div>

                    {/* Sales Velocity */}
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Sales Velocity</div>
                      <div className="text-sm font-semibold text-slate-300">10 sales / 30 days</div>
                    </div>

                    {/* Amazon Used */}
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Amazon Used</div>
                      <div className="text-sm font-semibold text-slate-300">£12.90</div>
                    </div>

                    {/* eBay Sold Avg */}
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">eBay Sold Avg</div>
                      <div className="text-sm font-semibold text-slate-300">£11.50</div>
                    </div>
                  </div>

                  {/* Fees Breakdown - Both Platforms */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Amazon Breakdown */}
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

                    {/* eBay Breakdown */}
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
                  <p className="text-sm text-muted-foreground mb-3">Lightning-fast ISBN detection. Ideal for high-volume scanning sessions in shops and car-boots.</p>
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
              data-testid="button-cta-trial"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setLocation("/subscription")}
              className="border-white text-white hover:bg-white/20"
              data-testid="button-cta-pricing"
            >
              View Plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
