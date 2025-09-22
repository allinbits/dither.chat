FROM node:24-slim

WORKDIR /app

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY src ./src
COPY tsconfig.json ./tsconfig.json

RUN pnpm install --no-cache

CMD ["pnpm", "start"]