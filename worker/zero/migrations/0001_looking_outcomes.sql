CREATE TABLE IF NOT EXISTS looking_sessions (
  session_hash TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  last_activity_at TEXT NOT NULL,
  invitation_delivered INTEGER NOT NULL DEFAULT 0 CHECK (invitation_delivered IN (0, 1)),
  invitation_delivered_at TEXT,
  post_invitation_response INTEGER NOT NULL DEFAULT 0 CHECK (post_invitation_response IN (0, 1)),
  highest_attempt_signal TEXT NOT NULL DEFAULT 'none' CHECK (highest_attempt_signal IN ('none', 'attempt_indicated', 'attempt_explicitly_reported')),
  attempt_at TEXT,
  message_count INTEGER NOT NULL DEFAULT 1,
  messages_before_attempt INTEGER,
  classifier_version TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS looking_sessions_started_at ON looking_sessions(started_at);
CREATE INDEX IF NOT EXISTS looking_sessions_attempt ON looking_sessions(highest_attempt_signal);

CREATE TABLE IF NOT EXISTS looking_daily_aggregates (
  day TEXT PRIMARY KEY,
  sessions INTEGER NOT NULL,
  invitations INTEGER NOT NULL,
  post_invitation_responses INTEGER NOT NULL,
  attempts_indicated INTEGER NOT NULL,
  attempts_explicitly_reported INTEGER NOT NULL,
  no_attempt_report INTEGER NOT NULL
);
