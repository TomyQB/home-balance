import { defineStore } from 'pinia'

export const useDateStore = defineStore('date', {
  state: () => ({
    month: null, // Mes actual
    year: null, // Año actual
    day: null, // Dia actual
    farmacyMonth: null, // Mes seleccionado en la farmacia
    farmacyYear: null, // Año seleccionado en la farmacia
  }),
  actions: {
    initializeDate() {
      const now = new Date()
      this.day = now.getDate()
      this.month = now.getMonth() + 1
      this.year = now.getFullYear()
      this.farmacyMonth = this.month
      this.farmacyYear = this.year
    },
  },
})