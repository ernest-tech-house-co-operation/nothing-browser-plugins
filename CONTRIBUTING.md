# Contributing to Nothing Browser Plugins

Thanks for wanting to contribute. This is the community plugin registry for Nothing Browser — every plugin here gets distributed directly to users through the browser's built-in plugin manager.

---

## Before You Start

- Read [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) — it covers everything about plugin structure, manifest fields, and code patterns
- Make sure your plugin idea doesn't already exist in the repo
- Keep it focused — one plugin, one job

---

## How to Contribute

### 1. Fork the repo

```bash
git clone git@github.com:ernest-tech-house-co-operation/nothing-browser-plugins.git
cd nothing-browser-plugins
```

### 2. Create your plugin folder

```bash
mkdir plugins/your-plugin-id
cd plugins/your-plugin-id
```

### 3. Write your plugin

Minimum required files:

```
plugins/your-plugin-id/
  manifest.json
  content.js
```

### 4. Test it locally

Open Nothing Browser, go to **PLUGINS → INSTALLED → + FROM FOLDER**, select your plugin folder. Verify it works before submitting.

### 5. Submit a Pull Request

```bash
git add plugins/your-plugin-id/
git commit -m "[plugin] your-plugin-name — short description"
git push origin your-branch
```

Open a PR with the title format: `[plugin] your-plugin-name`

---

## PR Requirements

Every PR must have:

- A valid `manifest.json` with all required fields filled in
- A `content.js` that is readable, not obfuscated or minified-only
- Plugin tested locally in Nothing Browser
- PR description explaining what the plugin does and why it is useful

---

## Code Standards

**Readable code only.** No minified-only submissions. If you want to include a minified version, include the readable source too.

**No obfuscation.** Code that hides what it does will be rejected immediately.

**IIFE + guard.** Every `content.js` must be wrapped in an immediately invoked function expression and must guard against double-injection:

```javascript
(function () {
    if (window.__NB_YOUR_ID__) return;
    window.__NB_YOUR_ID__ = true;
    // your code
})();
```

**No unauthorized network calls.** If your plugin makes network requests, they must be documented in the manifest `permissions` field and explained in the PR description.

---

## What Will Be Rejected

- Plugins that collect or transmit user data without clear disclosure
- Obfuscated or deliberately unreadable code
- Plugins that duplicate existing plugins without clear improvement
- Plugins that require external servers the user cannot audit
- Anything that violates applicable laws

---

## Updating an Existing Plugin

If you are the original author, update the version in `manifest.json` and open a PR with title: `[update] plugin-name v1.x.x`

If you are not the original author, open an issue first describing the bug or improvement. Unsolicited PRs that modify another author's plugin without discussion will be closed.

---

## Issues

Use GitHub Issues for:

- Reporting a broken plugin
- Requesting a new plugin (someone might build it)
- Discussing plugin ideas before building

---

## Maintainers

This repo is maintained by **Ernest Tech House**.
Nothing Browser is coded by **Pease Ernest**.

---

*MIT License. Contribute freely.*
