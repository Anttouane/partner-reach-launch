import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";

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
}

const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/opportunity/${opportunity.id}`)}
    >
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={opportunity.profiles?.avatar_url} />
            <AvatarFallback>{opportunity.profiles?.full_name?.charAt(0) || "M"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{opportunity.title}</CardTitle>
            <CardDescription>Par {opportunity.profiles?.full_name || "Marque"}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{opportunity.description}</p>
        {opportunity.campaign_type && <Badge>{opportunity.campaign_type}</Badge>}
        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/opportunity/${opportunity.id}`);
          }}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Voir les détails
        </Button>
      </CardContent>
    </Card>
  );
};

export default OpportunityCard;
