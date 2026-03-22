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
    tip: 'Topukları aktif tut — topukla itmek quadriceps ile glute daha dengeli çalıştırır.',
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

const DEFAULT_FORM = {
  start: 'Dik ve dengeli bir başlangıç pozisyonu al. Eklemler hizalı, core aktif olsun.',
  move: '1) Hareketi kontrollü ve tam range of motion ile yap. 2) Kasın gerildiğini ve kasıldığını hisset. 3) Yavaş tempo kas gelişimi için daha verimlidir.',
  breath: 'Kasılma fazında nefes ver, uzama fazında al. Nefesini tutma.',
  mistakes: ['Momentum kullanmak', 'Yarım range of motion', 'Ağırlığı aşırı artırmak'],
  tip: 'Tekrar sayısından çok form kalitesine odaklan. Hafif ağırlıkla mükemmel form, ağır ağırlıkla kötü formdan daha değerlidir.',
}

function getForm(name) {
  return EXERCISE_FORMS[name] || DEFAULT_FORM
}

// ── Kas Grupları ──
const MUSCLE_GROUPS = [
  { id: 'chest',     label: 'Göğüs',   color: '#ef4444', exercises: ['Bench Press','İncline Bench Press','Decline Bench Press','Dumbbell Fly','Cable Crossover','Chest Dip','Push Up','Pec Deck'] },
  { id: 'back',      label: 'Sırt',    color: '#3b82f6', exercises: ['Deadlift','Barbell Row','Lat Pulldown','Pull-Up','Seated Cable Row','T-Bar Row','Dumbbell Row','Face Pull','Rack Pull'] },
  { id: 'shoulders', label: 'Omuz',    color: '#f59e0b', exercises: ['Overhead Press','Dumbbell Shoulder Press','Lateral Raise','Front Raise','Rear Delt Fly','Arnold Press','Shrug','Upright Row'] },
  { id: 'arms',      label: 'Kol',     color: '#8b5cf6', exercises: ['Bicep Curl','Barbell Curl','Hammer Curl','Preacher Curl','Tricep Pushdown','Skull Crusher','Overhead Tricep Extension','Dip','Close Grip Bench Press'] },
  { id: 'legs',      label: 'Bacak',   color: '#22c55e', exercises: ['Squat','Front Squat','Hack Squat','Leg Press','Romanian Deadlift','Leg Curl','Leg Extension','Hip Thrust','Lunge','Bulgarian Split Squat','Calf Raise'] },
  { id: 'core',      label: 'Core',    color: '#06b6d4', exercises: ['Plank','Crunch','Sit-Up','Leg Raise','Cable Crunch','Russian Twist','Ab Wheel','Hanging Leg Raise','Mountain Climber'] },
  { id: 'cardio',    label: 'Kardiyo', color: '#f97316', exercises: ['Koşu Bandı','Bisiklet','Kürek Makinesi','Elliptical','Battle Rope','Box Jump','Burpee','Kettlebell Swing','Jump Rope'] },
]

// ── Muscle Pill Chip ──
function MuscleChip({ mg, active, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
        border: `1px solid ${active ? mg.color : 'var(--border)'}`,
        background: active ? `${mg.color}18` : 'transparent',
        color: active ? mg.color : 'var(--text-muted)',
        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 12,
        transition: 'all .18s cubic-bezier(.4,0,.2,1)',
        flexShrink: 0,
        boxShadow: active ? `0 0 12px ${mg.color}28` : 'none',
        ...style,
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.borderColor = `${mg.color}60`
          e.currentTarget.style.color = mg.color
          e.currentTarget.style.background = `${mg.color}0e`
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-muted)'
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {mg.label}
    </button>
  )
}

// ── Kas Haritası SVG ──
function MuscleMapSVG({ activeGroup, onSelect }) {
  const findMG = (id) => MUSCLE_GROUPS.find(m => m.id === id)
  const [manualSide, setManualSide] = useState(null)
  const autoSide = activeGroup === 'back' ? 'back' : 'front'
  const side = manualSide !== null ? manualSide : (activeGroup ? autoSide : 'front')
  const handleSide = (s) => setManualSide(p => p === s ? null : s)
  const handleSelect = (id) => { setManualSide(null); onSelect(id) }
  const isA = (id) => activeGroup === id
  const col = (id) => findMG(id)?.color || '#fff'
  const es = (id) => ({
    fill: isA(id) ? col(id) + '42' : 'rgba(255,255,255,.04)',
    stroke: isA(id) ? col(id) : 'rgba(255,255,255,.08)',
    strokeWidth: isA(id) ? '1.5' : '1',
    cursor: 'pointer',
    transition: 'all .2s ease',
    filter: isA(id) ? `drop-shadow(0 0 6px ${col(id)}90)` : 'none',
  })

  const FRONT = {
    chest: [
      'M 175,100 L 168,98 L 155,97 L 140,100 L 128,107 L 118,116 L 112,130 L 110,148 L 112,162 L 118,174 L 128,183 L 142,189 L 156,192 L 168,193 L 175,190 Z',
      'M 175,100 L 182,98 L 195,97 L 210,100 L 222,107 L 232,116 L 238,130 L 240,148 L 238,162 L 232,174 L 222,183 L 208,189 L 194,192 L 182,193 L 175,190 Z',
    ],
    shoulders: [
      'M 118,100 L 108,104 L 98,112 L 90,124 L 86,140 L 85,155 L 88,166 L 96,172 L 104,168 L 110,155 L 112,140 L 114,126 L 118,112 Z',
      'M 232,100 L 242,104 L 252,112 L 260,124 L 264,140 L 265,155 L 262,166 L 254,172 L 246,168 L 240,155 L 238,140 L 236,126 L 232,112 Z',
    ],
    arms: [
      'M 88,170 L 82,184 L 76,200 L 68,218 L 60,236 L 54,252 L 50,264 L 56,270 L 64,264 L 70,248 L 76,232 L 84,214 L 90,196 L 96,180 L 98,172 Z',
      'M 262,170 L 268,184 L 274,200 L 282,218 L 290,236 L 296,252 L 300,264 L 294,270 L 286,264 L 280,248 L 274,232 L 266,214 L 260,196 L 254,180 L 252,172 Z',
      'M 50,264 L 46,278 L 42,292 L 38,306 L 35,318 L 33,330 L 38,334 L 44,322 L 48,308 L 52,294 L 56,280 L 58,270 Z',
      'M 300,264 L 304,278 L 308,292 L 312,306 L 315,318 L 317,330 L 312,334 L 306,322 L 302,308 L 298,294 L 294,280 L 292,270 Z',
    ],
    core: [
      'M 162,194 L 157,204 L 153,218 L 150,238 L 150,260 L 150,280 L 153,296 L 157,306 L 162,312 L 170,316 L 180,316 L 188,312 L 193,306 L 197,296 L 200,280 L 200,260 L 200,238 L 197,218 L 193,204 L 188,194 Z',
      'M 153,196 L 142,202 L 132,212 L 124,228 L 118,250 L 116,272 L 120,292 L 126,306 L 135,314 L 144,318 L 150,312 L 150,280 L 150,248 L 150,218 L 153,204 Z',
      'M 197,196 L 208,202 L 218,212 L 226,228 L 232,250 L 234,272 L 230,292 L 224,306 L 215,314 L 206,318 L 200,312 L 200,280 L 200,248 L 200,218 L 197,204 Z',
    ],
    legs: [
      'M 144,320 L 136,336 L 128,356 L 122,378 L 120,400 L 120,420 L 124,438 L 130,452 L 140,460 L 150,462 L 160,456 L 166,442 L 170,424 L 172,404 L 172,382 L 170,360 L 164,340 L 156,326 L 148,320 Z',
      'M 206,320 L 214,336 L 222,356 L 228,378 L 230,400 L 230,420 L 226,438 L 220,452 L 210,460 L 200,462 L 190,456 L 184,442 L 180,424 L 178,404 L 178,382 L 180,360 L 186,340 L 194,326 L 202,320 Z',
      'M 132,465 L 126,482 L 122,500 L 120,516 L 120,530 L 124,544 L 130,552 L 138,556 L 146,552 L 152,542 L 154,528 L 154,512 L 152,496 L 148,480 L 142,468 Z',
      'M 218,465 L 224,482 L 228,500 L 230,516 L 230,530 L 226,544 L 220,552 L 212,556 L 204,552 L 198,542 L 196,528 L 196,512 L 198,496 L 202,480 L 208,468 Z',
    ],
  }

  const BACK = {
    back: [
      'M 173,76 L 155,80 L 138,88 L 125,98 L 116,112 L 114,128 L 118,142 L 128,152 L 142,157 L 155,158 L 166,154 L 173,144 L 180,154 L 191,158 L 204,157 L 218,152 L 228,142 L 232,128 L 230,112 L 221,98 L 208,88 L 191,80 L 173,76 Z',
      'M 128,157 L 118,168 L 108,182 L 98,200 L 90,220 L 84,240 L 82,256 L 88,264 L 98,260 L 108,244 L 116,225 L 124,206 L 130,188 L 134,172 L 136,162 Z',
      'M 218,157 L 228,168 L 238,182 L 248,200 L 256,220 L 262,240 L 264,256 L 258,264 L 248,260 L 238,244 L 230,225 L 222,206 L 216,188 L 212,172 L 210,162 Z',
      'M 152,256 L 144,268 L 140,282 L 140,298 L 146,312 L 155,322 L 164,326 L 173,327 L 182,326 L 191,322 L 200,312 L 206,298 L 206,282 L 202,268 L 194,256 Z',
    ],
    shoulders: [
      'M 125,98 L 112,106 L 100,118 L 94,132 L 92,148 L 96,160 L 106,164 L 114,156 L 118,142 L 120,126 L 124,112 Z',
      'M 221,98 L 234,106 L 246,118 L 252,132 L 254,148 L 250,160 L 240,164 L 232,156 L 228,142 L 226,126 L 222,112 Z',
    ],
    arms: [
      'M 92,166 L 84,182 L 76,200 L 66,222 L 58,242 L 52,260 L 50,272 L 58,276 L 66,262 L 74,244 L 82,224 L 90,204 L 96,186 L 100,174 Z',
      'M 254,166 L 262,182 L 270,200 L 280,222 L 288,242 L 294,260 L 296,272 L 288,276 L 280,262 L 272,244 L 264,224 L 256,204 L 250,186 L 246,174 Z',
      'M 50,272 L 44,288 L 40,304 L 36,318 L 34,332 L 40,336 L 46,322 L 50,306 L 54,290 L 58,278 Z',
      'M 296,272 L 302,288 L 306,304 L 310,318 L 312,332 L 306,336 L 300,322 L 296,306 L 292,290 L 288,278 Z',
    ],
    legs: [
      'M 150,328 L 140,344 L 132,364 L 126,386 L 126,406 L 130,424 L 138,438 L 148,444 L 158,440 L 166,428 L 170,412 L 170,392 L 168,372 L 164,354 L 158,340 L 152,330 Z',
      'M 196,328 L 206,344 L 214,364 L 220,386 L 220,406 L 216,424 L 208,438 L 198,444 L 188,440 L 180,428 L 176,412 L 176,392 L 178,372 L 182,354 L 188,340 L 194,330 Z',
      'M 132,448 L 126,466 L 120,486 L 116,506 L 116,524 L 120,540 L 128,552 L 138,556 L 146,550 L 150,538 L 152,522 L 150,504 L 146,484 L 140,465 L 136,454 Z',
      'M 214,448 L 220,466 L 226,486 L 230,506 L 230,524 L 226,540 L 218,552 L 208,556 L 200,550 L 196,538 L 194,522 L 196,504 L 200,484 L 206,465 L 210,454 Z',
    ],
    core: [
      'M 152,318 L 142,328 L 134,342 L 130,358 L 132,374 L 138,386 L 148,392 L 160,390 L 170,380 L 174,366 L 174,350 L 172,336 L 166,326 L 158,320 Z',
      'M 194,318 L 204,328 L 212,342 L 216,358 L 214,374 L 208,386 L 198,392 L 186,390 L 176,380 L 172,366 L 172,350 L 174,336 L 180,326 L 188,320 Z',
    ],
  }

  const data = side === 'front' ? FRONT : BACK
  const vbox = side === 'front' ? '0 0 347 581' : '0 0 346 585'
  const imgSrc = side === 'front' ? '/muscle_front.png' : '/muscle_back.png'

  return (
    <div style={{ width: '100%', maxWidth: 220, margin: '0 auto' }}>
      {/* Ön/Arka toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, justifyContent: 'center' }}>
        {[['front', 'ÖN'], ['back', 'ARKA']].map(([s, label]) => (
          <button key={s} onClick={() => handleSide(s)} style={{
            padding: '5px 20px', borderRadius: 20,
            border: `1px solid ${side === s ? 'var(--accent)' : 'var(--border)'}`,
            background: side === s ? 'var(--accent-dim)' : 'transparent',
            color: side === s ? 'var(--accent)' : 'var(--text-muted)',
            fontFamily: 'Space Mono,monospace', fontSize: 9, letterSpacing: 2,
            cursor: 'pointer', transition: 'all .15s',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
        <img src={imgSrc} alt="kas haritası" style={{
          width: '100%', display: 'block', borderRadius: 12,
          filter: 'invert(1) brightness(0.9) contrast(1.1)',
          mixBlendMode: 'screen',
          userSelect: 'none', pointerEvents: 'none',
        }} />
        <svg viewBox={vbox} xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {Object.entries(data).map(([id, paths]) => (
            <g key={id} onClick={() => handleSelect(id)} style={{ cursor: 'pointer' }}>
              {paths.map((d, i) => (
                <path key={i} d={d} style={es(id)}
                  onMouseEnter={e => {
                    if (!isA(id)) {
                      e.currentTarget.style.fill = col(id) + '22'
                      e.currentTarget.style.stroke = col(id) + '80'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isA(id)) {
                      e.currentTarget.style.fill = 'rgba(255,255,255,.04)'
                      e.currentTarget.style.stroke = 'rgba(255,255,255,.08)'
                    }
                  }}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {activeGroup && (
        <div style={{
          textAlign: 'center', marginTop: 12,
          fontFamily: 'Space Mono,monospace', fontSize: 10, letterSpacing: 2.5,
          color: col(activeGroup), fontWeight: 700,
        }}>
          {MUSCLE_GROUPS.find(m => m.id === activeGroup)?.label?.toUpperCase()}
        </div>
      )}
    </div>
  )
}

// ── Egzersiz Detay Modal ──
function ExerciseDetailModal({ exercise, group, onClose }) {
  const [ytVideos, setYtVideos] = useState(null)
  const [loadingYt, setLoadingYt] = useState(true)
  const [activeSection, setActiveSection] = useState('form')
  const form = getForm(exercise)

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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fadeIn .2s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 640, margin: '0 auto',
        background: 'var(--surface)', borderRadius: '24px 24px 0 0',
        border: '1px solid var(--border)', borderBottom: 'none',
        maxHeight: '92vh', overflowY: 'auto',
        animation: 'slideUpSmooth .3s cubic-bezier(.34,1.18,.64,1)',
      }}>

        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border2)' }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '12px 20px 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 4, height: 36, borderRadius: 2, background: groupColor, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)', lineHeight: 1.2 }}>
                {exercise}
              </div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: groupColor, letterSpacing: 2, marginTop: 3 }}>
                {group?.label?.toUpperCase() || 'HAREKET'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 10, width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--surface3)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface2)' }}
          >
            <Icon name="x" size={14} color="var(--text-muted)" />
          </button>
        </div>

        {/* Tab seçici */}
        <div style={{ display: 'flex', gap: 0, background: 'var(--surface2)', margin: '0 20px', borderRadius: 10, padding: 3, marginTop: 14, marginBottom: 0 }}>
          {[
            { id: 'form', label: '📋 Form' },
            { id: 'video', label: '▶ Video' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveSection(id)} style={{
              flex: 1, padding: '8px 8px', borderRadius: 8, border: 'none',
              background: activeSection === id ? 'var(--surface)' : 'transparent',
              color: activeSection === id ? 'var(--text)' : 'var(--text-muted)',
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: activeSection === id ? 600 : 400,
              fontSize: 12, cursor: 'pointer', transition: 'all .15s',
              boxShadow: activeSection === id ? '0 1px 4px rgba(0,0,0,.2)' : 'none',
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px 20px 32px' }}>

          {/* ── FORM ── */}
          {activeSection === 'form' && (
            <div className="animate-fade">
              {[
                { label: '🏁 Başlangıç Pozisyonu', text: form.start, bg: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.08)' },
                { label: '⚡ Hareket', text: form.move, bg: 'rgba(59,130,246,.05)', border: 'rgba(59,130,246,.15)' },
                { label: '💨 Nefes', text: form.breath, bg: 'rgba(6,182,212,.05)', border: 'rgba(6,182,212,.15)' },
              ].map(({ label, text, bg, border }) => (
                <div key={label} style={{
                  background: bg, border: `1px solid ${border}`,
                  borderRadius: 14, padding: '14px 16px', marginBottom: 10,
                }}>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 12, color: 'var(--text)', marginBottom: 8 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.8 }}>
                    {text}
                  </div>
                </div>
              ))}

              {/* Hatalar */}
              <div style={{
                background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.18)',
                borderRadius: 14, padding: '14px 16px', marginBottom: 10,
              }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 12, color: '#f87171', marginBottom: 10 }}>
                  ⚠️ Sık Yapılan Hatalar
                </div>
                {form.mistakes.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: i < form.mistakes.length - 1 ? 8 : 0 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: 7 }} />
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.65 }}>{m}</div>
                  </div>
                ))}
              </div>

              {/* Pro ipucu */}
              <div style={{
                background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.2)',
                borderRadius: 14, padding: '14px 16px',
              }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 12, color: 'var(--green)', marginBottom: 8 }}>
                  💡 Pro İpucu
                </div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.8, fontStyle: 'italic' }}>
                  "{form.tip}"
                </div>
              </div>
            </div>
          )}

          {/* ── VİDEO ── */}
          {activeSection === 'video' && (
            <div className="animate-fade">
              {loadingYt ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1, 2].map(i => (
                    <div key={i} className="skeleton" style={{ height: 160, borderRadius: 14 }} />
                  ))}
                </div>
              ) : ytVideos?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ytVideos.map(v => (
                    <div key={v.id.videoId}
                      onClick={() => window.open(`https://youtube.com/watch?v=${v.id.videoId}`, '_blank')}
                      className="card-interactive"
                      style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer' }}>
                      <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                        <img src={v.snippet.thumbnails.medium.url} alt={v.snippet.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{
                            width: 52, height: 52, borderRadius: '50%',
                            background: 'rgba(239,68,68,.92)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(239,68,68,.5)',
                          }}>
                            <Icon name="play" size={22} color="white" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: '10px 14px', background: 'var(--surface2)' }}>
                        <div style={{
                          fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 500,
                          color: 'var(--text)', lineHeight: 1.45,
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                          {v.snippet.title}
                        </div>
                        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                          {v.snippet.channelTitle}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 36, marginBottom: 12, opacity: .4 }}>🎬</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                    Video bulunamadı
                  </div>
                  <a href={`https://youtube.com/results?search_query=${encodeURIComponent(exercise + ' form nasıl yapılır')}`}
                    target="_blank" rel="noreferrer"
                    style={{ color: 'var(--blue)', fontFamily: 'Space Mono,monospace', fontSize: 11, textDecoration: 'none' }}>
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

// ── Egzersiz Satırı ──
function ExerciseRow({ ex, group, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card-interactive"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px', borderRadius: 14,
        border: '1px solid var(--border)', background: 'var(--surface)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${group.color}50`
        e.currentTarget.style.background = `${group.color}08`
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,.3), 0 0 0 1px ${group.color}18`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.background = 'var(--surface)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: group.color, flexShrink: 0, boxShadow: `0 0 6px ${group.color}60` }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>{ex}</div>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: group.color, letterSpacing: 1.5, marginTop: 2 }}>{group.label}</div>
      </div>
      <Icon name="arrowRight" size={14} color="var(--text-muted)" strokeWidth={1.5} />
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
      return MUSCLE_GROUPS.flatMap(g => g.exercises.filter(e => e.toLowerCase().includes(q)).map(e => ({ ex: e, group: g })))
    }
    if (activeGroup) {
      const g = MUSCLE_GROUPS.find(m => m.id === activeGroup)
      return g ? g.exercises.map(e => ({ ex: e, group: g })) : []
    }
    return MUSCLE_GROUPS.flatMap(g => g.exercises.map(e => ({ ex: e, group: g })))
  })()

  const selectedGroup = selectedEx ? MUSCLE_GROUPS.find(g => g.exercises.includes(selectedEx)) : null

  return (
    <div className="page animate-fade" style={{ maxWidth: 640, paddingBottom: 80 }}>

      {/* ── BAŞLIK ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>💪</div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text)', lineHeight: 1.1 }}>
              Hareketler
            </div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, marginTop: 2 }}>
              {MUSCLE_GROUPS.reduce((s, g) => s + g.exercises.length, 0)} EGZERSİZ · 7 KAS GRUBU
            </div>
          </div>
        </div>
      </div>

      {/* ── ARAMA ── */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <Icon name="search" size={15} color="var(--text-muted)" strokeWidth={1.8} />
        </div>
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            if (e.target.value) { setView('list'); setActiveGroup(null) }
          }}
          placeholder="Hareket ara... (bench press, squat...)"
          style={{ paddingLeft: 40, paddingRight: search ? 40 : 14, borderRadius: 14 }}
        />
        {search && (
          <button onClick={() => { setSearch(''); searchRef.current?.focus() }} style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            display: 'flex', alignItems: 'center',
          }}>
            <Icon name="x" size={13} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* ── VIEW TOGGLE ── */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 4, marginBottom: 20 }}>
        {[
          { id: 'map',  label: 'Kas Haritası', icon: 'body'   },
          { id: 'list', label: 'Tüm Liste',    icon: 'search' },
        ].map(({ id, label, icon }) => (
          <button key={id} onClick={() => { setView(id); if (id === 'map') setSearch('') }} style={{
            flex: 1, padding: '9px 8px', borderRadius: 10,
            border: `1px solid ${view === id ? 'var(--border2)' : 'transparent'}`,
            background: view === id ? 'var(--surface2)' : 'transparent',
            color: view === id ? 'var(--text)' : 'var(--text-muted)',
            fontFamily: "'Space Grotesk',sans-serif", fontWeight: view === id ? 600 : 400, fontSize: 12,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all .18s',
          }}>
            <Icon name={icon} size={14} color={view === id ? 'var(--text)' : 'var(--text-muted)'} strokeWidth={view === id ? 2 : 1.6} />
            {label}
          </button>
        ))}
      </div>

      {/* ── KAS HARİTASI VIEW ── */}
      {view === 'map' && (
        <div className="animate-fade">

          {/* Kas grubu chip'leri */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 20, justifyContent: 'center' }}>
            {MUSCLE_GROUPS.map(mg => (
              <MuscleChip
                key={mg.id}
                mg={mg}
                active={activeGroup === mg.id}
                onClick={() => setActiveGroup(prev => prev === mg.id ? null : mg.id)}
              />
            ))}
          </div>

          {/* Silüet */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '20px 16px', marginBottom: 20,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: activeGroup
                ? `radial-gradient(ellipse at 50% 30%, ${MUSCLE_GROUPS.find(m => m.id === activeGroup)?.color}10 0%, transparent 70%)`
                : 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,.03) 0%, transparent 70%)',
              pointerEvents: 'none', transition: 'background .4s ease',
            }} />
            <MuscleMapSVG activeGroup={activeGroup} onSelect={(id) => setActiveGroup(prev => prev === id ? null : id)} />
          </div>

          {/* Seçili grup egzersizleri */}
          {activeGroup && (() => {
            const mg = MUSCLE_GROUPS.find(m => m.id === activeGroup)
            return (
              <div className="animate-fade">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: mg.color }} />
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: mg.color }}>
                      {mg.label} Hareketleri
                    </div>
                    <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--text-muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 7px' }}>
                      {mg.exercises.length}
                    </span>
                  </div>
                  <button onClick={() => setView('list')} style={{
                    fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--text-muted)',
                    background: 'none', border: 'none', cursor: 'pointer', letterSpacing: .5,
                  }}>tümünü gör →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {mg.exercises.map(ex => (
                    <ExerciseRow key={ex} ex={ex} group={mg} onClick={() => setSelectedEx(ex)} />
                  ))}
                </div>
              </div>
            )
          })()}

          {!activeGroup && (
            <div style={{ textAlign: 'center', padding: '4px 0 12px' }}>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.5 }}>
                Bir kas grubuna dokun veya yukarıdan seç
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LİSTE VIEW ── */}
      {view === 'list' && (
        <div className="animate-fade">
          {!search && (
            <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 8, marginBottom: 14 }}
              className="week-strip-row">
              <button onClick={() => setActiveGroup(null)} style={{
                padding: '6px 14px', borderRadius: 20, flexShrink: 0,
                border: `1px solid ${!activeGroup ? 'var(--accent)' : 'var(--border)'}`,
                background: !activeGroup ? 'var(--accent-dim)' : 'transparent',
                color: !activeGroup ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}>Tümü</button>
              {MUSCLE_GROUPS.map(mg => (
                <MuscleChip key={mg.id} mg={mg} active={activeGroup === mg.id} onClick={() => setActiveGroup(mg.id)} />
              ))}
            </div>
          )}

          {search && filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">Sonuç bulunamadı</div>
              <div className="empty-sub">"{search}" için egzersiz yok</div>
            </div>
          ) : (
            <>
              {!search && (
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 12 }}>
                  {filtered.length} HAREKET
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filtered.map(({ ex, group }) => (
                  <ExerciseRow key={ex + group.id} ex={ex} group={group} onClick={() => setSelectedEx(ex)} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {selectedEx && (
        <ExerciseDetailModal exercise={selectedEx} group={selectedGroup} onClose={() => setSelectedEx(null)} />
      )}
    </div>
  )
}
