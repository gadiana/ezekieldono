/* =====================================================================
   Anime opening ("OP") intro — plays when the site opens.
   • Built-in cinematic made with code: speed lines, title slams,
     tech cuts, sakura burst, episode title card.
   • Or set INTRO_CONFIG.video (js/config.js) to play your own video file.
   • Skip with the button, a click, Esc, Enter or Space.
   ===================================================================== */
(function () {
  const CFG = window.INTRO_CONFIG || {};
  const P = window.PROFILE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KEY = "jeg-intro-seen";
  let el, stage, canvas, ctx, raf, timers = [], lineMode = "radial", running = false;

  /* ---------------- tiny synth for sound effects (Web Audio) ---------------- */
  let audio = null, soundOn = false;
  function ac() { if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {} } return audio; }
  function sfx(type) {
    const a = ac(); if (!a || !soundOn || a.state !== "running") return;
    const t = a.currentTime, g = a.createGain(); g.connect(a.destination);
    if (type === "hit") {                       // punchy impact
      const o = a.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(40, t + .35);
      g.gain.setValueAtTime(.9, t); g.gain.exponentialRampToValueAtTime(.001, t + .4);
      o.connect(g); o.start(t); o.stop(t + .42);
    } else if (type === "whoosh") {             // filtered noise sweep
      const len = a.sampleRate * .45, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = a.createBufferSource(), f = a.createBiquadFilter();
      src.buffer = buf; f.type = "bandpass"; f.Q.value = 1.2;
      f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(4000, t + .4);
      g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + .45);
      src.connect(f); f.connect(g); src.start(t);
    } else if (type === "chime") {              // sparkly ending
      [880, 1320, 1760].forEach((fr, i) => {
        const o = a.createOscillator(), gg = a.createGain(); o.type = "triangle"; o.frequency.value = fr;
        gg.gain.setValueAtTime(0, t + i * .08); gg.gain.linearRampToValueAtTime(.25, t + i * .08 + .02);
        gg.gain.exponentialRampToValueAtTime(.001, t + i * .08 + 1.2);
        o.connect(gg); gg.connect(a.destination); o.start(t + i * .08); o.stop(t + i * .08 + 1.3);
      });
    }
  }

  /* ---------------- speed lines ---------------- */
  function drawLines() {
    const W = canvas.width = innerWidth, H = canvas.height = innerHeight;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ff4f93";
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      if (lineMode === "radial") {
        const cx = W / 2, cy = H / 2, R = Math.hypot(W, H);
        for (let i = 0; i < 90; i++) {
          const a = Math.random() * Math.PI * 2, r0 = R * (.18 + Math.random() * .25), w = Math.random() * .012 + .002;
          ctx.fillStyle = i % 6 === 0 ? accent : "rgba(255,255,255,.85)";
          ctx.globalAlpha = Math.random() * .6 + .2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          ctx.lineTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R);
          ctx.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R);
          ctx.fill();
        }
      } else if (lineMode === "horizontal") {
        for (let i = 0; i < 60; i++) {
          const y = Math.random() * H, len = Math.random() * W * .5 + 80, x = Math.random() * W;
          ctx.fillStyle = i % 5 === 0 ? accent : "#fff"; ctx.globalAlpha = Math.random() * .5 + .15;
          ctx.fillRect(x, y, len, Math.random() * 3 + 1);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------------- scenes ---------------- */
  const split = (txt, cls = "") => [...txt].map((ch, i) =>
    `<span class="ch ${cls}" style="--i:${i}">${ch === " " ? "&nbsp;" : ch}</span>`).join("");

  function scene(html, cls, lines) {
    stage.innerHTML = `<div class="sc ${cls}">${html}</div>`;
    if (lines) lineMode = lines;
  }
  function flash() { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
  function shake() { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
  function petals() {
    const box = document.createElement("div"); box.className = "intro-petals";
    for (let i = 0; i < 36; i++) {
      const p = document.createElement("i");
      const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 60;
      p.style.setProperty("--x", Math.cos(a) * d + "vw");
      p.style.setProperty("--y", Math.sin(a) * d + "vh");
      p.style.setProperty("--r", Math.random() * 720 - 360 + "deg");
      p.style.animationDelay = Math.random() * .25 + "s";
      box.appendChild(p);
    }
    stage.appendChild(box);
  }

  const first = P.shortName.toUpperCase();                     // "JHON EZEKIEL"
  const last = P.name.replace(P.shortName, "").trim().toUpperCase(); // "B. GADIANA"
  const tech = [...P.languages, ...P.frameworks].map((s) => s.name.toUpperCase());
  const techJp = { PYTHON: "パイソン", PHP: "ピーエイチピー", JAVASCRIPT: "ジャバスクリプト", DJANGO: "ジャンゴ", "REACT NATIVE": "リアクト", FLUTTER: "フラッター" };

  function timeline() {
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    at(0, () => { scene(`<b>起動</b><small>SYSTEM BOOT</small>`, "sc-kanji", "radial"); sfx("hit"); shake(); });
    at(1300, () => {
      scene(`<span class="n1">${split(first)}</span><span class="n2">${split(last)}</span><span class="n3">${P.japanese}・ガディアナ</span>`, "sc-name", "radial");
      flash(); sfx("whoosh");
    });
    const cutStart = 3100, cutLen = 300;
    tech.forEach((t, i) => at(cutStart + i * cutLen, () => {
      scene(`<b>${t}</b><i>${techJp[t] || ""}</i>`, `sc-cut c${i % 3}`, "horizontal"); sfx("whoosh");
    }));
    const roleAt = cutStart + tech.length * cutLen + 100;
    at(roleAt, () => {
      scene(`<span class="r1">${split("BACKEND")}</span><span class="r2">${split("PROGRAMMER")}</span><em>バックエンド・プログラマー</em>`, "sc-role", "radial");
      flash(); shake(); sfx("hit"); petals();
    });
    at(roleAt + 1700, () => {
      scene(`<small>EPISODE 01</small><b>THE PORTFOLIO</b><span>ポートフォリオ編</span>`, "sc-title", "none");
      sfx("chime");
    });
    at(roleAt + 3300, end);
  }

  /* ---------------- open / close ---------------- */
  function build() {
    el = document.createElement("div");
    el.id = "intro"; el.className = "intro"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Anime intro");
    el.innerHTML = `
      <canvas class="intro-lines"></canvas>
      <div class="intro-stage"></div>
      <div class="intro-bar top"></div><div class="intro-bar bottom"></div>
      <div class="intro-ui">
        <button class="intro-sound" type="button" aria-pressed="false">🔇 Sound</button>
        <button class="intro-skip" type="button">Skip ▶▶</button>
      </div>`;
    document.body.appendChild(el);
    stage = el.querySelector(".intro-stage");
    canvas = el.querySelector("canvas"); ctx = canvas.getContext("2d");
    el.querySelector(".intro-skip").addEventListener("click", (e) => { e.stopPropagation(); end(); });
    el.addEventListener("dblclick", end);
    const sb = el.querySelector(".intro-sound");
    sb.addEventListener("click", (e) => {
      e.stopPropagation();
      soundOn = !soundOn; sb.textContent = soundOn ? "🔊 Sound" : "🔇 Sound"; sb.setAttribute("aria-pressed", soundOn);
      const a = ac(); a && a.resume && a.resume();
      const v = el.querySelector("video"); if (v) v.muted = !soundOn;
    });
  }

  function onKey(e) { if (["Escape", "Enter", " "].includes(e.key)) { e.preventDefault(); end(); } }

  function play(withSound) {
    if (running) return;
    running = true; Intro.active = true;
    document.getElementById("preloader")?.classList.add("done");
    document.body.classList.add("intro-playing");
    build();
    if (withSound) { soundOn = true; const a = ac(); a && a.resume && a.resume(); el.querySelector(".intro-sound").textContent = "🔊 Sound"; }
    addEventListener("keydown", onKey);

    if (CFG.video) {                                   // custom video file
      lineMode = "none";
      stage.innerHTML = `<video class="intro-video" src="${CFG.video}" autoplay playsinline ${soundOn ? "" : "muted"}></video>`;
      const v = stage.querySelector("video");
      v.addEventListener("ended", end);
      v.addEventListener("error", () => { stage.innerHTML = ""; drawLines(); timeline(); });
      return;
    }
    drawLines();
    timeline();
  }

  function end() {
    if (!running || el.classList.contains("out")) return;
    timers.forEach(clearTimeout); timers = [];
    removeEventListener("keydown", onKey);
    sessionStorage.setItem(KEY, "1");
    el.classList.add("out");
    setTimeout(() => {
      cancelAnimationFrame(raf);
      el.remove(); running = false; Intro.active = false;
      document.body.classList.remove("intro-playing");
      dispatchEvent(new Event("intro:done"));
    }, 900);
  }

  window.Intro = { play: () => play(true), active: false };

  // Auto-play on first visit of the session (or every visit if configured)
  const skipParam = /[?&]intro=0\b/.test(location.search);   // e.g. index.html?intro=0
  const shouldAutoplay = CFG.enabled !== false && !reduce && !skipParam && (CFG.everyVisit || !sessionStorage.getItem(KEY));
  if (shouldAutoplay) {
    Intro.active = true;                               // let main.js wait for the intro
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => play(false));
    else play(false);
  }
})();
