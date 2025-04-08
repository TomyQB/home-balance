<template>
  <footer class="footer">
    <!-- Inicio -->
    <router-link to="/farmacia" class="flex flex-col items-center justify-center w-1/3">
      <span>🏠</span>
      <span class="text-xs">Inicio</span>
    </router-link>

    <!-- Balance -->
    <router-link to="/balanceFarmacia" class="flex flex-col items-center justify-center w-1/3">
      <span>📊</span>
      <span class="text-xs">Balance</span>
    </router-link>

    <!-- Configuración -->
    <router-link to="/configFarmacia" class="flex flex-col items-center justify-center w-1/3">
      <span>⚙️</span>
      <span class="text-xs">Configuración</span>
    </router-link>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.footer {
  position: fixed; /* Fija el footer en la parte inferior */
  bottom: 0;
  left: 0;
  width: 100%; /* Asegura que ocupe todo el ancho */
  background-color: white; /* Fondo blanco para que sea visible */
  border-top: 1px solid #ccc; /* Línea superior para separar el footer */
  z-index: 10; /* Asegura que esté por encima de otros elementos */
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distribuye los elementos entre los extremos */
  padding: 1rem; /* Espaciado interno */
}
</style>