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
  if (Array.isArray(value)) return "array"

  return typeof value
}

/**
 * @typedef {Record<string, string | string[] | undefined>} StringParamMap
 */

/**
 * Describes an unknown value for fallback error messages.
 *
 * @param {unknown} value the value to describe
 * @returns {string} a string representation of the value
 */
function describeValue(value) {
  try {
    return String(value)
  } catch {
    return "<unprintable>"
  }
}

/**
 * Returns the value when it is an Error instance, otherwise throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {Error} the value, typed as an Error
 */
export function forcedError(value, label = "value") {
  if (!(value instanceof Error)) {
    throw new TypeError(`Expected ${label} to be an Error but got ${describeType(value)}`)
  }

  return value
}

/**
 * Returns Error instances unchanged and wraps any other thrown value in an Error.
 *
 * @param {unknown} value the value to convert
 * @param {string} [label] name used in the fallback error message
 * @returns {Error} an Error instance
 */
export function ensureError(value, label = "value") {
  if (value instanceof Error) return value

  return new Error(`Expected ${label} to be an Error but got ${describeType(value)}: ${describeValue(value)}`, {cause: value})
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
 * Returns a decimal integer parsed from a string, otherwise throws. Use this
 * for form, route, or query values that must be strings before parsing.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {number} the value, parsed as a decimal integer
 */
export function forcedIntegerFromString(value, label = "value") {
  if (typeof value === "string") {
    const trimmedValue = value.trim()

    if (/^-?\d+$/.test(trimmedValue)) {
      const parsedValue = Number.parseInt(trimmedValue, 10)

      if (Number.isSafeInteger(parsedValue)) return parsedValue
    }
  }

  throw new TypeError(`Expected ${label} to be an integer string but got ${describeType(value)}`)
}

/**
 * Like {@link forcedIntegerFromString}, but allows the value to be absent
 * (null/undefined become null). A present invalid value still throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {number | null} the parsed integer value, or null when absent
 */
export function optionalIntegerFromString(value, label = "value") {
  if (value === null || value === undefined) return null

  return forcedIntegerFromString(value, label)
}

/**
 * Returns the value as a safe positive integer, otherwise throws. Numeric
 * strings are parsed; zero, negatives, decimals, and unsafe integers throw.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {number} the value, typed as a safe positive integer
 */
export function forcedPositiveInteger(value, label = "value") {
  const parsedValue = typeof value === "number" || (typeof value === "string" && value.trim() !== "")
    ? Number(value)
    : Number.NaN

  if (!Number.isSafeInteger(parsedValue) || parsedValue < 1) {
    throw new TypeError(`Expected ${label} to be a positive integer but got ${describeType(value)}`)
  }

  return parsedValue
}

/**
 * Like {@link forcedPositiveInteger}, but allows the value to be absent
 * (null/undefined become null). A present invalid value still throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {number | null} the positive integer value, or null when absent
 */
export function optionalPositiveInteger(value, label = "value") {
  if (value === null || value === undefined) return null

  return forcedPositiveInteger(value, label)
}

/**
 * Returns a safe positive decimal integer parsed from a string, otherwise throws.
 * Use this for form, route, or query values that must be strings before parsing.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {number} the value, parsed as a safe positive decimal integer
 */
export function forcedPositiveIntegerFromString(value, label = "value") {
  if (typeof value === "string") {
    const trimmedValue = value.trim()

    if (/^\d+$/.test(trimmedValue)) {
      const parsedValue = Number.parseInt(trimmedValue, 10)

      if (Number.isSafeInteger(parsedValue) && parsedValue > 0) return parsedValue
    }
  }

  throw new TypeError(`Expected ${label} to be a positive integer string but got ${describeType(value)}`)
}

/**
 * Like {@link forcedPositiveIntegerFromString}, but allows the value to be absent
 * (null/undefined become null). A present invalid value still throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {number | null} the parsed positive integer value, or null when absent
 */
export function optionalPositiveIntegerFromString(value, label = "value") {
  if (value === null || value === undefined) return null

  return forcedPositiveIntegerFromString(value, label)
}

/**
 * Returns a required single string from a route/query param map, otherwise throws.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string} [label] name used in the thrown error message
 * @returns {string} the param value
 */
export function forcedStringParam(params, key, label = key) {
  return forcedString(singleParamValue(params, key, label), label)
}

/**
 * Like {@link forcedStringParam}, but allows the param to be absent.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string} [label] name used in the thrown error message
 * @returns {string | null} the param value, or null when absent
 */
export function optionalStringParam(params, key, label = key) {
  return optionalString(singleParamValue(params, key, label), label)
}

/**
 * Returns a required trimmed non-blank string from a route/query param map.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string} [label] name used in the thrown error message
 * @returns {string} the trimmed param value
 */
export function forcedNonBlankStringParam(params, key, label = key) {
  return forcedNonBlankString(singleParamValue(params, key, label), label)
}

/**
 * Like {@link forcedNonBlankStringParam}, but allows the param to be absent.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string} [label] name used in the thrown error message
 * @returns {string | null} the trimmed param value, or null when absent
 */
export function optionalNonBlankStringParam(params, key, label = key) {
  return optionalNonBlankString(singleParamValue(params, key, label), label)
}

/**
 * Returns a required positive integer from a decimal string route/query param.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string} [label] name used in the thrown error message
 * @returns {number} the parsed positive integer
 */
export function forcedPositiveIntegerParam(params, key, label = key) {
  return forcedPositiveIntegerFromString(singleParamValue(params, key, label), label)
}

/**
 * Like {@link forcedPositiveIntegerParam}, but allows the param to be absent.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string} [label] name used in the thrown error message
 * @returns {number | null} the parsed positive integer, or null when absent
 */
export function optionalPositiveIntegerParam(params, key, label = key) {
  return optionalPositiveIntegerFromString(singleParamValue(params, key, label), label)
}

/**
 * Returns positive integer values from a scalar or array list, otherwise throws.
 *
 * @param {unknown} value scalar or array list value
 * @param {string} [label] name used in the thrown error message
 * @returns {number[]} parsed positive integer values
 */
export function forcedPositiveIntegerList(value, label = "value") {
  if (value === null || value === undefined) {
    throw new TypeError(`Expected ${label} to be a positive integer list but got ${describeType(value)}`)
  }

  return positiveIntegerListValues(value, label)
}

/**
 * Like {@link forcedPositiveIntegerList}, but allows the list to be absent.
 *
 * @param {unknown} value scalar, array, or absent list value
 * @param {string} [label] name used in the thrown error message
 * @returns {number[] | null} parsed positive integer values, or null when absent
 */
export function optionalPositiveIntegerList(value, label = "value") {
  if (value === null || value === undefined) return null

  return positiveIntegerListValues(value, label)
}

/**
 * Reads a single param-map value and rejects repeated values.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string} label name used in the thrown error message
 * @returns {string | undefined} the single param value
 */
function singleParamValue(params, key, label) {
  const value = params[key]

  if (Array.isArray(value)) {
    throw new TypeError(`Expected ${label} to be a single value but got ${describeType(value)}`)
  }

  return value
}

/**
 * Parses present scalar or array list values as positive integers.
 *
 * @param {unknown} value scalar or array list value
 * @param {string} label name used in the thrown error message
 * @returns {number[]} parsed positive integer values
 */
function positiveIntegerListValues(value, label) {
  const values = Array.isArray(value) ? value : [value]

  return values.map((item, index) => {
    const itemLabel = Array.isArray(value) ? `${label}[${index}]` : label

    return typeof item === "string"
      ? forcedPositiveIntegerFromString(item, itemLabel)
      : forcedPositiveInteger(item, itemLabel)
  })
}

/**
 * Returns a trimmed string when it has non-whitespace content, otherwise throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {string} the trimmed non-blank string
 */
export function forcedNonBlankString(value, label = "value") {
  const stringValue = forcedString(value, label).trim()

  if (!stringValue) {
    throw new TypeError(`Expected ${label} to be a non-blank string but got ${describeType(value)}`)
  }

  return stringValue
}

/**
 * Like {@link forcedNonBlankString}, but allows the value to be absent
 * (null/undefined become null). Blank strings still throw when present.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {string | null} the trimmed non-blank string, or null when absent
 */
export function optionalNonBlankString(value, label = "value") {
  if (value === null || value === undefined) return null

  return forcedNonBlankString(value, label)
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

/**
 * Returns the value when it is a function, otherwise throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {Function} the value, typed as a function
 */
export function forcedFunction(value, label = "value") {
  if (typeof value !== "function") {
    throw new TypeError(`Expected ${label} to be a function but got ${describeType(value)}`)
  }

  return value
}

/**
 * Like {@link forcedFunction}, but allows the value to be absent
 * (null/undefined become null). A value that is present but not a function
 * still throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {Function | null} the function value, or null when absent
 */
export function optionalFunction(value, label = "value") {
  if (value === null || value === undefined) return null

  return forcedFunction(value, label)
}
