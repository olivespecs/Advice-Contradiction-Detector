# Advice Contradiction Detector

A tool that surfaces genuine disagreements between Lenny Rachitsky's podcast guests, AI-analyzed across 300+ episodes.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/contradiction-detector run dev` — run the React frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

### Pipeline scripts (run once to generate real data)

```bash
# 1. Clone the podcast transcripts
git clone https://github.com/LennysNewsletter/lennys-newsletterpodcastdata

# 2. Extract claims from all transcripts (writes data/claims.json)
pnpm --filter @workspace/scripts run extract

# 3. Detect contradictions between claims (writes data/contradictions.json)
pnpm --filter @workspace/scripts run detect
```

These scripts use Claude AI via Replit AI Integrations — no API key needed.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui
- API: Express 5 (serves pre-generated JSON, no DB needed)
- AI: Anthropic Claude via Replit AI Integrations
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/contradiction-detector/src/` — React frontend
- `scripts/src/extract-claims.ts` — Pipeline script 1: extract claims from transcripts
- `scripts/src/detect-contradictions.ts` — Pipeline script 2: find contradictions
- `data/contradictions.json` — Pre-generated contradictions (seeded with 12 examples)
- `data/claims.json` — Pre-generated claims (populated by pipeline)

## Architecture decisions

- **JSON file store**: No database needed. Data is generated once by the pipeline and served statically by the API server. Fast reads, zero infra overhead.
- **Client-side filtering**: All 12+ contradictions are fetched on mount; topic/confidence/guest filtering is done in memory. Suitable for hackathon scale.
- **Always dark mode**: The app forces dark mode on mount — the editorial dark aesthetic is core to the product identity.
- **Replit AI Integrations**: Uses `AI_INTEGRATIONS_ANTHROPIC_*` env vars auto-provisioned by Replit — no user API key required.
- **Path traversal for data**: API routes use `import.meta.url` + `fileURLToPath` to resolve the `data/` directory at workspace root from the bundled `dist/index.mjs`.

## Product

- **Header**: App title, subtitle, live stats (contradictions, topics, guests featured)
- **FilterBar**: Topic pills from API, high-confidence toggle, guest name search
- **ContradictionCard**: Two-column guest layout with VS divider, topic badge, confidence score, tension summary
- **ExpandedContradictionModal**: Full detail with quotes, share button (copies formatted text)
- **EmptyState**: Friendly message when no results match

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `data/` directory must be at workspace root. API server resolves it via `__dirname` 3 levels up from `dist/`.
- Pipeline scripts require the `podcasts/` directory (cloned from GitHub). The `data/contradictions.json` file ships with 12 seed contradictions so the app is functional without running the pipeline.
- Anthropic model must be one of the supported Replit AI Integration models (not `claude-sonnet-4-20250514` as specified in the prompt — use `claude-sonnet-4-6`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
