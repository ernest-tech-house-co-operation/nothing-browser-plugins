# Nothing Browser Plugin Guide

> How to build, structure, and publish a plugin for Nothing Browser.

---

## How Plugins Work

Nothing Browser plugins are JavaScript files injected into every web page the browser loads — exactly like Chrome content scripts, but simpler. Your `content.js` runs at `document_start` in the main world, meaning you have full access to the page's JavaScript environment before any page code runs.

The browser fetches plugins from this repo, stores them locally, and injects them on every page load. No compilation, no bundling, no build step needed.

---

## Plugin Structure

Every plugin lives in its own folder under `plugins/`:

```
plugins/
  your-plugin-id/
    manifest.json      ← required — metadata and config
    content.js         ← required — injected into every page
    background.js      ← optional — future use
    icon.png           ← optional — shown in the plugins tab (64x64 recommended)
```

---

## manifest.json

This is the heart of your plugin. Every field matters.

```json
{
  "id": "your-plugin-id",
  "name": "Your Plugin Name",
  "version": "1.0.0",
  "description": "One or two sentences describing what this plugin does.",
  "author": "your-github-username",
  "how_to_use": "Plain English instructions shown to the user in the Plugins tab. No markdown.",
  "requires_restart": true,
  "permissions": ["dom_inject"],
  "enabled": true
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier. Lowercase, hyphens only. Must match folder name. |
| `name` | string | yes | Display name shown in the UI. |
| `version` | string | yes | Semantic version — `major.minor.patch`. |
| `description` | string | yes | What the plugin does. Keep it under 200 characters. |
| `author` | string | yes | Your GitHub username or org name. |
| `how_to_use` | string | yes | Plain English instructions for the user. No markdown. |
| `requires_restart` | boolean | yes | Set `true` if the plugin only activates on page load (most plugins). Set `false` only if it works without a restart. |
| `permissions` | array | yes | List of permissions your plugin uses. See permissions below. |
| `enabled` | boolean | yes | Default state. Always set to `true`. |

### Permissions

Declare every capability your plugin uses:

| Permission | What it covers |
|------------|---------------|
| `dom_inject` | Reading and modifying the page DOM |
| `network_intercept` | Wrapping fetch / XHR to intercept or block requests |
| `storage_read` | Reading localStorage / sessionStorage |
| `storage_write` | Writing to localStorage / sessionStorage |
| `clipboard` | Accessing the clipboard API |

---

## content.js

This file is injected into every page at `document_start` in the main world. Write it like a self-contained IIFE.

### Rules

- Always wrap in an IIFE — `(function() { ... })();`
- Always guard against double-injection with a flag on `window`
- Never use `import` or `export` — there is no bundler
- Never use `async/await` at the top level
- Keep it fast — it runs before the page loads

### Template

```javascript
(function () {
    'use strict';

    // Guard against double injection
    if (window.__NB_YOUR_PLUGIN_ID__) return;
    window.__NB_YOUR_PLUGIN_ID__ = true;

    // ── Your plugin code here ─────────────────────────────────────────────

    console.log('[NB YourPlugin] v1.0.0 active');
})();
```

### Common Patterns

**Block a network request:**
```javascript
const _fetch = window.fetch;
window.fetch = function (input) {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (url.includes('tracker.example.com')) {
        return Promise.reject(new TypeError('[NB] blocked: ' + url));
    }
    return _fetch.apply(this, arguments);
};
```

**Remove DOM elements:**
```javascript
function sweep() {
    document.querySelectorAll('.ad-banner, #popup-overlay').forEach(el => el.remove());
}
const observer = new MutationObserver(sweep);
observer.observe(document.documentElement, { childList: true, subtree: true });
sweep();
```

**Inject a style:**
```javascript
const style = document.createElement('style');
style.textContent = 'body { background: #000 !important; color: #fff !important; }';
document.documentElement.appendChild(style);
```

**Intercept XHR:**
```javascript
const _open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url) {
    if (url.includes('analytics')) { this.__nb_blocked__ = true; return; }
    return _open.apply(this, arguments);
};
const _send = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function () {
    if (this.__nb_blocked__) return;
    return _send.apply(this, arguments);
};
```

---

## Submitting Your Plugin

1. Fork this repository
2. Create your plugin folder: `plugins/your-plugin-id/`
3. Add `manifest.json` and `content.js` (and optionally `background.js`, `icon.png`)
4. Test it locally — load it via **PLUGINS → INSTALLED → + FROM FOLDER** in Nothing Browser
5. Open a Pull Request with the title: `[plugin] your-plugin-name`

### PR Checklist

- [ ] `manifest.json` has all required fields
- [ ] Plugin ID matches folder name exactly
- [ ] Plugin is wrapped in an IIFE with a double-injection guard
- [ ] Tested locally in Nothing Browser
- [ ] No external network calls to third-party servers (except what the plugin explicitly needs to function)
- [ ] No obfuscated code
- [ ] `how_to_use` is written in plain English

### What gets rejected

- Plugins that phone home to unknown servers
- Obfuscated or minified-only code with no readable source
- Plugins that steal cookies, credentials, or user data
- Duplicate plugins that do the same thing as an existing one without clear improvement

---

## Plugin ID Rules

- Lowercase letters, numbers, and hyphens only
- No spaces, no underscores, no dots
- Must be unique across the repo
- Must match the folder name exactly

Good: `dark-mode`, `adblock`, `custom-fonts`, `cookie-cleaner`
Bad: `Dark_Mode`, `AdBlock`, `my plugin`

---

## Versioning

Use semantic versioning: `major.minor.patch`

- Bump `patch` for bug fixes
- Bump `minor` for new features that don't break existing behavior
- Bump `major` for breaking changes or complete rewrites

---

## Questions

Open an issue in this repo or in the main [Nothing Browser repo](https://github.com/BunElysiaReact/nothing-browser).

---

*Nothing Browser Plugin System — Ernest Tech House*
