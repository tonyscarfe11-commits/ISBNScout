import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { BookOpen, ArrowLeft, Users, Target, Heart } from "lucide-react";

export default function AboutPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About ISBNScout</h1>
          <p className="text-xl text-muted-foreground">
            Building the future of online book selling
          </p>
        </div>

        <div className="space-y-8">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              ISBNScout was founded with a simple mission: to empower book sellers of all sizes with professional-grade tools that were previously only accessible to large enterprises. We believe that every seller, whether you're scouting at car boot sales or running a full-time Amazon FBA/FBM or eBay business, deserves access to powerful AI technology that makes your work easier and more profitable.
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Our Story</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ISBNScout was born from the frustration of spending hours manually listing books online. Our founder, a part-time book seller, was tired of typing ISBNs, researching prices across multiple platforms, and writing descriptions for hundreds of books each week.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              What started as a simple scanning tool has evolved into a comprehensive platform trusted by hundreds of sellers across the UK. We've processed over 10,000 books daily and helped our users generate millions in revenue. But we're just getting started.
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Built for Book Sellers, By Book Sellers</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every feature in ISBNScout comes from real feedback from our community of sellers. We're not just building software – we're solving the daily challenges we face ourselves in the book selling business.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Active Sellers</div>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Books Scanned Daily</div>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">£2M+</div>
                <div className="text-sm text-muted-foreground">Revenue Generated</div>
              </div>
            </div>
          </Card>

          <div className="text-center pt-8">
            <h3 className="text-xl font-semibold mb-4">Ready to join us?</h3>
            <Button size="lg" onClick={() => setLocation("/auth")}>
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
