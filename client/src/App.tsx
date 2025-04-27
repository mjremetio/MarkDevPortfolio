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
import { ThemeProvider } from "@/components/ThemeProvider";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import AccessibilityPanel from "@/components/AccessibilityPanel";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AccessibilityProvider>
          <div className="flex min-h-screen flex-col antialiased">
            <Switch>
              <Route path="/maglogin">
                <AdminLogin />
              </Route>
              <Route path="/admin">
                <AdminDashboard />
              </Route>
              <Route path="/">
                <>
                  <Header />
                  <ScrollProgressBar />
                  <InteractiveBackground />
                  <main className="flex-1">
                    <Home />
                  </main>
                  <Footer />
                </>
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </div>
          <AccessibilityPanel />
          <Toaster />
        </AccessibilityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
