import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut, Home, Search, MessageSquare, PlusCircle, Sparkles, Wallet, Settings, AlertTriangle } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

interface HeaderProps {
  user: User | null;
}

const Header = ({ user }: HeaderProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const userType = user?.user_metadata?.user_type || "creator";
  const isCreator = userType === "creator";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Partnery
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/discover">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Découvrir
              </Button>
            </Link>
            <Link to="/messages">
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </Link>
            {isCreator ? (
              <Link to="/create-pitch">
                <Button size="sm" className="ml-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Créer un Pitch
                </Button>
              </Link>
            ) : (
              <Link to="/create-opportunity">
                <Button size="sm" className="ml-2">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Poster une Annonce
                </Button>
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <UserIcon className="h-4 w-4 mr-2" />
                {user?.email?.split("@")[0]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <UserIcon className="h-4 w-4 mr-2" />
                Mon Profil
              </DropdownMenuItem>
              {isCreator && (
                <DropdownMenuItem onClick={() => navigate("/wallet")}>
                  <Wallet className="h-4 w-4 mr-2" />
                  Portefeuille
                </DropdownMenuItem>
              )}
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/admin/payments")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Admin - Paiements
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/categories")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Admin - Catégories
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/disputes")}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Admin - Litiges
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
