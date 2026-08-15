# Как получить доступ к HH.ru API

## Вариант 1: Без регистрации (РЕКОМЕНДУЕТСЯ для нашего проекта)

HH.ru предоставляет **публичный API** для чтения вакансий БЕЗ авторизации.

### Что нужно:

Только корректный **User-Agent** заголовок:

```
User-Agent: YourAppName (your@email.com)
```

Уже настроено в `scrapers/hh_scraper.py`:
```python
"HH-User-Agent": "AI Skills Dashboard (sbb@bsosh3.org)"
```

### Готово! ✅

Scraper уже работает без API ключа для чтения публичных вакансий.

---

## Вариант 2: С регистрацией приложения (для расширенного доступа)

Если нужны дополнительные возможности (создание вакансий, работа от имени пользователя):

### Шаг 1: Регистрация на dev.hh.ru

1. Перейдите: https://dev.hh.ru/admin
2. Нажмите "Создать приложение"
3. Заполните форму:

**Название:** AI Skills Dashboard  
**Описание:** Analytics dashboard for AI/ML skills demand tracking  
**Сайт:** https://ai-skills.syntog.ru  

**Redirect URI (выберите один):**

Для локальной разработки:
```
http://localhost:3002/auth/callback
```

Для production:
```
https://ai-skills.syntog.ru/auth/callback
```

Можно указать оба через запятую.

### Шаг 2: Получить Application ID и Secret

После создания приложения вы получите:
- **Application ID** (Client ID)
- **Client Secret**

### Шаг 3: Обновить .env

```env
HH_API_KEY=your_application_id_here
HH_CLIENT_SECRET=your_client_secret_here
```

---

## Какой вариант использовать?

### Для нашего проекта: **Вариант 1** ✅

**Почему:**
- Мы только **читаем** публичные вакансии
- Не создаём и не изменяем вакансии
- Не работаем от имени пользователя
- Публичный API достаточен для всех функций

**HH_API_KEY можно оставить пустым!**

---

## Лимиты API

### Без авторизации:
- 2000 запросов в минуту
- Доступ ко всем публичным вакансиям
- Достаточно для нашего scraper

### С авторизацией:
- 5000 запросов в минуту
- Создание/изменение вакансий
- Работа от имени пользователя

---

## Текущее состояние проекта

✅ **Scraper уже работает без API ключа**

Файл `scrapers/hh_scraper.py` настроен для работы с публичным API.

Можно запускать прямо сейчас:

```bash
cd backend
python scrapers/hh_scraper.py
```

---

## Если всё же хотите зарегистрировать

**Redirect URL:** `http://localhost:3002/auth/callback`

Но для текущей функциональности это **НЕ требуется**.

---

## Документация

- Публичный API: https://github.com/hhru/api
- Авторизация: https://github.com/hhru/api/blob/master/docs/authorization.md
- Вакансии: https://github.com/hhru/api/blob/master/docs/vacancies.md

---

**Вывод:** Оставьте HH_API_KEY пустым в .env — scraper уже работает! 🚀
