"""
User profile and management API endpoints.
"""

from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_optional_user
from app.models.user import (
    LearningActivity,
    TrainingProgress,
    User,
    UserBadge,
    UserGamification,
    user_bookmarks,
    user_skills,
)
from app.services.gamification import level_details, reward_completion
from app.models.skill import Skill
from app.models.vacancy import Vacancy
from app.schemas.user import (
    UserPublic,
    UserPrivate,
    UserUpdate,
    UserSkillAdd,
    UserSkillUpdate,
    TrainingProgressCreate,
    TrainingProgressPublic,
    VacancyBookmarkCreate,
    UserStats,
    ActivityDayPublic,
    BadgePublic,
    GamificationSummary,
)

router = APIRouter()


def badge_public(badge: UserBadge) -> BadgePublic:
    """Serialize a persisted badge without exposing internal database fields."""
    return BadgePublic(
        key=badge.badge_key,
        title=badge.title,
        unlocked_at=badge.unlocked_at,
    )


def progress_public(
    progress: TrainingProgress,
    xp_earned: int = 0,
    new_badges: Optional[List[UserBadge]] = None,
) -> TrainingProgressPublic:
    """Serialize progress and attach the reward created by this request."""
    return TrainingProgressPublic.model_validate(progress).model_copy(
        update={
            "xp_earned": xp_earned,
            "new_badges": [badge_public(badge) for badge in new_badges or []],
        }
    )


# Gamification endpoints
@router.get("/me/gamification", response_model=GamificationSummary)
async def get_gamification_summary(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> GamificationSummary:
    """Get the current learner's server-authoritative XP, streaks, and badges."""
    profile_result = await db.execute(
        select(UserGamification).where(UserGamification.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    badges_result = await db.execute(
        select(UserBadge)
        .where(UserBadge.user_id == current_user.id)
        .order_by(UserBadge.unlocked_at.desc())
    )
    total_xp = profile.total_xp if profile else 0
    level, xp_in_current_level, xp_to_next_level = level_details(total_xp)
    return GamificationSummary(
        total_xp=total_xp,
        level=level,
        xp_in_current_level=xp_in_current_level,
        xp_to_next_level=xp_to_next_level,
        current_streak=profile.current_streak if profile else 0,
        longest_streak=profile.longest_streak if profile else 0,
        badges=[badge_public(badge) for badge in badges_result.scalars()],
    )


@router.get("/me/activity", response_model=List[ActivityDayPublic])
async def get_learning_activity(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    days: int = Query(91, ge=1, le=365, description="Number of trailing days"),
) -> List[ActivityDayPublic]:
    """Return daily completion and XP totals for a contribution-style heatmap."""
    since = date.today() - timedelta(days=days - 1)
    activity_result = await db.execute(
        select(
            LearningActivity.activity_date,
            func.count(LearningActivity.id),
            func.coalesce(func.sum(LearningActivity.xp_earned), 0),
        )
        .where(
            LearningActivity.user_id == current_user.id,
            LearningActivity.activity_date >= since,
        )
        .group_by(LearningActivity.activity_date)
        .order_by(LearningActivity.activity_date)
    )
    return [
        ActivityDayPublic(
            date=activity_date, completions=completions, xp_earned=xp_earned
        )
        for activity_date, completions, xp_earned in activity_result.all()
    ]


# Profile endpoints
@router.get("/{username}", response_model=UserPublic)
async def get_user_profile(
    username: str = Path(..., description="Username"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
) -> UserPublic:
    """
    Get public user profile by username.

    Args:
        username: Username to look up
        current_user: Optional current user
        db: Database session

    Returns:
        Public user profile
    """
    result = await db.execute(
        select(User).where(User.username == username, User.is_active.is_(True))
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Check if profile is public or user is viewing their own profile
    if not user.is_public and (not current_user or current_user.id != user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="This profile is private"
        )

    return UserPublic.model_validate(user)


@router.patch("/me", response_model=UserPrivate)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> UserPrivate:
    """
    Update current user's profile.

    Args:
        update_data: Profile update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated user profile
    """
    # Update fields
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)

    return UserPrivate.model_validate(current_user)


# Skills management
@router.get("/me/skills")
async def get_user_skills(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> List[dict]:
    """
    Get current user's skills with proficiency levels.

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        List of skills with proficiency levels
    """
    result = await db.execute(
        select(Skill, user_skills.c.proficiency_level, user_skills.c.created_at)
        .join(user_skills, Skill.id == user_skills.c.skill_id)
        .where(user_skills.c.user_id == current_user.id)
        .order_by(user_skills.c.created_at.desc())
    )

    skills = []
    for skill, proficiency, created_at in result.all():
        skills.append(
            {
                "skill_id": skill.id,
                "skill_name": skill.name,
                "category": skill.category,
                "proficiency_level": proficiency,
                "created_at": created_at,
            }
        )

    return skills


@router.post("/me/skills")
async def add_user_skill(
    skill_data: UserSkillAdd,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Add a skill to current user's profile.

    Args:
        skill_data: Skill to add with proficiency level
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message
    """
    # Check if skill exists
    result = await db.execute(select(Skill).where(Skill.id == skill_data.skill_id))
    skill = result.scalar_one_or_none()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found"
        )

    # Check if already added
    result = await db.execute(
        select(user_skills).where(
            and_(
                user_skills.c.user_id == current_user.id,
                user_skills.c.skill_id == skill_data.skill_id,
            )
        )
    )
    existing = result.first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill already added to profile",
        )

    # Add skill
    await db.execute(
        user_skills.insert().values(
            user_id=current_user.id,
            skill_id=skill_data.skill_id,
            proficiency_level=skill_data.proficiency_level,
        )
    )
    await db.commit()

    return {
        "message": "Skill added successfully",
        "skill_id": skill_data.skill_id,
        "skill_name": skill.name,
    }


@router.patch("/me/skills/{skill_id}")
async def update_user_skill(
    skill_id: int,
    update_data: UserSkillUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Update skill proficiency level.

    Args:
        skill_id: Skill ID
        update_data: Update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message
    """
    result = await db.execute(
        select(user_skills).where(
            and_(
                user_skills.c.user_id == current_user.id,
                user_skills.c.skill_id == skill_id,
            )
        )
    )
    existing = result.first()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found in user profile",
        )

    await db.execute(
        user_skills.update()
        .where(
            and_(
                user_skills.c.user_id == current_user.id,
                user_skills.c.skill_id == skill_id,
            )
        )
        .values(proficiency_level=update_data.proficiency_level)
    )
    await db.commit()

    return {
        "message": "Skill updated successfully",
        "skill_id": skill_id,
    }


@router.delete("/me/skills/{skill_id}")
async def remove_user_skill(
    skill_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Remove a skill from current user's profile.

    Args:
        skill_id: Skill ID to remove
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message
    """
    result = await db.execute(
        select(user_skills).where(
            and_(
                user_skills.c.user_id == current_user.id,
                user_skills.c.skill_id == skill_id,
            )
        )
    )
    existing = result.first()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found in user profile",
        )

    await db.execute(
        user_skills.delete().where(
            and_(
                user_skills.c.user_id == current_user.id,
                user_skills.c.skill_id == skill_id,
            )
        )
    )
    await db.commit()

    return {
        "message": "Skill removed successfully",
        "skill_id": skill_id,
    }


# Training progress endpoints
@router.get("/me/progress", response_model=List[TrainingProgressPublic])
async def get_training_progress(
    current_user: User = Depends(get_current_active_user),
    skill: Optional[str] = Query(None, description="Filter by skill"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
) -> List[TrainingProgressPublic]:
    """
    Get current user's training progress.

    Args:
        current_user: Current authenticated user
        skill: Optional skill filter
        completed: Optional completion status filter

    Returns:
        List of training progress records
    """
    return [
        TrainingProgressPublic.model_validate(progress)
        for progress in current_user.training_progress
        if (not skill or progress.skill == skill)
        and (completed is None or progress.completed == completed)
    ]


@router.post("/me/progress", response_model=TrainingProgressPublic)
async def create_training_progress(
    progress_data: TrainingProgressCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> TrainingProgressPublic:
    """
    Create or update training progress for a module.

    Args:
        progress_data: Progress data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created/updated progress record
    """
    # Check if progress already exists
    result = await db.execute(
        select(TrainingProgress)
        .where(
            and_(
                TrainingProgress.user_id == current_user.id,
                TrainingProgress.skill == progress_data.skill,
                TrainingProgress.module_index == progress_data.module_index,
            )
        )
        .with_for_update()
    )
    existing = result.scalar_one_or_none()

    if existing:
        was_completed = existing.completed
        # Update existing progress
        for field, value in progress_data.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)

        if progress_data.completed and not existing.completed_at:
            existing.completed_at = func.now()

        reward = (
            await reward_completion(db, existing)
            if existing.completed and not was_completed
            else None
        )
        await db.commit()
        await db.refresh(existing)
        return progress_public(
            existing,
            xp_earned=reward.xp_earned if reward else 0,
            new_badges=reward.new_badges if reward else [],
        )
    else:
        # Create new progress
        progress = TrainingProgress(
            user_id=current_user.id, **progress_data.model_dump()
        )

        if progress_data.completed:
            progress.completed_at = func.now()

        db.add(progress)
        await db.flush()
        reward = await reward_completion(db, progress) if progress.completed else None
        await db.commit()
        await db.refresh(progress)

        return progress_public(
            progress,
            xp_earned=reward.xp_earned if reward else 0,
            new_badges=reward.new_badges if reward else [],
        )


# Bookmarks endpoints
@router.get("/me/bookmarks")
async def get_bookmarked_vacancies(
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    """
    Get current user's bookmarked vacancies.

    Args:
        current_user: Current authenticated user
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        Paginated bookmarked vacancies
    """
    total = len(current_user.bookmarked_vacancies)
    vacancies = current_user.bookmarked_vacancies[skip : skip + limit]

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "vacancies": [
            {
                "id": v.id,
                "title": v.title,
                "company": v.company,
                "location": v.location,
                "salary_min": v.salary_min,
                "salary_max": v.salary_max,
                "published_at": v.published_at,
            }
            for v in vacancies
        ],
    }


@router.post("/me/bookmarks")
async def add_bookmark(
    bookmark_data: VacancyBookmarkCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Bookmark a vacancy.

    Args:
        bookmark_data: Vacancy ID to bookmark
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message
    """
    # Check if vacancy exists
    result = await db.execute(
        select(Vacancy).where(Vacancy.id == bookmark_data.vacancy_id)
    )
    vacancy = result.scalar_one_or_none()

    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vacancy not found"
        )

    # Check if already bookmarked
    result = await db.execute(
        select(user_bookmarks).where(
            and_(
                user_bookmarks.c.user_id == current_user.id,
                user_bookmarks.c.vacancy_id == bookmark_data.vacancy_id,
            )
        )
    )
    existing = result.first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Vacancy already bookmarked"
        )

    # Add bookmark
    await db.execute(
        user_bookmarks.insert().values(
            user_id=current_user.id, vacancy_id=bookmark_data.vacancy_id
        )
    )
    await db.commit()

    return {
        "message": "Vacancy bookmarked successfully",
        "vacancy_id": bookmark_data.vacancy_id,
    }


@router.delete("/me/bookmarks/{vacancy_id}")
async def remove_bookmark(
    vacancy_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Remove a bookmark.

    Args:
        vacancy_id: Vacancy ID to unbookmark
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message
    """
    result = await db.execute(
        select(user_bookmarks).where(
            and_(
                user_bookmarks.c.user_id == current_user.id,
                user_bookmarks.c.vacancy_id == vacancy_id,
            )
        )
    )
    existing = result.first()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found"
        )

    await db.execute(
        user_bookmarks.delete().where(
            and_(
                user_bookmarks.c.user_id == current_user.id,
                user_bookmarks.c.vacancy_id == vacancy_id,
            )
        )
    )
    await db.commit()

    return {
        "message": "Bookmark removed successfully",
        "vacancy_id": vacancy_id,
    }


# Stats endpoint
@router.get("/me/stats", response_model=UserStats)
async def get_user_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> UserStats:
    """
    Get current user's statistics.

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        User statistics
    """
    # Calculate stats from user data
    total_skills = len(current_user.skills)

    completed_trainings = sum(1 for p in current_user.training_progress if p.completed)

    total_time_spent = sum(
        p.time_spent_seconds or 0 for p in current_user.training_progress
    )
    total_time_spent_hours = total_time_spent / 3600

    scores = [p.score for p in current_user.training_progress if p.score is not None]
    average_score = sum(scores) / len(scores) if scores else None

    bookmarked_vacancies = len(current_user.bookmarked_vacancies)

    # Skills by category
    skills_by_category: dict[str, int] = {}
    for skill in current_user.skills:
        category = skill.category or "Other"
        skills_by_category[category] = skills_by_category.get(category, 0) + 1

    # Recent activity (last 10 items)
    recent_activity = []
    for progress in sorted(
        current_user.training_progress, key=lambda p: p.updated_at, reverse=True
    )[:10]:
        recent_activity.append(
            {
                "type": "training",
                "skill": progress.skill,
                "module_index": progress.module_index,
                "completed": progress.completed,
                "timestamp": progress.updated_at.isoformat(),
            }
        )

    return UserStats(
        total_skills=total_skills,
        completed_trainings=completed_trainings,
        total_time_spent_hours=round(total_time_spent_hours, 2),
        average_score=round(average_score, 1) if average_score else None,
        bookmarked_vacancies=bookmarked_vacancies,
        skills_by_category=skills_by_category,
        recent_activity=recent_activity,
    )
