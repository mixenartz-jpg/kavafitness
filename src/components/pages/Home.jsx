export default function HomePage() {
  const sections = [
    {
      icon: '🏋️',
      title: 'BUGÜN',
      desc: 'Günlük antrenmanını ekle, set/tekrar/ağırlık bilgilerini gir ve her gün takibini yap.',
    },
    {
      icon: '📋',
      title: 'ŞABLONLAR',
      desc: 'Kendi antrenman şablonlarını oluştur. Göğüs günü, bacak günü gibi hazır programları tek tıkla uygula.',
    },
    {
      icon: '📅',
      title: 'GEÇMİŞ',
      desc: 'Geçmiş günlerin antrenmanlarını görüntüle. Haftalık takvimden istediğin güne geç.',
    },
    {
      icon: '📈',
      title: 'HAFTALIK ÖZET',
      desc: 'Bu haftanın antrenman, kalori ve ölçüm özetini gör. Geçen haftayla karşılaştır.',
    },
    {
      icon: '📊',
      title: 'İLERLEME',
      desc: 'Antrenman ve beslenme verilerini grafiklerle incele. Haftalık/aylık trendleri gör.',
    },
    {
      icon: '🍎',
      title: 'KALORİ TAKİBİ',
      desc: 'Yediğin besinleri ekle, günlük kalori ve makro besin değerlerini (protein/yağ/karbonhidrat) takip et.',
    },
    {
      icon: '🎯',
      title: 'MAKRO HEDEFLER',
      desc: 'Günlük kalori ve makro hedeflerini belirle. Kalori sayfasında ilerleme çubuklarıyla takip edilir.',
    },
    {
      icon: '🤖',
      title: 'AI KOÇU',
      desc: 'Aktivite kalori hesapla, egzersiz alternatifleri öğren, kişiselleştirilmiş beslenme önerileri al.',
    },
    {
      icon: '⚙️',
      title: 'AYARLAR',
      desc: 'Profilini, hedeflerini ve vücut ölçülerini buradan yönet. Kilo/boy/yaş bilgilerin makrolarını otomatik hesaplar.',
    },
  ]

  return (
    <div className="page animate-fade" style={{ maxWidth: 700 }}>

      {/* ÖNEMLİ NOT */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,71,71,.08) 0%, rgba(255,140,71,.05) 100%)',
        border: '1px solid rgba(255,71,71,.25)',
        borderRadius: 16,
        padding: '20px 22px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -8, top: -8,
          fontFamily: 'Bebas Neue,sans-serif', fontSize: 80,
          color: 'rgba(255,71,71,.05)', letterSpacing: 2,
          userSelect: 'none', pointerEvents: 'none', lineHeight: 1,
        }}>BETA</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'rgba(255,71,71,.12)', border: '1px solid rgba(255,71,71,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>📢</div>
          <div style={{
            fontFamily: 'Bebas Neue,sans-serif', fontSize: 16,
            letterSpacing: 3, color: 'var(--red)',
          }}>ÖNEMLİ NOT</div>
        </div>

        <p style={{
          fontSize: 13, lineHeight: 1.85,
          fontFamily: 'DM Sans,sans-serif',
          color: 'var(--text-dim)',
          marginBottom: 12,
        }}>
          KeroGym şu an <strong style={{ color: 'var(--red)' }}>prototip aşamasındadır</strong> — bazı özellikler eksik veya hatalı olabilir.
          Uygulama yalnızca sporcular için değil, <strong style={{ color: 'var(--accent)' }}>diyet yapanlar için de</strong> tasarlanmıştır;
          kalori takibi, makro hedefleri ve AI koç özellikleriyle beslenme sürecinizi de kolayca yönetebilirsiniz.
        </p>
        <p style={{
          fontSize: 13, lineHeight: 1.85,
          fontFamily: 'DM Sans,sans-serif',
          color: 'var(--text-dim)',
          marginBottom: 12,
        }}>
          Geri bildirimleriniz uygulamanın gelişimi için son derece değerlidir.
          Karşılaştığınız hatalar, eksik gördüğünüz özellikler veya önerileriniz için lütfen Instagram üzerinden ulaşın.
        </p>
        <p style={{
          fontSize: 12, lineHeight: 1.7,
          fontFamily: 'DM Mono,monospace',
          color: 'var(--text-muted)',
        }}>
          🚀 Yakında <strong style={{ color: 'var(--accent)' }}>tam sürüm uygulama</strong> olarak yayınlanacaktır.
          Şimdiden teşekkürler!
        </p>

        <div style={{ marginTop: 14 }}>
          <a href="https://instagram.com/slmbnmixo" target="_blank" rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 8,
              background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
              color: '#fff', fontSize: 11, fontWeight: 600,
              textDecoration: 'none', fontFamily: 'DM Mono,monospace',
            }}>
            <svg width="12" height="12" fill="#fff" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Geri Bildirim — @slmbnmixo
          </a>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232,255,71,.07) 0%, rgba(232,255,71,.02) 100%)',
        border: '1px solid rgba(232,255,71,.15)',
        borderRadius: 20,
        padding: '32px 28px',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -10, top: -10,
          fontFamily: 'Bebas Neue,sans-serif', fontSize: 120,
          color: 'rgba(232,255,71,.04)', letterSpacing: 4,
          userSelect: 'none', pointerEvents: 'none', lineHeight: 1,
        }}>GYM</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <img src="/logo.png" alt="KeroGym" style={{ height: 52, width: 'auto' }} />
          <div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 36, letterSpacing: 5, color: 'var(--accent)', lineHeight: 1 }}>
              KERO<span style={{ color: 'var(--text-muted)' }}>GYM</span>
            </div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, letterSpacing: 3, color: 'var(--text-muted)', marginTop: 3 }}>
              SPOR & BESLENME TAKİP
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.8, fontFamily: 'DM Sans,sans-serif', maxWidth: 480 }}>
          KeroGym; antrenmanlarını, kalorilerini ve vücut ölçülerini tek bir yerde takip etmeni sağlar.
          Spor yapanlar kadar <strong style={{ color: 'var(--green)' }}>diyet yapanlar için de</strong> tasarlandı.
          Hesap aç, verilerini kaydet — her cihazdan erişebilirsin.
        </p>

        {/* Spor / Diyet badge'leri */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, background: 'rgba(232,255,71,.1)', border: '1px solid rgba(232,255,71,.25)', borderRadius: 20, padding: '4px 12px', color: 'var(--accent)' }}>🏋️ Spor Takibi</span>
          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, background: 'rgba(71,255,138,.1)', border: '1px solid rgba(71,255,138,.25)', borderRadius: 20, padding: '4px 12px', color: 'var(--green)' }}>🥗 Diyet Takibi</span>
          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, background: 'rgba(71,200,255,.1)', border: '1px solid rgba(71,200,255,.25)', borderRadius: 20, padding: '4px 12px', color: 'var(--blue)' }}>🤖 AI Koç</span>
        </div>
      </div>

      {/* SPOR bölümü */}
      <div className="section-title" style={{ color: 'var(--accent)' }}>🏋️ SPOR ÖZELLİKLERİ</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {sections.filter(s => ['BUGÜN','ŞABLONLAR','GEÇMİŞ','HAFTALIK ÖZET','İLERLEME'].includes(s.title)).map((s, i) => (
          <div key={i} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'rgba(232,255,71,.08)', border: '1px solid rgba(232,255,71,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 2, color: 'var(--accent)', marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* DİYET bölümü */}
      <div className="section-title" style={{ color: 'var(--green)' }}>🥗 DİYET ÖZELLİKLERİ</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {sections.filter(s => ['KALORİ TAKİBİ','MAKRO HEDEFLER','AI KOÇU'].includes(s.title)).map((s, i) => (
          <div key={i} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'rgba(71,255,138,.08)', border: '1px solid rgba(71,255,138,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 2, color: 'var(--green)', marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* GENEL bölümü */}
      <div className="section-title">⚙️ GENEL</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {sections.filter(s => ['AYARLAR'].includes(s.title)).map((s, i) => (
          <div key={i} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 2, color: 'var(--text)', marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Kim yaptı */}
      <div className="section-title">GELİŞTİRİCİ</div>
      <div className="card" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            🧑‍💻
          </div>
          <div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 2, marginBottom: 2 }}>Kerem Teke</div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>KeroGym'in yaratıcısı</div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Mono,monospace', lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          KeroGym kişisel bir proje olarak geliştirildi. Hem spor hem diyet takibini daha kolay hale getirmek için tasarlandı. Ücretsiz, reklamsız ve tamamen tarayıcı tabanlı çalışır.
        </p>
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', marginTop: 24, paddingBottom: 8, fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--border)', letterSpacing: 2 }}>
        KEROGYM v1.0 BETA · 2025
      </div>

    </div>
  )
}
