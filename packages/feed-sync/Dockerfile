FROM oven/bun:1.3.2-slim AS base

FROM base AS build
WORKDIR /workspace
COPY . .

# Install all workspace dependencies first
# Cache bun's global install cache for faster builds
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile
# Build the specific package
WORKDIR /workspace/packages/feed-sync
RUN bun run build

FROM base AS runtime
WORKDIR /app
COPY --from=build /workspace/packages/feed-sync/package.json ./
COPY --from=build /workspace/packages/feed-sync/dist ./dist
COPY --from=build /workspace/node_modules ./node_modules

CMD ["bun", "run", "start"]
