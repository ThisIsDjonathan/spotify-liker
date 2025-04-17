# Spotify Liker

This project includes a Next.js app (deployed on Vercel) and a background worker (running on a VPS with Coolify).

---

### How to Run Locally

-. **Ensure Docker + Docker Compose and Bun are installed**.
-. **Create a `.env.development` file** based on the `.env.example`.
-. Install all dependencies:
   ```bash
   bun install
   ```
-. Run the following command to start the services on local:
   ```bash
   bun services:up
   ```
-. Run the webapp:
   ```bash
   bun dev
   ```
-. Start the worker:
   ```bash
   bun start:worker
   ```
-. Enjoy :D localhost:3000