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
  const col = (id) => findMG(id)?.color || '#fff'
  const rs  = (id) => ({
    fill:        isA(id) ? col(id)+'44' : 'transparent',
    stroke:      isA(id) ? col(id)      : 'transparent',
    strokeWidth: '1.5',
    cursor: 'pointer',
    transition: 'all .18s ease',
    filter: isA(id) ? `drop-shadow(0 0 5px ${col(id)}99)` : 'none',
  })

  const FRONT = {'chest': ['M158,103 Q147,108 137,113 Q126,118 115,123 Q139,128 135,133 Q131,138 127,143 Q122,148 115,153 Q121,158 123,163 Q124,168 123,173 Q121,178 117,183 Q179,183 153,178 Q179,173 169,168 Q174,163 178,158 Q179,153 179,148 Q179,143 179,138 Q179,133 179,128 Q177,123 158,118 Q161,113 161,108 Z', 'M197,103 Q197,108 197,113 Q200,118 182,123 Q179,128 179,133 Q179,138 179,143 Q179,148 178,158 Q184,163 189,168 Q178,173 205,178 Q179,183 241,183 Q237,178 235,173 Q235,168 235,163 Q238,158 236,148 Q232,143 227,138 Q223,133 219,128 Q213,123 233,118 Q221,113 211,108 Z'], 'shoulders': ['M115,122 Q109,127 102,142 Q100,147 99,152 Q97,157 93,162 Q89,167 124,167 Q127,162 121,157 Q117,152 123,147 Q128,142 110,127 Z', 'M218,112 Q218,117 242,122 Q218,127 222,132 Q226,137 230,142 Q235,147 241,152 Q237,157 231,162 Q226,167 269,167 Q265,162 261,157 Q260,152 258,147 Q256,142 255,137 Q252,132 249,127 Q243,122 227,117 Z'], 'arms': ['M96,158 Q92,163 88,168 Q82,183 80,188 Q76,193 71,198 Q67,203 64,208 Q61,213 58,218 Q56,223 54,228 Q52,233 50,238 Q48,243 46,248 Q44,253 42,258 Q57,258 63,253 Q69,248 74,243 Q79,238 83,233 Q86,228 89,223 Q91,218 94,213 Q98,208 81,203 Q80,198 80,193 Q81,188 83,183 Q89,168 93,163 Z', 'M248,155 Q262,160 270,170 Q276,185 277,190 Q250,195 254,200 Q258,205 262,210 Q265,215 268,220 Q270,225 273,230 Q277,235 281,240 Q286,245 292,250 Q298,255 302,260 Q314,260 299,255 Q313,250 311,245 Q309,240 307,235 Q305,230 303,225 Q301,220 298,215 Q296,210 292,205 Q288,200 284,195 Q280,190 277,185 Q271,170 263,160 Z', 'M43,254 Q42,258 40,262 Q39,266 37,270 Q35,274 33,278 Q32,282 40,286 Q31,290 37,294 Q36,298 31,302 Q32,306 38,306 Q40,302 40,298 Q40,294 51,290 Q52,286 52,282 Q53,278 54,274 Q56,270 54,266 Q55,262 57,258 Z', 'M297,254 Q301,258 303,262 Q304,266 303,270 Q304,274 306,278 Q306,282 307,286 Q307,290 318,294 Q318,298 318,302 Q320,306 326,306 Q327,302 323,298 Q322,294 327,290 Q327,286 326,282 Q325,278 323,274 Q321,270 320,266 Q318,262 317,258 Z'], 'core': ['M149,183 Q154,188 155,193 Q154,198 154,203 Q153,208 152,213 Q151,218 152,223 Q152,228 153,233 Q152,238 151,243 Q148,248 141,253 Q144,258 140,263 Q142,268 144,273 Q145,278 145,283 Q146,288 147,293 Q148,298 149,303 Q149,308 150,313 Q150,318 208,318 Q208,313 209,308 Q209,303 210,298 Q211,293 212,288 Q195,283 213,278 Q214,273 216,268 Q207,263 213,258 Q217,253 210,248 Q208,243 206,238 Q205,233 206,228 Q206,223 207,218 Q206,213 206,208 Q204,203 203,198 Q203,193 205,188 Z', 'M117,183 Q113,188 109,193 Q105,198 101,203 Q92,208 94,213 Q133,253 133,258 Q132,263 131,268 Q130,273 129,278 Q128,283 127,288 Q126,293 147,293 Q147,288 146,283 Q145,278 144,273 Q142,268 140,263 Q146,258 143,253 Q136,213 134,208 Q131,203 129,198 Q127,193 125,188 Z', 'M209,183 Q233,188 231,193 Q229,198 227,203 Q224,208 208,243 Q210,248 216,253 Q213,258 218,263 Q216,268 214,273 Q213,278 212,288 Q211,293 210,298 Q209,303 209,308 Q208,313 236,313 Q235,308 234,303 Q233,298 232,293 Q231,288 229,278 Q228,273 227,268 Q226,263 226,258 Q225,253 224,248 Q224,243 261,208 Q257,203 253,198 Q249,193 245,188 Z'], 'legs': ['M150,312 Q123,318 122,324 Q121,330 121,336 Q121,342 121,348 Q121,354 121,360 Q122,366 123,372 Q124,378 127,390 Q127,396 126,402 Q125,408 124,414 Q122,420 120,426 Q118,432 118,438 Q117,444 117,450 Q152,456 153,456 Q153,450 152,444 Q151,438 150,432 Q150,426 151,420 Q155,414 158,408 Q160,402 161,396 Q161,390 164,378 Q165,372 165,366 Q167,360 170,354 Q172,348 174,342 Q176,336 177,330 Q177,324 178,318 Z', 'M178,312 Q178,318 181,324 Q182,330 183,336 Q184,342 186,348 Q188,354 191,360 Q193,366 193,372 Q194,378 196,384 Q197,390 197,396 Q198,402 200,408 Q203,414 207,420 Q209,426 208,432 Q207,438 206,450 Q205,456 241,456 Q241,450 240,438 Q240,432 238,426 Q236,420 234,414 Q233,408 232,402 Q232,396 231,390 Q233,384 234,378 Q236,372 236,366 Q237,360 237,354 Q237,348 238,342 Q238,336 237,330 Q236,324 236,318 Z', 'M117,452 Q152,457 118,462 Q118,467 119,472 Q120,477 120,482 Q121,487 122,492 Q122,497 122,507 Q121,512 121,517 Q118,522 115,527 Q113,532 137,537 Q131,542 124,552 Q113,557 120,557 Q125,552 132,542 Q138,537 139,532 Q139,527 138,522 Q140,517 140,512 Q140,507 141,497 Q141,492 142,487 Q143,482 144,477 Q146,472 148,467 Q151,462 153,457 Z', 'M205,452 Q206,457 208,462 Q210,467 212,472 Q214,477 215,482 Q216,487 217,492 Q218,497 218,502 Q218,512 219,517 Q220,522 220,537 Q233,552 238,557 Q241,557 234,552 Q221,537 240,522 Q238,517 237,512 Q236,502 236,497 Q237,492 237,487 Q238,482 239,477 Q239,472 240,467 Q240,462 241,457 Z']};
  const BACK  = {'back': ['M144,76 Q143,81 145,86 Q148,91 149,96 Q152,101 151,106 Q146,111 135,116 Q122,121 108,126 Q138,131 133,136 Q127,141 120,146 Q112,151 109,156 Q110,161 111,166 Q231,166 232,161 Q232,156 230,151 Q222,146 215,141 Q209,136 241,131 Q233,126 219,121 Q208,116 196,111 Q190,106 190,101 Q192,96 194,91 Q197,86 198,81 Z', 'M97,135 Q93,140 91,145 Q90,150 88,155 Q85,160 80,165 Q77,170 75,175 Q73,180 70,185 Q68,190 67,195 Q62,200 57,205 Q79,210 80,220 Q77,225 74,230 Q71,235 68,240 Q64,245 60,250 Q55,255 123,265 Q127,265 125,255 Q125,250 126,245 Q127,240 127,235 Q127,230 127,225 Q126,220 124,210 Q122,205 119,200 Q117,195 115,190 Q114,185 112,180 Q112,175 112,170 Q111,165 110,160 Q110,155 116,150 Q122,145 129,140 Z', 'M220,145 Q226,150 232,155 Q232,160 231,165 Q230,170 266,175 Q230,180 228,185 Q227,190 225,195 Q222,200 219,205 Q218,210 257,215 Q261,220 264,225 Q267,230 273,240 Q277,245 281,250 Q282,250 278,245 Q274,240 268,230 Q265,225 262,220 Q258,215 263,210 Q285,205 280,200 Q275,195 274,190 Q272,185 269,180 Q267,175 265,170 Q262,165 257,160 Q253,155 252,150 Z', 'M127,234 Q127,239 126,244 Q125,249 125,254 Q124,259 123,264 Q122,269 121,274 Q121,279 127,284 Q126,289 126,294 Q127,299 129,304 Q133,309 145,314 Q158,319 183,319 Q197,314 208,309 Q213,304 215,299 Q216,294 215,289 Q223,284 221,279 Q212,274 219,269 Q218,264 218,259 Q217,254 216,249 Q216,244 215,239 Z'], 'shoulders': ['M117,122 Q108,126 102,130 Q98,134 92,142 Q91,146 90,150 Q88,154 86,158 Q110,158 110,154 Q116,150 121,146 Q93,142 99,134 Q104,130 110,126 Z', 'M220,122 Q232,126 238,130 Q243,134 246,138 Q221,146 226,150 Q232,154 232,158 Q255,158 253,154 Q252,150 251,146 Q247,138 244,134 Q239,130 233,126 Z'], 'arms': ['M88,155 Q85,160 80,165 Q62,200 57,205 Q54,210 50,215 Q47,220 44,225 Q42,230 40,235 Q38,240 37,245 Q35,250 54,255 Q55,255 60,250 Q65,245 69,240 Q72,235 75,230 Q78,225 81,220 Q84,215 88,210 Q92,205 77,200 Q81,165 86,160 Z', 'M250,155 Q256,160 261,165 Q264,170 266,175 Q268,180 271,185 Q265,200 250,205 Q254,210 257,215 Q261,220 264,225 Q267,230 270,235 Q273,240 277,245 Q281,250 287,255 Q308,255 307,250 Q306,245 304,240 Q302,235 300,230 Q298,225 295,220 Q292,215 289,210 Q285,205 280,200 Q272,185 269,180 Q267,175 265,170 Q262,165 257,160 Z', 'M37,244 Q36,248 34,252 Q33,256 32,260 Q30,264 28,268 Q27,272 27,276 Q27,280 26,284 Q24,288 23,292 Q22,296 23,300 Q23,304 24,308 Q26,312 31,316 Q35,316 37,312 Q36,308 35,304 Q46,300 46,296 Q45,292 45,288 Q45,284 44,280 Q42,276 43,272 Q45,268 48,264 Q51,260 54,256 Q58,252 62,248 Z', 'M279,248 Q284,252 287,256 Q291,260 294,264 Q297,268 299,272 Q300,276 297,280 Q297,284 297,288 Q296,292 296,296 Q295,300 307,304 Q306,308 304,312 Q307,316 311,316 Q316,312 317,308 Q318,304 319,300 Q320,296 319,292 Q318,288 316,284 Q315,280 315,276 Q315,272 314,268 Q312,264 310,260 Q309,256 308,252 Z'], 'legs': ['M114,308 Q113,313 112,318 Q112,323 111,328 Q111,333 111,338 Q111,343 110,348 Q110,353 110,358 Q111,363 111,368 Q112,373 113,378 Q114,383 115,388 Q115,393 115,398 Q114,403 114,408 Q151,408 152,403 Q152,398 153,393 Q154,388 155,383 Q156,378 157,373 Q159,368 160,363 Q162,358 163,353 Q164,348 177,343 Q176,338 175,333 Q174,328 173,323 Q173,318 177,313 Z', 'M169,308 Q169,313 169,318 Q169,323 168,328 Q168,333 175,338 Q176,343 178,348 Q179,353 180,358 Q182,363 183,368 Q184,373 186,378 Q187,383 188,388 Q189,393 189,398 Q190,403 191,408 Q228,408 228,403 Q227,398 226,393 Q227,388 228,383 Q228,378 229,373 Q230,368 231,363 Q231,358 231,353 Q231,348 231,343 Q231,338 231,333 Q231,328 230,323 Q229,318 228,313 Z', 'M104,452 Q104,457 105,462 Q105,467 105,472 Q106,477 106,482 Q107,487 108,492 Q108,497 108,502 Q109,507 109,512 Q110,517 110,522 Q109,527 108,532 Q105,537 100,542 Q103,557 127,557 Q128,542 128,537 Q128,532 128,527 Q128,522 129,517 Q130,512 132,507 Q133,502 134,497 Q136,492 138,487 Q139,482 142,477 Q144,472 144,467 Q144,462 144,457 Z', 'M198,452 Q198,457 197,462 Q197,467 198,472 Q200,477 202,482 Q204,487 206,492 Q207,497 209,502 Q210,507 211,512 Q213,517 214,522 Q214,527 214,532 Q214,537 214,542 Q214,557 238,557 Q241,542 237,537 Q234,532 233,527 Q232,522 232,517 Q232,512 233,507 Q233,502 234,497 Q234,492 235,487 Q235,482 236,477 Q236,472 237,467 Q237,462 237,457 Z'], 'core': ['M114,308 Q113,313 112,318 Q112,323 111,333 Q111,343 114,358 Q115,378 115,398 Q114,403 152,403 Q153,393 155,378 Q159,358 163,343 Q164,333 173,323 Q173,318 177,313 Z', 'M169,308 Q169,318 175,333 Q176,343 181,358 Q186,378 189,398 Q190,403 228,403 Q227,388 229,373 Q231,358 231,343 Q231,333 231,323 Q229,318 228,313 Z']};
  const paths = side === 'front' ? FRONT : BACK;
  const vbox  = side === 'front' ? '0 0 347 581' : '0 0 346 585';
  const imgSrc = side === 'front' ? '/muscle_front.png' : '/muscle_back.png';

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
          {Object.entries(paths).map(([id, pathList]) => (
            <g key={id} onClick={() => handleSelect(id)} style={{cursor:'pointer'}}>
              {pathList.map((d, i) => (
                <path key={i} d={d} style={rs(id)}/>
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
