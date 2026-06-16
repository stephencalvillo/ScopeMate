-- Enable RLS on tables added after Phase 2.
-- No permissive policies: the app uses the service role server-side with Clerk auth checks.
-- Anon/authenticated roles are denied by default (defense-in-depth against direct PostgREST access).

ALTER TABLE contractor_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_share_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_cost_expectations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF to_regclass('public.contractor_rate_items') IS NOT NULL THEN
    ALTER TABLE contractor_rate_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
