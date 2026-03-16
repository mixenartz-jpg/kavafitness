import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const ANNOUNCEMENT_ID = 'announcement_kalem_cekilisi'
const SHOW_DAYS = 3

export default function Announcement() {
  const { uid } = useApp()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!uid) return
    const key = `${ANNOUNCEMENT_ID}_${uid}`
    const stored = localStorage.getItem(key)
    if (stored) {
      const { closedAt } = JSON.parse(stored)
      const daysPassed = (Date.now() - closedAt) / (1000 * 60 * 60 * 24)
      if (daysPassed < SHOW_DAYS) return // daha 3 gün dolmadı, gösterme
    }
    // Hiç kapatılmamış veya 3 gün geçmiş → göster
    const shownKey = `${ANNOUNCEMENT_ID}_shown_${uid}`
    const alreadyClosed = localStorage.getItem(shownKey)
    if (!alreadyClosed) setVisible(true)
  }, [uid])

  const close = () => {
    const shownKey = `${ANNOUNCEMENT_ID}_shown_${uid}`
    localStorage.setItem(shownKey, JSON.stringify({ closedAt: Date.now() }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn .3s ease',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid rgba(232,255,71,.25)',
        borderRadius: 20,
        padding: '32px 28px',
        width: 'min(460px, 100%)',
        position: 'relative',
        animation: 'slideDown .35s ease',
        boxShadow: '0 20px 60px rgba(0,0,0,.6), 0 0 40px rgba(232,255,71,.05)',
      }}>

        {/* Kapat butonu */}
        <button onClick={close} style={{
          position: 'absolute', top: 14, right: 14,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', width: 30, height: 30, borderRadius: 8,
          cursor: 'pointer', fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = '#444' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >✕</button>

        {/* Başlık */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(232,255,71,.12)', border: '1px solid rgba(232,255,71,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>📢</div>
          <div style={{
            fontFamily: 'Bebas Neue,sans-serif', fontSize: 22,
            letterSpacing: 4, color: 'var(--accent)',
          }}>DUYURU</div>
        </div>

        {/* İçerik */}
        <div style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '18px 20px',
          marginBottom: 20,
        }}>
          <p style={{
            fontSize: 14, lineHeight: 1.8,
            fontFamily: 'DM Sans,sans-serif',
            color: 'var(--text)',
            marginBottom: 16,
          }}>
            <strong style={{ color: 'var(--accent)' }}>Murat Yıldırım Hocamızdan</strong> alacağımız
            sponsorlukla <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>(inşallah)</span>{' '}
            <strong>kalem çekilişi</strong> yapacağız! 🎉
          </p>
          <p style={{
            fontSize: 13, color: 'var(--text-muted)',
            fontFamily: 'DM Mono,monospace', lineHeight: 1.6,
            borderTop: '1px solid var(--border)', paddingTop: 12,
          }}>
            Kankalarınızla paylaşmayı unutmayınız. 🙏
          </p>
        </div>

        {/* İmza */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{
            fontFamily: 'DM Mono,monospace', fontSize: 11,
            color: 'var(--text-muted)', letterSpacing: 1,
          }}>
            — <span style={{ color: 'var(--accent)' }}>Kerem Teke Baba</span>
          </div>
          <button onClick={close} className="btn btn-primary" style={{
            padding: '8px 18px', fontSize: 12,
            fontFamily: 'Bebas Neue,sans-serif', letterSpacing: 2,
          }}>
            TAMAM 👍
          </button>
        </div>

      </div>
    </div>
  )
}
