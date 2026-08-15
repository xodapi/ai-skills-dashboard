"""
Database models package.
"""
from app.models.skill import Skill, vacancy_skills
from app.models.vacancy import Vacancy
from app.models.trend import SkillTrend

__all__ = [
    "Skill",
    "Vacancy",
    "SkillTrend",
    "vacancy_skills",
]
