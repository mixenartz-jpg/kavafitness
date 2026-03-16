# FitTrack — React + Vite

## Kurulum

### 1. Bağımlılıkları yükle
```bash
npm install
```

### 2. Geliştirme sunucusunu başlat
```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` adresine git.

### 3. Production build (Vercel/Netlify deploy için)
```bash
npm run build
```

---

## Firebase Ayarları
Firebase config `src/firebase.js` dosyasında zaten ayarlı.

Firestore kurallarını Firebase Console → Firestore → Rules'dan ayarla:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usernames/{username} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Proje Yapısı
```
src/
  firebase.js          → Firebase config
  main.jsx             → Entry point
  App.jsx              → Ana uygulama
  context/
    AppContext.jsx      → Global state (Firebase + localStorage)
  components/
    AuthScreen.jsx     → Giriş/Kayıt ekranı
    Header.jsx         → Header + haftalık takvim
    NavTabs.jsx        → Navigasyon sekmeleri
    pages/
      Today.jsx        → Egzersiz takibi
      History.jsx      → Geçmiş antrenmanlar
      Calorie.jsx      → Kalori sayacı
      GoalsProgressBody.jsx → Hedefler + Grafikler + Ölçüler
      Recognize.jsx    → Egzersiz tanıma (Gemini AI)
    ui/
      Toast.jsx        → Bildirim
  styles/
    globals.css        → Global stiller
```
