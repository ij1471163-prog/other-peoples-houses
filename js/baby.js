/* =====================================================================
   Pip. Sami's sister's little girl, about a year old. Her mum works the
   morning shift at the cannery, so in the mornings Pip is in a playpen
   behind the counter at the grocery, and Sami serves customers around
   her. She is in charge.
   Mornings only, once a day, with Sami right there (MINI.pip). Two
   games, chosen at the bottom: peekaboo (hold to cover your eyes, let
   go; after two goes she plays it back: wait till she peeks, then tap)
   and bubbles (tap to blow; when one drifts into her reach she grabs it
   and it pops). When she has laughed enough she rubs her eyes: drag the
   blanket onto her and she nods off holding her rabbit.
   No touching game (that is for the cat and the hamster): everything is
   done through play. Four pictures from the user (img/fx/pip/0-3:
   curious, laughing with her arms out, hiding her face, yawning).
   Own flags (s.f.pipMet, pipNaps); mood, and Sami's trust once.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const S1 = (e, en, ar) => ({ c: 'sami', e, t: T(en, ar) });
  const FR = [0, 1, 2, 3, 4, 5].map(i => 'img/fx/pip/' + i + '.webp');   /* 0 curious, 1 laughing, 2 hiding, 3 yawning, 4 asleep with her rabbit, 5 lying down, eyes still open */

  GAME.MINI.pip = function (panel, done) {
    panel.innerHTML = '';
    FR.forEach(u => { const im = new Image(); im.src = u; });
    const box = el('div', 'cp ho ho-pip'); box.setAttribute('role', 'dialog');
    box.innerHTML = '<div class="cp-area"><div class="pip-pic a"></div><div class="pip-pic b"></div><div class="pip-bubs"></div><div class="pip-hand l"></div><div class="pip-hand r"></div><b class="pip-boo"></b>'
      + '<div class="pip-blanket" hidden></div><div class="pip-tools"><button type="button" data-m="peek"></button><button type="button" data-m="bub"></button></div>'
      + '<div class="pet-sub"><strong class="cp-title"></strong><span class="cp-hint"></span></div><button type="button" class="cp-skip"></button></div>';
    $('stage').appendChild(box);
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(e => box.addEventListener(e, ev => ev.stopPropagation()));
    const q = x => box.querySelector(x), area = q('.cp-area'), A = q('.pip-pic.a'), B = q('.pip-pic.b'), boo = q('.pip-boo'), bubs = q('.pip-bubs'), blanket = q('.pip-blanket'), tools = q('.pip-tools');
    const hint = t => { q('.cp-hint').textContent = tx(t); };
    q('.cp-title').textContent = tx(T('Pip', 'بِب'));
    q('.cp-skip').textContent = tx(T('Give her back to Sami', '{رجّعها|رجّعيها} لسامي'));
    tools.children[0].textContent = tx(T('Peekaboo', 'غمّيضة'));
    tools.children[1].textContent = tx(T('Bubbles', 'فقاعات'));
    const alt = el('button', 'opt main cp-alt', tx(T('Give her back to Sami', '{رجّعها|رجّعيها} لسامي'))); alt.type = 'button'; panel.appendChild(alt);

    /* two layers, so one picture fades into the next */
    let front = A, cur = -1;
    const show = i => { if (i === cur) return; cur = i; const back = front === A ? B : A; back.style.backgroundImage = `url("${FR[i]}")`; back.classList.add('on'); front.classList.remove('on'); front = back; };
    show(0);

    let over = false, joy = 0, mode = 'peek', phase = 'you', laughs = 0, downAt = 0, hidden = false, peekAt = 0, busyTill = 0, raf = 0;
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(() => { if (!over) f(); }, ms));
    const say = (t, ms = 900) => { boo.textContent = tx(t); boo.classList.remove('on'); void boo.offsetWidth; boo.classList.add('on'); later(() => boo.classList.remove('on'), ms); };
    /* she babbles: little sounds over her head, now and then, and when she laughs */
    const BAB = { idle: [T('ba?', 'با؟'), T('da!', 'دا!'), T('mmm', 'ممم'), T('ah-ah', 'آه آه'), T('ba-ba-ba', 'بابابا'), T('oo?', 'أوو؟')], happy: [T('hee!', 'هيي!'), T('again!', 'كمان!'), T('boo!', 'بخ!'), T('ha-ha!', 'هاها!'), T('more!', 'زيد!')], bored: [T('ba...', 'با...'), T('hmph.', 'همف.'), T('da?', 'دا؟')] };
    const pick = a => a[Math.floor(Math.random() * a.length)];
    let lastPlay = performance.now();
    const babble = kind => say(pick(BAB[kind]), 1000);
    const bounce = () => { front.classList.remove('bump'); void front.offsetWidth; front.classList.add('bump'); };
    const idleT = setInterval(() => {
      if (over || phase === 'sleep' || phase === 'tired' || phase === 'her' || performance.now() < busyTill) return;
      const quiet = performance.now() - lastPlay;
      if (quiet > 7000) { babble('bored'); hint(T('She\'s waiting for you. She\'s not good at waiting.', 'تنتظرك. وما تعرف تنتظر.')); lastPlay = performance.now() - 3500; }
      else if (Math.random() < 0.35) babble('idle');
    }, 2600);
    const finish = r => { if (over) return; over = true; clearInterval(idleT); cancelAnimationFrame(raf); timers.forEach(clearTimeout); alt.remove(); box.classList.add('out'); box.style.pointerEvents = 'none'; setTimeout(() => box.remove(), 300); done(r); };
    q('.cp-skip').onclick = ev => { ev.stopPropagation(); finish(0); };
    alt.onclick = () => finish(0);

    const HINT = {
      peek: T('Hold to cover your eyes. Then let go.', '{اضغط|اضغطي} مطوّل عشان {تغطي|تغطين} عيونك. وبعدين {فك|فكي}.'),
      bub: T('Tap to blow bubbles. Let them float to her.', '{انقر|انقري} عشان {تنفخ|تنفخين} فقاعات. {خلها|خليها} تطير لها.')
    };
    const setMode = m => { if (phase === 'sleep' || phase === 'tired') return; mode = m; phase = 'you'; peekAt = 0; [...tools.children].forEach(b => b.classList.toggle('on', b.dataset.m === m)); show(0); hint(HINT[m]); };
    [...tools.children].forEach(b => b.addEventListener('pointerdown', ev => { ev.stopPropagation(); setMode(b.dataset.m); }));
    setMode('peek');

    /* she has laughed enough: rubbing her eyes; give her the blanket */
    const tired = () => {
      phase = 'tired'; tools.hidden = true; show(3);
      hint(T('She\'s rubbing her eyes. Drag the blanket to her.', 'قاعدة تفرك عيونها. {اسحب|اسحبي} البطانية لها.'));
      blanket.hidden = false;
    };
    const asleep = () => {
      phase = 'sleep'; blanket.hidden = true;
      show(5); hint(T('Sami lays her down. She fights it. She\'s losing.', 'سامي يمددها. تقاوم. وقاعدة تخسر.'));
      later(() => { show(4); hint(T('She\'s asleep.', 'نامت.')); }, 2200);
      later(() => area.classList.add('dim'), 3600);
      later(() => finish(1), 4800);
    };
    const gain = n => { joy += n; if (joy >= 5 && phase !== 'tired' && phase !== 'sleep') later(tired, 1500); };

    /* ---- peekaboo ---- */
    const laugh = () => {
      laughs++; show(1); bounce(); say(T('Peekaboo!', 'بـــخ!')); later(() => babble('happy'), 950); gain(1); lastPlay = performance.now();
      busyTill = performance.now() + 1500;
      later(() => {
        if (phase === 'tired' || phase === 'sleep' || mode !== 'peek') return;
        show(0);
        if (laughs >= 2) theirTurn();
        else hint(T('Again! Hold to cover your eyes, then let go.', 'مرة ثانية! {اضغط|اضغطي} مطوّل عشان {تغطي|تغطين} عيونك، وبعدين {فك|فكي}.'));
      }, 1500);
    };
    /* her turn: she hides her face; wait, and when she peeks out, tap */
    const theirTurn = () => {
      phase = 'her'; peekAt = 0; show(2);
      hint(T('Now she\'s hiding! Wait for her to peek... then tap.', 'الحين هي اللي تتخبى! {انتظر|انتظري} لين تطل... وبعدين {انقر|انقري}.'));
      later(() => { if (phase !== 'her' || mode !== 'peek') return; peekAt = performance.now(); show(0); hint(T('She peeked! Tap!', 'طلّت! {انقر|انقري}!')); }, 1300 + Math.random() * 1500);
    };

    /* ---- bubbles: they float up and sideways; when one drifts into her reach she grabs at it and it pops ---- */
    const live = [];
    const blow = (x, y) => {
      for (let k = 0; k < 4; k++) {
        const b = el('i', 'pip-bub'); const r = 14 + Math.random() * 22; b.style.width = b.style.height = r + 'px'; bubs.appendChild(b);
        live.push({ b, x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 20, vx: (x < area.clientWidth / 2 ? 1 : -1) * (25 + Math.random() * 40), vy: -(30 + Math.random() * 35), t: 0, ph: Math.random() * 6 });
      }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    };
    let last = 0;
    const step = now => {
      if (over) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const W = area.clientWidth, H = area.clientHeight;
      for (let k = live.length - 1; k >= 0; k--) {
        const o = live[k]; o.t += dt; o.x += (o.vx + Math.sin(o.t * 2.4 + o.ph) * 22) * dt; o.y += o.vy * dt;
        o.b.style.transform = `translate(${o.x}px, ${o.y}px)`;
        const inReach = Math.abs(o.x / W - 0.5) < 0.17 && o.y / H > 0.22 && o.y / H < 0.75;
        if (inReach && now > busyTill && phase === 'you' && mode === 'bub') {
          o.b.classList.add('pop'); live.splice(k, 1); setTimeout(() => o.b.remove(), 250);
          busyTill = now + 1100; show(1); bounce(); say(Math.random() < 0.5 ? T('Pop!', 'طق!') : pick(BAB.happy), 800); gain(0.5); lastPlay = now;
          later(() => { if (phase === 'you' && mode === 'bub') show(0); }, 1000);
          continue;
        }
        if (o.t > 4.5 || o.y < -60) { o.b.classList.add('pop'); live.splice(k, 1); setTimeout(() => o.b.remove(), 250); }
      }
      raf = live.length ? requestAnimationFrame(step) : 0;
    };

    /* ---- the blanket: drag it onto her ---- */
    let drag = null;
    blanket.addEventListener('pointerdown', ev => { ev.stopPropagation(); const r = blanket.getBoundingClientRect(); drag = { dx: ev.clientX - r.left, dy: ev.clientY - r.top }; blanket.classList.add('held'); blanket.setPointerCapture(ev.pointerId); });
    blanket.addEventListener('pointermove', ev => { if (!drag) return; const a = area.getBoundingClientRect(); blanket.style.left = (ev.clientX - a.left - drag.dx) + 'px'; blanket.style.top = (ev.clientY - a.top - drag.dy) + 'px'; blanket.style.right = blanket.style.bottom = 'auto'; });
    blanket.addEventListener('pointerup', ev => {
      if (!drag) return; drag = null; blanket.classList.remove('held');
      const a = area.getBoundingClientRect(), r = blanket.getBoundingClientRect();
      const cx = (r.left + r.width / 2 - a.left) / a.width, cy = (r.top + r.height / 2 - a.top) / a.height;
      if (Math.abs(cx - 0.5) < 0.2 && cy > 0.3 && cy < 0.85) asleep();
      else { blanket.style.left = blanket.style.top = ''; blanket.style.right = blanket.style.bottom = ''; }
    });

    area.addEventListener('pointerdown', ev => {
      if (over || phase === 'sleep' || phase === 'tired') return;
      lastPlay = performance.now();
      if (mode === 'bub') { const a = area.getBoundingClientRect(); blow(ev.clientX - a.left, ev.clientY - a.top); return; }
      if (phase === 'her') {
        if (!peekAt) { say(T('Not yet...', 'مو الحين...'), 700); return; }
        peekAt = 0; phase = 'you'; return laugh();
      }
      if (performance.now() < busyTill) return;
      downAt = performance.now(); hidden = true; area.classList.add('hide');
    });
    const up = () => {
      if (!hidden || over) return; hidden = false; area.classList.remove('hide');
      const held = performance.now() - downAt;
      if (held < 450) { hint(T('Too quick! She didn\'t even notice. Hold a little longer.', 'بسرعة مرة! ما انتبهت حتى. {اضغط|اضغطي} أطول شوي.')); return; }
      laugh();
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
