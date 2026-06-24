import { defineStore } from 'pinia'

const emptyPatient = () => ({
  vorname: '',
  nachname: '',
  geburtsdatum: '',
  versicherungsnr: '',
  telefon: '',
  email: '',
  strasse: '',
  hausnummer: '',
  adresszusatz: '',
  plz: '',
  ort: '',
  land: 'Deutschland',
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
