/* =====================================================================
   Page rendering + transitions
   ===================================================================== */
(function () {
  const P = window.PROFILE;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Fill content from data.js ---------- */
  $("heroTag").textContent = P.tagline;
  $("aboutText").innerHTML = P.about.map((p) => `<p>${esc(p)}</p>`).join("");
  $("pfName").textContent = P.name;
  $("strengths").innerHTML = P.strengths.map((s) => `<li>${esc(s)}</li>`).join("");
  $("year").textContent = new Date().getFullYear();

  const bars = (arr) => arr.map((s) => `
    <div class="skill">
      <div class="bar-top"><span>${esc(s.name)}</span><span>Lv. ${s.level}</span></div>
      <div class="bar"><i data-w="${s.level}"></i></div>
      <p class="bar-note">${esc(s.note)}</p>
    </div>`).join("");
  $("langBars").innerHTML = bars(P.languages);
  $("fwBars").innerHTML = bars(P.frameworks);

  $("projectGrid").innerHTML = P.projects.map((p) => `
    <article class="card project reveal" data-cat="${esc(p.category)}" id="proj-${esc(p.id)}">
      <div class="p-cover"><span class="p-arc">${esc(p.arc)}</span><span class="p-kanji">${esc(p.kanji)}</span></div>
      <div class="p-body">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        <ul class="p-high">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
        <div class="p-tech">${p.tech.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        <div class="p-links">
          ${p.github ? `<a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ""}
          ${p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener">Live demo ↗</a>` : ""}
          <button class="p-ask" data-ask="Tell me about ${esc(p.title)}">Ask Aiko about this ✦</button>
        </div>
      </div>
    </article>`).join("");

  document.querySelectorAll("[data-ask]").forEach((b) => b.addEventListener("click", () => Assistant.ask(b.dataset.ask)));

  $("mailLink").href = `mailto:${P.email}`;
  $("mailText").textContent = P.email;
  $("phoneLink").href = `tel:${P.phoneIntl}`;
  $("phoneText").textContent = P.phone;
  $("copyEmail").addEventListener("click", async (e) => {
    const b = e.currentTarget.querySelector("b");
    try { await navigator.clipboard.writeText(P.email); b.textContent = "Copied! ✓"; }
    catch { b.textContent = P.email; }
    setTimeout(() => (b.textContent = "Copy email"), 2000);
  });

  /* ---------- Typewriter ---------- */
  const roles = ["Backend Programmer", "Python · PHP · JavaScript", "Django Developer", "React Native & Flutter", "API Builder", "Anime enjoyer 🍥"];
  let ri = 0, ci = 0, del = false;
  (function type() {
    const word = roles[ri];
    $("typer").textContent = word.slice(0, ci);
    if (!del && ci === word.length) { del = true; return setTimeout(type, 1600); }
    if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    ci += del ? -1 : 1;
    setTimeout(type, del ? 35 : 70);
  })();

  /* ---------- Scroll reveal ---------- */
  function show(el) {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.transitionDelay = Math.min(siblings.indexOf(el), 6) * 90 + "ms";
    el.classList.add("in");
    el.querySelectorAll(".bar i").forEach((b) => (b.style.width = b.dataset.w + "%"));
  }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    show(e.target);
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  const startReveals = () => document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92 && r.bottom > 0) show(el);   // already on screen → animate in now
    else io.observe(el);
  });
  // Wait for the anime intro to finish so the hero animates in right after it
  if (window.Intro && Intro.active) addEventListener("intro:done", startReveals, { once: true });
  else startReveals();
  ["introBtn", "introBtn2"].forEach((id) => $(id)?.addEventListener("click", () => Intro.play()));

  /* ---------- Active nav + scrolled state ---------- */
  const links = [...document.querySelectorAll(".nav-links a")];
  const secIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section").forEach((s) => secIO.observe(s));
  addEventListener("scroll", () => $("nav").classList.toggle("scrolled", scrollY > 30), { passive: true });

  $("burger").addEventListener("click", () => $("navLinks").classList.toggle("open"));
  links.forEach((a) => a.addEventListener("click", () => $("navLinks").classList.remove("open")));

  /* ---------- Project filters ---------- */
  $("filters").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b));
    const f = b.dataset.filter;
    document.querySelectorAll(".project").forEach((p, i) => {
      const show = f === "all" || p.dataset.cat === f;
      p.classList.add("hide"); p.classList.remove("in");
      if (show) { p.classList.remove("hide"); setTimeout(() => p.classList.add("in"), 30 + i * 70); }
    });
  });

  /* ---------- 3D tilt on project cards ---------- */
  if (matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".project").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transitionDelay = "0ms";
        card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", () => (card.style.transform = ""));
    });
  }

  /* ---------- Hero parallax ---------- */
  const emblem = document.querySelector(".emblem");
  addEventListener("pointermove", (e) => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    emblem.style.transform = `translate(${x * -24}px, ${y * -24}px)`;
  });

  /* ---------- Called by Aiko to point at a project ---------- */
  window.Portfolio = {
    highlight(id) {
      const el = $("proj-" + id); if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.animate([{ boxShadow: "0 0 0 0 transparent" }, { boxShadow: "0 0 0 6px var(--accent)" }, { boxShadow: "0 0 0 0 transparent" }],
        { duration: 1400, iterations: 2 });
    }
  };

  /* ---------- Preloader ---------- */
  addEventListener("load", () => setTimeout(() => $("preloader").classList.add("done"), window.Intro && Intro.active ? 0 : 1300));
  setTimeout(() => $("preloader").classList.add("done"), 4000); // safety
})();
