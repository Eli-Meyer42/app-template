# App template

A working, empty web app. Storage, cloud sync that merges, daily online
backups, an activity log and installable-app behaviour are already wired up.
It just has no features yet.

Click **Use this template** at the top of this repo to start a new app from it.

## What's here

| File | What it is |
|---|---|
| `index.html` | The whole app. Config at the top, app code in the middle, plumbing below. |
| `manifest.webmanifest` | Makes it installable with its own icon. |
| `sw.js` | Service worker. The network gets 2.5 seconds, then the saved copy opens, so deploys show up at once and the app still opens with no signal. |
| `firebase-*-compat.js` | The sync library, kept in the repo so the app never waits on a CDN. |
| `make-icons.py` | Regenerates the icons. `python3 make-icons.py` |
| `icon-*.png` | App icons. |

## Starting a new app

1. **Use this template** → **Create a new repository** → name it → **Public** → create.
2. Edit the `APP` block at the top of `index.html`:
   - `title` — shown in the header
   - `key` — local storage key, must be unique per app
   - `dbPath` — the Firebase branch, must be unique per app (`workout/main`)
   - `buildN` and `build` — bump both on every deploy (`buildN` is a plain number)
   - `lists` — which fields of `data` are lists of records
   - `links` — the repo and deploy-history links for the settings sheet
   Then change `APP_ID` at the top of `sw.js` to the first part of `key`
   (`workout` for `workout-v1`), and the names in `manifest.webmanifest`.
3. Add the app's state to `data` and build the interface in `draw()`.
   Call `save()` whenever something changes; it stores locally and syncs.
   A list of records goes in a field named in `APP.lists`; `save()` gives each
   record an `id` and a change time. Start lists empty.
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

## How sync works

Each record in a list carries the time it last changed, a deleted record
leaves a dated marker, and every other field has its own change time. When
two devices meet, the copies are combined piece by piece: additions on both
sides are kept, the newer edit of each record wins, and a deletion only beats
a record that hasn't been touched since. On every connection the app fetches
the cloud's copy and merges before it writes anything.

A dated copy of the data goes to `<app>/state/<year>/` in the private repo
once a day, and again just before a restore or a wipe. Settings can restore
any of the last 14.

## Rules worth keeping

- **Bump `buildN` every push.** An older copy of the app (a revived browser
  tab, a stale cached page) refuses to save, sync or send once a newer build
  has run on the device. Without this an old copy can overwrite newer data.
- **Firebase drops blanks.** Empty lists, empty objects, `null` and `''` are
  not stored, so `{a:{}}` comes back as `{}`. Compare with `canon()`, never
  with `JSON.stringify`, and make test clouds strip blanks the same way.
- **Never write to the cloud before reading it** on a new connection.
- **Don't put starter records in a list.** Every device would add its own copy.

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
  reach the browser. It fetches the page with the browser cache off and only
  ever saves a successful answer.
- The Firebase config is meant to be public. Security comes from the rules.
