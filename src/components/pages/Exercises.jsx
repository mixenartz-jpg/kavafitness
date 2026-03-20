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

  const ac = (id) => activeGroup === id
  const col = (id) => findMG(id)?.color || '#fff'
  const ms = (id) => ({
    fill:        ac(id) ? col(id) + '38' : 'rgba(255,255,255,.0)',
    stroke:      ac(id) ? col(id)        : 'rgba(255,255,255,.0)',
    strokeWidth: ac(id) ? '1.5' : '0',
    cursor: 'pointer',
    transition: 'all .18s ease',
    filter: ac(id) ? `drop-shadow(0 0 5px ${col(id)}88)` : 'none',
  })
  // hover için şeffaf tıklama yüzeyi
  const hs = { fill:'rgba(255,255,255,.0)', stroke:'none', cursor:'pointer' }

  return (
    <div style={{ width:'100%', maxWidth:220, margin:'0 auto' }}>
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

      {side === 'front' ? (
        <svg viewBox="0 0 160 380" xmlns="http://www.w3.org/2000/svg"
          style={{width:'100%',height:'auto',display:'block'}}>

          {/* ─── KAS OVERLAY ─── */}
          {/* GÖĞÜS */}
          <g onClick={()=>handleSelect('chest')}>
            <path d="M72,68 Q80,64 88,65 L88,92 Q80,96 72,92 Q66,84 68,74 Z" style={ms('chest')}/>
            <path d="M88,65 Q96,64 104,68 Q106,74 104,84 Q98,92 88,92 Z" style={ms('chest')}/>
            <path d="M66,68 Q80,60 104,68 L104,96 Q80,102 66,96 Z" style={hs} onClick={()=>handleSelect('chest')}/>
          </g>

          {/* OMUZLAR */}
          <g onClick={()=>handleSelect('shoulders')}>
            <path d="M52,62 Q60,56 70,60 Q74,68 72,80 Q64,86 56,80 Q50,72 52,62 Z" style={ms('shoulders')}/>
            <path d="M108,62 Q100,56 90,60 Q86,68 88,80 Q96,86 104,80 Q110,72 108,62 Z" style={ms('shoulders')}/>
          </g>

          {/* KOL */}
          <g onClick={()=>handleSelect('arms')}>
            <path d="M44,82 Q52,78 56,86 Q58,100 54,114 Q48,120 42,116 Q36,108 38,94 Z" style={ms('arms')}/>
            <path d="M116,82 Q108,78 104,86 Q102,100 106,114 Q112,120 118,116 Q124,108 122,94 Z" style={ms('arms')}/>
            <path d="M36,118 Q44,114 48,122 Q50,136 46,148 Q40,154 34,148 Q28,138 30,126 Z" style={ms('arms')}/>
            <path d="M124,118 Q116,114 112,122 Q110,136 114,148 Q120,154 126,148 Q132,138 130,126 Z" style={ms('arms')}/>
          </g>

          {/* CORE */}
          <g onClick={()=>handleSelect('core')}>
            <path d="M70,96 Q80,92 90,96 Q94,104 94,120 Q92,136 88,144 Q80,148 72,144 Q68,136 66,120 Q66,104 70,96 Z" style={ms('core')}/>
            <path d="M60,100 Q68,96 72,104 Q72,120 68,134 Q62,140 56,134 Q50,124 52,110 Z" style={ms('core')}/>
            <path d="M100,100 Q92,96 88,104 Q88,120 92,134 Q98,140 104,134 Q110,124 108,110 Z" style={ms('core')}/>
          </g>

          {/* BACAKLAR */}
          <g onClick={()=>handleSelect('legs')}>
            <path d="M66,160 Q74,156 80,160 Q82,176 80,196 Q78,210 72,214 Q66,212 62,200 Q58,182 62,166 Z" style={ms('legs')}/>
            <path d="M94,160 Q86,156 80,160 Q78,176 80,196 Q82,210 88,214 Q94,212 98,200 Q102,182 98,166 Z" style={ms('legs')}/>
            <path d="M62,218 Q70,214 76,220 Q78,236 74,254 Q70,264 64,262 Q58,256 58,240 Z" style={ms('legs')}/>
            <path d="M98,218 Q90,214 84,220 Q82,236 86,254 Q90,264 96,262 Q102,256 102,240 Z" style={ms('legs')}/>
          </g>

          {/* ─── VÜCUT HATLARI ─── */}
          <g fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
            {/* Baş */}
            <ellipse cx="80" cy="22" rx="14" ry="17"/>
            {/* Boyun */}
            <line x1="74" y1="38" x2="72" y2="48"/>
            <line x1="86" y1="38" x2="88" y2="48"/>
            <path d="M72,48 Q80,52 88,48"/>
            {/* Köprücük */}
            <path d="M72,48 Q64,50 58,56" stroke="rgba(255,255,255,.18)"/>
            <path d="M88,48 Q96,50 102,56" stroke="rgba(255,255,255,.18)"/>
            {/* Sol omuz/kol dış */}
            <path d="M46,60 Q40,70 38,84 Q36,98 38,112 Q40,124 44,132"/>
            {/* Sol kol iç */}
            <path d="M60,64 Q56,74 54,88 Q52,100 54,112 Q56,120 58,126"/>
            {/* Sol önkol */}
            <path d="M44,132 Q38,144 36,156 Q34,166 36,174"/>
            <path d="M58,126 Q56,138 56,150 Q56,160 58,168"/>
            {/* Sol el */}
            <path d="M36,174 Q32,178 30,184 Q32,190 38,190 Q44,188 46,182"/>
            <path d="M58,168 Q58,174 56,180"/>
            {/* Sağ omuz/kol dış */}
            <path d="M114,60 Q120,70 122,84 Q124,98 122,112 Q120,124 116,132"/>
            {/* Sağ kol iç */}
            <path d="M100,64 Q104,74 106,88 Q108,100 106,112 Q104,120 102,126"/>
            {/* Sağ önkol */}
            <path d="M116,132 Q122,144 124,156 Q126,166 124,174"/>
            <path d="M102,126 Q104,138 104,150 Q104,160 102,168"/>
            {/* Sağ el */}
            <path d="M124,174 Q128,178 130,184 Q128,190 122,190 Q116,188 114,182"/>
            <path d="M102,168 Q102,174 104,180"/>
            {/* Gövde sol */}
            <path d="M46,60 Q42,72 40,88 Q40,108 44,128 Q48,144 52,156"/>
            {/* Gövde sağ */}
            <path d="M114,60 Q118,72 120,88 Q120,108 116,128 Q112,144 108,156"/>
            {/* Alt gövde */}
            <path d="M52,156 Q56,164 62,168 Q70,172 80,172 Q90,172 98,168 Q104,164 108,156"/>
            {/* Kasık */}
            <path d="M66,168 Q72,174 80,176 Q88,174 94,168"/>
            <path d="M72,174 L70,184"/>
            <path d="M88,174 L90,184"/>
            {/* Sol bacak dış */}
            <path d="M52,156 Q46,170 44,190 Q42,210 44,230 Q46,248 50,262"/>
            {/* Sol bacak iç */}
            <path d="M70,184 Q68,198 68,216 Q68,232 70,248 Q72,260 74,266"/>
            {/* Sol baldır */}
            <path d="M50,262 Q48,276 50,292 Q52,306 56,314"/>
            <path d="M74,266 Q74,280 72,294 Q70,308 68,316"/>
            {/* Sol diz */}
            <path d="M50,262 Q60,258 74,266" stroke="rgba(255,255,255,.18)"/>
            {/* Sol ayak */}
            <path d="M56,314 Q52,320 50,328 Q54,332 64,332 Q72,330 74,322 Q72,316 68,316"/>
            {/* Sağ bacak dış */}
            <path d="M108,156 Q114,170 116,190 Q118,210 116,230 Q114,248 110,262"/>
            {/* Sağ bacak iç */}
            <path d="M90,184 Q92,198 92,216 Q92,232 90,248 Q88,260 86,266"/>
            {/* Sağ baldır */}
            <path d="M110,262 Q112,276 110,292 Q108,306 104,314"/>
            <path d="M86,266 Q86,280 88,294 Q90,308 92,316"/>
            {/* Sağ diz */}
            <path d="M110,262 Q100,258 86,266" stroke="rgba(255,255,255,.18)"/>
            {/* Sağ ayak */}
            <path d="M104,314 Q108,320 110,328 Q106,332 96,332 Q88,330 86,322 Q88,316 92,316"/>
            {/* Abs */}
            <path d="M74,104 Q80,102 86,104" stroke="rgba(255,255,255,.14)"/>
            <path d="M74,114 Q80,112 86,114" stroke="rgba(255,255,255,.14)"/>
            <path d="M74,124 Q80,122 86,124" stroke="rgba(255,255,255,.14)"/>
            <path d="M74,134 Q80,132 86,134" stroke="rgba(255,255,255,.14)"/>
            <line x1="80" y1="98" x2="80" y2="148" stroke="rgba(255,255,255,.1)"/>
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 160 380" xmlns="http://www.w3.org/2000/svg"
          style={{width:'100%',height:'auto',display:'block'}}>

          {/* ─── KAS OVERLAY ARKA ─── */}
          {/* SIRT */}
          <g onClick={()=>handleSelect('back')}>
            <path d="M66,56 Q80,50 94,56 Q98,68 94,84 Q86,92 80,94 Q74,92 66,84 Q62,68 66,56 Z" style={ms('back')}/>
            <path d="M56,90 Q64,86 68,94 Q70,110 66,124 Q60,132 52,128 Q44,120 46,106 Z" style={ms('back')}/>
            <path d="M104,90 Q96,86 92,94 Q90,110 94,124 Q100,132 108,128 Q116,120 114,106 Z" style={ms('back')}/>
            <path d="M68,96 Q80,92 92,96 Q96,110 92,126 Q86,136 80,138 Q74,136 68,126 Q64,110 68,96 Z" style={ms('back')}/>
          </g>

          {/* OMUZLAR */}
          <g onClick={()=>handleSelect('shoulders')}>
            <path d="M50,60 Q58,54 68,58 Q72,68 70,80 Q62,86 54,80 Q46,72 50,60 Z" style={ms('shoulders')}/>
            <path d="M110,60 Q102,54 92,58 Q88,68 90,80 Q98,86 106,80 Q114,72 110,60 Z" style={ms('shoulders')}/>
          </g>

          {/* KOL */}
          <g onClick={()=>handleSelect('arms')}>
            <path d="M42,82 Q50,78 54,86 Q56,100 52,114 Q46,120 40,114 Q34,104 36,92 Z" style={ms('arms')}/>
            <path d="M118,82 Q110,78 106,86 Q104,100 108,114 Q114,120 120,114 Q126,104 124,92 Z" style={ms('arms')}/>
            <path d="M34,118 Q42,114 46,122 Q48,136 44,148 Q38,154 32,148 Q26,138 28,126 Z" style={ms('arms')}/>
            <path d="M126,118 Q118,114 114,122 Q112,136 116,148 Q122,154 128,148 Q134,138 132,126 Z" style={ms('arms')}/>
          </g>

          {/* BACAKLAR */}
          <g onClick={()=>handleSelect('legs')}>
            <path d="M62,162 Q70,158 76,162 Q80,178 78,198 Q76,212 68,216 Q60,212 58,198 Q54,180 58,166 Z" style={ms('legs')}/>
            <path d="M98,162 Q90,158 84,162 Q80,178 82,198 Q84,212 92,216 Q100,212 102,198 Q106,180 102,166 Z" style={ms('legs')}/>
            <path d="M58,220 Q66,216 72,222 Q74,238 70,256 Q66,266 60,264 Q54,258 54,242 Z" style={ms('legs')}/>
            <path d="M102,220 Q94,216 88,222 Q86,238 90,256 Q94,266 100,264 Q106,258 106,242 Z" style={ms('legs')}/>
          </g>

          {/* CORE (glute) */}
          <g onClick={()=>handleSelect('core')}>
            <path d="M66,140 Q80,134 94,140 Q100,152 96,168 Q88,178 80,180 Q72,178 64,168 Q60,152 66,140 Z" style={ms('core')}/>
          </g>

          {/* ─── VÜCUT HATLARI ARKA ─── */}
          <g fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="80" cy="22" rx="14" ry="17"/>
            <line x1="74" y1="38" x2="72" y2="48"/>
            <line x1="86" y1="38" x2="88" y2="48"/>
            <path d="M72,48 Q80,52 88,48"/>
            <path d="M72,48 Q62,50 56,58"/>
            <path d="M88,48 Q98,50 104,58"/>
            {/* Trapez V */}
            <path d="M60,60 L80,90 L100,60" stroke="rgba(255,255,255,.2)"/>
            {/* Kürek kemikleri */}
            <path d="M68,72 Q64,84 66,96" stroke="rgba(255,255,255,.16)"/>
            <path d="M92,72 Q96,84 94,96" stroke="rgba(255,255,255,.16)"/>
            {/* Kollar */}
            <path d="M44,62 Q38,72 36,86 Q34,100 36,114 Q38,124 42,132"/>
            <path d="M58,64 Q54,74 52,88 Q50,100 52,112 Q54,122 56,128"/>
            <path d="M116,62 Q122,72 124,86 Q126,100 124,114 Q122,124 118,132"/>
            <path d="M102,64 Q106,74 108,88 Q110,100 108,112 Q106,122 104,128"/>
            <path d="M42,132 Q36,144 34,158 Q32,168 34,176"/>
            <path d="M56,128 Q54,140 54,152 Q54,162 56,170"/>
            <path d="M118,132 Q124,144 126,158 Q128,168 126,176"/>
            <path d="M104,128 Q106,140 106,152 Q106,162 104,170"/>
            {/* El */}
            <path d="M34,176 Q30,180 28,186 Q30,190 36,190 Q42,188 44,182"/>
            <path d="M126,176 Q130,180 132,186 Q130,190 124,190 Q118,188 116,182"/>
            {/* Gövde */}
            <path d="M44,62 Q40,76 38,94 Q36,114 40,134 Q44,150 50,162"/>
            <path d="M116,62 Q120,76 122,94 Q124,114 120,134 Q116,150 110,162"/>
            <path d="M50,162 Q54,170 60,176 Q70,182 80,184 Q90,182 100,176 Q106,170 110,162"/>
            {/* Pelvis */}
            <path d="M64,178 Q72,186 80,188 Q88,186 96,178"/>
            {/* Bacaklar */}
            <path d="M50,162 Q44,178 42,198 Q40,218 42,238 Q44,254 48,266"/>
            <path d="M66,182 Q64,198 64,216 Q64,232 66,248 Q68,260 70,268"/>
            <path d="M110,162 Q116,178 118,198 Q120,218 118,238 Q116,254 112,266"/>
            <path d="M94,182 Q96,198 96,216 Q96,232 94,248 Q92,260 90,268"/>
            <path d="M48,266 Q46,280 48,296 Q50,308 54,316"/>
            <path d="M70,268 Q70,282 68,296 Q66,308 64,316"/>
            <path d="M112,266 Q114,280 112,296 Q110,308 106,316"/>
            <path d="M90,268 Q90,282 92,296 Q94,308 96,316"/>
            {/* Diz */}
            <path d="M48,266 Q58,262 70,268" stroke="rgba(255,255,255,.16)"/>
            <path d="M112,266 Q102,262 90,268" stroke="rgba(255,255,255,.16)"/>
            {/* Ayak */}
            <path d="M54,316 Q50,322 48,330 Q52,334 62,334 Q70,332 72,324 Q70,318 64,316"/>
            <path d="M106,316 Q110,322 112,330 Q108,334 98,334 Q90,332 88,324 Q90,318 96,316"/>
            {/* Omurga */}
            <line x1="80" y1="52" x2="80" y2="138" stroke="rgba(255,255,255,.1)"/>
          </g>
        </svg>
      )}

      {activeGroup && (
        <div style={{textAlign:'center',marginTop:10,
          fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:2.5,
          color:col(activeGroup),fontWeight:700}}>
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
