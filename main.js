var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => SplitTranslatorPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// settings.ts
var import_obsidian = require("obsidian");
var TranslatorSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Translator Settings" });
    new import_obsidian.Setting(containerEl).setName("Source Language").setDesc("Language to translate from").addDropdown(
      (dropdown) => dropdown.addOptions({
        auto: "Auto-detect",
        en: "English",
        ko: "Korean",
        ja: "Japanese",
        zh: "Chinese"
      }).setValue(this.plugin.config.sourceLang || "auto").onChange(async (value) => {
        this.plugin.config.sourceLang = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Target Language").setDesc("Language to translate to").addDropdown(
      (dropdown) => dropdown.addOptions({
        en: "English",
        ko: "Korean",
        ja: "Japanese",
        zh: "Chinese",
        es: "Spanish",
        fr: "French",
        de: "German"
      }).setValue(this.plugin.config.targetLang || "en").onChange(async (value) => {
        this.plugin.config.targetLang = value;
        await this.plugin.saveSettings();
      })
    );
  }
};

// view.ts
var import_obsidian2 = require("obsidian");
var VIEW_TYPE_TRANSLATOR = "translator-view";
var TranslationView = class extends import_obsidian2.ItemView {
  constructor(leaf) {
    super(leaf);
    this.content = "";
    this.loadingEl = null;
    this.contentElWrapper = null;
  }
  getViewType() {
    return VIEW_TYPE_TRANSLATOR;
  }
  getDisplayText() {
    return "Translation";
  }
  getIcon() {
    return "languages";
  }
  async onOpen() {
    const container = this.contentEl;
    container.empty();
    container.createEl("h4", { text: "Translation" });
    this.contentElWrapper = container.createDiv({ cls: "translator-content" });
  }
  async onClose() {
  }
  showLoading(isLoading) {
    const container = this.contentEl;
    if (isLoading) {
      if (!this.loadingEl) {
        this.loadingEl = container.createDiv({ cls: "translator-loading" });
        this.loadingEl.setText("Translating... ");
        const spinner = this.loadingEl.createDiv({ cls: "spinner" });
        spinner.style.display = "inline-block";
        spinner.style.width = "10px";
        spinner.style.height = "10px";
        spinner.style.border = "2px solid currentColor";
        spinner.style.borderRightColor = "transparent";
        spinner.style.borderRadius = "50%";
        spinner.style.animation = "spin 1s linear infinite";
        spinner.style.marginLeft = "10px";
        this.loadingEl.style.display = "flex";
        this.loadingEl.style.alignItems = "center";
        this.loadingEl.style.padding = "10px";
        this.loadingEl.style.fontStyle = "italic";
        this.loadingEl.style.color = "var(--text-muted)";
        if (!document.getElementById("translator-spinner-style")) {
          const style = document.createElement("style");
          style.id = "translator-spinner-style";
          style.innerHTML = `
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `;
          document.head.appendChild(style);
        }
      }
    } else {
      if (this.loadingEl) {
        this.loadingEl.detach();
        this.loadingEl = null;
      }
    }
  }
  async update(content) {
    this.content = content;
    if (!this.contentElWrapper) {
      const container = this.contentEl;
      this.contentElWrapper = container.createDiv({ cls: "translator-content" });
    }
    this.contentElWrapper.empty();
    await import_obsidian2.MarkdownRenderer.render(
      this.app,
      content,
      this.contentElWrapper,
      "/",
      this
    );
  }
};

// main.ts
var SplitTranslatorPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.config = {
      sourceLang: "auto",
      targetLang: "en"
    };
  }
  async onload() {
    console.log("Split Translator Plugin loaded");
    await this.loadSettings();
    this.addSettingTab(new TranslatorSettingTab(this.app, this));
    this.registerView(
      VIEW_TYPE_TRANSLATOR,
      (leaf) => new TranslationView(leaf)
    );
    this.addCommand({
      id: "translate-current-note",
      name: "Translate current note",
      checkCallback: (checking) => {
        if (checking) return this.isEditorActive();
        console.log("Command: Translate current note triggered");
        this.translateCurrentNote();
        return true;
      }
    });
    this.addCommand({
      id: "translate-selection",
      name: "Translate selection",
      checkCallback: (checking) => {
        if (checking)
          return this.isEditorActive() && this.hasSelection();
        this.translateSelection();
        return true;
      }
    });
    this.addRibbonIcon("languages", "Translate current note", () => {
      this.translateCurrentNote();
    });
    this.app.workspace.onLayoutReady(() => {
      this.app.workspace.iterateAllLeaves((leaf) => {
        if (leaf.view instanceof import_obsidian3.MarkdownView) {
          this.addHeaderButton(leaf.view);
        }
      });
    });
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf && leaf.view instanceof import_obsidian3.MarkdownView) {
          this.addHeaderButton(leaf.view);
        }
      })
    );
  }
  addHeaderButton(view) {
    if (view.containerEl.querySelector(".translator-header-button")) return;
    const button = view.addAction("languages", "Translate current note", () => {
      this.translateCurrentNote();
    });
    button.addClass("translator-header-button");
  }
  async translateCurrentNote() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    if (!activeView) {
      new import_obsidian3.Notice("No active markdown view");
      return;
    }
    const content = activeView.editor.getValue();
    if (!content) {
      new import_obsidian3.Notice("Note is empty");
      return;
    }
    await this.translateContent(content);
  }
  async translateSelection() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    if (!activeView) return;
    const selection = activeView.editor.getSelection();
    if (!selection) {
      new import_obsidian3.Notice("No text selected");
      return;
    }
    await this.translateContent(selection);
  }
  async translateContent(text) {
    console.log("translateContent started, length:", text.length);
    try {
      const view = await this.openTranslationView("");
      if (!view) return;
      await this.streamTranslation(text, view);
      new import_obsidian3.Notice("Translation complete!");
    } catch (error) {
      console.error("Translation error:", error);
      new import_obsidian3.Notice(`Translation failed: ${error.message}`);
    }
  }
  async streamTranslation(text, view) {
    const CHUNK_SIZE = 5e3;
    const masker = new MarkdownMasker();
    const maskedText = masker.mask(text);
    const paragraphs = maskedText.split("\n\n");
    const chunks = [];
    let currentChunk = "";
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > CHUNK_SIZE && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      if (currentChunk.length > 0) {
        currentChunk += "\n\n";
      }
      currentChunk += paragraph;
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    console.log(`Starting streaming translation of ${chunks.length} chunks`);
    view.showLoading(true);
    let accumulatedTranslation = "";
    try {
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Processing chunk ${i + 1}/${chunks.length}`);
        let chunkResult = await this.callGoogleTranslate(chunks[i]);
        chunkResult = masker.unmask(chunkResult);
        if (accumulatedTranslation.length > 0) accumulatedTranslation += "\n\n";
        accumulatedTranslation += chunkResult;
        view.update(accumulatedTranslation);
      }
    } finally {
      view.showLoading(false);
    }
    console.log("All chunks translated and streamed");
  }
  async openTranslationView(content) {
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_TRANSLATOR);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf("split", "vertical");
      await leaf.setViewState({
        type: VIEW_TYPE_TRANSLATOR,
        active: true
      });
    }
    if (leaf && leaf.view instanceof TranslationView) {
      workspace.revealLeaf(leaf);
      leaf.view.update(content);
      this.syncScroll(leaf.view);
      return leaf.view;
    }
    return null;
  }
  syncScroll(targetView) {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    if (!activeView) return;
    const editorScrollDom = activeView.contentEl.querySelector(".cm-scroller");
    const targetScrollDom = targetView.contentEl;
    if (editorScrollDom && targetScrollDom) {
      const handleScroll = () => {
        const percentage = editorScrollDom.scrollTop / (editorScrollDom.scrollHeight - editorScrollDom.clientHeight);
        if (isFinite(percentage)) {
          targetScrollDom.scrollTop = percentage * (targetScrollDom.scrollHeight - targetScrollDom.clientHeight);
        }
      };
      editorScrollDom.addEventListener("scroll", handleScroll);
    }
  }
  async callGoogleTranslate(text) {
    console.log("Calling Google API with text length:", text.length);
    const encodedText = encodeURIComponent(text);
    const source = this.config.sourceLang;
    const target = this.config.targetLang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodedText}`;
    try {
      const response = await (0, import_obsidian3.requestUrl)({
        url,
        method: "GET",
        // Google uses GET
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      if (response.status !== 200) {
        throw new Error(`Google API returned status ${response.status}`);
      }
      const data = response.json;
      if (Array.isArray(data) && Array.isArray(data[0])) {
        return data[0].map((item) => item[0]).join("");
      }
      throw new Error("Invalid response format from Google");
    } catch (error) {
      console.error("Google Translate error:", error);
      throw error;
    }
  }
  isEditorActive() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    return !!activeView;
  }
  hasSelection() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    return !!activeView && !!activeView.editor.getSelection();
  }
  async loadSettings() {
    const data = await this.loadData();
    if (data) {
      this.config = Object.assign(this.config, data);
    }
  }
  async saveSettings() {
    await this.saveData(this.config);
  }
  onunload() {
    console.log("Translator Plugin unloaded");
  }
};
var MarkdownMasker = class {
  constructor() {
    this.replacements = [];
  }
  mask(text) {
    this.replacements = [];
    text = text.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__CODE_BLOCK_${this.replacements.length}__`;
      this.replacements.push(match);
      return placeholder;
    });
    text = text.replace(/`[^`]+`/g, (match) => {
      const placeholder = `__INLINE_CODE_${this.replacements.length}__`;
      this.replacements.push(match);
      return placeholder;
    });
    return text;
  }
  unmask(text) {
    return text.replace(/__(CODE_BLOCK|INLINE_CODE)_(\d+)__/g, (match, type, index) => {
      const idx = parseInt(index);
      if (idx >= 0 && idx < this.replacements.length) {
        return this.replacements[idx];
      }
      return match;
    });
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4udHMiLCJzZXR0aW5ncy50cyIsInZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGx1Z2luLCBOb3RpY2UsIHJlcXVlc3RVcmwsIE1hcmtkb3duVmlldywgV29ya3NwYWNlTGVhZiB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IFRyYW5zbGF0b3JTZXR0aW5nVGFiIGZyb20gXCIuL3NldHRpbmdzXCI7XG5pbXBvcnQgeyBUcmFuc2xhdGlvblZpZXcsIFZJRVdfVFlQRV9UUkFOU0xBVE9SIH0gZnJvbSBcIi4vdmlld1wiO1xuXG5pbnRlcmZhY2UgVHJhbnNsYXRvckNvbmZpZyB7XG4gICAgc291cmNlTGFuZzogc3RyaW5nO1xuICAgIHRhcmdldExhbmc6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BsaXRUcmFuc2xhdG9yUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgICBjb25maWc6IFRyYW5zbGF0b3JDb25maWcgPSB7XG4gICAgICAgIHNvdXJjZUxhbmc6IFwiYXV0b1wiLFxuICAgICAgICB0YXJnZXRMYW5nOiBcImVuXCIsXG4gICAgfTtcblxuICAgIGFzeW5jIG9ubG9hZCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTcGxpdCBUcmFuc2xhdG9yIFBsdWdpbiBsb2FkZWRcIik7XG4gICAgICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG4gICAgICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgVHJhbnNsYXRvclNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyVmlldyhcbiAgICAgICAgICAgIFZJRVdfVFlQRV9UUkFOU0xBVE9SLFxuICAgICAgICAgICAgKGxlYWYpID0+IG5ldyBUcmFuc2xhdGlvblZpZXcobGVhZilcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBSZWdpc3RlciBjb21tYW5kOiBUcmFuc2xhdGUgY3VycmVudCBub3RlXG4gICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICAgICAgICBpZDogXCJ0cmFuc2xhdGUtY3VycmVudC1ub3RlXCIsXG4gICAgICAgICAgICBuYW1lOiBcIlRyYW5zbGF0ZSBjdXJyZW50IG5vdGVcIixcbiAgICAgICAgICAgIGNoZWNrQ2FsbGJhY2s6IChjaGVja2luZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjaGVja2luZykgcmV0dXJuIHRoaXMuaXNFZGl0b3JBY3RpdmUoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNvbW1hbmQ6IFRyYW5zbGF0ZSBjdXJyZW50IG5vdGUgdHJpZ2dlcmVkXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlQ3VycmVudE5vdGUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlZ2lzdGVyIGNvbW1hbmQ6IFRyYW5zbGF0ZSBzZWxlY3Rpb25cbiAgICAgICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgICAgICAgIGlkOiBcInRyYW5zbGF0ZS1zZWxlY3Rpb25cIixcbiAgICAgICAgICAgIG5hbWU6IFwiVHJhbnNsYXRlIHNlbGVjdGlvblwiLFxuICAgICAgICAgICAgY2hlY2tDYWxsYmFjazogKGNoZWNraW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNoZWNraW5nKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc0VkaXRvckFjdGl2ZSgpICYmIHRoaXMuaGFzU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGVTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCByaWJib24gaWNvblxuICAgICAgICB0aGlzLmFkZFJpYmJvbkljb24oXCJsYW5ndWFnZXNcIiwgXCJUcmFuc2xhdGUgY3VycmVudCBub3RlXCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlQ3VycmVudE5vdGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIGhlYWRlciBidXR0b24gdG8gZXhpc3RpbmcgbGVhdmVzXG4gICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbkxheW91dFJlYWR5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5pdGVyYXRlQWxsTGVhdmVzKChsZWFmKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGxlYWYudmlldyBpbnN0YW5jZW9mIE1hcmtkb3duVmlldykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEhlYWRlckJ1dHRvbihsZWFmLnZpZXcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgaGVhZGVyIGJ1dHRvbiB0byBuZXcgbGVhdmVzXG4gICAgICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbihcImFjdGl2ZS1sZWFmLWNoYW5nZVwiLCAobGVhZikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChsZWFmICYmIGxlYWYudmlldyBpbnN0YW5jZW9mIE1hcmtkb3duVmlldykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEhlYWRlckJ1dHRvbihsZWFmLnZpZXcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgYWRkSGVhZGVyQnV0dG9uKHZpZXc6IE1hcmtkb3duVmlldykge1xuICAgICAgICAvLyBDaGVjayBpZiBidXR0b24gYWxyZWFkeSBleGlzdHNcbiAgICAgICAgaWYgKHZpZXcuY29udGFpbmVyRWwucXVlcnlTZWxlY3RvcihcIi50cmFuc2xhdG9yLWhlYWRlci1idXR0b25cIikpIHJldHVybjtcblxuICAgICAgICAvLyBBZGQgYnV0dG9uXG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IHZpZXcuYWRkQWN0aW9uKFwibGFuZ3VhZ2VzXCIsIFwiVHJhbnNsYXRlIGN1cnJlbnQgbm90ZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZUN1cnJlbnROb3RlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBidXR0b24uYWRkQ2xhc3MoXCJ0cmFuc2xhdG9yLWhlYWRlci1idXR0b25cIik7XG5cbiAgICAgICAgLy8gQXR0ZW1wdCB0byBtb3ZlIGl0IGJlZm9yZSB0aGUgXCJNb3JlIG9wdGlvbnNcIiBidXR0b24gaWYgcG9zc2libGVcbiAgICAgICAgLy8gU3RhbmRhcmQgYWRkQWN0aW9uIHB1dHMgaXQgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYWN0aW9ucyBjb250YWluZXIgKGxlZnQtbW9zdCBvZiBhY3Rpb25zKVxuICAgICAgICAvLyBUaGUgXCJNb3JlIG9wdGlvbnNcIiBidXR0b24gaXMgdXN1YWxseSB0aGUgbGFzdCBvbmUuXG4gICAgICAgIC8vIFNvIHVzdWFsbHkgaXQgZW5kcyB1cDogW1RyYW5zbGF0ZV0gW090aGVyIFBsdWdpbnNdIFtNb3JlIE9wdGlvbnNdXG4gICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIHN1ZmZpY2llbnQgZm9yIFwiYmV0d2VlbiByZWFkL2VkaXQgYW5kIC4uLlwiLlxuICAgICAgICAvLyBJZiB3ZSBuZWVkIHN0cmljdGVyIHBvc2l0aW9uaW5nLCB3ZSdkIG5lZWQgdG8gbWFuaXB1bGF0ZSBET00gY2hpbGRyZW4gb2Ygdmlldy5jb250ZW50RWwucXVlcnlTZWxlY3RvcignLnZpZXctaGVhZGVyLW5hdi1idXR0b25zJylcbiAgICB9XG5cbiAgICBhc3luYyB0cmFuc2xhdGVDdXJyZW50Tm90ZSgpIHtcbiAgICAgICAgY29uc3QgYWN0aXZlVmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgICAgIGlmICghYWN0aXZlVmlldykge1xuICAgICAgICAgICAgbmV3IE5vdGljZShcIk5vIGFjdGl2ZSBtYXJrZG93biB2aWV3XCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29udGVudCA9IGFjdGl2ZVZpZXcuZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIGlmICghY29udGVudCkge1xuICAgICAgICAgICAgbmV3IE5vdGljZShcIk5vdGUgaXMgZW1wdHlcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCB0aGlzLnRyYW5zbGF0ZUNvbnRlbnQoY29udGVudCk7XG4gICAgfVxuXG4gICAgYXN5bmMgdHJhbnNsYXRlU2VsZWN0aW9uKCkge1xuICAgICAgICBjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICAgICAgaWYgKCFhY3RpdmVWaWV3KSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gYWN0aXZlVmlldy5lZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGlmICghc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBuZXcgTm90aWNlKFwiTm8gdGV4dCBzZWxlY3RlZFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMudHJhbnNsYXRlQ29udGVudChzZWxlY3Rpb24pO1xuICAgIH1cblxuICAgIGFzeW5jIHRyYW5zbGF0ZUNvbnRlbnQodGV4dDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidHJhbnNsYXRlQ29udGVudCBzdGFydGVkLCBsZW5ndGg6XCIsIHRleHQubGVuZ3RoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIDEuIE9wZW4gdmlldyBpbW1lZGlhdGVseSB3aXRoIGxvYWRpbmcgc3RhdGVcbiAgICAgICAgICAgIGNvbnN0IHZpZXcgPSBhd2FpdCB0aGlzLm9wZW5UcmFuc2xhdGlvblZpZXcoXCJcIik7IFxuICAgICAgICAgICAgaWYgKCF2aWV3KSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIDIuIFN0YXJ0IHN0cmVhbWluZyB0cmFuc2xhdGlvbiAod2l0aCBtYXNraW5nKVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5zdHJlYW1UcmFuc2xhdGlvbih0ZXh0LCB2aWV3KTtcblxuICAgICAgICAgICAgbmV3IE5vdGljZShcIlRyYW5zbGF0aW9uIGNvbXBsZXRlIVwiKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUcmFuc2xhdGlvbiBlcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgbmV3IE5vdGljZShgVHJhbnNsYXRpb24gZmFpbGVkOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBzdHJlYW1UcmFuc2xhdGlvbih0ZXh0OiBzdHJpbmcsIHZpZXc6IFRyYW5zbGF0aW9uVmlldykge1xuICAgICAgICBjb25zdCBDSFVOS19TSVpFID0gNTAwMDtcbiAgICAgICAgXG4gICAgICAgIC8vIDEuIE1hc2sgY29kZSBibG9ja3MgYmVmb3JlIHNwbGl0dGluZ1xuICAgICAgICBjb25zdCBtYXNrZXIgPSBuZXcgTWFya2Rvd25NYXNrZXIoKTtcbiAgICAgICAgY29uc3QgbWFza2VkVGV4dCA9IG1hc2tlci5tYXNrKHRleHQpO1xuXG4gICAgICAgIGNvbnN0IHBhcmFncmFwaHMgPSBtYXNrZWRUZXh0LnNwbGl0KFwiXFxuXFxuXCIpO1xuICAgICAgICBjb25zdCBjaHVua3M6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGxldCBjdXJyZW50Q2h1bmsgPSBcIlwiO1xuXG4gICAgICAgIC8vIEdyb3VwIHBhcmFncmFwaHNcbiAgICAgICAgZm9yIChjb25zdCBwYXJhZ3JhcGggb2YgcGFyYWdyYXBocykge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRDaHVuay5sZW5ndGggKyBwYXJhZ3JhcGgubGVuZ3RoID4gQ0hVTktfU0laRSAmJiBjdXJyZW50Q2h1bmsubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNodW5rcy5wdXNoKGN1cnJlbnRDaHVuayk7XG4gICAgICAgICAgICAgICAgY3VycmVudENodW5rID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdXJyZW50Q2h1bmsubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDaHVuayArPSBcIlxcblxcblwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3VycmVudENodW5rICs9IHBhcmFncmFwaDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3VycmVudENodW5rLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKGN1cnJlbnRDaHVuayk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhgU3RhcnRpbmcgc3RyZWFtaW5nIHRyYW5zbGF0aW9uIG9mICR7Y2h1bmtzLmxlbmd0aH0gY2h1bmtzYCk7XG4gICAgICAgIFxuICAgICAgICAvLyBTaG93IGluaXRpYWwgbG9hZGluZyBzdGF0ZVxuICAgICAgICB2aWV3LnNob3dMb2FkaW5nKHRydWUpO1xuICAgICAgICBsZXQgYWNjdW11bGF0ZWRUcmFuc2xhdGlvbiA9IFwiXCI7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFByb2Nlc3NpbmcgY2h1bmsgJHtpICsgMX0vJHtjaHVua3MubGVuZ3RofWApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIFRyYW5zbGF0ZSBjaHVua1xuICAgICAgICAgICAgICAgIGxldCBjaHVua1Jlc3VsdCA9IGF3YWl0IHRoaXMuY2FsbEdvb2dsZVRyYW5zbGF0ZShjaHVua3NbaV0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIFVubWFzayB0aGUgY2h1bmsgaW1tZWRpYXRlbHkgZm9yIGRpc3BsYXlcbiAgICAgICAgICAgICAgICAvLyBOb3RlOiBUaGlzIG1pZ2h0IGJlIHJpc2t5IGlmIGEgbWFzayBwbGFjZWhvbGRlciBpcyBzcGxpdCBhY3Jvc3MgY2h1bmtzLCBcbiAgICAgICAgICAgICAgICAvLyBidXQgc2luY2Ugd2UgbWFzayAqYmVmb3JlKiBzcGxpdHRpbmcgYnkgcGFyYWdyYXBoLCBhbmQgcGxhY2Vob2xkZXJzIGFyZSBzbWFsbCB0b2tlbnMsXG4gICAgICAgICAgICAgICAgLy8gYW5kIHdlIHNwbGl0IGJ5IFxcblxcbiwgaXQgaXMgdW5saWtlbHkgYSBwbGFjZWhvbGRlciBfX0NPREVfQkxPQ0tfWF9fIGdldHMgc3BsaXQgXG4gICAgICAgICAgICAgICAgLy8gdW5sZXNzIGEgcGFyYWdyYXBoIGlzIGh1Z2UgYW5kIGZvcmNlZCBzcGxpdCAod2hpY2ggd2UgZG9uJ3QgZG8sIHdlIGp1c3QgYXBwZW5kKS5cbiAgICAgICAgICAgICAgICAvLyBBY3R1YWxseSB3ZSBhc3N1bWUgcGxhY2Vob2xkZXJzIHN0YXkgaW50YWN0LlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNodW5rUmVzdWx0ID0gbWFza2VyLnVubWFzayhjaHVua1Jlc3VsdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdG90YWwgY29udGVudFxuICAgICAgICAgICAgICAgIGlmIChhY2N1bXVsYXRlZFRyYW5zbGF0aW9uLmxlbmd0aCA+IDApIGFjY3VtdWxhdGVkVHJhbnNsYXRpb24gKz0gXCJcXG5cXG5cIjtcbiAgICAgICAgICAgICAgICBhY2N1bXVsYXRlZFRyYW5zbGF0aW9uICs9IGNodW5rUmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIHZpZXcgaW1tZWRpYXRlbHlcbiAgICAgICAgICAgICAgICB2aWV3LnVwZGF0ZShhY2N1bXVsYXRlZFRyYW5zbGF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHZpZXcuc2hvd0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJBbGwgY2h1bmtzIHRyYW5zbGF0ZWQgYW5kIHN0cmVhbWVkXCIpO1xuICAgIH1cblxuXG5cbiAgICBhc3luYyBvcGVuVHJhbnNsYXRpb25WaWV3KGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8VHJhbnNsYXRpb25WaWV3IHwgbnVsbD4ge1xuICAgICAgICBjb25zdCB7IHdvcmtzcGFjZSB9ID0gdGhpcy5hcHA7XG4gICAgICAgIFxuICAgICAgICBsZXQgbGVhZjogV29ya3NwYWNlTGVhZiB8IG51bGwgPSBudWxsO1xuICAgICAgICBjb25zdCBsZWF2ZXMgPSB3b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9UUkFOU0xBVE9SKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChsZWF2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGVhZiA9IGxlYXZlc1swXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlYWYgPSB3b3Jrc3BhY2UuZ2V0TGVhZignc3BsaXQnLCAndmVydGljYWwnKTtcbiAgICAgICAgICAgIGF3YWl0IGxlYWYuc2V0Vmlld1N0YXRlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWSUVXX1RZUEVfVFJBTlNMQVRPUixcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKGxlYWYgJiYgbGVhZi52aWV3IGluc3RhbmNlb2YgVHJhbnNsYXRpb25WaWV3KSB7XG4gICAgICAgICAgICB3b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcbiAgICAgICAgICAgIGxlYWYudmlldy51cGRhdGUoY29udGVudCk7XG4gICAgICAgICAgICB0aGlzLnN5bmNTY3JvbGwobGVhZi52aWV3KTtcbiAgICAgICAgICAgIHJldHVybiBsZWFmLnZpZXc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgc3luY1Njcm9sbCh0YXJnZXRWaWV3OiBUcmFuc2xhdGlvblZpZXcpIHtcbiAgICAgICAgY29uc3QgYWN0aXZlVmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgICAgIGlmICghYWN0aXZlVmlldykgcmV0dXJuO1xuXG4gICAgICAgIC8vIFNpbXBsZSBwZXJjZW50YWdlLWJhc2VkIHNjcm9sbCBzeW5jXG4gICAgICAgIC8vIE5vdGU6IFRoaXMgcmVsaWVzIG9uIHRoZSBpbnRlcm5hbCAnc2Nyb2xsZXInIGVsZW1lbnQgc3RydWN0dXJlIHdoaWNoIG1pZ2h0IHZhcnlcbiAgICAgICAgLy8gQnV0IGZvciBzdGFuZGFyZCBNYXJrZG93blZpZXcgaXQncyB1c3VhbGx5IHJlbGlhYmxlIHRvIGhvb2sgaW50byB0aGUgZWRpdG9yJ3Mgc2Nyb2xsXG4gICAgICAgIFxuICAgICAgICAvLyBAdHMtaWdub3JlIC0gYWNjZXNzIGludGVybmFsIGNtIGVkaXRvclxuICAgICAgICBjb25zdCBlZGl0b3JTY3JvbGxEb20gPSBhY3RpdmVWaWV3LmNvbnRlbnRFbC5xdWVyeVNlbGVjdG9yKFwiLmNtLXNjcm9sbGVyXCIpIGFzIEhUTUxFbGVtZW50OyBcbiAgICAgICAgY29uc3QgdGFyZ2V0U2Nyb2xsRG9tID0gdGFyZ2V0Vmlldy5jb250ZW50RWw7XG5cbiAgICAgICAgaWYgKGVkaXRvclNjcm9sbERvbSAmJiB0YXJnZXRTY3JvbGxEb20pIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZVNjcm9sbCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gZWRpdG9yU2Nyb2xsRG9tLnNjcm9sbFRvcCAvIChlZGl0b3JTY3JvbGxEb20uc2Nyb2xsSGVpZ2h0IC0gZWRpdG9yU2Nyb2xsRG9tLmNsaWVudEhlaWdodCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzRmluaXRlKHBlcmNlbnRhZ2UpKSB7XG4gICAgICAgICAgICAgICAgICAgdGFyZ2V0U2Nyb2xsRG9tLnNjcm9sbFRvcCA9IHBlcmNlbnRhZ2UgKiAodGFyZ2V0U2Nyb2xsRG9tLnNjcm9sbEhlaWdodCAtIHRhcmdldFNjcm9sbERvbS5jbGllbnRIZWlnaHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBvbGQgbGlzdGVuZXIgaWYgZXhpc3RzICh0cmlja3kgd2l0aG91dCByZWZlcmVuY2UsIGJ1dCB2ZXJpZnkgbG9naWMgaGFuZGxlcyByZXBlYXRlZCBjYWxscylcbiAgICAgICAgICAgIC8vIElkZWFsbHkgd2Ugc3RvcmUgdGhlIHJlZmVyZW5jZSBvciBzdGFydCBmcmVzaC4gXG4gICAgICAgICAgICAvLyBGb3Igbm93LCB3ZSBqdXN0IGFkZCBpdC4gSW4gYSByb2J1c3QgYXBwLCB3ZSBzaG91bGQgbWFuYWdlIGV2ZW50IGNsZWFudXAuXG4gICAgICAgICAgICBlZGl0b3JTY3JvbGxEb20uYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBoYW5kbGVTY3JvbGwpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDbGVhbnVwIG9uIHZpZXcgY2xvc2U/IFxuICAgICAgICAgICAgLy8gdGFyZ2V0Vmlldy5yZWdpc3RlckRvbUV2ZW50KGVkaXRvclNjcm9sbERvbSwgXCJzY3JvbGxcIiwgaGFuZGxlU2Nyb2xsKTsgLy8gVGhpcyBpcyBiZXR0ZXIgaWYgc3VwcG9ydGVkXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBjYWxsR29vZ2xlVHJhbnNsYXRlKHRleHQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2FsbGluZyBHb29nbGUgQVBJIHdpdGggdGV4dCBsZW5ndGg6XCIsIHRleHQubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgZW5jb2RlZFRleHQgPSBlbmNvZGVVUklDb21wb25lbnQodGV4dCk7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IHRoaXMuY29uZmlnLnNvdXJjZUxhbmc7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuY29uZmlnLnRhcmdldExhbmc7XG4gICAgICAgIFxuICAgICAgICAvLyBHb29nbGUgVHJhbnNsYXRlIFVub2ZmaWNpYWwgQVBJXG4gICAgICAgIC8vIGh0dHBzOi8vdHJhbnNsYXRlLmdvb2dsZWFwaXMuY29tL3RyYW5zbGF0ZV9hL3NpbmdsZT9jbGllbnQ9Z3R4JnNsPWF1dG8mdGw9a28mZHQ9dCZxPXRleHRcbiAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vdHJhbnNsYXRlLmdvb2dsZWFwaXMuY29tL3RyYW5zbGF0ZV9hL3NpbmdsZT9jbGllbnQ9Z3R4JnNsPSR7c291cmNlfSZ0bD0ke3RhcmdldH0mZHQ9dCZxPSR7ZW5jb2RlZFRleHR9YDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsIC8vIEdvb2dsZSB1c2VzIEdFVFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJVc2VyLUFnZW50XCI6IFwiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzkxLjAuNDQ3Mi4xMjQgU2FmYXJpLzUzNy4zNlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEdvb2dsZSBBUEkgcmV0dXJuZWQgc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gcmVzcG9uc2UuanNvbjtcbiAgICAgICAgICAgIC8vIEdvb2dsZSByZXR1cm5zOiBbW1tcIlRyYW5zbGF0ZWQgdGV4dFwiLFwiT3JpZ2luYWwgdGV4dFwiLC4uLl0sLi4uXSwuLi5dXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSAmJiBBcnJheS5pc0FycmF5KGRhdGFbMF0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFbMF0ubWFwKChpdGVtOiBhbnkpID0+IGl0ZW1bMF0pLmpvaW4oXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcmVzcG9uc2UgZm9ybWF0IGZyb20gR29vZ2xlXCIpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJHb29nbGUgVHJhbnNsYXRlIGVycm9yOlwiLCBlcnJvcik7XG4gICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNFZGl0b3JBY3RpdmUoKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZVZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuICAgICAgICByZXR1cm4gISFhY3RpdmVWaWV3O1xuICAgIH1cblxuICAgIGhhc1NlbGVjdGlvbigpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgYWN0aXZlVmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgICAgIHJldHVybiAhIWFjdGl2ZVZpZXcgJiYgISFhY3RpdmVWaWV3LmVkaXRvci5nZXRTZWxlY3Rpb24oKTtcbiAgICB9XG5cbiAgICBhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmxvYWREYXRhKCk7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24odGhpcy5jb25maWcsIGRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuY29uZmlnKTtcbiAgICB9XG5cbiAgICBvbnVubG9hZCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJUcmFuc2xhdG9yIFBsdWdpbiB1bmxvYWRlZFwiKTtcbiAgICB9XG59XG5cbmNsYXNzIE1hcmtkb3duTWFza2VyIHtcbiAgICBwcml2YXRlIHJlcGxhY2VtZW50czogc3RyaW5nW10gPSBbXTtcblxuICAgIG1hc2sodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgdGhpcy5yZXBsYWNlbWVudHMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIC8vIDEuIE1hc2sgY29kZSBibG9ja3MgKGBgYC4uLmBgYClcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvYGBgW1xcc1xcU10qP2BgYC9nLCAobWF0Y2gpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gYF9fQ09ERV9CTE9DS18ke3RoaXMucmVwbGFjZW1lbnRzLmxlbmd0aH1fX2A7XG4gICAgICAgICAgICB0aGlzLnJlcGxhY2VtZW50cy5wdXNoKG1hdGNoKTtcbiAgICAgICAgICAgIHJldHVybiBwbGFjZWhvbGRlcjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gMi4gTWFzayBpbmxpbmUgY29kZSAoYC4uLmApXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL2BbXmBdK2AvZywgKG1hdGNoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwbGFjZWhvbGRlciA9IGBfX0lOTElORV9DT0RFXyR7dGhpcy5yZXBsYWNlbWVudHMubGVuZ3RofV9fYDtcbiAgICAgICAgICAgIHRoaXMucmVwbGFjZW1lbnRzLnB1c2gobWF0Y2gpO1xuICAgICAgICAgICAgcmV0dXJuIHBsYWNlaG9sZGVyO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIDMuIE1hc2sgT2JzaWRpYW4gd2lraWxpbmtzIFtbLi4uXV0gPz9cbiAgICAgICAgLy8gTWF5YmUgbGF0ZXIuIEdvb2dsZSBUcmFuc2xhdGUgdXN1YWxseSBoYW5kbGVzIFtbIF1dIG9rYXktaXNoLCBidXQgc2FmZXIgdG8gbWFzayBpZiByZXF1ZXN0ZWQuXG4gICAgICAgIC8vIEZvciBub3csIGZvY3VzaW5nIG9uIGNvZGUgY29tcGxpYW5jZS5cblxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICB1bm1hc2sodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byBzdXBwb3J0IHVubWFza2luZyBpbiBhbnkgb3JkZXIgYmVjYXVzZSB0cmFuc2xhdGlvbiBtaWdodCBtb3ZlIHRoaW5ncyBzbGlnaHRseSAodGhvdWdoIHVubGlrZWx5IGZvciB0aGVzZSB0b2tlbnMpXG4gICAgICAgIC8vIEJ1dCBtYWlubHkgd2UganVzdCBsb29rIGZvciBvdXIgdG9rZW5zXG4gICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL19fKENPREVfQkxPQ0t8SU5MSU5FX0NPREUpXyhcXGQrKV9fL2csIChtYXRjaCwgdHlwZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IHBhcnNlSW50KGluZGV4KTtcbiAgICAgICAgICAgIGlmIChpZHggPj0gMCAmJiBpZHggPCB0aGlzLnJlcGxhY2VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZXBsYWNlbWVudHNbaWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXBwLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgU3BsaXRUcmFuc2xhdG9yUGx1Z2luIGZyb20gXCIuL21haW5cIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJhbnNsYXRvclNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgICBwbHVnaW46IFNwbGl0VHJhbnNsYXRvclBsdWdpbjtcblxuICAgIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFNwbGl0VHJhbnNsYXRvclBsdWdpbikge1xuICAgICAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICAgIH1cblxuICAgIGRpc3BsYXkoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG5cbiAgICAgICAgY29udGFpbmVyRWwuZW1wdHkoKTtcblxuICAgICAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJUcmFuc2xhdG9yIFNldHRpbmdzXCIgfSk7XG5cbiAgICAgICAgLy8gU291cmNlIExhbmd1YWdlXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoXCJTb3VyY2UgTGFuZ3VhZ2VcIilcbiAgICAgICAgICAgIC5zZXREZXNjKFwiTGFuZ3VhZ2UgdG8gdHJhbnNsYXRlIGZyb21cIilcbiAgICAgICAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+XG4gICAgICAgICAgICAgICAgZHJvcGRvd25cbiAgICAgICAgICAgICAgICAgICAgLmFkZE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXV0bzogXCJBdXRvLWRldGVjdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW46IFwiRW5nbGlzaFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAga286IFwiS29yZWFuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBqYTogXCJKYXBhbmVzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgemg6IFwiQ2hpbmVzZVwiLFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uY29uZmlnLnNvdXJjZUxhbmcgfHwgXCJhdXRvXCIpXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmNvbmZpZy5zb3VyY2VMYW5nID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIC8vIFRhcmdldCBMYW5ndWFnZVxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgIC5zZXROYW1lKFwiVGFyZ2V0IExhbmd1YWdlXCIpXG4gICAgICAgICAgICAuc2V0RGVzYyhcIkxhbmd1YWdlIHRvIHRyYW5zbGF0ZSB0b1wiKVxuICAgICAgICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT5cbiAgICAgICAgICAgICAgICBkcm9wZG93blxuICAgICAgICAgICAgICAgICAgICAuYWRkT3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbjogXCJFbmdsaXNoXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBrbzogXCJLb3JlYW5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGphOiBcIkphcGFuZXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB6aDogXCJDaGluZXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBlczogXCJTcGFuaXNoXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmcjogXCJGcmVuY2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlOiBcIkdlcm1hblwiLFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uY29uZmlnLnRhcmdldExhbmcgfHwgXCJlblwiKVxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5jb25maWcudGFyZ2V0TGFuZyA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiwgTWFya2Rvd25SZW5kZXJlciB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG5leHBvcnQgY29uc3QgVklFV19UWVBFX1RSQU5TTEFUT1IgPSBcInRyYW5zbGF0b3Itdmlld1wiO1xuXG5leHBvcnQgY2xhc3MgVHJhbnNsYXRpb25WaWV3IGV4dGVuZHMgSXRlbVZpZXcge1xuICAgIGNvbnRlbnQ6IHN0cmluZyA9IFwiXCI7XG4gICAgbG9hZGluZ0VsOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIGNvbnRlbnRFbFdyYXBwZXI6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcihsZWFmOiBXb3Jrc3BhY2VMZWFmKSB7XG4gICAgICAgIHN1cGVyKGxlYWYpO1xuICAgIH1cblxuICAgIGdldFZpZXdUeXBlKCkge1xuICAgICAgICByZXR1cm4gVklFV19UWVBFX1RSQU5TTEFUT1I7XG4gICAgfVxuXG4gICAgZ2V0RGlzcGxheVRleHQoKSB7XG4gICAgICAgIHJldHVybiBcIlRyYW5zbGF0aW9uXCI7XG4gICAgfVxuXG4gICAgZ2V0SWNvbigpIHtcbiAgICAgICAgcmV0dXJuIFwibGFuZ3VhZ2VzXCI7XG4gICAgfVxuXG4gICAgYXN5bmMgb25PcGVuKCkge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmNvbnRlbnRFbDtcbiAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgICAgIGNvbnRhaW5lci5jcmVhdGVFbChcImg0XCIsIHsgdGV4dDogXCJUcmFuc2xhdGlvblwiIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIGEgZGVkaWNhdGVkIGNvbnRlbnQgd3JhcHBlclxuICAgICAgICB0aGlzLmNvbnRlbnRFbFdyYXBwZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInRyYW5zbGF0b3ItY29udGVudFwiIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIG9uQ2xvc2UoKSB7XG4gICAgICAgIC8vIE5vdGhpbmcgdG8gY2xlYW4gdXBcbiAgICB9XG5cbiAgICBzaG93TG9hZGluZyhpc0xvYWRpbmc6IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5jb250ZW50RWw7XG4gICAgICAgIFxuICAgICAgICBpZiAoaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubG9hZGluZ0VsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nRWwgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInRyYW5zbGF0b3ItbG9hZGluZ1wiIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0VsLnNldFRleHQoXCJUcmFuc2xhdGluZy4uLiBcIik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gQWRkIGEgc2ltcGxlIHNwaW5uZXIgQ1NTIGlmIG5vdCBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICBjb25zdCBzcGlubmVyID0gdGhpcy5sb2FkaW5nRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNwaW5uZXJcIiB9KTtcbiAgICAgICAgICAgICAgICBzcGlubmVyLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiO1xuICAgICAgICAgICAgICAgIHNwaW5uZXIuc3R5bGUud2lkdGggPSBcIjEwcHhcIjtcbiAgICAgICAgICAgICAgICBzcGlubmVyLnN0eWxlLmhlaWdodCA9IFwiMTBweFwiO1xuICAgICAgICAgICAgICAgIHNwaW5uZXIuc3R5bGUuYm9yZGVyID0gXCIycHggc29saWQgY3VycmVudENvbG9yXCI7XG4gICAgICAgICAgICAgICAgc3Bpbm5lci5zdHlsZS5ib3JkZXJSaWdodENvbG9yID0gXCJ0cmFuc3BhcmVudFwiO1xuICAgICAgICAgICAgICAgIHNwaW5uZXIuc3R5bGUuYm9yZGVyUmFkaXVzID0gXCI1MCVcIjtcbiAgICAgICAgICAgICAgICBzcGlubmVyLnN0eWxlLmFuaW1hdGlvbiA9IFwic3BpbiAxcyBsaW5lYXIgaW5maW5pdGVcIjtcbiAgICAgICAgICAgICAgICBzcGlubmVyLnN0eWxlLm1hcmdpbkxlZnQgPSBcIjEwcHhcIjtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBTdHlsZXMgZm9yIGxvYWRpbmcgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nRWwuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0VsLnN0eWxlLmFsaWduSXRlbXMgPSBcImNlbnRlclwiO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0VsLnN0eWxlLnBhZGRpbmcgPSBcIjEwcHhcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdFbC5zdHlsZS5mb250U3R5bGUgPSBcIml0YWxpY1wiO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0VsLnN0eWxlLmNvbG9yID0gXCJ2YXIoLS10ZXh0LW11dGVkKVwiO1xuXG4gICAgICAgICAgICAgICAgIC8vIEFkZCBrZXlmcmFtZXMgZm9yIHNwaW5uZXIgaWYgbmVlZGVkXG4gICAgICAgICAgICAgICAgIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0cmFuc2xhdG9yLXNwaW5uZXItc3R5bGVcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLmlkID0gXCJ0cmFuc2xhdG9yLXNwaW5uZXItc3R5bGVcIjtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUuaW5uZXJIVE1MID0gYFxuICAgICAgICAgICAgICAgICAgICAgICAgQGtleWZyYW1lcyBzcGluIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvYWRpbmdFbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0VsLmRldGFjaCgpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0VsID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHVwZGF0ZShjb250ZW50OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jb250ZW50ID0gY29udGVudDtcbiAgICAgICAgXG4gICAgICAgIGlmICghdGhpcy5jb250ZW50RWxXcmFwcGVyKSB7XG4gICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5jb250ZW50RWw7XG4gICAgICAgICAgICAgdGhpcy5jb250ZW50RWxXcmFwcGVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJ0cmFuc2xhdG9yLWNvbnRlbnRcIiB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29udGVudEVsV3JhcHBlci5lbXB0eSgpO1xuICAgICAgICBcbiAgICAgICAgLy8gUmVuZGVyIE1hcmtkb3duXG4gICAgICAgIGF3YWl0IE1hcmtkb3duUmVuZGVyZXIucmVuZGVyKFxuICAgICAgICAgICAgdGhpcy5hcHAsXG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgdGhpcy5jb250ZW50RWxXcmFwcGVyLFxuICAgICAgICAgICAgXCIvXCIsXG4gICAgICAgICAgICB0aGlzXG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUF3RTs7O0FDQXhFLHNCQUErQztBQUcvQyxJQUFxQix1QkFBckIsY0FBa0QsaUNBQWlCO0FBQUEsRUFHL0QsWUFBWSxLQUFVLFFBQStCO0FBQ2pELFVBQU0sS0FBSyxNQUFNO0FBQ2pCLFNBQUssU0FBUztBQUFBLEVBQ2xCO0FBQUEsRUFFQSxVQUFnQjtBQUNaLFVBQU0sRUFBRSxZQUFZLElBQUk7QUFFeEIsZ0JBQVksTUFBTTtBQUVsQixnQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRzFELFFBQUksd0JBQVEsV0FBVyxFQUNsQixRQUFRLGlCQUFpQixFQUN6QixRQUFRLDRCQUE0QixFQUNwQztBQUFBLE1BQVksQ0FBQyxhQUNWLFNBQ0ssV0FBVztBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sSUFBSTtBQUFBLFFBQ0osSUFBSTtBQUFBLFFBQ0osSUFBSTtBQUFB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QyxZQUFNO0FBQUEsSUFDVDtBQUFBLEVBQ0o7QUFBQSxFQUVBLGlCQUEwQjtBQUN0QixVQUFNLGFBQWEsS0FBSyxJQUFJLFVBQVUsb0JBQW9CLDZCQUFZO0FBQ3RFLFdBQU8sQ0FBQyxDQUFDO0FBQUEsRUFDYjtBQUFBLEVBRUEsZUFBd0I7QUFDcEIsVUFBTSxhQUFhLEtBQUssSUFBSSxVQUFVLG9CQUFvQiw2QkFBWTtBQUN0RSxXQUFPLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLE9BQU8sYUFBYTtBQUFBLEVBQzVEO0FBQUEsRUFFQSxNQUFNLGVBQWU7QUFDakIsVUFBTSxPQUFPLE1BQU0sS0FBSyxTQUFTO0FBQ2pDLFFBQUksTUFBTTtBQUNOLFdBQUssU0FBUyxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUk7QUFBQSxJQUNqRDtBQUFBLEVBQ0o7QUFBQSxFQUVBLE1BQU0sZUFBZTtBQUNqQixVQUFNLEtBQUssU0FBUyxLQUFLLE1BQU07QUFBQSxFQUNuQztBQUFBLEVBRUEsV0FBVztBQUNQLFlBQVEsSUFBSSw0QkFBNEI7QUFBQSxFQUM1QztBQUNKO0FBRUEsSUFBTSxpQkFBTixNQUFxQjtBQUFBLEVBQXJCO0FBQ0ksU0FBUSxlQUF5QixDQUFDO0FBQUE7QUFBQSxFQUVsQyxLQUFLLE1BQXNCO0FBQ3ZCLFNBQUssZUFBZSxDQUFDO0FBR3JCLFdBQU8sS0FBSyxRQUFRLG1CQUFtQixDQUFDLFVBQVU7QUFDOUMsWUFBTSxjQUFjLGdCQUFnQixLQUFLLGFBQWEsTUFBTTtBQUM1RCxXQUFLLGFBQWEsS0FBSyxLQUFLO0FBQzVCLGFBQU87QUFBQSxJQUNYLENBQUM7QUFHRCxXQUFPLEtBQUssUUFBUSxZQUFZLENBQUMsVUFBVTtBQUN2QyxZQUFNLGNBQWMsaUJBQWlCLEtBQUssYUFBYSxNQUFNO0FBQzdELFdBQUssYUFBYSxLQUFLLEtBQUs7QUFDNUIsYUFBTztBQUFBLElBQ1gsQ0FBQztBQU1ELFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxPQUFPLE1BQXNCO0FBR3pCLFdBQU8sS0FBSyxRQUFRLHVDQUF1QyxDQUFDLE9BQU8sTUFBTSxVQUFVO0FBQy9FLFlBQU0sTUFBTSxTQUFTLEtBQUs7QUFDMUIsVUFBSSxPQUFPLEtBQUssTUFBTSxLQUFLLGFBQWEsUUFBUTtBQUM1QyxlQUFPLEtBQUssYUFBYSxHQUFHO0FBQUEsTUFDaEM7QUFDQSxhQUFPO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDTDtBQUNKOyIsIm5hbWVzIjpbImltcG9ydF9vYnNpZGlhbiIsImltcG9ydF9vYnNpZGlhbiJdLCJzb3VyY2VSb290IjoiL1VzZXJzL3dhcmV6aW8vR2l0L0dpdEh1Yi93YXJlemlvL29ic2lkaWFuLXNwbGl0LXRyYW5zbGF0b3IifQ==
