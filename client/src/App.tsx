import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BottomNav } from "@/components/BottomNav";
import { UpdateNotification } from "@/components/UpdateNotification";
import DashboardPage from "@/pages/DashboardPage";
import ScanPage from "@/pages/ScanPage";
import ProfitCalculatorPage from "@/pages/ProfitCalculatorPage";
import HistoryPage from "@/pages/HistoryPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AlertsPage from "@/pages/AlertsPage";
import InventoryPage from "@/pages/InventoryPage";
import ListingsPage from "@/pages/ListingsPage";
import RepricingPage from "@/pages/RepricingPage";
import ProfitReportsPage from "@/pages/ProfitReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import AboutPage from "@/pages/AboutPage";
import BlogPage from "@/pages/BlogPage";
import BlogPost1 from "@/pages/BlogPost1";
import BlogPost2 from "@/pages/BlogPost2";
import BlogPost3 from "@/pages/BlogPost3";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import SubscriptionSuccessPage from "@/pages/SubscriptionSuccessPage";
import NotFound from "@/pages/not-found";

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
      <Switch>
        {/* Public routes */}
        <Route path="/auth" component={AuthPage} />
        <Route path="/subscription" component={SubscriptionPage} />
        <Route path="/subscription/success" component={SubscriptionSuccessPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/book-scouting-tips" component={BlogPost1} />
        <Route path="/blog/ai-transforming-book-selling" component={BlogPost2} />
        <Route path="/blog/amazon-fba-fbm-ebay-comparison" component={BlogPost3} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />

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
        <Route path="/app/inventory">
          <AppLayout>
            <InventoryPage />
          </AppLayout>
        </Route>
        <Route path="/app/listings">
          <AppLayout>
            <ListingsPage />
          </AppLayout>
        </Route>
        <Route path="/app/listings/new">
          <AppLayout>
            <ListingsPage />
          </AppLayout>
        </Route>
        <Route path="/app/repricing">
          <AppLayout>
            <RepricingPage />
          </AppLayout>
        </Route>
        <Route path="/app/reports">
          <AppLayout>
            <ProfitReportsPage />
          </AppLayout>
        </Route>
        <Route path="/app/settings">
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        </Route>

        <Route component={NotFound} />
      </Switch>
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
