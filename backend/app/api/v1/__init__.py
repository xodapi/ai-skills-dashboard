"""
API v1 router.
"""
from fastapi import APIRouter

# Import demo endpoints with working data
from app.api.v1.endpoints import demo

api_router = APIRouter()

# Use demo endpoints with sample data
api_router.include_router(
    demo.router,
    tags=["demo"]
)
