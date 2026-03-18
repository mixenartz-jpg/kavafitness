import { useEffect } from 'react'
import { useApp } from '../context/AppContext'


const DAYS = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt']

const QUOTES = [
  'Bugün acı çek, yarın şampiyon ol.',
  'Vazgeçmek her zaman bir seçenektir — ama sen öyle biri değilsin.',
  'Vücudun yapabilir. Zihnini ikna et.',
  'Küçük adımlar büyük sonuçlar doğurur.',
  'Dün kendinden daha iyi ol, başka rakip yok.',
  'Ter, zayıflığın vücudu terk etmesidir.',
  'Konfor alanın dışında büyürsün.',
  'Her tekrar seni biraz daha güçlü yapar.',
  'Motivasyon seni başlatır, disiplin seni devam ettirir.',
  'Bugün ağır kaldır, yarın daha hafif hisset.',
  'Başarı, her gün tekrarlanan küçük çabaların toplamıdır.',
  'En zor set, yapmaya karar verdiğin settir.',
  'Sınırlarını zorlayan kişi, sınırlarını genişletir.',
  'Bugün yaptıkların, yarınki bedeni şekillendirir.',
  'Ağrı geçici, gurur kalıcıdır.',
  'Güçlü olmak bir seçimdir — her gün yeniden seç.',
  'Hedefin seni korkutuyorsa doğru hedef seçmişsin.',
  'Bedenin en büyük yatırımındır.',
  'İlerleme mükemmelliği geçer.',
  'Her sabah yeni bir şans, kaçırma.',
  'Sen düşündüğünden çok daha güçlüsün.',
  'Yarım saat spor, günün en iyi yatırımı.',
  'Hedefine ulaşana kadar dur, hedefe ulaştıktan sonra devam et.',
  'Başarının formülü: Devamlılık + Sabır + Emek.',
  'Güçlü ol, çünkü hayat kolaylaşmaz — sen güçlenirsin.',
  'Bugün kendini zorla, yarın kendine teşekkür et.',
  'Spor bir alışkanlık, alışkanlıklar kaderini belirler.',
]

const getDailyQuote = () => {
  const d = new Date()
  const day = d.getDate() + d.getMonth() * 31 + d.getFullYear()
  return QUOTES[day % QUOTES.length]
}


export default function Header() {
  const { user, exercises, exArchive, viewingDate, setViewingDate, setActiveTab, todayKey } = useApp()

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    // ✅ FIX: toISOString() yerine manuel format — timezone kayması önlendi
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const today = todayKey()
    const isToday = key === today
    const hasData = isToday ? exercises.length > 0 : (exArchive[key]?.length > 0)
    const isActive = key === viewingDate
    return { d, key, isToday, hasData, isActive }
  })

  return (
    <>
      {/* ── TOP BAR ── */}
      <header style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(10,10,10,.94)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid var(--border)',
        padding:'0 14px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        height:56, gap:8, overflow:'hidden',
      }}>
        {/* Logo */}
        <div onClick={() => setActiveTab('home')}
          style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
          <img src="/logo-sm.png" alt="KeroGym" style={{ height:30, width:'auto' }} />
          <div style={{
            fontFamily:'Bebas Neue,sans-serif', fontSize:22, letterSpacing:3,
            color:'var(--accent)', textShadow:'0 0 20px rgba(232,255,71,.3)', whiteSpace:'nowrap',
          }}>
            KERO<span style={{ color:'var(--text-muted)' }}>GYM</span>
          </div>
        </div>

        {/* Right: Geri Bildirim */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <a href="https://instagram.com/slmbnmixo" target="_blank" rel="noreferrer"
            style={{
              display:'flex', alignItems:'center', gap:5, padding:'5px 10px',
              borderRadius:20, background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
              color:'#fff', fontSize:11, fontWeight:600, textDecoration:'none', whiteSpace:'nowrap',
            }}>
            <svg width="13" height="13" fill="#fff" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="hide-mobile">Geri Bildirim</span>
          </a>
        </div>
      </header>

      {/* ── WEEK STRIP ── */}
      <div style={{
        background:'rgba(10,10,10,.94)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid var(--border)',
        display:'flex', alignItems:'center',
        overflowX:'auto', padding:'6px 10px', gap:4,
        position:'sticky', top:56, zIndex:99,
        scrollbarWidth:'none',
      }}
        className="week-strip-row"
      >
        {weekDays.map(({ d, key, isToday, hasData, isActive }) => (
          <div key={key} onClick={() => setViewingDate(key)}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:2,
              padding:'5px 8px', borderRadius:10, cursor:'pointer',
              minWidth:40, flexShrink:0,
              border:`1px solid ${isActive?'var(--accent)':'transparent'}`,
              background: isActive ? 'var(--accent)' : 'transparent',
              transition:'all .18s', userSelect:'none',
            }}>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:8, letterSpacing:1, textTransform:'uppercase',
              color: isActive ? '#0a0a0a' : isToday ? 'var(--accent)' : 'var(--text-muted)' }}>
              {DAYS[d.getDay()]}
            </span>
            <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, lineHeight:1,
              color: isActive ? '#0a0a0a' : isToday ? 'var(--accent)' : 'var(--text)' }}>
              {d.getDate()}
            </span>
            {hasData && !isActive && (
              <span style={{ width:4, height:4, borderRadius:'50%', background:'var(--accent)' }} />
            )}
          </div>
        ))}
      </div>

      {/* ── QUOTE BAR ── */}
      <div style={{
        background: 'rgba(10,10,10,.94)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '7px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
        position: 'sticky', top: 108, zIndex: 98,
      }}>
        <span style={{ fontSize: 12, flexShrink: 0 }}>💪</span>
        <div style={{
          fontFamily: 'Space Mono,monospace', fontSize: 10,
          color: 'var(--text-muted)', letterSpacing: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontStyle: 'italic',
        }}>
          {getDailyQuote()}
        </div>
      </div>


    </>
  )
}
