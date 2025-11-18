FROM oven/bun:1.3.2-slim AS base

FROM base AS build
WORKDIR /workspace
COPY . .

# Install all workspace dependencies first
# Cache bun's global install cache for faster builds
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM base AS runtime
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
WORKDIR /app

COPY --from=build /workspace/packages/reader-main ./

CMD ["bun", "run", "start"]
