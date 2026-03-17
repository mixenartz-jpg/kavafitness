import { useState } from 'react'

// ── Rehber İçeriği ──
const GUIDE_SECTIONS = [
  {
    id: 'start',
    icon: '🚀',
    title: 'İlk Kez Kullanıyorum — Nereden Başlamalıyım?',
    color: '#e8ff47',
    steps: [
      {
        num: '1',
        title: 'Profilini Doldur',
        desc: 'Sol üstteki ☰ menüden → AYARLAR → Profil sekmesine git. Yaş, boy, kilo, cinsiyet ve hedefini (kilo ver / al / koru) gir. Bu bilgiler günlük kalori ihtiyacını otomatik hesaplar.',
      },
      {
        num: '2',
        title: 'Antrenman Günlerini Seç',
        desc: 'Ayarlar → Profil altında haftanın hangi günleri antrenman yapacağını işaretle. Bu bilgi AI koçunun sana özel program hazırlamasını sağlar.',
      },
      {
        num: '3',
        title: 'Hedeflerini Kontrol Et',
        desc: 'Ayarlar → Hedefler sekmesinde günlük kalori, protein, yağ ve karbonhidrat hedeflerin otomatik doldurulmuş olacak. İstersen manuel olarak değiştirebilirsin.',
      },
      {
        num: '4',
        title: 'İlk Antrenmanını Gir',
        desc: 'Menüden BUGÜN sayfasına git → "Egzersiz Ekle" butonuna bas → egzersiz adını yaz → set ekle (tekrar sayısı + ağırlık). Bitti!',
      },
    ]
  },
  {
    id: 'workout',
    icon: '🏋️',
    title: 'Antrenman Takibi — Nasıl Kullanılır?',
    color: '#e8ff47',
    steps: [
      {
        num: '💡',
        title: 'BUGÜN Sayfası',
        desc: 'Her gün bu sayfadan antrenmanını kaydet. Egzersiz ekle → her set için tekrar ve ağırlık gir. Set eklediğinde otomatik dinlenme sayacı başlar (60/90/120/180sn seçebilirsin).',
      },
      {
        num: '🤖',
        title: 'Akıllı Öneri Butonu',
        desc: 'Her egzersizin yanındaki "🤖 Öneri" butonuna basınca AI geçmiş verilerine bakarak "Geçen hafta 80kg yaptın, bu hafta 82.5kg dene" gibi somut öneride bulunur. "↓ Uygula" ile değerleri otomatik doldurabilirsin.',
      },
      {
        num: '📋',
        title: 'Şablon Kullan',
        desc: '"Şablon Uygula" butonuyla önceden oluşturduğun programı tek tıkla uygula. Şablonlar → Yeni Şablon ile kendi programlarını oluştur ya da hazır şablonlardan (Göğüs Günü, Bacak Günü vb.) birini ekle.',
      },
      {
        num: '📷',
        title: 'Egzersiz Tanıma',
        desc: '"Egzersiz Tanı" butonuyla hareket yaptığın bir fotoğraf yükle — AI egzersizi tanır ve nasıl yapıldığına dair YouTube videosu gösterir. Tanınan egzersizi doğrudan antrenmanına ekleyebilirsin.',
      },
      {
        num: '📅',
        title: 'Geçmiş Günlere Bak',
        desc: 'Üstteki takvim şeridinden geçmiş bir güne tıkla — o günün antrenman ve yemek özeti görünür. GEÇMİŞ sayfasında da tüm antrenmanları egzersiz adıyla arayabilirsin.',
      },
    ]
  },
  {
    id: 'diet',
    icon: '🍎',
    title: 'Kalori & Diyet Takibi — Nasıl Kullanılır?',
    color: '#47ff8a',
    steps: [
      {
        num: '🗄️',
        title: 'Veritabanından Ekle',
        desc: 'KALORİ TAKİBİ → Veritabanı sekmesinde Türk yemeklerini ara (Tavuk Göğsü, Bulgur Pilavı, Mercimek Çorbası...). Seçtikten sonra gram miktarını ayarla, besin değerleri otomatik hesaplanır.',
      },
      {
        num: '📷',
        title: 'Fotoğraftan Kalori Hesapla',
        desc: 'Fotoğraf sekmesinde yemeğin fotoğrafını yükle — AI içeriği tanır ve kalori/makro değerlerini tahmin eder. "Listeye Ekle" ile kaydedilir.',
      },
      {
        num: '🏷️',
        title: 'Etiket Oku',
        desc: 'Ürün ambalajı veya besin değerleri tablosunun fotoğrafını yükle — AI etiketi okur ve değerleri otomatik doldurur. Gram miktarını ayarlayıp ekleyebilirsin.',
      },
      {
        num: '🎯',
        title: 'Makro Hedeflerin',
        desc: 'MAKRO HEDEFLER sayfasında günlük kalori, protein, yağ ve karbonhidrat takibini çubuk grafiklerle gör. Hedefine ne kadar yaklaştığını renk kodlarıyla anlarsın: sarı = %75+, kırmızı = aşıldı.',
      },
      {
        num: '💧',
        title: 'Su Takibi',
        desc: 'Makro Hedefler sayfasının altında su takibi var. +150ml, +200ml, +300ml, +500ml butonlarıyla günlük su alımını kaydet. Hedef: 2500ml/gün.',
      },
    ]
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'AI Özellikleri — Tam Kullanım Rehberi',
    color: '#47c8ff',
    steps: [
      {
        num: '💬',
        title: 'AI Koçu — Beslenme Sohbeti',
        desc: 'AI KOÇU → Sohbet sekmesinde beslenme asistanınla konuş. "3 günlük kilo verme planı", "yüksek proteinli öğün önerisi" gibi soruları cevaplar. Hızlı sorular butonlarını da kullanabilirsin.',
      },
      {
        num: '📋',
        title: 'AI Antrenman Planlayıcı',
        desc: 'AI KOÇU → Antrenman Planı sekmesinde haftada kaç gün antrenman yapacağını ve varsa özel odağını belirt. AI profiline bakarak set/tekrar/ağırlık detaylı haftalık program oluşturur. "Şablona Kaydet" ile direkt şablonlarına eklenebilir.',
      },
      {
        num: '🥗',
        title: 'Diyet Analizi',
        desc: 'AI KOÇU → Diyet Analizi sekmesinde "Bugünkü Diyetimi Analiz Et" butonuna bas. AI o gün yediğin yemekleri değerlendirir: olumlu noktalar, eksikler, yarın ne yemeli önerisi verir.',
      },
      {
        num: '🔥',
        title: 'Kalori Hesaplama',
        desc: 'AI KOÇU → Kalori Hesap sekmesinde aktivite (yürüyüş, koşu, gym, yüzme vb.) ve süre girerek yaktığın kaloriyi hesapla. AI sonuca göre besin önerisi de sunar.',
      },
      {
        num: '⭐',
        title: 'Kişisel Koçun (Özel)',
        desc: 'Menüde KİŞİSEL KOÇUN bölümünde özel erişimli AI koçun var. Tüm verilerini (antrenman geçmişi, kalori, streak, vücut ölçüleri) bilen, Türkçe konuşan kişisel asistan. 🎤 butonuyla sesli soru sorabilirsin.',
      },
    ]
  },
  {
    id: 'progress',
    icon: '📊',
    title: 'İlerleme & Analiz — Ne Nerede?',
    color: '#47c8ff',
    steps: [
      {
        num: '📈',
        title: 'Haftalık Özet',
        desc: 'HAFTALIK ÖZET sayfasında bu haftanın antrenman günü, set, max ağırlık ve kalori istatistiklerini gör. Geçen haftayla otomatik karşılaştırır. "AI Haftalık Rapor Oluştur" butonuyla detaylı analiz alabilirsin.',
      },
      {
        num: '📊',
        title: 'İlerleme Grafikleri',
        desc: 'İLERLEME → Grafikler sekmesinde egzersiz bazında ağırlık/tekrar grafiği ve günlük kalori geçmişi görürsün. Egzersiz seç → tüm zamanlarını çizgi grafikte izle.',
      },
      {
        num: '🎯',
        title: 'Nasıl Gidiyorum?',
        desc: 'İLERLEME → Nasıl Gidiyorum? sekmesinde genel ilerleme skoru (0-100), hedef tamamlanma yüzdesi ve tahmini hedefe ulaşma süresi gösterilir. "AI Derin Analiz Yap" ile kapsamlı değerlendirme alabilirsin.',
      },
      {
        num: '🔥',
        title: 'Streak Sistemi',
        desc: 'Üst üste antrenman yaptığın günler streak oluşturur. BUGÜN sayfasının üstünde streak rozeti görünür: 🌱 başlangıç, ⚡ 7 gün, 🔥 14 gün, 🏆 30 gün. Milestone günlerde telefona bildirim gelir.',
      },
    ]
  },
  {
    id: 'body',
    icon: '⚖️',
    title: 'Vücut Ölçüleri & Kilo Takibi',
    color: '#47c8ff',
    steps: [
      {
        num: '📝',
        title: 'Ölçüm Nasıl Girilir?',
        desc: 'AYARLAR → Ölçüler sekmesine git. Tarih seç, kilo, bel, göğüs, kalça ve boyun değerlerini gir → "Ölçüm Ekle". Tüm ölçümler tabloda delta (fark) göstergesiyle listelenir.',
      },
      {
        num: '📅',
        title: 'Ne Sıklıkla Girilmeli?',
        desc: 'Haftada 1 kez, sabah aç karnına ölçüm ideal. Günlük varyasyonlar yanıltıcı olabilir. Haftalık Özet sayfasında son ölçümün otomatik görünür.',
      },
    ]
  },
  {
    id: 'tips',
    icon: '💡',
    title: 'İpuçları & Sık Sorulan Sorular',
    color: '#ff8c47',
    steps: [
      {
        num: '❓',
        title: 'Verilerim kaybolur mu?',
        desc: 'Hayır. Tüm veriler hem cihazında (localStorage) hem de bulutta (Firebase) saklanır. Farklı bir cihazdan giriş yapınca veriler otomatik senkronize olur.',
      },
      {
        num: '❓',
        title: 'Takvimden geçmiş güne tıklayınca ne olur?',
        desc: 'O günün antrenman ve yemek özeti salt-okunur olarak gösterilir. Düzenleme yapılamaz, sadece görüntülenir.',
      },
      {
        num: '❓',
        title: 'Antrenman şablonu nasıl oluşturulur?',
        desc: 'ŞABLONLAR sayfasında "Yeni Şablon" butonuna bas → isim ver → egzersiz adlarını gir. Sonra BUGÜN sayfasında "Şablon Uygula" ile anında kullanabilirsin. AI Koçu da plan oluşturduğunda şablona kaydedebilirsin.',
      },
      {
        num: '❓',
        title: 'Tema nasıl değiştirilir?',
        desc: 'Sol üstteki ☰ menüyü aç → sağ üstteki ☀️/🌙 butonuna tıkla. Açık ve koyu tema arasında geçiş yapabilirsin.',
      },
      {
        num: '❓',
        title: 'Uygulamayı telefona nasıl eklerim?',
        desc: 'Menüden "UYGULAMAYI İNDİR" sayfasına git. Android için Chrome, iPhone için Safari gerekli. "Ana Ekrana Ekle" seçeneğiyle ikon olarak telefona kurulur — uygulama gibi çalışır.',
      },
      {
        num: '📤',
        title: 'Antrenmanımı nasıl paylaşırım?',
        desc: 'Menüden PAYLAŞ sayfasına git. "Haftalık" veya "Bugün" modunu seç → "Kart Oluştur" butonuna bas → PNG kart oluşturulur. Telefonda "Paylaş" butonuyla Instagram, WhatsApp vb. paylaşabilirsin.',
      },
    ]
  },
]

// ── Accordion Bileşeni ──
function GuideSection({ section, isOpen, onToggle }) {
  return (
    <div className="card" style={{ overflow:'hidden', marginBottom:10 }}>
      {/* Başlık — tıklanabilir */}
      <div
        onClick={onToggle}
        style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 18px', cursor:'pointer', userSelect:'none',
          borderBottom: isOpen ? '1px solid var(--border)' : '1px solid transparent',
          transition:'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
        onMouseLeave={e => e.currentTarget.style.background = ''}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:36, height:36, borderRadius:10, flexShrink:0,
            background:`${section.color}12`,
            border:`1px solid ${section.color}30`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
          }}>
            {section.icon}
          </div>
          <div style={{
            fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:2,
            color: isOpen ? section.color : 'var(--text)',
            transition:'color .15s',
          }}>
            {section.title}
          </div>
        </div>
        <span style={{
          color:'var(--text-muted)', fontSize:16,
          transition:'transform .25s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          display:'block',
        }}>⌄</span>
      </div>

      {/* İçerik */}
      {isOpen && (
        <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:14 }} className="animate-fade">
          {section.steps.map((step, i) => (
            <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
              {/* Numara / emoji */}
              <div style={{
                width:32, height:32, borderRadius:8, flexShrink:0,
                background:`${section.color}10`,
                border:`1px solid ${section.color}25`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'Bebas Neue,sans-serif', fontSize:14,
                color: section.color,
              }}>
                {step.num}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:1.5, color:'var(--text)', marginBottom:5 }}>
                  {step.title}
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.75 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [openSection, setOpenSection] = useState(null)
  const [allOpen, setAllOpen]         = useState(false)

  const toggleSection = (id) => {
    setOpenSection(prev => prev === id ? null : id)
  }

  const toggleAll = () => {
    if (allOpen) {
      setOpenSection(null)
      setAllOpen(false)
    } else {
      setAllOpen(true)
    }
  }

  const isOpen = (id) => allOpen || openSection === id

  return (
    <div className="page animate-fade" style={{ maxWidth:700 }}>

      {/* ── ÖNEMLİ NOT (KALSIN) ── */}
      <div style={{
        background:'linear-gradient(135deg,rgba(255,71,71,.08) 0%,rgba(255,140,71,.05) 100%)',
        border:'1px solid rgba(255,71,71,.25)',
        borderRadius:16, padding:'20px 22px', marginBottom:24,
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:-8, top:-8, fontFamily:'Bebas Neue,sans-serif', fontSize:80, color:'rgba(255,71,71,.05)', letterSpacing:2, userSelect:'none', pointerEvents:'none', lineHeight:1 }}>BETA</div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background:'rgba(255,71,71,.12)', border:'1px solid rgba(255,71,71,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>📢</div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:3, color:'var(--red)' }}>ÖNEMLİ NOT</div>
        </div>
        <p style={{ fontSize:13, lineHeight:1.85, fontFamily:'DM Sans,sans-serif', color:'var(--text-dim)', marginBottom:12 }}>
          KeroGym şu an <strong style={{ color:'var(--red)' }}>prototip aşamasındadır</strong> — bazı özellikler eksik veya hatalı olabilir.
          Uygulama yalnızca sporcular için değil, <strong style={{ color:'var(--accent)' }}>diyet yapanlar için de</strong> tasarlanmıştır;
          kalori takibi, makro hedefleri ve AI koç özellikleriyle beslenme sürecinizi de kolayca yönetebilirsiniz.
        </p>
        <p style={{ fontSize:13, lineHeight:1.85, fontFamily:'DM Sans,sans-serif', color:'var(--text-dim)', marginBottom:12 }}>
          Geri bildirimleriniz uygulamanın gelişimi için son derece değerlidir.
          Karşılaştığınız hatalar, eksik gördüğünüz özellikler veya önerileriniz için lütfen Instagram üzerinden ulaşın.
        </p>
        <p style={{ fontSize:12, lineHeight:1.7, fontFamily:'DM Mono,monospace', color:'var(--text-muted)' }}>
          🚀 Yakında <strong style={{ color:'var(--accent)' }}>tam sürüm uygulama</strong> olarak yayınlanacaktır. Şimdiden teşekkürler!
        </p>
        <div style={{ marginTop:14 }}>
          <a href="https://instagram.com/slmbnmixo" target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:8, background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color:'#fff', fontSize:11, fontWeight:600, textDecoration:'none', fontFamily:'DM Mono,monospace' }}>
            <svg width="12" height="12" fill="#fff" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            Geri Bildirim — @slmbnmixo
          </a>
        </div>
      </div>

      {/* ── HERO (KALSIN) ── */}
      <div style={{ background:'linear-gradient(135deg,rgba(232,255,71,.07) 0%,rgba(232,255,71,.02) 100%)', border:'1px solid rgba(232,255,71,.15)', borderRadius:20, padding:'32px 28px', marginBottom:28, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-10, top:-10, fontFamily:'Bebas Neue,sans-serif', fontSize:120, color:'rgba(232,255,71,.04)', letterSpacing:4, userSelect:'none', pointerEvents:'none', lineHeight:1 }}>GYM</div>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <img src="/logo.png" alt="KeroGym" style={{ height:52, width:'auto' }} />
          <div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:36, letterSpacing:5, color:'var(--accent)', lineHeight:1 }}>
              KERO<span style={{ color:'var(--text-muted)' }}>GYM</span>
            </div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, letterSpacing:3, color:'var(--text-muted)', marginTop:3 }}>
              SPOR & BESLENME TAKİP
            </div>
          </div>
        </div>
        <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.8, fontFamily:'DM Sans,sans-serif', maxWidth:480 }}>
          KeroGym; antrenmanlarını, kalorilerini ve vücut ölçülerini tek bir yerde takip etmeni sağlar.
          Spor yapanlar kadar <strong style={{ color:'var(--green)' }}>diyet yapanlar için de</strong> tasarlandı.
          Hesap aç, verilerini kaydet — her cihazdan erişebilirsin.
        </p>
        <div style={{ display:'flex', gap:8, marginTop:16, flexWrap:'wrap' }}>
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, background:'rgba(232,255,71,.1)', border:'1px solid rgba(232,255,71,.25)', borderRadius:20, padding:'4px 12px', color:'var(--accent)' }}>🏋️ Spor Takibi</span>
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, background:'rgba(71,255,138,.1)', border:'1px solid rgba(71,255,138,.25)', borderRadius:20, padding:'4px 12px', color:'var(--green)' }}>🥗 Diyet Takibi</span>
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, background:'rgba(71,200,255,.1)', border:'1px solid rgba(71,200,255,.25)', borderRadius:20, padding:'4px 12px', color:'var(--blue)' }}>🤖 AI Koç</span>
        </div>
      </div>

      {/* ── REHBER BAŞLIĞI ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div className="section-title" style={{ margin:0, flex:1 }}>📖 KULLANIM REHBERİ</div>
        <button
          onClick={toggleAll}
          style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'5px 14px', cursor:'pointer', fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)', transition:'all .15s', marginLeft:12, flexShrink:0 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)' }}
        >
          {allOpen ? 'Tümünü Kapat' : 'Tümünü Aç'}
        </button>
      </div>

      <div style={{ marginBottom:28 }}>
        {GUIDE_SECTIONS.map(section => (
          <GuideSection
            key={section.id}
            section={section}
            isOpen={isOpen(section.id)}
            onToggle={() => { setAllOpen(false); toggleSection(section.id) }}
          />
        ))}
      </div>

      {/* ── GELİŞTİRİCİ (KALSIN) ── */}
      <div className="section-title">GELİŞTİRİCİ</div>
      <div className="card" style={{ padding:'20px 22px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
            🧑‍💻
          </div>
          <div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, marginBottom:2 }}>Kerem Teke</div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)', letterSpacing:1 }}>KeroGym'in yaratıcısı</div>
          </div>
        </div>
        <p style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', lineHeight:1.7, borderTop:'1px solid var(--border)', paddingTop:14 }}>
          KeroGym kişisel bir proje olarak geliştirildi. Hem spor hem diyet takibini daha kolay hale getirmek için tasarlandı. Ücretsiz, reklamsız ve tamamen tarayıcı tabanlı çalışır.
        </p>
      </div>

      {/* Version */}
      <div style={{ textAlign:'center', marginTop:24, paddingBottom:8, fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--border)', letterSpacing:2 }}>
        KEROGYM v1.0 BETA · 2025
      </div>

    </div>
  )
}
