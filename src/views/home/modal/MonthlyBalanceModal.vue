<template>
    <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded shadow-lg w-80">
        <h2 class="text-lg font-bold mb-4">¿Cuánto has ganado este mes?</h2>
        <input
          v-model="amount"
          type="number"
          placeholder="Importe cobrado"
          class="border border-gray-300 rounded w-full p-2 mb-4"
        />
        <button
          @click="saveMonthlyBalance"
          class="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Aceptar
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { collection, addDoc } from 'firebase/firestore'
  import { db } from '../../../firebase'
  import { useDateStore } from '../../../stores/useDateStore'
  
  const props = defineProps({
    isVisible: Boolean, // Prop para controlar la visibilidad del modal
  })
  
  const emit = defineEmits(['close']) // Evento para cerrar el modal
  
  const amount = ref('')
  const dateStore = useDateStore()
  
  const saveMonthlyBalance = async () => {
    if (!amount.value) {
      alert('Por favor, ingresa un importe válido.')
      return
    }
  
    try {
      await addDoc(collection(db, 'monthlyBalance'), {
        month: dateStore.month,
        year: dateStore.year,
        amount: parseFloat(amount.value),
      })
      emit('close') // Emitir evento para cerrar el modal
    } catch (error) {
      console.error('Error al guardar el registro:', error)
      alert('Hubo un error al guardar el registro.')
    }
  }
  </script>
  
  <style scoped>
  /* Estilo opcional para el modal */
  </style>