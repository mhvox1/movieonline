#!/usr/bin/env bash
set -euo pipefail

# One-time bootstrap for Ubuntu VPS.

sudo apt update
sudo apt upgrade -y
sudo apt install -y nginx git ufw curl

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

sudo mkdir -p /var/www/movie-business
sudo chown -R "$USER":"$USER" /var/www/movie-business

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "Bootstrap done. Next: configure Nginx and GitHub secrets."
