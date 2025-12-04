import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, TrendingUp } from "lucide-react";

interface PitchCardProps {
  pitch: {
    id: string;
    title: string;
    description: string;
    tags?: string[];
    estimated_reach?: number;
    profiles?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

const PitchCard = ({ pitch }: PitchCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/pitch/${pitch.id}`)}
    >
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={pitch.profiles?.avatar_url} />
            <AvatarFallback>{pitch.profiles?.full_name?.charAt(0) || "C"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{pitch.title}</CardTitle>
            <CardDescription>Par {pitch.profiles?.full_name || "Créateur"}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{pitch.description}</p>
        {pitch.tags && pitch.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pitch.tags.map((tag, i) => (
              <Badge key={i} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {pitch.estimated_reach && (
          <div className="flex items-center text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 mr-2" />
            Portée estimée : {pitch.estimated_reach.toLocaleString()}
          </div>
        )}
        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/pitch/${pitch.id}`);
          }}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Voir les détails
        </Button>
      </CardContent>
    </Card>
  );
};

export default PitchCard;
