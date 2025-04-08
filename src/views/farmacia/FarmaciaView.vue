<!-- filepath: c:\Users\TMONTALVOT-local\Downloads\Tomas\home-balance\src\views\farmacia\FarmaciaView.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow flex flex-col items-center justify-center relative">
      <!-- Mostrar la fecha en la esquina superior derecha -->
      <h3
        class="absolute text-xl font-semibold"
        style="top: 15%; right: 5%; transform: translateY(-50%);"
      >
        {{ formattedDate }}
      </h3>

      <!-- Mostrar el importe en el centro -->
      <h1 v-if="amount !== null" class="text-3xl font-bold">
        Facturación: {{ amount }} €
      </h1>

      <!-- Área de drag and drop -->
      <div
        class="drag-drop-area border-2 border-dashed border-gray-400 rounded p-4 mt-8"
        @dragover.prevent="handleDragOver"
        @drop.prevent="handleFileDrop"
      >
        <p class="text-gray-500">Arrastra y suelta un archivo .xls aquí</p>
        <p class="text-gray-400 text-sm">O</p>
        <button
          @click="triggerFileInput"
          class="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Seleccionar archivo
        </button>
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          accept=".xls"
          @change="handleFileSelect"
        />
      </div>

      <!-- Input numérico para añadir importe -->
      <div
        class="flex items-center w-[30%] max-w-[100px] border-b border-gray-300 mt-8"
      >
        <input
          v-model="inputAmount"
          type="number"
          placeholder="0"
          class="w-full p-1 text-right outline-none"
        />
        <span class="ml-1 text-gray-500">€</span>
      </div>

      <!-- Desplegable para seleccionar tipo de gasto -->
      <select
        v-if="expenseTypes.length > 0"
        v-model="selectedExpenseType"
        class="border border-gray-300 rounded p-1 w-[80%] max-w-md mt-4"
      >
        <option value="" disabled>Selecciona un tipo de gasto</option>
        <option v-for="type in expenseTypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>

      <!-- Botón para añadir gasto -->
      <button
        @click="addExpense"
        class="bg-green-500 text-white px-3 py-1 rounded w-[80%] max-w-md mt-4"
      >
        Añadir gasto
      </button>
    </main>
    <FooterFarmacy />
    <MonthlyFarmacyBalanceModal
      :isVisible="isModalVisible"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as XLSX from 'xlsx' // Importar la librería xlsx
import Header from '../../components/Header.vue'
import FooterFarmacy from '../../components/FooterFarmacy.vue'
import MonthlyFarmacyBalanceModal from '../farmacia/modal/MonthlyFarmacyBalanceModal.vue'
import { collection, query, where, getDocs, addDoc, updateDoc, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import { useDateStore } from '../../stores/useDateStore'

const isModalVisible = ref(false) // Controla la visibilidad del modal
const amount = ref(null) // Almacena el valor de la facturación del mes anterior
const typeSums = ref({}) // Almacena las sumas de importes negativos por banco

// Acceder al store de fechas
const dateStore = useDateStore()

// Variables para el input y el desplegable
const inputAmount = ref('') // Almacena el importe ingresado
const expenseTypes = ref([]) // Almacena los tipos de gastos
const selectedExpenseType = ref('') // Almacena el tipo de gasto seleccionado

// Archivo seleccionado
const selectedFile = ref(null)
const fileInput = ref(null) // Referencia al input de archivo

// Computed para mostrar la fecha del mes anterior en formato MM/YYYY
const formattedDate = computed(() => {
  const month = dateStore.previousMonth.toString().padStart(2, '0') // Asegura que el mes tenga dos dígitos
  return `${month}/${dateStore.previousYear}`
})

// Recuperar la facturación mensual desde Firestore
const checkMonthlyFarmacyBalance = async () => {
  try {
    const q = query(
      collection(db, 'monthlyFarmacyBalance'),
      where('month', '==', dateStore.previousMonth),
      where('year', '==', dateStore.previousYear)
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

// Recuperar datos de los bancos desde Firestore
const fetchTypeData = async () => {
  try {
    const q = query(
      collection(db, 'expensesFarmacy'),
      where('month', '==', dateStore.previousMonth),
      where('year', '==', dateStore.previousYear)
    )
    const querySnapshot = await getDocs(q)
    const typeData = {}
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data()
      typeData[data.type] = data.amount.toFixed(2)
    })

    typeSums.value = typeData
  } catch (error) {
    console.error('Error al recuperar datos de los bancos desde Firestore:', error)
  }
}

// Recuperar tipos de gastos desde Firestore
const fetchExpenseTypes = async () => {
  try {
    const q = query(collection(db, 'expenseFarmacyType'), orderBy('name')) // Ordenar alfabéticamente por el campo 'name'
    const querySnapshot = await getDocs(q)
    expenseTypes.value = querySnapshot.docs.map((doc) => doc.data().name) // Extraer los nombres
  } catch (error) {
    console.error('Error al consultar Firestore:', error)
  }
}

// Añadir un gasto
const addExpense = async () => {
  if (!selectedExpenseType.value || !inputAmount.value || parseFloat(inputAmount.value) <= 0) {
    alert('Por favor, selecciona un tipo de gasto y un importe válido.')
    return
  }

  try {
    const expenseAmount = parseFloat(inputAmount.value)

    // Guardar el gasto en la colección 'expensesFarmacy'
    await addDoc(collection(db, 'expensesFarmacy'), {
      amount: expenseAmount, // Importe del gasto
      type: selectedExpenseType.value, // Tipo de gasto seleccionado
      month: dateStore.previousMonth, // Mes actual
      year: dateStore.previousYear, // Año actual
    })

    // Actualizar el balance mensual en la colección 'monthlyFarmacyBalance'
    const q = query(
      collection(db, 'monthlyFarmacyBalance'),
      where('month', '==', dateStore.previousMonth),
      where('year', '==', dateStore.previousYear)
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

// Manejar drag and drop
const handleDragOver = (event) => {
  event.dataTransfer.dropEffect = 'copy'
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  processFile(file) // Llamar a processFile al soltar un archivo
}

// Manejar selección de archivo desde el explorador
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  processFile(file) // Llamar a processFile al seleccionar un archivo
}

// Procesar el archivo .xls
const processFile = (file) => {
  if (file && file.type === 'application/vnd.ms-excel') {
    selectedFile.value = file

    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0] // Usar la primera hoja
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet) // Convertir a JSON

      console.log('Datos leídos del archivo:', jsonData) // Depuración: Verificar los datos leídos

      // Identificar el banco
      const type = identifyType(jsonData)

      // Determinar la columna de importes
      const importeColumn =
        type === 'Sabadell'
          ? '__EMPTY_2'
          : type === 'CBNK'
          ? 'Importe'
          : type === 'Caja Mar'
          ? 'Importe'
          : null

      if (!importeColumn) {
        alert('No se encontró la columna de importes en el archivo.')
        return
      }

      // Filtrar y sumar los importes negativos
      const negativeValues = jsonData
        .map((row) => {
          const importe = row[importeColumn] // Acceder a la columna correcta
          return parseFloat(
            typeof importe === 'string'
              ? importe.replace('€', '').replace('.', '').replace(',', '.')
              : importe
          )
        })
        .filter((value) => !isNaN(value) && value < 0) // Filtrar valores negativos válidos

      // Redondear la suma a 2 decimales
      const negativeSum = Math.abs(negativeValues.reduce((sum, value) => sum + value, 0).toFixed(2))

      // Actualizar las sumas por banco
      typeSums.value = {
        ...typeSums.value,
        [type]: negativeSum,
      }

      // Guardar en Firestore si no existe
      saveTypeDataIfNotExists(type, negativeSum)

      // Actualizar la facturación en Firestore
      updateMonthlyFarmacyBalance(negativeSum)

      console.log('Suma de importes negativos por banco:', typeSums.value) // Depuración
    }
    reader.readAsArrayBuffer(file)
  } else {
    alert('Por favor, sube un archivo válido de tipo .xls.')
  }
}

// Identificar el banco según el contenido del archivo
const identifyType = (jsonData) => {
  if (jsonData[0]?.['Consulta de movimientos']) {
    return 'Sabadell'
  } else if (jsonData[0]?.['Fecha operación']) {
    return 'CBNK'
  } else if (jsonData[0]?.['Fecha']) {
    return 'Caja Mar'
  }
  return 'Desconocido'
}

// Guardar datos del banco si no existen
const saveTypeDataIfNotExists = async (type, amount) => {
  try {
    const q = query(
      collection(db, 'expensesFarmacy'),
      where('month', '==', dateStore.previousMonth),
      where('year', '==', dateStore.previousYear),
      where('type', '==', type)
    )

    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      await addDoc(collection(db, 'expensesFarmacy'), {
        month: dateStore.previousMonth,
        year: dateStore.previousYear,
        type,
        amount: parseFloat(amount),
      })
      console.log(`Datos guardados para el banco ${type}: ${amount} €`)
    } else {
      console.log(`Ya existen datos para el banco ${type} en este mes y año.`)
    }
  } catch (error) {
    console.error('Error al guardar datos del banco en Firestore:', error)
  }
}

// Actualizar la facturación en Firestore
const updateMonthlyFarmacyBalance = async (negativeSum) => {
  try {
    const q = query(
      collection(db, 'monthlyFarmacyBalance'),
      where('month', '==', dateStore.previousMonth),
      where('year', '==', dateStore.previousYear)
    )

    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (docSnapshot) => {
        const docRef = docSnapshot.ref
        const currentAmount = docSnapshot.data().amount || 0
        const updatedAmount = parseFloat(currentAmount) - parseFloat(negativeSum)

        await updateDoc(docRef, { amount: updatedAmount.toFixed(2) })
        amount.value = updatedAmount.toFixed(2)
        console.log(`Facturación actualizada: ${updatedAmount} €`)
      })
    }
  } catch (error) {
    console.error('Error al actualizar la facturación en Firestore:', error)
  }
}

const handleModalClose = () => {
  isModalVisible.value = false
  checkMonthlyFarmacyBalance() // Volver a consultar Firestore después de cerrar el modal
}

// Ejecutar las búsquedas al cargar la vista
onMounted(async () => {
  dateStore.initializeDate() // Inicializar las fechas en el store
  await checkMonthlyFarmacyBalance() // Recuperar la facturación mensual
  await fetchTypeData() // Recuperar datos de los bancos
  await fetchExpenseTypes() // Recuperar tipos de gastos
})
</script>

<style scoped>
.drag-drop-area {
  width: 80%;
  max-width: 400px;
  text-align: center;
  background-color: #f9f9f9;
  transition: background-color 0.3s ease;
}

.drag-drop-area:hover {
  background-color: #f0f0f0;
  cursor: pointer;
}
</style>