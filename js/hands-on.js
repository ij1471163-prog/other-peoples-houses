/* =====================================================================
   The big moments, by hand (instead of only reading them).
     · Elias's fall: you get him up yourself. Keep your finger on his arm
       as he sways; he rises as you hold. Let go and he sinks back a little.
     · The letter to Thomas: you write it with him, a line at a time,
       choosing the words; he answers each choice. The letter he reads
       out is the one you wrote.
   Both can be skipped and both always end well enough to go on: nothing
   here changes trust, suspicion or which ending you reach.
   ===================================================================== */
'use strict';
(function () {
  const S = () => GAME.S;
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  function card(cls, title, hint) {
    const box = el('div', 'cp ho ' + cls); box.setAttribute('role', 'dialog');
    box.innerHTML = '<div class="cp-card"><div class="cp-head"><div class="cp-tt"><strong class="cp-title"></strong><span class="cp-hint"></span></div><button type="button" class="cp-skip"></button></div><div class="cp-area"></div></div>';
    $('stage').appendChild(box);
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(e => box.addEventListener(e, ev => ev.stopPropagation()));
    const q = s => box.querySelector(s);
    q('.cp-title').textContent = tx(title); q('.cp-hint').textContent = tx(hint); q('.cp-skip').textContent = tx(T('Skip', 'تخطّي'));
    return { box, q, area: q('.cp-area'), hint: t => { q('.cp-hint').textContent = tx(t); } };
  }
  function shell(f, done) {
    const alt = el('button', 'opt main cp-alt', tx(T('Skip', 'تخطّي'))); alt.type = 'button'; const panel = $('panel'); if (panel) panel.appendChild(alt);
    let over = false;
    const finish = res => { if (over) return; over = true; alt.remove(); f.box.classList.add('out'); f.box.style.pointerEvents = 'none'; setTimeout(() => f.box.remove(), 260); done(res); };
    f.q('.cp-skip').onclick = ev => { ev.stopPropagation(); finish(0); };
    alt.onclick = () => finish(0);
    return { finish, over: () => over };
  }

  /* ---------------- 1. getting him up ---------------- */
  GAME.MINI.lift = function (panel, done, st) {
    panel.innerHTML = '';
    const f = card('ho-lift', T('Get him up', '{قوّمه|قوّميه}'), T('Hold his arm. Keep your finger on it as he sways.', '{امسك|امسكي} يده. {خل|خلي} إصبعك عليها وهو يتمايل.'));
    const sh = shell(f, done);
    const bg = (PEOPLE.IMG.bg && PEOPLE.IMG.bg[st.bg || 'kitchen']) || '';
    const im = (PEOPLE.IMG.chars.elias || {}).sad || (PEOPLE.IMG.chars.elias || {}).neutral || '';
    f.area.innerHTML = `<div class="ho-bg" style="background-image:url(${bg})"></div><img class="ho-man" src="${im}" alt=""><div class="ho-arm"><i></i><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/></svg></div><div class="ho-bar"><i></i></div>`;
    const man = f.q('.ho-man'), arm = f.q('.ho-arm'), ring = f.q('.ho-arm circle'), bar = f.q('.ho-bar i');
    let p = 0, holding = false, inside = false, t0 = performance.now(), last = t0, slips = 0, raf = 0;
    const L = 2 * Math.PI * 44; ring.style.strokeDasharray = L;
    const pos = t => ({ x: 50 + 22 * Math.sin(t / 900) + 6 * Math.sin(t / 310), y: 52 + 10 * Math.sin(t / 700 + 1) });
    const ptr = ev => { const r = f.area.getBoundingClientRect(), a = arm.getBoundingClientRect(); const cx = a.left + a.width / 2, cy = a.top + a.height / 2; inside = Math.hypot(ev.clientX - cx, ev.clientY - cy) < a.width * 0.75; };
    f.area.addEventListener('pointerdown', ev => { holding = true; try { f.area.setPointerCapture(ev.pointerId); } catch (e) {} ptr(ev); });
    f.area.addEventListener('pointermove', ev => { if (holding) ptr(ev); });
    ['pointerup', 'pointercancel'].forEach(e => f.area.addEventListener(e, () => { holding = false; inside = false; }));
    const tick = now => {
      if (sh.over()) return; raf = requestAnimationFrame(tick);
      const dt = Math.min(50, now - last); last = now;
      const c = pos(now - t0); arm.style.left = c.x + '%'; arm.style.top = c.y + '%';
      const was = p;
      if (holding && inside) p = Math.min(1, p + dt / 3000); else p = Math.max(0, p - dt / (holding ? 2200 : 4000));
      if (was > 0.25 && p < was && !(holding && inside) && Math.random() < 0.01) { slips++; f.hint(T('He slips back a little. "I\'m fine. I\'m fine."', 'يطيح شوي. «أنا بخير. بخير.»')); }
      arm.classList.toggle('on', holding && inside);
      ring.style.strokeDashoffset = L * (1 - p); bar.style.width = (p * 100) + '%';
      man.style.transform = `translate(-50%, ${(1 - p) * 46}%) rotate(${(1 - p) * -14}deg)`;
      if (p >= 1) { cancelAnimationFrame(raf); f.hint(T('He\'s up. His whole weight on your shoulder, for a moment.', 'قام. ثقله كله على كتفك، للحظة.')); setTimeout(() => sh.finish(1), 900); }
      else if (now - t0 > 22000) { cancelAnimationFrame(raf); f.hint(T('In the end he gets up by himself, slowly, with your arm under his.', 'بالآخر يقوم بنفسه، على مهله، ويدك تحت يده.')); setTimeout(() => sh.finish(1), 1200); }
    };
    raf = requestAnimationFrame(tick);
  };

  /* ---------------- 2. the letter ---------------- */
  const LINES = [
    [[T('Thomas,', 'توماس،'), T('Thomas. Just his name. He hates a fuss.', 'توماس. اسمه بس. يكره الهيلمان.')],
     [T('Son,', 'يا ولدي،'), T('Son. I haven\'t called him that since he was nine.', 'يا ولدي. ما قلتها له من كان عمره تسع.')]],
    [[T('I was wrong.', 'أنا غلطت.'), T('Three words. Took me eight years.', 'ثلاث كلمات. خذت مني ثمان سنين.')],
     [T('I was wrong, and I knew it the day you left.', 'أنا غلطت، وكنت أدري من يوم طلعت.'), T('...Yes. Write that. Before I change my mind.', '...إيه. {اكتبها|اكتبيها}. قبل لا أغير رأيي.')]],
    [[T('Come if you can.', 'تعال إذا تقدر.'), T('If he can. Don\'t push him.', 'إذا يقدر. لا {تضغط|تضغطين} عليه.')],
     [T('The door is open. It always was.', 'الباب مفتوح. وكان دايم مفتوح.'), T('It was. I never once said so.', 'كان مفتوح. وعمري ما قلتها.')]],
    [[T('If you can\'t, I understand.', 'وإذا ما تقدر، أنا فاهم.'), T('He\'ll understand. He always understood more than me.', 'بيفهم. هو دايم فهم أكثر مني.')],
     [T('Either way, I\'m proud of you.', 'وفي كل الأحوال، أنا فخور فيك.'), T('Am I? ...I am. Leave it in.', 'أنا كذا؟ ...إيه. {خلها|خليها}.')]]
  ];
  GAME.MINI.letter = function (panel, done) {
    panel.innerHTML = '';
    const f = card('ho-letter', T('A letter to Thomas', 'رسالة لتوماس'), T('He talks. You write. Choose the words.', 'هو يتكلم. {وأنت تكتب|وأنتِ تكتبين}. {اختار|اختاري} الكلمات.'));
    const sh = shell(f, done);
    f.area.innerHTML = '<div class="ho-paper"><div class="ho-lines"></div><div class="ho-sign"></div></div><div class="ho-pick"></div>';
    const lines = f.q('.ho-lines'), pick = f.q('.ho-pick'), sign = f.q('.ho-sign');
    const out = []; let i = 0;
    const write = (txt, cb) => { const p = el('p', ''); lines.appendChild(p); let j = 0; const tk = () => { if (sh.over()) return; p.textContent = txt.slice(0, ++j); if (j < txt.length) setTimeout(tk, 28); else cb(); }; tk(); };
    const next = () => {
      pick.innerHTML = '';
      if (i >= LINES.length) {
        write(tx(T('— Dad', '— أبوك')), () => { S().f.thLetter = out.map(x => x.en + '|' + x.ar); f.hint(T('He folds it twice, very carefully, and holds it for a while before he gives it back.', 'يطويها مرتين، بعناية كبيرة، ويمسكها شوي قبل لا يرجعها لك.')); setTimeout(() => sh.finish(1), 1800); });
        return;
      }
      LINES[i].forEach(([line, say]) => {
        const b = el('button', 'opt', tx(line)); b.type = 'button';
        b.onclick = ev => { ev.stopPropagation(); pick.innerHTML = ''; out.push(line); f.hint(T('Elias: ', 'إلياس: ')); f.q('.cp-hint').textContent = '«' + tx(say) + '»'; write(tx(line), () => { i++; setTimeout(next, 650); }); };
        pick.appendChild(b);
      });
    };
    next();
  };

  /* ---------------- wiring ---------------- */
  const fall0 = GAME.SCRIPTS.fall;
  if (typeof fall0 === 'function') GAME.SCRIPTS.fall = where => {
    const steps = fall0(where);
    const i = steps.findIndex(st => st && st.c === 'elias' && st.t && /No hospital/.test(st.t.en));
    /* the hold-his-arm game is off (it didn't feel right); a video of the fall goes here when there is one */
    void i;
    return steps;
  };
  const L0 = GAME.SCRIPTS.endLetter;
  if (Array.isArray(L0)) {
    const i = L0.findIndex(st => st && st.n && /three hours to write four lines/.test(st.n.en));
    const j = L0.findIndex(st => st && st.c === 'elias' && st.t && /Come if you can/.test(st.t.en));
    if (i >= 0 && j === i + 1) {
      L0.splice(j, 1,
        { mini: 'letter' },
        s => {
          const l = (s.f.thLetter || []).map(x => { const [en, ar] = x.split('|'); return { en, ar }; });
          if (l.length !== 4) return [{ c: 'elias', e: 'sad', t: T('"Thomas. I was wrong. Come if you can. If you can\'t, I understand."', '«توماس. أنا غلطت. تعال إذا تقدر. وإذا ما تقدر، أنا فاهم.»') }];
          return [{ c: 'elias', e: 'sad', t: { en: '"' + l.map(x => x.en).join(' ') + '"', ar: '«' + l.map(x => x.ar).join(' ') + '»' } }];
        });
    }
  }
})();
