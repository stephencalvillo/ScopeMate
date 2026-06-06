-- ScopeMate Phase 2: quote improvement (photos + follow-up questions)
-- No completeness_score on projects.

CREATE TABLE IF NOT EXISTS project_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name    TEXT NOT NULL,
  mime_type    TEXT NOT NULL,
  file_size    INTEGER NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_photos_project ON project_photos(project_id);

CREATE TABLE IF NOT EXISTS follow_up_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  question       TEXT NOT NULL,
  question_type  TEXT NOT NULL DEFAULT 'text'
                 CHECK (question_type IN ('text', 'choice', 'dimension_estimate')),
  category       TEXT NOT NULL DEFAULT 'other'
                 CHECK (category IN ('dimensions', 'materials', 'timeline', 'permits', 'trade_scope', 'other')),
  choices        JSONB,
  answer         TEXT,
  skipped        BOOLEAN NOT NULL DEFAULT false,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  source         TEXT NOT NULL DEFAULT 'ai'
                 CHECK (source IN ('ai', 'homeowner')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_follow_up_questions_project ON follow_up_questions(project_id);

ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_questions ENABLE ROW LEVEL SECURITY;
