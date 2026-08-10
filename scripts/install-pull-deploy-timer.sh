#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/movie-business}"

if [ ! -d "$APP_DIR" ]; then
  echo "App directory $APP_DIR not found. Clone repo there first."
  exit 1
fi

cd "$APP_DIR"

sudo cp deploy/systemd/movie-business-pull-deploy.service /etc/systemd/system/movie-business-pull-deploy.service
sudo cp deploy/systemd/movie-business-pull-deploy.timer /etc/systemd/system/movie-business-pull-deploy.timer

if [ ! -f /etc/default/movie-business-pull ]; then
  sudo cp deploy/systemd/movie-business-pull.env.example /etc/default/movie-business-pull
  sudo chmod 600 /etc/default/movie-business-pull
  echo "Created /etc/default/movie-business-pull from template."
  echo "Edit it with your domains before enabling timer:"
  echo "  sudo nano /etc/default/movie-business-pull"
fi

sudo systemctl daemon-reload
sudo systemctl enable --now movie-business-pull-deploy.timer
sudo systemctl start movie-business-pull-deploy.service

echo "Timer installed. Check status:"
echo "  systemctl status movie-business-pull-deploy.timer"
echo "  journalctl -u movie-business-pull-deploy.service -n 200 --no-pager"