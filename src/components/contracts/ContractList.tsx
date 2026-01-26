import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContractStatusBadge } from './ContractStatusBadge';
import { Contract } from '@/types/contract';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Aucun contrat</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contracts.map(contract => (
        <Card
          key={contract.id}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate(`/contract/${contract.id}`)}
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{contract.campaign_title}</span>
                  <ContractStatusBadge status={contract.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {(contract.total_amount / 100).toLocaleString('fr-FR')} € ·{' '}
                  Mis à jour le {format(new Date(contract.updated_at), 'dd MMM yyyy', { locale: fr })}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
