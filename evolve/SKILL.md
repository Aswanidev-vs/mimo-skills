---
name: evolve
description: Use when you want to modify ANY aspect of yourself — your capabilities (new/overridden tools), your behavior (hooks that intercept every tool call, LLM request, session lifecycle), your knowledge (skills), or your UI (TUI panels, commands, dialogs). On MiMoCode 0.1.15+ new tools and hooks ship as explicitly declared npm plugins, not loose files in .mimocode/. Use proactively — repeated manual sequence 3+ times, repeated user correction, durable project knowledge, or any "I wish I could..." moment is a trigger to evolve.
---

# Evolve — Total Self-Modification

Every layer of you is extensible. On MiMoCode 0.1.15+ the delivery mechanism is an **explicitly declared plugin**, plus a few directory conventions that still work (skills, TUI). See File Locations before you write anything.

- **What you can do** — create tools, or override any built-in (bash, read, edit, ...) with your own implementation
- **How you behave** — hooks intercept everything: every tool call (block/rewrite args/rewrite output), every LLM request (system prompt, message list, temperature, headers), every session and subagent lifecycle event
- **What you know** — skills persist domain knowledge across sessions
- **What the user sees** — TUI plugins add panels, commands, dialogs, routes to the interface itself

This skill is not documentation — it is a standing instruction to **notice when you should evolve, and act on it**.

## Why the paths changed (read before writing code)

MiMoCode **PR #2459** ("disable directory script loading and remove evolve skill", merged Sep 21 2026) removed auto-loading of standalone `tool/` and `tools/` directories and of home-level `hook/` and `hooks/` directories. The reason was security: those directories were auto-imported and executed, so any file landing in them — a prompt-injection artifact, a malicious file drop, a cloned repo — became silently running code. That was an arbitrary-code-execution vector, and it is now closed.

**Consequence for you:** a file placed in `.mimocode/tools/` or `~/.mimocode/hooks/` does nothing. Not "loads late" — nothing. Code written there is dead on arrival, and reporting it as a working extension is a false success.

**Do not** re-enable or work around directory discovery. The replacement (declared plugins) is both safe and supported. Project-level file hooks and plugin-provided tools still work by design.

## When to evolve (triggers)

Act on these signals — don't wait for the user to ask:

| Signal | Action |
|--------|--------|
| You ran the same bash/API sequence 3+ times (this or past sessions) | Wrap it into a **tool** |
| You keep making the same mistake, or the user keeps correcting the same behavior | Add a **hook** to block/fix it structurally |
| You learned non-obvious project knowledge that future sessions will need | Write a **skill** to persist it |
| A built-in tool's behavior conflicts with project needs | **Override** it (same-name tool) |
| A UI view is missing or a panel would help | Add a **TUI plugin** |

Before creating: check whether the extension already exists (`ls .mimocode/skills`, `ls ~/.config/mimocode/tui`). Prefer improving an existing one over adding a near-duplicate.

## Decision flow

```
Need to change WHAT you can do  → tool   (plugin-exported, new capability)
Need to change HOW you behave   → hook   (plugin-exported, intercept/modify)
Need to remember HOW to do X    → skill  (.mimocode/skills/<name>/SKILL.md)
Need to change the UI           → TUI    (~/.config/mimocode/tui/*.tsx)
```

Rule of thumb: tools add verbs, hooks add reflexes, skills add memories.

## Creating Tools and Hooks (plugin)

A plugin is an npm module whose default export is a function returning hooks. Verified contract from `@mimo-ai/plugin`:

```ts
type Plugin = (input: PluginInput, options?: PluginOptions) => Promise<Hooks>

interface Hooks {
  tool?: { [key: string]: ToolDefinition }   // your tools
  event?: (input: { event: Event }) => Promise<void>
  config?: (input: Config) => Promise<void>
  "chat.params"?: (input, output: { temperature; topP; ... }) => Promise<void>
  // ...see @reference/hook-api.md for the full event list
}
```

Minimal plugin — one tool:

```ts
// my-plugin/index.ts
import { tool } from "@mimo-ai/plugin"

export default async () => ({
  tool: {
    mytool: tool({
      description: "What this tool does (the LLM reads this to decide when to use it)",
      args: {
        param1: tool.schema.string().describe("Parameter description"),
      },
      async execute(args, ctx) {
        // ctx.directory — project root
        // ctx.worktree — git worktree root
        // ctx.abort — AbortSignal
        return `Result: ${args.param1}`
      },
    }),
  },
})
```

A tool keyed with a built-in's name (`bash`, `read`, `edit`, ...) **replaces** it.

Hooks return in the same object:

```ts
export default async () => ({
  "tool.execute.before": async (input, output) => {
    if (input.tool === "bash" && output.args.command?.includes("rm -rf /")) {
      output.cancel = true
      output.cancelReason = "Blocked dangerous command"
    }
  },
})
```

### Wiring it up

1. `package.json` in your plugin dir with `@mimo-ai/plugin` as a dependency
2. Register the spec in your MiMoCode config under the `plugin` key:
   `{"plugin": ["my-plugin", ["my-plugin", { "opt": true }]]}` — a bare string, or `[name, options]` to pass `PluginOptions`
3. Restart the TUI

`MIMOCODE_PURE=1` (or `mimo --pure`) runs with external plugins disabled — use it to confirm whether a plugin is the thing providing a capability.

### Hook Events

| Event | Capability |
|-------|-----------|
| `tool.execute.before` | Modify `output.args` or set `output.cancel=true` to block |
| `tool.execute.after` | Modify tool result via `output.output` (string), `output.title`, `output.metadata` — NOT `output.result` |
| `tool.definition` | Modify tool description/parameters |
| `chat.params` | Modify temperature, topP, maxOutputTokens |
| `experimental.chat.system.transform` | Append to system prompt |
| `experimental.chat.messages.transform` | Modify message list sent to LLM |
| `session.pre` / `session.post` | Session runLoop lifecycle; `post` receives the full trajectory |
| `session.userQuery.pre` / `.post` | Per-LLM-step lifecycle; cancel or inspect each step |
| `actor.preStop` / `actor.postStop` | Gate subagent delivery; `continue=true` forces another turn |
| `permission.ask` | Auto-allow/deny permission requests (not yet wired) |
| `shell.env` | Inject environment variables |

Field names must match exactly — a typo'd field (e.g. `output.result`) fails
silently. Always check @reference/hook-api.md for the exact input/output shape
before writing a hook.

## Creating Skills

Write to `.mimocode/skills/<name>/SKILL.md`:

```markdown
---
name: my-skill
description: Use when [triggering conditions — not a workflow summary]
---
Instructions here...
```

## File Locations

| Type | Path | Loads? |
|------|------|--------|
| Tools | npm plugin via `plugin` config key | ✅ |
| Hooks | npm plugin via `plugin` config key (or project-level file hooks) | ✅ |
| Skills | `.mimocode/skills/*/SKILL.md` | ✅ next turn |
| TUI | `~/.config/mimocode/tui/*.tsx` | ✅ on restart |
| ~~Tools~~ | ~~`.mimocode/tools/*.ts`~~ | ❌ removed in #2459 — inert |
| ~~Tools~~ | ~~`~/.mimocode/tools/`, `~/.config/mimocode/tools/`~~ | ❌ removed in #2459 — inert |
| ~~Hooks~~ | ~~`.mimocode/hooks/*.ts`, `~/.mimocode/hooks/`~~ | ❌ removed in #2459 — inert |

Struck-through rows are the trap: they look writable and do nothing.

## Evolution loop (do this every time)

1. **Create** the extension (smallest thing that works).
2. **Verify immediately** — invoke the tool / trigger the hook on the next turn. A broken extension is worse than none. If the capability doesn't appear, you wrote it to a dead path — re-check File Locations.
3. **Tell the user** what you created and why, in one sentence.
4. **Iterate or delete** — if it misfires later, fix it or remove it. Don't leave dead extensions; they pollute your own tool list.

## Detailed API Reference

For full type signatures, all available fields, and more examples:

- See @reference/tool-api.md for Tool schema and ToolContext
- See @reference/hook-api.md for all hook events with input/output types
- See @reference/skill-api.md for SKILL.md format and frontmatter fields
- See @reference/tui-api.md for TUI plugin slots, commands, dialogs, and state

## Constraints

- Tools/hooks have same permissions as bash — no privilege escalation
- Cannot modify the permission system
- Tool output truncated at 50KB / 2000 lines
- Prefer small, composable extensions over monolithic ones
- Never create an extension that hides information from the user or bypasses confirmation prompts
- Never write executable code to an auto-loaded directory to "make it work" — that is the vector #2459 closed
