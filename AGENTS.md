# Offline package maintenance

After changing public HTML, CSS, JavaScript, images, audio, or video, run
`python tools/build-offline-manifest.py` from the repository root and include
the updated `offline-manifest.js` in the same publication. The script also adds
the Offline bootstrap to new lesson pages. See `OFFLINE.md` for details.

Keep the uploaded game files under `assets/games` unchanged unless the user
asks to edit the game. The builder does not inject markup into those files.

YouTube, Wordwall and ChatGPT require Internet; do not describe their embedded
or linked content as available offline. Test Offline under the GitHub Pages
subpath `/english-classroom/`, including query-string unit selection and media
byte ranges, whenever the service worker or offline package logic changes.
