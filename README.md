# Spotify Liker - Local Development Environment

This project includes a Next.js app (deployed on Vercel) and a background worker (running on a VPS with Coolify). This setup allows you to run the worker locally using Docker and Bun.js, along with Redis for queue management.

## Prerequisites

- Docker and Docker Compose installed on your machine.
- Environment variables configured in a `.env` file.

## Environment Variables

Create a `.env` file in the root of the project with the following variables:

```env
# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# JWT Secret
JWT_SECRET=your_jwt_secret

# SMTP Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=your_smtp_from_email

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
```

---

### How to Run Locally

1. **Ensure Docker and Docker Compose are installed**.
2. **Create a [.env](http://_vscodecontentref_/0) file** with the required environment variables.
3. Run the following command to start the services:
   ```bash
   docker-compose up --build
   ```
