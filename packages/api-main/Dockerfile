# Stage 1: Dependencies installation
FROM oven/bun:1.3.2-slim AS deps
WORKDIR /app

# Copy all monorepo files, excluding the ones ignored by dockerignore.
# This is required because Bun needs all monorepo apps to be able to install deps using `--frozen-lockfile`.
COPY . .

# Install dependencies with cache
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Stage 2: Runtime
FROM oven/bun:1.3.2-slim AS runtime
WORKDIR /app

# Copy installed dependencies from deps stage (only root node_modules, bun hoists workspace deps)
COPY --from=deps /app/node_modules ./node_modules

# Copy workspace files and packages from deps stage
COPY --from=deps /app/package.json /app/bun.lock /app/bunfig.toml ./
COPY --from=deps /app/packages/lib-api-types ./packages/lib-api-types
COPY --from=deps /app/packages/api-main ./packages/api-main

# Set working directory to api-main package
WORKDIR /app/packages/api-main

CMD ["bun", "run", "push-and-start"]
