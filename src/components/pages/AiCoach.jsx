import { useState } from 'react'

const GKEY = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'

const ACTIVITIES = [
  { id:'walking',    label:'Yürüyüş',         icon:'🚶', met:3.5 },
  { id:'running',    label:'Koşu',             icon:'🏃', met:9.8 },
  { id:'cycling',    label:'Bisiklet',         icon:'🚴', met:7.5 },
  { id:'swimming',   label:'Yüzme',            icon:'🏊', met:8.0 },
  { id:'gym',        label:'Ağırlık Antrenman',icon:'🏋️', met:5.0 },
  { id:'hiit',       label:'HIIT',             icon:'⚡', met:10.0 },
  { id:'yoga',       label:'Yoga',             icon:'🧘', met:2.5 },
  { id:'football',   label:'Futbol',           icon:'⚽', met:7.0 },
  { id:'basketball', label:'Basketbol',        icon:'🏀', met:6.5 },
  { id:'dance',      label:'Dans',             icon:'💃', met:5.0 },
  { id:'hiking',     label:'Doğa Yürüyüşü',   icon:'🥾', met:6.0 },
  { id:'rowing',     label:'Kürek / Ergometre',icon:'🚣', met:8.5 },
]

export default function AiCoachPage() {
  const [weight, setWeight]     = useState('')
  const [age, setAge]           = useState('')
  const [gender, setGender]     = useState('male')
  const [height, setHeight]     = useState('')
  const [activity, setActivity] = useState('')
  const [duration, setDuration] = useState('')
  const [result, setResult]     = useState(null)
  const [aiTips, setAiTips]     = useState(null)
  const [loading, setLoading]   = useState(false)

  const calcCalories = () => {
    if (!weight || !activity || !duration) return null
    const act = ACTIVITIES.find(a => a.id === activity)
    if (!act) return null
    const kcal = Math.round(act.met * +weight * (+duration / 60))
    return kcal
  }

  const handleCalc = async () => {
    const kcal = calcCalories()
    if (!kcal) return
    const act = ACTIVITIES.find(a => a.id === activity)
    setResult(kcal)
    setAiTips(null)
    setLoading(true)

    const prompt = `Sen bir fitness ve beslenme koçusun. Kullanıcı hakkında bilgi:
- Cinsiyet: ${gender === 'male' ? 'Erkek' : 'Kadın'}
- Kilo: ${weight} kg
- Boy: ${height || '?'} cm
- Yaş: ${age || '?'}
- Aktivite: ${act.label}
- Süre: ${duration} dakika
- Yakılan kalori: ~${kcal} kcal

Şunları yap (Türkçe, kısa ve net):
1. Bu antrenman hakkında 1-2 cümle değerlendirme
2. Bu kalorileri karşılamak için 2-3 besin önerisi (emoji ile)
3. Performansı artırmak için 1-2 ipucu

Toplam yanıt 150 kelimeyi geçmesin. Madde madde yaz.`

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GKEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
          })
        }
      )
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      setAiTips(text)
    } catch {
      setAiTips('AI yanıtı alınamadı, tekrar dene.')
    }
    setLoading(false)
  }

  const selectedAct = ACTIVITIES.find(a => a.id === activity)

  return (
    <div className="page animate-fade" style={{ maxWidth: 700 }}>
      <div className="section-title">AI ANTRENMAN KOÇU</div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7, fontFamily: 'DM Mono,monospace' }}>
        Aktiviteni ve bilgilerini gir → Kaç kalori yaktığını hesapla → Yapay zeka koçundan öneriler al.
      </p>

      {/* Kişisel Bilgiler */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title">KİŞİSEL BİLGİLER</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div className="form-group">
            <span className="flabel">Cinsiyet</span>
            <select value={gender} onChange={e => setGender(e.target.value)}>
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
            </select>
          </div>
          <div className="form-group">
            <span className="flabel">Kilo (kg)</span>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="75" min="30" max="200" />
          </div>
          <div className="form-group">
            <span className="flabel">Boy (cm)</span>
            <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" min="100" max="250" />
          </div>
          <div className="form-group">
            <span className="flabel">Yaş</span>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25" min="10" max="100" />
          </div>
        </div>
      </div>

      {/* Aktivite Seçimi */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title">AKTİVİTE SEÇ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
          {ACTIVITIES.map(a => (
            <div key={a.id} onClick={() => setActivity(a.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
              background: activity === a.id ? 'rgba(232,255,71,.08)' : 'var(--surface2)',
              border: `1px solid ${activity === a.id ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
              transition: 'all .15s', userSelect: 'none',
            }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <span style={{
                fontFamily: 'DM Mono,monospace', fontSize: 10,
                color: activity === a.id ? 'var(--accent)' : 'var(--text-muted)',
              }}>{a.label}</span>
            </div>
          ))}
        </div>

        <div className="form-group">
          <span className="flabel">Süre (dakika)</span>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
            placeholder="45" min="1" max="300" style={{ maxWidth: 160 }} />
        </div>
      </div>

      {/* Hesapla */}
      <button className="btn btn-primary" onClick={handleCalc}
        disabled={!weight || !activity || !duration}
        style={{
          width: '100%', padding: 14, fontSize: 15, marginBottom: 20,
          opacity: (!weight || !activity || !duration) ? 0.4 : 1,
          cursor: (!weight || !activity || !duration) ? 'not-allowed' : 'pointer',
        }}>
        {loading
          ? <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#0a0a0a', marginRight: 8 }} /> Hesaplanıyor...</>
          : '🔥 Kalori Hesapla & Koç Önerisi Al'
        }
      </button>

      {/* Sonuç */}
      {result !== null && (
        <div className="animate-fade">
          {/* Kalori kartı */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,255,71,.1) 0%, rgba(232,255,71,.03) 100%)',
            border: '1px solid rgba(232,255,71,.25)',
            borderRadius: 16, padding: '24px 28px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 20,
          }}>
            <div style={{ fontSize: 48 }}>{selectedAct?.icon}</div>
            <div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, letterSpacing: 3, color: 'var(--text-muted)', marginBottom: 4 }}>
                {selectedAct?.label?.toUpperCase()} · {duration} DAKİKA
              </div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 52, lineHeight: 1, color: 'var(--accent)' }}>
                {result} <span style={{ fontSize: 20, color: 'var(--text-muted)' }}>KCAL</span>
              </div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {weight} kg · MET {selectedAct?.met}
              </div>
            </div>
          </div>

          {/* AI Koç */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(232,255,71,.12)', border: '1px solid rgba(232,255,71,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>🤖</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 15, letterSpacing: 2 }}>AI KOÇ ÖNERİSİ</div>
            </div>
            {loading
              ? <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace', fontSize: 12 }}>
                  <span className="spinner" /> Yapay zeka düşünüyor...
                </div>
              : aiTips
                ? <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.8, fontFamily: 'DM Sans,sans-serif', whiteSpace: 'pre-wrap' }}>
                    {aiTips}
                  </div>
                : null
            }
          </div>
        </div>
      )}
    </div>
  )
}
