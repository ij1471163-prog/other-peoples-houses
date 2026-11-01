/* =====================================================================
   A quicker, clearer start (nothing in the story changes).
     · The opening reads in fewer taps: lines that belong together are
       shown together (the same words, joined).
     · In the motel room, the goal line says what to do next, and the way
       out glows, so a new player is never left wondering.
   ===================================================================== */
'use strict';
(function () {
  const intro = GAME.SCRIPTS.intro; if (!intro) return;
  const at = re => intro.findIndex(st => st && st.n && st.n.en && re.test(st.n.en));
  /* join line b onto line a (both languages), then drop b */
  function join(reA, reB) {
    const a = at(reA), b = at(reB); if (a < 0 || b !== a + 1) return;
    const A = intro[a].n, B = intro[b].n;
    intro[a] = { n: T(A.en + ' ' + B.en, A.ar + ' ' + B.ar) };
    intro.splice(b, 1);
  }
  join(/^The last train\./, /^Your phone buzzes/);
  join(/^A month ago you came home/, /^Your things were in boxes/);
  join(/^Dated the seventh of March/, /^Your father never once said/);
  join(/^Harbor Motel, room 6/, /^Three weeks, and you haven't asked/);

  /* the motel room: what to do next */
  const GOAL = T('A place to sleep — go outside', 'مكان {تنام|تنامين} فيه — {اطلع|اطلعي} برا');
  const HEAD = T('Prologue', 'البداية');
  function guide() {
    const s = S(), st = $('stage'); if (!s || !st || !s.f.prologue || s.loc !== 'motel' || RUN || VIEW.sheet) return;
    const chips = st.querySelector('.hud .chips');
    if (chips && !chips.querySelector('.chip.goal')) {
      const c = el('button', 'chip goal'); c.type = 'button';
      c.innerHTML = '<span class="g-ico">★</span><b></b><span class="g-sep"> — </span><span class="g-task"></span>';
      c.querySelector('b').textContent = tx(HEAD); c.querySelector('.g-task').textContent = tx(GOAL);
      chips.appendChild(c);
    }
    st.querySelectorAll('.spot.exit').forEach(b => b.classList.add('go-here'));
  }
  const rs0 = renderStage;
  renderStage = function () { const r = rs0.apply(this, arguments); try { guide(); } catch (e) { console.error(e); } return r; };
})();
