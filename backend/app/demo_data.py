"""
Demo data generator for AI Skills Dashboard.
Creates sample vacancies and skills for demonstration.
"""
from datetime import datetime, timedelta
import random
from typing import List, Dict

# Sample AI/ML companies
COMPANIES = [
    "Yandex", "VK", "Sber", "Tinkoff", "Ozon", "Avito",
    "Kaspersky", "JetBrains", "NVIDIA Russia", "Intel",
    "DataArt", "EPAM", "Luxoft", "SberTech", "MTS AI"
]

# Sample cities
CITIES = [
    "Moscow", "Saint Petersburg", "Novosibirsk", "Kazan",
    "Nizhny Novgorod", "Yekaterinburg", "Samara", "Omsk"
]

# Sample skills from our extractor
AI_ML_SKILLS = [
    "Python", "TensorFlow", "PyTorch", "Keras", "scikit-learn",
    "Deep Learning", "Neural Networks", "CNN", "RNN", "LSTM",
    "NLP", "Computer Vision", "Machine Learning", "LLM",
    "Docker", "Kubernetes", "Git", "SQL", "PostgreSQL",
    "FastAPI", "Django", "Flask", "Pandas", "NumPy",
    "MLOps", "AWS", "GCP", "Azure", "Linux"
]

# Sample job titles
JOB_TITLES = [
    "Senior ML Engineer",
    "ML Engineer",
    "Junior ML Engineer",
    "AI Research Engineer",
    "Computer Vision Engineer",
    "NLP Engineer",
    "MLOps Engineer",
    "Data Scientist",
    "Senior Data Scientist",
    "AI Engineer"
]

def generate_demo_vacancies(count: int = 100) -> List[Dict]:
    """Generate demo vacancy data."""
    vacancies = []
    
    for i in range(count):
        # Random dates in last 30 days
        days_ago = random.randint(0, 30)
        published_at = datetime.utcnow() - timedelta(days=days_ago)
        
        # Random skills (3-8 per vacancy)
        num_skills = random.randint(3, 8)
        skills = random.sample(AI_ML_SKILLS, num_skills)
        
        # Random salary
        base_salary = random.choice([120000, 150000, 180000, 200000, 250000, 300000])
        salary_min = base_salary
        salary_max = base_salary + random.randint(50000, 100000)
        
        # Random experience
        experience = random.choice([0, 1, 2, 3, 5, 7])
        
        vacancy = {
            "id": i + 1,
            "external_id": f"demo_{i+1}",
            "source": "hh",
            "title": random.choice(JOB_TITLES),
            "company": random.choice(COMPANIES),
            "description": f"Looking for experienced {random.choice(JOB_TITLES)}",
            "requirements": f"Experience with {', '.join(skills[:3])}",
            "city": random.choice(CITIES),
            "country": "Russia",
            "salary_min": salary_min,
            "salary_max": salary_max,
            "salary_currency": "RUR",
            "experience_years": experience,
            "employment_type": random.choice(["full-time", "remote", "hybrid"]),
            "is_active": True,
            "is_archived": False,
            "url": f"https://hh.ru/vacancy/{i+1}",
            "published_at": published_at.isoformat(),
            "skills": skills
        }
        
        vacancies.append(vacancy)
    
    return vacancies


def generate_skill_stats(vacancies: List[Dict]) -> List[Dict]:
    """Generate skill statistics from vacancies."""
    skill_counts = {}
    total_vacancies = len(vacancies)
    
    for vacancy in vacancies:
        for skill in vacancy["skills"]:
            if skill not in skill_counts:
                skill_counts[skill] = {
                    "count": 0,
                    "salaries": []
                }
            skill_counts[skill]["count"] += 1
            if vacancy["salary_min"]:
                skill_counts[skill]["salaries"].append(
                    (vacancy["salary_min"] + vacancy["salary_max"]) / 2
                )
    
    stats = []
    for skill, data in skill_counts.items():
        avg_salary = sum(data["salaries"]) / len(data["salaries"]) if data["salaries"] else 0
        percentage = (data["count"] / total_vacancies) * 100
        
        stats.append({
            "skill": skill,
            "vacancy_count": data["count"],
            "percentage": round(percentage, 1),
            "avg_salary": int(avg_salary)
        })
    
    # Sort by count
    stats.sort(key=lambda x: x["vacancy_count"], reverse=True)
    
    return stats


def generate_trend_data(skill: str, days: int = 30) -> List[Dict]:
    """Generate time-series trend data for a skill."""
    trends = []
    base_count = random.randint(20, 80)
    
    for day in range(days):
        date = datetime.utcnow() - timedelta(days=days - day)
        # Add some randomness to create trend
        count = base_count + random.randint(-10, 15)
        
        trends.append({
            "date": date.strftime("%Y-%m-%d"),
            "vacancy_count": max(0, count),
            "percentage": round((count / 100) * 10, 1)
        })
    
    return trends


if __name__ == "__main__":
    # Generate and print demo data
    vacancies = generate_demo_vacancies(100)
    print(f"Generated {len(vacancies)} demo vacancies")
    
    stats = generate_skill_stats(vacancies)
    print(f"\nTop 10 skills:")
    for stat in stats[:10]:
        print(f"  {stat['skill']}: {stat['vacancy_count']} ({stat['percentage']}%)")
    
    trends = generate_trend_data("Python", 30)
    print(f"\nPython trend: {len(trends)} data points")
