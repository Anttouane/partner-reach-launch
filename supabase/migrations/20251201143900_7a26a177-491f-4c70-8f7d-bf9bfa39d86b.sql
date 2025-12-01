-- Add context fields to conversations table to track which opportunity or pitch initiated the conversation
ALTER TABLE conversations 
ADD COLUMN opportunity_id uuid REFERENCES brand_opportunities(id) ON DELETE SET NULL,
ADD COLUMN pitch_id uuid REFERENCES pitches(id) ON DELETE SET NULL;