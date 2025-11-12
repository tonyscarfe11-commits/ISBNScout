import { useLocation } from "wouter";
import { useEffect } from "react";
import { BookOpen, ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BlogPost1() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setLocation("/blog")} className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Blog</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ISBNScout</span>
          </div>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-16">
        <Badge variant="secondary" className="mb-4">Tips & Tricks</Badge>
        <h1 className="text-4xl font-bold mb-4">10 Tips for Profitable Book Scouting in 2025</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>January 15, 2025</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>5 min read</span>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Book scouting remains one of the most profitable side hustles in 2025. Whether you're sourcing at car boot sales, charity shops, or estate clearances, these proven strategies will help you maximize your profits and build a sustainable book business.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Focus on Niche Categories</h2>
          <p className="text-muted-foreground leading-relaxed">
            Don't try to sell everything. Specialize in 2-3 categories like cookbooks, vintage children's books, or academic textbooks. You'll develop expertise quickly and spot valuable books faster than generalists. My top categories: GCSE/A-Level revision guides, first edition fiction, and professional certifications.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Scout Early and Often</h2>
          <p className="text-muted-foreground leading-relaxed">
            Arrive at car boot sales 30 minutes before opening. The best books sell within the first hour. Visit charity shops on restock days (typically Monday and Thursday mornings). Build relationships with shop managers - they'll sometimes hold valuable books for regular buyers.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Use Real-Time Pricing Data</h2>
          <p className="text-muted-foreground leading-relaxed">
            Never rely on gut feeling. Apps like ISBNScout show you current Amazon FBA, FBM, and eBay prices in seconds. Check both "Buy Now" prices and recent sold listings. A book listed at £50 but last sold for £12 isn't actually worth £50.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Calculate All Your Costs</h2>
          <p className="text-muted-foreground leading-relaxed">
            Amazon FBA fees average 35-40% of your sale price. eBay takes 12.8% + £0.30. Factor in your purchase price, petrol, packaging, and prep time. Use the 3x rule: if you can't sell it for 3x your cost, it's probably not worth your time.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Master the Art of Negotiation</h2>
          <p className="text-muted-foreground leading-relaxed">
            At car boot sales, always offer 40-50% less than the asking price. Bundle books for better deals: "I'll take all five for £10." At charity shops, ask about discounts for bulk purchases. Many offer 20% off when you buy 10+ books.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Look Beyond the Cover</h2>
          <p className="text-muted-foreground leading-relaxed">
            Check inside for signatures, inscriptions, or first edition markers. A signed copy can be worth 10x an unsigned one. Look for bookplates, dust jackets, and limited editions. The most profitable find I ever made was a signed Terry Pratchett in a 50p bin.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Understand Seasonality</h2>
          <p className="text-muted-foreground leading-relaxed">
            Textbooks peak in August-September and January. Cookbooks sell best November-December. Children's books spike before Christmas and during summer holidays. Garden books fly off shelves March-May. Plan your sourcing 2-3 months ahead.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. Optimize Your Listings</h2>
          <p className="text-muted-foreground leading-relaxed">
            Use all available keywords in your titles. Take clear photos showing any damage. Be honest about condition - returns cost more than discounting upfront. ISBNScout's AI can generate SEO-optimized titles and descriptions that actually convert.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. Track Your Numbers</h2>
          <p className="text-muted-foreground leading-relaxed">
            Record every purchase: source, cost, sale price, and sell-through time. This data tells you which sources are profitable and which categories turn fastest. I discovered my average sell-through time was 47 days - knowing this helps me manage cashflow.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">10. Build Systems, Not Just Sales</h2>
          <p className="text-muted-foreground leading-relaxed">
            Batch your tasks: scout one day, list another, ship on specific days. Use templates for common listing types. Automate repricing with tools. The goal isn't to work harder - it's to work smarter. I went from 3 hours per 10 listings to 45 minutes.
          </p>

          <div className="bg-primary/5 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-bold mb-3">Ready to Scale Your Book Business?</h3>
            <p className="text-muted-foreground mb-4">
              ISBNScout's AI-powered tools help you scout faster, price smarter, and list easier. Join 500+ sellers already using our platform.
            </p>
            <Button onClick={() => setLocation("/auth")}>
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
