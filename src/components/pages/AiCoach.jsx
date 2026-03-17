import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

const GKEY = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'

const ACTIVITIES = [
  { id:'walking',    label:'Yürüyüş',          icon:'🚶', met:3.5  },
  { id:'running',    label:'Koşu',              icon:'🏃', met:9.8  },
  { id:'cycling',    label:'Bisiklet',          icon:'🚴', met:7.5  },
  { id:'swimming',   label:'Yüzme',             icon:'🏊', met:8.0  },
  { id:'gym',        label:'Ağırlık Antrenman', icon:'🏋️', met:5.0  },
  { id:'hiit',       label:'HIIT',              icon:'⚡', met:10.0 },
  { id:'yoga',       label:'Yoga',              icon:'🧘', met:2.5  },
  { id:'football',   label:'Futbol',            icon:'⚽', met:7.0  },
  { id:'basketball', label:'Basketbol',         icon:'🏀', met:6.5  },
  { id:'dance',      label:'Dans',              icon:'💃', met:5.0  },
  { id:'hiking',     label:'Doğa Yürüyüşü',    icon:'🥾', met:6.0  },
  { id:'rowing',     label:'Kürek / Ergometre', icon:'🚣', met:8.5  },
]

const QUICK_PROMPTS = [
  '3 günlük kilo verme planı yazar mısın?',
  'Yüksek proteinli 1 günlük beslenme listesi',
  'Spor öncesi ve sonrası ne yemeliyim?',
  'Düşük karbonhidratlı diyet örneği',
  'Vejetaryen protein kaynakları neler?',
  'Kahvaltıda ne yemeliyim kilo vermek için?',
]

export default function AiCoachPage() {
  const { profile, goals, foods } = useApp()

  // ── Kalori Hesap state ──
  const [weight,   setWeight]   = useState(profile?.weight || '')
  const [age,      setAge]      = useState(profile?.age    || '')
  const [gender,   setGender]   = useState(profile?.gender || 'male')
  const [height,   setHeight]   = useState(profile?.height || '')
  const [activity, setActivity] = useState('')
  const [duration, setDuration] = useState('')
  const [kcalResult, setKcalResult] = useState(null)
  const [calcLoading, setCalcLoading] = useState(false)
  const [calcTips, setCalcTips] = useState(null)

  // ── Beslenme Asistanı state ──
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '👋 Merhaba! Ben KeroGym\'in beslenme asistanıyım.\n\nBeslenme planı, kalori hesabı, diyet önerileri veya besin değerleri hakkında her şeyi sorabilirsin. Aşağıdaki hızlı sorulardan birini seçebilir ya da kendi sorunuzu yazabilirsin.',
    }
  ])
  const [chatInput, setChatInput]   = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Kalori Hesapla ──
  const calcCalories = () => {
    if (!weight || !activity || !duration) return null
    const act = ACTIVITIES.find(a => a.id === activity)
    if (!act) return null
    return Math.round(act.met * +weight * (+duration / 60))
  }

  const handleCalc = async () => {
    const kcal = calcCalories()
    if (!kcal) return
    const act = ACTIVITIES.find(a => a.id === activity)
    setKcalResult(kcal)
    setCalcTips(null)
    setCalcLoading(true)

    const prompt = `Sen bir fitness ve beslenme koçusun. Kullanıcı:
- ${gender === 'male' ? 'Erkek' : 'Kadın'}, ${age || '?'} yaş, ${weight} kg, ${height || '?'} cm
- Aktivite: ${act.label}, ${duration} dakika
- Yakılan kalori: ~${kcal} kcal

Şunları yap (Türkçe, kısa ve net):
1. Bu antrenman hakkında 1-2 cümle değerlendirme
2. Bu kalorileri karşılamak için 2-3 besin önerisi (emoji ile)
3. Performansı artırmak için 1-2 ipucu

150 kelimeyi geçme. Madde madde yaz.`

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GKEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        }
      )
      const data = await res.json()
      setCalcTips(data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt alınamadı.')
    } catch {
      setCalcTips('AI yanıtı alınamadı, tekrar dene.')
    }
    setCalcLoading(false)
  }

  // ── Beslenme Asistanı Chat ──
  const buildSystemContext = () => {
    const parts = []
    if (profile) {
      parts.push(`Kullanıcı profili: ${profile.gender === 'male' ? 'Erkek' : 'Kadın'}, ${profile.age || '?'} yaş, ${profile.weight || '?'} kg, ${profile.height || '?'} cm`)
      if (profile.goal) parts.push(`Hedef: ${profile.goal === 'lose' ? 'Kilo vermek' : profile.goal === 'gain' ? 'Kilo almak' : profile.goal === 'cut' ? 'Yağ yakmak' : 'Kiloyu korumak'}`)
      if (profile.tdee) parts.push(`Günlük kalori ihtiyacı: ~${profile.tdee} kcal`)
    }
    if (goals) parts.push(`Günlük makro hedefler: ${goals.kcal} kcal, ${goals.protein}g protein, ${goals.fat}g yağ, ${goals.carb}g karb`)
    if (foods?.length > 0) {
      const tot = foods.reduce((t, f) => ({ kcal: t.kcal + (+f.kcal || 0), protein: t.protein + (+f.protein || 0) }), { kcal: 0, protein: 0 })
      parts.push(`Bugün tüketilen: ${Math.round(tot.kcal)} kcal, ${Math.round(tot.protein)}g protein`)
    }
    return parts.length > 0
      ? `Sen KeroGym uygulamasının beslenme asistanısın. Türkçe yanıt ver, net ve detaylı ol. Yanıtlarını ASLA yarıda kesme, her zaman tam ve eksiksiz ver.\n\nKullanıcı bilgileri:\n${parts.join('\n')}\n\n`
      : `Sen KeroGym uygulamasının beslenme asistanısın. Türkçe yanıt ver, net ve detaylı ol. Yanıtlarını ASLA yarıda kesme, her zaman tam ve eksiksiz ver.\n\n`
  }

  const sendMessage = async (text) => {
    const msg = text || chatInput.trim()
    if (!msg || chatLoading) return

    const userMsg = { role: 'user', text: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setChatInput('')
    setChatLoading(true)

    const systemPrompt = buildSystemContext()
    const contents = [
      { role: 'user',  parts: [{ text: systemPrompt + 'Merhaba, beslenme konusunda yardım istiyorum.' }] },
      { role: 'model', parts: [{ text: 'Merhaba! Beslenme ve diyet konusunda sana yardımcı olmaktan memnuniyet duyarım. Ne sormak istersin?' }] },
      ...newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
    ]

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GKEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        }
      )
      const data = await res.json()
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt alınamadı, tekrar dene.'
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Bağlantı hatası, tekrar dene.' }])
    }
    setChatLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectedAct = ACTIVITIES.find(a => a.id === activity)

  return (
    <div className="page animate-fade" style={{ maxWidth: 700 }}>

      {/* ══════════ AKTİVİTE KALORİ HESAPLAYICI ══════════ */}
      <div className="section-title">🔥 AKTİVİTE KALORİ HESAPLAYICI</div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        {/* Kişisel bilgiler */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 14 }}>
          <div className="form-group">
            <span className="flabel">Cinsiyet</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['male', '👨 Erkek'], ['female', '👩 Kadın']].map(([v, l]) => (
                <div key={v} onClick={() => setGender(v)} style={{
                  flex: 1, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                  background: gender === v ? 'rgba(232,255,71,.08)' : 'var(--surface2)',
                  border: `1px solid ${gender === v ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                  fontFamily: 'DM Mono,monospace', fontSize: 11,
                  color: gender === v ? 'var(--accent)' : 'var(--text-muted)',
                }}>{l}</div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <span className="flabel">Kilo (kg)</span>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="75" />
          </div>
          <div className="form-group">
            <span className="flabel">Yaş</span>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25" />
          </div>
          <div className="form-group">
            <span className="flabel">Boy (cm)</span>
            <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" />
          </div>
        </div>

        {/* Aktivite seçimi */}
        <div className="form-group" style={{ marginBottom: 12 }}>
          <span className="flabel">Aktivite</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {ACTIVITIES.map(act => (
              <div key={act.id} onClick={() => setActivity(act.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                background: activity === act.id ? 'rgba(232,255,71,.08)' : 'var(--surface2)',
                border: `1px solid ${activity === act.id ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                transition: 'all .15s',
              }}>
                <span style={{ fontSize: 15 }}>{act.icon}</span>
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: activity === act.id ? 'var(--accent)' : 'var(--text-muted)' }}>{act.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Süre */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <span className="flabel">Süre (dakika)</span>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="45" />
        </div>

        <button className="btn btn-primary" onClick={handleCalc}
          disabled={!weight || !activity || !duration}
          style={{ width: '100%', opacity: (!weight || !activity || !duration) ? .4 : 1 }}>
          🔥 Kalori Hesapla
        </button>
      </div>

      {/* Sonuç */}
      {kcalResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,255,71,.08), rgba(232,255,71,.03))',
            border: '1px solid rgba(232,255,71,.2)', borderRadius: 14, padding: '20px 22px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ fontSize: 36 }}>🔥</div>
            <div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, letterSpacing: 3, color: 'var(--text-muted)', marginBottom: 4 }}>
                {selectedAct?.label?.toUpperCase()} · {duration} DAK
              </div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 48, lineHeight: 1, color: 'var(--accent)' }}>
                {kcalResult} <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>KCAL</span>
              </div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {weight} kg · MET {selectedAct?.met}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width:28,height:28,borderRadius:7,background:'rgba(232,255,71,.12)',border:'1px solid rgba(232,255,71,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>🤖</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 14, letterSpacing: 2 }}>AI KOÇ ÖNERİSİ</div>
            </div>
            {calcLoading
              ? <div style={{ display:'flex',alignItems:'center',gap:10,color:'var(--text-muted)',fontFamily:'DM Mono,monospace',fontSize:12 }}>
                  <span className="spinner" /> Yapay zeka düşünüyor...
                </div>
              : calcTips
                ? <div style={{ fontSize:13,color:'var(--text-dim)',lineHeight:1.9,fontFamily:'DM Sans,sans-serif',whiteSpace:'pre-wrap' }}>{calcTips}</div>
                : null
            }
          </div>
        </div>
      )}

      {/* ══════════ BESLENME PLANI YARDIMCISI ══════════ */}
      <div className="section-title" style={{ marginTop: 8 }}>🥗 BESLENME PLANI YARDIMCISI</div>

      {/* Chat kutusu */}
      <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>

        {/* Mesajlar */}
        <div style={{ padding:'16px 16px 0', maxHeight:420, overflowY:'auto', display:'flex', flexDirection:'column', gap:12, scrollbarWidth:'thin' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}>
              {/* Avatar */}
              <div style={{
                width:28, height:28, borderRadius:'50%', flexShrink:0,
                background: msg.role === 'user' ? 'var(--accent)' : 'rgba(71,200,255,.15)',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(71,200,255,.3)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, color: msg.role === 'user' ? '#0a0a0a' : '#47c8ff',
                fontFamily:'Bebas Neue,sans-serif',
              }}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>

              {/* Balon */}
              <div style={{
                maxWidth: '78%',
                background: msg.role === 'user' ? 'rgba(232,255,71,.1)' : 'var(--surface2)',
                border: msg.role === 'user' ? '1px solid rgba(232,255,71,.2)' : '1px solid var(--border)',
                borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                padding: '10px 14px',
              }}>
                <div style={{
                  fontSize:13, lineHeight:1.75,
                  color: msg.role === 'user' ? 'var(--accent)' : 'var(--text-dim)',
                  fontFamily:'DM Sans,sans-serif',
                  whiteSpace:'pre-wrap', wordBreak:'break-word',
                }}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {chatLoading && (
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <div style={{ width:28,height:28,borderRadius:'50%',background:'rgba(71,200,255,.15)',border:'1px solid rgba(71,200,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13 }}>🤖</div>
              <div style={{ background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'4px 14px 14px 14px',padding:'12px 16px',display:'flex',gap:5,alignItems:'center' }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--text-muted)',animation:'pulse 1.2s ease infinite' }} />
                <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--text-muted)',animation:'pulse 1.2s ease infinite .2s' }} />
                <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--text-muted)',animation:'pulse 1.2s ease infinite .4s' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Hızlı sorular */}
        <div style={{ padding:'12px 16px 0', display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none' }}>
          {QUICK_PROMPTS.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} disabled={chatLoading} style={{
              padding:'5px 12px', borderRadius:20, border:'1px solid var(--border)',
              background:'var(--surface2)', color:'var(--text-muted)',
              fontFamily:'DM Mono,monospace', fontSize:10, cursor:'pointer', whiteSpace:'nowrap',
              transition:'all .15s', flexShrink:0, opacity: chatLoading ? .5 : 1,
            }}
              onMouseEnter={e => { if(!chatLoading) { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)' }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)' }}
            >{q}</button>
          ))}
        </div>

        {/* Input alanı */}
        <div style={{ padding:'12px 16px 16px', display:'flex', gap:8, alignItems:'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Beslenme planı, kalori, diyet önerisi... (Enter = gönder, Shift+Enter = yeni satır)"
            disabled={chatLoading}
            rows={2}
            style={{
              flex:1, background:'var(--surface2)', border:'1px solid var(--border)',
              borderRadius:10, color:'var(--text)', fontSize:13, padding:'10px 12px',
              outline:'none', resize:'none', fontFamily:'DM Sans,sans-serif',
              lineHeight:1.5, transition:'border-color .2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!chatInput.trim() || chatLoading}
            style={{
              width:42, height:42, borderRadius:10, border:'none',
              background: chatInput.trim() && !chatLoading ? 'var(--accent)' : 'var(--surface2)',
              color: chatInput.trim() && !chatLoading ? '#0a0a0a' : 'var(--text-muted)',
              cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'not-allowed',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, transition:'all .2s', flexShrink:0,
            }}>
            {chatLoading
              ? <span className="spinner" style={{ width:16, height:16, borderTopColor:'var(--text-muted)' }} />
              : '↑'}
          </button>
        </div>
      </div>

      {/* Sohbeti temizle */}
      {messages.length > 1 && (
        <div style={{ textAlign: 'right' }}>
          <button onClick={() => setMessages([{
            role: 'assistant',
            text: '👋 Merhaba! Ben KeroGym\'in beslenme asistanıyım.\n\nBeslenme planı, kalori hesabı, diyet önerileri veya besin değerleri hakkında her şeyi sorabilirsin.',
          }])} style={{
            background:'none', border:'none', cursor:'pointer',
            fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace',
            textDecoration:'underline', textUnderlineOffset:2,
          }}>Sohbeti Temizle</button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:.3; transform:scale(.8); }
          50% { opacity:1; transform:scale(1.2); }
        }
      `}</style>
    </div>
  )
}
