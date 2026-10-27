/* =====================================================================
   Fishing you actually do (replaces the old "tap in the green" bar).
   Three casts. Each one:
     1. Cast: tap when the swinging needle is in the bright part.
     2. Wait: watch the float. When it dips, tap, fast.
     3. Reel: hold to pull the fish in. Holding raises the line's
        tension; let go to ease it, or the line snaps. The fish fights.
   What you catch: mackerel (common), cod, sometimes a sea bass, and
   once in a while something that isn't a fish at all.
   Fishing is a skill (🎣 1–5): each level makes the bright part wider,
   bites come sooner, the fish fight less and rare fish come more often.
   The same game is used on Elias's boat at dawn and from the pier with a
   rod. Sami buys the whole catch. Nothing here touches trust or endings.
   ===================================================================== */
'use strict';
(function () {
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const s = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (s.master || 0.8) * (s.sfx || 0.7) * k)); };
  const rec = (name, k, rate) => { if (!on()) return; try { const a = new Audio('img/snd/' + name + '.mp3'); a.volume = vol(k); if (rate) { a.preservesPitch = false; a.playbackRate = rate; } a.play().catch(() => {}); } catch (e) { /* none */ } };
  let AC = null;
  const ac = () => { if (!on()) return null; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } };
  function blip(f, d, k, type) { const c = ac(); if (!c) return; try { const t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + d); g.gain.setValueAtTime(vol(k), t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.02); } catch (e) { /* none */ } }
  const SND = { plop: () => blip(420, 0.18, 0.25), bite: () => { blip(900, 0.08, 0.3, 'triangle'); setTimeout(() => blip(700, 0.1, 0.3, 'triangle'), 90); }, click: () => blip(1800, 0.02, 0.05, 'square'),
    snap: () => blip(260, 0.25, 0.4, 'sawtooth'), win: () => { [660, 880, 1100].forEach((f, i) => setTimeout(() => blip(f, 0.16, 0.18, 'triangle'), i * 90)); }, splash: () => rec('wave2', 0.35, 1.4) };

  /* ---------- the fishing skill ---------- */
  const LV = xp => Math.min(5, 1 + Math.floor(Math.sqrt(xp / 4)));
  const skill = () => LV((S().f.skFish) || 0);
  function gainXP(n) {
    const s = S(), before = skill(); s.f.skFish = (s.f.skFish || 0) + n;
    const after = skill(); if (after > before) toast('🎣 ' + tx(T('Fishing', 'الصيد')) + ' ' + after + ' ⬆');
  }
  GAME.SKILLS = GAME.SKILLS || {};
  GAME.SKILLS.fish = { icon: '🎣', name: T('Fishing', 'الصيد'), level: () => skill(), xp: () => S().f.skFish || 0, next: lv => 4 * lv * lv };

  /* ---------- what's in the sea ---------- */
  Object.assign(GAME.ITEMS, {
    cod: { name: T('A cod', 'سمكة قد'), desc: T('Heavy and grumpy-looking.', 'ثقيلة وشكلها زعلان.') },
    bass: { name: T('A sea bass', 'سمكة قاروص'), desc: T('Silver, beautiful, worth real money.', 'فضية، حلوة، وتسوى فلوس.') },
    bait: { name: T('Good bait', 'طعم زين'), desc: T('Smells awful. Fish love it.', 'ريحته فظيعة. والسمك يحبه.') },
    mints: { name: T('Peppermints', 'حلاو نعناع'), desc: T('The old-fashioned kind, in a paper bag.', 'من النوع القديم، في كيس ورق.') },
    bottle: { name: T('A bottle with a note', 'قارورة فيها ورقة'), desc: T('Corked, green glass. Someone threw this into the sea on purpose.', 'مسدودة، زجاج أخضر. أحد رماها في البحر عن قصد.') }
  });
  const PRICE = { fish: 4, cod: 6, bass: 12 };
  let tripBottle = false;
  function species(baited) {
    const lv = skill(), r = Math.random() - (baited ? 0.12 : 0);
    const s = S();
    /* bottles with notes: js/threads.js decides when the next one is due (they belong to Nell's story) */
    const due = GAME.bottleDue ? GAME.bottleDue(s, lv) : (!s.f.gotBottle && s.day >= 2 ? 0.05 + lv * 0.01 : 0);
    if (!tripBottle && due && r < due) { tripBottle = true; return 'bottle'; }
    if (r < 0.06 + lv * 0.03) return 'bass';
    if (r < 0.3 + lv * 0.04) return 'cod';
    return 'fish';
  }
  const NAME = { fish: T('Mackerel', 'ماكريل'), cod: T('Cod', 'قد'), bass: T('Sea bass!', 'قاروص!'), bottle: T('A bottle?', 'قارورة؟') };
  const FISH_SVG = (k) => {
    const col = { fish: ['#7fa6b8', '#2f4f63'], cod: ['#b49a6a', '#5a4630'], bass: ['#d8e2ea', '#6b7f90'] }[k];
    if (!col) return `<svg viewBox="0 0 60 120"><rect x="18" y="20" width="24" height="86" rx="10" fill="#3f7a4f" stroke="#1b2a20" stroke-width="3"/><rect x="24" y="6" width="12" height="18" fill="#7a5a3a" stroke="#1b2a20" stroke-width="3"/><rect x="22" y="44" width="16" height="30" fill="#efe3c6" opacity=".85"/></svg>`;
    return `<svg viewBox="0 0 160 70"><path d="M20 35 Q55 4 110 22 L150 6 L140 35 L150 64 L110 48 Q55 66 20 35Z" fill="${col[0]}" stroke="#1b2228" stroke-width="3"/><path d="M50 22 Q70 35 50 48" fill="none" stroke="${col[1]}" stroke-width="3"/><circle cx="34" cy="31" r="4" fill="#111"/><path d="M60 18 Q90 26 108 22" fill="none" stroke="${col[1]}" stroke-width="2" opacity=".6"/></svg>`;
  };

  /* ---------- the game ---------- */
  const W = {
    title: T('Fishing', 'صيد'),
    cast: T('Tap when the needle is in the bright part', '{اضغط|اضغطي} لما يكون المؤشر في الجزء المضيء'),
    wait: T('Watch the float... tap the moment it dips!', '{راقب|راقبي} العوامة... {اضغط|اضغطي} أول ما تغطس!'),
    reel: T('Hold to reel in. Let go when the line is tight!', '{اضغط وكمّل|اضغطي وكمّلي} عشان {تسحب|تسحبين}. {فك|فكّي} لما يشتد الخيط!'),
    early: T('Too early. It swims off.', 'بدري. السمكة راحت.'), late: T('Too slow. It took the bait.', 'متأخر. أكلت الطعم وراحت.'),
    snap: T('Snap! The line broke.', 'طق! الخيط انقطع.'), skip: T('Skip', 'تخطّي'), done: T('Done', 'خلاص'),
    cast2: n => T(`Cast ${n} of 3`, `الرمية ${n} من ٣`)
  };
  function card() {
    const st = $('stage');
    const box = el('div', 'cp cp-fishing'); box.setAttribute('role', 'dialog');
    box.innerHTML = `<div class="cp-card"><div class="cp-head"><div class="cp-tt"><strong class="cp-title"></strong><span class="cp-hint"></span></div><button type="button" class="cp-skip"></button></div>
      <div class="cp-area fs-sea"><div class="fs-sky"></div><div class="fs-waves"></div><div class="fs-fish"></div><svg class="fs-line" viewBox="0 0 100 100" preserveAspectRatio="none"><path d=""/></svg><div class="fs-float"><i></i></div>
      <div class="fs-power"><i class="fs-good"></i><b class="fs-needle"></b></div><div class="fs-tension"><i></i><span></span></div><div class="fs-progress"><i></i></div><div class="fs-msg"></div><div class="fs-catch"></div></div>
      <div class="fs-row"><span class="fs-count"></span><span class="fs-skill"></span></div></div>`;
    st.appendChild(box);
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(e => box.addEventListener(e, ev => ev.stopPropagation()));
    const q = s => box.querySelector(s);
    q('.cp-title').textContent = tx(W.title); q('.cp-skip').textContent = tx(W.skip);
    q('.fs-skill').textContent = '🎣 ' + skill();
    return { box, q, area: q('.cp-area') };
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function playFishing(done, casts) {
    casts = casts || 3; tripBottle = false;
    const f = card(), q = f.q, area = f.area;
    const alt = el('button', 'opt main cp-alt', tx(W.skip)); alt.type = 'button'; const panel = $('panel'); if (panel) panel.appendChild(alt);
    let over = false, caught = 0, raf = 0, phase = 'idle', onTap = null;
    const got = [];
    const finish = () => {
      if (over) return; over = true; cancelAnimationFrame(raf); alt.remove();
      f.box.classList.add('out'); f.box.style.pointerEvents = 'none'; setTimeout(() => f.box.remove(), 260);
      /* the common fish are the result (the scene that called gives them); the others go in your bag here */
      got.filter(k => k !== 'fish').forEach(k => give(k));
      if (got.includes('bottle')) { if (GAME.onBottle) GAME.onBottle(S()); S().f.gotBottle = true; }
      done(caught);
    };
    q('.cp-skip').onclick = ev => { ev.stopPropagation(); finish(); };
    /* the plain button (for automatic players and screen readers) skips one cast at a time, like the old three-tap game */
    let altN = 0; alt.onclick = () => { if (++altN >= casts) finish(); };
    const hint = t => { q('.cp-hint').textContent = tx(t); };
    const msg = (t, cls) => { const m = q('.fs-msg'); m.textContent = tx(t); m.className = 'fs-msg show ' + (cls || ''); setTimeout(() => m.classList.remove('show'), 1300); };
    const setLine = (x, y) => { q('.fs-line path').setAttribute('d', `M 4 2 Q ${(4 + x) / 2} ${y * 0.5} ${x} ${y}`); };
    const flt = q('.fs-float');
    const placeFloat = (x, y) => { flt.style.left = x + '%'; flt.style.top = y + '%'; setLine(x, y); };
    area.addEventListener('pointerdown', ev => { if (onTap) onTap('down', ev); });
    area.addEventListener('pointerup', ev => { if (onTap) onTap('up', ev); });
    area.addEventListener('pointercancel', ev => { if (onTap) onTap('up', ev); });
    area.addEventListener('pointerleave', ev => { if (onTap) onTap('up', ev); });

    async function oneCast(n) {
      q('.fs-count').textContent = tx(W.cast2(n)) + '  ·  🐟 ' + caught;
      area.className = 'cp-area fs-sea phase-cast';
      /* 1. the cast: a swinging needle, a bright part that is wider with skill */
      hint(W.cast);
      const lv = skill(), gw = 14 + lv * 4, gs = rnd(8, 92 - gw);
      const good = q('.fs-good'); good.style.left = gs + '%'; good.style.width = gw + '%';
      const needle = q('.fs-needle');
      let t0 = performance.now(), pos = 0;
      const per = 1.1 - lv * 0.06;
      await new Promise(res => {
        const loop = now => { const ph = ((now - t0) / 1000 / per) % 2; pos = (ph < 1 ? ph : 2 - ph) * 100; needle.style.left = pos + '%'; raf = requestAnimationFrame(loop); };
        raf = requestAnimationFrame(loop);
        onTap = kind => { if (kind !== 'down') return; onTap = null; cancelAnimationFrame(raf); res(); };
      });
      const castGood = pos >= gs - 2 && pos <= gs + gw + 2;
      const baited = has('bait'); if (baited) take('bait');
      SND.plop(); SND.splash();
      const fx = castGood ? rnd(55, 78) : rnd(30, 88), fy = castGood ? rnd(58, 70) : rnd(52, 76);
      area.className = 'cp-area fs-sea phase-wait'; placeFloat(fx, fy);
      gainXP(1);
      /* 2. the wait: the float bobs; when it dips, tap fast */
      hint(W.wait);
      const biteIn = (castGood ? rnd(900, 2200) : rnd(1800, 4200)) - lv * 150;
      let state = 'waiting';
      const res = await new Promise(resolve => {
        const timer = setTimeout(() => {
          state = 'bite'; flt.classList.add('dip'); SND.bite(); try { if (navigator.vibrate) navigator.vibrate(40); } catch (e) { /* none */ }
          const win = 650 + lv * 90;
          setTimeout(() => { if (state === 'bite') { state = 'gone'; flt.classList.remove('dip'); resolve('late'); } }, win);
        }, Math.max(500, biteIn));
        onTap = kind => { if (kind !== 'down') return; if (state === 'waiting') { clearTimeout(timer); state = 'gone'; resolve('early'); } else if (state === 'bite') { state = 'hooked'; resolve('hooked'); } };
      });
      onTap = null; flt.classList.remove('dip');
      if (res !== 'hooked') { msg(res === 'early' ? W.early : W.late, 'bad'); await wait(1100); return; }
      /* 3. the reel: hold to pull (tension rises), let go to ease; the fish fights back */
      const kind = species(baited);
      area.className = 'cp-area fs-sea phase-reel'; hint(W.reel);
      const fishEl = q('.fs-fish'); fishEl.innerHTML = FISH_SVG(kind); fishEl.className = 'fs-fish k-' + kind;
      const strength = { fish: 1, cod: 1.35, bass: 1.75, bottle: 0.6 }[kind] * (1 - (lv - 1) * 0.08);
      let prog = 0, ten = 20, holding = false, last = performance.now(), pull = 0, nextPull = performance.now() + rnd(500, 1200), tick = 0;
      onTap = k2 => { holding = k2 === 'down'; };
      const out = await new Promise(resolve => {
        const loop = now => {
          const dt = Math.min(0.05, (now - last) / 1000); last = now;
          if (now > nextPull) { pull = rnd(0.8, 1.6) * strength; nextPull = now + rnd(700, 1500) / strength; fishEl.classList.add('fight'); setTimeout(() => fishEl.classList.remove('fight'), 300); }
          pull = Math.max(0, pull - dt * 1.4);
          if (holding) { prog += dt * (30 - strength * 4); ten += dt * (20 + pull * 34); if (now - tick > 90) { tick = now; SND.click(); } }
          else { prog -= dt * (1.5 + pull * 4); ten -= dt * 55; }
          ten += pull * dt * 14;
          prog = Math.max(0, Math.min(100, prog)); ten = Math.max(0, ten);
          q('.fs-progress i').style.width = prog + '%';
          q('.fs-tension i').style.height = Math.min(100, ten) + '%';
          q('.fs-tension').classList.toggle('hot', ten > 75);
          const fxp = fx + (12 - fx) * (prog / 100) * 0.35, fyp = fy + (90 - fy) * (prog / 100);
          placeFloat(fx - (fx - 12) * prog / 300, fyp - 6); fishEl.style.left = fxp + '%'; fishEl.style.top = (fyp + 2) + '%';
          if (ten >= 100) { resolve('snap'); return; }
          if (prog >= 100) { resolve('caught'); return; }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      });
      onTap = null; holding = false;
      if (out === 'snap') { SND.snap(); msg(W.snap, 'bad'); try { if (navigator.vibrate) navigator.vibrate(80); } catch (e) { /* none */ } await wait(1200); return; }
      /* landed */
      SND.win(); SND.splash(); got.push(kind); if (kind === 'fish') caught++;
      gainXP(kind === 'fish' ? 2 : kind === 'bottle' ? 2 : 4);
      const c = q('.fs-catch'); c.innerHTML = FISH_SVG(kind) + '<b></b>'; c.querySelector('b').textContent = tx(NAME[kind]); c.className = 'fs-catch show k-' + kind;
      q('.fs-count').textContent = tx(W.cast2(n)) + '  ·  🐟 ' + got.length;
      await wait(1500); c.className = 'fs-catch';
    }
    (async () => {
      await wait(REDUCED() ? 0 : 320);
      for (let i = 1; i <= casts && !over; i++) await oneCast(i);
      if (!over) { hint(W.done); await wait(500); finish(); }
    })();
  }

  /* the old bar game is replaced everywhere it was used (the pier, with a rod) */
  GAME.MINI.fish = (panel, done) => { panel.innerHTML = ''; playFishing(done, 3); };

  /* on Elias's boat at dawn: the trip is the same story, with the fishing played first */
  const fs0 = GAME.SCRIPTS.fishing;
  GAME.SCRIPTS.fishing = s => {
    const rest = fs0(s);
    return [{ mini: 'fish', then: (hits, st) => {
      if (hits) give('fish', hits);
      const extra = ['cod', 'bass', 'bottle'].filter(k => has(k));
      return [hits || extra.length
        ? N_(hits >= 3 ? 'Elias looks at your catch, then at you. "Huh," he says. From him, that is a medal.' : 'You land something. Elias nods once, which is a lot, for Elias.', hits >= 3 ? 'إلياس يطالع صيدك، وبعدين يطالعك. «همم،» يقول. ومن إلياس، هذي ميدالية.' : '{تصيد|تصيدين} شي. إلياس يهز راسه مرة وحدة، وهذا كثير، من إلياس.')
        : N_('Nothing bites for you. Elias pretends not to notice, which is kind of him.', 'ولا شي يعلق معك. إلياس يسوي نفسه ما انتبه، وهذا لطف منه.')];
    } }].concat(rest);
  };

  /* ---------- Sami buys the whole catch ---------- */
  GAME.TOPICS.sami = GAME.TOPICS.sami || [];
  GAME.TOPICS.sami.unshift({ id: 'sellall', label: T('Sell him your whole catch', '{تبيع|تبيعين} له صيدك كله'), cls: 'main', if: s => Object.keys(PRICE).some(k => has(k)), run: s => {
    let total = 0; const parts = [];
    for (const [k, p] of Object.entries(PRICE)) { const n = s.inv[k] || 0; if (n) { total += n * p; parts.push(n + '× ' + tx(GAME.ITEMS[k].name)); take(k, n); } }
    s.money += total;
    return [{ c: 'sami', e: 'smile', t: T(`${parts.join(', ')}. That's $${total}. Pleasure doing business.`, `${parts.join('، ')}. يعني ${total}$. تعاملك يشرّف.`) },
      ...(total >= 20 ? [{ c: 'sami', e: 'shock', t: T('You\'re going to put the fishmonger out of business. We don\'t have a fishmonger. You\'re going to become the fishmonger.', '{بتطلّع|بتطلّعين} بياع السمك من السوق. ما عندنا بياع سمك. {بتصير أنت|بتصيرين أنتِ} بياع السمك.') }] : [])];
  } });

  /* Sami's shop: bait for better fish, and something for Elias */
  GAME.TOPICS.sami.push(
    { id: 'buybait', label: T('Buy good bait ($2, three casts)', '{تشتري|تشترين} طعم زين (٢$، ثلاث رميات)'), if: s => has('rod') || !!s.f.fished, need: s => s.money >= 2, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { pay(2); give('bait', 3);
      return [{ c: 'sami', e: 'neutral', t: T('Don\'t open it indoors. Or near anyone you love.', '{لا تفتحه|لا تفتحينه} داخل البيت. ولا قريب من أحد {تحبه|تحبينه}.') }]; } },
    { id: 'buymints', label: T('Buy peppermints ($2)', '{تشتري|تشترين} حلاو نعناع (٢$)'), if: s => !has('mints'), need: s => s.money >= 2, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { pay(2); give('mints');
      return [{ c: 'sami', e: 'smile', t: T('Elias\'s favourites. He thinks nobody knows.', 'المفضلة عند إلياس. يحسب محد يدري.') }]; } });
  GAME.TOPICS.elias.push({ id: 'mints', label: T('Give him the peppermints', '{تعطيه|تعطينه} حلاو النعناع'), if: s => has('mints'), run: s => { take('mints'); addMood(1); s.f.mintsGiven = (s.f.mintsGiven || 0) + 1;
    const n = s.f.mintsGiven;
    return n === 1 ? [E('shock', 'Where did you... Sami. Sami told you.', 'من وين... سامي. سامي قال لك.'), E('smile', 'Ada used to keep these in her coat pocket. For the boat. For the seasickness. They never worked.', 'آدا كانت تحطها في جيب كوتها. للقارب. للدوار. وعمرها ما نفعت.'), N_('He takes one, and puts the bag in his own coat pocket, and pats it.', 'ياخذ وحدة، ويحط الكيس في جيب كوته، ويطبطب عليه.')]
      : [pickOne([E('smile', 'You\'ll rot my last three teeth. Thank you.', '{بتخرّب|بتخرّبين} آخر ثلاث أسنان عندي. مشكور.'), E('neutral', 'Mm. Ada\'s brand.', 'ممم. نوع آدا.'), N_('He pretends to be annoyed for nearly four seconds.', 'يسوي نفسه منزعج تقريباً أربع ثواني.')])]; } });

  /* the bottles: reading them is in js/threads.js */
  GAME.TOPICS.elias = GAME.TOPICS.elias || [];

  /* ---------- your skills, in the phone's Tasks tab ---------- */
  const rsh0 = renderSheet;
  renderSheet = function () {
    const r = rsh0.apply(this, arguments);
    try {
      if (VIEW.sheet === 'phone' && VIEW.tab === 'quests') {
        const body = document.querySelector('#stage .sheet:not(.mapsheet)'); const b = body && body.lastElementChild; if (!b || b.querySelector('.skills')) return r;
        const box = el('div', 'skills'); box.appendChild(el('strong', '', tx(T('Your skills', 'مهاراتك'))));
        for (const k of Object.keys(GAME.SKILLS)) {
          const sk = GAME.SKILLS[k], lv = sk.level(), xp = sk.xp(), lo = lv > 1 ? sk.next(lv - 1) : 0, hi = sk.next(lv);
          const row = el('div', 'sk-row'); row.appendChild(el('span', '', sk.icon + ' ' + tx(sk.name) + ' · ' + lv + (lv >= 5 ? ' ★' : '')));
          const bar = el('div', 'sk-bar'); const i = el('i'); i.style.width = (lv >= 5 ? 100 : Math.round((xp - lo) / Math.max(1, hi - lo) * 100)) + '%'; bar.appendChild(i); row.appendChild(bar);
          box.appendChild(row);
        }
        const sf = b.querySelector('.sofar'); if (sf && sf.nextSibling) b.insertBefore(box, sf.nextSibling); else b.insertBefore(box, b.firstChild);
      }
    } catch (e) { console.error(e); }
    return r;
  };
  window.__fish = { playFishing, species };   /* for tests */
})();
