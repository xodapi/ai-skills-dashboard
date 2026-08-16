"""
Pydantic schemas for user-related API endpoints.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr


# User schemas
class UserBase(BaseModel):
    """Base user schema."""
    username: str = Field(..., min_length=3, max_length=100)
    email: Optional[EmailStr] = None
    display_name: Optional[str] = Field(None, max_length=200)
    bio: Optional[str] = None
    location: Optional[str] = Field(None, max_length=200)
    website: Optional[str] = Field(None, max_length=500)
    is_public: bool = True
    show_email: bool = False


class UserCreate(UserBase):
    """Schema for creating a user."""
    github_id: Optional[str] = None
    avatar_url: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    display_name: Optional[str] = Field(None, max_length=200)
    bio: Optional[str] = None
    location: Optional[str] = Field(None, max_length=200)
    website: Optional[str] = Field(None, max_length=500)
    is_public: Optional[bool] = None
    show_email: Optional[bool] = None


class UserSkill(BaseModel):
    """Schema for user skill with proficiency."""
    skill_id: int
    skill_name: str
    proficiency_level: int = Field(..., ge=1, le=5)
    created_at: datetime


class UserPublic(BaseModel):
    """Public user profile schema."""
    id: int
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}


class UserPrivate(UserPublic):
    """Private user profile schema (own profile)."""
    email: Optional[str] = None
    github_id: Optional[str] = None
    is_public: bool
    show_email: bool
    is_verified: bool
    last_login: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


# Skill management schemas
class UserSkillAdd(BaseModel):
    """Schema for adding a skill to user profile."""
    skill_id: int
    proficiency_level: int = Field(1, ge=1, le=5)


class UserSkillUpdate(BaseModel):
    """Schema for updating skill proficiency."""
    proficiency_level: int = Field(..., ge=1, le=5)


# Training progress schemas
class TrainingProgressBase(BaseModel):
    """Base training progress schema."""
    skill: str
    module_index: int
    completed: bool = False
    score: Optional[int] = Field(None, ge=0, le=100)
    time_spent_seconds: Optional[int] = None


class TrainingProgressCreate(TrainingProgressBase):
    """Schema for creating training progress."""
    quiz_answers: Optional[str] = None
    code_solution: Optional[str] = None


class TrainingProgressUpdate(BaseModel):
    """Schema for updating training progress."""
    completed: Optional[bool] = None
    score: Optional[int] = Field(None, ge=0, le=100)
    time_spent_seconds: Optional[int] = None
    quiz_answers: Optional[str] = None
    code_solution: Optional[str] = None


class TrainingProgressPublic(TrainingProgressBase):
    """Public training progress schema."""
    id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# Bookmark schemas
class VacancyBookmarkCreate(BaseModel):
    """Schema for bookmarking a vacancy."""
    vacancy_id: int


class VacancyBookmarkDelete(BaseModel):
    """Schema for removing a bookmark."""
    vacancy_id: int


# OAuth schemas
class GitHubOAuthCallback(BaseModel):
    """Schema for GitHub OAuth callback."""
    code: str
    state: Optional[str] = None


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserPrivate


# Stats schemas
class UserStats(BaseModel):
    """Schema for user statistics."""
    total_skills: int
    completed_trainings: int
    total_time_spent_hours: float
    average_score: Optional[float] = None
    bookmarked_vacancies: int
    skills_by_category: dict[str, int]
    recent_activity: List[dict]
