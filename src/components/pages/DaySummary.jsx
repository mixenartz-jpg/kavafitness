import { useApp } from '../../context/AppContext'

export default function DaySummaryPage() {
  const { viewingDate, exArchive, calArch, todayKey, setViewingDate } = useApp()

  const isToday = viewingDate === todayKey()
  if (isToday) return null

  const exs   = exArchive[viewingDate] || []
  const foods = calArch[viewingDate]   || []

  const dateLabel = new Date(viewingDate + 'T00:00:00')
    .toLocaleDateString('tr-TR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    .toUpperCase()

  const totalSets = exs.reduce((s, e) => s + e.sets.length, 0)
  const maxWeight = exs.reduce((m, e) => Math.max(m, e.sets.reduce((mm, st) => Math.max(mm, +st.weight), 0)), 0)
  const totalKcal = Math.round(foods.reduce((s, f) => s + (+f.kcal    || 0), 0))
  const totalProt = Math.round(foods.reduce((s, f) => s + (+f.protein || 0), 0))
  const totalFat  = Math.round(foods.reduce((s, f) => s + (+f.fat     || 0), 0))
  const totalCarb = Math.round(foods.reduce((s, f) => s + (+f.carb    || 0), 0))

  return (
    <div className="page animate-fade" style={{ maxWidth: 700 }}>

      {/* Banner */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
        background:'rgba(71,200,255,.06)', border:'1px solid rgba(71,200,255,.2)',
        borderRadius:10, padding:'10px 16px', marginBottom:24,
        fontSize:12, color:'var(--blue)', fontFamily:'DM Mono,monospace', flexWrap:'wrap',
      }}>
        <span>📅 {dateLabel}</span>
        <button
          className="btn btn-ghost"
          style={{ height:28, fontSize:11, padding:'0 12px' }}
          onClick={() => setViewingDate(todayKey())}
        >
          Bugüne Dön
        </button>
      </div>

      {/* ── ANTRENMAN ── */}
      <div className="section-title">🏋️ ANTRENMAN</div>

      {exs.length === 0 ? (
        <div className="card" style={{ padding:'28px 24px', textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:32, opacity:.3, marginBottom:8 }}>😴</div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:2, color:'var(--text-muted)' }}>
            Bu gün antrenman yapılmamış
          </div>
        </div>
      ) : (
        <>
          {/* Özet istatistikler */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
            {[
              { label:'Egzersiz',   val: exs.length, unit:'adet', color:'var(--accent)' },
              { label:'Toplam Set', val: totalSets,  unit:'set',  color:'var(--accent)' },
              { label:'Max Ağırlık',val: maxWeight,  unit:'kg',   color:'var(--accent)' },
            ].map(({ label, val, unit, color }) => (
              <div key={label} className="card" style={{ padding:'14px 16px', textAlign:'center' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:2, color:'var(--text-muted)', marginBottom:6 }}>
                  {label}
                </div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:30, lineHeight:1, color }}>
                  {val} <span style={{ fontSize:12, color:'var(--text-muted)' }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Egzersiz listesi */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
            {exs.map((ex, i) => (
              <div key={i} className="card" style={{ padding:'14px 17px' }}>
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  marginBottom: ex.sets.length > 0 ? 10 : 0,
                }}>
                  <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:17, letterSpacing:1.5 }}>
                    {ex.name}
                  </span>
                  <span style={{
                    fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)',
                    background:'var(--surface2)', padding:'3px 9px',
                    borderRadius:20, border:'1px solid var(--border)',
                  }}>
                    {ex.sets.length} SET
                  </span>
                </div>
                {ex.sets.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {ex.sets.map((s, si) => (
                      <span key={si} style={{
                        fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)',
                        background:'var(--surface2)', border:'1px solid var(--border)',
                        padding:'3px 9px', borderRadius:20,
                      }}>
                        Set {si+1}: <b style={{ color:'var(--text)' }}>{s.reps}×{s.weight}kg</b>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── BESLENME ── */}
      <div className="section-title">🍎 BESLENME</div>

      {foods.length === 0 ? (
        <div className="card" style={{ padding:'28px 24px', textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:32, opacity:.3, marginBottom:8 }}>🍽️</div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:2, color:'var(--text-muted)' }}>
            Bu gün yemek kaydı yok
          </div>
        </div>
      ) : (
        <>
          {/* Makro özeti */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
            {[
              { label:'KALORİ',  val: totalKcal, unit:'kcal', color:'#e8ff47' },
              { label:'PROTEİN', val: totalProt, unit:'g',    color:'#47c8ff' },
              { label:'YAĞ',     val: totalFat,  unit:'g',    color:'#ff8c47' },
              { label:'KARB',    val: totalCarb, unit:'g',    color:'#47ff8a' },
            ].map(({ label, val, unit, color }) => (
              <div key={label} className="card" style={{ padding:'12px', textAlign:'center' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:8, letterSpacing:2, color:'var(--text-muted)', marginBottom:4 }}>
                  {label}
                </div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:24, lineHeight:1, color }}>
                  {val}
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', marginTop:2 }}>
                  {unit}
                </div>
              </div>
            ))}
          </div>

          {/* Yemek listesi */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
            {foods.map((f, fi) => (
              <div key={fi} className="card" style={{
                padding:'11px 14px',
                display:'flex', alignItems:'center', gap:12,
              }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, letterSpacing:1, marginBottom:3 }}>
                    {f.name}
                  </div>
                  <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                    {[
                      { v:f.kcal,          u:'kcal', c:'#e8ff47' },
                      { v:`${f.protein}g`,  u:'P',    c:'#47c8ff' },
                      { v:`${f.fat}g`,      u:'Y',    c:'#ff8c47' },
                      { v:`${f.carb}g`,     u:'K',    c:'#47ff8a' },
                    ].map(({ v, u, c }) => (
                      <span key={u} style={{
                        fontFamily:'DM Mono,monospace', fontSize:10,
                        padding:'2px 7px', borderRadius:20,
                        border:'1px solid rgba(255,255,255,.07)', color:c,
                      }}>
                        {u} {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}
