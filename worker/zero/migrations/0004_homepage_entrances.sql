ALTER TABLE website_daily_traffic
ADD COLUMN homepage_entrances INTEGER NOT NULL DEFAULT 0 CHECK (homepage_entrances >= 0);
