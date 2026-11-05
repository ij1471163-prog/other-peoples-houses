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
  /* the bigger town (Nov): every pin moved onto its building in the new picture (in % of the picture) */
  const PINS = { station: [44.3, 38.8], motel: [55.0, 40.9], florist: [49.6, 47.8], grocery: [59.2, 49.9], cemetery: [41.6, 53.1], margaret: [53.8, 55.8], street: [64.0, 57.4], garage: [70.3, 39.3], clinic: [82.8, 41.4], police: [77.0, 46.2], cafe: [71.2, 49.1], hotel: [76.6, 62.7], elias_ext: [45.2, 65.0], boathouse: [67.3, 72.8], harbor: [60.7, 78.4], beach: [48.7, 73.3], lighthouse: [84.0, 71.0], sami_attic: [61.5, 45.4], cliff_road: [53.8, 55.8], lh_ext: [84.0, 71.0], hotel_lobby: [76.6, 62.7] };
  ART.NUDGE = {}; ART.PIN_DY = 1.5;   /* labels sit just under their building; overlaps are sorted out after drawing */
  /* the town is dense now: push overlapping labels apart, the smallest move first, staying inside the map */
  ART.spreadPins = wrap => {
    const pins = [...wrap.querySelectorAll('.pin')]; if (pins.length < 2) return;
    const W = wrap.clientWidth, H = wrap.clientHeight, pad = 3;
    const box = pins.map(p => ({ p, x: p.offsetLeft - p.offsetWidth / 2, y: p.offsetTop, w: p.offsetWidth, h: p.offsetHeight }));
    for (let it = 0; it < 60; it++) {
      let moved = false;
      for (let i = 0; i < box.length; i++) for (let j = i + 1; j < box.length; j++) {
        const a = box[i], b = box[j];
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + pad, oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + pad;
        if (ox <= pad || oy <= pad) continue;
        moved = true;
        if (oy <= ox) { const d = oy / 2, up = a.y < b.y ? a : b, dn = up === a ? b : a; up.y -= d; dn.y += d; }
        else { const d = ox / 2, l = a.x < b.x ? a : b, r = l === a ? b : a; l.x -= d; r.x += d; }
      }
      box.forEach(q => { q.x = Math.max(2, Math.min(W - q.w - 2, q.x)); q.y = Math.max(2, Math.min(H - q.h - 2, q.y)); });
      if (!moved) break;
    }
    box.forEach(q => { q.p.style.left = (q.x + q.w / 2) + 'px'; q.p.style.top = q.y + 'px'; q.p.classList.remove('edge-l', 'edge-r'); });
  };
  /* the parts of the bigger town that open later (an add-on): shown as "coming soon" pins */
  Object.assign(PINS, { oldtown: [22.7, 57.4], forest: [43.4, 15.5], cave: [93.0, 73.5] });
  GAME.MAP.push(
    { place: 'oldtown', label: T('The old town', 'البلدة القديمة'), msg: T('The road west ends in a square with a dry fountain. The school bell has not rung in thirty years. Somebody still oils the door of the old station. Coming soon.', 'الطريق اللي يروح غرب يخلص عند ساحة فيها نافورة ناشفة. جرس المدرسة ما رن من ثلاثين سنة. وفيه أحد للحين يزيّت باب المحطة القديمة. قريباً.') },
    { place: 'forest', label: T('The forest', 'الغابة'), msg: T('A path behind the chapel climbs into the trees, up to the old tree that lights up at dusk. Gregor says every name in this town is carved on it. He will not say whose was carved last. Coming soon.', 'ورا الكنيسة الصغيرة ممر يطلع بين الشجر، لين الشجرة القديمة اللي تنوّر وقت المغرب. غريغور يقول إن كل اسم في هالبلدة محفور عليها. وما يرضى يقول مين آخر واحد انحفر اسمه. قريباً.') },
    { place: 'cave', label: T('The cave', 'الكهف'), msg: T('At low tide, under the cliffs past the lighthouse, there is a dark opening in the rock. Elias used to say the sea keeps things for people. Coming soon.', 'وقت الجزر، تحت الجرف ورا المنارة، فيه فتحة سودا في الصخر. إلياس كان يقول إن البحر يحفظ أشياء للناس. قريباً.') }
  );
  ART.map = s => {
    Object.assign(ART.PLACES, PINS);
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
