#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  Deploying DeRoyal Hotspot OS Updates on Contabo VPS"
echo "=========================================================="

# Determine project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"
echo "📂 Working directory: $(pwd)"

# 1. Pull latest code from GitHub
echo "⬇️  Pulling latest code from GitHub (origin/main)..."
git pull origin main

# 2. Update Database & Backend
echo "🗄️  Updating Database and Backend..."
cd "$PROJECT_ROOT/backend"

if [ -f "package.json" ]; then
  npm install
  echo "⚙️  Generating Prisma Client..."
  npx prisma generate
  echo "🚀 Applying Database Migrations..."
  npx prisma migrate deploy || npx prisma db push
  echo "🔨 Compiling Backend TypeScript..."
  npm run build
fi

# 3. Restart PM2 Process
echo "🔄 Restarting PM2 process..."
if command -v pm2 &> /dev/null; then
  pm2 restart deroyal-hotspot-backend || pm2 restart all || pm2 start dist/server.js --name "deroyal-hotspot-backend"
  pm2 save
fi

# 4. Build Frontend
echo "🌐 Updating Frontend..."
cd "$PROJECT_ROOT/frontend"

if [ -f "package.json" ]; then
  npm install
  echo "🔨 Building Frontend Production Bundle..."
  npm run build
fi

# 5. Reload Nginx
echo "🔄 Reloading Nginx Web Server..."
if command -v nginx &> /dev/null; then
  sudo nginx -t && sudo systemctl reload nginx
fi

echo "=========================================================="
echo "  ✅ Deployment Completed Successfully!"
echo "=========================================================="
