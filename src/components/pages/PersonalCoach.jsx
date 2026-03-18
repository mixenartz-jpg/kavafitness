import { useState, useRef, useEffect, useCallback } from 'react'
import { useApp, PERSONA_UNLOCKS } from '../../context/AppContext'

const GKEY        = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'
const COACH_PASS  = 'kerembaba12358'
const PASS_KEY    = 'coach_unlocked'
const PERSONA_KEY = 'coach_persona'

// ── AI Kişilik Modları ──
const PERSONAS = [
  {
    id: 'balanced',
    icon: '🤖',
    label: 'Dengeli Koç',
    desc: 'Samimi, motive edici, pratik',
    systemPrompt: 'Sen KeroGym Kişisel Koçu\'sun. Samimi, motive edici ve pratik ol. Türkçe konuş.',
  },
  {
    id: 'philosopher',
    icon: '🏛️',
    label: 'Felsefi Koç',
    desc: 'Stoa felsefesi, Marcus Aurelius tarzı',
    systemPrompt: 'Sen Stoacı bir fitness filozofusun. Marcus Aurelius, Epiktetos ve Seneca\'dan ilham alarak konuş. Disiplin, irade ve kontrol üzerine felsefi ama pratik tavsiyeler ver. Türkçe konuş. Bahane kabul etme ama şefkatle yönlendir.',
  },
  {
    id: 'drill',
    icon: '🪖',
    label: 'Drill Sergeant',
    desc: 'Sert, agresif, bahane yok',
    systemPrompt: 'Sen acımasız bir askeri kamp koçusun. Sert, direkt ve bahane kabul etmeyen bir tarzın var. Kullanıcıyı zorla, ama gerçekten faydalı ol. Türkçe konuş. Kısa ve güçlü cümleler kullan.',
  },
  {
    id: 'analytical',
    icon: '📊',
    label: 'Analitik Koç',
    desc: 'İstatistik, bilim, optimizasyon',
    systemPrompt: 'Sen veri odaklı bir performans koçusun. Her önerin bilimsel araştırmalara ve istatistiklere dayansın. Sayılar, yüzdeler ve optimizasyon stratejileri kullan. Türkçe konuş. Duygusuz ama kesinlikle doğru ol.',
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
  const sorted = Object.entries(exArchive || {}).sort((a,b) => b[0].localeCompare(a[0])).slice(0, 28)
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
  const [input, setInput]   = useState('')
  const [error, setError]   = useState(false)
  const [shake, setShake]   = useState(false)

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
    <div className="page animate-fade" style={{ maxWidth:420, margin:'0 auto' }}>
      <div style={{
        background:'linear-gradient(135deg,rgba(232,255,71,.08),rgba(71,200,255,.05))',
        border:'1px solid rgba(232,255,71,.2)', borderRadius:20,
        padding:'40px 32px', textAlign:'center',
        animation: shake ? 'shake .4s ease' : 'none',
      }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, letterSpacing:4, color:'var(--accent)', marginBottom:8 }}>
          KİŞİSEL KOÇUN
        </div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.7, marginBottom:28 }}>
          Bu özellik özel erişime sahiptir.<br/>Erişim şifresini girin.
        </div>
        <div className="form-group" style={{ marginBottom:14, textAlign:'left' }}>
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
            <span style={{ fontSize:11, color:'var(--red)', fontFamily:'Space Mono,monospace', marginTop:4, display:'block' }}>
              ❌ Hatalı şifre
            </span>
          )}
        </div>
        <button className="btn btn-primary" onClick={tryUnlock} style={{ width:'100%', padding:13, fontSize:14 }}>
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
  const { profile, goals, foods, exercises, exArchive, body, streak, calArch, todayKey, totalXP, setActiveTab } = useApp()

  const [unlocked, setUnlocked] = useState(() => !!localStorage.getItem(PASS_KEY))
  const [persona,  setPersona]  = useState(() => localStorage.getItem(PERSONA_KEY) || 'balanced')
  const [showPersonaMenu, setShowPersonaMenu] = useState(false)
  const [deloadAlert, setDeloadAlert] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceSupported]          = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // ── İlk açılışta koç mesajı + deload tespiti ──
  useEffect(() => {
    if (!unlocked) return
    const hour  = new Date().getHours()
    const todayExs = exercises.length
    const todayKcal = Math.round(foods.reduce((s,f) => s+(+f.kcal||0), 0))

    let greeting = ''
    if (hour < 10) greeting = getMorningMsg()
    else if (hour < 14) greeting = 'Merhaba! Öğle vakti nasıl gidiyor?'
    else if (hour < 18) greeting = 'İyi günler! Antrenman zamanı yaklaşıyor mu?'
    else greeting = 'İyi akşamlar! Bugün nasıl geçti?'

    const dataLines = []
    if (streak > 0)      dataLines.push(`${streak} günlük serin var 🔥`)
    if (todayExs > 0)    dataLines.push(`Bugün ${todayExs} egzersiz yaptın 💪`)
    if (todayKcal > 0)   dataLines.push(`${todayKcal} kcal yedin 🍽️`)
    if (profile?.weight) dataLines.push(`Son kilo: ${body.slice(-1)[0]?.weight || profile.weight} kg ⚖️`)

    // ── Çapraz analiz: protein eksikliği + antrenman düşüşü ──
    const proteinToday = Math.round(foods.reduce((s,f) => s+(+f.protein||0), 0))
    const proteinGoal  = profile?.tdee ? Math.round((profile.weight || 75) * 2) : 0
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
      : `${greeting}\n\nBen senin kişisel KeroGym koçunum. Antrenman planı, beslenme önerisi, motivasyon veya herhangi bir fitness sorusu için buradayım. Ne sormak istersin?`

    setMessages([{ role:'assistant', text: openingMsg }])
  }, [unlocked])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  // ── Bağlam oluştur ──
  const buildContext = useCallback(() => {
    const today = todayKey()
    const lines = []

    if (profile) {
      lines.push(`Kullanıcı: ${profile.gender==='male'?'Erkek':'Kadın'}, ${profile.age||'?'} yaş, ${profile.weight||'?'}kg, ${profile.height||'?'}cm`)
      const goalMap = {lose:'Kilo vermek',gain:'Kilo almak',cut:'Yağ yakmak',maintain:'Kiloyu korumak'}
      const levelMap = {beginner:'Başlangıç',intermediate:'Orta',advanced:'İleri'}
      if (profile.goal)  lines.push(`Hedef: ${goalMap[profile.goal]}`)
      if (profile.level) lines.push(`Seviye: ${levelMap[profile.level]}`)
      if (profile.tdee)  lines.push(`TDEE: ~${profile.tdee} kcal/gün`)
      if (profile.targetWeight) lines.push(`Hedef kilo: ${profile.targetWeight}kg`)
    }

    lines.push(`Günlük makro hedef: ${goals.kcal}kcal, ${goals.protein}g P, ${goals.fat}g Y, ${goals.carb}g K`)

    if (streak > 0) lines.push(`Streak: ${streak} gün üst üste antrenman`)

    // Bugünkü durum
    const todayKcal = Math.round(foods.reduce((s,f) => s+(+f.kcal||0), 0))
    const todayProt = Math.round(foods.reduce((s,f) => s+(+f.protein||0), 0))
    if (todayKcal > 0) lines.push(`Bugün yenen: ${todayKcal}kcal, ${todayProt}g protein`)
    if (exercises.length > 0) {
      const sets = exercises.reduce((s,e) => s+e.sets.length, 0)
      const maxW  = exercises.reduce((m,e) => Math.max(m, e.sets.reduce((mm,s) => Math.max(mm,+s.weight),0)), 0)
      lines.push(`Bugünkü antrenman: ${exercises.length} egzersiz, ${sets} set, max ${maxW}kg`)
    }

    // Son 7 gün antrenman özeti
    const last7 = []
    for (let i=1; i<=7; i++) {
      const d = new Date(); d.setDate(d.getDate()-i)
      const dk = d.toISOString().slice(0,10)
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
    setMessages([{ role:'assistant', text: `${p.icon} Koç modu değişti: **${p.label}**\n\n${p.id === 'drill' ? 'Tamam, yumuşaklık bitti. Söyle bakalım, ne yapacağız?' : p.id === 'philosopher' ? 'Marcus Aurelius der ki: "Her şeyi olduğu gibi gör." Haydi, hangi engeli aşacağız?' : p.id === 'analytical' ? 'Veri modu aktif. Hedefini ve mevcut durumunu paylaş, optimizasyon yapalım.' : 'Merhaba! Yeni bir başlangıç. Ne sormak istersin?'}` }])
  }

  // ── Mesaj gönder ──
  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    const newMsgs = [...messages, { role:'user', text:msg }]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)

    const ctx = buildContext()
    const contents = [
      { role:'user',  parts:[{ text: ctx + 'Merhaba koçum!' }] },
      { role:'model', parts:[{ text: messages[0]?.text || 'Merhaba! Sana yardımcı olmaya hazırım.' }] },
      ...newMsgs.map(m => ({ role: m.role==='user'?'user':'model', parts:[{ text:m.text }] })),
    ]

    const MODELS = [
      'gemini-3.1-flash-lite-preview',
      'gemini-3-flash-preview',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
    ]
    let reply = null
    for (const model of MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GKEY}`,
          { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ contents, generationConfig:{ temperature:.85, maxOutputTokens:2048 } }) }
        )
        if (!res.ok) continue
        const data = await res.json()
        const cand = data?.candidates?.[0]
        reply = cand?.content?.parts?.[0]?.text
        // finish_reason MAX_TOKENS: yanıt kesilmiş, sonraki modeli dene
        if (reply && cand?.finishReason !== 'MAX_TOKENS') break
        if (reply && model === MODELS[MODELS.length - 1]) break // son model, yine de kullan
        if (reply && cand?.finishReason === 'MAX_TOKENS') { reply = null; continue }
      } catch { continue }
    }
    setMessages(prev => [...prev, {
      role: 'assistant',
      text: reply || '⚠️ Şu an yanıt alınamadı, lütfen tekrar dene.'
    }])
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
    <div className="page animate-fade" style={{ maxWidth:700 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
        <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg,rgba(232,255,71,.15),rgba(71,200,255,.1))', border:'1px solid rgba(232,255,71,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
          {PERSONAS.find(p => p.id === persona)?.icon || '🤖'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:24, letterSpacing:3, color:'var(--accent)' }}>
            KİŞİSEL KOÇUN
          </div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', display:'inline-block', animation:'pulse 2s ease infinite' }}/>
            {PERSONAS.find(p => p.id === persona)?.label || 'Dengeli Koç'} modu
          </div>
        </div>
        {/* Persona seçici */}
        <div style={{ position:'relative' }}>
          <button
            onClick={() => setShowPersonaMenu(v => !v)}
            style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:5 }}
          >
            🎭 Mod
          </button>
          {showPersonaMenu && (
            <div style={{ position:'absolute', right:0, top:'110%', zIndex:50, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', width:240, boxShadow:'0 8px 32px rgba(0,0,0,.5)' }} className="animate-fade">
              {PERSONAS.map(p => {
                const unlockReq = PERSONA_UNLOCKS[p.id]
                const isLocked  = unlockReq && totalXP < unlockReq.xpRequired
                return (
                  <div
                    key={p.id}
                    onClick={() => isLocked ? setActiveTab('achievements') : changePersona(p.id)}
                    style={{ padding:'11px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:10, background: persona === p.id ? 'rgba(232,255,71,.06)' : 'transparent', borderBottom:'1px solid rgba(255,255,255,.04)', transition:'background .1s', opacity: isLocked ? .6 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = persona === p.id ? 'rgba(232,255,71,.06)' : 'transparent'}
                  >
                    <span style={{ fontSize:18, filter: isLocked ? 'grayscale(1)' : 'none' }}>{p.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:12, letterSpacing:1.5, color: persona === p.id ? 'var(--accent)' : isLocked ? 'var(--text-muted)' : 'var(--text)' }}>{p.label}</div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color: isLocked ? 'var(--red)' : 'var(--text-muted)', marginTop:1 }}>
                        {isLocked ? `🔒 ${unlockReq.xpRequired.toLocaleString()} XP gerekli` : p.desc}
                      </div>
                    </div>
                    {persona === p.id && !isLocked && <span style={{ marginLeft:'auto', color:'var(--accent)', fontSize:12 }}>✓</span>}
                    {isLocked && <span style={{ fontSize:12 }}>🔒</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <button
          onClick={() => { localStorage.removeItem(PASS_KEY); setUnlocked(false) }}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'var(--text-muted)', fontFamily:'Space Mono,monospace', textDecoration:'underline' }}
        >
          Kilitle
        </button>
      </div>

      {/* Deload uyarısı */}
      {deloadAlert && deloadAlert.length > 0 && (
        <div style={{ background:'rgba(255,140,71,.08)', border:'1px solid rgba(255,140,71,.3)', borderRadius:12, padding:'14px 16px', marginBottom:16 }} className="animate-fade">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ fontSize:20 }}>📉</span>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:2, color:'#ff8c47' }}>DELOAD HAFTA ÖNERİSİ</div>
            <button onClick={() => setDeloadAlert(null)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:14 }}>✕</button>
          </div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.7, marginBottom:10 }}>
            Son 2 haftada şu egzersizlerde ağırlık düşüşü tespit ettim:<br/>
            {deloadAlert.map(d => (
              <span key={d.name} style={{ color:'#ff8c47', display:'block' }}>• {d.name}: {d.lastWeek}kg → {d.thisWeek}kg</span>
            ))}
          </div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.7, marginBottom:10 }}>
            Vücudun toparlanma sinyali veriyor. <strong style={{ color:'#ff8c47' }}>%20 ağırlık azaltılmış bir Deload Haftası</strong> öneririm.
          </div>
          <button
            onClick={() => { sendMessage('Deload haftası planı oluştur. Mevcut antrenmanlarıma göre %20 azaltılmış bir program hazırla.'); setDeloadAlert(null) }}
            style={{ background:'rgba(255,140,71,.15)', border:'1px solid rgba(255,140,71,.3)', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontFamily:'Space Mono,monospace', fontSize:10, color:'#ff8c47' }}
          >
            🤖 Deload Planı Oluştur
          </button>
        </div>
      )}

      {/* Streak banner */}
      {streak >= 3 && (
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,140,71,.08)', border:'1px solid rgba(255,140,71,.2)', borderRadius:10, padding:'10px 14px', marginBottom:16 }}>
          <span style={{ fontSize:20 }}>{streak >= 30?'🏆':streak >= 14?'🔥':'⚡'}</span>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'#ff8c47' }}>
            <b>{streak} günlük serin var</b> — Koçun seninle gurur duyuyor!
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="card" style={{ marginBottom:12, overflow:'hidden' }}>

        {/* Mesajlar */}
        <div style={{ padding:'16px 16px 0', maxHeight:460, overflowY:'auto', display:'flex', flexDirection:'column', gap:14, scrollbarWidth:'thin' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display:'flex', gap:10, flexDirection:msg.role==='user'?'row-reverse':'row', alignItems:'flex-start' }}>
              <div style={{
                width:32, height:32, borderRadius:'50%', flexShrink:0,
                background: msg.role==='user' ? 'var(--accent)' : 'linear-gradient(135deg,rgba(232,255,71,.2),rgba(71,200,255,.15))',
                border: msg.role==='user' ? 'none' : '1px solid rgba(232,255,71,.25)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14, color: msg.role==='user' ? '#0a0a0a' : 'var(--accent)',
              }}>
                {msg.role==='user' ? '👤' : '🤖'}
              </div>
              <div style={{
                maxWidth:'80%',
                background: msg.role==='user' ? 'rgba(232,255,71,.1)' : 'var(--surface2)',
                border: msg.role==='user' ? '1px solid rgba(232,255,71,.2)' : '1px solid var(--border)',
                borderRadius: msg.role==='user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                padding:'12px 16px',
              }}>
                <div style={{ fontSize:13, lineHeight:1.85, color: msg.role==='user'?'var(--accent)':'var(--text-dim)', fontFamily:'Inter,sans-serif', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {/* Typing */}
          {loading && (
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,rgba(232,255,71,.2),rgba(71,200,255,.15))',border:'1px solid rgba(232,255,71,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>🤖</div>
              <div style={{ background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'4px 14px 14px 14px',padding:'12px 16px',display:'flex',gap:5,alignItems:'center' }}>
                <span style={{ width:7,height:7,borderRadius:'50%',background:'var(--accent)',animation:'bounce 1.2s ease infinite',display:'inline-block' }}/>
                <span style={{ width:7,height:7,borderRadius:'50%',background:'var(--accent)',animation:'bounce 1.2s ease infinite .2s',display:'inline-block' }}/>
                <span style={{ width:7,height:7,borderRadius:'50%',background:'var(--accent)',animation:'bounce 1.2s ease infinite .4s',display:'inline-block' }}/>
              </div>
            </div>
          )}
          <div ref={chatEndRef}/>
        </div>

        {/* Hızlı sorular */}
        <div style={{ padding:'12px 16px 0', display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none' }}>
          {QUICK.map((q,i) => (
            <button key={i} onClick={() => sendMessage(q)} disabled={loading} style={{ padding:'6px 13px', borderRadius:20, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text-muted)', fontFamily:'Space Mono,monospace', fontSize:10, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, opacity:loading?.5:1, transition:'all .15s' }}
              onMouseEnter={e => { if(!loading){e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}
            >{q}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding:'12px 16px 16px', display:'flex', gap:8, alignItems:'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage() }}}
            placeholder="Koçuna sor... (Enter = gönder, Shift+Enter = yeni satır)"
            disabled={loading}
            rows={2}
            style={{ flex:1, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text)', fontSize:13, padding:'10px 12px', outline:'none', resize:'none', fontFamily:'Inter,sans-serif', lineHeight:1.5, transition:'border-color .2s' }}
            onFocus={e => e.target.style.borderColor='var(--accent)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />

          {/* Ses butonu */}
          {voiceSupported && (
            <button
              onClick={listening ? stopListening : startListening}
              style={{ width:42, height:42, borderRadius:10, border:`1px solid ${listening?'rgba(255,71,71,.4)':'var(--border)'}`, background:listening?'rgba(255,71,71,.1)':'var(--surface2)', color:listening?'var(--red)':'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, transition:'all .2s', flexShrink:0, animation:listening?'pulse 1s ease infinite':'' }}
              title={listening ? 'Dinlemeyi durdur' : 'Sesli giriş'}
            >
              {listening ? '⏹' : '🎤'}
            </button>
          )}

          {/* Gönder */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{ width:42, height:42, borderRadius:10, border:'none', background:input.trim()&&!loading?'var(--accent)':'var(--surface2)', color:input.trim()&&!loading?'#0a0a0a':'var(--text-muted)', cursor:input.trim()&&!loading?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, transition:'all .2s', flexShrink:0 }}
          >
            {loading ? <span className="spinner" style={{width:16,height:16,borderTopColor:'var(--text-muted)'}}/> : '↑'}
          </button>
        </div>
      </div>

      {/* Sohbeti temizle */}
      {messages.length > 1 && (
        <div style={{ textAlign:'right' }}>
          <button
            onClick={() => setMessages([{ role:'assistant', text: getMorningMsg() + '\n\nYeni bir sohbet başlatalım! Ne sormak istersin?' }])}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:10, color:'var(--text-muted)', fontFamily:'Space Mono,monospace', textDecoration:'underline' }}
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
