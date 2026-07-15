import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Route, Switch } from "wouter";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Learn from "@/pages/Learn";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import CustomCursor from "@/components/CustomCursor";
import { lazy, Suspense } from "react";
// Three.js is heavy — load the WebGL background after the initial paint.
const InteractiveBackground = lazy(() => import("@/components/InteractiveBackground"));
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
            <Route path="/learn">
              <Learn />
            </Route>
            <Route path="/">
              <ContentLoadingProvider>
                {/* Fixed void backdrop layers */}
                <div className="site-bg" aria-hidden="true">
                  <div className="glow-layer" />
                </div>
                <Suspense fallback={null}>
                  <InteractiveBackground />
                </Suspense>
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
