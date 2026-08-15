# AI Skills Dashboard - Инструкция по развертыванию

## Требования

- SSH доступ к серверу stroy
- Docker и Docker Compose на сервере
- Nginx на сервере
- Домен ai-skills.syntog.ru настроен на IP сервера

## Быстрое развертывание

### 1. Подготовка сервера

```bash
# Подключиться к серверу
ssh stroy

# Установить Docker (если не установлен)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установить Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Создать директорию проекта
sudo mkdir -p /var/www/ai-skills.syntog.ru
sudo chown $USER:$USER /var/www/ai-skills.syntog.ru
```

### 2. Развертывание с локальной машины

```bash
# Из корня проекта
cd C:\project\icom\ai-skills-dashboard

# Запустить скрипт развертывания
bash deploy/deploy.sh
```

Скрипт выполнит:
- ✅ Сборку frontend
- ✅ Копирование файлов на сервер
- ✅ Запуск Docker Compose
- ✅ Миграции базы данных
- ✅ Настройку Nginx

### 3. Настройка переменных окружения

После первого развертывания:

```bash
ssh stroy
cd /var/www/ai-skills.syntog.ru
nano backend/.env
```

Обновите следующие переменные:

```env
# Security
SECRET_KEY=<сгенерируйте надежный ключ>

# API Keys
HH_API_KEY=<ваш ключ HH.ru API>

# Database (если нужно изменить)
POSTGRES_PASSWORD=<надежный пароль>

# Production
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=https://ai-skills.syntog.ru
```

Перезапустите сервисы:

```bash
docker-compose restart
```

### 4. Настройка SSL (опционально)

Для HTTPS с Let's Encrypt:

```bash
ssh stroy

# Установить certbot
sudo apt-get install certbot python3-certbot-nginx

# Получить сертификат
sudo certbot --nginx -d ai-skills.syntog.ru

# Автоматическое обновление настроится автоматически
```

## Управление сервисами

### Просмотр логов

```bash
ssh stroy
cd /var/www/ai-skills.syntog.ru

# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f celery-worker
docker-compose logs -f frontend
```

### Перезапуск сервисов

```bash
ssh stroy
cd /var/www/ai-skills.syntog.ru

# Все сервисы
docker-compose restart

# Конкретный сервис
docker-compose restart backend
```

### Обновление приложения

```bash
# С локальной машины
cd C:\project\icom\ai-skills-dashboard
bash deploy/deploy.sh
```

### Остановка/запуск

```bash
ssh stroy
cd /var/www/ai-skills.syntog.ru

# Остановить
docker-compose down

# Запустить
docker-compose up -d
```

## Мониторинг

### Проверка здоровья сервисов

```bash
ssh stroy
cd /var/www/ai-skills.syntog.ru

# Статус контейнеров
docker-compose ps

# Использование ресурсов
docker stats
```

### Проверка доступности

```bash
# API health check
curl http://ai-skills.syntog.ru/health

# API docs
curl http://ai-skills.syntog.ru/docs
```

## Резервное копирование

### База данных

```bash
ssh stroy
cd /var/www/ai-skills.syntog.ru

# Создать бэкап
docker-compose exec postgres pg_dump -U ai_skills_user ai_skills > backup_$(date +%Y%m%d).sql

# Восстановить из бэкапа
docker-compose exec -T postgres psql -U ai_skills_user ai_skills < backup_YYYYMMDD.sql
```

### Полный бэкап

```bash
ssh stroy
cd /var/www

# Создать архив
tar -czf ai-skills-backup-$(date +%Y%m%d).tar.gz ai-skills.syntog.ru/

# Исключая node_modules и venv
tar -czf ai-skills-backup-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='venv' \
  ai-skills.syntog.ru/
```

## Устранение неполадок

### Backend не запускается

```bash
# Проверить логи
docker-compose logs backend

# Проверить подключение к БД
docker-compose exec backend python -c "from app.core.database import engine; import asyncio; asyncio.run(engine.connect())"
```

### Frontend не собирается

```bash
# Локально пересобрать
cd frontend
rm -rf node_modules
npm install
npm run build
```

### Celery задачи не выполняются

```bash
# Проверить worker
docker-compose logs celery-worker

# Проверить beat scheduler
docker-compose logs celery-beat

# Проверить Redis
docker-compose exec redis redis-cli ping
```

### База данных заполнена

```bash
# Очистить старые данные
docker-compose exec backend python -c "
from app.celery_worker import cleanup_old_data
import asyncio
asyncio.run(cleanup_old_data())
"
```

## Контакты

**Владелец:** Богорад Сергей Борисович  
**Email:** sbb@bsosh3.org  
**Сайт:** https://ai-skills.syntog.ru

## Лицензия

MIT License - см. LICENSE файл
