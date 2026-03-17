import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext'

const GEMINI_KEY  = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'
const FOOD_MODELS = ['gemini-3.1-flash-lite-preview','gemini-3-flash-preview','gemini-2.5-flash','gemini-2.5-flash-lite']

// ── Türk Yemek Veritabanı ──
const FOOD_DB = [
  // Ana Yemekler
  { cat:'🍖 Et & Tavuk', name:'Tavuk Göğsü (Haşlama)',   kcal:165, protein:31, fat:4,  carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Tavuk But (Izgaraa)',       kcal:220, protein:27, fat:12, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Kıyma (Dana)',               kcal:250, protein:26, fat:17, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Köfte (Dana, 100g)',         kcal:280, protein:24, fat:19, carb:4  },
  { cat:'🍖 Et & Tavuk', name:'Döner Kebap (100g)',         kcal:320, protein:22, fat:24, carb:4  },
  { cat:'🍖 Et & Tavuk', name:'Adana Kebap (100g)',         kcal:290, protein:23, fat:21, carb:2  },
  { cat:'🍖 Et & Tavuk', name:'Tavuk Kanat (Izgara)',       kcal:240, protein:25, fat:15, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Hindi Göğsü',               kcal:135, protein:29, fat:1,  carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Kuzu But (Fırın)',           kcal:295, protein:25, fat:21, carb:0  },

  // Balık
  { cat:'🐟 Balık & Deniz', name:'Somon (Izgara, 100g)',   kcal:208, protein:20, fat:13, carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Levrek (Izgara)',         kcal:124, protein:24, fat:3,  carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Hamsi (Tava, 100g)',      kcal:190, protein:18, fat:12, carb:2  },
  { cat:'🐟 Balık & Deniz', name:'Ton Balığı (Konserve)',   kcal:130, protein:29, fat:1,  carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Karides (Haşlama)',       kcal:99,  protein:24, fat:1,  carb:0  },

  // Çorbalar
  { cat:'🍲 Çorbalar', name:'Mercimek Çorbası (1 kase)',    kcal:180, protein:10, fat:5,  carb:25 },
  { cat:'🍲 Çorbalar', name:'Ezogelin Çorbası (1 kase)',    kcal:160, protein:8,  fat:4,  carb:26 },
  { cat:'🍲 Çorbalar', name:'Yayla Çorbası (1 kase)',       kcal:130, protein:7,  fat:5,  carb:15 },
  { cat:'🍲 Çorbalar', name:'Tavuk Suyu Çorbası',           kcal:90,  protein:6,  fat:3,  carb:10 },
  { cat:'🍲 Çorbalar', name:'Domates Çorbası',              kcal:100, protein:3,  fat:3,  carb:16 },

  // Pilav & Makarna
  { cat:'🍚 Pilav & Makarna', name:'Pirinç Pilavı (1 porsiyon)', kcal:250, protein:5, fat:6, carb:44 },
  { cat:'🍚 Pilav & Makarna', name:'Bulgur Pilavı (1 porsiyon)', kcal:220, protein:7, fat:4, carb:42 },
  { cat:'🍚 Pilav & Makarna', name:'Makarna (Haşlama, 100g)',    kcal:158, protein:6, fat:1, carb:31 },
  { cat:'🍚 Pilav & Makarna', name:'Makarna (Bolonez, 1P)',      kcal:380, protein:18,fat:12,carb:48 },
  { cat:'🍚 Pilav & Makarna', name:'Şehriyeli Pilav (1P)',       kcal:270, protein:6, fat:7, carb:46 },

  // Sebze & Bakliyat
  { cat:'🥗 Sebze & Bakliyat', name:'Mercimek (Haşlama, 100g)', kcal:116, protein:9, fat:0, carb:20 },
  { cat:'🥗 Sebze & Bakliyat', name:'Nohut (Haşlama, 100g)',    kcal:164, protein:9, fat:3, carb:27 },
  { cat:'🥗 Sebze & Bakliyat', name:'Kuru Fasulye (1P)',         kcal:200, protein:13,fat:2, carb:35 },
  { cat:'🥗 Sebze & Bakliyat', name:'Zeytinyağlı Fasulye',       kcal:180, protein:6, fat:8, carb:22 },
  { cat:'🥗 Sebze & Bakliyat', name:'İmam Bayıldı (1P)',         kcal:220, protein:3, fat:14,carb:22 },
  { cat:'🥗 Sebze & Bakliyat', name:'Kabak Mücveri (2 adet)',    kcal:160, protein:6, fat:9, carb:14 },
  { cat:'🥗 Sebze & Bakliyat', name:'Zeytinyağlı Enginar',       kcal:140, protein:3, fat:7, carb:16 },
  { cat:'🥗 Sebze & Bakliyat', name:'Salata (Karışık, büyük)',   kcal:80,  protein:2, fat:4, carb:10 },

  // Börek & Hamur İşi
  { cat:'🥐 Börek & Hamur', name:'Su Böreği (1 dilim)',          kcal:280, protein:10,fat:14,carb:30 },
  { cat:'🥐 Börek & Hamur', name:'Peynirli Börek (1 adet)',      kcal:220, protein:8, fat:12,carb:22 },
  { cat:'🥐 Börek & Hamur', name:'Kıymalı Börek (1 adet)',       kcal:250, protein:11,fat:14,carb:22 },
  { cat:'🥐 Börek & Hamur', name:'Simit (1 adet)',               kcal:280, protein:8, fat:4, carb:56 },
  { cat:'🥐 Börek & Hamur', name:'Poğaça (Peynirli)',            kcal:300, protein:9, fat:15,carb:34 },
  { cat:'🥐 Börek & Hamur', name:'Açma (1 adet)',                kcal:340, protein:7, fat:16,carb:44 },
  { cat:'🥐 Börek & Hamur', name:'Tam Buğday Ekmeği (1 dilim)', kcal:80,  protein:3, fat:1, carb:16 },
  { cat:'🥐 Börek & Hamur', name:'Beyaz Ekmek (1 dilim)',        kcal:90,  protein:3, fat:1, carb:18 },

  // Süt & Yumurta
  { cat:'🥛 Süt & Yumurta', name:'Yumurta (1 adet, haşlama)',   kcal:78,  protein:6, fat:5, carb:1  },
  { cat:'🥛 Süt & Yumurta', name:'Sahanda Yumurta (2 adet)',    kcal:185, protein:12,fat:15,carb:1  },
  { cat:'🥛 Süt & Yumurta', name:'Menemen (1P)',                 kcal:220, protein:12,fat:14,carb:12 },
  { cat:'🥛 Süt & Yumurta', name:'Omlet (2 yumurtalı)',         kcal:200, protein:14,fat:15,carb:2  },
  { cat:'🥛 Süt & Yumurta', name:'Süt (1 bardak, 200ml)',       kcal:122, protein:6, fat:7, carb:10 },
  { cat:'🥛 Süt & Yumurta', name:'Yoğurt (1 kase, 150g)',       kcal:90,  protein:8, fat:3, carb:8  },
  { cat:'🥛 Süt & Yumurta', name:'Beyaz Peynir (50g)',          kcal:135, protein:8, fat:11,carb:1  },
  { cat:'🥛 Süt & Yumurta', name:'Kaşar Peyniri (30g)',         kcal:110, protein:7, fat:9, carb:0  },

  // Meyve
  { cat:'🍎 Meyveler', name:'Elma (1 orta boy)',                 kcal:80,  protein:0, fat:0, carb:21 },
  { cat:'🍎 Meyveler', name:'Muz (1 orta boy)',                  kcal:105, protein:1, fat:0, carb:27 },
  { cat:'🍎 Meyveler', name:'Portakal (1 orta boy)',             kcal:62,  protein:1, fat:0, carb:15 },
  { cat:'🍎 Meyveler', name:'Çilek (100g)',                      kcal:32,  protein:1, fat:0, carb:8  },
  { cat:'🍎 Meyveler', name:'Üzüm (1 salkım, 100g)',            kcal:69,  protein:1, fat:0, carb:18 },
  { cat:'🍎 Meyveler', name:'Kavun (1 dilim, 200g)',             kcal:64,  protein:1, fat:0, carb:16 },
  { cat:'🍎 Meyveler', name:'Karpuz (1 dilim, 300g)',            kcal:90,  protein:2, fat:0, carb:22 },

  // Atıştırmalık & Tatlı
  { cat:'🍫 Atıştırmalık', name:'Baklava (1 dilim)',             kcal:350, protein:5, fat:18,carb:44 },
  { cat:'🍫 Atıştırmalık', name:'Sütlaç (1 kase)',               kcal:200, protein:5, fat:4, carb:38 },
  { cat:'🍫 Atıştırmalık', name:'Lokma (5 adet)',                kcal:280, protein:3, fat:12,carb:40 },
  { cat:'🍫 Atıştırmalık', name:'Çikolata (Sütlü, 30g)',        kcal:160, protein:2, fat:9, carb:19 },
  { cat:'🍫 Atıştırmalık', name:'Ceviz (30g, 5-6 adet)',        kcal:196, protein:5, fat:20,carb:4  },
  { cat:'🍫 Atıştırmalık', name:'Badem (30g)',                   kcal:173, protein:6, fat:15,carb:6  },
  { cat:'🍫 Atıştırmalık', name:'Fındık (30g)',                  kcal:188, protein:4, fat:18,carb:5  },

  // İçecekler
  { cat:'☕ İçecekler', name:'Türk Kahvesi (şekersiz)',           kcal:5,   protein:0, fat:0, carb:1  },
  { cat:'☕ İçecekler', name:'Çay (şekersiz)',                    kcal:2,   protein:0, fat:0, carb:0  },
  { cat:'☕ İçecekler', name:'Portakal Suyu (200ml)',             kcal:88,  protein:1, fat:0, carb:21 },
  { cat:'☕ İçecekler', name:'Ayran (200ml)',                     kcal:60,  protein:3, fat:3, carb:5  },
  { cat:'☕ İçecekler', name:'Protein Shake (1 ölçek)',           kcal:120, protein:25,fat:2, carb:5  },
]

// ── Besin Değerlendirmesi ──
function getFoodTags(food) {
  const tags = []
  const kcal100 = food.kcal
  const p = food.protein, f = food.fat, c = food.carb

  if (p >= 20)                     tags.push({ label:'💪 Yüksek Protein', color:'#47c8ff' })
  else if (p >= 10)                tags.push({ label:'🥩 Orta Protein',   color:'#47c8ffaa' })

  if (c >= 30)                     tags.push({ label:'🌾 Karbonhidrat Kaynağı', color:'#47ff8a' })
  else if (c <= 5 && f >= 10)      tags.push({ label:'🥑 Yağ Kaynağı',   color:'#ff8c47' })
  else if (c <= 3)                 tags.push({ label:'⬇️ Düşük Karb',     color:'#47ff8aaa' })

  if (kcal100 <= 100)              tags.push({ label:'🥗 Düşük Kalori',   color:'#e8ff47' })
  else if (kcal100 >= 300)         tags.push({ label:'⚡ Yüksek Kalori',  color:'#ff4747' })

  if (f >= 15)                     tags.push({ label:'🫙 Yağlı',          color:'#ff8c4799' })
  if (p >= 15 && c <= 5 && f <= 5) tags.push({ label:'🏆 Diyet Dostu',   color:'#e8ff47' })

  return tags
}

export default function CaloriePage() {
  const { foods, saveFoods, calArch, saveCalArchive, showToast, genId, todayKey } = useApp()

  // Tabs: 'photo' | 'db' | 'manual'
  const [tab, setTab] = useState('db')

  // DB state
  const [dbSearch, setDbSearch]   = useState('')
  const [dbCat, setDbCat]         = useState('Tümü')
  const [dbSelected, setDbSelected] = useState(null)
  const [dbGram, setDbGram]       = useState('100')

  // Photo state
  const [imgB64, setImgB64]   = useState(null)
  const [imgMime, setImgMime] = useState(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus]   = useState(null)
  const [modelChips, setModelChips] = useState([])
  const [resultData, setResultData] = useState(null)
  const [analyzing, setAnalyzing]   = useState(false)
  const fileRef = useRef()

  // Manual form
  const [mf, setMf] = useState({ name:'', kcal:'', protein:'', fat:'', carb:'' })

  const totals = (arr) => arr.reduce((t, f) => ({
    kcal: t.kcal + (+f.kcal||0),
    protein: t.protein + (+f.protein||0),
    fat: t.fat + (+f.fat||0),
    carb: t.carb + (+f.carb||0),
  }), { kcal:0, protein:0, fat:0, carb:0 })

  const tot  = totals(foods)
  const yest = () => {
    const d = new Date(); d.setDate(d.getDate()-1)
    return totals(calArch[d.toISOString().slice(0,10)] || [])
  }
  const yTot = yest()

  // ── DB helpers ──
  const cats = ['Tümü', ...Array.from(new Set(FOOD_DB.map(f => f.cat)))]
  const filtered = FOOD_DB.filter(f => {
    const matchCat = dbCat === 'Tümü' || f.cat === dbCat
    const matchSearch = f.name.toLowerCase().includes(dbSearch.toLowerCase())
    return matchCat && matchSearch
  })

  const scaledFood = (food, gram) => {
    const ratio = (+gram || 100) / 100
    return {
      name: food.name + (gram !== '100' ? ` (${gram}g)` : ''),
      kcal: Math.round(food.kcal * ratio),
      protein: Math.round(food.protein * ratio),
      fat: Math.round(food.fat * ratio),
      carb: Math.round(food.carb * ratio),
    }
  }

  const addFromDb = () => {
    if (!dbSelected) return
    const scaled = scaledFood(dbSelected, dbGram)
    saveFoods([...foods, { id: genId(), ...scaled }])
    showToast(`${scaled.name} eklendi ✓`)
    setDbSelected(null)
    setDbGram('100')
  }

  // ── Photo ──
  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const d = ev.target.result
      setImgB64(d.split(',')[1]); setImgMime(file.type)
      setPreview(d); setStatus(null); setResultData(null); setModelChips([])
    }
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!imgB64) return
    setAnalyzing(true); setResultData(null)
    const prompt = `Analyze this image STRICTLY. Does it show food, a meal, a drink, or an edible item?

IMPORTANT: If the image shows anything other than food/drink — such as a person exercising, objects, scenery, animals, or text — respond with is_food: false.

Respond with ONLY valid JSON:
{"is_food":true,"food_name":"Tavuk Göğsü","kcal":250,"protein":45,"fat":5,"carb":0}
OR if not food: {"is_food":false,"food_name":"","kcal":0,"protein":0,"fat":0,"carb":0}
Rules: food_name in Turkish, all numbers as integers, estimate for visible portion, no markdown.`

    let res = null, usedModel = null
    const chips = FOOD_MODELS.map(m => ({ model:m, state:'pending' }))
    setModelChips([...chips])

    for (const model of FOOD_MODELS) {
      setModelChips(c => c.map(ch => ch.model===model ? {...ch, state:'trying'} : ch))
      setStatus({ type:'analyzing', title:'Analiz Ediliyor', sub:`Model: ${model}` })
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            contents:[{parts:[{text:prompt},{inline_data:{mime_type:imgMime,data:imgB64}}]}],
            generationConfig:{temperature:.1,maxOutputTokens:256,thinkingConfig:{thinkingBudget:0}}
          })
        })
        if (res.ok) { usedModel = model; setModelChips(c => c.map(ch => ch.model===model?{...ch,state:'ok'}:ch)); break }
        res = null; setModelChips(c => c.map(ch => ch.model===model?{...ch,state:'fail'}:ch))
      } catch { res = null; setModelChips(c => c.map(ch => ch.model===model?{...ch,state:'fail'}:ch)) }
    }
    setModelChips(c => c.map(ch => ch.state==='pending'?{...ch,state:'fail'}:ch))

    if (!res) { setStatus({type:'error',title:'⚠️ API Hatası',sub:'Tüm modeller başarısız oldu.'}); setAnalyzing(false); return }

    const data = await res.json()
    let raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
    let parsed = null
    try { parsed = JSON.parse(raw) } catch { const m=raw.match(/\{[\s\S]*\}/); try{parsed=m?JSON.parse(m[0]):null}catch{} }

    if (!parsed?.is_food) {
      setStatus({ type:'error', title:'❌ Bu Bir Yemek Değil', sub:'Yüklenen fotoğrafta yiyecek/içecek tespit edilemedi.' })
    } else {
      setStatus({type:'success',title:`✅ ${parsed.food_name}`,sub:`Besin değerleri hesaplandı · ${usedModel}`})
      setResultData(parsed)
    }
    setAnalyzing(false)
  }

  const addFromResult = () => {
    if (!resultData) return
    saveFoods([...foods, { id: genId(), name:resultData.food_name, kcal:resultData.kcal, protein:resultData.protein, fat:resultData.fat, carb:resultData.carb }])
    setPreview(null); setImgB64(null); setStatus(null); setResultData(null); setModelChips([])
    showToast(`${resultData.food_name} eklendi ✓`)
  }

  const addManual = () => {
    if (!mf.name.trim()) return showToast('Yemek adı girin!','error')
    saveFoods([...foods, { id:genId(), name:mf.name, kcal:+mf.kcal||0, protein:+mf.protein||0, fat:+mf.fat||0, carb:+mf.carb||0 }])
    setMf({name:'',kcal:'',protein:'',fat:'',carb:''}); showToast(`${mf.name} eklendi ✓`)
  }

  const macros = [
    { key:'kcal',    label:'KALORİ',      unit:'kcal', color:'#e8ff47' },
    { key:'protein', label:'PROTEİN',     unit:'g',    color:'#47c8ff' },
    { key:'fat',     label:'YAĞ',         unit:'g',    color:'#ff8c47' },
    { key:'carb',    label:'KARBONHİDRAT',unit:'g',    color:'#47ff8a' },
  ]

  const chipStyle = (state) => {
    const base = { fontFamily:'DM Mono,monospace', fontSize:10, padding:'3px 9px', borderRadius:20, border:'1px solid var(--border)' }
    if (state==='ok')     return {...base, color:'var(--green)', borderColor:'rgba(71,255,138,.3)', background:'rgba(71,255,138,.07)'}
    if (state==='fail')   return {...base, color:'var(--red)',   borderColor:'rgba(255,71,71,.2)',  background:'rgba(255,71,71,.05)', textDecoration:'line-through'}
    if (state==='trying') return {...base, color:'var(--blue)',  borderColor:'rgba(71,200,255,.3)', background:'rgba(71,200,255,.07)'}
    return {...base, color:'var(--text-muted)', background:'var(--surface2)'}
  }

  const tabBtn = (id, icon, label) => (
    <button key={id} onClick={() => setTab(id)} style={{
      flex:1, padding:'9px 6px', borderRadius:8, border:'none', cursor:'pointer',
      fontFamily:'Bebas Neue,sans-serif', fontSize:12, letterSpacing:1.5,
      background: tab===id ? 'var(--accent)' : 'var(--surface2)',
      color: tab===id ? '#0a0a0a' : 'var(--text-muted)',
      transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:5,
    }}>{icon} {label}</button>
  )

  return (
    <div className="page">

      {/* ── Macro Summary ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:24 }}>
        {macros.map(({ key, label, unit, color }) => {
          const cur = Math.round(tot[key]); const yv = yTot[key]
          const diff = Math.round(cur - yv)
          const dir  = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
          return (
            <div key={key} className="card" style={{ padding:16, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
                background: cur>0 ? color : 'transparent',
                transform: cur>0 ? 'scaleX(1)' : 'scaleX(0)', transition:'transform .4s', transformOrigin:'left' }} />
              <div style={{ fontSize:10, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:6, fontFamily:'DM Mono,monospace' }}>{label}</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:34, lineHeight:1 }}>
                {cur} <span style={{ fontSize:13, color:'var(--text-muted)' }}>{unit}</span>
              </div>
              {yv > 0 && (
                <div style={{ marginTop:4 }}>
                  <span className={`delta delta-${dir}`} style={{ fontSize:10, padding:'2px 7px' }}>
                    {dir==='up'?'↑':dir==='down'?'↓':'='} {diff!==0?(diff>0?'+':'')+diff+' '+unit:'aynı'} <span style={{opacity:.5}}>dünden</span>
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Tab Seçici ── */}
      <div style={{ display:'flex', gap:6, marginBottom:20, background:'var(--surface2)', borderRadius:10, padding:4 }}>
        {tabBtn('db',     '🗄️', 'VERİTABANI')}
        {tabBtn('photo',  '📷', 'FOTOĞRAF')}
        {tabBtn('manual', '✏️', 'MANUEL')}
      </div>

      {/* ══════════════ VERİTABANI SEKMESI ══════════════ */}
      {tab === 'db' && (
        <div className="animate-fade">
          {/* Arama */}
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            <div style={{ flex:1, position:'relative' }}>
              <input
                type="text"
                placeholder="🔍  Yemek ara... (Tavuk, Pilav, Baklava...)"
                value={dbSearch}
                onChange={e => { setDbSearch(e.target.value); setDbSelected(null) }}
                style={{ paddingLeft:12 }}
              />
            </div>
          </div>

          {/* Kategori filtreleri */}
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:6, marginBottom:14, scrollbarWidth:'none' }}>
            {cats.map(cat => (
              <button key={cat} onClick={() => { setDbCat(cat); setDbSelected(null) }} style={{
                padding:'5px 12px', borderRadius:20, border:'1px solid var(--border)',
                background: dbCat===cat ? 'var(--accent)' : 'var(--surface2)',
                color: dbCat===cat ? '#0a0a0a' : 'var(--text-muted)',
                fontFamily:'DM Mono,monospace', fontSize:10, cursor:'pointer', whiteSpace:'nowrap',
                transition:'all .15s', flexShrink:0,
              }}>{cat}</button>
            ))}
          </div>

          {/* Seçili besin detayı */}
          {dbSelected && (
            <div className="animate-fade" style={{
              background:'rgba(232,255,71,.06)', border:'1px solid rgba(232,255,71,.2)',
              borderRadius:14, padding:'16px 18px', marginBottom:16,
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, color:'var(--accent)' }}>
                  {dbSelected.name}
                </div>
                <button onClick={() => setDbSelected(null)} style={{
                  background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16
                }}>✕</button>
              </div>

              {/* Besin etiketleri */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                {getFoodTags(dbSelected).map(tag => (
                  <span key={tag.label} style={{
                    fontFamily:'DM Mono,monospace', fontSize:10,
                    background:`${tag.color}18`, border:`1px solid ${tag.color}44`,
                    borderRadius:20, padding:'3px 10px', color: tag.color,
                  }}>{tag.label}</span>
                ))}
              </div>

              {/* Makrolar (100g için) */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
                {[
                  { val:dbSelected.kcal, lbl:'KCAL', col:'#e8ff47' },
                  { val:`${dbSelected.protein}g`, lbl:'PROTEİN', col:'#47c8ff' },
                  { val:`${dbSelected.fat}g`, lbl:'YAĞ', col:'#ff8c47' },
                  { val:`${dbSelected.carb}g`, lbl:'KARB', col:'#47ff8a' },
                ].map(({ val, lbl, col }) => (
                  <div key={lbl} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, color:col }}>{val}</div>
                    <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', letterSpacing:1, marginTop:2 }}>{lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', marginBottom:12 }}>
                ↑ 100g için değerler
              </div>

              {/* Gram ayarı + Ekle */}
              <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                <div className="form-group" style={{ flex:1 }}>
                  <span className="flabel">Miktar (gram)</span>
                  <input type="number" value={dbGram} onChange={e => setDbGram(e.target.value)}
                    min="1" max="2000" style={{ maxWidth:120 }} />
                </div>
                <div style={{ display:'flex', gap:6, marginBottom:0 }}>
                  {['50','100','150','200'].map(g => (
                    <button key={g} onClick={() => setDbGram(g)} style={{
                      padding:'8px 10px', borderRadius:8, border:'1px solid var(--border)',
                      background: dbGram===g ? 'var(--accent)' : 'var(--surface2)',
                      color: dbGram===g ? '#0a0a0a' : 'var(--text-muted)',
                      fontFamily:'DM Mono,monospace', fontSize:11, cursor:'pointer',
                    }}>{g}g</button>
                  ))}
                </div>
              </div>

              {/* Hesaplanan değerler */}
              {dbGram && +dbGram !== 100 && (
                <div style={{ marginTop:10, padding:'8px 12px', background:'var(--surface2)', borderRadius:8,
                  fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)' }}>
                  {dbGram}g için: &nbsp;
                  <b style={{ color:'#e8ff47' }}>{Math.round(dbSelected.kcal * +dbGram/100)} kcal</b> ·
                  <b style={{ color:'#47c8ff' }}> {Math.round(dbSelected.protein * +dbGram/100)}g P</b> ·
                  <b style={{ color:'#ff8c47' }}> {Math.round(dbSelected.fat * +dbGram/100)}g Y</b> ·
                  <b style={{ color:'#47ff8a' }}> {Math.round(dbSelected.carb * +dbGram/100)}g K</b>
                </div>
              )}

              <button className="btn btn-primary" style={{ width:'100%', marginTop:12 }} onClick={addFromDb}>
                ✓ Listeye Ekle
              </button>
            </div>
          )}

          {/* Besin listesi */}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)', fontFamily:'DM Mono,monospace', fontSize:12 }}>
                "{dbSearch}" için sonuç bulunamadı
              </div>
            )}
            {filtered.map((food, i) => {
              const tags = getFoodTags(food)
              const isSelected = dbSelected?.name === food.name
              return (
                <div key={i} onClick={() => { setDbSelected(food); setDbGram('100') }}
                  style={{
                    background: isSelected ? 'rgba(232,255,71,.06)' : 'var(--surface)',
                    border:`1px solid ${isSelected ? 'rgba(232,255,71,.25)' : 'var(--border)'}`,
                    borderRadius:10, padding:'11px 14px', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    transition:'all .15s', gap:12,
                  }}
                  onMouseEnter={e => { if(!isSelected) e.currentTarget.style.borderColor='#333' }}
                  onMouseLeave={e => { if(!isSelected) e.currentTarget.style.borderColor='var(--border)' }}
                >
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:1, marginBottom:4 }}>{food.name}</div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {tags.map(tag => (
                        <span key={tag.label} style={{
                          fontFamily:'DM Mono,monospace', fontSize:9,
                          color: tag.color, opacity:.85,
                        }}>{tag.label}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    {[
                      { val:food.kcal, u:'kcal', c:'#e8ff47' },
                      { val:`${food.protein}g`, u:'P', c:'#47c8ff' },
                      { val:`${food.carb}g`, u:'K', c:'#47ff8a' },
                    ].map(({ val, u, c }) => (
                      <span key={u} style={{ fontFamily:'DM Mono,monospace', fontSize:10,
                        padding:'2px 7px', borderRadius:20, border:'1px solid rgba(255,255,255,.07)', color:c }}>
                        {u} {val}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ══════════════ FOTOĞRAF SEKMESI ══════════════ */}
      {tab === 'photo' && (
        <div className="animate-fade">
          <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
          <div onClick={() => fileRef.current.click()} style={{
            border:'2px dashed var(--border)', borderRadius:14, padding: preview?0:'32px 24px',
            textAlign:'center', cursor:'pointer', transition:'all .2s',
            background:'var(--surface)', marginBottom:16, overflow:'hidden',
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='rgba(232,255,71,.02)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--surface)'}}>
            {preview
              ? <img src={preview} alt="preview" style={{ width:'100%', maxHeight:220, objectFit:'cover', display:'block', borderRadius:12 }} onClick={e=>e.stopPropagation()} />
              : <>
                  <div style={{ fontSize:36, marginBottom:10, opacity:.5 }}>🍽️</div>
                  <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, marginBottom:4 }}>YEMEĞİN FOTOĞRAFINI YÜKLE</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>Tıkla veya sürükle bırak · JPG / PNG / WEBP</div>
                </>
            }
          </div>

          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginBottom:16 }}>
            <button className="btn btn-primary" onClick={analyze} disabled={!imgB64 || analyzing}
              style={{ padding:'12px 30px', fontWeight:700, opacity:(!imgB64||analyzing)?.4:1, cursor:(!imgB64||analyzing)?'not-allowed':'pointer' }}>
              {analyzing && <span className="spinner" style={{ width:16, height:16, borderTopColor:'#0a0a0a', marginRight:8 }} />}
              🔍 Besin Değerlerini Hesapla
            </button>
            {modelChips.length > 0 && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center' }}>
                {modelChips.map(({ model, state }) => (
                  <span key={model} style={chipStyle(state)}>{model}</span>
                ))}
              </div>
            )}
          </div>

          {status && (
            <div className="animate-fade" style={{
              background:'var(--surface)', border:`1px solid ${status.type==='success'?'rgba(71,255,138,.25)':status.type==='error'?'rgba(255,71,71,.25)':'rgba(71,200,255,.25)'}`,
              borderRadius:12, padding:'16px 18px', marginBottom:18,
              display:'flex', alignItems:'center', gap:12,
            }}>
              {status.type==='analyzing' && <span className="spinner" />}
              {status.type==='success' && <span style={{ fontSize:20 }}>✅</span>}
              {status.type==='error'   && <span style={{ fontSize:20 }}>❌</span>}
              <div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:17, letterSpacing:1, marginBottom:2 }}>{status.title}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}
                  dangerouslySetInnerHTML={{ __html: status.sub }} />
              </div>
            </div>
          )}

          {resultData && (
            <div className="animate-fade" style={{
              background:'var(--surface2)', border:'1px solid rgba(232,255,71,.2)',
              borderRadius:12, padding:'16px 18px', marginBottom:16,
            }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:1.5, marginBottom:8, color:'var(--accent)' }}>{resultData.food_name}</div>
              {/* Besin etiketleri */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                {getFoodTags(resultData).map(tag => (
                  <span key={tag.label} style={{
                    fontFamily:'DM Mono,monospace', fontSize:10,
                    background:`${tag.color}18`, border:`1px solid ${tag.color}44`,
                    borderRadius:20, padding:'3px 10px', color: tag.color,
                  }}>{tag.label}</span>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
                {[
                  { val:resultData.kcal, lbl:'KCAL', col:'#e8ff47' },
                  { val:`${resultData.protein}g`, lbl:'PROTEİN', col:'#47c8ff' },
                  { val:`${resultData.fat}g`, lbl:'YAĞ', col:'#ff8c47' },
                  { val:`${resultData.carb}g`, lbl:'KARB', col:'#47ff8a' },
                ].map(({ val, lbl, col }) => (
                  <div key={lbl} style={{ background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, color:col }}>{val}</div>
                    <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', letterSpacing:1, marginTop:2 }}>{lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-primary" style={{ flex:1 }} onClick={addFromResult}>✓ Listeye Ekle</button>
                <button className="btn btn-ghost" onClick={() => setResultData(null)}>İptal</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ MANUEL SEKMESI ══════════════ */}
      {tab === 'manual' && (
        <div className="animate-fade card" style={{ padding:18, marginBottom:16 }}>
          <div className="section-title">MANUEL EKLE</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <span className="flabel">Yemek Adı</span>
              <input type="text" value={mf.name} placeholder="Tavuk Göğsü" onChange={e => setMf(p=>({...p,name:e.target.value}))} />
            </div>
            {[
              { key:'kcal', label:'Kalori (kcal)', ph:'250' },
              { key:'protein', label:'Protein (g)', ph:'30' },
              { key:'fat', label:'Yağ (g)', ph:'5' },
              { key:'carb', label:'Karbonhidrat (g)', ph:'0' },
            ].map(({ key, label, ph }) => (
              <div key={key} className="form-group">
                <span className="flabel">{label}</span>
                <input type="number" value={mf[key]} placeholder={ph} onChange={e => setMf(p=>({...p,[key]:e.target.value}))} />
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ width:'100%' }} onClick={addManual}>✓ Ekle</button>
        </div>
      )}

      {/* ── Bugün Yenilenler ── */}
      <div className="section-title" style={{ marginTop:24 }}>BUGÜN YENİLENLER</div>
      {foods.length === 0
        ? <div className="empty-state"><div className="empty-icon">🍽️</div><div className="empty-title">HENÜZ YEMEK YOK</div><div className="empty-sub">Veritabanından seç veya fotoğraf çek.</div></div>
        : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {foods.map((f, fi) => (
              <div key={f.id} className="card" style={{ padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:17, letterSpacing:1, marginBottom:4 }}>{f.name}</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {[{v:f.kcal,u:'kcal',c:'#e8ff47'},{v:`${f.protein}g`,u:'P',c:'#47c8ff'},{v:`${f.fat}g`,u:'Y',c:'#ff8c47'},{v:`${f.carb}g`,u:'K',c:'#47ff8a'}].map(({v,u,c})=>(
                      <span key={u} style={{ fontFamily:'DM Mono,monospace', fontSize:10, padding:'2px 7px', borderRadius:20, border:'1px solid rgba(255,255,255,.08)', color:c }}>
                        {u} {v}
                      </span>
                    ))}
                    {/* Mini etiketler */}
                    {getFoodTags(f).slice(0,1).map(tag => (
                      <span key={tag.label} style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:tag.color, opacity:.7 }}>{tag.label}</span>
                    ))}
                  </div>
                </div>
                <button className="btn btn-danger" onClick={() => saveFoods(foods.filter((_,i)=>i!==fi))}>✕</button>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
