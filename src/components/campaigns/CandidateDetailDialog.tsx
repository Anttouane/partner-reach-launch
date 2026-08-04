import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ShieldCheck, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/hooks/useCampaignCandidates";
import { networkIcon, networkLabel, compact } from "./networkUtils";

interface Props {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDecide: (approve: boolean) => void;
}

const CandidateDetailDialog = ({ candidate: c, open, onOpenChange, onDecide }: Props) => {
  const [portfolio, setPortfolio] = useState<{ id: string; image_url: string; title: string | null }[]>([]);

  useEffect(() => {
    if (!c || !open) return;
    (async () => {
      const { data } = await supabase
        .from("portfolio_items")
        .select("id, image_url, title")
        .eq("creator_id", c.creator_id)
        .limit(6);
      setPortfolio(data || []);
    })();
  }, [c, open]);

  if (!c) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fiche créateur</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={c.avatar_url || undefined} alt={c.full_name || "Créateur"} />
              <AvatarFallback>{c.full_name?.charAt(0) || "C"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                {c.full_name || "Créateur"}
                <ShieldCheck className="h-4 w-4 text-primary" />
              </h3>
              {c.category_name && <p className="text-sm text-muted-foreground">{c.category_name}</p>}
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">Match {Math.round(c.match_score)}/100</Badge>
                <Badge variant="outline">{c.completed_collabs} collab(s) terminée(s)</Badge>
              </div>
            </div>
          </div>

          {c.bio && <p className="text-sm text-muted-foreground">{c.bio}</p>}

          <div className="space-y-2">
            <p className="text-sm font-medium">Réseaux vérifiés</p>
            {c.verifications.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun réseau vérifié.</p>
            )}
            {c.verifications.map((v) => {
              const Icon = networkIcon(v.network);
              return (
                <div key={v.network} className="rounded-lg border p-3 space-y-2">
                  <a
                    href={v.profile_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                  >
                    <Icon className="h-4 w-4" /> @{v.handle}
                    <span className="text-muted-foreground font-normal">{networkLabel(v.network)}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded bg-secondary/40 py-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Abonnés</p>
                      <p className="font-semibold text-sm">{compact(v.followers)}</p>
                    </div>
                    <div className="rounded bg-secondary/40 py-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Vues moy.</p>
                      <p className="font-semibold text-sm">{compact(v.avg_views)}</p>
                    </div>
                    <div className="rounded bg-secondary/40 py-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Engagement</p>
                      <p className="font-semibold text-sm">
                        {v.engagement != null ? `${v.engagement.toFixed(1)}%` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {c.rate_per_collab != null && (
            <p className="text-sm">
              Tarif indicatif du créateur : <span className="font-semibold">{c.rate_per_collab} €</span>
            </p>
          )}

          {portfolio.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Portfolio</p>
              <div className="grid grid-cols-3 gap-2">
                {portfolio.map((p) => (
                  <img
                    key={p.id}
                    src={p.image_url}
                    alt={p.title || "Contenu du créateur"}
                    loading="lazy"
                    className="h-24 w-full object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}

          {c.brand_status === "pending" && (
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => onDecide(true)}>
                <Check className="h-4 w-4 mr-1" /> Valider
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => onDecide(false)}>
                <X className="h-4 w-4 mr-1" /> Écarter
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailDialog;
