# App template

A working, empty web app. Storage, cloud sync, backup, an activity log and
installable-app behaviour are already wired up — it just has no features yet.

Click **Use this template** at the top of this repo to start a new app from it.

## What's here

| File | What it is |
|---|---|
| `index.html` | The whole app. Config at the top, app code in the middle, plumbing below. |
| `manifest.webmanifest` | Makes it installable with its own icon. |
| `sw.js` | Service worker. Network-first, so deploys show up immediately. |
| `make-icons.py` | Regenerates the icons. `python3 make-icons.py` |
| `icon-*.png` | App icons. |

## Starting a new app

1. **Use this template** → **Create a new repository** → name it → **Public** → create.
2. Edit the `APP` block at the top of `index.html`:
   - `title` — shown in the header
   - `key` — local storage key, must be unique per app
   - `dbPath` — the Firebase branch, must be unique per app (`workout/main`)
   - `build` — bump on every deploy
   - `links` — the repo and deploy-history links for the settings sheet
   Then change `APP_ID` at the top of `sw.js` to the app's name, lowercase,
   and the names in `manifest.webmanifest`.
3. Add the app's state to `data` and build the interface in `draw()`.
   Call `save()` whenever something changes; it stores locally and syncs.
   Call `log(kind, detail)` for every decision the app makes, and fill in
   `where()` and `appSummary()` so the activity log knows the app.
4. Add the new `dbPath` to the Firebase rules, keeping every app already
   listed there, then Publish.
5. The repo → **Settings** → **Pages** → **Deploy from a branch** → **main**,
   **/ (root)** → **Save**. The app is then at
   `https://eli-meyer42.github.io/<repo>/`, and every push redeploys it.

## Activity log

Built in. It records every tap, typing, sessions, sync and errors, plus
whatever the app logs itself, and sends it to the private repo
`Eli-Meyer42/shopping-logs` under `<app>/logs/<device>/` whenever the app is
left. It needs one GitHub token per device; a device that already has one
from another of these apps needs nothing.

## Rules worth keeping

- **Keep the repo public.** GitHub Pages on a private repo needs a paid plan.
- **Keep every path relative** (`./`) in the manifest and service worker.
  Pages serves each app from its own subfolder.
- **Give the service worker its own `APP_ID`.** Every app on the site shares
  one cache store, and a worker only clears caches that start with its id.
- **Never use `window.storage`.** It only exists inside Claude's preview; in a
  real deployment it fails silently and the app forgets everything.
- **Bump the build stamp every push.** It is the quickest way to confirm a
  deploy actually landed.
- **Keep the service worker network-first** for the page, or new deploys never
  reach the browser.
- The Firebase config is meant to be public. Security comes from the rules.
