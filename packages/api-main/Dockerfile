FROM node:24-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* && corepack enable

COPY package.json ./
COPY src ./src
COPY drizzle ./drizzle
COPY tsconfig.json ./tsconfig.json
COPY drizzle.config.ts ./drizzle.config.ts

RUN pnpm install --no-cache

CMD ["pnpm", "push-and-start"]