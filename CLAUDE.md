# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run lint     # ESLint
```

No tests exist in this project.

## Stack

- **Next.js 14** (App Router) — TypeScript, deployed to **Netlify** via `@netlify/plugin-nextjs`
- **Tailwind CSS** + **Framer Motion** + **Radix UI** components
- **Supabase** — Postgres DB + auth (browser client for frontend, service-role client for API routes)
- **Anthropic SDK** (`claude-sonnet-4-6` for main generation, `claude-haiku-*` for lighter tasks)
- **Higgsfield AI** — external video generation API (text-to-video)

## Architecture

### Auth
Password-based access only (no Supabase auth). `middleware.ts` checks for `adonis_access=granted` cookie on all non-public routes. The `/login` page sets this cookie. All `/api/*` routes are public (skip middleware).

### Page structure
- `/app/dashboard` — analytics overview
- `/app/factory/*` — content factory directions (infographics, cartoon, clips, carousels, posts, heygen-ai, heygen-live)
- `/app/generator` — single content generator
- `/app/repurpose`, `/app/trends`, `/app/brand`, `/app/autopost`, `/app/channels` — other tools
- `AppLayout` wraps every page (Sidebar + Header + `GenerationIndicator`)

### Content generation flow
Each factory direction (`app/factory/[direction]/page.tsx`) follows this pattern:
1. **Script tab** — calls an API route (e.g. `/api/infographic`) → Claude generates structured content
2. **Plan tab** — `ContentPlanTab` component → `/api/content-plan`
3. **Create tab** — video generation via `useVideoGen` hook → `/api/higgsfield/generate` → polls `/api/higgsfield/status/[id]`
4. **Autopost tab** — `AutopostTab` component

### Background tasks (`lib/bg-store.ts` + `lib/use-bg-task.ts`)
Module-level singleton `bgStore` tracks async tasks that must survive component unmounts (Claude generation calls). `useBgTask(key)` subscribes any component to task state. `GenerationIndicator` (rendered in `AppLayout`) shows all running tasks globally.

### Video generation (`lib/use-video-gen.ts`)
`useVideoGen` hook handles the full Higgsfield lifecycle:
1. Saves row to `video_generations` Supabase table
2. POSTs to `/api/higgsfield/generate` (maps model IDs to Higgsfield REST paths)
3. Polls `/api/higgsfield/status/[id]` every 4 seconds until `completed` or `failed`
4. Updates Supabase row at each state change

### Supabase clients
- `getSupabase()` — browser client for Client Components
- `createServerClient()` — service-role client for API Routes (never use in client-side code)
- Both gracefully return `null` if env vars are not configured

### AI context
`lib/adonis-context.ts` exports `ADONIS_CONTEXT` — the full ADONIS franchise brand knowledge base injected into every Claude prompt. All content generation is for the ADONIS franchise brand (merch/branding franchise business, Russian market).

### Key env vars
```
ANTHROPIC_API_KEY
HIGGSFIELD_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Active Skills (auto-apply, no command needed)

**IMPORTANT:** Always invoke these skills automatically — do NOT wait for the user to type a slash command.

### `social-media-manager` — invoke whenever the user asks about:
- Writing a post, caption, text for TikTok / Instagram / Telegram / VK / YouTube
- Content plan, content calendar, posting schedule
- Hashtags, hooks, viral formats, engagement
- SMM strategy, audience growth, platform choice
- Any content for the ADONIS franchise brand

### `ai-video-prompting` — invoke whenever the user asks about:
- A prompt for video generation (Kling, Higgsfield, Runway, Sora, Pika, Veo)
- Animating a scene, camera movement, visual style for AI video
- Improving or writing a video prompt
- Any prompt that will be sent to `/api/higgsfield/generate`
