import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import ScrollToTop from "./components/common/ScrollToTop";
import Router from "./Router";
import "./assets/fonts.css";
import "./index.css";
import "@splidejs/splide/css";
import "./lib/changeLanguageUtils";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Router />
      </BrowserRouter>
      <Toaster />
      <Analytics />
    </QueryClientProvider>
  </StrictMode>,
);
