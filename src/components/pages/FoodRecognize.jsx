import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext'

const GEMINI_KEY  = 'AIzaSyAODsXtQwZfZRHAxLE46uu8XRbOwkd4t6U'
const FOOD_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]

function StatusCard({ status }) {
  if (!status) return null
  const border = status.type === 'success'
    ? 'rgba(71,255,138,.25)'
    : status.type === 'error'
    ? 'rgba(255,71,71,.25)'
    : 'rgba(71,200,255,.25)'
  return (
    <div style={{ background:'var(--surface)', border:`1px solid ${border}`, borderRadius:12, padding:'14px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:12 }} className="animate-fade">
      {status.type === 'analyzing' && <span className="spinner" />}
      {status.type === 'success'   && <span style={{ fontSize:20 }}>✅</span>}
      {status.type === 'error'     && <span style={{ fontSize:20 }}>❌</span>}
      <div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:1, marginBottom:2 }}>{status.title}</div>
        <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Space Mono,monospace' }}>{status.sub}</div>
      </div>
    </div>
  )
}

function MacroBadge({ label, value, unit, color }) {
  return (
    <div style={{ textAlign:'center', flex:1 }}>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', marginTop:2 }}>{unit}</div>
    </div>
  )
}

// ── Fotoğraftan Yemek Tanıma ──
function PhotoTab({ foods, saveFoods, showToast, genId }) {
  const [imgB64,     setImgB64]     = useState(null)
  const [imgMime,    setImgMime]    = useState(null)
  const [preview,    setPreview]    = useState(null)
  const [status,     setStatus]     = useState(null)
  const [chips,      setChips]      = useState([])
  const [result,     setResult]     = useState(null)
  const [analyzing,  setAnalyzing]  = useState(false)
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const d = ev.target.result
      setImgB64(d.split(',')[1]); setImgMime(file.type)
      setPreview(d); setStatus(null); setResult(null); setChips([])
    }
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!imgB64) return
    setAnalyzing(true); setResult(null)

    const prompt = `Analyze this image STRICTLY. Does it show food, a meal, a drink, or an edible item?
IMPORTANT: If not food/drink, respond with is_food: false.
Respond with ONLY valid JSON:
{"is_food":true,"food_name":"Tavuk Göğsü Izgara","kcal":250,"protein":45,"fat":5,"carb":0,"portion":"150g tahmini"}
OR: {"is_food":false,"food_name":"","kcal":0,"protein":0,"fat":0,"carb":0,"portion":""}
Rules: food_name in Turkish, integers only, estimate for visible portion size, no markdown, no explanation.`

    let res = null, usedModel = null
    const initChips = FOOD_MODELS.map(m => ({ model:m, state:'pending' }))
    setChips([...initChips])

    for (const model of FOOD_MODELS) {
      setChips(c => c.map(ch => ch.model === model ? { ...ch, state:'trying' } : ch))
      setStatus({ type:'analyzing', title:'Analiz Ediliyor', sub:`Model: ${model}` })
      try {
        res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
          { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ contents:[{ parts:[{ text:prompt },{ inline_data:{ mime_type:imgMime, data:imgB64 } }] }], generationConfig:{ temperature:.1, maxOutputTokens:256 } }) }
        )
        if (res.ok) { usedModel = model; setChips(c => c.map(ch => ch.model === model ? { ...ch, state:'ok' } : ch)); break }
        res = null; setChips(c => c.map(ch => ch.model === model ? { ...ch, state:'fail' } : ch))
      } catch { res = null; setChips(c => c.map(ch => ch.model === model ? { ...ch, state:'fail' } : ch)) }
    }
    setChips(c => c.map(ch => ch.state === 'pending' ? { ...ch, state:'fail' } : ch))

    if (!res) { setStatus({ type:'error', title:'⚠️ API Hatası', sub:'Tüm modeller başarısız.' }); setAnalyzing(false); return }

    const data = await res.json()
    let raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
    let parsed = null
    try { parsed = JSON.parse(raw) } catch { const m = raw.match(/\{[\s\S]*\}/); try { parsed = m ? JSON.parse(m[0]) : null } catch {} }

    if (!parsed?.is_food) {
      setStatus({ type:'error', title:'❌ Yemek Değil', sub:'Fotoğrafta yiyecek/içecek tespit edilemedi.' })
    } else {
      setStatus({ type:'success', title:`✅ ${parsed.food_name}`, sub:`${parsed.portion || ''} · ${usedModel}` })
      setResult(parsed)
    }
    setAnalyzing(false)
  }

  const addFood = () => {
    if (!result) return
    saveFoods([...foods, { id:genId(), name:result.food_name, kcal:result.kcal, protein:result.protein, fat:result.fat, carb:result.carb }])
    setPreview(null); setImgB64(null); setStatus(null); setResult(null); setChips([])
    showToast(`${result.food_name} eklendi ✓`)
  }

  const chipStyle = (state) => {
    const base = { fontFamily:'Space Mono,monospace', fontSize:9, padding:'2px 8px', borderRadius:20, border:'1px solid var(--border)' }
    if (state === 'ok')     return { ...base, color:'var(--green)',      borderColor:'rgba(71,255,138,.3)',  background:'rgba(71,255,138,.07)' }
    if (state === 'fail')   return { ...base, color:'var(--red)',        borderColor:'rgba(255,71,71,.2)',   background:'rgba(255,71,71,.05)',   textDecoration:'line-through' }
    if (state === 'trying') return { ...base, color:'var(--blue)',       borderColor:'rgba(71,200,255,.3)',  background:'rgba(71,200,255,.07)' }
    return { ...base, color:'var(--text-muted)', background:'var(--surface2)' }
  }

  return (
    <div>
      <p style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.8, marginBottom:20 }}>
        Yemeğinin fotoğrafını yükle — AI içeriği tanır ve kalori/makro değerlerini tahmin eder.
      </p>

      {/* Fotoğraf yükleme alanı */}
      <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
      <div
        onClick={() => fileRef.current.click()}
        style={{ border:'2px dashed var(--border)', borderRadius:14, padding: preview ? 0 : '40px 24px', textAlign:'center', cursor:'pointer', transition:'all .2s', background:'var(--surface)', marginBottom:16, overflow:'hidden' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(232,255,71,.02)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
      >
        {preview
          ? <img src={preview} alt="preview" style={{ width:'100%', maxHeight:260, objectFit:'cover', display:'block', borderRadius:12 }} onClick={e => e.stopPropagation()} />
          : <>
              <div style={{ fontSize:44, marginBottom:12, opacity:.5 }}>🍽️</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, marginBottom:4 }}>FOTOĞRAF YÜKLE</div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)' }}>Tıkla · JPG / PNG / WEBP</div>
            </>
        }
      </div>

      {/* Analiz butonu + model chip'leri */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginBottom:16 }}>
        <button
          className="btn btn-primary"
          onClick={analyze}
          disabled={!imgB64 || analyzing}
          style={{ padding:'12px 28px', fontSize:14, opacity: (!imgB64 || analyzing) ? .4 : 1, cursor: (!imgB64 || analyzing) ? 'not-allowed' : 'pointer' }}
        >
          {analyzing && <span className="spinner" style={{ width:16, height:16, borderTopColor:'#0a0a0a', marginRight:8 }} />}
          🔍 Kaloriyi Hesapla
        </button>
        {chips.length > 0 && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'center' }}>
            {chips.map(({ model, state }) => <span key={model} style={chipStyle(state)}>{model}</span>)}
          </div>
        )}
      </div>

      <StatusCard status={status} />

      {/* Sonuç */}
      {result && (
        <div className="animate-fade card" style={{ padding:'18px 20px', marginBottom:16 }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, color:'var(--accent)', marginBottom:16 }}>
            {result.food_name}
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:16, paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
            <MacroBadge label="KALORİ"  value={result.kcal}    unit="kcal" color="#e8ff47" />
            <MacroBadge label="PROTEİN" value={result.protein} unit="g"    color="#47c8ff" />
            <MacroBadge label="YAĞ"     value={result.fat}     unit="g"    color="#ff8c47" />
            <MacroBadge label="KARB"    value={result.carb}    unit="g"    color="#47ff8a" />
          </div>
          {result.portion && (
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)', marginBottom:14 }}>
              📏 Tahmini porsiyon: {result.portion}
            </div>
          )}
          <button className="btn btn-primary" onClick={addFood} style={{ width:'100%', padding:12 }}>
            ➕ Kalori Listesine Ekle
          </button>
        </div>
      )}
    </div>
  )
}

// ── Etiket / Ambalaj Okuma ──
function LabelTab({ foods, saveFoods, showToast, genId }) {
  const [img,      setImg]      = useState(null)
  const [mime,     setMime]     = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [status,   setStatus]   = useState(null)
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [gram,     setGram]     = useState('100')
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const d = ev.target.result
      setImg(d.split(',')[1]); setMime(file.type)
      setPreview(d); setStatus(null); setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!img) return
    setLoading(true); setResult(null)
    setStatus({ type:'analyzing', title:'Etiket Okunuyor', sub:'AI besin değerlerini tespit ediyor...' })

    const prompt = `Bu görsele bak. Bir gıda ürününün besin değerleri etiketi, ambalajı veya barkodu olabilir.
Görseldeki ürünün besin değerlerini oku ve JSON formatında döndür.
Eğer besin değerleri tablosu varsa o tablodan oku.
Eğer sadece ürün ambalajı görünüyorsa, ürün adından tahmin et.
Eğer hiç gıda/ürün görseli değilse is_product: false döndür.
SADECE JSON döndür:
{"is_product":true,"product_name":"Ürün Adı","serving_g":100,"kcal":250,"protein":10,"fat":8,"carb":35}
veya: {"is_product":false}
Kurallar: Türkçe isim, tamsayılar, 100g için değerler tercih et.`

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents:[{ parts:[{ text:prompt }, { inline_data:{ mime_type:mime, data:img } }] }], generationConfig:{ temperature:.1, maxOutputTokens:512 } }) }
      )
      const data = await res.json()
      let raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
      let parsed = null
      try { parsed = JSON.parse(raw) } catch { const m = raw.match(/\{[\s\S]*\}/); try { parsed = m ? JSON.parse(m[0]) : null } catch {} }

      if (!parsed?.is_product) {
        setStatus({ type:'error', title:'❌ Ürün Bulunamadı', sub:'Görselde gıda etiketi veya ürün tespit edilemedi.' })
      } else {
        setStatus({ type:'success', title:`✅ ${parsed.product_name}`, sub:`${parsed.serving_g || 100}g için besin değerleri okundu` })
        setResult(parsed)
        setGram(String(parsed.serving_g || 100))
      }
    } catch { setStatus({ type:'error', title:'⚠️ Hata', sub:'Bağlantı hatası, tekrar dene.' }) }
    setLoading(false)
  }

  const addFood = () => {
    if (!result) return
    const ratio = (+gram || 100) / (result.serving_g || 100)
    const entry = {
      id: genId(),
      name: result.product_name + (gram !== String(result.serving_g || 100) ? ` (${gram}g)` : ''),
      kcal:    Math.round(result.kcal    * ratio),
      protein: Math.round(result.protein * ratio),
      fat:     Math.round(result.fat     * ratio),
      carb:    Math.round(result.carb    * ratio),
    }
    saveFoods([...foods, entry])
    setPreview(null); setImg(null); setStatus(null); setResult(null)
    showToast(`${entry.name} eklendi ✓`)
  }

  return (
    <div>
      <p style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.8, marginBottom:20 }}>
        Ürün ambalajı veya besin değerleri tablosunun fotoğrafını yükle — AI etiketi okur ve değerleri otomatik doldurur.
      </p>

      <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
      <div
        onClick={() => fileRef.current.click()}
        style={{ border:'2px dashed var(--border)', borderRadius:14, padding: preview ? 0 : '40px 24px', textAlign:'center', cursor:'pointer', transition:'all .2s', background:'var(--surface)', marginBottom:16, overflow:'hidden' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#47c8ff'; e.currentTarget.style.background = 'rgba(71,200,255,.02)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
      >
        {preview
          ? <img src={preview} alt="preview" style={{ width:'100%', maxHeight:260, objectFit:'cover', display:'block', borderRadius:12 }} onClick={e => e.stopPropagation()} />
          : <>
              <div style={{ fontSize:44, marginBottom:12, opacity:.5 }}>🏷️</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, marginBottom:4 }}>ETİKET YÜKLE</div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)' }}>Ambalaj veya besin tablosu · JPG / PNG</div>
            </>
        }
      </div>

      <button
        className="btn btn-primary"
        onClick={analyze}
        disabled={!img || loading}
        style={{ width:'100%', padding:12, marginBottom:16, opacity: (!img || loading) ? .4 : 1, cursor: (!img || loading) ? 'not-allowed' : 'pointer' }}
      >
        {loading && <span className="spinner" style={{ width:15, height:15, borderTopColor:'#0a0a0a', marginRight:8 }} />}
        🏷️ Etiketi Oku
      </button>

      <StatusCard status={status} />

      {result && (
        <div className="animate-fade card" style={{ padding:'18px 20px', marginBottom:16 }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, color:'var(--blue)', marginBottom:16 }}>
            {result.product_name}
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:16, paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
            <MacroBadge label="KALORİ"  value={Math.round(result.kcal    * ((+gram||100)/(result.serving_g||100)))} unit="kcal" color="#e8ff47" />
            <MacroBadge label="PROTEİN" value={Math.round(result.protein * ((+gram||100)/(result.serving_g||100)))} unit="g"    color="#47c8ff" />
            <MacroBadge label="YAĞ"     value={Math.round(result.fat     * ((+gram||100)/(result.serving_g||100)))} unit="g"    color="#ff8c47" />
            <MacroBadge label="KARB"    value={Math.round(result.carb    * ((+gram||100)/(result.serving_g||100)))} unit="g"    color="#47ff8a" />
          </div>
          <div className="form-group" style={{ marginBottom:14 }}>
            <span className="flabel">Gram miktarı ayarla</span>
            <input type="number" value={gram} onChange={e => setGram(e.target.value)} placeholder={String(result.serving_g || 100)} />
          </div>
          <button className="btn btn-primary" onClick={addFood} style={{ width:'100%', padding:12 }}>
            ➕ Kalori Listesine Ekle
          </button>
        </div>
      )}
    </div>
  )
}

// ── Ana Sayfa ──
export default function FoodRecognizePage() {
  const { foods, saveFoods, showToast, genId } = useApp()
  const [tab, setTab] = useState('photo')

  const tabStyle = (id) => ({
    flex:1, padding:'9px 4px', border:'none', cursor:'pointer',
    fontFamily:'Bebas Neue,sans-serif', fontSize:11, letterSpacing:1.5,
    background: tab === id ? 'var(--accent)' : 'transparent',
    color: tab === id ? '#0a0a0a' : 'var(--text-muted)',
    borderRadius:6, transition:'all .15s',
  })

  return (
    <div className="page animate-fade" style={{ maxWidth:680 }}>

      {/* Başlık */}
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, letterSpacing:3, color:'var(--accent)', marginBottom:6 }}>
        YEMEK TANIMA
      </div>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)', letterSpacing:1, marginBottom:20 }}>
        AI destekli kalori & makro hesaplama
      </div>

      {/* Sekme */}
      <div style={{ display:'flex', gap:3, background:'var(--surface2)', borderRadius:10, padding:3, marginBottom:20 }}>
        <button style={tabStyle('photo')} onClick={() => setTab('photo')}>📷 FOTOĞRAFTAN HESAPLA</button>
        <button style={tabStyle('label')} onClick={() => setTab('label')}>🏷️ ETİKET OKU</button>
      </div>

      {tab === 'photo' && <PhotoTab foods={foods} saveFoods={saveFoods} showToast={showToast} genId={genId} />}
      {tab === 'label' && <LabelTab foods={foods} saveFoods={saveFoods} showToast={showToast} genId={genId} />}

    </div>
  )
}
