# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS deps
WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /opt/app

COPY . .

ARG NUXT_PUBLIC_API_URL=/api
ARG NUXT_PUBLIC_API_ORIGIN=http://localhost:3000
ARG NUXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NUXT_API_ORIGIN_INTERNAL=http://api:3001

ENV NUXT_PUBLIC_API_URL=$NUXT_PUBLIC_API_URL
ENV NUXT_PUBLIC_API_ORIGIN=$NUXT_PUBLIC_API_ORIGIN
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL
ENV NUXT_API_ORIGIN_INTERNAL=$NUXT_API_ORIGIN_INTERNAL

RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runner
WORKDIR /opt/app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/.output ./.output

ENV NODE_PATH=/opt/app/node_modules

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
