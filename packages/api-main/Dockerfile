FROM node:23-slim

WORKDIR /app

RUN apt-get update && rm -rf /var/lib/apt/lists/*
RUN corepack enable

COPY package.json ./
COPY src ./src
COPY tsconfig.json ./tsconfig.json

RUN pnpm install --no-cache

CMD ["pnpm", "start"]