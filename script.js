/* =========================================================
   VILA JAVOR — interakcije
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Lucide ikonice ---------- */
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }
  if (document.readyState !== "loading") renderIcons();
  else document.addEventListener("DOMContentLoaded", renderIcons);
  window.addEventListener("load", renderIcons);

  /* ---------- Godina u futeru ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav (promena na skrol) ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobilni meni ---------- */
  var toggle = document.getElementById("nav-toggle");
  var links = document.getElementById("nav-links");
  function closeMenu() {
    if (!links || !toggle) return;
    links.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Otvori meni");
    document.body.style.overflow = "";
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Zatvori meni" : "Otvori meni");
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Reveal na skrol ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Utisci gostiju (slajder) ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".t-slide"));
  var dotsWrap = document.getElementById("t-dots");
  var prevBtn = document.getElementById("t-prev");
  var nextBtn = document.getElementById("t-next");
  var current = 0;
  var timer = null;

  if (slides.length) {
    slides.forEach(function (_, i) {
      var d = document.createElement("button");
      d.setAttribute("aria-label", "Utisak " + (i + 1));
      d.addEventListener("click", function () { go(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(d);
    });
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

    function go(n) {
      current = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle("active", i === current); });
      dots.forEach(function (d, i) { d.classList.toggle("active", i === current); });
    }
    function next() { go(current + 1); }
    function prev() { go(current - 1); }
    function restart() { if (timer) clearInterval(timer); timer = setInterval(next, 7000); }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });

    go(0);
    restart();
  }

  /* ---------- Galerija lightbox + navigacija ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbBody = document.getElementById("lightbox-body");
  var lbClose = document.getElementById("lightbox-close");
  var lbPrev = document.getElementById("lightbox-prev");
  var lbNext = document.getElementById("lightbox-next");
  var gSlots = Array.prototype.slice
    .call(document.querySelectorAll(".gallery .g-item image-slot"));
  var lbIndex = 0;

  function showAt(i) {
    if (!lbBody || !gSlots.length) return;
    lbIndex = (i + gSlots.length) % gSlots.length;
    lbBody.innerHTML = "";
    var clone = gSlots[lbIndex].cloneNode(true);
    clone.removeAttribute("id"); // izbegni duplikat id-a
    clone.setAttribute("shape", "rect");
    lbBody.appendChild(clone);
    renderIcons();
  }
  function openLightbox(i) {
    if (!lightbox || !gSlots.length) return;
    showAt(i);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    if (lbBody) lbBody.innerHTML = "";
    document.body.style.overflow = "";
  }
  function lbGo(step) { showAt(lbIndex + step); }

  document.querySelectorAll(".gallery .g-item").forEach(function (item) {
    item.addEventListener("click", function () {
      var slot = item.querySelector("image-slot");
      var i = gSlots.indexOf(slot);
      if (i > -1) openLightbox(i);
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbNext) lbNext.addEventListener("click", function (e) { e.stopPropagation(); lbGo(1); });
  if (lbPrev) lbPrev.addEventListener("click", function (e) { e.stopPropagation(); lbGo(-1); });
  // klik na samu sliku prelazi na sledeću, bez zatvaranja
  if (lbBody) lbBody.addEventListener("click", function (e) { e.stopPropagation(); lbGo(1); });
  if (lightbox) lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lightbox && lightbox.classList.contains("open")) {
      if (e.key === "ArrowRight") { lbGo(1); return; }
      if (e.key === "ArrowLeft") { lbGo(-1); return; }
    }
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- Kontakt formular (privremeno, bez slanja) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      var original = btn.textContent;
      btn.textContent = "Hvala! (privremeno — formular nije aktivan)";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
        form.reset();
      }, 3200);
    });
  }
})();
