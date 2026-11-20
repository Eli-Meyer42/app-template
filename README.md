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
   - `links` — the repo and Netlify links for the settings sheet
3. Add the app's state to `data` and build the interface in `draw()`.
   Call `save()` whenever something changes; it stores locally and syncs.
4. Add the new `dbPath` to the Firebase rules, then Publish:
   ```json
   { "rules": {
     "lists":   { "main": { ".read": true, ".write": true } },
     "workout": { "main": { ".read": true, ".write": true } }
   } }
   ```
5. **app.netlify.com** → **Add new site** → **Import an existing project** →
   **GitHub** → pick the repo → build command blank, publish directory blank → **Deploy**.

## Rules worth keeping

- **Keep the repo public.** Netlify's free plan refuses to build commits from
  unrecognised contributors on private repos.
- **Never use `window.storage`.** It only exists inside Claude's preview; in a
  real deployment it fails silently and the app forgets everything.
- **Bump the build stamp every push.** It is the quickest way to confirm a
  deploy actually landed.
- **Keep the service worker network-first** for the page, or new deploys never
  reach the browser.
- The Firebase config is meant to be public. Security comes from the rules.
