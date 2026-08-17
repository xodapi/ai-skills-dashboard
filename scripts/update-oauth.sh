#!/bin/bash
# Script to update GitHub OAuth credentials on production server
# Usage: ./update-oauth.sh <CLIENT_ID> <CLIENT_SECRET>

set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <CLIENT_ID> <CLIENT_SECRET>"
    echo "Example: $0 Iv1.abc123def456 ghp_xyz789abc456def123"
    exit 1
fi

CLIENT_ID="$1"
CLIENT_SECRET="$2"
REDIRECT_URI="https://ai-skills.syntog.ru/auth/callback"
SERVER="stroy"
PROJECT_DIR="/var/www/ai-skills.syntog.ru"

echo "🔐 Updating GitHub OAuth credentials on $SERVER..."

# Backup existing .env
ssh $SERVER "cd $PROJECT_DIR && cp .env .env.backup-\$(date +%Y%m%d-%H%M%S)"
echo "✓ Created .env backup"

# Check if OAuth section already exists
if ssh $SERVER "grep -q 'GITHUB_CLIENT_ID' $PROJECT_DIR/.env"; then
    echo "⚠ OAuth credentials already exist in .env"
    echo "Updating existing values..."
    
    ssh $SERVER "cd $PROJECT_DIR && \
        sed -i 's|^GITHUB_CLIENT_ID=.*|GITHUB_CLIENT_ID=$CLIENT_ID|' .env && \
        sed -i 's|^GITHUB_CLIENT_SECRET=.*|GITHUB_CLIENT_SECRET=$CLIENT_SECRET|' .env && \
        sed -i 's|^GITHUB_REDIRECT_URI=.*|GITHUB_REDIRECT_URI=$REDIRECT_URI|' .env"
else
    echo "Adding new OAuth credentials..."
    ssh $SERVER "cd $PROJECT_DIR && cat >> .env << 'EOF'

# GitHub OAuth
GITHUB_CLIENT_ID=$CLIENT_ID
GITHUB_CLIENT_SECRET=$CLIENT_SECRET
GITHUB_REDIRECT_URI=$REDIRECT_URI
EOF"
fi

echo "✓ Updated .env with OAuth credentials"

# Restart backend
echo "🔄 Restarting backend container..."
ssh $SERVER "cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml restart backend"
echo "✓ Backend restarted"

# Wait for backend to start
echo "⏳ Waiting 5 seconds for backend to start..."
sleep 5

# Check logs
echo "📋 Recent backend logs:"
ssh $SERVER "cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml logs --tail=20 backend"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open https://ai-skills.syntog.ru"
echo "2. Click 'Войти через GitHub'"
echo "3. Authorize the application"
echo "4. Verify you're redirected back and logged in"
echo ""
echo "Troubleshooting:"
echo "- View logs: ssh $SERVER 'cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml logs -f backend'"
echo "- Check .env: ssh $SERVER 'cat $PROJECT_DIR/.env'"
