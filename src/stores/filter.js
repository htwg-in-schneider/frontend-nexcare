import { defineStore } from 'pinia'

export const useFilterStore = defineStore('filter', {
    state: () => ({
        searchQuery: '',
        statusFilter: '',    // '', 'Stationär', 'Ambulant'
        klinikumFilter: '',  // '' oder Klinikum-id als String
    }),
    actions: {
        reset() {
            this.searchQuery = ''
            this.statusFilter = ''
            this.klinikumFilter = ''
        },
    },
})
