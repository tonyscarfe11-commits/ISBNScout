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

      {/* Built For Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">Built for:</h2>
          <p className="text-lg text-muted-foreground">
            Charity shop hunters • Amazon sellers • eBay booksellers
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
