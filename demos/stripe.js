/* WebXpress · cobro con tarjeta estilo Stripe Checkout.
   Por defecto es una SIMULACIÓN: no usa servidor, no envía ni guarda datos y solo acepta tarjetas de prueba.
   Para cobrar de verdad, llena STRIPE (ver LEEME-STRIPE.md): con links de pago o con la función de Netlify. */
(() => {
  const v = document.querySelector("#v-pagar"); if (!v) return;
  const $ = (s, r = v) => r.querySelector(s), $$ = (s, r = v) => [...r.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const STRIPE = {
    links: {},      // { anticipo: "https://buy.stripe.com/...", valoracion: "...", limpieza: "..." }
    endpoint: ""    // "/.netlify/functions/checkout"
  };
  const live = !!(STRIPE.endpoint || Object.keys(STRIPE.links).length);
  const MXN = n => "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const digits = s => s.replace(/\D/g, "");
  const brand = n => /^4/.test(n) ? "Visa" : /^(5[1-5]|2[2-7])/.test(n) ? "Mastercard" : /^3[47]/.test(n) ? "Amex" : "";
  const group = (d, amex) => amex ? [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(" ") : (d.match(/.{1,4}/g) || []).join(" ");
  const luhn = n => { let s = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let x = +n[i]; if (alt) { x *= 2; if (x > 9) x -= 9; } s += x; alt = !alt; } return n.length >= 13 && s % 10 === 0; };
  const TEST_OK = ["4242424242424242", "5555555555554444", "378282246310005"], TEST_NO = "4000000000000002";

  /* método de pago: tarjeta / SPEI */
  const setPm = m => {
    $$(".pm-sw button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.pm === m)));
    $("#pm-card").hidden = m !== "card"; $("#pm-spei").hidden = m !== "spei";
    $$("[data-for]").forEach(p => p.hidden = p.dataset.for !== m);
  };
  $(".pm-sw").addEventListener("click", e => { const b = e.target.closest("button[data-pm]"); if (b) setPm(b.dataset.pm); });

  const ck = $("#pm-card"), form = $("#ckf"), pay = $("#ckPay"), err = $("#ckErr"), cc = $("#cc");
  const f = { e: $("#ckE"), n: $("#ckN"), x: $("#ckX"), c: $("#ckC"), h: $("#ckH") };
  if (live) ck.classList.add("live");
  let item = $(".ck-items [aria-pressed=true]"), busy = false;

  const sync = () => {
    $("#ckTot").innerHTML = MXN(+item.dataset.amt) + " <small>MXN</small>";
    pay.querySelector("span").textContent = live ? "Continuar a pago seguro" : "Pagar " + MXN(+item.dataset.amt) + " MXN";
  };
  $(".ck-items").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $$(".ck-items button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); item = b; sync();
  });

  /* tarjeta en vivo */
  const paint = () => {
    const d = digits(f.n.value), amex = brand(d) === "Amex", len = amex ? 15 : 16;
    $("#ccN").textContent = group((d + "•".repeat(len)).slice(0, len), amex);
    $("#ccB").textContent = $("#ckB").textContent = brand(d) || "Tarjeta";
    $("#ccH").textContent = f.h.value.trim().toUpperCase().slice(0, 24) || "NOMBRE APELLIDO";
    $("#ccE").textContent = f.x.value || "MM/AA";
    $("#ccC").textContent = f.c.value || "•••";
  };
  f.n.addEventListener("input", () => { const d = digits(f.n.value), amex = brand(d) === "Amex"; f.n.value = group(d.slice(0, amex ? 15 : 16), amex); paint(); });
  f.x.addEventListener("input", e => {
    let d = digits(f.x.value).slice(0, 4); if (d.length === 1 && +d > 1) d = "0" + d;
    f.x.value = d.length > 2 || (d.length === 2 && e.inputType !== "deleteContentBackward") ? d.slice(0, 2) + "/" + d.slice(2) : d; paint();
  });
  f.c.addEventListener("input", () => { f.c.value = digits(f.c.value).slice(0, 4); paint(); });
  f.h.addEventListener("input", paint);
  f.c.addEventListener("focus", () => cc.classList.add("flip"));
  f.c.addEventListener("blur", () => cc.classList.remove("flip"));
  Object.values(f).forEach(i => i.addEventListener("input", () => { i.classList.remove("bad"); err.textContent = ""; }));

  const fail = (el, msg) => { el.classList.add("bad"); el.focus(); err.textContent = msg; return false; };
  const fill = (n, x, c, h, email) => { f.n.value = n; f.x.value = x; f.c.value = c; f.h.value = h; if (email && !f.e.value) f.e.value = email; f.n.dispatchEvent(new Event("input")); paint(); err.textContent = ""; $$("input", form).forEach(i => i.classList.remove("bad")); };
  $("#ckTest").addEventListener("click", () => fill("4242424242424242", "12/34", "123", "Ana Martínez", "ana@ejemplo.com"));
  $("#ckFail").addEventListener("click", () => fill(TEST_NO, "12/34", "123", "Ana Martínez", "ana@ejemplo.com"));

  /* pago exitoso */
  const done = d => {
    $("#okAmt").textContent = d.amt; $("#okItem").textContent = d.item; $("#okId").textContent = d.id; $("#okCard").textContent = d.card; $("#okDate").textContent = d.date;
    ck.classList.add("paid"); busy = false; pay.disabled = false; pay.classList.remove("busy"); sync();
  };
  const reset = () => { ck.classList.remove("paid"); form.reset(); $$("input", form).forEach(i => i.classList.remove("bad")); err.textContent = ""; paint(); };
  $("#ckAgain").addEventListener("click", reset);

  const goLive = async () => {
    const k = item.dataset.k;
    if (STRIPE.links[k]) { location.href = STRIPE.links[k]; return; }
    if (!STRIPE.endpoint) { err.textContent = "Este concepto aún no tiene link de pago."; return; }
    busy = true; pay.disabled = true; pay.classList.add("busy");
    try {
      const r = await fetch(STRIPE.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item: k, email: f.e.value.trim() }) });
      const j = await r.json(); if (!j.url) throw 0; location.href = j.url;
    } catch (_) { busy = false; pay.disabled = false; pay.classList.remove("busy"); err.textContent = "No pudimos abrir el pago. Intenta de nuevo."; }
  };

  form.addEventListener("submit", e => {
    e.preventDefault(); if (busy) return; err.textContent = "";
    if (live) return goLive();
    const n = digits(f.n.value), m = f.x.value.split("/"), mo = +m[0], yr = 2000 + (+m[1] || 0), now = new Date();
    if (!/^\S+@\S+\.\S+$/.test(f.e.value.trim())) return fail(f.e, "Escribe un correo válido para tu recibo.");
    if (!luhn(n)) return fail(f.n, "Revisa el número de tarjeta.");
    if (n !== TEST_NO && !TEST_OK.includes(n)) { f.n.value = ""; paint(); return fail(f.n, "Es una demo: no escribas una tarjeta real. Usa la tarjeta de prueba."); }
    if (!(mo >= 1 && mo <= 12) || m[1] === undefined || m[1].length < 2 || yr < now.getFullYear() || (yr === now.getFullYear() && mo < now.getMonth() + 1)) return fail(f.x, "Revisa la fecha de vencimiento.");
    if (f.c.value.length < (brand(n) === "Amex" ? 4 : 3)) return fail(f.c, "Revisa el código de seguridad (CVC).");
    if (f.h.value.trim().length < 2) return fail(f.h, "Escribe el nombre como aparece en la tarjeta.");
    busy = true; pay.disabled = true; pay.classList.add("busy"); pay.querySelector("span").textContent = "Procesando";
    setTimeout(() => {
      if (n === TEST_NO) { busy = false; pay.disabled = false; pay.classList.remove("busy"); sync(); err.textContent = "Tu tarjeta fue rechazada. Así se ve un rechazo en modo de prueba: prueba con otra tarjeta."; return; }
      done({ amt: MXN(+item.dataset.amt) + " MXN", item: item.dataset.name, id: "pi_demo_" + Math.random().toString(36).slice(2, 10), card: (brand(n) || "Tarjeta") + " •••• " + n.slice(-4), date: now.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) });
    }, calm ? 0 : 1500);
  });

  /* regreso desde Stripe (success_url con ?pago=ok) */
  if (/[?&]pago=ok/.test(location.search)) {
    done({ amt: "Pago confirmado", item: "Tu cita quedó apartada", id: "Stripe", card: "Tarjeta", date: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) });
    try { history.replaceState(null, "", location.pathname + "#pagar"); } catch (_) {}
  }
  sync(); paint();
})();
