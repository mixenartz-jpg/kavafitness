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
  const findMG = (id) => MUSCLE_GROUPS.find(m => m.id === id)
  const [manualSide, setManualSide] = useState(null)
  const autoSide = activeGroup === 'back' ? 'back' : 'front'
  const side = manualSide !== null ? manualSide : (activeGroup ? autoSide : 'front')

  const handleSide = (s) => setManualSide(p => p === s ? null : s)
  const handleSelect = (id) => { setManualSide(null); onSelect(id) }

  // ── ÖN (347x581, merkez x=179) ──
  // Koordinatlar piksel analizi ile ölçüldü
  const FRONT = [
    { id:'chest', paths:[
      // Sol göğüs — x:112-179, y:108-185
      'M 118 108 C 145 100 178 104 178 104 L 176 172 C 158 182 130 176 114 162 C 102 150 106 122 118 108 Z',
      // Sağ göğüs — x:179-246, y:108-185  
      'M 240 108 C 213 100 180 104 180 104 L 182 172 C 200 182 228 176 244 162 C 256 150 252 122 240 108 Z',
    ]},
    { id:'shoulders', paths:[
      // Sol omuz — x:86-118, y:100-160
      'M 88 105 C 100 96 118 100 122 114 C 126 130 120 150 108 158 C 94 164 80 154 78 138 C 76 120 84 108 88 105 Z',
      // Sağ omuz — x:240-272, y:100-160
      'M 270 105 C 258 96 240 100 236 114 C 232 130 238 150 250 158 C 264 164 278 154 280 138 C 282 120 274 108 270 105 Z',
    ]},
    { id:'arms', paths:[
      // Sol üst kol — x:56-90, y:155-255
      'M 60 158 C 74 152 90 158 94 172 C 98 192 94 218 86 232 C 78 244 62 244 54 228 C 46 212 48 188 56 168 Z',
      // Sağ üst kol — x:268-302, y:155-255
      'M 298 158 C 284 152 268 158 264 172 C 260 192 264 218 272 232 C 280 244 296 244 304 228 C 312 212 310 188 302 168 Z',
      // Sol önkol — x:35-60, y:252-330
      'M 38 255 C 52 248 64 254 68 268 C 72 286 68 310 60 322 C 52 330 38 328 32 312 C 26 294 28 270 38 255 Z',
      // Sağ önkol — x:288-323, y:252-330
      'M 320 255 C 306 248 294 254 290 268 C 286 286 290 310 298 322 C 306 330 320 328 326 312 C 332 294 330 270 320 255 Z',
    ]},
    { id:'core', paths:[
      // Rectus abdominis — x:148-210, y:178-320
      'M 152 180 C 168 174 190 174 206 180 C 214 196 214 228 210 265 C 206 295 196 318 179 322 C 162 318 152 295 148 265 C 144 228 144 196 152 180 Z',
      // Sol oblique — x:114-152, y:190-305  
      'M 116 194 C 132 186 150 190 154 206 C 156 228 152 262 144 285 C 136 302 118 306 106 292 C 94 276 96 250 104 224 C 108 206 112 196 116 194 Z',
      // Sağ oblique — x:206-244, y:190-305
      'M 242 194 C 226 186 208 190 204 206 C 202 228 206 262 214 285 C 222 302 240 306 252 292 C 264 276 262 250 254 224 C 250 206 246 196 242 194 Z',
    ]},
    { id:'legs', paths:[
      // Sol quad — x:108-172, y:322-455
      'M 112 325 C 136 318 162 326 168 344 C 174 368 170 408 162 438 C 154 460 136 468 118 456 C 100 442 96 410 98 376 C 100 348 106 330 112 325 Z',
      // Sağ quad — x:186-250, y:322-455
      'M 246 325 C 222 318 196 326 190 344 C 184 368 188 408 196 438 C 204 460 222 468 240 456 C 258 442 262 410 260 376 C 258 348 252 330 246 325 Z',
      // Sol baldır — x:112-162, y:455-555
      'M 116 458 C 138 452 156 460 162 476 C 168 498 164 530 154 548 C 144 560 124 560 114 546 C 104 530 102 500 106 474 Z',
      // Sağ baldır — x:196-246, y:455-555
      'M 242 458 C 220 452 202 460 196 476 C 190 498 194 530 204 548 C 214 560 234 560 244 546 C 254 530 256 500 252 474 Z',
    ]},
  ]

  // ── ARKA (346x585, merkez x=171) ──
  const BACK = [
    { id:'back', paths:[
      // Trapez — x:112-229, y:90-165
      'M 118 92 C 142 82 200 82 224 92 C 234 108 230 138 220 154 C 202 166 140 166 122 154 C 112 138 108 108 118 92 Z',
      // Sol lat — x:63-118, y:160-270
      'M 66 164 C 84 156 110 162 118 178 C 126 198 122 235 112 256 C 102 272 80 274 64 258 C 48 240 50 210 56 182 Z',
      // Sağ lat — x:224-280, y:160-270
      'M 276 164 C 258 156 232 162 224 178 C 216 198 220 235 230 256 C 240 272 262 274 278 258 C 294 240 292 210 286 182 Z',
      // Alt sırt — x:122-220, y:262-320
      'M 126 265 C 148 258 194 258 216 265 C 224 282 220 308 210 320 C 196 330 146 330 132 320 C 122 308 118 282 126 265 Z',
    ]},
    { id:'shoulders', paths:[
      // Sol arka delt — x:63-118, y:92-165
      'M 66 96 C 82 82 112 88 120 104 C 128 122 122 146 108 156 C 90 162 68 152 60 134 C 54 116 60 100 66 96 Z',
      // Sağ arka delt — x:224-280, y:92-165
      'M 276 96 C 260 82 230 88 222 104 C 214 122 220 146 234 156 C 252 162 274 152 282 134 C 288 116 282 100 276 96 Z',
    ]},
    { id:'arms', paths:[
      // Sol tricep — x:45-90, y:160-260
      'M 48 164 C 66 156 86 164 90 180 C 94 200 88 228 78 244 C 68 256 48 254 38 236 C 28 218 32 192 40 172 Z',
      // Sağ tricep — x:252-298, y:160-260
      'M 294 164 C 276 156 256 164 252 180 C 248 200 254 228 264 244 C 274 256 294 254 304 236 C 314 218 310 192 302 172 Z',
      // Sol önkol arka — x:22-52, y:255-328
      'M 26 258 C 42 250 56 258 60 274 C 64 294 58 318 48 328 C 36 336 20 330 14 312 C 8 292 12 268 26 258 Z',
      // Sağ önkol arka — x:290-320, y:255-328
      'M 316 258 C 300 250 286 258 282 274 C 278 294 284 318 294 328 C 306 336 322 330 328 312 C 334 292 330 268 316 258 Z',
    ]},
    { id:'legs', paths:[
      // Sol hamstring — x:108-168, y:322-455
      'M 112 325 C 136 318 160 328 166 346 C 172 372 166 412 156 440 C 146 460 126 466 108 452 C 90 436 88 402 92 366 C 96 342 104 328 112 325 Z',
      // Sağ hamstring — x:174-234, y:322-455
      'M 230 325 C 206 318 182 328 176 346 C 170 372 176 412 186 440 C 196 460 216 466 234 452 C 252 436 254 402 250 366 C 246 342 238 328 230 325 Z',
      // Sol baldır arka — x:105-156, y:455-555
      'M 110 458 C 132 450 150 460 156 478 C 162 500 156 532 144 550 C 132 562 110 560 100 544 C 90 526 92 494 98 470 Z',
      // Sağ baldır arka — x:186-237, y:455-555
      'M 232 458 C 210 450 192 460 186 478 C 180 500 186 532 198 550 C 210 562 232 560 242 544 C 252 526 250 494 244 470 Z',
    ]},
    { id:'core', paths:[
      // Glute — x:118-224, y:318-390
      'M 124 322 C 148 314 194 314 218 322 C 228 342 226 370 216 386 C 200 400 142 400 126 386 C 116 370 114 342 124 322 Z',
    ]},
  ]

  const regions = side === 'front' ? FRONT : BACK
  const imgSrc  = side === 'front' ? '/muscle_front.png' : '/muscle_back.png'
  const vBox    = side === 'front' ? '0 0 347 581' : '0 0 346 585'

  return (
    <div style={{ width:'100%', maxWidth:220, margin:'0 auto' }}>
      {/* Ön / Arka toggle */}
      <div style={{ display:'flex', gap:6, marginBottom:12, justifyContent:'center' }}>
        {[['front','ÖN'],['back','ARKA']].map(([s,label]) => (
          <button key={s} onClick={() => handleSide(s)} style={{
            padding:'5px 18px', borderRadius:20,
            border:`1px solid ${side===s ? 'var(--accent)' : 'var(--border)'}`,
            background: side===s ? 'var(--accent-dim)' : 'transparent',
            color: side===s ? 'var(--accent)' : 'var(--text-muted)',
            fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2,
            cursor:'pointer', transition:'all .15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Görsel + Overlay */}
      <div style={{ position:'relative', width:'100%', lineHeight:0 }}>
        <img src={imgSrc} alt="Kas haritası" style={{
          width:'100%', display:'block', borderRadius:8,
          filter:'invert(1) brightness(0.9) contrast(1.05)',
          mixBlendMode:'screen',
          userSelect:'none', pointerEvents:'none',
        }}/>
        <svg viewBox={vBox} xmlns="http://www.w3.org/2000/svg"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
          {regions.map(({ id, paths }) => {
            const isActive = activeGroup === id
            const color = findMG(id)?.color || '#fff'
            return (
              <g key={id} onClick={() => handleSelect(id)} style={{ cursor:'pointer' }}>
                {paths.map((d, i) => (
                  <path key={i} d={d}
                    fill={isActive ? `${color}44` : 'rgba(255,255,255,.0)'}
                    stroke={isActive ? color : 'rgba(255,255,255,.0)'}
                    strokeWidth={isActive ? '2' : '0'}
                    style={{ transition:'all .2s', filter: isActive ? `drop-shadow(0 0 5px ${color}99)` : 'none' }}
                  />
                ))}
              </g>
            )
          })}
        </svg>
      </div>

      {activeGroup && (
        <div style={{ textAlign:'center', marginTop:10,
          fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:2.5,
          color: findMG(activeGroup)?.color, fontWeight:700 }}>
          {findMG(activeGroup)?.label?.toUpperCase()}
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
