import {
  ensureError,
  errorMessage,
  forcedBoolean,
  forcedError,
  forcedFloat,
  forcedFunction,
  forcedInteger,
  forcedIntegerFromString,
  forcedNonBlankString,
  forcedNonBlankStringParam,
  forcedPositiveInteger,
  forcedPositiveIntegerFromString,
  forcedPositiveIntegerList,
  forcedPositiveIntegerParam,
  forcedString,
  forcedStringParam,
  optionalBoolean,
  optionalFloat,
  optionalFunction,
  optionalInteger,
  optionalIntegerFromString,
  optionalNonBlankString,
  optionalNonBlankStringParam,
  optionalPositiveInteger,
  optionalPositiveIntegerFromString,
  optionalPositiveIntegerList,
  optionalPositiveIntegerParam,
  optionalStringParam,
  optionalString
} from "../src/index.js"

describe("typanic", () => {
  describe("forcedError", () => {
    it("returns Error instances", () => {
      const error = new Error("boom")
      const typeError = new TypeError("bad type")

      expect(forcedError(error)).toBe(error)
      expect(forcedError(typeError)).toBe(typeError)
    })

    it("throws for non-errors, including absent values", () => {
      expect(() => forcedError("boom")).toThrowError(TypeError, "Expected value to be an Error but got string")
      expect(() => forcedError(5)).toThrowError(TypeError, "Expected value to be an Error but got number")
      expect(() => forcedError(undefined)).toThrowError(TypeError, "Expected value to be an Error but got undefined")
      expect(() => forcedError(null)).toThrowError(TypeError, "Expected value to be an Error but got null")
    })

    it("uses the label in the error message", () => {
      expect(() => forcedError("boom", "caughtValue")).toThrowError(TypeError, "Expected caughtValue to be an Error but got string")
    })
  })

  describe("ensureError", () => {
    it("returns Error instances unchanged", () => {
      const error = new Error("boom")

      expect(ensureError(error)).toBe(error)
    })

    it("converts non-errors into Error instances with the original value as the cause", () => {
      const error = ensureError("boom", "caughtValue")

      expect(error).toEqual(jasmine.any(Error))
      expect(error.message).toEqual("Expected caughtValue to be an Error but got string: boom")
      expect(error.cause).toEqual("boom")
    })

    it("converts absent and primitive thrown values without throwing", () => {
      expect(ensureError(undefined).message).toEqual("Expected value to be an Error but got undefined: undefined")
      expect(ensureError(null).message).toEqual("Expected value to be an Error but got null: null")
      expect(ensureError(5).message).toEqual("Expected value to be an Error but got number: 5")
      expect(ensureError(false).message).toEqual("Expected value to be an Error but got boolean: false")
    })
  })

  describe("errorMessage", () => {
    it("returns string thrown values unchanged", () => {
      expect(errorMessage("boom")).toEqual("boom")
    })

    it("returns Error messages", () => {
      expect(errorMessage(new Error("boom"))).toEqual("boom")
    })

    it("uses ensureError diagnostics for non-Error thrown values", () => {
      expect(errorMessage(5, "caughtValue")).toEqual("Expected caughtValue to be an Error but got number: 5")
    })
  })

  describe("forcedString", () => {
    it("returns the value when it is a string", () => {
      expect(forcedString("hello")).toEqual("hello")
      expect(forcedString("")).toEqual("")
    })

    it("throws for non-strings, including absent values", () => {
      expect(() => forcedString(5)).toThrowError(TypeError, "Expected value to be a string but got number")
      expect(() => forcedString(undefined)).toThrowError(TypeError, "Expected value to be a string but got undefined")
      expect(() => forcedString(null)).toThrowError(TypeError, "Expected value to be a string but got null")
    })

    it("uses the label in the error message", () => {
      expect(() => forcedString(5, "processName")).toThrowError(TypeError, "Expected processName to be a string but got number")
    })
  })

  describe("optionalString", () => {
    it("returns the string when present", () => {
      expect(optionalString("hi")).toEqual("hi")
    })

    it("returns null when absent", () => {
      expect(optionalString(null)).toBeNull()
      expect(optionalString(undefined)).toBeNull()
    })

    it("throws when present but wrong-typed", () => {
      expect(() => optionalString(5)).toThrowError(TypeError)
    })
  })

  describe("forcedInteger", () => {
    it("returns integer numbers", () => {
      expect(forcedInteger(42)).toEqual(42)
      expect(forcedInteger(0)).toEqual(0)
    })

    it("parses integer strings", () => {
      expect(forcedInteger("42")).toEqual(42)
    })

    it("throws for non-integers and absent values", () => {
      expect(() => forcedInteger(1.5)).toThrowError(TypeError)
      expect(() => forcedInteger("1.5")).toThrowError(TypeError)
      expect(() => forcedInteger("nope")).toThrowError(TypeError)
      expect(() => forcedInteger(null)).toThrowError(TypeError)
    })
  })

  describe("optionalInteger", () => {
    it("returns null when absent and parses otherwise", () => {
      expect(optionalInteger(undefined)).toBeNull()
      expect(optionalInteger("7")).toEqual(7)
    })

    it("throws when present but not an integer", () => {
      expect(() => optionalInteger("x")).toThrowError(TypeError)
    })
  })

  describe("forcedIntegerFromString", () => {
    it("parses decimal integer strings", () => {
      expect(forcedIntegerFromString("42")).toEqual(42)
      expect(forcedIntegerFromString(" 42 ")).toEqual(42)
      expect(forcedIntegerFromString("-7")).toEqual(-7)
      expect(forcedIntegerFromString("9007199254740991")).toEqual(Number.MAX_SAFE_INTEGER)
    })

    it("throws for non-strings and non-integer strings", () => {
      expect(() => forcedIntegerFromString(42)).toThrowError(TypeError, "Expected value to be an integer string but got number")
      expect(() => forcedIntegerFromString("1.5")).toThrowError(TypeError)
      expect(() => forcedIntegerFromString("42abc")).toThrowError(TypeError)
      expect(() => forcedIntegerFromString("0x10")).toThrowError(TypeError)
      expect(() => forcedIntegerFromString("")).toThrowError(TypeError)
      expect(() => forcedIntegerFromString(null)).toThrowError(TypeError)
    })

    it("throws for unsafe or overflowing integer strings", () => {
      expect(() => forcedIntegerFromString("9007199254740992")).toThrowError(TypeError)
      expect(() => forcedIntegerFromString("9".repeat(400))).toThrowError(TypeError)
    })

    it("uses the label in the error message", () => {
      expect(() => forcedIntegerFromString("x", "categoryNumber")).toThrowError(TypeError, "Expected categoryNumber to be an integer string but got string")
    })
  })

  describe("optionalIntegerFromString", () => {
    it("returns null when absent and parses otherwise", () => {
      expect(optionalIntegerFromString(undefined)).toBeNull()
      expect(optionalIntegerFromString(null)).toBeNull()
      expect(optionalIntegerFromString("7")).toEqual(7)
    })

    it("throws when present but not an integer string", () => {
      expect(() => optionalIntegerFromString(7)).toThrowError(TypeError)
      expect(() => optionalIntegerFromString("")).toThrowError(TypeError)
      expect(() => optionalIntegerFromString("x")).toThrowError(TypeError)
    })
  })

  describe("forcedPositiveInteger", () => {
    it("returns positive integer numbers and parses integer strings", () => {
      expect(forcedPositiveInteger(1)).toEqual(1)
      expect(forcedPositiveInteger("42")).toEqual(42)
    })

    it("throws for zero, negatives, non-integers, and absent values", () => {
      expect(() => forcedPositiveInteger(0)).toThrowError(TypeError, "Expected value to be a positive integer but got number")
      expect(() => forcedPositiveInteger("-1")).toThrowError(TypeError)
      expect(() => forcedPositiveInteger(1.5)).toThrowError(TypeError)
      expect(() => forcedPositiveInteger(null)).toThrowError(TypeError)
    })

    it("uses the label in the error message", () => {
      expect(() => forcedPositiveInteger("x", "rowNumber")).toThrowError(TypeError, "Expected rowNumber to be a positive integer but got string")
    })
  })

  describe("optionalPositiveInteger", () => {
    it("returns null when absent and parses otherwise", () => {
      expect(optionalPositiveInteger(undefined)).toBeNull()
      expect(optionalPositiveInteger(null)).toBeNull()
      expect(optionalPositiveInteger("7")).toEqual(7)
    })

    it("throws when present but not a positive integer", () => {
      expect(() => optionalPositiveInteger(0)).toThrowError(TypeError)
      expect(() => optionalPositiveInteger("x")).toThrowError(TypeError)
    })
  })

  describe("forcedPositiveIntegerFromString", () => {
    it("parses positive decimal integer strings", () => {
      expect(forcedPositiveIntegerFromString("1")).toEqual(1)
      expect(forcedPositiveIntegerFromString(" 42 ")).toEqual(42)
      expect(forcedPositiveIntegerFromString("9007199254740991")).toEqual(Number.MAX_SAFE_INTEGER)
    })

    it("throws for non-strings, zero, negatives, decimals, and unsafe integers", () => {
      expect(() => forcedPositiveIntegerFromString(1)).toThrowError(TypeError, "Expected value to be a positive integer string but got number")
      expect(() => forcedPositiveIntegerFromString("0")).toThrowError(TypeError)
      expect(() => forcedPositiveIntegerFromString("-1")).toThrowError(TypeError)
      expect(() => forcedPositiveIntegerFromString("1.5")).toThrowError(TypeError)
      expect(() => forcedPositiveIntegerFromString("9007199254740992")).toThrowError(TypeError)
    })
  })

  describe("optionalPositiveIntegerFromString", () => {
    it("returns null when absent and parses otherwise", () => {
      expect(optionalPositiveIntegerFromString(undefined)).toBeNull()
      expect(optionalPositiveIntegerFromString(null)).toBeNull()
      expect(optionalPositiveIntegerFromString("7")).toEqual(7)
    })

    it("throws when present but not a positive integer string", () => {
      expect(() => optionalPositiveIntegerFromString(7)).toThrowError(TypeError)
      expect(() => optionalPositiveIntegerFromString("0")).toThrowError(TypeError)
      expect(() => optionalPositiveIntegerFromString("x")).toThrowError(TypeError)
    })
  })

  describe("forcedNonBlankString", () => {
    it("returns trimmed non-blank strings", () => {
      expect(forcedNonBlankString("hello")).toEqual("hello")
      expect(forcedNonBlankString(" hello ")).toEqual("hello")
    })

    it("throws for blank strings, non-strings, and absent values", () => {
      expect(() => forcedNonBlankString("")).toThrowError(TypeError, "Expected value to be a non-blank string but got string")
      expect(() => forcedNonBlankString("   ")).toThrowError(TypeError)
      expect(() => forcedNonBlankString(5)).toThrowError(TypeError)
      expect(() => forcedNonBlankString(null)).toThrowError(TypeError)
    })
  })

  describe("optionalNonBlankString", () => {
    it("returns null when absent and trims otherwise", () => {
      expect(optionalNonBlankString(undefined)).toBeNull()
      expect(optionalNonBlankString(null)).toBeNull()
      expect(optionalNonBlankString(" hi ")).toEqual("hi")
    })

    it("throws when present but blank or wrong-typed", () => {
      expect(() => optionalNonBlankString("")).toThrowError(TypeError)
      expect(() => optionalNonBlankString(5)).toThrowError(TypeError)
    })
  })

  describe("forcedFloat", () => {
    it("returns and parses finite numbers", () => {
      expect(forcedFloat(1.5)).toEqual(1.5)
      expect(forcedFloat("2.5")).toEqual(2.5)
      expect(forcedFloat(3)).toEqual(3)
    })

    it("throws for non-finite, non-numeric, and absent values", () => {
      expect(() => forcedFloat(Number.NaN)).toThrowError(TypeError)
      expect(() => forcedFloat(Number.POSITIVE_INFINITY)).toThrowError(TypeError)
      expect(() => forcedFloat("nope")).toThrowError(TypeError)
      expect(() => forcedFloat(null)).toThrowError(TypeError)
    })
  })

  describe("optionalFloat", () => {
    it("returns null when absent and parses otherwise", () => {
      expect(optionalFloat(null)).toBeNull()
      expect(optionalFloat("2.5")).toEqual(2.5)
    })
  })

  describe("forcedBoolean", () => {
    it("returns booleans", () => {
      expect(forcedBoolean(true)).toEqual(true)
      expect(forcedBoolean(false)).toEqual(false)
    })

    it("does not coerce strings or numbers and throws on absent", () => {
      expect(() => forcedBoolean("true")).toThrowError(TypeError)
      expect(() => forcedBoolean(1)).toThrowError(TypeError)
      expect(() => forcedBoolean(undefined)).toThrowError(TypeError)
    })
  })

  describe("optionalBoolean", () => {
    it("returns null when absent and the boolean otherwise", () => {
      expect(optionalBoolean(undefined)).toBeNull()
      expect(optionalBoolean(false)).toEqual(false)
    })

    it("throws when present but not a boolean", () => {
      expect(() => optionalBoolean("true")).toThrowError(TypeError)
    })
  })

  describe("forcedFunction", () => {
    it("returns functions", () => {
      const fn = () => "ok"

      expect(forcedFunction(fn)).toBe(fn)
    })

    it("throws for non-functions, including absent values", () => {
      expect(() => forcedFunction("not-callable")).toThrowError(TypeError, "Expected value to be a function but got string")
      expect(() => forcedFunction(undefined)).toThrowError(TypeError, "Expected value to be a function but got undefined")
      expect(() => forcedFunction(null)).toThrowError(TypeError, "Expected value to be a function but got null")
    })

    it("uses the label in the error message", () => {
      expect(() => forcedFunction(5, "graceTimer.unref")).toThrowError(TypeError, "Expected graceTimer.unref to be a function but got number")
    })
  })

  describe("optionalFunction", () => {
    it("returns null when absent and the function otherwise", () => {
      const fn = () => "ok"

      expect(optionalFunction(undefined)).toBeNull()
      expect(optionalFunction(null)).toBeNull()
      expect(optionalFunction(fn)).toBe(fn)
    })

    it("throws when present but not a function", () => {
      expect(() => optionalFunction("not-callable", "maybeCallback")).toThrowError(TypeError, "Expected maybeCallback to be a function but got string")
    })
  })

  describe("string param helpers", () => {
    it("reads single string params from param maps", () => {
      const params = {filter: "open", tags: ["bug"], title: " Roadmap "}

      expect(forcedStringParam(params, "filter", "Filter")).toEqual("open")
      expect(optionalStringParam(params, "missing", "Missing")).toBeNull()
      expect(forcedNonBlankStringParam(params, "title", "Title")).toEqual("Roadmap")
      expect(optionalNonBlankStringParam(params, "missingTitle", "Missing title")).toBeNull()
    })

    it("throws for absent, repeated, blank, or wrong-typed params", () => {
      const params = {blank: " ", count: 7, ids: ["1", "2"]}

      expect(() => forcedStringParam(params, "missing", "Missing")).toThrowError(TypeError, "Expected Missing to be a string but got undefined")
      expect(() => optionalStringParam(params, "ids", "IDs")).toThrowError(TypeError, "Expected IDs to be a single value but got array")
      expect(() => forcedNonBlankStringParam(params, "blank", "Title")).toThrowError(TypeError, "Expected Title to be a non-blank string but got string")
      expect(() => optionalNonBlankStringParam(params, "count", "Count")).toThrowError(TypeError, "Expected Count to be a string but got number")
    })
  })

  describe("positive integer param helpers", () => {
    it("reads positive integer params from decimal string param maps", () => {
      const params = {page: "2", projectId: " 42 "}

      expect(forcedPositiveIntegerParam(params, "projectId", "Project ID")).toEqual(42)
      expect(optionalPositiveIntegerParam(params, "page", "Page")).toEqual(2)
      expect(optionalPositiveIntegerParam(params, "missing", "Missing")).toBeNull()
    })

    it("throws for repeated or malformed positive integer params", () => {
      const params = {ids: ["1", "2"], page: "0", projectId: "42abc"}

      expect(() => forcedPositiveIntegerParam(params, "ids", "IDs")).toThrowError(TypeError, "Expected IDs to be a single value but got array")
      expect(() => optionalPositiveIntegerParam(params, "page", "Page")).toThrowError(TypeError, "Expected Page to be a positive integer string but got string")
      expect(() => forcedPositiveIntegerParam(params, "projectId", "Project ID")).toThrowError(TypeError, "Expected Project ID to be a positive integer string but got string")
    })
  })

  describe("positive integer list helpers", () => {
    it("parses scalar and array list values", () => {
      expect(forcedPositiveIntegerList("4", "Project IDs")).toEqual([4])
      expect(forcedPositiveIntegerList(["2", 3, "5"], "Project IDs")).toEqual([2, 3, 5])
      expect(optionalPositiveIntegerList(undefined, "Project IDs")).toBeNull()
      expect(optionalPositiveIntegerList(null, "Project IDs")).toBeNull()
    })

    it("throws for absent forced lists or malformed entries", () => {
      expect(() => forcedPositiveIntegerList(undefined, "Project IDs")).toThrowError(TypeError, "Expected Project IDs to be a positive integer list but got undefined")
      expect(() => optionalPositiveIntegerList(["1", "nope"], "Project IDs")).toThrowError(TypeError, "Expected Project IDs[1] to be a positive integer string but got string")
      expect(() => forcedPositiveIntegerList(["0"], "Project IDs")).toThrowError(TypeError, "Expected Project IDs[0] to be a positive integer string but got string")
      expect(() => forcedPositiveIntegerList(["1e3"], "Project IDs")).toThrowError(TypeError, "Expected Project IDs[0] to be a positive integer string but got string")
    })
  })
})
