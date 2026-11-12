/* Luna Estética · movimiento v2: carrusel del hero, neón del contacto y mapa */
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero: carrusel (autoavance por la barra de progreso del punto activo; se pausa al pasar el mouse) ---------- */
  const arch = document.querySelector(".arch");
  if (arch) {
    const dots = $$(".hdots button", arch);
    let cur = 0;
    const slides = () => $$(".hs", arch);
    const go = i => {
      const sl = slides(); if (!sl.length) return;
      i = (i + sl.length) % sl.length; if (i === cur || !sl[i]) return;
      const old = sl[cur];
      old.classList.remove("on"); old.classList.add("prev");
      sl[i].classList.remove("prev"); sl[i].classList.add("on");
      dots.forEach((d, k) => d.setAttribute("aria-current", String(k === i)));
      setTimeout(() => old.classList.remove("prev"), 1400);
      cur = i;
    };
    dots.forEach((d, k) => d.addEventListener("click", () => go(k)));
    /* la barra del punto activo termina -> siguiente foto */
    arch.addEventListener("animationend", e => { if (e.animationName === "hdp") go(cur + 1); });
    /* deslizar con el dedo */
    let x0 = null;
    arch.addEventListener("pointerdown", e => { x0 = e.clientX; });
    arch.addEventListener("pointerup", e => { if (x0 === null) return; const d = e.clientX - x0; x0 = null; if (Math.abs(d) > 40) go(cur + (d < 0 ? 1 : -1)); });
    arch.addEventListener("pointercancel", () => { x0 = null; });
  }

  /* ---------- Neón del contacto: paralaje suave con el mouse ---------- */
  const neon = document.querySelector(".ctneon");
  if (neon && fine && !calm) {
    let raf = 0, ev;
    addEventListener("pointermove", e => {
      ev = e; if (raf || !document.querySelector("#v-contacto.on")) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        neon.style.setProperty("--mx", ((ev.clientX / innerWidth) - .5).toFixed(3));
        neon.style.setProperty("--my", ((ev.clientY / innerHeight) - .5).toFixed(3));
      });
    }, { passive: true });
  }

  /* ---------- Mapa: no atrapa la rueda ni el scroll hasta que lo tocas ---------- */
  $$(".lmap").forEach(m => {
    m.addEventListener("click", e => { if (!e.target.closest("a")) m.classList.add("act"); });
    m.addEventListener("mouseleave", () => m.classList.remove("act"));
    addEventListener("pointerdown", e => { if (!m.contains(e.target)) m.classList.remove("act"); }, { passive: true });
  });
})();
