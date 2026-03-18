import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'

const SEEN_KEY = 'kerogym_seen_announcements'

export default function Announcement() {
  const { uid } = useApp()
  const [announcement, setAnnouncement] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!uid) return
    fetchLatest()
  }, [uid])

  const fetchLatest = async () => {
    try {
      const q = query(
        collection(db, 'announcements'),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(1)
      )
      const snap = await getDocs(q)
      if (snap.empty) return
      const msg = { id: snap.docs[0].id, ...snap.docs[0].data() }
      const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
      if (seen.includes(msg.id)) return
      setAnnouncement(msg)
      setVisible(true)
    } catch (e) {
      console.warn('Announcement fetch:', e.message)
    }
  }

  const close = () => {
    if (!announcement) return
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, announcement.id]))
    setVisible(false)
  }

  if (!visible || !announcement) return null

  const TYPE_STYLES = {
    info:    { border:'rgba(71,200,255,.25)',  accent:'#47c8ff',       icon:'ℹ️' },
    success: { border:'rgba(71,255,138,.25)',  accent:'var(--green)',  icon:'✅' },
    warning: { border:'rgba(255,140,71,.25)',  accent:'#ff8c47',       icon:'⚠️' },
    promo:   { border:'rgba(232,255,71,.25)',  accent:'var(--accent)', icon:'🎉' },
  }
  const style = TYPE_STYLES[announcement.type] || TYPE_STYLES.info

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.75)', backdropFilter:'blur(6px)',
      zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center',
      padding:20, animation:'fadeIn .3s ease',
    }}>
      <div style={{
        background:'var(--surface)', border:`1px solid ${style.border}`,
        borderRadius:20, padding:'28px 26px', width:'min(440px,100%)',
        position:'relative', animation:'slideDown .35s ease',
        boxShadow:'0 20px 60px rgba(0,0,0,.6)',
      }}>
        <button onClick={close} style={{
          position:'absolute', top:12, right:12, background:'var(--surface2)',
          border:'1px solid var(--border)', color:'var(--text-muted)',
          width:28, height:28, borderRadius:7, cursor:'pointer', fontSize:13,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>✕</button>

        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:`${style.border}30`, border:`1px solid ${style.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{style.icon}</div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:3, color:style.accent }}>{announcement.title}</div>
        </div>

        <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 16px', marginBottom:18 }}>
          <p style={{ fontSize:13, lineHeight:1.8, fontFamily:'Inter,sans-serif', color:'var(--text)', margin:0 }}>{announcement.body}</p>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)' }}>— <span style={{ color:style.accent }}>KeroGym</span></div>
          <button onClick={close} className="btn btn-primary" style={{ padding:'8px 18px', fontSize:12, fontFamily:'Bebas Neue,sans-serif', letterSpacing:2 }}>TAMAM 👍</button>
        </div>
      </div>
    </div>
  )
}
