# Test Kitchen — Recipe Management App

## What This Is

A personal recipe management app built for one primary user (68-year-old, iPad-first). The core idea: recipes evolve over time like software — ingredients get tweaked, steps get refined, things get cut. This app tracks that evolution with versioning (like Git) so you can always see what changed between attempts and go back to any prior version.

Named "Test Kitchen" because that's exactly what cooking is: iterative experimentation.

## Primary Goals

1. **Capture recipes easily** — photo of a cookbook page, a URL, a PDF, or typed manually. AI does the heavy lifting of parsing and structuring the recipe.
2. **Version recipes** — every time a recipe is saved after editing, a new version is created. Each version can have a note ("reduced sugar, added lemon zest"). Diffs are viewable between any two versions.
3. **iPad-first UI** — large touch targets, minimal clutter, no small text. Everything a 68-year-old can use without frustration.

## Non-Goals

- Not a production app — minimal auth (single user, password login, no OAuth/email flows)
- No multi-tenancy, no sharing, no social features
- No full test coverage — just unit tests on the beefy logic (AI parsing, diff engine, version retrieval)

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack in one repo, API routes, great image handling |
| Database | PostgreSQL | Robust, versioning-friendly with JSON columns |
| ORM | Prisma | Clean migrations, good DX |
| AI | Claude API (Anthropic) | Photo OCR, URL parsing, PDF extraction |
| UI | shadcn/ui + Tailwind | Accessible, large touch targets, easy to customize |
| Deployment | Docker Compose | Local home server, app + postgres in containers |

## Architecture Overview

### Recipe Data Model

A `Recipe` has many `RecipeVersions`. Each version stores the full recipe state as structured JSON — no deltas, just snapshots. Diffs are computed at display time.

```
Recipe
  id, title, created_at, updated_at, current_version_id

RecipeVersion
  id, recipe_id, version_number, created_at, change_note
  data: JSON {
    title, description, source_url, source_type,
    servings, prep_time, cook_time,
    ingredients: [{ amount, unit, name, notes }],
    instructions: [{ step, text }],
    tags: [],
    notes
  }
```

### AI Parsing Flow

1. User provides input: photo → base64, URL → fetched HTML, PDF → extracted text
2. Claude API receives the raw content with a structured prompt
3. Response is parsed into the RecipeVersion JSON schema
4. User reviews and edits before saving (AI output is never auto-saved blindly)

### Versioning Model

- Every explicit "Save" creates a new `RecipeVersion` row
- Version numbers are sequential integers per recipe
- Diff view computes field-by-field changes between any two versions
- User can "restore" any past version (creates a new version from the old data, preserving history)

## Key UX Principles

- **One primary action per screen** — no overwhelming options
- **Large tap targets** — minimum 44px, prefer 56px+
- **Confirmation before destructive actions** — deleting a recipe, discarding changes
- **AI is a helper, not an oracle** — always show parsed results for review before saving
- **Offline-tolerant** — local hosting means same-network dependency; design gracefully for that

## Project Structure (planned)

```
test-kitchen/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login page
│   ├── recipes/            # Recipe list, detail, edit, versions
│   └── api/                # API routes (recipes, versions, ai-parse)
├── components/             # Reusable UI components
├── lib/                    # Business logic
│   ├── ai/                 # Claude API integration, parsing prompts
│   ├── db/                 # Prisma client, query helpers
│   └── diff/               # Recipe diff computation
├── prisma/                 # Schema and migrations
├── docker-compose.yml      # App + Postgres for local hosting
└── CLAUDE.md               # This file
```

## Development Milestones

### Milestone 1 — Foundation
- [ ] Project scaffold (Next.js, Prisma, Postgres, Docker Compose)
- [ ] DB schema (recipes, recipe_versions, user)
- [ ] Simple auth (single user, hashed password, session cookie)
- [ ] Basic recipe CRUD (manual entry only)
- [ ] Recipe list and detail pages (iPad-optimized layout)

### Milestone 2 — Versioning
- [ ] Version creation on every save
- [ ] Version history view (timeline of versions)
- [ ] Diff view between any two versions
- [ ] Restore a prior version

### Milestone 3 — AI Import
- [ ] URL import (fetch + Claude parsing)
- [ ] Photo import (camera/file upload + Claude vision)
- [ ] PDF import (text extraction + Claude parsing)
- [ ] Review/edit screen after AI parse before saving

### Milestone 4 — Polish
- [ ] Search and filter recipes
- [ ] Tags
- [ ] iPad PWA tweaks (home screen icon, full-screen mode)
- [ ] Print-friendly recipe view

## Deployment Setup

- **Host**: ThinkStation running Ubuntu Server
- **Containers**: Docker Compose — app (Next.js) + postgres as services
- **External access**: Cloudflared tunnel (already configured by user — just expose the right internal port)
- **Pattern**: Standalone Docker Compose with a configurable port; user hooks it into existing Cloudflared setup
- **No SSL management needed in-app** — Cloudflared handles TLS termination

## AI / API Notes

- Claude API (Anthropic), separate account/key from personal usage
- Costs for single-user personal app: pennies/month (URL parse ~$0.01, photo ~$0.02)
- AI integration lives in `lib/ai/` — abstracted behind a provider interface so it can be swapped
- **AI parses → user reviews → user saves** — never auto-saving AI output

## Development Notes

- Run locally with `docker compose up` for postgres, `npm run dev` for app during development
- Keep AI prompt templates in `lib/ai/prompts.ts` — easy to iterate without touching business logic
- Prefer server components for data fetching; client components only where interactivity is needed
- When in doubt, make things bigger and simpler for the UI
- Visual diff between versions is **deferred past MVP** — MVP has version list + change notes only
