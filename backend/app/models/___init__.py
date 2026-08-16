"""
Database models package.
"""
from app.models.skill import Skill, vacancy_skills
from app.models.vacancy import Vacancy
from app.models.trend import SkillTrend
from app.models.user import User, TrainingProgress, user_skills, user_bookmarks

__all__ = [
    "Skill",
    "Vacancy",
    "SkillTrend",
    "User",
    "TrainingProgress",
    "vacancy_skills",
    "user_skills",
    "user_bookmarks",
]
