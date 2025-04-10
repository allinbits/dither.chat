FROM node:23-slim

WORKDIR /app

RUN apt-get update && apt-get install -y jq sqlite3 && rm -rf /var/lib/apt/lists/*
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY src ./src
COPY tsconfig.json ./tsconfig.json

RUN pnpm install --no-cache

CMD ["pnpm", "start"]