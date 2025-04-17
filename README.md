# 🎧 Spotify Liker

Like all your saved songs on Spotify automatically — effortlessly and in the background.

[🚀 Try the web app on Vercel](https://spotify-liker.vercel.app)

---

## ✨ What is this?

Spotify Liker is a two-part system:
- A **Next.js app** (deployed on Vercel) where users authenticate with Spotify
- A **background worker** (hosted on a VPS with Coolify) that goes through your playlists and likes all songs asynchronously

No need to like each track manually anymore — just click and let it roll! 🪄

---

## 🧱 Tech Stack

This project uses:
- [Next.js](https://nextjs.org/) for the web interface
- [Bun](https://bun.sh/) as the runtime and package manager
- [Coolify](https://coolify.io/) to run the worker
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) to manage user playlists

---

## ⚙️ How to Run Locally

> Make sure you have **Docker**, **Docker Compose**, and **Bun** installed.

1. Clone the repo and create your local environment file:
   ```bash
   cp .env.example .env.example
2. Install all dependencies:
   ```bash
   bun install
   ```
3. Run the following command to start the services on local:
   ```bash
   bun services:up
   ```
4. Run the webapp:
   ```bash
   bun dev
   ```
5. Start the worker:
   ```bash
   bun start:worker
   ```
6. Visit http://localhost:3000 and enjoy! 😄
