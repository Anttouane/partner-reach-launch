import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ShieldCheck, TrendingUp, Users, Eye } from "lucide-react";
import type { Candidate } from "@/hooks/useCampaignCandidates";
import { networkIcon, networkLabel, compact } from "./networkUtils";

interface Props {
  candidate: Candidate;
  onDecide: (approve: boolean) => void;
  onOpen: () => void;
  busy?: boolean;
}

const brandStatusBadge = (s: string) => {
  if (s === "approved") return <Badge>Validé</Badge>;
  if (s === "rejected") return <Badge variant="outline">Écarté</Badge>;
  return <Badge variant="secondary">À traiter</Badge>;
};

const creatorStatusLabel: Record<string, string> = {
  pending: "En attente de réponse",
  accepted: "A accepté",
  refused: "A refusé",
};

const CandidateCard = ({ candidate: c, onDecide, onOpen, busy }: Props) => {
  const NetIcon = networkIcon(c.main?.network);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
        <button onClick={onOpen} className="shrink-0 text-left">
          <Avatar className="h-16 w-16 ring-2 ring-primary/10">
            <AvatarImage src={c.avatar_url || undefined} alt={c.full_name || "Créateur"} />
            <AvatarFallback>{c.full_name?.charAt(0) || "C"}</AvatarFallback>
          </Avatar>
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onOpen} className="font-semibold hover:underline">
              {c.full_name || "Créateur"}
            </button>
            <span className="inline-flex items-center gap-1 text-xs text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Profil vérifié
            </span>
            {brandStatusBadge(c.brand_status)}
            {c.brand_status === "approved" && (
              <Badge variant="outline">{creatorStatusLabel[c.creator_status]}</Badge>
            )}
          </div>

          {c.main && (
            <a
              href={c.main.profile_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <NetIcon className="h-3.5 w-3.5" /> @{c.main.handle}
              <span className="text-xs">· {networkLabel(c.main.network)}</span>
            </a>
          )}

          {c.bio && <p className="text-sm text-muted-foreground line-clamp-2">{c.bio}</p>}

          <div className="flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-primary" /> {compact(c.main?.followers)} abonnés
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-primary" /> {compact(c.main?.avg_views)} vues moy.
            </span>
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />{" "}
              {c.main?.engagement != null ? `${c.main.engagement.toFixed(1)}%` : "—"}
            </span>
            <Badge variant="outline">Match {Math.round(c.match_score)}/100</Badge>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 sm:justify-center">
          <Button variant="ghost" size="sm" onClick={onOpen}>
            Voir la fiche
          </Button>
          {c.brand_status === "pending" && (
            <div className="flex gap-2">
              <Button size="sm" disabled={busy} onClick={() => onDecide(true)}>
                <Check className="h-4 w-4 mr-1" /> Valider
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => onDecide(false)}>
                <X className="h-4 w-4 mr-1" /> Écarter
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
