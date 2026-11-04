/* =====================================================================
   Clearer ways out of a place (UI only; places, exits and their rules are unchanged).
     · An exit is drawn as an arrow (edge of the picture) or a door (anywhere else),
       with its name always readable, instead of a small circle.
     · A "back" button in the top bar goes straight back to the place you came from,
       when that place is one of the exits here and it is open (it is the same as
       tapping that exit, so nothing new can happen through it).
   ===================================================================== */
'use strict';
(function () {
  const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    left: svg('<path d="M15 5l-7 7 7 7"/>'), right: svg('<path d="M9 5l7 7-7 7"/>'),
    up: svg('<path d="M5 15l7-7 7 7"/>'), down: svg('<path d="M5 9l7 7 7-7"/>'),
    door: svg('<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/><path d="M3 21h18"/><circle cx="14.5" cy="12.5" r="1" fill="currentColor"/>'),
    lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    back: svg('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>')
  };
  const dirOf = h => (h.x <= 12 ? 'left' : h.x >= 88 ? 'right' : h.y >= 80 ? 'down' : h.y <= 18 ? 'up' : 'door');
  const BACK = T('Back', 'رجوع');
  /* where each door is in its picture, [left, top, right, bottom] in % (picture name -> exit -> box) */
  const DOORS = {
    hall: { elias_bed: [41, 17, 52, 60], yard: [34, 10, 39, 66], kitchen: [67, 8, 78, 72], living: [5, 10, 17, 75], bath: [87, 5, 97, 88] },
    marg_hall: { marg_guest: [46, 8, 53, 83], dan_room: [62, 19, 74, 60], marg_bath: [78, 11, 84, 76], marg_bed: [91, 5, 100, 95] },
    street: { grocery: [19, 52, 27, 72], cafe: [71, 58, 93, 84] },
    elias_ext: { hall: [62, 29, 73, 78] },
    leo_hall: { leo_home_kitchen: [16, 6, 29, 80], leo_kidroom: [65, 15, 74, 70] },
    cliff_road: { marg_living: [48, 38, 58, 56] },
    dock: { boathouse: [30, 34, 37, 50] },
    lh_ext: { lh_living: [51, 43, 59, 56] }
  };

  /* remember where you came from */
  const go0 = goTo;
  goTo = function (locId) { const s = S(); if (s && s.loc && s.loc !== locId) s.f.lastLoc = s.loc; return go0.apply(this, arguments); };

  function backExit(s) {
    if (!s.f.lastLoc || RUN || VIEW.sheet || s.f.prologue) return null;
    return visibleSpots().find(h => h.exit && h.to === s.f.lastLoc && !(h.lock && h.lock(s))) || null;
  }

  const rs0 = renderStage;
  renderStage = function () {
    const r = rs0.apply(this, arguments);
    try { decorate(); } catch (e) { console.error(e); }
    return r;
  };

  function decorate() {
    const s = S(); if (!s) return;
    const st = $('stage'), sp = st.querySelector('.spots'); if (!sp) return;
    const list = (!RUN && !VIEW.sheet) ? visibleSpots() : [];
    const btns = [...sp.querySelectorAll('.spot')];
    btns.forEach((b, i) => {
      const h = list[i]; if (!h || !h.exit || !b.classList.contains('exit')) return;
      const locked = !!(h.lock && h.lock(s)), d = dirOf(h);
      b.classList.add('nav', 'nav-' + d); if (locked) b.classList.add('nav-locked');
      const i0 = b.querySelector('i'); if (i0) i0.innerHTML = locked ? IC.lock : IC[d];
    });
    /* a door's tap area is the size of a door in the picture, not a small button */
    const sc = st.querySelector('.scene'), R = sc && sc.getBoundingClientRect();
    if (R && R.width) btns.forEach(b => { if (b.classList.contains('nav-door')) { b.style.setProperty('--dw', Math.round(R.width * 0.10) + 'px'); b.style.setProperty('--dh', Math.round(R.height * 0.34) + 'px'); } });
    /* doors drawn in the picture: no button at all, the door itself is what you tap */
    sp.querySelectorAll('.doorhit').forEach(x => x.remove());
    const rects = DOORS[GAME.LOC[s.loc] && GAME.LOC[s.loc].bg] || {};
    btns.forEach((b, i) => {
      const h = list[i], r = h && h.exit && rects[h.to]; if (!r) return;
      b.classList.add('nav-hid');
      const d = el('div', 'doorhit'); d.setAttribute('role', 'button'); d.setAttribute('aria-label', b.textContent.trim());
      d.style.cssText = `left:${r[0]}%;top:${r[1]}%;width:${r[2] - r[0]}%;height:${r[3] - r[1]}%`;
      d.onclick = ev => { ev.stopPropagation(); b.click(); };
      sp.insertBefore(d, sp.firstChild);
    });
    untangleSpots(sp);
    /* a door drawn in the picture always wins over another thing's label lying across it:
       the label lets taps through to the door; the thing's own dot still works */
    const hits = [...sp.querySelectorAll('.doorhit')].map(d => d.getBoundingClientRect());
    if (hits.length) sp.querySelectorAll('.spot').forEach(x => {
      const r = x.getBoundingClientRect();
      const over = hits.some(h => r.left < h.right && r.right > h.left && r.top < h.bottom && r.bottom > h.top);
      x.style.pointerEvents = over ? 'none' : '';
      const dot = x.querySelector('i'); if (dot) dot.style.pointerEvents = over ? 'auto' : '';
    });
    /* the back button, first in the top bar */
    const bar = st.querySelector('.hud .btns'); if (!bar || bar.querySelector('.ibtn.back')) return;
    const h = backExit(s); if (!h) return;
    const b = el('button', 'ibtn back'); b.type = 'button'; b.innerHTML = IC.back;
    const name = tx(GAME.LOC[h.to].name); b.setAttribute('aria-label', tx(BACK) + ' · ' + name); b.title = tx(BACK) + ' · ' + name;
    b.onclick = ev => { ev.stopPropagation(); if (tapOk(ev)) useSpot(h); };
    bar.insertBefore(b, bar.firstChild);
  }
})();
