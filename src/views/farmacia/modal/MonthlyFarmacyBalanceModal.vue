<!-- filepath: c:\Users\TMONTALVOT-local\Downloads\Tomas\home-balance\src\views\farmacia\modal\MonthlyFarmacyBalanceModal.vue -->
<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
      <!-- Mensaje dinámico con farmacyMonth y farmacyYear -->
      <h2 class="text-xl font-bold mb-4">
        Introduce la facturación de {{ formattedMonth }} de {{ dateStore.farmacyYear }}
      </h2>
      <input
        v-model="monthlyAmount"
        type="number"
        placeholder="0"
        class="w-full p-2 border border-gray-300 rounded mb-4"
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
import { ref, computed } from 'vue'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import { useDateStore } from '../../../stores/useDateStore'

const props = defineProps({
  isVisible: Boolean,
})

const emit = defineEmits(['close'])

const monthlyAmount = ref('')
const dateStore = useDateStore()

// Computed para formatear el mes como texto (opcional)
const formattedMonth = computed(() => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  return monthNames[dateStore.farmacyMonth - 1] // Convertir el número del mes a texto
})

const saveMonthlyBalance = async () => {
  if (!monthlyAmount.value || parseFloat(monthlyAmount.value) <= 0) {
    alert('Por favor, introduce un importe válido.')
    return
  }

  try {
    await addDoc(collection(db, 'monthlyFarmacyBalance'), {
      month: dateStore.farmacyMonth,
      year: dateStore.farmacyYear,
      amount: parseFloat(monthlyAmount.value),
    })
    emit('close')
  } catch (error) {
    console.error('Error al guardar la facturación mensual:', error)
    alert('Hubo un error al guardar la facturación mensual.')
  }
}
</script>

<style scoped>
/* Estilos opcionales para el modal */
</style>