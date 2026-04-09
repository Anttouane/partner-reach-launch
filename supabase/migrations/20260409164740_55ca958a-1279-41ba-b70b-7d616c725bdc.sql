
-- Create disputes table
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  opened_by UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolution_type TEXT,
  resolution_notes TEXT,
  admin_notes TEXT,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dispute evidence table
CREATE TABLE public.dispute_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_url TEXT,
  description TEXT NOT NULL,
  evidence_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;

-- Disputes: parties can view their disputes
CREATE POLICY "Contract parties can view disputes"
ON public.disputes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.id = disputes.contract_id
    AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid())
  )
  OR has_role(auth.uid(), 'admin')
);

-- Disputes: contract parties can open disputes
CREATE POLICY "Contract parties can open disputes"
ON public.disputes FOR INSERT
WITH CHECK (
  auth.uid() = opened_by
  AND EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.id = disputes.contract_id
    AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid())
  )
);

-- Disputes: admins can update
CREATE POLICY "Admins can update disputes"
ON public.disputes FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Evidence: parties can view
CREATE POLICY "Contract parties can view evidence"
ON public.dispute_evidence FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM disputes d
    JOIN contracts c ON c.id = d.contract_id
    WHERE d.id = dispute_evidence.dispute_id
    AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid())
  )
  OR has_role(auth.uid(), 'admin')
);

-- Evidence: parties can add
CREATE POLICY "Contract parties can add evidence"
ON public.dispute_evidence FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM disputes d
    JOIN contracts c ON c.id = d.contract_id
    WHERE d.id = dispute_evidence.dispute_id
    AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid())
    AND d.status = 'open'
  )
);

-- Trigger for updated_at on disputes
CREATE TRIGGER update_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for dispute evidence files
INSERT INTO storage.buckets (id, name, public) VALUES ('dispute-evidence', 'dispute-evidence', false);

-- Storage policies
CREATE POLICY "Users can upload dispute evidence"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dispute-evidence' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view dispute evidence"
ON storage.objects FOR SELECT
USING (bucket_id = 'dispute-evidence' AND auth.uid() IS NOT NULL);
