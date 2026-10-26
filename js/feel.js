/* =====================================================================
   How moving around feels (UI only; places, exits, time and story unchanged).
     1. Time of day you can see: night is really dark and blue outside
        (lamplight indoors), evening is warm. Before, a sunny street
        stayed sunny at midnight.
     2. Places dissolve into each other instead of jumping.
     3. Several notices at once stack under each other instead of
        printing on top of each other.
   ===================================================================== */
'use strict';
(function () {
  const OUT = ['station', 'street', 'harbor', 'elias_ext', 'dock', 'delivery', 'cliff_road', 'lh_ext', 'beach', 'cemetery', 'lh_tower'];

  /* ---------- 1. time of day ---------- */
  const rs0 = renderStage;
  renderStage = function () {
    const r = rs0.apply(this, arguments);
    try {
      const st = $('stage'), s = S(), L = s && GAME.LOC[s.loc];
      if (st && L) { const tm = slotName(), o = OUT.includes(L.bg) ? '1' : '0'; if (st.dataset.time !== tm) st.dataset.time = tm; if (st.dataset.out !== o) st.dataset.out = o; }
    } catch (e) { console.error(e); }
    return r;
  };

  /* ---------- 2. dissolve between places ---------- */
  const sl0 = setLayer;
  setLayer = function (node, html) {
    if (node && node.classList && node.classList.contains('bg') && node._k && node._k !== html && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.parentNode.querySelectorAll('.bg-old').forEach(o => o.remove());
      const old = el('div', 'bg-old'); old.innerHTML = node.innerHTML;
      node.parentNode.insertBefore(old, node.nextSibling);
      requestAnimationFrame(() => requestAnimationFrame(() => old.classList.add('go')));
      setTimeout(() => old.remove(), 700);
    }
    return sl0.apply(this, arguments);
  };

  /* ---------- 3. notices stack ---------- */
  const to0 = toast;
  toast = function (msg) {
    const st = $('stage'); if (!st) return to0.apply(this, arguments);
    const n = st.querySelectorAll(':scope > .toast').length;
    const r = to0.apply(this, arguments);
    const t = st.querySelectorAll(':scope > .toast'); const last = t[t.length - 1];
    if (last && n) last.style.top = (44 + Math.min(n, 4) * 36) + 'px';
    return r;
  };
})();
