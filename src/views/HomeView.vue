 <!-- Commit deploy -->
<script setup>
import { ref, onMounted } from 'vue'
import Footer from '../components/Footer.vue'
import MonthlyBalanceModal from '../views/modal/MonthlyBalanceModal.vue'
import { useDateStore } from '../stores/useDateStore'
import { collection, addDoc, query, where, getDocs, orderBy, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const isModalVisible = ref(false) // Variable local para controlar el modal
const amount = ref(null) // Variable para almacenar el valor de amount
const expenseTypes = ref([]) // Variable para almacenar los tipos de gastos
const selectedExpenseType = ref('') // Variable para almacenar el tipo de gasto seleccionado
const inputAmount = ref('') // Variable para almacenar el valor del input numérico
const dateStore = useDateStore()

const checkMonthlyBalance = async () => {
  try {
    const q = query(
      collection(db, 'monthlyBalance'),
      where('month', '==', dateStore.month),
      where('year', '==', dateStore.year)
    )

    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      isModalVisible.value = true // Mostrar el modal si no hay registros
    } else {
      // Obtener el valor de amount del primer documento encontrado
      querySnapshot.forEach((doc) => {
        amount.value = doc.data().amount
      })
    }
  } catch (error) {
    console.error('Error al consultar Firestore:', error)
  }
}

const fetchExpenseTypes = async () => {
  try {
    const q = query(collection(db, 'expenseType'), orderBy('name')) // Ordenar alfabéticamente por el campo 'name'
    const querySnapshot = await getDocs(q)
    expenseTypes.value = querySnapshot.docs.map((doc) => doc.data().name) // Extraer los nombres
  } catch (error) {
    console.error('Error al consultar Firestore:', error)
  }
}

const addExpense = async () => {
  if (!selectedExpenseType.value || !inputAmount.value || parseFloat(inputAmount.value) <= 0) {
    alert('Por favor, selecciona un tipo de gasto y un importe válido.')
    return
  }

  try {
    const expenseAmount = parseFloat(inputAmount.value)

    // Guardar el gasto en la colección 'expenses'
    await addDoc(collection(db, 'expenses'), {
      month: dateStore.month,
      year: dateStore.year,
      type: selectedExpenseType.value,
      amount: expenseAmount,
    })

    // Actualizar el balance mensual en la colección 'monthlyBalance'
    const q = query(
      collection(db, 'monthlyBalance'),
      where('month', '==', dateStore.month),
      where('year', '==', dateStore.year)
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref // Obtener la referencia del documento
      const currentAmount = querySnapshot.docs[0].data().amount
      const updatedAmount = currentAmount - expenseAmount

      await updateDoc(docRef, { amount: updatedAmount }) // Actualizar el campo 'amount'

      amount.value = updatedAmount // Actualizar el valor en la pantalla
    }

    alert('Gasto añadido correctamente.')
    inputAmount.value = '' // Limpiar el input después de añadir
    selectedExpenseType.value = '' // Limpiar el desplegable después de añadir
  } catch (error) {
    console.error('Error al añadir el gasto o actualizar el balance:', error)
    alert('Hubo un error al añadir el gasto o actualizar el balance.')
  }
}

const handleModalClose = () => {
  isModalVisible.value = false
  checkMonthlyBalance() // Volver a consultar Firestore después de cerrar el modal
}

// Ejecutar las búsquedas al cargar la vista
onMounted(() => {
  checkMonthlyBalance()
  fetchExpenseTypes()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-grow flex items-center justify-center relative">
      <!-- Mostrar el importe en el tercio superior -->
      <h1
        v-if="amount !== null"
        class="absolute text-3xl font-bold"
        style="top: 20%; transform: translateY(-50%);"
      >
        {{ amount }} €
      </h1>

      <!-- Input numérico más pequeño y centrado -->
      <div
        class="absolute flex items-center w-[30%] max-w-[100px] border-b border-gray-300"
        style="top: 40%; transform: translateY(-50%);"
      >
        <input
          v-model="inputAmount"
          type="number"
          placeholder="0"
          class="w-full p-1 text-right outline-none"
        />
        <span class="ml-1 text-gray-500">€</span>
      </div>

      <!-- Desplegable en el tercio inferior -->
      <select
        v-if="expenseTypes.length > 0"
        v-model="selectedExpenseType"
        class="absolute border border-gray-300 rounded p-1 w-[80%] max-w-md"
        style="top: 55%; transform: translateY(-50%);"
      >
        <option value="" disabled>Selecciona un tipo de gasto</option>
        <option v-for="type in expenseTypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>

      <!-- Botón para añadir gasto -->
      <button
        @click="addExpense"
        class="absolute bg-green-500 text-white px-3 py-1 rounded w-[80%] max-w-md"
        style="top: 70%; transform: translateY(-50%);"
      >
        Añadir gasto
      </button>
    </main>
    <Footer />
    <MonthlyBalanceModal
      :isVisible="isModalVisible"
      @close="handleModalClose"
    />
  </div>
</template>
