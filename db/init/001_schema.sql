CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  donation_type TEXT NOT NULL,
  delivery_point TEXT NOT NULL,
  voucher_code TEXT NOT NULL,
  voucher_discount TEXT NOT NULL,
  donation_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  donation_confirmed_at TIMESTAMPTZ,
  donation_received_by TEXT,
  donation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY,
  phase TEXT NOT NULL,
  match_date DATE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score INTEGER NOT NULL CHECK (home_score >= 0),
  away_score INTEGER NOT NULL CHECK (away_score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (participant_id, match_id)
);

CREATE TABLE IF NOT EXISTS results (
  match_id INTEGER PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
  home_score INTEGER NOT NULL CHECK (home_score >= 0),
  away_score INTEGER NOT NULL CHECK (away_score >= 0),
  finished_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prediction_scores (
  prediction_id UUID PRIMARY KEY REFERENCES predictions(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  exact_score BOOLEAN NOT NULL DEFAULT FALSE,
  correct_result BOOLEAN NOT NULL DEFAULT FALSE,
  home_goals_hit BOOLEAN NOT NULL DEFAULT FALSE,
  away_goals_hit BOOLEAN NOT NULL DEFAULT FALSE,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participants_whatsapp ON participants (whatsapp);
CREATE INDEX IF NOT EXISTS idx_predictions_participant ON predictions (participant_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions (match_id);

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS participants_touch_updated_at ON participants;
CREATE TRIGGER participants_touch_updated_at
BEFORE UPDATE ON participants
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS predictions_touch_updated_at ON predictions;
CREATE TRIGGER predictions_touch_updated_at
BEFORE UPDATE ON predictions
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE OR REPLACE FUNCTION calculate_prediction_score(pred_home INTEGER, pred_away INTEGER, real_home INTEGER, real_away INTEGER)
RETURNS INTEGER AS $$
DECLARE
  points INTEGER := 0;
BEGIN
  IF pred_home = real_home AND pred_away = real_away THEN
    RETURN 5;
  END IF;

  IF sign(pred_home - pred_away) = sign(real_home - real_away) THEN
    points := points + 3;
  END IF;

  IF pred_home = real_home THEN
    points := points + 1;
  END IF;

  IF pred_away = real_away THEN
    points := points + 1;
  END IF;

  RETURN points;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE VIEW participant_ranking AS
SELECT
  p.id,
  p.code,
  p.full_name,
  p.whatsapp,
  p.donation_confirmed,
  COALESCE(SUM(ps.points), 0)::INTEGER AS total_points,
  COUNT(ps.prediction_id)::INTEGER AS scored_matches,
  COUNT(pr.id)::INTEGER AS predicted_matches
FROM participants p
LEFT JOIN predictions pr ON pr.participant_id = p.id
LEFT JOIN prediction_scores ps ON ps.prediction_id = pr.id
GROUP BY p.id, p.code, p.full_name, p.whatsapp, p.donation_confirmed
ORDER BY total_points DESC, scored_matches DESC, p.created_at ASC;
