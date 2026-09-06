# Multi-stage Dockerfile for Grocify API Server

# Stage 1: Build TypeScript source code
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY schema.sql ./
COPY src ./src

RUN npm run build

# Stage 2: Production runtime environment
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY schema.sql ./schema.sql

EXPOSE 5000

CMD ["node", "dist/index.js"]
