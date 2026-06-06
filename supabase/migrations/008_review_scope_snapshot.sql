ALTER TABLE contractor_reviews
  ADD COLUMN IF NOT EXISTS scope_snapshot JSONB;
