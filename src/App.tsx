import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import CampaignNew from "./pages/CampaignNew";
import CampaignDetail from "./pages/CampaignDetail";
import CampaignSwipe from "./pages/CampaignSwipe";
import CollabActive from "./pages/CollabActive";
import Admin from "./pages/Admin";
import Verify from "./pages/Verify";
import AdminPayments from "./pages/AdminPayments";
import Wallet from "./pages/Wallet";
import ContractDetail from "./pages/ContractDetail";
import Discover from "./pages/Discover";
import PublicProfile from "./pages/PublicProfile";
import OpportunityDetail from "./pages/OpportunityDetail";
import PitchDetail from "./pages/PitchDetail";
import AdminCategories from "./pages/AdminCategories";
import AdminDisputes from "./pages/AdminDisputes";
import MentionsLegales from "./pages/MentionsLegales";
import CGU from "./pages/CGU";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
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
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/contract/:id" element={<ContractDetail />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/opportunity/:id" element={<OpportunityDetail />} />
          <Route path="/pitch/:id" element={<PitchDetail />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/campaigns/new" element={<CampaignNew />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/campaigns/:id/swipe" element={<CampaignSwipe />} />
          <Route path="/collab/:id" element={<CollabActive />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
