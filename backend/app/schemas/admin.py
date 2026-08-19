"""Pydantic response models for read-only administrator APIs."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RankedMetric(BaseModel):
    """A named metric ranked by a numeric value."""

    name: str
    value: int


class AdminStats(BaseModel):
    """Read-only platform health and adoption metrics."""

    total_users: int
    active_users_7d: int
    new_users_30d: int
    total_skills: int
    average_skills_per_user: float
    completion_rate: float
    total_vacancies: int
    total_bookmarks: int
    popular_skills: list[RankedMetric]
    popular_modules: list[RankedMetric]
    top_locations: list[RankedMetric]
    top_bookmarked_vacancies: list[RankedMetric]


class AdminUserSummary(BaseModel):
    """A paginated, privacy-conscious user list row."""

    id: int
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    skills_count: int
    completed_exercises: int
    total_xp: int


class AdminUsersPage(BaseModel):
    """Paginated user list response."""

    total: int
    page: int
    page_size: int
    users: list[AdminUserSummary]


class AdminUserDetail(AdminUserSummary):
    """Expanded details available to an administrator."""

    email: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    current_streak: int
    longest_streak: int
    badges_count: int
