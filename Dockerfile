FROM node:23.8.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
COPY *.ts *.tsx next.config.mjs package.json pnpm-lock.yaml tsconfig.json /app/
COPY public /app/public
COPY app /app/app
ARG env
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --ignore-scripts --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --ignore-scripts --frozen-lockfile
COPY ${env:-.env.prod} /app/.env
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/.next /app/.next
COPY --from=build /app/.env /app/.env
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
