import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function TemplatesPage() {
  const { templates, saveTemplates, showToast, genId } = useApp()
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState(null)
  const [name, setName]           = useState('')
  const [exercises, setExercises] = useState([''])

  const openNew = () => {
    setEditId(null); setName(''); setExercises(['']); setShowForm(true)
  }

  const openEdit = (tpl) => {
    setEditId(tpl.id); setName(tpl.name); setExercises([...tpl.exercises]); setShowForm(true)
  }

  const save = () => {
    if (!name.trim()) return showToast('Sablon adi girin!', 'error')
    const exs = exercises.filter(e => e.trim())
    if (exs.length === 0) return showToast('En az bir egzersiz girin!', 'error')

    if (editId) {
      saveTemplates(templates.map(t => t.id === editId ? { ...t, name: name.trim(), exercises: exs } : t))
      showToast('Sablon guncellendi')
    } else {
      saveTemplates([...templates, { id: genId(), name: name.trim(), exercises: exs }])
      showToast('Sablon olusturuldu')
    }
    setShowForm(false)
  }

  const remove = (id) => {
    saveTemplates(templates.filter(t => t.id !== id))
    showToast('Sablon silindi')
  }

  const addExField  = () => setExercises(p => [...p, ''])
  const removeExField = (i) => setExercises(p => p.filter((_,idx)=>idx!==i))
  const updateEx    = (i, val) => setExercises(p => p.map((e,idx)=>idx===i?val:e))

  const PRESET_TEMPLATES = [
    { name: 'Gögüs Günü', exercises: ['Bench Press', 'İncline Bench Press', 'Dumbbell Fly', 'Dip', 'Cable Crossover'] },
    { name: 'Sirt Günü', exercises: ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Seated Cable Row', 'Pull-Up'] },
    { name: 'Bacak Günü', exercises: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl', 'Calf Raise'] },
    { name: 'Omuz Günü', exercises: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pull', 'Shrug'] },
    { name: 'Kol Günü', exercises: ['Bicep Curl', 'Hammer Curl', 'Tricep Extension', 'Dip', 'Skull Crusher'] },
    { name: 'Full Body', exercises: ['Squat', 'Bench Press', 'Deadlift', 'Pull-Up', 'Overhead Press'] },
  ]

  const addPreset = (preset) => {
    if (templates.find(t => t.name === preset.name)) return showToast('Bu sablon zaten var!', 'error')
    saveTemplates([...templates, { id: genId(), ...preset }])
    showToast(`${preset.name} eklendi`)
  }

  return (
    <div className="page animate-fade" style={{ maxWidth: 700 }}>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, letterSpacing:3, color:'var(--accent)' }}>ANTRENMAN SABLONLARI</div>
        <button className="btn btn-primary" onClick={openNew} style={{ fontSize:12 }}>+ Yeni Sablon</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card animate-fade" style={{ padding:22, marginBottom:24 }}>
          <div className="section-title">{editId ? 'SABLONU DUZENLE' : 'YENI SABLON'}</div>
          <div className="form-group" style={{ marginBottom:16 }}>
            <span className="flabel">Sablon Adi</span>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="örn. Göğüs Günü, Full Body..." autoFocus />
          </div>

          <div className="form-group" style={{ marginBottom:16 }}>
            <span className="flabel">Egzersizler</span>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {exercises.map((ex, i) => (
                <div key={i} style={{ display:'flex', gap:8 }}>
                  <input type="text" value={ex} onChange={e=>updateEx(i,e.target.value)}
                    placeholder={`Egzersiz ${i+1}`}
                    onKeyDown={e => e.key==='Enter' && addExField()}
                    style={{ flex:1 }} />
                  {exercises.length > 1 && (
                    <button className="btn btn-danger" onClick={()=>removeExField(i)} style={{ padding:'6px 10px' }}>✕</button>
                  )}
                </div>
              ))}
              <button className="btn btn-ghost" onClick={addExField} style={{ alignSelf:'flex-start', fontSize:12 }}>+ Egzersiz Ekle</button>
            </div>
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary" onClick={save}>Kaydet</button>
            <button className="btn btn-ghost" onClick={()=>setShowForm(false)}>İptal</button>
          </div>
        </div>
      )}

      {/* Kullanıcı şablonları */}
      {templates.length > 0 && (
        <>
          <div className="section-title">SABLONLARIM</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
            {templates.map(tpl => (
              <div key={tpl.id} className="card" style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:17, letterSpacing:2, color:'var(--accent)', marginBottom:8 }}>{tpl.name}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {tpl.exercises.map((ex, i) => (
                        <span key={i} style={{ fontFamily:'Space Mono,monospace', fontSize:10, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:20, padding:'3px 10px', color:'var(--text-muted)' }}>
                          {ex}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', marginTop:8 }}>
                      {tpl.exercises.length} egzersiz
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button className="btn btn-ghost" onClick={()=>openEdit(tpl)} style={{ fontSize:11, padding:'6px 12px' }}>Duzenle</button>
                    <button className="btn btn-danger" onClick={()=>remove(tpl.id)} style={{ fontSize:12, padding:'6px 10px' }}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {templates.length === 0 && !showForm && (
        <div className="empty-state" style={{ marginBottom:32 }}>
          <div className="empty-icon">📋</div>
          <div className="empty-title">SABLON YOK</div>
          <div className="empty-sub">Yukarıdan yeni sablon oluştur veya hazır şablonlardan ekle.</div>
        </div>
      )}

      {/* Hazır şablonlar */}
      <div className="section-title">HAZIR SABLONLAR</div>
      <p style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Space Mono,monospace', marginBottom:14, lineHeight:1.6 }}>
        Hazır şablonları tek tıkla ekle, sonra düzenleyebilirsin.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
        {PRESET_TEMPLATES.map(preset => {
          const exists = templates.some(t => t.name === preset.name)
          return (
            <div key={preset.name} className="card" style={{ padding:'14px 16px', opacity: exists?.6:1 }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:1, marginBottom:6, color: exists?'var(--text-muted)':'var(--text)' }}>{preset.name}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'Space Mono,monospace', marginBottom:10, lineHeight:1.6 }}>
                {preset.exercises.slice(0,3).join(' · ')}{preset.exercises.length > 3 ? ` +${preset.exercises.length-3}` : ''}
              </div>
              <button className="btn btn-ghost" onClick={()=>addPreset(preset)} disabled={exists} style={{ fontSize:11, padding:'5px 12px', width:'100%', justifyContent:'center', opacity:exists?.5:1, cursor:exists?'not-allowed':'pointer' }}>
                {exists ? '✓ Eklendi' : '+ Ekle'}
              </button>
            </div>
          )
        })}
      </div>

    </div>
  )
}
