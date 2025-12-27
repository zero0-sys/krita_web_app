import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

/* ===== LOADING INLINE (TANPA FILE BARU) ===== */
function Loading() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const t = setTimeout(() => {
      setLocation("/app");
    }, 1200);
    return () => clearTimeout(t);
  }, [setLocation]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Krita Web App</h1>
      <p>Loading drawing canvas…</p>
      <div style={{ marginTop: 12 }}>⏳</div>
    </div>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Loading} />
      <Route path="/app" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />

          {/* BASE GITHUB PAGES */}
          <WouterRouter base="/krita_web_app">
            <AppRouter />
          </WouterRouter>

        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
