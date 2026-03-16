import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyBFFZXGw6mIbevKEfTnqMyX3UbivpQ2zFc",
  authDomain:        "kerogym-app.firebaseapp.com",
  projectId:         "kerogym-app",
  storageBucket:     "kerogym-app.firebasestorage.app",
  messagingSenderId: "716353873341",
  appId:             "1:716353873341:web:8eba15c96e1f78e02b1ed4"
}

const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)
