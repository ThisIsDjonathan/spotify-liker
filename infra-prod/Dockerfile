FROM oven/bun:1.0.0

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

CMD ["bun", "background-worker/worker.ts"]