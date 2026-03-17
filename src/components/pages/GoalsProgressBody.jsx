import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const GKEY = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'

// ── Hedef ilerleme tahmin motoru ──
function calcGoalProgress(profile, body, exercises, exArchive, goals, foods, calArch) {
  if (!profile) return null
  const today = new Date().toISOString().slice(0,10)

  // Son 2 haftanın kalori ortalaması
  const last14 = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(); d.setDate(d.getDate()-i)
    const dk = d.toISOString().slice(0,10)
    const fs = dk===today ? foods : (calArch[dk]||[])
    const kcal = fs.reduce((s,f)=>s+(+f.kcal||0),0)
    if (kcal > 0) last14.push(kcal)
  }
  const avgKcal = last14.length > 0 ? Math.round(last14.reduce((a,b)=>a+b,0)/last14.length) : 0

  // Son 4 haftanın antrenman frekansı
  const trainDays = []
  for (let i = 0; i < 28; i++) {
    const d = new Date(); d.setDate(d.getDate()-i)
    const dk = d.toISOString().slice(0,10)
    const exs = dk===today ? exercises : (exArchive[dk]||[])
    if (exs.length > 0) trainDays.push(dk)
  }
  const weeklyFreq = (trainDays.length / 4)

  // Kilo trendi (son 30 gün)
  const sortedBody = [...body].sort((a,b)=>b.date.localeCompare(a.date))
  const latestWeight  = sortedBody[0]?.weight || profile.weight
  const oldestWeight  = sortedBody[sortedBody.length-1]?.weight || profile.weight
  const weightChange  = sortedBody.length >= 2 ? +(latestWeight - oldestWeight).toFixed(1) : 0
  const daysTracked   = sortedBody.length >= 2
    ? Math.max(1, (new Date(sortedBody[0].date) - new Date(sortedBody[sortedBody.length-1].date)) / 86400000)
    : 1
  const weeklyWeightChange = (weightChange / daysTracked) * 7

  // Hedefe ne kadar kaldı
  let targetWeight = profile.weight
  let weeksToGoal  = null
  let progressPct  = 50

  if (profile.goal === 'lose') {
    targetWeight = Math.max(50, (profile.weight || 75) - 10)
    const diff = (latestWeight||profile.weight) - targetWeight
    if (weeklyWeightChange < 0) {
      weeksToGoal = Math.ceil(diff / Math.abs(weeklyWeightChange))
    }
    progressPct = diff > 0 ? Math.min(95, Math.round((1 - diff/10)*100)) : 100
  } else if (profile.goal === 'gain') {
    targetWeight = (profile.weight || 75) + 5
    const diff = targetWeight - (latestWeight||profile.weight)
    if (weeklyWeightChange > 0) {
      weeksToGoal = Math.ceil(diff / weeklyWeightChange)
    }
    progressPct = Math.min(95, Math.round((1 - diff/5)*100))
  } else {
    progressPct = 70
  }

  // Genel skor (0-100)
  const calorieScore   = avgKcal > 0 ? Math.min(100, 100 - Math.abs(avgKcal - goals.kcal) / goals.kcal * 100) : 0
  const trainingScore  = Math.min(100, (weeklyFreq / (profile.trainDays?.length||3)) * 100)
  const consistencyScore = Math.min(100, (trainDays.length / 20) * 100)
  const overallScore   = Math.round((calorieScore * 0.35 + trainingScore * 0.4 + consistencyScore * 0.25))

  return {
    overallScore,
    calorieScore: Math.round(calorieScore),
    trainingScore: Math.round(trainingScore),
    avgKcal,
    weeklyFreq: +weeklyFreq.toFixed(1),
    weeklyWeightChange: +weeklyWeightChange.toFixed(2),
    latestWeight,
    weeksToGoal,
    progressPct: Math.max(0, Math.min(100, progressPct)),
    trainDaysCount: trainDays.length,
  }
}

export function GoalsPage() {
  const { goals, profile, foods, water, saveWater } = useApp()

  const totals = foods.reduce((t,f) => ({
    kcal:    t.kcal    + (+f.kcal||0),
    protein: t.protein + (+f.protein||0),
    fat:     t.fat     + (+f.fat||0),
    carb:    t.carb    + (+f.carb||0),
  }), { kcal:0, protein:0, fat:0, carb:0 })

  const fields = [
    { key:'kcal',    label:'KALORİ',       unit:'kcal', color:'#e8ff47' },
    { key:'protein', label:'PROTEİN',       unit:'g',    color:'#47c8ff' },
    { key:'fat',     label:'YAĞ',           unit:'g',    color:'#ff8c47' },
    { key:'carb',    label:'KARBONHİDRAT',  unit:'g',    color:'#47ff8a' },
  ]

  const WATER_GOAL   = 2500
  const waterPct     = Math.min(100, Math.round((water/WATER_GOAL)*100))

  const addWater   = (ml) => saveWater(Math.min(water+ml, 9999))
  const resetWater = ()   => saveWater(0)

  return (
    <div className="page">


      <div className="section-title">GÜNLÜK MAKRO TAKİBİ</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginBottom:24 }}>
        {fields.map(({ key, label, unit, color }) => {
          const cur = Math.round(totals[key]); const tgt = goals[key]||1
          const pct = Math.min(100, Math.round((cur/tgt)*100))
          const barColor = pct>=100?'var(--red)':pct>=75?'var(--accent)':color
          return (
            <div key={key} className="card" style={{ padding:'18px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:2, color:'var(--text-muted)' }}>{label}</div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text-muted)' }}>
                  <b style={{ color:'var(--text)' }}>{cur}</b> / {goals[key]} {unit}
                </div>
              </div>
              <div style={{ background:'var(--surface3)', borderRadius:20, height:8, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:20, width:`${pct}%`, background:barColor, transition:'width .6s ease' }}/>
              </div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13, marginTop:7, textAlign:'right', color:pct>=100?'var(--red)':pct>=75?'var(--accent)':'var(--text-muted)' }}>{pct}%</div>
            </div>
          )
        })}
      </div>

      {/* Su Takibi */}
      <div className="section-title" style={{ marginTop:8 }}>SU TAKİBİ 💧</div>
      <div className="card" style={{ padding:'20px 22px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:10 }}>
          <div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:48, lineHeight:1, color:'#47c8ff' }}>
              {water} <span style={{ fontSize:18, color:'var(--text-muted)' }}>ml</span>
            </div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Hedef: {WATER_GOAL} ml / gün</div>
          </div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, color:waterPct>=100?'var(--green)':'#47c8ff' }}>{waterPct}%</div>
        </div>
        <div style={{ background:'var(--surface3)', borderRadius:20, height:10, overflow:'hidden', marginBottom:16 }}>
          <div style={{ height:'100%', borderRadius:20, width:`${waterPct}%`, background:waterPct>=100?'linear-gradient(90deg,#47ff8a,#47c8ff)':'linear-gradient(90deg,#47c8ff88,#47c8ff)', transition:'width .5s ease' }}/>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
          {[150,200,300,500].map(ml=>(
            <button key={ml} onClick={()=>addWater(ml)} style={{ flex:1, minWidth:60, padding:'10px 4px', borderRadius:8, border:'1px solid rgba(71,200,255,.25)', background:'rgba(71,200,255,.07)', color:'#47c8ff', fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:1, cursor:'pointer', transition:'all .15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(71,200,255,.15)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(71,200,255,.07)'}
            >+{ml}ml</button>
          ))}
        </div>
        <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.6, marginBottom:10 }}>
          {waterPct>=100?'🎉 Günlük su hedefinizi tamamladınız!':waterPct>=60?`💧 İyi gidiyorsunuz! ${WATER_GOAL-water} ml daha.`:`⚠️ ${WATER_GOAL} ml hedef. Şimdiye kadar ${water} ml.`}
        </div>
        <button onClick={resetWater} style={{ background:'none', border:'none', cursor:'pointer', fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', textDecoration:'underline' }}>Sıfırla</button>
      </div>

      {!profile && (
        <div style={{ textAlign:'center', padding:'20px 0', fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.7 }}>
          Hedeflerini otomatik hesaplamak için<br/><b style={{ color:'var(--accent)' }}>Ayarlar sayfasını</b> doldur.
        </div>
      )}
    </div>
  )
}

export function ProgressPage() {
  const { exercises, exArchive, foods, calArch, goals, body, profile, todayKey, streak, notifPermission, requestNotifPermission } = useApp()
  const [selEx, setSelEx]   = useState('')
  const [metric, setMetric] = useState('weight')
  const [range, setRange]   = useState(7)
  const [activeSection, setActiveSection] = useState('progress')
  const [aiInsight, setAiInsight]     = useState(null)
  const [aiLoading, setAiLoading]     = useState(false)

  const exChartRef  = useRef(null); const exChartInst  = useRef(null)
  const calChartRef = useRef(null); const calChartInst = useRef(null)

  const goalData = calcGoalProgress(profile, body, exercises, exArchive, goals, foods, calArch)

  const allExNames = () => {
    const s = new Set()
    exercises.forEach(e => s.add(e.name))
    Object.values(exArchive).forEach(day => day.forEach(e => s.add(e.name)))
    return [...s].sort()
  }

  const tabStyle = (active) => ({
    fontFamily:'DM Mono,monospace', fontSize:10, padding:'5px 10px', borderRadius:6,
    border:'none', cursor:'pointer', transition:'all .15s',
    background: active?'var(--accent)':'var(--surface2)',
    color: active?'#0a0a0a':'var(--text-muted)',
  })

  useEffect(() => {
    if (!selEx || !exChartRef.current) return
    const allDays = [...Object.entries(exArchive).sort((a,b)=>a[0].localeCompare(b[0]))]
    if (exercises.length > 0) allDays.push([todayKey(), exercises])
    const labels=[], values=[]
    allDays.forEach(([dk,exs]) => {
      const ex = exs.find(e=>e.name.toLowerCase()===selEx.toLowerCase())
      if (!ex||ex.sets.length===0) return
      const d = new Date(dk+'T00:00:00')
      labels.push(d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}))
      values.push(metric==='weight'?Math.max(...ex.sets.map(s=>+s.weight)):ex.sets.reduce((s,st)=>s+(+st.reps),0))
    })
    if (exChartInst.current) exChartInst.current.destroy()
    exChartInst.current = new Chart(exChartRef.current, {
      type:'line',
      data:{labels,datasets:[{label:metric==='weight'?'Max Agirlik':'Toplam Tekrar',data:values,borderColor:'#e8ff47',backgroundColor:'rgba(232,255,71,.08)',borderWidth:2,pointBackgroundColor:'#e8ff47',pointRadius:4,tension:.3,fill:true}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#666',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#666',font:{size:10}}}}}
    })
    return () => exChartInst.current?.destroy()
  }, [selEx, metric, exArchive, exercises])

  useEffect(() => {
    if (!calChartRef.current) return
    const labels=[], values=[], goalLine=[]
    for (let i=range-1;i>=0;i--) {
      const d=new Date(); d.setDate(d.getDate()-i)
      const dk=d.toISOString().slice(0,10)
      labels.push(d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}))
      const fs=dk===todayKey()?foods:(calArch[dk]||[])
      values.push(Math.round(fs.reduce((s,f)=>s+(+f.kcal||0),0)))
      goalLine.push(goals.kcal)
    }
    if (calChartInst.current) calChartInst.current.destroy()
    calChartInst.current = new Chart(calChartRef.current, {
      type:'bar',
      data:{labels,datasets:[
        {label:'Kalori',data:values,backgroundColor:'rgba(232,255,71,.5)',borderColor:'#e8ff47',borderWidth:1,borderRadius:4},
        {label:'Hedef',data:goalLine,type:'line',borderColor:'rgba(255,71,71,.6)',borderWidth:1.5,borderDash:[4,4],pointRadius:0,fill:false},
      ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#666',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#666',font:{size:10}}}}}
    })
    return () => calChartInst.current?.destroy()
  }, [range, foods, calArch, goals])

  // ── AI İçgörü ──
  const getAiInsight = async () => {
    if (!goalData || !profile) return
    setAiLoading(true)
    const goalMap = { lose:'Kilo vermek', gain:'Kilo almak', cut:'Yağ yakmak', maintain:'Kiloyu korumak' }
    const prompt = `Sen bir kişisel antrenör ve yaşam koçusun. Kullanıcının verilerini analiz et ve "Nasıl Gidiyorum?" sorusuna samimi cevap ver.

Profil: ${profile.gender==='male'?'Erkek':'Kadın'}, ${profile.age||'?'} yaş, ${profile.weight||'?'}kg
Hedef: ${goalMap[profile.goal]||'Fitness'}
Güncel kilo: ${goalData.latestWeight}kg | Haftalık değişim: ${goalData.weeklyWeightChange}kg/hafta
Antrenman: ${goalData.weeklyFreq} gün/hafta (son 4 hafta) | Streak: ${streak} gün
Ortalama kalori: ${goalData.avgKcal} kcal/gün (hedef: ${goals.kcal})
Genel skor: ${goalData.overallScore}/100
${goalData.weeksToGoal ? `Hedefe tahmini süre: ${goalData.weeksToGoal} hafta` : ''}

Türkçe, samimi ve motive edici cevap ver. Şu başlıklar altında yaz:

🎯 GENEL DURUM (1-2 cümle, şu an nerede olduğunu açıkla)
✅ İYİ GİDEN ŞEYLER (2 madde, somut)  
⚠️ GELİŞTİRİLEBİLECEKLER (2 madde, somut)
🚀 BU HAFTA 1 SOMUT ADIM (tek ve uygulanabilir)
💬 KAPANIŞ MESAJI (kısa, güçlü, kişisel)

Eksiksiz yaz.`

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GKEY}`,
        { method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:.8,maxOutputTokens:2048,thinkingConfig:{thinkingBudget:0}}}) })
      const data = await res.json()
      setAiInsight(data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Analiz alınamadı.')
    } catch { setAiInsight('⚠️ Bağlantı hatası.') }
    setAiLoading(false)
  }

  const scoreColor = (s) => s>=80?'var(--green)':s>=60?'var(--accent)':s>=40?'#ff8c47':'var(--red)'
  const goalLabel  = { lose:'Kilo Verme', gain:'Kilo Alma', cut:'Yağ Yakma', maintain:'Kilo Koruma' }

  return (
    <div className="page">

      {/* Sekme seçici */}
      <div style={{ display:'flex', gap:4, background:'var(--surface2)', borderRadius:10, padding:3, marginBottom:24 }}>
        {[['progress','📊 GRAFIKLER'],['howami','🎯 NASIL GİDİYORUM?']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setActiveSection(id)} style={{
            flex:1, padding:'9px 4px', border:'none', cursor:'pointer',
            fontFamily:'Bebas Neue,sans-serif', fontSize:12, letterSpacing:1.5,
            background:activeSection===id?'var(--accent)':'transparent',
            color:activeSection===id?'#0a0a0a':'var(--text-muted)',
            borderRadius:6, transition:'all .15s',
          }}>{lbl}</button>
        ))}
      </div>

      {/* ════ GRAFİKLER ════ */}
      {activeSection === 'progress' && (
        <>
          <div className="section-title">EGZERSİZ İLERLEMESİ</div>
          <div className="card" style={{ padding:20, marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:2 }}>AGIRLIK / TEKRAR TAKİBİ</div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <select value={selEx} onChange={e=>setSelEx(e.target.value)} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontFamily:'DM Mono,monospace', fontSize:11, padding:'5px 10px', outline:'none' }}>
                  <option value="">Egzersiz Sec</option>
                  {allExNames().map(n=><option key={n} value={n}>{n}</option>)}
                </select>
                <div style={{ display:'flex', gap:4 }}>
                  {['weight','reps'].map(m=><button key={m} style={tabStyle(metric===m)} onClick={()=>setMetric(m)}>{m==='weight'?'Agirlik':'Tekrar'}</button>)}
                </div>
              </div>
            </div>
            <div style={{ position:'relative', height:200 }}>
              <canvas ref={exChartRef}/>
              {!selEx&&<div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontFamily:'DM Mono,monospace',fontSize:12 }}>Yukaridan egzersiz sec</div>}
            </div>
          </div>

          <div className="section-title">KALORİ TARİHCESİ</div>
          <div className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:2 }}>GUNLUK KALORİ</div>
              <div style={{ display:'flex', gap:4 }}>
                {[7,14,30].map(r=><button key={r} style={tabStyle(range===r)} onClick={()=>setRange(r)}>{r} Gun</button>)}
              </div>
            </div>
            <div style={{ position:'relative', height:200 }}><canvas ref={calChartRef}/></div>
          </div>
        </>
      )}

      {/* ════ NASIL GİDİYORUM? ════ */}
      {activeSection === 'howami' && (
        <>
          {!profile ? (
            <div className="card" style={{ padding:'32px 24px', textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>⚙️</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, marginBottom:8 }}>PROFİL GEREKLİ</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.7 }}>Ayarlar sayfasından profilini doldur.</div>
            </div>
          ) : (
            <>
              {/* Genel Skor */}
              {goalData && (
                <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'24px', marginBottom:20 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                    <div>
                      <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:3, color:'var(--text-muted)', marginBottom:6 }}>GENEL İLERLEME SKORU</div>
                      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:64, lineHeight:1, color:scoreColor(goalData.overallScore) }}>
                        {goalData.overallScore}
                        <span style={{ fontSize:20, color:'var(--text-muted)' }}>/100</span>
                      </div>
                      <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
                        {goalData.overallScore>=80?'🏆 Harika gidiyorsun!':goalData.overallScore>=60?'💪 İyi yoldasın, devam et':goalData.overallScore>=40?'⚡ Biraz daha gayret':'🌱 Yeni başlıyorsun, sabırlı ol'}
                      </div>
                    </div>
                    {/* Circular progress */}
                    <div style={{ position:'relative', width:90, height:90, flexShrink:0 }}>
                      <svg width="90" height="90" style={{ transform:'rotate(-90deg)' }}>
                        <circle cx="45" cy="45" r="38" fill="none" stroke="var(--border)" strokeWidth="6"/>
                        <circle cx="45" cy="45" r="38" fill="none" stroke={scoreColor(goalData.overallScore)} strokeWidth="6"
                          strokeDasharray={`${2*Math.PI*38}`}
                          strokeDashoffset={`${2*Math.PI*38*(1-goalData.overallScore/100)}`}
                          strokeLinecap="round" style={{ transition:'stroke-dashoffset 1s ease' }}/>
                      </svg>
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:20, color:scoreColor(goalData.overallScore) }}>
                        {goalData.overallScore}
                      </div>
                    </div>
                  </div>

                  {/* Alt skor kartları */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                    {[
                      { label:'ANTRENMAN', val:goalData.trainingScore, icon:'🏋️', unit:'puan' },
                      { label:'KALORİ', val:goalData.calorieScore, icon:'🍎', unit:'puan' },
                      { label:'STREAk', val:streak, icon:'🔥', unit:'gün', raw:true },
                    ].map(({label,val,icon,unit,raw})=>(
                      <div key={label} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px', textAlign:'center' }}>
                        <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
                        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, lineHeight:1, color:raw?'#ff8c47':scoreColor(val) }}>{val}</div>
                        <div style={{ fontFamily:'DM Mono,monospace', fontSize:8, color:'var(--text-muted)', letterSpacing:1, marginTop:2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hedef ilerleme */}
              {goalData && (
                <div className="card" style={{ padding:'18px 20px', marginBottom:16 }}>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:3, color:'var(--text-muted)', marginBottom:14 }}>
                    {(goalLabel[profile.goal]||'HEDEF').toUpperCase()} HEDEFİNE İLERLEME
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)' }}>
                      Başlangıç: <b style={{ color:'var(--text)' }}>{profile.weight}kg</b>
                    </div>
                    <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)' }}>
                      Güncel: <b style={{ color:'var(--accent)' }}>{goalData.latestWeight}kg</b>
                    </div>
                  </div>
                  <div style={{ background:'var(--surface2)', borderRadius:20, height:12, overflow:'hidden', marginBottom:8 }}>
                    <div style={{ height:'100%', borderRadius:20, width:`${goalData.progressPct}%`, background:'linear-gradient(90deg,var(--accent),#47ff8a)', transition:'width 1s ease' }}/>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, color:'var(--accent)', letterSpacing:1 }}>
                      %{goalData.progressPct} TAMAMLANDI
                    </div>
                    {goalData.weeksToGoal && (
                      <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:20, padding:'3px 10px' }}>
                        ~{goalData.weeksToGoal} hafta kaldı
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Son 4 hafta istatistik */}
              {goalData && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:20 }}>
                  {[
                    { label:'Haftalık Ant.', val:`${goalData.weeklyFreq} gün`, color:'var(--accent)', icon:'📅' },
                    { label:'Ort. Kalori', val:`${goalData.avgKcal} kcal`, color:'#47ff8a', icon:'🍽️' },
                    { label:'Haftalık Kilo', val:`${goalData.weeklyWeightChange>0?'+':''}${goalData.weeklyWeightChange} kg`, color: goalData.weeklyWeightChange<0&&profile.goal==='lose'?'var(--green)':goalData.weeklyWeightChange>0&&profile.goal==='gain'?'var(--green)':'#ff8c47', icon:'⚖️' },
                    { label:'28 Gün Ant.', val:`${goalData.trainDaysCount} gün`, color:'#47c8ff', icon:'🏋️' },
                  ].map(({label,val,color,icon})=>(
                    <div key={label} className="card" style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <span style={{ fontSize:16 }}>{icon}</span>
                        <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:2, color:'var(--text-muted)' }}>{label}</div>
                      </div>
                      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, color }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI İçgörü butonu */}
              <button onClick={getAiInsight} disabled={aiLoading} style={{
                width:'100%', padding:'14px 20px', marginBottom:16,
                background:aiLoading?'var(--surface2)':'linear-gradient(135deg,rgba(232,255,71,.1),rgba(71,200,255,.07))',
                border:`1px solid ${aiLoading?'var(--border)':'rgba(232,255,71,.3)'}`,
                borderRadius:12, cursor:aiLoading?'not-allowed':'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all .2s',
              }}>
                {aiLoading
                  ?<><span className="spinner" style={{width:16,height:16}}/><span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:14,letterSpacing:2,color:'var(--text-muted)'}}>ANALİZ EDİYOR...</span></>
                  :<><span style={{fontSize:18}}>🤖</span><span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:14,letterSpacing:2,color:'var(--accent)'}}>AI İLE DERİN ANALİZ YAP</span></>
                }
              </button>

              {aiInsight && (
                <div className="animate-fade card" style={{ padding:'18px 20px', marginBottom:20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                    <div style={{ width:28,height:28,borderRadius:7,background:'rgba(232,255,71,.1)',border:'1px solid rgba(232,255,71,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>🤖</div>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:2, color:'var(--accent)' }}>NASIL GİDİYORUM? — AI ANALİZİ</div>
                  </div>
                  <div style={{ fontSize:13, lineHeight:1.9, color:'var(--text-dim)', fontFamily:'DM Sans,sans-serif', whiteSpace:'pre-wrap' }}>{aiInsight}</div>
                </div>
              )}

              {/* Bildirim izni */}
              {notifPermission !== 'granted' && (
                <div style={{ background:'rgba(71,200,255,.05)', border:'1px solid rgba(71,200,255,.15)', borderRadius:12, padding:'16px 18px' }}>
                  <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:2, color:'#47c8ff', marginBottom:8 }}>📲 BİLDİRİMLERİ AÇ</div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.7, marginBottom:12 }}>
                    Streak milestoneleri, antrenman hatırlatmaları ve haftalık özet bildirimleri al.
                  </div>
                  <button onClick={requestNotifPermission} className="btn btn-ghost" style={{ borderColor:'rgba(71,200,255,.3)', color:'#47c8ff', fontSize:12 }}>
                    📲 Bildirimlere İzin Ver
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export function BodyPage() {
  return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-icon">⚖️</div>
        <div className="empty-title">ÖLÇÜLER TAŞINDI</div>
        <div className="empty-sub">Vücut ölçümleri artık Ayarlar menüsü altında.</div>
      </div>
    </div>
  )
}
