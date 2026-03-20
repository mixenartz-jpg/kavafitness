import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import Icon from './Icons'

const MAIN_TABS = [
  { id:'home',      icon:'home',    label:'Ana Sayfa'  },
  { id:'today',     icon:'dumbbell',label:'Antrenman'  },
  { id:'exercises', icon:'body',    label:'Hareketler' },
  { id:'calorie',   icon:'apple',   label:'Kalori'     },
  { id:'account',   icon:'user',    label:'Profil'     },
]

const MORE_SECTIONS = [
  {
    label: 'SPOR',
    items: [
      { id:'templates', icon:'clipboard', label:'Şablonlar'      },
      { id:'history',   icon:'calendar',  label:'Geçmiş'         },
      { id:'progress',  icon:'chart',     label:'İlerleme'       },
    ],
  },
  {
    label: 'DİYET & AI',
    items: [
      { id:'goals',         icon:'target', label:'Makro Hedefler' },
      { id:'aicoach',       icon:'robot',  label:'AI Koçu'        },
      { id:'coach',         icon:'star',   label:'Kişisel Koç'    },
      { id:'foodrecognize', icon:'food',   label:'Yemek Tanıma'   },
    ],
  },
  {
    label: 'DİĞER',
    items: [
      { id:'achievements', icon:'award',    label:'Başarılar'       },
      { id:'settings',     icon:'settings', label:'Ayarlar'         },
      { id:'share',        icon:'share',    label:'Paylaş'          },
      { id:'recognize',    icon:'camera',   label:'Egzersiz Tanıma' },
      { id:'download',     icon:'download', label:'İndir'           },
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
      if (panelRef.current && !panelRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [moreOpen])

  const handleTab = (id) => { setActiveTab(id); setMoreOpen(false) }
  const moreIds    = MORE_SECTIONS.flatMap(s => s.items.map(i => i.id))
  const moreActive = moreIds.includes(activeTab)

  return (
    <>
      {/* Backdrop */}
      {moreOpen && (
        <div onClick={() => setMoreOpen(false)} style={{
          position:'fixed', inset:0,
          background:'rgba(0,0,0,.45)', backdropFilter:'blur(3px)',
          zIndex:198, animation:'fadeIn .2s ease',
        }}/>
      )}

      {/* ── Sağ Panel ── */}
      <div ref={panelRef} style={{
        position:'fixed', top:0, right:0, bottom:58,
        width:252, zIndex:199,
        background:'var(--surface)',
        borderLeft:'1px solid var(--border)',
        display:'flex', flexDirection:'column',
        overflowY:'auto',
        transform: moreOpen ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform .28s cubic-bezier(.4,0,.2,1)',
        boxShadow: moreOpen ? '-16px 0 48px rgba(0,0,0,.7)' : 'none',
      }}>
        {/* Başlık */}
        <div style={{ padding:'18px 16px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:'var(--text)' }}>Menü</span>
          <button onClick={() => setMoreOpen(false)} style={{
            background:'var(--surface2)', border:'1px solid var(--border)',
            borderRadius:8, width:28, height:28, cursor:'pointer',
            color:'var(--text-muted)', display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Icon name="x" size={14} color="var(--text-muted)"/>
          </button>
        </div>

        {/* Tema */}
        <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{
            width:'100%', padding:'9px 12px', borderRadius:10,
            border:'1px solid var(--border)', background:'var(--surface2)',
            color:'var(--text-dim)', cursor:'pointer', fontSize:12,
            fontFamily:"'Space Grotesk',sans-serif", fontWeight:500,
            display:'flex', alignItems:'center', gap:8,
          }}>
            <span style={{ fontSize:15 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
          </button>
        </div>

        {/* Bölümler */}
        <div style={{ flex:1, padding:'6px 10px', display:'flex', flexDirection:'column', gap:2 }}>
          {MORE_SECTIONS.map(section => (
            <div key={section.label}>
              <div style={{
                fontFamily:"'Space Mono',monospace", fontSize:9,
                letterSpacing:2.5, color:'var(--text-muted)',
                padding:'10px 8px 5px', textTransform:'uppercase',
              }}>
                {section.label}
              </div>
              {section.items.map(item => {
                const active = activeTab === item.id
                return (
                  <div key={item.id} onClick={() => handleTab(item.id)} style={{
                    display:'flex', alignItems:'center', gap:11,
                    padding:'9px 10px', borderRadius:10,
                    cursor:'pointer',
                    background: active ? 'var(--surface3)' : 'transparent',
                    transition:'background .12s',
                    userSelect:'none',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface2)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <Icon name={item.icon} size={16} color={active ? 'var(--text)' : 'var(--text-muted)'} strokeWidth={active ? 2 : 1.6}/>
                    <span style={{
                      fontFamily:"'Space Grotesk',sans-serif",
                      fontWeight: active ? 600 : 400,
                      fontSize:13, color: active ? 'var(--text)' : 'var(--text-dim)', flex:1,
                    }}>
                      {item.label}
                    </span>
                    {active && <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', flexShrink:0 }}/>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)' }}>
          <a href="https://instagram.com/slmbnmixo" target="_blank" rel="noreferrer" style={{
            fontSize:11, color:'var(--text-muted)', fontFamily:"'Space Grotesk',sans-serif",
            textDecoration:'none', display:'flex', alignItems:'center', gap:6, opacity:.5,
          }}>
            📸 @slmbnmixo
          </a>
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0, height:58,
        background:'rgba(8,8,8,.97)', backdropFilter:'blur(24px)',
        borderTop:'1px solid var(--border)',
        display:'flex', alignItems:'stretch',
        zIndex:200, paddingBottom:'env(safe-area-inset-bottom)',
      }}>
        {MAIN_TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => handleTab(tab.id)} style={{
              flex:1, border:'none', background:'transparent',
              cursor:'pointer', display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:3,
              position:'relative', transition:'opacity .15s',
              padding:'4px 0',
            }}>
              {active && (
                <div style={{
                  position:'absolute', top:0, left:'25%', right:'25%',
                  height:2, borderRadius:'0 0 3px 3px',
                  background:'var(--accent)', animation:'fadeIn .18s ease',
                }}/>
              )}
              <Icon
                name={tab.icon}
                size={20}
                color={active ? 'var(--accent)' : 'var(--text-muted)'}
                strokeWidth={active ? 2 : 1.6}
              />
              <span style={{
                fontFamily:"'Space Grotesk',sans-serif", fontWeight: active ? 600 : 400,
                fontSize:10, letterSpacing:.2,
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                transition:'color .15s',
              }}>
                {tab.label}
              </span>
            </button>
          )
        })}

        {/* Menü butonu */}
        <button onClick={() => setMoreOpen(p => !p)} style={{
          flex:1, border:'none', background:'transparent',
          cursor:'pointer', display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:3,
          position:'relative', padding:'4px 0',
        }}>
          {moreActive && !moreOpen && (
            <div style={{
              position:'absolute', top:0, left:'25%', right:'25%',
              height:2, borderRadius:'0 0 3px 3px', background:'var(--accent)',
            }}/>
          )}
          <Icon name="menu" size={20} color={moreOpen || moreActive ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth={moreOpen ? 2 : 1.6}/>
          <span style={{
            fontFamily:"'Space Grotesk',sans-serif", fontWeight: (moreOpen || moreActive) ? 600 : 400,
            fontSize:10, letterSpacing:.2,
            color: moreOpen || moreActive ? 'var(--accent)' : 'var(--text-muted)',
            transition:'color .15s',
          }}>
            Menü
          </span>
        </button>
      </nav>
    </>
  )
}
