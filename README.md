# 🎧 DJ Spotify Liker

> 🚨 Disclaimer: This is a weekend project I did for fun and to solve a problem I had, not a real product.

> ⚠️⚠️⚠️⚠️ **Warning:** This is not fully working in production because Spotify didn't approve the app on their side 😔.
> However, you can still clone the repo and try by yourself, just follow the steps bellow 🤘🏼😉

Like all your saved songs on Spotify automatically — effortlessly and in the background.

[🚀 Check the web app on Vercel](https://spotify-liker.vercel.app/)

---

## ✨ What is this?

DJ Spotify Liker is a two-part system:

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
- [Redis](https://redis.io) to comunicate between the frontend and the worker
- [MongoDB](https://www.mongodb.com) to store the user result (actually just because I wanted to play with mongo...)

---

## 🔧 How It Works

The frontend (a **Next.js** app) logs the user into their **Spotify account**, then enqueues a **job** on a **Redis server**.

This job is later picked up and processed by a **Worker** running on my **VPS**.

The **Worker** uses the **Spotify API** to loop through the user's playlists and "like" each song.

---

### 🌀 Why Asynchronous?

Because **Vercel's serverless environment** doesn't support **long-running tasks**.
Offloading the processing to a Worker avoids timeouts and limitations.

---

### 🔐 Why Use Redis?

We could trigger the Worker directly via an API call, **but that would expose the user's access token** in the browser (visible through DevTools > Network tab).

Instead, by enqueuing the job **on the server side** of the Next.js app and **processing it privately** via the Worker on a separate server, we ensure the token stays secure and never leaves the backend.

---

## ⚙️ How to Run Locally

> Make sure you have **Docker**, **Docker Compose**, and **Bun** installed.
> You will need Spotify Credentials that can be created [here](https://developer.spotify.com)

1. Clone the repo and create your local environment file and set the values marked with ⚠️:
   ```bash
   cp .env.example .env
   ```
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
