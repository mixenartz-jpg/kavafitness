import { useApp, BADGE_DEFINITIONS, PERSONA_UNLOCKS, XP_LEVELS, getXpLevel } from '../../context/AppContext'

function XpBar({ xpData }) {
  return (
    <div style={{
      background:'linear-gradient(135deg,rgba(232,255,71,.08),rgba(232,255,71,.03))',
      border:'1px solid rgba(232,255,71,.2)', borderRadius:16,
      padding:'22px 24px', marginBottom:24,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
        <div style={{ fontSize:42, lineHeight:1 }}>{xpData.icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, letterSpacing:3, color:'var(--accent)', lineHeight:1 }}>
            {xpData.title}
          </div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)', marginTop:3 }}>
            SEVİYE {xpData.level}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:36, color:'var(--accent)', lineHeight:1 }}>
            {xpData.xp.toLocaleString()}
          </div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)' }}>TOPLAM XP</div>
        </div>
      </div>

      {/* Progress bar */}
      {xpData.next && (
        <>
          <div style={{ background:'var(--surface3)', borderRadius:20, height:8, overflow:'hidden', marginBottom:8 }}>
            <div style={{
              height:'100%', borderRadius:20,
              width:`${xpData.progress}%`,
              background:'linear-gradient(90deg,var(--accent),rgba(232,255,71,.6))',
              transition:'width .8s ease',
            }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)' }}>
            <span>{xpData.xp.toLocaleString()} XP</span>
            <span>{xpData.next.icon} {xpData.next.title} → {xpData.next.minXP.toLocaleString()} XP</span>
          </div>
        </>
      )}
      {!xpData.next && (
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--accent)', textAlign:'center' }}>
          🌟 Maksimum seviyeye ulaştın!
        </div>
      )}
    </div>
  )
}

function BadgeCard({ badge, earned }) {
  return (
    <div style={{
      padding:'16px 14px', borderRadius:12, textAlign:'center',
      background: earned ? 'rgba(232,255,71,.06)' : 'var(--surface)',
      border: `1px solid ${earned ? 'rgba(232,255,71,.25)' : 'var(--border)'}`,
      transition:'all .2s', position:'relative',
      opacity: earned ? 1 : 0.45,
    }}>
      {earned && (
        <div style={{
          position:'absolute', top:6, right:6,
          width:14, height:14, borderRadius:'50%',
          background:'var(--accent)', display:'flex',
          alignItems:'center', justifyContent:'center',
          fontSize:8, color:'#0a0a0a', fontWeight:700,
        }}>✓</div>
      )}
      <div style={{ fontSize:30, marginBottom:8, filter: earned ? 'none' : 'grayscale(1)' }}>{badge.icon}</div>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:12, letterSpacing:1.5, color: earned ? 'var(--accent)' : 'var(--text-muted)', marginBottom:4 }}>
        {badge.name}
      </div>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', lineHeight:1.4 }}>
        {badge.desc}
      </div>
    </div>
  )
}

export default function AchievementsPage() {
  const { totalXP, earnedBadges, streak, exercises, exArchive } = useApp()
  const xpData = getXpLevel(totalXP)

  // Tüm zaman max ağırlık
  let allTimeMaxWeight = 0
  Object.values(exArchive || {}).forEach(day =>
    day.forEach(ex => ex.sets.forEach(s => { if (+s.weight > allTimeMaxWeight) allTimeMaxWeight = +s.weight }))
  )
  exercises.forEach(ex => ex.sets.forEach(s => { if (+s.weight > allTimeMaxWeight) allTimeMaxWeight = +s.weight }))

  const totalWorkouts = Object.values(exArchive || {}).filter(d => d.length > 0).length + (exercises.length > 0 ? 1 : 0)
  const earnedCount   = earnedBadges.length

  // Rozetleri kazanılan / kazanılmayan olarak ayır
  const earnedList   = BADGE_DEFINITIONS.filter(b => earnedBadges.includes(b.id))
  const unearnedList = BADGE_DEFINITIONS.filter(b => !earnedBadges.includes(b.id))

  // Unlock durumu
  const isUnlocked = (personaId) => {
    const req = PERSONA_UNLOCKS[personaId]
    return req ? totalXP >= req.xpRequired : true
  }

  return (
    <div className="page animate-fade" style={{ maxWidth:700 }}>

      {/* Başlık */}
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, letterSpacing:3, color:'var(--accent)', marginBottom:6 }}>
        BAŞARILAR
      </div>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)', marginBottom:24 }}>
        XP kazan · rozet topla · koç kilitle
      </div>

      {/* XP Bar */}
      <XpBar xpData={xpData} />

      {/* Hızlı istatistikler */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 }}>
        {[
          { label:'Toplam XP',        val: totalXP.toLocaleString(), icon:'⚡', color:'var(--accent)' },
          { label:'Kazanılan Rozet',  val: `${earnedCount}/${BADGE_DEFINITIONS.length}`, icon:'🏅', color:'#ff8c47' },
          { label:'Antrenman',        val: totalWorkouts, icon:'🏋️', color:'var(--blue)' },
        ].map(({ label, val, icon, color }) => (
          <div key={label} className="card" style={{ padding:'14px 16px', textAlign:'center' }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:24, color, lineHeight:1, marginBottom:4 }}>{val}</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Koç Kilitleri */}
      <div className="section-title">AI KOÇ MODLARI</div>
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
        {/* Dengeli her zaman açık */}
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:12, background:'rgba(232,255,71,.06)', border:'1px solid rgba(232,255,71,.2)' }}>
          <span style={{ fontSize:26 }}>🤖</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:2, color:'var(--accent)' }}>Dengeli Koç</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)' }}>Her zaman açık</div>
          </div>
          <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--green)' }}>✓ Açık</span>
        </div>

        {Object.entries(PERSONA_UNLOCKS).map(([id, info]) => {
          const unlocked = isUnlocked(id)
          const pct = Math.min(100, Math.round((totalXP / info.xpRequired) * 100))
          return (
            <div key={id} style={{
              padding:'14px 16px', borderRadius:12,
              background: unlocked ? 'rgba(71,200,255,.06)' : 'var(--surface)',
              border: `1px solid ${unlocked ? 'rgba(71,200,255,.25)' : 'var(--border)'}`,
              opacity: unlocked ? 1 : 0.7,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom: unlocked ? 0 : 10 }}>
                <span style={{ fontSize:26, filter: unlocked ? 'none' : 'grayscale(.8)' }}>{info.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:2, color: unlocked ? 'var(--blue)' : 'var(--text-muted)' }}>
                    {info.label}
                  </div>
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)' }}>
                    {unlocked ? 'Kilidi açıldı!' : `${info.xpRequired.toLocaleString()} XP gerekli`}
                  </div>
                </div>
                {unlocked
                  ? <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--green)' }}>✓ Açık</span>
                  : <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)' }}>🔒</span>
                }
              </div>
              {!unlocked && (
                <>
                  <div style={{ background:'var(--surface3)', borderRadius:20, height:5, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:20, width:`${pct}%`, background:'var(--border)', transition:'width .6s ease' }}/>
                  </div>
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:8, color:'var(--text-muted)', marginTop:4 }}>
                    {totalXP.toLocaleString()} / {info.xpRequired.toLocaleString()} XP ({pct}%)
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Kazanılan rozetler */}
      {earnedList.length > 0 && (
        <>
          <div className="section-title">KAZANILAN ROZETLER ({earnedList.length})</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:24 }}>
            {earnedList.map(badge => (
              <BadgeCard key={badge.id} badge={badge} earned={true} />
            ))}
          </div>
        </>
      )}

      {/* Kazanılmayan rozetler */}
      {unearnedList.length > 0 && (
        <>
          <div className="section-title">KİLİTLİ ROZETLER ({unearnedList.length})</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:24 }}>
            {unearnedList.map(badge => (
              <BadgeCard key={badge.id} badge={badge} earned={false} />
            ))}
          </div>
        </>
      )}

      {/* XP Nasıl Kazanılır */}
      <div className="section-title">XP NASIL KAZANILIR?</div>
      <div className="card" style={{ padding:'16px 18px', marginBottom:20 }}>
        {[
          { label:'Antrenman tamamla',    xp:100, icon:'🏋️' },
          { label:'Her set ekle',          xp:10,  icon:'💪' },
          { label:'Kişisel rekor kır',     xp:150, icon:'🏆' },
          { label:'Kalori hedefini tut',   xp:75,  icon:'🍽️' },
          { label:'Protein hedefini tut',  xp:50,  icon:'🥩' },
          { label:'Su hedefini tut',       xp:20,  icon:'💧' },
          { label:'7 günlük seri',         xp:50,  icon:'🔥' },
          { label:'Rozet kazan',           xp:50,  icon:'🏅' },
        ].map(({ label, xp, icon }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>{icon}</span>
              <span style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--text-muted)' }}>{label}</span>
            </div>
            <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, color:'var(--accent)', letterSpacing:1 }}>+{xp} XP</span>
          </div>
        ))}
      </div>

    </div>
  )
}
