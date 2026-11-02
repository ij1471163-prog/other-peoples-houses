/* =====================================================================
   The Admiral, by hand.
   Stella's lost ginger cat is no longer won with a fish and a line of
   text. You find him, and you have to win him yourself: with your
   finger, on the picture.
     · slow strokes on his head and back: he settles, and starts to purr
       (the purr gets louder the more he trusts you);
     · too fast, or his belly: ears back, a hiss, and he pulls away;
     · a light tap: a small "mrrp?"; too many taps: he's had enough.
   Once he trusts you he leans into your hand, and comes with you.
   After he's home, he sleeps at Stella's, and you can stroke him once a
   day (a little better mood). A fish still works, as before.
   Needs his pictures (img/chars/admiral-wary|calm|cross.webp); until they
   exist, the old way (the fish) is the only way. Sounds: img/snd/cat-*.
   Its own flags only (s.f.catT, s.f.catPet); the quest ends as it always did.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  /* his pictures are listed in img/manifest.js under chars.admiral (he isn't a character you talk to) */
  const pics = () => (window.IMG_MANIFEST && window.IMG_MANIFEST.chars && window.IMG_MANIFEST.chars.admiral) || null;
  const ready = () => { const p = pics(); return !!(p && p.wary); };   /* calm and cross are used when they exist */

  /* ---------- sound ---------- */
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const st = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (st.master || 0.8) * (st.sfx || 0.7) * k)); };
  const play = (name, k) => { if (!on()) return null; try { const a = new Audio('img/snd/' + name + '.mp3'); a.volume = vol(k); a.play().catch(() => {}); return a; } catch (e) { return null; } };
  const MEOW = false;   /* the made-up meows sound fake; on again when real recordings are in img/snd */
  let purr = null;
  function purrTo(k) {
    if (!on()) return;
    if (!purr) { try { purr = new Audio('img/snd/cat-purr.mp3'); purr.loop = true; purr.volume = 0; purr.play().catch(() => {}); } catch (e) { purr = null; return; } }
    purr.volume = vol(Math.max(0, Math.min(0.9, k)));
  }
  function purrStop() { if (purr) { try { purr.pause(); } catch (e) { /* none */ } purr = null; } }

  /* ---------- the mini-game ---------- */
  GAME.MINI.pet = function (panel, done, st) {
    panel.innerHTML = '';
    const s = GAME.S, P = pics() || {};
    const friendly = !!st.friendly;
    let trust = friendly ? 55 : Math.min(40, s.f.catT || 0);
    const box = el('div', 'cp ho ho-pet'); box.setAttribute('role', 'dialog');
    box.innerHTML = '<div class="cp-area"><div class="ho-bg"></div><div class="pet-body"><img class="pet-cat" alt=""><i class="pet-press"></i></div><div class="pet-sub"><strong class="cp-title"></strong><span class="cp-hint"></span></div><button type="button" class="cp-skip"></button></div>';
    $('stage').appendChild(box);
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(e => box.addEventListener(e, ev => ev.stopPropagation()));
    const q = x => box.querySelector(x), cat = q('.pet-cat'), area = q('.cp-area'), body = q('.pet-body'), press = q('.pet-press');
    const hint = t => { q('.cp-hint').textContent = tx(t); };
    q('.cp-title').textContent = tx(friendly ? T('The Admiral', 'الأدميرال') : T('A ginger cat', 'قطو برتقالي'));
    hint(friendly ? T('He\'s in a good mood. Mostly.', 'مزاجه زين. غالباً.') : T('Slowly. Let him smell your hand, then stroke his head and back.', 'بشويش. {خله|خليه} يشم يدك، وبعدين {امسح|امسحي} على راسه وظهره.'));
    q('.cp-skip').textContent = tx(T('Leave him', '{خله|خليه}'));
    const bgId = (GAME.LOC[s.loc] && GAME.LOC[s.loc].bg) || 'street';
    const bg = (PEOPLE.IMG.bg && (PEOPLE.IMG.bg[bgId] || PEOPLE.IMG.bg.street)) || '';
    q('.ho-bg').style.backgroundImage = bg ? `url(${bg})` : '';
    let pose = '';
    const setPose = p => { if (pose === p) return; pose = p; cat.src = P[p] || P.wary; };
    setPose(trust >= 60 ? 'calm' : 'wary');

    let over = false, won = false, cross = 0, taps = [], last = null, travel = 0, downAt = 0;
    /* how he moves: he breathes, leans into your hand as he starts to trust you, settles
       lower when he relaxes, and pulls back when he's annoyed */
    const mv = { lx: 0, ly: 0, rot: 0, recoil: 0, bob: 0, fx: null, fy: null };
    let raf = 0;
    const live = now => {
      if (over && !won) return;
      raf = requestAnimationFrame(live);
      const r = cat.getBoundingClientRect(), cx = r.left + r.width / 2, k = Math.min(1, trust / 100);
      let tx = 0, tr = 0;
      if (mv.fx != null && performance.now() >= cross) { tx = (mv.fx - cx) / r.width * 9 * (0.25 + k); tr = (mv.fx - cx) / r.width * 6 * (0.2 + k); }
      mv.lx += (tx - mv.lx) * 0.08; mv.rot += (tr - mv.rot) * 0.08;
      mv.recoil *= 0.9; mv.bob *= 0.86;
      const period = trust >= 60 ? 1500 : 2600, br = Math.sin(now / period * 2 * Math.PI);
      const settle = Math.max(0, k - 0.5) * 3;   /* % lower as he relaxes into a loaf */
      body.style.transform = `translate(calc(-50% + ${mv.lx.toFixed(2)}%), ${(settle + mv.recoil * 4 - mv.bob).toFixed(2)}%) rotate(${mv.rot.toFixed(2)}deg) scale(${(1 - mv.recoil * 0.05).toFixed(3)}, ${(1 + br * 0.011 - mv.recoil * 0.05).toFixed(3)})`;
      if (mv.fx != null) { press.style.opacity = '1'; press.style.left = (mv.fx - r.left) + 'px'; press.style.top = (mv.fy - r.top) + 'px'; } else press.style.opacity = '0';
    };
    raf = requestAnimationFrame(live);
    const alt = el('button', 'opt main cp-alt', tx(T('Leave him', '{خله|خليه}'))); alt.type = 'button'; panel.appendChild(alt);
    const finish = r => { if (over) return; over = true; setTimeout(() => cancelAnimationFrame(raf), 300); if (r) setTimeout(purrStop, 600); else purrStop(); alt.remove(); s.f.catT = Math.round(trust); box.classList.add('out'); box.style.pointerEvents = 'none'; setTimeout(() => box.remove(), 260); done(r); };
    q('.cp-skip').onclick = ev => { ev.stopPropagation(); finish(0); };
    alt.onclick = () => finish(0);

    /* where on him: 0 = top (head), 1 = bottom (belly, tail) */
    function zone(ev) {
      const r = cat.getBoundingClientRect();
      if (ev.clientX < r.left + r.width * 0.12 || ev.clientX > r.right - r.width * 0.12 || ev.clientY < r.top + r.height * 0.05 || ev.clientY > r.bottom) return -1;
      return (ev.clientY - r.top) / r.height;
    }
    function annoyed(why) {
      cross = performance.now() + 1500; trust = Math.max(0, trust - (friendly ? 6 : 12)); purrStop();
      if (P.cross) setPose('cross');
      play('cat-hiss', 0.5);
      mv.recoil = 1; mv.fx = null;
      hint(why);
      setTimeout(() => { if (!over && performance.now() >= cross) { setPose(trust >= 60 ? 'calm' : 'wary'); hint(T('Slower. Head and back.', 'أبطأ. الراس والظهر.')); } }, 1600);
    }
    function show() {
      if (performance.now() < cross) return;
      setPose(trust >= 60 ? 'calm' : 'wary');
      if (trust >= 100) {
        purrTo(0.8);
        hint(friendly ? T('He purrs like an old engine and falls asleep on your hand.', 'يخرخر مثل مكينة قديمة وينام على يدك.') : T('He pushes his head into your hand, hard, and purrs like an old boat engine.', 'يدفع راسه في يدك بقوة، ويخرخر مثل مكينة قارب قديمة.'));
        if (!won) { won = true; alt.remove(); setTimeout(() => finish(1), 1800); }
      } else if (trust >= 60) hint(T('He\'s purring. Keep going, slowly.', 'يخرخر. {كمّل|كمّلي}، بشويش.'));
      else if (trust >= 25) hint(T('His ears come forward. He\'s deciding about you.', 'أذونه ترجع لقدام. قاعد يقرر عنك.'));
    }
    area.addEventListener('pointerdown', ev => {
      if (over) return; ev.preventDefault();
      last = { x: ev.clientX, y: ev.clientY, t: performance.now() }; travel = 0; downAt = last.t;
      try { area.setPointerCapture(ev.pointerId); } catch (e) { /* none */ }
    });
    area.addEventListener('pointermove', ev => {
      if (over || won || !last || performance.now() < cross) return;
      const now = performance.now(), dx = ev.clientX - last.x, dy = ev.clientY - last.y, d = Math.hypot(dx, dy), dt = Math.max(1, now - last.t);
      last = { x: ev.clientX, y: ev.clientY, t: now };
      const z = zone(ev); if (z < 0) { mv.fx = null; purrTo(0); return; }
      mv.fx = ev.clientX; mv.fy = ev.clientY;
      travel += d;
      const speed = d / dt;   /* px per ms */
      if (z > 0.72) return annoyed(T('Not the belly. Never the belly.', 'مو البطن. أبداً مو البطن.'));
      if (speed > 2.4 && d > 6) return annoyed(T('Too fast. He flattens his ears.', 'بسرعة زيادة. نزّل أذونه.'));
      if (speed < 1.4) { trust = Math.min(100, trust + d * (friendly ? 0.09 : 0.06)); if (trust > 30) purrTo((trust - 30) / 90); }
      show();
    });
    const up = ev => {
      if (over || won || !last) return;
      const quick = performance.now() - downAt < 220 && travel < 8;
      last = null; mv.fx = null; purrTo(0);
      if (!quick || zone(ev) < 0 || performance.now() < cross) return;
      const now = performance.now(); taps = taps.filter(t => now - t < 2500); taps.push(now);
      if (taps.length >= 4) { taps = []; return annoyed(T('Poke, poke, poke. He has had enough of you.', 'نقر ونقر ونقر. خلاص زهق منك.')); }
      mv.bob = 1; if (MEOW) play(Math.random() < 0.5 ? 'cat-meow1' : 'cat-meow2', 0.45);
      if (trust < 20) trust += 3;
      hint(T('He looks up at your hand, then at you.', 'يطالع يدك، وبعدين يطالعك.')); show();
    };
    area.addEventListener('pointerup', up); area.addEventListener('pointercancel', () => { last = null; mv.fx = null; purrTo(0); });
  };

  /* ---------- finding him (replaces "you need a fish" once his pictures exist) ---------- */
  const SC = GAME.SCRIPTS, try0 = SC.catTry;
  if (try0) SC.catTry = s => {
    if (has('fish') || !ready()) return try0(s);
    return [N1(...fresh('catSee', [
      ['A big ginger cat on a low wall, tail wrapped round his feet, watching you the way a landlord watches a tenant.', 'قطو برتقالي كبير على جدار واطي، ذيله ملفوف على رجوله، يطالعك مثل ما يطالع المالك المستأجر.'],
      ['The ginger cat again. He doesn\'t run. He doesn\'t come either. He waits to see what you\'ll do.', 'القطو البرتقالي مرة ثانية. ما يهرب. وما يجي بعد. ينتظر يشوف وش {بتسوي|بتسوين}.']])),
      { mini: 'pet', then: (r, st) => r
        ? (give('admiral'), addMood(1), [N1('He lets you pick him up, which apparently nobody but Stella has ever been allowed to do. He is extremely heavy and completely pleased with himself.', 'يخليك {تشيله|تشيلينه}، وهذا على ما يبدو ما سمح فيه لأحد غير ستيلا. ثقيل مرة، ومبسوط على نفسه مرة.')])
        : [N1('He jumps down off the wall and strolls away, not fast, so you understand it\'s his decision.', 'ينط من الجدار ويمشي، مو بسرعة، عشان {تفهم|تفهمين} إنه قراره هو.')] }];
  };

  /* ---------- after he's home: at Stella's, once a day ---------- */
  if (GAME.LOC.florist) GAME.LOC.florist.spots.push({ x: 62, y: 62, label: T('The Admiral, asleep on the counter', 'الأدميرال، نايم على الكاونتر'),
    if: s => s.quests.q_cat === 'done' && s.slot < NIGHT && !doneToday('catPet') && ready(),
    run: s => [{ mini: 'pet', friendly: true, then: (r, st) => { onceToday('catPet'); if (r) { addMood(1); st.f.catPet = (st.f.catPet || 0) + 1; return [N1(...fresh('catPetL', [
      ['Stella watches you over a bucket of lilies. "He doesn\'t do that for everyone. He doesn\'t do that for me."', 'ستيلا تطالعك من ورا سطل زنابق. «ما يسوي كذا لأي أحد. ما يسويها حتى لي.»'],
      ['For ten minutes there is nothing in the world but a warm, heavy, rumbling cat. It\'s the best ten minutes of your day.', 'عشر دقايق ما في الدنيا إلا قطو دافي وثقيل ويخرخر. أحلى عشر دقايق في يومك.']]))]; } return null; } }] });
})();
