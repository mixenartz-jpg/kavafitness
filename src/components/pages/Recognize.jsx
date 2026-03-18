import { useState, useRef } from 'react'

const GKEY   = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]

const YT_DB = {
  'bench press':['dbl8xMcCHAY','SCVCLChPQEY','gRVjAtPip0Y','1OGTxqpjHaQ'],
  'squat':['1oed_0gr9o4','nEQQle9-0NA','UXJrBgI2RxA','Dy28eq2PjcM'],
  'deadlift':['op9kVnSso6Q','XxWcirHIwVo','AweC3UaM14o','r4MzxtBKyNE'],
  'pull up':['eGo4IYlbE5g','XB_7En-zf_M','poFFHH-Q_Fg','6kALZikXxLc'],
  'push up':['IODxDxX7oi4','bt-BKKMohZU','6-I9RZVLdkg','mm6_WcoCVTA'],
  'overhead press':['2yjwXTZQDDI','F3QY5vMz_6I','CnBmiBqp-AI','ep9NMRk-wyk'],
  'shoulder press':['2yjwXTZQDDI','F3QY5vMz_6I','CnBmiBqp-AI','ep9NMRk-wyk'],
  'barbell row':['FWJR5Ve8bnQ','kBWAon7ItDw','G8l_8chR5BE','9efgcAjQe7E'],
  'bicep curl':['ykJmrZ5v0Oo','sAq_ocpRh_I','av7-8igSXTs','in1jBjQ88AI'],
  'tricep':['6SS6K3lAwZ8','kiuVA0gs3EI','md87jWmIJaI','nRiJVZDpdL0'],
  'dip':['2z8JmcrW-As','kiuVA0gs3EI','l-Hznuo3p5I','yN6Gp93QLNM'],
  'leg press':['IZxyjW7MPJQ','GvRgijoJ2xY','0Jcr6LSN1Zo','ytbAmikC9xc'],
  'lunge':['QOVaHwm-Q6U','D7KaRcUTQeE','wrwwXE_x-pQ','L8fvypPrzzs'],
  'plank':['ASdvN_XEl_c','pSHjTRCQxIw','B296mZDhrP4','pvIjsG5Svck'],
  'hip thrust':['SEdqd9BaNx4','xsasi-oZHFg','LM8XfLyFq_A','ky_FbFJAqnw'],
  'romanian deadlift':['hCDzSR6bW10','2SHsk9374wo','XxWcirHIwVo','7oj8RUG_FkE'],
  'lat pulldown':['CAwf7n6Tuhs','JnRqz3oB1Qs','kBWAon7ItDw','poFFHH-Q_Fg'],
  'incline bench':['gRVjAtPip0Y','SCVCLChPQEY','dbl8xMcCHAY','1OGTxqpjHaQ'],
}

function getVideoIds(name) {
  const lower = name.toLowerCase()
  for (const [k,v] of Object.entries(YT_DB)) if (lower.includes(k)||k.includes(lower)) return v
  return null
}

function trEx(name) {
  const map = {'bench press':'Bench Press','squat':'Squat','deadlift':'Deadlift','pull up':'Pull-Up','pull-up':'Pull-Up','push up':'Şınav','push-up':'Şınav','overhead press':'Omuz Press','shoulder press':'Omuz Press','barbell row':'Barbell Kürek','bicep curl':'Bicep Curl','biceps curl':'Bicep Curl','dumbbell curl':'Dumbbell Curl','tricep extension':'Tricep Extension','leg press':'Leg Press','lunge':'Lunge','plank':'Plank','lat pulldown':'Lat Pulldown','hip thrust':'Hip Thrust','burpee':'Burpee','dip':'Dip','incline bench press':'İncline Bench Press','romanian deadlift':'Romanian Deadlift'}
  const lower = name.toLowerCase()
  for (const [k,v] of Object.entries(map)) if (lower.includes(k)) return v
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export default function RecognizePage() {
  const [imgB64, setImgB64] = useState(null)
  const [imgMime, setImgMime] = useState(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus]   = useState(null)
  const [chips, setChips]     = useState([])
  const [ytData, setYtData]   = useState(null) // {ids, exName, exTR}
  const [selVid, setSelVid]   = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const d = ev.target.result
      setImgB64(d.split(',')[1]); setImgMime(file.type)
      setPreview(d); setStatus(null); setChips([]); setYtData(null)
    }
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!imgB64) return
    setAnalyzing(true); setYtData(null)

    const prompt = `Analyze this image STRICTLY. Does it show a person actively performing a gym or fitness exercise (weightlifting, bodyweight exercise, cardio machine, stretching, etc.)?

IMPORTANT: If the image shows anything other than a person doing a fitness exercise — such as food, objects, scenery, animals, text, or a person just standing/sitting — respond with is_exercise: false.

Respond with ONLY valid JSON:
{"is_exercise":true,"exercise_name":"bench press","youtube_query":"bench press tutorial form"}
OR: {"is_exercise":false,"exercise_name":"","youtube_query":""}
Rules: exercise_name in English lowercase, no markdown, no explanation.`

    let res = null, usedModel = null
    const initChips = MODELS.map(m=>({model:m,state:'pending'}))
    setChips([...initChips])

    for (const model of MODELS) {
      setChips(c=>c.map(ch=>ch.model===model?{...ch,state:'trying'}:ch))
      setStatus({type:'analyzing',title:'Analiz Ediliyor',sub:`Model: ${model}`})
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GKEY}`,{
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            contents:[{parts:[{text:prompt},{inline_data:{mime_type:imgMime,data:imgB64}}]}],
            generationConfig:{temperature:.1,maxOutputTokens:512}
          })
        })
        if(res.ok){usedModel=model;setChips(c=>c.map(ch=>ch.model===model?{...ch,state:'ok'}:ch));break}
        res=null;setChips(c=>c.map(ch=>ch.model===model?{...ch,state:'fail'}:ch))
      } catch { res=null;setChips(c=>c.map(ch=>ch.model===model?{...ch,state:'fail'}:ch)) }
    }
    setChips(c=>c.map(ch=>ch.state==='pending'?{...ch,state:'fail'}:ch))

    if (!res) { setStatus({type:'error',title:'⚠️ API Hatası',sub:'Tüm modeller başarısız.'}); setAnalyzing(false); return }

    const data = await res.json()
    let raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
    let parsed=null; try{parsed=JSON.parse(raw)}catch{const m=raw.match(/\{[\s\S]*\}/);try{parsed=m?JSON.parse(m[0]):null}catch{}}

    if (!parsed?.is_exercise) {
      setStatus({
        type: 'error',
        title: '❌ Bu Bir Egzersiz Değil',
        sub: 'Yüklenen fotoğrafta spor/fitness hareketi tespit edilemedi. Lütfen egzersiz yapan birinin fotoğrafını yükleyin.',
      })
    } else {
      const exName = parsed.exercise_name.trim()
      const exTR   = trEx(exName)
      setStatus({type:'success',title:`✅ ${exTR}`,sub:`"${exName}" tespit edildi · ${usedModel}`})
      const ids = getVideoIds(exName)
      if (ids) { setYtData({ ids, exName, exTR }); setSelVid(0) }
      else setYtData({ ids:null, exName, exTR, query:parsed.youtube_query||exName+' tutorial' })
    }
    setAnalyzing(false)
  }

  const chipStyle = (state) => {
    const base={fontFamily:'Space Mono,monospace',fontSize:10,padding:'3px 9px',borderRadius:20,border:'1px solid var(--border)'}
    if(state==='ok')     return{...base,color:'var(--green)',borderColor:'rgba(71,255,138,.3)',background:'rgba(71,255,138,.07)'}
    if(state==='fail')   return{...base,color:'var(--red)',borderColor:'rgba(255,71,71,.2)',background:'rgba(255,71,71,.05)',textDecoration:'line-through'}
    if(state==='trying') return{...base,color:'var(--blue)',borderColor:'rgba(71,200,255,.3)',background:'rgba(71,200,255,.07)'}
    return{...base,color:'var(--text-muted)',background:'var(--surface2)'}
  }

  return (
    <div className="page" style={{ maxWidth:700, margin:'0 auto' }}>
      <div className="section-title">EGZERSİZ TANIMA</div>
      <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:20, lineHeight:1.7, fontFamily:'Space Mono,monospace' }}>
        Egzersiz yapılan bir fotoğraf yükle → yapay zeka hareketi tanır → YouTube'dan nasıl yapıldığını gösterir.
      </p>

      <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])} />
      <div onClick={() => fileRef.current.click()} style={{
        border:'2px dashed var(--border)', borderRadius:14,
        padding: preview?0:'44px 24px', textAlign:'center', cursor:'pointer',
        transition:'all .2s', background:'var(--surface)', marginBottom:20, overflow:'hidden',
      }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='rgba(232,255,71,.02)'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--surface)'}}>
        {preview
          ? <img src={preview} alt="preview" style={{ width:'100%', maxHeight:280, objectFit:'cover', display:'block', borderRadius:12 }} onClick={e=>e.stopPropagation()} />
          : <>
              <div style={{ fontSize:48, marginBottom:14, opacity:.5 }}>📷</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:2, marginBottom:5 }}>FOTOĞRAF YÜKLE</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Space Mono,monospace' }}>Tıkla veya sürükle bırak · JPG / PNG / WEBP</div>
            </>
        }
      </div>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginBottom:20 }}>
        <button className="btn btn-primary" onClick={analyze} disabled={!imgB64||analyzing}
          style={{ padding:'12px 30px', fontWeight:700, opacity:(!imgB64||analyzing)?.4:1, cursor:(!imgB64||analyzing)?'not-allowed':'pointer', fontSize:14 }}>
          {analyzing && <span className="spinner" style={{ width:16, height:16, borderTopColor:'#0a0a0a', marginRight:8 }} />}
          🔍 Egzersizi Tanı
        </button>
        {chips.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center' }}>
            {chips.map(({ model, state }) => <span key={model} style={chipStyle(state)}>{model}</span>)}
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
          {status.type==='analyzing'&&<span className="spinner"/>}
          {status.type==='success'&&<span style={{fontSize:22}}>✅</span>}
          {status.type==='error'&&<span style={{fontSize:22}}>❌</span>}
          <div>
            <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:17,letterSpacing:1,marginBottom:2}}>{status.title}</div>
            <div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'Space Mono,monospace'}}>{status.sub}</div>
          </div>
        </div>
      )}

      {/* YouTube */}
      {ytData && (
        <div className="animate-fade">
          {ytData.ids ? (
            <div className="card" style={{ overflow:'hidden', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
                <span style={{ background:'#ff0000', color:'#fff', fontFamily:'Bebas Neue,sans-serif', fontSize:12, letterSpacing:1, padding:'3px 7px', borderRadius:4 }}>YT</span>
                <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:1, color:'var(--text-muted)' }}>{ytData.exTR.toUpperCase()} — NASIL YAPILIR?</span>
              </div>
              <div style={{ position:'relative', paddingBottom:'56.25%', height:0, background:'#000' }}>
                <iframe src={`https://www.youtube.com/embed/${ytData.ids[selVid]}?rel=0`}
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }} allowFullScreen />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, padding:'12px 16px' }}>
                {ytData.ids.map((id, i) => (
                  <div key={id} onClick={()=>setSelVid(i)} style={{
                    borderRadius:8, overflow:'hidden', cursor:'pointer',
                    border: `1px solid ${i===selVid?'var(--accent)':'var(--border)'}`,
                    background:'var(--surface2)', transition:'all .15s',
                  }}>
                    <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block' }} />
                    <div style={{ padding:'6px 8px', fontSize:10, color:'var(--text-muted)', fontFamily:'Space Mono,monospace' }}>Video {i+1}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding:24, textAlign:'center', marginBottom:14 }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🎬</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:2, marginBottom:6 }}>{ytData.exTR}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Space Mono,monospace', marginBottom:14 }}>YouTube'da bu egzersiz için videolar bul</div>
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent((ytData.query||ytData.exName)+' exercise tutorial')}`}
                target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize:12, textDecoration:'none' }}>
                YouTube'da Aç ↗
              </a>
            </div>
          )}
          <div style={{ textAlign:'center' }}>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ytData.exName+' exercise tutorial')}`}
              target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize:11, textDecoration:'none' }}>
              YouTube'da Daha Fazla Ara ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
