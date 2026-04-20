import { useState, useRef, useEffect, useCallback } from 'react'
import { useApp } from '../../context/AppContext'

const PT_PASSWORD = 'kerembaba12358'
const PT_KEY = 'pt_unlocked'

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
          body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 1400 } }),
        }
      )
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text
    } catch { continue }
  }
  return null
}

const MUSCLE_MAP = [
  { keys: ['bench', 'chest', 'pec', 'fly', 'crossover'], groups: ['chest', 'triceps', 'shoulders'] },
  { keys: ['squat', 'leg press', 'lunge', 'quad', 'leg ext'], groups: ['legs', 'glutes', 'core'] },
  { keys: ['deadlift', 'rdl', 'stiff'], groups: ['back', 'legs', 'glutes'] },
  { keys: ['row', 'pull', 'lat', 'pulldown', 'chin', 'back'], groups: ['back', 'biceps'] },
  { keys: ['curl', 'bicep', 'hammer'], groups: ['biceps'] },
  { keys: ['tricep', 'pushdown', 'dip', 'skull', 'extension'], groups: ['triceps'] },
  { keys: ['shoulder', 'lateral', 'raise', 'overhead', 'ohp', 'military', 'press'], groups: ['shoulders'] },
  { keys: ['calf', 'standing calf'], groups: ['legs'] },
  { keys: ['glute', 'hip thrust', 'kickback'], groups: ['glutes'] },
  { keys: ['plank', 'crunch', 'ab', 'core', 'oblique', 'sit-up'], groups: ['core'] },
]

function getMuscles(exercises) {
  const muscles = new Set()
  exercises.forEach(ex => {
    const name = (ex.name || '').toLowerCase()
    MUSCLE_MAP.forEach(({ keys, groups }) => {
      if (keys.some(k => name.includes(k))) groups.forEach(g => muscles.add(g))
    })
  })
  return Array.from(muscles)
}

const MUSCLE_LEGEND = [
  { key: 'chest', label: 'Göğüs', color: '#ef4444' },
  { key: 'back', label: 'Sırt', color: '#3b82f6' },
  { key: 'shoulders', label: 'Omuz', color: '#f59e0b' },
  { key: 'biceps', label: 'Biceps', color: '#10b981' },
  { key: 'triceps', label: 'Triceps', color: '#8b5cf6' },
  { key: 'legs', label: 'Bacak', color: '#ec4899' },
  { key: 'core', label: 'Core', color: '#f97316' },
  { key: 'glutes', label: 'Kalça', color: '#06b6d4' },
]

const QUICK_PROMPTS = [
  'Bench günü 💪',
  'Squat günü 🦵',
  'Push Day 🏋️',
  'Pull Day 🔙',
  'Bacak + Kalça 🍑',
  'Core & Karın 🔥',
  'Full Body 💥',
]

// ── Animated Background Canvas ──
function AnimatedBackground({ activeGroups }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  const muscleColorMap = {
    chest: '#ef4444',
    back: '#3b82f6',
    shoulders: '#f59e0b',
    biceps: '#10b981',
    triceps: '#8b5cf6',
    legs: '#ec4899',
    core: '#f97316',
    glutes: '#06b6d4',
  }

  const activeColor = activeGroups.length > 0
    ? muscleColorMap[activeGroups[0]] || '#e8ff47'
    : '#e8ff47'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 60 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.004,
    }))

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * 2,
      vy: -(0.2 + Math.random() * 0.5),
      opacity: Math.random(),
    }))

    let t = 0
    const draw = () => {
      t += 1
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Dark base
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Animated orbs
      orbs.forEach((orb, idx) => {
        orb.phase += orb.speed
        const pulse = Math.sin(orb.phase) * 0.3 + 0.7
        orb.x += orb.vx
        orb.y += orb.vy
        if (orb.x < -orb.r) orb.x = canvas.width + orb.r
        if (orb.x > canvas.width + orb.r) orb.x = -orb.r
        if (orb.y < -orb.r) orb.y = canvas.height + orb.r
        if (orb.y > canvas.height + orb.r) orb.y = -orb.r

        const color = idx % 2 === 0 ? activeColor : '#47c8ff'
        const grd = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * pulse)
        const alpha = (0.06 + idx * 0.01).toFixed(2)
        grd.addColorStop(0, color + Math.round(parseFloat(alpha) * 255).toString(16).padStart(2, '0'))
        grd.addColorStop(1, 'transparent')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.r * pulse, 0, Math.PI * 2)
        ctx.fill()
      })

      // Grid lines
      ctx.strokeStyle = 'rgba(232,255,71,0.03)'
      ctx.lineWidth = 1
      const step = 40
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      // Floating particles
      particles.forEach(p => {
        p.y += p.vy
        p.opacity = p.opacity - 0.003
        if (p.y < 0 || p.opacity <= 0) {
          p.x = Math.random() * canvas.width
          p.y = canvas.height
          p.opacity = 0.4 + Math.random() * 0.4
        }
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = activeColor
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1

      // Scan line sweep
      const scanY = (t * 0.8) % (canvas.height + 20) - 10
      const scanGrd = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20)
      scanGrd.addColorStop(0, 'transparent')
      scanGrd.addColorStop(0.5, 'rgba(232,255,71,0.04)')
      scanGrd.addColorStop(1, 'transparent')
      ctx.fillStyle = scanGrd
      ctx.fillRect(0, scanY - 20, canvas.width, 40)

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [activeColor])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', borderRadius: 16 }}
    />
  )
}

// ── Lock Screen ──
function LockScreen({ onUnlock }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const tryUnlock = () => {
    if (pw === PT_PASSWORD) {
      localStorage.setItem(PT_KEY, '1')
      onUnlock()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="page animate-fade" style={{ maxWidth: 420, margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg,rgba(232,255,71,.08),rgba(71,200,255,.05))',
        border: '1px solid rgba(232,255,71,.2)',
        borderRadius: 20,
        padding: '40px 32px',
        textAlign: 'center',
        animation: shake ? 'ptShake .4s ease' : 'none',
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🏋️‍♂️</div>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, letterSpacing: 4, color: 'var(--accent)', marginBottom: 6 }}>
          PERSONAL TRAINER
        </div>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
          Bu alan şifre korumalıdır.<br />Erişim şifresini girin.
        </div>
        <div className="form-group" style={{ marginBottom: 14, textAlign: 'left' }}>
          <span className="flabel">Şifre</span>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false) }}
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
        <button className="btn btn-primary" onClick={tryUnlock} style={{ width: '100%', padding: 13 }}>
          🔓 Giriş Yap
        </button>
      </div>
      <style>{`@keyframes ptShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  )
}

// ── Pending Plan Card ──
function PendingPlan({ plan, onApply, onDismiss }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '2px solid var(--accent)',
      borderRadius: 14,
      padding: 16,
      margin: '8px 0',
    }}>
      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 14, letterSpacing: 1, color: 'var(--accent)', marginBottom: 10 }}>
        📋 PROGRAM HAZIR — UYGULAMAYA EKLENSİN Mİ?
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {plan.exercises.map((ex, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', borderRadius: 8, padding: '7px 10px' }}>
            <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: 'var(--text)' }}>{ex.name}</span>
            <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 12, color: 'var(--accent)', letterSpacing: 1 }}>
              {ex.sets.map(s => `${s.reps}×${s.weight}kg`).join(' | ')}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onApply} className="btn btn-primary" style={{ flex: 1, padding: '10px 0' }}>
          ✅ Antrenmana Ekle
        </button>
        <button
          onClick={onDismiss}
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
        >
          İptal
        </button>
      </div>
    </div>
  )
}

// ── Main Page ──
export default function PersonalTrainer() {
  const { profile, goals, foods, exercises, saveExercises, exArchive, body, showToast, setActiveTab } = useApp()

  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(PT_KEY) === '1')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '👋 Merhaba! Bugün ne çalışıyoruz?\n\n"Bench günü", "squat günü", "push day" veya tam egzersiz adını söyle — sana özel program hazırlayayım! Program hazır olunca otomatik olarak antrenmana ekleyebilirim. 🏋️' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeGroups, setActiveGroups] = useState([])
  const [pendingPlan, setPendingPlan] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingPlan])

  const buildContext = useCallback(() => {
    const lines = []
    if (profile) {
      lines.push(`Kullanıcı: ${profile.gender === 'male' ? 'Erkek' : 'Kadın'}, ${profile.age || '?'} yaş, ${profile.weight || '?'}kg, ${profile.height || '?'}cm`)
      const goalMap = { lose: 'Kilo vermek', gain: 'Kilo almak', cut: 'Yağ yakmak', maintain: 'Korumak' }
      const levelMap = { beginner: 'Başlangıç', intermediate: 'Orta', advanced: 'İleri' }
      if (profile.goal) lines.push(`Hedef: ${goalMap[profile.goal] || profile.goal}`)
      if (profile.level) lines.push(`Seviye: ${levelMap[profile.level] || profile.level}`)
      if (profile.tdee) lines.push(`TDEE: ~${profile.tdee}kcal`)
    }
    if (goals) lines.push(`Protein hedef: ${goals.protein}g/gün`)

    if (exercises?.length > 0) {
      lines.push(`Bugün zaten yapılanlar: ${exercises.map(e => e.name).join(', ')}`)
    }

    const last3 = Object.entries(exArchive || {})
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 3)
    if (last3.length > 0) {
      lines.push(`Son antrenmanlar: ${last3.map(([d, exs]) => `${d}: ${exs.map(e => e.name).join(', ')}`).join(' | ')}`)
    }

    const weightHistory = {}
    Object.entries(exArchive || {})
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 14)
      .forEach(([, exs]) => {
        exs.forEach(ex => {
          if (!weightHistory[ex.name]) {
            const maxW = Math.max(...(ex.sets || []).map(s => +s.weight || 0), 0)
            if (maxW > 0) weightHistory[ex.name] = maxW
          }
        })
      })
    const wLines = Object.entries(weightHistory).slice(0, 5).map(([n, w]) => `${n}: ${w}kg`)
    if (wLines.length > 0) lines.push(`Son kullanılan ağırlıklar: ${wLines.join(', ')}`)

    return `Sen KavaFit Personal Trainer AI'sın. SADECE antrenman programlama, egzersiz tekniği, kuvvet antrenmanı, kas geliştirme, toparlanma ve sporcu beslenmesi konularında yardım et. Başka konularda "Bu alan uzmanlığımın dışında, antrenman konusunda yardımcı olabilirim!" de.

Türkçe konuş. Kullanıcının geçmiş verilerine göre kişiselleştirilmiş ve gerçekçi programlar oluştur.

ÖNEMLI KURAL: Kullanıcı bir antrenman programı veya egzersiz planı istiyorsa (örn: "bench günü", "bacak antrenmanı", "push day", "program yaz", "squat günü"), cevabını şu JSON formatıyla bitir:

\`\`\`json
{
  "type": "workout_plan",
  "muscleGroups": ["chest", "triceps", "shoulders"],
  "exercises": [
    {"name": "Bench Press", "sets": [{"reps": 10, "weight": 80}, {"reps": 8, "weight": 85}, {"reps": 6, "weight": 90}]},
    {"name": "İncline Dumbbell Press", "sets": [{"reps": 10, "weight": 30}, {"reps": 10, "weight": 30}]},
    {"name": "Triceps Pushdown", "sets": [{"reps": 12, "weight": 25}, {"reps": 12, "weight": 25}, {"reps": 10, "weight": 27}]}
  ],
  "message": "Kısa motivasyon mesajı"
}
\`\`\`

muscleGroups için geçerli değerler: chest, back, shoulders, biceps, triceps, legs, core, glutes.
Ağırlıkları kullanıcının geçmiş verilerine veya seviyesine göre belirle. JSON'dan önce programı kısa Türkçe açıkla.

Kullanıcı verileri:
${lines.join('\n')}
`
  }, [profile, goals, exercises, exArchive])

  const applyPlan = (plan) => {
    const genId = () => Math.random().toString(36).slice(2, 9)
    const newExercises = plan.exercises.map(ex => ({
      id: genId(),
      name: ex.name,
      sets: (ex.sets || []).map(s => ({
        id: genId(),
        reps: String(s.reps || 10),
        weight: String(s.weight || 0),
        done: false,
      })),
    }))
    const merged = [...(exercises || []), ...newExercises]
    saveExercises(merged)
    setPendingPlan(null)
    showToast('✅ Program antrenmana eklendi!', 'success')
    setTimeout(() => setActiveTab('today'), 800)
  }

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    const newMsgs = [...messages, { role: 'user', text: msg }]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    setPendingPlan(null)

    const ctx = buildContext()
    const contents = [
      { role: 'user', parts: [{ text: ctx + 'Merhaba koçum!' }] },
      { role: 'model', parts: [{ text: 'Merhaba! Bugün ne çalışıyoruz?' }] },
      ...newMsgs.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
    ]

    const reply = await callGemini(contents)
    if (reply) {
      const jsonMatch = reply.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        try {
          const plan = JSON.parse(jsonMatch[1])
          if (plan.type === 'workout_plan' && Array.isArray(plan.exercises) && plan.exercises.length > 0) {
            const cleanText = reply.replace(/```json[\s\S]*?```/g, '').trim()
            setMessages(prev => [...prev, { role: 'assistant', text: cleanText || plan.message || 'Program hazır!' }])
            setPendingPlan(plan)
            setActiveGroups(plan.muscleGroups || getMuscles(plan.exercises))
            setLoading(false)
            return
          }
        } catch { /* fall through */ }
      }
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
      const detected = getMuscles([{ name: msg }])
      if (detected.length > 0) setActiveGroups(detected)
    } else {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Yanıt alınamadı, tekrar dene.' }])
    }
    setLoading(false)
  }

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />

  return (
    <div className="page animate-fade" style={{ maxWidth: 700, paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: 'linear-gradient(135deg,rgba(232,255,71,.2),rgba(71,200,255,.15))',
          border: '1px solid rgba(232,255,71,.35)',
          boxShadow: '0 0 18px rgba(232,255,71,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
        }}>
          🏋️
        </div>
        <div>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 22, letterSpacing: 3, color: 'var(--accent)' }}>PERSONAL TRAINER</div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 6px var(--green)' }} />
            AI destekli antrenman koçu
          </div>
        </div>
        <button
          onClick={() => { localStorage.removeItem(PT_KEY); setUnlocked(false) }}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Space Mono,monospace', textDecoration: 'underline' }}
        >
          Kilitle
        </button>
      </div>

      {/* Animated Background Panel */}
      <div style={{
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        height: 220,
        position: 'relative',
        border: '1px solid rgba(232,255,71,.12)',
        boxShadow: activeGroups.length > 0
          ? '0 0 30px rgba(232,255,71,.08), inset 0 0 60px rgba(0,0,0,.4)'
          : '0 0 20px rgba(0,0,0,.3)',
      }}>
        <AnimatedBackground activeGroups={activeGroups} />

        {/* Overlay content */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        }}>
          {activeGroups.length > 0 ? (
            <>
              <div style={{
                fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 3,
                color: 'rgba(232,255,71,.5)', marginBottom: 10, textTransform: 'uppercase',
              }}>
                Aktif Kaslar
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', padding: '0 20px' }}>
                {MUSCLE_LEGEND.filter(m => activeGroups.includes(m.key)).map(m => (
                  <span key={m.key} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 20,
                    background: 'rgba(0,0,0,.5)',
                    border: `1px solid ${m.color}44`,
                    backdropFilter: 'blur(8px)',
                    fontSize: 11, color: m.color,
                    fontFamily: 'Space Mono,monospace',
                    boxShadow: `0 0 12px ${m.color}22`,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
                    {m.label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '0 24px' }}>
              <div style={{
                fontFamily: 'Bebas Neue,sans-serif', fontSize: 32, letterSpacing: 5,
                background: 'linear-gradient(135deg, #e8ff47, #47c8ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: 8,
              }}>
                AI TRAINER
              </div>
              <div style={{
                fontFamily: 'Space Mono,monospace', fontSize: 10,
                color: 'rgba(255,255,255,.3)', letterSpacing: 1,
              }}>
                Antrenman yazınca kaslar görselleşecek ✨
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Prompts */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {QUICK_PROMPTS.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={loading}
            style={{
              padding: '6px 13px', borderRadius: 20,
              border: '1px solid rgba(232,255,71,.2)',
              background: 'rgba(232,255,71,.05)',
              color: 'var(--accent)', fontFamily: 'Space Mono,monospace', fontSize: 10,
              cursor: 'pointer', opacity: loading ? 0.5 : 1,
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,255,71,.12)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(232,255,71,.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,255,71,.05)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(232,255,71,.1)', boxShadow: '0 0 24px rgba(0,0,0,.3)' }}>
        <div style={{ padding: '14px 14px 0', maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, scrollbarWidth: 'thin' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: m.role === 'user' ? 'var(--accent)' : 'rgba(232,255,71,.15)',
                border: m.role === 'user' ? 'none' : '1px solid rgba(232,255,71,.3)',
                boxShadow: m.role !== 'user' ? '0 0 10px rgba(232,255,71,.1)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: m.role === 'user' ? '#0a0a0a' : 'var(--accent)',
              }}>
                {m.role === 'user' ? '👤' : '🏋️'}
              </div>
              <div style={{
                maxWidth: '80%',
                background: m.role === 'user' ? 'rgba(232,255,71,.1)' : 'var(--surface2)',
                border: m.role === 'user' ? '1px solid rgba(232,255,71,.2)' : '1px solid var(--border)',
                borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                padding: '10px 14px',
              }}>
                <div style={{ fontSize: 13, lineHeight: 1.8, color: m.role === 'user' ? 'var(--accent)' : 'var(--text-dim)', fontFamily: 'Inter,sans-serif', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {pendingPlan && (
            <PendingPlan
              plan={pendingPlan}
              onApply={() => applyPlan(pendingPlan)}
              onDismiss={() => setPendingPlan(null)}
            />
          )}

          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(232,255,71,.15)', border: '1px solid rgba(232,255,71,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🏋️</div>
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', display: 'flex', gap: 5 }}>
                {[0, .15, .3].map((d, i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: `ptBounce 1.2s ease infinite ${d}s`, display: 'inline-block' }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 14px 14px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Bugün ne çalışıyoruz? (Enter = gönder)"
            disabled={loading}
            rows={2}
            style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 13, padding: '10px 12px', outline: 'none', resize: 'none', fontFamily: 'Inter,sans-serif', lineHeight: 1.5, transition: 'border-color .2s' }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(232,255,71,.1)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, borderRadius: 10, border: 'none',
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--surface2)',
              color: input.trim() && !loading ? '#0a0a0a' : 'var(--text-muted)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, transition: 'all .2s', flexShrink: 0,
              boxShadow: input.trim() && !loading ? '0 0 16px rgba(232,255,71,.25)' : 'none',
            }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16, borderTopColor: 'var(--text-muted)' }} /> : '↑'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ptBounce{0%,80%,100%{transform:scale(.8);opacity:.5}40%{transform:scale(1.2);opacity:1}}
      `}</style>
    </div>
  )
}
