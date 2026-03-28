import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Flame,
  Brain,
  Trophy,
  TrendingUp,
  History,
  Settings,
  ChevronDown,
  Play,
  Zap,
  Droplets
} from 'lucide-react'
import ProfileUpload from '../ProfileUpload'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useEffect } from 'react'

const GOAL_LABELS = { lose: 'Kilo Ver', gain: 'Kilo Al', cut: 'Yağ Yak', maintain: 'Koru' }

const quickActions = [
  { id: 'today', title: 'Antrenman', icon: Dumbbell, color: '#60a5fa', bgColor: 'rgba(96,165,250,0.1)' },
  { id: 'leaderboard', title: 'Lig: Sıran', icon: Trophy, color: '#eab308', bgColor: 'rgba(234,179,8,0.1)' },
  { id: 'calorie', title: 'Kalori', icon: Flame, color: '#fb923c', bgColor: 'rgba(251,146,60,0.1)' },
  { id: 'aicoach', title: 'Yapay Zeka', icon: Brain, color: '#c084fc', bgColor: 'rgba(192,132,252,0.1)' },
  { id: 'progress', title: 'İlerleme', icon: TrendingUp, color: '#4ade80', bgColor: 'rgba(74,222,128,0.1)' },
  { id: 'history', title: 'Geçmiş', icon: History, color: '#22d3ee', bgColor: 'rgba(34,211,238,0.1)' },
]

export default function HomePage() {
  const { uid, setActiveTab, streak, profile, exercises, foods, water, totalXP, getXpLevel } = useApp()
  const [isStatsExpanded, setIsStatsExpanded] = useState(false)
  const [isProfileUploadOpen, setIsProfileUploadOpen] = useState(false)
  const [userPhoto, setUserPhoto] = useState(null)

  useEffect(() => {
    if(!uid) return;
    getDoc(doc(db, 'users', uid)).then(snap => {
      if(snap.exists() && snap.data().photoURL) setUserPhoto(snap.data().photoURL)
    })
  }, [uid, isProfileUploadOpen])

  const todayKcal = Math.round(foods.reduce((s, f) => s + (+f.kcal || 0), 0))
  const todaySets = exercises.reduce((s, e) => s + e.sets.length, 0)
  const waterAmount = water || 0

  const xpInfo = getXpLevel()
  const progress = Math.min(Math.max(xpInfo.progress, 0), 100)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Günaydın'
    if (h < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }

  const nameText = profile?.name ? `, ${profile.name}` : ''

  const stats = [
    { label: 'Günlük Seri', value: `${streak} gün`, icon: Flame, color: '#ef4444' },
    { label: 'Tüketilen', value: `${todayKcal} kcal`, icon: Flame, color: '#f59e0b' },
    { label: 'Tamamlanan', value: `${todaySets} set`, icon: Dumbbell, color: '#3b82f6' },
    { label: 'İçilen Su', value: `${waterAmount} ml`, icon: Droplets, color: '#0ea5e9' },
  ]

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 24 }}
      >
        <div 
          className="card"
          style={{
            position: 'relative', overflow: 'hidden',
            padding: '36px 24px', textAlign: 'center',
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24
          }}
        >
          {/* subtle animated glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at top right, rgba(59,130,246,0.08) 0%, transparent 60%)',
            pointerEvents: 'none'
          }} />

          <div style={{ zIndex: 1 }}>
            <p style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
              Bugünün Odak Noktası
            </p>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
              <span style={{ background: 'linear-gradient(90deg, #60a5fa, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                Antrenmana Başla
              </span>
            </h1>
          </div>

          <div 
            className="btn btn-primary"
            onClick={() => setActiveTab('today')}
            style={{
              padding: '16px 36px', fontSize: 16, borderRadius: 30,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              color: '#fff', border: 'none', boxShadow: '0 8px 24px rgba(59,130,246,0.25)',
              display: 'flex', alignItems: 'center', gap: 10
            }}
          >
            <Play size={18} fill="currentColor" />
            BAŞLA
          </div>

          <div style={{
            position: 'absolute', top: 16, left: 20, right: 20,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>
              {greeting()}{nameText}
            </div>
            
            <button onClick={() => setIsProfileUploadOpen(true)} className="rounded-full ring-2 ring-cyan-500/30 hover:ring-cyan-500 transition-all cursor-pointer shadow-xl">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userPhoto || `https://api.dicebear.com/9.x/avataaars/svg?seed=${uid}&backgroundColor=18181b`} />
                <AvatarFallback>Me</AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── CHALLENGE KARTI (LİDERLİK TABLOSU) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{ marginBottom: 24 }}
        onClick={() => setActiveTab('leaderboard')}
      >
        <div className="relative overflow-hidden rounded-2xl cursor-pointer group border border-yellow-500/20 bg-zinc-900/50 p-4 transition-all hover:border-yellow-500/50 hover:shadow-[0_0_25px_rgba(234,179,8,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/20 group-hover:scale-110 transition-all">
              <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-200 text-lg uppercase tracking-wider mb-1">
                Mücadeleye Katıl
              </h3>
              <p className="text-zinc-400 text-xs text-balance">
                Bölgendeki sporcularla yarış, küme atla ve zirveye yerleş!
              </p>
            </div>
            <div className="flex-shrink-0 pr-2">
              <ChevronDown className="w-5 h-5 text-yellow-500/50 -rotate-90 group-hover:text-yellow-400 transition-colors" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── İNCE XP BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}>
            <Zap size={14} color="var(--yellow)" />
            <span>Seviye {xpInfo.level} ({xpInfo.title})</span>
          </div>
          <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: 'var(--text-dim)' }}>
            {progress}%
          </span>
        </div>
        <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 10, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #facc15, #f97316, #ec4899)',
              borderRadius: 10
            }}
          />
        </div>
      </motion.div>

      {/* ── HIZLI ERİŞİM GRID ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {quickActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.id}
                onClick={() => setActiveTab(action.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                className="card card-interactive"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '20px 8px', borderRadius: 16, gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: action.bgColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color
                }}>
                  <Icon size={22} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{action.title}</span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ── İSTATİSTİKLER (COLLAPSIBLE) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div
            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
            style={{
              padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', background: 'var(--surface2)', transition: 'background 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} color="#60a5fa" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Özet İstatistikler</h3>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Günlük verilerini incele</p>
              </div>
            </div>
            <motion.div animate={{ rotate: isStatsExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={20} color="var(--text-muted)" />
            </motion.div>
          </div>

          <AnimatePresence>
            {isStatsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
                    {stats.map((stat, idx) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        style={{ padding: '16px', borderRadius: 14, background: 'var(--surface3)', border: '1px solid var(--border)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-muted)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Space Mono,monospace' }}>
                          <stat.icon size={12} color={stat.color} />
                          {stat.label}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                          {stat.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Designer Card Hidden Here for Cleanliness */}
                  <div style={{
                    marginTop: 16, padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
                    background: 'linear-gradient(135deg, rgba(131,58,180,0.06), rgba(253,29,29,0.04))', border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, letterSpacing: 1, color: 'var(--text)' }}>
                      KavaFit v1.0 • Kerem Teke
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ProfileUpload open={isProfileUploadOpen} onOpenChange={setIsProfileUploadOpen} />
    </div>
  )
}
