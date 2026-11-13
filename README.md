# SS - Social POD Platform

A print-on-demand (POD) and creator platform built with Next.js 15, Fabric.js, and Cloudflare Pages.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Edge Runtime)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Primary Language**: Lao (Phetsarath font optimized)
- **Canvas Engine**: Fabric.js
- **UI & Animation**: Lucide React, Framer Motion, Recharts
- **Architecture**: npm Workspaces monorepo with feature-first modules

## Project Structure

```text
ss-ecosystem/
├── apps/
│   └── client/                 # Web client (Next.js 15 App Router)
│       ├── public/             # Static assets (mockups, stickers)
│       └── src/
│           ├── app/            # App router (Lao UI)
│           ├── components/     # Shared UI and layout components
│           ├── features/       # Domain modules (designer, dashboard, feed, wallet, checkout)
│           ├── hooks/          # Shared custom hooks
│           └── lib/            # Utilities and helper functions
├── packages/
│   └── types/                  # Shared cross-app TypeScript types
└── package.json                # Monorepo configuration and root scripts
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development

Run the web client locally (defaults to port 3001):

```bash
npm run dev:client
```

### Production Build

```bash
npm run build
```

## Key Architecture

- **Canvas Designer**: Fabric.js provides client-side canvas manipulation, sticker layering, and mockup rendering.
- **Language**: Native Lao interface with font optimization for Lao (Phetsarath OT) script.
- **Feature-First Modules**: Domain logic, state, and components reside in self-contained directories under `src/features/`.
- **Edge-Ready**: Optimized for Cloudflare Pages and Edge execution using lightweight dependencies.

## Cloudflare Pages Deployment

This application deploys to Cloudflare Pages using `@cloudflare/next-on-pages`.

### Cloudflare Settings

- **Framework Preset**: Next.js
- **Root Directory**: `apps/client`
- **Build Command**: `npm run build && npx @cloudflare/next-on-pages`
- **Build Output Directory**: `.vercel/output/static`
- **Compatibility Flags**: `nodejs_compat` (configured under **Settings > Functions**)

### Technical Notes

- All routes target the Edge runtime (`export const runtime = 'edge'`).
