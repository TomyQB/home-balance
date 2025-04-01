import { defineStore } from 'pinia'

export const useDateStore = defineStore('date', {
  state: () => ({
    month: null,
    year: null,
  }),
  actions: {
    initializeDate() {
      const now = new Date()
      this.month = now.getMonth() + 1
      this.year = now.getFullYear()
    },
  },
})