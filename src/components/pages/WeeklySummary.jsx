import { useApp } from '../../context/AppContext'

function getWeekRange(weeksAgo = 0) {
  const now = new Date()
  const day = now.getDay() || 7 // Pazartesi = 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day - 1) - weeksAgo * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { monday, sunday }
}

function getWeekDates(weeksAgo = 0) {
  const { monday } = getWeekRange(weeksAgo)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function weekLabel(weeksAgo) {
  if (weeksAgo === 0) return 'BU HAFTA'
  if (weeksAgo === 1) return 'GEÇEN HAFTA'
  return `${weeksAgo} HAFTA ÖNCE`
}

export default function WeeklySummaryPage() {
  const { exercises, exArchive, foods, calArch, body, goals, todayKey } = useApp()

  const getWeekStats = (weeksAgo) => {
    const dates = getWeekDates(weeksAgo)
    const today = todayKey()

    let totalSets = 0, totalExercises = 0, trainDays = 0
    let maxWeight = 0, totalCalories = 0, calDays = 0

    dates.forEach(dk => {
      const exs = dk === today ? exercises : (exArchive[dk] || [])
      if (exs.length > 0) {
        trainDays++
        totalExercises += exs.length
        exs.forEach(ex => {
          totalSets += ex.sets.length
          ex.sets.forEach(s => { if (+s.weight > maxWeight) maxWeight = +s.weight })
        })
      }

      const fs = dk === today ? foods : (calArch[dk] || [])
      if (fs.length > 0) {
        calDays++
        totalCalories += fs.reduce((sum, f) => sum + (+f.kcal || 0), 0)
      }
    })

    // Vücut ölçüleri — haftanın son ölçümü
    const bodyEntries = body
      .filter(b => dates.includes(b.date))
      .sort((a, b) => b.date.localeCompare(a.date))
    const latestBody = bodyEntries[0] || null

    return {
      trainDays, totalExercises, totalSets, maxWeight,
      totalCalories: Math.round(totalCalories),
      avgCalories: calDays > 0 ? Math.round(totalCalories / calDays) : 0,
      calDays, latestBody, dates,
    }
  }

  const thisWeek = getWeekStats(0)
  const lastWeek = getWeekStats(1)

  const diff = (cur, prev, higherIsBetter = true) => {
    if (!prev && prev !== 0) return null
    const d = cur - prev
    if (d === 0) return { label: '=', cls: 'same' }
    const better = higherIsBetter ? d > 0 : d < 0
    return {
      label: `${d > 0 ? '+' : ''}${d}`,
      cls: better ? 'up' : 'down',
    }
  }

  const StatCard = ({ label, value, unit, prev, higherIsBetter = true, color }) => {
    const d = diff(value, prev, higherIsBetter)
    return (
      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 32, lineHeight: 1, color: color || 'var(--text)' }}>
            {value}
          </div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{unit}</div>
          {d && (
            <span className={`delta delta-${d.cls}`} style={{ marginBottom: 4, fontSize: 10 }}>
              {d.label}
            </span>
          )}
        </div>
        {prev !== undefined && prev !== null && (
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
            geçen hafta: {prev} {unit}
          </div>
        )}
      </div>
    )
  }

  const { monday, sunday } = getWeekRange(0)
  const fmt = d => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })

  return (
    <div className="page animate-fade" style={{ maxWidth: 700 }}>

      {/* Başlık */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, letterSpacing: 3, color: 'var(--accent)' }}>
            HAFTALIK ÖZET
          </div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {fmt(monday)} – {fmt(sunday)}
          </div>
        </div>
        <div style={{
          fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--text-muted)',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 12px',
        }}>
          Her Pazartesi sıfırlanır
        </div>
      </div>

      {/* Antrenman */}
      <div className="section-title">ANTRENMAN</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Antrenman Günü" value={thisWeek.trainDays} unit="gün" prev={lastWeek.trainDays} color="var(--accent)" />
        <StatCard label="Toplam Egzersiz" value={thisWeek.totalExercises} unit="adet" prev={lastWeek.totalExercises} />
        <StatCard label="Toplam Set" value={thisWeek.totalSets} unit="set" prev={lastWeek.totalSets} />
        <StatCard label="Max Ağırlık" value={thisWeek.maxWeight} unit="kg" prev={lastWeek.maxWeight} />
      </div>

      {/* Antrenman günleri */}
      <div className="card" style={{ padding: '16px 18px', marginBottom: 24 }}>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Bu Haftanın Günleri</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {thisWeek.dates.map(dk => {
            const today = todayKey()
            const exs = dk === today ? exercises : (exArchive[dk] || [])
            const hasData = exs.length > 0
            const d = new Date(dk + 'T00:00:00')
            const dayName = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][d.getDay() === 0 ? 6 : d.getDay() - 1]
            const isFuture = dk > today
            return (
              <div key={dk} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 10px', borderRadius: 10, minWidth: 44,
                background: hasData ? 'rgba(232,255,71,.08)' : isFuture ? 'transparent' : 'var(--surface2)',
                border: `1px solid ${hasData ? 'rgba(232,255,71,.25)' : 'var(--border)'}`,
              }}>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: hasData ? 'var(--accent)' : 'var(--text-muted)' }}>{dayName}</div>
                <div style={{ fontSize: hasData ? 16 : 14 }}>{hasData ? '💪' : isFuture ? '⬜' : '😴'}</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--text-muted)' }}>
                  {exs.length > 0 ? `${exs.length} ex` : '—'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Kalori */}
      <div className="section-title">KALORİ & BESLENME</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Toplam Kalori" value={thisWeek.totalCalories} unit="kcal" prev={lastWeek.totalCalories} color="var(--green)" />
        <StatCard label="Günlük Ortalama" value={thisWeek.avgCalories} unit="kcal/gün" prev={lastWeek.avgCalories} />
        <StatCard label="Takip Edilen Gün" value={thisWeek.calDays} unit="gün" prev={lastWeek.calDays} />
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Hedefe Göre</div>
          {goals.kcal > 0 && thisWeek.avgCalories > 0 ? (
            <>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 32, lineHeight: 1, color: thisWeek.avgCalories > goals.kcal ? 'var(--red)' : 'var(--accent)' }}>
                {thisWeek.avgCalories > goals.kcal ? '+' : ''}{thisWeek.avgCalories - goals.kcal}
              </div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                hedef: {goals.kcal} kcal/gün
              </div>
            </>
          ) : (
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--text-muted)' }}>Veri yok</div>
          )}
        </div>
      </div>

      {/* Vücut Ölçüleri */}
      <div className="section-title">VÜCUT ÖLÇÜLERİ</div>
      {thisWeek.latestBody || lastWeek.latestBody ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { key: 'weight', label: 'Kilo', unit: 'kg', higherIsBetter: false },
            { key: 'waist',  label: 'Bel',  unit: 'cm', higherIsBetter: false },
            { key: 'chest',  label: 'Göğüs',unit: 'cm', higherIsBetter: true },
            { key: 'hip',    label: 'Kalça',unit: 'cm', higherIsBetter: false },
          ].map(({ key, label, unit, higherIsBetter }) => (
            <StatCard
              key={key}
              label={label}
              value={thisWeek.latestBody?.[key] ?? '—'}
              unit={unit}
              prev={lastWeek.latestBody?.[key]}
              higherIsBetter={higherIsBetter}
              color="var(--blue)"
            />
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: '32px 24px' }}>
          <div className="empty-icon">⚖️</div>
          <div className="empty-title">ÖLÇÜM YOK</div>
          <div className="empty-sub">Bu hafta vücut ölçümü girilmemiş.</div>
        </div>
      )}

      {/* Geçen haftayla karşılaştırma özeti */}
      <div className="section-title">GEÇEN HAFTAYA GÖRE</div>
      <div className="card" style={{ padding: '18px 20px' }}>
        {[
          {
            icon: '🏋️',
            label: 'Antrenman',
            cur: thisWeek.trainDays,
            prev: lastWeek.trainDays,
            unit: 'gün',
            better: thisWeek.trainDays >= lastWeek.trainDays,
          },
          {
            icon: '🔥',
            label: 'Toplam Set',
            cur: thisWeek.totalSets,
            prev: lastWeek.totalSets,
            unit: 'set',
            better: thisWeek.totalSets >= lastWeek.totalSets,
          },
          {
            icon: '🍎',
            label: 'Ort. Kalori',
            cur: thisWeek.avgCalories,
            prev: lastWeek.avgCalories,
            unit: 'kcal',
            better: Math.abs(thisWeek.avgCalories - goals.kcal) <= Math.abs(lastWeek.avgCalories - goals.kcal),
          },
        ].map(({ icon, label, cur, prev, unit, better }) => {
          const d = cur - prev
          return (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,.04)',
            }}>
              <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 14, letterSpacing: 1 }}>{label}</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--text-muted)' }}>
                  {prev} → {cur} {unit}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`delta delta-${d > 0 ? 'up' : d < 0 ? 'down' : 'same'}`}>
                  {d > 0 ? '+' : ''}{d} {unit}
                </span>
                <div style={{ fontSize: 16, marginTop: 2 }}>{better ? '✅' : d === 0 ? '➡️' : '⚠️'}</div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
