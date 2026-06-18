import { ref } from 'vue'

/**
 * Minimal form validation composable.
 * Usage:
 *   const { submitted, invalid, validate, reset } = useFormValidation()
 *   invalid('myField', !myRef.value)  → returns true when submitted && condition
 *   validate(rules)                   → marks submitted, returns true if all rules pass
 */
export function useFormValidation() {
  const submitted = ref(false)

  /** Returns true when the field should show an error border. */
  function invalid(condition) {
    return submitted.value && condition
  }

  /**
   * @param {Array<{check: boolean, msg?: string}>} rules
   * @returns {boolean} true = all valid, false = at least one rule failed
   */
  function validate(rules) {
    submitted.value = true
    return rules.every(r => !r.check)
  }

  function reset() {
    submitted.value = false
  }

  return { submitted, invalid, validate, reset }
}
