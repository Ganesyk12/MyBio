# Development Guide

## Tech Stack

- **Runtime:** Node.js 24
- **Package Manager:** pnpm
- **Framework:** Express 5
- **Template:** EJS + express-ejs-layouts
- **ORM:** Prisma 6 (PostgreSQL via Supabase)
- **Auth:** JWT (cookie-based)
- **Email:** Nodemailer + node-cron

## Project Structure

```
├── controllers/       # Route handlers
├── docs/              # Documentation
├── lib/               # Shared libs (prisma client)
├── middleware/        # Express middleware (auth)
├── models/           # Prisma query wrappers
├── prisma/           # Schema & migrations
├── public/           # Static assets
├── routes/           # Express route definitions
├── scripts/          # Utility scripts
├── services/         # Business logic (email, etc.)
├── utils/            # Helpers
├── views/            # EJS templates
│   ├── admin/        # Admin dashboard pages
│   ├── auth/         # Login pages
│   ├── components/   # Reusable EJS partials
│   └── layouts/      # Layout templates
├── .env              # Environment variables (gitignored)
├── .env.example      # Env template
├── docker-compose.yml
├── Dockerfile
└── index.js          # App entry point
```

## Local Setup

```bash
# Install dependencies
pnpm install

# Copy env and fill in your values
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Sync schema to DB
npx prisma db push

# Start dev server (with nodemon)
pnpm dev

# Production start
pnpm start
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `nodemon index.js` | Dev server with auto-reload |
| `start` | `node index.js` | Production start |
| `build` | `npx prisma generate` | Generate Prisma client |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No (default 5000) | App listen port |
| `DATABASE_URL` | Yes | PostgreSQL connection (Supabase) |
| `HOST_UPLOAD_PATH` | Yes (prod) | Host path mounted to container for uploads (sesuaikan path VPS) |
| `JWT_SECRET` | Yes | JWT signing secret |
| `JWT_EXPIRATION` | No (default 24h) | Token expiry |

> Upload path di dalam container sudah hardcode `/app/uploads` — tidak perlu env var.

## Email Forwarding

Cron job runs daily at 06:00 AM (Asia/Jakarta). Forwards unread messages from `EmailReceive` table to the configured `ForwardTo` email via active SMTP config.

**SMTP Config fields:**
- `ForwardTo` — email tujuan (nullable). Kosongkan jika tidak ingin forward.

## Deployment (VPS NAT + Cloudflare Tunnel)

1. Push code → GitHub Actions builds Docker image & pushes to Docker Hub
2. SSH into VPS via `appleboy/ssh-action` (port dari secret `EC2_PORT`)
3. Pulls & runs container on `tunnel` network tanpa expose port host
4. Cloudflare Tunnel handles external access

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password/token |
| `DOCKER_REPO` | Docker Hub repo (e.g. `user/repo`) |
| `EC2_HOST` | VPS IP/hostname |
| `EC2_USERNAME` | SSH username |
| `EC2_PORT` | SSH port (for NAT VPS) |
| `SSH_PASSWORD` | SSH password |
| `DATABASE_URL` | PostgreSQL connection string |
| `HOST_UPLOAD_PATH` | Host upload directory (e.g. `/var/www/html/Portfolio/uploads`) |
| `JWT_SECRET` | JWT signing secret |

### Deploy Steps (Manual Trigger)

1. Go to GitHub repo → Actions → **Build Apps to Docker Hub**
2. Click **Run workflow** → select branch → run
3. Workflow builds image, pushes to Docker Hub, then SSHes into VPS to deploy

### Upload Directory

Upload path di container hardcoded `/app/uploads`. Agar file tetap aman saat rebuild container, host path di-mount via `-v`:

```
HOST_UPLOAD_PATH:/app/uploads
```

Container jalan dengan `--user 1000:1000` (sama dengan UID user VPS) biar kepemilikan file di host sesuai.

Buat direktori di VPS:

```bash
sudo mkdir -p /var/www/html/Portfolio/uploads
sudo chown -R 1000:1000 /var/www/html/Portfolio/uploads
sudo chmod -R 755 /var/www/html/Portfolio/uploads
```

Sesuaikan path dengan `HOST_UPLOAD_PATH` di secret GitHub.

## Prisma Commands

```bash
# Generate client after schema changes
npx prisma generate

# Push schema directly to DB (no migration files)
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## Conventions

- ES modules (`"type": "module"` in package.json)
- Prisma models use PascalCase, mapped to snake_case tables via `@@map`
- Admin routes are prefixed with `/centralize` and protected by `authMiddleware`
- Public routes under `/`
- Soft deletes use `Status: 'N'`
