/* WebXpress · interacción de la pestaña de pagos (pasos, aviso al copiar, simulación de cobro automático) */
(() => {
  const v = document.querySelector("#v-pagar"); if (!v) return;
  const $ = (s, r = v) => r.querySelector(s), $$ = (s, r = v) => [...r.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* pasos: se marcan al copiar y al enviar el comprobante */
  const steps = $$(".stp li");
  let cur = 0;
  const mark = n => { cur = Math.max(cur, n); steps.forEach((li, i) => { li.classList.toggle("done", i < cur); li.classList.toggle("now", i === cur); }); };
  mark(0);

  /* aviso breve al copiar */
  const toast = document.createElement("div");
  toast.className = "pg-toast"; toast.setAttribute("role", "status"); toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
  let tt = 0;
  const say = m => { toast.textContent = m; toast.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("on"), 1800); };

  v.addEventListener("click", e => {
    const c = e.target.closest("[data-copy]");
    if (c) { mark(1); say(c.dataset.copy.includes("\n") ? "Datos copiados. Pégalos en tu app bancaria" : "Copiado al portapapeles"); return; }
    if (e.target.closest(".pact a.btn")) mark(3);
  });

  /* simulación: así se vería el cobro automático en la página del cliente */
  const sim = $(".sim"); if (!sim) return;
  const lis = $$(".pg-tl li", sim), note = $(".sim-n", sim), go = $(".sim-go", sim);
  let timers = [], ran = false;
  const reset = () => { timers.forEach(clearTimeout); timers = []; lis.forEach(l => l.classList.remove("on")); note.classList.remove("on"); };
  const run = () => {
    reset(); ran = true; go.disabled = true; go.textContent = "Simulando…";
    const gap = calm ? 0 : 850;
    lis.forEach((l, i) => timers.push(setTimeout(() => l.classList.add("on"), i * gap + 150)));
    timers.push(setTimeout(() => { note.classList.add("on"); go.disabled = false; go.textContent = "Repetir simulación"; }, lis.length * gap + 250));
  };
  go.addEventListener("click", run);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((en, ob) => { if (en.some(x => x.isIntersecting) && !ran) { ob.disconnect(); setTimeout(run, 500); } }, { threshold: .6 }).observe(sim);
  }
})();
