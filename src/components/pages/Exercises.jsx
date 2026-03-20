import { useState, useRef } from 'react'
import Icon from '../Icons'

const GKEY = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'

// ── Statik Form Veritabanı ──
const EXERCISE_FORMS = {
  'Bench Press': {
    start: 'Sırt düz bankta yat. Küreği çek, göğüs hafifçe kabar. Barı gözlerin hizasından tut, kavrama omuz genişliğinden biraz daha geniş olsun.',
    move: '1) Barı kontrollü indirerek göğsünün ortasına doğur. 2) Dirseğin 45-75° açıyla vücuda yakın kalsın. 3) Ayaklarını yere bas, kalçanı banktan kaldırma. 4) Nefes vererek barı yukarı it.',
    breath: 'İnerken nefes al, iterken güçlü nefes ver.',
    mistakes: ['Sırtı banktan kaldırmak', 'Bileği bükmek (nötr tut)', 'Dirsekleri çok dışa açmak'],
    tip: 'Bar indikçe "göğsünü bara doğru itmek" hissini yaşat — bu, kürek kaslarını aktive eder ve yaralanmayı önler.',
  },
  'Squat': {
    start: 'Ayaklar omuz genişliğinde, ayak parmakları 15-30° dışa. Bar trapez üstünde rahat otsun. Göğüs dik, bakış öne.',
    move: '1) Kalçayla geriye otur, dizler ayak parmakları yönünde aç. 2) Uyluklar yere paralele kadar in (veya daha derin). 3) Topuklar yerden kalmasın. 4) Dizleri içe düşürme, yukarı iterken güçlü nefes ver.',
    breath: 'İnerken derin nefes al (Valsalva), çıkarken ver.',
    mistakes: ['Dizleri içe düşürmek', 'Topukları kaldırmak', 'Öne eğilmek'],
    tip: 'Squat yaparken "yeri yırtıyormuş gibi" ayaklarla dışa kuvvet uygula — kalça kasları çok daha iyi aktive olur.',
  },
  'Deadlift': {
    start: 'Ayaklar kalça genişliğinde, barın altında. Bar ayak ortasının üstüne gelsin. Kanca veya overhand kavrama. Sırt düz, göğüs dik.',
    move: '1) Bar bacağa değecek şekilde tut. 2) Bacak ve kalçayla aynı anda iter gibi kaldır. 3) Diz geçince kalçayı öne kilitle. 4) İnerken önce kalça geriye, sonra dizler bük.',
    breath: 'Kaldırmadan önce derin nefes al ve koru, barı yere bırakırken ver.',
    mistakes: ['Sırtı yuvarlama (en kritik hata)', 'Barı vücuttan uzak tutmak', 'Hızlı kilitlememe'],
    tip: '"Bar bacağı tıraşlıyormuş gibi" çekerek kaldır — bu sayede güç transferi en verimli şekilde olur.',
  },
  'Pull-Up': {
    start: 'Palmar kavrama, omuz genişliğinden biraz geniş. Kollar tam uzamış, omuzlar aktif (sarkma değil).',
    move: '1) Küreği sıkıştırarak harekete başla. 2) Çene bara gelene kadar çek. 3) Dirsekler yere doğru gelsin. 4) Kontrollü in, tam ekstansiyona dön.',
    breath: 'Çekerken nefes ver, inerken al.',
    mistakes: ['Sallanmak / momentum kullanmak', 'Boynu uzatmak', 'Tam uzanmadan tekrar başlamak'],
    tip: 'Her çekişte "küreği cebine koy" imajını kullan — bu omuz sağlığını korur ve sırt kaslarını tam aktivasyona sokar.',
  },
  'Overhead Press': {
    start: 'Bar klavikul üstünde. Kavrama omuz genişliğinden biraz geniş. Dirsekler öne, omuzlar aktif.',
    move: '1) Barı başın önünden düz yukarı it. 2) Kafa bardan çekilir, bar geçince tekrar öne al. 3) Üst kısımda kollar tam uzasın. 4) Kontrollü in.',
    breath: 'İterken nefes ver, inerken al.',
    mistakes: ['Beli aşırı kasmak / geriye yatmak', 'Barı başın önünde tutmak', 'Dirseklerin çok açılması'],
    tip: 'Press yaparken "çubuğu kırmaya çalışır gibi" dışa kuvvet uygula — omuz stabilitesi artar.',
  },
  'Barbell Row': {
    start: 'Ayaklar kalça genişliğinde. Öne eğil (45-60°), sırt düz. Barı kavrama omuz genişliğinde.',
    move: '1) Bar göbek veya alt göğse doğru çek. 2) Dirsekler arkaya, kürekler sıkışsın. 3) Kontrollü in, kollar tam uzasın.',
    breath: 'Çekerken nefes ver, inerken al.',
    mistakes: ['Sırtı yuvarlama', 'Momentum kullanarak çekmek', 'Bar çok yükseğe çekmek'],
    tip: '"Dirsekleri cebin içine it" — bu imaj sırt kaslarını tam aktive eder, kol kasları değil.',
  },
  'Plank': {
    start: 'Underarm (dirsek) veya el. Omuzların altında dirsek/el. Vücut baştan topuğa düz çizgi.',
    move: 'Pozisyonu koru. Kalça ne yukarı ne de aşağı. Core sıkı, nefes düzenli.',
    breath: 'Derin ve kontrollü nefes al. Tutarak nefes alma.',
    mistakes: ['Kalçayı yukarı kaldırmak', 'Beli sarkıtmak', 'Boynu aşırı uzatmak'],
    tip: 'Tutarken "zemine delmeye çalışır gibi" dirsekleri geriye, ayakları öne çek — bu gerçek anlamda core gerilmesini sağlar.',
  },
  'Bicep Curl': {
    start: 'Dik dur, dirsekler vücudun yanında sabit. Dumbbell/bar underhand kavrama.',
    move: '1) Sadece ön kol hareket etsin. 2) Üst kısma tam sıkıştır. 3) Kontrollü in, kol tam uzasın.',
    breath: 'Kaldırırken nefes ver, inerken al.',
    mistakes: ['Dirsekleri öne getirmek', 'Momentum kullanmak', 'Yarım range of motion'],
    tip: 'En üst noktada 1 saniye dur ve bisepsi sık — kasın tam kasılmasını hissedersin.',
  },
  'Tricep Pushdown': {
    start: 'Kablo makinesi veya rezistans bant, göğüs hizasında. Dirsekler vücudun yanında sabit.',
    move: '1) Sadece ön kol hareket etsin. 2) Alt noktada tricepti tam sık. 3) Kontrollü kaldır, dirsek 90°ye kadar.',
    breath: 'İterken nefes ver, inerken al.',
    mistakes: ['Dirsekleri öne almak', 'Üst gövdeyi öne eğmek', 'Hızlı yapmak'],
    tip: 'Her tekrarda alt noktada 0.5 saniye dur — tricep tam kasılır.',
  },
  'Leg Press': {
    start: 'Sırt ve kalça sehpaya tam otur. Ayaklar platform ortasında, omuz genişliğinde.',
    move: '1) Diz 90° veya biraz üstüne in. 2) Topukla it, diz tam açma. 3) Dizleri kilitleme.',
    breath: 'İterken nefes ver, inerken al.',
    mistakes: ['Kalçayı kaldırmak', 'Dizleri tam kilitlemek', 'Ayakları çok aşağıya koymak'],
    tip: 'Topukları aktif tut — parmak uçlarıyla değil, topukla itmek quadriceps ile glute daha dengeli çalıştırır.',
  },
  'Lateral Raise': {
    start: 'Dik dur, dumbbells yanlarda. Hafif ön kol rotasyonu (parmaklar hafifçe aşağı).',
    move: '1) Kolları yanlara 90°ye kaldır. 2) Dirsekler bilek seviyesinde veya biraz üstünde. 3) Kontrollü in.',
    breath: 'Kaldırırken nefes ver, inerken al.',
    mistakes: ['Momentum kullanmak', 'Dirsekleri bükmek', 'Omuzları sıkıştırmak'],
    tip: 'Sanki elimde su dolu bardak var ve dökmemeye çalışıyorum — bu imaj doğru rotasyonu sağlar.',
  },
  'Hip Thrust': {
    start: 'Omuzlar bench üstünde, kalça yerde. Bar kalça kemiğinin üstünde, pad kullan. Ayaklar yere düz.',
    move: '1) Kalçayı yukarı it, gövde yere paralel. 2) Glute tam sık. 3) Kontrollü in.',
    breath: 'İterken nefes ver, inerken al.',
    mistakes: ['Beli aşırı kavsetmek', 'Dizleri içe düşürmek', 'Tam kasılmamak'],
    tip: 'Her tekrarda 1-2 saniye tutarak squeeze yap — glute aktivasyonu %40 artar.',
  },
  'Romanian Deadlift': {
    start: 'Ayaklar kalça genişliğinde. Bar kalça önünde, overhand kavrama. Dizler hafif bükük, sabit.',
    move: '1) Kalçayı geriye iter gibi in. 2) Sırt düz, bar bacağa yakın. 3) Hamstring gerer hissedince dur. 4) Kalçayla kalkınırken it.',
    breath: 'İnerken nefes al, kalkarken ver.',
    mistakes: ['Sırtı yuvarlama', 'Dizleri bükmek (o Squat olur)', 'Bar vücuttan uzaklaşmak'],
    tip: '"Duvara popo vur" hareketi gibi kalçayı geriye gönder — hamstring stretch hissini doğru yapar.',
  },
  'Crunch': {
    start: 'Yerde sırt üstü, dizler 90°. El başın yanında veya göğüste çapraz.',
    move: '1) Sadece omuzları kaldır, bel yerde kalsın. 2) Üst noktada abdominal sık. 3) Kontrollü in.',
    breath: 'Kaldırırken nefes ver, inerken al.',
    mistakes: ['Boynu çekmek', 'Tam oturmak (o crunch değil)', 'Hızlı yapmak'],
    tip: 'Güneşi öpmeye çalışır gibi kafayı hafifçe yukarı tutarak sıkıştır — boyun stresi sıfırlanır.',
  },
}

// Tüm egzersizlere default form ver
const DEFAULT_FORM = {
  start: 'Dik ve dengeli bir başlangıç pozisyonu al. Eklemler hizalı, core aktif olsun.',
  move: '1) Hareketi kontrollü ve tam range of motion ile yap. 2) Kasın gerildiğini ve kasıldığını hisset. 3) Yavaş tempo kas gelişimi için daha verimlidir.',
  breath: 'Kasılma fazında nefes ver, uzama fazında al. Nefesini tutma.',
  mistakes: ['Momentum kullanmak', 'Yarım range of motion', 'Ağırlığı aşırı artırmak'],
  tip: 'Tekrar sayısından çok form kalitesine odaklan. Hafif ağırlıkla mükemmel form, ağır ağırlıkla kötü formdan daha değerlidir.',
}

function getForm(exerciseName) {
  return EXERCISE_FORMS[exerciseName] || DEFAULT_FORM
}

// ── Kas Grupları ──
const MUSCLE_GROUPS = [
  { id:'chest',     label:'Göğüs',   color:'#ef4444', exercises:['Bench Press','İncline Bench Press','Decline Bench Press','Dumbbell Fly','Cable Crossover','Chest Dip','Push Up','Pec Deck'] },
  { id:'back',      label:'Sırt',    color:'#3b82f6', exercises:['Deadlift','Barbell Row','Lat Pulldown','Pull-Up','Seated Cable Row','T-Bar Row','Dumbbell Row','Face Pull','Rack Pull'] },
  { id:'shoulders', label:'Omuz',    color:'#f59e0b', exercises:['Overhead Press','Dumbbell Shoulder Press','Lateral Raise','Front Raise','Rear Delt Fly','Arnold Press','Shrug','Upright Row'] },
  { id:'arms',      label:'Kol',     color:'#8b5cf6', exercises:['Bicep Curl','Barbell Curl','Hammer Curl','Preacher Curl','Tricep Pushdown','Skull Crusher','Overhead Tricep Extension','Dip','Close Grip Bench Press'] },
  { id:'legs',      label:'Bacak',   color:'#22c55e', exercises:['Squat','Front Squat','Hack Squat','Leg Press','Romanian Deadlift','Leg Curl','Leg Extension','Hip Thrust','Lunge','Bulgarian Split Squat','Calf Raise'] },
  { id:'core',      label:'Core',    color:'#06b6d4', exercises:['Plank','Crunch','Sit-Up','Leg Raise','Cable Crunch','Russian Twist','Ab Wheel','Hanging Leg Raise','Mountain Climber'] },
  { id:'cardio',    label:'Kardiyo', color:'#f97316', exercises:['Koşu Bandı','Bisiklet','Kürek Makinesi','Elliptical','Battle Rope','Box Jump','Burpee','Kettlebell Swing','Jump Rope'] },
]

// ── Gerçekçi İnsan Silüeti SVG ──
function MuscleMapSVG({ activeGroup, onSelect }) {
  const [side, setSide] = useState('front')
  const mg = (id) => MUSCLE_GROUPS.find(m => m.id === id)

  // Ön yüz — tıklanabilir bölgeler (viewBox 0 0 400 820 için normalize)
  const FRONT_REGIONS = [
    {
      id: 'chest',
      // Göğüs — klavikul altı, sternum yanlarda
      clips: [
        'M 148 195 Q 170 185 200 192 Q 200 230 192 245 Q 175 255 158 248 Q 145 238 143 220 Z',
        'M 252 195 Q 230 185 200 192 Q 200 230 208 245 Q 225 255 242 248 Q 255 238 257 220 Z',
      ]
    },
    {
      id: 'shoulders',
      clips: [
        'M 130 178 Q 148 168 155 180 Q 158 198 152 212 Q 142 220 132 214 Q 120 204 122 188 Z',
        'M 270 178 Q 252 168 245 180 Q 242 198 248 212 Q 258 220 268 214 Q 280 204 278 188 Z',
      ]
    },
    {
      id: 'arms',
      clips: [
        // Sol bicep
        'M 114 220 Q 124 215 130 225 Q 135 248 132 268 Q 128 280 118 278 Q 108 272 108 252 Q 108 232 114 220 Z',
        // Sağ bicep
        'M 286 220 Q 276 215 270 225 Q 265 248 268 268 Q 272 280 282 278 Q 292 272 292 252 Q 292 232 286 220 Z',
        // Sol önkol
        'M 105 285 Q 116 282 120 292 Q 124 315 122 338 Q 118 350 110 348 Q 100 342 100 320 Q 99 300 105 285 Z',
        // Sağ önkol
        'M 295 285 Q 284 282 280 292 Q 276 315 278 338 Q 282 350 290 348 Q 300 342 300 320 Q 301 300 295 285 Z',
      ]
    },
    {
      id: 'core',
      clips: [
        // Rectus abdominis
        'M 172 252 Q 200 248 228 252 Q 232 290 228 328 Q 214 340 200 342 Q 186 340 172 328 Q 168 290 172 252 Z',
        // Sol oblique
        'M 148 255 Q 168 252 172 268 Q 172 300 168 325 Q 158 335 148 328 Q 136 316 136 295 Q 135 272 148 255 Z',
        // Sağ oblique
        'M 252 255 Q 232 252 228 268 Q 228 300 232 325 Q 242 335 252 328 Q 264 316 264 295 Q 265 272 252 255 Z',
      ]
    },
    {
      id: 'legs',
      clips: [
        // Sol quad
        'M 148 355 Q 172 348 182 358 Q 188 390 186 430 Q 182 460 174 472 Q 160 478 150 468 Q 140 452 138 420 Q 135 388 148 355 Z',
        // Sağ quad
        'M 252 355 Q 228 348 218 358 Q 212 390 214 430 Q 218 460 226 472 Q 240 478 250 468 Q 260 452 262 420 Q 265 388 252 355 Z',
        // Sol baldır
        'M 150 490 Q 168 485 176 496 Q 180 520 178 555 Q 174 575 164 580 Q 152 578 146 562 Q 140 540 142 515 Q 143 498 150 490 Z',
        // Sağ baldır
        'M 250 490 Q 232 485 224 496 Q 220 520 222 555 Q 226 575 236 580 Q 248 578 254 562 Q 260 540 258 515 Q 257 498 250 490 Z',
      ]
    },
  ]

  const BACK_REGIONS = [
    {
      id: 'back',
      clips: [
        // Trapez üst
        'M 155 178 Q 200 168 245 178 Q 248 198 245 215 Q 222 225 200 228 Q 178 225 155 215 Q 152 198 155 178 Z',
        // Sol lat
        'M 135 218 Q 155 215 162 228 Q 165 265 160 295 Q 154 310 144 308 Q 130 298 128 272 Q 126 245 135 218 Z',
        // Sağ lat
        'M 265 218 Q 245 215 238 228 Q 235 265 240 295 Q 246 310 256 308 Q 270 298 272 272 Q 274 245 265 218 Z',
        // Alt sırt (erector)
        'M 178 230 Q 200 225 222 230 Q 228 265 225 295 Q 212 308 200 310 Q 188 308 175 295 Q 172 265 178 230 Z',
      ]
    },
    {
      id: 'shoulders',
      clips: [
        'M 128 178 Q 148 168 156 182 Q 158 200 150 215 Q 138 222 126 215 Q 115 205 118 188 Z',
        'M 272 178 Q 252 168 244 182 Q 242 200 250 215 Q 262 222 274 215 Q 285 205 282 188 Z',
      ]
    },
    {
      id: 'arms',
      clips: [
        'M 110 222 Q 122 218 128 230 Q 132 255 128 275 Q 122 285 112 282 Q 102 275 102 255 Q 102 235 110 222 Z',
        'M 290 222 Q 278 218 272 230 Q 268 255 272 275 Q 278 285 288 282 Q 298 275 298 255 Q 298 235 290 222 Z',
        'M 104 288 Q 115 284 120 295 Q 124 318 120 342 Q 115 355 106 352 Q 96 345 96 322 Q 95 302 104 288 Z',
        'M 296 288 Q 285 284 280 295 Q 276 318 280 342 Q 285 355 294 352 Q 304 345 304 322 Q 305 302 296 288 Z',
      ]
    },
    {
      id: 'legs',
      clips: [
        // Sol hamstring
        'M 148 358 Q 172 352 180 362 Q 185 395 182 432 Q 178 460 168 470 Q 155 474 146 462 Q 136 445 136 415 Q 134 385 148 358 Z',
        // Sağ hamstring
        'M 252 358 Q 228 352 220 362 Q 215 395 218 432 Q 222 460 232 470 Q 245 474 254 462 Q 264 445 264 415 Q 266 385 252 358 Z',
        // Sol baldır arka
        'M 148 488 Q 166 482 174 494 Q 178 518 175 553 Q 170 574 160 578 Q 148 576 142 560 Q 137 538 140 512 Q 142 496 148 488 Z',
        // Sağ baldır arka
        'M 252 488 Q 234 482 226 494 Q 222 518 225 553 Q 230 574 240 578 Q 252 576 258 560 Q 263 538 260 512 Q 258 496 252 488 Z',
      ]
    },
    {
      id: 'core',
      clips: [
        'M 170 310 Q 200 306 230 310 Q 232 340 228 365 Q 214 374 200 375 Q 186 374 172 365 Q 168 340 170 310 Z',
      ]
    },
  ]

  const regions = side === 'front' ? FRONT_REGIONS : BACK_REGIONS
  const imgSrc  = side === 'front' ? '/muscle_front.png' : '/muscle_back.png'

  return (
    <div style={{ position:'relative', width:'100%', maxWidth:220, margin:'0 auto' }}>

      {/* Ön/Arka toggle */}
      <div style={{ display:'flex', gap:6, marginBottom:12, justifyContent:'center' }}>
        {['front','back'].map(s => (
          <button key={s} onClick={() => { setSide(s); onSelect(null) }} style={{
            padding:'5px 16px', borderRadius:20,
            border:`1px solid ${side===s ? 'var(--accent)' : 'var(--border)'}`,
            background: side===s ? 'var(--accent-dim)' : 'transparent',
            color: side===s ? 'var(--accent)' : 'var(--text-muted)',
            fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:1.5,
            cursor:'pointer', transition:'all .15s', textTransform:'uppercase',
          }}>
            {s === 'front' ? 'Ön' : 'Arka'}
          </button>
        ))}
      </div>

      {/* Görsel + overlay container */}
      <div style={{ position:'relative', width:'100%' }}>
        {/* Anatomik görsel — beyaz bg'yi karanlıkta gizle */}
        <img
          src={imgSrc}
          alt="Kas haritası"
          style={{
            width: '100%',
            display: 'block',
            borderRadius: 12,
            // Beyaz arka planı kaldır: koyu temada multiply, açık temada normal
            mixBlendMode: 'screen',
            filter: 'invert(1) contrast(0.85) brightness(0.9)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        {/* Tıklanabilir SVG overlay */}
        <svg
          viewBox="0 0 400 820"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position:'absolute', inset:0,
            width:'100%', height:'100%',
          }}
        >
          {regions.map(region => (
            <g key={region.id} onClick={() => onSelect(region.id)} style={{ cursor:'pointer' }}>
              {region.clips.map((d, i) => {
                const isActive = activeGroup === region.id
                const color = mg(region.id)?.color || 'white'
                return (
                  <path
                    key={i}
                    d={d}
                    fill={isActive ? `${color}50` : 'rgba(255,255,255,0)'}
                    stroke={isActive ? color : 'rgba(255,255,255,0)'}
                    strokeWidth={isActive ? '2' : '0'}
                    style={{ transition:'all .2s ease', filter: isActive ? `drop-shadow(0 0 6px ${color})` : 'none' }}
                  />
                )
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Aktif kas etiketi */}
      {activeGroup && (
        <div style={{
          textAlign:'center', marginTop:10,
          fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:2,
          color: mg(activeGroup)?.color,
        }}>
          {mg(activeGroup)?.label?.toUpperCase()}
        </div>
      )}
    </div>
  )
}

// ── Hareket Detay Modalı (YouTube + Statik Form) ──
function ExerciseDetailModal({ exercise, group, onClose }) {
  const [ytVideos, setYtVideos] = useState(null)
  const [loadingYt, setLoadingYt] = useState(true)
  const [activeSection, setActiveSection] = useState('form')
  const form = getForm(exercise)

  // YouTube arama
  useState(() => {
    const fetchVideo = async () => {
      try {
        const q = encodeURIComponent(`${exercise} form tutorial nasıl yapılır`)
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=3&key=${GKEY}`
        )
        if (res.ok) {
          const data = await res.json()
          setYtVideos(data.items || [])
        }
      } catch { setYtVideos([]) }
      setLoadingYt(false)
    }
    fetchVideo()
  })

  const groupColor = group?.color || 'var(--accent)'

  const SectionBtn = ({ id, label }) => (
    <button onClick={() => setActiveSection(id)} style={{
      flex:1, padding:'8px 6px', borderRadius:8, border:'none',
      background: activeSection===id ? 'var(--surface3)' : 'transparent',
      color: activeSection===id ? 'var(--text)' : 'var(--text-muted)',
      fontFamily:"'Space Grotesk',sans-serif", fontWeight: activeSection===id ? 600 : 400,
      fontSize:12, cursor:'pointer', transition:'all .15s',
    }}>
      {label}
    </button>
  )

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:600,
      background:'rgba(0,0,0,.82)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'flex-end',
      animation:'fadeIn .2s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width:'100%', maxWidth:640, margin:'0 auto',
        background:'var(--surface)', borderRadius:'20px 20px 0 0',
        border:'1px solid var(--border)', borderBottom:'none',
        maxHeight:'92vh', overflowY:'auto',
        animation:'slideUp .28s cubic-bezier(.4,0,.2,1)',
      }}>
        {/* Header */}
        <div style={{
          padding:'18px 18px 12px',
          borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          position:'sticky', top:0, background:'var(--surface)', zIndex:1,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:4, height:32, borderRadius:2, background:groupColor }}/>
            <div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:17, color:'var(--text)' }}>{exercise}</div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:groupColor, letterSpacing:2, marginTop:1 }}>
                {group?.label?.toUpperCase() || 'HAREKET'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:'var(--surface2)', border:'1px solid var(--border)',
            borderRadius:10, width:30, height:30, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Icon name="x" size={14} color="var(--text-muted)"/>
          </button>
        </div>

        {/* Tab seçici */}
        <div style={{ display:'flex', gap:4, padding:'10px 14px 0', background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
          <SectionBtn id="form" label="📋 Form"/>
          <SectionBtn id="video" label="▶ Video"/>
        </div>

        <div style={{ padding:'16px 18px 24px' }}>

          {/* ── FORM BÖLÜMÜ (statik) ── */}
          {activeSection === 'form' && (
            <div className="animate-fade">
              {[
                { label:'🏁 Başlangıç Pozisyonu', text: form.start, color:'rgba(255,255,255,.06)' },
                { label:'⚡ Hareket', text: form.move, color:'rgba(59,130,246,.06)' },
                { label:'💨 Nefes', text: form.breath, color:'rgba(6,182,212,.06)' },
              ].map(({ label, text, color }) => (
                <div key={label} style={{ background:color, border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px', marginBottom:10 }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'var(--text)', marginBottom:8 }}>{label}</div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:'var(--text-dim)', lineHeight:1.75 }}>{text}</div>
                </div>
              ))}

              {/* Sık yapılan hatalar */}
              <div style={{ background:'rgba(239,68,68,.05)', border:'1px solid rgba(239,68,68,.15)', borderRadius:12, padding:'14px 16px', marginBottom:10 }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'var(--red)', marginBottom:8 }}>⚠️ Sık Yapılan Hatalar</div>
                {form.mistakes.map((m, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom: i < form.mistakes.length-1 ? 6 : 0 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--red)', flexShrink:0, marginTop:6 }}/>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:'var(--text-dim)', lineHeight:1.6 }}>{m}</div>
                  </div>
                ))}
              </div>

              {/* Pro ipucu */}
              <div style={{ background:'rgba(34,197,94,.05)', border:'1px solid rgba(34,197,94,.2)', borderRadius:12, padding:'14px 16px' }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'var(--green)', marginBottom:8 }}>💡 Pro İpucu</div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:'var(--text-dim)', lineHeight:1.75, fontStyle:'italic' }}>"{form.tip}"</div>
              </div>
            </div>
          )}

          {/* ── VİDEO BÖLÜMÜ ── */}
          {activeSection === 'video' && (
            <div className="animate-fade">
              {loadingYt ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[1,2].map(i => (
                    <div key={i} style={{ height:160, background:'var(--surface2)', borderRadius:12, border:'1px solid var(--border)', animation:'pulse 1.5s ease infinite' }}/>
                  ))}
                </div>
              ) : ytVideos?.length > 0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {ytVideos.map(v => (
                    <div key={v.id.videoId}
                      onClick={() => window.open(`https://youtube.com/watch?v=${v.id.videoId}`, '_blank')}
                      style={{ borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', cursor:'pointer' }}>
                      <div style={{ position:'relative', aspectRatio:'16/9' }}>
                        <img src={v.snippet.thumbnails.medium.url} alt={v.snippet.title}
                          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(239,68,68,.9)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Icon name="play" size={20} color="white" strokeWidth={2.5}/>
                          </div>
                        </div>
                      </div>
                      <div style={{ padding:'10px 12px', background:'var(--surface2)' }}>
                        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, fontWeight:500, color:'var(--text)', lineHeight:1.4, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                          {v.snippet.title}
                        </div>
                        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--text-muted)', marginTop:4 }}>{v.snippet.channelTitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'32px 0' }}>
                  <Icon name="film" size={32} color="var(--text-muted)" style={{ margin:'0 auto 12px' }}/>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:'var(--text-muted)', marginBottom:12 }}>Video bulunamadı</div>
                  <a href={`https://youtube.com/results?search_query=${encodeURIComponent(exercise + ' form nasıl yapılır')}`}
                    target="_blank" rel="noreferrer"
                    style={{ color:'var(--blue)', fontFamily:"'Space Mono',monospace", fontSize:11, textDecoration:'none' }}>
                    YouTube'da ara →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ANA SAYFA ──
export default function ExercisesPage() {
  const [view, setView]               = useState('map')
  const [activeGroup, setActiveGroup] = useState(null)
  const [search, setSearch]           = useState('')
  const [selectedEx, setSelectedEx]   = useState(null)
  const searchRef = useRef(null)

  const filtered = (() => {
    if (search.trim()) {
      const q = search.toLowerCase()
      return MUSCLE_GROUPS.flatMap(g => g.exercises.filter(e => e.toLowerCase().includes(q)).map(e => ({ ex:e, group:g })))
    }
    if (activeGroup) {
      const g = MUSCLE_GROUPS.find(m => m.id === activeGroup)
      return g ? g.exercises.map(e => ({ ex:e, group:g })) : []
    }
    return MUSCLE_GROUPS.flatMap(g => g.exercises.map(e => ({ ex:e, group:g })))
  })()

  const selectedGroup = selectedEx ? MUSCLE_GROUPS.find(g => g.exercises.includes(selectedEx)) : null

  return (
    <div className="page animate-fade" style={{ maxWidth:640, paddingBottom:80 }}>

      {/* Başlık + arama */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:24, color:'var(--text)', marginBottom:4 }}>Hareketler</div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'var(--text-muted)', letterSpacing:2 }}>KAS GRUBU SEÇ VEYA ARA</div>
      </div>

      {/* Arama */}
      <div style={{ position:'relative', marginBottom:12 }}>
        <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
          <Icon name="search" size={15} color="var(--text-muted)" strokeWidth={1.8}/>
        </div>
        <input ref={searchRef} type="text" value={search}
          onChange={e => { setSearch(e.target.value); if (e.target.value) { setView('list'); setActiveGroup(null) } }}
          placeholder="Hareket ara... (bench press, squat...)"
          style={{ paddingLeft:38, paddingRight: search ? 38 : 12 }}
        />
        {search && (
          <button onClick={() => { setSearch(''); searchRef.current?.focus() }} style={{
            position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', alignItems:'center',
          }}>
            <Icon name="x" size={13} color="var(--text-muted)"/>
          </button>
        )}
      </div>

      {/* View toggle */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[
          { id:'map',  label:'Kas Haritası', icon:'body'   },
          { id:'list', label:'Tüm Liste',    icon:'search' },
        ].map(({ id, label, icon }) => (
          <button key={id} onClick={() => { setView(id); if(id==='map') setSearch('') }} style={{
            flex:1, padding:'9px 8px', borderRadius:10,
            border:`1px solid ${view===id ? 'var(--accent)' : 'var(--border)'}`,
            background: view===id ? 'var(--accent-dim)' : 'transparent',
            color: view===id ? 'var(--accent)' : 'var(--text-muted)',
            fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:12,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            transition:'all .15s',
          }}>
            <Icon name={icon} size={14} color={view===id ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth={view===id ? 2 : 1.6}/>
            {label}
          </button>
        ))}
      </div>

      {/* ── KAS HARİTASI ── */}
      {view === 'map' && (
        <div className="animate-fade">
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16, justifyContent:'center' }}>
            {MUSCLE_GROUPS.map(mg => (
              <button key={mg.id} onClick={() => setActiveGroup(prev => prev===mg.id ? null : mg.id)} style={{
                padding:'5px 12px', borderRadius:20,
                border:`1px solid ${activeGroup===mg.id ? mg.color : 'var(--border)'}`,
                background: activeGroup===mg.id ? `${mg.color}18` : 'transparent',
                color: activeGroup===mg.id ? mg.color : 'var(--text-muted)',
                fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:11,
                cursor:'pointer', transition:'all .15s',
              }}>
                {mg.label}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
            <MuscleMapSVG activeGroup={activeGroup} onSelect={(id) => setActiveGroup(prev => prev===id ? null : id)}/>
          </div>

          {activeGroup && (() => {
            const mg = MUSCLE_GROUPS.find(m => m.id === activeGroup)
            return (
              <div className="animate-fade">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:mg.color }}>
                    {mg.label} Hareketleri
                  </div>
                  <button onClick={() => setView('list')} style={{
                    fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--text-muted)',
                    background:'none', border:'none', cursor:'pointer',
                  }}>tümünü gör →</button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {mg.exercises.map(ex => (
                    <div key={ex} onClick={() => setSelectedEx(ex)} style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'12px 14px', borderRadius:10,
                      border:'1px solid var(--border)', background:'var(--surface)',
                      cursor:'pointer', transition:'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=mg.color; e.currentTarget.style.background=`${mg.color}08` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)' }}
                    >
                      <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:14, color:'var(--text)' }}>{ex}</span>
                      <Icon name="arrowRight" size={15} color="var(--text-muted)" strokeWidth={1.5}/>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {!activeGroup && (
            <div style={{ textAlign:'center', padding:'8px 0' }}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'var(--text-muted)', letterSpacing:1.5 }}>
                Kas grubuna dokun veya yukarıdan seç
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LİSTE ── */}
      {view === 'list' && (
        <div className="animate-fade">
          {!search && (
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8, marginBottom:12 }}>
              <button onClick={() => setActiveGroup(null)} style={{
                padding:'5px 12px', borderRadius:20, flexShrink:0,
                border:`1px solid ${!activeGroup ? 'var(--accent)' : 'var(--border)'}`,
                background:!activeGroup ? 'var(--accent-dim)' : 'transparent',
                color:!activeGroup ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:11, cursor:'pointer',
              }}>Tümü</button>
              {MUSCLE_GROUPS.map(mg => (
                <button key={mg.id} onClick={() => setActiveGroup(mg.id)} style={{
                  padding:'5px 12px', borderRadius:20, flexShrink:0,
                  border:`1px solid ${activeGroup===mg.id ? mg.color : 'var(--border)'}`,
                  background:activeGroup===mg.id ? `${mg.color}18` : 'transparent',
                  color:activeGroup===mg.id ? mg.color : 'var(--text-muted)',
                  fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:11, cursor:'pointer',
                }}>{mg.label}</button>
              ))}
            </div>
          )}

          {search && filtered.length===0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ fontSize:32 }}>🔍</div>
              <div className="empty-title">Sonuç bulunamadı</div>
              <div className="empty-sub">"{search}" için egzersiz yok</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {filtered.map(({ex, group}) => (
                <div key={ex} onClick={() => setSelectedEx(ex)} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'12px 14px', borderRadius:12,
                  border:'1px solid var(--border)', background:'var(--surface)',
                  cursor:'pointer', transition:'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=group.color; e.currentTarget.style.background=`${group.color}08` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)' }}
                >
                  <div style={{ width:6, height:6, borderRadius:'50%', background:group.color, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:13, color:'var(--text)' }}>{ex}</div>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:group.color, letterSpacing:1.5, marginTop:2 }}>{group.label}</div>
                  </div>
                  <Icon name="arrowRight" size={14} color="var(--text-muted)" strokeWidth={1.5}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedEx && <ExerciseDetailModal exercise={selectedEx} group={selectedGroup} onClose={() => setSelectedEx(null)}/>}
    </div>
  )
}
