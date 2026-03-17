import { useState, useRef, useEffect, useCallback } from 'react'
import { useApp } from '../../context/AppContext'

const GKEY        = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'
const COACH_PASS  = 'kerembaba12358'
const PASS_KEY    = 'coach_unlocked'

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
        <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.7, marginBottom:28 }}>
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
            <span style={{ fontSize:11, color:'var(--red)', fontFamily:'DM Mono,monospace', marginTop:4, display:'block' }}>
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
  const { profile, goals, foods, exercises, exArchive, body, streak, calArch, todayKey } = useApp()

  const [unlocked, setUnlocked] = useState(() => !!localStorage.getItem(PASS_KEY))
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceSupported]          = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // ── İlk açılışta koç mesajı ──
  useEffect(() => {
    if (!unlocked) return
    const today = todayKey()
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

    const openingMsg = dataLines.length > 0
      ? `${greeting}\n\nVerilerine baktım:\n${dataLines.map(l => `• ${l}`).join('\n')}\n\nSana nasıl yardımcı olabilirim?`
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

    return `Sen "KeroGym Kişisel Koçu"sun. Kullanıcının tüm verilerine erişimin var ve onları gerçekten tanıyorsun. Türkçe konuş, samimi ol, motive edici ve pratik ol. Yanıtlarını asla yarıda kesme.

Kullanıcı verileri:
${lines.join('\n')}

`
  }, [profile, goals, foods, exercises, exArchive, body, streak])

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
        reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (reply) break
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
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
        <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg,rgba(232,255,71,.15),rgba(71,200,255,.1))', border:'1px solid rgba(232,255,71,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
          🤖
        </div>
        <div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:24, letterSpacing:3, color:'var(--accent)' }}>
            KİŞİSEL KOÇUN
          </div>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', display:'inline-block', animation:'pulse 2s ease infinite' }}/>
            Tüm verilerine erişimi var · Türkçe konuşur
          </div>
        </div>
        <button
          onClick={() => { localStorage.removeItem(PASS_KEY); setUnlocked(false) }}
          style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', textDecoration:'underline' }}
        >
          Kilitle
        </button>
      </div>

      {/* Streak banner */}
      {streak >= 3 && (
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,140,71,.08)', border:'1px solid rgba(255,140,71,.2)', borderRadius:10, padding:'10px 14px', marginBottom:16 }}>
          <span style={{ fontSize:20 }}>{streak >= 30?'🏆':streak >= 14?'🔥':'⚡'}</span>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#ff8c47' }}>
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
                <div style={{ fontSize:13, lineHeight:1.85, color: msg.role==='user'?'var(--accent)':'var(--text-dim)', fontFamily:'DM Sans,sans-serif', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
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
            <button key={i} onClick={() => sendMessage(q)} disabled={loading} style={{ padding:'6px 13px', borderRadius:20, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text-muted)', fontFamily:'DM Mono,monospace', fontSize:10, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, opacity:loading?.5:1, transition:'all .15s' }}
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
            style={{ flex:1, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text)', fontSize:13, padding:'10px 12px', outline:'none', resize:'none', fontFamily:'DM Sans,sans-serif', lineHeight:1.5, transition:'border-color .2s' }}
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
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', textDecoration:'underline' }}
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
