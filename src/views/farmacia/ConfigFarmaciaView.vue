<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow flex flex-col items-center justify-center gap-4">
      <input
        v-model="newExpenseType"
        type="text"
        placeholder="Escribe un tipo de gasto"
        class="border border-gray-300 rounded p-2 w-[90%] max-w-md"
      />
      <button
        @click="addExpenseType"
        class="bg-green-500 text-white px-4 py-2 rounded w-[90%] max-w-md"
      >
        Añadir
      </button>
    </main>
    <FooterFarmacy />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../../components/Header.vue'
import FooterFarmacy from '../../components/FooterFarmacy.vue'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { useUserStore } from '../../stores/useUserStore'

const newExpenseType = ref('') // Variable para almacenar el valor del input
const userStore = useUserStore()

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

const addExpenseType = async () => {
  const formattedExpenseType = capitalizeFirstLetter(newExpenseType.value.trim()) // Formatear el texto

  if (!formattedExpenseType) {
    alert('Por favor, escribe un tipo de gasto válido.')
    return
  }

  try {
    // Verificar si el tipo de gasto ya existe en la base de datos
    const q = query(
      collection(db, 'expenseFarmacyType'),
      where('name', '==', formattedExpenseType),
      where('userId', '==', userStore.user), // Filtrar por userId
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      alert('Tipo de gasto ya existe.')
      return
    }

    // Añadir el nuevo tipo de gasto a la base de datos
    await addDoc(collection(db, 'expenseFarmacyType'), {
      name: formattedExpenseType, // Guardar el valor formateado en el campo 'name'
      userId: userStore.user, // Guardar el userId
    })

    newExpenseType.value = '' // Limpiar el input después de añadir
  } catch (error) {
    console.error('Error al añadir el tipo de gasto:', error)
    alert('Hubo un error al añadir el tipo de gasto.')
  }
}
</script>