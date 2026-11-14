## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Canvas Engine**: Fabric.js
- **UI & Animation**: Lucide React, Framer Motion, Recharts

## Directory Overview

```text
SS/
├── apps/
│   └── client/                 # Web client (Next.js 15 App Router)
│       ├── public/             # Static assets (mockups, stickers)
│       └── src/
│           ├── app/            # App router
│           ├── components/     # Shared UI and layout components
│           ├── features/       # Domain modules
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

