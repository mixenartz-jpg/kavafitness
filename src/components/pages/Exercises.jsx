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

  // Piksel analizinden çıkarılan hassas kontur path'leri
  const FP =   {
    'chest_L': 'M159,102 Q152,106 142,110 Q136,114 126,118 Q147,122 141,126 Q137,130 122,158 Q123,162 124,166 Q134,170 123,174 Q122,178 123,182 Q153,182 153,178 Q157,174 176,170 Q172,166 175,162 Q177,158 138,130 Q142,126 175,122 Q158,118 160,114 Q161,110 161,106 Z',
    'chest_R': 'M197,102 Q197,106 197,110 Q198,114 200,118 Q183,122 178,126 Q179,130 179,134 Q179,138 179,142 Q179,146 179,154 Q178,158 183,162 Q186,166 182,170 Q179,174 205,178 Q179,182 235,182 Q235,178 235,174 Q235,170 235,166 Q235,162 181,158 Q180,154 234,146 Q231,142 227,138 Q224,134 221,130 Q217,126 211,122 Q233,118 222,114 Q216,110 206,106 Z',
    'shoulder_L': 'M119,120 Q112,124 108,128 Q100,148 99,152 Q97,156 95,160 Q123,160 119,156 Q117,152 122,148 Q109,128 113,124 Z',
    'shoulder_R': 'M237,120 Q245,124 249,128 Q225,136 228,140 Q232,144 236,148 Q241,152 239,156 Q233,160 236,160 Q261,156 260,152 Q258,148 257,144 Q256,140 254,136 Q250,128 246,124 Z',
    'bicep_L': 'M89,167 Q86,172 84,177 Q80,187 77,192 Q72,197 68,202 Q65,207 61,212 Q59,217 57,222 Q55,227 53,232 Q51,237 49,242 Q46,247 44,252 Q64,252 70,247 Q75,242 80,237 Q84,232 87,227 Q89,222 91,217 Q62,212 85,207 Q81,202 80,197 Q81,192 81,187 Q85,177 87,172 Z',
    'bicep_R': 'M258,158 Q265,163 277,188 Q278,193 278,198 Q277,203 260,208 Q264,213 267,218 Q269,223 272,228 Q275,233 279,238 Q284,243 289,248 Q296,253 297,253 Q290,248 285,243 Q280,238 276,233 Q304,228 302,223 Q300,218 297,213 Q294,208 291,203 Q287,198 282,193 Q278,188 266,163 Z',
    'forearm_L': 'M42,258 Q40,262 39,266 Q37,270 35,274 Q33,278 32,282 Q40,286 38,290 Q37,294 36,298 Q36,302 32,306 Q38,306 40,302 Q40,298 40,294 Q51,290 52,286 Q52,282 53,278 Q54,274 56,270 Q54,266 55,262 Z',
    'forearm_R': 'M315,258 Q303,262 304,266 Q303,270 306,282 Q307,286 307,290 Q320,290 318,286 Q316,282 321,270 Q320,266 318,262 Z',
    'abs_L': 'M154,188 Q154,198 154,203 Q153,208 152,213 Q151,218 152,223 Q152,228 153,233 Q152,238 151,243 Q148,248 143,253 Q144,258 151,263 Q156,268 144,273 Q145,278 145,283 Q146,288 147,293 Q148,298 149,303 Q149,308 150,313 Q177,313 175,308 Q171,303 168,298 Q166,293 165,288 Q177,283 171,278 Q168,273 165,268 Q162,263 160,258 Q159,253 158,248 Q157,243 157,238 Q176,233 156,228 Q156,223 156,218 Q176,213 156,208 Q155,203 155,198 Z',
    'abs_R': 'M182,188 Q178,193 179,203 Q178,208 182,213 Q179,218 202,223 Q179,228 182,233 Q178,238 201,243 Q179,248 179,253 Q179,258 179,263 Q179,268 179,273 Q187,278 181,283 Q193,288 192,293 Q190,298 187,303 Q183,308 178,313 Q208,313 209,308 Q209,303 210,298 Q211,293 212,288 Q195,283 213,278 Q199,273 202,268 Q207,263 213,258 Q199,253 210,248 Q208,243 206,238 Q205,233 206,228 Q206,223 207,218 Q206,213 206,208 Q204,203 203,193 Z',
    'oblique_L': 'M110,192 Q106,197 102,202 Q134,252 133,257 Q132,262 131,267 Q131,272 128,282 Q129,282 143,272 Q142,267 140,262 Q143,257 143,252 Q131,202 129,197 Z',
    'oblique_R': 'M232,192 Q229,197 214,252 Q214,257 219,262 Q216,267 215,272 Q212,287 231,287 Q228,272 227,267 Q226,262 225,257 Q225,252 253,197 Z',
    'quad_L': 'M123,316 Q122,322 121,328 Q121,334 121,340 Q121,346 121,352 Q121,358 122,364 Q122,370 123,376 Q125,382 126,388 Q127,394 126,400 Q125,406 125,412 Q123,418 121,424 Q150,436 151,442 Q152,442 151,436 Q150,424 152,418 Q156,412 159,406 Q161,400 161,394 Q162,388 163,382 Q164,376 165,370 Q166,364 168,358 Q171,352 173,346 Q174,340 176,334 Q177,328 177,322 Z',
    'quad_R': 'M181,316 Q178,322 181,328 Q182,334 184,340 Q186,346 188,352 Q190,358 192,364 Q194,376 195,382 Q196,388 197,394 Q198,400 199,406 Q202,412 206,418 Q209,424 223,424 Q235,418 234,412 Q233,406 232,400 Q231,394 232,388 Q234,382 235,376 Q193,364 193,358 Q197,352 201,346 Q203,340 204,334 Q206,328 207,322 Z',
    'calf_L': 'M152,456 Q120,481 121,486 Q121,491 122,496 Q122,506 121,511 Q121,516 138,521 Q138,526 138,536 Q132,541 125,551 Q126,551 133,541 Q139,536 139,526 Q139,521 140,516 Q140,511 140,506 Q141,496 141,491 Q142,486 143,481 Z',
    'calf_R': 'M213,476 Q216,486 217,491 Q218,496 218,501 Q218,506 218,511 Q218,516 232,551 Q233,551 237,516 Q237,511 236,506 Q236,501 236,496 Q237,491 237,486 Z',
  };
  const BP =   {
    'trap': 'M144,82 Q146,87 148,92 Q150,97 152,102 Q151,107 144,112 Q132,117 120,122 Q138,127 137,132 Q132,137 125,142 Q150,147 153,152 Q155,157 187,157 Q189,152 223,147 Q217,142 210,137 Q204,132 204,127 Q224,122 210,117 Q198,112 191,107 Q190,102 192,97 Q193,92 196,87 Z',
    'lat_L': 'M90,148 Q89,153 86,158 Q82,163 78,168 Q76,173 74,178 Q71,183 69,188 Q67,193 66,198 Q78,203 78,208 Q85,213 78,223 Q75,228 69,238 Q70,238 76,228 Q79,223 86,213 Q90,208 121,203 Q118,198 116,193 Q115,188 113,183 Q112,178 113,173 Q111,168 110,163 Q110,158 110,153 Z',
    'lat_R': 'M224,148 Q232,153 232,158 Q232,163 231,168 Q230,178 229,183 Q227,188 226,193 Q224,198 248,203 Q252,208 256,213 Q259,218 263,223 Q266,228 275,243 Q276,243 267,228 Q264,223 260,218 Q257,213 264,208 Q264,203 277,198 Q275,193 273,188 Q271,183 268,178 Q264,168 260,163 Q255,158 253,153 Z',
    'lower_back': 'M149,242 Q148,247 146,252 Q136,257 130,262 Q132,267 130,272 Q171,277 171,282 Q171,287 171,292 Q171,297 171,302 Q131,307 138,312 Q204,312 210,307 Q214,302 216,297 Q216,292 215,287 Q214,282 213,277 Q211,272 217,267 Q213,262 217,257 Q217,252 216,247 Z',
    'shoulder_L': 'M112,124 Q105,128 100,132 Q96,136 93,140 Q91,144 90,148 Q89,152 112,152 Q118,148 92,144 Q94,140 97,136 Q101,132 106,128 Z',
    'shoulder_R': 'M232,126 Q238,130 243,134 Q246,138 226,150 Q232,154 253,154 Q252,150 247,138 Q244,134 239,130 Z',
    'tricep_L': 'M83,162 Q67,192 65,197 Q60,202 56,207 Q52,212 49,217 Q46,222 43,227 Q41,232 39,237 Q37,242 36,247 Q57,252 58,252 Q63,247 67,242 Q71,237 74,232 Q76,227 80,222 Q83,217 87,212 Q78,207 78,202 Q67,197 68,192 Z',
    'tricep_R': 'M261,165 Q264,170 266,175 Q268,180 271,185 Q265,200 264,205 Q258,210 258,215 Q261,220 264,225 Q267,230 270,235 Q273,240 277,245 Q281,250 307,250 Q306,245 304,240 Q302,235 300,230 Q298,225 295,220 Q292,215 289,210 Q285,205 280,200 Q272,185 269,180 Q267,175 265,170 Z',
    'forearm_L': 'M35,250 Q34,254 32,258 Q31,262 29,266 Q27,270 27,274 Q27,278 26,282 Q25,286 23,290 Q22,294 22,298 Q23,302 24,306 Q25,310 28,314 Q36,314 37,310 Q35,306 45,302 Q46,298 46,294 Q45,290 45,286 Q45,282 43,278 Q42,274 44,270 Q46,266 49,262 Q53,258 56,254 Z',
    'forearm_R': 'M286,254 Q289,258 292,262 Q295,266 298,270 Q300,274 299,278 Q297,282 297,286 Q297,290 296,294 Q295,298 296,302 Q307,306 304,310 Q305,314 313,314 Q317,310 318,306 Q319,302 319,298 Q319,294 318,290 Q317,286 315,282 Q315,278 315,274 Q315,270 313,266 Q311,262 309,258 Z',
    'glute_L': 'M145,314 Q158,319 158,324 Q159,329 162,334 Q163,339 164,344 Q162,354 159,364 Q114,379 114,384 Q115,389 115,394 Q115,399 152,399 Q153,394 154,389 Q155,384 156,379 Q160,364 163,354 Q165,344 166,339 Q167,334 168,329 Q173,324 173,319 Z',
    'glute_R': 'M179,314 Q183,319 174,329 Q175,334 175,339 Q177,344 180,359 Q183,369 185,374 Q186,379 188,389 Q189,394 189,399 Q227,399 226,394 Q227,389 228,379 Q229,374 184,369 Q181,359 178,344 Q178,339 180,334 Q182,329 229,319 Z',
    'hamstring_L': 'M115,398 Q114,402 114,406 Q114,410 114,414 Q113,418 113,422 Q112,426 110,430 Q121,434 140,438 Q142,442 143,450 Q144,450 143,442 Q142,438 141,434 Q141,430 141,426 Q143,422 145,418 Q149,414 150,410 Q151,406 152,402 Z',
    'hamstring_R': 'M190,398 Q190,402 191,406 Q192,410 193,414 Q196,418 199,422 Q201,426 201,430 Q200,434 200,438 Q199,442 198,450 Q199,450 200,442 Q235,438 234,434 Q232,430 230,426 Q229,422 228,418 Q228,414 228,410 Q228,406 227,402 Z',
    'calf_L': 'M124,468 Q121,473 108,478 Q131,483 108,493 Q108,498 108,503 Q109,508 110,513 Q110,518 110,523 Q109,528 108,533 Q127,553 128,553 Q128,533 128,528 Q128,523 129,518 Q130,513 131,508 Q133,503 134,498 Q136,493 139,483 Q142,478 143,473 Z',
    'calf_R': 'M198,458 Q198,463 198,468 Q198,473 200,478 Q203,483 204,488 Q206,493 208,498 Q209,503 210,508 Q212,513 213,518 Q214,523 214,528 Q214,533 214,538 Q237,538 234,533 Q233,528 232,523 Q232,518 232,513 Q233,508 233,503 Q234,498 234,493 Q235,488 235,483 Q236,478 236,473 Q237,468 237,463 Z',
  };

  // Her kas grubu hangi path'leri kullanır
  const FG = {"chest": ["chest_L", "chest_R"], "shoulders": ["shoulder_L", "shoulder_R"], "arms": ["bicep_L", "bicep_R", "forearm_L", "forearm_R"], "core": ["abs_L", "abs_R", "oblique_L", "oblique_R"], "legs": ["quad_L", "quad_R", "calf_L", "calf_R"]};
  const BG = {"back": ["trap", "lat_L", "lat_R", "lower_back"], "shoulders": ["shoulder_L", "shoulder_R"], "arms": ["tricep_L", "tricep_R", "forearm_L", "forearm_R"], "legs": ["glute_L", "glute_R", "hamstring_L", "hamstring_R", "calf_L", "calf_R"], "core": ["glute_L", "glute_R"]};

  const ps = (id) => {
    const groups = side === 'front' ? FG : BG
    const paths  = side === 'front' ? FP : BP
    const keys   = groups[id] || []
    return keys.map(k => paths[k]).filter(Boolean)
  }

  const rs = (id) => ({
    fill:        isA(id) ? col(id) + '40' : 'transparent',
    stroke:      isA(id) ? col(id)        : 'transparent',
    strokeWidth: '1.5',
    cursor: 'pointer',
    transition: 'all .18s ease',
    filter: isA(id) ? `drop-shadow(0 0 5px ${col(id)}99)` : 'none',
  })

  const groups = side === 'front' ? Object.keys(FG) : Object.keys(BG)
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
          {groups.map(id => (
            <g key={id} onClick={() => handleSelect(id)} style={{cursor:'pointer'}}>
              {ps(id).map((d, i) => (
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
