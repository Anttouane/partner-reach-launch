import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { ContractStatusBadge } from './ContractStatusBadge';
import { Contract } from '@/types/contract';
import { FileText, ArrowRight, Loader2, Calendar, Coins } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ContractListProps {
  userId: string;
  conversationId?: string;
  limit?: number;
}

export function ContractList({ userId, conversationId, limit }: ContractListProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, [userId, conversationId]);

  const fetchContracts = async () => {
    let query = supabase
      .from('contracts')
      .select('*')
      .or(`brand_id.eq.${userId},creator_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (!error && data) {
      setContracts(data as Contract[]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
          <FileText className="h-8 w-8 opacity-40" />
        </div>
        <p className="font-medium">Aucun contrat</p>
        <p className="text-sm mt-1">Les contrats créés apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contracts.map(contract => (
        <Card
          key={contract.id}
          interactive
          className="group"
          onClick={() => navigate(`/contract/${contract.id}`)}
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold truncate text-sm">{contract.campaign_title}</span>
                    <ContractStatusBadge status={contract.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      {(contract.total_amount / 100).toLocaleString('fr-FR')} €
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(contract.updated_at), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
