/* =====================================================================
   Pip. Sami's sister's little girl, about a year old. Her mum works the
   morning shift at the cannery, so in the mornings Pip is in a playpen
   behind the counter at the grocery, and Sami serves customers around
   her. She is in charge.
   Mornings only, once a day, with Sami right there. A small game of
   peekaboo (MINI.pip): cover your eyes (hold), and show them again; she
   laughs. After a while she plays it back (she hides her face: wait,
   and when she peeks, say "peekaboo!"). When she has laughed enough she
   gets sleepy and nods off.
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
    box.innerHTML = '<div class="cp-area"><div class="pip-pic a"></div><div class="pip-pic b"></div><div class="pip-hand l"></div><div class="pip-hand r"></div><b class="pip-boo"></b><div class="pet-sub"><strong class="cp-title"></strong><span class="cp-hint"></span></div><button type="button" class="cp-skip"></button></div>';
    $('stage').appendChild(box);
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(e => box.addEventListener(e, ev => ev.stopPropagation()));
    const q = x => box.querySelector(x), area = q('.cp-area'), A = q('.pip-pic.a'), B = q('.pip-pic.b'), boo = q('.pip-boo');
    const hint = t => { q('.cp-hint').textContent = tx(t); };
    q('.cp-title').textContent = tx(T('Pip', 'بِب'));
    q('.cp-skip').textContent = tx(T('Give her back to Sami', '{رجّعها|رجّعيها} لسامي'));
    const alt = el('button', 'opt main cp-alt', tx(T('Give her back to Sami', '{رجّعها|رجّعيها} لسامي'))); alt.type = 'button'; panel.appendChild(alt);

    /* two layers, so one picture fades into the next */
    let front = A, cur = -1;
    const show = i => { if (i === cur) return; cur = i; const back = front === A ? B : A; back.style.backgroundImage = `url("${FR[i]}")`; back.classList.add('on'); front.classList.remove('on'); front = back; };
    show(0);

    let over = false, joy = 0, phase = 'you', downAt = 0, hidden = false, theirT = 0, peekAt = 0;
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(() => { if (!over) f(); }, ms));
    const say = (t, ms = 900) => { boo.textContent = tx(t); boo.classList.remove('on'); void boo.offsetWidth; boo.classList.add('on'); later(() => boo.classList.remove('on'), ms); };
    const finish = r => { if (over) return; over = true; timers.forEach(clearTimeout); alt.remove(); box.classList.add('out'); box.style.pointerEvents = 'none'; setTimeout(() => box.remove(), 300); done(r); };
    q('.cp-skip').onclick = ev => { ev.stopPropagation(); finish(0); };
    alt.onclick = () => finish(0);

    const sleepy = () => {
      phase = 'sleep'; hint(T('She\'s getting sleepy...', 'بدا يجيها النوم...'));
      later(() => show(3), 900);
      later(() => { show(5); hint(T('Sami lays her down. She fights it. She\'s losing.', 'سامي يمددها. تقاوم. وقاعدة تخسر.')); }, 2600);
      later(() => { show(4); hint(T('She\'s asleep.', 'نامت.')); }, 4800);
      later(() => area.classList.add('dim'), 6200);
      later(() => finish(1), 7400);
    };
    const laugh = () => {
      joy++; show(1); say(T('Peekaboo!', 'بـــخ!'));
      if (joy >= 5) return later(sleepy, 1700);
      later(() => {
        show(0);
        if (joy >= 2 && phase === 'you') { phase = 'her'; theirTurn(); }
        else if (phase === 'her') theirTurn();
        else hint(T('Again! Hold to cover your eyes, then let go.', 'مرة ثانية! {اضغط|اضغطي} مطوّل عشان {تغطي|تغطين} عيونك، وبعدين {فك|فكي}.'));
      }, 1600);
    };
    /* her turn: she hides her face; wait, and when she peeks out, tap */
    const theirTurn = () => {
      phase = 'her'; peekAt = 0; show(2);
      hint(T('Now she\'s hiding! Wait for her to peek... then tap.', 'الحين هي اللي تتخبى! {انتظر|انتظري} لين تطل... وبعدين {انقر|انقري}.'));
      theirT = setTimeout(() => { if (over) return; peekAt = performance.now(); show(0); hint(T('She peeked! Tap!', 'طلّت! {انقر|انقري}!')); }, 1300 + Math.random() * 1500);
      timers.push(theirT);
    };
    hint(T('Hold to cover your eyes. Then let go.', '{اضغط|اضغطي} مطوّل عشان {تغطي|تغطين} عيونك. وبعدين {فك|فكي}.'));

    area.addEventListener('pointerdown', ev => {
      if (over || phase === 'sleep') return;
      if (phase === 'her') {
        if (!peekAt) { say(T('Not yet...', 'مو الحين...'), 700); return; }
        peekAt = 0; return laugh();
      }
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
