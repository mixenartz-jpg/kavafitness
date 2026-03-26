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
      const oldEmail  = snap.data().oldEmail || null

      let cred
      try {
        cred = await signInWithEmailAndPassword(auth, realEmail, password)
      } catch (firstErr) {
        if (oldEmail && (firstErr.code === 'auth/invalid-credential' || firstErr.code === 'auth/wrong-password')) {
          cred = await signInWithEmailAndPassword(auth, oldEmail, password)
        } else {
          throw firstErr
        }
      }

      if (!cred.user.emailVerified) {
        await auth.signOut()
        setLoading(false)
        setError('📧 Lütfen mail adresinizi doğrulayın. ⚠️ SPAM / GEREKSIZ klasörünü de kontrol edin!')
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
      setSuccess(`✓ Şifre sıfırlama maili gönderildi: ${realEmail}\n⚠️ SPAM / GEREKSIZ klasörünü mutlaka kontrol et!`)
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
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, rgba(12,12,12,1) 0%, rgba(20,20,20,1) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '16px', overflow: 'hidden'
    }}>
      <style>{`
        .auth-glass-card {
          position: relative;
          background: rgba(22, 22, 24, 0.6);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
          z-index: 10;
        }
        .auth-glow-bg {
          position: absolute;
          width: 400px; height: 400px;
          background: var(--accent, #e8ff47);
          filter: blur(180px);
          opacity: 0.08;
          border-radius: 50%;
          top: -20%; left: -20%;
          pointer-events: none;
          z-index: 0;
          animation: authPulse 8s infinite alternate;
        }
        .auth-glow-bg-2 {
          position: absolute;
          width: 300px; height: 300px;
          background: #ff8c47;
          filter: blur(160px);
          opacity: 0.05;
          border-radius: 50%;
          bottom: -10%; right: -10%;
          pointer-events: none;
          z-index: 0;
        }
        @keyframes authPulse {
          0% { transform: scale(1); opacity: 0.08; }
          100% { transform: scale(1.1); opacity: 0.12; }
        }
        .auth-magic-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: white;
          border-radius: 12px;
          padding: 14px 16px;
          font-family: 'Inter', 'Space Mono', monospace;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
        }
        .auth-magic-input:focus {
          border-color: var(--accent, #e8ff47);
          box-shadow: 0 0 0 4px rgba(232, 255, 71, 0.1);
          background: rgba(0, 0, 0, 0.4);
        }
        .auth-magic-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        .auth-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(232, 255, 71, 0.25);
        }
        .auth-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        .auth-alert-error {
          animation: slideDownIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideDownIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div className="auth-glow-bg" />
      <div className="auth-glow-bg-2" />

      <div className="auth-glass-card" style={{
        width:'min(440px,100%)', borderRadius: 24, padding: '40px 32px',
        maxHeight:'90vh', overflowY:'auto'
      }}>
        {/* Header / Logo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="KavaFit" style={{ height: 64, width: 'auto', marginBottom: 12, filter: 'drop-shadow(0 4px 12px rgba(232,255,71,0.2))' }} />
          <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize: 42, letterSpacing: 4, color: 'white', lineHeight: 1 }}>
            KAVA<span style={{ color:'var(--accent, #e8ff47)' }}>FIT</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'Space Mono, monospace', marginTop: 4, letterSpacing: 1 }}>
            EVRİMİNİ SEN YÖNET
          </div>
        </div>

        {/* Verification Pending View */}
        {verifyPending ? (
          <div style={{ textAlign:'center', padding:'8px 0', animation: 'slideDownIn 0.4s ease' }}>
            <div style={{ 
              width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,140,71,0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              border: '1px solid rgba(255,140,71,0.3)', fontSize: 36
            }}>📧</div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize: 26, letterSpacing: 3, marginBottom: 12, color: 'white' }}>
              MAİL ADRESİNİZİ DOĞRULAYIN
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, marginBottom: 24 }}>
              <b style={{ color:'var(--accent)' }}>{email}</b> adresine doğrulama maili gönderdik.
              <br />Maildeki linke tıkladıktan sonra giriş yapabilirsin.
            </div>
            <div style={{
              background:'linear-gradient(135deg, rgba(255,140,71,.08) 0%, rgba(255,140,71,.15) 100%)', 
              border:'1px solid rgba(255,140,71,.3)',
              borderRadius: 16, padding:'16px', marginBottom:24,
              display:'flex', alignItems:'flex-start', gap:12,
            }}>
              <span style={{ fontSize:20, flexShrink:0, marginTop: 2 }}>📬</span>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, letterSpacing:1, color:'#ff8c47', marginBottom:4 }}>
                  SPAM KLASÖRÜNÜ KONTROL EDİN
                </div>
                <div style={{ fontSize: 12, color:'rgba(255,255,255,0.6)', fontFamily:'Inter, sans-serif', lineHeight: 1.5 }}>
                  Eğer ana kutunuza düşmediyse mail gereksiz veya spam kutunuza gitmiş olabilir. Lütfen mutlaka kontrol edin.
                </div>
              </div>
            </div>
            <button className="auth-btn" onClick={() => { setVerifyPending(false); setMode('login'); setEmail(''); setPassword('') }}
              style={{ 
                width:'100%', padding: 14, background: 'var(--accent)', color: '#0a0a0a',
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, letterSpacing: 2,
                borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600
               }}>
              Giriş Ekranına Dön
            </button>
          </div>
        ) : (
          <div style={{ animation: 'slideDownIn 0.3s ease' }}>
            {/* Tabs */}
            {mode !== 'forgot' && (
              <div style={{ 
                display:'flex', background:'rgba(0,0,0,0.4)', borderRadius: 14, padding: 4, marginBottom: 28,
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {[['login','GİRİŞ YAP'],['register','KAYIT OL']].map(([m, lbl]) => (
                  <button key={m} onClick={() => switchMode(m)} style={{
                    flex:1, padding: 10, borderRadius: 10, border:'none', cursor:'pointer',
                    fontFamily:'Bebas Neue, sans-serif', fontSize: 14, letterSpacing: 2,
                    background: mode===m ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: mode===m ? 'white' : 'rgba(255,255,255,0.4)',
                    boxShadow: mode===m ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                    transition:'all .3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}>{lbl}</button>
                ))}
              </div>
            )}

            {/* Şifremi unuttum başlık */}
            {mode === 'forgot' && (
              <div style={{ marginBottom: 28, textAlign: 'center' }}>
                <div style={{ 
                  width: 56, height: 56, borderRadius: '50%', background: 'rgba(56, 182, 255, 0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  border: '1px solid rgba(56, 182, 255, 0.2)', fontSize: 24
                }}>🔑</div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize: 22, letterSpacing: 2, marginBottom: 8, color: 'white' }}>ŞİFREMİ UNUTTUM</div>
                <div style={{ fontSize: 13, color:'rgba(255,255,255,0.6)', fontFamily:'Inter, sans-serif', lineHeight: 1.6 }}>
                  Kullanıcı adınızı girin, şifre sıfırlama talimatlarını e-posta adresinize gönderelim.
                </div>
              </div>
            )}

            {/* Feedback Alerts */}
            {error && error !== 'EMAIL_NOT_VERIFIED' && (
              <div className="auth-alert-error" style={{ 
                background:'rgba(255,71,71,.08)', border:'1px solid rgba(255,71,71,.2)', borderRadius: 12,
                padding:'12px 16px', fontSize: 13, color:'#ff4747', fontFamily:'Inter, sans-serif', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div className="auth-alert-error" style={{ 
                background:'rgba(71,255,138,.08)', border:'1px solid rgba(71,255,138,.2)', borderRadius: 12,
                padding:'12px 16px', fontSize: 13, color:'#47ff8a', fontFamily:'Inter, sans-serif', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <span>✓</span> {success}
              </div>
            )}

            {/* Inputs Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              {/* Kullanıcı adı */}
              <div>
                <div style={{ fontSize: 12, fontFamily: 'Space Mono, monospace', color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: 0.5 }}>
                  KULLANICI ADI
                </div>
                <input className="auth-magic-input" type="text" value={username} placeholder="örn. slmbn"
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  onKeyDown={e => e.key==='Enter' && (mode==='register' ? document.getElementById('email-inp')?.focus() : document.getElementById('pw-inp')?.focus())}
                  maxLength={20} autoComplete="username" />
                {mode === 'register' && (
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontFamily:'Inter, sans-serif', marginTop: 6 }}>
                    2-20 karakter aralığında, sadece küçük harf, rakam ve alt çizgi kullanın.
                  </div>
                )}
              </div>

              {/* E-posta */}
              {mode === 'register' && (
                <div>
                  <div style={{ fontSize: 12, fontFamily: 'Space Mono, monospace', color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: 0.5 }}>
                    E-POSTA ADRESİ
                  </div>
                  <input className="auth-magic-input" id="email-inp" type="email" value={email} placeholder="örn. sen@gmail.com"
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && document.getElementById('pw-inp')?.focus()}
                    autoComplete="email" />
                </div>
              )}

              {/* Şifre */}
              {mode !== 'forgot' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontFamily: 'Space Mono, monospace', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 }}>
                      ŞİFRE
                    </div>
                    {mode === 'login' && (
                      <button onClick={() => switchMode('forgot')} style={{
                        background:'none', border:'none', cursor:'pointer',
                        fontSize: 12, color:'rgba(255,255,255,0.4)', fontFamily:'Inter, sans-serif',
                        transition: 'color 0.2s'
                      }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='rgba(255,255,255,0.4)'}>
                        Şifremi unuttum?
                      </button>
                    )}
                  </div>
                  <input className="auth-magic-input" id="pw-inp" type="password" value={password} placeholder="••••••••"
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && handleSubmit()}
                    minLength={6} autoComplete="current-password" />
                </div>
              )}
            </div>

            {/* Action Button */}
            <button className="auth-btn" onClick={handleSubmit} disabled={loading} style={{
              width:'100%', padding: '14px 16px',
              background: mode==='forgot' ? '#38b6ff' : 'var(--accent, #e8ff47)',
              color: '#0a0a0a',
              fontFamily:'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: 2,
              border:'none', borderRadius: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
              boxShadow: mode==='forgot' ? '0 4px 14px rgba(56, 182, 255, 0.3)' : '0 4px 14px rgba(232, 255, 71, 0.2)'
            }}>
              {loading && <span className="spinner" style={{ borderTopColor:'#0a0a0a', width:18, height:18, border: '2px solid rgba(0,0,0,0.1)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
              {loading ? 'BEKLEYİN...'
                : mode==='login'    ? 'GİRİŞ YAP'
                : mode==='register' ? 'HESAP OLUŞTUR'
                : 'SIFIRLAMA BAĞLANTISI GÖNDER'}
            </button>

            {/* Auth Footer Links */}
            <div style={{ textAlign:'center', marginTop: 24 }}>
              {mode === 'forgot' ? (
                <button onClick={() => switchMode('login')} style={{
                  background:'none', border:'none', cursor:'pointer',
                  fontSize: 13, color:'rgba(255,255,255,0.6)', fontFamily:'Inter, sans-serif',
                  transition: 'color 0.2s'
                }}>
                  ← Giriş ekranına dön
                </button>
              ) : (
                <a href="https://instagram.com/slmbnmixo" target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, color:'rgba(255,255,255,0.3)', fontFamily:'Inter, sans-serif', textDecoration:'none', transition: 'color 0.2s' }}
                  onMouseOver={e => e.target.style.color='rgba(255,255,255,0.6)'} onMouseOut={e => e.target.style.color='rgba(255,255,255,0.3)'}>
                  Yardıma mı ihtiyacın var? İletişime geç
                </a>
              )}
            </div>
            
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}
