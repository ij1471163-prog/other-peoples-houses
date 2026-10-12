/* =====================================================================
   Replays: skip the opening you have already read.
   The first time through, the opening plays in full. Once you have
   finished it on this device, the "Who are you?" screen also offers
   "Skip the opening": the same script runs (the postcard, the quests,
   the motel), but only one short line is shown instead of the whole
   story of the boxes and the train. Nothing else changes.
   ===================================================================== */
'use strict';
(function () {
  const intro = GAME.SCRIPTS.intro;
  /* remember, on this device, that the opening has been read once */
  intro.push(() => { if (!PREFS.get('introSeen')) PREFS.set('introSeen', true); return null; });

  /* the same steps without the text lines, plus one line to say where you are */
  const isLine = st => st && typeof st === 'object' && (st.n || st.t) && !st.menu;
  const short = () => intro.filter(st => !isLine(st)).reduce((out, st) => {
    out.push(st);
    if (st && st.go === 'motel') out.push(N_('Saltmere. Harbor Motel, room 6, three weeks later. Your father\'s postcard is in your bag. Checkout is tomorrow, noon.',
      'سولتمير. موتيل الميناء، غرفة ٦، بعد ثلاث أسابيع. كرت أبوك في شنطتك. والخروج بكرة الظهر.'));
    return out;
  }, []);

  const base = setupScreen;
  setupScreen = function () {
    base();
    if (!PREFS.get('introSeen')) return;
    const panel = $('panel'), begin = [...panel.querySelectorAll('.opt.main')].pop(), inp = $('pname');
    if (!begin || !inp) return;
    const b = el('button', 'opt', tx(T('Begin · Skip the opening', '{ابدأ|ابدئي} · بدون المقدمة'))); b.type = 'button';
    b.onclick = () => { GAME.S.name = (inp.value || '').trim().slice(0, 16) || tx(T('Alex', 'أليكس')); GAME.S.f.prologue = true; play(short()); };
    panel.appendChild(b);
    /* keep its label in step with the gender buttons, like the main start button */
    panel.querySelectorAll('[data-g]').forEach(g => g.addEventListener('click', () => { b.textContent = tx(T('Begin · Skip the opening', '{ابدأ|ابدئي} · بدون المقدمة')); }));
  };
})();
