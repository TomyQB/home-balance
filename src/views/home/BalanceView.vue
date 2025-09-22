<!-- filepath: c:\Users\TMONTALVOT-local\Downloads\Tomas\home-balance\src\views\home\BalanceView.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow flex flex-col items-center gap-8 pt-8">
      <h1 class="text-2xl font-bold">Balance Mensual</h1>

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

      <!-- Gráfico circular -->
      <div v-if="chartData" class="w-[90%] max-w-md">
        <DoughnutChart :chart-data="chartData" />
      </div>

      <!-- Listado de gastos -->
      <div v-if="expenses.length > 0" class="w-[90%] max-w-md mt-4">
        <h2 class="text-xl font-semibold mb-2">Listado de Gastos</h2>
        <ul class="space-y-2">
          <li
            v-for="expense in sortedExpenses"
            :key="expense.id"
            class="flex justify-between items-center border-b pb-2"
          >
            <span class="text-gray-600">{{ expense.day }}-{{ expense.month }}-{{ expense.year }}</span>
            <span class="text-gray-600">{{ expense.type }}</span>
            <span class="text-gray-600">{{ expense.amount.toFixed(2) }} €</span>
          </li>
        </ul>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import DoughnutChart from '../../components/DoughnutChart.vue'
import { useDateStore } from '../../stores/useDateStore'
import { useUserStore } from '../../stores/useUserStore'

const chartData = ref(null) // Datos para el gráfico circular
const expenses = ref([]) // Lista de gastos
const dateStore = useDateStore()
const userStore = useUserStore()

// Opciones de mes y año para los selectores
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
const currentYear = new Date().getFullYear()
const years = [currentYear - 1, currentYear, currentYear + 1]

// Estado local para los selectores de mes y año
const selectedMonth = ref(dateStore.month ? dateStore.month.toString().padStart(2, '0') : months[0])
const selectedYear = ref(dateStore.year ? dateStore.year : currentYear)

// Computed para mostrar la fecha seleccionada en formato MM/YYYY
const formattedDate = computed(() => {
  return `${selectedMonth.value}/${selectedYear.value}`
})

// Computed para ordenar los gastos por fecha (del día 1 hacia arriba)
const sortedExpenses = computed(() => {
  return expenses.value.sort((a, b) => new Date(a.date) - new Date(b.date))
})

const fetchExpenses = async () => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('month', '==', parseInt(selectedMonth.value)),
      where('year', '==', parseInt(selectedYear.value)),
      where('userId', '==', userStore.user), // Filtrar por userId
      orderBy('day', 'desc') // Ordenar por fecha ascendente
    )

    const querySnapshot = await getDocs(q)
    const fetchedExpenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    expenses.value = fetchedExpenses

    // Calcular estadísticas absolutas para el gráfico
    const stats = {}
    fetchedExpenses.forEach((expense) => {
      if (!stats[expense.type]) {
        stats[expense.type] = 0
      }
      stats[expense.type] += expense.amount
    })

    // Preparar datos para el gráfico circular
    chartData.value = {
      labels: Object.keys(stats),
      datasets: [
        {
          data: Object.values(stats),
          backgroundColor: [
            '#FF6384', // Rojo
            '#36A2EB', // Azul
            '#FFCE56', // Amarillo
            '#4BC0C0', // Verde agua
            '#9966FF', // Morado
            '#FF9F40', // Naranja
            '#E6E6FA', // Lavanda
            '#8A2BE2', // Azul violeta
            '#00FA9A', // Verde menta
            '#FFD700', // Oro
            '#DC143C', // Carmesí
            '#00CED1', // Turquesa oscuro
            '#ADFF2F', // Verde amarillo
            '#FF4500', // Naranja rojizo
            '#2E8B57', // Verde marino
          ],
        },
      ],
    }
  } catch (error) {
    console.error('Error al obtener los gastos:', error)
  }
}

const handleDateChange = () => {
  fetchExpenses()
}

onMounted(() => {
  fetchExpenses()
})
</script>

<style scoped>
/* Estilo para el listado de gastos */
ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

li:last-child {
  border-bottom: none;
}
</style>