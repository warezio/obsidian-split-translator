# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

Uses bun (npm also works as a drop-in replacement).

```bash
bun install            # Install dependencies
bun run build          # Bundle main.ts → main.js (esbuild, CJS, obsidian externalized)
bun run build:debug    # Same as build + inline sourcemaps for debugging
bun run dev            # Watch mode with inline sourcemaps
```

Release artifacts: `main.js`, `manifest.json`, `styles.css` (created by GitHub Actions on tag push).

## Debugging (F5)

Two VSCode launch configurations in `.vscode/launch.json`:

- **Debug Obsidian Plugin** — Builds with sourcemaps (`build:debug` task), then launches Obsidian with `--remote-debugging-port=9222` and attaches the Chrome debugger. Requires Obsidian to be closed before launching.
- **Attach to Obsidian** — Attaches to an already-running Obsidian instance on port 9222. Start Obsidian manually with: `/Applications/Obsidian.app/Contents/MacOS/Obsidian --remote-debugging-port=9222`

The plugin's `main.js` must be in the vault's `.obsidian/plugins/obsidian-split-translator/` directory (symlink or copy).

## Architecture

This is an **Obsidian plugin** that translates notes using Google Translate's unofficial API, displaying results in a split pane.

### Source Files

- **src/main.ts** — Plugin class (`SplitTranslatorPlugin`). Registers two commands ("Translate current note", "Translate selection"), a ribbon icon, and per-leaf header buttons. Contains the translation pipeline: text → `MarkdownMasker` (protects code blocks/inline code with placeholders) → chunk splitting (5000 char limit) → sequential Google Translate API calls → unmask → stream results to view.
- **src/view.ts** — `TranslationView` extends `ItemView`. Opens as a vertical split pane. Renders translated markdown via `MarkdownRenderer.render()`. Handles loading spinner state.
- **src/settings.ts** — `TranslatorSettingTab` for source language (auto/en/ko/ja/zh) and target language selection. Config stored via Obsidian's `loadData`/`saveData`.
- **src/styles.css** — Minimal styles for the translation content area (text selectability, padding).

### Key Patterns

- Translation API uses `requestUrl` (Obsidian's HTTP helper) to call `translate.googleapis.com` — this is an unofficial API that may have rate limits or break.
- `MarkdownMasker` masks code blocks and inline code before translation, then unmasks after. Masking happens once before chunk splitting so placeholders stay intact within chunks.
- Scroll sync between source editor and translation view uses percentage-based calculation on the CodeMirror `.cm-scroller` element.
- The plugin config interface is `TranslatorConfig` with `sourceLang` and `targetLang` fields.
- View type constant: `VIEW_TYPE_TRANSLATOR = "translator-view"`.

### Obsidian Plugin Conventions

- Entry point must export a default class extending `Plugin`.
- `manifest.json` defines plugin metadata (id: `obsidian-split-translator`, min app version: 1.5.0).
- `obsidian` package is always external in the bundle — it's provided by the host app at runtime.
- `tsconfig.json` only includes `src/main.ts`; other `.ts` files are resolved via imports.
