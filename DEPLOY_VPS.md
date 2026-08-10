Movie Business VPS Deployment Guide

This guide gives you a production setup with:
- Nginx serving the frontend
- Node API managed by PM2
- HTTPS via Certbot
- GitHub auto deploy on every push

1) Prerequisites
- VPS with Ubuntu 22.04 or 24.04
- Domain records configured:
  - example.com and www.example.com -> VPS IP
  - api.example.com -> VPS IP
- SSH access to VPS
- GitHub repository for this project

2) First server setup (one-time)
Run on VPS:

sudo apt update
sudo apt upgrade -y
sudo apt install -y nginx git ufw curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

3) Create app directory on VPS
Run on VPS:

sudo mkdir -p /var/www/movie-business
sudo chown -R $USER:$USER /var/www/movie-business

4) Clone repository once on VPS (only for setup templates)
Run on VPS:

cd /var/www/movie-business
git clone YOUR_REPO_URL .

5) Nginx config
Use templates from deploy/nginx:
- deploy/nginx/movie-business-frontend.conf
- deploy/nginx/movie-business-api.conf

Copy and edit server_name values.
Then run on VPS:

sudo cp deploy/nginx/movie-business-frontend.conf /etc/nginx/sites-available/movie-business-frontend
sudo cp deploy/nginx/movie-business-api.conf /etc/nginx/sites-available/movie-business-api
sudo ln -sf /etc/nginx/sites-available/movie-business-frontend /etc/nginx/sites-enabled/movie-business-frontend
sudo ln -sf /etc/nginx/sites-available/movie-business-api /etc/nginx/sites-enabled/movie-business-api
sudo nginx -t
sudo systemctl reload nginx

6) HTTPS certificates
Run on VPS:

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot --nginx -d api.example.com

7) GitHub Secrets (for auto deploy)
In GitHub repo settings -> Secrets and variables -> Actions, create:
- VPS_HOST                e.g. 203.0.113.10
- VPS_USER                e.g. ubuntu
- VPS_PORT                e.g. 22
- VPS_SSH_KEY             private key content
- VPS_APP_DIR             /var/www/movie-business
- VITE_ONLINE_CORE_URL    https://api.example.com

8) What the workflow does
The workflow file is .github/workflows/deploy-vps.yml.
On push to main/master it will:
- install dependencies
- build frontend dist
- upload deploy archive to VPS
- extract files to VPS app directory
- install production dependencies
- restart API with PM2
- test and reload Nginx

9) First deploy
- Push your branch to main/master
- Open GitHub Actions and watch Deploy VPS
- If green, test:
  - https://example.com
  - https://api.example.com/health
  - https://api.example.com/Verwaltung.html

10) About real-time updates
"Real-time" like a static homepage is possible in practice via CI/CD:
- every push can be auto deployed in about 1-3 minutes
- truly instant hot reload on production is not recommended

Recommended flow:
- develop locally
- push to GitHub
- auto deploy via action

11) Important data note
The workflow archive excludes server/data.
This keeps production save data and users on the VPS.

