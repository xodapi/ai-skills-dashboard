"""Read-only administrator dashboard endpoints."""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_admin
from app.models.skill import Skill
from app.models.user import (
    TrainingProgress,
    User,
    UserBadge,
    UserGamification,
    user_bookmarks,
    user_skills,
)
from app.models.vacancy import Vacancy
from app.schemas.admin import (
    AdminStats,
    AdminUserDetail,
    AdminUsersPage,
    AdminUserSummary,
    RankedMetric,
)

router = APIRouter()


def rank_metrics(rows: list[tuple[Optional[str], int]]) -> list[RankedMetric]:
    """Convert aggregate query output into an API-safe metric list."""
    return [
        RankedMetric(name=name or "Не указано", value=int(value))
        for name, value in rows
    ]


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminStats:
    """Return platform metrics for the read-only admin dashboard."""
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()
    active_users = (
        await db.execute(select(func.count(User.id)).where(User.last_login >= week_ago))
    ).scalar_one()
    new_users = (
        await db.execute(
            select(func.count(User.id)).where(User.created_at >= month_ago)
        )
    ).scalar_one()
    total_skills = (await db.execute(select(func.count(Skill.id)))).scalar_one()
    user_skill_count = (
        await db.execute(select(func.count()).select_from(user_skills))
    ).scalar_one()
    total_progress = (
        await db.execute(select(func.count(TrainingProgress.id)))
    ).scalar_one()
    completed_progress = (
        await db.execute(
            select(func.count(TrainingProgress.id)).where(
                TrainingProgress.completed.is_(True)
            )
        )
    ).scalar_one()
    total_vacancies = (await db.execute(select(func.count(Vacancy.id)))).scalar_one()
    total_bookmarks = (
        await db.execute(select(func.count()).select_from(user_bookmarks))
    ).scalar_one()

    popular_skills = (
        await db.execute(
            select(Skill.name, func.count(user_skills.c.user_id).label("value"))
            .join(user_skills, user_skills.c.skill_id == Skill.id)
            .group_by(Skill.id, Skill.name)
            .order_by(func.count(user_skills.c.user_id).desc(), Skill.name)
            .limit(5)
        )
    ).all()
    popular_modules = (
        await db.execute(
            select(
                TrainingProgress.skill,
                func.count(TrainingProgress.id).label("value"),
            )
            .where(TrainingProgress.completed.is_(True))
            .group_by(TrainingProgress.skill)
            .order_by(func.count(TrainingProgress.id).desc(), TrainingProgress.skill)
            .limit(5)
        )
    ).all()
    top_locations = (
        await db.execute(
            select(
                func.concat_ws(", ", Vacancy.city, Vacancy.country).label("name"),
                func.count(Vacancy.id).label("value"),
            )
            .where(or_(Vacancy.city.is_not(None), Vacancy.country.is_not(None)))
            .group_by(Vacancy.city, Vacancy.country)
            .order_by(func.count(Vacancy.id).desc())
            .limit(5)
        )
    ).all()
    top_bookmarked_vacancies = (
        await db.execute(
            select(
                Vacancy.title,
                func.count(user_bookmarks.c.user_id).label("value"),
            )
            .join(user_bookmarks, user_bookmarks.c.vacancy_id == Vacancy.id)
            .group_by(Vacancy.id, Vacancy.title)
            .order_by(func.count(user_bookmarks.c.user_id).desc(), Vacancy.title)
            .limit(5)
        )
    ).all()

    return AdminStats(
        total_users=total_users,
        active_users_7d=active_users,
        new_users_30d=new_users,
        total_skills=total_skills,
        average_skills_per_user=(
            round(user_skill_count / total_users, 2) if total_users else 0
        ),
        completion_rate=(
            round(completed_progress * 100 / total_progress, 1) if total_progress else 0
        ),
        total_vacancies=total_vacancies,
        total_bookmarks=total_bookmarks,
        popular_skills=rank_metrics(popular_skills),
        popular_modules=rank_metrics(popular_modules),
        top_locations=rank_metrics(top_locations),
        top_bookmarked_vacancies=rank_metrics(top_bookmarked_vacancies),
    )


def user_summary(
    row: tuple[User, int, int, Optional[int]],
) -> AdminUserSummary:
    """Serialize a joined user aggregate row."""
    user, skills_count, completed_exercises, total_xp = row
    return AdminUserSummary(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login=user.last_login,
        skills_count=skills_count,
        completed_exercises=completed_exercises,
        total_xp=total_xp or 0,
    )


def user_aggregates_statement():
    """Build the shared user list query with scalar aggregate subqueries."""
    skills_count = (
        select(func.count())
        .select_from(user_skills)
        .where(user_skills.c.user_id == User.id)
        .scalar_subquery()
    )
    completed_exercises = (
        select(func.count(TrainingProgress.id))
        .where(
            TrainingProgress.user_id == User.id,
            TrainingProgress.completed.is_(True),
        )
        .scalar_subquery()
    )
    return select(
        User,
        skills_count.label("skills_count"),
        completed_exercises.label("completed_exercises"),
        UserGamification.total_xp,
    ).outerjoin(UserGamification, UserGamification.user_id == User.id)


@router.get("/users", response_model=AdminUsersPage)
async def list_admin_users(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, min_length=1, max_length=100),
) -> AdminUsersPage:
    """List users with pagination and optional username/name search."""
    filters = []
    if search:
        pattern = f"%{search.strip()}%"
        filters.append(
            or_(User.username.ilike(pattern), User.display_name.ilike(pattern))
        )

    count_statement = select(func.count(User.id))
    if filters:
        count_statement = count_statement.where(and_(*filters))
    total = (await db.execute(count_statement)).scalar_one()

    statement = user_aggregates_statement().order_by(User.created_at.desc())
    if filters:
        statement = statement.where(and_(*filters))
    statement = statement.offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(statement)).all()

    return AdminUsersPage(
        total=total,
        page=page,
        page_size=page_size,
        users=[user_summary(row) for row in rows],
    )


@router.get("/users/{user_id}", response_model=AdminUserDetail)
async def get_admin_user(
    user_id: int,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminUserDetail:
    """Return one user and their read-only learning summary."""
    statement = user_aggregates_statement().where(User.id == user_id)
    row = (await db.execute(statement)).one_or_none()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    summary = user_summary(row)
    user = row[0]
    profile_result = await db.execute(
        select(UserGamification).where(UserGamification.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()
    badges_count = (
        await db.execute(
            select(func.count(UserBadge.id)).where(UserBadge.user_id == user.id)
        )
    ).scalar_one()
    return AdminUserDetail(
        **summary.model_dump(),
        email=user.email,
        location=user.location,
        website=user.website,
        current_streak=profile.current_streak if profile else 0,
        longest_streak=profile.longest_streak if profile else 0,
        badges_count=badges_count,
    )
