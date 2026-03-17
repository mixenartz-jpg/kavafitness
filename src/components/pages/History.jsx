import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function HistoryPage() {
  const { exercises, exArchive, todayKey, setViewingDate, setActiveTab } = useApp()
  const [openDays, setOpenDays] = useState({})
  const [search, setSearch]     = useState('')

  const today = todayKey()

  // BUG FIX: Bugünkü egzersizleri de geçmişe dahil et
  const allEntries = []

  // Bugün varsa en başa ekle
  if (exercises.length > 0) {
    allEntries.push({ dk: today, exs: exercises, isToday: true })
  }

  // Arşiv günleri
  Object.keys(exArchive)
    .filter(k => exArchive[k]?.length > 0)
    .sort((a, b) => b.localeCompare(a))
    .forEach(dk => allEntries.push({ dk, exs: exArchive[dk], isToday: false }))

  // Arama filtresi
  const filtered = search.trim()
    ? allEntries.filter(({ exs }) =>
        exs.some(e => e.name.toLowerCase().includes(search.toLowerCase()))
      )
    : allEntries

  const toggleDay = (key) => setOpenDays(p => ({ ...p, [key]: !p[key] }))

  const goToDay = (dk) => {
    setViewingDate(dk)
    setActiveTab('today')
  }

  if (allEntries.length === 0) {
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
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, letterSpacing:3, color:'var(--accent)' }}>
          GEÇMİŞ ANTRENMANLAR
        </div>
        <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'5px 12px' }}>
          {allEntries.length} gün
        </div>
      </div>

      {/* Arama */}
      <div style={{ marginBottom:16 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Egzersiz ara... (Bench Press, Squat...)"
          style={{ width:'100%' }}
        />
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)', fontFamily:'DM Mono,monospace', fontSize:12 }}>
          "{search}" için sonuç bulunamadı
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {filtered.map(({ dk, exs, isToday }) => {
          const d    = new Date(dk + 'T00:00:00')
          const lbl  = d.toLocaleDateString('tr-TR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).toUpperCase()
          const ts   = exs.reduce((s, e) => s + e.sets.length, 0)
          const mw   = exs.reduce((m, e) => Math.max(m, e.sets.reduce((mm, st) => Math.max(mm, +st.weight), 0)), 0)
          const open = openDays[dk] !== false

          // Arama varsa eşleşen egzersizleri vurgula
          const matchedExs = search.trim()
            ? exs.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
            : exs

          return (
            <div key={dk} className="card" style={{ overflow:'hidden', borderColor: isToday ? 'rgba(232,255,71,.25)' : undefined }}>
              <div
                onClick={() => toggleDay(dk)}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'14px 17px', cursor:'pointer', userSelect:'none',
                  borderBottom: open ? '1px solid var(--border)' : '1px solid transparent',
                  transition:'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:2 }}>{lbl}</div>
                    {isToday && (
                      <span style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:2, color:'#0a0a0a', background:'var(--accent)', borderRadius:20, padding:'2px 8px' }}>BUGÜN</span>
                    )}
                  </div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>
                    {exs.length} egzersiz · {ts} set · max {mw} kg
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <button
                    onClick={e => { e.stopPropagation(); goToDay(dk) }}
                    style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'4px 10px', cursor:'pointer', transition:'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                  >
                    Görüntüle →
                  </button>
                  <span style={{ color:'var(--text-muted)', transition:'transform .2s', transform:open?'rotate(180deg)':'', fontSize:15 }}>⌄</span>
                </div>
              </div>

              {open && (
                <div style={{ padding:'12px 17px' }}>
                  {(search.trim() ? matchedExs : exs).map((ex, i) => {
                    const isMatch = search.trim() && ex.name.toLowerCase().includes(search.toLowerCase())
                    return (
                      <div key={i} style={{
                        display:'flex', alignItems:'flex-start', justifyContent:'space-between',
                        padding:'9px 0',
                        borderBottom: i < (search.trim() ? matchedExs : exs).length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                        gap:14,
                      }}>
                        <div>
                          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:1, color: isMatch ? 'var(--accent)' : 'var(--text)' }}>
                            {ex.name}
                          </div>
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
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
