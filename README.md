# Alcove

A high-performance, browser-independent homepage designed for speed and minimalist elegance.

## Features
- **Smart Command Palette:** Press `CMD+K` to search bookmarks, tags, and categories instantly.
- **Usage-Based Ranking:** Your most-visited links automatically rise to the top.
- **Glassmorphism UI:** A modern, frosted-glass aesthetic with snappy transitions.
- **PWA Ready:** Installable on desktop and mobile with full offline support.
- **Local-First:** All your data is stored securely in your browser's IndexedDB.

## Running Locally

To ensure the Service Worker and IndexedDB function correctly, Alcove must be served from a local web server (not opened as a file).

### Option 1: Using Node.js (Recommended)
```bash
# Install dependencies
npm install

# Build CSS
npx tailwindcss -i ./src/input.css -o ./dist/output.css

# Start server
npx serve .
```
Then open `http://localhost:3000`.

### Option 2: Using Python
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

## Permanent Offline Mode

Alcove is designed to be fully functional offline after a single visit.

### How to Verify
1. Visit the site once while the local server is running.
2. Stop your local server (press `Ctrl+C` in your terminal).
3. Refresh the page in your browser.
4. The application will continue to load and function perfectly from the local cache.

### How to Update
If you modify the source code, the browser will still show the "stale" version from the cache. To see your changes:
1. Open DevTools (`F12`).
2. Go to the **Application** tab.
3. Click **Service Workers** on the left.
4. Click **Update** or check **Update on reload**.
5. Alternatively, you can click **Storage** and then **Clear site data**.

## Keyboard Shortcuts
- `CMD+K` / `Ctrl+K`: Focus search bar.
- `ArrowDown` / `ArrowUp`: Navigate results.
- `Enter`: Open selected bookmark in a new tab.

## Project Structure
- `index.html`: The main application and UI.
- `sw.js`: Service Worker for offline caching.
- `db.js`: Database wrapper for IndexedDB.
- `ui.js`: UI logic and rendering.

*Note: For maximum performance, these files are integrated into the final index.html, but the individual JS files are kept for development and testing.*