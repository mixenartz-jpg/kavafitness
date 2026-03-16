import { useState, useEffect } from 'react'
import { auth, db } from '../firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useApp } from '../context/AppContext'
import NavTabs from './NavTabs'

const DAYS = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt']

function stringToColor(str) {
  const colors = ['#e8ff47','#47c8ff','#47ff8a','#ff8c47','#ff47c8','#c847ff']
  let h = 0; for (let i=0;i<str.length;i++) h=str.charCodeAt(i)+((h<<5)-h)
  return colors[Math.abs(h)%colors.length]
}

export default function Header() {
  const { user, exercises, exArchive, viewingDate, setViewingDate, setActiveTab } = useApp()
  const [username, setUsername] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then(s => {
      if (s.exists()) setUsername(s.data().username || '')
    })
  }, [user])

  const todayKey = () => new Date().toISOString().slice(0, 10)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const isToday = key === todayKey()
    const hasData = isToday ? exercises.length > 0 : (exArchive[key]?.length > 0)
    const isActive = key === viewingDate
    return { d, key, isToday, hasData, isActive }
  })

  return (
    <>
      {/* Sidebar */}
      <NavTabs open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── TOP BAR ── */}
      <header style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(10,10,10,.94)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid var(--border)',
        padding:'0 14px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        height:56, gap:8, overflow:'hidden',
      }}>
        {/* Left: Hamburger + Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background:'var(--surface2)', border:'1px solid var(--border)',
              color:'var(--text)', width:36, height:36, borderRadius:9,
              cursor:'pointer', display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:5,
              transition:'all .15s', flexShrink:0, padding:0,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#444'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span style={{ display:'block', width:16, height:1.5, background:'var(--text)', borderRadius:2 }} />
            <span style={{ display:'block', width:12, height:1.5, background:'var(--accent)', borderRadius:2 }} />
            <span style={{ display:'block', width:16, height:1.5, background:'var(--text)', borderRadius:2 }} />
          </button>

          {/* Logo */}
          <div onClick={() => setActiveTab('home')}
            style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <img src="/logo-sm.png" alt="KeroGym" style={{ height:30, width:'auto' }} />
            <div style={{
              fontFamily:'Bebas Neue,sans-serif', fontSize:22, letterSpacing:3,
              color:'var(--accent)', textShadow:'0 0 20px rgba(232,255,71,.3)', whiteSpace:'nowrap',
            }}>
              KERO<span style={{ color:'var(--text-muted)' }}>GYM</span>
            </div>
          </div>
        </div>

        {/* Right buttons */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <a href="https://instagram.com/slmbnmixo" target="_blank" rel="noreferrer"
            style={{
              display:'flex', alignItems:'center', gap:5, padding:'5px 10px',
              borderRadius:20, background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
              color:'#fff', fontSize:11, fontWeight:600, textDecoration:'none', whiteSpace:'nowrap',
            }}>
            <svg width="13" height="13" fill="#fff" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="hide-mobile">Geri Bildirim</span>
          </a>

          <button onClick={() => setShowModal(true)} style={{
            display:'flex', alignItems:'center', gap:5, padding:'5px 10px',
            borderRadius:20, background:'var(--surface2)', border:'1px solid var(--border)',
            color:'var(--text)', fontSize:11, cursor:'pointer', fontFamily:'DM Mono,monospace', whiteSpace:'nowrap',
          }}>
            <div style={{
              width:20, height:20, borderRadius:'50%', flexShrink:0,
              background: username ? stringToColor(username) : 'var(--accent)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'Bebas Neue,sans-serif', fontSize:11, color:'#0a0a0a',
            }}>
              {username ? username[0].toUpperCase() : '?'}
            </div>
            <span className="hide-mobile">{username || 'Profil'}</span>
          </button>
        </div>
      </header>

      {/* ── WEEK STRIP ── */}
      <div style={{
        background:'rgba(10,10,10,.94)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid var(--border)',
        display:'flex', alignItems:'center',
        overflowX:'auto', padding:'6px 10px', gap:4,
        position:'sticky', top:56, zIndex:99,
        scrollbarWidth:'none',
      }}
        className="week-strip-row"
      >
        {weekDays.map(({ d, key, isToday, hasData, isActive }) => (
          <div key={key} onClick={() => setViewingDate(key)}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:2,
              padding:'5px 8px', borderRadius:10, cursor:'pointer',
              minWidth:40, flexShrink:0,
              border:`1px solid ${isActive?'var(--accent)':'transparent'}`,
              background: isActive ? 'var(--accent)' : 'transparent',
              transition:'all .18s', userSelect:'none',
            }}>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:8, letterSpacing:1, textTransform:'uppercase',
              color: isActive ? '#0a0a0a' : isToday ? 'var(--accent)' : 'var(--text-muted)' }}>
              {DAYS[d.getDay()]}
            </span>
            <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, lineHeight:1,
              color: isActive ? '#0a0a0a' : isToday ? 'var(--accent)' : 'var(--text)' }}>
              {d.getDate()}
            </span>
            {hasData && !isActive && (
              <span style={{ width:4, height:4, borderRadius:'50%', background:'var(--accent)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Profile Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth:320 }}>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, letterSpacing:3, marginBottom:16 }}>👤 PROFİL</div>
            <div style={{
              display:'flex', alignItems:'center', gap:14,
              background:'var(--surface2)', border:'1px solid var(--border)',
              borderRadius:12, padding:16, marginBottom:20,
            }}>
              <div style={{
                width:48, height:48, borderRadius:'50%', flexShrink:0,
                background: username ? stringToColor(username) : 'var(--accent)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'Bebas Neue,sans-serif', fontSize:22, color:'#0a0a0a',
              }}>
                {username ? username[0].toUpperCase() : '?'}
              </div>
              <div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:1 }}>{username}</div>
                <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>@{username}</div>
              </div>
            </div>
            <button className="btn btn-ghost" style={{ width:'100%', borderColor:'rgba(255,71,71,.3)', color:'var(--red)' }}
              onClick={() => { signOut(auth); setShowModal(false) }}>
              🚪 Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </>
  )
}