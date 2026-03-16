import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const GEMINI_KEY = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'

function DeltaBadge({ cur, prev }) {
  if (prev === null || prev === undefined) return null
  const d = +cur - +prev
  const dir = d > 0 ? 'up' : d < 0 ? 'down' : 'same'
  const arrow = d > 0 ? '↑' : d < 0 ? '↓' : '='
  const sign = d > 0 ? '+' : ''
  return (
    <span className={`delta delta-${dir}`} style={{ fontSize:10, padding:'2px 5px' }}>
      {arrow}{d !== 0 ? sign + d : ''}
    </span>
  )
}

export default function TodayPage() {
  const {
    exercises, saveExercises, exArchive, saveArchive,
    viewingDate, setViewingDate, showToast, genId, todayKey,
  } = useApp()

  const isToday = viewingDate === todayKey()
  const viewExs = isToday ? exercises : (exArchive[viewingDate] || [])

  const prevDayExs = () => {
    const d = new Date(viewingDate + 'T00:00:00'); d.setDate(d.getDate() - 1)
    const key = d.toISOString().slice(0, 10)
    return key === todayKey() ? exercises : (exArchive[key] || [])
  }
  const findPrev = (name) => prevDayExs().find(e => e.name.toLowerCase() === name.toLowerCase())

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName]   = useState('')
  const [openCards, setOpenCards] = useState({})

  const totalSets = () => viewExs.reduce((s, e) => s + e.sets.length, 0)
  const maxWeight = () => {
    let m = 0; viewExs.forEach(ex => ex.sets.forEach(st => { if (+st.weight > m) m = +st.weight })); return m
  }

  const addExercise = () => {
    if (!newName.trim()) return showToast('Egzersiz adı girin!', 'error')
    const updated = [...exercises, { id: genId(), name: newName.trim(), sets: [], open: true }]
    saveExercises(updated)
    setNewName(''); setShowForm(false)
    showToast(`${newName} eklendi ✓`)
  }

  const removeExercise = (id) => {
    saveExercises(exercises.filter(e => e.id !== id))
    showToast('Egzersiz silindi')
  }

  const addSet = (exId, reps, weight) => {
    if (!reps && !weight) return showToast('Tekrar veya ağırlık girin!', 'error')
    const updated = exercises.map(e => e.id === exId
      ? { ...e, sets: [...e.sets, { reps: +reps || 0, weight: +weight || 0 }] } : e)
    saveExercises(updated)
  }

  const removeSet = (exId, sIdx) => {
    const updated = exercises.map(e => e.id === exId
      ? { ...e, sets: e.sets.filter((_, i) => i !== sIdx) } : e)
    saveExercises(updated)
  }

  const updateSet = (exId, sIdx, field, val) => {
    const updated = exercises.map(e => e.id === exId
      ? { ...e, sets: e.sets.map((s, i) => i === sIdx ? { ...s, [field]: parseFloat(val) || 0 } : s) } : e)
    saveExercises(updated)
  }

  const toggleCard = (id) => setOpenCards(p => ({ ...p, [id]: !p[id] }))

  return (
    <div className="page">
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
        {[
          { label:'Egzersiz', val: viewExs.length, unit:'adet' },
          { label:'Toplam Set', val: totalSets(), unit:'set' },
          { label:'Max Ağırlık', val: maxWeight(), unit:'kg' },
        ].map(({ label, val, unit }) => (
          <div key={label} className="card" style={{ padding:18, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
              background: val > 0 ? 'var(--accent)' : 'transparent',
              transform: val > 0 ? 'scaleX(1)' : 'scaleX(0)', transition:'transform .4s ease', transformOrigin:'left' }} />
            <div style={{ fontSize:10, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:7, fontFamily:'DM Mono,monospace' }}>{label}</div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:38, lineHeight:1 }}>
              {val} <span style={{ fontSize:14, color:'var(--text-muted)' }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Past banner */}
      {!isToday && (
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
          background:'rgba(71,200,255,.06)', border:'1px solid rgba(71,200,255,.2)',
          borderRadius:8, padding:'10px 14px', marginBottom:20,
          fontSize:12, color:'var(--blue)', fontFamily:'DM Mono,monospace',
        }}>
          <span>📅 {new Date(viewingDate+'T00:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'})} görüntüleniyor</span>
          <button className="btn btn-ghost" style={{ height:28, fontSize:11, padding:'0 10px' }} onClick={() => setViewingDate(todayKey())}>Bugüne Dön</button>
        </div>
      )}

      {/* Add button */}
      {isToday && (
        <>
          <button className="btn" onClick={() => setShowForm(v => !v)} style={{
            width:'100%', padding:12, background:'var(--surface)',
            border:'1px dashed var(--border)', color:'var(--text-muted)', marginBottom:showForm?0:24,
            justifyContent:'center', gap:8, transition:'all .2s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}>
            <span style={{ fontSize:17 }}>+</span> Egzersiz Ekle
          </button>

          {showForm && (
            <div className="card animate-fade" style={{ padding:20, marginBottom:24 }}>
              <div className="section-title">YENİ EGZERSİZ</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'flex-end' }}>
                <div className="form-group">
                  <span className="flabel">Egzersiz Adı</span>
                  <input type="text" value={newName} placeholder="örn. Bench Press, Squat..."
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && addExercise()} autoFocus />
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-primary" onClick={addExercise}>Ekle</button>
                  <button className="btn btn-ghost" onClick={() => setShowForm(false)}>İptal</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* List */}
      <div className="section-title">{isToday ? 'BUGÜNKÜ EGZERSİZLER' : viewingDate.split('-').reverse().join('.')}</div>

      {viewExs.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏋️</div>
          <div className="empty-title">HENÜZ EGZERSİZ YOK</div>
          <div className="empty-sub">{isToday ? 'Yukarıdan ilk egzersizini ekle.' : 'Bu günde egzersiz yapılmamış.'}</div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {viewExs.map((ex, ei) => {
          const isOpen = openCards[ex.id] !== false && (ex.open ?? true)
          const prevEx = findPrev(ex.name)
          const cMax = ex.sets.reduce((m,s)=>Math.max(m,+s.weight),0)
          const pMax = prevEx?.sets.reduce((m,s)=>Math.max(m,+s.weight),0) ?? null

          return (
            <ExerciseCard key={ex.id}
              ex={ex} isOpen={isOpen} prevEx={prevEx} cMax={cMax} pMax={pMax}
              readOnly={!isToday}
              onToggle={() => toggleCard(ex.id)}
              onRemove={() => removeExercise(ex.id)}
              onAddSet={(r,w) => addSet(ex.id, r, w)}
              onRemoveSet={si => removeSet(ex.id, si)}
              onUpdateSet={(si,f,v) => updateSet(ex.id, si, f, v)}
            />
          )
        })}
      </div>
    </div>
  )
}

function ExerciseCard({ ex, isOpen, prevEx, cMax, pMax, readOnly, onToggle, onRemove, onAddSet, onRemoveSet, onUpdateSet }) {
  const [addReps, setAddReps]     = useState('')
  const [addWeight, setAddWeight] = useState('')

  const dMax = pMax !== null ? cMax - pMax : null
  const dDir = dMax === null ? null : dMax > 0 ? 'up' : dMax < 0 ? 'down' : 'same'

  return (
    <div className="card animate-fade" style={{ overflow:'hidden' }}>
      {/* Header */}
      <div onClick={onToggle} style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'13px 16px', cursor:'pointer', userSelect:'none',
        borderBottom: isOpen ? '1px solid var(--border)' : '1px solid transparent',
        transition:'background .15s',
      }}
        onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
        onMouseLeave={e=>e.currentTarget.style.background=''}
      >
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:19, letterSpacing:1.5 }}>{ex.name}</span>
          {dMax !== null && (
            <span className={`delta delta-${dDir}`}>
              {dDir==='up'?'↑':dDir==='down'?'↓':'='} {dMax!==0?(dMax>0?'+':'')+dMax+' kg':'aynı'}
            </span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)',
            background:'var(--surface2)', padding:'3px 8px', borderRadius:20, border:'1px solid var(--border)' }}>
            {ex.sets.length} SET
          </span>
          {!readOnly && (
            <button className="btn btn-danger" onClick={e=>{e.stopPropagation();onRemove()}} style={{ fontSize:13, padding:'5px 9px' }}>✕</button>
          )}
          <span style={{ color:'var(--text-muted)', transition:'transform .2s', transform: isOpen?'rotate(180deg)':'', fontSize:15 }}>⌄</span>
        </div>
      </div>

      {/* Sets */}
      {isOpen && (
        <div style={{ padding:'12px 16px' }}>
          {ex.sets.length === 0 && (
            <div style={{ textAlign:'center', padding:16, color:'var(--text-muted)', fontSize:11,
              fontFamily:'DM Mono,monospace', border:'1px dashed var(--border)', borderRadius:8, marginBottom:10 }}>
              Henüz set eklenmedi
            </div>
          )}
          {ex.sets.length > 0 && (
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:10 }}>
              <thead>
                <tr>
                  {['#','Tekrar'+(prevEx?' / dün':''),'Ağırlık'+(prevEx?' / dün':''),''].map((h,i)=>(
                    <th key={i} style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:2,
                      color:'var(--text-muted)', textTransform:'uppercase', textAlign:'left',
                      padding:'6px 9px', borderBottom:'1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ex.sets.map((set, si) => {
                  const ps = prevEx?.sets[si]
                  return (
                    <tr key={si}>
                      <td style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, color:'var(--text-muted)', padding:'8px 9px', width:34 }}>{si+1}</td>
                      <td style={{ padding:'8px 9px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                          {readOnly
                            ? <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:19 }}>{set.reps}</span>
                            : <input type="number" defaultValue={set.reps} min="1"
                                onChange={e=>onUpdateSet(si,'reps',e.target.value)}
                                style={{ width:72, textAlign:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:19, padding:'3px 6px', background:'var(--surface3)', border:'1px solid transparent', borderRadius:6 }} />
                          }
                          <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>tekrar</span>
                          {ps && <div style={{ display:'inline-flex', alignItems:'center', gap:3,
                            background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:6, padding:'2px 6px' }}>
                            <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'#555', textDecoration:'line-through' }}>{ps.reps}</span>
                            <DeltaBadge cur={set.reps} prev={ps.reps} />
                          </div>}
                        </div>
                      </td>
                      <td style={{ padding:'8px 9px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                          {readOnly
                            ? <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:19 }}>{set.weight}</span>
                            : <input type="number" defaultValue={set.weight} min="0" step="0.5"
                                onChange={e=>onUpdateSet(si,'weight',e.target.value)}
                                style={{ width:72, textAlign:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:19, padding:'3px 6px', background:'var(--surface3)', border:'1px solid transparent', borderRadius:6 }} />
                          }
                          <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>kg</span>
                          {ps && <div style={{ display:'inline-flex', alignItems:'center', gap:3,
                            background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:6, padding:'2px 6px' }}>
                            <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'#555', textDecoration:'line-through' }}>{ps.weight}</span>
                            <DeltaBadge cur={set.weight} prev={ps.weight} />
                          </div>}
                        </div>
                      </td>
                      <td style={{ padding:'8px 9px' }}>
                        {!readOnly && <button className="btn btn-danger" onClick={()=>onRemoveSet(si)}>✕</button>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {!readOnly && (
            <div style={{ display:'flex', alignItems:'center', gap:9, flexWrap:'wrap', marginTop:4 }}>
              <input type="number" value={addReps} onChange={e=>setAddReps(e.target.value)} placeholder="tekrar" min="1"
                style={{ width:80, textAlign:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:17, padding:7 }} />
              <input type="number" value={addWeight} onChange={e=>setAddWeight(e.target.value)} placeholder="kg" min="0" step="0.5"
                style={{ width:80, textAlign:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:17, padding:7 }} />
              <button className="btn btn-ghost" style={{ height:35, fontSize:12 }}
                onClick={() => { onAddSet(addReps, addWeight); setAddReps(''); setAddWeight('') }}>
                + Set Ekle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
