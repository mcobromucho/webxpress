(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const mq = matchMedia("(max-width:860px)");
  const touch = matchMedia("(pointer:coarse)").matches || "ontouchstart" in window;
  const root = document.documentElement;
  const swap = () => $$("[data-mt]").forEach(el => {
    if (el.dataset.d === undefined) el.dataset.d = el.innerHTML;
    el.innerHTML = mq.matches ? el.dataset.mt : el.dataset.d;
  });
  swap();
  (mq.addEventListener ? mq.addEventListener("change", swap) : mq.addListener(swap));
  if (!touch) return;
  window.__wxPager = true;

  const views = () => $$(".view"), idx = () => views().findIndex(v => v.classList.contains("on"));
  const wrap = () => {
    const g = window.go; if (typeof g !== "function" || g.__wx) return;
    const w = function (n) { const to = views().findIndex(v => v.id === "v-" + n); if (to > -1) root.dataset.dir = (to - idx()) > 0 ? "next" : "prev"; return g.apply(this, arguments); };
    w.__wx = true; window.go = w;
  };
  wrap(); addEventListener("load", wrap);

  const READ = 1300, MIN = 56;
  let y0 = 0, x0 = 0, st0 = 0, atTop = false, atBot = false, t0 = 0, ok = false, hold = 0;
  const open = () => { const b = $("#bk"); return b && b.classList.contains("open"); };
  const view = () => $(".view.on");
  const edges = v => [v.scrollTop <= 1, v.scrollTop + v.clientHeight >= v.scrollHeight - 2];

  addEventListener("touchstart", e => {
    const v = view();
    ok = !!v && !open() && e.touches.length === 1 && !e.target.closest("input,select,textarea,.car-t,.wxc-t,.cmp,[data-noswipe]");
    if (!ok) return;
    y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; t0 = e.timeStamp; st0 = v.scrollTop;
    [atTop, atBot] = edges(v);
  }, { passive: true });

  addEventListener("touchend", e => {
    if (!ok) return; ok = false;
    const v = view(); if (!v || open()) return;
    const dy = y0 - e.changedTouches[0].clientY, dx = x0 - e.changedTouches[0].clientX;
    const fast = Math.abs(dy) / Math.max(1, e.timeStamp - t0) > .45;
    if (Math.abs(dy) < (fast ? 34 : MIN) || Math.abs(dy) < Math.abs(dx) * 1.3) return;
    if (Math.abs(v.scrollTop - st0) > 3) return;
    if (Date.now() < hold) return;
    const [t, b] = edges(v), i = idx(), n = views().length;
    if (dy > 0 && atBot && b && i < n - 1) go1(1);
    else if (dy < 0 && atTop && t && i > 0) go1(-1);
  }, { passive: true });

  const go1 = d => {
    hold = Date.now() + READ;
    if (typeof window.step === "function") { window.step(d); return; }
    const to = views()[idx() + d]; if (to && typeof window.go === "function") window.go(to.id.slice(2));
  };
  new MutationObserver(m => { if (m.some(r => r.target.classList && r.target.classList.contains("view") && r.target.classList.contains("on"))) hold = Date.now() + READ; })
    .observe($(".app") || document.body, { attributes: true, subtree: true, attributeFilter: ["class"] });
})();
