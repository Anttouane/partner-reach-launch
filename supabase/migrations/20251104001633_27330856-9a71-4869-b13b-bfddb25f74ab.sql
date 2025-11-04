-- Create pitches table for creators
CREATE TABLE public.pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_type TEXT,
  estimated_reach INT,
  budget_range TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create brand opportunities table
CREATE TABLE public.brand_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  campaign_type TEXT,
  budget_range TEXT,
  requirements TEXT[],
  target_audience TEXT,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(participant_1, participant_2)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Pitches policies
CREATE POLICY "Everyone can view active pitches"
  ON public.pitches FOR SELECT
  USING (status = 'active');

CREATE POLICY "Creators can insert their own pitches"
  ON public.pitches FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own pitches"
  ON public.pitches FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own pitches"
  ON public.pitches FOR DELETE
  USING (auth.uid() = creator_id);

-- Brand opportunities policies
CREATE POLICY "Everyone can view active opportunities"
  ON public.brand_opportunities FOR SELECT
  USING (status = 'active');

CREATE POLICY "Brands can insert their own opportunities"
  ON public.brand_opportunities FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their own opportunities"
  ON public.brand_opportunities FOR UPDATE
  USING (auth.uid() = brand_id);

CREATE POLICY "Brands can delete their own opportunities"
  ON public.brand_opportunities FOR DELETE
  USING (auth.uid() = brand_id);

-- Conversations policies
CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_pitches_updated_at
  BEFORE UPDATE ON public.pitches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_opportunities_updated_at
  BEFORE UPDATE ON public.brand_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();