import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSuperadmin() {
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setIsSuperadmin(false); return; }
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "superadmin" as any,
        });
        if (error) { console.error(error); setIsSuperadmin(false); }
        else setIsSuperadmin(!!data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { isSuperadmin, loading };
}
