FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

FROM base AS build
WORKDIR /workspace
COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --filter api-feed... --frozen-lockfile
RUN pnpm --filter api-feed build:deps
RUN pnpm deploy --filter api-feed /api-feed

FROM base AS runtime
WORKDIR /app
COPY --from=build /api-feed ./

CMD ["pnpm", "push-and-start"]
