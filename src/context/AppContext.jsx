import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
const genId    = () => Math.random().toString(36).slice(2, 9)

const ls = {
  get: (uid, key, fallback) => {
    try { return JSON.parse(localStorage.getItem(`${key}_${uid}`)) ?? fallback }
    catch { return fallback }
  },
  set: (uid, key, val) => localStorage.setItem(`${key}_${uid}`, JSON.stringify(val)),
}
const fbSet = (ref, data) => setDoc(ref, data).catch(console.error)

// ── AI HARIÇ günlük 5 hak (Kişisel Koç bu sistemin dışında) ──
export const AI_DAILY_LIMIT = 10

// ══════════════════════════════════════════════
// ── XP SİSTEMİ ──
// ══════════════════════════════════════════════
export const XP_REWARDS = {
  SET_ADDED:        10,   // Her set ekleme
  EXERCISE_DONE:    25,   // Egzersiz tamamlama
  WORKOUT_COMPLETE: 100,  // Günlük antrenman tamamlama (1+ egzersiz)
  MACRO_75:         30,   // Kalori hedefinin %75'ine ulaşma
  MACRO_100:        75,   // Kalori hedefinin %100'üne ulaşma
  PROTEIN_GOAL:     50,   // Protein hedefi tamamlama
  WATER_GOAL:       20,   // Su hedefi tamamlama
  STREAK_BONUS:     50,   // Her 7 günlük seri
  PR_BONUS:         150,  // Kişisel rekor
  BODY_LOG:         15,   // Vücut ölçümü ekleme
}

export const XP_LEVELS = [
  { level:1,  minXP:0,     title:'Yeni Başlayan',  icon:'🌱' },
  { level:2,  minXP:200,   title:'Sporcu',          icon:'💪' },
  { level:3,  minXP:500,   title:'Azimli',          icon:'🔥' },
  { level:4,  minXP:1000,  title:'Güçlü',           icon:'⚡' },
  { level:5,  minXP:2000,  title:'Elit',            icon:'🏆' },
  { level:6,  minXP:3500,  title:'Şampiyon',        icon:'👑' },
  { level:7,  minXP:5500,  title:'Efsane',          icon:'🌟' },
  { level:8,  minXP:8000,  title:'Ölümsüz',         icon:'⚔️' },
]

export const LEAGUE_LEVELS = [
  { minXP: 0,     maxXP: 999,   name: 'Bronz Lig',        color: 'text-amber-700' },
  { minXP: 1000,  maxXP: 3499,  name: 'Gümüş Lig',      color: 'text-slate-400' },
  { minXP: 3500,  maxXP: 6999,  name: 'Altın Lig',        color: 'text-yellow-400' },
  { minXP: 7000,  maxXP: 11999, name: 'Elit Lig',         color: 'text-cyan-400' },
  { minXP: 12000, maxXP: 999999,name: 'Şampiyonluk Ligi', color: 'text-purple-500' },
]

export function getXpLevel(xp) {
  let current = XP_LEVELS[0]
  for (const l of XP_LEVELS) { if (xp >= l.minXP) current = l }
  const idx = XP_LEVELS.indexOf(current)
  const next = XP_LEVELS[idx + 1] || null
  const progress = next
    ? Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100)
    : 100

  let league = LEAGUE_LEVELS[0]
  for (const l of LEAGUE_LEVELS) { if (xp >= l.minXP && xp <= l.maxXP) league = l }

  return { ...current, next, progress, xp, league }
}

// XP ile unlocklanabilen persona'lar
export const PERSONA_UNLOCKS = {
  philosopher: { xpRequired: 500,  label:'Felsefi Koç',       icon:'🏛️' },
  drill:       { xpRequired: 1000, label:'Drill Sergeant',    icon:'🪖' },
  analytical:  { xpRequired: 2000, label:'Analitik Koç',      icon:'📊' },
}

// ══════════════════════════════════════════════
// ── ROZET SİSTEMİ ──
// ══════════════════════════════════════════════
export const BADGE_DEFINITIONS = [
  // Streak rozetleri
  { id:'streak_3',   icon:'⚡', name:'Momentum',      desc:'3 günlük seri',             check: (d) => d.streak >= 3   },
  { id:'streak_7',   icon:'🔥', name:'Yanıyor',       desc:'7 günlük seri',             check: (d) => d.streak >= 7   },
  { id:'streak_14',  icon:'💎', name:'Elmas',         desc:'14 günlük seri',            check: (d) => d.streak >= 14  },
  { id:'streak_30',  icon:'🏆', name:'İnsan Makinesi',desc:'30 günlük seri',            check: (d) => d.streak >= 30  },
  { id:'streak_60',  icon:'👑', name:'Efsane',        desc:'60 günlük seri',            check: (d) => d.streak >= 60  },
  // Ağırlık rozetleri
  { id:'lift_60',    icon:'🌱', name:'Başlangıç',     desc:'60kg kaldır',               check: (d) => d.allTimeMaxWeight >= 60  },
  { id:'lift_80',    icon:'💪', name:'Güçleniyorum',  desc:'80kg kaldır',               check: (d) => d.allTimeMaxWeight >= 80  },
  { id:'lift_100',   icon:'💯', name:'Triple Digit',  desc:'100kg kaldır',              check: (d) => d.allTimeMaxWeight >= 100 },
  { id:'lift_120',   icon:'🦁', name:'Aslan',         desc:'120kg kaldır',              check: (d) => d.allTimeMaxWeight >= 120 },
  { id:'lift_140',   icon:'🐉', name:'Ejderha',       desc:'140kg kaldır',              check: (d) => d.allTimeMaxWeight >= 140 },
  // Antrenman sayısı
  { id:'workouts_10',  icon:'🎯', name:'İlk 10',      desc:'10 antrenman tamamla',      check: (d) => d.totalWorkouts >= 10  },
  { id:'workouts_50',  icon:'🏅', name:'Elli',         desc:'50 antrenman tamamla',      check: (d) => d.totalWorkouts >= 50  },
  { id:'workouts_100', icon:'🎖️', name:'Yüzlük',      desc:'100 antrenman tamamla',     check: (d) => d.totalWorkouts >= 100 },
  // PR rozetleri
  { id:'pr_first',   icon:'🥇', name:'İlk Rekor',     desc:'İlk kişisel rekorunu kır',  check: (d) => d.totalPRs >= 1  },
  { id:'pr_10',      icon:'🏆', name:'Rekor Kırıcı',  desc:'10 kişisel rekor kır',      check: (d) => d.totalPRs >= 10 },
  // Kalori / Makro
  { id:'macro_week', icon:'🥗', name:'Beslenme Ustası',desc:'7 gün üst üste makro tamamla', check: (d) => d.macroStreakDays >= 7 },
  // XP
  { id:'xp_500',     icon:'⚡', name:'Enerjik',       desc:'500 XP kazan',              check: (d) => d.totalXP >= 500  },
  { id:'xp_2000',    icon:'🌟', name:'Yıldız',        desc:'2000 XP kazan',             check: (d) => d.totalXP >= 2000 },
  { id:'xp_5000',    icon:'🔱', name:'Tanrı Modu',    desc:'5000 XP kazan',             check: (d) => d.totalXP >= 5000 },
]

// ── Uygunsuz içerik kelime listesi ──
const BANNED = [
  'siktir','orospu','götveren','piç','amk','bok','oç','göt',
  'fuck','shit','bitch','asshole','dick','pussy','cunt',
  'öldür','öldüreceğim','bombala','terörist','sapık',
]
function hasBannedContent(text) {
  const t = text.toLowerCase()
  return BANNED.some(w => t.includes(w))
}

// ── Streak ──
function calcStreak(exercises, exArchive) {
  const today = todayKey()
  let streak = 0, cursor = new Date()
  for (let i = 0; i < 365; i++) {
    const dk  = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`
    const has = dk === today ? exercises.length > 0 : (exArchive[dk]||[]).length > 0
    if (has) streak++
    else if (i > 0) break
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// ── PR tespiti ──
function isPR(exName, newWeight, exArchive, exercises) {
  let max = 0
  Object.values(exArchive).forEach(day => {
    const f = day.find(e => e.name.toLowerCase() === exName.toLowerCase())
    if (f) f.sets.forEach(s => { if (+s.weight > max) max = +s.weight })
  })
  const t = exercises.find(e => e.name.toLowerCase() === exName.toLowerCase())
  if (t) t.sets.forEach(s => { if (+s.weight > max) max = +s.weight })
  return newWeight > max && max > 0
}

export function AppProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [uid,  setUid]        = useState(null)
  const [loading, setLoading] = useState(true)

  const [exercises, setExercises] = useState([])
  const [exArchive, setExArchive] = useState({})
  const [foods,     setFoods]     = useState([])
  const [calArch,   setCalArch]   = useState({})

  const [goals,     setGoals]     = useState({ kcal:2000, protein:150, fat:70, carb:250 })
  const [body,      setBody]      = useState([])
  const [water,     setWater]     = useState(0)
  const [templates, setTemplates] = useState([])
  const [profile,       setProfile]       = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)  // Firestore pull bitti mi?
  const [favFoods,  setFavFoods]  = useState([])

  // Tema
  const [theme, _setTheme] = useState(() => localStorage.getItem('kavafit_theme') || 'dark')
  const setTheme = useCallback((t) => {
    _setTheme(t)
    localStorage.setItem('kavafit_theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  // AI hak state: { date, used, banned }
  const [aiUsage, setAiUsage] = useState({ date:'', used:0, banned:false })

  const [activeTab,   setActiveTab]   = useState('home')
  const [viewingDate, setViewingDate] = useState(todayKey())
  const [toast,       setToast]       = useState(null)
  const [prAlert,     setPrAlert]     = useState(null)

  // ── XP & Rozet state ──
  const [totalXP,    setTotalXP]    = useState(0)
  const [earnedBadges, setEarnedBadges] = useState([])   // kazanılan rozet id'leri
  const [xpPopup,    setXpPopup]    = useState(null)     // { amount, reason }
  const [badgePopup, setBadgePopup] = useState(null)     // badge objesi

  const streak = calcStreak(exercises, exArchive)

  const showToast = useCallback((msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const sendNotif = useCallback((title, body) => {
    if (typeof Notification==='undefined' || Notification.permission!=='granted') return
    try { new Notification(title, { body, icon:'/logo.png' }) } catch(_) {}
  }, [])

  const requestNotifPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported'
    return await Notification.requestPermission()
  }, [])

  // ── AI Hak Yöneticisi ──
  // Kişisel Koç bu fonksiyonu KULLANMAZ (sınırsız)
  const checkAndUseAiCredit = useCallback((text = '') => {
    if (!uid) return false
    const today = todayKey()
    const raw   = ls.get(uid, 'ai_usage', { date:'', used:0, banned:false })
    const usage = raw.date === today ? raw : { date:today, used:0, banned:false }

    // Zaten yasaklı
    if (usage.banned) {
      showToast('🚫 Bugün AI özelliklerinden yararlanamazsın. (uygunsuz içerik)', 'error')
      return false
    }

    // Uygunsuz içerik kontrolü
    if (hasBannedContent(text)) {
      const banned = { date:today, used:AI_DAILY_LIMIT, banned:true }
      ls.set(uid, 'ai_usage', banned)
      setAiUsage(banned)
      showToast('⚠️ Uygunsuz içerik tespit edildi! Bugün AI özelliklerinden yararlanamazsın.', 'error')
      return false
    }

    // Hak bitti mi
    if (usage.used >= AI_DAILY_LIMIT) {
      showToast(`⏳ Günlük ${AI_DAILY_LIMIT} AI hakkını kullandın. Yarın tekrar dene.`, 'error')
      return false
    }

    // Hak kullan
    const updated = { ...usage, used: usage.used + 1 }
    ls.set(uid, 'ai_usage', updated)
    setAiUsage(updated)
    return true
  }, [uid, showToast])

  const aiRemaining = useCallback(() => {
    if (!uid) return AI_DAILY_LIMIT
    const today = todayKey()
    const raw   = ls.get(uid, 'ai_usage', { date:'', used:0, banned:false })
    if (raw.date !== today) return AI_DAILY_LIMIT
    if (raw.banned) return 0
    return Math.max(0, AI_DAILY_LIMIT - raw.used)
  }, [uid])

  const isAiBanned = useCallback(() => {
    if (!uid) return false
    const today = todayKey()
    const raw   = ls.get(uid, 'ai_usage', { date:'', used:0, banned:false })
    return raw.date === today && raw.banned
  }, [uid])

  // ── Firestore pull ──
  const pullFirestore = async (userId) => {
    const get = async (ref, fb) => { const s=await getDoc(ref).catch(()=>null); return s?.exists()?s.data():fb }
    const ur  = doc(db,'users',userId)
    const [d,a,c,ca,g,b] = await Promise.all([
      get(doc(ur,'fitdata','main'),       {date:todayKey(),exercises:[]}),
      get(doc(ur,'fitdata','archive'),    {data:{}}),
      get(doc(ur,'fitdata','calories'),   {date:todayKey(),foods:[]}),
      get(doc(ur,'fitdata','calArchive'), {data:{}}),
      get(doc(ur,'fitdata','goals'),      {kcal:2000,protein:150,fat:70,carb:250}),
      get(doc(ur,'fitdata','body'),       {data:[]}),
    ])
    ls.set(userId,'fittrack_data',d); ls.set(userId,'fittrack_archive',a.data??{})
    ls.set(userId,'fittrack_calories',c); ls.set(userId,'fittrack_cal_archive',ca.data??{})
    ls.set(userId,'fittrack_goals',g); ls.set(userId,'fittrack_body',b.data??[])
    const t=await get(doc(ur,'fitdata','templates'),{data:[]}); ls.set(userId,'fittrack_templates',t.data??[])
    const p=await get(doc(ur,'fitdata','profile'),null); if(p) ls.set(userId,'fittrack_profile',p)
  }

  // ── Init ──
  const initState = useCallback((userId) => {
    const today = todayKey()
    let exData=ls.get(userId,'fittrack_data',{date:today,exercises:[]}), arch=ls.get(userId,'fittrack_archive',{})
    if (exData.date !== today) {
      if (exData.exercises?.length>0) { arch[exData.date]=exData.exercises; ls.set(userId,'fittrack_archive',arch); fbSet(doc(db,'users',userId,'fitdata','archive'),{data:arch}) }
      exData={date:today,exercises:[]}; ls.set(userId,'fittrack_data',exData); fbSet(doc(db,'users',userId,'fitdata','main'),exData)
    }
    setExercises(exData.exercises); setExArchive(arch)

    let calData=ls.get(userId,'fittrack_calories',{date:today,foods:[]}), cArch=ls.get(userId,'fittrack_cal_archive',{})
    if (calData.date !== today) {
      if (calData.foods?.length>0) { cArch[calData.date]=calData.foods; ls.set(userId,'fittrack_cal_archive',cArch); fbSet(doc(db,'users',userId,'fitdata','calArchive'),{data:cArch}) }
      calData={date:today,foods:[]}; ls.set(userId,'fittrack_calories',calData); fbSet(doc(db,'users',userId,'fitdata','calories'),calData)
    }
    setFoods(calData.foods); setCalArch(cArch)

    setGoals(ls.get(userId,'fittrack_goals',{kcal:2000,protein:150,fat:70,carb:250}))
    setBody(ls.get(userId,'fittrack_body',[]))
    setTemplates(ls.get(userId,'fittrack_templates',[]))
    setProfile(ls.get(userId,'fittrack_profile',null))
    setProfileLoaded(true)  // Artık profile kesin yüklendi (null = gerçekten yok)
    setFavFoods(ls.get(userId,'fittrack_fav_foods',[]))

    const wd=ls.get(userId,'fittrack_water',{date:today,amount:0})
    setWater(wd.date===today ? wd.amount??0 : 0)
    if (wd.date!==today) ls.set(userId,'fittrack_water',{date:today,amount:0})

    // AI usage yükle
    const au=ls.get(userId,'ai_usage',{date:'',used:0,banned:false})
    setAiUsage(au.date===today ? au : {date:today,used:0,banned:false})

    // XP & Rozetleri yükle
    setTotalXP(ls.get(userId,'kavafit_xp', 0))
    setEarnedBadges(ls.get(userId,'kavafit_badges', []))
    
    // Fotoğraf kontrolü veya user dokümanı güncellemesi
    getDoc(doc(db, 'users', userId)).then(snap => {
      if(snap.exists() && snap.data().xp === undefined) {
         setDoc(doc(db, 'users', userId), { xp: ls.get(userId,'kavafit_xp', 0) }, { merge: true })
      }
    })

    const t=localStorage.getItem('kavafit_theme')||'dark'
    _setTheme(t); document.documentElement.setAttribute('data-theme',t)
  }, [])

  // ── Auth ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        if (!u.emailVerified) { setUser(null); setUid(null); setLoading(false); return }
        setUser(u); setUid(u.uid)
        await pullFirestore(u.uid)
        initState(u.uid)
        try {
          const snap=await getDoc(doc(db,'users',u.uid))
          if (snap.exists()) {
            const {email:se,username}=snap.data()
            if (se&&u.email!==se&&username) {
              await setDoc(doc(db,'users',u.uid),{email:u.email,oldEmail:null},{merge:true})
              await setDoc(doc(db,'usernames',username),{email:u.email,oldEmail:null},{merge:true})
            }
          }
        } catch(_) {}
      } else { setUser(null); setUid(null) }
      setLoading(false)
    })
    return unsub
  }, [initState])

  // Streak milestone bildirimleri
  useEffect(() => {
    if (streak>0 && [3,7,14,21,30,60,90].includes(streak))
      sendNotif(`🔥 ${streak} Günlük Seri!`,`${streak} gün üst üste antrenman yaptın!`)
  }, [streak])

  // ── Savers ──
  const saveExercises = useCallback((exs) => {
    const d={date:todayKey(),exercises:exs}; setExercises(exs)
    ls.set(uid,'fittrack_data',d); fbSet(doc(db,'users',uid,'fitdata','main'),d)
  }, [uid])

  const saveArchive = useCallback((arch) => {
    setExArchive(arch); ls.set(uid,'fittrack_archive',arch)
    fbSet(doc(db,'users',uid,'fitdata','archive'),{data:arch})
  }, [uid])

  const saveFoods = useCallback((fs) => {
    const d={date:todayKey(),foods:fs}; setFoods(fs)
    ls.set(uid,'fittrack_calories',d); fbSet(doc(db,'users',uid,'fitdata','calories'),d)
  }, [uid])

  const saveCalArchive = useCallback((arch) => {
    setCalArch(arch); ls.set(uid,'fittrack_cal_archive',arch)
    fbSet(doc(db,'users',uid,'fitdata','calArchive'),{data:arch})
  }, [uid])

  const saveGoals = useCallback((g) => {
    setGoals(g); ls.set(uid,'fittrack_goals',g); fbSet(doc(db,'users',uid,'fitdata','goals'),g)
  }, [uid])

  const saveProfile = useCallback((p) => {
    setProfile(p); ls.set(uid,'fittrack_profile',p); fbSet(doc(db,'users',uid,'fitdata','profile'),p)
    if (p?.tdee) {
      const target=p.goal==='lose'?p.tdee-500:p.goal==='gain'?p.tdee+300:p.goal==='cut'?p.tdee-400:p.tdee
      const protein=Math.round((p.weight||75)*2), fat=Math.round(target*.25/9), carb=Math.round((target-protein*4-fat*9)/4)
      const ng={kcal:target,protein,fat,carb}; setGoals(ng); ls.set(uid,'fittrack_goals',ng)
      fbSet(doc(db,'users',uid,'fitdata','goals'),ng)
    }
  }, [uid])

  const saveTemplates = useCallback((t) => {
    setTemplates(t); ls.set(uid,'fittrack_templates',t)
    fbSet(doc(db,'users',uid,'fitdata','templates'),{data:t})
  }, [uid])

  const saveWorkoutNote = useCallback((note) => {
    const d=ls.get(uid,'fittrack_data',{date:todayKey(),exercises:[]}); d.note=note
    ls.set(uid,'fittrack_data',d); fbSet(doc(db,'users',uid,'fitdata','main'),d)
  }, [uid])

  const getWorkoutNote = useCallback(() =>
    ls.get(uid,'fittrack_data',{date:todayKey(),exercises:[]}).note||'', [uid])

  const saveBody = useCallback((b) => {
    setBody(b); ls.set(uid,'fittrack_body',b); fbSet(doc(db,'users',uid,'fitdata','body'),{data:b})
  }, [uid])

  const saveWater = useCallback((amount) => {
    const today=todayKey(), val=Math.max(0,Math.min(9999,amount))
    setWater(val); ls.set(uid,'fittrack_water',{date:today,amount:val})
  }, [uid])

  const saveFavFood = useCallback((food) => {
    const cur=ls.get(uid,'fittrack_fav_foods',[])
    const exists=cur.find(f=>f.name===food.name)
    const updated=exists?cur.filter(f=>f.name!==food.name):[{...food,addedAt:Date.now()},...cur].slice(0,20)
    setFavFoods(updated); ls.set(uid,'fittrack_fav_foods',updated)
  }, [uid])

  const isFavFood = useCallback((name) => favFoods.some(f=>f.name===name), [favFoods])

  // ── XP Kazanma ve Firebase Senk ──
  const earnXP = useCallback((amount, reason = '') => {
    if (!uid) return
    setTotalXP(prev => {
      const newXP = prev + amount
      ls.set(uid, 'kavafit_xp', newXP)
      
      // Firestore'u güncelle (debounce yerine ufak bir asenkron çağrı, Leaderboard için kritik)
      setDoc(doc(db, 'users', uid), { xp: newXP }, { merge: true }).catch(console.error)

      setXpPopup({ amount, reason })
      setTimeout(() => setXpPopup(null), 2200)
      return newXP
    })
  }, [uid])

  // ── Rozet Kontrolü ──
  const checkBadges = useCallback((overrideData = {}) => {
    if (!uid) return
    const current = ls.get(uid, 'kavafit_badges', [])

    let allTimeMaxWeight = 0
    Object.values(exArchive).forEach(day =>
      day.forEach(ex => ex.sets.forEach(s => { if (+s.weight > allTimeMaxWeight) allTimeMaxWeight = +s.weight }))
    )
    exercises.forEach(ex => ex.sets.forEach(s => { if (+s.weight > allTimeMaxWeight) allTimeMaxWeight = +s.weight }))

    const totalWorkouts = Object.values(exArchive).filter(day => day.length > 0).length
      + (exercises.length > 0 ? 1 : 0)

    const currentXP = ls.get(uid, 'kavafit_xp', 0)

    const checkData = {
      streak, allTimeMaxWeight, totalWorkouts,
      totalPRs:       ls.get(uid, 'kavafit_total_prs', 0),
      macroStreakDays: ls.get(uid, 'kavafit_macro_streak', 0),
      totalXP:        currentXP,
      ...overrideData,
    }

    const newlyEarned = []
    for (const badge of BADGE_DEFINITIONS) {
      if (!current.includes(badge.id) && badge.check(checkData)) {
        newlyEarned.push(badge)
      }
    }

    if (newlyEarned.length > 0) {
      const updated = [...current, ...newlyEarned.map(b => b.id)]
      ls.set(uid, 'kavafit_badges', updated)
      setEarnedBadges(updated)
      setBadgePopup(newlyEarned[0])
      setTimeout(() => setBadgePopup(null), 4000)
      newlyEarned.forEach(() => earnXP(50, 'Rozet Kazanıldı! 🏅'))
      sendNotif('🏅 Yeni Rozet!', `${newlyEarned[0].icon} ${newlyEarned[0].name} rozeti kazandın!`)
    }
  }, [uid, streak, exArchive, exercises, earnXP, sendNotif])

  // ── PR tespiti — earnXP sonradan çağrılıyor, artık sorun yok ──
  const checkAndShowPR = useCallback((exName, newWeight) => {
    if (isPR(exName, newWeight, exArchive, exercises)) {
      setPrAlert({name:exName,weight:newWeight})
      sendNotif('🏆 Yeni Rekor!',`${exName}: ${newWeight}kg — kişisel rekor!`)
      setTimeout(()=>setPrAlert(null), 4000)
      earnXP(XP_REWARDS.PR_BONUS, 'Kişisel Rekor! 🏆')
    }
  }, [exArchive, exercises, sendNotif, earnXP])

  // ── Antrenman tamamlanınca XP ──
  const awardWorkoutXP = useCallback((exCount, setCount) => {
    if (!uid || exCount === 0) return
    earnXP(XP_REWARDS.WORKOUT_COMPLETE + setCount * XP_REWARDS.SET_ADDED, `${exCount} egzersiz tamamlandı`)
    if (streak > 0 && streak % 7 === 0) earnXP(XP_REWARDS.STREAK_BONUS, `${streak} günlük seri!`)
    checkBadges()
  }, [uid, streak, earnXP, checkBadges])

  // ── Makro tamamlanınca XP ──
  const checkMacroXP = useCallback((totals, goalData) => {
    if (!uid || !goalData) return
    const today = todayKey()
    const lastCheck = ls.get(uid, 'kavafit_macro_check', '')
    if (lastCheck === today) return
    const kcalPct = goalData.kcal > 0 ? totals.kcal / goalData.kcal : 0
    const protPct = goalData.protein > 0 ? totals.protein / goalData.protein : 0
    if (kcalPct >= 1.0) earnXP(XP_REWARDS.MACRO_100, 'Kalori hedefi tamamlandı!')
    else if (kcalPct >= 0.75) earnXP(XP_REWARDS.MACRO_75, 'Kalori hedefinin %75\'i')
    if (protPct >= 1.0) earnXP(XP_REWARDS.PROTEIN_GOAL, 'Protein hedefi tamamlandı!')
    ls.set(uid, 'kavafit_macro_check', today)
    checkBadges()
  }, [uid, earnXP, checkBadges])

  return (
    <AppContext.Provider value={{
      user, uid, loading,
      exercises, saveExercises,
      exArchive, saveArchive,
      foods, saveFoods,
      calArch, saveCalArchive,
      goals, saveGoals,
      body, saveBody,
      templates, saveTemplates,
      profile, saveProfile, profileLoaded,
      saveWorkoutNote, getWorkoutNote,
      water, saveWater,
      favFoods, saveFavFood, isFavFood,
      streak, prAlert, checkAndShowPR,
      // AI hak sistemi
      aiUsage, checkAndUseAiCredit, aiRemaining, isAiBanned, AI_DAILY_LIMIT,
      notifPermission: typeof Notification!=='undefined' ? Notification.permission : 'default',
      requestNotifPermission, sendNotif,
      theme, setTheme,
      viewingDate, setViewingDate,
      activeTab, setActiveTab,
      showToast, toast,
      genId, todayKey,
      // XP & Rozet sistemi
      totalXP, earnXP, awardWorkoutXP, checkMacroXP, checkBadges,
      earnedBadges, xpPopup, badgePopup,
      getXpLevel: () => getXpLevel(totalXP),
      PERSONA_UNLOCKS, BADGE_DEFINITIONS,
    }}>
      {children}
    </AppContext.Provider>
  )
}
