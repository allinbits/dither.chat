FROM node:23-slim

WORKDIR /app

RUN apt-get update && rm -rf /var/lib/apt/lists/* && corepack enable

COPY package.json ./
COPY src ./src
COPY drizzle ./drizzle
COPY tsconfig.json ./tsconfig.json
COPY drizzle.config.ts ./drizzle.config.ts

RUN pnpm install --no-cache

CMD ["pnpm", "push-and-start"]