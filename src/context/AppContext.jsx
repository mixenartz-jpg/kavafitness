import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, collection } from 'firebase/firestore'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const todayKey = () => new Date().toISOString().slice(0, 10)
const genId    = () => Math.random().toString(36).slice(2, 9)

// ── localStorage helpers (keyed by uid) ──
const ls = {
  get: (uid, key, fallback) => {
    try { return JSON.parse(localStorage.getItem(`${key}_${uid}`)) ?? fallback }
    catch { return fallback }
  },
  set: (uid, key, val) => localStorage.setItem(`${key}_${uid}`, JSON.stringify(val)),
}

// ── Firestore sync ──
const fbSet = (docRef, data) => setDoc(docRef, data).catch(console.error)

export function AppProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [uid,  setUid]          = useState(null)
  const [loading, setLoading]   = useState(true)

  // Exercise state
  const [exercises, setExercises]   = useState([])
  const [exDate,    setExDate]      = useState(todayKey())
  const [exArchive, setExArchive]   = useState({})

  // Calorie state
  const [foods,    setFoods]    = useState([])
  const [calDate,  setCalDate]  = useState(todayKey())
  const [calArch,  setCalArch]  = useState({})

  // Goals, body
  const [goals, setGoals] = useState({ kcal:2000, protein:150, fat:70, carb:250 })
  const [body,  setBody]  = useState([])

  // Templates
  const [templates, setTemplates] = useState([])

  // User Profile
  const [profile, setProfile] = useState(null)

  // Active tab & viewing date
  const [activeTab,   setActiveTab]   = useState('home')
  const [viewingDate, setViewingDate] = useState(todayKey())

  // Toast
  const [toast, setToast] = useState(null)
  const showToast = useCallback((msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  // ── Pull from Firestore ──
  const pullFirestore = async (userId) => {
    const get = async (docRef, fallback) => {
      const snap = await getDoc(docRef).catch(() => null)
      return snap?.exists() ? snap.data() : fallback
    }
    const userRef = doc(db, 'users', userId)
    const [d, a, c, ca, g, b] = await Promise.all([
      get(doc(userRef, 'fitdata', 'main'),       { date: todayKey(), exercises: [] }),
      get(doc(userRef, 'fitdata', 'archive'),    { data: {} }),
      get(doc(userRef, 'fitdata', 'calories'),   { date: todayKey(), foods: [] }),
      get(doc(userRef, 'fitdata', 'calArchive'), { data: {} }),
      get(doc(userRef, 'fitdata', 'goals'),      { kcal:2000, protein:150, fat:70, carb:250 }),
      get(doc(userRef, 'fitdata', 'body'),       { data: [] }),
    ])
    ls.set(userId, 'fittrack_data',        d)
    ls.set(userId, 'fittrack_archive',     a.data ?? {})
    ls.set(userId, 'fittrack_calories',    c)
    ls.set(userId, 'fittrack_cal_archive', ca.data ?? {})
    ls.set(userId, 'fittrack_goals',       g)
    ls.set(userId, 'fittrack_body',        b.data ?? [])
    const t = await get(doc(userRef, 'fitdata', 'templates'), { data: [] })
    ls.set(userId, 'fittrack_templates',   t.data ?? [])
    const p = await get(doc(userRef, 'fitdata', 'profile'), null)
    if (p) ls.set(userId, 'fittrack_profile', p)
  }

  // ── Init state from localStorage ──
  const initState = useCallback((userId) => {
    const today = todayKey()

    let exData = ls.get(userId, 'fittrack_data', { date: today, exercises: [] })
    let arch   = ls.get(userId, 'fittrack_archive', {})
    if (exData.date !== today) {
      if (exData.exercises.length > 0) arch[exData.date] = exData.exercises
      exData = { date: today, exercises: [] }
      ls.set(userId, 'fittrack_data', exData)
      ls.set(userId, 'fittrack_archive', arch)
      fbSet(doc(db, 'users', userId, 'fitdata', 'main'), exData)
      fbSet(doc(db, 'users', userId, 'fitdata', 'archive'), { data: arch })
    }
    setExercises(exData.exercises)
    setExDate(exData.date)
    setExArchive(arch)

    let calData = ls.get(userId, 'fittrack_calories', { date: today, foods: [] })
    let cArch   = ls.get(userId, 'fittrack_cal_archive', {})
    if (calData.date !== today) {
      if (calData.foods.length > 0) cArch[calData.date] = calData.foods
      calData = { date: today, foods: [] }
      ls.set(userId, 'fittrack_calories', calData)
      ls.set(userId, 'fittrack_cal_archive', cArch)
    }
    setFoods(calData.foods)
    setCalDate(calData.date)
    setCalArch(cArch)

    setGoals(ls.get(userId, 'fittrack_goals', { kcal:2000, protein:150, fat:70, carb:250 }))
    setBody(ls.get(userId, 'fittrack_body', []))
    setTemplates(ls.get(userId, 'fittrack_templates', []))
    setProfile(ls.get(userId, 'fittrack_profile', null))
  }, [])

  // ── Auth observer ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u); setUid(u.uid)
        await pullFirestore(u.uid)
        initState(u.uid)
      } else {
        setUser(null); setUid(null)
      }
      setLoading(false)
    })
    return unsub
  }, [initState])

  // ── Save helpers ──
  const saveExercises = useCallback((exs) => {
    const data = { date: todayKey(), exercises: exs }
    setExercises(exs)
    ls.set(uid, 'fittrack_data', data)
    fbSet(doc(db, 'users', uid, 'fitdata', 'main'), data)
  }, [uid])

  const saveArchive = useCallback((arch) => {
    setExArchive(arch)
    ls.set(uid, 'fittrack_archive', arch)
    fbSet(doc(db, 'users', uid, 'fitdata', 'archive'), { data: arch })
  }, [uid])

  const saveFoods = useCallback((fs) => {
    const data = { date: todayKey(), foods: fs }
    setFoods(fs)
    ls.set(uid, 'fittrack_calories', data)
    fbSet(doc(db, 'users', uid, 'fitdata', 'calories'), data)
  }, [uid])

  const saveCalArchive = useCallback((arch) => {
    setCalArch(arch)
    ls.set(uid, 'fittrack_cal_archive', arch)
    fbSet(doc(db, 'users', uid, 'fitdata', 'calArchive'), { data: arch })
  }, [uid])

  const saveGoals = useCallback((g) => {
    setGoals(g)
    ls.set(uid, 'fittrack_goals', g)
    fbSet(doc(db, 'users', uid, 'fitdata', 'goals'), g)
  }, [uid])

  const saveProfile = useCallback((p) => {
    setProfile(p)
    ls.set(uid, 'fittrack_profile', p)
    fbSet(doc(db, 'users', uid, 'fitdata', 'profile'), p)
    // Auto-update goals based on profile
    if (p?.tdee) {
      const target = p.goal === 'lose' ? p.tdee - 500 : p.goal === 'gain' ? p.tdee + 300 : p.goal === 'cut' ? p.tdee - 400 : p.tdee
      const protein = Math.round((p.weight || 75) * 2.0)
      const fat = Math.round((target * 0.25) / 9)
      const carb = Math.round((target - protein * 4 - fat * 9) / 4)
      const newGoals = { kcal: target, protein, fat, carb }
      setGoals(newGoals)
      ls.set(uid, 'fittrack_goals', newGoals)
      fbSet(doc(db, 'users', uid, 'fitdata', 'goals'), newGoals)
    }
  }, [uid])

  const saveTemplates = useCallback((t) => {
    setTemplates(t)
    ls.set(uid, 'fittrack_templates', t)
    fbSet(doc(db, 'users', uid, 'fitdata', 'templates'), { data: t })
  }, [uid])

  const saveWorkoutNote = useCallback((note) => {
    const data = ls.get(uid, 'fittrack_data', { date: todayKey(), exercises: [] })
    data.note = note
    ls.set(uid, 'fittrack_data', data)
    fbSet(doc(db, 'users', uid, 'fitdata', 'main'), data)
  }, [uid])

  const getWorkoutNote = useCallback(() => {
    const data = ls.get(uid, 'fittrack_data', { date: todayKey(), exercises: [] })
    return data.note || ''
  }, [uid])

  const saveBody = useCallback((b) => {
    setBody(b)
    ls.set(uid, 'fittrack_body', b)
    fbSet(doc(db, 'users', uid, 'fitdata', 'body'), { data: b })
  }, [uid])

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
      profile, saveProfile,
      saveWorkoutNote, getWorkoutNote,
      viewingDate, setViewingDate,
      activeTab, setActiveTab,
      showToast, toast,
      genId, todayKey,
    }}>
      {children}
    </AppContext.Provider>
  )
}
