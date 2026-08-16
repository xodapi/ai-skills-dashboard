"""
API v1 router.
"""
from fastapi import APIRouter

# Import endpoints
from app.api.v1.endpoints import demo, auth, users

api_router = APIRouter()

# Authentication endpoints
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["authentication"]
)

# User endpoints
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"]
)

# Demo endpoints with sample data
api_router.include_router(
    demo.router,
    tags=["demo"]
)
