# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=optional

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -- --webpack

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=1500
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app ./
RUN npm prune --omit=dev --omit=optional && npm cache clean --force

EXPOSE 1500

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "1500"]
