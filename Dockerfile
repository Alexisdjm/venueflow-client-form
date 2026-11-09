FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The public API rewrite is fixed when Next compiles.
ARG NEXT_PUBLIC_BOOKING_MODE=api
ARG NEXT_PUBLIC_API_BASE_URL=https://api.tryvenueflow.com/api/v1
ARG BOOKING_HOST_SUFFIXES=tryvenueflow.com
ENV NEXT_PUBLIC_BOOKING_MODE=$NEXT_PUBLIC_BOOKING_MODE
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV BOOKING_HOST_SUFFIXES=$BOOKING_HOST_SUFFIXES
ENV NODE_ENV=production
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV BOOKING_HOST_SUFFIXES=tryvenueflow.com
RUN apk add --no-cache libc6-compat \
  && addgroup -S nodejs \
  && adduser -S venueflow -G nodejs
COPY --from=build --chown=venueflow:nodejs /app/package.json ./package.json
COPY --from=build --chown=venueflow:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=venueflow:nodejs /app/.next ./.next
COPY --from=build --chown=venueflow:nodejs /app/public ./public
COPY --from=build --chown=venueflow:nodejs /app/next.config.ts ./next.config.ts
USER venueflow
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
