import {
  forcedBoolean,
  forcedFloat,
  forcedInteger,
  forcedString,
  optionalBoolean,
  optionalFloat,
  optionalInteger,
  optionalString
} from "../src/index.js"

describe("typanic", () => {
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
})
