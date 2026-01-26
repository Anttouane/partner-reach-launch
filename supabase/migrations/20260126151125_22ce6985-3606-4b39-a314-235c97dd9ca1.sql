-- Create enum for contract status
CREATE TYPE public.contract_status AS ENUM (
  'draft',
  'revision_requested', 
  'ready_to_sign',
  'signed',
  'active',
  'completed',
  'disputed',
  'cancelled'
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  brand_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  status contract_status NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Section A: Parties
  brand_name TEXT,
  brand_company TEXT,
  brand_address TEXT,
  creator_name TEXT,
  creator_address TEXT,
  
  -- Section B: Campaign details
  campaign_title TEXT NOT NULL,
  campaign_description TEXT,
  deliverables TEXT[] DEFAULT '{}',
  content_types TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  deadline TIMESTAMP WITH TIME ZONE,
  usage_rights TEXT,
  exclusivity_period INTEGER, -- in days
  
  -- Section C: Financial terms
  total_amount INTEGER NOT NULL DEFAULT 0, -- in cents
  platform_commission_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  platform_commission_amount INTEGER NOT NULL DEFAULT 0,
  stripe_fee_estimate INTEGER DEFAULT 0,
  creator_net_amount INTEGER NOT NULL DEFAULT 0,
  payment_terms TEXT,
  
  -- Section D: Obligations
  brand_obligations TEXT,
  creator_obligations TEXT,
  
  -- Section E: Validation & disputes
  validation_deadline_days INTEGER DEFAULT 7,
  dispute_resolution TEXT,
  
  -- Section F: Signatures
  brand_signed_at TIMESTAMP WITH TIME ZONE,
  brand_signature_ip TEXT,
  creator_signed_at TIMESTAMP WITH TIME ZONE,
  creator_signature_ip TEXT,
  
  -- Metadata
  locked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract_changes table for version history
CREATE TABLE public.contract_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_type TEXT NOT NULL DEFAULT 'edit', -- 'edit', 'accept', 'reject'
  version INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract_comments table
CREATE TABLE public.contract_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  section TEXT NOT NULL, -- 'parties', 'campaign', 'financial', 'obligations', 'validation'
  content TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_contracts_conversation ON public.contracts(conversation_id);
CREATE INDEX idx_contracts_brand ON public.contracts(brand_id);
CREATE INDEX idx_contracts_creator ON public.contracts(creator_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contract_changes_contract ON public.contract_changes(contract_id);
CREATE INDEX idx_contract_comments_contract ON public.contract_comments(contract_id);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Users can view their contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = brand_id OR auth.uid() = creator_id);

CREATE POLICY "Brand can create contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Parties can update their contracts"
  ON public.contracts FOR UPDATE
  USING (
    (auth.uid() = brand_id OR auth.uid() = creator_id)
    AND locked_at IS NULL
  );

CREATE POLICY "Admins can view all contracts"
  ON public.contracts FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all contracts"
  ON public.contracts FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for contract_changes
CREATE POLICY "Contract parties can view changes"
  ON public.contract_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c 
      WHERE c.id = contract_changes.contract_id 
      AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid())
    )
  );

CREATE POLICY "Contract parties can insert changes"
  ON public.contract_changes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.contracts c 
      WHERE c.id = contract_changes.contract_id 
      AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid())
      AND c.locked_at IS NULL
    )
  );

-- RLS Policies for contract_comments
CREATE POLICY "Contract parties can view comments"
  ON public.contract_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c 
      WHERE c.id = contract_comments.contract_id 
      AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid())
    )
  );

CREATE POLICY "Contract parties can insert comments"
  ON public.contract_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.contracts c 
      WHERE c.id = contract_comments.contract_id 
      AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.contract_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.contract_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contract_comments_updated_at
  BEFORE UPDATE ON public.contract_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for contracts
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contract_comments;