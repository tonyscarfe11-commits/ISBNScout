import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";

export default function BlogPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const blogPosts = [
    {
      title: "10 Tips for Profitable Book Scouting in 2025",
      excerpt: "Discover the latest strategies for finding profitable books at car boot sales, charity shops, and online marketplaces. From using technology to knowing your niches, these tips will help boost your earnings.",
      date: "January 15, 2025",
      readTime: "5 min read",
      category: "Tips & Tricks",
      slug: "/blog/book-scouting-tips",
    },
    {
      title: "How AI is Transforming Book Selling",
      excerpt: "Learn how artificial intelligence is revolutionizing the way sellers price, list, and manage their book inventory. From spine recognition to automated descriptions, AI is changing the game.",
      date: "January 10, 2025",
      readTime: "7 min read",
      category: "Technology",
      slug: "/blog/ai-transforming-book-selling",
    },
    {
      title: "Amazon FBM vs eBay: Which Platform is Right for You?",
      excerpt: "A comprehensive comparison of the major platforms for selling books online - Amazon FBM and eBay. Covering fees, reach, and seller support for UK sellers.",
      date: "January 5, 2025",
      readTime: "10 min read",
      category: "Platforms",
      slug: "/blog/amazon-fba-fbm-ebay-comparison",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 bg-slate-700 border-b border-slate-600 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")} 
            className="flex items-center gap-3 text-white hover:text-emerald-400 transition-colors"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-5 w-5" />
            <img src={logoImage} alt="ISBN Scout" className="h-8 w-8" />
            <span className="text-lg font-bold">ISBNScout</span>
          </button>
          <Button 
            onClick={() => setLocation("/auth")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-header-trial"
          >
            Start Free Trial
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-slate-700 dark:text-slate-200">ISBNScout Blog</h1>
          <p className="text-xl text-muted-foreground">
            Tips, insights, and news for UK book sellers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(post.slug)}>
              <Badge variant="secondary" className="mb-3">
                {post.category}
              </Badge>
              <h2 className="text-xl font-bold mb-3 text-slate-700 dark:text-slate-200">{post.title}</h2>
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
              <Button variant="ghost" className="mt-4 px-0 text-emerald-600 hover:text-emerald-700">
                Read More →
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16 p-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
          <h3 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">Ready to start scouting smarter?</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of UK book sellers using ISBNScout to find profitable books faster - even without phone signal.
          </p>
          <Button 
            size="lg"
            onClick={() => setLocation("/auth")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Start Your 14-Day Free Trial
          </Button>
        </div>
      </div>

      <footer className="bg-slate-700 text-slate-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="ISBN Scout" className="h-6 w-6" />
              <span className="text-white font-semibold">ISBNScout</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <button onClick={() => setLocation("/")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-home">Home</button>
              <button onClick={() => setLocation("/blog")} className="text-white font-medium" data-testid="button-footer-blog">Blog</button>
              <button onClick={() => setLocation("/privacy")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-privacy">Privacy</button>
              <button onClick={() => setLocation("/terms")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-terms">Terms</button>
              <button onClick={() => setLocation("/cookies")} className="hover:text-emerald-400 transition-colors" data-testid="button-footer-cookies">Cookies</button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-600 text-center text-sm">
            <p>© 2025 ISBNScout. All rights reserved. LillyWhiteTech</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
