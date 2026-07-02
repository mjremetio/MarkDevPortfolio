import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Route, Switch } from "wouter";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import InteractiveBackground from "@/components/InteractiveBackground";
import CustomCursor from "@/components/CustomCursor";
import BackToTop from "@/components/BackToTop";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import { ContentLoadingProvider } from "@/contexts/ContentLoadingContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AccessibilityProvider>
          <Switch>
            <Route path="/maglogin">
              <AdminLogin />
            </Route>
            <Route path="/admin">
              <AdminDashboard />
            </Route>
            <Route path="/">
              <ContentLoadingProvider>
                {/* Fixed void backdrop layers */}
                <div className="site-bg" aria-hidden="true">
                  <div className="glow-layer" />
                </div>
                <InteractiveBackground />
                <div className="vignette" aria-hidden="true" />

                <ScrollProgressBar />
                <CustomCursor />

                <div className="portfolio-root flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">
                    <Home />
                  </main>
                  <Footer />
                </div>

                <BackToTop />
              </ContentLoadingProvider>
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
          <AccessibilityPanel />
          <Toaster />
        </AccessibilityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
