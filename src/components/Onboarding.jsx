import { useState } from 'react'
import { useApp } from '../context/AppContext'

const GOALS = [
  { id:'lose',     icon:'🔥', label:'Kilo Ver',    desc:'Yağ yakarak ideal kiloya ulaş' },
  { id:'maintain', icon:'⚖️', label:'Kilo Koru',   desc:'Mevcut kilonu dengede tut' },
  { id:'gain',     icon:'💪', label:'Kilo Al',      desc:'Kas kitlesi ve hacim kazan' },
  { id:'cut',      icon:'✂️', label:'Yağ Yak',      desc:'Kası koru, yağı azalt' },
]

const SPORT_TYPES = [
  { id:'gym',     icon:'🏋️', label:'Gym / Ağırlık' },
  { id:'cardio',  icon:'🏃', label:'Cardio / Koşu' },
  { id:'yoga',    icon:'🧘', label:'Yoga / Pilates' },
  { id:'crossfit',icon:'⚡', label:'CrossFit / HIIT' },
  { id:'swim',    icon:'🏊', label:'Yüzme' },
  { id:'football',icon:'⚽', label:'Futbol / Takım' },
  { id:'diet',    icon:'🥗', label:'Sadece Diyet' },
  { id:'mixed',   icon:'🎯', label:'Karma Program' },
]

const LEVELS = [
  { id:'beginner',     icon:'🌱', label:'Yeni Başlayan', desc:'6 aydan az spor geçmişi' },
  { id:'intermediate', icon:'🌿', label:'Orta Seviye',   desc:'6 ay - 2 yıl spor geçmişi' },
  { id:'advanced',     icon:'🌳', label:'İleri Seviye',  desc:'2 yıldan fazla spor geçmişi' },
]

const DAYS = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']

const ACTIVITY_LEVELS = [
  { val:'1.2',   label:'Hareketsiz',        desc:'Masa başı iş, az hareket' },
  { val:'1.375', label:'Az Aktif',           desc:'Haftada 1-3 gün spor' },
  { val:'1.55',  label:'Orta Aktif',         desc:'Haftada 3-5 gün spor' },
  { val:'1.725', label:'Çok Aktif',          desc:'Haftada 6-7 gün spor' },
  { val:'1.9',   label:'Ekstra Aktif',       desc:'Günde 2x antrenman' },
]

export default function Onboarding({ onComplete }) {
  const { saveProfile, saveGoals, saveBody } = useApp()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    goal: '', sportTypes: [], level: '', trainDays: [],
    gender: 'male', age: '', weight: '', height: '',
    waist: '', activity: '1.55',
  })

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const toggle = (key, val) => setForm(p => ({
    ...p, [key]: p[key].includes(val) ? p[key].filter(v=>v!==val) : [...p[key], val]
  }))

  const steps = [
    { title: 'Hedefin Ne?', subtitle: 'Sana özel program oluşturalım' },
    { title: 'Hangi Sporla İlgileniyorsun?', subtitle: 'Birden fazla seçebilirsin' },
    { title: 'Deneyim Seviyeni Seç', subtitle: 'Dürüst ol, seni daha iyi yönlendirelim' },
    { title: 'Kişisel Bilgilerin', subtitle: 'Kalori ve makro hesabı için gerekli' },
    { title: 'Antrenman Günlerin', subtitle: 'Haftada kaç gün antrenman yapmak istiyorsun?' },
  ]

  const canNext = () => {
    if (step === 0) return !!form.goal
    if (step === 1) return form.sportTypes.length > 0
    if (step === 2) return !!form.level
    if (step === 3) return form.age && form.weight && form.height
    if (step === 4) return form.trainDays.length > 0
    return true
  }

  const calcTDEE = () => {
    const { weight, height, age, gender, activity } = form
    if (!weight || !height || !age) return null
    const bmr = gender === 'male'
      ? 10 * +weight + 6.25 * +height - 5 * +age + 5
      : 10 * +weight + 6.25 * +height - 5 * +age - 161
    return Math.round(bmr * +activity)
  }

  const handleComplete = () => {
    const tdee = calcTDEE()
    const profileData = { ...form, tdee, completedAt: Date.now() }
    saveProfile(profileData)

    // İlk vücut ölçümü kaydet
    if (form.weight) {
      const today = new Date().toISOString().slice(0, 10)
      saveBody([{ date: today, weight: +form.weight, waist: +form.waist || null, chest: null, hip: null, neck: null }])
    }

    onComplete()
  }

  const next = () => step < steps.length - 1 ? setStep(s => s+1) : handleComplete()
  const back = () => setStep(s => s-1)

  const progress = ((step + 1) / steps.length) * 100

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: 20, overflowY: 'auto',
    }}>
      <div style={{ width: 'min(520px,100%)', animation: 'fadeIn .3s ease' }}>

        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)' }}>
              ADIM {step + 1} / {steps.length}
            </div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--accent)' }}>
              {Math.round(progress)}%
            </div>
          </div>
          <div style={{ background: 'var(--surface2)', borderRadius: 20, height: 4 }}>
            <div style={{ height: '100%', borderRadius: 20, background: 'var(--accent)', width: `${progress}%`, transition: 'width .4s ease' }} />
          </div>
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <img src="/logo-sm.png" alt="" style={{ height: 28, width: 'auto' }} />
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 3, color: 'var(--accent)' }}>
            KERO<span style={{ color: 'var(--text-muted)' }}>GYM</span>
          </div>
        </div>

        {/* Step title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 32, letterSpacing: 2, marginBottom: 6 }}>
            {steps[step].title}
          </div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>
            {steps[step].subtitle}
          </div>
        </div>

        {/* Step 0: Hedef */}
        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {GOALS.map(g => (
              <div key={g.id} onClick={() => set('goal', g.id)} style={{
                padding: '20px 16px', borderRadius: 14, cursor: 'pointer',
                background: form.goal === g.id ? 'rgba(232,255,71,.08)' : 'var(--surface)',
                border: `1px solid ${form.goal === g.id ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                transition: 'all .15s', userSelect: 'none',
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{g.icon}</div>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 2, color: form.goal === g.id ? 'var(--accent)' : 'var(--text)', marginBottom: 4 }}>{g.label}</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>{g.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Spor türü */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {SPORT_TYPES.map(s => {
              const sel = form.sportTypes.includes(s.id)
              return (
                <div key={s.id} onClick={() => toggle('sportTypes', s.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                  background: sel ? 'rgba(232,255,71,.08)' : 'var(--surface)',
                  border: `1px solid ${sel ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                  transition: 'all .15s', userSelect: 'none',
                }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: sel ? 'var(--accent)' : 'var(--text-muted)' }}>{s.label}</span>
                  {sel && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 14 }}>✓</span>}
                </div>
              )
            })}
          </div>
        )}

        {/* Step 2: Seviye */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {LEVELS.map(l => (
              <div key={l.id} onClick={() => set('level', l.id)} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 20px', borderRadius: 14, cursor: 'pointer',
                background: form.level === l.id ? 'rgba(232,255,71,.08)' : 'var(--surface)',
                border: `1px solid ${form.level === l.id ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                transition: 'all .15s', userSelect: 'none',
              }}>
                <span style={{ fontSize: 28 }}>{l.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 2, color: form.level === l.id ? 'var(--accent)' : 'var(--text)' }}>{l.label}</div>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{l.desc}</div>
                </div>
                {form.level === l.id && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 18 }}>✓</span>}
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Kişisel bilgiler */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Cinsiyet */}
            <div className="form-group">
              <span className="flabel">Cinsiyet</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['male','👨 Erkek'],['female','👩 Kadın']].map(([val,lbl]) => (
                  <div key={val} onClick={() => set('gender', val)} style={{
                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                    background: form.gender === val ? 'rgba(232,255,71,.08)' : 'var(--surface2)',
                    border: `1px solid ${form.gender === val ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                    fontFamily: 'DM Mono,monospace', fontSize: 12,
                    color: form.gender === val ? 'var(--accent)' : 'var(--text-muted)',
                  }}>{lbl}</div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[
                { key:'age',    label:'Yaş',        ph:'25', unit:'yıl' },
                { key:'weight', label:'Kilo',        ph:'75', unit:'kg' },
                { key:'height', label:'Boy',         ph:'175',unit:'cm' },
              ].map(({ key, label, ph, unit }) => (
                <div key={key} className="form-group">
                  <span className="flabel">{label} ({unit})</span>
                  <input type="number" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <span className="flabel">Bel Çevresi (cm) — opsiyonel</span>
                <input type="number" value={form.waist} onChange={e => set('waist', e.target.value)} placeholder="80" />
              </div>
              <div className="form-group">
                <span className="flabel">Aktivite Seviyesi</span>
                <select value={form.activity} onChange={e => set('activity', e.target.value)}>
                  {ACTIVITY_LEVELS.map(a => <option key={a.val} value={a.val}>{a.label} — {a.desc}</option>)}
                </select>
              </div>
            </div>

            {/* TDEE preview */}
            {form.weight && form.height && form.age && (
              <div style={{ background: 'rgba(232,255,71,.06)', border: '1px solid rgba(232,255,71,.15)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>TAHMİNİ GÜNLÜK KALORİ İHTİYACI</div>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, color: 'var(--accent)' }}>
                  {calcTDEE()} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>kcal/gün</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Antrenman günleri */}
        {step === 4 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 20 }}>
              {DAYS.map((day, i) => {
                const sel = form.trainDays.includes(i)
                return (
                  <div key={i} onClick={() => toggle('trainDays', i)} style={{
                    padding: '12px 4px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    background: sel ? 'rgba(232,255,71,.08)' : 'var(--surface)',
                    border: `1px solid ${sel ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                    transition: 'all .15s', userSelect: 'none',
                  }}>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 1, color: sel ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 4 }}>{day}</div>
                    <div style={{ fontSize: sel ? 18 : 14 }}>{sel ? '💪' : '⬜'}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
              {form.trainDays.length} gün seçildi
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={back} style={{ flex: 1, justifyContent: 'center' }}>
              ← Geri
            </button>
          )}
          <button className="btn btn-primary" onClick={next} disabled={!canNext()} style={{
            flex: 2, justifyContent: 'center', padding: 14, fontSize: 14,
            opacity: canNext() ? 1 : 0.4, cursor: canNext() ? 'pointer' : 'not-allowed',
          }}>
            {step === steps.length - 1 ? '🚀 Başla!' : 'Devam →'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={onComplete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace' }}>
            Şimdilik geç
          </button>
        </div>
      </div>
    </div>
  )
}
