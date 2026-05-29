import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./pages/Admin";
import Home from "./pages/Home";

const HomePage = () => <Home />;
const AboutPage = () => <Home view="sobre" />;
const ParticipatePage = () => <Home view="participar" />;
const PredictionsPage = () => <Home view="palpites" />;
const RankingPage = () => <Home view="ranking" />;

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={HomePage} />
      <Route path={"/sobre"} component={AboutPage} />
      <Route path={"/participar"} component={ParticipatePage} />
      <Route path={"/palpites"} component={PredictionsPage} />
      <Route path={"/ranking"} component={RankingPage} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
