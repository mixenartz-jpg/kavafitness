import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const GKEY = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'

function getWeekRange(weeksAgo = 0) {
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day - 1) - weeksAgo * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { monday, sunday }
}

function getWeekDates(weeksAgo = 0) {
  const { monday } = getWeekRange(weeksAgo)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export default function WeeklySummaryPage() {
  const { exercises, exArchive, foods, calArch, body, goals, todayKey, profile } = useApp()

  const [aiReport, setAiReport]           = useState(null)
  const [aiLoading, setAiLoading]         = useState(false)
  const [reportExpanded, setReportExpanded] = useState(false)

  const getWeekStats = (weeksAgo) => {
    const dates = getWeekDates(weeksAgo)
    const today = todayKey()
    let totalSets = 0, totalExercises = 0, trainDays = 0
    let maxWeight = 0, totalCalories = 0, calDays = 0
    dates.forEach(dk => {
      const exs = dk === today ? exercises : (exArchive[dk] || [])
      if (exs.length > 0) {
        trainDays++
        totalExercises += exs.length
        exs.forEach(ex => {
          totalSets += ex.sets.length
          ex.sets.forEach(s => { if (+s.weight > maxWeight) maxWeight = +s.weight })
        })
      }
      const fs = dk === today ? foods : (calArch[dk] || [])
      if (fs.length > 0) {
        calDays++
        totalCalories += fs.reduce((sum, f) => sum + (+f.kcal || 0), 0)
      }
    })
    const bodyEntries = body
      .filter(b => dates.includes(b.date))
      .sort((a, b) => b.date.localeCompare(a.date))
    return {
      trainDays, totalExercises, totalSets, maxWeight,
      totalCalories: Math.round(totalCalories),
      avgCalories: calDays > 0 ? Math.round(totalCalories / calDays) : 0,
      calDays, latestBody: bodyEntries[0] || null, dates,
    }
  }

  const thisWeek = getWeekStats(0)
  const lastWeek = getWeekStats(1)

  const generateAiReport = async () => {
    setAiLoading(true)
    setAiReport(null)
    setReportExpanded(true)
    const goalMap = { lose:'Kilo vermek', gain:'Kilo almak', cut:'Yağ yakmak', maintain:'Kiloyu korumak' }
    const profileInfo = profile
      ? `${profile.gender === 'male' ? 'Erkek' : 'Kadın'}, ${profile.age || '?'} yaş, ${profile.weight || '?'} kg. Hedef: ${goalMap[profile.goal] || 'Genel fitness'}.`
      : 'Profil bilgisi yok.'
    const prompt = `Sen bir kişisel fitness ve beslenme koçusun. Haftalık verileri analiz et.

${profileInfo}

BU HAFTA:
- Antrenman: ${thisWeek.trainDays}/7 gün, ${thisWeek.totalExercises} egzersiz, ${thisWeek.totalSets} set, max ${thisWeek.maxWeight}kg
- Kalori: ort. ${thisWeek.avgCalories} kcal/gün (hedef: ${goals.kcal} kcal), ${thisWeek.calDays}/7 gün takip
${thisWeek.latestBody?.weight ? `- Kilo: ${thisWeek.latestBody.weight} kg` : ''}

GEÇEN HAFTA: ${lastWeek.trainDays} antrenman, ${lastWeek.totalSets} set, ort. ${lastWeek.avgCalories} kcal

Aşağıdaki başlıklar altında Türkçe, samimi rapor yaz:
1. 💪 ANTRENMAN DEĞERLENDİRMESİ (2-3 cümle)
2. 🍎 BESLENME DEĞERLENDİRMESİ (2-3 cümle)
3. 📈 GENEL İLERLEME (1-2 cümle)
4. 🎯 ÖNÜMÜZDEKI HAFTA 3 ÖNERI (madde madde)
5. 💬 MOTİVASYON MESAJI (1 güçlü cümle)

Eksiksiz yaz.`
    const W_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]
    let report = null
    for (const model of W_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GKEY}`,
          { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:.8,maxOutputTokens:2048} }) }
        )
        if (!res.ok) continue
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) { report = text; break }
      } catch { continue }
    }
    setAiReport(report || '⚠️ Rapor alınamadı, tekrar dene.')
    setAiLoading(false)
  }

  const diff = (cur, prev, higherIsBetter = true) => {
    if (!prev && prev !== 0) return null
    const d = cur - prev
    if (d === 0) return { label:'=', cls:'same' }
    return { label:`${d>0?'+':''}${d}`, cls: (higherIsBetter ? d>0 : d<0) ? 'up' : 'down' }
  }

  const StatCard = ({ label, value, unit, prev, higherIsBetter=true, color }) => {
    const d = diff(value, prev, higherIsBetter)
    return (
      <div className="card" style={{ padding:'16px 18px' }}>
        <div style={{ fontFamily:'Space Mono,monospace',fontSize:9,letterSpacing:2,color:'var(--text-muted)',marginBottom:8,textTransform:'uppercase' }}>{label}</div>
        <div style={{ display:'flex',alignItems:'flex-end',gap:6 }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:32,lineHeight:1,color:color||'var(--text)' }}>{value}</div>
          <div style={{ fontFamily:'Space Mono,monospace',fontSize:11,color:'var(--text-muted)',marginBottom:4 }}>{unit}</div>
          {d && <span className={`delta delta-${d.cls}`} style={{ marginBottom:4,fontSize:10 }}>{d.label}</span>}
        </div>
        {prev !== undefined && prev !== null && (
          <div style={{ fontFamily:'Space Mono,monospace',fontSize:9,color:'var(--text-muted)',marginTop:4 }}>geçen hafta: {prev} {unit}</div>
        )}
      </div>
    )
  }

  const { monday, sunday } = getWeekRange(0)
  const fmt = d => d.toLocaleDateString('tr-TR', { day:'numeric', month:'short' })

  return (
    <div className="page animate-fade" style={{ maxWidth:700 }}>

      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:8 }}>
        <div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:28,letterSpacing:3,color:'var(--accent)' }}>HAFTALIK ÖZET</div>
          <div style={{ fontFamily:'Space Mono,monospace',fontSize:10,color:'var(--text-muted)',marginTop:2 }}>{fmt(monday)} – {fmt(sunday)}</div>
        </div>
        <div style={{ fontFamily:'Space Mono,monospace',fontSize:10,color:'var(--text-muted)',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,padding:'6px 12px' }}>Her Pazartesi sıfırlanır</div>
      </div>

      {/* ── AI RAPOR ── */}
      <div style={{ marginBottom:24 }}>
        <button onClick={generateAiReport} disabled={aiLoading} style={{
          width:'100%', padding:'14px 20px',
          background: aiLoading?'var(--surface2)':'linear-gradient(135deg,rgba(232,255,71,.1),rgba(71,200,255,.07))',
          border:`1px solid ${aiLoading?'var(--border)':'rgba(232,255,71,.3)'}`,
          borderRadius:12, cursor:aiLoading?'not-allowed':'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',gap:10, transition:'all .2s',
        }}
          onMouseEnter={e=>{ if(!aiLoading) e.currentTarget.style.borderColor='rgba(232,255,71,.6)' }}
          onMouseLeave={e=>{ if(!aiLoading) e.currentTarget.style.borderColor='rgba(232,255,71,.3)' }}
        >
          {aiLoading
            ? <><span className="spinner" style={{width:16,height:16}}/><span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:14,letterSpacing:2,color:'var(--text-muted)'}}>ANALİZ EDİYOR...</span></>
            : <><span style={{fontSize:18}}>🤖</span><span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:14,letterSpacing:2,color:'var(--accent)'}}>AI HAFTALIK RAPOR OLUŞTUR</span><span style={{fontFamily:'Space Mono,monospace',fontSize:10,color:'var(--text-muted)'}}>— analiz, öneri, motivasyon</span></>
          }
        </button>

        {(aiReport || aiLoading) && (
          <div className="animate-fade" style={{ marginTop:12,background:'rgba(232,255,71,.03)',border:'1px solid rgba(232,255,71,.15)',borderRadius:12,overflow:'hidden' }}>
            <div onClick={()=>setReportExpanded(v=>!v)} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',cursor:'pointer', borderBottom:reportExpanded?'1px solid rgba(232,255,71,.1)':'none' }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <div style={{ width:24,height:24,borderRadius:6,background:'rgba(232,255,71,.12)',border:'1px solid rgba(232,255,71,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12 }}>🤖</div>
                <span style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:13,letterSpacing:2,color:'var(--accent)' }}>AI HAFTALIK ANALİZ</span>
              </div>
              <span style={{ color:'var(--text-muted)',fontSize:14,transition:'transform .2s',transform:reportExpanded?'rotate(180deg)':'' }}>⌄</span>
            </div>
            {reportExpanded && (
              <div style={{ padding:'16px 18px' }}>
                {aiLoading
                  ? <div style={{ display:'flex',alignItems:'center',gap:10,color:'var(--text-muted)',fontFamily:'Space Mono,monospace',fontSize:12 }}><span className="spinner"/>Yapay zeka analiz ediyor...</div>
                  : <div style={{ fontSize:13,lineHeight:1.9,color:'var(--text-dim)',fontFamily:'Inter,sans-serif',whiteSpace:'pre-wrap' }}>{aiReport}</div>
                }
              </div>
            )}
          </div>
        )}
      </div>

      <div className="section-title">ANTRENMAN</div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:24 }}>
        <StatCard label="Antrenman Günü" value={thisWeek.trainDays} unit="gün" prev={lastWeek.trainDays} color="var(--accent)"/>
        <StatCard label="Toplam Egzersiz" value={thisWeek.totalExercises} unit="adet" prev={lastWeek.totalExercises}/>
        <StatCard label="Toplam Set" value={thisWeek.totalSets} unit="set" prev={lastWeek.totalSets}/>
        <StatCard label="Max Ağırlık" value={thisWeek.maxWeight} unit="kg" prev={lastWeek.maxWeight}/>
      </div>

      <div className="card" style={{ padding:'16px 18px',marginBottom:24 }}>
        <div style={{ fontFamily:'Space Mono,monospace',fontSize:9,letterSpacing:2,color:'var(--text-muted)',marginBottom:12,textTransform:'uppercase' }}>Bu Haftanın Günleri</div>
        <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
          {thisWeek.dates.map(dk => {
            const today = todayKey()
            const exs = dk === today ? exercises : (exArchive[dk] || [])
            const hasData = exs.length > 0
            const d = new Date(dk+'T00:00:00')
            const dayName = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'][d.getDay()===0?6:d.getDay()-1]
            const isFuture = dk > today
            return (
              <div key={dk} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 10px',borderRadius:10,minWidth:44, background:hasData?'rgba(232,255,71,.08)':isFuture?'transparent':'var(--surface2)', border:`1px solid ${hasData?'rgba(232,255,71,.25)':'var(--border)'}` }}>
                <div style={{ fontFamily:'Space Mono,monospace',fontSize:9,color:hasData?'var(--accent)':'var(--text-muted)' }}>{dayName}</div>
                <div style={{ fontSize:hasData?16:14 }}>{hasData?'💪':isFuture?'⬜':'😴'}</div>
                <div style={{ fontFamily:'Space Mono,monospace',fontSize:9,color:'var(--text-muted)' }}>{exs.length>0?`${exs.length} ex`:'—'}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="section-title">KALORİ & BESLENME</div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:24 }}>
        <StatCard label="Toplam Kalori" value={thisWeek.totalCalories} unit="kcal" prev={lastWeek.totalCalories} color="var(--green)"/>
        <StatCard label="Günlük Ortalama" value={thisWeek.avgCalories} unit="kcal/gün" prev={lastWeek.avgCalories}/>
        <StatCard label="Takip Edilen Gün" value={thisWeek.calDays} unit="gün" prev={lastWeek.calDays}/>
        <div className="card" style={{ padding:'16px 18px' }}>
          <div style={{ fontFamily:'Space Mono,monospace',fontSize:9,letterSpacing:2,color:'var(--text-muted)',marginBottom:8,textTransform:'uppercase' }}>Hedefe Göre</div>
          {goals.kcal>0 && thisWeek.avgCalories>0
            ? <><div style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:32,lineHeight:1,color:thisWeek.avgCalories>goals.kcal?'var(--red)':'var(--accent)' }}>{thisWeek.avgCalories>goals.kcal?'+':''}{thisWeek.avgCalories-goals.kcal}</div>
               <div style={{ fontFamily:'Space Mono,monospace',fontSize:9,color:'var(--text-muted)',marginTop:4 }}>hedef: {goals.kcal} kcal/gün</div></>
            : <div style={{ fontFamily:'Space Mono,monospace',fontSize:10,color:'var(--text-muted)' }}>Veri yok</div>
          }
        </div>
      </div>

      <div className="section-title">VÜCUT ÖLÇÜLERİ</div>
      {thisWeek.latestBody || lastWeek.latestBody ? (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:24 }}>
          {[{key:'weight',label:'Kilo',unit:'kg',higherIsBetter:false},{key:'waist',label:'Bel',unit:'cm',higherIsBetter:false},{key:'chest',label:'Göğüs',unit:'cm',higherIsBetter:true},{key:'hip',label:'Kalça',unit:'cm',higherIsBetter:false}].map(({key,label,unit,higherIsBetter})=>(
            <StatCard key={key} label={label} value={thisWeek.latestBody?.[key]??'—'} unit={unit} prev={lastWeek.latestBody?.[key]} higherIsBetter={higherIsBetter} color="var(--blue)"/>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding:'32px 24px' }}>
          <div className="empty-icon">⚖️</div>
          <div className="empty-title">ÖLÇÜM YOK</div>
          <div className="empty-sub">Bu hafta vücut ölçümü girilmemiş.</div>
        </div>
      )}

      <div className="section-title">GEÇEN HAFTAYA GÖRE</div>
      <div className="card" style={{ padding:'18px 20px' }}>
        {[
          {icon:'🏋️',label:'Antrenman',cur:thisWeek.trainDays,prev:lastWeek.trainDays,unit:'gün',better:thisWeek.trainDays>=lastWeek.trainDays},
          {icon:'🔥',label:'Toplam Set',cur:thisWeek.totalSets,prev:lastWeek.totalSets,unit:'set',better:thisWeek.totalSets>=lastWeek.totalSets},
          {icon:'🍎',label:'Ort. Kalori',cur:thisWeek.avgCalories,prev:lastWeek.avgCalories,unit:'kcal',better:Math.abs(thisWeek.avgCalories-goals.kcal)<=Math.abs(lastWeek.avgCalories-goals.kcal)},
        ].map(({icon,label,cur,prev,unit,better})=>{
          const d=cur-prev
          return (
            <div key={label} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.04)' }}>
              <span style={{ fontSize:20,width:28,textAlign:'center' }}>{icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:14,letterSpacing:1 }}>{label}</div>
                <div style={{ fontFamily:'Space Mono,monospace',fontSize:10,color:'var(--text-muted)' }}>{prev} → {cur} {unit}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <span className={`delta delta-${d>0?'up':d<0?'down':'same'}`}>{d>0?'+':''}{d} {unit}</span>
                <div style={{ fontSize:16,marginTop:2 }}>{better?'✅':d===0?'➡️':'⚠️'}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
