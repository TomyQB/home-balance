import { defineStore } from 'pinia'

export const useDateStore = defineStore('date', {
  state: () => ({
    month: null, // Mes actual
    year: null, // Año actual
    previousMonth: null, // Mes anterior
    previousYear: null, // Año anterior
  }),
  actions: {
    initializeDate() {
      const now = new Date()
      this.month = now.getMonth() + 1
      this.year = now.getFullYear()

      // Calcular el mes y el año anterior
      if (this.month === 1) {
        this.previousMonth = 12
        this.previousYear = this.year - 1
      } else {
        this.previousMonth = this.month - 1
        this.previousYear = this.year
      }
    },
  },
})