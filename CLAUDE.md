# CLAUDE.md — FitTrack Project

Bu dosya Claude Code'un bu projede nasıl davranması gerektiğini tanımlar.
Hem proje mimarisini hem de otomatik ajan/skill seçim protokolünü içerir.

---

## Geliştirme Komutları

```bash
npm run dev       # Vite dev server (localhost:5173)
npm run build     # Production build
npm run preview   # Production build önizleme
```

Test runner veya linter kurulu değil.

---

## Proje Mimarisi

**FitTrack** — Türkçe dilli, React 18 + Vite tabanlı PWA fitness takip uygulaması.
URL tabanlı routing **yoktur**. Tüm sayfalar `src/App.jsx` içinde `activeTab` state'i ile gösterilip gizlenir.

### State Yönetimi

Tüm global state `src/context/AppContext.jsx` içindedir:

- Firebase auth + Firestore senkronizasyonu
- Antrenman verisi (bugünkü egzersizler, arşiv, şablonlar)
- Beslenme verisi (yiyecekler, kalori arşivi, makro hedefleri)
- Vücut ölçüleri, su tüketimi
- XP/rozet oyunlaştırma sistemi
- AI kredi kullanım sınırlayıcı
- `activeTab` (sayfa routing'ini yönetir)
- `viewingDate` (bugün değilse `DaySummary` gösterir)

**Veri akışı:** Bileşen etkileşimi → `setXxx()` (context'ten) → LocalStorage kaydet → async Firestore write (`setDoc` + `merge: true`). Girişte Firestore bir kez çekilir, `fittrack_data_{uid}` gibi anahtarlarla LocalStorage'a yazılır.

### Routing

Sadece state üzerinden çalışır. Navigasyon için: `setActiveTab('pageName')`. `App.jsx`'teki `pages` map'i tab ID'lerini JSX bileşenlerine bağlar. `viewingDate !== todayKey()` iken App, `<DaySummary>` render eder.

### Firebase

`src/firebase.js` içinde hardcoded credentials (`.env` dosyası yoktur).
Export'lar: `auth`, `db` (Firestore), `storage`.
Firestore yolu: `users/{uid}/fitdata/{docName}`.

### AI / Harici API'ler

| Servis | Kullanım |
|--------|----------|
| **n8n webhooks** (`http://localhost:5678/webhook/...`) | AI Coach, Personal Coach, Google Sheets onboarding — yerel n8n instance gerektirir |
| **Google Gemini API** | Kalori tahmini, yiyecek tanıma, antrenman önerisi. Fallback: `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash` |
| **YouTube Data API** | Exercises sayfasında egzersiz tutorial arama |

API anahtarları bileşen dosyalarına hardcoded yazılmıştır (env var kullanılmaz).

### CSS / Tema

Tailwind **yoktur**. `src/styles/globals.css` içindeki CSS custom properties kullanılır.
Tema geçişi: `document.documentElement` üzerinde `data-theme` attribute'u.

Temel değişkenler: `--bg`, `--surface`, `--accent`, `--text`, `--text-muted`, `--green`, `--red`, `--blue`, `--yellow` (her birinin `-dim` varyantı vardır).
Class birleştirmek için `cn()` kullan — `src/lib/utils.js`.

### Önemli Dosyalar

| Dosya | Amaç |
|-------|------|
| `src/context/AppContext.jsx` | Tüm global state, Firebase sync, XP/rozet mantığı |
| `src/App.jsx` | Tab routing, layout (Header + sayfa + BottomNav + Toast) |
| `src/firebase.js` | Firebase başlatma (auth, db, storage) |
| `src/components/BottomNav.jsx` | Navigasyon (5 ana tab + 13 bölümlü "Daha Fazla" menüsü) |
| `src/styles/globals.css` | CSS değişkenleri, dark/light tema |
| `src/lib/notifications.js` | n8n/Telegram'a hata bildirimi |
| `src/lib/utils.js` | `cn()` yardımcısı ve helpers |

### Oyunlaştırma Sistemi

XP ve rozetler `AppContext.jsx` içinde hesaplanır. 8 XP seviyesi, 5 lig, 17 rozet türü. PR tespiti mevcut set ağırlığını `exArchive` ile karşılaştırır. AI kullanımı günlük 10 çağrı ile sınırlıdır; yasaklama `ai_usage_{uid}` localStorage anahtarına yazılır.

### Path Alias

`@` → `./src` (`vite.config.js` içinde tanımlı). Kullanım: `@/components/...`, `@/context/...`

---

## Ajan ve Skill Protokolü

Her görev geldiğinde aşağıdaki adımları **otomatik** olarak uygula. Kullanıcıdan onay bekleme.

### ADIM 1 — Görev Kategorisini Belirle

| Kategori | Kapsam |
|----------|--------|
| `FRONTEND` | UI/UX, React bileşen, CSS, tema, animasyon |
| `UI_DESIGN` | Yeni bileşen tasarımı, layout, görsel iyileştirme |
| `BACKEND` | Firebase kuralları, Firestore sorguları, API entegrasyonu |
| `DATA_AI` | Gemini API, n8n webhook, prompt mühendisliği |
| `SECURITY` | Auth akışı, API key güvenliği, XSS/injection kontrolü |
| `TESTING` | E2E test, bileşen testi, doğrulama döngüsü |
| `ARCHITECTURE` | Sistem tasarımı, mimari karar, ölçekleme |
| `DEVOPS` | Build, deploy, Vercel, CI/CD |
| `DOCUMENTATION` | Teknik yazı, README, changelog |
| `WORKFLOW` | Git işlemleri, kod inceleme, otomasyon |
| `GENERAL` | Brainstorming, planlama, hata ayıklama |

### ADIM 2 — Skill Seç ve `Skill` Aracıyla Çağır

Skill'ler `Skill` aracıyla çağrılır. Dosya sistemine gitme.

#### FitTrack için Skill Haritası

```
GÖREV: React bileşeni yaz / UI düzelt / CSS değiştir
  → Skill: everything-claude-code:frontend-patterns
  → Yedek: everything-claude-code:design-system

GÖREV: Kod kalitesi / refactor / inceleme
  → Skill: everything-claude-code:code-review

GÖREV: Güvenlik açığı / auth / API key riski
  → Skill: everything-claude-code:security-review
  → Yedek: everything-claude-code:security-scan

GÖREV: Test yaz / doğrulama
  → Skill: everything-claude-code:tdd-workflow
  → Yedek: everything-claude-code:e2e-testing

GÖREV: Firebase / Firestore / API entegrasyonu
  → Skill: everything-claude-code:backend-patterns
  → Yedek: everything-claude-code:api-design

GÖREV: Gemini / n8n / prompt mühendisliği
  → Skill: everything-claude-code:deep-research

GÖREV: Mimari karar / büyük yeniden yapılandırma
  → Skill: everything-claude-code:plan
  → Yedek: everything-claude-code:blueprint

GÖREV: Git workflow / PR / commit
  → Skill: everything-claude-code:git-workflow

GÖREV: Deployment / Vercel / build
  → Skill: everything-claude-code:deployment-patterns

GÖREV: Dokümantasyon
  → Skill: everything-claude-code:docs
```

#### Tüm Aktif Skill Referansları

| Kategori | Skill |
|----------|-------|
| Frontend | `everything-claude-code:frontend-patterns` |
| Tasarım sistemi | `everything-claude-code:design-system` |
| Kod inceleme | `everything-claude-code:code-review` |
| Güvenlik | `everything-claude-code:security-review`, `everything-claude-code:security-scan` |
| TDD | `everything-claude-code:tdd`, `everything-claude-code:tdd-workflow` |
| E2E Test | `everything-claude-code:e2e`, `everything-claude-code:e2e-testing` |
| Doğrulama | `everything-claude-code:verify`, `everything-claude-code:verification-loop` |
| Backend | `everything-claude-code:backend-patterns` |
| API Tasarım | `everything-claude-code:api-design` |
| Mimari | `everything-claude-code:blueprint`, `everything-claude-code:plan` |
| ADR | `everything-claude-code:architecture-decision-records` |
| Git | `everything-claude-code:git-workflow` |
| Deploy | `everything-claude-code:deployment-patterns` |
| Docker | `everything-claude-code:docker-patterns` |
| Veritabanı | `everything-claude-code:database-migrations` |
| Araştırma | `everything-claude-code:deep-research` |
| Dökümantasyon | `everything-claude-code:docs` |
| Optimizasyon | `everything-claude-code:prune`, `everything-claude-code:prompt-optimizer` |

### ADIM 3 — Her Görev Başında Çıktı Formatı

```
🤖 KATEGORİ : [Kategori adı]
📦 SKILL    : everything-claude-code:[skill-adı]
─────────────────────────────────────
[Görev çıktısı buradan başlar]
```

### ADIM 4 — Karmaşık Görevlerde Sıralı Skill Zinciri

Görev birden fazla kategoriyi kapsıyorsa sıralı çağır:

```
Örnek: "Yeni bir Dashboard sayfası ekle"

  1. plan          → Mimari karar ve bileşen planı
  2. frontend-patterns → Bileşen implementasyonu
  3. code-review   → Kalite kontrolü
  4. security-review → Güvenlik denetimi
  5. verify        → Son doğrulama
```

---

## Temel Kurallar

1. Her görevde ADIM 1-4'ü otomatik çalıştır, kullanıcıdan onay bekleme
2. Skill'leri **`Skill` aracıyla** çağır — dosya sistemine gitme
3. Belirsiz görevlerde önce `everything-claude-code:plan` ile başla
4. Aynı anda max 3-5 skill kombinasyonu kur
5. Skill bulunamazsa en yakın alternatifi kullan, kullanıcıya bildir
6. Bu projeye özgü kısıtlamalar:
   - `.env` dosyası **yoktur** — credentials hardcoded'dır
   - URL-based routing **yoktur** — sadece `setActiveTab()` kullan
   - n8n yerel olarak çalışıyor olmalıdır
   - API anahtarları bileşen dosyalarındadır

---

## FitTrack'e Özgü Geliştirme Notları

- Yeni sayfa eklerken: `App.jsx`'teki `pages` map'ine ekle, `BottomNav.jsx`'e navigasyon ekle
- Yeni global state eklerken: sadece `AppContext.jsx` içine ekle
- Stil değişikliklerinde: CSS custom property'leri (`--accent`, `--surface` vb.) kullan, inline style yazma
- Firebase yazma işlemleri her zaman `merge: true` ile yapılır
- Tüm kullanıcı mesajları Türkçedir
