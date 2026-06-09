// @ts-check

/**
 * Describes the runtime type of a value for error messages, distinguishing the
 * two falsy "absent" values that `typeof` collapses into other buckets.
 *
 * @param {unknown} value the value to describe
 * @returns {string} a short human-readable type label
 */
function describeType(value) {
  if (value === null) return "null"
  if (value === undefined) return "undefined"

  return typeof value
}

/**
 * Returns the value when it is a string, otherwise throws. Use this for required
 * values coming from untrusted input (request bodies, webhook payloads, message
 * payloads, parsed config) instead of silently coercing a wrong type to "".
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {string} the value, typed as a string
 */
export function forcedString(value, label = "value") {
  if (typeof value !== "string") {
    throw new TypeError(`Expected ${label} to be a string but got ${describeType(value)}`)
  }

  return value
}

/**
 * Like {@link forcedString}, but allows the value to be absent (null/undefined
 * become null). A value that is present but of the wrong type still throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {string | null} the string value, or null when absent
 */
export function optionalString(value, label = "value") {
  if (value === null || value === undefined) return null

  return forcedString(value, label)
}

/**
 * Returns the value as an integer, otherwise throws. Numeric strings (route and
 * query params arrive as strings) are parsed; everything else throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {number} the value, typed as an integer
 */
export function forcedInteger(value, label = "value") {
  if (typeof value === "number" && Number.isInteger(value)) return value

  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value)

    if (Number.isInteger(parsedValue)) return parsedValue
  }

  throw new TypeError(`Expected ${label} to be an integer but got ${describeType(value)}`)
}

/**
 * Like {@link forcedInteger}, but allows the value to be absent (null/undefined
 * become null). A value that is present but not an integer still throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {number | null} the integer value, or null when absent
 */
export function optionalInteger(value, label = "value") {
  if (value === null || value === undefined) return null

  return forcedInteger(value, label)
}

/**
 * Returns the value as a finite number, otherwise throws. Numeric strings are
 * parsed; everything else (including NaN and Infinity) throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {number} the value, typed as a finite number
 */
export function forcedFloat(value, label = "value") {
  if (typeof value === "number" && Number.isFinite(value)) return value

  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value)

    if (Number.isFinite(parsedValue)) return parsedValue
  }

  throw new TypeError(`Expected ${label} to be a number but got ${describeType(value)}`)
}

/**
 * Like {@link forcedFloat}, but allows the value to be absent (null/undefined
 * become null). A value that is present but not a finite number still throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {number | null} the number value, or null when absent
 */
export function optionalFloat(value, label = "value") {
  if (value === null || value === undefined) return null

  return forcedFloat(value, label)
}

/**
 * Returns the value when it is a boolean, otherwise throws. Strings like "true"
 * are intentionally NOT coerced — pass an actual boolean.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {boolean} the value, typed as a boolean
 */
export function forcedBoolean(value, label = "value") {
  if (typeof value !== "boolean") {
    throw new TypeError(`Expected ${label} to be a boolean but got ${describeType(value)}`)
  }

  return value
}

/**
 * Like {@link forcedBoolean}, but allows the value to be absent (null/undefined
 * become null). A value that is present but not a boolean still throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {boolean | null} the boolean value, or null when absent
 */
export function optionalBoolean(value, label = "value") {
  if (value === null || value === undefined) return null

  return forcedBoolean(value, label)
}
