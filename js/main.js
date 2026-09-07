/* Naath Industries — interactions & animations */
(function () {
  "use strict";

  /* ---------- Nav ---------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      nav.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        nav.classList.remove("open");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- Scroll reveal ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal, .legacy-visual").forEach((el) => revealObserver.observe(el));

  /* ---------- Animated counters ---------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.firstChild.textContent = Math.round(target * easeOut(p)).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCount(e.target);
          countObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

  /* ---------- Hero scene slideshow ---------- */
  const scenes = document.querySelectorAll(".hero-scenes .scene");
  if (scenes.length) {
    let idx = 0;
    setInterval(() => {
      scenes[idx].classList.remove("active");
      idx = (idx + 1) % scenes.length;
      scenes[idx].classList.add("active");
    }, 6000);
  }

  /* ---------- Rotating word ---------- */
  const rotator = document.querySelector(".rotator");
  if (rotator) {
    const words = rotator.querySelectorAll("span");
    let w = 0;
    setInterval(() => {
      words[w].classList.remove("show");
      w = (w + 1) % words.length;
      words[w].classList.add("show");
    }, 2800);
  }

  /* ---------- Floating particles (leaves / fibres) ---------- */
  const canvas = document.getElementById("leafCanvas");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const ctx = canvas.getContext("2d");
    let W, H, particles;

    const COLORS = ["rgba(52,211,153,", "rgba(212,169,78,", "rgba(209,250,229,"];

    function resize() {
      W = canvas.width = canvas.offsetWidth * devicePixelRatio;
      H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function makeParticle(seedY) {
      return {
        x: Math.random() * W,
        y: seedY !== undefined ? seedY : Math.random() * H,
        r: (2 + Math.random() * 4) * devicePixelRatio,
        vx: (0.1 + Math.random() * 0.25) * devicePixelRatio,
        vy: (-0.15 - Math.random() * 0.3) * devicePixelRatio,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.004 + Math.random() * 0.008,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        alpha: 0.15 + Math.random() * 0.35,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: 46 }, () => makeParticle());
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.4 * devicePixelRatio;
        p.y += p.vy;
        if (p.y < -20 || p.x > W + 20) {
          Object.assign(p, makeParticle(H + 10));
        }
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r, p.r * 0.62, p.sway, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ")";
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }

    init();
    window.addEventListener("resize", init);
    requestAnimationFrame(tick);
  }

  /* ---------- Enquiry form (mailto handoff) ---------- */
  const form = document.getElementById("enquiryForm");
  if (form) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent(
        "Enquiry — " + (data.get("product") || "General") + " — " + (data.get("company") || data.get("name"))
      );
      const lines = [];
      for (const [k, v] of data.entries()) {
        if (String(v).trim()) lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ": " + v);
      }
      const body = encodeURIComponent(lines.join("\n"));
      window.location.href = "mailto:" + (form.dataset.email || "") + "?subject=" + subject + "&body=" + body;
      const note = document.getElementById("formNote");
      if (note) note.textContent = "Opening your email client to send the enquiry…";
    });
  }
})();
