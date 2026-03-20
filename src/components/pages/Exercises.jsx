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
  const findMG  = (id) => MUSCLE_GROUPS.find(m => m.id === id)
  const [manualSide, setManualSide] = useState(null)
  const autoSide = activeGroup === 'back' ? 'back' : 'front'
  const side = manualSide !== null ? manualSide : (activeGroup ? autoSide : 'front')
  const handleSide   = (s) => setManualSide(p => p === s ? null : s)
  const handleSelect = (id) => { setManualSide(null); onSelect(id) }

  const c = (id) => activeGroup === id
    ? { fill: `${findMG(id)?.color}50`, stroke: findMG(id)?.color, strokeWidth: '1.8', filter: `drop-shadow(0 0 5px ${findMG(id)?.color}aa)`, cursor: 'pointer', transition: 'all .2s' }
    : { fill: 'rgba(255,255,255,.0)', stroke: 'rgba(255,255,255,.0)', strokeWidth: '0', cursor: 'pointer', transition: 'all .2s' }

  return (
    <div style={{ width:'100%', maxWidth:240, margin:'0 auto' }}>
      {/* Ön / Arka */}
      <div style={{ display:'flex', gap:6, marginBottom:14, justifyContent:'center' }}>
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

      <svg viewBox="0 0 200 520" xmlns="http://www.w3.org/2000/svg"
        style={{ width:'100%', height:'auto', display:'block' }}>

        {/* ══ STATIK VÜCUT OUTLINE ══ */}
        <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round">

          {/* Baş */}
          <path d="M 100 12 C 86 12 77 20 76 31 C 75 42 79 52 85 56 C 88 58 90 62 90 66 L 110 66 C 110 62 112 58 115 56 C 121 52 125 42 124 31 C 123 20 114 12 100 12 Z"/>
          {/* Boyun */}
          <path d="M 90 66 C 90 70 88 74 88 76 L 112 76 C 112 74 110 70 110 66"/>
          {/* Trapez / omuz hattı */}
          <path d="M 88 76 C 80 78 70 82 62 90 C 55 97 52 106 52 114"/>
          <path d="M 112 76 C 120 78 130 82 138 90 C 145 97 148 106 148 114"/>
          {/* Göğüs yan */}
          <path d="M 52 114 C 50 125 50 138 52 150 C 54 160 56 168 60 174"/>
          <path d="M 148 114 C 150 125 150 138 148 150 C 146 160 144 168 140 174"/>
          {/* Göğüs orta hat */}
          <path d="M 88 76 C 90 82 96 86 100 86 C 104 86 110 82 112 76"/>
          <line x1="100" y1="86" x2="100" y2="178" strokeDasharray="2,3" strokeOpacity=".3"/>
          {/* Göğüs kas çizgileri */}
          <path d="M 88 96 C 92 92 100 90 108 96"/>
          <path d="M 86 108 C 90 104 100 102 110 108"/>
          <path d="M 86 120 C 90 116 100 114 110 120"/>
          {/* Gövde yan hatlar */}
          <path d="M 60 174 C 58 185 57 196 60 205 C 63 212 68 220 72 226"/>
          <path d="M 140 174 C 142 185 143 196 140 205 C 137 212 132 220 128 226"/>
          {/* Karın kas bölmeleri */}
          <path d="M 86 138 C 88 136 100 135 114 138"/>
          <path d="M 85 152 C 88 150 100 149 112 152"/>
          <path d="M 85 165 C 88 163 100 162 112 165"/>
          <path d="M 88 178 C 90 176 100 175 110 178"/>
          {/* Pelvis hattı */}
          <path d="M 72 226 C 78 234 88 238 100 239 C 112 238 122 234 128 226"/>
          {/* Kasık */}
          <path d="M 88 238 C 92 244 96 248 100 250"/>
          <path d="M 112 238 C 108 244 104 248 100 250"/>
          {/* Sol bacak */}
          <path d="M 72 226 C 68 238 66 254 67 272 C 68 290 70 308 72 322"/>
          <path d="M 92 240 C 90 255 89 272 90 290 C 91 308 92 318 93 326"/>
          {/* Diz sol */}
          <path d="M 72 322 C 74 330 78 335 83 337 C 88 338 92 336 93 326"/>
          <path d="M 75 337 C 76 342 77 348 78 352"/>
          <path d="M 85 338 C 86 343 86 348 86 352"/>
          {/* Sol alt bacak */}
          <path d="M 78 352 C 75 368 74 385 76 400 C 77 410 80 418 82 424"/>
          <path d="M 86 352 C 85 368 84 385 85 400 C 86 410 88 418 89 424"/>
          {/* Sol ayak */}
          <path d="M 82 424 C 78 428 72 432 68 435 C 64 438 62 442 64 446 C 68 450 86 452 92 448 C 96 445 96 440 94 435 C 92 430 90 426 89 424"/>
          {/* Sağ bacak */}
          <path d="M 128 226 C 132 238 134 254 133 272 C 132 290 130 308 128 322"/>
          <path d="M 108 240 C 110 255 111 272 110 290 C 109 308 108 318 107 326"/>
          {/* Diz sağ */}
          <path d="M 128 322 C 126 330 122 335 117 337 C 112 338 108 336 107 326"/>
          <path d="M 125 337 C 124 342 123 348 122 352"/>
          <path d="M 115 338 C 114 343 114 348 114 352"/>
          {/* Sağ alt bacak */}
          <path d="M 122 352 C 125 368 126 385 124 400 C 123 410 120 418 118 424"/>
          <path d="M 114 352 C 115 368 116 385 115 400 C 114 410 112 418 111 424"/>
          {/* Sağ ayak */}
          <path d="M 118 424 C 122 428 128 432 132 435 C 136 438 138 442 136 446 C 132 450 114 452 108 448 C 104 445 104 440 106 435 C 108 430 110 426 111 424"/>
          {/* Sol kol */}
          <path d="M 52 114 C 44 118 38 126 34 136 C 30 146 30 158 32 168 C 34 176 38 182 42 186"/>
          <path d="M 62 118 C 56 122 52 130 50 140 C 48 150 48 162 50 172 C 52 180 56 186 60 190"/>
          {/* Sol dirsek */}
          <path d="M 42 186 C 40 192 40 198 42 202 C 44 206 48 207 52 205"/>
          <path d="M 60 190 C 62 196 62 202 60 206 C 58 210 54 210 52 205"/>
          {/* Sol ön kol */}
          <path d="M 42 202 C 38 214 36 228 37 240 C 38 250 40 258 44 264"/>
          <path d="M 52 205 C 50 218 50 232 51 244 C 52 254 54 262 58 268"/>
          {/* Sol el */}
          <path d="M 44 264 C 42 270 40 276 40 282 C 40 288 44 292 50 293"/>
          <path d="M 58 268 C 60 274 60 280 58 286 C 56 290 52 292 50 293"/>
          <path d="M 40 282 C 38 286 37 290 39 293 M 44 285 C 43 290 43 294 45 296 M 48 287 C 47 292 47 296 49 298 M 52 286 C 52 291 52 295 53 297"/>
          {/* Sağ kol */}
          <path d="M 148 114 C 156 118 162 126 166 136 C 170 146 170 158 168 168 C 166 176 162 182 158 186"/>
          <path d="M 138 118 C 144 122 148 130 150 140 C 152 150 152 162 150 172 C 148 180 144 186 140 190"/>
          {/* Sağ dirsek */}
          <path d="M 158 186 C 160 192 160 198 158 202 C 156 206 152 207 148 205"/>
          <path d="M 140 190 C 138 196 138 202 140 206 C 142 210 146 210 148 205"/>
          {/* Sağ ön kol */}
          <path d="M 158 202 C 162 214 164 228 163 240 C 162 250 160 258 156 264"/>
          <path d="M 148 205 C 150 218 150 232 149 244 C 148 254 146 262 142 268"/>
          {/* Sağ el */}
          <path d="M 156 264 C 158 270 160 276 160 282 C 160 288 156 292 150 293"/>
          <path d="M 142 268 C 140 274 140 280 142 286 C 144 290 148 292 150 293"/>
          <path d="M 160 282 C 162 286 163 290 161 293 M 156 285 C 157 290 157 294 155 296 M 152 287 C 153 292 153 296 151 298 M 148 286 C 148 291 148 295 147 297"/>
        </g>

        {/* ══ KAS BÖLGELERİ — tıklanabilir ══ */}

        {/* GÖĞÜS */}
        {side === 'front' && <>
          <path d="M 89 80 C 78 84 66 92 62 106 C 58 118 62 132 70 140 C 78 148 90 150 98 148 L 98 88 C 95 84 92 80 89 80 Z"
            style={c('chest')} onClick={() => handleSelect('chest')}/>
          <path d="M 111 80 C 122 84 134 92 138 106 C 142 118 138 132 130 140 C 122 148 110 150 102 148 L 102 88 C 105 84 108 80 111 80 Z"
            style={c('chest')} onClick={() => handleSelect('chest')}/>
        </>}

        {/* OMUZLAR */}
        {side === 'front' && <>
          <path d="M 56 92 C 48 96 42 104 40 114 C 38 124 42 134 50 140 C 56 144 62 144 66 140 C 70 134 72 124 70 114 C 68 104 63 94 56 92 Z"
            style={c('shoulders')} onClick={() => handleSelect('shoulders')}/>
          <path d="M 144 92 C 152 96 158 104 160 114 C 162 124 158 134 150 140 C 144 144 138 144 134 140 C 130 134 128 124 130 114 C 132 104 137 94 144 92 Z"
            style={c('shoulders')} onClick={() => handleSelect('shoulders')}/>
        </>}
        {side === 'back' && <>
          <path d="M 56 92 C 46 98 40 108 40 118 C 40 128 46 136 56 140 C 64 142 72 138 76 130 C 78 122 76 110 68 100 C 64 94 60 90 56 92 Z"
            style={c('shoulders')} onClick={() => handleSelect('shoulders')}/>
          <path d="M 144 92 C 154 98 160 108 160 118 C 160 128 154 136 144 140 C 136 142 128 138 124 130 C 122 122 124 110 132 100 C 136 94 140 90 144 92 Z"
            style={c('shoulders')} onClick={() => handleSelect('shoulders')}/>
        </>}

        {/* KOL */}
        <path d="M 36 138 C 30 142 26 152 26 162 C 26 172 30 180 36 186 C 40 190 46 190 50 186 C 54 180 56 170 54 160 C 52 150 46 140 40 138 C 38 138 37 138 36 138 Z"
          style={c('arms')} onClick={() => handleSelect('arms')}/>
        <path d="M 164 138 C 170 142 174 152 174 162 C 174 172 170 180 164 186 C 160 190 154 190 150 186 C 146 180 144 170 146 160 C 148 150 154 140 160 138 C 162 138 163 138 164 138 Z"
          style={c('arms')} onClick={() => handleSelect('arms')}/>
        <path d="M 34 200 C 28 208 26 220 27 232 C 28 242 32 250 38 256 C 42 260 48 260 52 256 C 56 250 58 240 56 228 C 54 218 48 206 42 200 C 39 198 36 198 34 200 Z"
          style={c('arms')} onClick={() => handleSelect('arms')}/>
        <path d="M 166 200 C 172 208 174 220 173 232 C 172 242 168 250 162 256 C 158 260 152 260 148 256 C 144 250 142 240 144 228 C 146 218 152 206 158 200 C 161 198 164 198 166 200 Z"
          style={c('arms')} onClick={() => handleSelect('arms')}/>

        {/* CORE */}
        {side === 'front' && <>
          <path d="M 88 132 C 84 138 82 148 82 158 C 82 168 84 177 88 182 C 92 186 100 188 108 184 C 114 180 116 170 116 160 C 116 150 114 140 110 134 C 106 128 94 128 88 132 Z"
            style={c('core')} onClick={() => handleSelect('core')}/>
          <path d="M 70 142 C 64 148 62 158 63 168 C 64 178 68 186 74 190 C 80 194 86 192 88 186 C 86 178 84 168 84 158 C 84 150 86 142 88 136 C 82 136 74 138 70 142 Z"
            style={c('core')} onClick={() => handleSelect('core')}/>
          <path d="M 130 142 C 136 148 138 158 137 168 C 136 178 132 186 126 190 C 120 194 114 192 112 186 C 114 178 116 168 116 158 C 116 150 114 142 112 136 C 118 136 126 138 130 142 Z"
            style={c('core')} onClick={() => handleSelect('core')}/>
        </>}
        {side === 'back' && <>
          <path d="M 86 230 C 82 238 82 248 84 256 C 86 264 90 270 96 272 C 102 274 108 270 112 262 C 116 254 116 244 114 236 C 112 228 106 224 100 224 C 94 224 88 226 86 230 Z"
            style={c('core')} onClick={() => handleSelect('core')}/>
        </>}

        {/* SIRT */}
        {side === 'back' && <>
          <path d="M 76 82 C 68 86 64 94 64 104 C 64 112 68 120 76 126 C 84 130 94 132 100 130 L 100 78 C 92 76 82 78 76 82 Z"
            style={c('back')} onClick={() => handleSelect('back')}/>
          <path d="M 124 82 C 132 86 136 94 136 104 C 136 112 132 120 124 126 C 116 130 106 132 100 130 L 100 78 C 108 76 118 78 124 82 Z"
            style={c('back')} onClick={() => handleSelect('back')}/>
          <path d="M 68 128 C 58 134 52 146 52 158 C 52 170 58 180 68 186 C 76 190 86 190 92 184 L 92 130 C 84 128 74 126 68 128 Z"
            style={c('back')} onClick={() => handleSelect('back')}/>
          <path d="M 132 128 C 142 134 148 146 148 158 C 148 170 142 180 132 186 C 124 190 114 190 108 184 L 108 130 C 116 128 126 126 132 128 Z"
            style={c('back')} onClick={() => handleSelect('back')}/>
          <path d="M 88 190 C 84 198 84 208 86 216 C 88 224 92 228 100 228 C 108 228 112 224 114 216 C 116 208 116 198 112 190 C 108 186 92 186 88 190 Z"
            style={c('back')} onClick={() => handleSelect('back')}/>
        </>}

        {/* BACAK */}
        {side === 'front' && <>
          <path d="M 68 240 C 62 252 60 268 62 284 C 64 298 68 310 74 320 C 80 328 88 332 94 328 C 98 322 100 312 100 302 L 100 242 C 92 238 76 234 68 240 Z"
            style={c('legs')} onClick={() => handleSelect('legs')}/>
          <path d="M 132 240 C 138 252 140 268 138 284 C 136 298 132 310 126 320 C 120 328 112 332 106 328 C 102 322 100 312 100 302 L 100 242 C 108 238 124 234 132 240 Z"
            style={c('legs')} onClick={() => handleSelect('legs')}/>
          <path d="M 74 360 C 70 372 70 386 72 400 C 74 412 78 422 83 428 C 88 432 94 430 96 424 C 98 416 98 404 96 392 C 94 380 88 368 82 360 C 80 358 76 358 74 360 Z"
            style={c('legs')} onClick={() => handleSelect('legs')}/>
          <path d="M 126 360 C 130 372 130 386 128 400 C 126 412 122 422 117 428 C 112 432 106 430 104 424 C 102 416 102 404 104 392 C 106 380 112 368 118 360 C 120 358 124 358 126 360 Z"
            style={c('legs')} onClick={() => handleSelect('legs')}/>
        </>}
        {side === 'back' && <>
          <path d="M 68 240 C 62 254 60 270 62 286 C 64 300 70 312 78 320 C 86 326 94 324 98 316 C 100 308 100 296 100 284 L 100 242 C 90 238 74 234 68 240 Z"
            style={c('legs')} onClick={() => handleSelect('legs')}/>
          <path d="M 132 240 C 138 254 140 270 138 286 C 136 300 130 312 122 320 C 114 326 106 324 102 316 C 100 308 100 296 100 284 L 100 242 C 110 238 126 234 132 240 Z"
            style={c('legs')} onClick={() => handleSelect('legs')}/>
          <path d="M 76 362 C 72 376 72 392 74 406 C 76 418 80 428 86 432 C 92 434 96 430 98 422 C 100 412 98 400 96 388 C 94 376 88 364 82 360 C 80 360 77 360 76 362 Z"
            style={c('legs')} onClick={() => handleSelect('legs')}/>
          <path d="M 124 362 C 128 376 128 392 126 406 C 124 418 120 428 114 432 C 108 434 104 430 102 422 C 100 412 102 400 104 388 C 106 376 112 364 118 360 C 120 360 123 360 124 362 Z"
            style={c('legs')} onClick={() => handleSelect('legs')}/>
        </>}

        {/* KARDIYO — tüm gövdeye tıklama */}
        <path d="M 85 90 L 115 90 L 128 240 L 100 248 L 72 240 Z"
          style={{...c('cardio'), fill:'rgba(255,255,255,.0)', stroke:'rgba(255,255,255,.0)'}}
          onClick={() => handleSelect('cardio')}/>

      </svg>

      {activeGroup && (
        <div style={{ textAlign:'center', marginTop:8,
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
