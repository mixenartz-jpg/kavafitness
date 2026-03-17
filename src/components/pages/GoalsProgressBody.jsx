// Goals.jsx
import { useState } from 'react'
import { useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export function GoalsPage() {
  const { goals, profile, foods } = useApp()

  const totals = foods.reduce((t, f) => ({
    kcal: t.kcal + (+f.kcal || 0), protein: t.protein + (+f.protein || 0),
    fat: t.fat + (+f.fat || 0), carb: t.carb + (+f.carb || 0),
  }), { kcal: 0, protein: 0, fat: 0, carb: 0 })

  const fields = [
    { key: 'kcal',    label: 'KALORİ',       unit: 'kcal', color: '#e8ff47' },
    { key: 'protein', label: 'PROTEİN',       unit: 'g',    color: '#47c8ff' },
    { key: 'fat',     label: 'YAĞ',           unit: 'g',    color: '#ff8c47' },
    { key: 'carb',    label: 'KARBONHİDRAT',  unit: 'g',    color: '#47ff8a' },
  ]

  const GOAL_LABELS = { lose:'Kilo Ver', maintain:'Kilo Koru', gain:'Kilo Al', cut:'Yag Yak' }
  const LEVEL_LABELS = { beginner:'Yeni Baslayan', intermediate:'Orta', advanced:'İleri' }

  return (
    <div className="page">
      {profile && (
        <div style={{ background:'rgba(232,255,71,.05)', border:'1px solid rgba(232,255,71,.12)', borderRadius:14, padding:'16px 18px', marginBottom:24 }}>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:3, color:'var(--accent)', marginBottom:10 }}>KİŞİSEL PROFİL</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {profile.goal && <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:20, padding:'4px 12px', color:'var(--text-muted)' }}>{GOAL_LABELS[profile.goal] || profile.goal}</span>}
            {profile.level && <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:20, padding:'4px 12px', color:'var(--text-muted)' }}>{LEVEL_LABELS[profile.level] || profile.level}</span>}
            {profile.tdee && <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:20, padding:'4px 12px', color:'var(--text-muted)' }}>~{profile.tdee} kcal/gun</span>}
            {profile.trainDays?.length > 0 && <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:20, padding:'4px 12px', color:'var(--text-muted)' }}>Haftada {profile.trainDays.length} gun</span>}
          </div>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', marginTop:8 }}>
            Ayarlar sayfasindan degistirebilirsin
          </div>
        </div>
      )}

      <div className="section-title">GUNLUK MAKRO TAKİBİ</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 24 }}>
        {fields.map(({ key, label, unit, color }) => {
          const cur = Math.round(totals[key]); const tgt = goals[key] || 1
          const pct = Math.min(100, Math.round((cur / tgt) * 100))
          const barColor = pct >= 100 ? 'var(--red)' : pct >= 75 ? 'var(--accent)' : color
          return (
            <div key={key} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, letterSpacing: 2, color: 'var(--text-muted)' }}>{label}</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                  <b style={{ color: 'var(--text)' }}>{cur}</b> / {goals[key]} {unit}
                </div>
              </div>
              <div style={{ background: 'var(--surface3)', borderRadius: 20, height: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 20, width: `${pct}%`, background: barColor, transition: 'width .6s ease' }} />
              </div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, marginTop: 7, textAlign: 'right', color: pct >= 100 ? 'var(--red)' : pct >= 75 ? 'var(--accent)' : 'var(--text-muted)' }}>
                {pct}%
              </div>
            </div>
          )
        })}
      </div>

      {!profile && (
        <div style={{ textAlign:'center', padding:'20px 0', fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.7 }}>
          Hedeflerini otomatik hesaplamak icin<br />
          <b style={{ color:'var(--accent)' }}>Ayarlar sayfasini</b> doldur.
        </div>
      )}
    </div>
  )
}

export function ProgressPage() {
  const { exercises, exArchive, foods, calArch, goals, todayKey } = useApp()
  const [selEx, setSelEx] = useState('')
  const [metric, setMetric] = useState('weight')
  const [range, setRange] = useState(7)
  const exChartRef = useRef(null); const exChartInst = useRef(null)
  const calChartRef = useRef(null); const calChartInst = useRef(null)

  const allExNames = () => {
    const s = new Set()
    exercises.forEach(e => s.add(e.name))
    Object.values(exArchive).forEach(day => day.forEach(e => s.add(e.name)))
    return [...s].sort()
  }

  const tabStyle = (active) => ({
    fontFamily: 'DM Mono,monospace', fontSize: 10, padding: '5px 10px', borderRadius: 6,
    border: 'none', cursor: 'pointer', transition: 'all .15s',
    background: active ? 'var(--accent)' : 'var(--surface2)',
    color: active ? '#0a0a0a' : 'var(--text-muted)',
  })

  useEffect(() => {
    if (!selEx || !exChartRef.current) return
    const allDays = [...Object.entries(exArchive).sort((a, b) => a[0].localeCompare(b[0]))]
    if (exercises.length > 0) allDays.push([todayKey(), exercises])
    const labels = [], values = []
    allDays.forEach(([dk, exs]) => {
      const ex = exs.find(e => e.name.toLowerCase() === selEx.toLowerCase())
      if (!ex || ex.sets.length === 0) return
      const d = new Date(dk + 'T00:00:00')
      labels.push(d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }))
      values.push(metric === 'weight' ? Math.max(...ex.sets.map(s => +s.weight)) : ex.sets.reduce((s, st) => s + (+st.reps), 0))
    })
    if (exChartInst.current) exChartInst.current.destroy()
    exChartInst.current = new Chart(exChartRef.current, {
      type: 'line',
      data: { labels, datasets: [{ label: metric === 'weight' ? 'Max Agirlik (kg)' : 'Toplam Tekrar', data: values, borderColor: '#e8ff47', backgroundColor: 'rgba(232,255,71,.08)', borderWidth: 2, pointBackgroundColor: '#e8ff47', pointRadius: 4, tension: .3, fill: true }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#666', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#666', font: { size: 10 } } } } }
    })
    return () => exChartInst.current?.destroy()
  }, [selEx, metric, exArchive, exercises])

  useEffect(() => {
    if (!calChartRef.current) return
    const labels = [], values = [], goalLine = []
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const dk = d.toISOString().slice(0, 10)
      labels.push(d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }))
      const fs = dk === todayKey() ? foods : (calArch[dk] || [])
      values.push(Math.round(fs.reduce((s, f) => s + (+f.kcal || 0), 0)))
      goalLine.push(goals.kcal)
    }
    if (calChartInst.current) calChartInst.current.destroy()
    calChartInst.current = new Chart(calChartRef.current, {
      type: 'bar',
      data: { labels, datasets: [
        { label: 'Kalori', data: values, backgroundColor: 'rgba(232,255,71,.5)', borderColor: '#e8ff47', borderWidth: 1, borderRadius: 4 },
        { label: 'Hedef', data: goalLine, type: 'line', borderColor: 'rgba(255,71,71,.6)', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0, fill: false },
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#666', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#666', font: { size: 10 } } } } }
    })
    return () => calChartInst.current?.destroy()
  }, [range, foods, calArch, goals])

  return (
    <div className="page">
      <div className="section-title">EGZERSİZ İLERLEMESİ</div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, letterSpacing: 2 }}>AGIRLIK / TEKRAR TAKİBİ</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={selEx} onChange={e => setSelEx(e.target.value)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Mono,monospace', fontSize: 11, padding: '5px 10px', outline: 'none' }}>
              <option value="">Egzersiz Sec</option>
              {allExNames().map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 4 }}>
              {['weight', 'reps'].map(m => <button key={m} style={tabStyle(metric === m)} onClick={() => setMetric(m)}>{m === 'weight' ? 'Agirlik' : 'Tekrar'}</button>)}
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', height: 200 }}>
          <canvas ref={exChartRef} />
          {!selEx && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace', fontSize: 12 }}>Yukaridan egzersiz sec</div>}
        </div>
      </div>
      <div className="section-title">KALORİ TARİHCESİ</div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, letterSpacing: 2 }}>GUNLUK KALORİ</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[7, 14, 30].map(r => <button key={r} style={tabStyle(range === r)} onClick={() => setRange(r)}>{r} Gun</button>)}
          </div>
        </div>
        <div style={{ position: 'relative', height: 200 }}><canvas ref={calChartRef} /></div>
      </div>
    </div>
  )
}

export function BodyPage() {
  return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-icon">⚖️</div>
        <div className="empty-title">OLCULER TASINDI</div>
        <div className="empty-sub">Vucut olcumleri artik Ayarlar menusu altinda.</div>
      </div>
    </div>
  )
}
