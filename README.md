# SDE Journey — Placement Command Center

A personal, local-first productivity tracker built for engineering placement preparation (target: Aug 21, 2027).

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 — dark mode only
- **Database**: Browser `localStorage` — zero backend, zero setup
- **AI**: Google Gemini (`gemini-flash-lite-latest`) for daily reviews and the Brutal Reality projection
- **Auth**: Single access key (no accounts, no cloud)

## Features

| Page | What it does |
|------|-------------|
| `/dashboard` | Daily overview — hours, DSA progress, streak, placement countdown |
| `/plan` | Plan your day with time blocks and categories |
| `/log` | Log actual time vs planned, mark tasks complete/partial/skipped |
| `/reflect` | 5-step daily reflection wizard with Gemini AI review |
| `/brutal-reality` | **Data-driven projection**: if you keep going like this, where will you end up? |
| `/dsa` | Full NeetCode 150 tracker — topics, difficulty, confidence, notes |
| `/projects` | Kanban board for portfolio projects |
| `/analytics` | Charts — reality vs plan, time by category, DSA by topic |
| `/calendar` | Monthly heat map of logged days |
| `/weekly-review` | Auto-generated weekly performance summary |
| `/settings` | Update skills/goals, export & import JSON backup |

## Setup

```bash
# 1. Clone
git clone https://github.com/Chetan0246/SDE-Journey.git
cd SDE-Journey

# 2. Install
npm install

# 3. Configure
cp .env.example .env.local
# Edit .env.local:
#   ACCESS_KEY=your-private-key
#   GEMINI_API_KEY=your-gemini-api-key   # get one free at aistudio.google.com

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter your access key.

## Architecture

```
src/
├── app/
│   ├── (dashboard)/        # All protected pages
│   │   ├── brutal-reality/ # ⭐ The projection engine
│   │   ├── dashboard/
│   │   ├── dsa/
│   │   ├── plan/
│   │   ├── log/
│   │   ├── reflect/
│   │   ├── projects/
│   │   ├── analytics/
│   │   ├── calendar/
│   │   ├── weekly-review/
│   │   └── settings/
│   ├── access/             # Login page (access key)
│   └── api/
│       ├── access/         # Sets cookie on valid key
│       └── ai/             # Gemini proxy
├── components/
│   └── layout/sidebar.tsx
├── lib/
│   ├── store.ts            # All localStorage CRUD + hooks
│   ├── neetcode-150.ts     # 150 pre-seeded DSA problems
│   └── utils.ts
└── proxy.ts                # Next.js middleware — access key guard
```

## Data

All data lives in your browser (`localStorage`). Nothing is sent to any server except AI prompts sent to the Gemini API.

Use **Settings → Export JSON** to back up your data. Use **Import JSON** to restore it on a new device.

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard or via CLI:
vercel env add ACCESS_KEY
vercel env add GEMINI_API_KEY
```

Or click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Chetan0246/SDE-Journey)

> [!IMPORTANT]
> Never commit `.env.local`. It is already in `.gitignore`.
> Set `ACCESS_KEY` and `GEMINI_API_KEY` in your Vercel project environment variables.