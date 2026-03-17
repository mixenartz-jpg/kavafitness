import { useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'

function getWeekDates() {
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day - 1))
  monday.setHours(0,0,0,0)
  return Array.from({length:7}, (_,i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0,10)
  })
}

export default function ShareCard() {
  const { exercises, exArchive, todayKey, profile, streak, goals, foods, calArch } = useApp()
  const canvasRef = useRef(null)
  const [exporting, setExporting] = useState(false)
  const [preview, setPreview]     = useState(null)
  const [shareMode, setShareMode] = useState('week') // 'week' | 'today'

  const dates   = getWeekDates()
  const today   = todayKey()

  // Haftalık stats
  const weekStats = dates.reduce((acc, dk) => {
    const exs = dk === today ? exercises : (exArchive[dk] || [])
    const fs  = dk === today ? foods     : (calArch[dk]  || [])
    if (exs.length > 0) {
      acc.trainDays++
      acc.totalSets += exs.reduce((s,e) => s+e.sets.length, 0)
      acc.totalExs  += exs.length
      exs.forEach(ex => ex.sets.forEach(s => { if (+s.weight > acc.maxWeight) acc.maxWeight = +s.weight }))
    }
    if (fs.length > 0) acc.totalKcal += Math.round(fs.reduce((s,f) => s+(+f.kcal||0), 0))
    return acc
  }, { trainDays:0, totalSets:0, totalExs:0, maxWeight:0, totalKcal:0 })

  // Bugün stats
  const todayExs  = exercises
  const todaySets = todayExs.reduce((s,e) => s+e.sets.length, 0)
  const todayMax  = todayExs.reduce((m,e) => Math.max(m, e.sets.reduce((mm,st)=>Math.max(mm,+st.weight),0)), 0)

  const DAY_NAMES = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']

  const generateCanvas = async () => {
    setExporting(true)
    const canvas  = canvasRef.current
    const ctx     = canvas.getContext('2d')
    const W = 800, H = 480
    canvas.width  = W
    canvas.height = H

    // Arka plan
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)

    // Noise texture (subtle)
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * W
      const y = Math.random() * H
      ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.015})`
      ctx.fillRect(x, y, 1, 1)
    }

    // Accent gradient top-left corner
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 400)
    grad.addColorStop(0, 'rgba(232,255,71,0.08)')
    grad.addColorStop(1, 'rgba(232,255,71,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Border
    ctx.strokeStyle = 'rgba(232,255,71,0.2)'
    ctx.lineWidth   = 1.5
    ctx.strokeRect(1, 1, W-2, H-2)

    // Logo text
    ctx.font = 'bold 22px "Courier New", monospace'
    ctx.fillStyle = '#e8ff47'
    ctx.fillText('KERO', 36, 52)
    ctx.fillStyle = '#555'
    ctx.fillText('GYM', 36 + ctx.measureText('KERO').width, 52)

    // Mode label
    ctx.font = '11px "Courier New", monospace'
    ctx.fillStyle = '#444'
    ctx.fillText(shareMode === 'week' ? 'HAFTALIK ANTRENMAN' : 'BUGÜNKÜ ANTRENMAN', 36, 72)

    if (shareMode === 'week') {
      // ── HAFTALIK KART ──

      // Büyük stats
      const stats = [
        { label:'ANTRENMAN', val: weekStats.trainDays, unit:'/7 GÜN', color:'#e8ff47' },
        { label:'TOPLAM SET',val: weekStats.totalSets,  unit:'SET',    color:'#47c8ff' },
        { label:'MAX AĞIRLIK',val:weekStats.maxWeight,  unit:'KG',     color:'#47ff8a' },
        { label:'TOPLAM KAL', val:weekStats.totalKcal,  unit:'KCAL',   color:'#ff8c47' },
      ]

      stats.forEach(({ label, val, unit, color }, i) => {
        const x = 36 + i * 185
        const y = 110

        ctx.fillStyle = 'rgba(255,255,255,0.04)'
        roundRect(ctx, x, y, 165, 90, 8)
        ctx.fill()

        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 0.5
        roundRect(ctx, x, y, 165, 90, 8)
        ctx.stroke()

        ctx.font = '9px "Courier New", monospace'
        ctx.fillStyle = '#555'
        ctx.fillText(label, x + 12, y + 22)

        ctx.font = `bold 36px "Courier New", monospace`
        ctx.fillStyle = color
        ctx.fillText(val, x + 12, y + 62)

        ctx.font = '10px "Courier New", monospace'
        ctx.fillStyle = '#444'
        ctx.fillText(unit, x + 12, y + 80)
      })

      // Gün göstergesi
      const dayY = 240
      ctx.font = '9px "Courier New", monospace'
      ctx.fillStyle = '#333'
      ctx.fillText('GÜN GÖSTERGESİ', 36, dayY + 2)

      dates.forEach((dk, i) => {
        const exs    = dk === today ? exercises : (exArchive[dk] || [])
        const has    = exs.length > 0
        const isTod  = dk === today
        const x      = 36 + i * 105
        const y      = dayY + 14

        // Box
        ctx.fillStyle = has ? 'rgba(232,255,71,0.12)' : 'rgba(255,255,255,0.03)'
        roundRect(ctx, x, y, 90, 56, 6)
        ctx.fill()

        ctx.strokeStyle = has ? 'rgba(232,255,71,0.35)' : 'rgba(255,255,255,0.06)'
        ctx.lineWidth   = has ? 1 : 0.5
        roundRect(ctx, x, y, 90, 56, 6)
        ctx.stroke()

        const dayIdx = new Date(dk + 'T00:00:00').getDay()
        const dayName = DAY_NAMES[dayIdx === 0 ? 6 : dayIdx - 1]

        ctx.font = '8px "Courier New", monospace'
        ctx.fillStyle = has ? '#e8ff47' : '#333'
        ctx.textAlign = 'center'
        ctx.fillText(dayName.toUpperCase(), x + 45, y + 16)

        ctx.font = has ? '22px serif' : '16px serif'
        ctx.fillText(has ? '💪' : '○', x + 45, y + 40)
        ctx.textAlign = 'left'

        // Set sayısı
        if (has) {
          const sets = exs.reduce((s,e) => s+e.sets.length, 0)
          ctx.font = '7px "Courier New", monospace'
          ctx.fillStyle = '#555'
          ctx.textAlign = 'center'
          ctx.fillText(`${sets} set`, x + 45, y + 54)
          ctx.textAlign = 'left'
        }
      })

      // Streak
      if (streak > 0) {
        ctx.font = 'bold 13px "Courier New", monospace'
        ctx.fillStyle = '#ff8c47'
        ctx.fillText(`🔥 ${streak} GÜNLÜK SERİ`, 36, 360)
      }

    } else {
      // ── BUGÜN KARTI ──

      if (todayExs.length === 0) {
        ctx.font = '16px "Courier New", monospace'
        ctx.fillStyle = '#333'
        ctx.textAlign = 'center'
        ctx.fillText('Bugün antrenman yok', W/2, H/2)
        ctx.textAlign = 'left'
      } else {
        // Stats
        const stats = [
          { label:'EGZERSİZ', val:todayExs.length, unit:'ADET', color:'#e8ff47' },
          { label:'SET',      val:todaySets,        unit:'SET',  color:'#47c8ff' },
          { label:'MAX KG',   val:todayMax,         unit:'KG',   color:'#47ff8a' },
        ]
        stats.forEach(({label,val,unit,color},i) => {
          const x = 36 + i * 250
          ctx.fillStyle = 'rgba(255,255,255,0.04)'
          roundRect(ctx,x,100,220,80,8); ctx.fill()
          ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=0.5
          roundRect(ctx,x,100,220,80,8); ctx.stroke()
          ctx.font='9px "Courier New",monospace'; ctx.fillStyle='#555'
          ctx.fillText(label,x+12,120)
          ctx.font='bold 38px "Courier New",monospace'; ctx.fillStyle=color
          ctx.fillText(val,x+12,162)
          ctx.font='10px "Courier New",monospace'; ctx.fillStyle='#444'
          ctx.fillText(unit,x+12,178)
        })

        // Egzersiz listesi
        ctx.font = '9px "Courier New", monospace'
        ctx.fillStyle = '#333'
        ctx.fillText('EGZERSİZLER', 36, 218)

        todayExs.slice(0,8).forEach((ex, i) => {
          const col   = i < 4 ? 0 : 1
          const row   = i % 4
          const x     = 36 + col * 390
          const y     = 234 + row * 44
          const maxW  = Math.max(...ex.sets.map(s=>+s.weight), 0)

          ctx.fillStyle = 'rgba(255,255,255,0.03)'
          roundRect(ctx,x,y,360,36,6); ctx.fill()

          ctx.font = 'bold 13px "Courier New", monospace'
          ctx.fillStyle = '#ccc'
          ctx.fillText(ex.name.substring(0,22), x+10, y+22)

          ctx.font = '11px "Courier New", monospace'
          ctx.fillStyle = '#e8ff47'
          const infoText = `${ex.sets.length} set${maxW>0?` · max ${maxW}kg`:''}`
          ctx.fillText(infoText, x+360-ctx.measureText(infoText).width-10, y+22)
        })

        if (todayExs.length > 8) {
          ctx.font = '10px "Courier New", monospace'
          ctx.fillStyle = '#444'
          ctx.fillText(`+${todayExs.length-8} egzersiz daha`, 36, 420)
        }
      }
    }

    // Footer
    ctx.font = '10px "Courier New", monospace'
    ctx.fillStyle = '#222'
    const dateStr = new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})
    ctx.fillText(`kerogym.app  ·  ${dateStr}`, 36, H - 20)

    // QR placeholder
    ctx.strokeStyle = '#222'
    ctx.lineWidth   = 0.5
    ctx.strokeRect(W-70, H-60, 44, 44)
    ctx.font = '7px "Courier New", monospace'
    ctx.fillStyle = '#222'
    ctx.textAlign = 'center'
    ctx.fillText('SCAN', W-48, H-12)
    ctx.textAlign = 'left'

    setPreview(canvas.toDataURL('image/png'))
    setExporting(false)
  }

  const download = () => {
    if (!preview) return
    const a = document.createElement('a')
    a.href = preview
    a.download = `kerogym-${shareMode === 'week' ? 'haftalik' : 'bugun'}-${today}.png`
    a.click()
  }

  const share = async () => {
    if (!preview || !navigator.share) { download(); return }
    try {
      const blob   = await (await fetch(preview)).blob()
      const file   = new File([blob], 'kerogym-antrenman.png', { type:'image/png' })
      await navigator.share({ files:[file], title:'KeroGym Antrenman', text:`${streak > 0 ? `🔥 ${streak} günlük seri!` : 'Antrenman tamamlandı!'} #KeroGym` })
    } catch { download() }
  }

  return (
    <div style={{ padding:'20px 0' }}>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:3, color:'var(--accent)', marginBottom:4 }}>PAYLAŞIM KARTI</div>
      <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', marginBottom:20 }}>
        Antrenmanını sosyal medyada paylaş
      </div>

      {/* Mod seçimi */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['week','📅 Haftalık'],['today','💪 Bugün']].map(([m,lbl])=>(
          <button key={m} onClick={()=>{ setShareMode(m); setPreview(null) }} style={{
            flex:1, padding:'10px', borderRadius:8, border:`1px solid ${shareMode===m?'rgba(232,255,71,.35)':'var(--border)'}`,
            background:shareMode===m?'rgba(232,255,71,.08)':'var(--surface2)',
            color:shareMode===m?'var(--accent)':'var(--text-muted)',
            fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:2, cursor:'pointer',
          }}>{lbl}</button>
        ))}
      </div>

      {/* Gizli canvas */}
      <canvas ref={canvasRef} style={{ display:'none' }}/>

      {/* Preview */}
      {preview ? (
        <div className="animate-fade">
          <img src={preview} alt="Paylaşım kartı" style={{ width:'100%', borderRadius:12, border:'1px solid var(--border)', marginBottom:16 }}/>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={share} className="btn btn-primary" style={{ flex:2 }}>
              {typeof navigator.share !== 'undefined' ? '📤 Paylaş' : '⬇ İndir'}
            </button>
            <button onClick={()=>setPreview(null)} className="btn btn-ghost" style={{ flex:1 }}>Yenile</button>
          </div>
        </div>
      ) : (
        <button onClick={generateCanvas} disabled={exporting} className="btn btn-primary" style={{ width:'100%', padding:14 }}>
          {exporting
            ?<><span className="spinner" style={{width:14,height:14,borderTopColor:'#0a0a0a',marginRight:8}}/>Oluşturuluyor...</>
            :'🎨 Kart Oluştur'
          }
        </button>
      )}

      {/* İstatistik özeti */}
      {shareMode === 'week' && (
        <div style={{ marginTop:20, display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {[
            { label:'Antrenman', val:`${weekStats.trainDays} gün`, color:'var(--accent)' },
            { label:'Toplam Set', val:`${weekStats.totalSets} set`, color:'#47c8ff' },
            { label:'Max Ağırlık', val:`${weekStats.maxWeight} kg`, color:'#47ff8a' },
            { label:'Streak', val:`${streak} gün 🔥`, color:'#ff8c47' },
          ].map(({label,val,color})=>(
            <div key={label} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px' }}>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', letterSpacing:2, marginBottom:3 }}>{label}</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, color }}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Canvas'ta round rect çizici
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x+r, y)
  ctx.lineTo(x+w-r, y)
  ctx.quadraticCurveTo(x+w, y, x+w, y+r)
  ctx.lineTo(x+w, y+h-r)
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h)
  ctx.lineTo(x+r, y+h)
  ctx.quadraticCurveTo(x, y+h, x, y+h-r)
  ctx.lineTo(x, y+r)
  ctx.quadraticCurveTo(x, y, x+r, y)
  ctx.closePath()
}
