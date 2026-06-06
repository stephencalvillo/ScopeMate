-- ScopeMate Phase 1 schema
-- User IDs use TEXT to match Clerk user IDs (e.g. user_2abc...)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT,
  role        TEXT NOT NULL DEFAULT 'homeowner'
              CHECK (role IN ('homeowner', 'contractor', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homeowner_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title                TEXT NOT NULL,
  project_type         TEXT NOT NULL,
  city                 TEXT NOT NULL,
  zip                  TEXT NOT NULL,
  original_description TEXT NOT NULL,
  ai_summary           TEXT,
  status               TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft', 'scope_ready', 'shared', 'archived')),
  share_token          TEXT UNIQUE,
  share_enabled        BOOLEAN NOT NULL DEFAULT false,
  share_expires_at     TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_homeowner ON projects(homeowner_id);
CREATE INDEX idx_projects_share_token ON projects(share_token) WHERE share_token IS NOT NULL;

CREATE TABLE scope_items (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category           TEXT NOT NULL,
  text               TEXT NOT NULL,
  source             TEXT NOT NULL DEFAULT 'ai'
                     CHECK (source IN ('ai', 'homeowner', 'contractor')),
  priority           TEXT NOT NULL DEFAULT 'recommended'
                     CHECK (priority IN ('required', 'recommended', 'optional')),
  status             TEXT NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'removed')),
  sort_order         INTEGER NOT NULL DEFAULT 0,
  needs_verification BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scope_items_project ON scope_items(project_id);

CREATE TABLE ai_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  prompt_version  TEXT NOT NULL,
  model           TEXT NOT NULL,
  input_snapshot  JSONB NOT NULL,
  output_snapshot JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_runs_project ON ai_runs(project_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER scope_items_updated_at
  BEFORE UPDATE ON scope_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
