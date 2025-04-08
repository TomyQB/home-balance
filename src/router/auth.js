import { getAuth, onAuthStateChanged } from 'firebase/auth'

export function requireAuth(to, from, next) {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) {
      next()
    } else {
      next({ name: 'login' }) // Redirige a la página de inicio de sesión si no está autenticado
    }
  })
}