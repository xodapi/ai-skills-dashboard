#!/bin/bash
# Production deployment script for ai-skills-dashboard

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "🚀 AI Skills Dashboard - Production Deployment"
echo "================================================"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Warning: Not running as root. Docker commands may require sudo."
fi

# Pull latest changes
echo ""
echo "📦 Pulling latest changes from git..."
git fetch origin master
git checkout master
git pull --ff-only origin master

CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo "✅ Current commit: $CURRENT_COMMIT"

# Check if .env exists
if [ ! -f backend/.env ]; then
    echo "❌ Error: backend/.env not found. Please create it from .env.example"
    exit 1
fi

# Build and restart containers
echo ""
echo "🐳 Building and restarting Docker containers (production mode)..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 20

# Health checks
echo ""
echo "🏥 Running health checks..."

# Check backend
if curl -sf http://localhost:8000/api/v1/health > /dev/null; then
    echo "✅ Backend: healthy"
else
    echo "❌ Backend: unhealthy"
    docker compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Check frontend
if curl -sf http://localhost:3004/health > /dev/null; then
    echo "✅ Frontend: healthy"
else
    echo "❌ Frontend: unhealthy"
    docker compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Check training modules
if curl -sf http://localhost:8000/api/v1/training/modules > /dev/null; then
    echo "✅ Training modules: available"
else
    echo "⚠️  Training modules: not available"
fi

echo ""
echo "================================================"
echo "✅ Deployment complete!"
echo "   Frontend: http://localhost:3004"
echo "   Backend:  http://localhost:8000"
echo "   Docs:     http://localhost:8000/docs"
echo "================================================"
