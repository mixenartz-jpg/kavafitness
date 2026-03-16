import { useState } from 'react'

export default function DownloadPage() {
  const [modal, setModal] = useState(null) // 'android' | 'ios' | null
  const [copied, setCopied] = useState(false)

  const APP_URL = 'kerogym-new.vercel.app'

  const detectOS = () => {
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios'
    return 'android'
  }

  const copyURL = () => {
    navigator.clipboard.writeText('https://' + APP_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const androidSteps = [
    'Chrome tarayıcısını aç',
    `Adres çubuğuna ${APP_URL} yaz`,
    'Sağ üstteki ⋮ üç nokta menüsüne dokun',
    '"Ana ekrana ekle" veya "Uygulamayı yükle" seçeneğine bas',
    '"Ekle" de — ikon ana ekranda! ✅',
  ]

  const iosSteps = [
    'Safari tarayıcısını aç (Chrome çalışmaz!)',
    `Adres çubuğuna ${APP_URL} yaz`,
    'Alttaki □↑ paylaş butonuna dokun',
    '"Ana Ekrana Ekle" seçeneğine bas',
    'Sağ üstten "Ekle" de — ikon ana ekranda! ✅',
  ]

  return (
    <div className="page animate-fade" style={{ maxWidth: 520 }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232,255,71,.07) 0%, rgba(232,255,71,.02) 100%)',
        border: '1px solid rgba(232,255,71,.15)',
        borderRadius: 20, padding: '32px 28px', marginBottom: 28,
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -10, top: -10,
          fontFamily: 'Bebas Neue,sans-serif', fontSize: 100,
          color: 'rgba(232,255,71,.04)', letterSpacing: 4,
          userSelect: 'none', pointerEvents: 'none', lineHeight: 1,
        }}>APP</div>

        <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', marginBottom: 10 }}>
          MOBİL UYGULAMA
        </div>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 42, letterSpacing: 3, lineHeight: 1, marginBottom: 12 }}>
          TELEFONA<br /><span style={{ color: 'var(--accent)' }}>İNDİR</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, fontFamily: 'DM Mono,monospace' }}>
          Spor & beslenme takibini cebinde tut.<br />Kurulum gerektirmez, anında çalışır.
        </p>
      </div>

      {/* OS Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { os: 'android', icon: '🤖', label: 'Android', desc: 'Chrome ile aç, ana ekrana ekle', color: 'var(--green)' },
          { os: 'ios',     icon: '🍎', label: 'iPhone',  desc: 'Safari ile aç, ana ekrana ekle', color: 'var(--blue)' },
        ].map(({ os, icon, label, desc, color }) => (
          <div key={os} onClick={() => setModal(os)} className="card" style={{
            padding: '22px 18px', textAlign: 'center', cursor: 'pointer',
            transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 2, color, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Ana buton */}
      <button className="btn btn-primary" onClick={() => setModal(detectOS())} style={{
        width: '100%', padding: 16, fontSize: 16, letterSpacing: 3,
        fontFamily: 'Bebas Neue,sans-serif', marginBottom: 12,
      }}>
        ⬇ UYGULAMAYI İNDİR
      </button>

      {/* URL kopyala */}
      <div onClick={copyURL} style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'DM Mono,monospace', fontSize: 13, color: 'var(--accent)',
        marginBottom: 8, transition: 'all .2s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#444'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <span>{APP_URL}</span>
        <span style={{ color: 'var(--text-muted)' }}>{copied ? '✓ Kopyalandı!' : '⎘'}</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace', letterSpacing: 1 }}>
        ↑ linki kopyala ve tarayıcında aç
      </div>

      {/* Modal */}
      {modal && (
        <div onClick={e => e.target === e.currentTarget && setModal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)',
          backdropFilter: 'blur(8px)', zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="modal-box animate-fade" style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{
                fontFamily: 'Bebas Neue,sans-serif', fontSize: 20, letterSpacing: 3,
                color: modal === 'android' ? 'var(--green)' : 'var(--blue)',
              }}>
                {modal === 'android' ? '🤖 Android Kurulum' : '🍎 iPhone Kurulum'}
              </div>
              <button onClick={() => setModal(null)} style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', width: 30, height: 30, borderRadius: 8,
                cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            {(modal === 'android' ? androidSteps : iosSteps).map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'DM Mono,monospace', fontSize: 11,
                  background: modal === 'android' ? 'rgba(71,255,138,.15)' : 'rgba(71,200,255,.15)',
                  color: modal === 'android' ? 'var(--green)' : 'var(--blue)',
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, paddingTop: 4 }}>
                  <strong style={{ color: 'var(--accent)' }}>{step}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
