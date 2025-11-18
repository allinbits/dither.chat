FROM oven/bun:1.3.2-slim
WORKDIR /app
COPY . .

# Install all workspace dependencies
# Cache bun's global install cache for faster builds
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Run command from package directory
WORKDIR /app/packages/api-main
CMD ["bun", "run", "push-and-start"]
