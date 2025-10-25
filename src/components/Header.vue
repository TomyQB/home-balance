<template>
    <header class="header">
      <!-- Botón de Casa -->
      <router-link to="/" class="header-item">
        <span>🏠</span>
        <span class="text-sm font-semibold">Casa</span>
      </router-link>
  
          <!-- Botón de Farmacia (solo usuario 1) -->
          <router-link
            v-if="userStore.user === 1"
            to="/farmacia"
            class="header-item"
          >
            <span>➕</span>
            <span class="text-sm font-semibold">Farmacia</span>
          </router-link>
    </header>
  </template>
  
  <script setup>
  import { RouterLink } from 'vue-router'
  import { useUserStore } from '../stores/useUserStore'

  const userStore = useUserStore()
  </script>
  
  <style scoped>
  .header {
    position: fixed; /* Fija el header en la parte superior */
    top: 0;
    left: 0;
    width: 100%; /* Asegura que ocupe todo el ancho */
    background-color: white; /* Fondo blanco para que sea visible */
    border-bottom: 1px solid #ccc; /* Línea inferior para separar el header */
    z-index: 10; /* Asegura que esté por encima de otros elementos */
    display: flex;
    align-items: center;
    justify-content: space-between; /* Distribuye los elementos entre los extremos */
    padding: 1rem; /* Espaciado interno */
    box-sizing: border-box; /* Incluye el padding en el cálculo del tamaño */
  }
  
  .header-item {
    display: flex;
    flex-direction: column;
    align-items: center; /* Centra los elementos verticalmente */
    justify-content: center; /* Centra los elementos horizontalmente */
    width: 50%; /* Cada elemento ocupa la mitad del ancho del header */
    text-align: center; /* Asegura que el texto esté centrado */
  }
  </style>