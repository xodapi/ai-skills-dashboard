"""Server-authoritative XP, streak, badge, and activity reward logic."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import (
    LearningActivity,
    TrainingProgress,
    UserBadge,
    UserGamification,
)
from app.training_exercises import TRAINING_MODULES

DEFAULT_EXERCISE_XP = 10

BADGES = {
    "first_completion": "Первый шаг",
    "xp_100": "100 XP",
    "streak_7": "Неделя в потоке",
    "ten_completions": "Стабильный практик",
    "ai_native": "AI-Native Engineer",
}


@dataclass(frozen=True)
class RewardResult:
    """Outcome of attempting to reward a completed exercise."""

    xp_earned: int
    new_badges: list[UserBadge]


def exercise_xp(skill: str, module_index: int) -> int:
    """Return configured XP for an exercise, never trusting client input."""
    exercises = TRAINING_MODULES.get(skill, {}).get("exercises", [])
    if not 0 <= module_index < len(exercises):
        return DEFAULT_EXERCISE_XP
    configured_xp = exercises[module_index].get("xp", DEFAULT_EXERCISE_XP)
    return (
        configured_xp
        if isinstance(configured_xp, int) and configured_xp > 0
        else DEFAULT_EXERCISE_XP
    )


def level_details(total_xp: int) -> tuple[int, int, int]:
    """Calculate a simple, predictable level curve of 100 XP per level."""
    normalized_xp = max(total_xp, 0)
    level = normalized_xp // 100 + 1
    in_current_level = normalized_xp % 100
    return level, in_current_level, 100 - in_current_level


def update_streak(profile: UserGamification, activity_date: date) -> None:
    """Apply a single activity date without increasing a same-day streak twice."""
    if profile.last_activity_date == activity_date:
        return
    if profile.last_activity_date == activity_date - timedelta(days=1):
        profile.current_streak += 1
    else:
        profile.current_streak = 1
    profile.longest_streak = max(profile.longest_streak, profile.current_streak)
    profile.last_activity_date = activity_date


async def get_or_create_profile_for_update(
    db: AsyncSession,
    user_id: int,
) -> UserGamification:
    """Return a locked profile row, creating it safely for existing users."""
    await db.execute(
        insert(UserGamification)
        .values(user_id=user_id)
        .on_conflict_do_nothing(index_elements=[UserGamification.user_id])
    )
    result = await db.execute(
        select(UserGamification)
        .where(UserGamification.user_id == user_id)
        .with_for_update()
    )
    return result.scalar_one()


async def unlock_badges(
    db: AsyncSession,
    user_id: int,
    profile: UserGamification,
    progress: TrainingProgress,
) -> list[UserBadge]:
    """Unlock every badge whose condition now holds, exactly once."""
    completed_count_result = await db.execute(
        select(func.count(TrainingProgress.id)).where(
            TrainingProgress.user_id == user_id,
            TrainingProgress.completed.is_(True),
        )
    )
    completed_count = completed_count_result.scalar_one()
    badge_keys: list[str] = []
    if completed_count >= 1:
        badge_keys.append("first_completion")
    if profile.total_xp >= 100:
        badge_keys.append("xp_100")
    if profile.current_streak >= 7:
        badge_keys.append("streak_7")
    if completed_count >= 10:
        badge_keys.append("ten_completions")
    if progress.skill == "AI Native":
        badge_keys.append("ai_native")

    if not badge_keys:
        return []

    existing_result = await db.execute(
        select(UserBadge.badge_key).where(
            UserBadge.user_id == user_id,
            UserBadge.badge_key.in_(badge_keys),
        )
    )
    existing_keys = set(existing_result.scalars())
    new_badges = [
        UserBadge(user_id=user_id, badge_key=key, title=BADGES[key])
        for key in badge_keys
        if key not in existing_keys
    ]
    db.add_all(new_badges)
    await db.flush()
    return new_badges


async def reward_completion(
    db: AsyncSession,
    progress: TrainingProgress,
) -> RewardResult:
    """Award an exercise once, with the reward ledger as the idempotency guard."""
    if not progress.completed or progress.xp_awarded:
        return RewardResult(xp_earned=0, new_badges=[])

    profile = await get_or_create_profile_for_update(db, progress.user_id)
    xp_earned = exercise_xp(progress.skill, progress.module_index)
    activity_date = datetime.utcnow().date()

    progress.xp_awarded = xp_earned
    progress.rewarded_at = datetime.utcnow()
    profile.total_xp += xp_earned
    update_streak(profile, activity_date)
    db.add(
        LearningActivity(
            user_id=progress.user_id,
            training_progress_id=progress.id,
            activity_date=activity_date,
            skill=progress.skill,
            module_index=progress.module_index,
            xp_earned=xp_earned,
        )
    )
    new_badges = await unlock_badges(db, progress.user_id, profile, progress)
    return RewardResult(xp_earned=xp_earned, new_badges=new_badges)
