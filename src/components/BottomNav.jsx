import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

const MAIN_TABS = [
  { id:'home',    icon:'🏠', label:'Ana Sayfa' },
  { id:'today',   icon:'🏋️', label:'Antrenman' },
  { id:'calorie', icon:'🍎', label:'Kalori'    },
  { id:'account', icon:'👤', label:'Profil'    },
]

const MORE_SECTIONS = [
  {
    label: 'SPOR',
    color: 'var(--accent)',
    items: [
      { id:'templates', icon:'📋', label:'Şablonlar'      },
      { id:'history',   icon:'📅', label:'Geçmiş'         },
      { id:'progress',  icon:'📊', label:'İlerleme'       },
    ],
  },
  {
    label: 'DİYET & AI',
    color: 'var(--green)',
    items: [
      { id:'goals',         icon:'🎯', label:'Makro Hedefler' },
      { id:'aicoach',       icon:'🤖', label:'AI Koçu'        },
      { id:'coach',         icon:'⭐', label:'Kişisel Koç'    },
      { id:'foodrecognize', icon:'🍽️', label:'Yemek Tanıma'   },
    ],
  },
  {
    label: 'DİĞER',
    color: 'var(--text-dim)',
    items: [
      { id:'achievements', icon:'🏅', label:'Başarılar'       },
      { id:'settings',     icon:'⚙️',  label:'Ayarlar'        },
      { id:'share',        icon:'📤', label:'Paylaş'          },
      { id:'recognize',    icon:'📷', label:'Egzersiz Tanıma' },
      { id:'download',     icon:'⬇️', label:'İndir'          },
    ],
  },
]

export default function BottomNav() {
  const { activeTab, setActiveTab, theme, setTheme } = useApp()
  const [moreOpen, setMoreOpen] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!moreOpen) return
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [moreOpen])

  const handleTab = (id) => { setActiveTab(id); setMoreOpen(false) }

  const moreIds   = MORE_SECTIONS.flatMap(s => s.items.map(i => i.id))
  const moreActive = moreIds.includes(activeTab)

  const labelStyle = (active) => ({
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 11,
    letterSpacing: .2,
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    transition: 'color .15s',
    marginTop: 1,
  })

  return (
    <>
      {/* Backdrop */}
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 198,
            animation: 'fadeIn .2s ease',
          }}
        />
      )}

      {/* ── Sağ Panel ── */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 60,
          width: 260,
          zIndex: 199,
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          transform: moreOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
          boxShadow: moreOpen ? '-12px 0 48px rgba(0,0,0,.6)' : 'none',
        }}
      >
        {/* Panel başlık */}
        <div style={{
          padding: '20px 18px 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: .3 }}>
            Menü
          </span>
          <button
            onClick={() => setMoreOpen(false)}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 8, width: 28, height: 28, cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 14, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Tema toggle */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--surface2)',
              color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12,
              fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{ fontSize: 15 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
          </button>
        </div>

        {/* Menü bölümleri */}
        <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {MORE_SECTIONS.map(section => (
            <div key={section.label}>
              {/* Bölüm başlığı */}
              <div style={{
                fontFamily: "'Space Mono',monospace", fontSize: 9,
                letterSpacing: 2.5, color: 'var(--text-muted)',
                padding: '8px 6px 5px',
                textTransform: 'uppercase',
              }}>
                {section.label}
              </div>
              {/* İtemler */}
              {section.items.map(item => {
                const active = activeTab === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => handleTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: '10px 12px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: active ? 'var(--surface3)' : 'transparent',
                      transition: 'background .15s',
                      userSelect: 'none',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface2)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: 17, lineHeight: 1, width: 22, textAlign: 'center' }}>{item.icon}</span>
                    <span style={{
                      fontFamily: "'Space Grotesk',sans-serif",
                      fontWeight: active ? 600 : 400,
                      fontSize: 13,
                      color: active ? 'var(--text)' : 'var(--text-dim)',
                      flex: 1,
                    }}>
                      {item.label}
                    </span>
                    {active && (
                      <div style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: 'var(--accent)', flexShrink: 0,
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Instagram */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
          <a
            href="https://instagram.com/slmbnmixo"
            target="_blank" rel="noreferrer"
            style={{
              fontSize: 11, color: 'var(--text-muted)',
              fontFamily: "'Space Grotesk',sans-serif",
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, opacity: .6,
            }}
          >
            📸 @slmbnmixo
          </a>
        </div>
      </div>

      {/* ── Bottom Nav Bar ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 60,
        background: 'rgba(8,8,8,.97)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'stretch',
        zIndex: 200,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {MAIN_TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTab(tab.id)}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                position: 'relative', transition: 'opacity .15s',
              }}
            >
              {active && (
                <div style={{
                  position: 'absolute', top: 0, left: '25%', right: '25%',
                  height: 2, borderRadius: '0 0 3px 3px',
                  background: 'var(--accent)',
                  animation: 'fadeIn .2s ease',
                }} />
              )}
              <span style={{
                fontSize: 20, lineHeight: 1,
                filter: active ? 'none' : 'grayscale(0.3)',
                opacity: active ? 1 : 0.5,
                transition: 'opacity .15s',
              }}>
                {tab.icon}
              </span>
              <span style={labelStyle(active)}>{tab.label}</span>
            </button>
          )
        })}

        {/* Daha Fazla */}
        <button
          onClick={() => setMoreOpen(p => !p)}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 3,
            position: 'relative', transition: 'opacity .15s',
          }}
        >
          {moreActive && !moreOpen && (
            <div style={{
              position: 'absolute', top: 0, left: '25%', right: '25%',
              height: 2, borderRadius: '0 0 3px 3px',
              background: 'var(--accent)',
            }} />
          )}
          {/* Hamburger ikonu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3.5, height: 20, justifyContent: 'center' }}>
            {[1,0.7,0.4].map((w, i) => (
              <div key={i} style={{
                width: 16 * w, height: 1.5, borderRadius: 2,
                background: moreOpen || moreActive ? 'var(--accent)' : 'var(--text-muted)',
                opacity: moreOpen || moreActive ? 1 : 0.5,
                transition: 'all .2s',
                alignSelf: 'center',
              }} />
            ))}
          </div>
          <span style={labelStyle(moreOpen || moreActive)}>Menü</span>
        </button>
      </nav>
    </>
  )
}
