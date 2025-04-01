import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const config = {
  apiKey: "AIzaSyBdsUr88GgZg1TlCB2GZFvpSuOCrulyg0I",
  authDomain: "house-balance-880d9.firebaseapp.com",
  projectId: "house-balance-880d9",
  storageBucket: "house-balance-880d9.firebasestorage.app",
  messagingSenderId: "902809182327",
  appId: "1:902809182327:web:2f7b04f017116b2516a672",
  measurementId: "G-986XDLGG4N"
}

const app = initializeApp(config)
const db = getFirestore(app)

export { app, db }