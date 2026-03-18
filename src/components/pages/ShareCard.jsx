import { useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'

function getWeekDates() {
  const now = new Date(), day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day - 1)); monday.setHours(0,0,0,0)
  return Array.from({length:7}, (_,i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0,10)
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y)
  ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r)
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h)
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r)
  ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath()
}

export default function ShareCard() {
  const { exercises, exArchive, todayKey, streak, foods, calArch } = useApp()
  const canvasRef = useRef(null)
  const [exporting, setExporting] = useState(false)
  const [preview,   setPreview]   = useState(null)
  const [mode,      setMode]      = useState('week')

  const dates = getWeekDates()
  const today = todayKey()

  const weekStats = dates.reduce((acc, dk) => {
    const exs = dk === today ? exercises : (exArchive[dk] || [])
    const fs  = dk === today ? foods     : (calArch[dk]  || [])
    if (exs.length > 0) {
      acc.trainDays++
      acc.totalSets += exs.reduce((s,e) => s + e.sets.length, 0)
      exs.forEach(ex => ex.sets.forEach(s => { if (+s.weight > acc.maxWeight) acc.maxWeight = +s.weight }))
    }
    if (fs.length > 0) acc.totalKcal += Math.round(fs.reduce((s,f) => s + (+f.kcal||0), 0))
    return acc
  }, { trainDays:0, totalSets:0, maxWeight:0, totalKcal:0 })

  const todaySets = exercises.reduce((s,e) => s + e.sets.length, 0)
  const todayMax  = exercises.reduce((m,e) => Math.max(m, e.sets.reduce((mm,st)=>Math.max(mm,+st.weight),0)), 0)
  const DAY_NAMES = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']

  const generateCanvas = async () => {
    setExporting(true)
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const W = 900, H = 480
    canvas.width = W; canvas.height = H

    // BG
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0,0,W,H)
    for (let i=0; i<3000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random()*.012})`
      ctx.fillRect(Math.random()*W, Math.random()*H, 1, 1)
    }
    const g = ctx.createRadialGradient(0,0,0,0,0,500)
    g.addColorStop(0,'rgba(232,255,71,.07)'); g.addColorStop(1,'rgba(232,255,71,0)')
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H)
    ctx.strokeStyle='rgba(232,255,71,.18)'; ctx.lineWidth=1.5; ctx.strokeRect(1,1,W-2,H-2)

    // Logo
    ctx.font='bold 24px "Courier New",monospace'
    ctx.fillStyle='#e8ff47'; ctx.fillText('KERO',40,55)
    ctx.fillStyle='#444';    ctx.fillText('GYM', 40+ctx.measureText('KERO').width, 55)
    ctx.font='11px "Courier New",monospace'; ctx.fillStyle='#333'
    ctx.fillText(mode==='week'?'HAFTALIK ANTRENMAN':'BUGÜNKÜ ANTRENMAN', 40, 73)

    if (mode === 'week') {
      // 4 stat kutusu
      const stats = [
        { label:'ANTRENMAN',  val:String(weekStats.trainDays), unit:'/7 GÜN', color:'#e8ff47' },
        { label:'TOPLAM SET', val:String(weekStats.totalSets), unit:'SET',    color:'#47c8ff' },
        { label:'MAX AĞIRLIK',val:String(weekStats.maxWeight), unit:'KG',     color:'#47ff8a' },
        { label:'TOPLAM KAL', val:String(weekStats.totalKcal), unit:'KCAL',   color:'#ff8c47' },
      ]
      stats.forEach(({label,val,unit,color},i) => {
        const x=40+i*205, y=92
        ctx.fillStyle='rgba(255,255,255,.04)'; roundRect(ctx,x,y,190,94,8); ctx.fill()
        ctx.strokeStyle='rgba(255,255,255,.07)'; ctx.lineWidth=.5; roundRect(ctx,x,y,190,94,8); ctx.stroke()
        ctx.font='9px "Courier New",monospace'; ctx.fillStyle='#555'; ctx.fillText(label,x+12,y+20)
        ctx.font='bold 36px "Courier New",monospace'; ctx.fillStyle=color; ctx.fillText(val,x+12,y+64)
        ctx.font='10px "Courier New",monospace'; ctx.fillStyle='#444'; ctx.fillText(unit,x+12,y+82)
      })

      // 7 gün
      ctx.font='9px "Courier New",monospace'; ctx.fillStyle='#2a2a2a'; ctx.fillText('GÜN GÖSTERGESİ',40,218)
      dates.forEach((dk,i) => {
        const exs = dk===today ? exercises : (exArchive[dk]||[])
        const has = exs.length > 0
        const x=40+i*117, y=228
        ctx.fillStyle=has?'rgba(232,255,71,.12)':'rgba(255,255,255,.03)'
        roundRect(ctx,x,y,107,60,6); ctx.fill()
        ctx.strokeStyle=has?'rgba(232,255,71,.4)':'rgba(255,255,255,.06)'
        ctx.lineWidth=has?1:.5; roundRect(ctx,x,y,107,60,6); ctx.stroke()
        const di=new Date(dk+'T00:00:00').getDay()
        ctx.font='8px "Courier New",monospace'; ctx.fillStyle=has?'#e8ff47':'#2a2a2a'
        ctx.textAlign='center'; ctx.fillText(DAY_NAMES[di===0?6:di-1].toUpperCase(),x+53,y+15)
        ctx.font=has?'20px serif':'14px serif'; ctx.fillText(has?'💪':'○',x+53,y+40)
        if (has) {
          const sets=exs.reduce((s,e)=>s+e.sets.length,0)
          ctx.font='7px "Courier New",monospace'; ctx.fillStyle='#555'
          ctx.fillText(`${sets} set`,x+53,y+57)
        }
        ctx.textAlign='left'
      })

      if (streak>0) {
        ctx.font='bold 13px "Courier New",monospace'; ctx.fillStyle='#ff8c47'
        ctx.fillText(`🔥 ${streak} GÜNLÜK SERİ`,40,320)
      }

    } else {
      // Bugün
      if (exercises.length === 0) {
        ctx.font='16px "Courier New",monospace'; ctx.fillStyle='#333'
        ctx.textAlign='center'; ctx.fillText('Bugün antrenman yok',W/2,H/2); ctx.textAlign='left'
      } else {
        [
          {label:'EGZERSİZ',val:exercises.length,unit:'ADET',color:'#e8ff47'},
          {label:'SET',val:todaySets,unit:'SET',color:'#47c8ff'},
          {label:'MAX KG',val:todayMax,unit:'KG',color:'#47ff8a'},
        ].forEach(({label,val,unit,color},i) => {
          const x=40+i*280,y=92
          ctx.fillStyle='rgba(255,255,255,.04)'; roundRect(ctx,x,y,260,90,8); ctx.fill()
          ctx.strokeStyle='rgba(255,255,255,.07)'; ctx.lineWidth=.5; roundRect(ctx,x,y,260,90,8); ctx.stroke()
          ctx.font='9px "Courier New",monospace'; ctx.fillStyle='#555'; ctx.fillText(label,x+12,y+20)
          ctx.font=`bold 38px "Courier New",monospace`; ctx.fillStyle=color; ctx.fillText(val,x+12,y+64)
          ctx.font='10px "Courier New",monospace'; ctx.fillStyle='#444'; ctx.fillText(unit,x+12,y+82)
        })
        ctx.font='9px "Courier New",monospace'; ctx.fillStyle='#333'; ctx.fillText('EGZERSİZLER',40,218)
        exercises.slice(0,8).forEach((ex,i) => {
          const col=i<4?0:1, row=i%4, x=40+col*435, y=232+row*48
          const maxW=Math.max(...ex.sets.map(s=>+s.weight),0)
          ctx.fillStyle='rgba(255,255,255,.03)'; roundRect(ctx,x,y,405,40,6); ctx.fill()
          ctx.font='bold 13px "Courier New",monospace'; ctx.fillStyle='#ccc'
          ctx.fillText(ex.name.substring(0,24),x+10,y+24)
          ctx.font='11px "Courier New",monospace'; ctx.fillStyle='#e8ff47'
          const info=`${ex.sets.length} set${maxW>0?` · max ${maxW}kg`:''}`
          ctx.fillText(info,x+405-ctx.measureText(info).width-10,y+24)
        })
      }
    }

    // Footer
    ctx.font='10px "Courier New",monospace'; ctx.fillStyle='#1c1c1c'
    ctx.fillText(`kerogym.app  ·  ${new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})}`,40,H-18)

    setPreview(canvas.toDataURL('image/png'))
    setExporting(false)
  }

  const download = () => {
    if (!preview) return
    const a=document.createElement('a')
    a.href=preview; a.download=`kerogym-${mode==='week'?'haftalik':'bugun'}-${today}.png`; a.click()
  }

  const share = async () => {
    if (!preview||!navigator.share) { download(); return }
    try {
      const blob=await(await fetch(preview)).blob()
      const file=new File([blob],'kerogym-antrenman.png',{type:'image/png'})
      await navigator.share({files:[file],title:'KeroGym Antrenman',text:`${streak>0?`🔥 ${streak} günlük seri!`:'Antrenman tamamlandı!'} #KeroGym`})
    } catch { download() }
  }

  return (
    <div className="page animate-fade" style={{ maxWidth:560 }}>

      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:26, letterSpacing:4, color:'var(--accent)', marginBottom:4 }}>
        PAYLAŞIM KARTI
      </div>
      <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', marginBottom:24 }}>
        Antrenmanını sosyal medyada paylaş
      </div>

      {/* Mod seçimi */}
      <div style={{ display:'flex', gap:6, marginBottom:20, background:'var(--surface2)', borderRadius:10, padding:4 }}>
        {[['week','📅 HAFTALIK'],['today','💪 BUGÜN']].map(([m,lbl]) => (
          <button key={m} onClick={() => { setMode(m); setPreview(null) }} style={{
            flex:1, padding:'9px 8px', borderRadius:7, border:'none',
            background: mode===m ? 'var(--accent)' : 'transparent',
            color: mode===m ? '#0a0a0a' : 'var(--text-muted)',
            fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:2,
            cursor:'pointer', transition:'all .15s',
          }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Gizli canvas */}
      <canvas ref={canvasRef} style={{ display:'none' }}/>

      {/* Preview veya oluştur butonu */}
      {preview ? (
        <div className="animate-fade">
          <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', marginBottom:16 }}>
            <img src={preview} alt="Paylaşım kartı" style={{ width:'100%', display:'block' }}/>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={share} className="btn btn-primary" style={{ flex:2, justifyContent:'center', padding:'12px 0', fontSize:13 }}>
              {navigator.share ? '📤 Paylaş' : '⬇ İndir'}
            </button>
            <button onClick={() => setPreview(null)} className="btn btn-ghost" style={{ flex:1, justifyContent:'center', padding:'12px 0', fontSize:12 }}>
              ↺ Tekrar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={generateCanvas} disabled={exporting} className="btn btn-primary"
          style={{ width:'100%', padding:'14px 0', fontSize:14, letterSpacing:2, fontFamily:'Bebas Neue,sans-serif', justifyContent:'center', opacity:exporting?.6:1 }}>
          {exporting
            ? <><span className="spinner" style={{width:16,height:16,borderTopColor:'#0a0a0a',marginRight:10,flexShrink:0}}/>OLUŞTURULUYOR...</>
            : '🎨  KART OLUŞTUR'
          }
        </button>
      )}

      {/* İstatistik özeti */}
      <div style={{ marginTop:28 }}>
        <div className="section-title">{mode==='week'?'BU HAFTA':'BUGÜN'}</div>
        {mode === 'week' ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              {label:'Antrenman',  val:`${weekStats.trainDays} gün`,    color:'var(--accent)'},
              {label:'Toplam Set', val:`${weekStats.totalSets} set`,    color:'#47c8ff'},
              {label:'Max Ağırlık',val:`${weekStats.maxWeight} kg`,     color:'#47ff8a'},
              {label:'Streak',     val:`${streak} gün 🔥`,              color:'#ff8c47'},
            ].map(({label,val,color}) => (
              <div key={label} className="card" style={{ padding:'14px 16px' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', letterSpacing:2, marginBottom:5 }}>{label}</div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, color }}>{val}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {[
              {label:'Egzersiz',   val:exercises.length, unit:'adet', color:'var(--accent)'},
              {label:'Toplam Set', val:todaySets,        unit:'set',  color:'#47c8ff'},
              {label:'Max Ağırlık',val:todayMax,         unit:'kg',   color:'#47ff8a'},
            ].map(({label,val,unit,color}) => (
              <div key={label} className="card" style={{ padding:'14px 12px', textAlign:'center' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', letterSpacing:2, marginBottom:5 }}>{label}</div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:24, color, lineHeight:1 }}>{val}</div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', marginTop:4 }}>{unit}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
