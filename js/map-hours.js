/* =====================================================================
   The town map tells you why a place is closed and when it opens
   ("Closed · opens at noon"), instead of a dead pin. Places you can
   only look at for now (houses whose time hasn't come) are marked
   "not yet" in plain words. Nothing about who can go where changes.
   ===================================================================== */
'use strict';
(function () {
  const SL = ['t_morning', 't_noon', 't_afternoon', 't_evening', 't_night'];
  const W = { opens: T('opens', 'يفتح'), tomorrow: T('tomorrow morning', 'بكرة الصبح'), never: T('not today', 'مو اليوم'), notYet: T('not yet', 'مو الحين') };
  /* the first time of day (today, then tomorrow morning) when this pin's lock lets you in */
  function opensAt(p, s) {
    for (let k = s.slot + 1; k < SL.length; k++) { try { if (!p.lock(Object.assign({}, s, { slot: k }))) return tx(GAME.UI[SL[k]]); } catch (e) { return null; } }
    try { if (!p.lock(Object.assign({}, s, { slot: 0, day: s.day + 1 }))) return tx(W.tomorrow); } catch (e) { /* fall through */ }
    return null;
  }
  const base = renderSheet;
  renderSheet = function () {
    const r = base.apply(this, arguments);
    try {
      if (VIEW.sheet !== 'map') return r;
      const s = S(), pins = [...document.querySelectorAll('.sheet.mapsheet .mapwrap .pin')];
      const list = GAME.MAP.filter(p => !p.if || p.if(s));      /* the same order renderSheet draws them in */
      list.forEach((p, i) => {
        const b = pins[i]; if (!b) return;
        if (!p.to) { if (p.soon === false && p.place !== 'motel') { b.appendChild(el('em', 'nyet', ' · ' + tx(W.notYet))); } return; }
        if (!(p.lock && p.lock(s))) return;
        const when = opensAt(p, s);
        /* on the pin: just a clock (and the time if it is later today); the full sentence is in the message */
        b.appendChild(el('em', 'when', ' · ' + (when ? (when === tx(W.tomorrow) ? '🕒' : '🕒 ' + when) : tx(W.never))));
        const msg = (p.lockMsg ? tx(p.lockMsg) : UI('closedNow')) + (when ? ' ' + tx(W.opens) + ': ' + when + '.' : '');
        b.onclick = ev => { if (!tapOk(ev)) return; toast(msg); };
      });
    } catch (e) { console.error(e); }
    return r;
  };
})();
