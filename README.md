# Ocean Arcade

Five ocean-themed games — Tic-Tac-Toe, Wordle, a prize wheel, a Connections-style
grouping game, and a crossword — in one app.

## Run it as a website (no install)

Just open `index.html` in a browser, or serve the folder statically:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Run it as a desktop app (Electron)

This turns the site into a real desktop app window with its own icon — no
browser tabs, no address bar.

### 1. Install dependencies

You need [Node.js](https://nodejs.org) (includes `npm`) installed. Then, from
this folder:

```bash
npm install
```

### 2. Run it in development mode

```bash
npm start
```

This opens the app in an Electron window immediately, using the source files
as-is. Great for testing changes.

### 3. Build an installer for your computer

```bash
npm run dist
```

This uses `electron-builder` to produce a real installer in the `dist/`
folder:

- **Windows** → `dist/Ocean Arcade Setup <version>.exe` (build this on Windows)
- **macOS** → `dist/Ocean Arcade-<version>.dmg` (build this on a Mac)
- **Linux** → `dist/Ocean Arcade-<version>.AppImage` and a `.deb`

> Electron-builder generally needs to run **on the OS you're targeting** —
> build the Windows installer on Windows, the macOS one on a Mac, etc. You can
> also target one platform specifically:
> `npm run dist:win`, `npm run dist:mac`, or `npm run dist:linux`.

Once built, double-click the installer to install Ocean Arcade like any other
desktop app — it'll get a Start Menu / Applications folder / desktop icon.

## Project structure

```
index.html          Home hub page
css/style.css        Shared ocean theme
js/common.js          Shared background + nav behavior
js/*.js                Game logic (one file per game)
games/*.html            Game pages
assets/icon.png           App icon
main.js / preload.js       Electron desktop wrapper
```
