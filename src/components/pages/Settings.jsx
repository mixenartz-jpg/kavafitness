import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { auth, db } from '../../firebase'
import {
  signOut, updatePassword, verifyBeforeUpdateEmail,
  reauthenticateWithCredential, EmailAuthProvider, deleteUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'

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
  const { user, uid, profile, saveProfile, goals, saveGoals, body, saveBody, showToast, todayKey } = useApp()

  const [tab, setTab] = useState('profile')

  // Hesap yönetimi state
  const [currentUsername, setCurrentUsername]   = useState('')
  const [newUsername, setNewUsername]           = useState('')
  const [newEmail, setNewEmail]                 = useState('')
  const [currentPw, setCurrentPw]               = useState('')
  const [newPw, setNewPw]                       = useState('')
  const [newPwConfirm, setNewPwConfirm]         = useState('')
  const [deleteConfirmPw, setDeleteConfirmPw]   = useState('')
  const [accountLoading, setAccountLoading]     = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [form, setForm] = useState({
    goal:       profile?.goal || '',
    sportTypes: profile?.sportTypes || [],
    level:      profile?.level || '',
    trainDays:  profile?.trainDays || [],
    gender:     profile?.gender || 'male',
    age:        profile?.age || '',
    weight:     profile?.weight || '',
    height:     profile?.height || '',
    waist:      profile?.waist || '',
    activity:   profile?.activity || '1.55',
  })
  const [goalDraft, setGoalDraft] = useState(goals)
  const [bodyForm, setBodyForm]   = useState({
    date: todayKey(), weight: '', waist: '', chest: '', hip: '', neck: ''
  })

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const toggle = (key, val) => setForm(p => ({
    ...p, [key]: p[key].includes(val) ? p[key].filter(v=>v!==val) : [...p[key], val]
  }))

  // Mevcut kullanıcı adını yükle
  useState(() => {
    if (!uid) return
    getDoc(doc(db, 'users', uid)).then(s => {
      if (s.exists()) setCurrentUsername(s.data().username || '')
    })
  })

  const reauth = async (password) => {
    const credential = EmailAuthProvider.credential(user.email, password)
    await reauthenticateWithCredential(user, credential)
  }

  // ── Kullanıcı adı değiştir ──
  const handleUsernameChange = async () => {
    if (!newUsername.trim()) return showToast('Yeni kullanıcı adı girin!', 'error')
    if (!/^[a-z0-9_]+$/.test(newUsername)) return showToast('Sadece küçük harf, rakam ve _ kullanılabilir.', 'error')
    if (newUsername === currentUsername) return showToast('Bu zaten mevcut kullanıcı adın.', 'error')
    setAccountLoading(true)
    try {
      // Yeni kullanıcı adı müsait mi?
      const snap = await getDoc(doc(db, 'usernames', newUsername))
      if (snap.exists()) { showToast('Bu kullanıcı adı zaten alınmış!', 'error'); setAccountLoading(false); return }
      // Eski kaydı sil, yeni kaydı ekle
      await deleteDoc(doc(db, 'usernames', currentUsername))
      await setDoc(doc(db, 'usernames', newUsername), { uid, email: user.email, createdAt: new Date() })
      await setDoc(doc(db, 'users', uid), { username: newUsername, email: user.email }, { merge: true })
      setCurrentUsername(newUsername)
      setNewUsername('')
      showToast('Kullanıcı adı güncellendi ✓')
    } catch (e) { showToast('Hata: ' + e.message, 'error') }
    setAccountLoading(false)
  }

  // ── Email değiştir ──
  const handleEmailChange = async () => {
    if (!newEmail.includes('@')) return showToast('Geçerli bir e-posta girin!', 'error')
    if (!currentPw) return showToast('Mevcut şifrenizi girin!', 'error')
    setAccountLoading(true)
    try {
      await reauth(currentPw)
      await verifyBeforeUpdateEmail(user, newEmail)
      await setDoc(doc(db, 'usernames', currentUsername), { uid, email: newEmail }, { merge: true })
      await setDoc(doc(db, 'users', uid), { email: newEmail }, { merge: true })
      setNewEmail(''); setCurrentPw('')
      showToast('Doğrulama maili gönderildi! Yeni adresinizi onaylayın.', 'success')
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
        showToast('Mevcut şifre hatalı!', 'error')
      else if (e.code === 'auth/email-already-in-use')
        showToast('Bu e-posta zaten kullanımda!', 'error')
      else
        showToast('Hata: ' + e.message, 'error')
    }
    setAccountLoading(false)
  }

  // ── Şifre değiştir ──
  const handlePasswordChange = async () => {
    if (!currentPw) return showToast('Mevcut şifrenizi girin!', 'error')
    if (newPw.length < 6) return showToast('Yeni şifre en az 6 karakter olmalı!', 'error')
    if (newPw !== newPwConfirm) return showToast('Şifreler eşleşmiyor!', 'error')
    setAccountLoading(true)
    try {
      await reauth(currentPw)
      await updatePassword(user, newPw)
      setCurrentPw(''); setNewPw(''); setNewPwConfirm('')
      showToast('Şifre güncellendi ✓')
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
        showToast('Mevcut şifre hatalı!', 'error')
      else
        showToast('Hata: ' + e.message, 'error')
    }
    setAccountLoading(false)
  }

  // ── Hesabı sil ──
  const handleDeleteAccount = async () => {
    if (!deleteConfirmPw) return showToast('Şifrenizi girin!', 'error')
    setAccountLoading(true)
    try {
      await reauth(deleteConfirmPw)
      // Firestore verilerini sil
      const fitdataRef = collection(db, 'users', uid, 'fitdata')
      const fitSnap = await getDocs(fitdataRef)
      await Promise.all(fitSnap.docs.map(d => deleteDoc(d.ref)))
      await deleteDoc(doc(db, 'users', uid))
      await deleteDoc(doc(db, 'usernames', currentUsername))
      // Firebase Auth kullanıcısını sil
      await deleteUser(user)
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
        showToast('Şifre hatalı!', 'error')
      else
        showToast('Hata: ' + e.message, 'error')
      setAccountLoading(false)
    }
  }

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
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 3, color: 'var(--accent)', marginBottom: 10 }}>KİŞİSEL PROFİLİN</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {getPersonalizedTips().map((tip, i) => (
              <span key={i} style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', color: 'var(--text-muted)' }}>
                {tip}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
        {[['profile','👤 Profil'],['goals','🎯 Hedefler'],['body','⚖️ Ölçüler'],['account','🔐 Hesap']].map(([t,lbl]) => (
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
                  <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: form.goal === g.id ? 'var(--accent)' : 'var(--text-muted)' }}>{g.label}</span>
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
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: sel ? 'var(--accent)' : 'var(--text-muted)' }}>{s.label}</div>
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
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: form.level === l.id ? 'var(--accent)' : 'var(--text-muted)' }}>{l.label}</div>
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
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 8, color: sel ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 4 }}>{day}</div>
                    <div style={{ fontSize: 14 }}>{sel ? '💪' : '⬜'}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* TDEE */}
          {calcTDEE() && (
            <div style={{ background: 'rgba(232,255,71,.06)', border: '1px solid rgba(232,255,71,.15)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>TAHMİNİ GÜNLÜK KALORİ</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, color: 'var(--accent)' }}>
                {calcTDEE()} <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>kcal/gün</span>
              </div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
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

      {/* ══════════ HESAP TAB ══════════ */}
      {tab === 'account' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Mevcut hesap bilgisi */}
          <div style={{ background:'rgba(232,255,71,.05)', border:'1px solid rgba(232,255,71,.12)', borderRadius:12, padding:'14px 16px' }}>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:3, color:'var(--accent)', marginBottom:8 }}>MEVCUT HESAP</div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              <div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', marginBottom:3 }}>KULLANICI ADI</div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, color:'var(--accent)' }}>@{currentUsername}</div>
              </div>
              <div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text-muted)', marginBottom:3 }}>E-POSTA</div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text)' }}>{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Kullanıcı adı değiştir */}
          <div className="card" style={{ padding:'18px 20px' }}>
            <div className="section-title">KULLANICI ADI DEĞİŞTİR</div>
            <div className="form-group" style={{ marginBottom:12 }}>
              <span className="flabel">Yeni Kullanıcı Adı</span>
              <input type="text" value={newUsername}
                onChange={e => setNewUsername(e.target.value.toLowerCase())}
                placeholder="yeni_kullanici_adi" maxLength={20} />
              <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>
                2-20 karakter · küçük harf, rakam, _
              </span>
            </div>
            <button className="btn btn-primary" style={{ width:'100%' }}
              onClick={handleUsernameChange} disabled={accountLoading}>
              {accountLoading ? <><span className="spinner" style={{ width:14,height:14,borderTopColor:'#0a0a0a',marginRight:8 }} />Güncelleniyor...</> : '✓ Kullanıcı Adını Güncelle'}
            </button>
          </div>

          {/* Email değiştir */}
          <div className="card" style={{ padding:'18px 20px' }}>
            <div className="section-title">E-POSTA DEĞİŞTİR</div>
            <div style={{ background:'rgba(71,200,255,.07)', border:'1px solid rgba(71,200,255,.2)', borderRadius:8, padding:'10px 12px', marginBottom:14, fontFamily:'DM Mono,monospace', fontSize:10, color:'#47c8ff', lineHeight:1.7 }}>
              📧 Yeni e-postanıza doğrulama maili gönderilecek. Onaylamadan değişmez.
            </div>
            <div className="form-group" style={{ marginBottom:10 }}>
              <span className="flabel">Yeni E-Posta</span>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="yeni@email.com" />
            </div>
            <div className="form-group" style={{ marginBottom:12 }}>
              <span className="flabel">Mevcut Şifre (Doğrulama için)</span>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" />
            </div>
            <button className="btn btn-primary" style={{ width:'100%' }}
              onClick={handleEmailChange} disabled={accountLoading}>
              {accountLoading ? <><span className="spinner" style={{ width:14,height:14,borderTopColor:'#0a0a0a',marginRight:8 }} />Gönderiliyor...</> : '📧 Doğrulama Maili Gönder'}
            </button>
          </div>

          {/* Şifre değiştir */}
          <div className="card" style={{ padding:'18px 20px' }}>
            <div className="section-title">ŞİFRE DEĞİŞTİR</div>
            <div className="form-group" style={{ marginBottom:10 }}>
              <span className="flabel">Mevcut Şifre</span>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="form-group" style={{ marginBottom:10 }}>
              <span className="flabel">Yeni Şifre</span>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="En az 6 karakter" />
            </div>
            <div className="form-group" style={{ marginBottom:14 }}>
              <span className="flabel">Yeni Şifre (Tekrar)</span>
              <input type="password" value={newPwConfirm} onChange={e => setNewPwConfirm(e.target.value)} placeholder="••••••••"
                onKeyDown={e => e.key==='Enter' && handlePasswordChange()} />
            </div>
            <button className="btn btn-primary" style={{ width:'100%' }}
              onClick={handlePasswordChange} disabled={accountLoading}>
              {accountLoading ? <><span className="spinner" style={{ width:14,height:14,borderTopColor:'#0a0a0a',marginRight:8 }} />Güncelleniyor...</> : '🔑 Şifreyi Güncelle'}
            </button>
          </div>

          {/* Hesabı sil */}
          <div className="card" style={{ padding:'18px 20px', border:'1px solid rgba(255,71,71,.2)' }}>
            <div className="section-title" style={{ color:'var(--red)' }}>HESABI SİL</div>
            <div style={{ background:'rgba(255,71,71,.07)', border:'1px solid rgba(255,71,71,.2)', borderRadius:8, padding:'10px 12px', marginBottom:14, fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--red)', lineHeight:1.7 }}>
              ⚠️ Bu işlem geri alınamaz! Tüm verileriniz (antrenmanlar, kalori kayıtları, ölçümler) kalıcı olarak silinecek.
            </div>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-ghost"
                style={{ width:'100%', borderColor:'rgba(255,71,71,.3)', color:'var(--red)' }}>
                🗑️ Hesabımı Sil
              </button>
            ) : (
              <div className="animate-fade">
                <div className="form-group" style={{ marginBottom:12 }}>
                  <span className="flabel">Onaylamak için şifrenizi girin</span>
                  <input type="password" value={deleteConfirmPw} onChange={e => setDeleteConfirmPw(e.target.value)}
                    placeholder="Şifreniz" autoFocus />
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={handleDeleteAccount} disabled={accountLoading}
                    style={{ flex:1, padding:12, borderRadius:8, border:'1px solid var(--red)', background:'rgba(255,71,71,.1)', color:'var(--red)', cursor:'pointer', fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:2 }}>
                    {accountLoading ? '...' : '⚠️ HESABI SİL'}
                  </button>
                  <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmPw('') }} className="btn btn-ghost">
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* HEDEFLER TAB */}
      {tab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
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
                        <th key={h} style={{ fontFamily:'DM Mono,monospace', fontSize:9, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', padding:'10px 12px', borderBottom:'1px solid var(--border)', textAlign:'left', background:'var(--surface2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((d, i) => {
                      const prev = sorted[i+1]
                      return (
                        <tr key={d.date}>
                          <td style={{ padding:'10px 12px', fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
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
