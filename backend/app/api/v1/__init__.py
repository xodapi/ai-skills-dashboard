"""
API v1 router.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import vacancies, skills, trends, map_data, websocket

api_router = APIRouter()

api_router.include_router(
    vacancies.router,
    prefix="/vacancies",
    tags=["vacancies"]
)

api_router.include_router(
    skills.router,
    prefix="/skills",
    tags=["skills"]
)

api_router.include_router(
    trends.router,
    prefix="/trends",
    tags=["trends"]
)

api_router.include_router(
    map_data.router,
    prefix="/map",
    tags=["map"]
)

api_router.include_router(
    websocket.router,
    prefix="/ws",
    tags=["websocket"]
)
