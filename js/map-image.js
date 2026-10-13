/* =====================================================================
   The town map as a painted picture (img/bg/map.jpg).
   The picture keeps the old layout, so every pin (ART.PLACES) still sits
   on its building. It is laid over the drawn map, under the time-of-day
   tint and the SALTMERE title; if the picture is missing, the drawn map
   still shows underneath. Pins, the place list and the rules are untouched.
   ===================================================================== */
'use strict';
(function () {
  const SRC = 'img/bg/map.jpg';
  const m0 = ART.map;
  ART.map = s => {
    const t = (GAME.S && typeof slotName === 'function') ? slotName() : 'noon';
    const img = `<image href="${SRC}" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice"/>`
      + (t === 'night' ? '<rect width="1600" height="900" fill="#0a1030" opacity=".45"/>'
        : t === 'morning' ? '<rect width="1600" height="900" fill="#ffe8c0" opacity=".08"/>' : '');
    /* the drawn map ends with its own tint (night/evening) and then the title: the picture goes in before them */
    let done = false;
    const out = m0(s).replace(/<rect width="1600" height="900" fill="#0a1030"|<rect width="1600" height="900" fill="#ff7a3a"|<text x="800" y="880"/, m => { done = true; return img + m; });
    return done ? out.replace(/<rect width="1600" height="900" fill="#0a1030" opacity="\.35"\/>/, '') : out;
  };
})();

/* portrait: the map is wider than the screen, so open it centred on where you are */
(function () {
  /* landscape: the biggest exact 16:9 that fits (so each pin stays on its building) */
  function fit() {
    const body = document.querySelector('.sheet.mapsheet .mapbody'), wrap = body && body.querySelector('.mapwrap');
    if (!wrap) return;
    if (!matchMedia('(orientation:landscape)').matches) { wrap.style.width = wrap.style.height = ''; return; }
    const w = Math.floor(Math.min(body.clientWidth, body.clientHeight * 16 / 9));
    wrap.style.width = w + 'px'; wrap.style.height = Math.floor(w * 9 / 16) + 'px';
  }
  addEventListener('resize', fit);
  const base = renderSheet;
  renderSheet = function () {
    base.apply(this, arguments);
    const body = document.querySelector('.sheet.mapsheet .mapbody');
    if (!body) return;
    fit();
    if (body.scrollWidth <= body.clientWidth + 2) return;
    const pin = body.querySelector('.pin.here'), wrap = body.querySelector('.mapwrap');
    const x = pin ? pin.offsetLeft : wrap.offsetWidth / 2;
    const max = body.scrollWidth - body.clientWidth, want = Math.max(0, Math.min(max, x - body.clientWidth / 2));
    body.scrollLeft = want;   // the scroller is always left-to-right (css), in Arabic too
  };
})();
