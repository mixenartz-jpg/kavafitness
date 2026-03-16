export default function HomePage() {
  const sections = [
    {
      icon: '🏋️',
      title: 'BUGÜN',
      desc: 'Günlük antrenmanını ekle, set/tekrar/ağırlık bilgilerini gir ve her gün takibini yap.',
    },
    {
      icon: '📅',
      title: 'GEÇMİŞ',
      desc: 'Geçmiş günlerin antrenmanlarını görüntüle. Haftalık takvimden istediğin güne geç.',
    },
    {
      icon: '🍎',
      title: 'KALORİ',
      desc: 'Yediğin besinleri ekle, günlük kalori ve makro besin değerlerini (protein/yağ/karbonhidrat) takip et.',
    },
    {
      icon: '🎯',
      title: 'HEDEFLER',
      desc: 'Günlük kalori ve makro hedeflerini belirle. Kalori sayfasında ilerleme çubuklarıyla takip edilir.',
    },
    {
      icon: '📊',
      title: 'İLERLEME',
      desc: 'Antrenman ve beslenme verilerini grafiklerle incele. Haftalık/aylık trendleri gör.',
    },
    {
      icon: '⚖️',
      title: 'ÖLÇÜLER',
      desc: 'Kilo, vücut yağı ve diğer ölçülerini kaydet. Zaman içindeki değişimini grafikle takip et.',
    },
    {
      icon: '📸',
      title: 'EGZERSİZ TANIMA',
      desc: 'Kamera veya galerinden bir egzersiz fotoğrafı yükle, yapay zeka egzersizi tanısın ve bilgi versin.',
    },
  ]

  return (
    <div className="page animate-fade" style={{ maxWidth: 700 }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232,255,71,.07) 0%, rgba(232,255,71,.02) 100%)',
        border: '1px solid rgba(232,255,71,.15)',
        borderRadius: 20,
        padding: '36px 32px',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* BG text */}
        <div style={{
          position: 'absolute', right: -10, top: -10,
          fontFamily: 'Bebas Neue,sans-serif', fontSize: 120,
          color: 'rgba(232,255,71,.04)', letterSpacing: 4,
          userSelect: 'none', pointerEvents: 'none', lineHeight: 1,
        }}>GYM</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <img src="/logo.png" alt="KeroGym" style={{ height: 52, width: 'auto' }} />
          <div>
            <div style={{
              fontFamily: 'Bebas Neue,sans-serif', fontSize: 36,
              letterSpacing: 5, color: 'var(--accent)', lineHeight: 1,
            }}>
              KERO<span style={{ color: 'var(--text-muted)' }}>GYM</span>
            </div>
            <div style={{
              fontFamily: 'DM Mono,monospace', fontSize: 10,
              letterSpacing: 3, color: 'var(--text-muted)', marginTop: 3,
            }}>
              SPOR & BESLENME TAKİP
            </div>
          </div>
        </div>

        <p style={{
          fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.75,
          fontFamily: 'DM Sans,sans-serif', maxWidth: 480,
        }}>
          KeroGym, antrenmanlarını, kalorilerini ve vücut ölçülerini tek bir yerde takip etmeni sağlar.
          Hesap aç, verilerini kaydet — her cihazdan erişebilirsin.
          Kurulum gerekmez, ana ekrana ekleyerek uygulama gibi kullanabilirsin.
        </p>
      </div>

      {/* Nasıl kullanılır */}
      <div className="section-title">NASIL KULLANILIR</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36 }}>
        {sections.map((s, i) => (
          <div key={i} className="card" style={{
            padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{
                fontFamily: 'Bebas Neue,sans-serif', fontSize: 13,
                letterSpacing: 2, color: 'var(--accent)', marginBottom: 3,
              }}>
                {s.title}
              </div>
              <div style={{
                fontSize: 12, color: 'var(--text-muted)',
                fontFamily: 'DM Mono,monospace', lineHeight: 1.6,
              }}>
                {s.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kim yaptı */}
      <div className="section-title">GELİŞTİRİCİ</div>
      <div className="card" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>
            🧑‍💻
          </div>
          <div>
            <div style={{
              fontFamily: 'Bebas Neue,sans-serif', fontSize: 18,
              letterSpacing: 2, marginBottom: 2,
            }}>
              slmbn
            </div>
            <div style={{
              fontFamily: 'DM Mono,monospace', fontSize: 10,
              color: 'var(--text-muted)', letterSpacing: 1,
            }}>
              KeroGym'in yaratıcısı
            </div>
          </div>
        </div>
        <p style={{
          fontSize: 12, color: 'var(--text-muted)',
          fontFamily: 'DM Mono,monospace', lineHeight: 1.7,
          borderTop: '1px solid var(--border)', paddingTop: 14,
        }}>
          KeroGym kişisel bir proje olarak geliştirildi. Spor ve beslenme takibini
          daha kolay hale getirmek için tasarlandı. Ücretsiz, reklamsız ve tamamen
          tarayıcı tabanlı çalışır.
        </p>
      </div>

      {/* Geri bildirim */}
      <div className="section-title">GERİ BİLDİRİM</div>
      <div className="card" style={{ padding: '20px 22px', marginBottom: 8 }}>
        <p style={{
          fontSize: 12, color: 'var(--text-muted)',
          fontFamily: 'DM Mono,monospace', lineHeight: 1.7, marginBottom: 16,
        }}>
          Hata buldun mu? Önerim var mı? Instagram'dan ulaşabilirsin.
          Her geri bildirim uygulamayı daha iyi yapıyor.
        </p>
        <a
          href="https://instagram.com/slmbnmixo"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10,
            background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
            color: '#fff', fontSize: 12, fontWeight: 600,
            textDecoration: 'none', fontFamily: 'DM Mono,monospace',
            transition: 'opacity .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <svg width="14" height="14" fill="#fff" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          @slmbnmixo — Instagram
        </a>
      </div>

      {/* Version */}
      <div style={{
        textAlign: 'center', marginTop: 32, paddingBottom: 8,
        fontFamily: 'DM Mono,monospace', fontSize: 10,
        color: 'var(--border)', letterSpacing: 2,
      }}>
        KEROGYM v1.0 · 2025
      </div>

    </div>
  )
}
