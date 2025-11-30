import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  ScanLine,
  Camera,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [platform, setPlatform] = useState<"amazon" | "ebay">("amazon");

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
            <button onClick={() => setLocation("/app")} className="text-slate-300 hover:text-white text-sm">Offline Mode</button>
            <button onClick={() => setLocation("/subscription")} className="text-slate-300 hover:text-white text-sm">Pricing</button>
            <button onClick={() => setLocation("/blog")} className="text-slate-300 hover:text-white text-sm">FAQ</button>
            <button onClick={() => setLocation("/contact")} className="text-slate-300 hover:text-white text-sm">Contact</button>
            <div className="flex gap-2 ml-4">
              <Button 
                variant="ghost"
                onClick={() => setLocation("/auth")}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
                data-testid="link-login"
              >
                Log In
              </Button>
              <Button 
                onClick={() => setLocation("/auth")}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                data-testid="button-start-trial"
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-teal-100 text-teal-800 border-teal-200 w-fit">
                BOOK SCOUTING, UPGRADED
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Scan books.<br />
                <span className="text-teal-600">Even offline.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                Scout books with AI instantly. Know profit before you buy. Works offline in charity shops, car-boots, and friend's houses – no signal needed.
              </p>
              
              <Button 
                size="lg" 
                onClick={() => setLocation("/auth")}
                className="bg-teal-600 hover:bg-teal-700 text-white text-base px-8 w-fit"
                data-testid="button-hero-trial"
              >
                Start 14-Day Free Trial
              </Button>
              
              <p className="text-sm text-muted-foreground">
                No credit card required. Cancel anytime.
              </p>
            </div>

            {/* Right Column - Product Demo */}
            <div>
              <Card className="bg-slate-900 border-slate-800 p-6 text-white">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse" />
                      <span className="font-semibold text-sm">LIVE SCAN</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPlatform("amazon")}
                        className={`text-xs px-2 py-1 rounded ${platform === "amazon" ? "bg-teal-600/40 text-teal-400" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                      >
                        Amazon MFN
                      </button>
                      <button
                        onClick={() => setPlatform("ebay")}
                        className={`text-xs px-2 py-1 rounded ${platform === "ebay" ? "bg-teal-600/40 text-teal-400" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                      >
                        eBay
                      </button>
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Best Candidate</div>
                      <div className="font-semibold text-sm">"Introduction to Cognitive Science" - 3rd Ed.</div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 text-xs">
                        AI Spine Recognition
                      </Badge>
                      <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 text-xs">
                        Charity shop - £2.50
                      </Badge>
                    </div>

                    {platform === "amazon" ? (
                      <>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Amazon MFN Price</div>
                            <div className="font-semibold text-slate-300">£12.90</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Referral Fee (15.3%)</div>
                            <div className="font-semibold text-slate-300">-£1.97</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Closing Fee</div>
                            <div className="font-semibold text-slate-300">-£0.75</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">After Fees</div>
                            <div className="font-semibold text-teal-400">£10.18</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">eBay Sold Avg</div>
                            <div className="font-semibold text-slate-300">£11.50</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Final Value Fee (12.8%)</div>
                            <div className="font-semibold text-slate-300">-£1.47</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">PayPal Fee (3.4%)</div>
                            <div className="font-semibold text-slate-300">-£0.39</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">After Fees</div>
                            <div className="font-semibold text-teal-400">£9.64</div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Your Cost</div>
                        <div className="font-semibold text-slate-300">£2.50</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Royal Mail (Large Letter)</div>
                        <div className="font-semibold text-slate-300">£2.80</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700">
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Net Profit</div>
                      <div className="text-2xl font-bold text-teal-400">{platform === "amazon" ? "£4.88" : "£4.34"}</div>
                    </div>

                    <div className="pt-2">
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Sales Velocity</div>
                      <div className="text-sm text-slate-300">10 sales / 30 days</div>
                    </div>

                    <div className="pt-2">
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Decision</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-semibold text-green-400">Strong buy - high demand</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ScanLine className="h-6 w-6 text-teal-600" />
                <div className="text-xs font-bold text-teal-600 uppercase tracking-widest">BARCODE SCANNER</div>
              </div>
              <h3 className="text-lg font-bold text-foreground">Point. Scan. Decide.</h3>
              <p className="text-sm text-muted-foreground">Lightning-fast ISBN lookup. See profit instantly. Ideal for high-volume scouting sessions in shops and car-boots.</p>
              <ul className="text-sm text-muted-foreground space-y-1 pt-2">
                <li>• Instant ISBN → profitability check</li>
                <li>• Manual ISBN entry when barcodes are damaged</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Camera className="h-6 w-6 text-teal-600" />
                <div className="text-xs font-bold text-teal-600 uppercase tracking-widest">AI COVER RECOGNITION</div>
              </div>
              <h3 className="text-lg font-bold text-foreground">Just take a photo.</h3>
              <p className="text-sm text-muted-foreground">Snap any book cover and AI extracts title, author, and ISBN – perfect for older books with faded barcodes.</p>
              <ul className="text-sm text-muted-foreground space-y-1 pt-2">
                <li>• Works on vintage and collectible books</li>
                <li>• No need to find the barcode</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-teal-600" />
                <div className="text-xs font-bold text-teal-600 uppercase tracking-widest">AI SPINE RECOGNITION</div>
              </div>
              <h3 className="text-lg font-bold text-foreground">Scan the whole shelf.</h3>
              <p className="text-sm text-muted-foreground">Photograph a single spine or entire shelf – ISBNScout reads the titles for you. No other scouting app offers this.</p>
              <ul className="text-sm text-muted-foreground space-y-1 pt-2">
                <li>• Rapid shelf scanning without pulling books out</li>
                <li>• Huge time-saver on big charity shop trips</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 bg-teal-600 border-y border-teal-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">The Problem</h3>
              <p className="text-white/90 leading-relaxed">
                Scout for hours in charity shops and car-boots. Find 50 potential books. But you're guessing on profit. No sales data. No velocity info. You buy based on hunches. Half your buys are losers.
              </p>
              <p className="text-white/90 leading-relaxed">
                You need to make buy/don't-buy decisions <span className="font-semibold">in seconds</span>. Not hours of research at home later.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">ISBNScout Solution</h3>
              <p className="text-white/90 leading-relaxed">
                Scan ISBN or spine. Instant profit calculation. Sales velocity. Demand signals. <span className="font-semibold">Make the decision right there.</span>
              </p>
              <ul className="space-y-2 text-white/90">
                <li className="flex gap-2">
                  <span className="text-white">✓</span>
                  <span>Scout smarter. Skip the losers.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white">✓</span>
                  <span>Works offline. No signal needed.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-white">✓</span>
                  <span>Real data. Not guesswork.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-teal-50 dark:bg-teal-950">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-teal-900 dark:text-white text-center mb-12">Scouts Love It</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 border-teal-200 dark:border-teal-700 bg-white dark:bg-teal-900">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-teal-600">★</span>
                ))}
              </div>
              <p className="text-teal-900 dark:text-teal-100 mb-4">
                "I was losing £2-3 per book on bad buys. ISBNScout cut my losses in half. Now I skip the obvious losers instantly."
              </p>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">Sarah M. • Charity Shop Scout</p>
            </Card>

            <Card className="p-6 border-teal-200 dark:border-teal-700 bg-white dark:bg-teal-900">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-teal-600">★</span>
                ))}
              </div>
              <p className="text-teal-900 dark:text-teal-100 mb-4">
                "Boot sale scout here. I used to spend 2 hours deciding on 40 books. With spine recognition, I scan the whole box in 5 minutes."
              </p>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">Marcus T. • Boot Sale Hunter</p>
            </Card>

            <Card className="p-6 border-teal-200 dark:border-teal-700 bg-white dark:bg-teal-900">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-teal-600">★</span>
                ))}
              </div>
              <p className="text-teal-900 dark:text-teal-100 mb-4">
                "Offline mode is a game-changer. Charity shops have no signal. I can make decisions without hunting for WiFi."
              </p>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">James P. • eBay Seller</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Security/Privacy Section */}
      <section className="py-12 bg-teal-600 border-y border-teal-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Your Data. Your Rules.</h3>
              <ul className="space-y-3 text-white/90">
                <li className="flex gap-3">
                  <span className="text-white font-bold">🔒</span>
                  <span><strong className="text-white">End-to-end encrypted</strong> - Competitors can't track your hunting spots</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white font-bold">📱</span>
                  <span><strong className="text-white">Stays on your phone</strong> - Scouting data never leaves your device</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white font-bold">🚫</span>
                  <span><strong className="text-white">We never sell data</strong> - Your margins are private</span>
                </li>
              </ul>
            </div>
            <Card className="p-6 border-white/30 bg-white/10">
              <p className="text-sm text-white/90 leading-relaxed">
                <strong className="text-white">Why this matters:</strong> Your scouting strategy is your edge. If competitors know where you hunt and what you buy, that edge disappears. ISBNScout protects that.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Questions?</h2>
          <div className="space-y-6">
            <div className="border-b border-slate-700 pb-6">
              <h4 className="text-lg font-bold text-foreground mb-2">How often is sales data updated?</h4>
              <p className="text-muted-foreground">Daily. ISBNScout syncs sales data, pricing, and velocity signals every 24 hours when you're online. Works perfectly offline too.</p>
            </div>

            <div className="border-b border-slate-700 pb-6">
              <h4 className="text-lg font-bold text-foreground mb-2">What if a book has no sales data?</h4>
              <p className="text-muted-foreground">ISBNScout shows "No market data available" and suggests skipping it. Better to skip unknowns than buy blind. When in doubt, don't buy.</p>
            </div>

            <div className="border-b border-slate-700 pb-6">
              <h4 className="text-lg font-bold text-foreground mb-2">Do I need internet to scout?</h4>
              <p className="text-muted-foreground">No. ISBNScout works completely offline. Scan, see profit calculations, make decisions—all without signal. Syncs data when you reconnect.</p>
            </div>

            <div className="border-b border-slate-700 pb-6">
              <h4 className="text-lg font-bold text-foreground mb-2">Can I list books directly to Amazon/eBay from ISBNScout?</h4>
              <p className="text-muted-foreground">ISBNScout is a scouting tool for buy/don't-buy decisions. It's not a full selling platform. Use ISBNScout to decide what to buy, then list via Amazon/eBay separately.</p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-foreground mb-2">Is there a free trial?</h4>
              <p className="text-muted-foreground">Yes. 14 days free. No credit card required. Full access to all features. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built For Section */}
      <section className="py-16 bg-muted border-y border-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">Built for:</h2>
          <p className="text-lg text-muted-foreground">
            Charity shop hunters • Amazon sellers • eBay booksellers • Boot sale scouts • Estate sale hunters
          </p>
        </div>
      </section>

      {/* Sources Section */}
      <section className="py-12 bg-muted border-t border-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Sources:</span> Amazon UK • eBay UK • Google Books • AI Vision
          </p>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to scout smarter?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Start your free trial today. No credit card required.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setLocation("/auth")}
            className="text-lg px-8"
            data-testid="button-cta"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-background/70 border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoImage} alt="ISBN Scout" className="h-6 w-6" />
                <span className="text-background font-bold">ISBNScout</span>
              </div>
              <p className="text-sm">
                The book scouting app that works without signal.
              </p>
            </div>
            <div>
              <h4 className="text-background font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setLocation("/subscription")} className="hover:text-background transition-colors">Pricing</button></li>
                <li><button onClick={() => setLocation("/auth")} className="hover:text-background transition-colors">Demo</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-background font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setLocation("/about")} className="hover:text-background transition-colors">About</button></li>
                <li><button onClick={() => setLocation("/blog")} className="hover:text-background transition-colors">Blog</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-background font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setLocation("/privacy")} className="hover:text-background transition-colors">Privacy</button></li>
                <li><button onClick={() => setLocation("/terms")} className="hover:text-background transition-colors">Terms</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm">
            <p>2024 ISBNScout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
