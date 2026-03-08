import { useState } from "react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { User as UserIcon, LogOut, Home, Search, MessageSquare, PlusCircle, Sparkles, Wallet, Settings, AlertTriangle, Menu } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

interface HeaderProps {
  user: User | null;
}

const Header = ({ user }: HeaderProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const userType = user?.user_metadata?.user_type || "creator";
  const isCreator = userType === "creator";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const mobileNav = (
    <nav className="flex flex-col gap-2 pt-4">
      <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
        <Button variant="ghost" className="w-full justify-start">
          <Home className="h-4 w-4 mr-3" />
          Dashboard
        </Button>
      </Link>
      <Link to="/discover" onClick={() => setMobileOpen(false)}>
        <Button variant="ghost" className="w-full justify-start">
          <Search className="h-4 w-4 mr-3" />
          Découvrir
        </Button>
      </Link>
      <Link to="/messages" onClick={() => setMobileOpen(false)}>
        <Button variant="ghost" className="w-full justify-start">
          <MessageSquare className="h-4 w-4 mr-3" />
          Messages
        </Button>
      </Link>
      <Link to="/profile" onClick={() => setMobileOpen(false)}>
        <Button variant="ghost" className="w-full justify-start">
          <UserIcon className="h-4 w-4 mr-3" />
          Mon Profil
        </Button>
      </Link>
      {isCreator && (
        <Link to="/wallet" onClick={() => setMobileOpen(false)}>
          <Button variant="ghost" className="w-full justify-start">
            <Wallet className="h-4 w-4 mr-3" />
            Portefeuille
          </Button>
        </Link>
      )}

      <div className="my-2 border-t border-border" />

      {isCreator ? (
        <Link to="/create-pitch" onClick={() => setMobileOpen(false)}>
          <Button className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Créer un Pitch
          </Button>
        </Link>
      ) : (
        <Link to="/create-opportunity" onClick={() => setMobileOpen(false)}>
          <Button className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Poster une Annonce
          </Button>
        </Link>
      )}

      {isAdmin && (
        <>
          <div className="my-2 border-t border-border" />
          <p className="text-xs font-semibold text-muted-foreground px-4 mb-1">Administration</p>
          <Link to="/admin/payments" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-3" />
              Paiements
            </Button>
          </Link>
          <Link to="/admin/categories" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-3" />
              Catégories
            </Button>
          </Link>
          <Link to="/admin/disputes" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <AlertTriangle className="h-4 w-4 mr-3" />
              Litiges
            </Button>
          </Link>
        </>
      )}

      <div className="my-2 border-t border-border" />
      <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => { setMobileOpen(false); handleSignOut(); }}>
        <LogOut className="h-4 w-4 mr-3" />
        Déconnexion
      </Button>
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Partnery
          </Link>

          {/* Desktop Navigation */}
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

          <div className="flex items-center gap-2">
            {/* Desktop User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
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

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm truncate">{user?.email?.split("@")[0]}</span>
                </div>
                {mobileNav}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
