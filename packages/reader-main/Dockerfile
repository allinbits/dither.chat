FROM oven/bun:1.3.2-slim
WORKDIR /app
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
COPY . .

# Install all workspace dependencies
# Cache bun's global install cache for faster builds
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Run command from package directory
WORKDIR /app/packages/reader-main
CMD ["bun", "run", "start"]
