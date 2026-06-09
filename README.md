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
| `forcedInteger(value, label?)` | `number` | accepts integers and integer-looking strings (`"42"`) |
| `forcedFloat(value, label?)` | `number` | accepts finite numbers and numeric strings; rejects `NaN`/`Infinity` |
| `forcedBoolean(value, label?)` | `boolean` | does **not** coerce `"true"`/`1` — pass a real boolean |

### Optional — `null` when absent, throw when present-but-wrong-typed

| Function | Returns |
| --- | --- |
| `optionalString(value, label?)` | `string \| null` |
| `optionalInteger(value, label?)` | `number \| null` |
| `optionalFloat(value, label?)` | `number \| null` |
| `optionalBoolean(value, label?)` | `boolean \| null` |

`null` and `undefined` both count as "absent" and return `null`. A value that is
*present* but of the wrong type still throws — absence and corruption are
different things.

```js
import {forcedInteger, optionalString} from "typanic"

const cols = forcedInteger(payload.cols, "cols")                 // number, or throws
const cursor = optionalString(payload.cursor, "cursor")         // string | null
const status = optionalString(payload.status, "status") ?? "ok" // default only when you truly need one
```

## Why "forced"?

The value is *forced* to be the type you declared. There is no quiet fallback:
the data is what you expect, or your code stops at the boundary with a clear
error instead of carrying a silent empty string into the rest of the system.

## License

MIT
