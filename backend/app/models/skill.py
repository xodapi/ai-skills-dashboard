"""
Skill model for storing normalized skill names.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, DateTime, Index, Table, Column, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# Association table for vacancy-skill many-to-many relationship
vacancy_skills = Table(
    "vacancy_skills",
    Base.metadata,
    Column("vacancy_id", ForeignKey("vacancies.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime, default=datetime.utcnow),
)


class Skill(Base):
    """Skill model."""
    
    __tablename__ = "skills"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    normalized_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    aliases: Mapped[Optional[str]] = mapped_column(String(500))  # JSON array of aliases
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    # Relationships
    vacancies: Mapped[List["Vacancy"]] = relationship(
        secondary=vacancy_skills,
        back_populates="skills",
        lazy="selectin"
    )
    
    trends: Mapped[List["SkillTrend"]] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    __table_args__ = (
        Index("idx_skill_normalized_name", "normalized_name"),
        Index("idx_skill_category", "category"),
    )
    
    def __repr__(self) -> str:
        return f"<Skill(id={self.id}, name={self.name})>"
