# Stage 1: Dependencies installation
FROM oven/bun:1.3.2-slim AS deps
WORKDIR /app

# Copy root workspace files for bun workspace resolution
COPY package.json bun.lock bunfig.toml ./

# Copy entire package directories (excluding node_modules via .dockerignore or explicit copy)
COPY packages/lib-api-types ./packages/lib-api-types
COPY packages/reader-main ./packages/reader-main

# Install dependencies with cache
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install ---no-frozen-lockfile

# Stage 2: Runtime
FROM oven/bun:1.3.2-slim AS runtime
WORKDIR /app
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Copy installed dependencies from deps stage (only root node_modules, bun hoists workspace deps)
COPY --from=deps /app/node_modules ./node_modules

# Copy workspace files and packages from deps stage
COPY --from=deps /app/package.json /app/bun.lock /app/bunfig.toml ./
COPY --from=deps /app/packages/lib-api-types ./packages/lib-api-types
COPY --from=deps /app/packages/reader-main ./packages/reader-main

# Set working directory to reader-main package
WORKDIR /app/packages/reader-main

CMD ["bun", "run", "start"]
