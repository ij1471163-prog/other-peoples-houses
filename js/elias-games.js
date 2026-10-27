/* =====================================================================
   Two things to do with Elias, with your own hands (the stories after
   them stay exactly as they were; no trust or ending changes):
     · Mending the nets (the shed, afternoons): Elias shows a knot once,
       "over, under, through, pull", and you tie it from memory. Three
       knots close the hole; each knot is a little longer than the last.
       A mistake and the rope slips: start that knot again.
       Skill: 🛠 Hands.
     · Chess (the café, evenings): Elias sets up a position from one of
       his old games. "One move wins it." Tap a piece, tap where it goes.
       Three tries. A different position every evening.
       Skill: ♟ Mind.
   ===================================================================== */
'use strict';
(function () {
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const s = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (s.master || 0.8) * (s.sfx || 0.7) * k)); };
  let AC = null;
  const ac = () => { if (!on()) return null; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } };
  function blip(f, d, k, type) { const c = ac(); if (!c) return; try { const t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.7, t + d); g.gain.setValueAtTime(vol(k), t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.02); } catch (e) { /* none */ } }
  const rec = (name, k, rate) => { if (!on()) return; try { const a = new Audio('img/snd/' + name + '.mp3'); a.volume = vol(k); if (rate) { a.preservesPitch = false; a.playbackRate = rate; } a.play().catch(() => {}); } catch (e) { /* none */ } };

  /* ---------- two more skills ---------- */
  const LV = xp => Math.min(5, 1 + Math.floor(Math.sqrt(xp / 4)));
  function skillOf(key) { return LV(S().f[key] || 0); }
  function gain(key, n, sk) { const s = S(), b = skillOf(key); s.f[key] = (s.f[key] || 0) + n; const a = skillOf(key); if (a > b) toast(sk.icon + ' ' + tx(sk.name) + ' ' + a + ' ⬆'); }
  GAME.SKILLS = GAME.SKILLS || {};
  GAME.SKILLS.hands = { icon: '🛠', name: T('Hands', 'شغل اليد'), level: () => skillOf('skHands'), xp: () => S().f.skHands || 0, next: lv => 4 * lv * lv };
  GAME.SKILLS.mind = { icon: '♟', name: T('Mind', 'التفكير'), level: () => skillOf('skMind'), xp: () => S().f.skMind || 0, next: lv => 4 * lv * lv };

  function card(cls, title, hintText) {
    const st = $('stage');
    const box = el('div', 'cp ' + cls); box.setAttribute('role', 'dialog');
    box.innerHTML = '<div class="cp-card"><div class="cp-head"><div class="cp-tt"><strong class="cp-title"></strong><span class="cp-hint"></span></div><button type="button" class="cp-skip"></button></div><div class="cp-area"></div><div class="fs-row"><span class="g-count"></span><span class="g-skill"></span></div></div>';
    st.appendChild(box);
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(e => box.addEventListener(e, ev => ev.stopPropagation()));
    const q = s => box.querySelector(s);
    q('.cp-title').textContent = tx(title); q('.cp-hint').textContent = tx(hintText); q('.cp-skip').textContent = tx(T('Skip', 'تخطّي'));
    return { box, q, area: q('.cp-area'), hint: t => { q('.cp-hint').textContent = tx(t); } };
  }
  function shell(f, done, altClicks) {
    const alt = el('button', 'opt main cp-alt', tx(T('Skip', 'تخطّي'))); alt.type = 'button'; const panel = $('panel'); if (panel) panel.appendChild(alt);
    let over = false, n = 0;
    const finish = res => { if (over) return; over = true; alt.remove(); f.box.classList.add('out'); f.box.style.pointerEvents = 'none'; setTimeout(() => f.box.remove(), 260); done(res); };
    f.q('.cp-skip').onclick = ev => { ev.stopPropagation(); finish(0); };
    alt.onclick = () => { if (++n >= (altClicks || 1)) finish(0); };
    return { finish, isOver: () => over };
  }

  /* ================= the knot ================= */
  const MOVES = [
    { id: 'over', t: T('Over', 'فوق'), icon: '⤴' },
    { id: 'under', t: T('Under', 'تحت'), icon: '⤵' },
    { id: 'through', t: T('Through', 'من خلال'), icon: '⟳' },
    { id: 'pull', t: T('Pull', 'اسحب'), icon: '⇥' }
  ];
  const NET_SVG = () => {
    let p = '';
    for (let i = 0; i <= 12; i++) { p += `<path d="M${i * 30} 0 L${i * 30} 180" /><path d="M0 ${i * 15} L360 ${i * 15}" />`; }
    return `<svg class="kn-net" viewBox="0 0 360 180" preserveAspectRatio="xMidYMid slice"><g stroke="#c9b48a" stroke-width="2.4" fill="none" opacity=".85">${p}</g>
      <ellipse class="kn-hole" cx="180" cy="90" rx="62" ry="40" fill="#1a2128"/>
      <g class="kn-ties"></g></svg>`;
  };
  GAME.MINI.knot = function (panel, done) {
    panel.innerHTML = '';
    const lv = skillOf('skHands');
    const f = card('cp-knot', T('Mending the net', 'تصليح الشبكة'), T('Watch Elias\'s hands...', '{طالع|طالعي} يدين إلياس...'));
    const sh = shell(f, done, 3);
    f.area.innerHTML = '<div class="kn-top">' + NET_SVG() + '<div class="kn-show"></div></div><div class="kn-pad"></div>';
    f.q('.g-skill').textContent = '🛠 ' + lv;
    const pad = f.q('.kn-pad'), show = f.q('.kn-show');
    const btns = {};
    MOVES.forEach(m => { const b = el('button', 'kn-b'); b.type = 'button'; b.innerHTML = `<i>${m.icon}</i><span>${tx(m.t)}</span>`; b.dataset.id = m.id; pad.appendChild(b); btns[m.id] = b; });
    const tone = { over: 523, under: 392, through: 659, pull: 784 };
    const flash = (id, ok = true) => { const b = btns[id]; b.classList.add(ok ? 'lit' : 'bad'); blip(tone[id], 0.22, 0.2, 'triangle'); setTimeout(() => b.classList.remove('lit', 'bad'), 260); };
    let tied = 0;
    const tie = () => {
      const g = f.q('.kn-ties'), pos = [[150, 80], [180, 100], [210, 80]][tied - 1];
      g.insertAdjacentHTML('beforeend', `<g transform="translate(${pos[0]} ${pos[1]})"><circle r="9" fill="#e8d3a2" stroke="#3a2a18" stroke-width="2"/><path d="M-6 -3 Q0 6 6 -3 M-5 4 Q0 -4 5 4" stroke="#3a2a18" stroke-width="2" fill="none"/></g>`);
      const hole = f.q('.kn-hole'); hole.setAttribute('rx', Math.max(0, 62 - tied * 20)); hole.setAttribute('ry', Math.max(0, 40 - tied * 13));
    };
    (async () => {
      await wait(REDUCED() ? 0 : 350);
      let mistakes = 0;
      for (let k = 0; k < 3 && !sh.isOver(); k++) {
        const len = 3 + k;
        const seq = Array.from({ length: len }, (_, i) => i === len - 1 ? 'pull' : MOVES[Math.floor(Math.random() * 3)].id);
        f.q('.g-count').textContent = tx(T(`Knot ${k + 1} of 3`, `العقدة ${k + 1} من ٣`));
        f.box.dataset.k = k; f.box.dataset.seq = seq.join(',');
        let ok = false;
        while (!ok && !sh.isOver()) {
          /* Elias shows it: slower when you are new, quicker once your hands know it */
          f.hint(T('Watch Elias\'s hands...', '{طالع|طالعي} يدين إلياس...')); pad.classList.add('locked');
          const gap = 620 - lv * 60;
          for (const id of seq) { if (sh.isOver()) return; show.textContent = MOVES.find(m => m.id === id).icon; show.classList.add('on'); flash(id); await wait(gap); show.classList.remove('on'); await wait(120); }
          show.textContent = '';
          f.hint(T('Your turn: tie it the same way.', 'دورك: {اربطها|اربطيها} بنفس الطريقة.')); pad.classList.remove('locked');
          ok = await new Promise(res => {
            let i = 0;
            Object.values(btns).forEach(b => { b.onclick = ev => { ev.stopPropagation(); if (pad.classList.contains('locked')) return; const id = b.dataset.id;
              if (id === seq[i]) { flash(id); i++; if (i >= seq.length) { pad.classList.add('locked'); res(true); } }
              else { flash(id, false); pad.classList.add('locked'); rec('creak3', 0.4, 1.3); res(false); } }; });
          });
          if (!ok) { mistakes++; f.hint(T('The rope slips. Again.', 'الحبل فلت. مرة ثانية.')); await wait(900); }
        }
        if (sh.isOver()) return;
        tied++; tie(); rec('creak1', 0.35, 1.5); gain('skHands', 2, GAME.SKILLS.hands); await wait(500);
      }
      f.hint(T('The hole is closed.', 'الفتحة انسكرت.')); await wait(800);
      sh.finish(mistakes === 0 ? 2 : 1);
    })();
  };

  /* ================= chess ================= */
  /* positions from "Elias's old games": white to move, one move wins. Board as rows 8..1, files a..h.
     K Q R B N P = white, k q r b n p = black. */
  const PUZ = [
    { b: ['......k.', '.....ppp', '........', '........', '........', '........', '.....PPP', 'R.....K.'], ans: ['a1a8'],
      say: T('My father showed me this one. The back rank. Everybody forgets the back rank.', 'أبوي وراني هذي. الصف الأخير. الكل ينسى الصف الأخير.') },
    { b: ['rnbqkb.r', 'pppp.ppp', '.....n..', '....p..Q', '..B.P...', '........', 'PPPP.PPP', 'RNB.K.NR'], ans: ['h5f7'],
      say: T('The oldest trick there is. Marco fell for it in 1989. And 1990.', 'أقدم حيلة بالدنيا. ماركو طاح فيها سنة ٨٩. و٩٠.') },
    { b: ['......rk', '......pp', '........', '......N.', '........', '........', '........', '....K...'], ans: ['g5f7'],
      say: T('His own men around him like a wall. And the wall is what kills him.', 'رجاله حوله مثل الجدار. والجدار نفسه هو اللي يقتله.') },
    { b: ['k.......', '........', '.K......', '........', '........', '........', '........', '.......R'], ans: ['h1h8'],
      say: T('Two pieces against one. Slow, patient, then all at once.', 'قطعتين ضد وحدة. بشويش، وبصبر، وبعدين مرة وحدة.') },
    { b: ['.......k', 'Q.......', '......K.', '........', '........', '........', '........', '........'], ans: ['a7g7', 'a7h7', 'a7a8', 'a7b8'],
      say: T('The king walks up to help the queen. Even kings have to work, in the end.', 'الملك يمشي يساعد الوزير. حتى الملوك لازم يشتغلون، بالأخير.') },
    { b: ['......k.', '.r...ppp', '........', '........', '........', '........', '.....PPP', '...Q..K.'], ans: ['d1d8'],
      say: T('Same trick as the first night. You\'d be amazed how often it works.', 'نفس حيلة أول ليلة. {بتنصدم|بتنصدمين} كم مرة تنفع.') }
  ];
  const GLYPH = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙', k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
  GAME.MINI.chessPuzzle = function (panel, done) {
    panel.innerHTML = '';
    const s = S(), idx = (s.f.chessPuz || 0) % PUZ.length, P = PUZ[idx];
    const f = card('cp-chess', T('Chess with Elias', 'شطرنج مع إلياس'), T('"Your move. One move wins it."', '«دورك. نقلة وحدة وتفوز.»'));
    const sh = shell(f, done, 1);
    f.q('.g-skill').textContent = '♟ ' + skillOf('skMind');
    const board = el('div', 'ch-board'); f.area.appendChild(board);
    const side = el('div', 'ch-side'); side.innerHTML = '<img src="img/chars/elias-smile.webp" alt="">'; f.area.appendChild(side);
    const grid = P.b.map(r => r.split(''));
    const files = 'abcdefgh';
    const sq = {};
    let sel = null, tries = 0;
    const draw = () => {
      board.innerHTML = '';
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const name = files[c] + (8 - r), d = el('button', 'ch-sq ' + ((r + c) % 2 ? 'dk' : 'lt')); d.type = 'button'; d.dataset.sq = name;
        const p = grid[r][c]; if (p !== '.') { d.textContent = GLYPH[p] + '\uFE0E'; d.classList.add(p === p.toUpperCase() ? 'w' : 'b'); }
        if (sel === name) d.classList.add('sel');
        d.onclick = ev => { ev.stopPropagation(); tap(name, r, c); };
        board.appendChild(d); sq[name] = d;
      }
    };
    const at = name => { const c = files.indexOf(name[0]), r = 8 - Number(name[1]); return { r, c, p: grid[r][c] }; };
    function tap(name) {
      if (sh.isOver()) return;
      const a = at(name);
      if (!sel) { if (a.p !== '.' && a.p === a.p.toUpperCase()) { sel = name; blip(880, 0.05, 0.08); draw(); } return; }
      if (name === sel) { sel = null; draw(); return; }
      if (a.p !== '.' && a.p === a.p.toUpperCase()) { sel = name; draw(); return; }
      const mv = sel + name;
      if (P.ans.includes(mv)) {
        const from = at(sel); grid[a.r][a.c] = grid[from.r][from.c]; grid[from.r][from.c] = '.'; sel = null; draw();
        sq[name].classList.add('mate'); blip(523, 0.2, 0.2, 'triangle'); setTimeout(() => blip(784, 0.3, 0.2, 'triangle'), 150);
        f.hint(T('Checkmate.', 'كش مات.'));
        s.f.chessPuz = idx + 1; gain('skMind', 3, GAME.SKILLS.mind);
        setTimeout(() => sh.finish({ win: true, say: P.say }), 1300);
      } else {
        tries++; sel = null; draw(); sq[name].classList.add('no'); blip(180, 0.2, 0.2, 'sawtooth');
        if (tries >= 3) {
          f.hint(T('Elias shows you. "There. See it now?"', 'إلياس يوريك. «هنا. {شفتها|شفتيها} الحين؟»'));
          const [fr, to] = [P.ans[0].slice(0, 2), P.ans[0].slice(2)];
          setTimeout(() => { sq[fr] && sq[fr].classList.add('sel'); sq[to] && sq[to].classList.add('mate'); }, 200);
          s.f.chessPuz = idx + 1; gain('skMind', 1, GAME.SKILLS.mind);
          setTimeout(() => sh.finish({ win: false, say: P.say }), 2200);
        } else f.hint(tries === 1 ? T('Elias raises an eyebrow. "Look again."', 'إلياس يرفع حاجبه. «{طالع|طالعي} زين.»') : T('"Last try. Where is his king weak?"', '«آخر محاولة. وين ملكه ضعيف؟»'));
      }
    }
    draw();
  };

  /* ---------- in the story: the game first, then the same scene as before ---------- */
  /* the hands-on part sits inside the old scene: the first time after Elias shows you the knot, later at the start;
     the chess position comes after the game itself, before the clock moves */
  const nets0 = GAME.SCRIPTS.nets;
  GAME.SCRIPTS.nets = s => {
    const steps = nets0(s), first = s.f.netsCount === 1;
    const m = { mini: 'knot', then: r => first ? null : r === 2 ? [N_('Not one slip. Elias checks every knot, twice, and says nothing, which from him is applause.', 'ولا غلطة. إلياس يفحص كل عقدة، مرتين، وما يقول شي، وهذا منه تصفيق.')]
      : r === 1 ? [N_('The hole is closed. One knot is a bit lumpy. Elias leaves it, which is a kind of trust.', 'الفتحة انسكرت. عقدة وحدة شوي معوجة. إلياس يخليها، وهذا نوع من الثقة.')] : null };
    steps.splice(first ? 2 : 0, 0, m); return steps;
  };
  const chess0 = GAME.SCRIPTS.chess;
  GAME.SCRIPTS.chess = s => {
    const steps = chess0(s), last = steps.length && steps[steps.length - 1] && steps[steps.length - 1].time ? steps.length - 1 : steps.length;
    steps.splice(last, 0,
      E('neutral', 'One more. Not a game, a position. One of my old ones. One move wins it.', 'وحدة بعد. مو لعبة، وضعية. من لعباتي القديمة. نقلة وحدة وتفوز.'),
      { mini: 'chessPuzzle', then: r => r && r.say ? [r.win ? E('smile', 'Ha! Good. Good.', 'ها! زين. زين.') : E('neutral', 'Next time.', 'المرة الجاية.'), { c: 'elias', e: 'neutral', t: r.say }] : null });
    return steps;
  };
})();
