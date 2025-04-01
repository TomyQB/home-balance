import './assets/main.css'
import './index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'
import { app as firebaseApp } from './firebase' // Importa la instancia de Firebase App
import { useDateStore } from './stores/useDateStore'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(VueFire, {
  firebaseApp, // Usa la instancia de Firebase App aquí
  modules: [VueFireAuth],
})
app.use(createPinia())
app.use(router)

const dateStore = useDateStore()
dateStore.initializeDate()

app.mount('#app')