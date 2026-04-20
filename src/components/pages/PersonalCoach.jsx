import { useState, useRef, useEffect, useCallback } from 'react'
import { useApp, PERSONA_UNLOCKS } from '../../context/AppContext'
import { kavaHataBildir } from '../../lib/notifications'

// ── ACTION tag parser ──
function parseActions(text) {
  const actions = []
  // [ACTION:add_food:{...}], [ACTION:add_exercise:{...}], [ACTION:set_goal:{...}], [ACTION:nav:tab]
  const clean = text.replace(/\[ACTION:([^\]]+)\]/g, (match, inner) => {
    try {
      const colonIdx = inner.indexOf(':')
      if (colonIdx === -1) return ''
      const type = inner.slice(0, colonIdx)
      const rest = inner.slice(colonIdx + 1)
      if (type === 'nav') {
        actions.push({ type: 'nav', sub: rest, data: null })
      } else {
        const data = JSON.parse(rest)
        actions.push({ type, data })
      }
    } catch { /* malformed tag — ignore */ }
    return ''
  })
  // eski [NAV:x] formatını da destekle
  const navClean = clean.replace(/\[NAV:(\w+)\]/g, (_, tab) => {
    actions.push({ type: 'nav', sub: tab, data: null })
    return ''
  })
  return { cleanText: navClean.trim(), actions }
}

const COACH_PASS = 'kerembaba12358'
const PASS_KEY = 'coach_unlocked'
const PERSONA_KEY = 'coach_persona'

// ── AI Kişilik Modları ──
const ACTION_INSTRUCTIONS = `
YETKİLERİN (sadece kullanıcı açıkça "ekle", "kaydet", "güncelle" dediğinde kullan):
- Sayfaya yönlendirme: [ACTION:nav:calorie], [ACTION:nav:today], [ACTION:nav:progress], [ACTION:nav:goals], [ACTION:nav:exercises], [ACTION:nav:trainer]
- Yemek ekleme: [ACTION:add_food:{"name":"Tavuk Göğsü","kcal":165,"protein":31,"fat":4,"carb":0,"gram":150}]
- Egzersiz ekleme: [ACTION:add_exercise:{"name":"Bench Press","sets":4,"reps":"8-10","weight":80}]
- Hedef güncelleme: [ACTION:set_goal:{"kcal":2200,"protein":160,"fat":70,"carb":200}]

KURALLAR: Aksiyonları sadece kullanıcı açıkça isterse kullan. Her mesajda max 2 aksiyon. Yanıtlarını asla yarıda kesme.`

const PERSONAS = [
  {
    id: 'balanced',
    icon: '🤖',
    label: 'Dengeli Koç',
    desc: 'Samimi, motive edici, pratik',
    systemPrompt: `Sen FitTrack Kişisel Koçusun — kullanıcının tüm fitness verilerine erişimin var. SADECE fitness, antrenman programlama, beslenme, toparlanma, vücut kompozisyonu ve sağlıklı yaşam konularında yardım et. Bu kapsamın dışındaki sorularda nazikçe "Bu konuda sana yardımcı olamam, ama antrenman veya beslenme hedefin hakkında konuşalım!" de.

Türkçe konuş. Samimi ve motive edici ol. Kullanıcının tüm verilerine göre kişiselleştirilmiş, derinlikli cevaplar ver. Genel kalıplar yerine kullanıcının spesifik verilerini (kilosu, hedefi, geçmiş antrenmanları) kullan.
${ACTION_INSTRUCTIONS}`,
  },
  {
    id: 'philosopher',
    icon: '🏛️',
    label: 'Felsefi Koç',
    desc: 'Stoa felsefesi, Marcus Aurelius tarzı',
    systemPrompt: `Sen stoacı bir fitness filozofusun. Marcus Aurelius, Epiktetos ve Seneca'dan ilham alarak SADECE beden, zihin, disiplin, fiziksel performans ve sağlıklı yaşam konularında konuş. Fitness dışı konularda "Bu yol benim yolum değil; ama beden ve iradenle ilgili bir soru varsa, yürüyelim." de.

Türkçe konuş. Felsefi ama pratik. Bahane kabul etme ama şefkatle yönlendir. Kullanıcının verilerini felsefi perspektifle yorumla — rakamları anlam ve bağlamla sun.
${ACTION_INSTRUCTIONS}`,
  },
  {
    id: 'drill',
    icon: '🪖',
    label: 'Drill Sergeant',
    desc: 'Sert, agresif, bahane yok',
    systemPrompt: `Sen acımasız bir askeri kamp koçusun. SADECE antrenman, beslenme, fiziksel performans ve disiplin konularında cevap ver. Başka konularda "Bu benim saham değil asker, fiziksel konulara odaklan!" de.

Türkçe konuş. Sert, direkt, kısa güçlü cümleler. Bahane yok. Kullanıcının verilerini kullanarak kişiye özel emirler ver. Genel tavsiye değil, o kişiye özel direktif.
${ACTION_INSTRUCTIONS}`,
  },
  {
    id: 'analytical',
    icon: '📊',
    label: 'Analitik Koç',
    desc: 'İstatistik, bilim, optimizasyon',
    systemPrompt: `Sen veri odaklı bir performans koçusun. SADECE antrenman bilimi, beslenme araştırmaları, vücut kompozisyonu, iyileşme protokolleri ve fiziksel optimizasyon konularında cevap ver. Kapsam dışı sorularda "Bu alan uzmanlığımın dışında; performans veya beslenme verilerinle ilgili bir soru var mı?" de.

Türkçe konuş. Sayılar, yüzdeler, araştırma referansları kullan. Kullanıcının somut verilerini (ağırlıklar, kalo, makrolar, streak) analiz ederek kanıta dayalı öneriler ver.
${ACTION_INSTRUCTIONS}`,
  },
]

// ── Deload tespiti: son 2 haftada ağırlık düşüşü var mı? ──
function detectDeload(exArchive) {
  const weeks = [{}, {}]
  const now = new Date()
  Object.entries(exArchive || {}).forEach(([dk, day]) => {
    const diff = Math.floor((now - new Date(dk + 'T00:00:00')) / 86400000)
    const wIdx = diff < 7 ? 0 : diff < 14 ? 1 : -1
    if (wIdx < 0) return
    day.forEach(ex => {
      const maxW = Math.max(...ex.sets.map(s => +s.weight), 0)
      if (!weeks[wIdx][ex.name] || maxW > weeks[wIdx][ex.name]) weeks[wIdx][ex.name] = maxW
    })
  })
  const drops = []
  Object.keys(weeks[0]).forEach(name => {
    if (weeks[1][name] && weeks[0][name] < weeks[1][name]) {
      drops.push({ name, thisWeek: weeks[0][name], lastWeek: weeks[1][name] })
    }
  })
  return drops
}

// ── Progressive Overload analizi ──
function getProgressiveOverloadData(exArchive, exercises) {
  const recentExs = {}
  // Bugün
  exercises.forEach(ex => {
    const maxW = Math.max(...ex.sets.map(s => +s.weight), 0)
    recentExs[ex.name] = { today: maxW, history: [] }
  })
  // Son 4 hafta
  const sorted = Object.entries(exArchive || {}).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 28)
  sorted.forEach(([dk, day]) => {
    day.forEach(ex => {
      if (!recentExs[ex.name]) recentExs[ex.name] = { today: 0, history: [] }
      const maxW = Math.max(...ex.sets.map(s => +s.weight), 0)
      if (maxW > 0) recentExs[ex.name].history.push({ date: dk, weight: maxW })
    })
  })
  return recentExs
}

// ── Sabah motivasyon mesajları ──
const MORNING_MSGS = [
  'Günaydın! Bugün daha güçlü, daha kararlı bir gün seni bekliyor.',
  'Günaydın! Dün kendini zorladın, bugün sonuçlarını görmeye bir adım daha yakınsın.',
  'Günaydın! Büyük hedefler küçük adımlarla gerçeğe dönüşür. Bugün o adımı atmaya hazır mısın?',
  'Günaydın! Motivasyon seni başlatır, disiplin seni götürür. Devam et.',
  'Günaydın! Bugün vücudun için yapabileceğin en iyi şeyi yap.',
]

function getMorningMsg() {
  const d = new Date()
  return MORNING_MSGS[(d.getDate() + d.getMonth()) % MORNING_MSGS.length]
}

// ── Şifre Ekranı ──
function LockScreen({ onUnlock }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const tryUnlock = () => {
    if (input === COACH_PASS) {
      localStorage.setItem(PASS_KEY, '1')
      onUnlock()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setInput('')
    }
  }

  return (
    <div className="page animate-fade" style={{ maxWidth: 420, margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg,rgba(232,255,71,.08),rgba(71,200,255,.05))',
        border: '1px solid rgba(232,255,71,.2)', borderRadius: 20,
        padding: '40px 32px', textAlign: 'center',
        animation: shake ? 'shake .4s ease' : 'none',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, letterSpacing: 4, color: 'var(--accent)', marginBottom: 8 }}>
          KİŞİSEL KOÇUN
        </div>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
          Bu özellik özel erişime sahiptir.<br />Erişim şifresini girin.
        </div>
        <div className="form-group" style={{ marginBottom: 14, textAlign: 'left' }}>
          <span className="flabel">Şifre</span>
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && tryUnlock()}
            placeholder="••••••••••••"
            autoFocus
            style={{ borderColor: error ? 'rgba(255,71,71,.5)' : undefined }}
          />
          {error && (
            <span style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'Space Mono,monospace', marginTop: 4, display: 'block' }}>
              ❌ Hatalı şifre
            </span>
          )}
        </div>
        <button className="btn btn-primary" onClick={tryUnlock} style={{ width: '100%', padding: 13, fontSize: 14 }}>
          🔓 Giriş Yap
        </button>
      </div>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  )
}

// ── Ana Koç Sayfası ──
export default function PersonalCoachPage() {
  const { profile, goals, foods, exercises, exArchive, body, streak, calArch, todayKey, totalXP, setActiveTab, saveFoods, saveExercises, saveGoals, showToast, genId } = useApp()

  const [unlocked, setUnlocked] = useState(() => !!localStorage.getItem(PASS_KEY))
  const [persona, setPersona] = useState(() => localStorage.getItem(PERSONA_KEY) || 'balanced')
  const [showPersonaMenu, setShowPersonaMenu] = useState(false)
  const [deloadAlert, setDeloadAlert] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // ── İlk açılışta koç mesajı + deload tespiti ──
  useEffect(() => {
    if (!unlocked) return
    const hour = new Date().getHours()
    const todayExs = exercises.length
    const todayKcal = Math.round(foods.reduce((s, f) => s + (+f.kcal || 0), 0))

    let greeting = ''
    if (hour < 10) greeting = getMorningMsg()
    else if (hour < 14) greeting = 'Merhaba! Öğle vakti nasıl gidiyor?'
    else if (hour < 18) greeting = 'İyi günler! Antrenman zamanı yaklaşıyor mu?'
    else greeting = 'İyi akşamlar! Bugün nasıl geçti?'

    const dataLines = []
    if (streak > 0) dataLines.push(`${streak} günlük serin var 🔥`)
    if (todayExs > 0) dataLines.push(`Bugün ${todayExs} egzersiz yaptın 💪`)
    if (todayKcal > 0) dataLines.push(`${todayKcal} kcal yedin 🍽️`)
    if (profile?.weight) dataLines.push(`Son kilo: ${body.slice(-1)[0]?.weight || profile.weight} kg ⚖️`)

    // ── Çapraz analiz: protein eksikliği + antrenman düşüşü ──
    const proteinToday = Math.round(foods.reduce((s, f) => s + (+f.protein || 0), 0))
    const proteinGoal = profile?.tdee ? Math.round((profile.weight || 75) * 2) : 0
    let crossAnalysis = ''
    if (proteinGoal > 0 && proteinToday < proteinGoal * 0.7 && todayExs > 0) {
      crossAnalysis = `\n\n⚠️ Çapraz Analiz: Bugün protein hedefinin altındasın (${proteinToday}g / ${proteinGoal}g). Antrenman yaptın ama kas onarımı için protein şart. Akşam yüksek proteinli bir öğün ekleyelim mi?`
    }

    // ── Deload tespiti ──
    const drops = detectDeload(exArchive)
    if (drops.length >= 2) {
      setDeloadAlert(drops)
    }

    const openingMsg = dataLines.length > 0
      ? `${greeting}\n\nVerilerine baktım:\n${dataLines.map(l => `• ${l}`).join('\n')}${crossAnalysis}\n\nSana nasıl yardımcı olabilirim?`
      : `${greeting}\n\nBen senin kişisel KavaFit koçunum. Antrenman planı, beslenme önerisi, motivasyon veya herhangi bir fitness sorusu için buradayım. Ne sormak istersin?`

    setMessages([{ role: 'assistant', text: openingMsg }])
  }, [unlocked])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Bağlam oluştur ──
  const buildContext = useCallback(() => {
    const today = todayKey()
    const lines = []

    if (profile) {
      lines.push(`Kullanıcı: ${profile.gender === 'male' ? 'Erkek' : 'Kadın'}, ${profile.age || '?'} yaş, ${profile.weight || '?'}kg, ${profile.height || '?'}cm`)
      const goalMap = { lose: 'Kilo vermek', gain: 'Kilo almak', cut: 'Yağ yakmak', maintain: 'Kiloyu korumak' }
      const levelMap = { beginner: 'Başlangıç', intermediate: 'Orta', advanced: 'İleri' }
      if (profile.goal) lines.push(`Hedef: ${goalMap[profile.goal]}`)
      if (profile.level) lines.push(`Seviye: ${levelMap[profile.level]}`)
      if (profile.tdee) lines.push(`TDEE: ~${profile.tdee} kcal/gün`)
      if (profile.targetWeight) lines.push(`Hedef kilo: ${profile.targetWeight}kg`)
    }

    lines.push(`Günlük makro hedef: ${goals.kcal}kcal, ${goals.protein}g P, ${goals.fat}g Y, ${goals.carb}g K`)

    if (streak > 0) lines.push(`Streak: ${streak} gün üst üste antrenman`)

    // Bugünkü durum
    const todayKcal = Math.round(foods.reduce((s, f) => s + (+f.kcal || 0), 0))
    const todayProt = Math.round(foods.reduce((s, f) => s + (+f.protein || 0), 0))
    if (todayKcal > 0) lines.push(`Bugün yenen: ${todayKcal}kcal, ${todayProt}g protein`)
    if (exercises.length > 0) {
      const sets = exercises.reduce((s, e) => s + e.sets.length, 0)
      const maxW = exercises.reduce((m, e) => Math.max(m, e.sets.reduce((mm, s) => Math.max(mm, +s.weight), 0)), 0)
      lines.push(`Bugünkü antrenman: ${exercises.length} egzersiz, ${sets} set, max ${maxW}kg`)
    }

    // Son 7 gün antrenman özeti
    const last7 = []
    for (let i = 1; i <= 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const dk = d.toISOString().slice(0, 10)
      const exs = exArchive[dk] || []
      if (exs.length > 0) last7.push(`${dk}: ${exs.length} egz`)
    }
    if (last7.length > 0) lines.push(`Son 7 gün antrenman: ${last7.join(', ')}`)

    // Son kilo
    const lastBody = body.slice(-1)[0]
    if (lastBody?.weight) lines.push(`Son ölçüm: ${lastBody.weight}kg ${lastBody.date}`)

    // Progressive overload verileri
    const poData = getProgressiveOverloadData(exArchive, exercises)
    const poLines = Object.entries(poData)
      .filter(([, v]) => v.history.length > 0)
      .slice(0, 4)
      .map(([name, v]) => {
        const last = v.history[0]
        return `${name}: en son ${last?.weight}kg (${last?.date})`
      })
    if (poLines.length > 0) lines.push(`Son antrenman ağırlıkları: ${poLines.join(' | ')}`)

    // Persona sistem promptunu seç
    const currentPersona = PERSONAS.find(p => p.id === persona) || PERSONAS[0]

    return `${currentPersona.systemPrompt} Kullanıcının tüm verilerine erişimin var. Yanıtlarını asla yarıda kesme.

Kullanıcı verileri:
${lines.join('\n')}

`
  }, [profile, goals, foods, exercises, exArchive, body, streak, persona])

  // ── Persona değiştir ──
  const changePersona = (id) => {
    setPersona(id)
    localStorage.setItem(PERSONA_KEY, id)
    setShowPersonaMenu(false)
    const p = PERSONAS.find(x => x.id === id)
    setMessages([{ role: 'assistant', text: `${p.icon} Koç modu değişti: **${p.label}**\n\n${p.id === 'drill' ? 'Tamam, yumuşaklık bitti. Söyle bakalım, ne yapacağız?' : p.id === 'philosopher' ? 'Marcus Aurelius der ki: "Her şeyi olduğu gibi gör." Haydi, hangi engeli aşacağız?' : p.id === 'analytical' ? 'Veri modu aktif. Hedefini ve mevcut durumunu paylaş, optimizasyon yapalım.' : 'Merhaba! Yeni bir başlangıç. Ne sormak istersin?'}` }])
  }

  // ── Mesaj gönder ──
  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    const newMsgs = [...messages, { role: 'user', text: msg }]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)

    const ctx = buildContext()
    const contents = [
      { role: 'user', parts: [{ text: ctx + 'Merhaba koçum!' }] },
      { role: 'model', parts: [{ text: messages[0]?.text || 'Merhaba! Sana yardımcı olmaya hazırım.' }] },
      ...newMsgs.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
    ]

    const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash']
    const key = import.meta.env.VITE_GEMINI_KEY
    let reply = null

    for (const model of MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
          }
        )
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          if (res.status === 429 || res.status === 503) continue
          if (res.status === 400) break
          continue
        }
        const data = await res.json()
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
        if (reply) break
      } catch { continue }
    }

    if (reply) {
      const { cleanText, actions } = parseActions(reply)

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
            sets: Array.from({ length: action.data.sets || 3 }, () => ({
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

      setMessages(prev => [...prev, { role: 'assistant', text: cleanText, actions }])
    } else {
      try { kavaHataBildir("PersonalCoach", "Gemini API yanıt vermedi") } catch {}
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: '⚠️ Koça şu an ulaşılamıyor. İnternet bağlantını kontrol et ve tekrar dene.'
      }])
    }

    setLoading(false)
  }

  // ── Ses tanıma ──
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = 'tr-TR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  // ── Hızlı sorular ──
  const QUICK = [
    'Bugün için antrenman önerisi ver',
    'Bu hafta nasıl gidiyorum?',
    'Yarınki öğünlerim ne olmalı?',
    'Motivasyon ver, yoruldum',
    'Protein ihtiyacım ne kadar?',
    'Bu haftaki hedefimi belirle',
  ]

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />

  return (
    <div className="page animate-fade" style={{ maxWidth: 700 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,rgba(232,255,71,.15),rgba(71,200,255,.1))', border: '1px solid rgba(232,255,71,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
          {PERSONAS.find(p => p.id === persona)?.icon || '🤖'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 24, letterSpacing: 3, color: 'var(--accent)' }}>
            KİŞİSEL KOÇUN
          </div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
            {PERSONAS.find(p => p.id === persona)?.label || 'Dengeli Koç'} modu
          </div>
        </div>
        {/* Persona seçici */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPersonaMenu(v => !v)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Space Mono,monospace', fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            🎭 Mod
          </button>
          {showPersonaMenu && (
            <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 50, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', width: 240, boxShadow: '0 8px 32px rgba(0,0,0,.5)' }} className="animate-fade">
              {PERSONAS.map(p => {
                const unlockReq = PERSONA_UNLOCKS[p.id]
                const isLocked = unlockReq && totalXP < unlockReq.xpRequired
                return (
                  <div
                    key={p.id}
                    onClick={() => isLocked ? setActiveTab('achievements') : changePersona(p.id)}
                    style={{ padding: '11px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: persona === p.id ? 'rgba(232,255,71,.06)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,.04)', transition: 'background .1s', opacity: isLocked ? .6 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = persona === p.id ? 'rgba(232,255,71,.06)' : 'transparent'}
                  >
                    <span style={{ fontSize: 18, filter: isLocked ? 'grayscale(1)' : 'none' }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 12, letterSpacing: 1.5, color: persona === p.id ? 'var(--accent)' : isLocked ? 'var(--text-muted)' : 'var(--text)' }}>{p.label}</div>
                      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: isLocked ? 'var(--red)' : 'var(--text-muted)', marginTop: 1 }}>
                        {isLocked ? `🔒 ${unlockReq.xpRequired.toLocaleString()} XP gerekli` : p.desc}
                      </div>
                    </div>
                    {persona === p.id && !isLocked && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 12 }}>✓</span>}
                    {isLocked && <span style={{ fontSize: 12 }}>🔒</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <button
          onClick={() => { localStorage.removeItem(PASS_KEY); setUnlocked(false) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono,monospace', textDecoration: 'underline' }}
        >
          Kilitle
        </button>
      </div>

      {/* Deload uyarısı */}
      {deloadAlert && deloadAlert.length > 0 && (
        <div style={{ background: 'rgba(255,140,71,.08)', border: '1px solid rgba(255,140,71,.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }} className="animate-fade">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>📉</span>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 14, letterSpacing: 2, color: '#ff8c47' }}>DELOAD HAFTA ÖNERİSİ</div>
            <button onClick={() => setDeloadAlert(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}>✕</button>
          </div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 10 }}>
            Son 2 haftada şu egzersizlerde ağırlık düşüşü tespit ettim:<br />
            {deloadAlert.map(d => (
              <span key={d.name} style={{ color: '#ff8c47', display: 'block' }}>• {d.name}: {d.lastWeek}kg → {d.thisWeek}kg</span>
            ))}
          </div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 10 }}>
            Vücudun toparlanma sinyali veriyor. <strong style={{ color: '#ff8c47' }}>%20 ağırlık azaltılmış bir Deload Haftası</strong> öneririm.
          </div>
          <button
            onClick={() => { sendMessage('Deload haftası planı oluştur. Mevcut antrenmanlarıma göre %20 azaltılmış bir program hazırla.'); setDeloadAlert(null) }}
            style={{ background: 'rgba(255,140,71,.15)', border: '1px solid rgba(255,140,71,.3)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: 'Space Mono,monospace', fontSize: 10, color: '#ff8c47' }}
          >
            🤖 Deload Planı Oluştur
          </button>
        </div>
      )}

      {/* Streak banner */}
      {streak >= 3 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,140,71,.08)', border: '1px solid rgba(255,140,71,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>{streak >= 30 ? '🏆' : streak >= 14 ? '🔥' : '⚡'}</span>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: '#ff8c47' }}>
            <b>{streak} günlük serin var</b> — Koçun seninle gurur duyuyor!
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>

        {/* Mesajlar */}
        <div style={{ padding: '16px 16px 0', maxHeight: 460, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, scrollbarWidth: 'thin' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: msg.role === 'user' ? 'var(--accent)' : 'linear-gradient(135deg,rgba(232,255,71,.2),rgba(71,200,255,.15))',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(232,255,71,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: msg.role === 'user' ? '#0a0a0a' : 'var(--accent)',
              }}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div style={{
                maxWidth: '80%',
                background: msg.role === 'user' ? 'rgba(232,255,71,.1)' : 'var(--surface2)',
                border: msg.role === 'user' ? '1px solid rgba(232,255,71,.2)' : '1px solid var(--border)',
                borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                padding: '12px 16px',
              }}>
                <div style={{ fontSize: 13, lineHeight: 1.85, color: msg.role === 'user' ? 'var(--accent)' : 'var(--text-dim)', fontFamily: 'Inter,sans-serif', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {msg.text}
                </div>
                {/* Nav aksiyonları */}
                {msg.actions && msg.actions.filter(a => a.type === 'nav').map((action, i) => (
                  <button key={i}
                    onClick={() => setActiveTab(action.sub)}
                    style={{ marginTop: 8, padding: '6px 14px', borderRadius: 20, border: 'none', background: 'var(--accent)', color: '#0a0a0a', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'block', fontFamily: 'Space Mono,monospace' }}
                  >
                    {action.sub === 'calorie' ? '🍎 Kalori Sayfasına Git →' :
                     action.sub === 'today' ? '🏋️ Antrenman Sayfasına Git →' :
                     action.sub === 'goals' ? '🎯 Hedefler Sayfasına Git →' :
                     action.sub === 'progress' ? '📊 İlerleme Sayfasına Git →' :
                     action.sub === 'exercises' ? '💪 Hareketler Sayfasına Git →' :
                     action.sub === 'trainer' ? '🤖 Personal Trainer\'a Git →' : `→ ${action.sub}`}
                  </button>
                ))}
                {/* Eski navAction formatı desteği */}
                {msg.navAction && !msg.actions && (
                  <button
                    onClick={() => setActiveTab(msg.navAction)}
                    style={{ marginTop: 8, padding: '6px 14px', borderRadius: 20, border: 'none', background: 'var(--accent)', color: '#0a0a0a', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'block', fontFamily: 'Space Mono,monospace' }}
                  >
                    {msg.navAction === 'calorie' ? '🍎 Kalori Sayfasına Git →' :
                     msg.navAction === 'today' ? '🏋️ Antrenman Sayfasına Git →' :
                     msg.navAction === 'goals' ? '🎯 Hedefler Sayfasına Git →' :
                     msg.navAction === 'progress' ? '📊 İlerleme Sayfasına Git →' : '→ Git'}
                  </button>
                )}
                {/* Uygulanan aksiyonlar */}
                {msg.actions && msg.actions.filter(a => a.type !== 'nav').map((action, i) => (
                  <div key={i} style={{
                    marginTop: 6, padding: '5px 10px',
                    background: 'rgba(71,200,255,0.1)',
                    border: '1px solid rgba(71,200,255,0.2)',
                    borderRadius: 8, fontSize: 11,
                    color: '#47c8ff', fontFamily: 'Space Mono,monospace',
                  }}>
                    {action.type === 'add_food' && `✅ ${action.data?.name} eklendi`}
                    {action.type === 'add_exercise' && `💪 ${action.data?.name} eklendi`}
                    {action.type === 'set_goal' && '🎯 Hedefler güncellendi'}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Typing */}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(232,255,71,.2),rgba(71,200,255,.15))', border: '1px solid rgba(232,255,71,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'bounce 1.2s ease infinite', display: 'inline-block' }} />
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'bounce 1.2s ease infinite .2s', display: 'inline-block' }} />
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'bounce 1.2s ease infinite .4s', display: 'inline-block' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Hızlı sorular */}
        <div style={{ padding: '12px 16px 0', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {QUICK.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} disabled={loading} style={{ padding: '6px 13px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text-muted)', fontFamily: 'Space Mono,monospace', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, opacity: loading ? .5 : 1, transition: 'all .15s' }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >{q}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px 16px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Koçuna sor... (Enter = gönder, Shift+Enter = yeni satır)"
            disabled={loading}
            rows={2}
            style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 13, padding: '10px 12px', outline: 'none', resize: 'none', fontFamily: 'Inter,sans-serif', lineHeight: 1.5, transition: 'border-color .2s' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          {/* Ses butonu */}
          {voiceSupported && (
            <button
              onClick={listening ? stopListening : startListening}
              style={{ width: 42, height: 42, borderRadius: 10, border: `1px solid ${listening ? 'rgba(255,71,71,.4)' : 'var(--border)'}`, background: listening ? 'rgba(255,71,71,.1)' : 'var(--surface2)', color: listening ? 'var(--red)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'all .2s', flexShrink: 0, animation: listening ? 'pulse 1s ease infinite' : '' }}
              title={listening ? 'Dinlemeyi durdur' : 'Sesli giriş'}
            >
              {listening ? '⏹' : '🎤'}
            </button>
          )}

          {/* Gönder */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{ width: 42, height: 42, borderRadius: 10, border: 'none', background: input.trim() && !loading ? 'var(--accent)' : 'var(--surface2)', color: input.trim() && !loading ? '#0a0a0a' : 'var(--text-muted)', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'all .2s', flexShrink: 0 }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16, borderTopColor: 'var(--text-muted)' }} /> : '↑'}
          </button>
        </div>
      </div>

      {/* Sohbeti temizle */}
      {messages.length > 1 && (
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={() => setMessages([{ role: 'assistant', text: getMorningMsg() + '\n\nYeni bir sohbet başlatalım! Ne sormak istersin?' }])}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Space Mono,monospace', textDecoration: 'underline' }}
          >
            Sohbeti Temizle
          </button>
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(.8);opacity:.5} 40%{transform:scale(1.2);opacity:1} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  )
}
