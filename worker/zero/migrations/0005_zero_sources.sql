CREATE TABLE IF NOT EXISTS zero_source_daily (
  day TEXT NOT NULL,
  source TEXT NOT NULL CHECK (length(source) BETWEEN 1 AND 32),
  campaign TEXT NOT NULL DEFAULT '' CHECK (length(campaign) <= 63),
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY (day, source, campaign)
);

CREATE INDEX IF NOT EXISTS zero_source_daily_source_day
ON zero_source_daily (source, day);
