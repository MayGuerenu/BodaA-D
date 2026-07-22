# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **static wedding-invitation website** (HTML/CSS/vanilla JS). There is no
package manager, no build step, no backend, and no database. The tracked files are `index.html`,
`styles.css`, `script.js`, and the `assets/` folder.

### Running the site (development)

Serve the files with any static HTTP server from the repo root, then open the printed URL:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Prefer serving over HTTP (not opening `index.html` via `file://`) because features like the
Clipboard API ("copiar alias/CBU") check `window.isSecureContext`, and audio playback behaves
better over HTTP.

### Notes / gotchas

- No dependencies to install and nothing to build; there is no lint/test/build tooling in the repo.
- The collaborative playlist persists guest songs in browser `localStorage` under the key
  `ariel-daiana-playlist-v1` (no server persistence).
- RSVP, "agendar fecha" (Google Calendar), and venue links are external deep links
  (`wa.me`, Google Calendar/Maps) that open in a new tab; they are not local services.
- The WhatsApp RSVP number in `script.js` is a placeholder (`5491100000000`).
