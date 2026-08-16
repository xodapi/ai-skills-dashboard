"""
GitHub OAuth authentication utilities.
"""
from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException, status

from app.core.config import settings


class GitHubOAuth:
    """GitHub OAuth handler."""
    
    # GitHub OAuth URLs
    AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
    TOKEN_URL = "https://github.com/login/oauth/access_token"
    USER_API_URL = "https://api.github.com/user"
    USER_EMAILS_URL = "https://api.github.com/user/emails"
    
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        """
        Initialize GitHub OAuth handler.
        
        Args:
            client_id: GitHub OAuth app client ID
            client_secret: GitHub OAuth app client secret
            redirect_uri: OAuth callback redirect URI
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
    
    def get_authorization_url(self, state: Optional[str] = None) -> str:
        """
        Get GitHub OAuth authorization URL.
        
        Args:
            state: Optional state parameter for CSRF protection
            
        Returns:
            Authorization URL
        """
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "read:user user:email",
        }
        
        if state:
            params["state"] = state
        
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{self.AUTHORIZE_URL}?{query_string}"
    
    async def get_access_token(self, code: str) -> str:
        """
        Exchange authorization code for access token.
        
        Args:
            code: Authorization code from GitHub
            
        Returns:
            Access token
            
        Raises:
            HTTPException: If token exchange fails
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                headers={"Accept": "application/json"},
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to exchange code for access token"
                )
            
            data = response.json()
            
            if "error" in data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"GitHub OAuth error: {data.get('error_description', data['error'])}"
                )
            
            return data["access_token"]
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """
        Get user information from GitHub API.
        
        Args:
            access_token: GitHub access token
            
        Returns:
            User information dictionary
            
        Raises:
            HTTPException: If API request fails
        """
        async with httpx.AsyncClient() as client:
            # Get user profile
            response = await client.get(
                self.USER_API_URL,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to fetch user information"
                )
            
            user_data = response.json()
            
            # Get user emails if not public
            email = user_data.get("email")
            if not email:
                email_response = await client.get(
                    self.USER_EMAILS_URL,
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/json",
                    }
                )
                
                if email_response.status_code == 200:
                    emails = email_response.json()
                    # Get primary verified email
                    for email_data in emails:
                        if email_data.get("primary") and email_data.get("verified"):
                            email = email_data["email"]
                            break
            
            return {
                "github_id": str(user_data["id"]),
                "username": user_data["login"],
                "email": email,
                "avatar_url": user_data.get("avatar_url"),
                "display_name": user_data.get("name"),
                "bio": user_data.get("bio"),
                "location": user_data.get("location"),
                "website": user_data.get("blog"),
            }


# Initialize GitHub OAuth handler with settings
def get_github_oauth() -> GitHubOAuth:
    """Get configured GitHub OAuth handler."""
    # These should be in settings, but for now use placeholders
    client_id = getattr(settings, "GITHUB_CLIENT_ID", "")
    client_secret = getattr(settings, "GITHUB_CLIENT_SECRET", "")
    redirect_uri = getattr(settings, "GITHUB_REDIRECT_URI", "http://localhost:3000/auth/callback")
    
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitHub OAuth not configured"
        )
    
    return GitHubOAuth(
        client_id=client_id,
        client_secret=client_secret,
        redirect_uri=redirect_uri
    )
