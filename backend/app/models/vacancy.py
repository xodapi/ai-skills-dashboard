"""
Vacancy model for storing job postings.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, Text, DateTime, Integer, Float, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base
from app.models.skill import vacancy_skills


class Vacancy(Base):
    """Vacancy (job posting) model."""
    
    __tablename__ = "vacancies"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    external_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    source: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # hh, linkedin, etc
    
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    company: Mapped[Optional[str]] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text)
    requirements: Mapped[Optional[str]] = mapped_column(Text)
    
    # Location
    city: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)
    
    # Salary
    salary_min: Mapped[Optional[int]] = mapped_column(Integer)
    salary_max: Mapped[Optional[int]] = mapped_column(Integer)
    salary_currency: Mapped[Optional[str]] = mapped_column(String(10))
    
    # Experience
    experience_years: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    
    # Employment type
    employment_type: Mapped[Optional[str]] = mapped_column(String(50))  # full-time, part-time, etc
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    
    # Metadata
    raw_data: Mapped[Optional[dict]] = mapped_column(JSONB)
    url: Mapped[Optional[str]] = mapped_column(String(1000))
    
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, index=True)
    archived_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    # Relationships
    skills: Mapped[List["Skill"]] = relationship(
        secondary=vacancy_skills,
        back_populates="vacancies",
        lazy="selectin"
    )
    
    __table_args__ = (
        Index("idx_vacancy_source_external_id", "source", "external_id"),
        Index("idx_vacancy_published_at", "published_at"),
        Index("idx_vacancy_is_active", "is_active"),
        Index("idx_vacancy_location", "city", "country"),
    )
    
    def __repr__(self) -> str:
        return f"<Vacancy(id={self.id}, title={self.title[:30]}, source={self.source})>"
