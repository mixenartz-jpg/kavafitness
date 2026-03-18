import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const GKEY = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'
const AI_MODELS = ['gemini-3.1-flash-lite-preview', 'gemini-2.5-flash', 'gemini-2.0-flash']

export default function TemplatesPage() {
  const { templates, saveTemplates, showToast, genId, profile } = useApp()
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState(null)
  const [name, setName]           = useState('')
  const [exercises, setExercises] = useState([''])

  // AI Plan state
  const [showAiPlan, setShowAiPlan]   = useState(false)
  const [aiGoal,     setAiGoal]       = useState(profile?.goal || 'maintain')
  const [aiDays,     setAiDays]       = useState(3)
  const [aiFocus,    setAiFocus]      = useState('')
  const [aiLoading,  setAiLoading]    = useState(false)
  const [aiResult,   setAiResult]     = useState(null)

  const openNew = () => {
    setEditId(null); setName(''); setExercises(['']); setShowForm(true)
  }

  // ── AI Plan Oluşturucu ──
  const generateAiPlan = async () => {
    setAiLoading(true); setAiResult(null)
    const goalMap = { lose:'Kilo vermek', gain:'Kilo almak', cut:'Yağ yakmak', maintain:'Fit kalmak' }
    const levelMap = { beginner:'Yeni Başlayan', intermediate:'Orta Seviye', advanced:'İleri Seviye' }
    const prompt = `Kişisel antrenörsün. ${aiDays} günlük haftalık antrenman programı oluştur.
Profil: ${profile ? `${profile.gender==='male'?'Erkek':'Kadın'}, ${profile.age||'?'} yaş, ${profile.weight||'?'}kg` : 'Belirtilmemiş'}
Seviye: ${levelMap[profile?.level]||'Orta'} | Hedef: ${goalMap[aiGoal]||'Fitness'}${aiFocus ? ` | Odak: ${aiFocus}` : ''}
Sadece JSON döndür:
{"program_adi":"...","haftalik_plan":[{"gun":"Pazartesi","odak":"Göğüs","egzersizler":[{"isim":"Bench Press","set":4,"tekrar":"8-10"}],"notlar":"..."}]}`

    let parsed = null
    for (const model of AI_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GKEY}`,
          { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:.6, maxOutputTokens:2000} }) }
        )
        if (!res.ok) continue
        const data = await res.json()
        let raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text||'').trim()
          .replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
        const s = raw.indexOf('{'); const e = raw.lastIndexOf('}')
        if (s !== -1 && e !== -1) raw = raw.slice(s, e+1)
        try { parsed = JSON.parse(raw) } catch { parsed = null }
        if (parsed?.haftalik_plan) break
        parsed = null
      } catch { continue }
    }
    if (!parsed) showToast('Plan oluşturulamadı, tekrar dene.', 'error')
    else setAiResult(parsed)
    setAiLoading(false)
  }

  const saveAiPlanAsTemplates = () => {
    if (!aiResult?.haftalik_plan) return
    const newTpls = aiResult.haftalik_plan
      .filter(g => g.egzersizler?.length > 0)
      .map(g => ({
        id: genId(),
        name: `${aiResult.program_adi} — ${g.gun} (${g.odak})`,
        exercises: g.egzersizler.map(e => `${e.isim} ${e.set}×${e.tekrar}`)
      }))
    saveTemplates([...templates, ...newTpls])
    showToast(`${newTpls.length} şablon eklendi ✓`)
    setAiResult(null); setShowAiPlan(false)
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

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, letterSpacing:3, color:'var(--accent)' }}>ANTRENMAN ŞABLONLARI</div>
        <div style={{ display:'flex', gap:8 }}>
          <button
            className="btn btn-ghost"
            onClick={() => { setShowAiPlan(v=>!v); setAiResult(null) }}
            style={{ fontSize:12, borderColor: showAiPlan ? 'rgba(71,200,255,.4)' : 'var(--border)', color: showAiPlan ? 'var(--blue)' : 'var(--text-muted)' }}
          >
            🤖 AI Plan
          </button>
          <button className="btn btn-primary" onClick={openNew} style={{ fontSize:12 }}>+ Yeni Şablon</button>
        </div>
      </div>

      {/* ── AI Plan Oluşturucu ── */}
      {showAiPlan && (
        <div className="card animate-fade" style={{ padding:20, marginBottom:20, border:'1px solid rgba(71,200,255,.2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'rgba(71,200,255,.1)', border:'1px solid rgba(71,200,255,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🤖</div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:2, color:'var(--blue)' }}>AI ANTRENMAN PLANLAYICI</div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
            {/* Hedef */}
            <div className="form-group">
              <span className="flabel">Hedef</span>
              <select value={aiGoal} onChange={e => setAiGoal(e.target.value)}>
                <option value="lose">Kilo Ver</option>
                <option value="gain">Kilo Al</option>
                <option value="cut">Yağ Yak</option>
                <option value="maintain">Fit Kal</option>
              </select>
            </div>
            {/* Haftada kaç gün */}
            <div className="form-group">
              <span className="flabel">Haftada Kaç Gün?</span>
              <div style={{ display:'flex', gap:5 }}>
                {[2,3,4,5,6].map(d => (
                  <div key={d} onClick={() => setAiDays(d)} style={{
                    flex:1, padding:'8px 4px', borderRadius:8, cursor:'pointer', textAlign:'center',
                    background: aiDays===d ? 'rgba(71,200,255,.1)' : 'var(--surface2)',
                    border: `1px solid ${aiDays===d ? 'rgba(71,200,255,.4)' : 'var(--border)'}`,
                    fontFamily:'Bebas Neue,sans-serif', fontSize:16,
                    color: aiDays===d ? 'var(--blue)' : 'var(--text-muted)',
                  }}>{d}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom:14 }}>
            <span className="flabel">Özel Odak (opsiyonel)</span>
            <input type="text" value={aiFocus} onChange={e => setAiFocus(e.target.value)} placeholder="üst vücut, bacak, güç..." />
          </div>

          <button
            className="btn btn-primary"
            onClick={generateAiPlan}
            disabled={aiLoading}
            style={{ width:'100%', padding:12, background:'rgba(71,200,255,.9)', opacity: aiLoading ? .6 : 1 }}
          >
            {aiLoading
              ? <><span className="spinner" style={{width:14,height:14,borderTopColor:'#0a0a0a',marginRight:8}}/>Plan oluşturuluyor...</>
              : '🤖 Haftalık Plan Oluştur'
            }
          </button>

          {/* Sonuç */}
          {aiResult && (
            <div className="animate-fade" style={{ marginTop:16 }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, color:'var(--blue)', marginBottom:12 }}>
                {aiResult.program_adi}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
                {aiResult.haftalik_plan?.map((gun, i) => (
                  <div key={i} className="card" style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: gun.egzersizler?.length ? 8 : 0 }}>
                      <div>
                        <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:1.5, color: gun.egzersizler?.length ? 'var(--accent)' : 'var(--text-muted)' }}>{gun.gun}</span>
                        <span style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', marginLeft:8 }}>{gun.odak}</span>
                      </div>
                    </div>
                    {gun.egzersizler?.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {gun.egzersizler.map((ex, j) => (
                          <span key={j} style={{ fontFamily:'Space Mono,monospace', fontSize:9, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:20, padding:'2px 8px', color:'var(--text-muted)' }}>
                            {ex.isim} {ex.set}×{ex.tekrar}
                          </span>
                        ))}
                      </div>
                    )}
                    {!gun.egzersizler?.length && <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)' }}>😴 Dinlenme</span>}
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-primary" onClick={saveAiPlanAsTemplates} style={{ flex:2, justifyContent:'center' }}>
                  📋 Şablonlara Kaydet
                </button>
                <button className="btn btn-ghost" onClick={() => { setAiResult(null) }} style={{ flex:1, justifyContent:'center' }}>
                  ↺ Yenile
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
