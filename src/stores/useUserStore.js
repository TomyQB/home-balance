import { defineStore } from 'pinia'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),
  actions: {
    initializeUser() {
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {
        if (user) {
          if (user.email === 'lafarmacia47@gmail.com' || user.email === 'montialvo@gmail.com') {
            this.user = 1 // Usuario autenticado
          } else if (user.email === 'josemanuelc1b@gmail.com') {
            this.user = 2 // Usuario autenticado pero no es el administrador
          } else if (user.email === 'felipemu.rodriguez@@gmail.com') {
            this.user = 3; // Usuario autenticado pero no es el administrador
          }
          console.log('Usuario autenticado:', user.email) // Depuración: Verificar el usuario autenticado
        } else {
          this.user = null // No hay usuario autenticado
          console.log('No hay usuario autenticado.')
        }
      })
    },
  },
})