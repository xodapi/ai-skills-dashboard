"""Small, idempotent schema migrations for installations without Alembic wiring."""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

GAMIFICATION_MIGRATION = """
ALTER TABLE training_progress
    ADD COLUMN IF NOT EXISTS xp_awarded INTEGER NOT NULL DEFAULT 0;
ALTER TABLE training_progress
    ADD COLUMN IF NOT EXISTS rewarded_at TIMESTAMP;
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';
CREATE UNIQUE INDEX IF NOT EXISTS uq_progress_user_skill_module
    ON training_progress (user_id, skill, module_index);
CREATE TABLE IF NOT EXISTS user_gamification (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_key VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    unlocked_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_key)
);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges (user_id);
CREATE TABLE IF NOT EXISTS learning_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_progress_id INTEGER NOT NULL UNIQUE REFERENCES training_progress(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activity_type VARCHAR(50) NOT NULL DEFAULT 'exercise_completed',
    skill VARCHAR(100) NOT NULL,
    module_index INTEGER NOT NULL,
    xp_earned INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_activities_user_date
    ON learning_activities (user_id, activity_date);
"""


async def run_schema_migrations(connection: AsyncConnection) -> None:
    """Apply additive migrations needed by live deployments before serving traffic."""
    for statement in GAMIFICATION_MIGRATION.split(";"):
        if statement.strip():
            await connection.execute(text(statement))
