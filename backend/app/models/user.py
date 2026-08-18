"""
User model for authentication and profile management.
"""

from datetime import date, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    String,
    Date,
    DateTime,
    Boolean,
    Text,
    Index,
    Table,
    Column,
    ForeignKey,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.skill import Skill
    from app.models.vacancy import Vacancy

# Association table for user-skill many-to-many relationship
user_skills = Table(
    "user_skills",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
    Column("proficiency_level", Integer, default=1),  # 1-5 scale
    Column("created_at", DateTime, default=datetime.utcnow),
    Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow),
)


# Association table for bookmarked vacancies
user_bookmarks = Table(
    "user_bookmarks",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column(
        "vacancy_id", ForeignKey("vacancies.id", ondelete="CASCADE"), primary_key=True
    ),
    Column("created_at", DateTime, default=datetime.utcnow),
)


class User(Base):
    """User model for authentication and profiles."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # OAuth fields
    github_id: Mapped[Optional[str]] = mapped_column(
        String(100), unique=True, index=True
    )
    username: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))

    # Profile fields
    display_name: Mapped[Optional[str]] = mapped_column(String(200))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    location: Mapped[Optional[str]] = mapped_column(String(200))
    website: Mapped[Optional[str]] = mapped_column(String(500))

    # Profile visibility
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    show_email: Mapped[bool] = mapped_column(Boolean, default=False)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Relationships
    skills: Mapped[List["Skill"]] = relationship(secondary=user_skills, lazy="selectin")

    bookmarked_vacancies: Mapped[List["Vacancy"]] = relationship(
        secondary=user_bookmarks, lazy="selectin"
    )

    training_progress: Mapped[List["TrainingProgress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )

    gamification: Mapped[Optional["UserGamification"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
        lazy="selectin",
    )

    badges: Mapped[List["UserBadge"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    learning_activities: Mapped[List["LearningActivity"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        Index("idx_user_username", "username"),
        Index("idx_user_github_id", "github_id"),
        Index("idx_user_email", "email"),
        Index("idx_user_is_public", "is_public"),
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username})>"


class TrainingProgress(Base):
    """Training progress tracking for users."""

    __tablename__ = "training_progress"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # Training module identification
    skill: Mapped[str] = mapped_column(String(100), nullable=False)
    module_index: Mapped[int] = mapped_column(Integer, nullable=False)

    # Progress tracking
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    score: Mapped[Optional[int]] = mapped_column(Integer)  # Quiz score 0-100
    time_spent_seconds: Mapped[Optional[int]] = mapped_column(Integer)

    # Exercise data (JSON)
    quiz_answers: Mapped[Optional[str]] = mapped_column(
        Text
    )  # JSON: {question_index: answer}
    code_solution: Mapped[Optional[str]] = mapped_column(Text)
    xp_awarded: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rewarded_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Timestamps
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="training_progress")

    __table_args__ = (
        Index("idx_progress_user_skill", "user_id", "skill"),
        Index("idx_progress_completed", "completed"),
        UniqueConstraint(
            "user_id", "skill", "module_index", name="uq_progress_user_skill_module"
        ),
    )

    def __repr__(self) -> str:
        return f"<TrainingProgress(id={self.id}, user_id={self.user_id}, skill={self.skill})>"


class UserGamification(Base):
    """Persistent XP and streak state for a user."""

    __tablename__ = "user_gamification"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    total_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_activity_date: Mapped[Optional[date]] = mapped_column(Date)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user: Mapped["User"] = relationship(back_populates="gamification")


class UserBadge(Base):
    """An unlocked, server-issued learning badge."""

    __tablename__ = "user_badges"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    badge_key: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    unlocked_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="badges")

    __table_args__ = (
        UniqueConstraint("user_id", "badge_key", name="uq_user_badge"),
        Index("idx_user_badges_user_id", "user_id"),
    )


class LearningActivity(Base):
    """A reward-bearing learning event, used by the activity heatmap."""

    __tablename__ = "learning_activities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    training_progress_id: Mapped[int] = mapped_column(
        ForeignKey("training_progress.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    activity_date: Mapped[date] = mapped_column(
        Date, default=date.today, nullable=False
    )
    activity_type: Mapped[str] = mapped_column(
        String(50), default="exercise_completed", nullable=False
    )
    skill: Mapped[str] = mapped_column(String(100), nullable=False)
    module_index: Mapped[int] = mapped_column(Integer, nullable=False)
    xp_earned: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="learning_activities")

    __table_args__ = (
        Index("idx_learning_activities_user_date", "user_id", "activity_date"),
    )
