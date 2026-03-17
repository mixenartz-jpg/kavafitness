import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext'

const GKEY = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3-flash-preview']

// ── Egzersiz Tanıma Yardımcıları ──
const YT_DB = {
  'bench press':['dbl8xMcCHAY','SCVCLChPQEY','gRVjAtPip0Y'],
  'squat':['1oed_0gr9o4','nEQQle9-0NA','UXJrBgI2RxA'],
  'deadlift':['op9kVnSso6Q','XxWcirHIwVo','AweC3UaM14o'],
  'pull up':['eGo4IYlbE5g','XB_7En-zf_M','poFFHH-Q_Fg'],
  'push up':['IODxDxX7oi4','bt-BKKMohZU','6-I9RZVLdkg'],
  'overhead press':['2yjwXTZQDDI','F3QY5vMz_6I','CnBmiBqp-AI'],
  'barbell row':['FWJR5Ve8bnQ','kBWAon7ItDw','G8l_8chR5BE'],
  'bicep curl':['ykJmrZ5v0Oo','sAq_ocpRh_I','av7-8igSXTs'],
  'tricep':['6SS6K3lAwZ8','kiuVA0gs3EI','md87jWmIJaI'],
  'leg press':['IZxyjW7MPJQ','GvRgijoJ2xY','0Jcr6LSN1Zo'],
  'plank':['ASdvN_XEl_c','pSHjTRCQxIw','B296mZDhrP4'],
  'hip thrust':['SEdqd9BaNx4','xsasi-oZHFg','LM8XfLyFq_A'],
  'lat pulldown':['CAwf7n6Tuhs','JnRqz3oB1Qs','kBWAon7ItDw'],
}
const getVideoIds = (name) => {
  const lower = name.toLowerCase()
  for (const [k,v] of Object.entries(YT_DB)) if (lower.includes(k)||k.includes(lower)) return v
  return null
}
const trEx = (name) => {
  const map = {'bench press':'Bench Press','squat':'Squat','deadlift':'Deadlift','pull up':'Pull-Up','push up':'Sinav','overhead press':'Omuz Press','shoulder press':'Omuz Press','barbell row':'Barbell Kurek','bicep curl':'Bicep Curl','tricep extension':'Tricep Extension','leg press':'Leg Press','lunge':'Lunge','plank':'Plank','lat pulldown':'Lat Pulldown','hip thrust':'Hip Thrust','dip':'Dip'}
  const lower = name.toLowerCase()
  for (const [k,v] of Object.entries(map)) if (lower.includes(k)) return v
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function DeltaBadge({ cur, prev }) {
  if (prev === null || prev === undefined) return null
  const d = +cur - +prev
  const dir = d > 0 ? 'up' : d < 0 ? 'down' : 'same'
  return (
    <span className={`delta delta-${dir}`} style={{ fontSize:10, padding:'2px 5px' }}>
      {d > 0 ? '↑' : d < 0 ? '↓' : '='}{d !== 0 ? (d > 0 ? '+' : '') + d : ''}
    </span>
  )
}

export default function TodayPage() {
  const {
    exercises, saveExercises, exArchive,
    viewingDate, setViewingDate, showToast, genId, todayKey,
    templates, saveWorkoutNote, getWorkoutNote,
  } = useApp()

  const isToday = viewingDate === todayKey()
  const viewExs = isToday ? exercises : (exArchive[viewingDate] || [])

  const prevDayExs = () => {
    const d = new Date(viewingDate + 'T00:00:00'); d.setDate(d.getDate() - 1)
    const key = d.toISOString().slice(0, 10)
    return key === todayKey() ? exercises : (exArchive[key] || [])
  }
  const findPrev = (name) => prevDayExs().find(e => e.name.toLowerCase() === name.toLowerCase())

  const [showForm, setShowForm]       = useState(false)
  const [newName, setNewName]         = useState('')
  const [openCards, setOpenCards]     = useState({})
  const [showNote, setShowNote]       = useState(false)
  const [note, setNote]               = useState(() => getWorkoutNote ? getWorkoutNote() : '')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showRecognize, setShowRecognize] = useState(false)

  const totalSets = () => viewExs.reduce((s, e) => s + e.sets.length, 0)
  const maxWeight = () => { let m = 0; viewExs.forEach(ex => ex.sets.forEach(st => { if (+st.weight > m) m = +st.weight })); return m }

  const addExercise = () => {
    if (!newName.trim()) return showToast('Egzersiz adi girin!', 'error')
    const updated = [...exercises, { id: genId(), name: newName.trim(), sets: [], open: true }]
    saveExercises(updated)
    setNewName(''); setShowForm(false)
    showToast(`${newName} eklendi`)
  }

  const removeExercise = (id) => { saveExercises(exercises.filter(e => e.id !== id)); showToast('Egzersiz silindi') }

  const addSet = (exId, reps, weight) => {
    if (!reps && !weight) return showToast('Tekrar veya agirlik girin!', 'error')
    saveExercises(exercises.map(e => e.id === exId ? { ...e, sets: [...e.sets, { reps: +reps||0, weight: +weight||0 }] } : e))
  }
  const removeSet = (exId, sIdx) => saveExercises(exercises.map(e => e.id === exId ? { ...e, sets: e.sets.filter((_,i)=>i!==sIdx) } : e))
  const updateSet = (exId, sIdx, field, val) => saveExercises(exercises.map(e => e.id === exId ? { ...e, sets: e.sets.map((s,i)=>i===sIdx?{...s,[field]:parseFloat(val)||0}:s) } : e))
  const toggleCard = (id) => setOpenCards(p => ({ ...p, [id]: !p[id] }))

  const applyTemplate = (tpl) => {
    const newExs = tpl.exercises.map(name => ({ id: genId(), name, sets: [], open: true }))
    saveExercises([...exercises, ...newExs])
    setShowTemplates(false)
    showToast(`${tpl.name} sablonu uygulandi`)
  }

  const saveNote = () => {
    if (saveWorkoutNote) saveWorkoutNote(note)
    setShowNote(false)
    showToast('Not kaydedildi')
  }

  return (
    <div className="page">
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Egzersiz', val: viewExs.length, unit:'adet' },
          { label:'Toplam Set', val: totalSets(), unit:'set' },
          { label:'Max Agirlik', val: maxWeight(), unit:'kg' },
        ].map(({ label, val, unit }) => (
          <div key={label} className="card" style={{ padding:18, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: val>0?'var(--accent)':'transparent', transform:val>0?'scaleX(1)':'scaleX(0)', transition:'transform .4s ease', transformOrigin:'left' }} />
            <div style={{ fontSize:10, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:7, fontFamily:'DM Mono,monospace' }}>{label}</div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:38, lineHeight:1 }}>
              {val} <span style={{ fontSize:14, color:'var(--text-muted)' }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Past banner */}
      {!isToday && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, background:'rgba(71,200,255,.06)', border:'1px solid rgba(71,200,255,.2)', borderRadius:8, padding:'10px 14px', marginBottom:20, fontSize:12, color:'var(--blue)', fontFamily:'DM Mono,monospace' }}>
          <span>📅 {new Date(viewingDate+'T00:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'})} goruntuleniyor</span>
          <button className="btn btn-ghost" style={{ height:28, fontSize:11, padding:'0 10px' }} onClick={() => setViewingDate(todayKey())}>Bugune Don</button>
        </div>
      )}

      {/* Action buttons */}
      {isToday && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
          <button className="btn" onClick={() => setShowForm(v=>!v)} style={{ padding:10, background:'var(--surface)', border:'1px dashed var(--border)', color:'var(--text-muted)', justifyContent:'center', fontSize:12, transition:'all .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}>
            + Egzersiz Ekle
          </button>
          <button className="btn" onClick={() => setShowTemplates(true)} style={{ padding:10, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-muted)', justifyContent:'center', fontSize:12, transition:'all .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}>
            📋 Sablon Uygula
          </button>
          <button className="btn" onClick={() => setShowNote(v=>!v)} style={{ padding:10, background: note ? 'rgba(232,255,71,.06)' : 'var(--surface)', border:`1px solid ${note?'rgba(232,255,71,.2)':'var(--border)'}`, color: note?'var(--accent)':'var(--text-muted)', justifyContent:'center', fontSize:12, transition:'all .2s' }}>
            📝 {note ? 'Notu Goster' : 'Not Ekle'}
          </button>
        </div>
      )}

      {/* Egzersiz Tanıma butonu */}
      {isToday && (
        <button className="btn" onClick={() => setShowRecognize(v=>!v)} style={{ width:'100%', padding:10, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-muted)', justifyContent:'center', fontSize:12, marginBottom:16, transition:'all .2s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--blue)';e.currentTarget.style.color='var(--blue)'}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}>
          📸 Egzersiz Tani — Fotograf yukle, AI hareketi tanisın
        </button>
      )}

      {/* Antrenman Notu */}
      {showNote && isToday && (
        <div className="card animate-fade" style={{ padding:18, marginBottom:16 }}>
          <div className="section-title">ANTRENMAN NOTU</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)}
            placeholder="Bugünkü antrenman nasil gecti? Notlarini buraya yaz..."
            style={{ width:'100%', minHeight:90, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:13, padding:12, resize:'vertical', fontFamily:'DM Sans,sans-serif', outline:'none' }} />
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <button className="btn btn-primary" onClick={saveNote}>Kaydet</button>
            <button className="btn btn-ghost" onClick={()=>setShowNote(false)}>Kapat</button>
          </div>
        </div>
      )}

      {/* Mevcut not göster */}
      {!showNote && note && isToday && (
        <div onClick={() => setShowNote(true)} style={{ background:'rgba(232,255,71,.04)', border:'1px solid rgba(232,255,71,.15)', borderRadius:10, padding:'10px 14px', marginBottom:16, cursor:'pointer', transition:'all .2s' }}
          onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(232,255,71,.3)'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(232,255,71,.15)'}>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:2, color:'var(--accent)', marginBottom:4 }}>ANTRENMAN NOTU</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>{note}</div>
        </div>
      )}

      {/* Egzersiz Tanıma Paneli */}
      {showRecognize && <RecognizePanel onClose={() => setShowRecognize(false)} onAddExercise={(name) => { saveExercises([...exercises, { id:genId(), name, sets:[], open:true }]); showToast(`${name} eklendi`) }} />}

      {/* Add form */}
      {showForm && (
        <div className="card animate-fade" style={{ padding:20, marginBottom:16 }}>
          <div className="section-title">YENİ EGZERSİZ</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'flex-end' }}>
            <div className="form-group">
              <span className="flabel">Egzersiz Adi</span>
              <input type="text" value={newName} placeholder="örn. Bench Press, Squat..."
                onChange={e=>setNewName(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addExercise()} autoFocus />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-primary" onClick={addExercise}>Ekle</button>
              <button className="btn btn-ghost" onClick={()=>setShowForm(false)}>Iptal</button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div className="section-title">{isToday ? 'BUGÜNKÜ EGZERSİZLER' : viewingDate.split('-').reverse().join('.')}</div>

      {viewExs.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏋️</div>
          <div className="empty-title">HENUZ EGZERSİZ YOK</div>
          <div className="empty-sub">{isToday ? 'Yukaridaki butonlardan egzersiz ekle veya sablon uygula.' : 'Bu gunde egzersiz yapilmamis.'}</div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {viewExs.map((ex) => {
          const isOpen = openCards[ex.id] !== false && (ex.open ?? true)
          const prevEx = findPrev(ex.name)
          const cMax = ex.sets.reduce((m,s)=>Math.max(m,+s.weight),0)
          const pMax = prevEx?.sets.reduce((m,s)=>Math.max(m,+s.weight),0) ?? null
          return (
            <ExerciseCard key={ex.id} ex={ex} isOpen={isOpen} prevEx={prevEx} cMax={cMax} pMax={pMax}
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

      {/* Template modal */}
      {showTemplates && (
        <div onClick={e=>e.target===e.currentTarget&&setShowTemplates(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', backdropFilter:'blur(6px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div className="modal-box animate-fade" style={{ maxWidth:440, maxHeight:'80vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:3 }}>SABLON UYGULA</div>
              <button onClick={()=>setShowTemplates(false)} style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text-muted)', width:30, height:30, borderRadius:8, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            {templates.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-muted)', fontFamily:'DM Mono,monospace', fontSize:12 }}>
                Henüz sablon yok.<br />Sablon Yoneticisi'nden olusturabilirsin.
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {templates.map(tpl => (
                  <div key={tpl.id} onClick={()=>applyTemplate(tpl)} className="card" style={{ padding:'14px 16px', cursor:'pointer', transition:'all .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, letterSpacing:1, marginBottom:4, color:'var(--accent)' }}>{tpl.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>{tpl.exercises.join(' · ')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Egzersiz Tanıma Paneli ──
function RecognizePanel({ onClose, onAddExercise }) {
  const [imgB64, setImgB64]     = useState(null)
  const [imgMime, setImgMime]   = useState(null)
  const [preview, setPreview]   = useState(null)
  const [status, setStatus]     = useState(null)
  const [ytData, setYtData]     = useState(null)
  const [selVid, setSelVid]     = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const d = ev.target.result
      setImgB64(d.split(',')[1]); setImgMime(file.type)
      setPreview(d); setStatus(null); setYtData(null)
    }
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!imgB64) return
    setAnalyzing(true); setYtData(null)
    const prompt = `Analyze this image. Does it show a person performing a gym/fitness exercise?
Respond ONLY with valid JSON:
{"is_exercise":true,"exercise_name":"bench press"}
OR: {"is_exercise":false,"exercise_name":""}
exercise_name in English lowercase, no markdown.`

    let res = null
    for (const model of MODELS) {
      setStatus({ type:'analyzing', title:'Analiz Ediliyor...', sub:`Model: ${model}` })
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GKEY}`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents:[{parts:[{text:prompt},{inline_data:{mime_type:imgMime,data:imgB64}}]}], generationConfig:{temperature:.1,maxOutputTokens:200} })
        })
        if (res.ok) break
        res = null
      } catch { res = null }
    }

    if (!res) { setStatus({ type:'error', title:'API Hatasi', sub:'Tekrar dene.' }); setAnalyzing(false); return }
    const data = await res.json()
    let raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text||'').trim().replace(/```json|```/g,'').trim()
    let parsed = null
    try { parsed = JSON.parse(raw) } catch { const m = raw.match(/\{[\s\S]*\}/); try { parsed = m ? JSON.parse(m[0]) : null } catch {} }

    if (!parsed?.is_exercise) {
      setStatus({ type:'error', title:'Egzersiz Bulunamadi', sub:'Fotoğrafta spor hareketi tespit edilemedi.' })
    } else {
      const exName = parsed.exercise_name.trim()
      const exTR = trEx(exName)
      setStatus({ type:'success', title:`${exTR} Tespit Edildi!`, sub:'Egzersizi antrenmanina ekleyebilirsin.' })
      const ids = getVideoIds(exName)
      setYtData({ ids, exName, exTR })
    }
    setAnalyzing(false)
  }

  return (
    <div className="card animate-fade" style={{ padding:20, marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, letterSpacing:2 }}>📸 EGZERSİZ TANIMA</div>
        <button onClick={onClose} style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text-muted)', width:28, height:28, borderRadius:7, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
      </div>

      <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])} />
      <div onClick={()=>fileRef.current.click()} style={{ border:'2px dashed var(--border)', borderRadius:12, padding: preview?0:'28px 16px', textAlign:'center', cursor:'pointer', background:'var(--surface2)', marginBottom:12, overflow:'hidden', transition:'all .2s' }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
        {preview
          ? <img src={preview} alt="" style={{ width:'100%', maxHeight:200, objectFit:'cover', display:'block', borderRadius:10 }} />
          : <>
              <div style={{ fontSize:32, marginBottom:8, opacity:.5 }}>📷</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)' }}>Tıkla ve fotograf yukle</div>
            </>
        }
      </div>

      <button className="btn btn-primary" onClick={analyze} disabled={!imgB64||analyzing} style={{ width:'100%', opacity:(!imgB64||analyzing)?.4:1, marginBottom:12 }}>
        {analyzing && <span className="spinner" style={{ width:14, height:14, borderTopColor:'#0a0a0a', marginRight:8 }} />}
        Egzersizi Tani
      </button>

      {status && (
        <div style={{ background:'var(--surface2)', border:`1px solid ${status.type==='success'?'rgba(71,255,138,.25)':status.type==='error'?'rgba(255,71,71,.25)':'rgba(71,200,255,.25)'}`, borderRadius:10, padding:'12px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
          {status.type==='analyzing' && <span className="spinner" />}
          {status.type==='success' && <span>✅</span>}
          {status.type==='error' && <span>❌</span>}
          <div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:1 }}>{status.title}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>{status.sub}</div>
          </div>
          {status.type==='success' && ytData && (
            <button className="btn btn-primary" onClick={()=>onAddExercise(ytData.exTR)} style={{ marginLeft:'auto', padding:'6px 14px', fontSize:11 }}>
              + Ekle
            </button>
          )}
        </div>
      )}

      {ytData?.ids && (
        <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid var(--border)' }}>
          <div style={{ position:'relative', paddingBottom:'56.25%', height:0 }}>
            <iframe src={`https://www.youtube.com/embed/${ytData.ids[selVid]}?rel=0`} style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }} allowFullScreen />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, padding:'10px 12px', background:'var(--surface2)' }}>
            {ytData.ids.map((id,i) => (
              <div key={id} onClick={()=>setSelVid(i)} style={{ borderRadius:6, overflow:'hidden', cursor:'pointer', border:`1px solid ${i===selVid?'var(--accent)':'var(--border)'}` }}>
                <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Exercise Card ──
function ExerciseCard({ ex, isOpen, prevEx, cMax, pMax, readOnly, onToggle, onRemove, onAddSet, onRemoveSet, onUpdateSet }) {
  const [addReps, setAddReps]     = useState('')
  const [addWeight, setAddWeight] = useState('')
  const [showAI, setShowAI]       = useState(false)
  const [aiAlts, setAiAlts]       = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const dMax = pMax !== null ? cMax - pMax : null
  const dDir = dMax === null ? null : dMax > 0 ? 'up' : dMax < 0 ? 'down' : 'same'

  const getAIAlternatives = async () => {
    setShowAI(true)
    if (aiAlts) return
    setAiLoading(true)
    const prompt = `Bir fitness koçusun. "${ex.name}" egzersizi için:
1. Bu egzersizi daha etkili yapmanın 2 ipucu (kisa)
2. 3 alternatif egzersiz (benzer kas grubu)
3. En iyi kombinasyon: Bu egzersizle birlikte hangi 2 egzersiz yapilmali?

Türkçe yanıt ver. JSON formatında:
{"tips":["ipucu1","ipucu2"],"alternatives":["alt1","alt2","alt3"],"combo":["egzersiz1","egzersiz2"]}`

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GKEY}`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:.7,maxOutputTokens:400} })
      })
      const data = await res.json()
      let raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text||'').trim().replace(/```json|```/g,'').trim()
      let parsed = null
      try { parsed = JSON.parse(raw) } catch { const m = raw.match(/\{[\s\S]*\}/); try { parsed = m?JSON.parse(m[0]):null } catch {} }
      setAiAlts(parsed)
    } catch { setAiAlts(null) }
    setAiLoading(false)
  }

  return (
    <div className="card animate-fade" style={{ overflow:'hidden' }}>
      <div onClick={onToggle} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', cursor:'pointer', userSelect:'none', borderBottom: isOpen?'1px solid var(--border)':'1px solid transparent', transition:'background .15s' }}
        onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
        onMouseLeave={e=>e.currentTarget.style.background=''}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:19, letterSpacing:1.5 }}>{ex.name}</span>
          {dMax !== null && (
            <span className={`delta delta-${dDir}`}>
              {dDir==='up'?'↑':dDir==='down'?'↓':'='} {dMax!==0?(dMax>0?'+':'')+dMax+' kg':'ayni'}
            </span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)', background:'var(--surface2)', padding:'3px 8px', borderRadius:20, border:'1px solid var(--border)' }}>{ex.sets.length} SET</span>
          {!readOnly && (
            <>
              <button onClick={e=>{e.stopPropagation();getAIAlternatives()}} style={{ background:'rgba(232,255,71,.08)', border:'1px solid rgba(232,255,71,.2)', color:'var(--accent)', borderRadius:6, padding:'4px 8px', cursor:'pointer', fontSize:10, fontFamily:'DM Mono,monospace' }} title="AI Öneri">🤖</button>
              <button className="btn btn-danger" onClick={e=>{e.stopPropagation();onRemove()}} style={{ fontSize:13, padding:'5px 9px' }}>✕</button>
            </>
          )}
          <span style={{ color:'var(--text-muted)', transition:'transform .2s', transform:isOpen?'rotate(180deg)':'', fontSize:15 }}>⌄</span>
        </div>
      </div>

      {/* AI Öneriler */}
      {showAI && isOpen && (
        <div style={{ padding:'12px 16px', background:'rgba(232,255,71,.03)', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:12, letterSpacing:2, color:'var(--accent)' }}>🤖 AI ONERI</div>
            <button onClick={()=>setShowAI(false)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:12 }}>✕</button>
          </div>
          {aiLoading ? (
            <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', fontSize:11 }}>
              <span className="spinner" style={{ width:14, height:14 }} /> Yapay zeka düşünüyor...
            </div>
          ) : aiAlts ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {aiAlts.tips && (
                <div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:2, color:'var(--text-muted)', marginBottom:5 }}>IPUCLARI</div>
                  {aiAlts.tips.map((t,i) => <div key={i} style={{ fontSize:12, color:'var(--text-dim)', lineHeight:1.5, marginBottom:3 }}>• {t}</div>)}
                </div>
              )}
              {aiAlts.alternatives && (
                <div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:2, color:'var(--text-muted)', marginBottom:5 }}>ALTERNATİF EGZERSİZLER</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {aiAlts.alternatives.map((a,i) => <span key={i} style={{ fontFamily:'DM Mono,monospace', fontSize:10, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:20, padding:'3px 10px', color:'var(--text-muted)' }}>{a}</span>)}
                  </div>
                </div>
              )}
              {aiAlts.combo && (
                <div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:2, color:'var(--text-muted)', marginBottom:5 }}>EN IYI KOMBİNASYON</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {aiAlts.combo.map((c,i) => <span key={i} style={{ fontFamily:'DM Mono,monospace', fontSize:10, background:'rgba(232,255,71,.08)', border:'1px solid rgba(232,255,71,.2)', borderRadius:20, padding:'3px 10px', color:'var(--accent)' }}>{c}</span>)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>Öneri alinamamadi.</div>
          )}
        </div>
      )}

      {/* Sets */}
      {isOpen && (
        <div style={{ padding:'12px 16px' }}>
          {ex.sets.length === 0 && (
            <div style={{ textAlign:'center', padding:16, color:'var(--text-muted)', fontSize:11, fontFamily:'DM Mono,monospace', border:'1px dashed var(--border)', borderRadius:8, marginBottom:10 }}>
              Henüz set eklenmedi
            </div>
          )}
          {ex.sets.length > 0 && (
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:10 }}>
              <thead>
                <tr>
                  {['#','Tekrar'+(prevEx?' / dün':''),'Agirlik'+(prevEx?' / dün':''),''].map((h,i) => (
                    <th key={i} style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', textAlign:'left', padding:'6px 9px', borderBottom:'1px solid var(--border)' }}>{h}</th>
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
                          {readOnly ? <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:19 }}>{set.reps}</span>
                            : <input type="number" defaultValue={set.reps} min="1" onChange={e=>onUpdateSet(si,'reps',e.target.value)} style={{ width:72, textAlign:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:19, padding:'3px 6px', background:'var(--surface3)', border:'1px solid transparent', borderRadius:6 }} />}
                          <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>tekrar</span>
                          {ps && <div style={{ display:'inline-flex', alignItems:'center', gap:3, background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:6, padding:'2px 6px' }}>
                            <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'#555', textDecoration:'line-through' }}>{ps.reps}</span>
                            <DeltaBadge cur={set.reps} prev={ps.reps} />
                          </div>}
                        </div>
                      </td>
                      <td style={{ padding:'8px 9px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                          {readOnly ? <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:19 }}>{set.weight}</span>
                            : <input type="number" defaultValue={set.weight} min="0" step="0.5" onChange={e=>onUpdateSet(si,'weight',e.target.value)} style={{ width:72, textAlign:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:19, padding:'3px 6px', background:'var(--surface3)', border:'1px solid transparent', borderRadius:6 }} />}
                          <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>kg</span>
                          {ps && <div style={{ display:'inline-flex', alignItems:'center', gap:3, background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:6, padding:'2px 6px' }}>
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
              <input type="number" value={addReps} onChange={e=>setAddReps(e.target.value)} placeholder="tekrar" min="1" style={{ width:80, textAlign:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:17, padding:7 }} />
              <input type="number" value={addWeight} onChange={e=>setAddWeight(e.target.value)} placeholder="kg" min="0" step="0.5" style={{ width:80, textAlign:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:17, padding:7 }} />
              <button className="btn btn-ghost" style={{ height:35, fontSize:12 }} onClick={()=>{ onAddSet(addReps,addWeight); setAddReps(''); setAddWeight('') }}>+ Set Ekle</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
