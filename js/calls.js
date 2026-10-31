/* =====================================================================
   Someone calls you from another room (UI only).
   Instead of a line of narration that stops you, a voice: you hear the
   person murmur from where they are, and a subtitle shows for a few
   seconds at the edge of the picture, on the side of the way to them.
   You keep walking; nothing waits for you.
   Used in Elias's house, so the first days have a rhythm you can hear:
     · at night, from the living room, where the story happens at night;
     · in the afternoon, from the shed, when the nets are waiting;
     · if you stayed in bed when he knocked at dawn, he tells you later
       where to find him (the same two tasks the boat trip would open).
   Nothing here reads or changes trust, suspicion or any ending.
   ===================================================================== */
'use strict';
(function () {
  function call(who, from, line, side) {
    const st = $('stage'); if (!st) return;
    st.querySelectorAll('.vcall').forEach(x => x.remove());
    const c = GAME.CHAR[who]; if (!c) return;
    const b = el('div', 'vcall vc-' + (side || 'left'));
    b.appendChild(el('small', '', tx(c.name) + ' · ' + tx(from)));
    b.appendChild(el('span', '', '«' + tx(line).replace(/^«|»$/g, '') + '»'));
    st.appendChild(b);
    try { AUDIO.line({ c: who, t: line, e: 'neutral' }); } catch (e) { /* sound off */ }
    setTimeout(() => b.classList.add('out'), 5200); setTimeout(() => b.remove(), 6200);
  }
  GAME.CALL = call;

  const inElias = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !s.f.prologue;
  const where = (id, s) => (GAME.CHAR[id] && GAME.CHAR[id].where ? GAME.CHAR[id].where(s) : null);
  const exitTo = (s, to) => visibleSpots().find(h => h.exit && h.to === to);
  const sideOf = h => (!h ? 'left' : h.x < 40 ? 'left' : h.x > 60 ? 'right' : 'mid');
  const once = (s, k) => { const key = 'hintCall_' + k + '@' + s.day; if (s.once[key]) return false; s.once[key] = 1; return true; };
  const pick = (s, a) => a[s.day % a.length];

  const NIGHT_LINES = [
    T('Radio\'s on, if you can\'t sleep.', 'الراديو شغال، إذا ما جاك نوم.'),
    T('Kettle\'s still warm. Come down if you want.', 'الغلاية لسا دافية. {انزل|انزلي} إذا تبي{|ن}.'),
    T('There\'s a match on the radio. Nobody to argue with.', 'فيه مباراة في الراديو. وما عندي أحد أتهاوش معه.')
  ];
  const NETS_LINES = [
    T('Nets won\'t mend themselves. Shed, out back.', 'الشباك ما تصلّح نفسها. المخزن، ورا البيت.'),
    T('I\'m in the shed, if you\'ve got idle hands.', 'أنا في المخزن، إذا يدينك فاضية.')
  ];

  function cues() {
    const s = S(); if (!inElias(s) || RUN || VIEW.sheet) return;
    /* at night, from the living room */
    if (s.slot === NIGHT && s.loc !== 'living' && where('elias', s) === 'living' && ['your_room', 'hall', 'kitchen', 'bath', 'yard'].includes(s.loc) && once(s, 'night')) {
      const h = exitTo(s, 'living') || exitTo(s, 'hall');
      return call('elias', T('from the living room', 'من الصالة'), pick(s, NIGHT_LINES), sideOf(h));
    }
    /* in the afternoon, from the shed, while the nets are a task */
    if (s.slot === 2 && s.quests.q_nets === 'active' && s.loc !== 'shed' && where('elias', s) === 'shed' && ['your_room', 'hall', 'kitchen', 'living', 'yard'].includes(s.loc) && once(s, 'nets')) {
      const h = exitTo(s, 'shed') || exitTo(s, 'yard') || exitTo(s, 'kitchen');
      return call('elias', T('from the shed', 'من المخزن'), pick(s, NETS_LINES), sideOf(h));
    }
    /* stayed in bed at dawn: he tells you where he'll be */
    if (s.quests.q_dawn === 'active' && !s.quests.q_nets && (s.slot === 1 || s.slot === 2) && (where('elias', s) === s.loc || ['hall', 'kitchen', 'your_room', 'living'].includes(s.loc)) && once(s, 'dawn')) {
      quest('q_nets', 'active'); quest('q_chess', 'active');
      return call('elias', where('elias', s) === s.loc ? T('looking up from his cup', 'يرفع عينه من كوبه') : T('somewhere in the house', 'من مكان في البيت'), T('Missed you on the boat. Nets out back this afternoon, chess at Marco\'s after six. If you\'re bored.', 'فاتك القارب. الشباك ورا البيت العصر، والشطرنج عند ماركو بعد ست. إذا {زهقت|زهقتي}.'), 'mid');
    }
  }
  const rl0 = renderLocation;
  renderLocation = function () {
    const r = rl0.apply(this, arguments);
    setTimeout(() => { try { cues(); } catch (e) { console.error(e); } }, 1100);
    return r;
  };
})();
