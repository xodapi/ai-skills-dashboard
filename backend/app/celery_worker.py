"""
Celery tasks for background job processing.
"""
import asyncio
from datetime import datetime, timedelta
from typing import List

from celery import Celery
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models import Vacancy, Skill, SkillTrend, vacancy_skills
from scrapers.hh_scraper import HHScraper
from scrapers.skill_extractor import SkillExtractor

# Initialize Celery
celery_app = Celery(
    "ai_skills",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "scrape-hh-vacancies": {
            "task": "app.celery_worker.scrape_hh_vacancies",
            "schedule": timedelta(minutes=settings.SCRAPE_INTERVAL_MINUTES),
        },
        "analyze-skill-trends": {
            "task": "app.celery_worker.analyze_skill_trends",
            "schedule": timedelta(hours=1),
        },
        "cleanup-old-data": {
            "task": "app.celery_worker.cleanup_old_data",
            "schedule": timedelta(days=7),
        },
    },
)


async def _scrape_and_store_vacancies():
    """Scrape HH.ru vacancies and store in database."""
    scraper = HHScraper()
    extractor = SkillExtractor()
    
    # Scrape vacancies
    raw_vacancies = await scraper.scrape_all_pages(max_pages=20)
    
    async with AsyncSessionLocal() as session:
        new_count = 0
        updated_count = 0
        
        for raw_vacancy in raw_vacancies:
            # Parse vacancy
            vacancy_data = scraper.parse_vacancy(raw_vacancy)
            
            # Check if vacancy exists
            stmt = select(Vacancy).where(
                Vacancy.external_id == vacancy_data["external_id"],
                Vacancy.source == "hh"
            )
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                # Update existing
                for key, value in vacancy_data.items():
                    setattr(existing, key, value)
                updated_count += 1
                vacancy = existing
            else:
                # Create new
                vacancy = Vacancy(**vacancy_data)
                session.add(vacancy)
                new_count += 1
            
            # Extract skills from full text
            full_text = f"{vacancy_data['title']} {vacancy_data['description']} {vacancy_data['requirements']}"
            detected_skills = extractor.extract_skills(full_text)
            
            # Link skills to vacancy
            for skill_name in detected_skills:
                # Get or create skill
                stmt = select(Skill).where(
                    func.lower(Skill.name) == func.lower(skill_name)
                )
                result = await session.execute(stmt)
                skill = result.scalar_one_or_none()
                
                if not skill:
                    normalized_name = extractor.normalize_skill_name(skill_name)
                    category = extractor.get_skill_category(skill_name)
                    
                    skill = Skill(
                        name=skill_name,
                        normalized_name=normalized_name,
                        category=category,
                    )
                    session.add(skill)
                    await session.flush()
                
                # Link skill to vacancy if not already linked
                if skill not in vacancy.skills:
                    vacancy.skills.append(skill)
        
        await session.commit()
        
        return {
            "new": new_count,
            "updated": updated_count,
            "total": len(raw_vacancies),
        }


@celery_app.task(name="app.celery_worker.scrape_hh_vacancies")
def scrape_hh_vacancies():
    """Celery task to scrape HH.ru vacancies."""
    result = asyncio.run(_scrape_and_store_vacancies())
    return result


async def _analyze_trends():
    """Analyze skill trends and store time-series data."""
    async with AsyncSessionLocal() as session:
        # Get all active skills
        stmt = select(Skill)
        result = await session.execute(stmt)
        skills = result.scalars().all()
        
        # Current time bucket (hourly)
        time_bucket = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
        
        trends_created = 0
        
        for skill in skills:
            # Count vacancies with this skill
            stmt = (
                select(func.count(vacancy_skills.c.vacancy_id))
                .where(vacancy_skills.c.skill_id == skill.id)
                .join(Vacancy, Vacancy.id == vacancy_skills.c.vacancy_id)
                .where(Vacancy.is_active == True)
            )
            result = await session.execute(stmt)
            vacancy_count = result.scalar()
            
            # Get total active vacancies
            stmt = select(func.count(Vacancy.id)).where(Vacancy.is_active == True)
            result = await session.execute(stmt)
            total_vacancies = result.scalar()
            
            if total_vacancies > 0:
                percentage = (vacancy_count / total_vacancies) * 100
                
                # Create trend record
                trend = SkillTrend(
                    skill_id=skill.id,
                    time_bucket=time_bucket,
                    vacancy_count=vacancy_count,
                    total_vacancies=total_vacancies,
                    percentage=percentage,
                    source="hh",
                )
                session.add(trend)
                trends_created += 1
        
        await session.commit()
        
        return {"trends_created": trends_created}


@celery_app.task(name="app.celery_worker.analyze_skill_trends")
def analyze_skill_trends():
    """Celery task to analyze skill trends."""
    result = asyncio.run(_analyze_trends())
    return result


async def _cleanup_old_data():
    """Archive old vacancies and clean up data."""
    cutoff_date = datetime.utcnow() - timedelta(days=730)  # 2 years
    
    async with AsyncSessionLocal() as session:
        # Mark old vacancies as archived
        stmt = select(Vacancy).where(
            Vacancy.published_at < cutoff_date,
            Vacancy.is_archived == False
        )
        result = await session.execute(stmt)
        old_vacancies = result.scalars().all()
        
        for vacancy in old_vacancies:
            vacancy.is_archived = True
            vacancy.archived_at = datetime.utcnow()
        
        await session.commit()
        
        return {"archived_count": len(old_vacancies)}


@celery_app.task(name="app.celery_worker.cleanup_old_data")
def cleanup_old_data():
    """Celery task to clean up old data."""
    result = asyncio.run(_cleanup_old_data())
    return result
