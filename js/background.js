/* =====================================================================
   Animated canvas background — each theme gets its own "weather":
   tokyo-night → stars + shooting stars, akatsuki → rising embers,
   sakura → falling cherry petals, sora → drifting clouds + leaves.
   ===================================================================== */
(function () {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, DPR, particles = [], shooters = [], mode = "tokyo-night";
  const mouse = { x: -9999, y: -9999 };

  const rand = (a, b) => a + Math.random() * (b - a);
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * DPR;
    H = canvas.height = innerHeight * DPR;
  }

  function count() {
    const base = (innerWidth * innerHeight) / 14000;
    return Math.round(Math.min(base, 120) * (mode === "sora" ? 0.35 : 1));
  }

  function make(initial) {
    const p = { x: rand(0, W), y: initial ? rand(0, H) : 0, life: rand(0, Math.PI * 2) };
    switch (mode) {
      case "tokyo-night":
        p.y = rand(0, H); p.r = rand(.4, 1.8) * DPR; p.tw = rand(.01, .04); break;
      case "akatsuki":
        p.y = initial ? rand(0, H) : H + 10; p.r = rand(1, 3.2) * DPR;
        p.vy = -rand(.3, 1.2) * DPR; p.vx = rand(-.3, .3) * DPR; break;
      case "sakura":
        p.y = initial ? rand(-H, H) : -20; p.r = rand(5, 11) * DPR;
        p.vy = rand(.4, 1.2) * DPR; p.vx = rand(.2, 1) * DPR;
        p.rot = rand(0, 6.28); p.vr = rand(-.03, .03); p.flip = rand(0, 6.28); break;
      case "sora":
        if (Math.random() < .5) { // cloud
          p.kind = "cloud"; p.r = rand(40, 110) * DPR; p.y = rand(0, H * .7);
          p.x = initial ? rand(-200, W) : -p.r * 3; p.vx = rand(.1, .35) * DPR;
        } else { // leaf
          p.kind = "leaf"; p.r = rand(4, 8) * DPR; p.y = initial ? rand(0, H) : -20;
          p.vy = rand(.4, 1) * DPR; p.vx = rand(.3, 1.1) * DPR; p.rot = rand(0, 6.28); p.vr = rand(-.04, .04);
        }
        break;
    }
    return p;
  }

  function reset() {
    particles = Array.from({ length: count() }, () => make(true));
    shooters = [];
  }

  function petal(p, color) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, Math.abs(Math.sin(p.flip)) * .7 + .3);
    ctx.beginPath();
    ctx.moveTo(0, -p.r);
    ctx.bezierCurveTo(p.r, -p.r, p.r * .9, p.r * .6, 0, p.r);
    ctx.bezierCurveTo(-p.r * .9, p.r * .6, -p.r, -p.r, -p.r * .15, -p.r * .8);
    ctx.lineTo(0, -p.r * .55);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = .85;
    ctx.fill();
    ctx.restore();
  }

  function repel(p) {
    const dx = p.x - mouse.x * DPR, dy = p.y - mouse.y * DPR, d2 = dx * dx + dy * dy, R = 110 * DPR;
    if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (R - d) / R * 2.2; p.x += dx / d * f; p.y += dy / d * f; }
  }

  let accent, accent2, text;
  function readColors() { accent = css("--accent"); accent2 = css("--accent2"); text = css("--text"); }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life += .02;
      if (mode === "tokyo-night") {
        const a = .35 + Math.sin(p.life * p.tw * 50) * .35 + .3;
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = i % 7 === 0 ? accent2 : i % 11 === 0 ? accent : "#ffffff";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      } else if (mode === "akatsuki") {
        p.x += p.vx + Math.sin(p.life) * .3 * DPR; p.y += p.vy; repel(p);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, i % 3 ? accent : accent2); g.addColorStop(1, "transparent");
        ctx.globalAlpha = .55 + Math.sin(p.life * 3) * .3; ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 7); ctx.fill();
        if (p.y < -20) particles[i] = make(false);
      } else if (mode === "sakura") {
        p.x += p.vx + Math.sin(p.life) * .6 * DPR; p.y += p.vy; p.rot += p.vr; p.flip += .03; repel(p);
        petal(p, i % 4 === 0 ? "#ffd0e1" : i % 3 === 0 ? "#ffb3cf" : "#ff8fba");
        if (p.y > H + 20 || p.x > W + 20) particles[i] = make(false);
      } else if (mode === "sora") {
        if (p.kind === "cloud") {
          p.x += p.vx;
          ctx.globalAlpha = .55; ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * .6, 0, 7); ctx.arc(p.x + p.r * .6, p.y - p.r * .2, p.r * .5, 0, 7);
          ctx.arc(p.x + p.r * 1.2, p.y, p.r * .45, 0, 7); ctx.arc(p.x + p.r * .55, p.y + p.r * .15, p.r * .5, 0, 7);
          ctx.fill();
          if (p.x > W + p.r * 2) particles[i] = make(false);
        } else {
          p.x += p.vx + Math.sin(p.life) * .5 * DPR; p.y += p.vy; p.rot += p.vr; repel(p);
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.globalAlpha = .8; ctx.fillStyle = i % 2 ? accent2 : "#7fd8a6";
          ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.6, p.r * .7, 0, 0, 7); ctx.fill(); ctx.restore();
          if (p.y > H + 20 || p.x > W + 20) particles[i] = make(false);
        }
      }
    }

    // Shooting stars (tokyo-night)
    if (mode === "tokyo-night") {
      if (Math.random() < .012) shooters.push({ x: rand(W * .2, W), y: rand(0, H * .4), v: rand(8, 14) * DPR, l: 0 });
      shooters = shooters.filter((s) => s.l < 1);
      shooters.forEach((s) => {
        s.l += .02; s.x -= s.v; s.y += s.v * .45;
        const g = ctx.createLinearGradient(s.x, s.y, s.x + 120 * DPR, s.y - 54 * DPR);
        g.addColorStop(0, "#fff"); g.addColorStop(1, "transparent");
        ctx.globalAlpha = 1 - s.l; ctx.strokeStyle = g; ctx.lineWidth = 2 * DPR;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + 120 * DPR, s.y - 54 * DPR); ctx.stroke();
      });
    }
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(frame);
  }

  window.Background = {
    setMode(m) { mode = m; readColors(); reset(); if (reduce) frame(); }
  };

  addEventListener("resize", () => { resize(); reset(); });
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

  resize();
  mode = document.documentElement.getAttribute("data-theme") || "sora";
  readColors(); reset();
  requestAnimationFrame(frame);
})();
