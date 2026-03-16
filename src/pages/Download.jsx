export default function DownloadPage() {
  const detectOS = () => {
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios'
    return 'android'
  }

  const openSteps = (os) => {
    document.getElementById(os + '-modal').style.display = 'flex'
  }
  const closeSteps = (os) => {
    document.getElementById(os + '-modal').style.display = 'none'
  }

  const copyURL = () => {
    navigator.clipboard.writeText('https://kerogym-spor.vercel.app')
    const t = document.getElementById('copied-toast')
    t.classList.add('show')
    setTimeout(() => t.classList.remove('show'), 2000)
  }

  return (
    <>
      <style>{`
        .dl-page { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; background:var(--bg); }
        .dl-wrapper { max-width:480px; width:100%; text-align:center; }
        .dl-logo-row { display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:48px; }
        .dl-logo-icon { width:52px; height:52px; background:var(--accent); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:26px; }
        .dl-logo-text { font-family:'Bebas Neue',sans-serif; font-size:36px; letter-spacing:5px; }
        .dl-logo-text span { color:var(--text-muted); }
        .dl-tag { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:4px; color:var(--accent); text-transform:uppercase; margin-bottom:14px; }
        .dl-h1 { font-family:'Bebas Neue',sans-serif; font-size:clamp(42px,10vw,72px); letter-spacing:3px; line-height:1; margin-bottom:16px; }
        .dl-h1 span { color:var(--accent); }
        .dl-sub { font-size:15px; color:var(--text-muted); line-height:1.6; margin-bottom:48px; }
        .dl-cards { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
        .dl-card { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:24px 20px; cursor:pointer; transition:all .2s; }
        .dl-card:hover { border-color:#444; transform:translateY(-2px); }
        .dl-card-icon { font-size:32px; margin-bottom:10px; display:block; }
        .dl-card-os { font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:2px; margin-bottom:4px; }
        .dl-card.android .dl-card-os { color:var(--green); }
        .dl-card.ios .dl-card-os { color:var(--blue); }
        .dl-card-desc { font-size:11px; color:var(--text-muted); line-height:1.5; }
        .dl-btn { width:100%; padding:18px; background:var(--accent); color:#0a0a0a; border:none; border-radius:14px; font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:4px; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:12px; }
        .dl-btn:hover { background:#d4eb30; transform:translateY(-2px); box-shadow:0 8px 32px rgba(232,255,71,.25); }
        .dl-url { background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:12px 16px; font-family:'DM Mono',monospace; font-size:13px; color:var(--accent); display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px; cursor:pointer; transition:all .2s; }
        .dl-url:hover { border-color:#444; }
        .dl-hint { font-size:11px; color:var(--text-muted); font-family:'DM Mono',monospace; letter-spacing:1px; }
        .dl-overlay { position:fixed; inset:0; background:rgba(0,0,0,.8); backdrop-filter:blur(8px); z-index:100; display:none; align-items:center; justify-content:center; padding:20px; }
        .dl-box { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:32px 28px; width:min(420px,100%); }
        .dl-box-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; }
        .dl-box-title { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:3px; }
        .dl-box-title.android { color:var(--green); }
        .dl-box-title.ios { color:var(--blue); }
        .dl-close { background:var(--surface2); border:1px solid var(--border); color:var(--text-muted); width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .dl-close:hover { color:var(--text); }
        .dl-step { display:flex; align-items:flex-start; gap:14px; margin-bottom:18px; }
        .dl-step-num { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'DM Mono',monospace; font-size:11px; flex-shrink:0; }
        .android .dl-step-num { background:rgba(71,255,138,.15); color:var(--green); }
        .ios .dl-step-num { background:rgba(71,200,255,.15); color:var(--blue); }
        .dl-step-text { font-size:14px; line-height:1.5; }
        .dl-step-text strong { color:var(--accent); }
        .dl-copied { position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(10px); background:var(--surface2); border:1px solid rgba(71,255,138,.3); border-radius:8px; padding:10px 16px; font-family:'DM Mono',monospace; font-size:11px; color:var(--green); opacity:0; transition:all .3s; pointer-events:none; }
        .dl-copied.show { opacity:1; transform:translateX(-50%) translateY(0); }
      `}</style>

      <div className="dl-page">
        <div className="dl-wrapper">
          <div className="dl-logo-row">
            <div className="dl-logo-icon">💪</div>
            <div className="dl-logo-text">KERO<span>GYM</span></div>
          </div>
          <div className="dl-tag">Mobil Uygulama</div>
          <h1 className="dl-h1">TELEFONA<br /><span>İNDİR</span></h1>
          <p className="dl-sub">Spor & beslenme takibini cebinde tut.<br />Kurulum gerektirmez, anında çalışır.</p>
          <div className="dl-cards">
            <div className="dl-card android" onClick={() => openSteps('android')}>
              <span className="dl-card-icon">🤖</span>
              <div className="dl-card-os">Android</div>
              <div className="dl-card-desc">Chrome ile aç, ana ekrana ekle</div>
            </div>
            <div className="dl-card ios" onClick={() => openSteps('ios')}>
              <span className="dl-card-icon">🍎</span>
              <div className="dl-card-os">iPhone</div>
              <div className="dl-card-desc">Safari ile aç, ana ekrana ekle</div>
            </div>
          </div>
          <button className="dl-btn" onClick={() => openSteps(detectOS())}>⬇ UYGULAMAYI İNDİR</button>
          <div className="dl-url" onClick={copyURL}>
            <span>kerogym-spor.vercel.app</span>
            <span>⎘</span>
          </div>
          <div className="dl-hint">↑ linki kopyala ve tarayıcında aç</div>
        </div>
      </div>

      {/* Android Modal */}
      <div className="dl-overlay" id="android-modal" onClick={(e) => { if(e.target.id==='android-modal') closeSteps('android') }}>
        <div className="dl-box">
          <div className="dl-box-header">
            <div className="dl-box-title android">🤖 Android Kurulum</div>
            <button className="dl-close" onClick={() => closeSteps('android')}>✕</button>
          </div>
          <div className="android">
            {[['Chrome tarayıcısını aç'],['Adres çubuğuna kerogym-spor.vercel.app yaz'],['Sağ üstteki ⋮ üç nokta menüsüne dokun'],['Ana ekrana ekle veya Uygulamayı yükle seçeneğine bas'],['Ekle de — ikon ana ekranda! ✅']].map((s,i) => (
              <div className="dl-step" key={i}>
                <div className="dl-step-num">{i+1}</div>
                <div className="dl-step-text"><strong>{s[0]}</strong></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* iOS Modal */}
      <div className="dl-overlay" id="ios-modal" onClick={(e) => { if(e.target.id==='ios-modal') closeSteps('ios') }}>
        <div className="dl-box">
          <div className="dl-box-header">
            <div className="dl-box-title ios">🍎 iPhone Kurulum</div>
            <button className="dl-close" onClick={() => closeSteps('ios')}>✕</button>
          </div>
          <div className="ios">
            {[['Safari tarayıcısını aç (Chrome çalışmaz!)'],['Adres çubuğuna kerogym-spor.vercel.app yaz'],['Alttaki □↑ paylaş butonuna dokun'],['Ana Ekrana Ekle seçeneğine bas'],['Sağ üstten Ekle de — ikon ana ekranda! ✅']].map((s,i) => (
              <div className="dl-step" key={i}>
                <div className="dl-step-num">{i+1}</div>
                <div className="dl-step-text"><strong>{s[0]}</strong></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dl-copied" id="copied-toast">✓ Link kopyalandı</div>
    </>
  )
}