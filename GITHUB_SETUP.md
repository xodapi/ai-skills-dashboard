# Инструкция по публикации на GitHub

## Шаг 1: Создайте репозиторий на GitHub

1. Перейдите на https://github.com/new
2. Название репозитория: `ai-skills-dashboard`
3. Описание: `AI Skills Analytics Dashboard — интерактивная аналитика востребованности навыков AI/ML инженеров`
4. Выберите: **Public**
5. НЕ создавайте README, .gitignore или лицензию (они уже есть в проекте)
6. Нажмите **Create repository**

## Шаг 2: Подключите локальный репозиторий

```bash
cd C:\project\icom\ai-skills-dashboard

# Добавьте remote
git remote add origin https://github.com/YOUR_USERNAME/ai-skills-dashboard.git

# Или если используете SSH
git remote add origin git@github.com:YOUR_USERNAME/ai-skills-dashboard.git

# Проверьте
git remote -v
```

## Шаг 3: Отправьте код на GitHub

```bash
# Переименуйте ветку в main (если нужно)
git branch -M main

# Отправьте код
git push -u origin main
```

## Шаг 4: Настройте GitHub Actions Secrets

В настройках репозитория на GitHub:

1. Перейдите: **Settings** → **Secrets and variables** → **Actions**
2. Добавьте следующие secrets:

### SSH_PRIVATE_KEY
```
# Создайте SSH ключ (если нет)
ssh-keygen -t ed25519 -C "github-actions@ai-skills-dashboard"

# Скопируйте приватный ключ
cat ~/.ssh/id_ed25519

# Добавьте его в GitHub Secret: SSH_PRIVATE_KEY
```

### SERVER_HOST
```
# IP адрес или hostname вашего сервера stroy
# Например: 123.45.67.89 или stroy.example.com
```

### SERVER_USER
```
# Имя пользователя для SSH подключения
# Например: ubuntu или your_username
```

## Шаг 5: Настройте сервер для deployment

```bash
# Подключитесь к серверу
ssh stroy

# Добавьте публичный SSH ключ от GitHub Actions
nano ~/.ssh/authorized_keys
# Вставьте содержимое публичного ключа (cat ~/.ssh/id_ed25519.pub)

# Проверьте подключение с локальной машины
ssh -i ~/.ssh/id_ed25519 your_user@stroy "echo Connection works"
```

## Шаг 6: Создайте .env файл на сервере

```bash
ssh stroy
mkdir -p /var/www/ai-skills.syntog.ru/backend
nano /var/www/ai-skills.syntog.ru/backend/.env
```

Содержимое .env:
```env
DATABASE_URL=postgresql+asyncpg://ai_skills_user:SECURE_PASSWORD@postgres:5432/ai_skills
REDIS_URL=redis://redis:6379/0
SECRET_KEY=GENERATE_SECURE_SECRET_KEY_HERE
HH_API_KEY=YOUR_HH_API_KEY
CORS_ORIGINS=https://ai-skills.syntog.ru
ENVIRONMENT=production
DEBUG=False
POSTGRES_USER=ai_skills_user
POSTGRES_PASSWORD=SECURE_PASSWORD
```

## Шаг 7: Первый deployment

```bash
# Локально запустите deployment
cd C:\project\icom\ai-skills-dashboard
bash deploy/deploy.sh

# Или дождитесь автоматического deployment через GitHub Actions
# (после push в main ветку)
```

## Шаг 8: Проверка

После deployment:

1. **Откройте сайт:** http://ai-skills.syntog.ru
2. **API документация:** http://ai-skills.syntog.ru/docs
3. **Health check:** http://ai-skills.syntog.ru/health

## Шаг 9: Настройка SSL (HTTPS)

```bash
ssh stroy

# Установите certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Получите SSL сертификат
sudo certbot --nginx -d ai-skills.syntog.ru

# Certbot автоматически настроит Nginx и обновление сертификата
```

## Обновление README на GitHub

После публикации обновите badges в README.md:

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev/)
[![CI/CD](https://github.com/YOUR_USERNAME/ai-skills-dashboard/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_USERNAME/ai-skills-dashboard/actions)
```

## Мониторинг GitHub Actions

После каждого push в main:

1. Перейдите: **Actions** tab в репозитории
2. Проверьте статус pipeline
3. Просмотрите логи при ошибках

## Генерация SSH ключей для разных сервисов

### Для GitHub Actions
```bash
ssh-keygen -t ed25519 -C "github-actions@ai-skills" -f ~/.ssh/github_actions_key
```

### Для личного использования
```bash
ssh-keygen -t ed25519 -C "your.email@example.com" -f ~/.ssh/personal_key
```

## Команды для работы с репозиторием

```bash
# Клонирование
git clone https://github.com/YOUR_USERNAME/ai-skills-dashboard.git

# Обновление
git pull origin main

# Создание feature branch
git checkout -b feature/new-feature

# Commit и push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Создание Pull Request
# Через веб-интерфейс GitHub или:
gh pr create --title "Add new feature" --body "Description"
```

## Troubleshooting

### Error: Permission denied (publickey)

Проблема с SSH ключами. Проверьте:
```bash
# На сервере
cat ~/.ssh/authorized_keys

# Локально
ssh -v stroy
```

### Error: Could not resolve hostname

Проблема с DNS. Проверьте:
```bash
nslookup ai-skills.syntog.ru
ping ai-skills.syntog.ru
```

### GitHub Actions fails

Проверьте:
1. Secrets правильно настроены
2. SSH ключи добавлены на сервер
3. Сервер доступен
4. Логи в Actions tab

## Дополнительно

### GitHub Topics

Добавьте topics к репозиторию для лучшей видимости:
- `ai`
- `machine-learning`
- `data-science`
- `fastapi`
- `react`
- `typescript`
- `postgresql`
- `docker`
- `analytics`
- `job-market`

### GitHub Pages (опционально)

Можно опубликовать документацию на GitHub Pages:

```bash
# В settings репозитория:
# Pages → Source → Deploy from a branch → gh-pages
```

---

**Готово!** Ваш проект теперь публичен и доступен всем 🚀

GitHub репозиторий: https://github.com/YOUR_USERNAME/ai-skills-dashboard
Live demo: https://ai-skills.syntog.ru
