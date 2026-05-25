FROM node:22-alpine AS deps
WORKDIR /app
RUN npm config set registry https://registry.npmmirror.com
COPY front-end/package.json front-end/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
RUN npm config set registry https://registry.npmmirror.com
ARG NEXT_PUBLIC_API_URL=/crm-api/state/
ARG NEXT_PUBLIC_BASE_PATH=/crm
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY --from=deps /app/node_modules ./node_modules
COPY front-end/ ./
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_API_URL=/crm-api/state/
ENV NEXT_PUBLIC_BASE_PATH=/crm
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
