<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow flex flex-col items-center gap-8 pt-8">
      <h1 class="text-2xl font-bold">Balance Mensual</h1>

      <!-- Gráfico circular -->
      <div v-if="chartData" class="w-[90%] max-w-md">
        <DoughnutChart :chart-data="chartData" />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import DoughnutChart from '../../components/DoughnutChart.vue'
import { useDateStore } from '../../stores/useDateStore'

const chartData = ref(null) // Datos para el gráfico circular
const dateStore = useDateStore()

const fetchExpenses = async () => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('month', '==', dateStore.month),
      where('year', '==', dateStore.year)
    )

    const querySnapshot = await getDocs(q)
    const expenses = querySnapshot.docs.map((doc) => doc.data())

    // Calcular estadísticas absolutas
    const stats = {}
    expenses.forEach((expense) => {
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