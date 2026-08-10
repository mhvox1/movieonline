Hostinger VPS Deployment: Schritt fuer Schritt

Ziel
- Das Spiel laeuft unter deiner Domain.
- API/Backend laeuft auf dem VPS.
- Jeder Push nach GitHub kann automatisch deployen.

Wichtig
- Ich kann deinen Hostinger- und GitHub-Account nicht direkt anklicken.
- Ich habe alles vorbereitet, was lokal machbar ist (Workflow, Nginx-Templates, PM2-Config).
- Du musst nur noch die Zugangsdaten an den richtigen Stellen eintragen.

Vorbereitet im Repo
- .github/workflows/deploy-vps.yml
- deploy/nginx/movie-business-frontend.conf
- deploy/nginx/movie-business-api.conf
- ecosystem.config.cjs
- scripts/vps-bootstrap.sh

1) Daten in Hostinger finden

1.1 VPS IP-Adresse
- Hostinger hPanel -> VPS -> Manage -> Overview
- Feld: IPv4 Address
- Das ist der Wert fuer GitHub Secret VPS_HOST und fuer DNS A-Records.

1.2 SSH Benutzername und SSH Port
- Hostinger hPanel -> VPS -> Manage -> Access (oder SSH Access)
- Felder: Username, Port
- Werte fuer GitHub Secrets:
  - VPS_USER
  - VPS_PORT

1.3 Domain DNS setzen
- Hostinger hPanel -> Domains -> Manage -> DNS Zone Editor
- Lege an:
  - A-Record: @ -> deine VPS IPv4
  - A-Record: www -> deine VPS IPv4
  - A-Record: api -> deine VPS IPv4
- Speichern.
- DNS kann 5-30 Minuten brauchen.

2) Einmaliges VPS-Setup ausfuehren (SSH)

2.1 Per SSH verbinden
- Beispiel:
  ssh USER@VPS_IP -p PORT

2.2 Repo auf VPS holen
- Auf dem VPS:
  sudo mkdir -p /var/www/movie-business
  sudo chown -R $USER:$USER /var/www/movie-business
  cd /var/www/movie-business
  git clone https://github.com/mhvox1/movieonline.git .

2.3 Bootstrap starten
- Auf dem VPS:
  chmod +x scripts/vps-bootstrap.sh
  ./scripts/vps-bootstrap.sh

3) Nginx mit deinen Domains konfigurieren

3.1 Frontend-Config anpassen
- Datei auf VPS:
  /var/www/movie-business/deploy/nginx/movie-business-frontend.conf
- Ersetze:
  server_name example.com www.example.com;
- Mit deiner echten Domain, z. B.:
  server_name deinspiel.de www.deinspiel.de;

3.2 API-Config anpassen
- Datei auf VPS:
  /var/www/movie-business/deploy/nginx/movie-business-api.conf
- Ersetze:
  server_name api.example.com;
- Mit deiner echten API-Domain, z. B.:
  server_name api.deinspiel.de;

3.3 Nginx aktivieren
- Auf dem VPS:
  sudo cp deploy/nginx/movie-business-frontend.conf /etc/nginx/sites-available/movie-business-frontend
  sudo cp deploy/nginx/movie-business-api.conf /etc/nginx/sites-available/movie-business-api
  sudo ln -sf /etc/nginx/sites-available/movie-business-frontend /etc/nginx/sites-enabled/movie-business-frontend
  sudo ln -sf /etc/nginx/sites-available/movie-business-api /etc/nginx/sites-enabled/movie-business-api
  sudo nginx -t
  sudo systemctl reload nginx

4) HTTPS aktivieren (Certbot)

- Auf dem VPS:
  sudo apt install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d deinspiel.de -d www.deinspiel.de
  sudo certbot --nginx -d api.deinspiel.de

5) GitHub Secrets eintragen

Pfad in GitHub
- Repo -> Settings -> Secrets and variables -> Actions -> New repository secret

Lege exakt diese Secrets an:
- VPS_HOST
  - Wert: deine VPS IPv4 aus Hostinger Overview
- VPS_USER
  - Wert: SSH Username aus Hostinger Access
- VPS_PORT
  - Wert: SSH Port aus Hostinger Access (oft 22)
- VPS_SSH_KEY
  - Wert: Inhalt deines PRIVATE SSH Keys
  - Hinweis: Nicht den Public Key nehmen.
- VPS_APP_DIR
  - Wert: /var/www/movie-business
- VITE_ONLINE_CORE_URL
  - Wert: https://api.deinspiel.de

6) Erstes Auto-Deployment starten

Option A (empfohlen)
- Auf main pushen.
- Dann startet Deploy VPS automatisch.

Option B (manuell)
- GitHub -> Actions -> Deploy VPS -> Run workflow.

7) Erfolg pruefen

- Frontend:
  https://deinspiel.de
- API Health:
  https://api.deinspiel.de/health
- Verwaltung:
  https://api.deinspiel.de/Verwaltung.html

8) Wenn etwas rot wird

- In GitHub Actions den fehlgeschlagenen Step oeffnen.
- Typische Ursachen:
  - Falscher Secret-Wert (Host/User/Port/SSH-Key)
  - DNS zeigt noch nicht auf VPS
  - Nginx server_name noch auf example.com

9) Sicherheit

- SSH Private Key niemals in Chat posten.
- Secret-Werte nur in GitHub Secrets oder lokal im Terminal eingeben.
