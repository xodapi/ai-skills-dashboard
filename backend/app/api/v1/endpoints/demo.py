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
    period: str = Query("30d", pattern="^(7d|30d|90d)$"),
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
    from fastapi import HTTPException
    from app.training_exercises import TRAINING_MODULES
    
    if skill not in TRAINING_MODULES:
        raise HTTPException(status_code=404, detail=f"Module '{skill}' not found")
    
    return TRAINING_MODULES[skill]


# ---------------------------------------------------------------------------
# Salary Calculator
# ---------------------------------------------------------------------------

@router.get("/salary/calculate")
async def calculate_salary(
    skills: str = Query(..., description="Comma-separated list of skills"),
    experience_years: int = Query(2, ge=0, le=30),
    employment_type: Optional[str] = Query(None),
):
    """
    Predict salary range for a given skill set.
    Returns base prediction + per-skill salary impact (Levels.fyi style).
    """
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]

    # Build skill→salary lookup from demo data
    skill_salary_map: dict = {}
    skill_vacancy_counts: dict = {}
    for v in DEMO_VACANCIES:
        mid = (v["salary_min"] + v["salary_max"]) / 2 if v["salary_min"] else 0
        for s in v["skills"]:
            if s not in skill_salary_map:
                skill_salary_map[s] = []
                skill_vacancy_counts[s] = 0
            if mid:
                skill_salary_map[s].append(mid)
            skill_vacancy_counts[s] += 1

    # Base salary from matching vacancies
    matching = [
        v for v in DEMO_VACANCIES
        if any(s in v["skills"] for s in skill_list)
    ]
    # Stricter: vacancies that have ≥ half the requested skills
    strong_match = [
        v for v in DEMO_VACANCIES
        if sum(1 for s in skill_list if s in v["skills"]) >= max(1, len(skill_list) // 2)
    ]
    use = strong_match if strong_match else matching

    if not use:
        # No match — return market median
        all_salaries = [(v["salary_min"] + v["salary_max"]) / 2 for v in DEMO_VACANCIES if v["salary_min"]]
        base = int(sum(all_salaries) / len(all_salaries))
    else:
        salaries = [(v["salary_min"] + v["salary_max"]) / 2 for v in use if v["salary_min"]]
        base = int(sum(salaries) / len(salaries)) if salaries else 200_000

    # Experience multiplier
    exp_mult = 1.0 + min(experience_years * 0.06, 0.60)
    base = int(base * exp_mult)

    # Employment type adjustment
    type_adj = {"remote": 1.10, "hybrid": 1.05, "full-time": 1.0}
    adj = type_adj.get(employment_type or "full-time", 1.0)
    base = int(base * adj)

    # Per-skill impact: how much adding this skill increases salary
    skill_impacts = []
    for stat in DEMO_STATS:
        sname = stat["skill"]
        if sname in skill_list:
            continue  # already have it
        # Estimate: avg salary of vacancies WITH this skill vs current base
        avgs = skill_salary_map.get(sname, [])
        if avgs:
            skill_avg = sum(avgs) / len(avgs)
            delta = int(skill_avg - base / exp_mult)  # raw delta before exp mult
            if delta > 0:
                pct = round(delta / (base / exp_mult) * 100, 1)
                skill_impacts.append({
                    "skill": sname,
                    "salary_delta": int(delta * exp_mult),
                    "pct_increase": pct,
                    "vacancy_count": skill_vacancy_counts.get(sname, 0),
                })

    skill_impacts.sort(key=lambda x: x["salary_delta"], reverse=True)

    # Find matching archetypes
    matched_archetypes = []
    for arch in DEMO_ARCHETYPES:
        overlap = sum(1 for s in skill_list if s in arch["top_skills"])
        if overlap >= 2:
            matched_archetypes.append({
                "archetype_id": arch["archetype_id"],
                "archetype_label": arch["archetype_label"],
                "skill_overlap": overlap,
                "max_overlap": len(arch["top_skills"]),
                "match_pct": round(overlap / len(arch["top_skills"]) * 100),
                "avg_salary": arch["avg_salary"],
            })
    matched_archetypes.sort(key=lambda x: x["skill_overlap"], reverse=True)

    # Confidence: based on number of matching vacancies
    confidence = min(len(use) / 10, 1.0)  # 10+ matches = 100% confidence

    return {
        "input": {
            "skills": skill_list,
            "experience_years": experience_years,
            "employment_type": employment_type or "full-time",
        },
        "salary": {
            "min": int(base * 0.85),
            "median": base,
            "max": int(base * 1.25),
            "currency": "RUR",
        },
        "confidence": round(confidence, 2),
        "matching_vacancies": len(use),
        "skill_impacts": skill_impacts[:10],
        "matched_archetypes": matched_archetypes[:3],
    }


# ---------------------------------------------------------------------------
# Skills Forecast
# ---------------------------------------------------------------------------

@router.get("/skills/forecast")
async def get_skills_forecast(
    horizon: str = Query("3m", pattern="^(1m|3m|6m|12m)$"),
    top_n: int = Query(15, ge=5, le=30),
):
    """
    Forecast skill demand growth for the next N months.
    Uses a simple momentum model on demo trend data.
    """
    import math

    # Growth model: skills with rising momentum in recent data
    # Using vacancy count + salary premium as proxy for demand
    skill_data = []
    for stat in DEMO_STATS[:top_n + 10]:
        sname = stat["skill"]
        trend_days = generate_trend_data(sname, 30)

        # Calculate momentum: compare last 7 days vs previous 7 days
        recent = trend_days[-7:]
        prev = trend_days[-14:-7]
        recent_avg = sum(p["vacancy_count"] for p in recent) / 7
        prev_avg = sum(p["vacancy_count"] for p in prev) / 7
        momentum = (recent_avg - prev_avg) / max(prev_avg, 1)

        # Salary premium vs market median
        all_sals = [s["avg_salary"] for s in DEMO_STATS if s["avg_salary"] > 0]
        market_median = sorted(all_sals)[len(all_sals) // 2] if all_sals else 200_000
        salary_premium = (stat["avg_salary"] - market_median) / market_median if market_median else 0

        # Forecast growth rate
        horizon_months = {"1m": 1, "3m": 3, "6m": 6, "12m": 12}[horizon]
        base_growth = momentum * 0.7 + salary_premium * 0.3
        # Dampen extreme values
        forecast_growth = math.tanh(base_growth * 3) * 0.4  # max ±40%

        skill_data.append({
            "skill": sname,
            "current_demand": stat["percentage"],
            "current_vacancies": stat["vacancy_count"],
            "avg_salary": stat["avg_salary"],
            "momentum_30d": round(momentum * 100, 1),
            "salary_premium_pct": round(salary_premium * 100, 1),
            "forecast_growth_pct": round(forecast_growth * 100, 1),
            "forecast_vacancies": max(0, int(stat["vacancy_count"] * (1 + forecast_growth))),
            "trend": "rising" if forecast_growth > 0.05 else "falling" if forecast_growth < -0.05 else "stable",
        })

    skill_data.sort(key=lambda x: x["forecast_growth_pct"], reverse=True)

    return {
        "horizon": horizon,
        "generated_at": datetime.utcnow().isoformat(),
        "skills": skill_data[:top_n],
        "rising_count": sum(1 for s in skill_data[:top_n] if s["trend"] == "rising"),
        "falling_count": sum(1 for s in skill_data[:top_n] if s["trend"] == "falling"),
        "stable_count": sum(1 for s in skill_data[:top_n] if s["trend"] == "stable"),
    }


# ---------------------------------------------------------------------------
# GitHub skills import
# ---------------------------------------------------------------------------

@router.get("/github/skills")
async def import_github_skills(
    username: str = Query(..., description="GitHub username"),
):
    """
    Infer skills from a GitHub user's public repositories.
    Maps repo languages and topics to ML/AI skill names.
    """
    import httpx

    LANG_TO_SKILLS: dict = {
        "Python":     ["Python"],
        "Jupyter Notebook": ["Python", "Pandas", "NumPy", "Jupyter"],
        "C++":        ["C++", "CUDA"],
        "TypeScript": ["TypeScript", "FastAPI"],
        "JavaScript": ["JavaScript"],
        "Dockerfile": ["Docker"],
        "Shell":      ["Linux", "CI/CD"],
        "HCL":        ["Terraform"],
        "YAML":       ["Kubernetes", "CI/CD"],
    }
    TOPIC_TO_SKILLS: dict = {
        "pytorch":       ["PyTorch", "Deep Learning"],
        "tensorflow":    ["TensorFlow", "Deep Learning"],
        "machine-learning": ["Machine Learning", "scikit-learn"],
        "deep-learning": ["Deep Learning"],
        "nlp":           ["NLP", "Transformers"],
        "llm":           ["LLM", "Transformers", "LangChain"],
        "langchain":     ["LangChain", "RAG"],
        "computer-vision": ["Computer Vision", "OpenCV"],
        "opencv":        ["OpenCV", "Computer Vision"],
        "kubernetes":    ["Kubernetes", "Docker"],
        "docker":        ["Docker"],
        "fastapi":       ["FastAPI", "Python"],
        "mlops":         ["MLOps", "Docker", "Kubernetes"],
        "airflow":       ["Airflow"],
        "spark":         ["Spark"],
        "sql":           ["SQL"],
        "postgres":      ["PostgreSQL", "SQL"],
        "transformers":  ["Transformers", "HuggingFace"],
        "huggingface":   ["Transformers", "HuggingFace"],
        "rag":           ["RAG", "LangChain"],
        "openai":        ["OpenAI API", "LLM"],
        "stable-diffusion": ["Computer Vision", "PyTorch"],
        "data-science":  ["Python", "Pandas", "Machine Learning"],
        "scikit-learn":  ["scikit-learn", "Machine Learning"],
        "pandas":        ["Pandas"],
        "numpy":         ["NumPy"],
        "matplotlib":    ["Matplotlib"],
        "mlflow":        ["MLflow"],
        "terraform":     ["Terraform"],
        "aws":           ["AWS"],
        "gcp":           ["GCP"],
        "redis":         ["Redis"],
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Fetch public repos
            resp = await client.get(
                f"https://api.github.com/users/{username}/repos",
                params={"per_page": 30, "sort": "updated"},
                headers={"Accept": "application/vnd.github.v3+json"},
            )
            if resp.status_code == 404:
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found")
            if resp.status_code != 200:
                from fastapi import HTTPException
                raise HTTPException(status_code=502, detail="GitHub API unavailable")

            repos = resp.json()

        inferred: dict = {}  # skill → {count, sources}

        def add_skill(skill: str, source: str) -> None:
            if skill not in inferred:
                inferred[skill] = {"count": 0, "sources": set()}
            inferred[skill]["count"] += 1
            inferred[skill]["sources"].add(source)

        for repo in repos:
            if repo.get("fork"):
                continue
            lang = repo.get("language") or ""
            for s in LANG_TO_SKILLS.get(lang, []):
                add_skill(s, f"language:{lang}")
            for topic in repo.get("topics", []):
                for s in TOPIC_TO_SKILLS.get(topic, []):
                    add_skill(s, f"topic:{topic}")

        # Cross-reference with known skills in our DB
        known = {s["skill"] for s in DEMO_STATS}
        matched = [
            {
                "skill": skill,
                "confidence": min(data["count"] / 3, 1.0),
                "evidence_count": data["count"],
                "sources": sorted(data["sources"]),
                "in_market": skill in known,
            }
            for skill, data in inferred.items()
        ]
        matched.sort(key=lambda x: (-x["evidence_count"], x["skill"]))

        return {
            "username": username,
            "repos_analyzed": len([r for r in repos if not r.get("fork")]),
            "skills_found": len(matched),
            "skills": matched,
        }

    except Exception as e:
        from fastapi import HTTPException
        if "404" in str(e) or "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found")
        raise HTTPException(status_code=502, detail=f"Failed to fetch GitHub data: {str(e)}")
