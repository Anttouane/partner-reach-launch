import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, TrendingUp, Sparkles } from "lucide-react";
import SocialLinks from "./SocialLinks";
import PortfolioPreview from "@/components/portfolio/PortfolioPreview";
import { motion } from "framer-motion";

interface PortfolioItem {
  id: string;
  image_url: string;
  title?: string;
}

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
    portfolio_items?: PortfolioItem[];
  };
  isCreator: boolean;
  index?: number;
}

const ProfileCard = ({ profile, isCreator, index = 0 }: ProfileCardProps) => {
  const navigate = useNavigate();
  const details = isCreator ? profile.creator_profiles : profile.brand_profiles;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatAudienceSize = (size: number) => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`;
    if (size >= 1000) return `${(size / 1000).toFixed(0)}K`;
    return size.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card interactive glow className="h-full overflow-hidden group">
        {/* Gradient header accent */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary/50" />
        
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={profile.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                {profile.full_name || "Sans nom"}
              </CardTitle>
              {profile.categories && (
                <Badge 
                  variant="secondary" 
                  className="mt-1.5 bg-primary/10 text-primary border-primary/20 font-medium"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {profile.categories.name}
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="line-clamp-2 mt-3 text-muted-foreground/80">
            {profile.bio || "Aucune bio disponible"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Stats for creators */}
          {isCreator && details && "audience_size" in details && (
            <div className="flex gap-3">
              {details.audience_size && (
                <div className="flex-1 bg-muted/50 rounded-lg p-3 text-center group/stat hover:bg-primary/10 transition-colors">
                  <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <div className="text-sm font-bold text-foreground">
                    {formatAudienceSize(details.audience_size)}
                  </div>
                  <div className="text-xs text-muted-foreground">abonnés</div>
                </div>
              )}
              {details.engagement_rate && (
                <div className="flex-1 bg-muted/50 rounded-lg p-3 text-center group/stat hover:bg-accent/10 transition-colors">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-accent" />
                  <div className="text-sm font-bold text-foreground">
                    {details.engagement_rate}%
                  </div>
                  <div className="text-xs text-muted-foreground">engagement</div>
                </div>
              )}
            </div>
          )}

          {/* Brand info */}
          {!isCreator && details && "company_name" in details && (
            <div className="space-y-2">
              {details.company_name && (
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {details.company_name}
                </div>
              )}
              {details.industry && (
                <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent-foreground">
                  {details.industry}
                </Badge>
              )}
            </div>
          )}

          {/* Portfolio Preview for creators */}
          {isCreator && profile.portfolio_items && profile.portfolio_items.length > 0 && (
            <PortfolioPreview items={profile.portfolio_items} />
          )}

          {/* Social Links */}
          <div className="pt-1">
            <SocialLinks
              instagram_url={profile.instagram_url}
              youtube_url={profile.youtube_url}
              twitter_url={profile.twitter_url}
              linkedin_url={profile.linkedin_url}
              website_url={profile.website_url}
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/profile/${profile.id}`)}
              >
                Voir le profil
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button 
                variant="default" 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contacter
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;
