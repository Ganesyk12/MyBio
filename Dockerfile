# --- Build Stage ---
FROM oven/bun:1-alpine AS build
WORKDIR /app

# Install build tools & runtime libs needed for native deps (bcrypt) & Prisma
RUN apk add --no-cache openssl libc6-compat gcompat python3 make g++ git

# Copy manifest files
COPY package.json bun.lock .npmrc ./
COPY prisma ./prisma/

# Install dependencies (skip lifecycle scripts)
RUN bun install --ignore-scripts --frozen-lockfile

COPY . .

# Generate Prisma client for Alpine (musl) target (native resolves to linux-musl)
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=true
RUN ./node_modules/.bin/prisma generate

# --- Run Stage ---
FROM oven/bun:1-alpine AS run
WORKDIR /app

# Runtime libraries required by Prisma & native deps on Alpine
RUN apk add --no-cache openssl libc6-compat gcompat

# Copy app (source + node_modules with musl-native binaries from build stage)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app ./

EXPOSE 5000

USER 1000:1000

# Default start command using bun
CMD ["bun", "index.js"]
