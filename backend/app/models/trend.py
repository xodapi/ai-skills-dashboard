"""
Skill trend model for time-series data (TimescaleDB hypertable).
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, Integer, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SkillTrend(Base):
    """
    Skill trend time-series data.
    
    This table will be converted to TimescaleDB hypertable.
    """
    
    __tablename__ = "skill_trends"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Time bucket
    time_bucket: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    
    # Metrics
    vacancy_count: Mapped[int] = mapped_column(Integer, default=0)
    total_vacancies: Mapped[int] = mapped_column(Integer, default=0)
    percentage: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Salary statistics
    avg_salary: Mapped[Optional[float]] = mapped_column(Float)
    median_salary: Mapped[Optional[float]] = mapped_column(Float)
    min_salary: Mapped[Optional[int]] = mapped_column(Integer)
    max_salary: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Geographic data
    city: Mapped[Optional[str]] = mapped_column(String(100))
    country: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Source
    source: Mapped[str] = mapped_column(String(50), index=True)  # hh, linkedin, etc
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship
    skill: Mapped["Skill"] = relationship(back_populates="trends")
    
    __table_args__ = (
        Index("idx_trend_skill_time", "skill_id", "time_bucket"),
        Index("idx_trend_time_bucket", "time_bucket"),
        Index("idx_trend_source", "source"),
    )
    
    def __repr__(self) -> str:
        return f"<SkillTrend(skill_id={self.skill_id}, time={self.time_bucket}, count={self.vacancy_count})>"
