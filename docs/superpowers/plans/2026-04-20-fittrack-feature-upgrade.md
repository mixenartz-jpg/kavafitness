# FitTrack Feature Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade FitTrack across 4 areas: (A) smarter interactive Personal Coach with app actions, (B) exercise photos + richer form details for all exercises, (C) expanded food database (~200 foods) with gram editing, (D) descriptive tooltips across all menu items.

**Architecture:** All changes are self-contained edits to existing component files — no new files required except a shared exercise data file extracted from Exercises.jsx. PersonalCoach gets new action tags `[ACTION:...]` parsed into real context mutations via AppContext setters. Food DB expands inline in Calorie.jsx. Exercises.jsx gets a per-exercise `photo` field (Unsplash URL) and expanded `EXERCISE_FORMS` coverage for all 92 exercises.

**Tech Stack:** React 18, Vite, Gemini API (gemini-2.5-flash), CSS custom properties, AppContext setters (`saveFoods`, `saveExercises`, `setActiveTab`), Unsplash Source API (free, no key), YouTube Data API (already wired).

---

## Sıra: A → B → C → D

---

## TASK A: Kişisel Koç — Akıllı + İnteraktif

**Files:**
- Modify: `src/components/pages/PersonalCoach.jsx`

### A1 — Yeni ACTION etiketleri için parser

- [ ] `PersonalCoach.jsx` içinde `parseMessage(text)` fonksiyonunu bul (ya da mevcut `[NAV:]` parse eden kodu bul, ~satır 343-346).
- [ ] Aşağıdaki yeni etiketleri ekle (mevcut `[NAV:]` yanına):

```
[ACTION:add_food:{"name":"Tavuk Göğsü","kcal":165,"protein":31,"fat":4,"carb":0,"gram":150}]
[ACTION:add_exercise:{"name":"Bench Press","sets":4,"reps":"8-10","weight":80}]
[ACTION:set_goal:{"kcal":2200,"protein":160,"fat":70,"carb":200}]
[ACTION:nav:calorie]
[ACTION:nav:today]
[ACTION:nav:progress]
[ACTION:nav:goals]
[ACTION:nav:exercises]
```

- [ ] `PersonalCoach.jsx` dosyasını aç, mevcut `[NAV:]` regex'ini bul ve aşağıdaki yeni `parseActions(text)` fonksiyonunu ekle (mevcut NAV parse'ının hemen üstüne):

```javascript
function parseActions(text) {
  const actions = []
  const clean = text.replace(/\[ACTION:[^\]]+\]/g, (match) => {
    try {
      const inner = match.slice(8, -1) // ACTION: kısmını çıkar
      const colonIdx = inner.indexOf(':')
      if (colonIdx === -1) {
        // [ACTION:nav:calorie] formatı
        const parts = inner.split(':')
        actions.push({ type: parts[0], sub: parts[1], data: null })
        return ''
      }
      const type = inner.slice(0, colonIdx)
      const data = JSON.parse(inner.slice(colonIdx + 1))
      actions.push({ type, data })
    } catch {}
    return ''
  })
  // eski [NAV:x] formatını da destekle
  const navClean = clean.replace(/\[NAV:(\w+)\]/g, (_, tab) => {
    actions.push({ type: 'nav', sub: tab, data: null })
    return ''
  })
  return { cleanText: navClean.trim(), actions }
}
```

- [ ] Commit: `feat: add ACTION tag parser to PersonalCoach`

### A2 — ACTION handler: gerçek app mutasyonları

- [ ] `PersonalCoach.jsx` dosyasında `useApp()` hook'unun destructure satırını bul ve şunları ekle:

```javascript
const { profile, goals, foods, exercises, exArchive, body, streak, calArch,
        todayKey, totalXP, setActiveTab,
        saveFoods, saveExercises, saveGoals, showToast, genId } = useApp()
```

- [ ] Mesaj gönderme akışında (Gemini yanıtı alındıktan sonra, state'e eklemeden önce) `parseActions` çağrısını ekle:

```javascript
// Gemini yanıtını işle
const { cleanText, actions } = parseActions(raw)

// Aksiyonları uygula
for (const action of actions) {
  if (action.type === 'nav' && action.sub) {
    setActiveTab(action.sub)
  } else if (action.type === 'add_food' && action.data) {
    const gram = action.data.gram || 100
    const scale = gram / 100
    const newFood = {
      id: genId(),
      name: action.data.name,
      kcal: Math.round((action.data.kcal || 0) * scale),
      protein: Math.round((action.data.protein || 0) * scale),
      fat: Math.round((action.data.fat || 0) * scale),
      carb: Math.round((action.data.carb || 0) * scale),
      gram,
    }
    saveFoods([...foods, newFood])
    showToast(`✅ ${newFood.name} (${gram}g) bugüne eklendi`)
  } else if (action.type === 'add_exercise' && action.data) {
    const newEx = {
      id: genId(),
      name: action.data.name,
      sets: Array.from({ length: action.data.sets || 3 }, (_, i) => ({
        id: genId(), reps: action.data.reps || '8', weight: action.data.weight || 0, done: false,
      })),
    }
    saveExercises([...exercises, newEx])
    showToast(`💪 ${newEx.name} antrenmanına eklendi`)
  } else if (action.type === 'set_goal' && action.data) {
    saveGoals({ ...goals, ...action.data })
    showToast('🎯 Makro hedefler güncellendi')
  }
}

// Temiz metni mesaj olarak ekle
setMessages(prev => [...prev, { role: 'assistant', text: cleanText, actions }])
```

- [ ] Commit: `feat: PersonalCoach executes ACTION tags (add food, exercise, set goal, nav)`

### A3 — System prompt güçlendirmesi (tüm 4 persona)

- [ ] `PERSONAS` dizisini bul, her `systemPrompt` alanını aşağıdaki güçlendirilmiş versiyonla güncelle. Örnek `balanced` persona için:

```javascript
systemPrompt: `Sen FitTrack Kişisel Koçusun — kullanıcının tüm fitness verilerine erişimin var ve hem konuşarak hem de doğrudan uygulamaya aksiyon uygulayarak yardım edersin.

KAPSAM: Sadece fitness, antrenman, beslenme, toparlanma, vücut kompozisyonu ve sağlıklı yaşam. Bunun dışında "Bu konuda yardımcı olamam, ama antrenman hedefin hakkında konuşalım!" de.

DİL: Türkçe. Samimi, motive edici, kişiselleştirilmiş.

YETKİLERİN:
1. Sayfaya yönlendirme: [ACTION:nav:calorie], [ACTION:nav:today], [ACTION:nav:progress], [ACTION:nav:goals], [ACTION:nav:exercises], [ACTION:nav:trainer]
2. Yemek ekleme (kullanıcı onayı olmadan sadece açıkça isterse): [ACTION:add_food:{"name":"Tavuk Göğsü","kcal":165,"protein":31,"fat":4,"carb":0,"gram":150}]
3. Egzersiz ekleme (kullanıcı açıkça isterse): [ACTION:add_exercise:{"name":"Bench Press","sets":4,"reps":"8-10","weight":80}]
4. Makro hedef güncelleme (kullanıcı açıkça isterse): [ACTION:set_goal:{"kcal":2200,"protein":160}]

KURALLAR:
- Aksiyonları sadece kullanıcı açıkça "ekle", "kaydet", "güncelle" dediğinde kullan
- Öneri verirken aksiyon kullanma — sadece açık istek varsa
- Her mesajda en fazla 2 aksiyon etiketi
- Yanıtlarını asla yarıda kesme
- Kullanıcının mevcut verileriyle (ağırlık, hedef, geçmiş antrenmanlar) bağlantı kur`,
```

- [ ] Aynı güçlendirilmiş yapıyı diğer 3 persona (`philosopher`, `drill`, `analytical`) için de uygula — her birinin mevcut kişilik tonunu koru, sadece YETKİLERİN ve KURALLAR bölümlerini ekle.

- [ ] Commit: `feat: upgrade all 4 PersonalCoach personas with action capabilities`

### A4 — Aksiyon konfirmasyon UI

- [ ] Mesaj balonunda aksiyonlar gösterilsin. Mevcut `[NAV:]` butonu render eden JSX bloğunu bul ve şu şekilde genişlet:

```jsx
{/* Aksiyon bildirimleri */}
{msg.actions && msg.actions.filter(a => a.type !== 'nav').map((action, i) => (
  <div key={i} style={{
    marginTop: 8, padding: '6px 10px',
    background: 'rgba(var(--accent-rgb), 0.12)',
    borderRadius: 8, fontSize: 12,
    color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6,
  }}>
    {action.type === 'add_food' && `✅ ${action.data?.name} eklendi`}
    {action.type === 'add_exercise' && `💪 ${action.data?.name} eklendi`}
    {action.type === 'set_goal' && '🎯 Hedefler güncellendi'}
  </div>
))}
```

- [ ] Commit: `feat: show action confirmation badges in PersonalCoach chat`

---

## TASK B: Hareketler — Fotoğraf + Tüm Egzersizler için Form Detayı

**Files:**
- Modify: `src/components/pages/Exercises.jsx`

### B1 — Her egzersiz için Unsplash fotoğrafı

- [ ] `Exercises.jsx` dosyasında `MUSCLE_GROUPS` dizisini bul (~satır 104). Her egzersiz string'ini bir objeye dönüştür:

```javascript
// ESKİ:
{ id: 'chest', label: 'Göğüs', color: '#ef4444', exercises: ['Bench Press', 'İncline Bench Press', ...] }

// YENİ:
{ id: 'chest', label: 'Göğüs', color: '#ef4444', exercises: [
  { name: 'Bench Press',       photo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { name: 'İncline Bench Press', photo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
  ...
]}
```

- [ ] Tüm 92 egzersiz için aşağıdaki fotoğraf URL'lerini kullan (kas grubuna göre Unsplash arama terimi `w=400&q=80` ile):

**Göğüs (chest):**
```
Bench Press           → photo-1571019614242-c5c5dee9f50b
İncline Bench Press   → photo-1534438327276-14e5300c3a48
Decline Bench Press   → photo-1581009146145-b5ef050c2e1e
Dumbbell Flye         → photo-1590487988256-9ed24133863e
Cable Crossover       → photo-1517838277536-f5f99be501cd
Push-Up               → photo-1598971457999-ca4ef48a9a71
Dips (Chest)          → photo-1583454110551-21f2fa2afe61
```

**Sırt (back):**
```
Deadlift              → photo-1517963879433-6ad2b056d712
Barbell Row           → photo-1566241142559-40e1dab266c6
Pull-Up               → photo-1598266663619-a73f22e3d1c7
Lat Pulldown          → photo-1534438097545-a2c22c57f2ad
Seated Cable Row      → photo-1571019613454-1cb2f99b2d8b
T-Bar Row             → photo-1541534741688-6078c6bfb5c5
Dumbbell Row          → photo-1581009146145-b5ef050c2e1e
```

**Omuz (shoulders):**
```
Overhead Press        → photo-1581009137042-c552e485697a
Lateral Raise         → photo-1583454110551-21f2fa2afe61
Front Raise           → photo-1583454155184-870a1f63aebc
Rear Delt Flye        → photo-1534368786749-b63e05c90863
Arnold Press          → photo-1517838277536-f5f99be501cd
Upright Row           → photo-1581009146145-b5ef050c2e1e
```

**Kollar (arms):**
```
Barbell Curl          → photo-1581009137042-c552e485697a
Hammer Curl           → photo-1590487988256-9ed24133863e
EZ Bar Curl           → photo-1571019614242-c5c5dee9f50b
Tricep Pushdown       → photo-1517963879433-6ad2b056d712
Skull Crusher         → photo-1534438327276-14e5300c3a48
Overhead Tricep Ext   → photo-1566241142559-40e1dab266c6
Dips (Tricep)         → photo-1598266663619-a73f22e3d1c7
Concentration Curl    → photo-1583454110551-21f2fa2afe61
```

**Bacak (legs):**
```
Squat                 → photo-1520334363668-72a9d89e04e3
Leg Press             → photo-1434682881908-b43d0467b798
Romanian Deadlift     → photo-1517963879433-6ad2b056d712
Leg Curl              → photo-1571019613454-1cb2f99b2d8b
Leg Extension         → photo-1534368786749-b63e05c90863
Calf Raise            → photo-1581009137042-c552e485697a
Lunge                 → photo-1434682881908-b43d0467b798
Hip Thrust            → photo-1571019614242-c5c5dee9f50b
Bulgarian Split       → photo-1520334363668-72a9d89e04e3
```

**Core:**
```
Plank                 → photo-1598971457999-ca4ef48a9a71
Crunch                → photo-1571019613454-1cb2f99b2d8b
Russian Twist         → photo-1583454155184-870a1f63aebc
Leg Raise             → photo-1534438097545-a2c22c57f2ad
Ab Wheel              → photo-1541534741688-6078c6bfb5c5
Cable Crunch          → photo-1517838277536-f5f99be501cd
Side Plank            → photo-1598971457999-ca4ef48a9a71
```

**Kardiyo (cardio):**
```
Koşu Bandı            → photo-1538805060514-97d9cc17730c
Bisiklet              → photo-1591741535018-8b1d9bfdc25a
Kürek Makinesi        → photo-1517838277536-f5f99be501cd
Jump Rope             → photo-1554284126-aa88f22d8b74
Burpee                → photo-1571019614242-c5c5dee9f50b
Mountain Climber      → photo-1598971457999-ca4ef48a9a71
Box Jump              → photo-1520334363668-72a9d89e04e3
```

- [ ] `ExerciseCard` bileşenini güncelle — `ex` prop artık obje:

```jsx
function ExerciseCard({ ex, group, onClick }) {
  const cardRef = useRef(null)
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }
  return (
    <div ref={cardRef} onClick={onClick} className="glass-card" onMouseMove={handleMouseMove}>
      {/* Fotoğraf thumbnail */}
      <div style={{
        width: 52, height: 52, borderRadius: 12, overflow: 'hidden',
        flexShrink: 0, background: 'var(--surface2)',
      }}>
        <img
          src={ex.photo}
          alt={ex.name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none' }}
        />
      </div>
      {/* İsim ve kas grubu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{ex.name}</div>
        <div style={{ fontSize: 12, color: group.color, marginTop: 2 }}>{group.label}</div>
      </div>
      {/* Ok ikonu */}
      <div style={{ color: 'var(--text-muted)', fontSize: 16 }}>›</div>
    </div>
  )
}
```

- [ ] `exercises.map(ex => ...)` gibi string'e bağlı tüm yerleri `ex.name` kullanacak şekilde güncelle. `getForm(ex.name)` çağrılarını kontrol et.

- [ ] Commit: `feat: add exercise photos to all 92 exercises in Exercises page`

### B2 — Tüm egzersizler için form detayı

- [ ] `EXERCISE_FORMS` objesini genişlet. Mevcut 13 egzersizin yanına kalan tüm egzersizleri ekle. Her biri `{ start, move, breath, mistakes[], tip }` formatında:

```javascript
// Örnek format — tüm egzersizler için aynı yapı
'Squat': {
  start: 'Ayaklar omuz genişliğinde aç, ayak uçları hafifçe dışa bak. Bar trapeziusun üst kısmına, omuzların arkasına otur. Göğüs açık, sırt düz, nefes al.',
  move: '1) Kalçanı arkaya ve aşağıya it, sanki bir sandalyeye oturuyorsun. 2) Diz uçların ayak uçlarının yönünde kalsın. 3) Paralelin altına kadar in (uyluğun yere paralel). 4) Topuklardan iterek yukarı çık.',
  breath: 'İnerken derin nefes al ve karın içi basıncını koru (Valsalva), çıkarken güçlü nefes ver.',
  mistakes: ['Topukları yerden kaldırmak', 'Dizlerin içe çökmesi (valgus)', 'Sırtı yuvarlama', 'Çok erken öne eğilme'],
  tip: '"Yere çukur kaz" hissiyle ayaklarını yere bas — bu kalça ve hamstring aktivasyonunu artırır.',
},
'Pull-Up': {
  start: 'Barı omuz genişliğinden biraz daha geniş, overhand (avuç öne) tut. Kollar tam uzanmış, omuz küreklerini hafifçe aşağı çek.',
  move: '1) Kürek kemiklerini birbirine yaklaştır ve aşağı çek. 2) Dirseğini bükek, çeneni barın üstüne getir. 3) Kontrollü indir, tam uzanmaya geri dön.',
  breath: 'Çıkarken nefes ver, inerken nefes al.',
  mistakes: ['Sallanmak / momentum kullanmak', 'Tam uzanmamak', 'Boynu öne uzatmak'],
  tip: 'İlk hareketi kollarla değil küreklerle başlat — bu lat aktivasyonunu %30 artırır.',
},
'Deadlift': {
  start: 'Ayaklar kalça genişliğinde, bar bacaklarına yakın (şin üstünde). Kalçanı arkaya it, sırt düz, göğüs açık. Overhand veya mixed kavrama, omuz altında.',
  move: '1) Yeri iterek kalk, bar bacaklarına sürtünür gibi yukarı kayar. 2) Kalça ve diz aynı anda açılır. 3) Dik konuma gel, kalçayı sıkıştır. 4) Kalçayı arkaya iterek kontrollü indir.',
  breath: 'Kalkıştan önce derin nefes al ve koru, yukarıda nefes ver.',
  mistakes: ['Sırtı yuvarlama', 'Bar vücuttan uzaklaşmak', 'Kolları bükmek', 'Kalçayı çok erken açmak (squat morning)'],
  tip: 'Bar zemin terk etmeden önce "slack çek" — barı yukarı çekme hissi yap, yavaşça gerginleştir. Bu sırt düzlüğünü korur.',
},
```

- [ ] Geri kalan tüm 79 egzersiz için benzer detay ekle (sadece `DEFAULT_FORM` düşmeyecek şekilde, tüm liste kapsansın).

- [ ] Modal'da fotoğraf ekle — modal header'ına egzersizin fotoğrafını ekle:

```jsx
{/* Modal içinde — egzersiz adının üstüne */}
<div style={{
  width: '100%', height: 200, overflow: 'hidden',
  borderRadius: '24px 24px 0 0', position: 'relative',
}}>
  <img
    src={selectedEx?.photo}
    alt={selectedEx?.name}
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    onError={e => { e.target.parentElement.style.display = 'none' }}
  />
  <div style={{
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, transparent 40%, var(--surface) 100%)',
  }}/>
</div>
```

- [ ] Commit: `feat: add detailed form instructions for all exercises with photos in modal`

---

## TASK C: Kalori Veritabanı Genişletme

**Files:**
- Modify: `src/components/pages/Calorie.jsx`

### C1 — FOOD_DB genişletme (~200 yemek)

- [ ] `Calorie.jsx` dosyasında `FOOD_DB` array'ini (satır 10-68) aşağıdaki genişletilmiş versiyonla değiştir. Mevcut 59 yemeği koru, yeni kategoriler ve yemekler ekle:

```javascript
const FOOD_DB = [
  // ── Et & Tavuk (mevcut + yeni) ──
  { cat:'🍖 Et & Tavuk', name:'Tavuk Göğsü (Haşlama)',    kcal:165, protein:31, fat:4,  carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Tavuk But (Izgara)',         kcal:220, protein:27, fat:12, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Kıyma (Dana)',                kcal:250, protein:26, fat:17, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Köfte (Dana, 100g)',          kcal:280, protein:24, fat:19, carb:4  },
  { cat:'🍖 Et & Tavuk', name:'Döner Kebap (100g)',          kcal:320, protein:22, fat:24, carb:4  },
  { cat:'🍖 Et & Tavuk', name:'Adana Kebap (100g)',          kcal:290, protein:23, fat:21, carb:2  },
  { cat:'🍖 Et & Tavuk', name:'Tavuk Kanat (Izgara)',        kcal:240, protein:25, fat:15, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Hindi Göğsü',                kcal:135, protein:29, fat:1,  carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Kuzu But (Fırın)',            kcal:295, protein:25, fat:21, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Tavuk Şiş (100g)',           kcal:185, protein:28, fat:8,  carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Izgara Dana Biftek (100g)',  kcal:271, protein:26, fat:18, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Sucuk (1 dilim, 30g)',       kcal:120, protein:6,  fat:11, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Pastırma (30g)',              kcal:75,  protein:12, fat:3,  carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Tavuk Burger (1 adet)',       kcal:380, protein:32, fat:16, carb:28 },
  { cat:'🍖 Et & Tavuk', name:'Dana Burger (1 adet)',        kcal:450, protein:28, fat:26, carb:30 },
  { cat:'🍖 Et & Tavuk', name:'Tavuk Sote (100g)',           kcal:195, protein:26, fat:9,  carb:4  },
  { cat:'🍖 Et & Tavuk', name:'Piliç Çevirme (100g)',       kcal:210, protein:27, fat:11, carb:0  },

  // ── Balık & Deniz Ürünleri (mevcut + yeni) ──
  { cat:'🐟 Balık & Deniz', name:'Somon (Izgara, 100g)',    kcal:208, protein:20, fat:13, carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Levrek (Izgara)',          kcal:124, protein:24, fat:3,  carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Hamsi (Tava, 100g)',       kcal:190, protein:18, fat:12, carb:2  },
  { cat:'🐟 Balık & Deniz', name:'Ton Balığı (Konserve)',    kcal:130, protein:29, fat:1,  carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Karides (Haşlama)',        kcal:99,  protein:24, fat:1,  carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Çupra (Fırın)',            kcal:128, protein:26, fat:3,  carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Alabalık (Izgara)',        kcal:148, protein:22, fat:6,  carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Palamut (Izgara)',         kcal:200, protein:23, fat:12, carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Sardalya (Konserve, 100g)',kcal:208, protein:25, fat:11, carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Midye (100g)',             kcal:86,  protein:12, fat:2,  carb:4  },
  { cat:'🐟 Balık & Deniz', name:'Kalamar (Izgara)',         kcal:92,  protein:16, fat:1,  carb:3  },
  { cat:'🐟 Balık & Deniz', name:'Ringa Balığı (100g)',      kcal:158, protein:18, fat:9,  carb:0  },

  // ── Çorbalar (mevcut + yeni) ──
  { cat:'🍲 Çorbalar', name:'Mercimek Çorbası (1 kase)',     kcal:180, protein:10, fat:5,  carb:25 },
  { cat:'🍲 Çorbalar', name:'Ezogelin Çorbası (1 kase)',     kcal:160, protein:8,  fat:4,  carb:26 },
  { cat:'🍲 Çorbalar', name:'Yayla Çorbası (1 kase)',        kcal:130, protein:7,  fat:5,  carb:15 },
  { cat:'🍲 Çorbalar', name:'Tavuk Suyu Çorbası',            kcal:90,  protein:6,  fat:3,  carb:10 },
  { cat:'🍲 Çorbalar', name:'Domates Çorbası',               kcal:100, protein:3,  fat:3,  carb:16 },
  { cat:'🍲 Çorbalar', name:'İşkembe Çorbası (1 kase)',      kcal:150, protein:9,  fat:7,  carb:12 },
  { cat:'🍲 Çorbalar', name:'Tarhana Çorbası (1 kase)',      kcal:140, protein:6,  fat:3,  carb:22 },
  { cat:'🍲 Çorbalar', name:'Şehriye Çorbası (1 kase)',      kcal:120, protein:4,  fat:3,  carb:20 },
  { cat:'🍲 Çorbalar', name:'Sebze Çorbası (1 kase)',        kcal:80,  protein:3,  fat:2,  carb:13 },

  // ── Pilav & Makarna (mevcut + yeni) ──
  { cat:'🍚 Pilav & Makarna', name:'Pirinç Pilavı (1P)',     kcal:250, protein:5,  fat:6,  carb:44 },
  { cat:'🍚 Pilav & Makarna', name:'Bulgur Pilavı (1P)',     kcal:220, protein:7,  fat:4,  carb:42 },
  { cat:'🍚 Pilav & Makarna', name:'Makarna (Haşlama,100g)', kcal:158, protein:6,  fat:1,  carb:31 },
  { cat:'🍚 Pilav & Makarna', name:'Makarna (Bolonez, 1P)',  kcal:380, protein:18, fat:12, carb:48 },
  { cat:'🍚 Pilav & Makarna', name:'Tam Buğday Makarna (100g)',kcal:148,protein:7, fat:1,  carb:29 },
  { cat:'🍚 Pilav & Makarna', name:'Kuskus (100g)',           kcal:176, protein:6,  fat:1,  carb:36 },
  { cat:'🍚 Pilav & Makarna', name:'Quinoa (100g)',           kcal:368, protein:14, fat:6,  carb:64 },
  { cat:'🍚 Pilav & Makarna', name:'Yulaf (100g)',            kcal:389, protein:17, fat:7,  carb:66 },
  { cat:'🍚 Pilav & Makarna', name:'Arpa Şehriye Pilavı (1P)',kcal:230, protein:6,  fat:5,  carb:43 },
  { cat:'🍚 Pilav & Makarna', name:'Fırın Makarna (1P)',      kcal:420, protein:20, fat:18, carb:50 },

  // ── Sebze & Bakliyat (mevcut + yeni) ──
  { cat:'🥗 Sebze & Bakliyat', name:'Mercimek (100g)',       kcal:116, protein:9,  fat:0,  carb:20 },
  { cat:'🥗 Sebze & Bakliyat', name:'Nohut (100g)',          kcal:164, protein:9,  fat:3,  carb:27 },
  { cat:'🥗 Sebze & Bakliyat', name:'Kuru Fasulye (1P)',     kcal:200, protein:13, fat:2,  carb:35 },
  { cat:'🥗 Sebze & Bakliyat', name:'Zeytinyağlı Fasulye',  kcal:180, protein:6,  fat:8,  carb:22 },
  { cat:'🥗 Sebze & Bakliyat', name:'İmam Bayıldı (1P)',     kcal:220, protein:3,  fat:14, carb:22 },
  { cat:'🥗 Sebze & Bakliyat', name:'Salata (Büyük)',        kcal:80,  protein:2,  fat:4,  carb:10 },
  { cat:'🥗 Sebze & Bakliyat', name:'Edamame (100g)',        kcal:121, protein:11, fat:5,  carb:9  },
  { cat:'🥗 Sebze & Bakliyat', name:'Brokoli (100g)',        kcal:34,  protein:3,  fat:0,  carb:7  },
  { cat:'🥗 Sebze & Bakliyat', name:'Ispanak (100g)',        kcal:23,  protein:3,  fat:0,  carb:4  },
  { cat:'🥗 Sebze & Bakliyat', name:'Taze Fasulye (100g)',   kcal:31,  protein:2,  fat:0,  carb:7  },
  { cat:'🥗 Sebze & Bakliyat', name:'Havuç (100g)',          kcal:41,  protein:1,  fat:0,  carb:10 },
  { cat:'🥗 Sebze & Bakliyat', name:'Patates (Haşlama,100g)',kcal:87,  protein:2,  fat:0,  carb:20 },
  { cat:'🥗 Sebze & Bakliyat', name:'Tatlı Patates (100g)', kcal:86,  protein:2,  fat:0,  carb:20 },
  { cat:'🥗 Sebze & Bakliyat', name:'Avokado (100g)',        kcal:160, protein:2,  fat:15, carb:9  },
  { cat:'🥗 Sebze & Bakliyat', name:'Domates (100g)',        kcal:18,  protein:1,  fat:0,  carb:4  },
  { cat:'🥗 Sebze & Bakliyat', name:'Kabak (100g)',          kcal:17,  protein:1,  fat:0,  carb:3  },
  { cat:'🥗 Sebze & Bakliyat', name:'Salatalık (100g)',      kcal:15,  protein:1,  fat:0,  carb:4  },
  { cat:'🥗 Sebze & Bakliyat', name:'Biber (Yeşil, 100g)',  kcal:20,  protein:1,  fat:0,  carb:5  },
  { cat:'🥗 Sebze & Bakliyat', name:'Kırmızı Fasulye (100g)',kcal:127, protein:9, fat:1,  carb:23 },

  // ── Börek & Hamur İşleri (mevcut + yeni) ──
  { cat:'🥐 Börek & Hamur', name:'Su Böreği (1 dilim)',      kcal:280, protein:10, fat:14, carb:30 },
  { cat:'🥐 Börek & Hamur', name:'Peynirli Börek (1)',       kcal:220, protein:8,  fat:12, carb:22 },
  { cat:'🥐 Börek & Hamur', name:'Simit (1 adet)',           kcal:280, protein:8,  fat:4,  carb:56 },
  { cat:'🥐 Börek & Hamur', name:'Poğaça (Peynirli)',        kcal:300, protein:9,  fat:15, carb:34 },
  { cat:'🥐 Börek & Hamur', name:'Tam Buğday Ekmeği (1)',    kcal:80,  protein:3,  fat:1,  carb:16 },
  { cat:'🥐 Börek & Hamur', name:'Beyaz Ekmek (1 dilim)',    kcal:90,  protein:3,  fat:1,  carb:18 },
  { cat:'🥐 Börek & Hamur', name:'Pide (100g)',              kcal:265, protein:9,  fat:3,  carb:52 },
  { cat:'🥐 Börek & Hamur', name:'Lahmacun (1 adet)',        kcal:250, protein:12, fat:8,  carb:35 },
  { cat:'🥐 Börek & Hamur', name:'Gözleme (Peynirli)',       kcal:320, protein:12, fat:14, carb:38 },
  { cat:'🥐 Börek & Hamur', name:'Pizza (Margarita, 1 dilim)',kcal:266,protein:11, fat:10, carb:33 },
  { cat:'🥐 Börek & Hamur', name:'Bazlama (1 adet)',         kcal:200, protein:6,  fat:3,  carb:40 },
  { cat:'🥐 Börek & Hamur', name:'Açma (1 adet)',            kcal:290, protein:8,  fat:12, carb:38 },
  { cat:'🥐 Börek & Hamur', name:'Kruvasan (1 adet)',        kcal:272, protein:5,  fat:14, carb:31 },

  // ── Süt & Yumurta (mevcut + yeni) ──
  { cat:'🥛 Süt & Yumurta', name:'Yumurta (1, haşlama)',     kcal:78,  protein:6,  fat:5,  carb:1  },
  { cat:'🥛 Süt & Yumurta', name:'Sahanda Yumurta (2)',      kcal:185, protein:12, fat:15, carb:1  },
  { cat:'🥛 Süt & Yumurta', name:'Menemen (1P)',              kcal:220, protein:12, fat:14, carb:12 },
  { cat:'🥛 Süt & Yumurta', name:'Omlet (2 yumurtalı)',      kcal:200, protein:14, fat:15, carb:2  },
  { cat:'🥛 Süt & Yumurta', name:'Süt (200ml)',              kcal:122, protein:6,  fat:7,  carb:10 },
  { cat:'🥛 Süt & Yumurta', name:'Yoğurt (150g)',            kcal:90,  protein:8,  fat:3,  carb:8  },
  { cat:'🥛 Süt & Yumurta', name:'Beyaz Peynir (50g)',       kcal:135, protein:8,  fat:11, carb:1  },
  { cat:'🥛 Süt & Yumurta', name:'Kaşar Peyniri (30g)',      kcal:110, protein:7,  fat:9,  carb:0  },
  { cat:'🥛 Süt & Yumurta', name:'Süzme Yoğurt (100g)',      kcal:97,  protein:9,  fat:5,  carb:4  },
  { cat:'🥛 Süt & Yumurta', name:'Kefir (200ml)',            kcal:104, protein:7,  fat:5,  carb:9  },
  { cat:'🥛 Süt & Yumurta', name:'Labne (50g)',              kcal:80,  protein:5,  fat:6,  carb:1  },
  { cat:'🥛 Süt & Yumurta', name:'Tam Yağlı Süt (200ml)',   kcal:136, protein:7,  fat:8,  carb:10 },
  { cat:'🥛 Süt & Yumurta', name:'Cottage Cheese (100g)',    kcal:98,  protein:11, fat:4,  carb:3  },
  { cat:'🥛 Süt & Yumurta', name:'Lor Peyniri (100g)',       kcal:105, protein:12, fat:4,  carb:4  },

  // ── Meyveler (mevcut + yeni) ──
  { cat:'🍎 Meyveler', name:'Elma (1 orta boy)',              kcal:80,  protein:0,  fat:0,  carb:21 },
  { cat:'🍎 Meyveler', name:'Muz (1 orta boy)',               kcal:105, protein:1,  fat:0,  carb:27 },
  { cat:'🍎 Meyveler', name:'Portakal (1 orta boy)',          kcal:62,  protein:1,  fat:0,  carb:15 },
  { cat:'🍎 Meyveler', name:'Çilek (100g)',                   kcal:32,  protein:1,  fat:0,  carb:8  },
  { cat:'🍎 Meyveler', name:'Karpuz (300g)',                  kcal:90,  protein:2,  fat:0,  carb:22 },
  { cat:'🍎 Meyveler', name:'Üzüm (100g)',                   kcal:69,  protein:1,  fat:0,  carb:18 },
  { cat:'🍎 Meyveler', name:'Armut (1 orta boy)',             kcal:102, protein:1,  fat:0,  carb:27 },
  { cat:'🍎 Meyveler', name:'Kiraz (100g)',                   kcal:63,  protein:1,  fat:0,  carb:16 },
  { cat:'🍎 Meyveler', name:'Kayısı (2 adet)',                kcal:34,  protein:1,  fat:0,  carb:8  },
  { cat:'🍎 Meyveler', name:'Şeftali (1 orta boy)',           kcal:59,  protein:1,  fat:0,  carb:14 },
  { cat:'🍎 Meyveler', name:'Kivi (1 adet)',                  kcal:61,  protein:1,  fat:1,  carb:15 },
  { cat:'🍎 Meyveler', name:'Ananas (100g)',                  kcal:50,  protein:1,  fat:0,  carb:13 },
  { cat:'🍎 Meyveler', name:'Kavun (200g)',                   kcal:68,  protein:2,  fat:0,  carb:16 },
  { cat:'🍎 Meyveler', name:'Erik (3 adet)',                  kcal:69,  protein:1,  fat:0,  carb:18 },

  // ── Atıştırmalık (mevcut + yeni) ──
  { cat:'🍫 Atıştırmalık', name:'Baklava (1 dilim)',          kcal:350, protein:5,  fat:18, carb:44 },
  { cat:'🍫 Atıştırmalık', name:'Çikolata (Sütlü,30g)',      kcal:160, protein:2,  fat:9,  carb:19 },
  { cat:'🍫 Atıştırmalık', name:'Ceviz (30g)',                kcal:196, protein:5,  fat:20, carb:4  },
  { cat:'🍫 Atıştırmalık', name:'Badem (30g)',                kcal:173, protein:6,  fat:15, carb:6  },
  { cat:'🍫 Atıştırmalık', name:'Fıstık Ezmesi (30g)',       kcal:188, protein:8,  fat:16, carb:6  },
  { cat:'🍫 Atıştırmalık', name:'Bitter Çikolata (30g)',     kcal:155, protein:2,  fat:9,  carb:17 },
  { cat:'🍫 Atıştırmalık', name:'Mısır (Patlamış, 30g)',     kcal:110, protein:4,  fat:1,  carb:22 },
  { cat:'🍫 Atıştırmalık', name:'Granola Bar (1 adet)',       kcal:193, protein:4,  fat:7,  carb:29 },
  { cat:'🍫 Atıştırmalık', name:'Fındık (30g)',               kcal:188, protein:4,  fat:18, carb:5  },
  { cat:'🍫 Atıştırmalık', name:'Kaju (30g)',                 kcal:163, protein:5,  fat:13, carb:9  },
  { cat:'🍫 Atıştırmalık', name:'Kuru Üzüm (30g)',           kcal:90,  protein:1,  fat:0,  carb:24 },
  { cat:'🍫 Atıştırmalık', name:'Hurma (2 adet)',             kcal:133, protein:1,  fat:0,  carb:36 },
  { cat:'🍫 Atıştırmalık', name:'Pirinç Keki (1 adet)',      kcal:35,  protein:1,  fat:0,  carb:7  },
  { cat:'🍫 Atıştırmalık', name:'Protein Bar (1 adet)',       kcal:200, protein:20, fat:7,  carb:20 },

  // ── İçecekler (mevcut + yeni) ──
  { cat:'☕ İçecekler', name:'Türk Kahvesi (şekersiz)',        kcal:5,   protein:0,  fat:0,  carb:1  },
  { cat:'☕ İçecekler', name:'Çay (şekersiz)',                kcal:2,   protein:0,  fat:0,  carb:0  },
  { cat:'☕ İçecekler', name:'Ayran (200ml)',                  kcal:60,  protein:3,  fat:3,  carb:5  },
  { cat:'☕ İçecekler', name:'Protein Shake (1 ölçek)',        kcal:120, protein:25, fat:2,  carb:5  },
  { cat:'☕ İçecekler', name:'Americano (grande)',             kcal:15,  protein:1,  fat:0,  carb:3  },
  { cat:'☕ İçecekler', name:'Latte (grande, tam yağlı)',     kcal:220, protein:12, fat:11, carb:19 },
  { cat:'☕ İçecekler', name:'Meyve Suyu (200ml)',            kcal:90,  protein:1,  fat:0,  carb:22 },
  { cat:'☕ İçecekler', name:'Enerji İçeceği (250ml)',        kcal:110, protein:1,  fat:0,  carb:28 },
  { cat:'☕ İçecekler', name:'Yeşil Çay (şekersiz)',          kcal:2,   protein:0,  fat:0,  carb:0  },
  { cat:'☕ İçecekler', name:'Süt + Muz Smoothie (300ml)',    kcal:250, protein:8,  fat:4,  carb:45 },
  { cat:'☕ İçecekler', name:'Whey Protein (1 ölçek, 30g)',  kcal:120, protein:24, fat:2,  carb:3  },

  // ── YENİ KATEGORİ: Kahvaltılık ──
  { cat:'🍳 Kahvaltılık', name:'Kaşarlı Tost (2 dilim)',      kcal:310, protein:14, fat:14, carb:32 },
  { cat:'🍳 Kahvaltılık', name:'Peynirli Tost (2 dilim)',     kcal:280, protein:12, fat:11, carb:32 },
  { cat:'🍳 Kahvaltılık', name:'Nutella (30g)',                kcal:159, protein:2,  fat:9,  carb:19 },
  { cat:'🍳 Kahvaltılık', name:'Bal (1 çorba kaşığı)',        kcal:64,  protein:0,  fat:0,  carb:17 },
  { cat:'🍳 Kahvaltılık', name:'Reçel (1 çorba kaşığı)',      kcal:56,  protein:0,  fat:0,  carb:14 },
  { cat:'🍳 Kahvaltılık', name:'Zeytin (10 adet)',            kcal:70,  protein:1,  fat:7,  carb:2  },
  { cat:'🍳 Kahvaltılık', name:'Domates & Salatalık (100g)', kcal:20,  protein:1,  fat:0,  carb:4  },
  { cat:'🍳 Kahvaltılık', name:'Kahvaltı Tabağı (orta)',     kcal:550, protein:22, fat:28, carb:52 },
  { cat:'🍳 Kahvaltılık', name:'Tahıllı Mısır Gevreği (40g)',kcal:150, protein:3,  fat:1,  carb:34 },
  { cat:'🍳 Kahvaltılık', name:'Yulaf Ezmesi (40g, sütle)',  kcal:250, protein:10, fat:6,  carb:38 },

  // ── YENİ KATEGORİ: Fast Food ──
  { cat:'🍔 Fast Food', name:'Big Mac (1 adet)',               kcal:563, protein:26, fat:33, carb:46 },
  { cat:'🍔 Fast Food', name:'Cheeseburger (1 adet)',          kcal:303, protein:15, fat:13, carb:33 },
  { cat:'🍔 Fast Food', name:'Patates Kızartması (orta)',      kcal:365, protein:4,  fat:17, carb:48 },
  { cat:'🍔 Fast Food', name:'Döner Dürüm (1 adet)',           kcal:480, protein:28, fat:18, carb:52 },
  { cat:'🍔 Fast Food', name:'Chicken McNuggets (6)',          kcal:270, protein:15, fat:16, carb:17 },
  { cat:'🍔 Fast Food', name:'Hamburger (standart)',           kcal:295, protein:17, fat:14, carb:27 },
  { cat:'🍔 Fast Food', name:'Hotdog (1 adet)',                kcal:290, protein:12, fat:17, carb:24 },
  { cat:'🍔 Fast Food', name:'Shawarma (100g)',                kcal:310, protein:22, fat:18, carb:16 },

  // ── YENİ KATEGORİ: Spor Beslenmesi ──
  { cat:'💊 Spor Beslenmesi', name:'Creatine (5g)',             kcal:0,   protein:0,  fat:0,  carb:0  },
  { cat:'💊 Spor Beslenmesi', name:'BCAA (10g)',                kcal:40,  protein:10, fat:0,  carb:0  },
  { cat:'💊 Spor Beslenmesi', name:'Mass Gainer (100g)',       kcal:380, protein:20, fat:5,  carb:65 },
  { cat:'💊 Spor Beslenmesi', name:'Pre-Workout (1 ölçek)',    kcal:20,  protein:0,  fat:0,  carb:5  },
  { cat:'💊 Spor Beslenmesi', name:'Whey İzolat (30g)',        kcal:110, protein:27, fat:0,  carb:1  },
  { cat:'💊 Spor Beslenmesi', name:'Kazein Protein (30g)',     kcal:120, protein:24, fat:1,  carb:4  },
  { cat:'💊 Spor Beslenmesi', name:'Yumurta Akı (100ml)',      kcal:52,  protein:11, fat:0,  carb:1  },
  { cat:'💊 Spor Beslenmesi', name:'Pirinç Protein (30g)',     kcal:115, protein:23, fat:2,  carb:5  },
]
```

- [ ] Commit: `feat: expand food database from 59 to ~200 items with 3 new categories`

### C2 — Kategori filtresi güncelle

- [ ] `Calorie.jsx` içinde kategori listesi hesaplayan kodu bul (muhtemelen `[...new Set(FOOD_DB.map(f => f.cat))]` benzeri bir ifade). Yeni kategorilerin otomatik görünmesi için bu kod zaten çalışıyor olmalı — kontrol et, gerekmiyorsa değiştirme.

- [ ] Commit: `fix: verify category filter includes new food categories`

---

## TASK D: Menü Açıklamaları

**Files:**
- Modify: `src/components/BottomNav.jsx`

### D1 — MORE_SECTIONS'a desc alanı ekle

- [ ] `BottomNav.jsx` dosyasında `MORE_SECTIONS` dizisini bul (satır 13-40). Her item'a `desc` alanı ekle:

```javascript
const MORE_SECTIONS = [
  {
    label: 'SPOR',
    items: [
      { id:'trainer',   icon:'dumbbell',  label:'Personal Trainer', desc:'AI destekli kişisel antrenman programı oluştur' },
      { id:'templates', icon:'clipboard', label:'Şablonlar',         desc:'Favori antrenman planlarını kaydet ve tekrar kullan' },
      { id:'history',   icon:'calendar',  label:'Geçmiş',            desc:'Tüm antrenman geçmişine tarih bazlı eriş' },
      { id:'progress',  icon:'chart',     label:'İlerleme',          desc:'Güç artışı, vücut ölçüleri ve streak grafikleri' },
    ],
  },
  {
    label: 'DİYET & AI',
    items: [
      { id:'goals',         icon:'target', label:'Makro Hedefler', desc:'Günlük kalori ve protein/yağ/karbonhidrat hedeflerini ayarla' },
      { id:'aicoach',       icon:'robot',  label:'AI Koçu',         desc:'Antrenman planı ve form videoları için hızlı AI asistanı' },
      { id:'coach',         icon:'star',   label:'Kişisel Koç',     desc:'Seni tanıyan kişiselleştirilmiş koç — 4 farklı kişilik' },
      { id:'foodrecognize', icon:'food',   label:'Yemek Tanıma',    desc:'Fotoğraftan yemeği tanı ve kalori bilgisini otomatik kaydet' },
    ],
  },
  {
    label: 'DİĞER',
    items: [
      { id:'achievements', icon:'award',    label:'Başarılar',       desc:'Kazandığın rozetleri ve XP seviyeni gör' },
      { id:'settings',     icon:'settings', label:'Ayarlar',         desc:'Profil, bildirimler ve uygulama tercihleri' },
      { id:'share',        icon:'share',    label:'Paylaş',          desc:'İlerleme özetini arkadaşlarınla paylaş' },
      { id:'recognize',    icon:'camera',   label:'Egzersiz Tanıma', desc:'Kamera ile egzersizi tanıt, forma önerileri al' },
      { id:'download',     icon:'download', label:'İndir',           desc:'Uygulamayı ana ekrana ekle (PWA)' },
    ],
  },
]
```

- [ ] Menü item render'ını güncelle — desc'i göster:

```jsx
<div key={item.id} onClick={() => handleTab(item.id)} style={{
  display:'flex', alignItems:'flex-start', gap:11,
  padding:'9px 10px', borderRadius:10,
  cursor:'pointer',
  background: active ? 'var(--surface3)' : 'transparent',
  transition:'background .12s',
  userSelect:'none',
}}
onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface2)' }}
onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
>
  <Icon name={item.icon} size={16} color={active ? 'var(--text)' : 'var(--text-muted)'}
    strokeWidth={active ? 2 : 1.6} style={{ marginTop: 2, flexShrink: 0 }}/>
  <div style={{ flex:1, minWidth:0 }}>
    <div style={{
      fontFamily:"'Space Grotesk',sans-serif",
      fontWeight: active ? 600 : 400,
      fontSize:13, color: active ? 'var(--text)' : 'var(--text-dim)',
    }}>
      {item.label}
    </div>
    <div style={{
      fontSize:11, color:'var(--text-muted)',
      marginTop:1, lineHeight:1.3,
    }}>
      {item.desc}
    </div>
  </div>
  {active && <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', flexShrink:0, marginTop:6 }}/>}
</div>
```

- [ ] Panel genişliğini `252px`'den `280px`'e çıkar (desc metni için yer):

```jsx
// Mevcut satır 73:
width:252,
// Yeni:
width:280,
```

- [ ] Commit: `feat: add descriptive tooltips to all menu items in BottomNav`

---

## Bonus Fikirler (Plan dışı, sonraki iterasyon için)

1. **Egzersiz Programı Oluşturucu** — Kullanıcı "Push/Pull/Legs 3 gün" seçince PersonalCoach otomatik haftalık program oluşturup şablona kaydeder.
2. **Akıllı Kalori Önerisi** — Gün sonuna 2 saat kala koç, kalan kalori/protein açığını kapatacak yemek önerir ve tek tıkla ekler.
3. **Form Video Kaydı** — Egzersiz yaparken telefon kamerasıyla form analizi (MediaPipe pose detection).
4. **Arkadaş Rekabeti** — Haftalık streak karşılaştırması için share linki + leaderboard.
5. **Takviye Takibi** — Kreatin, vitamin, protein günlük hatırlatma ve log sistemi.

---

## Doğrulama

Her task sonrası:
```bash
npm run dev
```
- [ ] Tarayıcıda `localhost:5173` aç
- [ ] İlgili sayfayı test et (PersonalCoach / Exercises / Calorie / BottomNav)
- [ ] Konsol hatası yok
- [ ] Mobil görünümü kontrol et (DevTools → telefon boyutu)
