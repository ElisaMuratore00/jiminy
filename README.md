# Jiminy

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A browser extension that tracks how many Twitter/X posts you view while scrolling.\
Built with [WXT](https://wxt.dev), [TypeScript](https://www.typescriptlang.org), [Preact](https://preactjs.com), [Tailwind CSS](https://tailwindcss.com) and [Vite](https://vitejs.dev) for optimal performance and developer experience.

## Browser Compatibility

- Chrome (Manifest V3)
- Firefox
- Edge (Chromium-based)

## Install

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (>=20)
- [pnpm](https://pnpm.io)

This project uses [Mise](https://mise.jdx.dev/getting-started.html) for tools version management.

### Getting Started

1. **Install dependencies**

```bash
pnpm install
```

2. **Run dev server**

```bash
pnpm run dev
```

### Loading the Extension

#### Chrome/Edge:

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the corresponding folder inside the `dist/` folder

#### Firefox:

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the corresponding folder inside the `dist/` folder

## How It Works

### Post Detection

The content script uses a sophisticated approach to detect Twitter/X posts:

- **MutationObserver**: Watches for DOM changes as new posts load during scrolling
- **IntersectionObserver**: Only counts posts that are actually visible (≥30% in viewport)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
