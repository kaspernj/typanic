# typanic

> type + panic — get the type you expect, or it throws.

Tiny, dependency-free runtime type assertions for **untrusted input** (request
and response bodies, webhook payloads, message/command payloads, parsed config,
route/query params). Instead of silently coercing a wrong value into `""`, `0`,
or `false` — which produces noise and hides a real producer bug far from where it
happens — `typanic` either gives you the value as the type you asked for, or
throws a `TypeError`.

```js
// ❌ silent, noisy, swallows malformed data
const name = typeof payload.name === "string" ? payload.name : ""

// ✅ loud and clean
import {forcedString} from "typanic"
const name = forcedString(payload.name, "name") // throws if it isn't a string
```

For values that are already typed/validated (a generated model accessor, a
boundary-typed param) you don't need this at all — just use them directly.
`typanic` is for the boundary where data is genuinely untrusted.

## Install

```bash
npm install typanic
```

ESM only. Ships with TypeScript declarations (`.d.ts`) generated from JSDoc.

## API

Every helper takes the value and an optional `label` used in the error message
(`Expected <label> to be a <type> but got <actual>`).

### Required — throw when the value is the wrong type

| Function | Returns | Notes |
| --- | --- | --- |
| `forcedString(value, label?)` | `string` | throws unless `typeof value === "string"` |
| `forcedOneOf(value, allowedValues, label?)` | `T` | throws unless `value` is one of `allowedValues` (enum / one-of) |
| `forcedInteger(value, label?)` | `number` | accepts integers and integer-looking strings (`"42"`) |
| `forcedIntegerFromString(value, label?)` | `number` | accepts safe decimal integer strings only; useful for form/query values |
| `forcedPositiveInteger(value, label?)` | `number` | accepts safe integers greater than zero and integer-looking strings (`"42"`) |
| `forcedPositiveIntegerFromString(value, label?)` | `number` | accepts safe positive decimal integer strings only |
| `forcedStringParam(params, key, label?)` | `string` | reads a required single string from a route/query param map |
| `forcedNonBlankStringParam(params, key, label?)` | `string` | reads a required trimmed non-blank string from a param map |
| `forcedPositiveIntegerParam(params, key, label?)` | `number` | reads a required safe positive decimal integer from a string param map |
| `forcedPositiveIntegerList(value, label?)` | `number[]` | parses a scalar or array list of safe positive integers |
| `forcedNonBlankString(value, label?)` | `string` | trims and rejects blank strings |
| `forcedFloat(value, label?)` | `number` | accepts finite numbers and numeric strings; rejects `NaN`/`Infinity` |
| `forcedBoolean(value, label?)` | `boolean` | does **not** coerce `"true"`/`1` — pass a real boolean |
| `forcedFunction(value, label?)` | `Function` | throws unless `typeof value === "function"` |
| `forcedError(value, label?)` | `Error` | throws unless `value instanceof Error` |

### Error conversion

Use `ensureError(value, label?)` at catch/throw boundaries where JavaScript can
throw strings, numbers, or other non-Error values. Error instances are returned
unchanged. Non-Error values are wrapped in a new `Error` and preserved as
`error.cause`.

Use `errorMessage(value, label?)` when a UI or status field needs a displayable
message for a caught value. String throws are already messages and are returned
unchanged; everything else is normalized through `ensureError`.

```js
import {errorMessage} from "typanic"

try {
  await work()
} catch (error) {
  const message = errorMessage(error, "work error")
  showError(message)
}
```

### Optional — `null` when absent, throw when present-but-wrong-typed

| Function | Returns |
| --- | --- |
| `optionalString(value, label?)` | `string \| null` |
| `optionalOneOf(value, allowedValues, label?)` | `T \| null` |
| `optionalInteger(value, label?)` | `number \| null` |
| `optionalIntegerFromString(value, label?)` | `number \| null` |
| `optionalPositiveInteger(value, label?)` | `number \| null` |
| `optionalPositiveIntegerFromString(value, label?)` | `number \| null` |
| `optionalStringParam(params, key, label?)` | `string \| null` |
| `optionalNonBlankStringParam(params, key, label?)` | `string \| null` |
| `optionalPositiveIntegerParam(params, key, label?)` | `number \| null` |
| `optionalPositiveIntegerList(value, label?)` | `number[] \| null` |
| `optionalNonBlankString(value, label?)` | `string \| null` |
| `optionalFloat(value, label?)` | `number \| null` |
| `optionalBoolean(value, label?)` | `boolean \| null` |
| `optionalFunction(value, label?)` | `Function \| null` |

`null` and `undefined` both count as "absent" and return `null`. A value that is
*present* but of the wrong type still throws — absence and corruption are
different things.

```js
import {forcedPositiveIntegerFromString, optionalString} from "typanic"

const cols = forcedPositiveIntegerFromString(payload.cols, "cols") // positive decimal string -> number, or throws
const cursor = optionalString(payload.cursor, "cursor")            // string | null
const status = optionalString(payload.status, "status") ?? "ok"    // default only when you truly need one
```

Param-map helpers are for route/query frameworks that expose values as
`Record<string, string | string[] | undefined>`. They reject repeated single-value
params instead of picking the first value silently.

```js
import {forcedPositiveIntegerParam, optionalPositiveIntegerList} from "typanic"

const projectId = forcedPositiveIntegerParam(routeParams, "project_id", "Project ID")
const userIds = optionalPositiveIntegerList(routeParams.user_ids, "User IDs") ?? []
```

## Why "forced"?

The value is *forced* to be the type you declared. There is no quiet fallback:
the data is what you expect, or your code stops at the boundary with a clear
error instead of carrying a silent empty string into the rest of the system.

## License

MIT
