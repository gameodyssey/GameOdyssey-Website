# GameOdyssey website

Static marketing site for GameOdyssey's browser games, plus the Unity WebGL
builds themselves. Plain HTML/CSS/JS with one PHP script for the contact form;
deploys to Hostinger shared hosting (or any Apache/LiteSpeed + PHP host) by
uploading the tree as-is.

## Layout

```
index.html, games.html, contact.html, privacy.html, terms.html, 404.html
games/<slug>.html        product page per game (generated)
play/<slug>/index.html   Unity WebGL wrapper (generated) + Build/, StreamingAssets/
assets/css|js|img|video|fonts
contact.php              contact-form handler (PHP mail())
.htaccess                MIME types for .wasm/.data, compression, caching, 404 page
tools/site.json          ALL site copy and per-game data. Edit this
tools/build.mjs          page generator:  node tools/build.mjs
tools/import-assets.py   one-off artwork import/optimiser (needs Pillow + the D: archive)
_legacy/                 the 2023 site and an old GoGammon build, kept for reference only.
                         Blocked from the web by .htaccess. Safe to delete once committed.
```

Game slugs: `backgammon`, `brain-drops`, `bug-me-not`, `v-type`, `vocabularious`,
`word-invader`, `poker` (poker has no build and is marked "coming back soon").

## Editing content

1. Change text, taglines, feature bullets, social links or the contact address in
   `tools/site.json`.
2. Run `node tools/build.mjs` (Node 18+). It rewrites every generated page and
   bumps the CSS/JS cache-buster.
3. Commit the generated HTML together with the JSON.

Hand-written files: `assets/css/site.css`, `assets/css/play.css`,
`assets/js/site.js`, `contact.php`, `.htaccess`.

To add a screenshot to a game, drop `NN.jpg` (≤1200px wide) and `NN-thumb.jpg`
(400px wide) into `assets/img/games/<slug>/shots/` and set `"shots": N` in
`site.json`. Backgammon currently has no screenshots (`"shots": 0`).

## Word Invader (HTML5 remake)

`play/wordinvader/` is the new HTML5 build of Word Invader (Phaser, bundled by
Vite; native size 1374×990, `scale.mode: FIT`). `site.json` points at it with
`"play": { "dir": "wordinvader", "html5": true, "width": 1374, "height": 990 }`
and `"unity": null`. The generator replaces Vite's bare `index.html` with the
site wrapper (GO bar, fullscreen button, a stage locked to the game's aspect
ratio) and finds the hashed `assets/index-*.js` bundle on disk.

To ship a new game build: copy the Vite `dist/` contents into `play/wordinvader/`
(delete the old `assets/index-*.js` first so only one bundle remains), then run
`node tools/build.mjs` to regenerate the wrapper.

**Important:** Hostinger's CDN drops some of the game's parallel asset requests,
which left textures (e.g. the background layers) silently missing on the live
site. The deployed bundle is patched to add
`loader: { maxParallelDownloads: 4, maxRetries: 10 }` to the Phaser game config.
Add the same `loader` block to the game's config in the WordInvader source so
future builds keep it — a fresh Vite build without it will regress. Converting
the 7.8 MB of .wav audio to .ogg/.mp3 would also cut load time a lot. The original Unity build is
kept in `play/wordinvader-pham/` but nothing links to it.

## Bob

Bob (the GO alien) walks across the white strip above the footer on the home,
games, contact and 404 pages. He's a pure-CSS sprite animation
(`assets/img/site/bob-walk.png`, 16 frames of 128×130, from the 2014 site's
`bobanimation.css`). The four walkers (direction, size, crossing time, walk
speed, start offset and depth) are defined in the `BOBS` array in
`tools/build.mjs`; the animation lives under "Bob's walk" in `site.css`. He's
hidden for visitors who prefer reduced motion, and only two walkers show on
phones.

## Deploying to Hostinger

* Upload everything except `_legacy/` and `tools/` to `public_html/`
  (they are 404-blocked anyway, but there's no reason to ship ~400 MB of them).
* The Unity builds are 14-44 MB per file. Use the File Manager's upload or
  FTP/SFTP; the git-deploy feature also works if the repo is under the size limit.
* `contact.php` sends with PHP `mail()` from `noreply@<your-domain>` to the
  address in `RECIPIENT` at the top of the file. Make sure that recipient mailbox
  exists (or is forwarded) in hPanel → Emails, otherwise messages bounce.
* Once the free SSL certificate is active, uncomment the HTTPS redirect block at
  the bottom of `.htaccess`.
* Each `play/<slug>/.htaccess` carries Unity's CORS headers for Unity Gaming
  Services; leave them in place.

## Known limitations

* **Backgammon** was built against Unity Gaming Services (Authentication /
  Cloud Save / Lobby). It stops at "Connecting…" with
  `invalid environment name provided` because the UGS project/environment it
  references no longer answers. That needs fixing in the Unity project and a
  rebuild; nothing on the website side can work around it. **Bug Me Not**
  ships the same UGS configuration and did not get past its splash screen in
  testing, so it very likely has the same problem. Brain Drops, V-Type,
  Vocabularious and Word Invader load and run offline.
* `play/bug-me-not/Build/` also contains a stray copy of the `GoGammon.*`
  Backgammon build (~60 MB) that nothing references. Delete it.
* Games are desktop-first (keyboard). The wrapper lets them run on phones but
  the games themselves were not designed for touch.
* `Arial Rounded MT Bold` (`assets/fonts/ARLRDBD.ttf`) is a Monotype/Microsoft
  font; confirm you hold a web-embedding licence, or swap it for a free
  lookalike such as Nunito/Varela Round in `site.css` (`--display`).
