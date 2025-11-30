import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Database, Users, Zap, Cloud, BookOpen, TrendingUp } from "lucide-react";

const features = [
  {
    section: "OFFLINE-FIRST ENGINE",
    title: "Scan anywhere.",
    description: "SQLite on-device storage keeps your scans, profit estimates, and notes safe while you're offline. Nothing syncs to the cloud until you're ready—everything syncs to the cloud.",
    points: [
      "Offline scanning for barcode, cover, and spine",
      "Local profit calculations using cached pricing",
      "Auto-sync to PostgreSQL when connection restores",
    ],
    icon: Database,
  },
  {
    section: "REAL-WORLD SOURCING",
    title: "Made for UK book hunters.",
    description: "Built specifically for how UK resellers actually work: charity shops, car-boot sales, library clear-outs, and house clearances.",
    points: [
      "Offline banner so you always know your status",
      '"Syncing..." indicator when data catches up',
      "Designed for one-handed use on mobile",
    ],
    icon: Users,
  },
];

const workflows = [
  {
    section: "PROFIT ENGINE",
    title: "Real profit, not guesswork.",
    description: "See net profit after fees and postage, estimated ROI, and buylist recommendations based on real sales data.",
    points: [
      "Amazon used price + eBay sold averages",
      "Sales velocity: how fast books actually move",
      "Real fees and postage calculations",
    ],
    icon: Zap,
  },
  {
    section: "MULTI-PLATFORM LISTING",
    title: "List directly from ISBNScout.",
    description: "Turn scans into live listings in a few taps—without bouncing between different apps and tabs.",
    points: [
      "Amazon FBM listing support",
      "eBay UK listing with titles, prices, and details filled",
    ],
    icon: Cloud,
  },
  {
    section: "AUTOMATED REPRICING",
    title: "Stay competitive on autopilot.",
    description: "Let ISBNScout monitor and update your prices automatically with guardrails to protect your margins.",
    points: [
      "Match lowest, beat by %, or beat by £",
      "Target-margin mode with minimum limits",
      "Full repricing history per listing",
    ],
    icon: TrendingUp,
  },
];

export default function OfflineModePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-8 border-slate-200 dark:border-slate-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-teal-600" />
                    <div className="text-xs text-teal-600 font-semibold uppercase tracking-wide">
                      {feature.section}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {feature.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.points.map((point, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Workflow Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              From scan to profit, in one flow.
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              ISBNScout combines live pricing, sales velocity, and automated repricing so you can decide quickly, list instantly, and stay competitive without manual price changes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {workflows.map((workflow, index) => {
              const Icon = workflow.icon;
              return (
                <Card key={index} className="p-6 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-teal-600" />
                      <div className="text-xs text-teal-600 font-semibold uppercase tracking-wide">
                        {workflow.section}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {workflow.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {workflow.description}
                    </p>
                    <ul className="space-y-2">
                      {workflow.points.map((point, i) => (
                        <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to scan smarter?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start your 14-day free trial and see how ISBNScout transforms your book scouting workflow.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/auth")}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            data-testid="button-offline-trial"
          >
            Start Free Trial
          </Button>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-700 py-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>© 2025 ISBNScout. All rights reserved.</p>
            <div className="flex justify-center gap-6">
              <button onClick={() => setLocation("/subscription")} className="hover:text-teal-600">
                Pricing
              </button>
              <button onClick={() => setLocation("/blog")} className="hover:text-teal-600">
                Docs
              </button>
              <button onClick={() => setLocation("/faq")} className="hover:text-teal-600">
                Contact
              </button>
              <button onClick={() => setLocation("/privacy")} className="hover:text-teal-600">
                Privacy
              </button>
              <button onClick={() => setLocation("/terms")} className="hover:text-teal-600">
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
