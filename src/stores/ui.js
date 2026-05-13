import { defineStore } from 'pinia'

let toastCounter = 0
let toastTimer = null

export const useUiStore = defineStore('ui', {
  state: () => ({
    toast: null,   // { id, message, variant }
    dialog: null,  // { message, title, confirmLabel, cancelLabel, resolve }
  }),
  actions: {
    showToast(message, { variant = 'success', duration = 3000 } = {}) {
      const id = ++toastCounter
      this.toast = { id, message, variant }
      if (toastTimer) {
        clearTimeout(toastTimer)
        toastTimer = null
      }
      toastTimer = setTimeout(() => {
        if (this.toast && this.toast.id === id) {
          this.toast = null
        }
      }, duration)
    },
    confirm({ message, title = 'Bestätigung', confirmLabel = 'Bestätigen', cancelLabel = 'Abbrechen' }) {
      return new Promise((resolve) => {
        this.dialog = { message, title, confirmLabel, cancelLabel, resolve }
      })
    },
    resolveDialog(answer) {
      if (this.dialog) {
        const r = this.dialog.resolve
        this.dialog = null
        r(answer)
      }
    },
  },
})
