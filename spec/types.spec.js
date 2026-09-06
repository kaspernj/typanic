import {execFile} from "node:child_process"
import path from "node:path"
import {promisify} from "node:util"

const exec = promisify(execFile)

describe("typanic type contracts", () => {
  it("narrows a nullish generic value to its present type", async () => {
    await exec(path.resolve("node_modules/.bin/tsc"), [
      "--allowJs",
      "--checkJs",
      "--noEmit",
      "--strict",
      "--target", "ES2022",
      "--module", "ESNext",
      "--moduleResolution", "Bundler",
      "--skipLibCheck",
      "spec/types/forced-value.test.ts"
    ], {cwd: process.cwd()})
  })
})
