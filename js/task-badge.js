/* =====================================================================
   Tasks you haven't looked at yet (UI only; no quest, condition or
   ending changes).
     · The phone button carries a small number: open tasks you haven't
       seen in the phone yet. Nothing else nags.
     · Opening the phone with something new goes straight to Tasks,
       and the new ones are marked there. Once seen, the number goes.
   ===================================================================== */
'use strict';
(function () {
  const seen = s => (s.f.qSeen = s.f.qSeen || []);
  const unseen = s => Object.keys(s.quests || {}).filter(k => s.quests[k] === 'active' && GAME.QUESTS[k] && !seen(s).includes(k));

  function badge() {
    const s = S(), st = $('stage'); if (!s || !st) return;
    const b = [...st.querySelectorAll('.hud .btns .ibtn')].find(x => x.getAttribute('aria-label') === UI('phone')); if (!b) return;
    b.querySelectorAll('.ibadge').forEach(x => x.remove());
    const n = s.f.prologue ? 0 : unseen(s).length; if (!n) return;
    b.classList.add('has-badge'); b.appendChild(el('span', 'ibadge', String(n > 9 ? '9+' : n)));
  }
  const rs0 = renderStage;
  renderStage = function () { const r = rs0.apply(this, arguments); try { badge(); } catch (e) { console.error(e); } return r; };

  const os0 = openSheet;
  openSheet = function (k) {
    const s = S(); if (k === 'phone' && s && VIEW.tab !== 'bag' && unseen(s).length) VIEW.tab = 'quests';
    return os0.apply(this, arguments);
  };

  const rsh0 = renderSheet;
  renderSheet = function () {
    const s = S(), fresh = s ? unseen(s) : [];
    const r = rsh0.apply(this, arguments);
    try {
      if (s && VIEW.sheet === 'phone' && VIEW.tab === 'quests') {
        /* the tasks first; what you know and your skills below them */
        const b = document.querySelector('#stage .sheet:not(.mapsheet)'), body = b && b.lastElementChild;
        if (body) { const end = body.querySelector('details.q-done'); ['.sofar', '.skills'].forEach(sel => { const x = body.querySelector(':scope > ' + sel); if (x) body.insertBefore(x, end); }); }
        document.querySelectorAll('#stage .sheet .q[data-q]').forEach(q => { if (fresh.includes(q.dataset.q)) q.classList.add('fresh'); });
        fresh.forEach(k => seen(s).push(k));
      }
    } catch (e) { console.error(e); }
    return r;
  };
})();
