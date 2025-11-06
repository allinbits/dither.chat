FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

FROM base AS build
WORKDIR /workspace
COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --filter feed-sync... --frozen-lockfile
RUN pnpm --filter feed-sync build:deps
RUN pnpm deploy --filter feed-sync /feed-sync

FROM base AS runtime
WORKDIR /app
COPY --from=build /feed-sync ./

CMD ["pnpm", "start"]
