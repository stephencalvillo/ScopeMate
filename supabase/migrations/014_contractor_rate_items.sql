CREATE TABLE IF NOT EXISTS contractor_rate_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category            TEXT NOT NULL,
  label               TEXT NOT NULL DEFAULT '',
  labor_cost          NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (labor_cost >= 0),
  material_cost       NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (material_cost >= 0),
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contractor_user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_contractor_rate_items_user
  ON contractor_rate_items(contractor_user_id);
