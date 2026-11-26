/* Naath Industries: interactions & animations */
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

  /* ---------- Key Products dropdown (mobile tap) ---------- */
  document.querySelectorAll(".nav-dropdown-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        btn.closest(".nav-dropdown").classList.toggle("open");
      }
    });
  });

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

  /* ---------- "More from this department" carousel ---------- */
  document.querySelectorAll(".carousel").forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const cards = [...track.children];
    const dotsWrap = carousel.querySelector(".carousel-dots");
    const visible = () => Math.max(1, Math.round(track.clientWidth / cards[0].offsetWidth));
    const stops = () => Math.max(1, cards.length - visible() + 1);
    let current = 0;

    const renderDots = () => {
      dotsWrap.innerHTML = "";
      if (stops() < 2) return;
      for (let i = 0; i < stops(); i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
      }
      markDot();
    };
    const markDot = () =>
      [...dotsWrap.children].forEach((d, i) => d.classList.toggle("active", i === current));
    const goTo = (i) => {
      current = i;
      track.scrollTo({ left: cards[i].offsetLeft - track.offsetLeft - 2 });
      markDot();
    };

    track.addEventListener("scroll", () => {
      const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
      const i = Math.min(stops() - 1, Math.round(track.scrollLeft / step));
      if (i !== current) { current = i; markDot(); }
    }, { passive: true });
    window.addEventListener("resize", renderDots);
    renderDots();

    const delay = parseInt(carousel.dataset.autoplay, 10);
    if (delay && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      let paused = false;
      carousel.addEventListener("mouseenter", () => (paused = true));
      carousel.addEventListener("mouseleave", () => (paused = false));
      carousel.addEventListener("touchstart", () => (paused = true), { passive: true });
      setInterval(() => {
        if (!paused && stops() > 1) goTo((current + 1) % stops());
      }, delay);
    }
  });

  /* ---------- Team bios: "Read more" when longer than 4 lines ---------- */
  const bios = document.querySelectorAll(".person-bio");
  const fitBios = () =>
    bios.forEach((bio) => {
      let btn = bio.nextElementSibling;
      if (!btn || !btn.classList.contains("read-more")) {
        btn = document.createElement("button");
        btn.type = "button";
        btn.className = "read-more";
        btn.addEventListener("click", () => {
          const open = bio.classList.toggle("expanded");
          btn.textContent = open ? "Read less" : "Read more";
        });
        bio.after(btn);
      }
      const clipped = !bio.classList.contains("expanded") && bio.scrollHeight > bio.clientHeight + 1;
      btn.hidden = !clipped && !bio.classList.contains("expanded");
      if (!bio.classList.contains("expanded")) btn.textContent = "Read more";
    });
  if (bios.length) {
    fitBios();
    window.addEventListener("resize", fitBios);
    if (document.fonts) document.fonts.ready.then(fitBios);
  }

  /* ---------- World map (loads SVG, hover tooltip) ---------- */
  const worldMap = document.querySelector(".world-map");
  const mapHolder = document.querySelector(".world-map-holder");
  const mapTooltip = document.getElementById("mapTooltip");
  if (worldMap && mapHolder && mapTooltip) {
    const showTooltip = (label, clientX, clientY) => {
      const wrapRect = worldMap.getBoundingClientRect();
      mapTooltip.textContent = label;
      mapTooltip.classList.add("show");
      const tw = mapTooltip.offsetWidth;
      let x = clientX - wrapRect.left - tw / 2;
      x = Math.max(8, Math.min(x, wrapRect.width - tw - 8));
      mapTooltip.style.left = x + "px";
      mapTooltip.style.top = clientY - wrapRect.top - 48 + "px";
    };
    fetch(mapHolder.dataset.src)
      .then((r) => r.text())
      .then((svg) => {
        mapHolder.innerHTML = svg;
        mapHolder.querySelectorAll(".c").forEach((c) => {
          const name = c.getAttribute("data-name");
          c.addEventListener("mouseenter", (e) => showTooltip(name, e.clientX, e.clientY));
          c.addEventListener("mousemove", (e) => showTooltip(name, e.clientX, e.clientY));
          c.addEventListener("mouseleave", () => mapTooltip.classList.remove("show"));
          c.addEventListener("click", (e) => {
            e.stopPropagation();
            showTooltip(name, e.clientX, e.clientY);
          });
        });
      })
      .catch(() => {});
    document.addEventListener("click", () => mapTooltip.classList.remove("show"));
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

  /* ---------- WhatsApp button ---------- */
  const wa = document.querySelector(".wa-fab");
  if (wa) {
    const number = (wa.dataset.number || "").replace(/\D/g, "");
    if (number) {
      // on a product page, name the product in the opening message
      const onProduct = document.querySelector('a[href*="enquiry.html?product="]') && document.querySelector(".page-hero h1");
      const product = onProduct ? document.querySelector(".page-hero h1").textContent.trim().replace(/\.$/, "") : "";
      const message = product
        ? "Hello Naath Industries, I came across your website and would like to enquire about " + product + ". Please share more details."
        : "Hello Naath Industries, I came across your website and would like to make an enquiry. Please get in touch.";
      wa.href = "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
      wa.target = "_blank";
      wa.rel = "noopener";
    } else {
      wa.addEventListener("click", (e) => e.preventDefault());
      wa.title = "WhatsApp number coming soon";
    }
  }

  /* ---------- Enquiry form: three steps, sent to the inbox in data-email via FormSubmit ---------- */
  const form = document.getElementById("enquiryForm");
  if (form) {
    form.classList.add("is-js");
    const steps = [...form.querySelectorAll(".wz-step")];
    const labels = [...form.querySelectorAll(".wz-steps li")];
    const bar = form.querySelector(".wz-bar span");
    const back = form.querySelector(".wz-back");
    const next = form.querySelector(".wz-next");
    const skip = form.querySelector(".wz-skip");
    const send = form.querySelector(".wz-send");
    const note = document.getElementById("formNote");
    const success = document.getElementById("formSuccess");
    const summary = document.getElementById("wzSummary");
    let current = 0;

    const show = (i, focus = true) => {
      current = i;
      steps.forEach((s, n) => s.classList.toggle("is-active", n === i));
      labels.forEach((l, n) => {
        l.classList.toggle("is-current", n === i);
        l.classList.toggle("is-done", n < i);
      });
      bar.style.width = ((i + 1) / steps.length) * 100 + "%";
      back.hidden = i === 0;
      skip.hidden = i !== 0;
      next.hidden = i === 0 || i === steps.length - 1;
      send.hidden = i !== steps.length - 1;
      if (i === steps.length - 1) {
        const d = Object.fromEntries(new FormData(form).entries());
        summary.textContent = [d.product, d.company, d.email, d.phone].filter(Boolean).join("  ·  ");
      }
      if (focus) {
        const field = steps[i].querySelector("input:not([type=radio]), textarea");
        if (field && i > 0) setTimeout(() => field.focus({ preventScroll: true }), 250);
      }
    };

    // a step is fine to leave when its required fields are filled in correctly
    const valid = (i) => {
      for (const f of steps[i].querySelectorAll("[required]")) {
        if (!f.checkValidity()) {
          f.reportValidity();
          return false;
        }
      }
      return true;
    };
    const go = (i) => {
      for (let n = current; n < i; n++) if (!valid(n)) return show(n);
      show(i);
    };

    // product pages link here as enquiry.html?product=Wools etc.
    const preset = new URLSearchParams(window.location.search).get("product");
    const presetInput = preset && [...form.querySelectorAll('[name="product"]')].find((r) => r.value === preset);
    if (presetInput) presetInput.checked = true;
    show(presetInput ? 1 : 0, false);

    form.querySelectorAll('[name="product"]').forEach((r) =>
      r.addEventListener("change", () => setTimeout(() => show(1), 220))
    );
    labels.forEach((l, n) => l.addEventListener("click", () => n < current && show(n)));
    back.addEventListener("click", () => show(current - 1));
    skip.addEventListener("click", () => show(1));
    next.addEventListener("click", () => go(current + 1));
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && current < steps.length - 1) {
        e.preventDefault();
        go(current + 1);
      }
    });

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      for (let n = 0; n < steps.length; n++) if (!valid(n)) return show(n);
      const data = Object.fromEntries(new FormData(form).entries());
      if (data._honey) return; // filled by a bot
      delete data._honey;
      const payload = {
        _subject: "New enquiry: " + (data.product || "General") + " | " + (data.company || data.name),
        _template: "table",
        _captcha: "false",
        Name: data.name,
        Company: data.company,
        Email: data.email,
        Phone: data.phone,
        Product: data.product,
        Requirement: data.message,
        _replyto: data.email,
      };
      const sending = document.getElementById("formSending");
      const card = form.closest(".form-card");
      send.disabled = true;
      note.textContent = "";
      sending.hidden = false;
      card.classList.add("is-sending");

      // keepalive lets the request finish even if the visitor moves on
      const request = fetch("https://formsubmit.co/ajax/" + form.dataset.email, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        const out = await res.json().catch(() => ({}));
        if (!res.ok || String(out.success) !== "true") throw new Error(out.message || res.status);
      });
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));

      const failed = () => {
        sending.hidden = true;
        card.classList.remove("is-sending");
        form.hidden = false;
        success.hidden = true;
        send.disabled = false;
        note.innerHTML = 'Sorry, your enquiry could not be sent. Please email <a href="mailto:' + form.dataset.email + '">' + form.dataset.email + "</a> or message us on WhatsApp.";
      };

      // the mail service can be slow, so thank the visitor after a short wait
      // and let the request finish in the background
      const result = await Promise.all([
        Promise.race([request.then(() => "sent", () => "failed"), wait(2200).then(() => "pending")]),
        wait(900),
      ]).then(([r]) => r);
      if (result === "failed") return failed();
      sending.hidden = true;
      card.classList.remove("is-sending");
      form.hidden = true;
      success.hidden = false;
      if (result === "pending") request.catch(failed);
    });
  }
})();
