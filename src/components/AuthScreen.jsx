import { useState } from 'react'
import { auth, db } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default function AuthScreen() {
  const [mode, setMode]       = useState('login')  // 'login' | 'register' | 'forgot'
  const [username, setUsername] = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyPending, setVerifyPending] = useState(false)

  const reset = () => { setError(''); setSuccess('') }
  const switchMode = (m) => { reset(); setMode(m) }

  // ── Giriş ──
  const handleLogin = async () => {
    reset()
    if (username.length < 2)            return setError('Kullanıcı adı girin.')
    if (!/^[a-z0-9_]+$/.test(username)) return setError('Geçersiz kullanıcı adı.')
    if (password.length < 6)            return setError('Şifre en az 6 karakter olmalı.')

    setLoading(true)
    try {
      const snap = await getDoc(doc(db, 'usernames', username))
      if (!snap.exists()) { setLoading(false); return setError('Bu kullanıcı adı bulunamadı.') }
      const realEmail = snap.data().email
      const cred = await signInWithEmailAndPassword(auth, realEmail, password)

      // E-posta doğrulama kontrolü
      if (!cred.user.emailVerified) {
        await auth.signOut()
        setLoading(false)
        setError('📧 Lütfen mail adresinizi doğrulayın. Gelen kutusu ve spam klasörünü kontrol edin.')
        return
      }
    } catch (e) {
      setLoading(false)
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
        setError('Şifre hatalı.')
      else
        setError('Giriş hatası: ' + e.message)
    }
  }

  // ── Kayıt ──
  const handleRegister = async () => {
    reset()
    if (username.length < 2)            return setError('Kullanıcı adı en az 2 karakter olmalı.')
    if (!/^[a-z0-9_]+$/.test(username)) return setError('Sadece küçük harf, rakam ve _ kullanabilirsin.')
    if (!email.includes('@'))           return setError('Geçerli bir e-posta girin.')
    if (password.length < 6)            return setError('Şifre en az 6 karakter olmalı.')

    setLoading(true)
    try {
      // Kullanıcı adı var mı?
      const snap = await getDoc(doc(db, 'usernames', username))
      if (snap.exists()) { setLoading(false); return setError('Bu kullanıcı adı zaten alınmış.') }

      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await sendEmailVerification(cred.user)
      await setDoc(doc(db, 'usernames', username), {
        uid: cred.user.uid,
        email,
        createdAt: new Date(),
      })
      await setDoc(doc(db, 'users', cred.user.uid), {
        username,
        email,
        createdAt: new Date(),
      })
      // Önce verify ekranını göster, sonra çıkış yap
      setVerifyPending(true)
      setLoading(false)
      await auth.signOut()
    } catch (e) {
      setLoading(false)
      if (e.code === 'auth/email-already-in-use')
        setError('Bu e-posta adresi zaten kullanılıyor.')
      else if (e.code === 'auth/invalid-email')
        setError('Geçersiz e-posta adresi.')
      else
        setError(e.message)
    }
  }

  // ── Şifremi Unuttum ──
  const handleForgot = async () => {
    reset()
    if (username.length < 2) return setError('Kullanıcı adı girin.')

    setLoading(true)
    try {
      const snap = await getDoc(doc(db, 'usernames', username))
      if (!snap.exists()) { setLoading(false); return setError('Bu kullanıcı adı bulunamadı.') }
      const realEmail = snap.data().email
      await sendPasswordResetEmail(auth, realEmail)
      setSuccess(`✓ Şifre sıfırlama maili gönderildi: ${realEmail} · SPAM KLASÖRÜNÜ KONTROL EDİN`)
    } catch (e) {
      setError('Hata: ' + e.message)
    }
    setLoading(false)
  }

  const handleSubmit = () => {
    if (mode === 'login')    handleLogin()
    else if (mode === 'register') handleRegister()
    else handleForgot()
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'var(--bg)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000,
      padding:'16px',
    }}>
      <div style={{
        width:'min(420px,100%)', background:'var(--surface)',
        border:'1px solid var(--border)', borderRadius:20, padding:'32px 28px',
        maxHeight:'90vh', overflowY:'auto',
      }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <img src="/logo.png" alt="KeroGym" style={{ height:52, width:'auto' }} />
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:34, letterSpacing:4, color:'var(--accent)' }}>
            KERO<span style={{ color:'var(--text-muted)' }}>GYM</span>
          </div>
        </div>
        <div style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', marginBottom:16 }}>
          Spor & Beslenme Takip Uygulaması
        </div>

        {/* E-posta doğrulama bekleme ekranı */}
        {verifyPending ? (
          <div style={{ textAlign:'center', padding:'8px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, letterSpacing:3, marginBottom:10 }}>
              MAİL ADRESİNİZİ DOĞRULAYIN
            </div>
            <div style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', lineHeight:1.8, marginBottom:16 }}>
              <b style={{ color:'var(--accent)' }}>{email}</b> adresine doğrulama maili gönderdik.
              <br />Maildeki linke tıkladıktan sonra giriş yapabilirsin.
            </div>
            <div style={{
              background:'rgba(255,140,71,.08)', border:'1px solid rgba(255,140,71,.2)',
              borderRadius:8, padding:'12px 14px', marginBottom:20,
              display:'flex', alignItems:'center', gap:10,
            }}>
              <span style={{ fontSize:18, flexShrink:0 }}>📬</span>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:2, color:'#ff8c47', marginBottom:2 }}>
                  LÜTFEN MAİL ADRESİNİZİ DOĞRULAYIN
                </div>
                <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>
                  ⚠️ LÜTFEN SPAM KLASÖRÜNÜ KONTROL EDİN
                </div>
              </div>
            </div>
            <button onClick={() => { setVerifyPending(false); setMode('login'); setEmail(''); setPassword('') }}
              className="btn btn-primary" style={{ width:'100%', padding:12 }}>
              Giriş Ekranına Dön
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            {mode !== 'forgot' && (
              <div style={{ display:'flex', background:'var(--surface2)', borderRadius:8, padding:3, marginBottom:22 }}>
                {[['login','GİRİŞ YAP'],['register','KAYIT OL']].map(([m, lbl]) => (
                  <button key={m} onClick={() => switchMode(m)} style={{
                    flex:1, padding:8, borderRadius:6, border:'none', cursor:'pointer',
                    fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:2,
                    background: mode===m ? 'var(--accent)' : 'transparent',
                    color: mode===m ? '#0a0a0a' : 'var(--text-muted)',
                    transition:'all .2s',
                  }}>{lbl}</button>
                ))}
              </div>
            )}

            {/* Şifremi unuttum başlık */}
            {mode === 'forgot' && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:2, marginBottom:6 }}>🔑 ŞİFREMİ UNUTTUM</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', lineHeight:1.6, marginBottom:8 }}>
                  Kullanıcı adını gir, kayıtlı e-postana sıfırlama bağlantısı göndereceğiz.
                </div>
                <div style={{ background:'rgba(255,140,71,.08)', border:'1px solid rgba(255,140,71,.2)', borderRadius:7, padding:'8px 12px', fontSize:10, color:'#ff8c47', fontFamily:'DM Mono,monospace' }}>
                  ⚠️ LÜTFEN SPAM KLASÖRÜNÜ KONTROL EDİN
                </div>
              </div>
            )}

            {/* Hata / Başarı */}
            {error && error !== 'EMAIL_NOT_VERIFIED' && (
              <div style={{ background:'rgba(255,71,71,.1)', border:'1px solid rgba(255,71,71,.3)', borderRadius:8,
                padding:'10px 14px', fontSize:12, color:'var(--red)', fontFamily:'DM Mono,monospace', marginBottom:14 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background:'rgba(71,255,138,.1)', border:'1px solid rgba(71,255,138,.3)', borderRadius:8,
                padding:'10px 14px', fontSize:12, color:'var(--green)', fontFamily:'DM Mono,monospace', marginBottom:14 }}>
                {success}
              </div>
            )}

            {/* Kullanıcı adı */}
            <div className="form-group" style={{ marginBottom:12 }}>
              <span className="flabel">Kullanıcı Adı</span>
              <input type="text" value={username} placeholder="örn. slmbn"
                onChange={e => setUsername(e.target.value.toLowerCase())}
                onKeyDown={e => e.key==='Enter' && (mode==='register' ? document.getElementById('email-inp')?.focus() : document.getElementById('pw-inp')?.focus())}
                maxLength={20} autoComplete="username" />
              {mode === 'register' && (
                <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>
                  2-20 karakter · harf, rakam, _
                </span>
              )}
            </div>

            {/* E-posta — kayıt modunda */}
            {mode === 'register' && (
              <div className="form-group" style={{ marginBottom:12 }}>
                <span className="flabel">E-Posta</span>
                <input id="email-inp" type="email" value={email} placeholder="örn. sen@gmail.com"
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && document.getElementById('pw-inp')?.focus()}
                  autoComplete="email" />
                <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>
                  Doğrulama ve şifre sıfırlama için kullanılır
                </span>
              </div>
            )}

            {/* Şifre */}
            {mode !== 'forgot' && (
              <div className="form-group" style={{ marginBottom: mode==='login' ? 8 : 18 }}>
                <span className="flabel">Şifre</span>
                <input id="pw-inp" type="password" value={password} placeholder="••••••••"
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleSubmit()}
                  minLength={6} autoComplete="current-password" />
                {mode === 'register' && (
                  <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>En az 6 karakter</span>
                )}
              </div>
            )}

            {/* Şifremi unuttum linki */}
            {mode === 'login' && (
              <div style={{ textAlign:'right', marginBottom:14 }}>
                <button onClick={() => switchMode('forgot')} style={{
                  background:'none', border:'none', cursor:'pointer',
                  fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace',
                  textDecoration:'underline', textUnderlineOffset:2,
                }}>Şifremi unuttum</button>
              </div>
            )}

            {/* Ana buton */}
            <button onClick={handleSubmit} disabled={loading} style={{
              width:'100%', padding:13,
              background: mode==='forgot' ? 'var(--blue)' : 'var(--accent)',
              color:'#0a0a0a',
              fontFamily:'Bebas Neue,sans-serif', fontSize:15, letterSpacing:2,
              border:'none', borderRadius:8,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? .6 : 1,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'all .2s',
            }}>
              {loading && <span className="spinner" style={{ borderTopColor:'#0a0a0a', width:16, height:16 }} />}
              {loading ? 'LÜTFEN BEKLEYİN...'
                : mode==='login'    ? 'GİRİŞ YAP'
                : mode==='register' ? 'KAYIT OL'
                : 'SIFIRLAMA MAİLİ GÖNDER'}
            </button>

            {/* Alt linkler */}
            <div style={{ textAlign:'center', marginTop:14, display:'flex', flexDirection:'column', gap:6 }}>
              {mode === 'forgot' && (
                <button onClick={() => switchMode('login')} style={{
                  background:'none', border:'none', cursor:'pointer',
                  fontSize:12, color:'var(--text-muted)', fontFamily:'DM Mono,monospace',
                }}>← Giriş ekranına dön</button>
              )}
              <a href="https://instagram.com/slmbnmixo" target="_blank" rel="noreferrer"
                style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', textDecoration:'none', opacity:.6 }}>
                Sorun mu var? @slmbnmixo
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
