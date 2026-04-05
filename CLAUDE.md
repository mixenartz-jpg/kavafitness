# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build locally
```

No test runner or linter is configured.

## Architecture Overview

**FitTrack** is a Turkish-language PWA fitness tracker built with React 18 + Vite. It uses **tab-based SPA routing** — there is no URL-based navigation. All pages are loaded into `src/App.jsx` and shown/hidden by `activeTab` state.

### State Management

All global state lives in a **single Context** at `src/context/AppContext.jsx`. It manages:
- Firebase auth + Firestore sync
- Workout data (today's exercises, archive, templates)
- Nutrition data (foods, calorie archive, macro goals)
- Body measurements, water intake
- XP/badge gamification system
- AI credit usage limiter
- `activeTab` (drives page routing)
- `viewingDate` (switches to `DaySummary` when not today)

**Data flow:** Component interaction → `setXxx()` setter from context → LocalStorage save → async Firestore write (`setDoc` with `merge: true`). On login, Firestore is pulled once and cached into LocalStorage with keys like `fittrack_data_{uid}`.

### Routing

Routing is done entirely through state, not URLs. To navigate: call `setActiveTab('pageName')` from context. The `pages` map in `App.jsx` maps tab IDs to JSX components. When `viewingDate !== todayKey()`, App renders `<DaySummary>` instead of the active page.

### Firebase

Configured in `src/firebase.js` with hardcoded credentials (no `.env` files exist). Exports `auth`, `db` (Firestore), and `storage`. Firestore document path pattern: `users/{uid}/fitdata/{docName}`.

### AI / External APIs

- **n8n webhooks** (`http://localhost:5678/webhook/...`) for AI Coach, Personal Coach, and onboarding Google Sheets sync — requires a local n8n instance running.
- **Google Gemini API** called directly from components (fallback chain: `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash`). Used for calorie estimation, food recognition, and workout advice.
- **YouTube Data API** used in Exercises page for tutorial video search.
- API keys are hardcoded in component files (not in env vars).

### CSS / Theming

No Tailwind config — the project uses **CSS custom properties** defined in `src/styles/globals.css`. Theme switching sets `data-theme` attribute on `document.documentElement`. Key variables: `--bg`, `--surface`, `--accent`, `--text`, `--text-muted`, `--green`, `--red`, `--blue`, `--yellow` (each with `-dim` variants). Use `cn()` from `src/lib/utils.js` for conditional class merging.

### Key Files

| File | Purpose |
|------|---------|
| `src/context/AppContext.jsx` | All global state, Firebase sync, XP/badge logic |
| `src/App.jsx` | Tab routing, layout (Header + page + BottomNav + Toast) |
| `src/firebase.js` | Firebase init (auth, db, storage) |
| `src/components/BottomNav.jsx` | Navigation (5 main tabs + "More" menu with 13 sections) |
| `src/styles/globals.css` | CSS variables, dark/light theme |
| `src/lib/notifications.js` | Error reporting to n8n/Telegram |
| `src/lib/utils.js` | `cn()` utility and helpers |

### Gamification System

XP and badges are calculated in `AppContext.jsx`. 8 XP levels, 5 leagues, 17 badge types. PR detection compares current set weight against `exArchive`. AI usage tracked daily with a 10-call limit; banning is stored in `ai_usage_{uid}` localStorage key.

### Path Alias

`@` maps to `./src` (configured in `vite.config.js`). Use `@/components/...`, `@/context/...`, etc.
