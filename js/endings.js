/* =====================================================================
   Endings list: a reason to play again.
   On the title screen, "Endings found: 3 / 30" becomes a button. It
   opens the list of every ending, grouped by the house it belongs to.
   Endings you have reached on this device show their name; the rest are
   locked and show nothing but "???", so nothing is spoiled.
   The record is the one the game already keeps (seenEnds / oph.ends).
   ===================================================================== */
'use strict';
(function () {
  /* the houses, in the order you live in them; endings with no host are the last page of the story */
  const GROUPS = [['elias'], ['leo'], ['margaret'], ['evelyn'], ['victor'], [null, T('The end of the story', 'آخر القصة')]];

  function gallery(fresh) {
    const panel = $('panel'); panel.innerHTML = ''; panel.onclick = null;
    const seen = new Set(seenEnds()), all = Object.keys(GAME.END);
    const wrap = el('div', 'title-screen endings');
    wrap.appendChild(el('h2', '', tx(T('Endings', 'النهايات')) + ' · ' + all.filter(k => seen.has(k)).length + ' / ' + all.length));
    for (const [who, label] of GROUPS) {
      const ids = all.filter(k => (GAME.END[k].who || null) === who); if (!ids.length) continue;
      const got = ids.filter(k => seen.has(k)).length;
      wrap.appendChild(el('p', 'sec', (label ? tx(label) : tx(GAME.CHAR[who].name)) + ' · ' + got + ' / ' + ids.length));
      const list = el('div', 'end-list');
      ids.forEach(k => {
        const e = GAME.END[k], open = seen.has(k);
        const row = el('div', 'end-row' + (open ? '' : ' locked'), open ? (e.death ? '☠️ ' : '✦ ') + tx(e.title) : '🔒 ' + (GAME.lang === 'ar' ? '؟؟؟' : '???'));
        list.appendChild(row);
      });
      wrap.appendChild(list);
    }
    const back = el('button', 'opt main', tx(T('Back', 'رجوع'))); back.type = 'button'; back.onclick = () => titleScreen(fresh);
    wrap.appendChild(back);
    panel.appendChild(wrap);
    /* start at the top of the list, whatever was scrolled before */
    panel.scrollTop = 0; wrap.scrollTop = 0; const h = wrap.querySelector('h2'); if (h) h.scrollIntoView({ block: 'start' });
  }

  const base = titleScreen;
  titleScreen = function (fresh) {
    base(fresh);
    const label = tx(T('Endings found: ', 'النهايات اللي اكتشفتها: '));
    const p = [...$('panel').querySelectorAll('p.sec')].find(x => x.textContent.startsWith(label));
    if (!p) return;
    const b = el('button', 'opt', '🏆 ' + p.textContent); b.type = 'button'; b.onclick = () => gallery(fresh);
    p.replaceWith(b);
  };
})();
