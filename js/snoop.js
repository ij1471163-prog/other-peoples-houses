/* =====================================================================
   Snooping you can see coming (UI only; the chance of being caught, the
   count and every ending stay exactly as they were).
     · A risky spot says so: 👁 before its name.
     · Tapping it asks once more ("Snoop? tap again"), so nobody goes
       through someone's things by accident.
     · Where being caught three times gets you thrown out (Elias, Leo),
       a small chip shows how close you are: 👁 1/3, 2/3.
   Automated players that call useSpot() directly are not affected.
   ===================================================================== */
'use strict';
(function () {
  const KICK = { elias: 3, leo: 3 };
  const L = {
    ask: T('Snoop? Tap again', '{تفتّش؟ اضغط|تفتّشين؟ اضغطي} مرة ثانية'),
    warn: (n, k, who) => T(`If ${who.en} catches you ${k} times, you're out (${n}/${k}).`, `لو ${who.ar} مسكك ${AR(k)} مرات، {تنطرد|تنطردين} من البيت (${AR(n)}/${AR(k)}).`),
    warnAny: who => T(`If you're caught, ${who.en} will know you went through their things.`, who.f ? `لو {انمسكت|انمسكتي}، ${who.ar} بتعرف إنك {فتّشت|فتّشتي} أغراضها.` : `لو {انمسكت|انمسكتي}، ${who.ar} بيعرف إنك {فتّشت|فتّشتي} أغراضه.`),
    chip: T('Caught', 'انمسكت')
  };
  const nameOf = id => { const c = GAME.CHAR[id] || {}; const n = c.short || c.name || { en: id, ar: id }; return { en: n.en || id, ar: n.ar || id, f: !!(PEOPLE.SPEC[id] && PEOPLE.SPEC[id].sex === 'f') }; };
  const say = msg => { const st = $('stage'); if (!st) return; st.querySelectorAll(':scope > .toast.wrap').forEach(o => o.remove()); const t = el('div', 'toast wrap', msg); st.appendChild(t); setTimeout(() => t.remove(), 3600); };
  const AR = n => GAME.lang === 'ar' ? String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : String(n);
  let armed = null, armedAt = 0;

  const rs0 = renderStage;
  renderStage = function () {
    const r = rs0.apply(this, arguments);
    try { decorate(); } catch (e) { console.error(e); }
    return r;
  };

  function decorate() {
    const s = S(), st = $('stage'); if (!s || !st) return;
    const host = s.host, inHouse = host && houseOf(s.loc) === host;
    /* the chip */
    const chips = st.querySelector('.hud .chips');
    if (chips) {
      chips.querySelectorAll('.chip.snoop').forEach(c => c.remove());
      const n = host ? (s.susp[host] || 0) : 0, k = KICK[host];
      if (inHouse && k && n > 0 && !RUN) {
        const c = el('button', 'chip snoop' + (n >= k - 1 ? ' hot' : '')); c.type = 'button';
        c.textContent = '👁 ' + AR(n) + '/' + AR(k);
        c.setAttribute('aria-label', tx(L.chip) + ' ' + n + '/' + k);
        c.onclick = ev => { ev.stopPropagation(); if (tapOk(ev)) say(tx(L.warn(n, k, nameOf(host)))); };
        const goal = chips.querySelector('.chip.goal'); chips.insertBefore(c, goal || null);
      }
    }
    /* the spots */
    if (RUN || VIEW.sheet) return;
    const sp = st.querySelector('.spots'); if (!sp) return;
    const list = visibleSpots(), btns = [...sp.querySelectorAll('.spot')];
    btns.forEach((b, i) => {
      const h = list[i]; if (!h || !b.classList.contains('risk')) return;
      const span = b.querySelector('span'); if (span && !span.dataset.eye) { span.dataset.eye = '1'; span.textContent = '👁 ' + span.textContent; }
      b.onclick = ev => {
        if (!tapOk(ev)) return;
        const now = performance.now();
        if (armed !== b || now - armedAt > 4000) {
          sp.querySelectorAll('.spot.armed').forEach(o => { o.classList.remove('armed'); const sx = o.querySelector('span'); if (sx && sx.dataset.txt) sx.textContent = sx.dataset.txt; });
          armed = b; armedAt = now; b.classList.add('armed', 'show');
          if (span) { span.dataset.txt = span.textContent; span.textContent = '👁 ' + tx(L.ask); }
          const who = host && houseOf(s.loc) === host ? host : null, k = who && KICK[who];
          if (who) say(tx(k ? L.warn(s.susp[who] || 0, k, nameOf(who)) : L.warnAny(nameOf(who))));
          untangleSpots(sp);
          return;
        }
        armed = null; useSpot(h);
      };
    });
    untangleSpots(sp);
  }
})();
