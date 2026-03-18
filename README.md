# DevBookmark — Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square)
![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)

The React frontend for DevBookmark — a social platform where developers save, share, and discover programming resources.

🔗 **Live Demo:** https://devbookmark.netlify.app  
⚙️ **Backend Repo:** https://github.com/Siddhi-1711/devbookmark-backend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Rich Text Editor | Tiptap v3 |
| UI Primitives | Radix UI (Avatar, Dialog, Dropdown) |
| Icons | Lucide React |
| Deployment | Netlify |

---

## Features

- **Authentication** — Register, login, JWT stored in localStorage, protected routes
- **Feed** — Personalized feed from followed users, followed tags, and reposts
- **Resources** — Create, edit, delete resources with URL, description, tags, and file attachments
- **Social** — Like, save, repost, comment (with nested replies) on any resource
- **Explore** — Trending resources and tags ranked by engagement score
- **Search** — Full-text search across resources, users, and tags
- **Collections** — Curate and share named collections of resources
- **Series** — Create ordered multi-part resource series
- **Reading List** — Queue resources to read later
- **Notifications** — Real-time in-app notifications for likes, follows, and comments
- **Profile** — Public profile with pinned resources, stats, and follower/following network
- **Publications** — Long-form article publishing
- **Admin Panel** — Ban/unban users, delete content (ROLE_ADMIN)
- **Rich Text** — Full Tiptap editor with tables, highlights, links, text alignment, and underline

---



---

## Local Setup

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/Siddhi-1711/devbookmark-frontend
cd devbookmark-frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Set VITE_API_URL to your backend URL

# 4. Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

**Environment Variables (`.env`):**

```env
VITE_API_URL=http://localhost:8080
```

For production, set this to your Render backend URL.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Deployment

Deployed on **Netlify** with automatic deploys from the `main` branch.

The `dist/` folder is the build output — Netlify picks it up automatically via the `vite build` command.

Make sure to set `VITE_API_URL` in Netlify's environment variable settings to point to your Render backend.

> **Important:** Add a `_redirects` file inside the `public/` folder with the following content so React Router works correctly on Netlify:
>
> ```
> /* /index.html 200
> ```