import { useLocation } from "wouter";
import { useEffect } from "react";
import { BookOpen, ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function BlogPost3() {
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
        <Badge variant="secondary" className="mb-4">Platforms</Badge>
        <h1 className="text-4xl font-bold mb-4">Amazon FBA vs FBM vs eBay: Which Platform is Right for You?</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>January 5, 2025</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>10 min read</span>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Choosing the right platform can make or break your book business. Each option - Amazon FBA, Amazon FBM, and eBay - has distinct advantages and trade-offs. This comprehensive guide breaks down fees, effort, and profitability to help you decide.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Amazon FBA (Fulfilled by Amazon)</h2>

          <Card className="p-6 my-6">
            <h3 className="text-lg font-semibold mb-3">How It Works</h3>
            <p className="text-muted-foreground">
              You send books in bulk to Amazon's warehouses. They store inventory, pack orders, ship to customers, and handle returns. You pay storage fees (£0.42-£1.05 per item/month) plus fulfillment fees (£1.86-£3.74 per item).
            </p>
          </Card>

          <h3 className="text-xl font-bold mb-3">Pros:</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li><strong>Prime eligibility:</strong> 82% of Amazon shoppers have Prime. Your books appear first in search results and convert 3x better.</li>
            <li><strong>Zero fulfillment work:</strong> No packing, no post office trips, no customer service. Amazon handles everything.</li>
            <li><strong>Scalability:</strong> Send 1,000 books as easily as 10. Storage and logistics handled professionally.</li>
            <li><strong>Trust factor:</strong> "Fulfilled by Amazon" badge increases conversion rates by 30-40%.</li>
            <li><strong>Better margins on higher-value books:</strong> Fees are flat regardless of book price, so £30+ books are very profitable.</li>
          </ul>

          <h3 className="text-xl font-bold mb-3 mt-6">Cons:</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li><strong>High fees:</strong> Total fees average 35-40% of sale price (15% commission + storage + fulfillment).</li>
            <li><strong>Minimum profitability threshold:</strong> Not worth it for books under £8-10 after fees.</li>
            <li><strong>Storage costs accumulate:</strong> Slow-moving inventory costs you monthly. Books over 365 days incur extra fees.</li>
            <li><strong>Prep requirements:</strong> Books need proper labeling, bagging for good condition, removal of stickers.</li>
            <li><strong>Inventory risk:</strong> Amazon occasionally loses or damages items. Insurance claims are time-consuming.</li>
          </ul>

          <h3 className="text-xl font-bold mb-3 mt-6">Best For:</h3>
          <p className="text-muted-foreground">
            Sellers focused on higher-value books (£10+), high volume operations, and those wanting hands-off fulfillment. Ideal if you process 100+ books monthly and value time over maximizing per-unit profit.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Amazon FBM (Fulfilled by Merchant)</h2>

          <Card className="p-6 my-6">
            <h3 className="text-lg font-semibold mb-3">How It Works</h3>
            <p className="text-muted-foreground">
              You list on Amazon but ship directly from home. When a book sells, you pack it and ship within 1-2 days. Amazon handles payment processing and takes 15% commission but no fulfillment or storage fees.
            </p>
          </Card>

          <h3 className="text-xl font-bold mb-3">Pros:</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li><strong>Lower fees:</strong> Only 15% commission (vs 35-40% for FBA). Significantly better margins per book.</li>
            <li><strong>No storage costs:</strong> Keep inventory at home. No monthly fees eating into profits.</li>
            <li><strong>Profitable on any price point:</strong> Even £3-5 books can be profitable without FBA fees.</li>
            <li><strong>Full inventory control:</strong> Check condition before shipping, bundle orders, include personalized notes.</li>
            <li><strong>Better for rare/collectible books:</strong> You handle packaging to ensure safe delivery of valuable items.</li>
          </ul>

          <h3 className="text-xl font-bold mb-3 mt-6">Cons:</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li><strong>Lower visibility:</strong> No Prime badge. Your listings appear below FBA listings in search results.</li>
            <li><strong>Manual fulfillment:</strong> You pack every order, print labels, and make post office trips.</li>
            <li><strong>Slower sell-through:</strong> FBM books typically take 2-3x longer to sell than identical FBA listings.</li>
            <li><strong>Customer service:</strong> You handle all inquiries, returns, and issues directly.</li>
            <li><strong>Shipping costs:</strong> Royal Mail adds £2-4 per book, eating into the fee savings.</li>
          </ul>

          <h3 className="text-xl font-bold mb-3 mt-6">Best For:</h3>
          <p className="text-muted-foreground">
            Part-time sellers, those with lower-value inventory (£5-10 range), sellers of rare/collectible books, or anyone wanting to test Amazon before committing to FBA. Also good for maintaining control and maximizing margin per book.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">eBay</h2>

          <Card className="p-6 my-6">
            <h3 className="text-lg font-semibold mb-3">How It Works</h3>
            <p className="text-muted-foreground">
              List books with photos and descriptions. eBay takes 12.8% + £0.30 per sale. You handle shipping (buyer typically pays shipping cost). More control over pricing and presentation than Amazon.
            </p>
          </Card>

          <h3 className="text-xl font-bold mb-3">Pros:</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li><strong>Lowest fees:</strong> 12.8% commission is the cheapest option. Great margins even on £3-5 books.</li>
            <li><strong>Auction and Best Offer:</strong> Unique features can drive competitive bidding on rare books.</li>
            <li><strong>International reach:</strong> eBay's global shipping program makes worldwide sales easy.</li>
            <li><strong>Better for unique items:</strong> Signed books, first editions, and collectibles often fetch higher prices on eBay.</li>
            <li><strong>Customer pays shipping:</strong> Unlike Amazon, you can charge actual shipping costs or profit from it.</li>
            <li><strong>More listing flexibility:</strong> Write longer descriptions, add multiple photos, tell the book's story.</li>
          </ul>

          <h3 className="text-xl font-bold mb-3 mt-6">Cons:</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li><strong>Smaller book market:</strong> Amazon dominates UK book sales. eBay has fewer book buyers overall.</li>
            <li><strong>More time per listing:</strong> Need good photos and detailed descriptions. Amazon auto-populates these.</li>
            <li><strong>Slower sales velocity:</strong> Books take longer to sell on average compared to Amazon.</li>
            <li><strong>Price competition:</strong> Race to the bottom on common titles. Harder to maintain premium pricing.</li>
            <li><strong>More customer interaction:</strong> Buyers ask questions, request combined shipping, and negotiate prices.</li>
          </ul>

          <h3 className="text-xl font-bold mb-3 mt-6">Best For:</h3>
          <p className="text-muted-foreground">
            Sellers of collectible, signed, or first edition books. Great for unique items where storytelling and detailed photos add value. Also good for international sales and maximizing profit on lower-value inventory.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">The Numbers: Fee Comparison</h2>

          <Card className="p-6 my-6">
            <p className="text-sm text-muted-foreground mb-4">Example: £20 book sale</p>
            <div className="space-y-3">
              <div className="border-b pb-2">
                <p className="font-semibold">Amazon FBA</p>
                <p className="text-muted-foreground text-sm">Commission: £3.00 (15%)</p>
                <p className="text-muted-foreground text-sm">Fulfillment: £2.50</p>
                <p className="text-muted-foreground text-sm">Storage (avg): £0.50</p>
                <p className="font-bold mt-1">Net: £14.00 (70%)</p>
              </div>
              <div className="border-b pb-2">
                <p className="font-semibold">Amazon FBM</p>
                <p className="text-muted-foreground text-sm">Commission: £3.00 (15%)</p>
                <p className="text-muted-foreground text-sm">Shipping: £2.50</p>
                <p className="font-bold mt-1">Net: £14.50 (72.5%)</p>
              </div>
              <div>
                <p className="font-semibold">eBay</p>
                <p className="text-muted-foreground text-sm">Fees: £2.86 (12.8% + £0.30)</p>
                <p className="text-muted-foreground text-sm">Shipping: £0 (buyer pays)</p>
                <p className="font-bold mt-1">Net: £17.14 (85.7%)</p>
              </div>
            </div>
          </Card>

          <h2 className="text-2xl font-bold mt-8 mb-4">Multi-Platform Strategy: The Smart Approach</h2>
          <p className="text-muted-foreground leading-relaxed">
            Most successful sellers don't choose one platform - they use all three strategically:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
            <li><strong>High-value (£15+):</strong> Amazon FBA for volume and Prime customers</li>
            <li><strong>Mid-range (£8-15):</strong> Amazon FBM or eBay depending on rarity</li>
            <li><strong>Low-value (£3-8):</strong> eBay for better margins</li>
            <li><strong>Collectibles/Signed:</strong> eBay for storytelling and global reach</li>
            <li><strong>Fast movers:</strong> Amazon FBA for quick turnover</li>
          </ul>

          <p className="text-muted-foreground leading-relaxed mt-4">
            Tools like ISBNScout let you cross-list to all platforms simultaneously, maximizing your chances of selling while optimizing for each platform's strengths.
          </p>

          <div className="bg-primary/5 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-bold mb-3">List Smarter Across All Platforms</h3>
            <p className="text-muted-foreground mb-4">
              ISBNScout automatically optimizes listings for Amazon FBA, FBM, and eBay. One-click cross-posting with platform-specific titles, keywords, and pricing strategies.
            </p>
            <Button onClick={() => setLocation("/auth")}>
              Start Multi-Platform Selling Today
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
