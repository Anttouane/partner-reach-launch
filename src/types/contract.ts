export type ContractStatus = 
  | 'draft'
  | 'revision_requested'
  | 'ready_to_sign'
  | 'signed'
  | 'active'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface Contract {
  id: string;
  conversation_id: string | null;
  brand_id: string;
  creator_id: string;
  status: ContractStatus;
  version: number;
  
  // Section A: Parties
  brand_name: string | null;
  brand_company: string | null;
  brand_address: string | null;
  creator_name: string | null;
  creator_address: string | null;
  
  // Section B: Campaign details
  campaign_title: string;
  campaign_description: string | null;
  deliverables: string[];
  content_types: string[];
  platforms: string[];
  deadline: string | null;
  usage_rights: string | null;
  exclusivity_period: number | null;
  
  // Section C: Financial terms
  total_amount: number;
  platform_commission_rate: number;
  platform_commission_amount: number;
  stripe_fee_estimate: number;
  creator_net_amount: number;
  payment_terms: string | null;
  
  // Section D: Obligations
  brand_obligations: string | null;
  creator_obligations: string | null;
  
  // Section E: Validation & disputes
  validation_deadline_days: number;
  dispute_resolution: string | null;
  
  // Section F: Signatures
  brand_signed_at: string | null;
  brand_signature_ip: string | null;
  creator_signed_at: string | null;
  creator_signature_ip: string | null;
  
  // Metadata
  locked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractChange {
  id: string;
  contract_id: string;
  user_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  change_type: 'edit' | 'accept' | 'reject';
  version: number;
  created_at: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ContractComment {
  id: string;
  contract_id: string;
  user_id: string;
  section: ContractSection;
  content: string;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export type ContractSection = 'parties' | 'campaign' | 'financial' | 'obligations' | 'validation';

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Brouillon',
  revision_requested: 'Révision demandée',
  ready_to_sign: 'Prêt à signer',
  signed: 'Signé',
  active: 'Actif',
  completed: 'Terminé',
  disputed: 'Litige',
  cancelled: 'Annulé',
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  revision_requested: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  ready_to_sign: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  signed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  active: 'bg-primary/20 text-primary',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  disputed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export const SECTION_LABELS: Record<ContractSection, string> = {
  parties: 'A. Parties',
  campaign: 'B. Détails de la campagne',
  financial: 'C. Conditions financières',
  obligations: 'D. Obligations',
  validation: 'E. Validation & litiges',
};
