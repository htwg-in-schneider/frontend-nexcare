import { defineStore } from 'pinia'

const emptyPatient = () => ({
  vorname: '',
  nachname: '',
  geburtsdatum: '',
  versicherungsnr: '',
  telefon: '',
  email: '',
  adresse: '',
  status: 'Stationär',
  klinikumId: null,
  etage: '',
  abteilung: '',
  station: '',
  zimmer: '',
  bett: '',
  notfallkontakt: { name: '', beziehung: '', telefon: '' },
})

/** Holds patient data across the 3-step admission wizard. */
export const useAdmissionStore = defineStore('admission', {
  state: () => ({
    patient: emptyPatient(),
  }),
  actions: {
    updatePatient(fields) {
      this.patient = { ...this.patient, ...fields }
    },
    reset() {
      this.patient = emptyPatient()
    },
  },
})
