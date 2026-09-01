/* GameOdyssey — site behaviour. Vanilla JS, no dependencies. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------
     Hero carousel (home page)
     ------------------------------------------------------------------ */
  var hero = document.querySelector(".hero");
  if (hero) {
    var track = hero.querySelector(".hero__track");
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-goto]"));
    var pauseBtn = hero.querySelector("[data-pause]");
    var count = slides.length;
    var index = 0;
    var timer = null;
    var userPaused = false;
    var INTERVAL = 7000;

    // Slide art beyond the first is lazy-loaded; make sure the slide being
    // shown and its neighbours are fetched so a jump never lands on black.
    function warm(i) {
      [i - 1, i, i + 1].forEach(function (n) {
        var s = slides[(n + count) % count];
        var img = s && s.querySelector(".slide__art img");
        if (img && img.loading === "lazy") img.loading = "eager";
      });
    }

    function show(i, focusDot) {
      index = (i + count) % count;
      warm(index);
      track.style.transform = "translateX(-" + index * 100 + "%)";
      slides.forEach(function (s, n) {
        s.setAttribute("aria-hidden", n === index ? "false" : "true");
      });
      dots.forEach(function (d, n) {
        d.classList.toggle("is-active", n === index);
        if (n === index) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      if (focusDot && dots[index]) dots[index].focus();
    }

    function start() {
      if (reduceMotion || userPaused || timer) return;
      timer = setInterval(function () { show(index + 1); }, INTERVAL);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restart() { stop(); start(); }

    hero.querySelectorAll("[data-dir]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        show(index + Number(btn.getAttribute("data-dir")));
        restart();
      });
    });
    dots.forEach(function (d, n) {
      d.addEventListener("click", function () { show(n); restart(); });
    });
    hero.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { show(index - 1, true); restart(); }
      if (e.key === "ArrowRight") { show(index + 1, true); restart(); }
    });

    // Pause while hovered / focused, and when the tab is hidden.
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", function (e) {
      if (!hero.contains(e.relatedTarget)) start();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    if (pauseBtn) {
      if (reduceMotion) {
        pauseBtn.hidden = true;
      } else {
        pauseBtn.addEventListener("click", function () {
          userPaused = !userPaused;
          pauseBtn.setAttribute("aria-pressed", String(userPaused));
          pauseBtn.setAttribute("aria-label", userPaused ? "Resume auto-play" : "Pause auto-play");
          if (userPaused) stop(); else start();
        });
      }
    }

    // Touch swipe.
    var touchX = null;
    track.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) { show(index + (dx < 0 ? 1 : -1)); restart(); }
      touchX = null;
    });

    show(0);
    start();
  }

  /* ------------------------------------------------------------------
     Screenshot lightbox (game pages)
     ------------------------------------------------------------------ */
  var galleryLinks = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (galleryLinks.length && typeof HTMLDialogElement === "function") {
    var dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.innerHTML =
      '<div class="lightbox__inner">' +
      '<img alt="">' +
      '<button type="button" class="lightbox__close" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L12 13.4l-6.3 6.3-1.4-1.4L10.6 12 4.3 5.7l1.4-1.4L12 10.6l6.3-6.3z"/></svg></button>' +
      '<button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Previous screenshot">' +
      '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg></button>' +
      '<button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Next screenshot">' +
      '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="m8.6 16.6 1.4 1.4 6-6-6-6-1.4 1.4 4.6 4.6z"/></svg></button>' +
      '<p class="lightbox__caption"></p>' +
      "</div>";
    document.body.appendChild(dlg);
    var lbImg = dlg.querySelector("img");
    var lbCap = dlg.querySelector(".lightbox__caption");
    var current = 0;

    function openAt(i) {
      current = (i + galleryLinks.length) % galleryLinks.length;
      var a = galleryLinks[current];
      lbImg.src = a.getAttribute("href");
      lbImg.alt = a.getAttribute("data-lightbox") || "";
      lbCap.textContent = a.getAttribute("data-lightbox") || "";
      if (!dlg.open) dlg.showModal();
    }
    galleryLinks.forEach(function (a, i) {
      a.addEventListener("click", function (e) { e.preventDefault(); openAt(i); });
    });
    dlg.querySelector(".lightbox__close").addEventListener("click", function () { dlg.close(); });
    dlg.querySelector(".lightbox__nav--prev").addEventListener("click", function () { openAt(current - 1); });
    dlg.querySelector(".lightbox__nav--next").addEventListener("click", function () { openAt(current + 1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") openAt(current - 1);
      if (e.key === "ArrowRight") openAt(current + 1);
    });
    if (galleryLinks.length < 2) {
      dlg.querySelectorAll(".lightbox__nav").forEach(function (b) { b.hidden = true; });
    }
  }

  /* ------------------------------------------------------------------
     Contact form: timestamp for the spam check, inline validation, and
     status messages after the PHP handler redirects back.
     ------------------------------------------------------------------ */
  var form = document.querySelector(".contact-form");
  if (form) {
    var ts = form.querySelector('input[name="ts"]');
    if (ts) ts.value = String(Date.now());

    var status = form.querySelector(".form-status");
    var params = new URLSearchParams(window.location.search);
    if (status && params.has("sent")) {
      status.textContent = "Thanks — your message has been sent. We'll get back to you soon.";
      status.className = "form-status is-ok";
      status.hidden = false;
    } else if (status && params.has("error")) {
      var reasons = {
        invalid: "Please check the form — every field is required and the email address must be valid.",
        mail: "Sorry, the message couldn't be sent right now. Please try again later or email us directly.",
        spam: "Your message was flagged as spam. If that's a mistake, please email us directly.",
      };
      status.textContent = reasons[params.get("error")] || reasons.mail;
      status.className = "form-status is-error";
      status.hidden = false;
    }
    if (params.has("sent") || params.has("error")) {
      history.replaceState(null, "", window.location.pathname);
    }

    form.addEventListener("submit", function (e) {
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (el) {
        var valid = el.checkValidity();
        el.setAttribute("aria-invalid", valid ? "false" : "true");
        if (!valid) ok = false;
      });
      if (!ok) {
        e.preventDefault();
        if (status) {
          status.textContent = "Please fill in every field with a valid email address.";
          status.className = "form-status is-error";
          status.hidden = false;
        }
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
      }
    });
  }
})();
