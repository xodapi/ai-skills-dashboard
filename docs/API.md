# API Documentation

Base URL: `https://ai-skills.syntog.ru/api/v1`

## Authentication

Currently, the API is public and doesn't require authentication for read operations.

## Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "environment": "production",
  "version": "1.0.0"
}
```

### Vacancies

#### Get all vacancies

```
GET /api/v1/vacancies?skip=0&limit=100&source=hh&is_active=true
```

Query Parameters:
- `skip` (int): Number of records to skip (pagination)
- `limit` (int): Maximum number of records to return
- `source` (string): Filter by source (hh, linkedin, etc.)
- `is_active` (bool): Filter by active status
- `city` (string): Filter by city

Response:
```json
{
  "total": 12847,
  "items": [
    {
      "id": 1,
      "external_id": "12345678",
      "source": "hh",
      "title": "ML Engineer",
      "company": "Tech Company",
      "city": "Moscow",
      "salary_min": 150000,
      "salary_max": 250000,
      "skills": ["Python", "TensorFlow", "Docker"],
      "published_at": "2026-08-15T10:00:00Z"
    }
  ]
}
```

### Skills

#### Get all skills

```
GET /api/v1/skills?skip=0&limit=100&category=ML%20Frameworks
```

Query Parameters:
- `skip` (int): Pagination offset
- `limit` (int): Maximum results
- `category` (string): Filter by category

Response:
```json
{
  "total": 387,
  "items": [
    {
      "id": 1,
      "name": "Python",
      "normalized_name": "python",
      "category": "Programming",
      "vacancy_count": 9842
    }
  ]
}
```

#### Get skill details

```
GET /api/v1/skills/{skill_id}
```

Response:
```json
{
  "id": 1,
  "name": "Python",
  "category": "Programming",
  "vacancy_count": 9842,
  "trend": "increasing",
  "avg_salary": 185000,
  "related_skills": ["TensorFlow", "PyTorch", "Docker"]
}
```

### Trends

#### Get skill trends

```
GET /api/v1/trends?skill_id=1&period=30d&source=hh
```

Query Parameters:
- `skill_id` (int): Skill ID
- `period` (string): Time period (7d, 30d, 90d, 1y)
- `source` (string): Data source filter

Response:
```json
{
  "skill_id": 1,
  "skill_name": "Python",
  "data_points": [
    {
      "time_bucket": "2026-08-01T00:00:00Z",
      "vacancy_count": 245,
      "percentage": 12.5,
      "avg_salary": 180000
    }
  ]
}
```

#### Get top trending skills

```
GET /api/v1/trends/top?limit=10&period=30d
```

Response:
```json
{
  "period": "30d",
  "skills": [
    {
      "skill_id": 15,
      "skill_name": "LLM",
      "growth_rate": 45.2,
      "current_count": 1234,
      "previous_count": 850
    }
  ]
}
```

### Map Data

#### Get geographic distribution

```
GET /api/v1/map/vacancies?skill_id=1
```

Query Parameters:
- `skill_id` (int): Optional skill filter
- `source` (string): Data source filter

Response:
```json
{
  "locations": [
    {
      "city": "Moscow",
      "country": "Russia",
      "latitude": 55.7558,
      "longitude": 37.6173,
      "vacancy_count": 4532,
      "avg_salary": 195000
    }
  ]
}
```

### WebSocket

Real-time updates for new vacancies.

```
WS /api/v1/ws
```

Connect and receive messages:
```json
{
  "type": "new_vacancy",
  "data": {
    "id": 12348,
    "title": "Senior ML Engineer",
    "company": "AI Startup",
    "city": "Moscow",
    "skills": ["Python", "PyTorch", "MLOps"]
  }
}
```

## Rate Limiting

- 100 requests per minute per IP
- WebSocket: 1 connection per IP

## Error Responses

```json
{
  "detail": "Error message here"
}
```

Status Codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Interactive Documentation

Full interactive API documentation available at:
- Swagger UI: https://ai-skills.syntog.ru/docs
- ReDoc: https://ai-skills.syntog.ru/redoc
