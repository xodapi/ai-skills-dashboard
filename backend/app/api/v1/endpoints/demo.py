"""
API endpoints with demo data.
IMPORTANT: specific sub-paths must be declared BEFORE parameterized routes.
"""
from typing import Optional
from fastapi import APIRouter, Query
from datetime import datetime

from app.demo_data import (
    generate_demo_vacancies,
    generate_skill_stats,
    generate_skill_combinations,
    generate_complexity_breakdown,
    generate_archetype_profiles,
    generate_trend_data,
)

router = APIRouter()

# ---------------------------------------------------------------------------
# Generate all demo data once at module load
# ---------------------------------------------------------------------------
DEMO_VACANCIES = generate_demo_vacancies(120)
DEMO_STATS     = generate_skill_stats(DEMO_VACANCIES)
DEMO_COMBINATIONS = generate_skill_combinations(DEMO_VACANCIES, top_n=25)
DEMO_COMPLEXITY   = generate_complexity_breakdown(DEMO_VACANCIES)
DEMO_ARCHETYPES   = generate_archetype_profiles(DEMO_VACANCIES)


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "demo_data": {"vacancies": len(DEMO_VACANCIES), "skills": len(DEMO_STATS)},
    }


# ---------------------------------------------------------------------------
# Vacancies — specific sub-paths MUST come before /{vacancy_id}
# ---------------------------------------------------------------------------

@router.get("/vacancies/complexity/breakdown")
async def get_complexity_breakdown():
    """Vacancy counts and salary by complexity level."""
    return {"complexity_breakdown": DEMO_COMPLEXITY, "total": len(DEMO_VACANCIES)}


@router.get("/vacancies/archetypes")
async def get_archetypes():
    """Per-role-archetype stats with representative skill bundles."""
    return {"archetypes": DEMO_ARCHETYPES, "total": len(DEMO_VACANCIES)}


@router.get("/vacancies/geo")
async def get_vacancies_geo(
    employment_type: Optional[str] = None,
    country: Optional[str] = None,
):
    """Geographic aggregation for world map — group by country and city."""
    filtered = DEMO_VACANCIES
    if employment_type:
        filtered = [v for v in filtered if v["employment_type"] == employment_type]
    if country:
        filtered = [v for v in filtered if v.get("country", "").lower() == country.lower()]

    # Country-level stats
    countries: dict = {}
    for v in filtered:
        c = v.get("country", "Unknown")
        if c not in countries:
            countries[c] = {"country": c, "count": 0, "cities": {}, "salaries": [],
                            "employment_types": {}}
        countries[c]["count"] += 1
        city = v["city"]
        countries[c]["cities"][city] = countries[c]["cities"].get(city, 0) + 1
        if v["salary_min"]:
            countries[c]["salaries"].append((v["salary_min"] + v["salary_max"]) / 2)
        et = v.get("employment_type", "other")
        countries[c]["employment_types"][et] = countries[c]["employment_types"].get(et, 0) + 1

    result = []
    for data in countries.values():
        sals = data.pop("salaries")
        top_cities = sorted(data.pop("cities").items(), key=lambda x: x[1], reverse=True)[:5]
        data["avg_salary"] = int(sum(sals) / len(sals)) if sals else 0
        data["top_cities"] = [{"city": c, "count": n} for c, n in top_cities]
        result.append(data)

    result.sort(key=lambda x: x["count"], reverse=True)
    return {"locations": result, "total": len(filtered)}


@router.get("/vacancies")
async def get_vacancies(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    city: Optional[str] = None,
    country: Optional[str] = None,
    skill: Optional[str] = None,
    search: Optional[str] = None,
    complexity: Optional[str] = None,
    employment_type: Optional[str] = None,
):
    """List vacancies with optional filters."""
    filtered = DEMO_VACANCIES

    if city:
        filtered = [v for v in filtered if v["city"].lower() == city.lower()]
    if country:
        filtered = [v for v in filtered if v.get("country", "").lower() == country.lower()]
    if skill:
        filtered = [v for v in filtered if skill in v["skills"]]
    if search:
        q = search.lower()
        filtered = [v for v in filtered if q in v["title"].lower() or q in v["company"].lower()]
    if complexity:
        filtered = [v for v in filtered if v.get("complexity") == complexity]
    if employment_type:
        filtered = [v for v in filtered if v.get("employment_type") == employment_type]

    total = len(filtered)
    return {"total": total, "skip": skip, "limit": limit, "items": filtered[skip: skip + limit]}


@router.get("/vacancies/{vacancy_id}")
async def get_vacancy(vacancy_id: int):
    for v in DEMO_VACANCIES:
        if v["id"] == vacancy_id:
            return v
    return {"error": "Vacancy not found"}


# ---------------------------------------------------------------------------
# Skills
# ---------------------------------------------------------------------------

@router.get("/skills/top")
async def get_top_skills(limit: int = Query(10, ge=1, le=50)):
    return {"period": "30d", "skills": DEMO_STATS[:limit]}


@router.get("/skills/combinations")
async def get_skill_combinations():
    return {"combinations": DEMO_COMBINATIONS, "total_vacancies": len(DEMO_VACANCIES)}


@router.get("/skills")
async def get_skills(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    total = len(DEMO_STATS)
    return {"total": total, "skip": skip, "limit": limit, "items": DEMO_STATS[skip: skip + limit]}


# ---------------------------------------------------------------------------
# Trends / geo / summary
# ---------------------------------------------------------------------------

@router.get("/trends")
async def get_trends(
    skill: str = Query(..., description="Skill name"),
    period: str = Query("30d", regex="^(7d|30d|90d)$"),
):
    days_map = {"7d": 7, "30d": 30, "90d": 90}
    return {
        "skill": skill,
        "period": period,
        "data_points": generate_trend_data(skill, days_map[period]),
    }


@router.get("/map/vacancies")
async def get_vacancy_map():
    city_coords = {
        "Moscow":           {"lat": 55.7558, "lng": 37.6173},
        "Saint Petersburg": {"lat": 59.9343, "lng": 30.3351},
        "Novosibirsk":      {"lat": 55.0084, "lng": 82.9357},
        "Kazan":            {"lat": 55.8304, "lng": 49.0661},
        "Nizhny Novgorod":  {"lat": 56.2965, "lng": 43.9361},
        "Yekaterinburg":    {"lat": 56.8389, "lng": 60.6057},
        "Samara":           {"lat": 53.1959, "lng": 50.1002},
        "Omsk":             {"lat": 54.9885, "lng": 73.3242},
    }
    city_stats: dict = {}
    for v in DEMO_VACANCIES:
        city = v["city"]
        if city not in city_stats:
            city_stats[city] = {
                "city": city, "country": "Russia",
                "latitude":  city_coords.get(city, {}).get("lat", 55.7558),
                "longitude": city_coords.get(city, {}).get("lng", 37.6173),
                "vacancy_count": 0, "total_salary": 0, "salary_count": 0,
            }
        city_stats[city]["vacancy_count"] += 1
        if v["salary_min"]:
            city_stats[city]["total_salary"] += (v["salary_min"] + v["salary_max"]) / 2
            city_stats[city]["salary_count"] += 1

    locations = []
    for s in city_stats.values():
        avg = int(s["total_salary"] / s["salary_count"]) if s["salary_count"] else 0
        locations.append({
            "city": s["city"], "country": s["country"],
            "latitude": s["latitude"], "longitude": s["longitude"],
            "vacancy_count": s["vacancy_count"], "avg_salary": avg,
        })
    return {"locations": locations}


@router.get("/stats/summary")
async def get_summary_stats():
    salaries = [(v["salary_min"] + v["salary_max"]) / 2 for v in DEMO_VACANCIES if v["salary_min"]]
    return {
        "total_vacancies": len(DEMO_VACANCIES),
        "total_skills": len(DEMO_STATS),
        "avg_salary": int(sum(salaries) / len(salaries)) if salaries else 0,
        "top_skills": [s["skill"] for s in DEMO_STATS[:3]],
        "last_updated": datetime.utcnow().isoformat(),
    }


@router.get("/training/modules")
async def get_training_modules():
    """Get all available training modules."""
    from app.training_exercises import TRAINING_MODULES
    
    return {
        "modules": [
            {
                "id": module_id,
                "title": module_data["title"],
                "icon": module_data["icon"],
                "level": module_data["level"],
                "exercise_count": len(module_data["exercises"])
            }
            for module_id, module_data in TRAINING_MODULES.items()
        ]
    }


@router.get("/training/modules/{skill}")
async def get_training_module(skill: str):
    """Get full training module for a specific skill."""
    from app.training_exercises import TRAINING_MODULES
    
    if skill not in TRAINING_MODULES:
        return {"error": "Module not found"}, 404
    
    return TRAINING_MODULES[skill]
