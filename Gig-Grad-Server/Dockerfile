FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
FROM build AS migration
CMD ["npx", "prisma", "migrate", "deploy"]
FROM build AS runtime
RUN npm prune --omit=dev
ENV NODE_ENV=production
USER node
EXPOSE 5000
CMD ["node", "src/index.js"]
