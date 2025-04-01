<template>
  <footer class="flex justify-between items-center border-t border-gray-300 p-4 fixed bottom-0 w-full bg-white">
    <!-- Inicio -->
    <router-link to="/" class="flex flex-col items-center justify-center w-1/3">
      <span>🏠</span>
      <span class="text-xs">Inicio</span>
    </router-link>

    <!-- Balance -->
    <router-link to="/balance" class="flex flex-col items-center justify-center w-1/3">
      <span>📊</span>
      <span class="text-xs">Balance</span>
    </router-link>

    <!-- Configuración -->
    <router-link to="/config" class="flex flex-col items-center justify-center w-1/3">
      <span>⚙️</span>
      <span class="text-xs">Configuración</span>
    </router-link>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
footer {
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distribuye los elementos entre los extremos */
}
</style>