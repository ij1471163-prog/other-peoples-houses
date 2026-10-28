/* =====================================================================
   Places that have their own night picture (img/bg/<id>_night.jpg) use it
   at night instead of the day picture made darker. Nothing else changes.
   ===================================================================== */
'use strict';
(function () {
  const man = new Proxy({}, { get: (o, k) => ((window.IMG_MANIFEST && window.IMG_MANIFEST.bg) || {})[k] });   /* the list loads after this file */
  const bg0 = ART.bg;
  /* a scene can swap a place's picture for a moment: VIEW.bgOver = { harbor: 'harbor_storm' } */
  const over = id => { try { const o = VIEW.bgOver && VIEW.bgOver[id]; return o && man[o]; } catch (e) { return null; } };
  ART.bg = (id, t) => {
    const ov = over(id);
    if (ov) return `<img src="${ov}" alt="" decoding="async" data-own-night="1" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`;
    const u = t === 'night' && man[id + '_night'];
    if (u) return `<img src="${u}" alt="" decoding="async" data-own-night="1" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`;
    return bg0(id, t);
  };
  /* the picture is already night: no extra darkening on top */
  const rs0 = renderStage;
  renderStage = function () {
    const r = rs0.apply(this, arguments);
    try {
      const st = $('stage'), s = S(), L = s && GAME.LOC[s.loc];
      const own = !!(L && ((slotName() === 'night' && man[L.bg + '_night']) || over(L.bg))) ? '1' : '0';
      if (st && st.dataset.ownNight !== own) st.dataset.ownNight = own;
    } catch (e) { console.error(e); }
    return r;
  };
})();
