import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const GEMINI_MODELS = ['gemini-3.1-flash-lite-preview', 'gemini-2.0-flash', 'gemini-1.5-flash']

async function callGemini(contents) {
  const key = import.meta.env.VITE_GEMINI_KEY
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 600 } }),
        }
      )
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text
    } catch { continue }
  }
  return null
}

const NAV_LABELS = {
  calorie: '🍎 Kalori Sayfası →',
  today: '🏋️ Antrenman →',
  coach: '🤖 Kişisel Koç →',
  goals: '🎯 Hedefler →',
  progress: '📊 İlerleme →',
}

// Animated AI icon SVG
function AIIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
      <path d="M8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 4V6M12 18V20M4 12H6M18 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  )
}

export default function FloatingChatbot() {
  const { profile, goals, foods, exercises, setActiveTab } = useApp()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Merhaba! 👋 Fitness veya beslenme hakkında bir şey sormak ister misin?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buildCtx = () => {
    const lines = []
    if (profile) {
      lines.push(`${profile.gender === 'male' ? 'Erkek' : 'Kadın'}, ${profile.age || '?'} yaş, ${profile.weight || '?'}kg`)
      const goalMap = { lose: 'Kilo ver', gain: 'Kilo al', cut: 'Yağ yak', maintain: 'Koru' }
      if (profile.goal) lines.push(`Hedef: ${goalMap[profile.goal] || profile.goal}`)
      if (profile.tdee) lines.push(`TDEE: ~${profile.tdee}kcal`)
    }
    if (goals) lines.push(`Makro hedef: ${goals.kcal}kcal, ${goals.protein}g protein`)
    if (foods?.length > 0) {
      const kcal = Math.round(foods.reduce((s, f) => s + (+f.kcal || 0), 0))
      lines.push(`Bugün yenen: ${kcal}kcal`)
    }
    if (exercises?.length > 0) {
      lines.push(`Bugün ${exercises.length} egzersiz yapıldı`)
    }

    return `Sen KavaFit hızlı yardım botusun. SADECE fitness, antrenman, beslenme, kalori ve sağlıklı yaşam konularında yardım et. Başka konularda "Bu konuda yardımcı olamam, fitness veya beslenme sorun varsa memnuniyetle yardım ederim!" de.

Kısa ve öz cevaplar ver (maks 2-3 paragraf). Türkçe konuş.

Eğer kalori veya beslenme konusundaysa cevabın sonuna [NAV:calorie] ekle.
Eğer bugünkü antrenmanla ilgiliyse [NAV:today] ekle.
Eğer detaylı AI koç desteği gerekiyorsa [NAV:coach] ekle.
Sadece gerçekten ilgili olduğunda NAV etiketi ekle.

Kullanıcı verileri:
${lines.join('\n')}
`
  }

  const send = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    const newMsgs = [...messages, { role: 'user', text: msg }]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)

    const ctx = buildCtx()
    const contents = [
      { role: 'user', parts: [{ text: ctx + 'Merhaba!' }] },
      { role: 'model', parts: [{ text: 'Merhaba! Fitness veya beslenme hakkında yardımcı olmaktan memnuniyet duyarım.' }] },
      ...newMsgs.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
    ]

    const reply = await callGemini(contents)
    if (reply) {
      const navMatch = reply.match(/\[NAV:(\w+)\]/)
      const navAction = navMatch ? navMatch[1] : null
      const cleanReply = reply.replace(/\[NAV:\w+\]/g, '').trim()
      setMessages(prev => [...prev, { role: 'assistant', text: cleanReply, navAction }])
    } else {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Yanıt alınamadı, tekrar dene.' }])
    }
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="AI Chatbot"
        style={{
          position: 'fixed',
          bottom: '76px',
          right: '16px',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: open
            ? 'rgba(10,10,10,0.9)'
            : 'linear-gradient(135deg, #e8ff47 0%, #b8e800 100%)',
          border: open
            ? '1.5px solid rgba(232,255,71,.4)'
            : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: open
            ? '0 0 0 1px rgba(232,255,71,.2), 0 0 24px rgba(232,255,71,.15), 0 4px 20px rgba(0,0,0,.5)'
            : '0 0 0 4px rgba(232,255,71,.12), 0 0 28px rgba(232,255,71,.35), 0 4px 20px rgba(0,0,0,.4)',
          zIndex: 900,
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: open ? 'scale(0.92)' : 'scale(1)',
          color: open ? 'rgba(232,255,71,0.9)' : '#0a0a0a',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.transform = 'scale(1)' }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <AIIcon size={24} />
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '140px',
            right: '16px',
            width: 'min(360px, calc(100vw - 32px))',
            height: '460px',
            background: 'rgba(10,10,10,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(232,255,71,.12)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 899,
            boxShadow: '0 0 0 1px rgba(232,255,71,.05), 0 0 60px rgba(232,255,71,.08), 0 24px 60px rgba(0,0,0,.6)',
            overflow: 'hidden',
            animation: 'chatPop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid rgba(232,255,71,.08)',
            background: 'rgba(232,255,71,.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(232,255,71,.2), rgba(71,200,255,.1))',
              border: '1px solid rgba(232,255,71,.25)',
              boxShadow: '0 0 16px rgba(232,255,71,.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#e8ff47',
            }}>
              <AIIcon size={16} />
            </div>
            <div>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 15, letterSpacing: 2,
                color: '#e8ff47',
              }}>
                KAVAFIT AI
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: 1 }}>
                  ONLINE
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: 'auto',
                width: 28, height: 28, borderRadius: 8,
                border: '1px solid rgba(255,255,255,.08)',
                background: 'rgba(255,255,255,.04)',
                color: 'rgba(255,255,255,.4)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'rgba(255,255,255,.7)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'rgba(255,255,255,.4)' }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(232,255,71,.1) transparent',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, rgba(232,255,71,.15), rgba(232,255,71,.08))'
                    : 'rgba(255,255,255,.05)',
                  border: m.role === 'user'
                    ? '1px solid rgba(232,255,71,.2)'
                    : '1px solid rgba(255,255,255,.06)',
                  color: m.role === 'user' ? '#e8ff47' : 'rgba(255,255,255,.8)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: m.role === 'user' ? '0 0 16px rgba(232,255,71,.06)' : 'none',
                }}>
                  {m.text}
                </div>
                {m.navAction && (
                  <button
                    onClick={() => { setActiveTab(m.navAction); setOpen(false) }}
                    style={{
                      marginTop: '6px',
                      padding: '5px 14px',
                      borderRadius: '20px',
                      border: '1px solid rgba(232,255,71,.3)',
                      background: 'rgba(232,255,71,.08)',
                      color: '#e8ff47',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Space Mono, monospace',
                      letterSpacing: 0.5,
                      transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,255,71,.15)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,255,71,.08)' }}
                  >
                    {NAV_LABELS[m.navAction] || `${m.navAction} →`}
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 0' }}>
                {[0, .15, .3].map((d, i) => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'rgba(232,255,71,.5)',
                    animation: `chatDot 1.2s ease infinite ${d}s`,
                    display: 'inline-block',
                  }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px 12px',
            borderTop: '1px solid rgba(232,255,71,.06)',
            background: 'rgba(0,0,0,.2)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Bir şey sor..."
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(232,255,71,.12)',
                background: 'rgba(255,255,255,.04)',
                color: 'rgba(255,255,255,.85)',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color .2s, box-shadow .2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(232,255,71,.35)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,255,71,.06)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(232,255,71,.12)'; e.target.style.boxShadow = 'none' }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #e8ff47, #b8e800)'
                  : 'rgba(255,255,255,.06)',
                color: input.trim() && !loading ? '#0a0a0a' : 'rgba(255,255,255,.2)',
                fontSize: '16px',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading ? 0.6 : 1,
                flexShrink: 0,
                transition: 'all .2s',
                boxShadow: input.trim() && !loading ? '0 0 16px rgba(232,255,71,.3)' : 'none',
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatPop {
          from { opacity: 0; transform: scale(0.92) translateY(8px); transform-origin: bottom right; }
          to { opacity: 1; transform: scale(1) translateY(0); transform-origin: bottom right; }
        }
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </>
  )
}
