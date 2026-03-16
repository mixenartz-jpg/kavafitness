import { useApp } from '../context/AppContext'

const TABS = [
  { id:'home',     label:'ANA MENÜ',        icon:'🏠', desc:'Uygulama hakkında' },
  { id:'today',    label:'BUGÜN',           icon:'🏋️', desc:'Günlük antrenman' },
  { id:'history',  label:'GEÇMİŞ',          icon:'📅', desc:'Geçmiş antrenmanlar' },
  { id:'calorie',  label:'KALORİ',          icon:'🍎', desc:'Besin takibi' },
  { id:'goals',    label:'HEDEFLER',        icon:'🎯', desc:'Makro hedefler' },
  { id:'progress', label:'İLERLEME',        icon:'📊', desc:'Grafik & istatistik' },
  { id:'body',     label:'ÖLÇÜLER',         icon:'⚖️', desc:'Vücut ölçüleri' },
  { id:'recognize',label:'EGZERSİZ TANIMA', icon:'📸', desc:'AI ile tanıma' },
]

export default function NavTabs({ open, onClose }) {
  const { activeTab, setActiveTab } = useApp()

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position:'fixed', inset:0,
            background:'rgba(0,0,0,.6)',
            backdropFilter:'blur(4px)',
            zIndex:199,
            animation:'fadeIn .2s ease',
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position:'fixed', top:0, left:0, bottom:0,
        width:270,
        background:'var(--surface)',
        borderRight:'1px solid var(--border)',
        zIndex:200,
        display:'flex', flexDirection:'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform .28s cubic-bezier(.4,0,.2,1)',
        boxShadow: open ? '8px 0 40px rgba(0,0,0,.6)' : 'none',
        overflowY:'auto',
        scrollbarWidth:'none',
      }}>
        {/* Header */}
        <div style={{
          padding:'20px 20px 16px',
          borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          flexShrink:0,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src="/logo-sm.png" alt="KeroGym" style={{ height:28, width:'auto' }} />
            <div style={{
              fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:3,
              color:'var(--accent)',
            }}>
              KERO<span style={{ color:'var(--text-muted)' }}>GYM</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:'var(--surface2)', border:'1px solid var(--border)',
            color:'var(--text-muted)', width:30, height:30, borderRadius:8,
            cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all .15s',
          }}>✕</button>
        </div>

        {/* Menu label */}
        <div style={{
          padding:'16px 20px 8px',
          fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:3,
          color:'var(--text-muted)', textTransform:'uppercase',
        }}>
          Menü
        </div>

        {/* Tabs */}
        <nav style={{ padding:'0 10px', flex:1 }}>
          {TABS.map(t => {
            const isActive = activeTab === t.id
            return (
              <div
                key={t.id}
                onClick={() => { setActiveTab(t.id); onClose() }}
                style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'11px 12px',
                  borderRadius:10,
                  cursor:'pointer',
                  marginBottom:2,
                  background: isActive ? 'rgba(232,255,71,.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(232,255,71,.2)' : 'transparent'}`,
                  transition:'all .15s',
                  userSelect:'none',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface2)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Icon */}
                <div style={{
                  width:36, height:36, borderRadius:9, flexShrink:0,
                  background: isActive ? 'rgba(232,255,71,.12)' : 'var(--surface2)',
                  border: `1px solid ${isActive ? 'rgba(232,255,71,.25)' : 'var(--border)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:16,
                  transition:'all .15s',
                }}>
                  {t.icon}
                </div>

                {/* Text */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{
                    fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:2,
                    color: isActive ? 'var(--accent)' : 'var(--text)',
                    transition:'color .15s',
                  }}>
                    {t.label}
                  </div>
                  <div style={{
                    fontSize:10, color:'var(--text-muted)',
                    fontFamily:'DM Mono,monospace',
                    marginTop:1,
                  }}>
                    {t.desc}
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div style={{
                    width:4, height:4, borderRadius:'50%',
                    background:'var(--accent)', flexShrink:0,
                  }} />
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding:'16px 20px',
          borderTop:'1px solid var(--border)',
          flexShrink:0,
        }}>
          <a href="https://instagram.com/slmbnmixo" target="_blank" rel="noreferrer"
            style={{
              display:'flex', alignItems:'center', gap:8,
              fontSize:11, color:'var(--text-muted)',
              fontFamily:'DM Mono,monospace', textDecoration:'none',
              opacity:.7,
            }}>
            <span>📸</span> @slmbnmixo
          </a>
        </div>
      </aside>
    </>
  )
}