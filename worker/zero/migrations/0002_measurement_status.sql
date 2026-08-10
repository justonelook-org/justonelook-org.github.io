ALTER TABLE looking_sessions ADD COLUMN classification_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (classification_status IN ('pending', 'classified', 'error'));

ALTER TABLE looking_sessions ADD COLUMN classification_error_code TEXT;
