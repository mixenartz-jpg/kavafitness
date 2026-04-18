import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']

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
        style={{
          position: 'fixed',
          bottom: '76px',
          right: '16px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--accent)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          zIndex: 900,
          transition: 'transform 0.25s, opacity 0.25s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          color: '#0a0a0a',
        }}
        aria-label="AI Chatbot"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '136px',
            right: '16px',
            width: 'min(340px, calc(100vw - 32px))',
            height: '420px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 899,
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            animation: 'chatSlideUp 0.2s ease',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            background: 'var(--accent)',
            color: '#0a0a0a',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Bebas Neue, sans-serif',
            letterSpacing: 1,
          }}>
            💬 KavaFit Bot
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            scrollbarWidth: 'thin',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '8px 12px',
                  borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: m.role === 'user' ? 'var(--accent)' : 'var(--surface2, var(--bg))',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  color: m.role === 'user' ? '#0a0a0a' : 'var(--text)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {m.text}
                </div>
                {m.navAction && (
                  <button
                    onClick={() => { setActiveTab(m.navAction); setOpen(false) }}
                    style={{
                      marginTop: '5px',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      background: 'var(--accent)',
                      color: '#0a0a0a',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Space Mono, monospace',
                    }}
                  >
                    {NAV_LABELS[m.navAction] || `${m.navAction} →`}
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic', fontFamily: 'Space Mono, monospace' }}>
                Yazıyor...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--border)',
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
                padding: '8px 12px',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: 'var(--accent)',
                color: '#0a0a0a',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading || !input.trim() ? 0.5 : 1,
                flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes chatSlideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </>
  )
}
