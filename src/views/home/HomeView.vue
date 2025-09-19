<!-- filepath: c:\Users\TMONTALVOT-local\Downloads\Tomas\home-balance\src\views\HomeView.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import MonthlyBalanceModal from '../home/modal/MonthlyBalanceModal.vue'
import { useDateStore } from '../../stores/useDateStore'
import { useUserStore } from '../../stores/useUserStore'
import { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase'

const isModalVisible = ref(false) // Variable local para controlar el modal
const amount = ref(null) // Variable para almacenar el valor de amount
const expenses = ref({}) // Almacena las sumas de importes negativos por banco
const expenseTypes = ref([]) // Variable para almacenar los tipos de gastos
const selectedExpenseType = ref('') // Variable para almacenar el tipo de gasto seleccionado
const inputAmount = ref('') // Variable para almacenar el valor del input numérico
const dateStore = useDateStore()
const userStore = useUserStore()

// Opciones de mes y año para los selectores
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
const currentYear = new Date().getFullYear()
const years = [currentYear, currentYear + 1]

// Estado local para los selectores de mes y año
const selectedMonth = ref(dateStore.month ? dateStore.month.toString().padStart(2, '0') : months[0])
const selectedYear = ref(dateStore.year ? dateStore.year : currentYear)

// Computed para mostrar la fecha seleccionada en formato MM/YYYY
const formattedDate = computed(() => {
  return `${selectedMonth.value}/${selectedYear.value}`
})

// Saber si el usuario ha cambiado la fecha respecto a la actual
const isCustomDate = computed(() => {
  return (
    parseInt(selectedMonth.value) !== dateStore.month ||
    parseInt(selectedYear.value) !== dateStore.year
  )
})

const checkMonthlyBalance = async () => {
  try {
    const q = query(
      collection(db, 'monthlyBalance'),
      where('month', '==', dateStore.month),
      where('year', '==', dateStore.year),
      where('userId', '==', userStore.user), // Filtrar por userId
    )

    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      isModalVisible.value = true // Mostrar el modal si no hay registros
    } else {
      // Obtener el valor de amount del primer documento encontrado
      querySnapshot.forEach((doc) => {
        amount.value = doc.data().amount
        calculateMonthlyBalance() // Calcular el balance mensual
      })
    }
  } catch (error) {
    console.error('Error al consultar Firestore:', error)
  }
}

// Recuperar gastos desde Firestore
const fetchExpenses = async () => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('month', '==', dateStore.month),
      where('year', '==', dateStore.year),
      where('userId', '==', userStore.user), // Filtrar por userId
    )
    const querySnapshot = await getDocs(q)
    const typeData = {}
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data()
      // Inicializar el tipo si no existe
      if (!typeData[data.type]) {
        typeData[data.type] = 0
      }
      // Sumar el importe al tipo correspondiente
      typeData[data.type] += parseFloat(data.amount)
    })
    console.log('Datos de gastos recuperados:', typeData) // Depuración: Verificar los datos recuperados
    expenses.value = typeData
  } catch (error) {
    console.error('Error al recuperar datos de los gastos desde Firestore:', error)
  }
}

// Calcula la facturación mensual
//Haz una función que dado el resultado de la facturación mensual guardada en la variable amount.value calcule de es facturación cuanto dinero queda si se aportan toda la lista de gastos en la variable expensesFarmacy.value
// y lo muestre en la pantalla
const calculateMonthlyBalance = () => {
  const totalExpenses = Object.values(expenses.value).reduce((acc, value) => acc + parseFloat(value), 0)
  const totalBalance = parseFloat(amount.value) - totalExpenses
  amount.value = totalBalance.toFixed(2) // Actualizar el valor de balance
}

const fetchExpenseTypes = async () => {
  try {
    const q = query(
      collection(db, 'expenseType'),
      where('userId', '==', userStore.user), // Filtrar por userId
      orderBy('name') // Ordenar alfabéticamente por el campo 'name'
    )
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
    // Determinar el día: si es fecha personalizada, usar 1, si no, usar el día actual
    const dayToUse = isCustomDate.value ? 1 : dateStore.day
    const expenseAmount = parseFloat(inputAmount.value)

    // Guardar el gasto en la colección 'expenses'
    await addDoc(collection(db, 'expenses'), {
      month: parseInt(selectedMonth.value),
      year: parseInt(selectedYear.value),
      day: dayToUse,
      type: selectedExpenseType.value,
      amount: expenseAmount,
      userId: userStore.user, // Guardar el userId
    })

    if (!isCustomDate.value) {
      amount.value -= expenseAmount // Actualizar el balance
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
const addUserIdToCollections = async () => {
  const collections = [
    // 'expenses',
    // 'expensesFarmacy',
    // 'monthlyBalance',
  ]

  try {
    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(db, collectionName))
      for (const document of querySnapshot.docs) {
        const docRef = doc(db, collectionName, document.id)
        await updateDoc(docRef, {
          userId: 1, // Añadir el campo userId con valor 1
        })
        console.log(`Campo userId añadido al documento ${document.id} en la colección ${collectionName}`)
      }
    }
    console.log('Todos los documentos han sido actualizados.')
  } catch (error) {
    console.error('Error al actualizar los documentos:', error)
  }
}

// Ejecutar las búsquedas al cargar la vista
onMounted(async () => {
  await fetchExpenses() // Recuperar datos de los gastos
  await fetchExpenseTypes() // Recuperar tipos de gastos
  await checkMonthlyBalance() // Recuperar la facturación mensual
})


</script>
<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow flex items-center justify-center relative">
      <!-- Mostrar la fecha en la esquina superior derecha -->
      <div
        class="absolute flex gap-2 items-center"
        style="top: 15%; right: 5%; transform: translateY(-50%);"
      >
        <select
          v-model="selectedMonth"
          @change="handleDateChange"
          class="border border-gray-300 rounded p-1"
        >
          <option v-for="month in months" :key="month" :value="month">
            {{ month }}
          </option>
        </select>
        <span>/</span>
        <select
          v-model="selectedYear"
          @change="handleDateChange"
          class="border border-gray-300 rounded p-1"
        >
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <!-- Mostrar el importe en el tercio superior -->
      <h1
        v-if="amount !== null"
        class="absolute text-3xl font-bold"
        style="top: 25%; transform: translateY(-50%);"
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