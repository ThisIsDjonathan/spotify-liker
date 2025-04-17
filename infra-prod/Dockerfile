# Use the official Bun image
FROM oven/bun:1.0.0

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy the rest of the application code
COPY . .

# Default command to run the worker
CMD ["bun", "background-worker/worker.ts"]