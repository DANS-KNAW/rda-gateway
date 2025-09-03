# syntax=docker.io/docker/dockerfile:1

# We use the alpine version of Node as distroless is too locked down 
# and doesn't have a lot of the build tools needed.
FROM node:22-alpine@sha256:d2166de198f26e17e5a442f537754dd616ab069c47cc57b889310a717e0abbf9 AS build-base
RUN corepack enable pnpm

# 1. Install build dependencies
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
# While tini is recommended on the page we use dumb-init as it seems to currently be more widely
# adopted among enterprise Node.js applications.
FROM build-base AS init-provider
RUN apk add --no-cache dumb-init

# 2. Install ONLY production dependencies
FROM build-base AS deps-prod
WORKDIR /app

# Disable husky (pre-commit hook)
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm \
    --mount=type=cache,target=/root/.cache \
    HUSKY=0 pnpm i --frozen-lockfile --prod \
    && find node_modules -name "README*" -delete \
    && find node_modules -name "CHANGELOG*" -delete \
    && find node_modules -name "LICENSE*" -delete \
    && find node_modules -name "*.md" -delete \
    && find node_modules -name "*.txt" -delete \
    && pnpm store prune --force

# 3. Install all dependencies (including dev)
FROM build-base AS deps-dev
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm \
    --mount=type=cache,target=/root/.cache \
    pnpm i --frozen-lockfile --prefer-offline

# 4. Build stage
FROM build-base AS builder
WORKDIR /app

COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .

RUN --mount=type=cache,target=/app/.cache \
    pnpm build

# 5. Production image we chosing distroless as it is just as minimal as Alpine but even more secure.
FROM gcr.io/distroless/nodejs22-debian12@sha256:4c6848a24760c190338d20c3fd2e987431f8fe05c4067a114801cb66ca0018a1 AS runner
WORKDIR /app

COPY --from=init-provider --chown=nonroot:nonroot /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=deps-prod --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist

USER nonroot

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV} 

# Wrapping the entrypoint with dumb-init to handle kernel signals properly.
# NodeJS doesn't handle being PID 1 very well, so we use dumb-init to manage signals.
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/nodejs/bin/node", "dist/main.js"]