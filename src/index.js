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
 * @typedef {object} ErrorFactoryDetails
 * @property {string} code stable machine-readable code, e.g. "typanic/forced_string/wrong_type"
 * @property {string} label the label used in the error message
 * @property {unknown} value the value that failed validation
 */

/**
 * @typedef {(message: string, details: ErrorFactoryDetails) => Error} ErrorFactory
 */

/** @type {ErrorFactory | null} */
let errorFactory = null

/**
 * Installs a factory that builds the errors thrown by every typanic validator,
 * so frameworks can raise their own error classes with stable codes. Pass null
 * to restore the default TypeError behavior.
 *
 * @param {ErrorFactory | null} factory the error factory, or null to reset
 * @returns {void}
 */
export function setErrorFactory(factory) {
  errorFactory = factory === null ? null : /** @type {ErrorFactory} */ (forcedFunction(factory, "errorFactory"))
}

/**
 * Builds a validation error through the installed factory (default: TypeError).
 *
 * @param {string} message the human-readable error message
 * @param {ErrorFactoryDetails} details stable code, label, and offending value
 * @returns {Error} the error to throw
 */
function validationError(message, details) {
  if (errorFactory) return ensureError(errorFactory(message, details), "errorFactory result")

  return new TypeError(message)
}

/**
 * Converts a camelCase key to its snake_case equivalent, for param alt-keys.
 *
 * @param {string} camelKey the camelCase key
 * @returns {string} the snake_case key
 */
export function snakeCaseKey(camelKey) {
  return forcedString(camelKey, "camelKey").replace(/([a-z0-9])([A-Z])/gu, "$1_$2").toLowerCase()
}

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
    throw validationError(`Expected ${label} to be an Error but got ${describeType(value)}`, {code: "typanic/forced_error/wrong_type", label, value})
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
 * Returns a displayable message for an unknown thrown value.
 *
 * @param {unknown} value the thrown value to describe
 * @param {string} [label] name used in the fallback error message
 * @returns {string} a message string
 */
export function errorMessage(value, label = "value") {
  if (typeof value === "string") return value

  return ensureError(value, label).message
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
    throw validationError(`Expected ${label} to be a string but got ${describeType(value)}`, {code: "typanic/forced_string/wrong_type", label, value})
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
 * Returns the value when it is one of the allowed values, otherwise throws. Use
 * this for required enum-like input (config options, route/query params) instead
 * of silently accepting an unknown option.
 *
 * @template {boolean | number | string} T
 * @param {unknown} value the value to assert
 * @param {readonly T[]} allowedValues the values that are permitted
 * @param {string} [label] name used in the thrown error message
 * @returns {T} the value, narrowed to one of the allowed values
 */
export function forcedOneOf(value, allowedValues, label = "value") {
  if (allowedValues.includes(/** @type {T} */ (value))) {
    return /** @type {T} */ (value)
  }

  const allowedList = allowedValues.map((allowedValue) => describeValue(allowedValue)).join(", ")

  throw validationError(`Expected ${label} to be one of [${allowedList}] but got ${describeValue(value)}`, {code: "typanic/one_of/not_allowed", label, value})
}

/**
 * Like {@link forcedOneOf}, but allows the value to be absent (null/undefined
 * become null). A present value that is not in the allowed set still throws.
 *
 * @template {boolean | number | string} T
 * @param {unknown} value the value to assert
 * @param {readonly T[]} allowedValues the values that are permitted
 * @param {string} [label] name used in the thrown error message
 * @returns {T | null} the value, or null when absent
 */
export function optionalOneOf(value, allowedValues, label = "value") {
  if (value === null || value === undefined) return null

  return forcedOneOf(value, allowedValues, label)
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

  throw validationError(`Expected ${label} to be an integer but got ${describeType(value)}`, {code: "typanic/integer/wrong_type", label, value})
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

  throw validationError(`Expected ${label} to be an integer string but got ${describeType(value)}`, {code: "typanic/integer_from_string/invalid", label, value})
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
    throw validationError(`Expected ${label} to be a positive integer but got ${describeType(value)}`, {code: "typanic/positive_integer/invalid", label, value})
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

  throw validationError(`Expected ${label} to be a positive integer string but got ${describeType(value)}`, {code: "typanic/positive_integer_from_string/invalid", label, value})
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
 * @param {string | ParamOptions} [labelOrOptions] label string, or {label, altKeys} options
 * @returns {string} the param value
 */
export function forcedStringParam(params, key, labelOrOptions = key) {
  const {altKeys, label} = paramOptions(key, labelOrOptions)

  return forcedString(singleParamValue(params, key, label, altKeys), label)
}

/**
 * Like {@link forcedStringParam}, but allows the param to be absent.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string | ParamOptions} [labelOrOptions] label string, or {label, altKeys} options
 * @returns {string | null} the param value, or null when absent
 */
export function optionalStringParam(params, key, labelOrOptions = key) {
  const {altKeys, label} = paramOptions(key, labelOrOptions)

  return optionalString(singleParamValue(params, key, label, altKeys), label)
}

/**
 * Returns a required trimmed non-blank string from a route/query param map.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string | ParamOptions} [labelOrOptions] label string, or {label, altKeys} options
 * @returns {string} the trimmed param value
 */
export function forcedNonBlankStringParam(params, key, labelOrOptions = key) {
  const {altKeys, label} = paramOptions(key, labelOrOptions)

  return forcedNonBlankString(singleParamValue(params, key, label, altKeys), label)
}

/**
 * Like {@link forcedNonBlankStringParam}, but allows the param to be absent.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string | ParamOptions} [labelOrOptions] label string, or {label, altKeys} options
 * @returns {string | null} the trimmed param value, or null when absent
 */
export function optionalNonBlankStringParam(params, key, labelOrOptions = key) {
  const {altKeys, label} = paramOptions(key, labelOrOptions)

  return optionalNonBlankString(singleParamValue(params, key, label, altKeys), label)
}

/**
 * Returns a required positive integer from a decimal string route/query param.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string | ParamOptions} [labelOrOptions] label string, or {label, altKeys} options
 * @returns {number} the parsed positive integer
 */
export function forcedPositiveIntegerParam(params, key, labelOrOptions = key) {
  const {altKeys, label} = paramOptions(key, labelOrOptions)

  return forcedPositiveIntegerFromString(singleParamValue(params, key, label, altKeys), label)
}

/**
 * Like {@link forcedPositiveIntegerParam}, but allows the param to be absent.
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string | ParamOptions} [labelOrOptions] label string, or {label, altKeys} options
 * @returns {number | null} the parsed positive integer, or null when absent
 */
export function optionalPositiveIntegerParam(params, key, labelOrOptions = key) {
  const {altKeys, label} = paramOptions(key, labelOrOptions)

  return optionalPositiveIntegerFromString(singleParamValue(params, key, label, altKeys), label)
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
    throw validationError(`Expected ${label} to be a positive integer list but got ${describeType(value)}`, {code: "typanic/positive_integer_list/absent", label, value})
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
 * @typedef {object} ParamOptions
 * @property {string} [label] name used in the thrown error message
 * @property {string[]} [altKeys] alternative keys read when the primary key is absent
 */

/**
 * Normalizes the label-or-options third argument of the param helpers.
 *
 * @param {string} key key read from the param map
 * @param {string | ParamOptions} labelOrOptions label string or options object
 * @returns {{altKeys: string[], label: string}} normalized options
 */
function paramOptions(key, labelOrOptions) {
  if (typeof labelOrOptions === "string") return {altKeys: [], label: labelOrOptions}

  return {altKeys: labelOrOptions.altKeys ?? [], label: labelOrOptions.label ?? key}
}

/**
 * Reads a single param-map value and rejects repeated values. Alt-keys are read
 * when the primary key is absent (e.g. snake_case aliases of camelCase keys).
 *
 * @param {StringParamMap} params string-valued param map
 * @param {string} key key to read from the param map
 * @param {string} label name used in the thrown error message
 * @param {string[]} [altKeys] alternative keys read when the primary key is absent
 * @returns {string | undefined} the single param value
 */
function singleParamValue(params, key, label, altKeys = []) {
  let value = params[key]

  for (const altKey of altKeys) {
    if (value !== undefined) break

    value = params[altKey]
  }

  if (Array.isArray(value)) {
    throw validationError(`Expected ${label} to be a single value but got ${describeType(value)}`, {code: "typanic/param/repeated_value", label, value})
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
    throw validationError(`Expected ${label} to be a non-blank string but got ${describeType(value)}`, {code: "typanic/non_blank_string/blank", label, value})
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

  throw validationError(`Expected ${label} to be a number but got ${describeType(value)}`, {code: "typanic/float/invalid", label, value})
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
    throw validationError(`Expected ${label} to be a boolean but got ${describeType(value)}`, {code: "typanic/boolean/wrong_type", label, value})
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
    throw validationError(`Expected ${label} to be a function but got ${describeType(value)}`, {code: "typanic/function/wrong_type", label, value})
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

/**
 * Returns a string whose length is within the given bounds, otherwise throws.
 * The default minLength of 1 rejects empty strings.
 *
 * @param {unknown} value the value to assert
 * @param {{minLength?: number, maxLength: number}} bounds inclusive length bounds
 * @param {string} [label] name used in the thrown error message
 * @returns {string} the value, typed as a bounded string
 */
export function forcedBoundedString(value, bounds, label = "value") {
  const maxLength = forcedPositiveInteger(bounds.maxLength, "maxLength")
  const minLength = bounds.minLength ?? 1
  const stringValue = forcedString(value, label)

  if (stringValue.length < minLength) {
    const characters = minLength === 1 ? "character" : "characters"

    throw validationError(`Expected ${label} to be at least ${minLength} ${characters} but got ${stringValue.length}`, {code: "typanic/bounded_string/too_short", label, value})
  }

  if (stringValue.length > maxLength) {
    const characters = maxLength === 1 ? "character" : "characters"

    throw validationError(`Expected ${label} to be at most ${maxLength} ${characters} but got ${stringValue.length}`, {code: "typanic/bounded_string/too_long", label, value})
  }

  return stringValue
}

/**
 * Like {@link forcedBoundedString}, but allows the value to be absent
 * (null/undefined become null) and allows empty strings by default.
 *
 * @param {unknown} value the value to assert
 * @param {{minLength?: number, maxLength: number}} bounds inclusive length bounds
 * @param {string} [label] name used in the thrown error message
 * @returns {string | null} the bounded string, or null when absent
 */
export function optionalBoundedString(value, bounds, label = "value") {
  if (value === null || value === undefined) return null

  return forcedBoundedString(value, {minLength: bounds.minLength ?? 0, maxLength: bounds.maxLength}, label)
}

/**
 * Returns the value as a valid Date, otherwise throws. Date instances pass
 * through; strings and epoch numbers are parsed; invalid dates throw.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {Date} the value, typed as a valid Date
 */
export function forcedDate(value, label = "value") {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw validationError(`Expected ${label} to be a valid date but got an invalid Date`, {code: "typanic/date/invalid", label, value})
    }

    return value
  }

  if (typeof value === "string" || typeof value === "number") {
    const dateValue = new Date(value)

    if (!Number.isNaN(dateValue.getTime())) return dateValue
  }

  throw validationError(`Expected ${label} to be a valid date but got ${describeType(value)}`, {code: "typanic/date/invalid", label, value})
}

/**
 * Like {@link forcedDate}, but allows the value to be absent (null/undefined
 * become null). A present invalid value still throws.
 *
 * @param {unknown} value the value to assert
 * @param {string} [label] name used in the thrown error message
 * @returns {Date | null} the Date value, or null when absent
 */
export function optionalDate(value, label = "value") {
  if (value === null || value === undefined) return null

  return forcedDate(value, label)
}
