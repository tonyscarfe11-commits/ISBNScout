import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { BookOpen, ArrowLeft, Calendar, Clock } from "lucide-react";

export default function BlogPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const blogPosts = [
    {
      title: "10 Tips for Profitable Book Scouting in 2025",
      excerpt: "Discover the latest strategies for finding profitable books at car boot sales, charity shops, and online marketplaces.",
      date: "January 15, 2025",
      readTime: "5 min read",
      category: "Tips & Tricks",
      slug: "/blog/book-scouting-tips",
    },
    {
      title: "How AI is Transforming Book Selling",
      excerpt: "Learn how artificial intelligence is revolutionizing the way sellers price, list, and manage their book inventory.",
      date: "January 10, 2025",
      readTime: "7 min read",
      category: "Technology",
      slug: "/blog/ai-transforming-book-selling",
    },
    {
      title: "Amazon FBA vs FBM vs eBay: Which Platform is Right for You?",
      excerpt: "A comprehensive comparison of the major platforms for selling books online, including Amazon FBA, FBM, and eBay - covering fees, reach, and seller support.",
      date: "January 5, 2025",
      readTime: "10 min read",
      category: "Platforms",
      slug: "/blog/amazon-fba-fbm-ebay-comparison",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ISBNScout</span>
            </div>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">ISBNScout Blog</h1>
          <p className="text-xl text-muted-foreground">
            Tips, insights, and news for book sellers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <Badge variant="secondary" className="mb-3">
                {post.category}
              </Badge>
              <h2 className="text-xl font-bold mb-3">{post.title}</h2>
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              <Button variant="ghost" className="mt-4 px-0" onClick={() => setLocation(post.slug)}>
                Read More →
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 p-8 bg-muted/50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">More content coming soon!</h3>
          <p className="text-muted-foreground mb-4">
            Subscribe to our newsletter to get notified when we publish new articles
          </p>
          <Button onClick={() => setLocation("/auth")}>
            Get Started with ISBNScout
          </Button>
        </div>
      </div>
    </div>
  );
}
