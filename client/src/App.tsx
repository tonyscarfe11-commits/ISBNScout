import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BottomNav } from "@/components/BottomNav";
import { UpdateNotification } from "@/components/UpdateNotification";

// Lazy load pages for code splitting
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ScanPage = lazy(() => import("@/pages/ScanPage"));
const ProfitCalculatorPage = lazy(() => import("@/pages/ProfitCalculatorPage"));
const HistoryPage = lazy(() => import("@/pages/HistoryPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const AlertsPage = lazy(() => import("@/pages/AlertsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const SubscriptionPage = lazy(() => import("@/pages/SubscriptionPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPost1 = lazy(() => import("@/pages/BlogPost1"));
const BlogPost2 = lazy(() => import("@/pages/BlogPost2"));
const BlogPost3 = lazy(() => import("@/pages/BlogPost3"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const CookiePolicyPage = lazy(() => import("@/pages/CookiePolicyPage"));
const SubscriptionSuccessPage = lazy(() => import("@/pages/SubscriptionSuccessPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const OfflineModePage = lazy(() => import("@/pages/OfflineModePage"));
const AmazonRedirectPage = lazy(() => import("@/pages/AmazonRedirectPage"));
const AffiliatePage = lazy(() => import("@/pages/AffiliatePage"));
const AffiliateDashboard = lazy(() => import("@/pages/AffiliateDashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <BottomNav />
    </div>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<PageLoader />}>
        <Switch>
        {/* Landing page at root */}
        <Route path="/" component={LandingPage} />
        
        {/* Public routes */}
        <Route path="/auth" component={AuthPage} />
        <Route path="/subscription" component={SubscriptionPage} />
        <Route path="/subscription/success" component={SubscriptionSuccessPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/book-scouting-tips" component={BlogPost1} />
        <Route path="/blog/ai-transforming-book-selling" component={BlogPost2} />
        <Route path="/blog/amazon-fba-fbm-ebay-comparison" component={BlogPost3} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/contact" component={FAQPage} />
        <Route path="/offline-mode" component={OfflineModePage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/cookies" component={CookiePolicyPage} />
        <Route path="/affiliates" component={AffiliatePage} />
        <Route path="/affiliate-dashboard" component={AffiliateDashboard} />
        
        {/* Amazon affiliate redirect - shareable link */}
        <Route path="/shop" component={AmazonRedirectPage} />
        <Route path="/amazon" component={AmazonRedirectPage} />

        {/* App routes */}
        <Route path="/app">
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </Route>
        <Route path="/app/dashboard">
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </Route>
        <Route path="/app/scan">
          <AppLayout>
            <ScanPage />
          </AppLayout>
        </Route>
        <Route path="/app/calculator">
          <AppLayout>
            <ProfitCalculatorPage />
          </AppLayout>
        </Route>
        <Route path="/app/history">
          <AppLayout>
            <HistoryPage />
          </AppLayout>
        </Route>
        <Route path="/app/analytics">
          <AppLayout>
            <AnalyticsPage />
          </AppLayout>
        </Route>
        <Route path="/app/alerts">
          <AppLayout>
            <AlertsPage />
          </AppLayout>
        </Route>
        <Route path="/app/settings">
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        </Route>

        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <UpdateNotification />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
