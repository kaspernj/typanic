import {forcedValue} from "../../src/index.js"

declare const maybeString: string | null | undefined

const value: string = forcedValue(maybeString, "maybeString")

value.toUpperCase()
