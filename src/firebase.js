import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

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
const auth = getAuth(firebaseApp)

export { app, db, auth }

export async function signInWithGoogle() {
  const auth = getAuth()
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (error) {
    console.error('Error signing in with Google: ', error)
    throw error
  }
}