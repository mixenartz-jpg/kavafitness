import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: '👋 KavaFit\'e Hoş Geldin!',
    desc: 'Sana birkaç adımda uygulamayı tanıtalım. İstediğin zaman atlayabilirsin.',
    icon: '🏋️',
    target: null,  // Genel hoş geldin — hedefsiz
    position: 'center',
  },
  {
    id: 'today',
    title: '💪 Antrenman Takibi',
    desc: 'Alt menüden "Antrenman" sekmesine gel. Egzersiz ekle, set gir. Her set için otomatik dinlenme sayacı başlar.',
    icon: '🏋️',
    target: 'nav-today',
    position: 'top',
  },
  {
    id: 'calorie',
    title: '🍎 Kalori Takibi',
    desc: '"Kalori" sekmesinde yemeklerini kaydet. Veritabanından seç, fotoğraf çek veya "Dolapta Ne Var?" ile tarif al!',
    icon: '🍽️',
    target: 'nav-calorie',
    position: 'top',
  },
  {
    id: 'aicoach',
    title: '🤖 AI Koçun',
    desc: '"Daha Fazla → AI Koçu" ile beslenme planı yaptır, antrenman analizi al. Kişisel Koç tüm verilerini bilerek sana özel koçluk yapar.',
    icon: '🤖',
    target: 'nav-more',
    position: 'top',
  },
  {
    id: 'xp',
    title: '⚡ XP & Rozetler',
    desc: 'Her antrenman, her set, her kişisel rekor sana XP kazandırır. XP biriktirdikçe seviye atlar, yeni AI koç modları açılır!',
    icon: '🏅',
    target: null,
    position: 'center',
  },
  {
    id: 'settings',
    title: '⚙️ Profili Doldur',
    desc: '"Daha Fazla → Ayarlar" bölümünde yaş, kilo, boy ve hedefini gir. AI koçun sana gerçek anlamda kişiselleştirilmiş öneriler versin.',
    icon: '⚙️',
    target: null,
    position: 'center',
  },
  {
    id: 'done',
    title: '🚀 Hazırsın!',
    desc: 'Antrenman takibine başla, kalorilerini gir, AI koçunla sohbet et. Başarılar!',
    icon: '🎉',
    target: null,
    position: 'center',
  },
]

export default function TourGuide({ onClose }) {
  const { setActiveTab } = useApp()
  const [step, setStep]   = useState(0)
  const [anim, setAnim]   = useState(true)

  const current = TOUR_STEPS[step]
  const isLast  = step === TOUR_STEPS.length - 1
  const progress = Math.round(((step + 1) / TOUR_STEPS.length) * 100)

  const next = () => {
    if (isLast) { onClose(); return }
    setAnim(false)
    setTimeout(() => { setStep(s => s + 1); setAnim(true) }, 150)
  }

  const skip = () => onClose()

  // Adıma göre ilgili sekmeyi highlight et
  useEffect(() => {
    if (current.id === 'today')   setActiveTab('today')
    if (current.id === 'calorie') setActiveTab('calorie')
  }, [step])

  return (
    <>
      {/* Karanlık overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.72)',
        backdropFilter: 'blur(3px)',
        zIndex: 8000,
      }} />

      {/* Tour kartı */}
      <div style={{
        position: 'fixed',
        zIndex: 8001,
        ...(current.position === 'center'
          ? { top:'50%', left:'50%', transform:'translate(-50%,-50%)' }
          : current.position === 'top'
          ? { bottom: 80, left:'50%', transform:'translateX(-50%)' }
          : { top:'50%', left:'50%', transform:'translate(-50%,-50%)' }
        ),
        width: 'min(360px, 90vw)',
        animation: anim ? 'tourCardIn .3s cubic-bezier(.4,0,.2,1)' : 'tourCardOut .15s ease',
      }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(232,255,71,.3)',
          borderRadius: 20,
          padding: '24px 22px',
          boxShadow: '0 16px 60px rgba(0,0,0,.7), 0 0 40px rgba(232,255,71,.08)',
        }}>

          {/* Progress + adım sayısı */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', gap:4 }}>
              {TOUR_STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? 20 : 6, height: 6,
                  borderRadius: 3,
                  background: i <= step ? 'var(--accent)' : 'var(--border)',
                  transition: 'all .3s ease',
                }}/>
              ))}
            </div>
            <button
              onClick={skip}
              style={{ background:'none', border:'none', cursor:'pointer', fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)', textDecoration:'underline' }}
            >
              Atla
            </button>
          </div>

          {/* İkon */}
          <div style={{ fontSize: 44, marginBottom: 14, textAlign:'center', lineHeight:1 }}>
            {current.icon}
          </div>

          {/* Başlık */}
          <div style={{
            fontFamily: 'Bebas Neue,sans-serif', fontSize: 22, letterSpacing: 2,
            color: 'var(--accent)', marginBottom: 10, textAlign:'center',
          }}>
            {current.title}
          </div>

          {/* Açıklama */}
          <p style={{
            fontFamily: 'Inter,sans-serif', fontSize: 13, color: 'var(--text-dim)',
            lineHeight: 1.75, textAlign:'center', marginBottom: 22,
          }}>
            {current.desc}
          </p>

          {/* Adım sayacı + Devam butonu */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', flexShrink:0 }}>
              {step + 1} / {TOUR_STEPS.length}
            </span>
            <button
              onClick={next}
              className="btn btn-primary"
              style={{ flex:1, padding:12, fontSize:13, fontFamily:'Bebas Neue,sans-serif', letterSpacing:2, justifyContent:'center' }}
            >
              {isLast ? '🚀 Başla!' : 'Devam →'}
            </button>
          </div>

        </div>
      </div>

      {/* Bottom nav highlight ok'u (nav adımlarında) */}
      {current.target && (
        <div style={{
          position: 'fixed', bottom: 62, left: '50%', transform: 'translateX(-50%)',
          zIndex: 8002, animation: 'arrowBounce 1s ease infinite',
        }}>
          <div style={{
            width: 32, height: 32, display:'flex', alignItems:'center', justifyContent:'center',
            color: 'var(--accent)', fontSize: 24,
          }}>↓</div>
        </div>
      )}

      <style>{`
        @keyframes tourCardIn {
          from { opacity:0; transform: translate(-50%,-50%) scale(.92); }
          to   { opacity:1; transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes tourCardOut {
          from { opacity:1; }
          to   { opacity:0; }
        }
        @keyframes arrowBounce {
          0%,100% { transform:translateX(-50%) translateY(0); }
          50%     { transform:translateX(-50%) translateY(6px); }
        }
      `}</style>
    </>
  )
}
