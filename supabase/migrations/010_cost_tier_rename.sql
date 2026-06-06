ALTER TABLE project_cost_expectations
  DROP CONSTRAINT IF EXISTS project_cost_expectations_tier_check;

UPDATE project_cost_expectations
SET tier = CASE tier
  WHEN 'essential' THEN 'builder_grade'
  WHEN 'signature' THEN 'high_end'
  ELSE tier
END;

ALTER TABLE project_cost_expectations
  ADD CONSTRAINT project_cost_expectations_tier_check
  CHECK (tier IN ('builder_grade', 'elevated', 'high_end'));
