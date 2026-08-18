"""
Database models package.
"""

from app.models.skill import Skill, vacancy_skills
from app.models.vacancy import Vacancy
from app.models.trend import SkillTrend
from app.models.user import (
    LearningActivity,
    TrainingProgress,
    User,
    UserBadge,
    UserGamification,
    user_bookmarks,
    user_skills,
)

__all__ = [
    "Skill",
    "Vacancy",
    "SkillTrend",
    "User",
    "TrainingProgress",
    "UserGamification",
    "UserBadge",
    "LearningActivity",
    "vacancy_skills",
    "user_skills",
    "user_bookmarks",
]
