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
