import { useApp } from './context/AppContext'
import { useState, useEffect } from 'react'
import AuthScreen from './components/AuthScreen'
import Header from './components/Header'
import Toast from './components/ui/Toast'
import TodayPage from './components/pages/Today'
import HistoryPage from './components/pages/History'
import CaloriePage from './components/pages/Calorie'
import { GoalsPage, ProgressPage, BodyPage } from './components/pages/GoalsProgressBody'
import RecognizePage from './components/pages/Recognize'
import FoodRecognizePage from './components/pages/FoodRecognize'
import HomePage from './components/pages/Home'
import AiCoachPage from './components/pages/AiCoach'
import PersonalCoachPage from './components/pages/PersonalCoach'
import ShareCard from './components/pages/ShareCard'
import DownloadPage from './components/pages/DownloadPage'
import WeeklySummaryPage from './components/pages/WeeklySummary'
import TemplatesPage from './components/pages/Templates'
import SettingsPage from './components/pages/Settings'
import AccountPage from './components/pages/AccountPage'
import Onboarding from './components/Onboarding'
import DaySummaryPage from './components/pages/DaySummary'
import BottomNav from './components/BottomNav'
import AchievementsPage from './components/pages/Achievements'

export default function App() {
  const { user, loading, activeTab, profile, uid, viewingDate, todayKey, theme, xpPopup, badgePopup } = useApp()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Tema uygula
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || 'dark')
  }, [theme])

  useEffect(() => {
    if (user && uid && profile === null) {
      const key = `onboarding_shown_${uid}`
      if (!localStorage.getItem(key)) setShowOnboarding(true)
    }
  }, [user, uid, profile])

  const handleOnboardingComplete = () => {
    localStorage.setItem(`onboarding_shown_${uid}`, '1')
    setShowOnboarding(false)
  }

  if (loading) {
    return (
      <div style={{ position:'fixed', inset:0, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <img src="/logo.png" alt="KeroGym" style={{ height:90, width:'auto', marginBottom:20, animation:'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:32, letterSpacing:4, color:'var(--accent)', marginBottom:16 }}>
            KERO<span style={{ color:'var(--text-muted)' }}>GYM</span>
          </div>
          <div className="spinner" style={{ margin:'0 auto' }} />
          <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(.96)}}`}</style>
        </div>
      </div>
    )
  }

  if (!user) return <AuthScreen />

  // Geçmiş gün kontrolü
  const isViewingPast = viewingDate !== todayKey()
  const summaryTabs   = ['today', 'calorie']
  if (isViewingPast && summaryTabs.includes(activeTab)) {
    return (
      <>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
        <Header />
        <div style={{ paddingBottom: 72 }}>
          <DaySummaryPage />
        </div>
        <BottomNav />
        <Toast />
      </>
    )
  }

  const pages = {
    home:     <HomePage />,
    today:    <TodayPage />,
    templates:<TemplatesPage />,
    aicoach:  <AiCoachPage />,
    coach:    <PersonalCoachPage />,
    share:    <ShareCard />,
    weekly:   <ProgressPage />,   // eski link desteği
    history:  <HistoryPage />,
    calorie:  <CaloriePage />,
    goals:    <GoalsPage />,
    progress: <ProgressPage />,
    body:     <BodyPage />,
    settings: <SettingsPage />,
    account:  <AccountPage />,
    recognize:<RecognizePage />,
    foodrecognize:<FoodRecognizePage />,
    achievements:<AchievementsPage />,
    download: <DownloadPage />,
  }

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <Header />
      <div style={{ paddingBottom: 72 }}>
        {pages[activeTab] ?? <TodayPage />}
      </div>
      <BottomNav />
      <Toast />

      {/* XP Popup */}
      {xpPopup && (
        <div className="xp-popup">
          <span style={{ fontSize:18 }}>⚡</span>
          <div>
            <div className="xp-popup-amount">+{xpPopup.amount} XP</div>
            {xpPopup.reason && <div className="xp-popup-label">{xpPopup.reason}</div>}
          </div>
        </div>
      )}

      {/* Rozet Popup */}
      {badgePopup && (
        <div className="badge-popup">
          <div style={{ fontSize:44, marginBottom:8 }}>{badgePopup.icon}</div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--accent)', letterSpacing:3, marginBottom:4 }}>YENİ ROZET</div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:2, marginBottom:4 }}>{badgePopup.name}</div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)' }}>{badgePopup.desc}</div>
        </div>
      )}
    </>
  )
}
