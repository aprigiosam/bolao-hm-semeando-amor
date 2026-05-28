ALTER TABLE participants
  ADD COLUMN IF NOT EXISTS donation_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS donation_received_by TEXT,
  ADD COLUMN IF NOT EXISTS donation_notes TEXT;
