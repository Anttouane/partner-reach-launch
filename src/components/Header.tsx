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
import { User as UserIcon, LogOut, Home, MessageSquare, Settings, AlertTriangle, Menu, Wallet as WalletIcon } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import NotificationsBell from "@/components/NotificationsBell";

interface HeaderProps {
  user: User | null;
}

const Header = ({ user }: HeaderProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navLinks = (
    <>
      <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
        <Button variant="ghost" size="sm" className="w-full md:w-auto justify-start">
          <Home className="h-4 w-4 mr-2" /> Dashboard
        </Button>
      </Link>
      <Link to="/messages" onClick={() => setMobileOpen(false)}>
        <Button variant="ghost" size="sm" className="w-full md:w-auto justify-start">
          <MessageSquare className="h-4 w-4 mr-2" /> Messages
        </Button>
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Partnery
        </Link>

        <nav className="hidden md:flex items-center gap-2">{navLinks}</nav>

        <div className="flex items-center gap-2">
          {user && <NotificationsBell userId={user.id} />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <UserIcon className="h-4 w-4 mr-2" />
                {user?.email?.split("@")[0]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <UserIcon className="h-4 w-4 mr-2" /> Mon Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/wallet")}>
                <WalletIcon className="h-4 w-4 mr-2" /> Portefeuille
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/admin/payments")}>
                    <Settings className="h-4 w-4 mr-2" /> Admin - Paiements
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/categories")}>
                    <Settings className="h-4 w-4 mr-2" /> Admin - Catégories
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/disputes")}>
                    <AlertTriangle className="h-4 w-4 mr-2" /> Admin - Litiges
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-2 pt-4">
                {navLinks}
                <Link to="/profile" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <UserIcon className="h-4 w-4 mr-2" /> Mon Profil
                  </Button>
                </Link>
                <div className="border-t my-2" />
                <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={() => { setMobileOpen(false); handleSignOut(); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
