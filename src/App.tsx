import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import Messages from "./pages/Messages";
import CreatePitch from "./pages/CreatePitch";
import CreateOpportunity from "./pages/CreateOpportunity";
import SeedData from "./pages/SeedData";
import PitchDetail from "./pages/PitchDetail";
import OpportunityDetail from "./pages/OpportunityDetail";
import AdminPayments from "./pages/AdminPayments";
import AdminCategories from "./pages/AdminCategories";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/create-pitch" element={<CreatePitch />} />
          <Route path="/create-opportunity" element={<CreateOpportunity />} />
          <Route path="/pitch/:id" element={<PitchDetail />} />
          <Route path="/opportunity/:id" element={<OpportunityDetail />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/seed-data" element={<SeedData />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
