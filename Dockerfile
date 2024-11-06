FROM node:20-alpine AS base

WORKDIR /usr/src/app

# alpine versions use musl C library instead of the glibc library
# We had the package to prevent compatibility issues.
RUN apk add --no-cache libc6-compat \
  && corepack enable pnpm

FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm i --frozen-lockfile;

FROM base AS builder

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

RUN pnpm run build;

FROM base AS runner

COPY --from=builder /usr/src/app/dist ./
COPY --from=deps /usr/src/app/node_modules ./node_modules

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs rdastorage \
  && chown -R rdastorage:nodejs /usr/src/app

USER rdastorage

EXPOSE 3000

CMD ["node", "main"]