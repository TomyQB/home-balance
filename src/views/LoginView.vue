<script setup>
import { signInWithGoogle } from '@/firebase'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'

const router = useRouter()
const auth = getAuth()

const login = async () => {
  try {
    const user = await signInWithGoogle()
    if (user.email === 'lafarmacia47@gmail.com' || user.email === 'montialvo@gmail.com') {
      // Login permitido
      console.log('Bienvenido:', user.displayName)
      router.push({ name: 'home' }) // Redirige a la página de lista de revisiones
    } else {
      // Logout forzado
      await auth.signOut()
      alert('Acceso denegado.')
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
  }
}
</script>

<template>
  <div class="login-container">
    <h1>Login</h1>
    <button @click="login">Login with Google</button>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4285f4;
  color: white;
}
</style>