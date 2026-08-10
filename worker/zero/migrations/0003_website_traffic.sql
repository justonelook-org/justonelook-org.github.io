CREATE TABLE IF NOT EXISTS website_daily_traffic (
  day TEXT PRIMARY KEY,
  homepage_views INTEGER NOT NULL DEFAULT 0 CHECK (homepage_views >= 0),
  try_it_clicks INTEGER NOT NULL DEFAULT 0 CHECK (try_it_clicks >= 0),
  zero_opens INTEGER NOT NULL DEFAULT 0 CHECK (zero_opens >= 0),
  zero_session_starts INTEGER NOT NULL DEFAULT 0 CHECK (zero_session_starts >= 0)
);
