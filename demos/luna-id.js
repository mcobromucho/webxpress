/* Luna Estética · intro (una vez por sesión, solo en Inicio, se salta con un toque o tecla) */
(() => {
  const s = document.getElementById("lsp"); if (!s) return;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seen = false; try { seen = sessionStorage.getItem("lunaIntro") === "1"; } catch (_) {}
  if (calm || seen || (location.hash && location.hash !== "#inicio")) { s.remove(); return; }
  try { sessionStorage.setItem("lunaIntro", "1"); } catch (_) {}
  const hide = () => { s.classList.add("out"); setTimeout(() => s.remove(), 1000); };
  const t = setTimeout(hide, 2400);
  ["pointerdown", "keydown"].forEach(ev => addEventListener(ev, () => { clearTimeout(t); hide(); }, { once: true }));
})();
