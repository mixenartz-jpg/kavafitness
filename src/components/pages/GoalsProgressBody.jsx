// Goals.jsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export function GoalsPage() {
  const { goals, saveGoals, foods, showToast } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState(goals)

  // ── Kalori Hedefi Hesaplayıcı ──
  const [calcForm, setCalcForm] = useState({ weight:'', height:'', age:'', gender:'male', activity:'1.55', goal:'maintain' })
  const [calcResult, setCalcResult] = useState(null)

  const ACTIVITY_LEVELS = [
    { val:'1.2',  label:'Hareketsiz (masa başı)' },
    { val:'1.375',label:'Az aktif (haftada 1-3 gün)' },
    { val:'1.55', label:'Orta aktif (haftada 3-5 gün)' },
    { val:'1.725',label:'Çok aktif (haftada 6-7 gün)' },
    { val:'1.9',  label:'Ekstra aktif (günde 2x antrenman)' },
  ]

  const calcTDEE = () => {
    const { weight, height, age, gender, activity, goal } = calcForm
    if (!weight || !height || !age) return
    const bmr = gender === 'male'
      ? 10 * +weight + 6.25 * +height - 5 * +age + 5
      : 10 * +weight + 6.25 * +height - 5 * +age - 161
    const tdee = Math.round(bmr * +activity)
    const target = goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee
    const protein = Math.round(+weight * 2.0)
    const fat = Math.round((target * 0.25) / 9)
    const carb = Math.round((target - protein * 4 - fat * 9) / 4)
    setCalcResult({ tdee, target, protein, fat, carb, goal })
  }

  const applyToGoals = () => {
    if (!calcResult) return
    const newGoals = { kcal: calcResult.target, protein: calcResult.protein, fat: calcResult.fat, carb: calcResult.carb }
    saveGoals(newGoals)
    setDraft(newGoals)
    showToast('Hedefler güncellendi ✓')
  }

  const totals = foods.reduce((t, f) => ({
    kcal: t.kcal + (+f.kcal || 0), protein: t.protein + (+f.protein || 0),
    fat: t.fat + (+f.fat || 0), carb: t.carb + (+f.carb || 0),
  }), { kcal: 0, protein: 0, fat: 0, carb: 0 })

  const handleSave = () => { saveGoals(draft); setShowForm(false); showToast('Hedefler kaydedildi ✓') }

  const fields = [
    { key: 'kcal',    label: 'KALORİ',       unit: 'kcal', color: '#e8ff47' },
    { key: 'protein', label: 'PROTEİN',       unit: 'g',    color: '#47c8ff' },
    { key: 'fat',     label: 'YAĞ',           unit: 'g',    color: '#ff8c47' },
    { key: 'carb',    label: 'KARBONHİDRAT',  unit: 'g',    color: '#47ff8a' },
  ]

  const goalLabels = { lose: '🔥 Kilo Verme (-500 kcal)', maintain: '⚖️ Kilo Koruma', gain: '💪 Kilo Alma (+300 kcal)' }

  return (
    <div className="page">
      <div className="section-title">GÜNLÜK MAKRO HEDEFLERİ</div>
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

      <button className="btn" onClick={() => { setDraft(goals); setShowForm(v => !v) }} style={{
        width: '100%', padding: 12, background: 'var(--surface)', border: '1px dashed var(--border)',
        color: 'var(--text-muted)', marginBottom: 16, justifyContent: 'center', gap: 8,
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
        ✏️ Hedefleri Manuel Düzenle
      </button>

      {showForm && (
        <div className="card animate-fade" style={{ padding: 20, marginBottom: 16 }}>
          <div className="section-title">HEDEFLERİ AYARLA</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr) auto', gap: 10, alignItems: 'flex-end' }}>
            {fields.map(({ key, label, unit }) => (
              <div key={key} className="form-group">
                <span className="flabel">{label} ({unit})</span>
                <input type="number" value={draft[key]} min="0" onChange={e => setDraft(p => ({ ...p, [key]: +e.target.value }))} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleSave}>Kaydet</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Kalori Hedefi Hesaplayıcı ── */}
      <div className="section-title" style={{ marginTop: 8 }}>KALORİ HEDEFİ HESAPLAYICI</div>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 12 }}>
          <div className="form-group">
            <span className="flabel">Cinsiyet</span>
            <select value={calcForm.gender} onChange={e => setCalcForm(p => ({ ...p, gender: e.target.value }))}>
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
            </select>
          </div>
          <div className="form-group">
            <span className="flabel">Yaş</span>
            <input type="number" value={calcForm.age} placeholder="25" onChange={e => setCalcForm(p => ({ ...p, age: e.target.value }))} />
          </div>
          <div className="form-group">
            <span className="flabel">Kilo (kg)</span>
            <input type="number" value={calcForm.weight} placeholder="75" onChange={e => setCalcForm(p => ({ ...p, weight: e.target.value }))} />
          </div>
          <div className="form-group">
            <span className="flabel">Boy (cm)</span>
            <input type="number" value={calcForm.height} placeholder="175" onChange={e => setCalcForm(p => ({ ...p, height: e.target.value }))} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <span className="flabel">Aktivite Seviyesi</span>
          <select value={calcForm.activity} onChange={e => setCalcForm(p => ({ ...p, activity: e.target.value }))}>
            {ACTIVITY_LEVELS.map(a => <option key={a.val} value={a.val}>{a.label}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <span className="flabel">Hedef</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {['lose', 'maintain', 'gain'].map(g => (
              <div key={g} onClick={() => setCalcForm(p => ({ ...p, goal: g }))} style={{
                padding: '10px 8px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                background: calcForm.goal === g ? 'rgba(232,255,71,.08)' : 'var(--surface2)',
                border: `1px solid ${calcForm.goal === g ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                fontFamily: 'DM Mono,monospace', fontSize: 10,
                color: calcForm.goal === g ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all .15s',
              }}>
                {goalLabels[g]}
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={calcTDEE}>
          🎯 Kalori Hedefi Hesapla
        </button>

        {calcResult && (
          <div className="animate-fade" style={{ marginTop: 16, padding: 16, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 12 }}>
              {[
                { label: 'TDEE (Günlük Yakım)', val: calcResult.tdee, unit: 'kcal', color: 'var(--text-muted)' },
                { label: goalLabels[calcResult.goal], val: calcResult.target, unit: 'kcal', color: 'var(--accent)' },
                { label: 'Protein', val: calcResult.protein, unit: 'g', color: '#47c8ff' },
                { label: 'Yağ', val: calcResult.fat, unit: 'g', color: '#ff8c47' },
                { label: 'Karbonhidrat', val: calcResult.carb, unit: 'g', color: '#47ff8a' },
              ].map(({ label, val, unit, color }) => (
                <div key={label} style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 24, color }}>
                    {val} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={applyToGoals}>
              ✅ Bu Hedefleri Uygula
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Progress ──
import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

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
      data: {
        labels, datasets: [{
          label: metric === 'weight' ? 'Max Ağırlık (kg)' : 'Toplam Tekrar', data: values,
          borderColor: '#e8ff47', backgroundColor: 'rgba(232,255,71,.08)', borderWidth: 2,
          pointBackgroundColor: '#e8ff47', pointRadius: 4, tension: .3, fill: true,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a1a', borderColor: '#333', borderWidth: 1, titleColor: '#f0f0f0', bodyColor: '#999' } },
        scales: { x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#666', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#666', font: { size: 10 } } } }
      }
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
      data: {
        labels, datasets: [
          { label: 'Kalori', data: values, backgroundColor: 'rgba(232,255,71,.5)', borderColor: '#e8ff47', borderWidth: 1, borderRadius: 4 },
          { label: 'Hedef', data: goalLine, type: 'line', borderColor: 'rgba(255,71,71,.6)', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0, fill: false },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#666', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#666', font: { size: 10 } } } }
      }
    })
    return () => calChartInst.current?.destroy()
  }, [range, foods, calArch, goals])

  return (
    <div className="page">
      <div className="section-title">EGZERSİZ İLERLEMESİ</div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, letterSpacing: 2 }}>AĞIRLIK / TEKRAR TAKİBİ</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={selEx} onChange={e => setSelEx(e.target.value)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Mono,monospace', fontSize: 11, padding: '5px 10px', outline: 'none' }}>
              <option value="">Egzersiz Seç</option>
              {allExNames().map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 4 }}>
              {['weight', 'reps'].map(m => <button key={m} style={tabStyle(metric === m)} onClick={() => setMetric(m)}>{m === 'weight' ? 'Ağırlık' : 'Tekrar'}</button>)}
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', height: 200 }}>
          <canvas ref={exChartRef} />
          {!selEx && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace', fontSize: 12 }}>Yukarıdan egzersiz seç</div>}
        </div>
      </div>

      <div className="section-title">KALORİ TARİHÇESİ</div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, letterSpacing: 2 }}>GÜNLÜK KALORİ</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[7, 14, 30].map(r => <button key={r} style={tabStyle(range === r)} onClick={() => setRange(r)}>{r} Gün</button>)}
          </div>
        </div>
        <div style={{ position: 'relative', height: 200 }}><canvas ref={calChartRef} /></div>
      </div>
    </div>
  )
}

// ── Body ──
export function BodyPage() {
  const { body, saveBody, showToast, todayKey } = useApp()
  const [form, setForm] = useState({ date: todayKey(), weight: '', waist: '', chest: '', hip: '', neck: '' })
  const [fatForm, setFatForm] = useState({ gender: 'male', weight: '', height: '', waist: '', neck: '', hip: '' })
  const [fatResult, setFatResult] = useState(null)
  const chartRef = useRef(null); const chartInst = useRef(null)

  useEffect(() => {
    if (!chartRef.current || body.length === 0) return
    const sorted = [...body].sort((a, b) => a.date.localeCompare(b.date))
    const labels = sorted.map(d => new Date(d.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }))
    const weights = sorted.map(d => d.weight)
    if (chartInst.current) chartInst.current.destroy()
    chartInst.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels, datasets: [{
          label: 'Kilo (kg)', data: weights,
          borderColor: '#47c8ff', backgroundColor: 'rgba(71,200,255,.08)',
          borderWidth: 2, pointBackgroundColor: '#47c8ff', pointRadius: 4, tension: .3, fill: true, spanGaps: true,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#666', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#666', font: { size: 10 } } } }
      }
    })
    return () => chartInst.current?.destroy()
  }, [body])

  const addEntry = () => {
    if (!form.weight && !form.waist && !form.chest && !form.hip) return showToast('En az bir ölçüm girin!', 'error')
    const entry = { date: form.date || todayKey(), weight: +form.weight || null, waist: +form.waist || null, chest: +form.chest || null, hip: +form.hip || null, neck: +form.neck || null }
    const existing = body.findIndex(d => d.date === entry.date)
    const updated = existing >= 0 ? body.map((d, i) => i === existing ? entry : d) : [...body, entry]
    saveBody(updated.sort((a, b) => a.date.localeCompare(b.date)))
    setForm({ date: todayKey(), weight: '', waist: '', chest: '', hip: '', neck: '' })
    showToast('Ölçüm kaydedildi ✓')
  }

  // ── Yağ Oranı Hesapla (US Navy Metodu) ──
  const calcBodyFat = () => {
    const { gender, weight, height, waist, neck, hip } = fatForm
    if (!weight || !height || !waist || !neck) return
    let fatPct
    if (gender === 'male') {
      fatPct = 495 / (1.0324 - 0.19077 * Math.log10(+waist - +neck) + 0.15456 * Math.log10(+height)) - 450
    } else {
      if (!hip) return
      fatPct = 495 / (1.29579 - 0.35004 * Math.log10(+waist + +hip - +neck) + 0.22100 * Math.log10(+height)) - 450
    }
    fatPct = Math.max(2, Math.min(60, +fatPct.toFixed(1)))
    const fatMass = +(+weight * fatPct / 100).toFixed(1)
    const leanMass = +(+weight - fatMass).toFixed(1)

    let category = ''
    if (gender === 'male') {
      category = fatPct < 6 ? 'Zorunlu yağ' : fatPct < 14 ? 'Atletik' : fatPct < 18 ? 'Fit' : fatPct < 25 ? 'Ortalama' : 'Yüksek'
    } else {
      category = fatPct < 14 ? 'Zorunlu yağ' : fatPct < 21 ? 'Atletik' : fatPct < 25 ? 'Fit' : fatPct < 32 ? 'Ortalama' : 'Yüksek'
    }

    // Su gereksinimi (kg başına 35ml + aktivite bonusu)
    const waterLiters = +(+weight * 0.035).toFixed(1)

    setFatResult({ fatPct, fatMass, leanMass, category, waterLiters })
  }

  const delta = (cur, prev) => {
    if (cur === null) return <span style={{ color: '#444' }}>—</span>
    if (!prev) return <span>{cur}</span>
    const d = +(cur - prev).toFixed(1)
    const dir = d > 0 ? 'up' : d < 0 ? 'down' : 'same'
    return <span>{cur} <span className={`delta delta-${dir}`} style={{ fontSize: 10, padding: '1px 5px' }}>{d > 0 ? '↑' : d < 0 ? '↓' : '='}{d !== 0 ? (d > 0 ? '+' : '') + d : ''}</span></span>
  }

  const sorted = [...body].reverse()
  const catColor = { 'Zorunlu yağ': '#47c8ff', 'Atletik': '#47ff8a', 'Fit': '#e8ff47', 'Ortalama': '#ff8c47', 'Yüksek': '#ff4747' }

  return (
    <div className="page">
      <div className="section-title">YENİ ÖLÇÜM EKLE</div>
      <div className="card animate-fade" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, alignItems: 'flex-end' }}>
          {[
            { key: 'date',   label: 'Tarih',       type: 'date' },
            { key: 'weight', label: 'Kilo (kg)',    type: 'number', ph: '75',  step: '0.1' },
            { key: 'waist',  label: 'Bel (cm)',     type: 'number', ph: '80',  step: '0.5' },
            { key: 'chest',  label: 'Göğüs (cm)',   type: 'number', ph: '100', step: '0.5' },
            { key: 'hip',    label: 'Kalça (cm)',   type: 'number', ph: '95',  step: '0.5' },
            { key: 'neck',   label: 'Boyun (cm)',   type: 'number', ph: '38',  step: '0.5' },
          ].map(({ key, label, type, ph, step }) => (
            <div key={key} className="form-group">
              <span className="flabel">{label}</span>
              <input type={type} value={form[key]} placeholder={ph} step={step}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ marginTop: 14, width: '100%' }} onClick={addEntry}>Ölçüm Ekle</button>
      </div>

      {/* ── Yağ Oranı & Su Gereksinimi ── */}
      <div className="section-title">YAĞ ORANI & SU GEREKSİNİMİ HESAPLA</div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace', marginBottom: 16, lineHeight: 1.6 }}>
          US Navy metoduyla vücut yağ oranını hesapla. Boyun ölçüsü için boyun çevreni, bel için göbek hizasındaki çevreyi gir.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 12 }}>
          <div className="form-group">
            <span className="flabel">Cinsiyet</span>
            <select value={fatForm.gender} onChange={e => setFatForm(p => ({ ...p, gender: e.target.value }))}>
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
            </select>
          </div>
          <div className="form-group">
            <span className="flabel">Boy (cm)</span>
            <input type="number" value={fatForm.height} placeholder="175" onChange={e => setFatForm(p => ({ ...p, height: e.target.value }))} />
          </div>
          <div className="form-group">
            <span className="flabel">Kilo (kg)</span>
            <input type="number" value={fatForm.weight} placeholder="75" onChange={e => setFatForm(p => ({ ...p, weight: e.target.value }))} />
          </div>
          <div className="form-group">
            <span className="flabel">Bel (cm)</span>
            <input type="number" value={fatForm.waist} placeholder="80" onChange={e => setFatForm(p => ({ ...p, waist: e.target.value }))} />
          </div>
          <div className="form-group">
            <span className="flabel">Boyun (cm)</span>
            <input type="number" value={fatForm.neck} placeholder="38" onChange={e => setFatForm(p => ({ ...p, neck: e.target.value }))} />
          </div>
          {fatForm.gender === 'female' && (
            <div className="form-group">
              <span className="flabel">Kalça (cm)</span>
              <input type="number" value={fatForm.hip} placeholder="95" onChange={e => setFatForm(p => ({ ...p, hip: e.target.value }))} />
            </div>
          )}
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={calcBodyFat}>
          📊 Yağ Oranı Hesapla
        </button>

        {fatResult && (
          <div className="animate-fade" style={{ marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 10 }}>
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', border: `1px solid ${catColor[fatResult.category]}44` }}>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>YAĞ ORANI</div>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 36, color: catColor[fatResult.category] }}>
                  %{fatResult.fatPct}
                </div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: catColor[fatResult.category], marginTop: 2 }}>
                  {fatResult.category}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)', flex: 1 }}>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 2 }}>YAĞ KÜTLESİ</div>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 22, color: '#ff8c47' }}>{fatResult.fatMass} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>kg</span></div>
                </div>
                <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)', flex: 1 }}>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 2 }}>YAĞSİZ KÜTLE</div>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 22, color: '#47ff8a' }}>{fatResult.leanMass} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>kg</span></div>
                </div>
              </div>
            </div>

            {/* Su Gereksinimi */}
            <div style={{
              background: 'rgba(71,200,255,.06)', border: '1px solid rgba(71,200,255,.2)',
              borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <span style={{ fontSize: 32 }}>💧</span>
              <div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>GÜNLÜK SU GEREKSİNİMİ</div>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 32, color: '#47c8ff' }}>
                  {fatResult.waterLiters} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>LITRE</span>
                </div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  ≈ {Math.round(fatResult.waterLiters / 0.2)} bardak · Antrenman günleri +0.5L ekle
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {body.length > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, letterSpacing: 2, marginBottom: 16 }}>KİLO GRAFİĞİ</div>
          <div style={{ position: 'relative', height: 200 }}><canvas ref={chartRef} /></div>
        </div>
      )}

      <div className="section-title">ÖLÇÜM GEÇMİŞİ</div>
      {body.length === 0
        ? <div className="empty-state"><div className="empty-icon">⚖️</div><div className="empty-title">ÖLÇÜM YOK</div><div className="empty-sub">Yukarıdan ilk ölçümünü ekle.</div></div>
        : <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Tarih', 'Kilo', 'Bel', 'Göğüs', 'Kalça', 'Boyun', ''].map(h => (
                  <th key={h} style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '10px 14px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: 'var(--surface2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((d, i) => {
                const prev = sorted[i + 1]
                return (
                  <tr key={d.date}>
                    <td style={{ padding: '10px 14px', fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                      {new Date(d.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    {['weight', 'waist', 'chest', 'hip', 'neck'].map(k => (
                      <td key={k} style={{ padding: '10px 14px', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                        {delta(d[k], prev?.[k])} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{k === 'weight' ? 'kg' : 'cm'}</span>
                      </td>
                    ))}
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                      <button className="btn btn-danger" onClick={() => saveBody(body.filter(x => x.date !== d.date))}>✕</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      }
    </div>
  )
}
