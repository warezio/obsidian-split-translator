# README.md Update Plan

**Feature**: README.md Documentation Update for Official Release
**Date**: 2026-02-12
**Version**: 1.0.1
**Status**: In Progress

---

## 1. Overview

### Purpose
Update the README.md to create a professional, comprehensive documentation for the **Split Translator** Obsidian plugin official release.

### Current State
- README.md is only 16 lines
- Contains outdated references to "LibreTranslate" (plugin name changed to "Split Translator")
- Missing installation instructions
- Missing feature documentation
- Missing configuration guide
- No visual examples

### Target State
- Professional open-source project README
- Complete feature documentation
- Clear installation steps
- Usage examples
- Development guide
- Proper badges and links

---

## 2. Content Structure

### 2.1 Header Section
- Project title and logo/badge
- Short description
- Version badge
- License badge
- Obsidian compatibility badge

### 2.2 Features Section
- Split pane translation (side-by-side view)
- Support for code block preservation
- Streaming translation with real-time updates
- Multiple language support (auto-detect + target languages)
- Retry logic with exponential backoff
- Scroll synchronization between original and translated views
- Markdown rendering with Obsidian-native styling

### 2.3 Installation Section
- Via Obsidian Community Plugins (when available)
- Manual installation steps
- Download from GitHub Releases
- Folder placement instructions

### 2.4 Usage Section
- Command palette usage
- Header button usage
- Selection translation
- Settings configuration (source/target language)

### 2.5 Configuration Section
- Source language options (auto, en, ko, ja, zh, etc.)
- Target language options
- How to access settings

### 2.6 Development Section
- Build commands (bun)
- Development mode
- Debug configuration
- Project structure overview

### 2.7 Footer Section
- License information
- Author links
- Issue tracker link
- Release notes link

---

## 3. Design Considerations

### Visual Elements
- Add badges at the top (version, license, downloads)
- Consider adding a screenshot/gif of the plugin in action
- Use proper markdown formatting (headers, lists, code blocks)
- Emoji for better readability (optional but recommended)

### Tone
- Professional yet accessible
- Clear and concise instructions
- Helpful for both users and contributors

### Compatibility Notes
- Note: Uses unofficial Google Translate API
- May have rate limits
- Minimum Obsidian version: 1.5.0

---

## 4. Content Draft

### Badge URLs
```
[Version](https://img.shields.io/github/v/release/warezio/obsidian-split-translator)
[License](https://img.shields.io/github/license/warezio/obsidian-split-translator)
[Downloads](https://img.shields.io/github/downloads/warezio/obsidian-split-translator/total)
```

### Key Commands to Document
```
Cmd/Ctrl + P → "Split Translator: Translate current note"
Cmd/Ctrl + P → "Split Translator: Translate selection"
```

---

## 5. Checklist

- [ ] Create docs/01-plan/features/readme-update.plan.md
- [ ] Finalize content structure
- [ ] Write comprehensive README.md
- [ ] Add badges and links
- [ ] Include installation instructions
- [ ] Document usage examples
- [ ] Add development guide
- [ ] Verify all links work
- [ ] Update version references
- [ ] Remove outdated "LibreTranslate" references

---

## 6. Success Criteria

1. README.md is comprehensive and professional
2. All outdated references removed
3. Installation instructions are clear and accurate
4. Usage examples are easy to follow
5. Development section is useful for contributors
6. All links and badges work correctly

---

## 7. Notes

- Plugin uses unofficial Google Translate API - should mention this disclaimer
- Current version: 1.0.1
- Author: warezio (Jiho)
- License: MIT
