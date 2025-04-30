
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import CallInterface from "./pages/CallInterface";
import NewCall from "./pages/NewCall";
import NotFound from "./pages/NotFound";
import Calls from "./pages/Calls";
import Settings from "./pages/Settings";
import Transcriptions from "./pages/Transcriptions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={0}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/transcriptions" element={<Transcriptions />} />
          <Route path="/call/:id" element={<CallInterface />} />
          <Route path="/new-call" element={<NewCall />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
