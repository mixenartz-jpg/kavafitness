import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const SECTIONS = [
  {
    label: 'GENEL',
    color: 'var(--text-muted)',
    items: [
      { id:'home',     label:'ANA MENU',         icon:'🏠', desc:'Uygulama hakkında' },
      { id:'account',  label:'HESABIM',           icon:'👤', desc:'Profil, email, şifre' },
      { id:'settings', label:'AYARLAR',           icon:'⚙',  desc:'Profil & hedefler & ölçüler' },
      { id:'share',    label:'PAYLAŞ',            icon:'📤', desc:'Antrenmanını paylaş' },
      { id:'download', label:'UYGULAMAYI İNDİR',  icon:'⬇',  desc:'Telefona ekle' },
      { id:'_notif',   label:'BİLDİRİMLER',       icon:'🔔', desc:'Tıkla & etkinleştir', notif:true },
    ]
  },
  {
    label: 'SPOR',
    color: '#e8ff47',
    items: [
      { id:'today',    label:'BUGÜN',             icon:'🏋', desc:'Günlük antrenman' },
      { id:'templates',label:'ŞABLONLAR',         icon:'📋', desc:'Antrenman şablonları' },
      { id:'history',  label:'GEÇMİŞ',            icon:'📅', desc:'Geçmiş antrenmanlar' },
      { id:'progress', label:'İLERLEME & ÖZET',   icon:'📊', desc:'Grafikler & haftalık özet' },
    ]
  },
  {
    label: 'DİYET',
    color: '#47ff8a',
    items: [
      { id:'calorie',  label:'KALORİ TAKİBİ',    icon:'🍎', desc:'Besin takibi' },
      { id:'goals',    label:'MAKRO HEDEFLER',    icon:'🎯', desc:'Günlük makro takibi' },
      { id:'aicoach',  label:'AI KOÇU',           icon:'🤖', desc:'Kalori & aktivite analizi' },
    ]
  },
  {
    label: 'KİŞİSEL KOÇUN',
    color: '#e8ff47',
    items: [
      { id:'coach', label:'KİŞİSEL KOÇUN 🔒', icon:'⭐', desc:'Tüm verileri bilen AI koç', special:true },
    ]
  },
]

const SPOTIFY_PLAYLISTS = [
  { label: "Kerem'in Gym Listesi", url: 'https://open.spotify.com/playlist/53QiU1CEjWEUJ9zxbqYHCK' },
  { label: 'Power Workout',        url: 'https://open.spotify.com/playlist/37i9dQZF1DX5n5gZBZb0AT' },
  { label: 'Gym Motivation',       url: 'https://open.spotify.com/playlist/37i9dQZF1DX76t638V6CA8' },
]

function SpotifyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#1DB954">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}

export default function NavTabs({ open, onClose }) {
  const { activeTab, setActiveTab, theme, setTheme, requestNotifPermission, notifPermission } = useApp()
  const [notifStatus, setNotifStatus] = useState(notifPermission || 'default')

  // ✅ FIX: Sidebar açıkken body scroll'u kilitle
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleNotif = async () => { const r = await requestNotifPermission(); setNotifStatus(r) }

  return (
    <>
      {open && (
        <div onClick={onClose}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)', zIndex:199 }}
        />
      )}

      <aside style={{
        position:'fixed', top:0, left:0, bottom:0, width:272,
        background:'var(--surface)', borderRight:'1px solid var(--border)',
        zIndex:200, display:'flex', flexDirection:'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform .28s cubic-bezier(.4,0,.2,1)',
        boxShadow: open ? '8px 0 40px rgba(0,0,0,.55)' : 'none',
        overflowY:'auto', scrollbarWidth:'none',
      }}>

        {/* ─ Başlık ─ */}
        <div style={{ padding:'18px 18px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <img src="/logo-sm.png" alt="" style={{ height:26, width:'auto' }} onError={e=>e.target.style.display='none'} />
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:3, color:'var(--accent)' }}>
              KERO<span style={{ color:'var(--text-muted)' }}>GYM</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:7 }}>
            <button onClick={() => setTheme(theme==='dark'?'light':'dark')}
              style={{ width:30, height:30, borderRadius:8, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}
              title={theme==='dark'?'Açık tema':'Koyu tema'}>
              {theme==='dark' ? '☀️' : '🌙'}
            </button>
            <button onClick={onClose}
              style={{ width:30, height:30, borderRadius:8, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>
              ✕
            </button>
          </div>
        </div>

        {/* ─ Navigasyon ─ */}
        <nav style={{ padding:'6px 8px', flex:1 }}>
          {SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 10px 5px' }}>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:3, color:section.color, fontWeight:600 }}>
                  {section.label}
                </span>
                <div style={{ flex:1, height:1, background:section.color, opacity:.2 }} />
              </div>

              {section.items.map(t => {
                const active = activeTab === t.id
                const clr    = t.special ? '#e8ff47' : section.color
                return (
                  <div key={t.id}
                    onClick={() => { if(t.notif){ handleNotif(); return } setActiveTab(t.id); onClose() }}
                    style={{
                      display:'flex', alignItems:'center', gap:11,
                      padding:'8px 10px', borderRadius:9, cursor:'pointer', marginBottom:1,
                      background: active ? `${clr}12` : 'transparent',
                      border: active ? `1px solid ${clr}28` : '1px solid transparent',
                      transition:'all .13s', userSelect:'none',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface2)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{
                      width:31, height:31, borderRadius:8, flexShrink:0,
                      background: active ? `${clr}18` : 'var(--surface2)',
                      border: active ? `1px solid ${clr}30` : '1px solid var(--border)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
                    }}>
                      {t.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:12, letterSpacing:2, color: active ? clr : 'var(--text)' }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize:9, fontFamily:'DM Mono,monospace', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                        color: t.notif ? (notifStatus==='granted'?'var(--green)':notifStatus==='denied'?'var(--red)':'#ff8c47') : 'var(--text-muted)' }}>
                        {t.notif ? (notifStatus==='granted'?'✅ Açık':notifStatus==='denied'?'🚫 Tarayıcıdan aç':'⚠️ Etkinleştirmek için tıkla') : t.desc}
                      </div>
                    </div>
                    {active && <div style={{ width:4, height:4, borderRadius:'50%', background:clr, flexShrink:0 }}/>}
                  </div>
                )
              })}
            </div>
          ))}

          {/* ─ Spotify Gym Listesi ─ */}
          <div style={{ marginBottom:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 10px 5px' }}>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:3, color:'#1DB954', fontWeight:600 }}>
                AYLIK GYM LİSTESİ
              </span>
              <div style={{ flex:1, height:1, background:'#1DB954', opacity:.22 }} />
            </div>

            {SPOTIFY_PLAYLISTS.map((pl, i) => (
              <a key={i} href={pl.url} target="_blank" rel="noreferrer" onClick={onClose}
                style={{
                  display:'flex', alignItems:'center', gap:11,
                  padding:'8px 10px', borderRadius:9, marginBottom:1,
                  border:'1px solid transparent', textDecoration:'none',
                  transition:'all .13s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.borderColor='rgba(29,185,84,.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent' }}
              >
                <div style={{ width:31, height:31, borderRadius:8, flexShrink:0, background:'rgba(29,185,84,.1)', border:'1px solid rgba(29,185,84,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <SpotifyIcon />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {pl.label}
                  </div>
                  <div style={{ fontSize:9, color:'#1DB954', fontFamily:'DM Mono,monospace', marginTop:1 }}>
                    Spotify'da aç ↗
                  </div>
                </div>
              </a>
            ))}
          </div>
        </nav>

        {/* ─ Alt kısım ─ */}
        <div style={{ padding:'14px 18px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
          <a href="https://instagram.com/slmbnmixo" target="_blank" rel="noreferrer"
            style={{ display:'flex', alignItems:'center', gap:7, fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', textDecoration:'none', opacity:.65 }}>
            <span>📸</span> @slmbnmixo
          </a>
        </div>
      </aside>
    </>
  )
}
