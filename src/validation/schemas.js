import * as yup from 'yup'

const TELEFON_REGEX = /^[+0-9\s()\-]{0,20}$/
const EMAIL_REGEX   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const patientStep1Schema = yup.object({
  vorname:        yup.string().trim().required('Vorname ist erforderlich').max(100, 'Maximal 100 Zeichen'),
  nachname:       yup.string().trim().required('Nachname ist erforderlich').max(100, 'Maximal 100 Zeichen'),
  geburtsdatum:   yup.string().required('Geburtsdatum ist erforderlich')
                     .test('past', 'Geburtsdatum muss in der Vergangenheit liegen',
                           v => !v || new Date(v) < new Date()),
  versicherungsnr: yup.string().trim().required('Versicherungsnummer ist erforderlich')
                      .min(5, 'Mindestens 5 Zeichen').max(30, 'Maximal 30 Zeichen'),
  telefon:        yup.string().matches(TELEFON_REGEX, 'Ungültige Telefonnummer (nur +, Ziffern, Leerzeichen, Klammern, Bindestrich)').max(20, 'Maximal 20 Zeichen').nullable().default(''),
  email:          yup.string().matches(EMAIL_REGEX, 'Ungültige E-Mail-Adresse').max(150, 'Maximal 150 Zeichen').nullable().default(''),
  adresse:        yup.string().max(250, 'Maximal 250 Zeichen').nullable().default(''),
})

export const patientStep2Schema = yup.object({
  status:     yup.string().required('Status ist erforderlich'),
  klinikumId: yup.mixed().required('Klinikum ist erforderlich').test('not-empty', 'Klinikum ist erforderlich', v => v !== '' && v != null),
  etage:      yup.string().max(50, 'Maximal 50 Zeichen').nullable().default(''),
  abteilung:  yup.string().max(100, 'Maximal 100 Zeichen').nullable().default(''),
  station:    yup.string().max(100, 'Maximal 100 Zeichen').nullable().default(''),
  zimmer:     yup.string().max(20, 'Maximal 20 Zeichen').nullable().default(''),
  bett:       yup.string().max(20, 'Maximal 20 Zeichen').nullable().default(''),
})

export const klinikumSchema = yup.object({
  name: yup.string().trim().required('Name ist erforderlich').max(150, 'Maximal 150 Zeichen'),
  ort:  yup.string().trim().required('Ort ist erforderlich').max(150, 'Maximal 150 Zeichen'),
})

export const medikamentSchema = yup.object({
  name:         yup.string().trim().required('Name ist erforderlich').max(150, 'Maximal 150 Zeichen'),
  wirkstoff:    yup.string().trim().required('Wirkstoff ist erforderlich').max(150, 'Maximal 150 Zeichen'),
  beschreibung: yup.string().max(500, 'Maximal 500 Zeichen').nullable().default(''),
  dosiereinheit:yup.string().max(30, 'Maximal 30 Zeichen').nullable().default(''),
})

export const userSchema = yup.object({
  name: yup.string().trim().required('Name ist erforderlich').max(150, 'Maximal 150 Zeichen'),
  adresse: yup.string().max(250, 'Maximal 250 Zeichen').nullable().default(''),
})

export const verschreibungSchema = yup.object({
  dosierung:  yup.string().trim().required('Dosierung ist erforderlich').max(100, 'Maximal 100 Zeichen'),
  startDatum: yup.string().required('Startdatum ist erforderlich'),
  endDatum:   yup.string().required('Enddatum ist erforderlich')
                 .test('after-start', 'Enddatum muss nach oder gleich Startdatum sein',
                       function(v) { return !v || !this.parent.startDatum || v >= this.parent.startDatum }),
})
