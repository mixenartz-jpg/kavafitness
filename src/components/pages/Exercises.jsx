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
  const isA = (id) => activeGroup === id
  const col  = (id) => findMG(id)?.color || '#fff'
  const es   = (id) => ({
    fill:        isA(id) ? col(id) + '42' : 'transparent',
    stroke:      isA(id) ? col(id)        : 'transparent',
    strokeWidth: '1.2',
    cursor: 'pointer',
    transition: 'all .18s ease',
    filter: isA(id) ? `drop-shadow(0 0 4px ${col(id)}88)` : 'none',
  })

  // Anatomik SVG path verileri — silüet çizgilerine uygun poligonlar
  const FRONT = {
    chest: [
      // Sol pektoral
      'M 178,106 L 162,103 L 145,104 L 130,110 L 120,120 L 113,133 L 110,150 L 112,166 L 120,178 L 132,185 L 148,190 L 164,191 L 178,188 Z',
      // Sağ pektoral
      'M 178,106 L 194,103 L 211,104 L 226,110 L 236,120 L 243,133 L 246,150 L 244,166 L 236,178 L 224,185 L 208,190 L 192,191 L 178,188 Z',
    ],
    shoulders: [
      // Sol deltoid
      'M 120,108 L 108,114 L 97,125 L 90,140 L 88,156 L 92,168 L 100,170 L 108,162 L 113,148 L 116,132 L 120,120 Z',
      // Sağ deltoid
      'M 236,108 L 248,114 L 259,125 L 266,140 L 268,156 L 264,168 L 256,170 L 248,162 L 243,148 L 240,132 L 236,120 Z',
    ],
    arms: [
      // Sol bicep
      'M 92,168 L 83,186 L 73,208 L 63,230 L 55,250 L 52,262 L 58,266 L 68,255 L 78,235 L 86,212 L 93,192 L 100,175 Z',
      // Sağ bicep
      'M 264,168 L 273,186 L 283,208 L 293,230 L 301,250 L 304,262 L 298,266 L 288,255 L 278,235 L 270,212 L 263,192 L 256,175 Z',
      // Sol önkol
      'M 52,262 L 45,280 L 39,298 L 35,314 L 33,326 L 38,330 L 46,314 L 52,296 L 57,278 L 60,266 Z',
      // Sağ önkol
      'M 304,262 L 311,280 L 317,298 L 321,314 L 323,326 L 318,330 L 310,314 L 304,296 L 299,278 L 296,266 Z',
    ],
    core: [
      // Merkez karın
      'M 164,192 L 156,202 L 151,220 L 149,242 L 149,268 L 151,290 L 156,304 L 164,312 L 174,315 L 182,315 L 192,312 L 200,304 L 205,290 L 207,268 L 207,242 L 205,220 L 200,202 L 192,192 Z',
      // Sol oblik
      'M 151,196 L 139,202 L 127,214 L 120,234 L 116,260 L 120,284 L 126,300 L 135,310 L 146,314 L 151,306 L 151,260 L 151,220 Z',
      // Sağ oblik
      'M 205,196 L 217,202 L 229,214 L 236,234 L 240,260 L 236,284 L 230,300 L 221,310 L 210,314 L 205,306 L 205,260 L 205,220 Z',
    ],
    legs: [
      // Sol kuadriseps
      'M 142,318 L 132,334 L 124,358 L 120,384 L 120,410 L 124,434 L 130,448 L 138,456 L 150,458 L 160,450 L 166,434 L 170,410 L 170,384 L 168,358 L 162,338 L 154,322 Z',
      // Sağ kuadriseps
      'M 214,318 L 224,334 L 232,358 L 236,384 L 236,410 L 232,434 L 226,448 L 218,456 L 206,458 L 196,450 L 190,434 L 186,410 L 186,384 L 188,358 L 194,338 L 202,322 Z',
      // Sol baldır
      'M 130,462 L 124,480 L 120,500 L 118,520 L 120,538 L 126,550 L 134,556 L 144,552 L 150,540 L 152,522 L 150,502 L 146,482 L 140,466 Z',
      // Sağ baldır
      'M 226,462 L 232,480 L 236,500 L 238,520 L 236,538 L 230,550 L 222,556 L 212,552 L 206,540 L 204,522 L 206,502 L 210,482 L 216,466 Z',
    ],
  }

  const BACK = {
    back: [
      // Trapez
      'M 173,78 L 150,82 L 132,90 L 120,103 L 114,118 L 117,136 L 126,148 L 142,154 L 156,154 L 168,149 L 173,138 L 178,149 L 190,154 L 204,154 L 220,148 L 229,136 L 232,118 L 226,103 L 214,90 L 196,82 L 173,78 Z',
      // Sol lat
      'M 126,154 L 114,168 L 102,186 L 92,208 L 84,230 L 82,250 L 87,260 L 96,256 L 108,238 L 117,216 L 124,196 L 130,178 L 134,162 Z',
      // Sağ lat
      'M 220,154 L 232,168 L 244,186 L 254,208 L 262,230 L 264,250 L 259,260 L 250,256 L 238,238 L 229,216 L 222,196 L 216,178 L 212,162 Z',
      // Alt sırt
      'M 150,252 L 142,264 L 138,280 L 140,297 L 147,310 L 157,318 L 167,321 L 173,322 L 179,321 L 189,318 L 199,310 L 206,297 L 208,280 L 204,264 L 196,252 Z',
    ],
    shoulders: [
      // Sol arka deltoid
      'M 120,103 L 107,110 L 97,123 L 92,138 L 90,154 L 96,164 L 106,160 L 114,148 L 117,134 L 120,118 Z',
      // Sağ arka deltoid
      'M 226,103 L 239,110 L 249,123 L 254,138 L 256,154 L 250,164 L 240,160 L 232,148 L 229,134 L 226,118 Z',
    ],
    arms: [
      // Sol tricep
      'M 90,164 L 80,182 L 70,204 L 60,230 L 52,254 L 50,268 L 58,270 L 67,254 L 77,232 L 86,210 L 94,190 L 98,174 Z',
      // Sağ tricep
      'M 256,164 L 266,182 L 276,204 L 286,230 L 294,254 L 296,268 L 288,270 L 279,254 L 269,232 L 260,210 L 252,190 L 248,174 Z',
      // Sol önkol
      'M 50,268 L 44,284 L 38,302 L 34,318 L 32,332 L 38,335 L 46,318 L 52,300 L 58,282 L 60,270 Z',
      // Sağ önkol
      'M 296,268 L 302,284 L 308,302 L 312,318 L 314,332 L 308,335 L 300,318 L 294,300 L 288,282 L 286,270 Z',
    ],
    legs: [
      // Sol hamstring
      'M 147,324 L 137,342 L 128,364 L 124,388 L 126,410 L 132,428 L 140,438 L 150,440 L 160,432 L 166,418 L 168,398 L 166,374 L 162,352 L 157,338 L 152,328 Z',
      // Sağ hamstring
      'M 199,324 L 209,342 L 218,364 L 222,388 L 220,410 L 214,428 L 206,438 L 196,440 L 186,432 L 180,418 L 178,398 L 180,374 L 184,352 L 189,338 L 194,328 Z',
      // Sol baldır
      'M 132,442 L 124,462 L 118,484 L 114,508 L 116,530 L 122,548 L 132,558 L 142,553 L 148,538 L 150,518 L 148,494 L 144,472 L 138,452 Z',
      // Sağ baldır
      'M 214,442 L 222,462 L 228,484 L 232,508 L 230,530 L 224,548 L 214,558 L 204,553 L 198,538 L 196,518 L 198,494 L 202,472 L 208,452 Z',
    ],
    core: [
      // Sol glute
      'M 148,320 L 138,330 L 130,345 L 127,362 L 130,376 L 138,386 L 150,388 L 162,380 L 170,367 L 172,350 L 170,334 L 164,324 L 156,320 Z',
      // Sağ glute
      'M 198,320 L 208,330 L 216,345 L 219,362 L 216,376 L 208,386 L 196,388 L 184,380 L 176,367 L 174,350 L 176,334 L 182,324 L 190,320 Z',
    ],
  }

  const data   = side === 'front' ? FRONT : BACK
  const vbox   = side === 'front' ? '0 0 347 581' : '0 0 346 585'
  const imgSrc = side === 'front' ? '/muscle_front.png' : '/muscle_back.png'

  return (
    <div style={{ width:'100%', maxWidth:220, margin:'0 auto' }}>
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

      <div style={{ position:'relative', width:'100%', lineHeight:0 }}>
        <img src={imgSrc} alt="kas haritası" style={{
          width:'100%', display:'block', borderRadius:8,
          filter:'invert(1) brightness(0.9) contrast(1.1)',
          mixBlendMode:'screen',
          userSelect:'none', pointerEvents:'none',
        }}/>
        <svg viewBox={vbox} xmlns="http://www.w3.org/2000/svg"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
          {Object.entries(data).map(([id, paths]) => (
            <g key={id} onClick={() => handleSelect(id)} style={{cursor:'pointer'}}>
              {paths.map((d, i) => (
                <path key={i} d={d} style={es(id)}/>
              ))}
            </g>
          ))}
        </svg>
      </div>

      {activeGroup && (
        <div style={{ textAlign:'center', marginTop:10,
          fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:2.5,
          color: col(activeGroup), fontWeight:700 }}>
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
