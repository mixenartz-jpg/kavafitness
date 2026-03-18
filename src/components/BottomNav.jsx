import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

// ── Ana 4 sekme ──
const MAIN_TABS = [
  { id:'home',    icon:'🏠', label:'Ana Sayfa' },
  { id:'today',   icon:'🏋️', label:'Antrenman' },
  { id:'calorie', icon:'🍎', label:'Kalori'    },
  { id:'account', icon:'👤', label:'Profil'    },
]

// ── "Daha Fazla" menüsündeki sekmeler ──
const MORE_SECTIONS = [
  {
    label: 'SPOR',
    color: '#e8ff47',
    items: [
      { id:'templates', icon:'📋', label:'Şablonlar'       },
      { id:'history',   icon:'📅', label:'Geçmiş'          },
      { id:'progress',  icon:'📊', label:'İlerleme'        },
    ],
  },
  {
    label: 'DİYET & AI',
    color: '#47ff8a',
    items: [
      { id:'goals',    icon:'🎯', label:'Makro Hedefler' },
      { id:'aicoach',  icon:'🤖', label:'AI Koçu'        },
      { id:'coach',    icon:'⭐', label:'Kişisel Koç'    },
    ],
  },
  {
    label: 'DİĞER',
    color: 'var(--text-muted)',
    items: [
      { id:'settings',  icon:'⚙️',  label:'Ayarlar'          },
      { id:'share',     icon:'📤',  label:'Paylaş'           },
      { id:'recognize', icon:'📷',  label:'Egzersiz Tanıma'  },
      { id:'download',  icon:'⬇️',  label:'Uygulamayı İndir' },
    ],
  },
]

export default function BottomNav() {
  const { activeTab, setActiveTab, theme, setTheme, requestNotifPermission, notifPermission } = useApp()
  const [moreOpen, setMoreOpen] = useState(false)
  const [notifStatus, setNotifStatus] = useState(notifPermission || 'default')

  // More menüsü açıkken scroll kilitle
  useEffect(() => {
    document.body.style.overflow = moreOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [moreOpen])

  const handleTab = (id) => {
    setActiveTab(id)
    setMoreOpen(false)
  }

  const handleNotif = async () => {
    const r = await requestNotifPermission()
    setNotifStatus(r)
  }

  // Aktif sekmenin "daha fazla" menüsünde olup olmadığını kontrol et
  const moreIds = MORE_SECTIONS.flatMap(s => s.items.map(i => i.id))
  const moreActive = moreIds.includes(activeTab)

  return (
    <>
      {/* ── Backdrop ── */}
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 198,
          }}
        />
      )}

      {/* ── "Daha Fazla" Sheet ── */}
      <div style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 60,
        zIndex: 199,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderRadius: '20px 20px 0 0',
        padding: '16px 16px 8px',
        boxShadow: '0 -8px 40px rgba(0,0,0,.5)',
        transform: moreOpen ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
        maxHeight: '70vh',
        overflowY: 'auto',
      }}>
        {/* Tutamaç */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />

        {/* Tema + Bildirim hızlı aksiyonlar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              flex: 1, padding: '10px 8px', borderRadius: 12,
              border: '1px solid var(--border)', background: 'var(--surface2)',
              color: 'var(--text)', cursor: 'pointer', fontSize: 13,
              fontFamily: 'DM Mono,monospace', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {theme === 'dark' ? '☀️ Açık Tema' : '🌙 Koyu Tema'}
          </button>
          <button
            onClick={handleNotif}
            style={{
              flex: 1, padding: '10px 8px', borderRadius: 12,
              border: `1px solid ${notifStatus === 'granted' ? 'rgba(71,255,138,.3)' : notifStatus === 'denied' ? 'rgba(255,71,71,.3)' : 'rgba(255,140,71,.3)'}`,
              background: 'var(--surface2)',
              color: notifStatus === 'granted' ? 'var(--green)' : notifStatus === 'denied' ? 'var(--red)' : '#ff8c47',
              cursor: 'pointer', fontSize: 12,
              fontFamily: 'DM Mono,monospace', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            🔔 {notifStatus === 'granted' ? 'Bildirim Açık' : notifStatus === 'denied' ? 'Engelli' : 'Bildirimleri Aç'}
          </button>
        </div>

        {/* Menü bölümleri */}
        {MORE_SECTIONS.map(section => (
          <div key={section.label} style={{ marginBottom: 16 }}>
            <div style={{
              fontFamily: 'DM Mono,monospace', fontSize: 9,
              letterSpacing: 3, color: section.color,
              marginBottom: 8, paddingLeft: 4,
            }}>
              {section.label}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {section.items.map(item => {
                const active = activeTab === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => handleTab(item.id)}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 5,
                      padding: '12px 4px', borderRadius: 12, cursor: 'pointer',
                      background: active ? `${section.color}14` : 'var(--surface2)',
                      border: `1px solid ${active ? section.color + '40' : 'var(--border)'}`,
                      transition: 'all .15s', userSelect: 'none',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <span style={{
                      fontFamily: 'DM Mono,monospace', fontSize: 9,
                      color: active ? section.color : 'var(--text-muted)',
                      textAlign: 'center', lineHeight: 1.3,
                    }}>
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Instagram linki */}
        <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <a
            href="https://instagram.com/slmbnmixo"
            target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace', textDecoration: 'none', opacity: .6 }}
          >
            📸 @slmbnmixo
          </a>
        </div>
      </div>

      {/* ── Bottom Nav Bar ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 60,
        background: 'rgba(10,10,10,.96)',
        backdropFilter: 'blur(20px)',
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
                position: 'relative', transition: 'all .15s',
              }}
            >
              {/* Aktif gösterge çizgisi */}
              {active && (
                <div style={{
                  position: 'absolute', top: 0, left: '20%', right: '20%',
                  height: 2, borderRadius: '0 0 2px 2px',
                  background: 'var(--accent)',
                }} />
              )}
              <span style={{ fontSize: 22, lineHeight: 1 }}>{tab.icon}</span>
              <span style={{
                fontFamily: 'DM Mono,monospace', fontSize: 9,
                letterSpacing: 0.5,
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color .15s',
              }}>
                {tab.label}
              </span>
            </button>
          )
        })}

        {/* Daha Fazla butonu */}
        <button
          onClick={() => setMoreOpen(p => !p)}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 3,
            position: 'relative', transition: 'all .15s',
          }}
        >
          {/* More menüsünde aktif bir sekme varsa gösterge */}
          {moreActive && !moreOpen && (
            <div style={{
              position: 'absolute', top: 0, left: '20%', right: '20%',
              height: 2, borderRadius: '0 0 2px 2px',
              background: 'var(--accent)',
            }} />
          )}
          {/* 3 nokta ikonu */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 22 }}>
            {[0,1,2].map(i => (
              <div
                key={i}
                style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: moreOpen || moreActive ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'all .15s',
                  transform: moreOpen ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          <span style={{
            fontFamily: 'DM Mono,monospace', fontSize: 9,
            letterSpacing: 0.5,
            color: moreOpen || moreActive ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color .15s',
          }}>
            Daha Fazla
          </span>
        </button>
      </nav>
    </>
  )
}
