# Use the official Bun image
FROM oven/bun:1.0.0

# Set the working directory
WORKDIR /app

# Install Redis
RUN apt-get update && apt-get install -y redis-server && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose Redis port
EXPOSE 6379

# Start both Redis and the worker
CMD redis-server --maxmemory-policy noeviction & bun background-worker/worker.ts