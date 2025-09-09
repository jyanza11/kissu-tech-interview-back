# Environment Variables

This document lists all environment variables used in the Kissu Tech Interview Backend project.

## Required GitHub Secrets

Set these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

### SSH Connection
- `SSH_PRIVATE_KEY`: Your private SSH key for server access
- `SSH_HOST`: Your server's IP address or domain
- `SSH_USER`: SSH username (e.g., `root`, `ubuntu`, `deploy`)
- `SSH_PORT`: SSH port (usually `22`)

### Application Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string (optional)
- `AI_PROVIDER`: AI service provider (`mock` or `openai`)
- `OPENAI_API_KEY`: OpenAI API key (required if `AI_PROVIDER=openai`)
- `LOG_LEVEL`: Logging level (`error`, `warn`, `info`, `debug`)
- `PORT`: Server port number

## Environment Variables Reference

### Database
```bash
DATABASE_URL="postgresql://username:password@host:port/database_name"
```
- **Required**: Yes
- **Description**: PostgreSQL database connection string
- **Example**: `postgresql://user:pass@localhost:5432/kissu_db`

### Server Configuration
```bash
NODE_ENV="production" | "development" | "test"
PORT=3000
```
- **NODE_ENV**: Environment mode (default: `development`)
- **PORT**: Server port (default: `3001`)

### Redis (Optional)
```bash
REDIS_URL="redis://host:port/database"
```
- **Required**: No
- **Description**: Redis connection string for caching and logging
- **Example**: `redis://localhost:6379`
- **Default**: If not provided, Redis features are disabled

### AI Service
```bash
AI_PROVIDER="mock" | "openai"
OPENAI_API_KEY="your_openai_api_key"
```
- **AI_PROVIDER**: AI service provider (default: `mock`)
- **OPENAI_API_KEY**: Required only if `AI_PROVIDER=openai`

### Logging
```bash
LOG_LEVEL="error" | "warn" | "info" | "debug"
```
- **Required**: No
- **Description**: Logging level (default: `info`)

## GitHub Actions Environment Variables

### Test Environment
The following environment variables are automatically set during testing:
```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
NODE_ENV: test
LOG_LEVEL: error
REDIS_URL: redis://localhost:6379/1
AI_PROVIDER: mock
PORT: 3001
```

### Production Environment
The following environment variables are set from GitHub secrets during deployment:
```yaml
NODE_ENV: production
DATABASE_URL: ${{ secrets.DATABASE_URL }}
REDIS_URL: ${{ secrets.REDIS_URL }}
AI_PROVIDER: ${{ secrets.AI_PROVIDER }}
OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
LOG_LEVEL: ${{ secrets.LOG_LEVEL }}
PORT: ${{ secrets.PORT }}
```

## Local Development Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your local values:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kissu_db"

# Server
PORT=3000
NODE_ENV=development

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# AI Service
AI_PROVIDER=mock
OPENAI_API_KEY=your_openai_api_key_here

# Logging
LOG_LEVEL=info
```

## Production Server Setup

Create a `.env` file on your production server with the same variables as above, but with production values:

```bash
# Database
DATABASE_URL="postgresql://prod_user:prod_pass@prod_host:5432/kissu_prod_db"

# Server
PORT=3000
NODE_ENV=production

# Redis (optional)
REDIS_URL="redis://prod_redis_host:6379"

# AI Service
AI_PROVIDER=openai
OPENAI_API_KEY=your_production_openai_api_key

# Logging
LOG_LEVEL=info
```

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords for production databases
- Rotate API keys regularly
- Use environment-specific values for different deployments
- Consider using a secrets management service for production

## Validation

The application will start with default values for optional environment variables, but will fail to start if required variables are missing. Check the logs for specific error messages if the application fails to start.
