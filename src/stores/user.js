import { defineStore } from 'pinia'
import { fetchProfile } from '@/api/profile.js'

/** Stores the authenticated user's backend profile (including role). */
export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null, // { id, name, email, adresse, role }
    loaded: false,
  }),
  getters: {
    isAdmin: (state) => state.profile?.role === 'ADMIN',
    isAuthenticated: (state) => state.profile !== null,
  },
  actions: {
    async loadProfile() {
      try {
        this.profile = await fetchProfile()
      } catch {
        this.profile = null
      } finally {
        this.loaded = true
      }
    },
    clear() {
      this.profile = null
      this.loaded = false
    },
  },
})
