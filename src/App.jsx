import { useApp } from './context/AppContext'
import AuthScreen from './components/AuthScreen'
import Header from './components/Header'
import Toast from './components/ui/Toast'
import TodayPage from './components/pages/Today'
import HistoryPage from './components/pages/History'
import CaloriePage from './components/pages/Calorie'
import { GoalsPage, ProgressPage, BodyPage } from './components/pages/GoalsProgressBody'
import RecognizePage from './components/pages/Recognize'
import HomePage from './components/pages/Home'

export default function App() {
  const { user, loading, activeTab } = useApp()

  if (loading) {
    return (
      <div style={{ position:'fixed', inset:0, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <img src="/logo.png" alt="KeroGym"
            style={{ height:90, width:'auto', marginBottom:20, animation:'pulse 1.5s ease-in-out infinite' }} />
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

  const pages = {
    home:     <HomePage />,
    today:    <TodayPage />,
    history:  <HistoryPage />,
    calorie:  <CaloriePage />,
    goals:    <GoalsPage />,
    progress: <ProgressPage />,
    body:     <BodyPage />,
    recognize:<RecognizePage />,
  }

  return (
    <>
      <Header />
      {pages[activeTab] ?? <TodayPage />}
      <Toast />
    </>
  )
}