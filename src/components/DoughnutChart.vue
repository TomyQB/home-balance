<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
} from 'chart.js'

// Registrar los componentes necesarios
ChartJS.register(Title, Tooltip, Legend, ArcElement, DoughnutController)

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
})

const chartCanvas = ref(null) // Referencia al elemento <canvas>
let chartInstance = null // Instancia del gráfico
const legendItems = ref([]) // Leyenda personalizada

const renderChart = () => {
  if (!chartCanvas.value) {
    console.error('El elemento <canvas> no está disponible.')
    return
  }

  if (chartInstance) {
    chartInstance.destroy() // Destruir el gráfico anterior si existe
  }

  chartInstance = new ChartJS(chartCanvas.value.getContext('2d'), {
    type: 'doughnut',
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Ocultar la leyenda predeterminada de Chart.js
        },
      },
    },
  })

  // Crear la leyenda personalizada
  const total = props.chartData.datasets[0].data.reduce((sum, value) => sum + value, 0)
  legendItems.value = props.chartData.labels
    .map((label, index) => {
      const value = props.chartData.datasets[0].data[index]
      const percentage = ((value / total) * 100).toFixed(2)
      return {
        label,
        value,
        percentage: parseFloat(percentage), // Convertir a número para ordenar correctamente
        color: props.chartData.datasets[0].backgroundColor[index],
      }
    })
    .sort((a, b) => b.percentage - a.percentage) // Ordenar de mayor a menor porcentaje
}

onMounted(() => {
  renderChart() // Renderizar el gráfico al montar el componente
})

watch(
  () => props.chartData,
  () => {
    renderChart() // Volver a renderizar el gráfico si los datos cambian
  }
)
</script>

<template>
  <div class="chart-container">
    <!-- Gráfico de dona -->
    <canvas ref="chartCanvas"></canvas>

    <!-- Leyenda personalizada -->
    <div class="legend">
      <table class="legend-table">
        <tbody>
          <tr
            v-for="(item, index) in legendItems"
            :key="index"
            class="legend-row"
          >
            <!-- Columna 1: Color y tipo de gasto -->
            <td class="legend-cell">
              <span
                class="legend-color"
                :style="{ backgroundColor: item.color }"
              ></span>
              <span class="label-text">{{ item.label }}</span>
            </td>

            <!-- Columna 2: Importe y porcentaje -->
            <td class="legend-cell">
              <span class="value-text">
                {{ item.value.toFixed(2) }}€ -> {{ item.percentage }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%; /* Limitar el ancho máximo del contenedor */
  overflow: hidden; /* Evitar que el contenido desborde */
}

canvas {
  max-width: 300px; /* Limitar el ancho máximo del gráfico */
  max-height: 300px; /* Limitar la altura máxima del gráfico */
  width: 100%; /* Asegurar que el gráfico sea responsivo */
  height: auto;
}

.legend {
  margin-top: 16px;
  width: 100%;
  max-width: 300px; /* Limitar el ancho máximo de la leyenda */
  overflow-y: auto; /* Habilitar scroll vertical si hay demasiados elementos */
}

.legend-table {
  width: 100%;
  border-collapse: collapse; /* Eliminar bordes entre celdas */
}

.legend-row {
  vertical-align: middle; /* Alinear verticalmente los elementos */
}

.legend-cell {
  padding: 4px 8px;
  text-align: left; /* Alinear el texto a la izquierda */
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.label-text {
  font-size: 14px;
  color: #333;
}

.value-text {
  font-size: 14px;
  color: #333;
  white-space: nowrap; /* Evitar que el texto se divida en varias líneas */
}
</style>