import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { auth, db } from '../../firebase'
import {
  signOut, updatePassword, verifyBeforeUpdateEmail,
  reauthenticateWithCredential, EmailAuthProvider, deleteUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'

export default function AccountPage() {
  const { user, uid, showToast } = useApp()

  const [currentUsername, setCurrentUsername]     = useState('')
  const [newUsername, setNewUsername]             = useState('')
  const [newEmail, setNewEmail]                   = useState('')
  const [emailPw, setEmailPw]                     = useState('')
  const [currentPw, setCurrentPw]                 = useState('')
  const [newPw, setNewPw]                         = useState('')
  const [newPwConfirm, setNewPwConfirm]           = useState('')
  const [deleteConfirmPw, setDeleteConfirmPw]     = useState('')
  const [accountLoading, setAccountLoading]       = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [usernameLastChanged, setUsernameLastChanged] = useState(null)
  const [loaded, setLoaded]                       = useState(false)

  // Kullanıcı adını ve cooldown'ı yükle
  useState(() => {
    if (!uid || loaded) return
    setLoaded(true)
    getDoc(doc(db, 'users', uid)).then(s => {
      if (s.exists()) {
        setCurrentUsername(s.data().username || '')
        setUsernameLastChanged(s.data().usernameLastChanged || null)
      }
    })
  })

  const reauth = async (password) => {
    const credential = EmailAuthProvider.credential(user.email, password)
    await reauthenticateWithCredential(user, credential)
  }

  // 2 günlük cooldown kontrolü
  const getCooldownInfo = () => {
    if (!usernameLastChanged) return { canChange: true, hoursLeft: 0 }
    const diffHours = (new Date() - new Date(usernameLastChanged)) / (1000 * 60 * 60)
    if (diffHours >= 48) return { canChange: true, hoursLeft: 0 }
    return { canChange: false, hoursLeft: Math.ceil(48 - diffHours) }
  }

  // ── Kullanıcı adı değiştir ──
  const handleUsernameChange = async () => {
    const { canChange, hoursLeft } = getCooldownInfo()
    if (!canChange) return showToast(`${hoursLeft} saat sonra değiştirebilirsin.`, 'error')
    if (!newUsername.trim()) return showToast('Yeni kullanıcı adı girin!', 'error')
    if (!/^[a-z0-9_]+$/.test(newUsername)) return showToast('Sadece küçük harf, rakam ve _ kullanılabilir.', 'error')
    if (newUsername.length < 2) return showToast('En az 2 karakter olmalı.', 'error')
    if (newUsername === currentUsername) return showToast('Bu zaten mevcut kullanıcı adın.', 'error')
    setAccountLoading(true)
    try {
      const snap = await getDoc(doc(db, 'usernames', newUsername))
      if (snap.exists()) { showToast('Bu kullanıcı adı zaten alınmış!', 'error'); setAccountLoading(false); return }
      const now = new Date().toISOString()
      await setDoc(doc(db, 'usernames', newUsername), { uid, email: user.email, createdAt: new Date() })
      if (currentUsername) await deleteDoc(doc(db, 'usernames', currentUsername))
      await setDoc(doc(db, 'users', uid), { username: newUsername, usernameLastChanged: now }, { merge: true })
      setCurrentUsername(newUsername)
      setUsernameLastChanged(now)
      setNewUsername('')
      showToast('Kullanıcı adı güncellendi ✓')
    } catch (e) { showToast('Hata: ' + e.message, 'error') }
    setAccountLoading(false)
  }

  // ── Email değiştir ──
  const handleEmailChange = async () => {
    if (!newEmail.includes('@')) return showToast('Geçerli bir e-posta girin!', 'error')
    if (!emailPw) return showToast('Mevcut şifrenizi girin!', 'error')
    setAccountLoading(true)
    try {
      await reauth(emailPw)
      await verifyBeforeUpdateEmail(user, newEmail)
      setNewEmail(''); setEmailPw('')
      showToast('Doğrulama maili gönderildi! Yeni adresinizi onaylayın.')
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
        showToast('Mevcut şifre hatalı!', 'error')
      else if (e.code === 'auth/email-already-in-use')
        showToast('Bu e-posta zaten kullanımda!', 'error')
      else showToast('Hata: ' + e.message, 'error')
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
      else showToast('Hata: ' + e.message, 'error')
    }
    setAccountLoading(false)
  }

  // ── Hesabı sil ──
  const handleDeleteAccount = async () => {
    if (!deleteConfirmPw) return showToast('Şifrenizi girin!', 'error')
    setAccountLoading(true)
    try {
      await reauth(deleteConfirmPw)
      const fitSnap = await getDocs(collection(db, 'users', uid, 'fitdata'))
      await Promise.all(fitSnap.docs.map(d => deleteDoc(d.ref)))
      await deleteDoc(doc(db, 'users', uid))
      if (currentUsername) await deleteDoc(doc(db, 'usernames', currentUsername))
      await deleteUser(user)
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
        showToast('Şifre hatalı!', 'error')
      else showToast('Hata: ' + e.message, 'error')
      setAccountLoading(false)
    }
  }

  const { canChange, hoursLeft } = getCooldownInfo()

  const Section = ({ title, color, children }) => (
    <div className="card" style={{ padding:'20px 22px', border: color ? `1px solid ${color}` : undefined }}>
      <div className="section-title" style={{ color: color ? 'var(--red)' : undefined }}>{title}</div>
      {children}
    </div>
  )

  const Btn = ({ onClick, disabled, children, danger }) => (
    <button
      onClick={onClick}
      disabled={disabled || accountLoading}
      className={danger ? undefined : 'btn btn-primary'}
      style={danger ? {
        width:'100%', padding:12, borderRadius:8,
        border:'1px solid var(--red)', background:'rgba(255,71,71,.1)',
        color:'var(--red)', cursor:'pointer',
        fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:2,
        opacity: accountLoading ? .5 : 1,
      } : { width:'100%' }}
    >
      {accountLoading
        ? <><span className="spinner" style={{ width:14, height:14, borderTopColor: danger ? 'var(--red)' : '#0a0a0a', marginRight:8 }} />Bekleyin...</>
        : children
      }
    </button>
  )

  return (
    <div className="page animate-fade" style={{ maxWidth:600 }}>

      {/* Başlık */}
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, letterSpacing:3, color:'var(--accent)', marginBottom:22 }}>
        HESABIM
      </div>

      {/* Mevcut hesap bilgisi */}
      <div style={{
        background:'rgba(232,255,71,.05)', border:'1px solid rgba(232,255,71,.15)',
        borderRadius:14, padding:'16px 20px', marginBottom:24,
        display:'flex', alignItems:'center', gap:20, flexWrap:'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width:56, height:56, borderRadius:'50%', flexShrink:0,
          background:'var(--accent)', display:'flex', alignItems:'center',
          justifyContent:'center', fontFamily:'Bebas Neue,sans-serif',
          fontSize:26, color:'#0a0a0a',
        }}>
          {currentUsername ? currentUsername[0].toUpperCase() : '?'}
        </div>
        <div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, letterSpacing:2, color:'var(--accent)', marginBottom:2 }}>
            @{currentUsername || '...'}
          </div>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text-muted)' }}>
            {user?.email}
          </div>
        </div>
        <button onClick={() => signOut(auth)} className="btn btn-ghost"
          style={{ marginLeft:'auto', borderColor:'rgba(255,71,71,.3)', color:'var(--red)', fontSize:12 }}>
          🚪 Çıkış Yap
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

        {/* ── Kullanıcı Adı ── */}
        <Section title="KULLANICI ADI DEĞİŞTİR">
          {!canChange && (
            <div style={{ background:'rgba(255,140,71,.08)', border:'1px solid rgba(255,140,71,.25)', borderRadius:8, padding:'10px 12px', marginBottom:14, fontFamily:'DM Mono,monospace', fontSize:10, color:'#ff8c47', lineHeight:1.7 }}>
              ⏳ Kullanıcı adını <b>{hoursLeft} saat</b> sonra tekrar değiştirebilirsin. (2 günde 1 kez)
            </div>
          )}
          <div className="form-group" style={{ marginBottom:12 }}>
            <span className="flabel">Yeni Kullanıcı Adı</span>
            <input type="text" value={newUsername}
              onChange={e => setNewUsername(e.target.value.toLowerCase())}
              placeholder="yeni_kullanici_adi" maxLength={20}
              disabled={!canChange} style={{ opacity: canChange ? 1 : .5 }} />
            <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>
              2-20 karakter · küçük harf, rakam, _ · 2 günde 1 değişim
            </span>
          </div>
          <Btn onClick={handleUsernameChange} disabled={!canChange}>
            ✓ Kullanıcı Adını Güncelle
          </Btn>
        </Section>

        {/* ── E-Posta ── */}
        <Section title="E-POSTA DEĞİŞTİR">
          <div style={{ background:'rgba(71,200,255,.07)', border:'1px solid rgba(71,200,255,.2)', borderRadius:8, padding:'10px 12px', marginBottom:14, fontFamily:'DM Mono,monospace', fontSize:10, color:'#47c8ff', lineHeight:1.7 }}>
            📧 Yeni e-postanıza doğrulama maili gönderilecek. Onaylamadan değişmez.
          </div>
          <div className="form-group" style={{ marginBottom:10 }}>
            <span className="flabel">Yeni E-Posta</span>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="yeni@email.com" />
          </div>
          <div className="form-group" style={{ marginBottom:14 }}>
            <span className="flabel">Mevcut Şifre (Doğrulama için)</span>
            <input type="password" value={emailPw} onChange={e => setEmailPw(e.target.value)} placeholder="••••••••" />
          </div>
          <Btn onClick={handleEmailChange}>📧 Doğrulama Maili Gönder</Btn>
        </Section>

        {/* ── Şifre ── */}
        <Section title="ŞİFRE DEĞİŞTİR">
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
              onKeyDown={e => e.key === 'Enter' && handlePasswordChange()} />
          </div>
          <Btn onClick={handlePasswordChange}>🔑 Şifreyi Güncelle</Btn>
        </Section>

        {/* ── Hesap Sil ── */}
        <Section title="HESABI SİL" color="rgba(255,71,71,.2)">
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
                <input type="password" value={deleteConfirmPw}
                  onChange={e => setDeleteConfirmPw(e.target.value)}
                  placeholder="Şifreniz" autoFocus />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <Btn onClick={handleDeleteAccount} danger>⚠️ HESABI SİL</Btn>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmPw('') }}
                  className="btn btn-ghost">İptal</button>
              </div>
            </div>
          )}
        </Section>

      </div>
    </div>
  )
}
