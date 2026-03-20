import { useState, useRef } from 'react'
import Icon from '../Icons'

const GKEY = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'
const YT_KEY = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U' // same key for simplicity

// ── Kas Grupları & Egzersizler ──
const MUSCLE_GROUPS = [
  {
    id: 'chest', label: 'Göğüs', color: '#ef4444',
    exercises: ['Bench Press','İncline Bench Press','Decline Bench Press','Dumbbell Fly','Cable Crossover','Chest Dip','Push Up','Pec Deck'],
  },
  {
    id: 'back', label: 'Sırt', color: '#3b82f6',
    exercises: ['Deadlift','Barbell Row','Lat Pulldown','Pull-Up','Seated Cable Row','T-Bar Row','Dumbbell Row','Face Pull','Rack Pull'],
  },
  {
    id: 'shoulders', label: 'Omuz', color: '#f59e0b',
    exercises: ['Overhead Press','Dumbbell Shoulder Press','Lateral Raise','Front Raise','Rear Delt Fly','Arnold Press','Shrug','Upright Row'],
  },
  {
    id: 'arms', label: 'Kol', color: '#8b5cf6',
    exercises: ['Bicep Curl','Barbell Curl','Hammer Curl','Preacher Curl','Tricep Pushdown','Skull Crusher','Overhead Tricep Extension','Dip','Close Grip Bench Press'],
  },
  {
    id: 'legs', label: 'Bacak', color: '#22c55e',
    exercises: ['Squat','Front Squat','Hack Squat','Leg Press','Romanian Deadlift','Leg Curl','Leg Extension','Hip Thrust','Lunge','Bulgarian Split Squat','Calf Raise'],
  },
  {
    id: 'core', label: 'Core', color: '#06b6d4',
    exercises: ['Plank','Crunch','Sit-Up','Leg Raise','Cable Crunch','Russian Twist','Ab Wheel','Hanging Leg Raise','Mountain Climber'],
  },
  {
    id: 'cardio', label: 'Kardiyo', color: '#f97316',
    exercises: ['Koşu Bandı','Bisiklet','Kürek Makinesi','Elliptical','Battle Rope','Box Jump','Burpee','Kettlebell Swing','Jump Rope'],
  },
]

// ── İnsan Silüeti SVG (kas bölgelerine tıklanabilir) ──
function MuscleMapSVG({ activeGroup, onSelect }) {
  const groups = [
    { id:'chest',     d:'M 155 145 Q 175 135 195 145 L 195 185 Q 175 190 155 185 Z', label:'Göğüs' },
    { id:'chest',     d:'M 205 145 Q 225 135 245 145 L 245 185 Q 225 190 205 185 Z', label:'Göğüs' },
    { id:'back',      d:'M 155 145 Q 175 135 195 145 L 195 185 Q 175 190 155 185 Z', label:'Sırt', back:true },
    { id:'shoulders', d:'M 140 130 Q 155 115 175 125 L 165 155 Q 148 155 140 145 Z', label:'Omuz Sol' },
    { id:'shoulders', d:'M 260 130 Q 245 115 225 125 L 235 155 Q 252 155 260 145 Z', label:'Omuz Sağ' },
    { id:'arms',      d:'M 128 155 Q 138 148 148 158 L 148 215 Q 138 218 128 210 Z', label:'Sol Kol' },
    { id:'arms',      d:'M 272 155 Q 262 148 252 158 L 252 215 Q 262 218 272 210 Z', label:'Sağ Kol' },
    { id:'core',      d:'M 175 185 Q 200 180 225 185 L 222 245 Q 200 250 178 245 Z', label:'Core' },
    { id:'legs',      d:'M 175 250 Q 195 248 200 255 L 198 340 Q 185 345 175 338 Z', label:'Sol Bacak' },
    { id:'legs',      d:'M 225 250 Q 205 248 200 255 L 202 340 Q 215 345 225 338 Z', label:'Sağ Bacak' },
    { id:'legs',      d:'M 175 340 Q 185 342 198 340 L 196 395 Q 185 400 175 395 Z', label:'Sol Alt Bacak' },
    { id:'legs',      d:'M 225 340 Q 215 342 202 340 L 204 395 Q 215 400 225 395 Z', label:'Sağ Alt Bacak' },
  ]

  const getColor = (id) => {
    const mg = MUSCLE_GROUPS.find(m => m.id === id)
    if (!mg) return 'rgba(255,255,255,.08)'
    if (activeGroup === id) return mg.color
    return 'rgba(255,255,255,.06)'
  }

  return (
    <svg viewBox="100 60 200 380" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', maxWidth:240, height:'auto' }}>
      {/* Vücut silüeti */}
      <g stroke="rgba(255,255,255,.15)" strokeWidth="1" fill="none">
        {/* Baş */}
        <ellipse cx="200" cy="90" rx="22" ry="26" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.2)"/>
        {/* Boyun */}
        <rect x="193" y="114" width="14" height="14" rx="4" fill="rgba(255,255,255,.04)"/>
        {/* Gövde */}
        <path d="M155 128 Q200 118 245 128 L248 270 Q200 278 152 270 Z" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.1)"/>
        {/* Sol kol üst */}
        <path d="M155 130 Q138 140 128 165 Q124 210 128 228 Q135 235 143 228 Q150 210 150 165 Q150 145 158 132" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.1)"/>
        {/* Sağ kol üst */}
        <path d="M245 130 Q262 140 272 165 Q276 210 272 228 Q265 235 257 228 Q250 210 250 165 Q250 145 242 132" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.1)"/>
        {/* Sol kol alt */}
        <path d="M128 228 Q122 255 124 280 Q126 295 132 298 Q138 295 140 280 Q142 255 143 228" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.08)"/>
        {/* Sağ kol alt */}
        <path d="M272 228 Q278 255 276 280 Q274 295 268 298 Q262 295 260 280 Q258 255 257 228" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.08)"/>
        {/* Sol el */}
        <ellipse cx="128" cy="305" rx="8" ry="12" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.08)"/>
        {/* Sağ el */}
        <ellipse cx="272" cy="305" rx="8" ry="12" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.08)"/>
        {/* Sol bacak üst */}
        <path d="M165 270 Q158 310 160 355 Q163 370 172 372 Q180 370 182 355 Q184 310 190 270" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.1)"/>
        {/* Sağ bacak üst */}
        <path d="M235 270 Q242 310 240 355 Q237 370 228 372 Q220 370 218 355 Q216 310 210 270" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.1)"/>
        {/* Sol bacak alt */}
        <path d="M160 355 Q158 390 160 415 Q163 425 170 426 Q177 425 178 415 Q180 390 182 355" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.08)"/>
        {/* Sağ bacak alt */}
        <path d="M240 355 Q242 390 240 415 Q237 425 230 426 Q223 425 222 415 Q220 390 218 355" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.08)"/>
        {/* Sol ayak */}
        <ellipse cx="167" cy="430" rx="12" ry="6" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.08)"/>
        {/* Sağ ayak */}
        <ellipse cx="233" cy="430" rx="12" ry="6" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.08)"/>
      </g>

      {/* Tıklanabilir kas bölgeleri */}
      {/* Göğüs */}
      <path d="M165 132 Q182 128 198 132 L198 180 Q182 185 165 180 Z"
        fill={activeGroup==='chest' ? 'rgba(239,68,68,.4)' : 'rgba(239,68,68,.08)'}
        stroke={activeGroup==='chest' ? '#ef4444' : 'rgba(239,68,68,.2)'}
        strokeWidth="1" style={{cursor:'pointer', transition:'all .2s'}}
        onClick={() => onSelect('chest')}/>
      <path d="M202 132 Q218 128 235 132 L235 180 Q218 185 202 180 Z"
        fill={activeGroup==='chest' ? 'rgba(239,68,68,.4)' : 'rgba(239,68,68,.08)'}
        stroke={activeGroup==='chest' ? '#ef4444' : 'rgba(239,68,68,.2)'}
        strokeWidth="1" style={{cursor:'pointer', transition:'all .2s'}}
        onClick={() => onSelect('chest')}/>

      {/* Omuzlar */}
      <path d="M148 130 Q160 122 168 132 L162 160 Q148 162 145 150 Z"
        fill={activeGroup==='shoulders' ? 'rgba(245,158,11,.4)' : 'rgba(245,158,11,.08)'}
        stroke={activeGroup==='shoulders' ? '#f59e0b' : 'rgba(245,158,11,.2)'}
        strokeWidth="1" style={{cursor:'pointer', transition:'all .2s'}}
        onClick={() => onSelect('shoulders')}/>
      <path d="M252 130 Q240 122 232 132 L238 160 Q252 162 255 150 Z"
        fill={activeGroup==='shoulders' ? 'rgba(245,158,11,.4)' : 'rgba(245,158,11,.08)'}
        stroke={activeGroup==='shoulders' ? '#f59e0b' : 'rgba(245,158,11,.2)'}
        strokeWidth="1" style={{cursor:'pointer', transition:'all .2s'}}
        onClick={() => onSelect('shoulders')}/>

      {/* Kollar */}
      <path d="M134 160 Q143 155 150 162 L148 222 Q140 226 133 218 Z"
        fill={activeGroup==='arms' ? 'rgba(139,92,246,.4)' : 'rgba(139,92,246,.08)'}
        stroke={activeGroup==='arms' ? '#8b5cf6' : 'rgba(139,92,246,.2)'}
        strokeWidth="1" style={{cursor:'pointer', transition:'all .2s'}}
        onClick={() => onSelect('arms')}/>
      <path d="M266 160 Q257 155 250 162 L252 222 Q260 226 267 218 Z"
        fill={activeGroup==='arms' ? 'rgba(139,92,246,.4)' : 'rgba(139,92,246,.08)'}
        stroke={activeGroup==='arms' ? '#8b5cf6' : 'rgba(139,92,246,.2)'}
        strokeWidth="1" style={{cursor:'pointer', transition:'all .2s'}}
        onClick={() => onSelect('arms')}/>

      {/* Core */}
      <path d="M178 182 Q200 178 222 182 L220 250 Q200 255 180 250 Z"
        fill={activeGroup==='core' ? 'rgba(6,182,212,.4)' : 'rgba(6,182,212,.08)'}
        stroke={activeGroup==='core' ? '#06b6d4' : 'rgba(6,182,212,.2)'}
        strokeWidth="1" style={{cursor:'pointer', transition:'all .2s'}}
        onClick={() => onSelect('core')}/>

      {/* Sırt bölgesi (üst kısım) */}
      <path d="M168 132 Q200 125 232 132 L232 145 Q200 148 168 145 Z"
        fill={activeGroup==='back' ? 'rgba(59,130,246,.4)' : 'rgba(59,130,246,.06)'}
        stroke={activeGroup==='back' ? '#3b82f6' : 'rgba(59,130,246,.15)'}
        strokeWidth="1" style={{cursor:'pointer', transition:'all .2s'}}
        onClick={() => onSelect('back')}/>

      {/* Bacaklar */}
      <path d="M168 255 Q183 252 188 258 L186 350 Q178 355 169 348 Z"
        fill={activeGroup==='legs' ? 'rgba(34,197,94,.4)' : 'rgba(34,197,94,.08)'}
        stroke={activeGroup==='legs' ? '#22c55e' : 'rgba(34,197,94,.2)'}
        strokeWidth="1" style={{cursor:'pointer', transition:'all .2s'}}
        onClick={() => onSelect('legs')}/>
      <path d="M232 255 Q217 252 212 258 L214 350 Q222 355 231 348 Z"
        fill={activeGroup==='legs' ? 'rgba(34,197,94,.4)' : 'rgba(34,197,94,.08)'}
        stroke={activeGroup==='legs' ? '#22c55e' : 'rgba(34,197,94,.2)'}
        strokeWidth="1" style={{cursor:'pointer', transition:'all .2s'}}
        onClick={() => onSelect('legs')}/>

      {/* Etiketler */}
      {activeGroup && (() => {
        const mg = MUSCLE_GROUPS.find(m => m.id === activeGroup)
        return (
          <text x="200" y="58" textAnchor="middle" fontSize="12" fontWeight="600"
            fontFamily="Space Grotesk, sans-serif" fill={mg?.color || 'white'}>
            {mg?.label}
          </text>
        )
      })()}
    </svg>
  )
}

// ── Hareket Detay Modalı ──
function ExerciseDetailModal({ exercise, onClose }) {
  const [formText, setFormText] = useState('')
  const [loading, setLoading]   = useState(false)
  const [ytVideo, setYtVideo]   = useState(null)
  const [loadingYt, setLoadingYt] = useState(false)

  const AI_MODELS = ['gemini-3.1-flash-lite-preview','gemini-2.5-flash','gemini-2.0-flash']

  const fetchForm = async () => {
    setLoading(true)
    const prompt = `"${exercise}" egzersizinin doğru formunu Türkçe olarak açıkla.
Şu başlıkları kullan:
**Başlangıç Pozisyonu:** (nasıl duracağını anlat)
**Hareket:** (adım adım nasıl yapılacağını anlat)
**Nefes:** (ne zaman nefes alıp verilecek)
**Sık Yapılan Hatalar:** (3 madde)
**İpucu:** (bir profesyonel ipucu)
Kısa, net ve anlaşılır yaz.`

    for (const model of AI_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GKEY}`,
          { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:.5, maxOutputTokens:800} }) }
        )
        if (!res.ok) continue
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        if (text) { setFormText(text); break }
      } catch { continue }
    }
    setLoading(false)
  }

  const fetchVideo = async () => {
    setLoadingYt(true)
    // YouTube Data API v3
    try {
      const query = encodeURIComponent(`${exercise} nasıl yapılır form tutorial`)
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=3&key=${GKEY}`
      )
      if (res.ok) {
        const data = await res.json()
        if (data.items?.length > 0) {
          setYtVideo(data.items[0])
        }
      }
    } catch { /* Sessiz hata */ }
    setLoadingYt(false)
  }

  // Otomatik yükle
  useState(() => {
    fetchForm()
    fetchVideo()
  })

  // Markdown benzeri text renderer
  const renderText = (text) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} style={{ fontWeight:700, color:'var(--text)', fontSize:13, marginTop:14, marginBottom:4 }}>{line.replace(/\*\*/g,'')}</div>
      }
      if (line.startsWith('**')) {
        const parts = line.split('**')
        return (
          <div key={i} style={{ fontSize:13, lineHeight:1.7, color:'var(--text-dim)', marginBottom:2 }}>
            {parts.map((p,j) => j % 2 === 1 ? <strong key={j} style={{color:'var(--text)'}}>{p}</strong> : p)}
          </div>
        )
      }
      if (line.trim() === '') return <div key={i} style={{height:4}}/>
      return <div key={i} style={{ fontSize:13, lineHeight:1.7, color:'var(--text-dim)', marginBottom:2 }}>{line}</div>
    })
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:600,
      background:'rgba(0,0,0,.85)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'flex-end',
      animation:'fadeIn .2s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width:'100%', maxWidth:640, margin:'0 auto',
        background:'var(--surface)', borderRadius:'20px 20px 0 0',
        border:'1px solid var(--border)', borderBottom:'none',
        maxHeight:'90vh', overflowY:'auto',
        animation:'slideUp .3s cubic-bezier(.4,0,.2,1)',
      }}>
        {/* Header */}
        <div style={{ padding:'20px 20px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'var(--surface)', zIndex:1 }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:'var(--text)' }}>{exercise}</div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--text-muted)', letterSpacing:2, marginTop:2 }}>HAREKET ANALİZİ</div>
          </div>
          <button onClick={onClose} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="x" size={14} color="var(--text-muted)"/>
          </button>
        </div>

        <div style={{ padding:'16px 20px' }}>
          {/* Video */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5, color:'var(--text-muted)', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
              <Icon name="film" size={12} color="var(--text-muted)"/>
              VIDEO
            </div>
            {loadingYt ? (
              <div style={{ height:180, background:'var(--surface2)', borderRadius:12, border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="spinner"/>
              </div>
            ) : ytVideo ? (
              <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', aspectRatio:'16/9', cursor:'pointer' }}
                onClick={() => window.open(`https://youtube.com/watch?v=${ytVideo.id.videoId}`, '_blank')}>
                <div style={{ position:'relative', width:'100%', paddingTop:'56.25%' }}>
                  <img src={ytVideo.snippet.thumbnails.medium.url} alt={ytVideo.snippet.title}
                    style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
                  <div style={{
                    position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
                    background:'rgba(0,0,0,.35)',
                  }}>
                    <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(239,68,68,.9)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon name="play" size={22} color="white" strokeWidth={2}/>
                    </div>
                  </div>
                </div>
                <div style={{ padding:'10px 12px', background:'var(--surface2)' }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--text)', lineHeight:1.4, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {ytVideo.snippet.title}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ borderRadius:12, border:'1px solid var(--border)', padding:'16px', background:'var(--surface2)', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <Icon name="film" size={24} color="var(--text-muted)"/>
                <div style={{ fontSize:12, color:'var(--text-muted)', textAlign:'center' }}>
                  Video bulunamadı.{' '}
                  <a href={`https://youtube.com/results?search_query=${encodeURIComponent(exercise + ' form nasıl yapılır')}`}
                    target="_blank" rel="noreferrer"
                    style={{ color:'var(--blue)', textDecoration:'none' }}>
                    YouTube'da ara →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* AI Form Açıklaması */}
          <div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5, color:'var(--text-muted)', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
              <Icon name="robot" size={12} color="var(--text-muted)"/>
              DOĞRU FORM — AI ANALİZİ
            </div>
            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[80,60,90,50,70].map((w,i) => (
                  <div key={i} style={{ height:14, borderRadius:4, background:'var(--surface2)', width:`${w}%`, animation:'pulse 1.5s ease infinite', animationDelay:`${i*0.1}s` }}/>
                ))}
              </div>
            ) : formText ? (
              <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:'16px' }}>
                {renderText(formText)}
              </div>
            ) : (
              <button onClick={fetchForm} className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', gap:8 }}>
                <Icon name="robot" size={15} color="var(--text-muted)"/>
                Form Açıklaması Al
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Ana Sayfa ──
export default function ExercisesPage() {
  const [view, setView]              = useState('map')     // 'map' | 'list'
  const [activeGroup, setActiveGroup] = useState(null)
  const [search, setSearch]          = useState('')
  const [selectedEx, setSelectedEx]  = useState(null)
  const searchRef = useRef(null)

  const handleMuscleSelect = (id) => {
    setActiveGroup(prev => prev === id ? null : id)
    setView('list')
  }

  const filtered = (() => {
    if (search.trim()) {
      const q = search.toLowerCase()
      return MUSCLE_GROUPS.flatMap(g => g.exercises.filter(e => e.toLowerCase().includes(q)).map(e => ({ ex:e, group:g })))
    }
    if (activeGroup) {
      const g = MUSCLE_GROUPS.find(m => m.id === activeGroup)
      return g ? g.exercises.map(e => ({ ex:e, group:g })) : []
    }
    return []
  })()

  return (
    <div className="page animate-fade" style={{ maxWidth:640, paddingBottom:80 }}>

      {/* Başlık */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:24, color:'var(--text)', letterSpacing:.3 }}>Hareketler</div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'var(--text-muted)', letterSpacing:2, marginTop:3 }}>KAS GRUBU SEÇ VEYA ARA</div>
      </div>

      {/* Arama */}
      <div style={{ position:'relative', marginBottom:16 }}>
        <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
          <Icon name="search" size={16} color="var(--text-muted)" strokeWidth={1.8}/>
        </div>
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); if (e.target.value) { setView('list'); setActiveGroup(null) } }}
          placeholder="Hareket ara... (bench press, squat...)"
          style={{ paddingLeft:40, paddingRight: search ? 40 : 12 }}
        />
        {search && (
          <button onClick={() => { setSearch(''); searchRef.current?.focus() }} style={{
            position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', padding:4,
            display:'flex', alignItems:'center',
          }}>
            <Icon name="x" size={14} color="var(--text-muted)"/>
          </button>
        )}
      </div>

      {/* View toggle */}
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        <button onClick={() => { setView('map'); setSearch('') }} style={{
          flex:1, padding:'9px 8px', borderRadius:10,
          border:`1px solid ${view==='map' ? 'var(--accent)' : 'var(--border)'}`,
          background: view==='map' ? 'var(--accent-dim)' : 'transparent',
          color: view==='map' ? 'var(--accent)' : 'var(--text-muted)',
          fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:12,
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          transition:'all .15s',
        }}>
          <Icon name="body" size={15} color={view==='map' ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth={view==='map' ? 2 : 1.6}/>
          Kas Haritası
        </button>
        <button onClick={() => setView('list')} style={{
          flex:1, padding:'9px 8px', borderRadius:10,
          border:`1px solid ${view==='list' ? 'var(--accent)' : 'var(--border)'}`,
          background: view==='list' ? 'var(--accent-dim)' : 'transparent',
          color: view==='list' ? 'var(--accent)' : 'var(--text-muted)',
          fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:12,
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          transition:'all .15s',
        }}>
          <Icon name="search" size={15} color={view==='list' ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth={view==='list' ? 2 : 1.6}/>
          Tümünü Listele
        </button>
      </div>

      {/* ── KAS HARİTASI GÖRÜNÜMÜ ── */}
      {view === 'map' && (
        <div className="animate-fade">
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
            {/* Kas grubu kategorileri */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', width:'100%', marginBottom:4 }}>
              {MUSCLE_GROUPS.map(mg => (
                <button key={mg.id} onClick={() => { setActiveGroup(prev => prev===mg.id ? null : mg.id) }} style={{
                  padding:'6px 14px', borderRadius:20,
                  border:`1px solid ${activeGroup===mg.id ? mg.color : 'var(--border)'}`,
                  background: activeGroup===mg.id ? `${mg.color}18` : 'transparent',
                  color: activeGroup===mg.id ? mg.color : 'var(--text-muted)',
                  fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:12,
                  cursor:'pointer', transition:'all .15s',
                }}>
                  {mg.label}
                </button>
              ))}
            </div>

            {/* SVG kas haritası */}
            <div style={{ width:'100%', display:'flex', justifyContent:'center', padding:'0 20px' }}>
              <MuscleMapSVG activeGroup={activeGroup} onSelect={(id) => { setActiveGroup(prev => prev===id ? null : id) }}/>
            </div>

            {/* Seçili grup gösterimi */}
            {activeGroup && (() => {
              const mg = MUSCLE_GROUPS.find(m => m.id === activeGroup)
              return (
                <div className="animate-fade" style={{ width:'100%' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color: mg.color }}>
                      {mg.label} Hareketleri
                    </div>
                    <button onClick={() => { setView('list'); }} style={{
                      fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--text-muted)',
                      background:'none', border:'none', cursor:'pointer', letterSpacing:1,
                    }}>
                      Tümünü gör →
                    </button>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {mg.exercises.slice(0,5).map(ex => (
                      <div key={ex} onClick={() => setSelectedEx(ex)} style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'12px 14px', borderRadius:10,
                        border:`1px solid var(--border)`,
                        background:'var(--surface)',
                        cursor:'pointer', transition:'all .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = mg.color; e.currentTarget.style.background = `${mg.color}0a` }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
                      >
                        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:14, color:'var(--text)' }}>{ex}</span>
                        <Icon name="arrowRight" size={15} color="var(--text-muted)" strokeWidth={1.6}/>
                      </div>
                    ))}
                    {mg.exercises.length > 5 && (
                      <button onClick={() => setView('list')} style={{
                        padding:'10px', borderRadius:10, border:'1px dashed var(--border)',
                        background:'transparent', color:'var(--text-muted)',
                        fontFamily:"'Space Grotesk',sans-serif", fontSize:12, cursor:'pointer',
                      }}>
                        +{mg.exercises.length - 5} hareket daha
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}

            {!activeGroup && (
              <div style={{ textAlign:'center', padding:'10px 0' }}>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'var(--text-muted)', letterSpacing:2 }}>
                  Kas grubuna dokunarak hareketleri gör
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LİSTE GÖRÜNÜMÜ ── */}
      {view === 'list' && (
        <div className="animate-fade">
          {/* Kategori chip'leri */}
          {!search && (
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8, marginBottom:14 }}>
              <button onClick={() => setActiveGroup(null)} style={{
                padding:'6px 14px', borderRadius:20, flexShrink:0,
                border:`1px solid ${!activeGroup ? 'var(--accent)' : 'var(--border)'}`,
                background: !activeGroup ? 'var(--accent-dim)' : 'transparent',
                color: !activeGroup ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:12,
                cursor:'pointer',
              }}>Tümü</button>
              {MUSCLE_GROUPS.map(mg => (
                <button key={mg.id} onClick={() => setActiveGroup(mg.id)} style={{
                  padding:'6px 14px', borderRadius:20, flexShrink:0,
                  border:`1px solid ${activeGroup===mg.id ? mg.color : 'var(--border)'}`,
                  background: activeGroup===mg.id ? `${mg.color}18` : 'transparent',
                  color: activeGroup===mg.id ? mg.color : 'var(--text-muted)',
                  fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:12,
                  cursor:'pointer',
                }}>
                  {mg.label}
                </button>
              ))}
            </div>
          )}

          {/* Sonuçlar */}
          {search && filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">Sonuç bulunamadı</div>
              <div className="empty-sub">"{search}" için egzersiz yok</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {(search ? filtered : MUSCLE_GROUPS.filter(g => !activeGroup || g.id === activeGroup).flatMap(g => g.exercises.map(e => ({ex:e, group:g})))).map(({ex, group}) => (
                <div key={ex} onClick={() => setSelectedEx(ex)} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'13px 14px', borderRadius:12,
                  border:'1px solid var(--border)',
                  background:'var(--surface)',
                  cursor:'pointer', transition:'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = group.color; e.currentTarget.style.background = `${group.color}08` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
                >
                  <div style={{ width:6, height:6, borderRadius:'50%', background:group.color, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:14, color:'var(--text)' }}>{ex}</div>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:group.color, letterSpacing:1.5, marginTop:2 }}>{group.label}</div>
                  </div>
                  <Icon name="arrowRight" size={15} color="var(--text-muted)" strokeWidth={1.5}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hareket Detay Modal */}
      {selectedEx && <ExerciseDetailModal exercise={selectedEx} onClose={() => setSelectedEx(null)}/>}
    </div>
  )
}
