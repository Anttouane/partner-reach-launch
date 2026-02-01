import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contract, ContractChange, ContractComment, ContractStatus } from '@/types/contract';
import { toast } from 'sonner';

export function useContract(contractId: string | undefined) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [changes, setChanges] = useState<ContractChange[]>([]);
  const [comments, setComments] = useState<ContractComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!contractId) return;
    
    fetchContract();
    fetchChanges();
    fetchComments();
    
    // Realtime subscription for contract updates
    const contractChannel = supabase
      .channel(`contract:${contractId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contracts',
        filter: `id=eq.${contractId}`,
      }, (payload) => {
        if (payload.new) {
          setContract(payload.new as Contract);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'contract_comments',
        filter: `contract_id=eq.${contractId}`,
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(contractChannel);
    };
  }, [contractId]);

  const fetchContract = async () => {
    if (!contractId) return;
    
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .maybeSingle();

    if (error) {
      toast.error('Erreur lors du chargement du contrat');
      console.error(error);
    } else {
      setContract(data as Contract | null);
    }
    setLoading(false);
  };

  const fetchChanges = async () => {
    if (!contractId) return;
    
    const { data, error } = await supabase
      .from('contract_changes')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setChanges(data as ContractChange[]);
    }
  };

  const fetchComments = async () => {
    if (!contractId) return;
    
    const { data, error } = await supabase
      .from('contract_comments')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data as ContractComment[]);
    }
  };

  const updateContract = async (
    updates: Partial<Contract>, 
    userId: string,
    trackChanges: boolean = true
  ) => {
    if (!contract || !contractId) return false;
    
    setSaving(true);
    
    // Check if this is a substantive change that should reset signatures
    const substantiveFields = [
      'campaign_title', 'campaign_description', 'total_amount', 
      'platform_commission_rate', 'deadline', 'exclusivity_period',
      'usage_rights', 'brand_obligations', 'creator_obligations',
      'payment_terms', 'validation_deadline_days', 'dispute_resolution',
      'deliverables', 'content_types', 'platforms'
    ];
    
    const hasSubstantiveChanges = Object.keys(updates).some(key => 
      substantiveFields.includes(key) && 
      JSON.stringify(updates[key as keyof Contract]) !== JSON.stringify(contract[key as keyof Contract])
    );
    
    // Reset signatures if substantive changes were made and contract was previously signed/approved
    if (hasSubstantiveChanges && (contract.brand_signed_at || contract.creator_signed_at || contract.status === 'ready_to_sign')) {
      updates.brand_signed_at = null;
      updates.creator_signed_at = null;
      updates.brand_signature_ip = null;
      updates.creator_signature_ip = null;
      updates.status = 'revision_requested';
      updates.version = (contract.version || 1) + 1;
      toast.info('Les signatures ont été réinitialisées suite aux modifications');
    }
    
    // Track changes
    if (trackChanges) {
      const changeRecords: Omit<ContractChange, 'id' | 'created_at' | 'user'>[] = [];
      
      for (const [key, value] of Object.entries(updates)) {
        const oldValue = contract[key as keyof Contract];
        if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
          changeRecords.push({
            contract_id: contractId,
            user_id: userId,
            field_name: key,
            old_value: oldValue !== null ? String(oldValue) : null,
            new_value: value !== null ? String(value) : null,
            change_type: 'edit',
            version: contract.version,
          });
        }
      }
      
      if (changeRecords.length > 0) {
        await supabase.from('contract_changes').insert(changeRecords);
      }
    }
    
    const { error } = await supabase
      .from('contracts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', contractId);

    setSaving(false);
    
    if (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
      return false;
    }
    
    return true;
  };

  const requestRevision = async (userId: string) => {
    return updateContract(
      { status: 'revision_requested' as ContractStatus, version: (contract?.version || 1) + 1 },
      userId,
      false
    );
  };

  const approveContract = async (userId: string) => {
    return updateContract({ status: 'ready_to_sign' as ContractStatus }, userId, false);
  };

  const signContract = async (userId: string, isBrand: boolean, ipAddress: string) => {
    if (!contract) return false;
    
    const updates: Partial<Contract> = isBrand
      ? { brand_signed_at: new Date().toISOString(), brand_signature_ip: ipAddress }
      : { creator_signed_at: new Date().toISOString(), creator_signature_ip: ipAddress };
    
    // Check if both parties have signed
    const bothSigned = isBrand
      ? contract.creator_signed_at !== null
      : contract.brand_signed_at !== null;
    
    if (bothSigned) {
      updates.status = 'signed';
      updates.locked_at = new Date().toISOString();
    }
    
    return updateContract(updates, userId, false);
  };

  const addComment = async (userId: string, section: string, content: string) => {
    if (!contractId) return false;
    
    const { error } = await supabase.from('contract_comments').insert({
      contract_id: contractId,
      user_id: userId,
      section,
      content,
    });
    
    if (error) {
      toast.error('Erreur lors de l\'ajout du commentaire');
      return false;
    }
    
    await fetchComments();
    return true;
  };

  const resolveComment = async (commentId: string, userId: string) => {
    const { error } = await supabase
      .from('contract_comments')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
      })
      .eq('id', commentId);
    
    if (error) {
      toast.error('Erreur lors de la résolution');
      return false;
    }
    
    await fetchComments();
    return true;
  };

  return {
    contract,
    changes,
    comments,
    loading,
    saving,
    updateContract,
    requestRevision,
    approveContract,
    signContract,
    addComment,
    resolveComment,
    refetch: fetchContract,
  };
}
