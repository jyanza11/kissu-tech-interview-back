# Deployment Guide

## GitHub Actions Workflow

This project includes a GitHub Actions workflow that automatically:
1. Runs tests
2. Builds the application
3. Deploys to your server using PM2

## Required GitHub Secrets

Set up the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

### SSH Connection
- `SSH_PRIVATE_KEY`: Your private SSH key for server access
- `SSH_HOST`: Your server's IP address or domain
- `SSH_USER`: SSH username (e.g., `root`, `ubuntu`, `deploy`)
- `SSH_PORT`: SSH port (usually `22`)

### Application Configuration
- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/db`)
- `REDIS_URL`: Redis connection string (optional, e.g., `redis://host:6379`)
- `AI_PROVIDER`: AI service provider (`mock` or `openai`)
- `OPENAI_API_KEY`: OpenAI API key (required if `AI_PROVIDER=openai`)
- `LOG_LEVEL`: Logging level (`error`, `warn`, `info`, `debug`)
- `PORT`: Server port number (e.g., `3000`)

## Server Setup

### 1. Install Node.js and PM2

```bash
# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 2. Create Application Directory

```bash
sudo mkdir -p /var/www/kissu-tech-interview-back
sudo chown $USER:$USER /var/www/kissu-tech-interview-back
cd /var/www/kissu-tech-interview-back
```

### 3. Clone Repository

```bash
git clone git@github.com:jyanza11/kissu-tech-interview-back.git .
```

### 4. Environment Variables

Create a `.env` file with your production settings:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kissu_db"

# Server
PORT=3000
NODE_ENV=production

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# AI Service
AI_PROVIDER=mock
OPENAI_API_KEY=your_openai_api_key_here

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# Security
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Install Dependencies and Build

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
```

### 6. Start with PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

## Manual Deployment Commands

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Reload PM2 (zero downtime)
pm2 reload kissu-backend
```

## PM2 Management Commands

```bash
# View status
pm2 status

# View logs
pm2 logs kissu-backend

# Restart application
pm2 restart kissu-backend

# Stop application
pm2 stop kissu-backend

# Delete application
pm2 delete kissu-backend

# Monitor
pm2 monit
```

## Nginx Configuration (Optional)

If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```
