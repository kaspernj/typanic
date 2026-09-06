import {forcedValue} from "../src/index.js"

describe("forcedValue", () => {
  it("returns present values unchanged, including falsy values", () => {
    const object = {id: 7}

    expect(forcedValue(object)).toBe(object)
    expect(forcedValue("")).toEqual("")
    expect(forcedValue(0)).toEqual(0)
    expect(forcedValue(false)).toBeFalse()
  })

  it("throws a useful TypeError for nullish values", () => {
    expect(() => forcedValue(null)).toThrowError(TypeError, "Expected value to be present but got null")
    expect(() => forcedValue(undefined, "test result")).toThrowError(TypeError, "Expected test result to be present but got undefined")
  })
})
