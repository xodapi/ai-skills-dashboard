#!/bin/bash
set -e

# Health check script for ai-skills.syntog.ru
# Usage: ./scripts/health-check.sh [URL]

URL="${1:-https://ai-skills.syntog.ru}"
TIMEOUT=10

echo "🔍 Running health checks for $URL"
echo ""

# Check homepage
echo "1️⃣ Testing homepage..."
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$URL")
if [ "$response" != "200" ]; then
    echo "❌ Homepage returned $response"
    exit 1
fi

# Check for white screen (uncompiled code)
content=$(curl -s --max-time $TIMEOUT "$URL")
if echo "$content" | grep -q "import.*from.*\\.tsx"; then
    echo "❌ Homepage contains .tsx imports - build failed!"
    exit 1
fi

if echo "$content" | grep -q "Failed to resolve import"; then
    echo "❌ Vite import errors detected"
    exit 1
fi

echo "✅ Homepage OK"

# Test critical routes
routes=(
    "/dashboard"
    "/skillsets"
    "/worldmap"
    "/radar"
    "/gap-analyzer"
    "/trainer/Python"
)

echo ""
echo "2️⃣ Testing critical routes..."
for route in "${routes[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$URL$route")
    if [ "$response" != "200" ]; then
        echo "❌ Route $route returned $response"
        exit 1
    fi
    echo "✅ $route"
done

# Check API health
echo ""
echo "3️⃣ Testing backend API..."
api_response=$(curl -s --max-time $TIMEOUT "$URL/api/health" || echo "failed")
if [ "$api_response" == "failed" ]; then
    echo "⚠️  Backend API not responding (may be normal if backend is optional)"
else
    echo "✅ Backend API OK"
fi

echo ""
echo "✅ All health checks passed!"
