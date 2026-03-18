import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { auth, db } from '../../firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const GOALS = [
  { id:'lose',     icon:'🔥', label:'Kilo Ver' },
  { id:'maintain', icon:'⚖️', label:'Kilo Koru' },
  { id:'gain',     icon:'💪', label:'Kilo Al' },
  { id:'cut',      icon:'✂️', label:'Yağ Yak' },
]
const SPORT_TYPES = [
  { id:'gym',     icon:'🏋️', label:'Gym' },
  { id:'cardio',  icon:'🏃', label:'Cardio' },
  { id:'yoga',    icon:'🧘', label:'Yoga' },
  { id:'crossfit',icon:'⚡', label:'CrossFit' },
  { id:'swim',    icon:'🏊', label:'Yüzme' },
  { id:'football',icon:'⚽', label:'Futbol' },
  { id:'diet',    icon:'🥗', label:'Diyet' },
  { id:'mixed',   icon:'🎯', label:'Karma' },
]
const LEVELS = [
  { id:'beginner',     icon:'🌱', label:'Yeni Başlayan' },
  { id:'intermediate', icon:'🌿', label:'Orta Seviye' },
  { id:'advanced',     icon:'🌳', label:'İleri Seviye' },
]
const ACTIVITY_LEVELS = [
  { val:'1.2',   label:'Hareketsiz' },
  { val:'1.375', label:'Az Aktif' },
  { val:'1.55',  label:'Orta Aktif' },
  { val:'1.725', label:'Çok Aktif' },
  { val:'1.9',   label:'Ekstra Aktif' },
]
const DAYS = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']

export default function SettingsPage() {
  const { user, profile, saveProfile, goals, saveGoals, body, saveBody, showToast, todayKey } = useApp()

  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({
    goal:         profile?.goal || '',
    sportTypes:   profile?.sportTypes || [],
    level:        profile?.level || '',
    trainDays:    profile?.trainDays || [],
    gender:       profile?.gender || 'male',
    age:          profile?.age || '',
    weight:       profile?.weight || '',
    height:       profile?.height || '',
    waist:        profile?.waist || '',
    activity:     profile?.activity || '1.55',
    targetWeight: profile?.targetWeight || '',   // YENİ: Hedef kilo
  })
  const [goalDraft, setGoalDraft] = useState(goals)
  const [bodyForm, setBodyForm]   = useState({
    date: todayKey(), weight: '', waist: '', chest: '', hip: '', neck: ''
  })

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const toggle = (key, val) => setForm(p => ({
    ...p, [key]: p[key].includes(val) ? p[key].filter(v=>v!==val) : [...p[key], val]
  }))

  const calcTDEE = () => {
    const { weight, height, age, gender, activity } = form
    if (!weight || !height || !age) return null
    const bmr = gender === 'male'
      ? 10 * +weight + 6.25 * +height - 5 * +age + 5
      : 10 * +weight + 6.25 * +height - 5 * +age - 161
    return Math.round(bmr * +activity)
  }

  const saveProfileHandler = () => {
    const tdee = calcTDEE()
    saveProfile({ ...form, tdee })
    showToast('Profil kaydedildi ✓')
  }

  const saveGoalsHandler = () => {
    saveGoals(goalDraft)
    showToast('Hedefler kaydedildi ✓')
  }

  const addBodyEntry = () => {
    if (!bodyForm.weight && !bodyForm.waist && !bodyForm.chest && !bodyForm.hip) return showToast('En az bir ölçüm girin!', 'error')
    const entry = { date: bodyForm.date || todayKey(), weight: +bodyForm.weight||null, waist: +bodyForm.waist||null, chest: +bodyForm.chest||null, hip: +bodyForm.hip||null, neck: +bodyForm.neck||null }
    const existing = body.findIndex(d => d.date === entry.date)
    const updated = existing >= 0 ? body.map((d,i) => i===existing?entry:d) : [...body, entry]
    saveBody(updated.sort((a,b)=>a.date.localeCompare(b.date)))
    setBodyForm({ date:todayKey(), weight:'', waist:'', chest:'', hip:'', neck:'' })
    showToast('Ölçüm kaydedildi ✓')
  }

  const tabStyle = (t) => ({
    flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer',
    fontFamily: 'Bebas Neue,sans-serif', fontSize: 12, letterSpacing: 2,
    background: tab === t ? 'var(--accent)' : 'transparent',
    color: tab === t ? '#0a0a0a' : 'var(--text-muted)',
    borderRadius: 6, transition: 'all .15s',
  })

  // Kişiselleştirilmiş öneriler
  const getPersonalizedTips = () => {
    if (!profile) return []
    const tips = []
    const goal = GOALS.find(g => g.id === profile.goal)
    const level = LEVELS.find(l => l.id === profile.level)
    if (goal) tips.push(`Hedefin: ${goal.icon} ${goal.label}`)
    if (level) tips.push(`Seviye: ${level.icon} ${level.label}`)
    if (profile.trainDays?.length) tips.push(`Haftada ${profile.trainDays.length} gün antrenman`)
    if (profile.tdee) tips.push(`Günlük kalori ihtiyacın: ~${profile.tdee} kcal`)
    if (profile.targetWeight) tips.push(`🎯 Hedef kilo: ${profile.targetWeight} kg`)
    return tips
  }

  const sorted = [...body].reverse()
  const delta = (cur, prev) => {
    if (cur === null) return <span style={{ color:'#444' }}>—</span>
    if (!prev) return <span>{cur}</span>
    const d = +(cur-prev).toFixed(1)
    const dir = d>0?'up':d<0?'down':'same'
    return <span>{cur} <span className={`delta delta-${dir}`} style={{ fontSize:10, padding:'1px 5px' }}>{d>0?'↑':d<0?'↓':'='}{d!==0?(d>0?'+':'')+d:''}</span></span>
  }

  return (
    <div className="page animate-fade" style={{ maxWidth: 700 }}>

      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, letterSpacing: 3, color: 'var(--accent)', marginBottom: 20 }}>
        AYARLAR
      </div>

      {/* Kişiselleştirme özeti */}
      {profile && getPersonalizedTips().length > 0 && (
        <div style={{ background: 'rgba(232,255,71,.05)', border: '1px solid rgba(232,255,71,.15)', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, letterSpacing: 3, color: 'var(--accent)', marginBottom: 10 }}>KİŞİSEL PROFİLİN</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {getPersonalizedTips().map((tip, i) => (
              <span key={i} style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', color: 'var(--text-muted)' }}>
                {tip}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
        {[['profile','👤 Profil'],['goals','🎯 Hedefler'],['body','⚖️ Ölçüler']].map(([t,lbl]) => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{lbl}</button>
        ))}
      </div>

      {/* PROFIL TAB */}
      {tab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Hedef */}
          <div>
            <div className="section-title">HEDEF</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
              {GOALS.map(g => (
                <div key={g.id} onClick={() => set('goal', g.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  background: form.goal === g.id ? 'rgba(232,255,71,.08)' : 'var(--surface2)',
                  border: `1px solid ${form.goal === g.id ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                  transition: 'all .15s',
                }}>
                  <span style={{ fontSize: 20 }}>{g.icon}</span>
                  <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: form.goal === g.id ? 'var(--accent)' : 'var(--text-muted)' }}>{g.label}</span>
                  {form.goal === g.id && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Spor türü */}
          <div>
            <div className="section-title">SPOR TÜRÜ</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {SPORT_TYPES.map(s => {
                const sel = form.sportTypes.includes(s.id)
                return (
                  <div key={s.id} onClick={() => toggle('sportTypes', s.id)} style={{
                    padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    background: sel ? 'rgba(232,255,71,.08)' : 'var(--surface2)',
                    border: `1px solid ${sel ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: sel ? 'var(--accent)' : 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Seviye */}
          <div>
            <div className="section-title">SEVİYE</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {LEVELS.map(l => (
                <div key={l.id} onClick={() => set('level', l.id)} style={{
                  flex: 1, padding: '12px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  background: form.level === l.id ? 'rgba(232,255,71,.08)' : 'var(--surface2)',
                  border: `1px solid ${form.level === l.id ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{l.icon}</div>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: form.level === l.id ? 'var(--accent)' : 'var(--text-muted)' }}>{l.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Kişisel bilgiler */}
          <div>
            <div className="section-title">KİŞİSEL BİLGİLER</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 10 }}>
              <div className="form-group">
                <span className="flabel">Cinsiyet</span>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                </select>
              </div>
              <div className="form-group">
                <span className="flabel">Aktivite</span>
                <select value={form.activity} onChange={e => set('activity', e.target.value)}>
                  {ACTIVITY_LEVELS.map(a => <option key={a.val} value={a.val}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[{key:'age',label:'Yaş',ph:'25'},{key:'weight',label:'Kilo (kg)',ph:'75'},{key:'height',label:'Boy (cm)',ph:'175'}].map(({key,label,ph}) => (
                <div key={key} className="form-group">
                  <span className="flabel">{label}</span>
                  <input type="number" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} />
                </div>
              ))}
            </div>

            {/* YENİ: Hedef kilo — sadece kilo ver/al/yağ yak seçilince göster */}
            {(form.goal === 'lose' || form.goal === 'gain' || form.goal === 'cut') && (
              <div style={{ marginTop: 10 }}>
                <div className="form-group">
                  <span className="flabel">
                    Hedef Kilo (kg)
                    <span style={{ color: 'var(--text-muted)', fontSize: 9, marginLeft: 6, fontWeight: 400 }}>
                      — {form.goal === 'lose' ? 'ulaşmak istediğin kilo' : form.goal === 'gain' ? 'hedeflediğin kilo' : 'cut sonrası hedef kilo'}
                    </span>
                  </span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="number"
                      value={form.targetWeight}
                      onChange={e => set('targetWeight', e.target.value)}
                      placeholder={form.weight ? String(Math.round(+form.weight * (form.goal === 'lose' ? 0.9 : 1.1))) : '70'}
                      style={{ flex: 1 }}
                    />
                    {form.weight && form.targetWeight && (
                      <div style={{
                        fontFamily: 'Space Mono,monospace', fontSize: 11,
                        color: form.goal === 'lose' || form.goal === 'cut' ? 'var(--green)' : 'var(--accent)',
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '8px 12px', whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {form.goal === 'lose' || form.goal === 'cut' ? '↓' : '↑'}
                        {Math.abs(+form.targetWeight - +form.weight).toFixed(1)} kg
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Antrenman günleri */}
          <div>
            <div className="section-title">ANTRENMAN GÜNLERİ</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
              {DAYS.map((day, i) => {
                const sel = form.trainDays.includes(i)
                return (
                  <div key={i} onClick={() => toggle('trainDays', i)} style={{
                    padding: '10px 4px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                    background: sel ? 'rgba(232,255,71,.08)' : 'var(--surface2)',
                    border: `1px solid ${sel ? 'rgba(232,255,71,.3)' : 'var(--border)'}`,
                  }}>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 8, color: sel ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 4 }}>{day}</div>
                    <div style={{ fontSize: 14 }}>{sel ? '💪' : '⬜'}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* TDEE */}
          {calcTDEE() && (
            <div style={{ background: 'rgba(232,255,71,.06)', border: '1px solid rgba(232,255,71,.15)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>TAHMİNİ GÜNLÜK KALORİ</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, color: 'var(--accent)' }}>
                {calcTDEE()} <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>kcal/gün</span>
              </div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                Kaydettiğinde hedefler otomatik güncellenecek
              </div>
            </div>
          )}

          <button className="btn btn-primary" onClick={saveProfileHandler} style={{ width: '100%', padding: 14 }}>
            Profili Kaydet
          </button>

          {/* Çıkış */}
          <button className="btn btn-ghost" onClick={() => signOut(auth)} style={{ width: '100%', borderColor: 'rgba(255,71,71,.3)', color: 'var(--red)' }}>
            🚪 Çıkış Yap
          </button>
        </div>
      )}

      {/* HEDEFLER TAB */}
      {tab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Profilini kaydettiğinde hedefler otomatik hesaplanır. İstersen buradan manuel olarak da düzenleyebilirsin.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {[
              { key:'kcal',    label:'Kalori',       unit:'kcal', color:'#e8ff47' },
              { key:'protein', label:'Protein',       unit:'g',    color:'#47c8ff' },
              { key:'fat',     label:'Yağ',           unit:'g',    color:'#ff8c47' },
              { key:'carb',    label:'Karbonhidrat',  unit:'g',    color:'#47ff8a' },
            ].map(({ key, label, unit, color }) => (
              <div key={key} className="form-group">
                <span className="flabel" style={{ color }}>{label} ({unit})</span>
                <input type="number" value={goalDraft[key]} min="0"
                  onChange={e => setGoalDraft(p => ({ ...p, [key]: +e.target.value }))} />
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={saveGoalsHandler} style={{ width: '100%', padding: 14 }}>
            Hedefleri Kaydet
          </button>
        </div>
      )}

      {/* VÜCUT ÖLÇÜLERİ TAB */}
      {tab === 'body' && (
        <div>
          <div className="section-title">YENİ ÖLÇÜM EKLE</div>
          <div className="card" style={{ padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
              {[
                {key:'date',  label:'Tarih',      type:'date'},
                {key:'weight',label:'Kilo (kg)',   type:'number', ph:'75'},
                {key:'waist', label:'Bel (cm)',    type:'number', ph:'80'},
                {key:'chest', label:'Göğüs (cm)',  type:'number', ph:'100'},
                {key:'hip',   label:'Kalça (cm)',  type:'number', ph:'95'},
                {key:'neck',  label:'Boyun (cm)',  type:'number', ph:'38'},
              ].map(({ key, label, type, ph }) => (
                <div key={key} className="form-group">
                  <span className="flabel">{label}</span>
                  <input type={type} value={bodyForm[key]} placeholder={ph}
                    onChange={e => setBodyForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={addBodyEntry}>Ölçüm Ekle</button>
          </div>

          <div className="section-title">ÖLÇÜM GEÇMİŞİ</div>
          {body.length === 0
            ? <div className="empty-state"><div className="empty-icon">⚖️</div><div className="empty-title">ÖLÇÜM YOK</div></div>
            : <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Tarih','Kilo','Bel','Göğüs','Kalça','Boyun',''].map(h => (
                        <th key={h} style={{ fontFamily:'Space Mono,monospace', fontSize:9, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', padding:'10px 12px', borderBottom:'1px solid var(--border)', textAlign:'left', background:'var(--surface2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((d, i) => {
                      const prev = sorted[i+1]
                      return (
                        <tr key={d.date}>
                          <td style={{ padding:'10px 12px', fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--text-muted)', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                            {new Date(d.date+'T00:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'})}
                          </td>
                          {['weight','waist','chest','hip','neck'].map(k => (
                            <td key={k} style={{ padding:'10px 12px', fontSize:13, borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                              {delta(d[k], prev?.[k])} <span style={{ fontSize:10, color:'var(--text-muted)' }}>{k==='weight'?'kg':'cm'}</span>
                            </td>
                          ))}
                          <td style={{ padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                            <button className="btn btn-danger" onClick={() => saveBody(body.filter(x=>x.date!==d.date))}>✕</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
          }
        </div>
      )}
    </div>
  )
}
