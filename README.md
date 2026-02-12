# Split Translator

> Translate your Obsidian notes in a split pane with original and translated text displayed side-by-side.

[![Release](https://img.shields.io/github/v/release/warezio/obsidian-split-translator)](https://github.com/warezio/obsidian-split-translator/releases)
[![License](https://img.shields.io/github/license/warezio/obsidian-split-translator)](LICENSE)
[![Downloads](https://img.shields.io/github/downloads/warezio/obsidian-split-translator/total)](https://github.com/warezio/obsidian-split-translator/releases)

---

## Features

- **Split Pane Translation** - View original and translated text side-by-side for easy comparison
- **Streaming Translation** - See results appear in real-time as translation completes
- **Code Block Preservation** - Automatically protects code blocks and inline code from translation
- **Scroll Synchronization** - Translation view scrolls automatically with your editor
- **Multi-Language Support** - Auto-detect source language or select from 100+ languages
- **Retry Logic** - Automatic retries with exponential backoff for reliable translation
- **Markdown Rendering** - Translated content renders with Obsidian's native styling
- **Selection Translation** - Translate just the selected text or the entire note

---

## Installation

### Method 1: Manual Installation (Recommended)

1. Download the latest release from the [Releases page](https://github.com/warezio/obsidian-split-translator/releases)
2. Extract the downloaded files
3. Move the extracted folder to your Obsidian vault's plugins directory:
   - **macOS**: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/YourVault/.obsidian/plugins/`
   - **Windows**: `%USERPROFILE%\OneDrive\Documents\YourVault\.obsidian\plugins\`
   - **Linux**: `~/Documents/YourVault/.obsidian/plugins/`
4. Rename the folder to `obsidian-split-translator` if needed
5. Enable the plugin in Obsidian: **Settings → Community Plugins → Enable "Split Translator"**

### Method 2: Using BRAT (Beta Reviewer's Auto-update Tool)

If you have [BRAT](https://github.com/TfTHacker/obsidian42-brat) installed:

1. Open **Settings → BRAT**
2. Click "Add Beta Plugin"
3. Enter: `warezio/obsidian-split-translator`
4. Click "Add Plugin" and enable it

---

## Usage

### Translate Current Note

1. Open any markdown note in Obsidian
2. Use the command palette:
   - **macOS**: `Cmd + P`
   - **Windows/Linux**: `Ctrl + P`
3. Type "Split Translator: Translate current note" and press Enter
4. The translation pane will open on the right

### Translate Selection

1. Select the text you want to translate
2. Open command palette (`Cmd/Ctrl + P`)
3. Type "Split Translator: Translate selection" and press Enter

### Header Button

Click the languages icon in the note header (between the view toggle and more options) to quickly translate the current note.

---

## Configuration

Configure Split Translator in **Settings → Split Translator**:

| Setting          | Description                   | Options                                                      |
|------------------|-------------------------------|--------------------------------------------------------------|
| **Source Language** | Language of the original text | `auto`, `en`, `ko`, `ja`, `zh`, `es`, `fr`, `de`, and 100+ more |
| **Target Language** | Language to translate to     | `en`, `ko`, `ja`, `zh`, `es`, `fr`, `de`, and 100+ more |

### Supported Languages

The plugin supports all languages available in Google Translate, including:

- Auto-detect
- English (en)
- Korean (ko)
- Japanese (ja)
- Chinese (zh)
- Spanish (es)
- French (fr)
- German (de)
- And 90+ more languages

---

## How It Works

Split Translator uses Google Translate's unofficial API to provide fast, free translation without requiring API keys or authentication.

**Note:** This API may have rate limits and is not officially supported by Google. For heavy usage, consider official alternatives.

### Translation Pipeline

1. **Masking** - Code blocks and inline code are protected with placeholders
2. **Chunking** - Text is split into 3000-character chunks for reliable translation
3. **Translation** - Each chunk is translated with retry logic (3 attempts)
4. **Unmasking** - Protected code blocks are restored
5. **Rendering** - Markdown is rendered with Obsidian's native styling

---

## Development

### Prerequisites

- [Bun](https://bun.sh/) (or npm)
- Obsidian 1.5.0 or higher

### Build Commands

```bash
# Install dependencies
bun install

# Development mode (watch + inline sourcemaps)
bun run dev

# Production build
bun run build

# Debug build (with inline sourcemaps)
bun run build:debug
```

### Project Structure

```text
obsidian-split-translator/
├── src/
│   ├── main.ts      # Plugin entry point, translation pipeline
│   ├── view.ts      # Translation view (split pane)
│   └── settings.ts  # Settings tab
├── styles.css        # Plugin styles
├── manifest.json    # Obsidian plugin manifest
├── esbuild.config.mjs  # Build configuration
└── main.js          # Built output (generated)
```

### Debugging

The project includes VSCode launch configurations for debugging:

- **Debug Obsidian Plugin** - Builds and launches Obsidian with debugger attached
- **Attach to Obsidian** - Attaches to a running Obsidian instance

See `.vscode/launch.json` for details.

---

## Known Limitations

- Uses unofficial Google Translate API (may break or have rate limits)
- Translation quality depends on Google Translate
- Very large notes may take time to translate
- Internet connection required

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Links

- [GitHub Repository](https://github.com/warezio/obsidian-split-translator)
- [Releases](https://github.com/warezio/obsidian-split-translator/releases)
- [Issue Tracker](https://github.com/warezio/obsidian-split-translator/issues)
- [Obsidian Plugin Directory](https://obsidian.md/plugins)
