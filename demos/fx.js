/* WebXpress · capa visual compartida de las demos (ligera, sin librerías) */
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* 1. Entrada escalonada: marca los elementos de cada vista con su orden */
  const SEL = "h1,h2,.kick,.sub,.mut,.acts,.trust,.pill,.cats,.dy,.stats>div,.card,.pi,.c,.dish,.pn,.hours,.info>div,.qt,.art,.arch,.plates,.live,.map,.faq details";
  $$(".view").forEach(v => $$(SEL, v).forEach((el, i) => { el.classList.add("fxr"); el.style.setProperty("--i", Math.min(i, 14)); }));

  /* 2. Contadores animados en las cifras al entrar a una vista */
  const done = new WeakSet();
  const count = el => {
    if (calm || done.has(el)) return; done.add(el);
    const m = el.textContent.trim().match(/^(\d[\d.,]*)(.*)$/); if (!m) return;
    const raw = m[1], dec = (raw.split(".")[1] || "").length, comma = raw.includes(","), end = parseFloat(raw.replace(/,/g, "")), suf = m[2];
    if (!isFinite(end) || end < 3) return;
    const t0 = performance.now(), dur = 1100;
    const fmt = n => comma ? Math.round(n).toLocaleString("en-US") : n.toFixed(dec);
    const tick = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(end * e) + suf; if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  const onView = () => { const v = document.querySelector(".view.on"); if (v) $$(".stats b,.kp b,.pill b", v).forEach(count); };
  const app = document.querySelector(".app");
  if (app) new MutationObserver(onView).observe(app, { attributes: true, subtree: true, attributeFilter: ["class"] });
  onView();

  /* 3. Brillo que sigue al cursor en las tarjetas */
  if (fine) {
    let raf = 0, last;
    document.addEventListener("pointermove", e => {
      last = e; if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0; const c = last.target.closest && last.target.closest(".card"); if (!c) return;
        const r = c.getBoundingClientRect(); c.style.setProperty("--mx", (last.clientX - r.left) + "px"); c.style.setProperty("--my", (last.clientY - r.top) + "px");
      });
    }, { passive: true });
  }

  /* 4. Inclinación suave de la ilustración principal (solo con mouse) */
  if (fine && !calm) {
    $$(".art,.arch,.plates").forEach(el => {
      el.classList.add("tilt");
      el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`; });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* 5. Fotos: si el archivo existe aparece con fundido; si no, queda la ilustración (sin imágenes rotas) */
  $$(".ph").forEach(ph => {
    const img = ph.querySelector("img"), host = ph.parentElement; if (!img) return;
    const ok = () => { ph.classList.add("ld"); host.classList.add("has-ph"); };
    const bad = () => ph.remove();
    if (img.complete) (img.naturalWidth ? ok() : bad()); else { img.addEventListener("load", ok, { once: true }); img.addEventListener("error", bad, { once: true }); }
  });
})();
