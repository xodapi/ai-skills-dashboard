"""
Authentication API endpoints.
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.oauth import get_github_oauth, GitHubOAuth
from app.core.deps import get_current_active_user
from app.models.user import User
from app.schemas.user import (
    GitHubOAuthCallback,
    TokenResponse,
    UserPrivate,
    UserCreate,
)
from app.core.config import settings


router = APIRouter()


@router.get("/github/authorize")
async def github_authorize(
    redirect_uri: Optional[str] = Query(None, description="Custom redirect URI")
) -> dict:
    """
    Get GitHub OAuth authorization URL.
    
    Returns:
        Dictionary with authorization URL
    """
    try:
        github_oauth = get_github_oauth()
        
        # Generate state for CSRF protection (in production, store this in Redis)
        state = "random_state_token"  # TODO: Generate and store properly
        
        auth_url = github_oauth.get_authorization_url(state=state)
        
        return {
            "authorization_url": auth_url,
            "state": state,
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate authorization URL: {str(e)}"
        )


@router.post("/github/callback", response_model=TokenResponse)
async def github_callback(
    callback_data: GitHubOAuthCallback,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Handle GitHub OAuth callback and create or update user.
    
    Args:
        callback_data: OAuth callback data with code
        db: Database session
        
    Returns:
        JWT token and user information
    """
    try:
        github_oauth = get_github_oauth()
        
        # Exchange code for access token
        access_token = await github_oauth.get_access_token(callback_data.code)
        
        # Get user info from GitHub
        user_info = await github_oauth.get_user_info(access_token)
        
        # Check if user exists
        result = await db.execute(
            select(User).where(User.github_id == user_info["github_id"])
        )
        user = result.scalar_one_or_none()
        
        if user:
            # Update existing user
            user.last_login = datetime.utcnow()
            user.avatar_url = user_info.get("avatar_url") or user.avatar_url
            
            # Update profile if changed on GitHub
            if user_info.get("display_name") and not user.display_name:
                user.display_name = user_info["display_name"]
            if user_info.get("bio") and not user.bio:
                user.bio = user_info["bio"]
            if user_info.get("location") and not user.location:
                user.location = user_info["location"]
            if user_info.get("website") and not user.website:
                user.website = user_info["website"]
            
            await db.commit()
            await db.refresh(user)
        else:
            # Create new user
            user = User(
                github_id=user_info["github_id"],
                username=user_info["username"],
                email=user_info.get("email"),
                avatar_url=user_info.get("avatar_url"),
                display_name=user_info.get("display_name"),
                bio=user_info.get("bio"),
                location=user_info.get("location"),
                website=user_info.get("website"),
                is_active=True,
                is_verified=True,  # GitHub users are verified
                last_login=datetime.utcnow(),
            )
            
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        # Create JWT token
        token_data = {"sub": str(user.id)}
        jwt_token = create_access_token(
            data=token_data,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return TokenResponse(
            access_token=jwt_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserPrivate.model_validate(user),
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


@router.get("/me", response_model=UserPrivate)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
) -> UserPrivate:
    """
    Get current authenticated user information.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User profile information
    """
    return UserPrivate.model_validate(current_user)


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """
    Logout current user.
    
    Note: With JWT tokens, actual logout happens on the client side
    by removing the token. This endpoint is for logging the action.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    # In a real implementation, you might want to:
    # 1. Add token to a blacklist in Redis
    # 2. Log the logout event
    # 3. Clear any server-side session data
    
    return {
        "message": "Successfully logged out",
        "user_id": current_user.id,
    }
