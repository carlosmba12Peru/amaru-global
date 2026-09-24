# Dockerfile – Frontend Next.js para Google Cloud Run
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV PORT=8080

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080
CMD ["npm", "run", "start"]
