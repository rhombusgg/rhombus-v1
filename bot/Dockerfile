FROM node:18

WORKDIR /app

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY bot.ts ./

CMD ["pnpm" "start"]
