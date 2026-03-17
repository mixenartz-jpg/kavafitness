import { useApp } from '../context/AppContext'

const SECTIONS = [
  {
    label: 'GENEL',
    color: 'var(--text-muted)',
    items: [
      { id:'home',     label:'ANA MENU',         icon:'🏠', desc:'Uygulama hakkinda' },
      { id:'account',  label:'HESABIM',           icon:'👤', desc:'Profil, email, şifre, hesap sil' },
      { id:'settings', label:'AYARLAR',           icon:'⚙',  desc:'Profil & hedefler & olculer' },
      { id:'download', label:'UYGULAMAYI INDIR',  icon:'⬇',  desc:'Telefona ekle' },
    ]
  },
  {
    label: 'SPOR',
    color: '#e8ff47',
    items: [
      { id:'today',    label:'BUGUN',             icon:'🏋', desc:'Gunluk antrenman' },
      { id:'templates',label:'SABLONLAR',         icon:'📋', desc:'Antrenman sablonlari' },
      { id:'history',  label:'GECMIS',            icon:'📅', desc:'Gecmis antrenmanlar' },
      { id:'weekly',   label:'HAFTALIK OZET',     icon:'📈', desc:'Bu haftanin ozeti' },
      { id:'progress', label:'ILERLEME',          icon:'📊', desc:'Grafik & istatistik' },
    ]
  },
  {
    label: 'DİYET',
    color: '#47ff8a',
    items: [
      { id:'calorie',  label:'KALORİ TAKİBİ',    icon:'🍎', desc:'Besin takibi' },
      { id:'goals',    label:'MAKRO HEDEFLER',    icon:'🎯', desc:'Gunluk makro takibi' },
      { id:'aicoach',  label:'AI KOCU',           icon:'🤖', desc:'Kalori & aktivite analizi' },
    ]
  },
]

export default function NavTabs({ open, onClose }) {
  const { activeTab, setActiveTab } = useApp()

  const activeSection = SECTIONS.find(s => s.items.some(t => t.id === activeTab))

  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position:'fixed', inset:0,
          background:'rgba(0,0,0,.6)',
          backdropFilter:'blur(4px)',
          zIndex:199,
          animation:'fadeIn .2s ease',
        }} />
      )}

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
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:3, color:'var(--accent)' }}>
              KERO<span style={{ color:'var(--text-muted)' }}>GYM</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:'var(--surface2)', border:'1px solid var(--border)',
            color:'var(--text-muted)', width:30, height:30, borderRadius:8,
            cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center',
          }}>X</button>
        </div>

        {/* Sections */}
        <nav style={{ padding:'8px 10px', flex:1 }}>
          {SECTIONS.map((section, si) => (
            <div key={section.label} style={{ marginBottom: si < SECTIONS.length - 1 ? 8 : 0 }}>

              {/* Section header */}
              <div style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'10px 12px 6px',
              }}>
                <div style={{
                  fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:3,
                  color: section.color, textTransform:'uppercase', fontWeight:600,
                }} >
                  {section.label}
                </div>
                <div style={{ flex:1, height:1, background: section.color, opacity:.2 }} />
              </div>

              {/* Items */}
              {section.items.map(t => {
                const isActive = activeTab === t.id
                return (
                  <div key={t.id}
                    onClick={() => { setActiveTab(t.id); onClose() }}
                    style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'9px 12px', borderRadius:10, cursor:'pointer', marginBottom:2,
                      background: isActive ? `${section.color}12` : 'transparent',
                      border: isActive ? `1px solid ${section.color}30` : '1px solid transparent',
                      transition:'all .15s', userSelect:'none',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface2)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{
                      width:32, height:32, borderRadius:8, flexShrink:0,
                      background: isActive ? `${section.color}18` : 'var(--surface2)',
                      border: isActive ? `1px solid ${section.color}30` : '1px solid var(--border)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
                    }}>
                      {t.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{
                        fontFamily:'Bebas Neue,sans-serif', fontSize:12, letterSpacing:2,
                        color: isActive ? section.color : 'var(--text)',
                      }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize:9, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', marginTop:1 }}>
                        {t.desc}
                      </div>
                    </div>
                    {isActive && (
                      <div style={{ width:4, height:4, borderRadius:'50%', background: section.color, flexShrink:0 }} />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
          <a href="https://instagram.com/slmbnmixo" target="_blank" rel="noreferrer"
            style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', textDecoration:'none', opacity:.7 }}>
            <span>📸</span> @slmbnmixo
          </a>
        </div>
      </aside>
    </>
  )
}
