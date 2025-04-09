<!-- filepath: c:\Users\TMONTALVOT-local\Downloads\Tomas\home-balance\src\views\home\BalanceView.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow flex flex-col items-center gap-8 pt-8">
      <h1 class="text-2xl font-bold">Balance Mensual</h1>

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
import FooterFarmacy from '../../components/FooterFarmacy.vue'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import DoughnutChart from '../../components/DoughnutChart.vue'
import { useDateStore } from '../../stores/useDateStore'

const chartData = ref(null) // Datos para el gráfico circular
const expenses = ref([]) // Lista de gastos
const dateStore = useDateStore()

// Computed para ordenar los gastos por fecha (del día 1 hacia arriba)
const sortedExpenses = computed(() => {
  return expenses.value.sort((a, b) => new Date(a.date) - new Date(b.date))
})

const fetchExpenses = async () => {
  try {
    const q = query(
      collection(db, 'expensesFarmacy'),
      where('month', '==', dateStore.previousMonth),
      where('year', '==', dateStore.previousYear),
      orderBy('day', 'asc') // Ordenar por fecha ascendente
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