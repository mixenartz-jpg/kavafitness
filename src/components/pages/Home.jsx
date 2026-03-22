import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Icon from '../Icons'

const QUICK_CARDS = [
  { id: 'today',    icon: 'dumbbell', label: 'Antrenman',     desc: 'Bugünkü egzersizleri kaydet', color: '#f59e0b' },
  { id: 'calorie',  icon: 'apple',    label: 'Kalori Takibi', desc: 'Yemek ve makro takibi',       color: '#22c55e' },
  { id: 'aicoach',  icon: 'robot',    label: 'AI Koçu',       desc: 'Beslenme & antrenman analizi',color: '#a78bfa' },
  { id: 'progress', icon: 'chart',    label: 'İlerleme',      desc: 'Grafikler & haftalık özet',   color: '#3b82f6' },
  { id: 'history',  icon: 'calendar', label: 'Geçmiş',        desc: 'Tüm antrenman geçmişin',      color: '#f472b6' },
  { id: 'settings', icon: 'settings', label: 'Ayarlar',       desc: 'Profil, hedefler, ölçüler',   color: '#94a3b8' },
]

const GOAL_LABELS = { lose: 'Kilo Ver', gain: 'Kilo Al', cut: 'Yağ Yak', maintain: 'Koru' }

// ── Animated counter ──
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!value) { setDisplay(0); return }
    let start = 0
    const steps = 40
    const inc = value / steps
    const t = setInterval(() => {
      start += inc
      if (start >= value) { setDisplay(value); clearInterval(t) }
      else setDisplay(Math.floor(start))
    }, 600 / steps)
    return () => clearInterval(t)
  }, [value])
  return display
}

// ── XP Progress Bar ──
function XPBar({ progress, currentXP, nextXP, levelInfo }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(progress), 120)
    return () => clearTimeout(t)
  }, [progress])

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{levelInfo.icon}</span>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: 'var(--text)', lineHeight: 1.2 }}>
              {levelInfo.title}
            </div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1 }}>
              SEVİYE {levelInfo.level}
            </div>
          </div>
        </div>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: 'var(--yellow)', letterSpacing: 1 }}>
          {currentXP} XP {nextXP ? `/ ${nextXP} XP` : '(MAX)'}
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 10, background: 'var(--surface3)', overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            background: 'linear-gradient(90deg, var(--yellow), #fb923c)',
            borderRadius: 10,
            transition: 'width 1.1s cubic-bezier(.4,0,.2,1)',
            boxShadow: '0 0 10px rgba(245,158,11,.45)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent)',
            animation: 'shimmer 2s infinite',
            backgroundSize: '200% 100%',
          }} />
        </div>
      </div>
    </div>
  )
}

// ── Stat Card ──
function StatCard({ icon, value, unit, label, color }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '14px 16px', flex: 1,
      display: 'flex', alignItems: 'center', gap: 12,
      transition: 'all .2s cubic-bezier(.4,0,.2,1)',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}40`
        e.currentTarget.style.boxShadow = `0 0 0 1px ${color}18, 0 8px 28px rgba(0,0,0,.3)`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>
            <AnimatedNumber value={value} />
          </span>
          <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: 'var(--text-muted)' }}>{unit}</span>
        </div>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--text-muted)', letterSpacing: .5, marginTop: 1 }}>
          {label}
        </div>
      </div>
    </div>
  )
}

// ── Quick Card ──
function QuickCard({ card, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card-interactive"
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '16px 12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 10, cursor: 'pointer', userSelect: 'none', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${card.color}50`
        e.currentTarget.style.boxShadow = `0 0 0 1px ${card.color}20, 0 12px 36px rgba(0,0,0,.35)`
        e.currentTarget.style.transform = 'translateY(-3px)'
        const icon = e.currentTarget.querySelector('.qc-icon')
        if (icon) icon.style.transform = 'scale(1.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
        const icon = e.currentTarget.querySelector('.qc-icon')
        if (icon) icon.style.transform = 'scale(1)'
      }}
    >
      {/* subtle gradient shimmer on hover */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${card.color}10 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div
        className="qc-icon"
        style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${card.color}18`, border: `1px solid ${card.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform .2s cubic-bezier(.34,1.56,.64,1)',
          flexShrink: 0,
        }}
      >
        <Icon name={card.icon} size={20} color={card.color} strokeWidth={1.8} />
      </div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 12, color: 'var(--text)', letterSpacing: .2 }}>
        {card.label}
      </div>
      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        {card.desc}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { setActiveTab, streak, profile, exercises, foods, water, totalXP, getXpLevel } = useApp()

  const todayKcal = Math.round(foods.reduce((s, f) => s + (+f.kcal || 0), 0))
  const todaySets = exercises.reduce((s, e) => s + e.sets.length, 0)
  const waterAmount = water || 0

  const xpInfo = getXpLevel()
  const levelInfo = { level: xpInfo.level, title: xpInfo.title, icon: xpInfo.icon }
  const nextXP = xpInfo.next ? xpInfo.next.minXP : null
  const progress = xpInfo.progress

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Günaydın'
    if (h < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }

  return (
    <div className="page animate-fade" style={{ maxWidth: 680 }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 22, padding: '26px 24px', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* ambient glow top-right */}
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 180, height: 180,
          background: 'radial-gradient(circle, rgba(245,158,11,.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* watermark */}
        <div style={{
          position: 'absolute', right: -8, top: -4,
          fontFamily: 'Bebas Neue,sans-serif', fontSize: 100,
          color: 'rgba(255,255,255,.02)', letterSpacing: 4,
          userSelect: 'none', pointerEvents: 'none', lineHeight: 1,
        }}>FIT</div>

        {/* logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <img src="/logo.png" alt="KavaFit" style={{ height: 44, width: 'auto', filter: 'brightness(0) invert(1)', opacity: .9 }} />
          <div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 32, letterSpacing: 5, lineHeight: 1 }}>
              <span style={{ color: 'var(--accent)' }}>KAVA</span>
              <span style={{ color: 'var(--text-muted)', opacity: .45 }}>FIT</span>
            </div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 8, letterSpacing: 3, color: 'var(--text-muted)', marginTop: 3 }}>
              SPOR & BESLENME TAKİP
            </div>
          </div>
        </div>

        {/* greeting */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text)', marginBottom: 2, lineHeight: 1.2 }}>
            {greeting()}{profile?.name ? `, ${profile.name}` : ''} 👋
          </div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, maxWidth: 440 }}>
            {!profile
              ? <><span style={{ color: 'var(--yellow)' }}>Başlamak için </span>Ayarlar → Profil'i doldur.</>
              : 'Hedeflerine bir adım daha yaklaşmaya hazır mısın?'
            }
          </div>
        </div>

        {/* badge row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {streak > 0 && (
            <span style={{
              fontFamily: 'Space Mono,monospace', fontSize: 10,
              background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)',
              borderRadius: 20, padding: '4px 11px', color: '#f87171',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              🔥 {streak} günlük seri
            </span>
          )}
          {todaySets > 0 && (
            <span style={{
              fontFamily: 'Space Mono,monospace', fontSize: 10,
              background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.25)',
              borderRadius: 20, padding: '4px 11px', color: 'var(--yellow)',
            }}>
              ⚡ {todaySets} set
            </span>
          )}
          {todayKcal > 0 && (
            <span style={{
              fontFamily: 'Space Mono,monospace', fontSize: 10,
              background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)',
              borderRadius: 20, padding: '4px 11px', color: 'var(--green)',
            }}>
              🥗 {todayKcal} kcal
            </span>
          )}
          {profile?.goal && (
            <span style={{
              fontFamily: 'Space Mono,monospace', fontSize: 10,
              background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)',
              borderRadius: 20, padding: '4px 11px', color: 'var(--blue)',
            }}>
              🎯 {GOAL_LABELS[profile.goal] || profile.goal}
            </span>
          )}
        </div>
      </div>

      {/* ── BUGÜNKÜ İSTATİSTİKLER ── */}
      <div className="section-title">BUGÜN</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatCard icon="🔥" value={todayKcal} unit="kcal" label="KALORİ" color="#ef4444" />
        <StatCard icon="⚡" value={todaySets} unit="set"  label="ANTRENMAN" color="#f59e0b" />
        <StatCard icon="💧" value={waterAmount} unit="ml"  label="SU" color="#3b82f6" />
      </div>

      {/* ── XP PROGRESS ── */}
      <div className="section-title">SEVİYE & XP</div>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '18px 20px', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: -20, bottom: -20, width: 120, height: 120,
          background: 'radial-gradient(circle, rgba(245,158,11,.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <XPBar
          progress={progress}
          currentXP={totalXP}
          nextXP={nextXP}
          levelInfo={levelInfo}
        />
      </div>

      {/* ── HIZLI ERİŞİM ── */}
      <div className="section-title">HIZLI ERİŞİM</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
        {QUICK_CARDS.map((card, i) => (
          <div
            key={card.id}
            className={`stagger-${Math.min(i + 1, 5)} animate-fade`}
          >
            <QuickCard card={card} onClick={() => setActiveTab(card.id)} />
          </div>
        ))}
      </div>

      {/* ── GELİŞTİRİCİ ── */}
      <div className="section-title">GELİŞTİRİCİ</div>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '18px 20px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(131,58,180,.06) 0%, rgba(253,29,29,.04) 50%, rgba(252,176,69,.06) 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          width: 50, height: 50, borderRadius: '50%', flexShrink: 0, zIndex: 1,
          background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, boxShadow: '0 0 20px rgba(131,58,180,.35)',
        }}>
          🧑‍💻
        </div>
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, letterSpacing: 2, marginBottom: 2 }}>
            Kerem Teke
          </div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1 }}>
            KavaFit'in yaratıcısı · Ücretsiz & reklamsız
          </div>
        </div>
        <a
          href="https://instagram.com/slmbnmixo"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 13px', borderRadius: 20,
            background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
            color: '#fff', fontSize: 10, fontWeight: 700,
            textDecoration: 'none', fontFamily: 'Space Mono,monospace',
            flexShrink: 0, zIndex: 1,
            boxShadow: '0 4px 16px rgba(131,58,180,.3)',
            transition: 'transform .18s, box-shadow .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(131,58,180,.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 4px 16px rgba(131,58,180,.3)' }}
        >
          <svg width="11" height="11" fill="#fff" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          @slmbnmixo
        </a>
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 8, fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--border2)', letterSpacing: 2 }}>
        KAVAFIT v1.0 · 2025
      </div>

    </div>
  )
}
