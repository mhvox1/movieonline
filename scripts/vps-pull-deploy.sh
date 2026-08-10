#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/movie-business}"
REPO_URL="${REPO_URL:-https://github.com/mhvox1/movieonline.git}"
BRANCH="${BRANCH:-main}"
PORT="${PORT:-8787}"
FRONTEND_DOMAIN="${FRONTEND_DOMAIN:-}"
API_DOMAIN="${API_DOMAIN:-}"

echo "[pull-deploy] starting at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "[pull-deploy] ensuring base packages"
if ! command -v git >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y git
fi
if ! command -v curl >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y curl ca-certificates
fi
if ! command -v nginx >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y nginx
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER":"$USER" "$APP_DIR"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "[pull-deploy] cloning repository"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

echo "[pull-deploy] updating repository"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "[pull-deploy] installing dependencies and building"
npm ci
npm run build
npm prune --omit=dev

if [ -n "$FRONTEND_DOMAIN" ]; then
  echo "[pull-deploy] writing frontend nginx vhost"
  sudo tee /etc/nginx/sites-available/movie-business-frontend >/dev/null <<EOF
server {
  listen 80;
  server_name ${FRONTEND_DOMAIN} www.${FRONTEND_DOMAIN};
  root ${APP_DIR}/dist;
  index index.html;

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
EOF
  sudo ln -sf /etc/nginx/sites-available/movie-business-frontend /etc/nginx/sites-enabled/movie-business-frontend
fi

if [ -n "$API_DOMAIN" ]; then
  echo "[pull-deploy] writing api nginx vhost"
  sudo tee /etc/nginx/sites-available/movie-business-api >/dev/null <<EOF
server {
  listen 80;
  server_name ${API_DOMAIN};

  location / {
    proxy_pass http://127.0.0.1:${PORT};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF
  sudo ln -sf /etc/nginx/sites-available/movie-business-api /etc/nginx/sites-enabled/movie-business-api
fi

sudo rm -f /etc/nginx/sites-enabled/default

echo "[pull-deploy] reloading app and nginx"
pm2 startOrReload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs --update-env
pm2 save

sudo nginx -t
sudo systemctl enable nginx || true
sudo systemctl start nginx || true
sudo systemctl reload nginx

echo "[pull-deploy] done"