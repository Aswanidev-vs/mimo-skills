# evolve — self-extension skill for MiMoCode 0.1.15+

A corrected rebuild of MiMoCode's `evolve` skill, updated for the security
hardening in [PR #2459](https://github.com/XiaomiMiMo/MiMo-Code/pull/2459).

## Why this exists

MiMoCode originally bundled an `evolve` skill that told the agent to create
standalone tool and hook scripts in directories like `.mimocode/tools/` and
`~/.mimocode/hooks/`. MiMoCode auto-imported and executed anything it found
there.

That is an arbitrary-code-execution vector. A prompt-injection artifact, a
malicious file drop, or a cloned repository could place a file in one of those
directories and have it silently loaded and run. PR #2459 closed it by disabling
directory-based tool and hook discovery, and removed the `evolve` skill in the
same change — because a skill that instructs the agent to write into
now-disabled paths is worse than no skill: it produces dead files and reports
success.

So the skill went away, and the capability went with it. **This package brings
the capability back on the supported, safe mechanism.**

## What changed in the mechanism

| | Before (0.1.10–0.1.14) | Now (0.1.15+) |
|---|---|---|
| Tool | `.mimocode/tools/*.ts` — auto-loaded | npm plugin, declared in `plugin` config |
| Hook | `.mimocode/hooks/*.ts` — auto-loaded | npm plugin; project-level file hooks still work |
| Skill | `.mimocode/skills/*/SKILL.md` | **unchanged** |
| TUI plugin | `~/.config/mimocode/tui/*.tsx` | **unchanged** |

Only the tool and hook *directory* loaders were removed. Skills and TUI plugins
were never part of the problem and still work exactly as documented.

The replacement is not a workaround. Declaring a plugin in your config is
explicit, reviewable, and versioned — which is the point.

## Install

Copy the `SKILL.md` and `reference/` directory into a skills directory:

- **Per-project:** `<project>/.mimocode/skills/evolve/`
- **Per-user (all folders):** `~/.mimocode/skills/evolve/`

Then start a new session. The skill loads on the next turn.

## Use the example plugin

```bash
cd example-plugin
npm install
```

Add to your `mimocode.jsonc`:

```jsonc
{
  "plugin": ["mimocode-evolve-example"]
}
```

Restart the TUI. You now have a `wordcount` tool, and a hook that blocks
`rm -rf /`-style commands. To confirm the plugin is what's providing them, run
`mimo --pure`, which disables external plugins.

## Creating your own

The plugin contract, from `@mimo-ai/plugin`:

```ts
type Plugin = (input: PluginInput, options?: PluginOptions) => Promise<Hooks>

interface Hooks {
  tool?: { [key: string]: ToolDefinition }
  // plus event/config/chat.params/... hooks
}
```

A plugin is an npm module whose default export returns hooks. See
`example-plugin/index.ts` for a complete working file, and `reference/` for the
full tool, hook, skill, and TUI API surfaces.

Options pass through the config as a tuple:

```jsonc
{ "plugin": [["my-plugin", { "verbose": true }]] }
```

## Security notes

- Never write executable code to `.mimocode/tools/`, `~/.mimocode/tools/`,
  `.mimocode/hooks/`, or `~/.mimocode/hooks/`. Those paths load nothing on
  0.1.15+, so the code is inert — and if that ever changes, you've silently
  reintroduced the vector #2459 closed.
- `MIMOCODE_PURE=1` / `mimo --pure` is the switch for auditing which
  capabilities come from plugins.
- Plugins run with the same permissions as bash. A plugin is trusted code —
  review the ones you install, the way you would any dependency.
- Prefer a hook that *refuses* over one that silently rewrites. A guardrail
  should never hide what it did.

## Requirements

- MiMoCode **0.1.15 or later** (earlier versions used the directory mechanism
  this replaces)
- `@mimo-ai/plugin` — install the version matching your MiMoCode install

## License

MIT. MiMoCode and `@mimo-ai/plugin` are trademarks of Xiaomi MiMo; this is an
unofficial community package.
