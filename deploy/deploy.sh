#!/bin/bash

# Deployment script for ai-skills.syntog.ru on SSH server stroy

set -e

echo "🚀 Deploying AI Skills Dashboard to stroy server..."

# Configuration
SERVER="stroy"
REMOTE_DIR="/var/www/ai-skills.syntog.ru"
PROJECT_NAME="ai-skills-dashboard"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Step 2: Copy files to server
echo "📤 Copying files to server..."
ssh $SERVER "mkdir -p $REMOTE_DIR"

rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '.git' \
  --exclude 'venv' \
  --exclude '.env' \
  --exclude '*.log' \
  ./ $SERVER:$REMOTE_DIR/

# Step 3: Copy .env file if it doesn't exist
echo "⚙️  Setting up environment..."
ssh $SERVER << 'ENDSSH'
cd /var/www/ai-skills.syntog.ru
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "⚠️  Please update backend/.env with production values!"
fi
ENDSSH

# Step 4: Deploy with Docker Compose
echo "🐳 Deploying with Docker Compose..."
ssh $SERVER << 'ENDSSH'
cd /var/www/ai-skills.syntog.ru

# Pull latest images
docker-compose pull

# Build and start services
docker-compose up -d --build

# Run database migrations
docker-compose exec -T backend alembic upgrade head

# Check service health
echo "Waiting for services to be healthy..."
sleep 10
docker-compose ps

ENDSSH

# Step 5: Configure Nginx if needed
echo "🌐 Configuring Nginx..."
ssh $SERVER << 'ENDSSH'
if [ ! -f /etc/nginx/sites-available/ai-skills.syntog.ru ]; then
  cat > /etc/nginx/sites-available/ai-skills.syntog.ru << 'NGINX_CONF'
server {
    listen 80;
    server_name ai-skills.syntog.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX_CONF

  ln -s /etc/nginx/sites-available/ai-skills.syntog.ru /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
  echo "✅ Nginx configured"
fi
ENDSSH

# Step 6: Verify deployment
echo "✅ Checking deployment status..."
ssh $SERVER "cd $REMOTE_DIR && docker-compose ps"

echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo "Dashboard: http://ai-skills.syntog.ru"
echo "API Docs: http://ai-skills.syntog.ru/docs"
echo ""
echo "To view logs:"
echo "  ssh $SERVER 'cd $REMOTE_DIR && docker-compose logs -f'"
echo ""
echo "To restart services:"
echo "  ssh $SERVER 'cd $REMOTE_DIR && docker-compose restart'"
