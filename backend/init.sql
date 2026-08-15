-- Initialize TimescaleDB extension and create hypertable for skill_trends

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Create hypertable for time-series data (after table is created by SQLAlchemy)
-- This will be executed manually or via migration
-- SELECT create_hypertable('skill_trends', 'time_bucket', if_not_exists => TRUE);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_skill_trends_time_skill ON skill_trends (time_bucket DESC, skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_trends_source ON skill_trends (source, time_bucket DESC);

-- Create materialized view for daily aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_skill_stats AS
SELECT 
    skill_id,
    source,
    time_bucket_gapfill('1 day', time_bucket) AS day,
    avg(vacancy_count) AS avg_vacancy_count,
    avg(percentage) AS avg_percentage,
    avg(avg_salary) AS avg_salary
FROM skill_trends
WHERE time_bucket > NOW() - INTERVAL '90 days'
GROUP BY skill_id, source, day
ORDER BY day DESC;

-- Create refresh policy for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS daily_skill_stats_unique 
ON daily_skill_stats (skill_id, source, day);

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_skills_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ai_skills_user;
