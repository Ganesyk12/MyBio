FROM node:24.1.0-slim
WORKDIR /app
# Install system dependencies for Prisma engine
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY prisma ./prisma/
# Set proper Prisma binary target
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=true
# Install dependencies & generate Prisma client
RUN npm ci && \
    npx prisma generate
COPY . .
EXPOSE 5000
# Default start command
CMD ["npm", "start"]