"""
API endpoints with demo data.
"""
from typing import List, Optional
from fastapi import APIRouter, Query
from datetime import datetime

from app.demo_data import generate_demo_vacancies, generate_skill_stats, generate_trend_data

router = APIRouter()

# Generate demo data on startup
DEMO_VACANCIES = generate_demo_vacancies(100)
DEMO_STATS = generate_skill_stats(DEMO_VACANCIES)


@router.get("/vacancies")
async def get_vacancies(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    city: Optional[str] = None,
    skill: Optional[str] = None
):
    """Get list of vacancies with filters."""
    filtered = DEMO_VACANCIES
    
    if city:
        filtered = [v for v in filtered if v["city"].lower() == city.lower()]
    
    if skill:
        filtered = [v for v in filtered if skill in v["skills"]]
    
    total = len(filtered)
    items = filtered[skip:skip + limit]
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items
    }


@router.get("/vacancies/{vacancy_id}")
async def get_vacancy(vacancy_id: int):
    """Get vacancy details."""
    for vacancy in DEMO_VACANCIES:
        if vacancy["id"] == vacancy_id:
            return vacancy
    
    return {"error": "Vacancy not found"}


@router.get("/skills")
async def get_skills(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """Get list of skills with statistics."""
    total = len(DEMO_STATS)
    items = DEMO_STATS[skip:skip + limit]
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items
    }


@router.get("/skills/top")
async def get_top_skills(limit: int = Query(10, ge=1, le=50)):
    """Get top skills by demand."""
    return {
        "period": "30d",
        "skills": DEMO_STATS[:limit]
    }


@router.get("/trends")
async def get_trends(
    skill: str = Query(..., description="Skill name"),
    period: str = Query("30d", regex="^(7d|30d|90d)$")
):
    """Get skill trends over time."""
    days_map = {"7d": 7, "30d": 30, "90d": 90}
    days = days_map[period]
    
    trends = generate_trend_data(skill, days)
    
    return {
        "skill": skill,
        "period": period,
        "data_points": trends
    }


@router.get("/map/vacancies")
async def get_vacancy_map():
    """Get geographic distribution of vacancies."""
    city_stats = {}
    
    # Moscow coordinates
    city_coords = {
        "Moscow": {"lat": 55.7558, "lng": 37.6173},
        "Saint Petersburg": {"lat": 59.9343, "lng": 30.3351},
        "Novosibirsk": {"lat": 55.0084, "lng": 82.9357},
        "Kazan": {"lat": 55.8304, "lng": 49.0661},
        "Nizhny Novgorod": {"lat": 56.2965, "lng": 43.9361},
        "Yekaterinburg": {"lat": 56.8389, "lng": 60.6057},
        "Samara": {"lat": 53.1959, "lng": 50.1002},
        "Omsk": {"lat": 54.9885, "lng": 73.3242}
    }
    
    for vacancy in DEMO_VACANCIES:
        city = vacancy["city"]
        if city not in city_stats:
            city_stats[city] = {
                "city": city,
                "country": "Russia",
                "latitude": city_coords.get(city, {}).get("lat", 55.7558),
                "longitude": city_coords.get(city, {}).get("lng", 37.6173),
                "vacancy_count": 0,
                "total_salary": 0,
                "salary_count": 0
            }
        
        city_stats[city]["vacancy_count"] += 1
        if vacancy["salary_min"]:
            avg_salary = (vacancy["salary_min"] + vacancy["salary_max"]) / 2
            city_stats[city]["total_salary"] += avg_salary
            city_stats[city]["salary_count"] += 1
    
    locations = []
    for stats in city_stats.values():
        if stats["salary_count"] > 0:
            avg_salary = int(stats["total_salary"] / stats["salary_count"])
        else:
            avg_salary = 0
        
        locations.append({
            "city": stats["city"],
            "country": stats["country"],
            "latitude": stats["latitude"],
            "longitude": stats["longitude"],
            "vacancy_count": stats["vacancy_count"],
            "avg_salary": avg_salary
        })
    
    return {"locations": locations}


@router.get("/stats/summary")
async def get_summary_stats():
    """Get overall statistics."""
    total_vacancies = len(DEMO_VACANCIES)
    total_skills = len(DEMO_STATS)
    
    # Calculate averages
    salaries = [
        (v["salary_min"] + v["salary_max"]) / 2 
        for v in DEMO_VACANCIES 
        if v["salary_min"]
    ]
    avg_salary = int(sum(salaries) / len(salaries)) if salaries else 0
    
    # Top 3 skills
    top_skills = [s["skill"] for s in DEMO_STATS[:3]]
    
    return {
        "total_vacancies": total_vacancies,
        "total_skills": total_skills,
        "avg_salary": avg_salary,
        "top_skills": top_skills,
        "last_updated": datetime.utcnow().isoformat()
    }
