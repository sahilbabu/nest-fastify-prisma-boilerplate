# 🚀 Production Deployment

## Pre-Deployment Checklist

- ✅ All tests passing (`yarn test:e2e`)
- ✅ Code linted and formatted (`yarn lint`, `yarn format`)
- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ Security headers configured
- ✅ HTTPS enabled
- ✅ Logging configured
- ✅ Monitoring set up
- ✅ Backup strategy in place

## Environment Configuration

### Required Environment Variables

```env
# Server
NODE_ENV=production
PORT=3355

# Database
DATABASE_URL=postgresql://user:password@host:5432/nestjs_db

# JWT
JWT_SECRET_KEY=your-very-secure-secret-key-minimum-32-chars
JWT_EXPIRATION=7d

# CORS
ALLOWED_ORIGINS=https://example.com,https://app.example.com

# Logging
LOG_LEVEL=error

# Redis (optional)
REDIS_URL=redis://host:6379
```

### Security Best Practices

1. **Use strong JWT secret** (minimum 32 characters)
2. **Use environment-specific secrets** (never share between environments)
3. **Rotate secrets regularly**
4. **Use managed secrets service** (AWS Secrets Manager, HashiCorp Vault)
5. **Never commit .env files**

## Database Setup

### PostgreSQL Configuration

```bash
# Create database
createdb nestjs_db

# Create user
createuser nestjs_user

# Grant privileges
psql -c "ALTER USER nestjs_user WITH PASSWORD 'secure-password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE nestjs_db TO nestjs_user;"
```

### Run Migrations

```bash
# Apply all migrations
yarn prisma migrate deploy

# Verify migrations
yarn prisma migrate status
```

### Database Backups

```bash
# Create backup
pg_dump -U nestjs_user -h localhost nestjs_db > backup.sql

# Restore backup
psql -U nestjs_user -h localhost nestjs_db < backup.sql

# Automated backups (cron job)
0 2 * * * pg_dump -U nestjs_user -h localhost nestjs_db > /backups/nestjs_db_$(date +\%Y\%m\%d).sql
```

## Docker Deployment

### Build Docker Image

```bash
# Build production image
docker build -t nestjs-app:latest .

# Tag for registry
docker tag nestjs-app:latest registry.example.com/nestjs-app:latest

# Push to registry
docker push registry.example.com/nestjs-app:latest
```

### Docker Compose Production

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Update image and restart
docker-compose pull
docker-compose up -d

# Stop services
docker-compose down
```

### Docker Security

```dockerfile
# Use non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# Use specific base image version
FROM node:18.17.0-alpine

# Don't run as root
# Use read-only filesystem where possible
# Scan images for vulnerabilities
```

## Cloud Deployment

### Railway

1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Configure PostgreSQL add-on
4. Deploy

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Heroku

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create nestjs-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET_KEY=your-secret-key

# Deploy
git push heroku main

# View logs
heroku logs -t
```

### AWS ECS

```bash
# Create ECR repository
aws ecr create-repository --repository-name nestjs-app

# Build and push image
docker build -t nestjs-app:latest .
docker tag nestjs-app:latest <account-id>.dkr.ecr.<region>.amazonaws.com/nestjs-app:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/nestjs-app:latest

# Create ECS task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create ECS service
aws ecs create-service --cluster production --service-name nestjs-app --task-definition nestjs-app
```

### Google Cloud Run

```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/nestjs-app

# Deploy
gcloud run deploy nestjs-app \
  --image gcr.io/PROJECT_ID/nestjs-app \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Create app from repository
3. Configure environment variables
4. Add PostgreSQL database
5. Deploy

## Performance Optimizations

### Compression

```typescript
// main.ts
await app.register(require('@fastify/compress'), {
  threshold: 1024,
  encodings: ['gzip', 'deflate', 'br'],
});
```

### Connection Pooling

```prisma
# prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Caching

```typescript
// Use Redis for caching
@Cacheable()
async getUser(id: string) {
  return this.prisma.user.findUnique({ where: { id } });
}
```

### Query Optimization

```typescript
// Use select/include for efficient queries
const users = await this.prisma.user.findMany({
  select: { id: true, email: true },
  take: 10,
});
```

## Monitoring & Logging

### Application Monitoring

```typescript
// Log important events
this.logger.log('User created', { userId: user.id });
this.logger.error('Database error', error);
```

### Error Tracking

Integrate error tracking service:

```typescript
// Sentry integration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

```typescript
// Application Insights (Azure)
// New Relic
// Datadog
// CloudWatch (AWS)
```

### Log Aggregation

```bash
# ELK Stack (Elasticsearch, Logstash, Kibana)
# Splunk
# Datadog
# CloudWatch
```

## Security Hardening

### HTTPS/TLS

```typescript
// Enforce HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});
```

### Security Headers

```typescript
// Helmet configuration
await app.register(helmet, {
  contentSecurityPolicy: true,
  hsts: { maxAge: 31536000 },
  noSniff: true,
  xssFilter: true,
});
```

### Rate Limiting

```typescript
// Throttle configuration
@UseGuards(ThrottlerGuard)
@Controller('api')
export class AppController {}
```

### Input Validation

```typescript
// Validate all inputs
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

## Backup & Disaster Recovery

### Database Backups

```bash
# Automated daily backups
0 2 * * * pg_dump -U user -h host db > /backups/db_$(date +\%Y\%m\%d).sql

# Backup to cloud storage
0 2 * * * pg_dump -U user -h host db | gzip | aws s3 cp - s3://bucket/backups/db_$(date +\%Y\%m\%d).sql.gz
```

### Application Backups

```bash
# Backup configuration files
tar -czf config-backup.tar.gz .env docker-compose.yml

# Backup to cloud storage
aws s3 cp config-backup.tar.gz s3://bucket/backups/
```

### Disaster Recovery Plan

1. **Document recovery procedures**
2. **Test backups regularly**
3. **Maintain multiple backup locations**
4. **Document RTO and RPO**
5. **Practice recovery procedures**

## Scaling

### Horizontal Scaling

```bash
# Run multiple instances behind load balancer
docker-compose scale app=3

# Or use Kubernetes
kubectl scale deployment nestjs-app --replicas=3
```

### Load Balancing

```nginx
# Nginx configuration
upstream nestjs_app {
  server app1:3355;
  server app2:3355;
  server app3:3355;
}

server {
  listen 80;
  location / {
    proxy_pass http://nestjs_app;
  }
}
```

### Database Scaling

```bash
# PostgreSQL replication
# Read replicas for scaling reads
# Connection pooling with PgBouncer
```

## Health Checks

### Liveness Probe

```typescript
@Get('health')
health() {
  return { status: 'ok' };
}
```

### Readiness Probe

```typescript
@Get('ready')
async ready() {
  const dbHealthy = await this.prisma.$queryRaw`SELECT 1`;
  return { ready: !!dbHealthy };
}
```

### Kubernetes Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3355
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 3355
  initialDelaySeconds: 10
  periodSeconds: 5
```

## Maintenance

### Zero-Downtime Deployments

```bash
# Blue-green deployment
# Canary deployments
# Rolling updates
```

### Database Migrations

```bash
# Apply migrations before deployment
yarn prisma migrate deploy

# Verify migrations
yarn prisma migrate status
```

### Rollback Procedures

```bash
# Rollback to previous version
docker pull registry.example.com/nestjs-app:v1.0.0
docker-compose up -d

# Rollback database
yarn prisma migrate resolve --rolled-back "migration_name"
```

## Monitoring Checklist

- ✅ Application logs monitored
- ✅ Error tracking enabled
- ✅ Performance metrics collected
- ✅ Database health monitored
- ✅ Disk space monitored
- ✅ Memory usage monitored
- ✅ CPU usage monitored
- ✅ Network latency monitored
- ✅ Uptime monitored
- ✅ Alerts configured

## Support & Resources

- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Fastify Deployment](https://www.fastify.io/docs/latest/Guides/Deployment/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
