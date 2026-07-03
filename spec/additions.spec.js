import {
  forcedBoundedString,
  forcedDate,
  forcedNonBlankStringParam,
  forcedString,
  forcedStringParam,
  optionalBoundedString,
  optionalDate,
  optionalStringParam,
  setErrorFactory,
  snakeCaseKey
} from "../src/index.js"

describe("typanic additions", () => {
  afterEach(() => {
    setErrorFactory(null)
  })

  describe("forcedBoundedString", () => {
    it("returns strings within the bounds", () => {
      expect(forcedBoundedString("hello", {maxLength: 10})).toEqual("hello")
      expect(forcedBoundedString("a", {maxLength: 1})).toEqual("a")
    })

    it("throws for non-strings", () => {
      expect(() => forcedBoundedString(5, {maxLength: 10})).toThrowError(TypeError, "Expected value to be a string but got number")
    })

    it("throws when shorter than minLength (default 1)", () => {
      expect(() => forcedBoundedString("", {maxLength: 10})).toThrowError(TypeError, "Expected value to be at least 1 character but got 0")
      expect(() => forcedBoundedString("ab", {maxLength: 10, minLength: 3}, "name")).toThrowError(TypeError, "Expected name to be at least 3 characters but got 2")
    })

    it("throws when longer than maxLength", () => {
      expect(() => forcedBoundedString("abcdef", {maxLength: 5}, "name")).toThrowError(TypeError, "Expected name to be at most 5 characters but got 6")
    })

    it("requires a positive integer maxLength", () => {
      expect(() => forcedBoundedString("hello", {})).toThrowError(TypeError, "Expected maxLength to be a positive integer but got undefined")
    })
  })

  describe("optionalBoundedString", () => {
    it("returns null for absent values", () => {
      expect(optionalBoundedString(null, {maxLength: 5})).toBeNull()
      expect(optionalBoundedString(undefined, {maxLength: 5})).toBeNull()
    })

    it("allows empty strings by default and enforces maxLength", () => {
      expect(optionalBoundedString("", {maxLength: 5})).toEqual("")
      expect(() => optionalBoundedString("abcdef", {maxLength: 5}, "name")).toThrowError(TypeError, "Expected name to be at most 5 characters but got 6")
    })
  })

  describe("forcedDate", () => {
    it("returns valid Date instances unchanged", () => {
      const date = new Date("2026-07-03T10:00:00.000Z")

      expect(forcedDate(date)).toBe(date)
    })

    it("parses date strings and epoch numbers", () => {
      expect(forcedDate("2026-07-03T10:00:00.000Z").toISOString()).toEqual("2026-07-03T10:00:00.000Z")
      expect(forcedDate(0).toISOString()).toEqual("1970-01-01T00:00:00.000Z")
    })

    it("throws for invalid dates and wrong types", () => {
      expect(() => forcedDate("not-a-date", "startsAt")).toThrowError(TypeError, "Expected startsAt to be a valid date but got string")
      expect(() => forcedDate(new Date("invalid"), "startsAt")).toThrowError(TypeError, "Expected startsAt to be a valid date but got an invalid Date")
      expect(() => forcedDate(true, "startsAt")).toThrowError(TypeError, "Expected startsAt to be a valid date but got boolean")
      expect(() => forcedDate(undefined, "startsAt")).toThrowError(TypeError, "Expected startsAt to be a valid date but got undefined")
    })
  })

  describe("optionalDate", () => {
    it("returns null for absent values", () => {
      expect(optionalDate(null)).toBeNull()
      expect(optionalDate(undefined)).toBeNull()
    })

    it("parses present values and throws on invalid ones", () => {
      expect(optionalDate("2026-07-03T10:00:00.000Z")?.toISOString()).toEqual("2026-07-03T10:00:00.000Z")
      expect(() => optionalDate("not-a-date", "startsAt")).toThrowError(TypeError, "Expected startsAt to be a valid date but got string")
    })
  })

  describe("setErrorFactory", () => {
    it("routes validation errors through the factory with message, code, label and value", () => {
      const calls = []

      setErrorFactory((message, {code, label, value}) => {
        calls.push({code, label, message, value})

        const error = new Error(message)
        error.appCode = code

        return error
      })

      let caughtError = null

      try {
        forcedString(5, "eventId")
      } catch (error) {
        caughtError = error
      }

      expect(caughtError.message).toEqual("Expected eventId to be a string but got number")
      expect(caughtError.appCode).toEqual("typanic/forced_string/wrong_type")
      expect(calls).toEqual([{
        code: "typanic/forced_string/wrong_type",
        label: "eventId",
        message: "Expected eventId to be a string but got number",
        value: 5
      }])
    })

    it("uses stable codes for the new validators", () => {
      const codes = []

      setErrorFactory((message, {code}) => {
        codes.push(code)

        return new Error(message)
      })

      expect(() => forcedBoundedString("abcdef", {maxLength: 5})).toThrow()
      expect(() => forcedBoundedString("", {maxLength: 5})).toThrow()
      expect(() => forcedDate("not-a-date")).toThrow()

      expect(codes).toEqual([
        "typanic/bounded_string/too_long",
        "typanic/bounded_string/too_short",
        "typanic/date/invalid"
      ])
    })

    it("restores the default TypeError behavior when cleared", () => {
      setErrorFactory((message) => new Error(`custom: ${message}`))
      setErrorFactory(null)

      expect(() => forcedString(5)).toThrowError(TypeError, "Expected value to be a string but got number")
    })
  })

  describe("param altKeys", () => {
    it("reads the primary key first and falls back to altKeys", () => {
      expect(forcedStringParam({eventId: "camel"}, "eventId", {altKeys: ["event_id"]})).toEqual("camel")
      expect(forcedStringParam({event_id: "snake"}, "eventId", {altKeys: ["event_id"]})).toEqual("snake")
      expect(forcedStringParam({event_id: "snake", eventId: "camel"}, "eventId", {altKeys: ["event_id"]})).toEqual("camel")
    })

    it("supports label inside the options object and keeps the string form working", () => {
      expect(() => forcedStringParam({}, "eventId", {altKeys: ["event_id"], label: "event id"}))
        .toThrowError(TypeError, "Expected event id to be a string but got undefined")
      expect(() => forcedStringParam({}, "eventId", "event id"))
        .toThrowError(TypeError, "Expected event id to be a string but got undefined")
    })

    it("applies altKeys across the param helper family", () => {
      expect(forcedNonBlankStringParam({event_id: " e-1 "}, "eventId", {altKeys: ["event_id"]})).toEqual("e-1")
      expect(optionalStringParam({event_id: "e-1"}, "eventId", {altKeys: ["event_id"]})).toEqual("e-1")
      expect(optionalStringParam({}, "eventId", {altKeys: ["event_id"]})).toBeNull()
    })
  })

  describe("snakeCaseKey", () => {
    it("converts camelCase keys to snake_case", () => {
      expect(snakeCaseKey("eventId")).toEqual("event_id")
      expect(snakeCaseKey("clientUpdatedAt")).toEqual("client_updated_at")
      expect(snakeCaseKey("resource")).toEqual("resource")
    })
  })
})
