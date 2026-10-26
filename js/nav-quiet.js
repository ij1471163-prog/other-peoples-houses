/* =====================================================================
   A quieter picture (UI only). With "Names: Show, then hide" (the new
   default; the old "Always" and "On tap" are still in Settings):
     · arriving somewhere, the names of the things you can look at show
       for a moment and then fade, leaving small glowing points;
     · tap any empty part of the picture to see the names again;
     · one tap on a point still does it straight away.
   Ways out (arrows and doors), risky spots and anything you are about
   to do keep their names.
   ===================================================================== */
'use strict';
(function () {
  let t = 0;
  function peek(ms) {
    const st = $('stage'); if (!st) return;
    st.classList.add('peek'); clearTimeout(t); t = setTimeout(() => st.classList.remove('peek'), ms || 2600);
  }
  const rl0 = renderLocation;
  renderLocation = function () { const r = rl0.apply(this, arguments); peek(2800); return r; };
  document.addEventListener('pointerdown', ev => {
    if (PREFS.get('labels') !== 'auto' || RUN) return;
    const st = $('stage'); if (!st || !st.contains(ev.target)) return;
    if (ev.target.closest('.spot,.char,.hud,.sheet,button')) return;
    peek(2600);
  }, { passive: true });
})();
