import { defineStore } from 'pinia'

export const useFilterStore = defineStore('filter', {
    state: () => ({
        searchQuery: '',
    }),
    actions: {
        setSearchQuery(value) {
            this.searchQuery = value
        },
        reset() {
            this.searchQuery = ''
        }
    }
})
