# CLAUDE.md — FitTrack

React 18 + Vite PWA. Türkçe UI. URL routing **yok** — `activeTab` state ile sayfa geçişi.

## Komutlar
```bash
npm run dev    # localhost:5173
npm run build
npm run preview
```
Test/linter yok.

## Mimari

**State:** Tümü `src/context/AppContext.jsx` içinde. Firebase auth + Firestore sync. Bileşen → `setXxx()` → LocalStorage → async Firestore (`setDoc` + `merge:true`).

**Routing:** `setActiveTab('pageName')` · `App.jsx`'teki `pages` map · `viewingDate !== todayKey()` → `<DaySummary>` render

**Firebase:** `src/firebase.js` hardcoded credentials. `.env` **yok** (VITE_GEMINI_KEY `.env` dosyasında mevcut, firebase credentials hardcoded). `users/{uid}/fitdata/{docName}`

**API'ler:**
| | |
|---|---|
| Gemini | `VITE_GEMINI_KEY` (.env). Fallback: `gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-2.5-flash` |
| YouTube | `VITE_YOUTUBE_KEY` (.env) — Exercises video tab |
| n8n | `http://localhost:5678/webhook/...` — yerel çalışmalı |

**CSS:** Tailwind yok. `src/styles/globals.css` custom properties. `--bg`, `--surface`, `--accent`, `--text`, `--text-muted`, `--green/red/blue/yellow` + `-dim` varyantları. `cn()` → `src/lib/utils.js`. Stil: CSS var kullan, inline style yazma.

**Önemli dosyalar:**
| | |
|---|---|
| `src/context/AppContext.jsx` | Global state, Firebase sync, XP/rozet |
| `src/App.jsx` | Tab routing, layout |
| `src/components/BottomNav.jsx` | Nav (5 tab + "Daha Fazla" menüsü) |
| `src/firebase.js` | Firebase init |
| `src/styles/globals.css` | Tema değişkenleri |
| `src/lib/notifications.js` | n8n/Telegram hata bildirimi |

**Oyunlaştırma:** 8 XP seviyesi, 5 lig, 17 rozet. AI günlük 10 çağrı limiti (`ai_usage_{uid}` localStorage).

**Path alias:** `@` → `./src`

## Geliştirme Kuralları

- Yeni sayfa: `App.jsx` `pages` map + `BottomNav.jsx` navigasyon
- Yeni global state: sadece `AppContext.jsx`
- Firebase yazma: her zaman `merge: true`
- Tüm UI metinleri Türkçe

## Skill Protokolü

Her görevde otomatik uygula — onay bekleme. `Skill` aracıyla çağır, dosya sistemine gitme.

| Görev | Skill |
|---|---|
| UI / React / CSS | `everything-claude-code:frontend-patterns` |
| Yeni bileşen tasarımı | `frontend-design` + `mcp__magic__21st_magic_component_builder` |
| Kod kalitesi / refactor | `everything-claude-code:code-review` |
| Güvenlik | `everything-claude-code:security-review` |
| Test / doğrulama | `everything-claude-code:tdd` · `everything-claude-code:verify` |
| Firebase / API | `everything-claude-code:backend-patterns` |
| Gemini / n8n / prompt | `everything-claude-code:deep-research` |
| Mimari / büyük değişiklik | `superpowers:write-plan` → `superpowers:execute-plan` |
| Git / PR | `everything-claude-code:git-workflow` |
| Deploy / build | `everything-claude-code:deployment-patterns` |
| Animasyon / motion | `everything-claude-code:frontend-patterns` |
| SEO / performans | `ai-seo` · `seo-audit` |
| Dökümantasyon | `everything-claude-code:docs` |

**MCP'ler:**
- UI bileşen: `mcp__magic__21st_magic_component_builder` (FRONTEND/UI_DESIGN görevlerde önce çalışır)
- Logo/ikon: `mcp__magic__logo_search`
- Döküman arama: `mcp__plugin_everything-claude-code_context7__query-docs`
- Web araştırma: `mcp__plugin_everything-claude-code_exa__web_search_exa`

**Karmaşık görev zinciri örneği:**
```
1. superpowers:write-plan  → plan
2. frontend-design         → tasarım kararı
3. frontend-patterns       → implementasyon
4. code-review             → kalite
5. verify                  → doğrulama
```

**Çıktı formatı:**
```
🤖 KATEGORİ : [kategori]
📦 SKILL    : [skill]
─────────────────────
[Çıktı]
```
