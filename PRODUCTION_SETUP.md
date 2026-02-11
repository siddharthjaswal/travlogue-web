# 🔧 TRAVLOGUE PRODUCTION SETUP

**Server:** egg-001 (46.225.86.141)  
**Last Updated:** 2026-02-11 04:30 UTC

---

## 📊 CURRENT ARCHITECTURE

```
Internet
   │
   ├─► https://travlogue.in (Port 443)
   │      │
   │      └─► Nginx (SSL termination)
   │             │
   │             └─► Next.js App (Port 3000)
   │                    └─► PM2: travlogue-web (ID: 4)
   │                           └─► /root/.openclaw/workspace/travlogue-web-new
   │
   └─► https://api.travlogue.in (Port 443)
          │
          └─► Nginx (SSL termination)
                 │
                 └─► FastAPI Backend (Port 8000)
                        └─► PM2: travlogue-backend (ID: 2)

```

---

## 🌐 NGINX CONFIGURATION

### Frontend (travlogue.in)

**Config File:** `/etc/nginx/sites-available/travlogue-web.conf`

```nginx
server {
    server_name travlogue.in;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/travlogue.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/travlogue.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80;
    server_name travlogue.in;
    
    # Redirect HTTP → HTTPS
    if ($host = travlogue.in) {
        return 301 https://$host$request_uri;
    }
    
    return 404;
}
```

**Enabled:** Yes  
**Symlink:** `/etc/nginx/sites-enabled/travlogue-web.conf`

---

### Backend (api.travlogue.in)

**Config File:** `/etc/nginx/sites-available/logbook.conf`

```nginx
server {
    server_name api.travlogue.in;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/travlogue.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/travlogue.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80;
    server_name api.travlogue.in;
    
    # Redirect HTTP → HTTPS
    if ($host = api.travlogue.in) {
        return 301 https://$host$request_uri;
    }
    
    return 404;
}
```

**Enabled:** Yes  
**Symlink:** `/etc/nginx/sites-enabled/logbook.conf`

---

## 🚀 PM2 PROCESSES

```bash
pm2 list
```

| ID | Name               | Mode | PID   | Uptime | Status | CPU | Memory  |
|----|-------------------|------|-------|--------|--------|-----|---------|
| 2  | travlogue-backend | fork | 41870 | 35h    | online | 0%  | 119.5mb |
| 4  | travlogue-web     | fork | 98968 | 2m     | online | 0%  | 64.2mb  |

### Frontend (travlogue-web)
- **Directory:** `/root/.openclaw/workspace/travlogue-web-new`
- **Command:** `npm start`
- **Port:** 3000 (internal)
- **Technology:** Next.js 16.1.1
- **Node Version:** 22.22.0
- **Auto-restart:** ✓ (on failure)
- **Auto-start:** ✓ (on boot, via PM2 save)

### Backend (travlogue-backend)
- **Command:** Uvicorn (FastAPI)
- **Port:** 8000 (internal)
- **Technology:** Python/FastAPI
- **Auto-restart:** ✓
- **Auto-start:** ✓

---

## 🔐 SSL CERTIFICATES

**Provider:** Let's Encrypt  
**Certificate Path:** `/etc/letsencrypt/live/travlogue.in/`  
**Auto-renewal:** ✓ (Certbot)

**Domains Covered:**
- ✅ travlogue.in
- ✅ api.travlogue.in

**Certificate Files:**
- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key
- `chain.pem` - Intermediate certificates
- `cert.pem` - Domain certificate

**Renewal Command:**
```bash
certbot renew --nginx
```

---

## 🔌 PORT MAPPING

| Port | Service              | Access      | Protocol |
|------|---------------------|-------------|----------|
| 80   | Nginx (HTTP)        | Public      | HTTP     |
| 443  | Nginx (HTTPS)       | Public      | HTTPS    |
| 3000 | Next.js App         | Internal    | HTTP     |
| 8000 | FastAPI Backend     | Internal    | HTTP     |

**Note:** Ports 3000 and 8000 are only accessible via 127.0.0.1 (localhost) - not exposed to the internet.

---

## 📁 FILE LOCATIONS

### Application Code
```
Frontend:  /root/.openclaw/workspace/travlogue-web-new/
Backend:   (Unknown - check PM2 working directory)
```

### Nginx Configuration
```
Available: /etc/nginx/sites-available/
Enabled:   /etc/nginx/sites-enabled/
Main:      /etc/nginx/nginx.conf
```

### SSL Certificates
```
Certs:     /etc/letsencrypt/live/travlogue.in/
Config:    /etc/letsencrypt/options-ssl-nginx.conf
DH Param:  /etc/letsencrypt/ssl-dhparams.pem
```

### PM2 Configuration
```
Config:    /root/.pm2/dump.pm2
Logs:      /root/.pm2/logs/
```

---

## 🛠️ MANAGEMENT COMMANDS

### Nginx
```bash
# Test configuration
/usr/sbin/nginx -t

# Reload configuration (no downtime)
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# Check status
systemctl status nginx

# View logs
journalctl -u nginx -f
```

### PM2
```bash
# List processes
pm2 list

# View logs
pm2 logs travlogue-web
pm2 logs travlogue-backend

# Restart
pm2 restart travlogue-web
pm2 restart travlogue-backend

# Stop
pm2 stop travlogue-web

# Monitor
pm2 monit

# Save current state (for auto-start on boot)
pm2 save
```

### SSL Certificates
```bash
# Check expiry
certbot certificates

# Renew all certificates
certbot renew --nginx

# Test renewal (dry run)
certbot renew --dry-run
```

---

## 🔄 DEPLOYMENT WORKFLOW

### Update Frontend
```bash
cd /root/.openclaw/workspace/travlogue-web-new
git pull origin main
npm install
npm run build
pm2 restart travlogue-web
```

### Update Backend
```bash
# Navigate to backend directory
cd /path/to/backend
git pull
# Install dependencies if needed
pm2 restart travlogue-backend
```

### Update Nginx Config
```bash
# Edit config
nano /etc/nginx/sites-available/travlogue-web.conf

# Test
/usr/sbin/nginx -t

# Reload
systemctl reload nginx
```

---

## 📊 HEALTH CHECKS

### Check if everything is running
```bash
# Nginx
systemctl status nginx

# PM2 processes
pm2 status

# Ports
netstat -tlnp | grep -E ':80|:443|:3000|:8000'

# Website
curl -I https://travlogue.in
curl -I https://api.travlogue.in
```

### Expected Output
```bash
# Nginx should be active (running)
# PM2 processes should be online
# Port 3000: next-server
# Port 8000: uvicorn
# Port 80/443: nginx
# Both URLs should return HTTP 200
```

---

## ⚠️ RECOMMENDATIONS

### Current Issues
1. ✅ Frontend working perfectly
2. ✅ Backend working (separate service)
3. ✅ SSL configured correctly
4. ⚠️ Missing enhanced proxy headers

### Suggested Nginx Improvements

Update both configs with better proxy settings:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

**Benefits:**
- Better WebSocket support
- Proper client IP logging
- HTTPS awareness in Next.js

---

## 🎯 SYSTEM STATUS

**✅ Working:**
- Nginx reverse proxy
- SSL certificates
- PM2 process management
- Auto-restart on failure
- Auto-start on boot
- HTTP → HTTPS redirect

**✅ Domains:**
- https://travlogue.in → Next.js frontend
- https://api.travlogue.in → FastAPI backend

**📊 Performance:**
- Frontend: ~64MB memory, <1% CPU
- Backend: ~120MB memory, <1% CPU
- Nginx: ~7MB memory, minimal CPU

---

**Everything is running smoothly! 🚀**
