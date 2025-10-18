FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache bash

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

COPY wait-for-db.sh /app/wait-for-db.sh
RUN chmod +x /app/wait-for-db.sh

# CMD ["pnpm", "run", "start:dev"]

CMD ["/bin/bash", "/app/wait-for-db.sh"]
