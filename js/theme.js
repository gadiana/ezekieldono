/* =====================================================================
   Theme manager — 4 themes (2 dark, 2 light) with a circular reveal
   transition (View Transitions API where supported).
   ===================================================================== */
(function () {
  const root = document.documentElement;
  const THEMES = {
    "tokyo-night": "dark", "akatsuki": "dark",
    "sakura": "light", "sora": "light"
  };
  const PAIR = { "tokyo-night": "sakura", "akatsuki": "sora", "sakura": "tokyo-night", "sora": "akatsuki" };

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-scheme", THEMES[theme]);
    root.style.colorScheme = THEMES[theme];
    localStorage.setItem("jeg-theme", theme);
    document.querySelectorAll("[data-set-theme]").forEach((b) =>
      b.classList.toggle("current", b.dataset.setTheme === theme));
    window.Background && Background.setMode(theme);
  }

  function setTheme(theme, origin) {
    if (!THEMES[theme] || theme === root.getAttribute("data-theme")) return;
    const x = origin ? origin.clientX : innerWidth / 2;
    const y = origin ? origin.clientY : innerHeight / 2;
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return apply(theme);
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(() => apply(theme)).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(.2,.8,.2,1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  }

  window.Theme = { setTheme, current: () => root.getAttribute("data-theme"), list: Object.keys(THEMES) };

  document.addEventListener("DOMContentLoaded", () => {
    apply(root.getAttribute("data-theme") || "sora");

    const btn = document.getElementById("themeBtn");
    const menu = document.getElementById("themeMenu");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
    document.addEventListener("click", () => { menu.classList.remove("open"); btn.setAttribute("aria-expanded", false); });
    menu.querySelectorAll("[data-set-theme]").forEach((b) =>
      b.addEventListener("click", (e) => setTheme(b.dataset.setTheme, e)));

    document.getElementById("modeToggle").addEventListener("click", (e) =>
      setTheme(PAIR[root.getAttribute("data-theme")], e));
  });
})();
