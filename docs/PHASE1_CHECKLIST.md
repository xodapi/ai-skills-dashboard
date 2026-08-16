# Checklist для запуска Phase 1

## ✅ Завершено

1. **Backend код**
   - ✅ Модели пользователей (User, TrainingProgress, user_skills, user_bookmarks)
   - ✅ JWT токены и безопасность (security.py)
   - ✅ GitHub OAuth интеграция (oauth.py)
   - ✅ API эндпоинты (/auth/*, /users/*)
   - ✅ Alembic миграция для таблиц пользователей
   - ✅ Зависимости (Dependencies) для аутентификации
   - ✅ Pydantic схемы для валидации

2. **Тренажёры**
   - ✅ 15 модулей с реальными заданиями из вакансий
   - ✅ API для загрузки модулей работает
   - ✅ Все модули доступны через `/api/v1/training/modules`

3. **Production deployment**
   - ✅ Docker Compose production конфигурация
   - ✅ nginx конфигурация для frontend
   - ✅ GitHub Actions автоматический деплой
   - ✅ Сайт работает: https://ai-skills.syntog.ru

4. **Документация**
   - ✅ docs/PHASE1_AUTH.md с полным описанием
   - ✅ API endpoints документированы
   - ✅ Frontend integration примеры

## 🔄 Следующие шаги

### 1. Настройка GitHub OAuth на сервере

SSH на сервер и обновить `.env`:

```bash
ssh root@ai-skills.syntog.ru

# Создать GitHub OAuth App (если ещё не создан)
# https://github.com/settings/developers
# New OAuth App:
#   - Homepage URL: https://ai-skills.syntog.ru
#   - Callback URL: https://ai-skills.syntog.ru/auth/callback

# Добавить в backend/.env
cat >> /root/ai-skills-dashboard/backend/.env << 'EOF'

# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=https://ai-skills.syntog.ru/auth/callback

# JWT (generate strong random key)
SECRET_KEY=your-secret-key-generate-with-openssl-rand-hex-32
EOF

# Перезапустить backend
cd /root/ai-skills-dashboard
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart backend

# Проверить что OAuth работает
curl https://ai-skills.syntog.ru/api/v1/auth/github/authorize
# Должен вернуть: {"authorization_url": "https://github.com/login/oauth/...", "state": "..."}
```

### 2. Запустить миграции базы данных

```bash
ssh root@ai-skills.syntog.ru
cd /root/ai-skills-dashboard

# Войти в backend контейнер
docker-compose exec backend bash

# Запустить миграцию
alembic upgrade head

# Проверить таблицы
psql postgresql://user:password@timescaledb:5432/ai_skills -c "\dt"
# Должны появиться: users, user_skills, training_progress, user_bookmarks

exit
```

### 3. Frontend - AuthContext и OAuth flow

Создать файлы:

**src/context/AuthContext.tsx** - Context для аутентификации (см. docs/PHASE1_AUTH.md)

**src/pages/AuthCallback.tsx** - Обработка OAuth callback

**src/lib/api.ts** - API клиент с автоматической авторизацией

Обновить:

**src/App.tsx** - Добавить маршрут `/auth/callback`

**src/main.tsx** - Обернуть в `<AuthProvider>`

**src/components/layout/Header.tsx** - Добавить кнопку Login/Logout

### 4. Frontend страницы для Phase 1

Создать:

- **src/pages/Profile.tsx** - Просмотр профиля `/profile/:username`
- **src/pages/MyProfile.tsx** - Редактирование своего профиля `/me`
- **src/pages/MySkills.tsx** - Управление навыками `/me/skills`
- **src/pages/MyProgress.tsx** - Прогресс по тренажёрам `/me/progress`
- **src/pages/Bookmarks.tsx** - Сохранённые вакансии `/me/bookmarks`

### 5. Интеграция с существующими страницами

**Trainer.tsx** - Сохранять прогресс через `/api/v1/users/me/progress`:
```tsx
const saveProgress = async (skill: string, moduleIndex: number, score: number) => {
  if (!isAuthenticated) return; // Skip if not logged in
  
  await apiRequest('/users/me/progress', {
    method: 'POST',
    body: JSON.stringify({
      skill,
      module_index: moduleIndex,
      completed: score >= 70,
      score,
      time_spent_seconds: Math.floor(timeSpent),
    }),
  });
};
```

**GapAnalyzer.tsx** - Загружать навыки пользователя:
```tsx
useEffect(() => {
  if (isAuthenticated) {
    apiRequest('/users/me/skills').then(setUserSkills);
  }
}, [isAuthenticated]);
```

**VacanciesMap.tsx** - Добавить кнопку bookmark для каждой вакансии

### 6. Тестирование

```bash
# 1. Проверить OAuth flow
# - Открыть https://ai-skills.syntog.ru
# - Нажать "Login with GitHub"
# - Авторизоваться через GitHub
# - Должно перенаправить обратно и показать username в хэдере

# 2. Проверить API с токеном
TOKEN="your_jwt_token_from_browser_devtools"

curl https://ai-skills.syntog.ru/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Добавить навык
curl -X POST https://ai-skills.syntog.ru/api/v1/users/me/skills \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"skill_id": 1, "proficiency_level": 3}'

# 4. Сохранить прогресс
curl -X POST https://ai-skills.syntog.ru/api/v1/users/me/progress \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"skill": "Python", "module_index": 0, "completed": true, "score": 85}'

# 5. Получить статистику
curl https://ai-skills.syntog.ru/api/v1/users/me/stats \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Текущий статус

**Backend:** ✅ Готов (Phase 1 полностью реализован)

**Database:** ⏳ Требуется запуск миграций

**OAuth:** ⏳ Требуется настройка credentials

**Frontend:** ⏳ Требуется интеграция (AuthContext + страницы)

**Deployment:** ✅ Автоматический через GitHub Actions

## 🐛 Известные проблемы

1. **Smoke Tests падают** - нужно проверить логи в GitHub Actions
2. **53 Dependabot vulnerabilities** - нужно обновить зависимости
3. **OAuth state parameter** - сейчас hardcoded, нужно добавить Redis для хранения

## 🚀 После Phase 1

**Phase 2 возможности:**

- AI code review для решений тренажёров (Claude API)
- Real code execution (Judge0 API или Docker sandbox)
- Social features (follow users, comments, likes)
- Leaderboards и achievements
- Project showcase (пользователи публикуют свои проекты)
- Skill recommendations на основе gap analysis
- Integration с LinkedIn для импорта навыков
- Сертификаты за завершённые модули
