import { useState, useEffect } from 'react'
import { db, auth } from '../../firebase'
import { useApp } from '../../context/AppContext'
import {
  doc, collection, getDocs, deleteDoc, setDoc,
  serverTimestamp, query, orderBy, limit,
} from 'firebase/firestore'

// ─────────────────────────────────────────────
// Admin şifresi
// ─────────────────────────────────────────────
const ADMIN_PASS = 'kerogym_admin_2025'
const ADMIN_KEY  = 'kerogym_admin_unlocked'

// Duyurular admin'in kendi users/{uid}/announcements/ altına yazılır.
// Announcement.jsx, bu UID'den okur → Firestore rules gerekmez.
// İlk girişte UID localStorage'a kaydedilir, Announcement.jsx da aynı key'i okur.
export const ADMIN_UID_KEY = 'kerogym_admin_uid'

// ── Şifre Ekranı ──
function AdminLock({ onUnlock }) {
  const [pw, setPw]       = useState('')
  const [err, setErr]     = useState(false)
  const [shake, setShake] = useState(false)

  const tryUnlock = () => {
    if (pw === ADMIN_PASS) {
      // UID'i kaydet — Announcement bu key'den okuyacak
      const uid = auth.currentUser?.uid
      if (uid) localStorage.setItem(ADMIN_UID_KEY, uid)
      localStorage.setItem(ADMIN_KEY, '1')
      onUnlock()
    } else {
      setErr(true); setShake(true); setPw('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="page animate-fade" style={{ maxWidth:380, margin:'0 auto' }}>
      <div style={{
        background:'rgba(255,71,71,.05)', border:'1px solid rgba(255,71,71,.2)',
        borderRadius:20, padding:'36px 28px', textAlign:'center',
        animation: shake ? 'shake .4s ease' : 'none',
      }}>
        <div style={{ fontSize:44, marginBottom:14 }}>🔐</div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:26, letterSpacing:4, color:'var(--red)', marginBottom:8 }}>ADMİN PANELİ</div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)', lineHeight:1.7, marginBottom:24 }}>
          Bu alan yalnızca yöneticilere açıktır.
        </div>
        <div className="form-group" style={{ marginBottom:14, textAlign:'left' }}>
          <span className="flabel">Admin Şifresi</span>
          <input
            type="password" value={pw}
            onChange={e => { setPw(e.target.value); setErr(false) }}
            onKeyDown={e => e.key === 'Enter' && tryUnlock()}
            placeholder="••••••••••••" autoFocus
            style={{ borderColor: err ? 'rgba(255,71,71,.5)' : undefined }}
          />
          {err && <span style={{ fontSize:10, color:'var(--red)', fontFamily:'Space Mono,monospace', marginTop:4, display:'block' }}>❌ Yanlış şifre</span>}
        </div>
        <button className="btn btn-primary" onClick={tryUnlock}
          style={{ width:'100%', padding:12, background:'var(--red)', color:'#fff' }}>
          Giriş Yap
        </button>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  )
}

// ── Yardımcılar ──
function getAdminRef(uid) {
  return collection(db, 'users', uid, 'announcements')
}
function getDocRef(uid, id) {
  return doc(db, 'users', uid, 'announcements', id)
}

const TYPE_COLORS = {
  info:    { bg:'rgba(71,200,255,.1)',  border:'rgba(71,200,255,.3)',  text:'#47c8ff',        icon:'ℹ️' },
  success: { bg:'rgba(71,255,138,.1)',  border:'rgba(71,255,138,.3)',  text:'var(--green)',   icon:'✅' },
  warning: { bg:'rgba(255,140,71,.1)',  border:'rgba(255,140,71,.3)',  text:'#ff8c47',        icon:'⚠️' },
  promo:   { bg:'rgba(232,255,71,.1)',  border:'rgba(232,255,71,.3)',  text:'var(--accent)',  icon:'🎉' },
}

export default function AdminPanelPage() {
  const { uid: adminUid } = useApp()  // auth.currentUser yerine context'ten — her zaman güvenli
  const [unlocked, setUnlocked] = useState(() => !!localStorage.getItem(ADMIN_KEY))
  const [tab,      setTab]      = useState('broadcast')
  const [title,   setTitle]   = useState('')
  const [body,    setBody]    = useState('')
  const [type,    setType]    = useState('info')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  const [history,  setHistory]  = useState([])
  const [loadingH, setLoadingH] = useState(false)

  const [users,    setUsers]    = useState([])
  const [loadingU, setLoadingU] = useState(false)
  const [userStats,setUserStats]= useState(null)

  useEffect(() => {
    if (!unlocked || !adminUid) return
    loadHistory()
    loadUsers()
  }, [unlocked, adminUid])

  const loadHistory = async () => {
    if (!adminUid) return
    setLoadingH(true)
    try {
      const q    = query(getAdminRef(adminUid), orderBy('createdAt', 'desc'), limit(30))
      const snap = await getDocs(q)
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error('loadHistory:', e)
      setHistory([])
    }
    setLoadingH(false)
  }

  const loadUsers = async () => {
    setLoadingU(true)
    try {
      const snap = await getDocs(collection(db, 'users'))
      const list = snap.docs.map(d => ({ uid: d.id, ...d.data() }))
      setUsers(list)
      setUserStats({ total: list.length, withUsername: list.filter(u => u.username).length })
    } catch { setUsers([]) }
    setLoadingU(false)
  }

  const sendBroadcast = async () => {
    if (!title.trim() || !body.trim() || !adminUid) return
    setSending(true); setSent(false)
    try {
      // Benzersiz ID oluştur
      const id  = `ann_${Date.now()}`
      const ref = getDocRef(adminUid, id)
      await setDoc(ref, {
        title:     title.trim(),
        body:      body.trim(),
        type,
        createdAt: serverTimestamp(),
        active:    true,
      })
      setSent(true)
      setTitle(''); setBody('')
      await loadHistory()
      setTimeout(() => setSent(false), 3000)
    } catch (e) {
      alert('Hata: ' + e.message)
      console.error(e)
    }
    setSending(false)
  }

  const deleteMsg = async (id) => {
    if (!adminUid || !window.confirm('Bu duyuruyu sil?')) return
    try { await deleteDoc(getDocRef(adminUid, id)) } catch (e) { alert(e.message) }
    await loadHistory()
  }

  const toggleActive = async (id, current) => {
    if (!adminUid) return
    try { await setDoc(getDocRef(adminUid, id), { active: !current }, { merge: true }) } catch (e) { alert(e.message) }
    await loadHistory()
  }

  if (!unlocked) return <AdminLock onUnlock={() => setUnlocked(true)} />

  const tabStyle = (id) => ({
    flex:1, padding:'9px 4px', border:'none', cursor:'pointer',
    fontFamily:'Bebas Neue,sans-serif', fontSize:11, letterSpacing:1.5,
    background: tab === id ? 'var(--accent)' : 'transparent',
    color: tab === id ? '#0a0a0a' : 'var(--text-muted)',
    borderRadius:6, transition:'all .15s',
  })

  return (
    <div className="page animate-fade" style={{ maxWidth:720 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:26, letterSpacing:3, color:'var(--red)' }}>ADMİN PANELİ</div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', marginTop:2 }}>
            {adminUid ? `UID: ${adminUid.slice(0,12)}...` : 'UID alınamadı'}
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem(ADMIN_KEY); setUnlocked(false) }}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'var(--text-muted)', fontFamily:'Space Mono,monospace', textDecoration:'underline' }}>
          Kilitle
        </button>
      </div>

      {/* İstatistikler */}
      {userStats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
          {[
            { label:'Toplam Kullanıcı', val: userStats.total,        icon:'👥', color:'var(--accent)' },
            { label:'Kullanıcı Adlı',  val: userStats.withUsername,  icon:'✅', color:'var(--green)'  },
            { label:'Aktif Duyuru',    val: history.filter(h=>h.active).length, icon:'📢', color:'#ff8c47' },
          ].map(({ label, val, icon, color }) => (
            <div key={label} className="card" style={{ padding:'14px', textAlign:'center' }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, color, lineHeight:1, marginBottom:2 }}>{val}</div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sekmeler */}
      <div style={{ display:'flex', gap:3, background:'var(--surface2)', borderRadius:10, padding:3, marginBottom:20 }}>
        <button style={tabStyle('broadcast')} onClick={() => setTab('broadcast')}>📢 DUYURU GÖNDER</button>
        <button style={tabStyle('history')}   onClick={() => setTab('history')}>📋 GEÇMİŞ</button>
        <button style={tabStyle('users')}     onClick={() => setTab('users')}>👥 KULLANICILAR</button>
      </div>

      {/* ── DUYURU GÖNDER ── */}
      {tab === 'broadcast' && (
        <div className="animate-fade">
          <div className="card" style={{ padding:'22px 24px', marginBottom:16 }}>
            <div className="section-title">YENİ DUYURU</div>

            <div className="form-group" style={{ marginBottom:14 }}>
              <span className="flabel">Duyuru Tipi</span>
              <div style={{ display:'flex', gap:8 }}>
                {Object.entries(TYPE_COLORS).map(([id, c]) => (
                  <div key={id} onClick={() => setType(id)} style={{
                    flex:1, padding:'8px 4px', borderRadius:8, cursor:'pointer', textAlign:'center',
                    background: type === id ? c.bg : 'var(--surface2)',
                    border: `1px solid ${type === id ? c.border : 'var(--border)'}`,
                  }}>
                    <div style={{ fontSize:16, marginBottom:2 }}>{c.icon}</div>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:8, color: type === id ? c.text : 'var(--text-muted)', textTransform:'uppercase' }}>{id}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom:12 }}>
              <span className="flabel">Başlık</span>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Duyuru başlığı..." maxLength={80} />
            </div>
            <div className="form-group" style={{ marginBottom:16 }}>
              <span className="flabel">Mesaj</span>
              <textarea value={body} onChange={e => setBody(e.target.value)}
                placeholder="Duyuru içeriği..."
                rows={4}
                style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'10px 12px', outline:'none', resize:'vertical', fontFamily:'Inter,sans-serif', lineHeight:1.6, width:'100%' }}
                onFocus={e => e.target.style.borderColor='var(--accent)'}
                onBlur={e => e.target.style.borderColor='var(--border)'}
              />
              <span style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)' }}>{body.length}/500</span>
            </div>

            {/* Önizleme */}
            {(title || body) && (
              <div style={{ marginBottom:16, background: TYPE_COLORS[type].bg, border:`1px solid ${TYPE_COLORS[type].border}`, borderRadius:10, padding:'14px 16px' }}>
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', marginBottom:6, letterSpacing:2 }}>ÖNİZLEME</div>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ fontSize:20 }}>{TYPE_COLORS[type].icon}</span>
                  <div>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, letterSpacing:2, color:TYPE_COLORS[type].text, marginBottom:4 }}>{title || 'Başlık...'}</div>
                    <div style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:'var(--text-dim)', lineHeight:1.7 }}>{body || 'Mesaj...'}</div>
                  </div>
                </div>
              </div>
            )}

            <button className="btn btn-primary" onClick={sendBroadcast}
              disabled={!title.trim() || !body.trim() || sending}
              style={{ width:'100%', padding:13, opacity:(!title.trim()||!body.trim()||sending)?.4:1 }}>
              {sending
                ? <><span className="spinner" style={{width:14,height:14,borderTopColor:'#0a0a0a',marginRight:8}}/>Gönderiliyor...</>
                : sent ? '✅ Gönderildi!' : '📢 Tüm Kullanıcılara Gönder'}
            </button>
          </div>
        </div>
      )}

      {/* ── GEÇMİŞ ── */}
      {tab === 'history' && (
        <div className="animate-fade">
          <button onClick={loadHistory} className="btn btn-ghost" style={{ marginBottom:12, fontSize:11 }}>↺ Yenile</button>
          {loadingH
            ? <div style={{ textAlign:'center', padding:'32px 0' }}><span className="spinner"/></div>
            : history.length === 0
            ? <div className="empty-state"><div className="empty-icon">📭</div><div className="empty-title">Duyuru yok</div></div>
            : history.map(msg => {
                const c = TYPE_COLORS[msg.type] || TYPE_COLORS.info
                return (
                  <div key={msg.id} className="card" style={{ padding:'16px 18px', marginBottom:10, borderColor: msg.active ? c.border : 'var(--border)', opacity: msg.active ? 1 : .5 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                          <span style={{ fontSize:16 }}>{c.icon}</span>
                          <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:1.5, color:c.text }}>{msg.title}</span>
                          <span style={{ fontFamily:'Space Mono,monospace', fontSize:8, padding:'2px 6px', borderRadius:10,
                            background: msg.active ? 'rgba(71,255,138,.1)' : 'var(--surface3)',
                            color: msg.active ? 'var(--green)' : 'var(--text-muted)',
                            border:`1px solid ${msg.active?'rgba(71,255,138,.25)':'var(--border)'}` }}>
                            {msg.active ? 'AKTİF' : 'PASİF'}
                          </span>
                        </div>
                        <div style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>{msg.body}</div>
                      </div>
                      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                        <button onClick={() => toggleActive(msg.id, msg.active)}
                          style={{ padding:'5px 10px', borderRadius:6, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text-muted)', cursor:'pointer', fontFamily:'Space Mono,monospace', fontSize:9 }}>
                          {msg.active ? 'Pasif' : 'Aktif'}
                        </button>
                        <button className="btn btn-danger" onClick={() => deleteMsg(msg.id)} style={{ fontSize:12, padding:'5px 9px' }}>✕</button>
                      </div>
                    </div>
                  </div>
                )
              })
          }
        </div>
      )}

      {/* ── KULLANICILAR ── */}
      {tab === 'users' && (
        <div className="animate-fade">
          {loadingU
            ? <div style={{ textAlign:'center', padding:'32px 0' }}><span className="spinner"/></div>
            : (
              <div className="card" style={{ overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr>
                      {['Kullanıcı Adı','E-posta','Kayıt'].map(h => (
                        <th key={h} style={{ fontFamily:'Space Mono,monospace', fontSize:8, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', padding:'10px 14px', borderBottom:'1px solid var(--border)', textAlign:'left', background:'var(--surface2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0,50).map(u => (
                      <tr key={u.uid}>
                        <td style={{ padding:'9px 14px', fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:1, borderBottom:'1px solid rgba(255,255,255,.03)', color:'var(--accent)' }}>@{u.username||'—'}</td>
                        <td style={{ padding:'9px 14px', fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)', borderBottom:'1px solid rgba(255,255,255,.03)' }}>{u.email||'—'}</td>
                        <td style={{ padding:'9px 14px', fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', borderBottom:'1px solid rgba(255,255,255,.03)' }}>
                          {u.createdAt?.seconds ? new Date(u.createdAt.seconds*1000).toLocaleDateString('tr-TR') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length > 50 && (
                  <div style={{ padding:'10px 14px', fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)', textAlign:'center' }}>
                    +{users.length-50} daha
                  </div>
                )}
              </div>
            )
          }
        </div>
      )}
    </div>
  )
}
