import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface OpportunityCardProps {
  opportunity: {
    id: string;
    title: string;
    description: string;
    campaign_type?: string;
    profiles?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  index?: number;
}

const OpportunityCard = ({ opportunity, index = 0 }: OpportunityCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card
        interactive
        glow
        className="group h-full"
        onClick={() => navigate(`/opportunity/${opportunity.id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div 
              className="relative cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if ((opportunity as any).brand_id) navigate(`/profile/${(opportunity as any).brand_id}`);
              }}
            >
              <Avatar className="h-12 w-12 ring-2 ring-secondary/10 transition-all duration-300 group-hover:ring-secondary/30">
                <AvatarImage src={opportunity.profiles?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-primary/20 text-secondary font-semibold">
                  {opportunity.profiles?.full_name?.charAt(0) || "M"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-secondary rounded-full flex items-center justify-center">
                <Building2 className="h-2.5 w-2.5 text-secondary-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate group-hover:text-secondary transition-colors">
                {opportunity.title}
              </CardTitle>
              <CardDescription 
                className="truncate cursor-pointer hover:text-secondary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if ((opportunity as any).brand_id) navigate(`/profile/${(opportunity as any).brand_id}`);
                }}
              >
                Par {opportunity.profiles?.full_name || "Marque"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {opportunity.description}
          </p>
          
          {opportunity.campaign_type && (
            <Badge className="badge-gradient">
              {opportunity.campaign_type}
            </Badge>
          )}
          
          <Button
            className="w-full group/btn"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/opportunity/${opportunity.id}`);
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
            Voir les détails
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OpportunityCard;
