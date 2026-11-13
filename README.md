# SS - Social POD Platform (Ecosystem)

ยินดีต้อนรับสู่โปรเจกต์ SS แพลตฟอร์ม Social Print-on-Demand (POD) ที่ออกแบบมาเพื่อรองรับผู้ใช้งานและนักสร้างสรรค์ในภูมิภาคเอเชียตะวันออกเฉียงใต้ โดยเฉพาะลาว ไทย และอังกฤษ

## 🛠️ Tech Stack

### Frontend & App Framework
- **Next.js 15 (App Router)**: เฟรมเวิร์กหลักสำหรับหน้าเว็บ (Client Application)
- **TypeScript**: เพื่อความปลอดภัยของประเภทข้อมูลและความแม่นยำในการพัฒนา
- **Tailwind CSS**: สำหรับการออกแบบ UI ที่ยืดหยุ่นและตอบสนองได้ทุกหน้าจอ
- **next-intl**: ระบบจัดการภาษา (Internationalization) รองรับภาษาอังกฤษ (en), ไทย (th), และลาว (lo)
- **Fabric.js**: สำหรับเครื่องมือ Designer Canvas Editor
- **Framer Motion**: สำหรับเอนิเมชันที่ลื่นไหล
- **Lucide React**: ชุดไอคอนที่สวยงามและน้ำหนักเบา

### Monorepo Structure
- **npm Workspaces**: จัดการหลายโปรเจกต์ภายใต้ Root เดียวกัน

## 📁 โครงสร้างโปรเจกต์ (Directory Overview)

โปรเจกต์นี้ใช้โครงสร้างแบบ Monorepo (npm workspaces) ควบคู่กับสถาปัตยกรรม **Feature-First** ภายใน `apps/client`:

```text
ss-ecosystem/
├── apps/
│   └── client/                           # Next.js 15 App Router (Cloudflare Edge Pages)
│       ├── messages/                     # ไฟล์แปลภาษา i18n (next-intl)
│       │   ├── en.json                   # English translations
│       │   ├── lo.json                   # Lao translations (Phetsarath font optimized)
│       │   └── th.json                   # Thai translations
│       ├── public/                       # Static assets
│       │   ├── assets/
│       │   │   ├── mockups/              # Mockup images (Base shirt, shadow, overlay)
│       │   │   ├── stickers/             # Sticker graphics for canvas
│       │   │   └── stickers.json         # Sticker metadata catalog
│       │   ├── mockups/                  # Mockup asset alias directory
│       │   └── stickers/                 # Sticker asset alias directory
│       ├── src/
│       │   ├── app/                      # App Router core
│       │   │   ├── [locale]/             # Dynamic i18n root (/en, /th, /lo)
│       │   │   │   ├── (dashboard)/      # Creator Dashboard route group
│       │   │   │   │   ├── designs/      # Portfolio list view
│       │   │   │   │   │   └── upload/   # Upload design & set pricing
│       │   │   │   │   └── layout.tsx    # Dashboard shell layout
│       │   │   │   └── layout.tsx        # Root locale layout with NextIntlClientProvider
│       │   │   ├── api/                  # Edge API endpoints
│       │   │   └── globals.css           # Tailwind base styles & Lao typography setup
│       │   ├── components/               # Shared cross-feature UI
│       │   │   ├── common/               # Shared common components
│       │   │   ├── layout/               # Header, navigation, shell components
│       │   │   └── ui/                   # Primitive UI components (shadcn pattern)
│       │   ├── features/                 # Feature-first domain modules
│       │   │   ├── checkout/             # Order processing & cart flow
│       │   │   ├── dashboard/            # Metrics & visual analytics (RevenueChart, StatCard)
│       │   │   ├── designer/             # Fabric.js Canvas Editor, sticker picker & mockup engine
│       │   │   ├── designs/              # Design management (DesignCard, UploadZone)
│       │   │   ├── feed/                 # Social discovery product feed (ProductFeed, FeedCard)
│       │   │   ├── studio/               # Creator studio editor actions & flows
│       │   │   ├── tools/                # Utility tools (ProfitSimulator, mockup templates)
│       │   │   └── wallet/               # Creator earnings & payout logic
│       │   ├── hooks/                    # Global reusable React hooks
│       │   ├── i18n/                     # next-intl configuration (routing.ts, request.ts)
│       │   ├── lib/                      # Shared client libs (utils.ts, mock-data.ts)
│       │   ├── middleware.ts             # Locale detection & rewrite middleware
│       │   ├── store/                    # Global client-side state
│       │   ├── types/                    # App-specific TypeScript declarations
│       │   └── utils/                    # Utility helpers (currency.ts for LAK/THB/USD)
│       ├── next.config.ts                # Next.js build & edge runtime configuration
│       ├── package.json                  # Client workspace dependencies
│       ├── postcss.config.mjs            # PostCSS plugin setup
│       ├── tailwind.config.ts            # Tailwind CSS design system tokens
│       └── tsconfig.json                 # TypeScript compiler options
├── packages/
│   └── types/                            # Shared workspace package for cross-app TypeScript types
│       └── src/
├── package.json                          # Monorepo root workspaces & orchestrator scripts
├── progress.md                           # Development milestone logs
├── rules.md                              # Core architectural & i18n rules
└── README.md                             # Project overview & documentation
```

## 🔄 การไหลของข้อมูล (Data Flow)

1.  **I18n Middleware**: เมื่อผู้ใช้เข้าชมระบบ Middleware จะทำการตรวจสอบภาษาจาก URL (เช่น `/th`, `/lo`) และโหลดข้อความที่เหมาะสมจากไฟล์ใน `messages/`.
2.  **Edge API Routes**: ระบบ Sticker และฟีเจอร์เบื้องหลังถูกตั้งค่าให้รันบน Cloudflare Edge Runtime เพื่อความเร็วสูงสุดและตอบสนองได้ทั่วโลก.
3.  **Feature Components**: แต่ละฟีเจอร์ใน `features/` จะจัดการสถานะ (State) และตรรกะ (Logic) ของตัวเอง แยกออกจากกันอย่างชัดเจน.
4.  **Designer Engine**: ใช้ Fabric.js ในการประมวลผลการออกแบบบนเครื่องของผู้ใช้ (Client-side) และจัดการองค์ประกอบสติกเกอร์ผ่าน API ภายใน.

## 🚀 การ Deploy บน Cloudflare

โปรเจกต์นี้ได้รับการตั้งค่าให้ทำงานบน Cloudflare Pages อย่างสมบูรณ์ผ่าน `@cloudflare/next-on-pages`:

### การตั้งค่าใน Dashboard:
- **Framework Preset**: `Next.js`
- **Root Directory**: `apps/client`
- **Build Command**: `npm run build && npx @cloudflare/next-on-pages`
- **Build Output Directory**: `.vercel/output/static`
- **Compatibility Flags**: ต้องเพิ่ม `nodejs_compat` ในส่วนของ **Settings > Functions** เพื่อรองรับ Next.js Edge Runtime

### การตั้งค่าทางเทคนิคที่สำคัญ:
- **Edge Runtime**: ทุก Route ถูกตั้งค่าเป็น `export const runtime = 'edge'`
- **Version Locking**: ล็อคเวอร์ชัน Next.js (15.4.11) เพื่อความเสถียรบนระบบ Workers
- **No Static Params**: ใช้ Dynamic Routing สำหรับ i18n เพื่อความยืดหยุ่นบน Edge

---
สร้างและดูแลโดย Gemini CLI 🚀
