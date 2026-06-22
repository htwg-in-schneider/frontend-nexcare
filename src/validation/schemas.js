import * as yup from 'yup'

const TELEFON_REGEX = /^[+0-9\s() -]{1,20}$/
const EMAIL_REGEX   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isRealisticDate(v) {
  if (!v) return true
  const d = new Date(v)
  if (isNaN(d.getTime())) return false
  const now = new Date()
  if (d >= now) return false
  const age = now.getFullYear() - d.getFullYear()
  return age <= 150 && d.getFullYear() >= 1900
}

export const patientStep1Schema = yup.object({
  vorname:        yup.string().trim().required('Vorname ist erforderlich').max(100, 'Maximal 100 Zeichen'),
  nachname:       yup.string().trim().required('Nachname ist erforderlich').max(100, 'Maximal 100 Zeichen'),
  geburtsdatum:   yup.string().required('Geburtsdatum ist erforderlich')
                     .test('realistic', 'Geburtsdatum muss zwischen 1900 und heute liegen', isRealisticDate),
  versicherungsnr: yup.string().trim().required('Versicherungsnummer ist erforderlich')
                      .min(5, 'Mindestens 5 Zeichen').max(30, 'Maximal 30 Zeichen'),
  telefon:        yup.string().nullable().default('')
                     .test('telefon-format', 'Nur Ziffern, +, Leerzeichen, Klammern, Bindestrich',
                       v => !v || TELEFON_REGEX.test(v)),
  email:          yup.string().nullable().default('')
                     .test('email-format', 'Ungültige E-Mail-Adresse',
                       v => !v || EMAIL_REGEX.test(v))
                     .max(150, 'Maximal 150 Zeichen'),
  adresse:        yup.string().max(250, 'Maximal 250 Zeichen').nullable().default(''),
})

export const notfallkontaktSchema = yup.object({
  notfallName:     yup.string().max(100, 'Maximal 100 Zeichen').nullable().default(''),
  notfallBeziehung:yup.string().max(100, 'Maximal 100 Zeichen').nullable().default(''),
  notfallTelefon:  yup.string().nullable().default('')
                      .test('telefon-format', 'Nur Ziffern, +, Leerzeichen, Klammern, Bindestrich',
                        v => !v || TELEFON_REGEX.test(v)),
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
