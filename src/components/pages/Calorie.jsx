import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext'

const GEMINI_KEY  = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'
const FOOD_MODELS = ['gemini-3.1-flash-lite-preview','gemini-3-flash-preview','gemini-2.5-flash','gemini-2.5-flash-lite']

export default function CaloriePage() {
  const { foods, saveFoods, calArch, saveCalArchive, showToast, genId, todayKey } = useApp()

  // Photo state
  const [imgB64, setImgB64]   = useState(null)
  const [imgMime, setImgMime] = useState(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus]   = useState(null) // {type, title, sub}
  const [modelChips, setModelChips] = useState([])
  const [resultData, setResultData] = useState(null)
  const [analyzing, setAnalyzing]   = useState(false)
  const fileRef = useRef()

  // Manual form
  const [showManual, setShowManual] = useState(false)
  const [mf, setMf] = useState({ name:'', kcal:'', protein:'', fat:'', carb:'' })

  const totals = (arr) => arr.reduce((t, f) => ({
    kcal: t.kcal + (+f.kcal||0),
    protein: t.protein + (+f.protein||0),
    fat: t.fat + (+f.fat||0),
    carb: t.carb + (+f.carb||0),
  }), { kcal:0, protein:0, fat:0, carb:0 })

  const tot  = totals(foods)
  const yest = () => {
    const d = new Date(); d.setDate(d.getDate()-1)
    return totals(calArch[d.toISOString().slice(0,10)] || [])
  }
  const yTot = yest()

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const d = ev.target.result
      setImgB64(d.split(',')[1]); setImgMime(file.type)
      setPreview(d); setStatus(null); setResultData(null); setModelChips([])
    }
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!imgB64) return
    setAnalyzing(true); setResultData(null)
    const prompt = `Analyze this image STRICTLY. Does it show food, a meal, a drink, or an edible item?

IMPORTANT: If the image shows anything other than food/drink — such as a person exercising, objects, scenery, animals, or text — respond with is_food: false.

Respond with ONLY valid JSON:
{"is_food":true,"food_name":"Tavuk Göğsü","kcal":250,"protein":45,"fat":5,"carb":0}
OR if not food: {"is_food":false,"food_name":"","kcal":0,"protein":0,"fat":0,"carb":0}
Rules: food_name in Turkish, all numbers as integers, estimate for visible portion, no markdown.`

    let res = null, usedModel = null
    const chips = FOOD_MODELS.map(m => ({ model:m, state:'pending' }))
    setModelChips([...chips])

    for (const model of FOOD_MODELS) {
      setModelChips(c => c.map(ch => ch.model===model ? {...ch, state:'trying'} : ch))
      setStatus({ type:'analyzing', title:'Analiz Ediliyor', sub:`Model: ${model}` })
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            contents:[{parts:[{text:prompt},{inline_data:{mime_type:imgMime,data:imgB64}}]}],
            generationConfig:{temperature:.1,maxOutputTokens:256,thinkingConfig:{thinkingBudget:0}}
          })
        })
        if (res.ok) { usedModel = model; setModelChips(c => c.map(ch => ch.model===model?{...ch,state:'ok'}:ch)); break }
        res = null; setModelChips(c => c.map(ch => ch.model===model?{...ch,state:'fail'}:ch))
      } catch { res = null; setModelChips(c => c.map(ch => ch.model===model?{...ch,state:'fail'}:ch)) }
    }
    setModelChips(c => c.map(ch => ch.state==='pending'?{...ch,state:'fail'}:ch))

    if (!res) { setStatus({type:'error',title:'⚠️ API Hatası','sub':'Tüm modeller başarısız oldu.'}); setAnalyzing(false); return }

    const data = await res.json()
    let raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
    let parsed = null
    try { parsed = JSON.parse(raw) } catch { const m=raw.match(/\{[\s\S]*\}/); try{parsed=m?JSON.parse(m[0]):null}catch{} }

    if (!parsed?.is_food) {
      setStatus({
        type: 'error',
        title: '❌ Bu Bir Yemek Değil',
        sub: 'Yüklenen fotoğrafta yiyecek/içecek tespit edilemedi. Lütfen yemek fotoğrafı yükleyin.',
      })
    } else {
      setStatus({type:'success',title:`✅ ${parsed.food_name}`,sub:`Besin değerleri hesaplandı · ${usedModel}`})
      setResultData(parsed)
    }
    setAnalyzing(false)
  }

  const addFromResult = () => {
    if (!resultData) return
    saveFoods([...foods, { id: genId(), name:resultData.food_name, kcal:resultData.kcal, protein:resultData.protein, fat:resultData.fat, carb:resultData.carb }])
    setPreview(null); setImgB64(null); setStatus(null); setResultData(null); setModelChips([])
    showToast(`${resultData.food_name} eklendi ✓`)
  }

  const addManual = () => {
    if (!mf.name.trim()) return showToast('Yemek adı girin!','error')
    saveFoods([...foods, { id:genId(), name:mf.name, kcal:+mf.kcal||0, protein:+mf.protein||0, fat:+mf.fat||0, carb:+mf.carb||0 }])
    setMf({name:'',kcal:'',protein:'',fat:'',carb:''}); setShowManual(false)
    showToast(`${mf.name} eklendi ✓`)
  }

  const macros = [
    { key:'kcal', label:'KALORİ', unit:'kcal', color:'#e8ff47' },
    { key:'protein', label:'PROTEİN', unit:'g', color:'#47c8ff' },
    { key:'fat', label:'YAĞ', unit:'g', color:'#ff8c47' },
    { key:'carb', label:'KARBONHİDRAT', unit:'g', color:'#47ff8a' },
  ]

  const chipStyle = (state) => {
    const base = { fontFamily:'DM Mono,monospace', fontSize:10, padding:'3px 9px', borderRadius:20, border:'1px solid var(--border)' }
    if (state==='ok')      return {...base, color:'var(--green)', borderColor:'rgba(71,255,138,.3)', background:'rgba(71,255,138,.07)'}
    if (state==='fail')    return {...base, color:'var(--red)',   borderColor:'rgba(255,71,71,.2)', background:'rgba(255,71,71,.05)', textDecoration:'line-through'}
    if (state==='trying')  return {...base, color:'var(--blue)',  borderColor:'rgba(71,200,255,.3)', background:'rgba(71,200,255,.07)'}
    return {...base, color:'var(--text-muted)', background:'var(--surface2)'}
  }

  return (
    <div className="page">
      {/* Macro summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:24 }}>
        {macros.map(({ key, label, unit, color }) => {
          const cur = Math.round(tot[key]); const yv = yTot[key]
          const diff = Math.round(cur - yv)
          const dir  = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
          return (
            <div key={key} className="card" style={{ padding:16, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
                background: cur>0 ? color : 'transparent',
                transform: cur>0 ? 'scaleX(1)' : 'scaleX(0)', transition:'transform .4s', transformOrigin:'left' }} />
              <div style={{ fontSize:10, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:6, fontFamily:'DM Mono,monospace' }}>{label}</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:34, lineHeight:1 }}>
                {cur} <span style={{ fontSize:13, color:'var(--text-muted)' }}>{unit}</span>
              </div>
              {yv > 0 && (
                <div style={{ marginTop:4 }}>
                  <span className={`delta delta-${dir}`} style={{ fontSize:10, padding:'2px 7px' }}>
                    {dir==='up'?'↑':dir==='down'?'↓':'='} {diff!==0?(diff>0?'+':'')+diff+' '+unit:'aynı'} <span style={{opacity:.5}}>dünden</span>
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Photo upload */}
      <div className="section-title">FOTOĞRAFLA TANI</div>
      <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
      <div onClick={() => fileRef.current.click()} style={{
        border:'2px dashed var(--border)', borderRadius:14, padding: preview?0:'32px 24px',
        textAlign:'center', cursor:'pointer', transition:'all .2s',
        background:'var(--surface)', marginBottom:16, overflow:'hidden',
      }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='rgba(232,255,71,.02)'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--surface)'}}>
        {preview
          ? <img src={preview} alt="preview" style={{ width:'100%', maxHeight:220, objectFit:'cover', display:'block', borderRadius:12 }} onClick={e=>e.stopPropagation()} />
          : <>
              <div style={{ fontSize:36, marginBottom:10, opacity:.5 }}>🍽️</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, marginBottom:4 }}>YEMEĞİN FOTOĞRAFINI YÜKLE</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>Tıkla veya sürükle bırak · JPG / PNG / WEBP</div>
            </>
        }
      </div>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginBottom:16 }}>
        <button className="btn btn-primary" onClick={analyze} disabled={!imgB64 || analyzing}
          style={{ padding:'12px 30px', fontWeight:700, opacity:(!imgB64||analyzing)?.4:1, cursor:(!imgB64||analyzing)?'not-allowed':'pointer' }}>
          {analyzing && <span className="spinner" style={{ width:16, height:16, borderTopColor:'#0a0a0a', marginRight:8 }} />}
          🔍 Besin Değerlerini Hesapla
        </button>
        {modelChips.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center' }}>
            {modelChips.map(({ model, state }) => (
              <span key={model} style={chipStyle(state)}>{model}</span>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      {status && (
        <div className="animate-fade" style={{
          background:'var(--surface)', border:`1px solid ${status.type==='success'?'rgba(71,255,138,.25)':status.type==='error'?'rgba(255,71,71,.25)':'rgba(71,200,255,.25)'}`,
          borderRadius:12, padding:'16px 18px', marginBottom:18,
          display:'flex', alignItems:'center', gap:12,
        }}>
          {status.type==='analyzing' && <span className="spinner" />}
          {status.type==='success' && <span style={{ fontSize:20 }}>✅</span>}
          {status.type==='error'   && <span style={{ fontSize:20 }}>❌</span>}
          <div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:17, letterSpacing:1, marginBottom:2 }}>{status.title}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}
              dangerouslySetInnerHTML={{ __html: status.sub }} />
          </div>
        </div>
      )}

      {/* Result card */}
      {resultData && (
        <div className="animate-fade" style={{
          background:'var(--surface2)', border:'1px solid rgba(232,255,71,.2)',
          borderRadius:12, padding:'16px 18px', marginBottom:16,
        }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:1.5, marginBottom:10, color:'var(--accent)' }}>{resultData.food_name}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
            {[
              { val:resultData.kcal, lbl:'KCAL', col:'#e8ff47' },
              { val:`${resultData.protein}g`, lbl:'PROTEİN', col:'#47c8ff' },
              { val:`${resultData.fat}g`, lbl:'YAĞ', col:'#ff8c47' },
              { val:`${resultData.carb}g`, lbl:'KARB', col:'#47ff8a' },
            ].map(({ val, lbl, col }) => (
              <div key={lbl} style={{ background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, color:col }}>{val}</div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', letterSpacing:1, marginTop:2 }}>{lbl}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary" style={{ flex:1 }} onClick={addFromResult}>✓ Listeye Ekle</button>
            <button className="btn btn-ghost" onClick={() => setResultData(null)}>İptal</button>
          </div>
        </div>
      )}

      {/* Manual add */}
      <div className="section-title" style={{ marginTop:8 }}>MANUEL EKLE</div>
      <button className="btn" onClick={() => setShowManual(v=>!v)} style={{
        width:'100%', padding:12, background:'var(--surface)', border:'1px dashed var(--border)',
        color:'var(--text-muted)', marginBottom:showManual?0:16, justifyContent:'center', gap:8,
      }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}>
        <span style={{ fontSize:17 }}>+</span> Manuel Yemek Ekle
      </button>

      {showManual && (
        <div className="card animate-fade" style={{ padding:18, marginBottom:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr auto', gap:8, alignItems:'flex-end' }}>
            {[
              { key:'name', label:'Yemek Adı', type:'text', ph:'Tavuk Göğsü' },
              { key:'kcal', label:'Kalori', type:'number', ph:'250' },
              { key:'protein', label:'Protein (g)', type:'number', ph:'30' },
              { key:'fat', label:'Yağ (g)', type:'number', ph:'5' },
              { key:'carb', label:'Karb (g)', type:'number', ph:'0' },
            ].map(({ key, label, type, ph }) => (
              <div key={key} className="form-group">
                <span className="flabel">{label}</span>
                <input type={type} value={mf[key]} placeholder={ph} onChange={e => setMf(p=>({...p,[key]:e.target.value}))} />
              </div>
            ))}
            <div style={{ display:'flex', gap:6, alignItems:'flex-end' }}>
              <button className="btn btn-primary" style={{ height:41 }} onClick={addManual}>Ekle</button>
              <button className="btn btn-ghost"   style={{ height:41 }} onClick={() => setShowManual(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}

      {/* Food list */}
      <div className="section-title">BUGÜN YENİLENLER</div>
      {foods.length === 0
        ? <div className="empty-state"><div className="empty-icon">🍽️</div><div className="empty-title">HENÜZ YEMEĞİ YOK</div><div className="empty-sub">Fotoğraf çek veya manuel ekle.</div></div>
        : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {foods.map((f, fi) => (
              <div key={f.id} className="card" style={{ padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div>
                  <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:17, letterSpacing:1, marginBottom:4 }}>{f.name}</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {[{v:f.kcal,u:'kcal',c:'#e8ff47'},{v:`${f.protein}g`,u:'P',c:'#47c8ff'},{v:`${f.fat}g`,u:'Y',c:'#ff8c47'},{v:`${f.carb}g`,u:'K',c:'#47ff8a'}].map(({v,u,c})=>(
                      <span key={u} style={{ fontFamily:'DM Mono,monospace', fontSize:10, padding:'2px 7px', borderRadius:20, border:'1px solid rgba(255,255,255,.08)', color:c }}>
                        {u} {v}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="btn btn-danger" onClick={() => saveFoods(foods.filter((_,i)=>i!==fi))}>✕</button>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
