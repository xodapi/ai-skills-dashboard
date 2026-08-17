# GitHub OAuth Setup Guide

## 1. Создание GitHub OAuth App

1. Откройте: https://github.com/settings/applications/new
2. Заполните форму:
   - **Application name:** AI Skills Dashboard
   - **Homepage URL:** `https://ai-skills.syntog.ru`
   - **Authorization callback URL:** `https://ai-skills.syntog.ru/auth/callback`
   - **Description (optional):** Skills analysis and career planning dashboard
3. Нажмите **Register application**
4. На странице приложения:
   - Скопируйте **Client ID**
   - Нажмите **Generate a new client secret** и скопируйте **Client Secret** (показывается только один раз!)

## 2. Обновление .env на сервере

SSH в сервер и обновите `.env`:

```bash
ssh stroy
cd /var/www/ai-skills.syntog.ru

# Создайте бэкап
cp .env .env.backup

# Добавьте OAuth credentials (замените YOUR_CLIENT_ID и YOUR_CLIENT_SECRET)
cat >> .env << 'EOF'

# GitHub OAuth
GITHUB_CLIENT_ID=YOUR_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_CLIENT_SECRET
GITHUB_REDIRECT_URI=https://ai-skills.syntog.ru/auth/callback
EOF
```

**Или используйте nano:**
```bash
nano .env
```

Добавьте в конец файла:
```
# GitHub OAuth
GITHUB_CLIENT_ID=YOUR_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_CLIENT_SECRET
GITHUB_REDIRECT_URI=https://ai-skills.syntog.ru/auth/callback
```

## 3. Перезапуск backend

```bash
cd /var/www/ai-skills.syntog.ru
docker-compose -f docker-compose.prod.yml restart backend
```

Или полный перезапуск:
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## 4. Проверка логов

```bash
docker-compose -f docker-compose.prod.yml logs -f backend
```

Убедитесь, что:
- Нет ошибок при старте
- `GITHUB_CLIENT_ID` загружен (проверьте логи startup)

## 5. Тестирование OAuth flow

1. Откройте https://ai-skills.syntog.ru
2. Нажмите кнопку "Войти через GitHub"
3. GitHub должен перенаправить на страницу авторизации
4. После подтверждения → редирект на `/auth/callback`
5. Frontend должен получить JWT токен и сохранить в localStorage
6. Проверьте доступ к `/users/me/skills`, `/users/me/bookmarks`

## 6. Troubleshooting

**Ошибка "redirect_uri_mismatch":**
- Проверьте, что callback URL в GitHub OAuth App точно совпадает с `GITHUB_REDIRECT_URI` в `.env`
- URL должен быть: `https://ai-skills.syntog.ru/auth/callback` (без слеша в конце)

**Ошибка "Client authentication failed":**
- Проверьте, что `GITHUB_CLIENT_SECRET` скопирован правильно (без пробелов)
- Пересоздайте client secret в GitHub OAuth App

**Backend не видит переменные:**
- Убедитесь, что перезапустили контейнер после изменения `.env`
- Проверьте: `docker-compose -f docker-compose.prod.yml config` (покажет parsed environment)

**Frontend показывает ошибку авторизации:**
- Откройте DevTools → Network → проверьте `/auth/github` и `/auth/callback` запросы
- Проверьте CORS настройки в `.env`: `CORS_ORIGINS=https://ai-skills.syntog.ru`

## 7. Security Notes

- **НЕ коммитьте** `.env` с реальными credentials в git
- Client Secret показывается только один раз при создании
- Храните backup `.env.backup` на сервере в защищенном месте
- Регулярно ротируйте client secret (GitHub Settings → Regenerate)

## 8. Production Checklist

- [ ] GitHub OAuth App создан
- [ ] Client ID и Secret добавлены в `.env`
- [ ] Backend перезапущен
- [ ] Логи не содержат ошибок
- [ ] OAuth flow протестирован
- [ ] `/users/me/skills` возвращает реальные данные пользователя
- [ ] Токен сохраняется в localStorage
- [ ] Logout работает корректно
