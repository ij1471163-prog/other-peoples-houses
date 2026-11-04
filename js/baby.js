/* =====================================================================
   Pip. Sami's sister's little girl, about a year old. Her mum works the
   morning shift at the cannery, so in the mornings Pip is in a playpen
   behind the counter at the grocery, and Sami serves customers around
   her. She is in charge.
   Mornings only, once a day, with Sami right there (MINI.pip). It runs
   on the user's film of her (img/fx/pipv, 10 pictures a second, with
   her own babble, giggle and yawn from its soundtrack): she sits and
   looks about and babbles; two games, chosen at the top: peekaboo
   (hold to cover your eyes, let go) and bubbles (tap to blow; when one
   drifts to her she grabs it and it pops), and she laughs and claps.
   When she has laughed enough she yawns and rubs her eyes: drag the
   blanket onto her and she flops down and goes to sleep.
   No touching game (that is for the cat and the hamster): everything is
   done through play. (The close-up pictures in img/fx/pip are still used
   for 'still asleep' later that morning.)
   Own flags (s.f.pipMet, pipNaps); mood, and Sami's trust once.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const S1 = (e, en, ar) => ({ c: 'sami', e, t: T(en, ar) });
  const FR = [0, 1, 2, 3, 4, 5].map(i => 'img/fx/pip/' + i + '.webp');   /* 0 curious, 1 laughing, 2 hiding, 3 yawning, 4 asleep with her rabbit, 5 lying down, eyes still open */

  /* the user's film of her (img/fx/pipv/00-99, 10 a second): what each stretch of it is */
  const VF = Array.from({ length: 100 }, (_, i) => 'img/fx/pipv/' + String(i).padStart(2, '0') + '.webp');
  const SEG = { calm: [0, 18], happy: [20, 39], yawn: [40, 53], flop: [54, 57], sleep: [58, 99] };
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const st = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (st.master || 0.8) * (st.sfx || 0.7) * k)); };
  /* her sounds: only once real ones exist (img/snd/pip-*.mp3); the film's own soundtrack wasn't her */
  const HAS = { 'pip-giggle': false, 'pip-babble': false, 'pip-yawn': false };
  const snd = (name, k) => { if (!HAS[name] || !on()) return; try { const a = new Audio('img/snd/' + name + '.mp3'); a.volume = vol(k); a.play().catch(() => {}); } catch (e) { /* no sound */ } };

  GAME.MINI.pip = function (panel, done) {
    panel.innerHTML = '';
    const pre = VF.map(u => { const im = new Image(); im.src = u; return im; });
    const box = el('div', 'cp ho ho-pip vid'); box.setAttribute('role', 'dialog');
    box.innerHTML = '<div class="cp-area"><img class="pip-v" alt=""><div class="pip-bubs"></div><div class="pip-hand l"></div><div class="pip-hand r"></div><b class="pip-boo"></b>'
      + '<div class="pip-blanket" hidden></div><div class="pip-tools"><button type="button" data-m="peek"></button><button type="button" data-m="bub"></button></div>'
      + '<div class="pet-sub"><strong class="cp-title"></strong><span class="cp-hint"></span></div><button type="button" class="cp-skip"></button></div>';
    $('stage').appendChild(box);
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(e => box.addEventListener(e, ev => ev.stopPropagation()));
    const q = x => box.querySelector(x), area = q('.cp-area'), img = q('.pip-v'), boo = q('.pip-boo'), bubs = q('.pip-bubs'), blanket = q('.pip-blanket'), tools = q('.pip-tools');
    const hint = t => { q('.cp-hint').textContent = tx(t); };
    q('.cp-title').textContent = tx(T('Pip', 'بِب'));
    q('.cp-skip').textContent = tx(T('Give her back to Sami', '{رجّعها|رجّعيها} لسامي'));
    tools.children[0].textContent = tx(T('Peekaboo', 'غمّيضة'));
    tools.children[1].textContent = tx(T('Bubbles', 'فقاعات'));
    const alt = el('button', 'opt main cp-alt', tx(T('Give her back to Sami', '{رجّعها|رجّعيها} لسامي'))); alt.type = 'button'; panel.appendChild(alt);

    /* the film: play a stretch once, or loop one back and forth */
    let fi = 0, seg = 'calm', dir = 1, once = null, lastF = 0;
    const frame = i => { fi = i; const im = pre[i]; img.src = im && im.complete && im.naturalWidth ? im.src : VF[i]; };
    const loop = name => { seg = name; once = null; dir = 1; fi = SEG[name][0]; };
    const play = (name, then) => { seg = name; once = then || null; fi = SEG[name][0]; dir = 1; };
    frame(0);

    let over = false, joy = 0, mode = 'peek', phase = 'you', downAt = 0, hidden = false, busyTill = 0, raf = 0;
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(() => { if (!over) f(); }, ms));
    const say = (t, ms = 900) => { boo.textContent = tx(t); boo.classList.remove('on'); void boo.offsetWidth; boo.classList.add('on'); later(() => boo.classList.remove('on'), ms); };
    const BAB = { idle: [T('ba?', 'با؟'), T('da!', 'دا!'), T('mmm', 'ممم'), T('ah-ah', 'آه آه'), T('ba-ba-ba', 'بابابا'), T('oo?', 'أوو؟')], happy: [T('hee!', 'هيي!'), T('again!', 'كمان!'), T('boo!', 'بخ!'), T('ha-ha!', 'هاها!'), T('more!', 'زيد!')], bored: [T('ba...', 'با...'), T('hmph.', 'همف.'), T('da?', 'دا؟')] };
    const pick = a => a[Math.floor(Math.random() * a.length)];
    let lastPlay = performance.now();
    const babble = (kind, sound) => { say(pick(BAB[kind]), 1000); if (sound) snd('pip-babble', 0.55); };
    const idleT = setInterval(() => {
      if (over || phase !== 'you' || performance.now() < busyTill) return;
      const quiet = performance.now() - lastPlay;
      if (quiet > 7000) { babble('bored', true); hint(T('She\'s waiting for you. She\'s not good at waiting.', 'تنتظرك. وما تعرف تنتظر.')); lastPlay = performance.now() - 3500; }
      else if (Math.random() < 0.3) babble('idle', Math.random() < 0.4);
    }, 2600);
    const finish = r => { if (over) return; over = true; clearInterval(idleT); cancelAnimationFrame(raf); timers.forEach(clearTimeout); alt.remove(); box.classList.add('out'); box.style.pointerEvents = 'none'; setTimeout(() => box.remove(), 300); done(r); };
    q('.cp-skip').onclick = ev => { ev.stopPropagation(); finish(0); };
    alt.onclick = () => finish(0);

    const HINT = {
      peek: T('Hold to cover your eyes. Then let go.', '{اضغط|اضغطي} مطوّل عشان {تغطي|تغطين} عيونك. وبعدين {فك|فكي}.'),
      bub: T('Tap to blow bubbles. Let them float to her.', '{انقر|انقري} عشان {تنفخ|تنفخين} فقاعات. {خلها|خليها} تطير لها.')
    };
    const setMode = m => { if (phase !== 'you') return; mode = m; [...tools.children].forEach(b => b.classList.toggle('on', b.dataset.m === m)); hint(HINT[m]); };
    [...tools.children].forEach(b => b.addEventListener('pointerdown', ev => { ev.stopPropagation(); setMode(b.dataset.m); }));
    setMode('peek');

    /* laughing: the happy stretch of the film, with her giggle */
    const laugh = (word) => {
      if (phase !== 'you') return;
      busyTill = performance.now() + 2000; lastPlay = performance.now();
      play('happy', () => loop('calm')); snd('pip-giggle', 0.8);
      say(word || pick(BAB.happy), 900);
      joy += mode === 'bub' ? 0.6 : 1;
      if (joy >= 5) later(tired, 2100);
    };
    /* she has laughed enough: she yawns and rubs her eyes; give her the blanket */
    const tired = () => {
      if (phase !== 'you') return; phase = 'tired'; tools.hidden = true;
      play('yawn', () => { seg = 'rub'; }); snd('pip-yawn', 0.7);
      hint(T('She\'s rubbing her eyes. Drag the blanket to her.', 'قاعدة تفرك عيونها. {اسحب|اسحبي} البطانية لها.'));
      later(() => { blanket.hidden = false; }, 900);
    };
    const asleep = () => {
      phase = 'sleep'; blanket.hidden = true;
      play('flop', () => loop('sleep'));
      hint(T('She flops down onto her pillow. She fights it. She\'s losing.', 'تطيح على مخدتها. تقاوم. وقاعدة تخسر.'));
      later(() => hint(T('She\'s asleep.', 'نامت.')), 2200);
      later(() => area.classList.add('dim'), 3800);
      later(() => finish(1), 5200);
    };

    /* the clock of the film, 10 pictures a second */
    const tick = now => {
      if (over) return; raf = requestAnimationFrame(tick);
      stepBubbles(now);
      if (now - lastF < 100) return; lastF = now;
      if (seg === 'rub') { const [a, b] = [46, 53]; let n = fi + dir; if (n > b || n < a) { dir = -dir; n = fi + dir; } return frame(n); }
      const [a, b] = SEG[seg];
      if (once) { if (fi < b) return frame(fi + 1); const t = once; once = null; return t(); }
      let n = fi + dir; if (n > b || n < a) { dir = -dir; n = fi + dir; } frame(n);
    };

    /* ---- bubbles: they float up and sideways; when one drifts to her she grabs at it and it pops ---- */
    const live = []; let lastB = performance.now();
    const blow = (x, y) => {
      for (let k = 0; k < 4; k++) {
        const b = el('i', 'pip-bub'); const r = 14 + Math.random() * 22; b.style.width = b.style.height = r + 'px'; bubs.appendChild(b);
        live.push({ b, x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 20, vx: (x < area.clientWidth * 0.47 ? 1 : -1) * (25 + Math.random() * 40), vy: -(30 + Math.random() * 35), t: 0, ph: Math.random() * 6 });
      }
    };
    const stepBubbles = now => {
      const dt = Math.min(0.05, (now - lastB) / 1000); lastB = now; if (!live.length) return;
      const W = area.clientWidth, H = area.clientHeight;
      for (let k = live.length - 1; k >= 0; k--) {
        const o = live[k]; o.t += dt; o.x += (o.vx + Math.sin(o.t * 2.4 + o.ph) * 22) * dt; o.y += o.vy * dt;
        o.b.style.transform = `translate(${o.x}px, ${o.y}px)`;
        const inReach = Math.abs(o.x / W - 0.47) < 0.14 && o.y / H > 0.2 && o.y / H < 0.72;
        if (inReach && now > busyTill && phase === 'you' && mode === 'bub') {
          o.b.classList.add('pop'); live.splice(k, 1); setTimeout(() => o.b.remove(), 250);
          laugh(Math.random() < 0.5 ? T('Pop!', 'طق!') : null); continue;
        }
        if (o.t > 4.5 || o.y < -60) { o.b.classList.add('pop'); live.splice(k, 1); setTimeout(() => o.b.remove(), 250); }
      }
    };
    raf = requestAnimationFrame(tick);

    /* ---- the blanket: drag it onto her ---- */
    let drag = null;
    blanket.addEventListener('pointerdown', ev => { ev.stopPropagation(); const r = blanket.getBoundingClientRect(); drag = { dx: ev.clientX - r.left, dy: ev.clientY - r.top }; blanket.classList.add('held'); try { blanket.setPointerCapture(ev.pointerId); } catch (e) { /* none */ } });
    blanket.addEventListener('pointermove', ev => { if (!drag) return; const a = area.getBoundingClientRect(); blanket.style.left = (ev.clientX - a.left - drag.dx) + 'px'; blanket.style.top = (ev.clientY - a.top - drag.dy) + 'px'; blanket.style.right = blanket.style.bottom = 'auto'; });
    blanket.addEventListener('pointerup', ev => {
      if (!drag) return; drag = null; blanket.classList.remove('held');
      const a = area.getBoundingClientRect(), r = blanket.getBoundingClientRect();
      const cx = (r.left + r.width / 2 - a.left) / a.width, cy = (r.top + r.height / 2 - a.top) / a.height;
      if (Math.abs(cx - 0.47) < 0.22 && cy > 0.25 && cy < 0.9) asleep();
      else { blanket.style.left = blanket.style.top = ''; blanket.style.right = blanket.style.bottom = ''; }
    });

    /* ---- peekaboo ---- */
    area.addEventListener('pointerdown', ev => {
      if (over || phase !== 'you') return;
      lastPlay = performance.now();
      if (mode === 'bub') { const a = area.getBoundingClientRect(); blow(ev.clientX - a.left, ev.clientY - a.top); return; }
      if (performance.now() < busyTill) return;
      downAt = performance.now(); hidden = true; area.classList.add('hide');
    });
    const up = () => {
      if (!hidden || over) return; hidden = false; area.classList.remove('hide');
      const held = performance.now() - downAt;
      if (held < 450) { hint(T('Too quick! She didn\'t even notice. Hold a little longer.', 'بسرعة مرة! ما انتبهت حتى. {اضغط|اضغطي} أطول شوي.')); return; }
      laugh(T('Peekaboo!', 'بـــخ!'));
    };
    area.addEventListener('pointerup', up); area.addEventListener('pointerleave', up); area.addEventListener('pointercancel', up);
  };

  /* ---------- in the grocery ---------- */
  const gro = GAME.LOC.grocery;
  if (gro) gro.spots.push({ x: 70, y: 70, label: T('The playpen behind the counter', 'سرير اللعب اللي ورا الكاونتر'),
    if: s => !s.f.prologue && s.slot <= 1 && GAME.CHAR.sami.where(s) === 'grocery',
    run: s => {
      if (doneToday('pip') && s.f.pipDay !== s.day) return [N1('Pip is busy explaining something important to her rabbit. You are not part of the conversation.', 'بِب مشغولة تشرح لأرنبها شي مهم. وأنت{|ِ} مو جزء من السالفة.')];
      if (doneToday('pip')) return [{ mini: 'cg', src: FR[4], full: true, cap: T('Still asleep, holding on to her rabbit. Sami serves customers in a whisper.', 'لسا نايمة، وماسكة أرنبها. وسامي يخدم الزباين بصوت واطي.') }];
      onceToday('pip');
      const first = !s.f.pipMet; s.f.pipMet = true;
      return [{ show: [{ id: 'sami', e: 'smile' }] },
        first ? S1('smile', 'Ah. You\'ve met management. That\'s Pip, my sister\'s girl. Her mum does mornings at the cannery, so mornings Pip runs the shop.', 'آه. {قابلت|قابلتي} الإدارة. هذي بِب، بنت أختي. أمها تداوم الصبح في مصنع التعليب، فالصبح بِب هي اللي تدير الدكان.') : null,
        first ? S1('neutral', 'She doesn\'t like strangers. She likes peekaboo. Those are the rules. I don\'t make them.', 'ما تحب الغرب. تحب الغمّيضة. هذي القوانين. وأنا ما أحطها.') : S1('smile', 'She\'s been looking at the door all morning. Don\'t tell her I said that, she\'s got a reputation.', 'طول الصبح وهي تطالع الباب. لا {تقول|تقولين} لها إني قلت، عندها سمعة تحافظ عليها.'),
        { mini: 'pip', then: (r, st) => {
          if (!r) return [N1('Pip looks at you, unimpressed, and goes back to chewing her rabbit\'s ear.', 'بِب تطالعك، ولا هي منبهرة، وترجع تعض أذن أرنبها.')];
          st.f.pipNaps = (st.f.pipNaps || 0) + 1; st.f.pipDay = st.day; addMood(1);
          if (st.f.pipNaps === 1) addTrust('sami', 1);
          return [S1('smile', ...(st.f.pipNaps === 1
            ? ['She\'s out. Do you know how long that takes me? You\'re hired. The pay is nothing.', 'نامت. تدري كم تاخذ مني؟ {توظفت|توظفتي}. والراتب ولا شي.']
            : ['Asleep again. She\'s going to expect you now. That\'s how it starts.', 'نامت مرة ثانية. الحين بتصير تنتظرك. كذا تبدأ السالفة.']))];
        } }].filter(Boolean);
    } });
  /* the town notices */
  const chat = (id, when, e, en, ar) => { const c = GAME.CHAR[id]; if (c && Array.isArray(c.chat)) c.chat.unshift({ if: when, e, t: T(en, ar) }); };
  chat('sami', s => (s.f.pipNaps || 0) >= 2, 'smile', 'Pip said a new word today. It was "boo". I\'m blaming you.', 'بِب قالت كلمة جديدة اليوم. كانت «بخ». وأنا ألومك {أنت|أنتِ}.');
  chat('martha', s => !!s.f.pipMet, 'smile', 'Sami\'s sister\'s little one. Born in the big storm, you know. Not a peep out of her the whole night. Now look.', 'بنت أخت سامي الصغيرة. انولدت في العاصفة الكبيرة، تدري. ولا صوت منها طول الليل. وشوفها الحين.');
})();
