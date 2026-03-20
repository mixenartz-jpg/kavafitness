import { useApp } from '../../context/AppContext'
import Icon from '../Icons'

const QUICK_CARDS = [
  { id:'today',    icon:'dumbbell', label:'Antrenman',     desc:'Bugünkü egzersizleri kaydet' },
  { id:'calorie',  icon:'apple',    label:'Kalori Takibi', desc:'Yemek ve makro takibi'        },
  { id:'aicoach',  icon:'robot',    label:'AI Koçu',       desc:'Beslenme & antrenman analizi' },
  { id:'progress', icon:'chart',    label:'İlerleme',      desc:'Grafikler & haftalık özet'    },
  { id:'history',  icon:'calendar', label:'Geçmiş',        desc:'Tüm antrenman geçmişin'       },
  { id:'settings', icon:'settings', label:'Ayarlar',       desc:'Profil, hedefler, ölçüler'    },
]

const GOAL_LABELS = { lose:'Kilo Ver', gain:'Kilo Al', cut:'Yağ Yak', maintain:'Koru' }

export default function HomePage() {
  const { setActiveTab, streak, profile, exercises, foods } = useApp()

  const todayKcal = Math.round(foods.reduce((s, f) => s + (+f.kcal || 0), 0))
  const todaySets = exercises.reduce((s, e) => s + e.sets.length, 0)

  return (
    <div className="page animate-fade" style={{ maxWidth: 700 }}>

      {/* HERO */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '28px 24px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', right:-10, top:-10, fontFamily:'Bebas Neue,sans-serif', fontSize:110, color:'rgba(255,255,255,.02)', letterSpacing:4, userSelect:'none', pointerEvents:'none', lineHeight:1 }}>FIT</div>

        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <img src="/logo.png" alt="KavaFit" style={{ height:48, width:'auto', filter:'brightness(0) invert(1)' }} />
          <div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:34, letterSpacing:5, color:'var(--accent)', lineHeight:1 }}>
              KAVA<span style={{ color:'var(--text-muted)' }}>FIT</span>
            </div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, letterSpacing:3, color:'var(--text-muted)', marginTop:3 }}>
              SPOR & BESLENME TAKİP
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
          {streak > 0 && (
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, background:'rgba(245,158,11,.1)', border:'1px solid rgba(245,158,11,.25)', borderRadius:20, padding:'4px 11px', color:'var(--yellow)' }}>
              🔥 {streak} günlük seri
            </span>
          )}
          {todaySets > 0 && (
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)', borderRadius:20, padding:'4px 11px', color:'var(--accent)' }}>
              {todaySets} set
            </span>
          )}
          {todayKcal > 0 && (
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', borderRadius:20, padding:'4px 11px', color:'var(--green)' }}>
              {todayKcal} kcal
            </span>
          )}
          {profile?.goal && (
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, background:'rgba(59,130,246,.08)', border:'1px solid rgba(59,130,246,.2)', borderRadius:20, padding:'4px 11px', color:'var(--blue)' }}>
              {GOAL_LABELS[profile.goal] || profile.goal}
            </span>
          )}
        </div>

        <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.8, fontFamily:"'Space Grotesk',sans-serif", maxWidth:460, margin:0 }}>
          Antrenmanlarını, kalorilerini ve vücut ölçülerini tek yerde takip et.
          {!profile && <strong style={{ color:'var(--accent)' }}> Başlamak için Ayarlar → Profil'i doldur.</strong>}
        </p>
      </div>

      {/* HIZLI ERİŞİM */}
      <div className="section-title">HIZLI ERİŞİM</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 }}>
        {QUICK_CARDS.map(card => (
          <div
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            style={{
              padding:'16px 10px', borderRadius:14, cursor:'pointer',
              background:'var(--surface)', border:'1px solid var(--border)',
              transition:'all .18s cubic-bezier(.4,0,.2,1)', userSelect:'none',
              textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:8,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.transform='translateY(0)' }}
          >
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--surface2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name={card.icon} size={20} color="var(--text-dim)" strokeWidth={1.6}/>
            </div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:12, color:'var(--text)', letterSpacing:.2 }}>
              {card.label}
            </div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', lineHeight:1.5 }}>
              {card.desc}
            </div>
          </div>
        ))}
      </div>

      {/* GELİŞTİRİCİ */}
      <div className="section-title">GELİŞTİRİCİ</div>
      <div className="card" style={{ padding:'18px 20px', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
            🧑‍💻
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:17, letterSpacing:2, marginBottom:2 }}>Kerem Teke</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>KavaFit'in yaratıcısı</div>
          </div>
          <a href="https://instagram.com/slmbnmixo" target="_blank" rel="noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:20, background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color:'#fff', fontSize:10, fontWeight:600, textDecoration:'none', fontFamily:'Space Mono,monospace', flexShrink:0 }}>
            <svg width="11" height="11" fill="#fff" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            @slmbnmixo
          </a>
        </div>
        <p style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'Space Mono,monospace', lineHeight:1.8, borderTop:'1px solid var(--border)', paddingTop:12, margin:0 }}>
          Ücretsiz, reklamsız ve tamamen tarayıcı tabanlı. Geri bildirim için Instagram'dan ulaş.
        </p>
      </div>

      <div style={{ textAlign:'center', paddingBottom:8, fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--border)', letterSpacing:2 }}>
        KAVAFIT v1.0 · 2025
      </div>

    </div>
  )
}
