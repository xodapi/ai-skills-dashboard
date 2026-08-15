# AI Skills Analytics Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev/)

> Интерактивный аналитический дашборд для мониторинга востребованности навыков AI/ML инженеров на основе данных HeadHunter.ru и мировых источников вакансий.

## 🎯 Возможности

- **Интерактивная карта навыков** — визуализация частоты упоминаний, динамика роста/падения, корреляция навыков
- **Географическая карта вакансий** — real-time отображение новых вакансий с WebSocket обновлениями
- **Временные тренды** — анализ спроса на навыки по месяцам с ML-прогнозами
- **Аналитика зарплат** — корреляция навыков и компенсации, распределение по опыту
- **Множественные источники данных** — HH.ru, LinkedIn, Indeed, GitHub Jobs, StackOverflow
- **Архив данных** — хранение исторических данных даже после удаления вакансий

## 🏗️ Архитектура

```
├── backend/          # FastAPI + Celery + PostgreSQL
├── frontend/         # React 19 + TypeScript + Recharts
├── scrapers/         # Парсеры вакансий (HH.ru, LinkedIn, etc.)
├── ml/               # ML модели для прогнозирования трендов
├── docker/           # Docker конфигурация
└── deploy/           # Deployment скрипты для SSH server
```

## 🚀 Быстрый старт

### Требования

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker (опционально)

### Локальная разработка

```bash
# 1. Клонировать репозиторий
git clone https://github.com/yourusername/ai-skills-dashboard.git
cd ai-skills-dashboard

# 2. Установить зависимости backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Настроить переменные окружения
cp .env.example .env
# Отредактировать .env с вашими настройками

# 4. Запустить миграции
alembic upgrade head

# 5. Установить зависимости frontend
cd ../frontend
npm install

# 6. Запустить dev серверы
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Celery worker
cd backend && celery -A app.celery_worker worker --loglevel=info

# Terminal 4: Redis
redis-server
```

### Docker Compose

```bash
docker-compose up -d
```

Приложение будет доступно на:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📊 Источники данных

| Источник | Регион | API | Статус |
|----------|--------|-----|--------|
| HeadHunter.ru | Россия | ✅ Public API | Активен |
| LinkedIn | Глобально | ⚠️ Web scraping | В разработке |
| Indeed | Глобально | ⚠️ Web scraping | В разработке |
| GitHub Jobs | Глобально | ❌ Deprecated | - |
| StackOverflow | Глобально | ✅ Public API | Запланирован |

## 🎨 Технологии

**Backend:**
- FastAPI — современный async фреймворк
- PostgreSQL + TimescaleDB — time-series данные
- Redis — кэширование и pub/sub
- Celery — фоновые задачи
- Pydantic v2 — валидация данных
- SQLAlchemy 2.0 — ORM

**Frontend:**
- React 19 — UI библиотека
- TypeScript — типизация
- Recharts — графики и визуализации
- Mapbox GL — интерактивные карты
- TanStack Query — управление состоянием
- Tailwind CSS — стилизация

**Infrastructure:**
- Docker + Docker Compose
- Nginx — reverse proxy
- GitHub Actions — CI/CD
- Alembic — миграции БД

## 🔐 Соответствие требованиям 2026

Проект полностью соответствует требованиям ЕС и РФ по защите персональных данных:

- ✅ Cookie Consent Banner (GDPR, ePrivacy Directive)
- ✅ Прозрачная политика использования cookies
- ✅ Возможность отказа от аналитических cookies
- ✅ Информация о владельце сайта
- ✅ Контактные данные для связи

## 📝 Лицензия

MIT License

## 👤 Автор

**Богорад Сергей Борисович**
- Email: sbb@bsosh3.org
- Website: https://ai-skills.syntog.ru

## 🤝 Вклад в проект

Contributions, issues и feature requests приветствуются!

## ⭐ Поддержка

Если проект был полезен, поставьте ⭐ на GitHub!

---

*Личный проект для портфолио, демонстрирующий навыки full-stack разработки, data engineering и ML.*
