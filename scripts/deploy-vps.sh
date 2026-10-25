#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# PrintIt — Complete Single-VPS Deployment Script
# Everything on VPS: Local MongoDB + Local File Uploads + Nginx + PM2
# Works on Ubuntu 20.04 / 22.04 / 24.04 VPS
# ============================================================

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_ROOT="/var/www/printit"

echo "🚀 Starting PrintIt Full-VPS Deployment from: $APP_DIR"

# 0. Ensure Local MongoDB is installed and running on the VPS
if ! command -v mongod >/dev/null 2>&1; then
  echo "🍃 Installing Local MongoDB Community Server on VPS..."
  sudo apt-get update -y
  sudo apt-get install -y gnupg curl
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes
  UBUNTU_CODENAME="$(. /etc/os-release && echo "${VERSION_CODENAME:-jammy}")"
  # Fallback to jammy repo if noble (24.04) or newer
  if [ "$UBUNTU_CODENAME" != "focal" ] && [ "$UBUNTU_CODENAME" != "jammy" ]; then
    UBUNTU_CODENAME="jammy"
  fi
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${UBUNTU_CODENAME}/mongodb-org/7.0 multiverse" | \
    sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
  sudo apt-get update -y
  sudo apt-get install -y mongodb-org
fi

echo "🍃 Ensuring local MongoDB service (mongod) is active..."
sudo systemctl enable --now mongod

# 1. Build Backend
echo "📦 [1/4] Installing & building Backend..."
cd "$APP_DIR/Backend"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  Created Backend/.env from .env.example (Using local MongoDB: mongodb://127.0.0.1:27017/printit)"
fi
npm install
npm run build
mkdir -p "$APP_DIR/Backend/uploads"

# 2. Build Student Frontend
echo "🎨 [2/4] Installing & building Student Frontend..."
cd "$APP_DIR/Frontend"
if [ ! -f .env ]; then
  echo "VITE_API_URL=/api" > .env
  echo "⚠️  Created Frontend/.env with VITE_API_URL=/api (Add VITE_RAZORPAY_KEY_ID in Frontend/.env and re-run if needed)"
fi
npm install
npm run build

# 3. Build Admin Frontend
echo "🛠️  [3/4] Installing & building Admin Frontend..."
cd "$APP_DIR/Admin Frontend"
if [ ! -f .env ]; then
  echo "VITE_API_URL=/api" > .env
fi
npm install
npm run build

# 4. Copy Frontend & Admin static builds for Nginx
echo "📂 [4/4] Publishing static builds to $WEB_ROOT..."
sudo mkdir -p "$WEB_ROOT/frontend/dist" "$WEB_ROOT/admin/dist"
sudo rm -rf "$WEB_ROOT/frontend/dist/"* "$WEB_ROOT/admin/dist/"*
sudo cp -r "$APP_DIR/Frontend/dist/"* "$WEB_ROOT/frontend/dist/"
sudo cp -r "$APP_DIR/Admin Frontend/dist/"* "$WEB_ROOT/admin/dist/"

# Configure Nginx if installed
if command -v nginx >/dev/null 2>&1; then
  echo "🌐 Updating Nginx configuration..."
  sudo cp "$APP_DIR/deploy/nginx.printit.conf" /etc/nginx/sites-available/printit
  sudo ln -sf /etc/nginx/sites-available/printit /etc/nginx/sites-enabled/printit
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t && sudo systemctl reload nginx
fi

# Start or restart Backend via PM2
if command -v pm2 >/dev/null 2>&1; then
  echo "🔄 Restarting Backend with PM2..."
  cd "$APP_DIR/Backend"
  pm2 startOrReload ecosystem.config.cjs --update-env
  pm2 save
else
  echo "⚠️  PM2 not found. Install it with: sudo npm install -g pm2"
fi

echo "✅ PrintIt Full-VPS Deployment Complete!"
echo "   - Local MongoDB: mongodb://127.0.0.1:27017/printit"
echo "   - Local Uploads: $APP_DIR/Backend/uploads"
echo "   - Student App:   http://<YOUR_VPS_IP>/"
echo "   - Admin Panel:   http://<YOUR_VPS_IP>/admin/"
echo "   - API Health:    http://<YOUR_VPS_IP>/api/health"
