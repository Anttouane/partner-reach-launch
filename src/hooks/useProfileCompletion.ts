import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileCompletionResult {
  isComplete: boolean;
  isLoading: boolean;
  userType: "creator" | "brand" | null;
}

export const useProfileCompletion = (userId: string | undefined): ProfileCompletionResult => {
  const [isComplete, setIsComplete] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<"creator" | "brand" | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const check = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, bio, user_type, category_id")
          .eq("id", userId)
          .single();

        if (!profile) {
          setIsComplete(false);
          setIsLoading(false);
          return;
        }

        setUserType(profile.user_type);

        // Common required fields
        if (!profile.full_name || !profile.bio || !profile.category_id) {
          setIsComplete(false);
          setIsLoading(false);
          return;
        }

        if (profile.user_type === "creator") {
          const { data: creatorProfile } = await supabase
            .from("creator_profiles")
            .select("instagram_handle, youtube_handle, tiktok_handle")
            .eq("id", userId)
            .maybeSingle();

          // At least one social handle required
          const hasHandle = creatorProfile && (
            creatorProfile.instagram_handle ||
            creatorProfile.youtube_handle ||
            creatorProfile.tiktok_handle
          );
          setIsComplete(!!hasHandle);
        } else {
          const { data: brandProfile } = await supabase
            .from("brand_profiles")
            .select("company_name, industry")
            .eq("id", userId)
            .maybeSingle();

          setIsComplete(!!(brandProfile?.company_name && brandProfile?.industry));
        }
      } catch {
        setIsComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    check();
  }, [userId]);

  return { isComplete, isLoading, userType };
};
