FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]