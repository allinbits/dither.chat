FROM oven/bun:1.3.2-slim AS base

FROM base AS build
WORKDIR /workspace
COPY . .

# Install all workspace dependencies first
# Cache bun's global install cache for faster builds
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM base AS runtime
WORKDIR /app

# Copy workspace structure to match what drizzle-kit expects
COPY --from=build /workspace/package.json ./
COPY --from=build /workspace/packages/api-main/package.json ./packages/api-main/
COPY --from=build /workspace/packages/api-main/src ./packages/api-main/src
COPY --from=build /workspace/packages/api-main/drizzle ./packages/api-main/drizzle
COPY --from=build /workspace/packages/api-main/drizzle.config.ts ./packages/api-main/

# Copy node_modules from build stage (includes dotenv needed for drizzle.config.ts)
# This ensures dotenv is available when drizzle-kit reads the config file
COPY --from=build /workspace/node_modules ./node_modules

# Copy workspace dependency
COPY --from=build /workspace/packages/lib-api-types ./node_modules/@atomone/dither-api-types

WORKDIR /app/packages/api-main

CMD ["bun", "run", "push-and-start"]
