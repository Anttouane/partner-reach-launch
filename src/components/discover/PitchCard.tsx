import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
  index?: number;
}

const PitchCard = ({ pitch, index = 0 }: PitchCardProps) => {
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
        onClick={() => navigate(`/pitch/${pitch.id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-primary/10 transition-all duration-300 group-hover:ring-primary/30">
                <AvatarImage src={pitch.profiles?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                  {pitch.profiles?.full_name?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                {pitch.title}
              </CardTitle>
              <CardDescription className="truncate">
                Par {pitch.profiles?.full_name || "Créateur"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {pitch.description}
          </p>
          
          {pitch.tags && pitch.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pitch.tags.slice(0, 3).map((tag, i) => (
                <Badge 
                  key={i} 
                  variant="secondary"
                  className="transition-colors hover:bg-secondary/80"
                >
                  {tag}
                </Badge>
              ))}
              {pitch.tags.length > 3 && (
                <Badge variant="outline" className="text-muted-foreground">
                  +{pitch.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {pitch.estimated_reach && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Portée estimée : <span className="font-medium text-foreground">{pitch.estimated_reach.toLocaleString()}</span></span>
            </div>
          )}
          
          <Button
            className="w-full group/btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/pitch/${pitch.id}`);
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

export default PitchCard;
