CREATE TABLE IF NOT EXISTS sda_sessions (
  session_hash TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  last_activity_at TEXT NOT NULL,
  redirected_to_looking INTEGER NOT NULL DEFAULT 0 CHECK (redirected_to_looking IN (0, 1)),
  formal_guidance_delivered INTEGER NOT NULL DEFAULT 0 CHECK (formal_guidance_delivered IN (0, 1)),
  daily_life_guidance_delivered INTEGER NOT NULL DEFAULT 0 CHECK (daily_life_guidance_delivered IN (0, 1)),
  post_guidance_response INTEGER NOT NULL DEFAULT 0 CHECK (post_guidance_response IN (0, 1)),
  natural_completion INTEGER NOT NULL DEFAULT 0 CHECK (natural_completion IN (0, 1)),
  first_guidance_turn INTEGER,
  message_count INTEGER NOT NULL DEFAULT 1,
  classifier_version TEXT NOT NULL,
  classification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (classification_status IN ('pending', 'classified', 'error')),
  classification_error_code TEXT
);

CREATE INDEX IF NOT EXISTS sda_sessions_started_at ON sda_sessions(started_at);

CREATE TABLE IF NOT EXISTS sda_daily_aggregates (
  day TEXT PRIMARY KEY,
  sessions INTEGER NOT NULL,
  redirected_to_looking INTEGER NOT NULL,
  formal_guidance_delivered INTEGER NOT NULL,
  daily_life_guidance_delivered INTEGER NOT NULL,
  guidance_delivered INTEGER NOT NULL,
  post_guidance_responses INTEGER NOT NULL,
  natural_completions INTEGER NOT NULL
);
