FROM node:24.1.0-slim
WORKDIR /app
# Install system dependencies for Prisma engine
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*
# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./
COPY prisma ./prisma/
# Set proper Prisma binary target
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=true
# Install dependencies & generate Prisma client
RUN pnpm install --ignore-scripts --config.minimum-release-age=0 && \
    ./node_modules/.bin/prisma generate
COPY . .
EXPOSE 5000
# Default start command
CMD ["pnpm", "start"]