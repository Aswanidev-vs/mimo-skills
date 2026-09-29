// Reference plugin for MiMoCode 0.1.15+.
//
// Before PR #2459 you would have written this to `.mimocode/tools/mytool.ts` and
// `.mimocode/hooks/guard.ts` and they would have been auto-imported. That
// directory loading was removed because it auto-executed anything it found
// there. Tools and hooks now ship inside a declared plugin instead.
//
// Install:
//   1. npm install
//   2. add to mimocode.jsonc:  { "plugin": ["mimocode-evolve-example"] }
//   3. restart the TUI
//
// Audit check: run `mimo --pure` to disable external plugins and confirm which
// capabilities disappear.

import { tool } from "@mimo-ai/plugin"

export default async function ExamplePlugin() {
  return {
    // A new capability. Keyed names that match a built-in (bash, read, edit, ...)
    // REPLACE that built-in — pick unused names unless replacement is intended.
    tool: {
      wordcount: tool({
        description:
          "Count words, lines, and characters in a file. Use when asked to measure " +
          "the size of a text file, or to check how large a document is before editing it.",
        args: {
          path: tool.schema.string().describe("Path to the file to measure"),
        },
        async execute(args, ctx) {
          const file = Bun.file(args.path)
          if (!(await file.exists())) return `No such file: ${args.path}`

          const text = await file.text()
          const words = text.split(/\s+/).filter(Boolean).length
          const lines = text.length === 0 ? 0 : text.split("\n").length

          return [
            `File:   ${args.path}`,
            `Words:  ${words}`,
            `Lines:  ${lines}`,
            `Chars:  ${text.length}`,
            `Bytes:  ${new TextEncoder().encode(text).length}`,
          ].join("\n")
        },
      }),
    },

    // A reflex. Hooks return in the same object as tools.
    //
    // This one blocks a genuinely destructive shell command. It is a guardrail,
    // not a permission bypass: it only ever refuses, never silently rewrites.
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "bash") return

      const cmd = output.args?.command
      if (typeof cmd !== "string") return

      if (/\brm\s+(-[a-zA-Z]*\s+)*-?[a-zA-Z]*[rf][a-zA-Z]*\s+\/(\s|$)/.test(cmd)) {
        output.cancel = true
        output.cancelReason = "Blocked recursive delete of the filesystem root"
      }
    },
  }
}
