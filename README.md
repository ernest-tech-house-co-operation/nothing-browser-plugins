# Nothing Browser Plugins

> Community extensions for [Nothing Browser](https://github.com/BunElysiaReact/nothing-browser) — built by Ernest Tech House, coded by Pease Ernest.

---

## What is this repo?

This is the official community plugin registry for Nothing Browser. Every plugin here is installable directly from inside the browser — no terminal, no zip files, no manual copying. Open the **PLUGINS** tab, hit **REFRESH**, pick your plugin, click **INSTALL**.

---

## Available Plugins

| Plugin | Author | Description | Restart Required |
|--------|--------|-------------|-----------------|
| adblock | ernest-tech-house-co-operation | Blocks ads, trackers and analytics at DOM and network level | Yes |

---

## Installing a Plugin

1. Open Nothing Browser
2. Go to the **PLUGINS** tab
3. Click **COMMUNITY**
4. Click **↺ REFRESH**
5. Select a plugin from the list
6. Click **↓ INSTALL**
7. Restart the browser if required

You can also install manually by downloading a plugin folder and using **+ FROM FOLDER** in the INSTALLED tab.

---

## Creating a Plugin

See [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) for the full guide.

Quick structure:

```
plugins/
  your-plugin-name/
    manifest.json      ← required
    content.js         ← required (injected into every page)
    background.js      ← optional
    icon.png           ← optional
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full contribution guidelines.

The short version: fork the repo, create your plugin folder under `plugins/`, submit a PR. The maintainers will review and merge.

---

## Built with

- [Nothing Browser](https://github.com/BunElysiaReact/nothing-browser) — Qt6 + Chromium WebEngine
- Created by **Ernest Tech House**
- Coded by **Pease Ernest**

---

*MIT License — build freely, contribute openly.*