import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function HistoryPage() {
  const { exercises, exArchive, todayKey } = useApp()
  const [openDays, setOpenDays] = useState({})

  const allDates = Object.keys(exArchive)
    .filter(k => exArchive[k]?.length > 0)
    .sort((a, b) => b.localeCompare(a))

  const toggleDay = (key) => setOpenDays(p => ({ ...p, [key]: !p[key] }))

  if (allDates.length === 0) {
    return (
      <div className="page">
        <div className="section-title">GEÇMİŞ ANTRENMANLAR</div>
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div className="empty-title">GEÇMİŞ YOK</div>
          <div className="empty-sub">Antrenman yaptıkça burada görünecek.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="section-title">GEÇMİŞ ANTRENMANLAR</div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {allDates.map(dk => {
          const exs  = exArchive[dk]
          const d    = new Date(dk + 'T00:00:00')
          const lbl  = d.toLocaleDateString('tr-TR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).toUpperCase()
          const ts   = exs.reduce((s, e) => s + e.sets.length, 0)
          const mw   = exs.reduce((m, e) => Math.max(m, e.sets.reduce((mm, st) => Math.max(mm, +st.weight), 0)), 0)
          const open = openDays[dk] !== false

          return (
            <div key={dk} className="card" style={{ overflow:'hidden' }}>
              <div onClick={() => toggleDay(dk)} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'14px 17px', cursor:'pointer', userSelect:'none',
                borderBottom: open ? '1px solid var(--border)' : '1px solid transparent',
                transition:'background .15s',
              }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                onMouseLeave={e=>e.currentTarget.style.background=''}
              >
                <div>
                  <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:17, letterSpacing:2 }}>{lbl}</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', marginTop:2 }}>
                    {exs.length} egzersiz · {ts} set · max {mw} kg
                  </div>
                </div>
                <span style={{ color:'var(--text-muted)', transition:'transform .2s', transform:open?'rotate(180deg)':'', fontSize:15 }}>⌄</span>
              </div>

              {open && (
                <div style={{ padding:'12px 17px' }}>
                  {exs.map((ex, i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'flex-start', justifyContent:'space-between',
                      padding:'9px 0', borderBottom: i < exs.length-1 ? '1px solid rgba(255,255,255,.04)' : 'none', gap:14,
                    }}>
                      <div>
                        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:1 }}>{ex.name}</div>
                        <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', marginTop:2 }}>{ex.sets.length} set</div>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'flex-end' }}>
                        {ex.sets.map((s, si) => (
                          <span key={si} style={{
                            fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)',
                            background:'var(--surface2)', border:'1px solid var(--border)',
                            padding:'3px 8px', borderRadius:20,
                          }}>
                            Set {si+1}: <b style={{ color:'var(--text)', fontWeight:500 }}>{s.reps}×{s.weight}kg</b>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
