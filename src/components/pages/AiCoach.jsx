import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

const GKEY = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'

// ── Kişisel Koç Dipnotu ──
function CoachNote({ onClick }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:7,padding:'7px 11px',marginTop:10,background:'rgba(232,255,71,.04)',border:'1px solid rgba(232,255,71,.1)',borderRadius:7 }}>
      <span style={{fontSize:13}}>⭐</span>
      <span style={{fontFamily:'Space Mono,monospace',fontSize:10,color:'var(--text-muted)'}}>
        Daha detaylı için{' '}
        <button onClick={onClick} style={{background:'none',border:'none',cursor:'pointer',color:'var(--accent)',fontFamily:'Space Mono,monospace',fontSize:10,textDecoration:'underline',padding:0}}>
          Kişisel Koç
        </button>'u dene.
      </span>
    </div>
  )
}

// ── Model Fallback Zinciri ──
const MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]
async function geminiCall(contents, cfg = {}) {
  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GKEY}`,
        { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents, generationConfig:{ temperature:.7, maxOutputTokens:1200, ...cfg } }) }
      )
      if (!res.ok) continue
      const d = await res.json()
      const cand = d?.candidates?.[0]
      const t = cand?.content?.parts?.[0]?.text
      if (t && cand?.finishReason !== 'MAX_TOKENS') return t
      if (t && model === MODELS[MODELS.length - 1]) return t  // son model, yine de dön
    } catch { continue }
  }
  return null
}


const ACTIVITIES = [
  { id:'walking',    label:'Yürüyüş',          icon:'🚶', met:3.5  },
  { id:'running',    label:'Koşu',              icon:'🏃', met:9.8  },
  { id:'cycling',    label:'Bisiklet',          icon:'🚴', met:7.5  },
  { id:'swimming',   label:'Yüzme',             icon:'🏊', met:8.0  },
  { id:'gym',        label:'Ağırlık Antrenman', icon:'🏋️', met:5.0  },
  { id:'hiit',       label:'HIIT',              icon:'⚡', met:10.0 },
  { id:'yoga',       label:'Yoga',              icon:'🧘', met:2.5  },
  { id:'football',   label:'Futbol',            icon:'⚽', met:7.0  },
  { id:'basketball', label:'Basketbol',         icon:'🏀', met:6.5  },
  { id:'dance',      label:'Dans',              icon:'💃', met:5.0  },
  { id:'hiking',     label:'Doğa Yürüyüşü',    icon:'🥾', met:6.0  },
  { id:'rowing',     label:'Kürek / Ergometre', icon:'🚣', met:8.5  },
]
const QUICK_PROMPTS = [
  '3 günlük kilo verme planı yazar mısın?',
  'Yüksek proteinli 1 günlük beslenme listesi',
  'Spor öncesi ve sonrası ne yemeliyim?',
  'Düşük karbonhidratlı diyet örneği',
  'Vejetaryen protein kaynakları neler?',
  'Kahvaltıda ne yemeliyim kilo vermek için?',
]
const PERSONAS = [
  { id: 'friendly', name: 'Destekleyici', icon: '😊', prompt: 'Arkadaş canlısı, destekleyici ve motive edici bir fitness asistanısın. Emojiler kullan ve yüreklendirici ol.' },
  { id: 'sergeant', name: 'Askeri Koç', icon: '🎖️', prompt: 'Acımasız, disiplinli bir askeri koçsun. Kısa, sert ve tavizsiz konuş. "Asker" de.' },
  { id: 'philosophical', name: 'Filozof', icon: '🧘', prompt: 'Bilge, sakin ve felsefik bir koçsun. Vücut ve zihin bütünlüğünden, stoacı felsefeden bahset.' }
]

function ToolButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap: 8, padding:'8px 14px', background:'var(--surface2)', border:'1px solid rgba(255,255,255,0.05)', borderRadius: 20, cursor:'pointer', whiteSpace:'nowrap', color:'var(--text)', transition:'all .2s', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontFamily:'Bebas Neue, sans-serif', fontSize: 14, letterSpacing: 1 }}>{label}</span>
    </button>
  )
}

export default function AiCoachPage() {
  const { profile, goals, foods, templates, saveTemplates, genId,
          checkAndUseAiCredit, aiRemaining, isAiBanned, AI_DAILY_LIMIT, setActiveTab, showToast } = useApp()

  const [view, setView] = useState('chat')
  const [showTools, setShowTools] = useState(false)
  const [persona, setPersona] = useState('friendly')
  const [showSettings, setShowSettings] = useState(false)

  const remaining = aiRemaining()
  const banned    = isAiBanned()
  const blocked   = banned || remaining <= 0

  // Kalori state
  const [weight,     setWeight]     = useState(profile?.weight || '')
  const [age,        setAge]        = useState(profile?.age    || '')
  const [gender,     setGender]     = useState(profile?.gender || 'male')
  const [height,     setHeight]     = useState(profile?.height || '')
  const [activity,   setActivity]   = useState('')
  const [duration,   setDuration]   = useState('')
  const [kcalResult, setKcalResult] = useState(null)
  const [calcLoad,   setCalcLoad]   = useState(false)
  const [calcTips,   setCalcTips]   = useState(null)

  // Chat state
  const [messages, setMessages] = useState([{role:'assistant',text:'👋 Merhaba! Ben KavaFit\'in beslenme asistanıyım.\n\nBeslenme planı, kalori hesabı, diyet önerileri veya besin değerleri hakkında her şeyi sorabilirsin.'}])
  const [chatInput, setChatInput] = useState('')
  const [chatLoad,  setChatLoad]  = useState(false)
  const chatEnd  = useRef(null)
  const textarea = useRef(null)

  // Plan state
  const [planLoad,  setPlanLoad]  = useState(false)
  const [planResult,setPlanResult]= useState(null)
  const [planDays,  setPlanDays]  = useState(profile?.trainDays?.length || 3)
  const [planFocus, setPlanFocus] = useState('')
  const [planSaved, setPlanSaved] = useState(false)

  // Diyet state
  const [dietLoad,  setDietLoad]  = useState(false)
  const [dietResult,setDietResult]= useState(null)

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth'}) }, [messages])

  const calcKcal = () => {
    if (!weight||!activity||!duration) return null
    const act = ACTIVITIES.find(a=>a.id===activity)
    return act ? Math.round(act.met * +weight * (+duration/60)) : null
  }

  const handleCalc = async () => {
    const kcal = calcKcal(); if (!kcal) return
    if (isAiBanned() || aiRemaining() <= 0) { showToast('⏳ Günlük AI hakkın doldu.', 'error'); return }
    const act = ACTIVITIES.find(a=>a.id===activity)
    setKcalResult(kcal); setCalcTips(null); setCalcLoad(true)
    const prompt=`Kalori koçu: ${gender==='male'?'Erkek':'Kadın'}, ${weight}kg, ${act.label}, ${duration}dk → ~${kcal}kcal. Türkçe, maks 3 kısa madde. SADECE bu antrenman için yorum yap.`
    try {
      const reply = await geminiCall([{parts:[{text:prompt}]}], {maxOutputTokens:400})
      if (reply) { checkAndUseAiCredit('kalori'); setCalcTips(reply) }
      else setCalcTips('Yanıt alınamadı, tekrar dene.')
    } catch { setCalcTips('Bağlantı hatası, tekrar dene.') }
    setCalcLoad(false)
  }

  const buildCtx = () => {
    const p=[]
    if (profile) {
      p.push(`${profile.gender==='male'?'Erkek':'Kadın'}, ${profile.age||'?'} yaş, ${profile.weight||'?'}kg, ${profile.height||'?'}cm`)
      if (profile.goal) p.push(`Hedef: ${profile.goal==='lose'?'Kilo ver':profile.goal==='gain'?'Kilo al':profile.goal==='cut'?'Yağ yak':'Koru'}`)
      if (profile.tdee) p.push(`TDEE: ~${profile.tdee}kcal`)
    }
    if (goals) p.push(`Makro: ${goals.kcal}kcal, ${goals.protein}g P, ${goals.fat}g Y, ${goals.carb}g K`)
    if (foods?.length>0) {
      const tot=foods.reduce((t,f)=>({kcal:t.kcal+(+f.kcal||0),protein:t.protein+(+f.protein||0)}),{kcal:0,protein:0})
      p.push(`Bugün: ${Math.round(tot.kcal)}kcal, ${Math.round(tot.protein)}g protein`)
    }
    const selectedPersona = PERSONAS.find(pr=>pr.id===persona) || PERSONAS[0]
    return `Sen KavaFit beslenme ve antrenman asistanısın. ${selectedPersona.prompt}\n\n${p.length?`Kullanıcı:\n${p.join('\n')}\n\n`:''}`
  }

  const sendMessage = async (text) => {
    const msg=text||chatInput.trim(); if (!msg||chatLoad) return
    if (isAiBanned() || aiRemaining() <= 0) { showToast('⏳ Günlük AI hakkın doldu.', 'error'); return }
    const newMsgs=[...messages,{role:'user',text:msg}]
    setMessages(newMsgs); setChatInput(''); setChatLoad(true)
    const ctx=buildCtx()
    const contents=[
      {role:'user',  parts:[{text:ctx+'Merhaba.'}]},
      {role:'model', parts:[{text:'Merhaba! Yardımcı olmaktan memnuniyet duyarım.'}]},
      ...newMsgs.map(m=>({role:m.role==='user'?'user':'model',parts:[{text:m.text}]})),
    ]
    try {
      const reply = await geminiCall(contents, {maxOutputTokens:1200})
      if (reply) { checkAndUseAiCredit('chat'); setMessages(prev=>[...prev,{role:'assistant',text:reply}]) }
      else setMessages(prev=>[...prev,{role:'assistant',text:'Yanıt alınamadı, tekrar dene.'}])
    } catch { setMessages(prev=>[...prev,{role:'assistant',text:'⚠️ Bağlantı hatası, tekrar dene.'}]) }
    setChatLoad(false)
  }

  const generatePlan = async () => {
    if (!profile) return
    if (isAiBanned() || aiRemaining() <= 0) { showToast('⏳ Günlük AI hakkın doldu.', 'error'); return }
    setPlanLoad(true); setPlanResult(null); setPlanSaved(false)
    const goalMap={lose:'Kilo vermek',gain:'Kilo almak',cut:'Yağ yakmak',maintain:'Kiloyu korumak'}
    const levelMap={beginner:'Yeni Başlayan',intermediate:'Orta Seviye',advanced:'İleri Seviye'}
    const sportMap={gym:'Gym/Ağırlık',cardio:'Cardio',yoga:'Yoga',crossfit:'CrossFit',swim:'Yüzme',football:'Futbol',diet:'Diyet',mixed:'Karma'}
    const sports=profile.sportTypes?.map(s=>sportMap[s]||s).join(', ')||'Gym'
    const prompt=`Kişisel antrenörsün. ${planDays} günlük haftalık antrenman programı oluştur.
Profil: ${profile.gender==='male'?'Erkek':'Kadın'}, ${profile.age||'?'} yaş, ${profile.weight||'?'}kg
Seviye: ${levelMap[profile.level]||'Orta'} | Hedef: ${goalMap[profile.goal]||'Fitness'} | Spor: ${sports}${planFocus?` | Odak: ${planFocus}`:''}
Sadece JSON:
{"program_adi":"...","haftalik_plan":[{"gun":"Pazartesi","odak":"Göğüs","egzersizler":[{"isim":"Bench Press","set":4,"tekrar":"8-10"}],"sure_dk":60,"notlar":"..."}],"genel_notlar":"...","beslenme_ozeti":"..."}`
    try {
      const rawText = await geminiCall([{parts:[{text:prompt}]}], {maxOutputTokens:1500})
      if (rawText) {
        checkAndUseAiCredit('plan') // sadece başarılıda tüket
        let raw = rawText.trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
        let parsed=null; try{parsed=JSON.parse(raw)}catch{const m=raw.match(/\{[\s\S]*\}/);try{parsed=m?JSON.parse(m[0]):null}catch{}}
        setPlanResult(parsed||{error:'Plan formatı okunamadı, tekrar dene.'})
      } else {
        setPlanResult({error:'Plan oluşturulamadı, tekrar dene.'})
      }
    } catch { setPlanResult({error:'⚠️ Bağlantı hatası, tekrar dene.'}) }
    setPlanLoad(false)
  }

  const savePlanAsTemplate = () => {
    if (!planResult?.haftalik_plan) return
    const tpls=planResult.haftalik_plan.filter(g=>g.egzersizler?.length>0).map(g=>({id:genId(),name:`${planResult.program_adi} — ${g.gun} (${g.odak})`,exercises:g.egzersizler.map(e=>`${e.isim} ${e.set}×${e.tekrar}`)}))
    saveTemplates([...(templates||[]),...tpls]); setPlanSaved(true)
  }

  const analyzeDiet = async () => {
    if (!foods?.length) return
    if (isAiBanned() || aiRemaining() <= 0) { showToast('⏳ Günlük AI hakkın doldu.', 'error'); return }
    setDietLoad(true); setDietResult(null)
    const tot=foods.reduce((t,f)=>({kcal:t.kcal+(+f.kcal||0),protein:t.protein+(+f.protein||0),fat:t.fat+(+f.fat||0),carb:t.carb+(+f.carb||0)}),{kcal:0,protein:0,fat:0,carb:0})
    const list=foods.map(f=>`${f.name}: ${f.kcal}kcal, ${f.protein}g P, ${f.fat}g Y, ${f.carb}g K`).join('\n')
    const goalMap={lose:'Kilo vermek',gain:'Kilo almak',cut:'Yağ yakmak',maintain:'Kiloyu korumak'}
    const prompt=`Beslenme uzmanısın. Bugünkü yemekleri analiz et.
Hedef: ${goalMap[profile?.goal]||'Genel sağlık'} | Kalori hedefi: ${goals.kcal}kcal | Protein: ${goals.protein}g
Yemekler:\n${list}
Toplam: ${Math.round(tot.kcal)}kcal, ${Math.round(tot.protein)}g P, ${Math.round(tot.fat)}g Y, ${Math.round(tot.carb)}g K
Türkçe analiz:
1. ✅ OLUMLU NOKTALAR (2-3 madde)
2. ⚠️ EKSİK/FAZLA (2-3 madde)
3. 🍽️ YARIN İÇİN 3 ÖĞÜN ÖNERİSİ
4. 💡 GENEL TAVSİYE (1-2 cümle)
Eksiksiz yaz.`
    try {
      const reply = await geminiCall([{parts:[{text:prompt}]}], {maxOutputTokens:1000})
      if (reply) { checkAndUseAiCredit('diyet'); setDietResult(reply) }
      else setDietResult('Analiz alınamadı, tekrar dene.')
    } catch { setDietResult('⚠️ Bağlantı hatası, tekrar dene.') }
    setDietLoad(false)
  }

  const selectedAct = ACTIVITIES.find(a=>a.id===activity)
  const tabStyle = (id) => ({
    flex:1, padding:'9px 4px', border:'none', cursor:'pointer',
    fontFamily:'Bebas Neue,sans-serif', fontSize:11, letterSpacing:1.5,
    background: tab===id?'var(--accent)':'transparent',
    color: tab===id?'#0a0a0a':'var(--text-muted)',
    borderRadius:6, transition:'all .15s',
  })

  return (
    <div className="page animate-fade" style={{ maxWidth:700 }}>

      {/* ── BAŞLIK & AYARLAR ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background:'linear-gradient(135deg, rgba(71,200,255,0.2), transparent)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(71,200,255,0.3)', fontSize: 18 }}>
            🤖
          </div>
          <h1 style={{ fontFamily:'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: 1, margin: 0, color:'var(--text)' }}>AiCoach</h1>
        </div>
        <button onClick={()=>setShowSettings(!showSettings)} style={{ background: showSettings ? 'rgba(232,255,71,0.1)' : 'var(--surface2)', border: showSettings ? '1px solid rgba(232,255,71,0.3)' : '1px solid var(--border)', borderRadius: '50%', width: 36, height: 36, display:'flex', alignItems:'center', justifyContent:'center', color: showSettings ? 'var(--accent)' : 'var(--text-muted)', transition:'all .2s' }}>
          ⚙️
        </button>  
      </div>

      {banned && (
        <div className="animate-fade" style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'rgba(255,71,71,.07)',border:'1px solid rgba(255,71,71,.2)',borderRadius:9,marginBottom:16 }}>
          <span style={{fontSize:16,flexShrink:0}}>🚫</span>
          <div style={{fontFamily:'Space Mono,monospace',fontSize:10,color:'var(--red)',lineHeight:1.6}}>
            <b>Bugün AI özelliklerinden yararlanamazsın.</b><br/>
            <span style={{opacity:.75}}>Uygunsuz içerik tespit edildi. Yarın sıfırlanır.</span>
          </div>
        </div>
      )}

      {/* ── PERSONA SEÇİMİ ── */}
      {showSettings && !banned && (
        <div className="animate-fade" style={{ background:'var(--surface2)', borderRadius: 16, padding: 16, marginBottom: 16, border:'1px solid var(--border)', boxShadow:'0 8px 24px rgba(0,0,0,0.2)', position:'relative', zIndex: 11 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
            <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize: 14, letterSpacing: 1, color:'var(--text-muted)' }}>KOÇ PERSONASI</div>
            <div style={{ fontFamily:'Space Mono, monospace', fontSize: 10, color:'var(--text-muted)' }}><b style={{color:remaining>0?'var(--accent)':'var(--red)'}}>{remaining}</b> / {AI_DAILY_LIMIT} KREDİ</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8 }}>
            {PERSONAS.map(p => (
              <div key={p.id} onClick={()=>{setPersona(p.id);setShowSettings(false)}} style={{ padding:'12px 8px', textAlign:'center', borderRadius: 12, cursor:'pointer', border: persona===p.id ? '1px solid var(--accent)' : '1px solid var(--border)', background: persona===p.id ? 'rgba(232,255,71,0.1)' : 'var(--surface)', transition:'all 0.2s' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{p.icon}</div>
                <div style={{ fontFamily:'Space Mono, monospace', fontSize: 10, color: persona===p.id ? 'var(--accent)' : 'var(--text-muted)' }}>{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SOHBET EKRANI ── */}
      {view === 'chat' && (
        <>
          <div style={{ flex: 1, overflowY:'auto', display:'flex', flexDirection:'column', gap: 16, paddingBottom: 150, paddingTop: 10, scrollbarWidth:'none', position:'relative', zIndex: 1 }}>
            {messages.map((msg,i) => (
              <div key={i} style={{ display:'flex',gap:10,flexDirection:msg.role==='user'?'row-reverse':'row',alignItems:'flex-start' }}>
                <div style={{ width:28,height:28,borderRadius:'50%',flexShrink:0,background:msg.role==='user'?'var(--accent)':'rgba(71,200,255,.15)',border:msg.role==='user'?'none':'1px solid rgba(71,200,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:msg.role==='user'?'#0a0a0a':'#47c8ff' }}>
                  {msg.role==='user'?'👤':PERSONAS.find(p=>p.id===persona)?.icon||'🤖'}
                </div>
                <div style={{ maxWidth:'80%',background:msg.role==='user'?'var(--accent)':'var(--surface2)',border:msg.role==='user'?'1px solid var(--accent)':'1px solid var(--border)',borderRadius:msg.role==='user'?'18px 4px 18px 18px':'4px 18px 18px 18px',padding:'12px 16px', boxShadow:msg.role==='user'?'0 4px 12px rgba(232,255,71,0.15)':'none' }}>
                  <div style={{ fontSize:14,lineHeight:1.6,color:msg.role==='user'?'#0a0a0a':'var(--text)',fontFamily:'Inter,sans-serif',whiteSpace:'pre-wrap',wordBreak:'break-word' }}>{msg.text}</div>
                </div>
              </div>
            ))}
            {chatLoad && (
              <div style={{ display:'flex',gap:10,alignItems:'center' }}>
                <div style={{ width:28,height:28,borderRadius:'50%',background:'rgba(71,200,255,.15)',border:'1px solid rgba(71,200,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13 }}>{PERSONAS.find(p=>p.id===persona)?.icon||'🤖'}</div>
                <div style={{ background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'4px 18px 18px 18px',padding:'14px 18px',display:'flex',gap:6,alignItems:'center' }}>
                  {[0,.15,.3].map((d,i)=><span key={i} style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)',animation:`pulse 1.2s ease infinite ${d}s`,display:'inline-block'}}/>)}
                </div>
              </div>
            )}
            <div ref={chatEnd}/>
          </div>
          
          <div style={{ position:'fixed', bottom: 85, left: 16, right: 16, maxWidth: 668, margin:'0 auto', zIndex: 10 }}>
            {/* Popover */}
            {showTools && (
              <div className="animate-fade" style={{ position:'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 12, display:'flex', gap: 8, overflowX:'auto', scrollbarWidth:'none', padding:'4px' }}>
                <ToolButton icon="📋" label="Antrenman Planı" onClick={()=>{setView('plan');setShowTools(false)}} />
                <ToolButton icon="🥗" label="Diyet Analizi" onClick={()=>{setView('diet');setShowTools(false)}} />
                <ToolButton icon="🔥" label="Kalori Hesapla" onClick={()=>{setView('calorie');setShowTools(false)}} />
              </div>
            )}
            
            <div style={{ display:'flex', alignItems:'flex-end', gap: 8, background:'var(--surface)', padding:'8px', borderRadius: 28, border:'1px solid var(--border)', boxShadow:'0 12px 32px rgba(0,0,0,0.6)', position:'relative', overflow:'hidden' }}>
              {chatLoad && <div style={{ position:'absolute', inset: 0, background:'linear-gradient(90deg, transparent, rgba(232,255,71,0.1), transparent)', zIndex: 0, animation:'shimmer 2s infinite' }} />}
              <button onClick={()=>setShowTools(!showTools)} style={{ width: 44, height: 44, borderRadius:'50%', background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1, flexShrink: 0, transition:'transform 0.2s', transform: showTools ? 'rotate(45deg)' : 'none' }}>
                <span style={{ fontSize: 18 }}>✨</span>
              </button>
              <textarea 
                ref={textarea} value={chatInput} onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()} }}
                placeholder={blocked?'🚫 Bugün hakkın doldu':'Ne öğrenmek istiyorsun?'}
                disabled={chatLoad||blocked} rows={1}
                style={{ flex: 1, background:'transparent', border:'none', color:'var(--text)', padding:'12px 6px', minHeight: 44, maxHeight: 120, outline:'none', resize:'none', zIndex: 1, fontFamily:'Inter, sans-serif', fontSize: 15 }}
              />
              <button onClick={()=>sendMessage()} disabled={!chatInput.trim()||chatLoad||blocked} style={{ minWidth: 56, height: 44, borderRadius: 22, background: chatInput.trim()&&!chatLoad&&!blocked?'var(--accent)':'var(--surface2)', color: chatInput.trim()&&!chatLoad&&!blocked?'#0a0a0a':'var(--text-muted)', border:'none', zIndex: 1, display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0, gap: 4, transition:'all .2s' }}>
                {chatLoad?<span className="spinner" style={{width:16,height:16,borderTopColor:'var(--text-muted)'}}/>:<><span style={{ fontFamily:'Space Mono, monospace', fontSize: 11, fontWeight:'bold' }}>{remaining}</span><span>↑</span></>}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── DİĞER FORMLAR (PLAN, DİYET, KALORİ) ── */}
      {view !== 'chat' && (
        <div className="animate-fade" style={{ flex: 1, paddingBottom: 100 }}>
          <button onClick={()=>setView('chat')} style={{ padding:'8px 12px', fontSize: 12, marginBottom: 16, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius: 12, color:'var(--text)', cursor:'pointer' }}>
            ← Sohbete Dön
          </button>
          
      {/* ═══ ANTRENMAN PLANI ═══ */}
      {view==='plan' && (
        <>
          <div className="section-title">📋 AI ANTRENMAN PLANLAYICI</div>
          {!profile ? (
            <div className="card" style={{padding:'32px 24px',textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:12}}>⚙️</div>
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:18,letterSpacing:2,marginBottom:8}}>PROFİL GEREKLİ</div>
              <div style={{fontFamily:'Space Mono,monospace',fontSize:11,color:'var(--text-muted)'}}>Ayarlar → Profil bölümünü doldurun.</div>
            </div>
          ) : (
            <div className="card" style={{padding:20,marginBottom:16}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                <div className="form-group">
                  <span className="flabel">Haftada kaç gün?</span>
                  <div style={{display:'flex',gap:6}}>
                    {[2,3,4,5,6].map(d=>(
                      <div key={d} onClick={()=>setPlanDays(d)} style={{flex:1,padding:'8px 4px',borderRadius:8,cursor:'pointer',textAlign:'center',background:planDays===d?'rgba(232,255,71,.08)':'var(--surface2)',border:`1px solid ${planDays===d?'rgba(232,255,71,.3)':'var(--border)'}`,fontFamily:'Bebas Neue,sans-serif',fontSize:16,color:planDays===d?'var(--accent)':'var(--text-muted)'}}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <span className="flabel">Özel odak (opsiyonel)</span>
                  <input type="text" value={planFocus} onChange={e=>setPlanFocus(e.target.value)} placeholder="üst vücut, bacak..."/>
                </div>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
                {[profile.goal&&`🎯 ${profile.goal==='lose'?'Kilo Ver':profile.goal==='gain'?'Kilo Al':profile.goal==='cut'?'Yağ Yak':'Koru'}`,profile.level&&`📊 ${profile.level==='beginner'?'Başlangıç':profile.level==='intermediate'?'Orta':'İleri'}`,profile.weight&&`⚖️ ${profile.weight}kg`].filter(Boolean).map((t,i)=>(
                  <span key={i} style={{fontFamily:'Space Mono,monospace',fontSize:10,background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:20,padding:'3px 10px',color:'var(--text-muted)'}}>{t}</span>
                ))}
              </div>
              <button className="btn btn-primary" onClick={generatePlan} disabled={planLoad||blocked} style={{width:'100%',padding:13,opacity:blocked?.4:1}}>
                {planLoad?<><span className="spinner" style={{width:14,height:14,borderTopColor:'#0a0a0a',marginRight:8}}/>Oluşturuluyor...</>:blocked?'🚫 Hak yok':'🤖 Haftalık Plan Oluştur'}
              </button>
            </div>
          )}
          {planResult&&!planResult.error&&(
            <div className="animate-fade">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8}}>
                <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:20,letterSpacing:2,color:'var(--accent)'}}>{planResult.program_adi}</div>
                <button onClick={savePlanAsTemplate} disabled={planSaved} className="btn btn-ghost" style={{fontSize:11,padding:'6px 14px',borderColor:planSaved?'rgba(71,255,138,.3)':'var(--border)',color:planSaved?'var(--green)':'var(--text-muted)'}}>
                  {planSaved?'✓ Eklendi':'📋 Şablona Kaydet'}
                </button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
                {planResult.haftalik_plan?.map((gun,i)=>(
                  <div key={i} className="card" style={{padding:'14px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:gun.egzersizler?.length>0?10:0}}>
                      <div>
                        <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:16,letterSpacing:1.5,color:gun.egzersizler?.length>0?'var(--accent)':'var(--text-muted)'}}>{gun.gun}</div>
                        <div style={{fontFamily:'Space Mono,monospace',fontSize:10,color:'var(--text-muted)',marginTop:2}}>{gun.odak}</div>
                      </div>
                      {gun.sure_dk&&<span style={{fontFamily:'Space Mono,monospace',fontSize:10,color:'var(--text-muted)',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:20,padding:'3px 9px'}}>{gun.sure_dk} dk</span>}
                    </div>
                    {gun.egzersizler?.length>0?(
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        {gun.egzersizler.map((ex,j)=>(
                          <div key={j} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 10px',background:'var(--surface2)',borderRadius:8,border:'1px solid var(--border)'}}>
                            <span style={{fontFamily:'Space Mono,monospace',fontSize:11,color:'var(--text)'}}>{ex.isim}</span>
                            <span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:13,color:'var(--accent)',letterSpacing:1}}>{ex.set} × {ex.tekrar}</span>
                          </div>
                        ))}
                        {gun.notlar&&<div style={{fontFamily:'Space Mono,monospace',fontSize:10,color:'var(--text-muted)',marginTop:4,fontStyle:'italic'}}>💡 {gun.notlar}</div>}
                      </div>
                    ):<div style={{fontFamily:'Space Mono,monospace',fontSize:11,color:'var(--text-muted)',marginTop:6}}>😴 Dinlenme günü</div>}
                  </div>
                ))}
              </div>
              {planResult.genel_notlar&&<div style={{background:'rgba(71,200,255,.05)',border:'1px solid rgba(71,200,255,.15)',borderRadius:10,padding:'12px 14px',marginBottom:10}}><div style={{fontFamily:'Space Mono,monospace',fontSize:9,letterSpacing:2,color:'#47c8ff',marginBottom:6}}>GENEL NOTLAR</div><div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.7,fontFamily:'Inter,sans-serif'}}>{planResult.genel_notlar}</div></div>}
              {planResult.beslenme_ozeti&&<div style={{background:'rgba(71,255,138,.05)',border:'1px solid rgba(71,255,138,.15)',borderRadius:10,padding:'12px 14px'}}><div style={{fontFamily:'Space Mono,monospace',fontSize:9,letterSpacing:2,color:'var(--green)',marginBottom:6}}>BESLENME ÖZETİ</div><div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.7,fontFamily:'Inter,sans-serif'}}>{planResult.beslenme_ozeti}</div></div>}
            </div>
          )}
          {planResult?.error&&<div style={{background:'rgba(255,71,71,.08)',border:'1px solid rgba(255,71,71,.2)',borderRadius:10,padding:'12px 14px',fontFamily:'Space Mono,monospace',fontSize:12,color:'var(--red)'}}>{planResult.error}</div>}
          {planResult&&!planResult.error&&<CoachNote onClick={()=>setActiveTab('coach')}/>}
        </>
      )}

      {/* ═══ DİYET ANALİZİ ═══ */}
      {view==='diet' && (
        <>
          <div className="section-title">🥗 GÜNLÜK DİYET ANALİZİ</div>
          {!foods?.length ? (
            <div className="card" style={{padding:'32px 24px',textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:12}}>🍽️</div>
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:18,letterSpacing:2,marginBottom:8}}>YEMEĞİ KAYDET ÖNCE</div>
              <div style={{fontFamily:'Space Mono,monospace',fontSize:11,color:'var(--text-muted)',lineHeight:1.7}}>Kalori Takibi sayfasından bugünkü<br/>yemekleri ekle, sonra analiz et.</div>
            </div>
          ) : (
            <div className="card" style={{padding:20,marginBottom:16}}>
              <div style={{marginBottom:14}}>
                <div style={{fontFamily:'Space Mono,monospace',fontSize:9,letterSpacing:2,color:'var(--text-muted)',marginBottom:8}}>BUGÜN ({foods.length} yemek)</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {foods.slice(0,6).map((f,i)=><span key={i} style={{fontFamily:'Space Mono,monospace',fontSize:10,background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:20,padding:'3px 10px',color:'var(--text-muted)'}}>{f.name}</span>)}
                  {foods.length>6&&<span style={{fontFamily:'Space Mono,monospace',fontSize:10,color:'var(--text-muted)'}}>+{foods.length-6} daha</span>}
                </div>
              </div>
              <button className="btn btn-primary" onClick={analyzeDiet} disabled={dietLoad||blocked} style={{width:'100%',padding:13,opacity:blocked?.4:1}}>
                {dietLoad?<><span className="spinner" style={{width:14,height:14,borderTopColor:'#0a0a0a',marginRight:8}}/>Analiz Ediliyor...</>:blocked?'🚫 Hak yok':'🤖 Bugünkü Diyetimi Analiz Et'}
              </button>
            </div>
          )}
          {dietResult&&(
            <div className="animate-fade card" style={{padding:'18px 20px'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <div style={{width:28,height:28,borderRadius:7,background:'rgba(71,255,138,.1)',border:'1px solid rgba(71,255,138,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🥗</div>
                <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:14,letterSpacing:2,color:'var(--green)'}}>AI DİYET ANALİZİ</div>
              </div>
              {dietLoad?<div style={{display:'flex',alignItems:'center',gap:10,color:'var(--text-muted)',fontFamily:'Space Mono,monospace',fontSize:12}}><span className="spinner"/>Analiz ediliyor...</div>
                :<><div style={{fontSize:13,lineHeight:1.9,color:'var(--text-dim)',fontFamily:'Inter,sans-serif',whiteSpace:'pre-wrap'}}>{dietResult}</div><CoachNote onClick={()=>setActiveTab('coach')}/></> }
            </div>
          )}
        </>
      )}

      {/* ═══ KALORİ HESAP ═══ */}
      {view==='calorie' && (
        <>
          <div className="section-title">🔥 AKTİVİTE KALORİ HESAPLAYICI</div>
          <div className="card" style={{padding:20,marginBottom:20}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:14}}>
              <div className="form-group">
                <span className="flabel">Cinsiyet</span>
                <div style={{display:'flex',gap:6}}>
                  {[['male','👨 Erkek'],['female','👩 Kadın']].map(([v,l])=>(
                    <div key={v} onClick={()=>setGender(v)} style={{flex:1,padding:'8px 10px',borderRadius:8,cursor:'pointer',textAlign:'center',background:gender===v?'rgba(232,255,71,.08)':'var(--surface2)',border:`1px solid ${gender===v?'rgba(232,255,71,.3)':'var(--border)'}`,fontFamily:'Space Mono,monospace',fontSize:11,color:gender===v?'var(--accent)':'var(--text-muted)'}}>{l}</div>
                  ))}
                </div>
              </div>
              <div className="form-group"><span className="flabel">Kilo (kg)</span><input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="75"/></div>
              <div className="form-group"><span className="flabel">Yaş</span><input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="25"/></div>
              <div className="form-group"><span className="flabel">Boy (cm)</span><input type="number" value={height} onChange={e=>setHeight(e.target.value)} placeholder="175"/></div>
            </div>
            <div className="form-group" style={{marginBottom:12}}>
              <span className="flabel">Aktivite</span>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                {ACTIVITIES.map(act=>(
                  <div key={act.id} onClick={()=>setActivity(act.id)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 10px',borderRadius:8,cursor:'pointer',background:activity===act.id?'rgba(232,255,71,.08)':'var(--surface2)',border:`1px solid ${activity===act.id?'rgba(232,255,71,.3)':'var(--border)'}`,transition:'all .15s'}}>
                    <span style={{fontSize:15}}>{act.icon}</span>
                    <span style={{fontFamily:'Space Mono,monospace',fontSize:10,color:activity===act.id?'var(--accent)':'var(--text-muted)'}}>{act.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group" style={{marginBottom:16}}>
              <span className="flabel">Süre (dakika)</span>
              <input type="number" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="45"/>
            </div>
            <button className="btn btn-primary" onClick={handleCalc} disabled={!weight||!activity||!duration||blocked} style={{width:'100%',opacity:(!weight||!activity||!duration||blocked)?.4:1}}>
              {blocked?'🚫 Hak yok':'🔥 Kalori Hesapla'}
            </button>
          </div>
          {kcalResult&&(
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
              <div style={{background:'linear-gradient(135deg,rgba(232,255,71,.08),rgba(232,255,71,.03))',border:'1px solid rgba(232,255,71,.2)',borderRadius:14,padding:'20px 22px',display:'flex',alignItems:'center',gap:16}}>
                <div style={{fontSize:36}}>🔥</div>
                <div>
                  <div style={{fontFamily:'Space Mono,monospace',fontSize:10,letterSpacing:3,color:'var(--text-muted)',marginBottom:4}}>{selectedAct?.label?.toUpperCase()} · {duration} DAK</div>
                  <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:48,lineHeight:1,color:'var(--accent)'}}>{kcalResult} <span style={{fontSize:18,color:'var(--text-muted)'}}>KCAL</span></div>
                  <div style={{fontFamily:'Space Mono,monospace',fontSize:11,color:'var(--text-muted)',marginTop:4}}>{weight} kg · MET {selectedAct?.met}</div>
                </div>
              </div>
              <div className="card" style={{padding:18}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <div style={{width:28,height:28,borderRadius:7,background:'rgba(232,255,71,.12)',border:'1px solid rgba(232,255,71,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🤖</div>
                  <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:14,letterSpacing:2}}>AI KOÇ ÖNERİSİ</div>
                </div>
                {calcLoad?<div style={{display:'flex',alignItems:'center',gap:10,color:'var(--text-muted)',fontFamily:'Space Mono,monospace',fontSize:12}}><span className="spinner"/>Düşünüyor...</div>
                  :calcTips&&<><div style={{fontSize:13,color:'var(--text-dim)',lineHeight:1.9,fontFamily:'Inter,sans-serif',whiteSpace:'pre-wrap'}}>{calcTips}</div><CoachNote onClick={()=>setActiveTab('coach')}/></> }
              </div>
            </div>
          )}
        </>
      )}

        </div>
      )} {/* DİĞER FORMLAR BİTİŞ */}

      <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  )
}
