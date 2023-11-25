FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY package*.json svelte.config.js ./
RUN pnpm install
COPY prisma prisma
RUN pnpm prisma generate
COPY postcss.config.js tailwind.config.js tsconfig.json vite.config.ts ./
COPY src src
RUN pnpm build
RUN pnpm prune --production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "node", "build" ]
