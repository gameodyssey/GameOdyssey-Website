#!/usr/bin/env node
/**
 * Static page generator for gameodyssey.com.
 *
 *   node tools/build.mjs
 *
 * Reads tools/site.json and writes:
 *   index.html, games.html, contact.html, privacy.html, terms.html, 404.html
 *   games/<slug>.html            - one product page per game
 *   play/<slug>/index.html       - Unity WebGL wrapper (playable games only)
 *
 * No dependencies. The output is plain HTML that deploys to any static or
 * PHP host (Hostinger shared hosting included).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(ROOT, "tools", "site.json"), "utf8"));
const { site, games } = data;
const YEAR = new Date().getFullYear();
const BUILD_ID = Date.now().toString(36); // cache-buster for css/js

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------------------------------------------------------------------------
// Shared chrome
// ---------------------------------------------------------------------------

function head({ rel, title, description, extraCss = [], canonical, image }) {
  const fullTitle = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">${image ? `\n  <meta property="og:image" content="${rel}${image}">` : ""}
  <meta name="theme-color" content="#14a4cf">
  <link rel="icon" href="${rel}favicon.ico" sizes="any">
  <link rel="icon" href="${rel}assets/img/site/favicon-64.png" type="image/png">
  <link rel="apple-touch-icon" href="${rel}assets/img/site/favicon-180.png">
  <link rel="preload" href="${rel}assets/fonts/ARLRDBD.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="${rel}assets/css/site.css?v=${BUILD_ID}">${extraCss
    .map((c) => `\n  <link rel="stylesheet" href="${rel}${c}?v=${BUILD_ID}">`)
    .join("")}
</head>`;
}

function socialLinks() {
  const s = site.social || {};
  const items = [];
  if (s.facebook) items.push(`<a href="${esc(s.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${ICON.facebook}</a>`);
  if (s.x) items.push(`<a href="${esc(s.x)}" target="_blank" rel="noopener" aria-label="X (Twitter)">${ICON.x}</a>`);
  if (s.youtube) items.push(`<a href="${esc(s.youtube)}" target="_blank" rel="noopener" aria-label="YouTube">${ICON.youtube}</a>`);
  return items.length ? `<div class="social">${items.join("")}</div>` : "";
}

function header(rel, active) {
  const nav = [
    ["home", `${rel}index.html`, "Home"],
    ["games", `${rel}games.html`, "Games"],
    ["contact", `${rel}contact.html`, "Contact"],
  ];
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href="${rel}index.html" aria-label="${esc(site.name)} home">
      <img src="${rel}assets/img/site/logo.png" alt="${esc(site.name)}: ${esc(site.tagline)}" width="250" height="71">
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      <ul>
        ${nav
          .map(
            ([key, href, label]) =>
              `<li><a href="${href}"${key === active ? ' aria-current="page"' : ""}>${label}</a></li>`
          )
          .join("\n        ")}
      </ul>
      ${socialLinks()}
    </nav>
  </div>
</header>`;
}

function footer(rel) {
  const s = site.social || {};
  const social = [
    s.facebook && `<li><a href="${esc(s.facebook)}" target="_blank" rel="noopener">Facebook</a></li>`,
    s.x && `<li><a href="${esc(s.x)}" target="_blank" rel="noopener">X / Twitter</a></li>`,
    s.youtube && `<li><a href="${esc(s.youtube)}" target="_blank" rel="noopener">YouTube</a></li>`,
  ].filter(Boolean);
  return `<footer class="site-footer">
  <div class="container site-footer__grid">
    <div>
      <h2 class="site-footer__heading">Main</h2>
      <ul>
        <li><a href="${rel}index.html">Home</a></li>
        <li><a href="${rel}games.html">Games</a></li>
        <li><a href="${rel}contact.html">Contact</a></li>
      </ul>
    </div>
    <div>
      <h2 class="site-footer__heading">Games</h2>
      <ul>
        ${games.map((g) => `<li><a href="${rel}games/${g.slug}.html">${esc(g.shortName)}</a></li>`).join("\n        ")}
      </ul>
    </div>
    ${
      social.length
        ? `<div>
      <h2 class="site-footer__heading">Social</h2>
      <ul>
        ${social.join("\n        ")}
      </ul>
    </div>`
        : ""
    }
    <div>
      <h2 class="site-footer__heading">Legal</h2>
      <ul>
        <li><a href="${rel}privacy.html">Privacy policy</a></li>
        <li><a href="${rel}terms.html">Terms of use</a></li>
      </ul>
    </div>
  </div>
  <div class="container site-footer__bottom">
    <p>© ${esc(site.company)} ${site.foundedYear}-${YEAR}</p>
    <p><a href="${rel}privacy.html">Privacy policy</a> | <a href="${rel}terms.html">Terms of use</a></p>
  </div>
</footer>
<script src="${rel}assets/js/site.js?v=${BUILD_ID}" defer></script>
</body>
</html>
`;
}

const ICON = {
  facebook: `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M17.5 3h3l-6.8 7.8L21.7 21h-6.2l-4.9-6.4L5 21H2l7.3-8.3L1.7 3H8l4.4 5.8L17.5 3zm-1.1 16.2h1.7L7.1 4.7H5.3l11.1 14.5z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M23 7.2c-.3-1-1-1.8-2-2C19.2 4.7 12 4.7 12 4.7s-7.2 0-9 .5c-1 .3-1.8 1-2 2C.5 9 .5 12 .5 12s0 3 .5 4.8c.3 1 1 1.8 2 2 1.8.5 9 .5 9 .5s7.2 0 9-.5c1-.3 1.8-1 2-2 .5-1.8.5-4.8.5-4.8s0-3-.5-4.8zM9.7 15.3V8.7l6 3.3-6 3.3z"/></svg>`,
  play: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>`,
  chevronL: `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>`,
  chevronR: `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="m8.6 16.6 1.4 1.4 6-6-6-6-1.4 1.4 4.6 4.6z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L12 13.4l-6.3 6.3-1.4-1.4L10.6 12 4.3 5.7l1.4-1.4L12 10.6l6.3-6.3z"/></svg>`,
};

// ---------------------------------------------------------------------------
// Reusable blocks
// ---------------------------------------------------------------------------

// Folder under play/ that holds the playable build. Defaults to the slug; a
// game can point elsewhere with "play": { "dir": "..." }. Used when a build
// ships its own index.html (e.g. the HTML5 Word Invader), in which case no
// Unity wrapper is generated for it.
const playDir = (g) => (g.play && g.play.dir) || g.slug;

function playButtons(g, rel, { primaryClass = "btn btn--primary", secondary = true } = {}) {
  const play = g.playable
    ? `<a class="${primaryClass}" href="${rel}play/${playDir(g)}/">${ICON.play} Play now</a>`
    : `<span class="${primaryClass} is-disabled" aria-disabled="true">${esc(g.status || "Unavailable")}</span>`;
  const learn = secondary ? `<a class="btn btn--ghost" href="${rel}games/${g.slug}.html">Learn more</a>` : "";
  return `${play}${learn}`;
}

function gameCard(g, rel) {
  return `<article class="game-card${g.playable ? "" : " game-card--soon"}">
  <a class="game-card__media" href="${rel}games/${g.slug}.html" tabindex="-1" aria-hidden="true">
    <img src="${rel}assets/img/games/${g.slug}/icon.png" alt="" width="200" height="200" loading="lazy">
  </a>
  <div class="game-card__body">
    <h3 class="game-card__title"><a href="${rel}games/${g.slug}.html">${esc(g.name)}</a></h3>
    <p class="game-card__text">${esc(g.oneLiner)}</p>
    <div class="game-card__actions">${playButtons(g, rel, { primaryClass: "btn btn--primary btn--sm" }).replace(
      'class="btn btn--ghost"',
      'class="btn btn--ghost btn--sm"'
    )}</div>
  </div>
</article>`;
}

function gamesGrid(rel, { exclude } = {}) {
  return `<div class="games-grid">
  ${games
    .filter((g) => g.slug !== exclude)
    .map((g) => gameCard(g, rel))
    .join("\n  ")}
</div>`;
}

// Bob, the GO alien, strolls back and forth across the strip, as he did on
// the 2014 site. Each walker: direction, scale, crossing time, walk-cycle
// speed, start delay, and how far up from the baseline he walks (depth).
const BOBS = [
  { dir: "ltr", s: 0.5, cross: 38, step: 1.4, delay: -6, bottom: 34 },
  { dir: "rtl", s: 0.55, cross: 44, step: 1.3, delay: -21, bottom: 30 },
  { dir: "ltr", s: 0.8, cross: 31, step: 1.5, delay: -14, bottom: 12 },
  { dir: "rtl", s: 1, cross: 26, step: 1.2, delay: -3, bottom: 0 },
];

function aliensStrip(rel) {
  const bobs = BOBS.map(
    (b) =>
      `<div class="bob-runner bob-runner--${b.dir}" style="--s:${b.s};--cross:${b.cross}s;--step:${b.step}s;--delay:${b.delay}s;--bottom:${b.bottom}px"><div class="bob"></div></div>`
  ).join("\n    ");
  return `<div class="bob-strip" aria-hidden="true">
  <div class="bob-stage">
    ${bobs}
  </div>
</div>`;
}

// Featured third-party title (currently Immortal Unchained) with an age check
// before following the external link. Configured in site.json → site.featured.
function featuredSection(rel) {
  const f = site.featured;
  if (!f) return "";
  return `<section class="section section--tint" id="featured">
    <div class="container">
      <article class="featured">
        <a class="featured__media" href="${esc(f.url)}" data-age-gate="${f.minAge || 0}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
          <img src="${rel}${f.image}" alt="" width="920" height="430" loading="lazy">
        </a>
        <div class="featured__body">
          <p class="featured__kicker">Featured</p>
          <h2 class="section__title">${esc(f.title)}</h2>
          <p>${esc(f.text)}</p>
          <a class="btn btn--primary" href="${esc(f.url)}" data-age-gate="${f.minAge || 0}" target="_blank" rel="noopener">${esc(f.linkText || "Read on")}</a>
        </div>
      </article>
    </div>
  </section>
  <dialog class="age-gate" id="age-gate" aria-labelledby="age-gate-title">
    <form method="dialog" class="age-gate__inner">
      <h2 id="age-gate-title">Are you over ${f.minAge || 16}?</h2>
      <p>You must be ${f.minAge || 16} years of age or older to view this page. Please confirm your age to continue.</p>
      <div class="age-gate__actions">
        <button type="submit" class="btn btn--primary" value="yes">Yes, I'm ${f.minAge || 16} or over</button>
        <button type="submit" class="btn btn--ghost" value="no">No, I'm under ${f.minAge || 16}</button>
      </div>
    </form>
  </dialog>`;
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

function homePage() {
  const rel = "";
  const slides = games
    .map((g, i) => {
      const exhaust = g.exhaust
        ? `<span class="exhaust" style="--x:${g.exhaust.x}%;--y:${g.exhaust.y}%" aria-hidden="true"><i></i><i></i></span>`
        : "";
      return `<li class="slide" data-index="${i}" aria-roledescription="slide" aria-label="${i + 1} of ${games.length}: ${esc(g.name)}"${
        i === 0 ? "" : ' aria-hidden="true"'
      }>
        <div class="slide__art">
          <img src="${rel}assets/img/games/${g.slug}/banner.jpg" srcset="${rel}assets/img/games/${g.slug}/banner-960.jpg 960w, ${rel}assets/img/games/${g.slug}/banner.jpg 1920w" sizes="100vw" alt="" width="1920" height="600"${
            i === 0 ? ' fetchpriority="high"' : ' fetchpriority="low"'
          }>
          ${exhaust}
        </div>
        <div class="slide__panel">
          <p class="slide__kicker">${esc(g.tagline)}</p>
          <h2 class="slide__title">${esc(g.name)}</h2>
          <p class="slide__text">${esc(g.blurb[0])}</p>
          <div class="slide__actions">${playButtons(g, rel)}</div>
        </div>
      </li>`;
    })
    .join("\n      ");

  const dots = games
    .map(
      (g, i) =>
        `<button type="button" class="hero-nav__btn${i === 0 ? " is-active" : ""}" data-goto="${i}" aria-label="Show ${esc(g.name)}"${
          i === 0 ? ' aria-current="true"' : ""
        }><img src="${rel}assets/img/games/${g.slug}/icon.png" alt="" width="56" height="56"></button>`
    )
    .join("\n      ");

  return `${head({
    rel,
    title: "",
    description: "Free browser games from GameOdyssey: Backgammon, Brain Drops, Bug Me Not, V-Type, Vocabularious and Word Invader. No download and no sign-up, just play.",
    image: "assets/img/games/word-invader/banner.jpg",
  })}
<body class="page-home">
${header(rel, "home")}
<main id="main">
  <section class="hero" aria-roledescription="carousel" aria-label="Featured games">
    <div class="hero__viewport">
      <ul class="hero__track">
      ${slides}
      </ul>
      <button type="button" class="hero__arrow hero__arrow--prev" data-dir="-1" aria-label="Previous game">${ICON.chevronL}</button>
      <button type="button" class="hero__arrow hero__arrow--next" data-dir="1" aria-label="Next game">${ICON.chevronR}</button>
    </div>
    <div class="hero-nav" role="group" aria-label="Choose a game">
      ${dots}
      <button type="button" class="hero-nav__pause" data-pause aria-pressed="false" aria-label="Pause auto-play"></button>
    </div>
  </section>

  <section class="section" id="games">
    <div class="container">
      <div class="section__head">
        <h2 class="section__title">Our games</h2>
        <p class="section__lead">Our classic games, playable right here in your browser. Desktop with a keyboard recommended.</p>
      </div>
      ${gamesGrid(rel)}
    </div>
  </section>

  ${featuredSection(rel)}

  <section class="section" id="about">
    <div class="container about">
      <div class="about__text">
        <h2 class="section__title">We are what we play</h2>
        ${site.about.map((p) => `<p>${esc(p)}</p>`).join("\n        ")}
        <p><a class="btn btn--primary" href="${rel}games.html">Browse the games</a></p>
      </div>
      <figure class="about__figure">
        <img src="${rel}assets/img/site/cinema.jpg" alt="The GO aliens settle in at the cinema" width="1200" height="657" loading="lazy">
      </figure>
    </div>
  </section>

  ${aliensStrip(rel)}
</main>
${footer(rel)}`;
}

// ---------------------------------------------------------------------------
// Games index
// ---------------------------------------------------------------------------

function gamesPage() {
  const rel = "";
  return `${head({
    rel,
    title: "Games",
    description: "All GameOdyssey games: Backgammon, Brain Drops, Bug Me Not, V-Type, Vocabularious, Word Invader and Poker.",
  })}
<body class="page-games">
${header(rel, "games")}
<main id="main">
  <section class="section">
    <div class="container">
      <div class="section__head">
        <h1 class="section__title">Our games</h1>
        <p class="section__lead">Everything GameOdyssey has made, in one place. Playable games run in your browser with no download or account.</p>
      </div>
      ${gamesGrid(rel)}
    </div>
  </section>
  ${aliensStrip(rel)}
</main>
${footer(rel)}`;
}

// ---------------------------------------------------------------------------
// Game product page
// ---------------------------------------------------------------------------

function gamePage(g) {
  const rel = "../";
  const img = `${rel}assets/img/games/${g.slug}`;
  const shots = [];
  for (let i = 1; i <= g.shots; i++) {
    const n = String(i).padStart(2, "0");
    shots.push(
      `<li><a href="${img}/shots/${n}.jpg" class="gallery__item" data-lightbox="${esc(g.name)} screenshot ${i}"><img src="${img}/shots/${n}-thumb.jpg" alt="${esc(g.name)} screenshot ${i}" width="400" height="300" loading="lazy"></a></li>`
    );
  }
  const poster = g.shots ? `${img}/shots/01.jpg` : `${img}/banner.jpg`;
  const exhaust = g.exhaust ? "" : ""; // hero art on product pages has no ship; flicker lives on the home banner

  return `${head({
    rel,
    title: g.name,
    description: `${g.name}: ${g.oneLiner} ${g.blurb[0]}`,
    image: `assets/img/games/${g.slug}/banner.jpg`,
  })}
<body class="page-game" data-game="${g.slug}" style="--accent:${g.accent}">
${header(rel, "games")}
<main id="main">
  <section class="game-hero">
    <img class="game-hero__bg" src="${img}/hero.jpg" srcset="${img}/hero-960.jpg 960w, ${img}/hero.jpg 1920w" sizes="100vw" alt="" width="1920" height="1755" style="object-position:${g.heroPosition || "center"}" fetchpriority="high">
    <div class="container game-hero__inner">
      <img class="game-hero__logo" src="${img}/logo.png" alt="${esc(g.name)}" width="800" height="300" fetchpriority="high">
      <p class="game-hero__tagline">${esc(g.tagline)}</p>
      <div class="game-hero__actions">
        ${playButtons(g, rel, { primaryClass: "btn btn--primary btn--lg", secondary: false })}
        <a class="btn btn--ghost btn--lg" href="#trailer">Watch the trailer</a>
      </div>
      ${g.playable ? "" : `<p class="game-hero__note">${esc(g.name)} isn't available to play at the moment. Check back soon.</p>`}
    </div>
    ${exhaust}
  </section>

  <section class="section">
    <div class="container game-about">
      <div class="game-about__text">
        <h2 class="section__title">About ${esc(g.shortName)}</h2>
        ${g.blurb.map((p) => `<p>${esc(p)}</p>`).join("\n        ")}
      </div>
      <aside class="game-about__aside">
        <img src="${img}/icon.png" alt="" width="200" height="200" loading="lazy">
        <ul class="feature-list">
          ${g.features.map((f) => `<li>${esc(f)}</li>`).join("\n          ")}
        </ul>
        ${g.playable ? `<p class="feature-list__note">Plays in the browser on desktop. Keyboard recommended.</p>` : ""}
      </aside>
    </div>
  </section>

  <section class="section section--tint" id="trailer">
    <div class="container">
      <h2 class="section__title">Trailer</h2>
      <div class="video-frame">
        <video controls preload="none" playsinline poster="${poster}" width="1280" height="720">
          <source src="${rel}assets/video/${g.slug}.mp4" type="video/mp4">
          Your browser can't play this video. <a href="${rel}assets/video/${g.slug}.mp4">Download the trailer</a> instead.
        </video>
      </div>
    </div>
  </section>

  ${
    shots.length
      ? `<section class="section" id="screenshots">
    <div class="container">
      <h2 class="section__title">Screenshots</h2>
      <ul class="gallery">
        ${shots.join("\n        ")}
      </ul>
    </div>
  </section>`
      : ""
  }

  <section class="game-cta">
    <div class="container game-cta__inner">
      <p class="game-cta__text">${esc(g.tagline)}</p>
      ${playButtons(g, rel, { primaryClass: "btn btn--primary btn--lg", secondary: false })}
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2 class="section__title">More games</h2>
      ${gamesGrid(rel, { exclude: g.slug })}
    </div>
  </section>
</main>
${footer(rel)}`;
}

// ---------------------------------------------------------------------------
// Unity WebGL wrapper
// ---------------------------------------------------------------------------

function playPage(g) {
  const rel = "../../";
  const u = g.unity;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Play ${esc(g.name)} · ${esc(site.name)}</title>
  <meta name="description" content="Play ${esc(g.name)} free in your browser. ${esc(g.oneLiner)}">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#111214">
  <link rel="icon" href="${rel}favicon.ico" sizes="any">
  <link rel="stylesheet" href="${rel}assets/css/play.css?v=${BUILD_ID}">
</head>
<body>
  <header class="play-bar">
    <a class="play-bar__back" href="${rel}games/${g.slug}.html">&larr; Back to ${esc(site.name)}</a>
    <span class="play-bar__title">${esc(g.name)}</span>
    <button type="button" class="play-bar__btn" id="unity-fullscreen-button" disabled>Fullscreen</button>
  </header>

  <main class="play-stage">
    <div id="unity-container" class="unity-desktop" style="--w:${u.width};--h:${u.height}">
      <canvas id="unity-canvas" width="${u.width}" height="${u.height}" tabindex="-1"></canvas>
      <div id="unity-loading-bar">
        <img class="loading-logo" src="${rel}assets/img/games/${g.slug}/icon.png" alt="" width="96" height="96">
        <p class="loading-text">Loading ${esc(g.name)}…</p>
        <div id="unity-progress-bar-empty"><div id="unity-progress-bar-full"></div></div>
        <p class="loading-hint">First load downloads the game (a few tens of MB). It's cached after that.</p>
      </div>
      <div id="unity-warning"></div>
    </div>
    <p class="play-note">Best played on a desktop or laptop with a keyboard. Click the game once so it can receive key presses.</p>
  </main>

  <script>
    var container = document.querySelector("#unity-container");
    var canvas = document.querySelector("#unity-canvas");
    var loadingBar = document.querySelector("#unity-loading-bar");
    var progressBarFull = document.querySelector("#unity-progress-bar-full");
    var fullscreenButton = document.querySelector("#unity-fullscreen-button");
    var warningBanner = document.querySelector("#unity-warning");

    function unityShowBanner(msg, type) {
      function updateBannerVisibility() {
        warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
      }
      var div = document.createElement('div');
      div.innerHTML = msg;
      warningBanner.appendChild(div);
      if (type == 'error') div.className = 'is-error';
      else {
        if (type == 'warning') div.className = 'is-warning';
        setTimeout(function() {
          warningBanner.removeChild(div);
          updateBannerVisibility();
        }, 5000);
      }
      updateBannerVisibility();
    }

    var buildUrl = "Build";
    var loaderUrl = buildUrl + "/${u.build}.loader.js";
    var config = {
      dataUrl: buildUrl + "/${u.build}.data",
      frameworkUrl: buildUrl + "/${u.build}.framework.js",
      codeUrl: buildUrl + "/${u.build}.wasm",
      streamingAssetsUrl: "StreamingAssets",
      companyName: "${esc(site.company)}",
      productName: "${esc(g.name)}",
      productVersion: "1.0",
      showBanner: unityShowBanner,
    };

    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      // Mobile: fill the whole client area with the canvas.
      container.className = "unity-mobile";
      canvas.className = "unity-mobile";
      document.body.classList.add("is-mobile");
      // Lower the render resolution a little on phones for smoother play.
      config.devicePixelRatio = 1;
    }

    loadingBar.style.display = "flex";

    var script = document.createElement("script");
    script.src = loaderUrl;
    script.onload = function () {
      createUnityInstance(canvas, config, function (progress) {
        progressBarFull.style.width = 100 * progress + "%";
      }).then(function (unityInstance) {
        loadingBar.style.display = "none";
        fullscreenButton.disabled = false;
        fullscreenButton.onclick = function () { unityInstance.SetFullscreen(1); };
        canvas.focus();
      }).catch(function (message) {
        unityShowBanner(message, 'error');
      });
    };
    script.onerror = function () {
      unityShowBanner("The game files could not be loaded. Please try again later.", 'error');
    };
    document.body.appendChild(script);
  </script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Contact / legal / 404
// ---------------------------------------------------------------------------

function contactPage() {
  const rel = "";
  return `${head({ rel, title: "Contact", description: `Get in touch with ${site.company}.` })}
<body class="page-contact">
${header(rel, "contact")}
<main id="main">
  <section class="section">
    <div class="container contact">
      <div class="contact__intro">
        <h1 class="section__title">Contact</h1>
        <p>Found a bug, got a question, or just want to say hello? Drop us a line and we'll get back to you.</p>
        <p class="contact__email">Or email us directly: <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a></p>
      </div>
      <form class="contact-form" method="post" action="contact.php" novalidate>
        <p class="form-status" role="status" aria-live="polite" hidden></p>
        <div class="field">
          <label for="name">Name</label>
          <input id="name" name="name" type="text" autocomplete="name" required maxlength="100">
        </div>
        <div class="field">
          <label for="email">Email address</label>
          <input id="email" name="email" type="email" autocomplete="email" required maxlength="200">
        </div>
        <div class="field">
          <label for="subject">Subject</label>
          <input id="subject" name="subject" type="text" required maxlength="150">
        </div>
        <div class="field">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="8" required maxlength="5000"></textarea>
        </div>
        <div class="field field--hp" aria-hidden="true">
          <label for="website">Leave this field empty</label>
          <input id="website" name="website" type="text" tabindex="-1" autocomplete="off">
        </div>
        <input type="hidden" name="ts" value="">
        <button class="btn btn--primary btn--lg" type="submit">Send message</button>
      </form>
    </div>
  </section>
  ${aliensStrip(rel)}
</main>
${footer(rel)}`;
}

function legalPage({ file, title, body }) {
  const rel = "";
  return `${head({ rel, title, description: `${title} for ${site.name}.` })}
<body class="page-legal">
${header(rel, "")}
<main id="main">
  <section class="section">
    <div class="container prose">
      <h1 class="section__title">${esc(title)}</h1>
      ${body}
    </div>
  </section>
</main>
${footer(rel)}`;
}

const PRIVACY = `
<p class="prose__meta">Last updated: ${new Date().toISOString().slice(0, 10)}</p>
<p>This policy explains what ${esc(site.company)} ("we", "us") collects when you use ${esc(site.name)} (this website) and how it is used.</p>
<h2>What we collect</h2>
<ul>
  <li><strong>Contact form.</strong> If you write to us we receive the name, email address, subject and message you enter, so that we can reply. We keep these messages only for as long as needed to deal with your enquiry.</li>
  <li><strong>Server logs.</strong> Like most websites, our hosting provider records standard request logs (IP address, browser type, pages requested, time). These are used for security and to keep the site running and are retained for a limited period by the host.</li>
  <li><strong>Games.</strong> Our browser games run entirely on your device. They do not require an account. Some games may keep settings or scores in your browser's local storage; that data never leaves your device.</li>
</ul>
<h2>Cookies and analytics</h2>
<p>This website does not set tracking cookies and does not use third-party analytics or advertising. Embedded trailers are served from this site, not from a video platform.</p>
<h2>Sharing</h2>
<p>We do not sell or share your personal data. We only disclose information where required by law.</p>
<h2>Your rights</h2>
<p>You can ask us what personal data we hold about you, and ask us to correct or delete it, by emailing <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>.</p>
<h2>Children</h2>
<p>Our games are suitable for a general audience. We do not knowingly collect personal data from children; the only place you can send us data is the contact form.</p>
<h2>Changes</h2>
<p>If we change this policy we will update this page and the date above.</p>`;

const TERMS = `
<p class="prose__meta">Last updated: ${new Date().toISOString().slice(0, 10)}</p>
<h2>Using this site</h2>
<p>${esc(site.name)} and the games on it are provided by ${esc(site.company)} free of charge for your personal, non-commercial enjoyment. By using the site you agree to these terms.</p>
<h2>Intellectual property</h2>
<p>All games, artwork, trailers, names and logos on this site are the property of ${esc(site.company)} or its licensors and are protected by copyright and trademark law. You may not copy, redistribute, modify, reverse-engineer or host the games or assets elsewhere without our written permission.</p>
<h2>Availability</h2>
<p>We aim to keep the site and games available, but they are provided "as is" and "as available". We may change, suspend or withdraw any game or feature at any time without notice.</p>
<h2>No warranty and limitation of liability</h2>
<p>To the fullest extent permitted by law, ${esc(site.company)} excludes all warranties and will not be liable for any loss or damage arising from your use of, or inability to use, the site or games.</p>
<h2>Acceptable use</h2>
<p>You must not attempt to disrupt the site, gain unauthorised access to it, or use it for anything unlawful.</p>
<h2>Contact</h2>
<p>Questions about these terms: <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>.</p>`;

function notFoundPage() {
  // Served by Apache's ErrorDocument from any depth, so use root-absolute paths.
  const rel = "/";
  return `${head({ rel, title: "Page not found", description: "That page doesn't exist." })}
<body class="page-404">
${header(rel, "")}
<main id="main">
  <section class="section">
    <div class="container prose" style="text-align:center">
      <h1 class="section__title">Lost in space</h1>
      <p>That page has tumbled through a worm hole. Try one of these instead:</p>
      <p><a class="btn btn--primary" href="/index.html">Home</a> <a class="btn btn--ghost" href="/games.html">Games</a></p>
    </div>
  </section>
  ${aliensStrip(rel)}
</main>
${footer(rel)}`;
}

// ---------------------------------------------------------------------------
// Write everything
// ---------------------------------------------------------------------------

function write(relPath, content) {
  const full = join(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, "utf8");
  console.log("wrote", relPath);
}

write("index.html", homePage());
write("games.html", gamesPage());
write("contact.html", contactPage());
write("privacy.html", legalPage({ file: "privacy.html", title: "Privacy policy", body: PRIVACY }));
write("terms.html", legalPage({ file: "terms.html", title: "Terms of use", body: TERMS }));
write("404.html", notFoundPage());
for (const g of games) {
  write(`games/${g.slug}.html`, gamePage(g));
  if (g.playable && g.unity) {
    const dir = join(ROOT, "play", playDir(g));
    if (!existsSync(join(dir, "Build"))) {
      console.warn(`!! play/${playDir(g)}/Build is missing; wrapper written anyway`);
    }
    write(`play/${playDir(g)}/index.html`, playPage(g));
  } else if (g.playable && !existsSync(join(ROOT, "play", playDir(g), "index.html"))) {
    console.warn(`!! play/${playDir(g)}/index.html is missing; "Play now" for ${g.name} will 404`);
  }
}
