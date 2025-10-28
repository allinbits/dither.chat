FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

FROM base AS build
WORKDIR /workspace
COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --filter @atomone/indexer-feed... --frozen-lockfile
RUN pnpm --filter @atomone/indexer-feed build:deps
RUN pnpm deploy --filter @atomone/indexer-feed --prod /indexer-feed

FROM base AS runtime
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
WORKDIR /app

COPY --from=build /indexer-feed ./
CMD ["pnpm", "start"]
