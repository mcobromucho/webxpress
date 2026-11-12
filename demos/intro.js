/* WebXpress · control compartido de las entradas animadas de cada demo.
   Uso: <script src="intro.js" data-k="gym" data-id="gxs" data-t="3000"></script> (en el <head>)
   - Se reproduce una vez por sesión y solo si entras por Inicio. Con ?intro en la URL se fuerza.
   - Se salta con un toque deliberado (pasados 900 ms) o una tecla. Con "reducir movimiento" no se muestra. */
(() => {
  const me = document.currentScript, d = me.dataset, root = document.documentElement;
  const key = "wxIntro-" + d.k, T = +d.t || 3000, calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seen = false; try { seen = sessionStorage.getItem(key) === "1"; } catch (_) {}
  const force = /[?&]intro(=|&|$)/.test(location.search), h = location.hash.slice(1);
  if (!force && (calm || seen || (h && h !== "inicio"))) { root.classList.add("xi-skip"); return; }
  try { sessionStorage.setItem(key, "1"); } catch (_) {}
  root.classList.add("xi-wait"); /* el contenido de la página espera a que se abra la entrada */
  const guard = setTimeout(() => root.classList.remove("xi-wait"), T + 2600);
  addEventListener("DOMContentLoaded", () => {
    const s = document.getElementById(d.id); if (!s) { root.classList.remove("xi-wait"); return; }
    let done = false;
    const hide = () => {
      if (done) return; done = true; clearTimeout(t); s.classList.add("out");
      setTimeout(() => { root.classList.remove("xi-wait"); clearTimeout(guard); }, 260);
      setTimeout(() => s.remove(), 1500);
    };
    const t = setTimeout(hide, T);
    const born = performance.now();
    const skip = e => { if (performance.now() - born < 900) return; ["pointerup","keydown"].forEach(ev => removeEventListener(ev, skip)); hide(); };
    ["pointerup","keydown"].forEach(ev => addEventListener(ev, skip, { passive: true }));
  });
})();
