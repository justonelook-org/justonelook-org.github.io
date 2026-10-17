CREATE TABLE IF NOT EXISTS unified_sessions (
  session_hash TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  last_activity_at TEXT NOT NULL,
  inward_invitation_delivered INTEGER NOT NULL DEFAULT 0 CHECK (inward_invitation_delivered IN (0, 1)),
  post_inward_invitation_response INTEGER NOT NULL DEFAULT 0 CHECK (post_inward_invitation_response IN (0, 1)),
  highest_attempt_signal TEXT NOT NULL DEFAULT 'none' CHECK (highest_attempt_signal IN ('none', 'attempt_indicated', 'attempt_explicitly_reported')),
  attempt_at TEXT,
  first_attempt_turn INTEGER,
  formal_guidance_delivered INTEGER NOT NULL DEFAULT 0 CHECK (formal_guidance_delivered IN (0, 1)),
  daily_life_guidance_delivered INTEGER NOT NULL DEFAULT 0 CHECK (daily_life_guidance_delivered IN (0, 1)),
  post_attention_guidance_response INTEGER NOT NULL DEFAULT 0 CHECK (post_attention_guidance_response IN (0, 1)),
  natural_completion INTEGER NOT NULL DEFAULT 0 CHECK (natural_completion IN (0, 1)),
  first_attention_guidance_turn INTEGER,
  message_count INTEGER NOT NULL DEFAULT 1,
  classifier_version TEXT NOT NULL,
  classification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (classification_status IN ('pending', 'classified', 'error')),
  classification_error_code TEXT
);

CREATE INDEX IF NOT EXISTS unified_sessions_started_at ON unified_sessions(started_at);

CREATE TABLE IF NOT EXISTS unified_daily_aggregates (
  day TEXT PRIMARY KEY,
  sessions INTEGER NOT NULL,
  inward_invitations INTEGER NOT NULL,
  post_inward_invitation_responses INTEGER NOT NULL,
  attempts_indicated INTEGER NOT NULL,
  attempts_explicitly_reported INTEGER NOT NULL,
  no_attempt_report INTEGER NOT NULL,
  formal_guidance_delivered INTEGER NOT NULL,
  daily_life_guidance_delivered INTEGER NOT NULL,
  attention_guidance_delivered INTEGER NOT NULL,
  post_attention_guidance_responses INTEGER NOT NULL,
  natural_completions INTEGER NOT NULL
);
