# School Support Atlas VPS Deployment

This guide copies the deployment pattern observed on the Officer Charles VPS and adapts it for School Support Atlas.

## What I found on the Officer Charles VPS

- Host: Ubuntu 24.04 LTS.
- App layout: `/opt/officer-charles/releases/<timestamp>` with `/opt/officer-charles/current` as a symlink to the active release.
- Backend process: Node backend intended to run from `/opt/officer-charles/current/backend` on `127.0.0.1:4000`.
- Dashboard process: `officer-charles-frontend.service` is active and runs `/usr/bin/node .output/server/index.mjs` from `/opt/officer-charles/current/dashboard` on `127.0.0.1:8080`.
- Nginx: enabled and active. It proxies `/api/` and `/ws/` to `127.0.0.1:4000`, and `/` to `127.0.0.1:8080`.
- Cloudflare Tunnel: enabled and active through `/etc/cloudflared/config.yml`. Its ingress routes `/api/*` to the backend port and all other web traffic to the dashboard port.
- Important issue found: `officer-charles-backend.service` is enabled but restart-failing because port `4000` is already used by a manually started `npm start` process. Older `officer-charles-web.service` and `officer-charles-core.service` units exist but are disabled/inactive. For the new VPS, run every long-lived app through systemd only. Do not also start it manually in SSH.

## Target School Support Atlas layout

Use this layout on the new VPS:

```text
/opt/school-support-atlas/
  current -> /opt/school-support-atlas/releases/<timestamp>
  releases/
    <timestamp>/
      backend/project/
      public-website/
      admin-ui/
  shared/
    backend.env
    public.env
    admin.env
    uploads/
  logs/
```

Recommended local ports:

```text
127.0.0.1:8000  backend API
127.0.0.1:3000  public website
127.0.0.1:3001  admin UI
```

Recommended production hostnames:

```text
schoolsupportatlas.com          public website
www.schoolsupportatlas.com      public website
admin.schoolsupportatlas.com    admin UI
api.schoolsupportatlas.com      backend API
```

## 1. Base server setup

If Node.js and common build tools are already installed, you can still run the verification commands.

```bash
sudo apt update
sudo apt install -y git curl ca-certificates gnupg build-essential nginx ufw

node -v
npm -v
nginx -v
```

Create the deployment folders:

```bash
sudo mkdir -p /opt/school-support-atlas/releases
sudo mkdir -p /opt/school-support-atlas/shared/uploads
sudo mkdir -p /opt/school-support-atlas/logs
sudo chown -R "$USER:$USER" /opt/school-support-atlas
```

## 2. Install MongoDB

Use MongoDB's official `mongodb-org` packages, not Ubuntu's old `mongodb` package. MongoDB's docs say `mongod` is managed with `systemctl` on modern Linux, and the package creates `/var/lib/mongodb`, `/var/log/mongodb`, and `/etc/mongod.conf`.

For Ubuntu 24.04, use the MongoDB 8.0 repository:

```bash
sudo apt install -y gnupg curl

curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
  --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

sudo apt update
sudo apt install -y mongodb-org
sudo systemctl daemon-reload
sudo systemctl enable --now mongod
sudo systemctl status mongod --no-pager
```

Create database users:

```bash
mongosh
```

Inside `mongosh`:

```javascript
use admin
db.createUser({
  user: "mongo_admin",
  pwd: passwordPrompt(),
  roles: [{ role: "root", db: "admin" }]
})

use support_platform_app
db.createUser({
  user: "support_atlas_app",
  pwd: passwordPrompt(),
  roles: [{ role: "readWrite", db: "support_platform_app" }]
})
exit
```

Enable MongoDB auth:

```bash
sudo cp /etc/mongod.conf /etc/mongod.conf.backup.$(date +%Y%m%d%H%M%S)
sudo nano /etc/mongod.conf
```

Add or update:

```yaml
security:
  authorization: enabled
```

Keep MongoDB bound to localhost unless you intentionally run a remote database:

```yaml
net:
  port: 27017
  bindIp: 127.0.0.1
```

Restart and test:

```bash
sudo systemctl restart mongod
mongosh "mongodb://mongo_admin@127.0.0.1:27017/admin"
```

## 3. Upload or clone the code

Create a timestamped release:

```bash
RELEASE="$(date +%Y%m%d%H%M%S)"
mkdir -p "/opt/school-support-atlas/releases/$RELEASE"
cd "/opt/school-support-atlas/releases/$RELEASE"
```

Then either clone the repository:

```bash
git clone <YOUR_REPO_URL> .
```

Or upload the project with `rsync` from your local machine:

```bash
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude dist \
  ./ saim@YOUR_VPS_IP:/opt/school-support-atlas/releases/$RELEASE/
```

Point `current` to the release:

```bash
ln -sfn "/opt/school-support-atlas/releases/$RELEASE" /opt/school-support-atlas/current
```

## 4. Backend env

Create `/opt/school-support-atlas/shared/backend.env`:

```bash
nano /opt/school-support-atlas/shared/backend.env
```

Use real secrets, not these placeholders:

```dotenv
DEBUG=false
NODE_ENV=production

SERVER_PROTOCOL=https
SERVER_HOST=127.0.0.1
SERVER_PORT=8000
SERVER_PUBLIC_URL=https://api.schoolsupportatlas.com

CORS_ORIGINS=https://schoolsupportatlas.com,https://www.schoolsupportatlas.com,https://admin.schoolsupportatlas.com

MONGODB_URI=mongodb://support_atlas_app:REPLACE_WITH_DB_PASSWORD@127.0.0.1:27017/support_platform_app?authSource=support_platform_app
MONGODB_DB_NAME=support_platform_app
MONGODB_TEST_DB_NAME=support_platform_app_test
DB_LOGGING=false

STORAGE_DRIVER=local
STORAGE_LOCAL_ROOT=/opt/school-support-atlas/shared/uploads

JWT_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d

ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@schoolsupportatlas.local
ADMIN_PASSWORD=REPLACE_WITH_STRONG_ADMIN_PASSWORD
SEED_DEFAULT_ADMIN=true

EMAIL_TRANSPORT=smtp
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_SECURE=false
BREVO_SMTP_USER=info@schoolsupportatlas.com
BREVO_SMTP_KEY=REPLACE_WITH_BREVO_SMTP_KEY
BREVO_FROM="School Support Atlas <info@schoolsupportatlas.com>"
ADMIN_NOTIFICATION_EMAIL=contact@schoolsupportatlas.com
```

Link it into the backend release because the app loads `.env` from its working directory:

```bash
ln -sfn /opt/school-support-atlas/shared/backend.env /opt/school-support-atlas/current/backend/project/.env
```

Install dependencies and run migrations/seeders:

```bash
cd /opt/school-support-atlas/current/backend/project
npm ci
npm run db:migrate
npm run db:seed
npm test
```

## 5. Public website env and build

Create `/opt/school-support-atlas/shared/public.env`:

```dotenv
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_APP_URL=https://schoolsupportatlas.com
API_PROXY_TARGET=http://127.0.0.1:8000
PORT=3000
HOSTNAME=127.0.0.1
ADMIN_NOTIFICATION_EMAIL=contact@schoolsupportatlas.com
HELP_REQUEST_FROM_EMAIL=info@schoolsupportatlas.com
BREVO_API_KEY=REPLACE_WITH_BREVO_API_KEY
```

Link and build:

```bash
ln -sfn /opt/school-support-atlas/shared/public.env /opt/school-support-atlas/current/public-website/.env.local

cd /opt/school-support-atlas/current/public-website
npm ci
npm run build
```

## 6. Admin UI env and build

Create `/opt/school-support-atlas/shared/admin.env`:

```dotenv
VITE_API_BASE_URL=https://api.schoolsupportatlas.com/api
```

For same-domain admin proxying through nginx or Cloudflare, you can instead use:

```dotenv
VITE_API_BASE_URL=/api
```

Link and build:

```bash
ln -sfn /opt/school-support-atlas/shared/admin.env /opt/school-support-atlas/current/admin-ui/.env

cd /opt/school-support-atlas/current/admin-ui
npm ci
npm run build
```

## 7. systemd services

### Backend service

Create `/etc/systemd/system/school-support-atlas-backend.service`:

```ini
[Unit]
Description=School Support Atlas Backend
After=network-online.target mongod.service
Wants=network-online.target

[Service]
Type=simple
User=saim
Group=saim
WorkingDirectory=/opt/school-support-atlas/current/backend/project
EnvironmentFile=/opt/school-support-atlas/shared/backend.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Public website service

Create `/etc/systemd/system/school-support-atlas-public.service`:

```ini
[Unit]
Description=School Support Atlas Public Website
After=network-online.target school-support-atlas-backend.service
Wants=network-online.target

[Service]
Type=simple
User=saim
Group=saim
WorkingDirectory=/opt/school-support-atlas/current/public-website
EnvironmentFile=/opt/school-support-atlas/shared/public.env
ExecStart=/usr/bin/npm run start -- -H 127.0.0.1 -p 3000
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Admin UI service

Create `/etc/systemd/system/school-support-atlas-admin.service`:

```ini
[Unit]
Description=School Support Atlas Admin UI
After=network-online.target school-support-atlas-backend.service
Wants=network-online.target

[Service]
Type=simple
User=saim
Group=saim
WorkingDirectory=/opt/school-support-atlas/current/admin-ui
EnvironmentFile=/opt/school-support-atlas/shared/admin.env
ExecStart=/usr/bin/npm run preview -- --host 127.0.0.1 --port 3001
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Optional email worker

If email queue jobs are used, create `/etc/systemd/system/school-support-atlas-email-worker.service`:

```ini
[Unit]
Description=School Support Atlas Email Worker
After=network-online.target mongod.service
Wants=network-online.target

[Service]
Type=simple
User=saim
Group=saim
WorkingDirectory=/opt/school-support-atlas/current/backend/project
EnvironmentFile=/opt/school-support-atlas/shared/backend.env
ExecStart=/usr/bin/npm run queue:worker:email
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now school-support-atlas-backend
sudo systemctl enable --now school-support-atlas-public
sudo systemctl enable --now school-support-atlas-admin

sudo systemctl status school-support-atlas-backend --no-pager
sudo systemctl status school-support-atlas-public --no-pager
sudo systemctl status school-support-atlas-admin --no-pager
```

Do not run `npm start` manually after systemd is enabled. If you need to test manually, stop the service first:

```bash
sudo systemctl stop school-support-atlas-backend
```

## 8. Nginx reverse proxy

Cloudflare Tunnel can route directly to localhost services, but keeping nginx is useful for local HTTP fallback and mirrors the Officer Charles server.

Create `/etc/nginx/sites-available/schoolsupportatlas.com`:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    listen [::]:80;
    server_name schoolsupportatlas.com www.schoolsupportatlas.com;

    client_max_body_size 20m;

    location /uploads/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name admin.schoolsupportatlas.com;

    client_max_body_size 20m;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name api.schoolsupportatlas.com;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

Enable it:

```bash
sudo ln -sfn /etc/nginx/sites-available/schoolsupportatlas.com /etc/nginx/sites-enabled/schoolsupportatlas.com
sudo nginx -t
sudo systemctl reload nginx
```

## 9. Cloudflare Tunnel

Cloudflare's docs support a config-file based locally managed tunnel. That is the style used on Officer Charles.

Install `cloudflared`:

```bash
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | \
  sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" | \
  sudo tee /etc/apt/sources.list.d/cloudflared.list

sudo apt update
sudo apt install -y cloudflared
cloudflared --version
```

Authenticate and create the tunnel:

```bash
cloudflared tunnel login
cloudflared tunnel create school-support-atlas
cloudflared tunnel list
```

Copy the generated credentials file to `/etc/cloudflared/`:

```bash
sudo mkdir -p /etc/cloudflared
sudo cp ~/.cloudflared/<TUNNEL_UUID>.json /etc/cloudflared/<TUNNEL_UUID>.json
sudo chown root:root /etc/cloudflared/<TUNNEL_UUID>.json
sudo chmod 600 /etc/cloudflared/<TUNNEL_UUID>.json
```

Create `/etc/cloudflared/config.yml`:

```yaml
tunnel: <TUNNEL_UUID>
credentials-file: /etc/cloudflared/<TUNNEL_UUID>.json

ingress:
  - hostname: api.schoolsupportatlas.com
    service: http://127.0.0.1:8000
  - hostname: schoolsupportatlas.com
    path: /api/*
    service: http://127.0.0.1:8000
  - hostname: www.schoolsupportatlas.com
    path: /api/*
    service: http://127.0.0.1:8000
  - hostname: schoolsupportatlas.com
    path: /uploads/*
    service: http://127.0.0.1:8000
  - hostname: www.schoolsupportatlas.com
    path: /uploads/*
    service: http://127.0.0.1:8000
  - hostname: admin.schoolsupportatlas.com
    path: /api/*
    service: http://127.0.0.1:8000
  - hostname: schoolsupportatlas.com
    service: http://127.0.0.1:3000
  - hostname: www.schoolsupportatlas.com
    service: http://127.0.0.1:3000
  - hostname: admin.schoolsupportatlas.com
    service: http://127.0.0.1:3001
  - service: http_status:404
```

Create DNS routes:

```bash
cloudflared tunnel route dns school-support-atlas schoolsupportatlas.com
cloudflared tunnel route dns school-support-atlas www.schoolsupportatlas.com
cloudflared tunnel route dns school-support-atlas admin.schoolsupportatlas.com
cloudflared tunnel route dns school-support-atlas api.schoolsupportatlas.com
```

Create `/etc/systemd/system/cloudflared.service`:

```ini
[Unit]
Description=Cloudflare Tunnel - School Support Atlas
After=network-online.target school-support-atlas-backend.service school-support-atlas-public.service school-support-atlas-admin.service
Wants=network-online.target

[Service]
Type=notify
TimeoutStartSec=30
ExecStart=/usr/bin/cloudflared --no-autoupdate --config /etc/cloudflared/config.yml tunnel run
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared --no-pager
```

## 10. Firewall

With Cloudflare Tunnel, only SSH must be public. HTTP can remain open for direct VPS testing, or closed if tunnel-only access is required.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable
sudo ufw status verbose
```

If you want tunnel-only web access:

```bash
sudo ufw delete allow 80/tcp
sudo ufw status verbose
```

## 11. Health checks

Local checks on the VPS:

```bash
curl -i http://127.0.0.1:8000/api/locations/nigeria/states-lgas
curl -i "http://127.0.0.1:8000/api/schools?page=1&limit=1&status=approved"
curl -i http://127.0.0.1:3000/
curl -i http://127.0.0.1:3001/
```

Domain checks after Cloudflare routes:

```bash
curl -i https://api.schoolsupportatlas.com/api/locations/nigeria/states-lgas
curl -i https://schoolsupportatlas.com/api/locations/nigeria/states-lgas
curl -i https://schoolsupportatlas.com/
curl -i https://admin.schoolsupportatlas.com/
```

Service logs:

```bash
journalctl -u school-support-atlas-backend -f
journalctl -u school-support-atlas-public -f
journalctl -u school-support-atlas-admin -f
journalctl -u cloudflared -f
```

Port checks:

```bash
ss -ltnp | grep -E ':8000|:3000|:3001|:27017'
```

Expected:

```text
127.0.0.1:8000   backend
127.0.0.1:3000   public website
127.0.0.1:3001   admin UI
127.0.0.1:27017  MongoDB
```

## 12. Deploying a new release later

Create a new release, install/build, run migrations, then switch the symlink:

```bash
RELEASE="$(date +%Y%m%d%H%M%S)"
mkdir -p "/opt/school-support-atlas/releases/$RELEASE"
cd "/opt/school-support-atlas/releases/$RELEASE"
git clone <YOUR_REPO_URL> .

ln -sfn /opt/school-support-atlas/shared/backend.env backend/project/.env
ln -sfn /opt/school-support-atlas/shared/public.env public-website/.env.local
ln -sfn /opt/school-support-atlas/shared/admin.env admin-ui/.env

cd backend/project
npm ci
npm run db:migrate
npm run db:seed

cd ../../public-website
npm ci
npm run build

cd ../admin-ui
npm ci
npm run build

ln -sfn "/opt/school-support-atlas/releases/$RELEASE" /opt/school-support-atlas/current

sudo systemctl restart school-support-atlas-backend
sudo systemctl restart school-support-atlas-public
sudo systemctl restart school-support-atlas-admin
sudo systemctl restart cloudflared
```

Rollback:

```bash
ls -1 /opt/school-support-atlas/releases
ln -sfn /opt/school-support-atlas/releases/<OLD_RELEASE> /opt/school-support-atlas/current
sudo systemctl restart school-support-atlas-backend school-support-atlas-public school-support-atlas-admin
```

## 13. Common problems

### `EADDRINUSE`

Something else is already using the service port. This happened on Officer Charles because the backend was manually started while the systemd backend service was also trying to start.

```bash
ss -ltnp | grep ':8000'
ps -fp <PID>
sudo systemctl stop school-support-atlas-backend
```

Then either stop the manual process or let systemd own the app:

```bash
sudo systemctl restart school-support-atlas-backend
```

### Cloudflare shows 502 or 1033

Check the local service first:

```bash
curl -i http://127.0.0.1:8000/api/locations/nigeria/states-lgas
sudo systemctl status cloudflared --no-pager
journalctl -u cloudflared -n 100 --no-pager
```

Also validate that `/etc/cloudflared/config.yml` points to the same ports systemd is using.

### Public site falls back to demo data

Check:

```bash
curl -i https://schoolsupportatlas.com/api/schools
curl -i https://api.schoolsupportatlas.com/api/schools
```

The public school API must return JSON. An empty list is okay if there are no approved schools yet.

### Admin API login fails

Check:

```bash
curl -i https://api.schoolsupportatlas.com/api/auth/admin/login
sudo systemctl status school-support-atlas-backend --no-pager
journalctl -u school-support-atlas-backend -n 100 --no-pager
```

Also confirm `CORS_ORIGINS` includes `https://admin.schoolsupportatlas.com`.

## Official references

- MongoDB Ubuntu installation: https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-ubuntu/
- Cloudflare Tunnel configuration file: https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/configuration-file/
- Cloudflare Tunnel Linux service: https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/as-a-service/linux/
- Cloudflare package repository: https://pkg.cloudflare.com/
