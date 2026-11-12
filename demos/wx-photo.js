/* WebXpress · comportamiento de galerías (carrusel, filtros y lightbox). Sin librerías. */
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Carrusel con snap: botones, teclado y barra de progreso ---------- */
  $$(".wxc").forEach(c => {
    const t = c.querySelector(".wxc-t"), bar = c.querySelector(".wxc-p i");
    const prev = c.querySelector("[data-dir='-1']"), next = c.querySelector("[data-dir='1']");
    const step = () => (t.firstElementChild ? t.firstElementChild.getBoundingClientRect().width + 14 : 240);
    const sync = () => {
      const max = t.scrollWidth - t.clientWidth;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.max(.12, t.scrollLeft / max) : 1})`;
      if (prev) prev.disabled = t.scrollLeft < 4;
      if (next) next.disabled = t.scrollLeft > max - 4;
    };
    [prev, next].forEach(b => b && b.addEventListener("click", () => t.scrollBy({ left: step() * +b.dataset.dir, behavior: "smooth" })));
    t.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
    t.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { e.preventDefault(); t.scrollBy({ left: step(), behavior: "smooth" }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); t.scrollBy({ left: -step(), behavior: "smooth" }); }
    });
    addEventListener("resize", sync); sync();
  });

  /* ---------- Filtros del mosaico (Todo / Cabello / Rostro) ---------- */
  $$("[data-wx-filter]").forEach(group => {
    const grid = document.getElementById(group.dataset.wxFilter); if (!grid) return;
    group.addEventListener("click", e => {
      const b = e.target.closest("button[data-cat]"); if (!b) return;
      $$("button", group).forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      let i = 0;
      $$("[data-cat]", grid).forEach(el => {
        const show = b.dataset.cat === "todo" || el.dataset.cat === b.dataset.cat;
        el.hidden = !show; if (show) el.style.setProperty("--i", i++);
      });
    });
  });

  /* ---------- Lightbox: abrir, navegar (botones, teclado, deslizar) y cerrar ---------- */
  const lb = document.createElement("div");
  lb.className = "wxl"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Foto ampliada"); lb.hidden = false;
  lb.innerHTML = '<button class="x" type="button" aria-label="Cerrar">&times;</button><button class="p" type="button" aria-label="Foto anterior">&#8249;</button><figure><img class="wx-photo-uniform" alt=""><figcaption></figcaption><button class="rsv" type="button" data-book hidden></button></figure><button class="n" type="button" aria-label="Foto siguiente">&#8250;</button>';
  document.body.appendChild(lb);
  const img = lb.querySelector("img"), cap = lb.querySelector("figcaption"), rsv = lb.querySelector(".rsv");
  let list = [], idx = 0, opener = null;

  const show = i => {
    idx = (i + list.length) % list.length; const el = list[idx];
    img.classList.add("sw");
    setTimeout(() => { img.src = el.dataset.full; img.alt = el.dataset.alt || ""; cap.textContent = el.dataset.cap || ""; img.classList.remove("sw");
      rsv.hidden = !el.dataset.svc; if (el.dataset.svc) rsv.textContent = "Reservar " + el.dataset.svc.toLowerCase() + " · desde " + el.dataset.price; }, 120);
  };
  const open = el => {
    const scope = el.closest("[data-wx-group]") || document;
    list = $$("[data-wx-zoom]", scope).filter(x => !x.hidden && x.offsetParent !== null);
    opener = el; lb.classList.add("on"); show(list.indexOf(el));
    lb.querySelector(".x").focus({ preventScroll: true });
  };
  const close = () => { lb.classList.remove("on"); opener && opener.focus({ preventScroll: true }); };

  document.addEventListener("click", e => { const z = e.target.closest("[data-wx-zoom]"); if (z) { e.preventDefault(); open(z); } });
  lb.addEventListener("click", e => {
    if (e.target === lb || e.target.closest(".x") || e.target.closest(".rsv")) close();
    else if (e.target.closest(".p")) show(idx - 1);
    else if (e.target.closest(".n")) show(idx + 1);
  });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("on")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "Tab") { const f = $$("button", lb).filter(b => !b.hidden); const a = document.activeElement; if (e.shiftKey && a === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
  });
  let x0 = null;
  lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 45) show(idx + (d < 0 ? 1 : -1)); x0 = null; }, { passive: true });
})();
