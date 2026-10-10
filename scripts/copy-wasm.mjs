import { cpSync, mkdirSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

const require = createRequire(import.meta.url)
const pkgRoot = dirname(require.resolve("@mediapipe/tasks-vision"))
mkdirSync("public/wasm", { recursive: true })
cpSync(join(pkgRoot, "wasm"), "public/wasm", { recursive: true })
console.log("copied @mediapipe/tasks-vision wasm → public/wasm")
