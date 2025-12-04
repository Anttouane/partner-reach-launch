import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, TrendingUp } from "lucide-react";
import SocialLinks from "./SocialLinks";

interface ProfileCardProps {
  profile: {
    id: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    website_url?: string;
    categories?: { name: string };
    creator_profiles?: {
      audience_size?: number;
      engagement_rate?: number;
    };
    brand_profiles?: {
      company_name?: string;
      industry?: string;
    };
  };
  isCreator: boolean;
}

const ProfileCard = ({ profile, isCreator }: ProfileCardProps) => {
  const details = isCreator ? profile.creator_profiles : profile.brand_profiles;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{profile.full_name || "Sans nom"}</CardTitle>
            {profile.categories && (
              <Badge variant="outline" className="mt-1">
                {profile.categories.name}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2 mt-2">{profile.bio || "Aucune bio"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SocialLinks
          instagram_url={profile.instagram_url}
          youtube_url={profile.youtube_url}
          twitter_url={profile.twitter_url}
          linkedin_url={profile.linkedin_url}
          website_url={profile.website_url}
        />

        {isCreator && details && "audience_size" in details && (
          <>
            {details.audience_size && (
              <div className="text-sm">
                <Users className="h-4 w-4 inline mr-2" />
                {details.audience_size.toLocaleString()} abonnés
              </div>
            )}
            {details.engagement_rate && (
              <div className="text-sm">
                <TrendingUp className="h-4 w-4 inline mr-2" />
                {details.engagement_rate}% d'engagement
              </div>
            )}
          </>
        )}

        {!isCreator && details && "company_name" in details && (
          <>
            {details.company_name && <div className="text-sm font-medium">{details.company_name}</div>}
            {details.industry && <Badge variant="secondary">{details.industry}</Badge>}
          </>
        )}

        <Button variant="outline" className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contacter
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
