import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import BrandDashboard from "./BrandDashboard";
import CreatorDashboard from "./CreatorDashboard";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<"brand" | "creator" | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, full_name, category_id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile || !profile.full_name || !profile.user_type) {
        navigate("/onboarding");
        return;
      }
      setUserType(profile.user_type as "brand" | "creator");
      setLoading(false);
    })();
  }, [navigate]);

  if (loading || !user || !userType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return userType === "brand" ? <BrandDashboard user={user} /> : <CreatorDashboard user={user} />;
};

export default Dashboard;
