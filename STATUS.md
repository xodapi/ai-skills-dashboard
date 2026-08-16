# AI Skills Dashboard - Текущий статус проекта

**Последнее обновление:** 2026-08-16

**Сайт:** https://ai-skills.syntog.ru (production, HTTPS, работает)

---

## ✅ Что работает прямо сейчас

### Backend API (FastAPI + PostgreSQL/TimescaleDB)
- ✅ 120 демо-вакансий с реальными данными
- ✅ 52 навыка из ML/AI индустрии
- ✅ 8 архетипов ролей (от junior vibe coder до AI researcher)
- ✅ 15 модулей тренажёров с практическими заданиями
- ✅ Эндпоинты: `/vacancies/*`, `/skills/*`, `/training/*`
- ✅ Аналитика: co-occurrence навыков, зарплатные распределения, география
- ✅ Docker Compose production конфигурация
- ✅ Автоматический деплой через GitHub Actions

### Frontend (React 19 + TanStack Router + Query)
- ✅ **Dashboard** - обзор рынка, топ навыков, зарплатная статистика
- ✅ **SkillsMap** - интерактивный force-directed граф навыков
- ✅ **SkillSets** - архетипы ролей, уровни сложности, пары навыков
- ✅ **VacanciesMap** - каталог вакансий с фильтрацией и поиском
- ✅ **WorldMap** - география (страны/города), форматы работы
- ✅ **Trends** - динамика популярности навыков
- ✅ **Analytics** - глубокая аналитика навыков
- ✅ **Radar** - персональный технологический радар (Thoughtworks-style)
- ✅ **GapAnalyzer** - анализ разрыва в навыках с рекомендациями
- ✅ **Trainer** - 15 тренажёров с теорией, упражнениями, Web Speech API

### Система тем (4 темы)
- ✅ **Dark** - текущая тема, cyan accent
- ✅ **Light** - светлая тема для дня
- ✅ **Hacker** - зелёный terminal стиль с scanlines
- ✅ **Steampunk** - латунь и медь, Special Elite font
- ✅ Переключение через dropdown в Header
- ✅ Сохранение в localStorage

### Тренажёры (15 модулей)
1. **Python** - парсинг HH.ru API, Pydantic валидация, профилирование
2. **PyTorch** - fine-tuning BERT, ONNX экспорт
3. **Docker** - production Dockerfile, multi-stage builds
4. **Kubernetes** - ML API deployment, GPU, HPA
5. **LangChain** - RAG система для семантического поиска
6. **SQL** - window functions, зарплатная аналитика
7. **MLflow** - tracking, model registry, deployment
8. **scikit-learn** - Pipeline, ColumnTransformer, зарплатное предсказание
9. **Computer Vision** - ResNet fine-tuning, классификация
10. **Transformers** - NER, LoRA fine-tuning
11. **Pandas** - анализ вакансий, профилирование данных
12. **FastAPI** - ML API с pydantic v2, async endpoints
13. **OpenCV** - обработка изображений, детекция объектов
14. **Airflow** - ML пайплайны, DAGs, XCom
15. **Terraform** - ML инфраструктура, EKS, GPU nodes

---

## 🚧 Phase 1: Личные кабинеты (Backend готов, нужен Frontend)

### ✅ Backend реализован полностью

**Модели (SQLAlchemy):**
- `User` - пользователи, GitHub OAuth, публичные профили
- `user_skills` - навыки пользователя с уровнем владения (1-5)
- `TrainingProgress` - прогресс по тренажёрам (completion, score, time)
- `user_bookmarks` - сохранённые вакансии

**API эндпоинты:**
```
POST   /api/v1/auth/github/authorize      - Получить OAuth URL
POST   /api/v1/auth/github/callback       - Обменять code на JWT
GET    /api/v1/auth/me                    - Получить текущего юзера

GET    /api/v1/users/me                   - Профиль
PATCH  /api/v1/users/me                   - Обновить профиль
GET    /api/v1/users/me/skills            - Навыки
POST   /api/v1/users/me/skills            - Добавить навык
DELETE /api/v1/users/me/skills/{skill_id} - Удалить навык
GET    /api/v1/users/me/progress          - Прогресс по тренажёрам
POST   /api/v1/users/me/progress          - Сохранить прогресс
GET    /api/v1/users/me/bookmarks         - Сохранённые вакансии
POST   /api/v1/users/me/bookmarks         - Добавить bookmark
DELETE /api/v1/users/me/bookmarks/{id}    - Удалить bookmark
GET    /api/v1/users/me/stats             - Статистика
GET    /api/v1/users/me/activity          - Activity timeline

GET    /api/v1/users/{username}           - Публичный профиль
GET    /api/v1/users/{username}/skills    - Публичные навыки
```

**Безопасность:**
- JWT токены (RS256 или HS256)
- GitHub OAuth 2.0 flow
- Защита эндпоинтов через `get_current_user` dependency
- Публичные/приватные профили

### ⏳ Что нужно для запуска Phase 1

1. **На сервере:**
   - Создать GitHub OAuth App (Client ID + Secret)
   - Добавить credentials в backend/.env
   - Запустить миграцию: `alembic upgrade head`

2. **Frontend (нужно создать):**
   - `src/context/AuthContext.tsx` - React context для аутентификации
   - `src/pages/AuthCallback.tsx` - OAuth callback handler
   - `src/lib/api.ts` - API client с JWT токеном
   - `src/pages/Profile.tsx` - Просмотр профиля `/profile/:username`
   - `src/pages/MyProfile.tsx` - Редактирование `/me`
   - `src/pages/MySkills.tsx` - Управление навыками `/me/skills`
   - `src/pages/MyProgress.tsx` - Прогресс `/me/progress`
   - `src/pages/Bookmarks.tsx` - Сохранённые вакансии `/me/bookmarks`

3. **Интеграция:**
   - Header: добавить кнопку Login/Logout
   - Trainer: сохранять прогресс через API
   - GapAnalyzer: загружать навыки пользователя
   - VacanciesMap: добавить кнопки bookmark

**Подробнее:** см. `docs/PHASE1_CHECKLIST.md`

---

## 📊 Статистика

- **Коммитов:** 50+
- **Backend эндпоинтов:** 25+
- **Frontend страниц:** 10
- **Тренажёров:** 15 модулей
- **Упражнений:** 45+ практических заданий
- **Навыков в базе:** 52
- **Вакансий (demo):** 120
- **Архетипов ролей:** 8

---

## 🐛 Известные проблемы

1. **53 Dependabot vulnerabilities** (2 critical, 9 high)
   - Нужно обновить зависимости frontend/backend
   - GitHub создал автоматические PR

2. **OAuth state validation**
   - Сейчас state hardcoded
   - Нужен Redis для хранения state tokens

3. **Smoke tests падали**
   - ✅ ИСПРАВЛЕНО: заменён `npm ci` на `npm install`

4. **No package-lock.json**
   - npm install работает из-за PATH проблем
   - Нужно создать lock file для детерминированных builds

---

## 🚀 Roadmap

### Приоритет 1: Завершить Phase 1
- [ ] Frontend для личных кабинетов
- [ ] Настроить GitHub OAuth на сервере
- [ ] Запустить миграции БД
- [ ] Протестировать полный flow: login → навыки → прогресс → bookmarks

### Приоритет 2: Discovery страница
- [ ] Поиск навыков которыми НЕ владеешь
- [ ] AI-генерация project ideas под каждый навык
- [ ] Сохранение прогресса в LocalStorage
- [ ] Шаринг через URL query params

### Приоритет 3: Real code execution
- [ ] Интеграция Judge0 API или Docker sandbox
- [ ] Автоматическая проверка кода пользователей
- [ ] Показывать test cases и результаты

### Приоритет 4: AI code review
- [ ] Интеграция Claude API
- [ ] Анализ решений пользователей
- [ ] Рекомендации по улучшению кода
- [ ] Оценка best practices

### Приоритет 5: Social features
- [ ] Follow пользователей
- [ ] Комментарии и обсуждения
- [ ] Likes и reactions
- [ ] Leaderboards
- [ ] Achievements и badges

### Приоритет 6: Расширение контента
- [ ] Больше модулей: NumPy, Matplotlib, Seaborn, Plotly, Streamlit
- [ ] Видео-материалы к теории
- [ ] Интерактивные Jupyter notebooks
- [ ] Project templates для портфолио

---

## 🛠️ Технический стек

**Backend:**
- FastAPI 0.104+
- PostgreSQL + TimescaleDB (для time-series данных)
- SQLAlchemy 2.0 (async)
- Alembic (миграции)
- Pydantic v2 (валидация)
- python-jose (JWT)
- httpx (OAuth requests)
- Docker + Docker Compose

**Frontend:**
- React 19
- TypeScript 5.3+
- TanStack Router (file-based routing)
- TanStack Query (data fetching)
- D3.js (визуализации)
- Recharts (графики)
- Web Speech API (TTS для теории)
- CSS Variables (темизация)

**Infrastructure:**
- nginx (reverse proxy + frontend static)
- Docker Compose production mode
- GitHub Actions (CI/CD)
- SSH deployment
- HTTPS (Let's Encrypt)

---

## 📝 Документация

- `README.md` - основной README
- `docs/PHASE1_AUTH.md` - Phase 1 техническая документация
- `docs/PHASE1_CHECKLIST.md` - Phase 1 checklist и setup инструкции
- `docs/ARCHITECTURE.md` - архитектура проекта (если будет создан)
- `backend/app/training_exercises.py` - все тренажёры с комментариями

---

## 👤 Автор

**Богорад Сергей Борисович**
- Email: sbb@bsosh3.org
- GitHub: xodapi/ai-skills-dashboard
- Сайт: https://ai-skills.syntog.ru

---

## 📅 История версий

- **2026-08-16** - Phase 1 backend готов, 15 тренажёров, smoke tests исправлены
- **2026-08-15** - Система тем (4 темы), тренажёры с реальными заданиями
- **2026-08-14** - Radar + GapAnalyzer + Trainer с Web Speech API
- **2026-08-13** - WorldMap + географические фильтры
- **2026-08-12** - SkillSets + архетипы ролей
- **2026-08-11** - Production deployment на ai-skills.syntog.ru
- **2026-08-10** - Начало проекта
