import { ContractChange } from '@/types/contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Edit, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContractHistoryProps {
  changes: ContractChange[];
}

const fieldLabels: Record<string, string> = {
  campaign_title: 'Titre de la campagne',
  campaign_description: 'Description',
  total_amount: 'Montant total',
  platform_commission_rate: 'Taux de commission',
  deadline: 'Date limite',
  exclusivity_period: 'Période d\'exclusivité',
  usage_rights: 'Droits d\'utilisation',
  brand_obligations: 'Obligations marque',
  creator_obligations: 'Obligations créateur',
  payment_terms: 'Conditions de paiement',
  validation_deadline_days: 'Délai de validation',
  dispute_resolution: 'Résolution des litiges',
  deliverables: 'Livrables',
  content_types: 'Types de contenu',
  platforms: 'Plateformes',
  brand_name: 'Nom de la marque',
  creator_name: 'Nom du créateur',
  brand_company: 'Société',
  brand_address: 'Adresse marque',
  creator_address: 'Adresse créateur',
  status: 'Statut',
  version: 'Version',
  brand_signed_at: 'Signature marque',
  creator_signed_at: 'Signature créateur',
};

const formatFieldValue = (value: string | null, fieldName: string): string => {
  if (value === null || value === 'null') return '—';
  
  // Handle amounts
  if (fieldName === 'total_amount' || fieldName === 'platform_commission_amount') {
    const num = parseInt(value);
    return isNaN(num) ? value : `${num}€`;
  }
  
  // Handle commission rate
  if (fieldName === 'platform_commission_rate') {
    return `${value}%`;
  }
  
  // Handle dates
  if (fieldName.includes('deadline') || fieldName.includes('signed_at')) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd MMM yyyy HH:mm', { locale: fr });
      }
    } catch {
      return value;
    }
  }
  
  // Handle arrays
  if (value.startsWith('[') || value.startsWith('{')) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.join(', ') || '—';
      }
    } catch {
      return value;
    }
  }
  
  // Truncate long values
  if (value.length > 100) {
    return value.substring(0, 100) + '...';
  }
  
  return value;
};

export function ContractHistory({ changes }: ContractHistoryProps) {
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // Fetch user names for the changes
  useEffect(() => {
    const fetchUserNames = async () => {
      const uniqueUserIds = [...new Set(changes.map(c => c.user_id))];
      if (uniqueUserIds.length === 0) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', uniqueUserIds);

      if (data) {
        const names: Record<string, string> = {};
        data.forEach(profile => {
          names[profile.id] = profile.full_name || 'Utilisateur';
        });
        setUserNames(names);
      }
    };

    fetchUserNames();
  }, [changes]);

  if (changes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Historique des modifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucune modification enregistrée</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group changes by date
  const groupedChanges: Record<string, ContractChange[]> = {};
  changes.forEach(change => {
    const dateKey = format(new Date(change.created_at), 'yyyy-MM-dd');
    if (!groupedChanges[dateKey]) {
      groupedChanges[dateKey] = [];
    }
    groupedChanges[dateKey].push(change);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Historique des modifications
          <Badge variant="secondary" className="ml-2">
            {changes.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedChanges).map(([dateKey, dayChanges]) => (
              <div key={dateKey}>
                <div className="sticky top-0 bg-background/95 backdrop-blur py-2 mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    {format(new Date(dateKey), 'EEEE d MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="space-y-3">
                  {dayChanges.map((change) => (
                    <div
                      key={change.id}
                      className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Edit className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3" />
                            <span className="font-medium">
                              {userNames[change.user_id] || 'Utilisateur'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(change.created_at), 'HH:mm', { locale: fr })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            v{change.version}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">
                          A modifié <span className="font-medium">{fieldLabels[change.field_name] || change.field_name}</span>
                        </p>
                        <div className="grid gap-1 text-xs">
                          {change.old_value && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground w-16">Avant:</span>
                              <span className="line-through text-muted-foreground">
                                {formatFieldValue(change.old_value, change.field_name)}
                              </span>
                            </div>
                          )}
                          {change.new_value && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground w-16">Après:</span>
                              <span className="text-foreground">
                                {formatFieldValue(change.new_value, change.field_name)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
