"""
Demo data generator for AI Skills Dashboard.
Vacancies are built from realistic role archetypes with coherent skill bundles.
Each archetype has a complexity level that reflects real hiring signal:
  research      — PhD / math-heavy / publications expected
  senior_eng    — deep systems, infra, architecture, 4+ years
  ml_engineer   — standard ML stack, applied work, 2-3 years
  junior_vibe   — LLM wrappers, basic ML apps, vibe-coding acceptable
"""
from datetime import datetime, timedelta
import random
from typing import List, Dict

COMPANIES = [
    "Yandex", "VK", "Sber", "Tinkoff", "Ozon", "Avito",
    "Kaspersky", "JetBrains", "NVIDIA Russia", "MTS AI",
    "DataArt", "EPAM", "Luxoft", "SberTech", "Huawei R&D",
    "Skoltech", "AIRI", "Sber AI", "T-Bank AI", "X5 Tech",
]

CITIES = [
    "Moscow", "Saint Petersburg", "Novosibirsk", "Kazan",
    "Nizhny Novgorod", "Yekaterinburg", "Samara", "Omsk",
]

# ---------------------------------------------------------------------------
# Role archetypes — each defines a coherent bundle of skills, not random picks
# ---------------------------------------------------------------------------
ARCHETYPES = [
    {
        "id": "ai_researcher",
        "complexity": "research",
        "math_required": True,
        "label": "AI Research Scientist",
        "titles": ["AI Research Scientist", "ML Research Engineer", "Research Scientist"],
        "core": ["Python", "PyTorch", "Mathematics", "CUDA", "C++"],
        "extras": ["JAX", "TensorFlow", "HPC", "Docker", "Git", "LaTeX", "Transformers"],
        "description": (
            "Fundamental research in AI/ML: neural architecture design, "
            "optimization theory, publication of results in top venues (NeurIPS, ICML, ICLR)."
        ),
        "requirements": (
            "PhD or equivalent research experience. "
            "Solid background in linear algebra, probability theory, and optimization. "
            "Track record of publications or open-source contributions to foundational models."
        ),
        "experience_range": (4, 10),
        "salary_range": (350_000, 550_000),
        "weight": 8,          # relative frequency among generated vacancies
    },
    {
        "id": "cv_engineer",
        "complexity": "senior_eng",
        "math_required": True,
        "label": "Computer Vision Engineer",
        "titles": ["Computer Vision Engineer", "Senior CV Engineer", "CV/ML Engineer"],
        "core": ["Python", "PyTorch", "OpenCV", "Computer Vision", "Deep Learning"],
        "extras": ["TensorRT", "ONNX", "CUDA", "Docker", "C++", "Triton", "NumPy"],
        "description": (
            "Design and ship production-ready CV pipelines: object detection, "
            "segmentation, pose estimation, video analytics."
        ),
        "requirements": (
            "3+ years with PyTorch or TensorFlow on real CV tasks. "
            "Experience with model optimization (quantization, pruning, TensorRT). "
            "Understanding of camera geometry and image processing fundamentals."
        ),
        "experience_range": (3, 7),
        "salary_range": (280_000, 420_000),
        "weight": 10,
    },
    {
        "id": "nlp_llm_engineer",
        "complexity": "senior_eng",
        "math_required": False,
        "label": "NLP / LLM Engineer",
        "titles": ["NLP Engineer", "LLM Engineer", "Conversational AI Engineer", "Senior NLP Engineer"],
        "core": ["Python", "PyTorch", "Transformers", "LLM", "HuggingFace"],
        "extras": ["LangChain", "RAG", "FAISS", "NLP", "FastAPI", "Docker", "Redis", "PostgreSQL"],
        "description": (
            "Build and fine-tune large language models, retrieval-augmented generation pipelines, "
            "and production NLP services."
        ),
        "requirements": (
            "Strong Python + HuggingFace ecosystem. "
            "Experience fine-tuning or prompting LLMs at scale. "
            "Familiarity with vector databases and RAG architecture."
        ),
        "experience_range": (2, 6),
        "salary_range": (250_000, 400_000),
        "weight": 14,
    },
    {
        "id": "mlops_platform",
        "complexity": "senior_eng",
        "math_required": False,
        "label": "MLOps / Platform Engineer",
        "titles": ["MLOps Engineer", "ML Platform Engineer", "Senior MLOps Engineer"],
        "core": ["Python", "Kubernetes", "Docker", "MLOps", "Airflow"],
        "extras": ["Terraform", "Prometheus", "Grafana", "Spark", "AWS", "GCP", "Linux", "CI/CD", "Git"],
        "description": (
            "Design, build, and maintain ML infrastructure: training pipelines, "
            "model registries, serving infrastructure, and monitoring."
        ),
        "requirements": (
            "3+ years in DevOps or ML Engineering. "
            "Production experience with Kubernetes and container orchestration. "
            "Hands-on with at least one major cloud platform."
        ),
        "experience_range": (3, 8),
        "salary_range": (270_000, 420_000),
        "weight": 12,
    },
    {
        "id": "ml_engineer",
        "complexity": "ml_engineer",
        "math_required": False,
        "label": "ML Engineer (Applied)",
        "titles": ["ML Engineer", "Applied ML Engineer", "Machine Learning Engineer"],
        "core": ["Python", "scikit-learn", "Machine Learning", "Pandas", "SQL"],
        "extras": ["FastAPI", "Docker", "PostgreSQL", "PyTorch", "MLflow", "Git", "NumPy", "Celery"],
        "description": (
            "Build and maintain applied ML models for recommendation, ranking, "
            "fraud detection, and demand forecasting."
        ),
        "requirements": (
            "2+ years applying classical and gradient-boosting ML to production problems. "
            "Comfortable with Python data stack and SQL. "
            "Experience deploying models via REST APIs."
        ),
        "experience_range": (2, 5),
        "salary_range": (200_000, 330_000),
        "weight": 16,
    },
    {
        "id": "data_scientist",
        "complexity": "ml_engineer",
        "math_required": True,
        "label": "Data Scientist",
        "titles": ["Data Scientist", "Senior Data Scientist", "Product Data Scientist"],
        "core": ["Python", "Pandas", "SQL", "Statistics", "Machine Learning"],
        "extras": ["scikit-learn", "A/B Testing", "Tableau", "NumPy", "Jupyter", "PostgreSQL", "Spark"],
        "description": (
            "Analyze large datasets, build predictive models, and translate business "
            "questions into quantitative experiments."
        ),
        "requirements": (
            "Statistical thinking and comfort with hypothesis testing / A/B experiments. "
            "SQL proficiency and Python data analysis stack. "
            "Experience presenting findings to non-technical stakeholders."
        ),
        "experience_range": (1, 5),
        "salary_range": (180_000, 300_000),
        "weight": 14,
    },
    {
        "id": "llm_product_dev",
        "complexity": "junior_vibe",
        "math_required": False,
        "label": "LLM Product Developer",
        "titles": ["AI Product Developer", "LLM Integration Engineer", "AI Backend Developer"],
        "core": ["Python", "OpenAI API", "LangChain", "FastAPI", "PostgreSQL"],
        "extras": ["Docker", "Redis", "Telegram Bot API", "REST API", "Git", "LLM", "RAG", "Celery"],
        "description": (
            "Rapidly build AI-powered applications and bots using LLM APIs. "
            "Integration of LLMs into products, chatbots, and automation tools."
        ),
        "requirements": (
            "Ability to build working prototypes quickly. "
            "Experience with OpenAI / Anthropic / Yandex GPT APIs. "
            "Basic understanding of prompting patterns and RAG."
        ),
        "experience_range": (0, 3),
        "salary_range": (120_000, 220_000),
        "weight": 14,
    },
    {
        "id": "junior_ml",
        "complexity": "junior_vibe",
        "math_required": False,
        "label": "Junior ML / AI Developer",
        "titles": ["Junior ML Engineer", "Junior AI Developer", "ML Intern"],
        "core": ["Python", "Machine Learning", "Pandas", "NumPy", "Git"],
        "extras": ["scikit-learn", "SQL", "Docker", "Jupyter", "FastAPI", "TensorFlow"],
        "description": (
            "Entry-level ML role: participate in data preparation, model training, "
            "experimentation, and basic API development."
        ),
        "requirements": (
            "Python fundamentals and familiarity with ML concepts. "
            "Completed pet projects or Kaggle competitions. "
            "Readiness to learn and iterate fast."
        ),
        "experience_range": (0, 2),
        "salary_range": (80_000, 160_000),
        "weight": 12,
    },
]

# Complexity metadata for UI rendering
COMPLEXITY_META = {
    "research": {
        "label": "Research / PhD",
        "color": "#F43F5E",
        "description": "Фундаментальные исследования, математика, публикации",
        "vibe_ok": False,
    },
    "senior_eng": {
        "label": "Senior Engineer",
        "color": "#818CF8",
        "description": "Глубокие системные знания, архитектура, 3–8 лет",
        "vibe_ok": False,
    },
    "ml_engineer": {
        "label": "ML Engineer",
        "color": "#22D3EE",
        "description": "Прикладной ML, стандартный стек, 1–4 года",
        "vibe_ok": False,
    },
    "junior_vibe": {
        "label": "Junior / Vibe-coder",
        "color": "#10B981",
        "description": "LLM-обёртки, продуктовый AI — можно начать с вайб-кодинга",
        "vibe_ok": True,
    },
}


def _pick_skills(archetype: dict) -> list:
    """Build a realistic skill bundle: all core + random subset of extras."""
    core = list(archetype["core"])
    n_extras = random.randint(2, min(5, len(archetype["extras"])))
    extras = random.sample(archetype["extras"], n_extras)
    return core + extras


def generate_demo_vacancies(count: int = 120) -> List[Dict]:
    vacancies: List[Dict] = []

    # Build weighted pool of archetypes
    pool: List[dict] = []
    for arch in ARCHETYPES:
        pool.extend([arch] * arch["weight"])

    for i in range(count):
        arch = random.choice(pool)
        days_ago = random.randint(0, 30)
        published_at = datetime.utcnow() - timedelta(days=days_ago)

        skills = _pick_skills(arch)

        lo, hi = arch["salary_range"]
        salary_min = random.randint(lo, hi - 50_000)
        salary_max = salary_min + random.randint(40_000, 120_000)

        exp_lo, exp_hi = arch["experience_range"]
        experience = random.randint(exp_lo, exp_hi)

        vacancy = {
            "id": i + 1,
            "external_id": f"demo_{i + 1}",
            "source": "hh",
            "title": random.choice(arch["titles"]),
            "company": random.choice(COMPANIES),
            "description": arch["description"],
            "requirements": arch["requirements"],
            "city": random.choice(CITIES),
            "country": "Russia",
            "salary_min": salary_min,
            "salary_max": salary_max,
            "salary_currency": "RUR",
            "experience_years": experience,
            "employment_type": random.choice(["full-time", "remote", "hybrid"]),
            "is_active": True,
            "is_archived": False,
            "url": f"https://hh.ru/vacancy/{i + 1}",
            "published_at": published_at.isoformat(),
            "skills": skills,
            # extended fields
            "complexity": arch["complexity"],
            "math_required": arch["math_required"],
            "archetype_id": arch["id"],
            "archetype_label": arch["label"],
        }
        vacancies.append(vacancy)

    return vacancies


def generate_skill_stats(vacancies: List[Dict]) -> List[Dict]:
    skill_counts: Dict[str, dict] = {}
    total = len(vacancies)

    for v in vacancies:
        for skill in v["skills"]:
            if skill not in skill_counts:
                skill_counts[skill] = {"count": 0, "salaries": []}
            skill_counts[skill]["count"] += 1
            if v["salary_min"]:
                skill_counts[skill]["salaries"].append(
                    (v["salary_min"] + v["salary_max"]) / 2
                )

    stats = []
    for skill, data in skill_counts.items():
        avg_salary = (
            sum(data["salaries"]) / len(data["salaries"]) if data["salaries"] else 0
        )
        stats.append({
            "skill": skill,
            "vacancy_count": data["count"],
            "percentage": round(data["count"] / total * 100, 1),
            "avg_salary": int(avg_salary),
        })

    stats.sort(key=lambda x: x["vacancy_count"], reverse=True)
    return stats


def generate_skill_combinations(vacancies: List[Dict], top_n: int = 25) -> List[Dict]:
    """Return top co-occurring skill pairs across all vacancies."""
    from collections import Counter
    from itertools import combinations

    pair_counts: Counter = Counter()
    for v in vacancies:
        skills = sorted(set(v["skills"]))
        for pair in combinations(skills, 2):
            pair_counts[pair] += 1

    total = len(vacancies)
    return [
        {
            "skills": list(pair),
            "count": cnt,
            "percentage": round(cnt / total * 100, 1),
        }
        for pair, cnt in pair_counts.most_common(top_n)
    ]


def generate_complexity_breakdown(vacancies: List[Dict]) -> List[Dict]:
    """Aggregate vacancies by complexity level."""
    from collections import defaultdict

    groups: Dict[str, dict] = {}
    for v in vacancies:
        c = v.get("complexity", "unknown")
        if c not in groups:
            meta = COMPLEXITY_META.get(c, {})
            groups[c] = {
                "complexity": c,
                "label": meta.get("label", c),
                "color": meta.get("color", "#475569"),
                "description": meta.get("description", ""),
                "vibe_ok": meta.get("vibe_ok", False),
                "count": 0,
                "salaries": [],
                "math_count": 0,
            }
        groups[c]["count"] += 1
        if v.get("salary_min"):
            groups[c]["salaries"].append((v["salary_min"] + v["salary_max"]) / 2)
        if v.get("math_required"):
            groups[c]["math_count"] += 1

    result = []
    for data in groups.values():
        sals = data.pop("salaries")
        data["avg_salary"] = int(sum(sals) / len(sals)) if sals else 0
        result.append(data)

    # Sort by complexity severity descending
    order = ["research", "senior_eng", "ml_engineer", "junior_vibe"]
    result.sort(key=lambda x: order.index(x["complexity"]) if x["complexity"] in order else 99)
    return result


def generate_archetype_profiles(vacancies: List[Dict]) -> List[Dict]:
    """Return per-archetype stats including representative skill bundle."""
    groups: Dict[str, dict] = {}
    for v in vacancies:
        aid = v.get("archetype_id", "unknown")
        if aid not in groups:
            groups[aid] = {
                "archetype_id": aid,
                "archetype_label": v.get("archetype_label", aid),
                "complexity": v.get("complexity", "unknown"),
                "math_required": v.get("math_required", False),
                "count": 0,
                "salaries": [],
                "skill_counter": {},
                "experience_sum": 0,
            }
        g = groups[aid]
        g["count"] += 1
        g["experience_sum"] += v.get("experience_years", 0)
        if v.get("salary_min"):
            g["salaries"].append((v["salary_min"] + v["salary_max"]) / 2)
        for s in v["skills"]:
            g["skill_counter"][s] = g["skill_counter"].get(s, 0) + 1

    result = []
    for g in groups.values():
        sals = g.pop("salaries")
        counter = g.pop("skill_counter")
        n = g["count"]
        # Top skills by frequency within this archetype
        top_skills = sorted(counter.items(), key=lambda x: x[1], reverse=True)
        g["top_skills"] = [s for s, _ in top_skills[:8]]
        g["avg_salary"] = int(sum(sals) / len(sals)) if sals else 0
        g["avg_experience"] = round(g.pop("experience_sum") / n, 1)
        result.append(g)

    order = ["research", "senior_eng", "ml_engineer", "junior_vibe"]
    result.sort(key=lambda x: order.index(x["complexity"]) if x["complexity"] in order else 99)
    return result


def generate_trend_data(skill: str, days: int = 30):
    import random as _r
    trends = []
    base = _r.randint(20, 80)
    for day in range(days):
        date = datetime.utcnow() - timedelta(days=days - day)
        count = max(0, base + _r.randint(-10, 15))
        trends.append({
            "date": date.strftime("%Y-%m-%d"),
            "vacancy_count": count,
            "percentage": round(count / 100 * 10, 1),
        })
    return trends
