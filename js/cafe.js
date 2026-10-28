/* =====================================================================
   Marco's café, for real: the evening shift is a busy counter.
   People from town come in (you know their faces), each wants one or
   two things. Tap the machine or the shelf to make it (coffee and hot
   chocolate take a moment to brew), it goes on your tray; tap the
   person to hand it over. Wrong things make them frown; waiting too
   long and they leave. The bin empties your tray.
   Regulars have their habits: Rex always wants two espressos, Ingrid
   her tea, Gregor the soup, Kai lemonade.
   Marco's story (no game, just him): after a few shifts you can ask why
   he never takes the microphone himself; on a Thursday evening he does.
   No trust or ending changes.
   ===================================================================== */
'use strict';
(function () {
  const K = window.MINIKIT; if (!K) return;
  const { card, shell, blip, wait } = K;
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const M = (e, en, ar) => ({ c: 'marco', e, t: T(en, ar) });
  const ITEMS = {
    esp: { i: '☕', t: T('Espresso', 'إسبريسو'), brew: 1600 },
    tea: { i: '🫖', t: T('Tea', 'شاي'), brew: 1200 },
    choc: { i: '🍫', t: T('Hot chocolate', 'شوكولاتة'), brew: 1800 },
    pie: { i: '🥧', t: T('Apple pie', 'فطيرة'), brew: 0 },
    soup: { i: '🥣', t: T('Fish soup', 'شوربة سمك'), brew: 0 },
    lem: { i: '🍋', t: T('Lemonade', 'ليمونادة'), brew: 0 }
  };
  const KEYS = Object.keys(ITEMS);
  /* who comes in, and what they tend to want */
  const REG = [
    { id: 'rex', want: () => ['esp', 'esp'] }, { id: 'ingrid', want: () => ['tea'].concat(Math.random() < 0.5 ? ['pie'] : []) },
    { id: 'gregor', want: () => ['soup'] }, { id: 'kai', want: () => ['lem'].concat(Math.random() < 0.4 ? ['pie'] : []) },
    { id: 'stella', want: () => [Math.random() < 0.5 ? 'tea' : 'choc'] }, { id: 'olivia', want: () => ['esp', Math.random() < 0.5 ? 'pie' : 'lem'] },
    { id: 'maya', want: () => ['soup', 'tea'] }, { id: 'sami', want: () => ['choc', 'pie'] }, { id: 'irene', want: () => ['esp'] }
  ];
  function PEOPLE_IMG(id) { try { const c = PEOPLE.IMG.chars[id]; return c && (c.smile || c.neutral); } catch (e) { return null; } }
  const face = id => { const im = PEOPLE_IMG(id); return im ? `<img src="${im}" alt="">` : '<b>🙂</b>'; };

  GAME.MINI.cafe = function (panel, done, st) {
    panel.innerHTML = '';
    const size = (st && st.size) || 3, total = size + 3;
    const f = card('cp-cafe', T('The evening rush', 'زحمة المغرب'), T('Tap to make it, then tap the person to serve.', '{اضغط|اضغطي} عشان {تسوي|تسوين} الطلب، وبعدين {اضغط|اضغطي} على الزبون.'));
    const sh = shell(f, done, 1);
    f.area.innerHTML = '<div class="cf-queue"></div><div class="cf-counter"><div class="cf-tray"></div><button type="button" class="cf-bin">🗑️</button></div><div class="cf-stations"></div>';
    const q = f.q, queue = q('.cf-queue'), tray = q('.cf-tray'), stations = q('.cf-stations');
    KEYS.forEach(k => { const b = el('button', 'cf-st'); b.type = 'button'; b.dataset.k = k; b.innerHTML = `<i>${ITEMS[k].i}</i><span>${tx(ITEMS[k].t)}</span><em></em>`; stations.appendChild(b); });
    let held = [], served = 0, gone = 0, spawned = 0, over = false, raf = 0;
    const guests = [];
    const drawTray = () => { tray.innerHTML = ''; for (let i = 0; i < 3; i++) { const s = el('span', 'cf-slot' + (held[i] ? ' full' : ''), held[i] ? ITEMS[held[i]].i : ''); tray.appendChild(s); } f.box.dataset.tray = held.join(','); };
    const count = () => { f.q('.g-count').textContent = tx(T(`Served ${served} / ${total}`, `خدمت ${served} / ${total}`)); };
    drawTray(); count();
    /* making things: brewed drinks take a moment (the station is busy while it brews) */
    stations.addEventListener('click', ev => {
      const b = ev.target.closest('.cf-st'); if (!b || over || b.classList.contains('busy')) return; ev.stopPropagation();
      if (held.length >= 3) { blip(180, 0.12, 0.12, 'sawtooth'); f.hint(T('Your tray is full. Serve someone, or bin it.', 'الصينية مليانة. {اخدم|اخدمي} أحد، أو {ارمها|ارميها}.')); return; }
      const k = b.dataset.k, it = ITEMS[k];
      if (!it.brew) { held.push(k); drawTray(); blip(700, 0.05, 0.08); return; }
      b.classList.add('busy'); b.style.setProperty('--brew', it.brew + 'ms'); blip(260, 0.3, 0.06, 'sawtooth');
      setTimeout(() => { b.classList.remove('busy'); if (over) return; if (held.length < 3) { held.push(k); drawTray(); blip(900, 0.06, 0.1, 'triangle'); } }, it.brew);
    });
    q('.cf-bin').addEventListener('click', ev => { ev.stopPropagation(); if (!held.length) return; held = []; drawTray(); blip(140, 0.15, 0.1); });
    /* the people */
    const spawn = () => {
      if (over || spawned >= total || guests.length >= 3) return;
      const pool = REG.filter(p => !guests.some(g => g.id === p.id) && PEOPLE_IMG(p.id));
      const p = pool[Math.floor(Math.random() * pool.length)] || REG[0]; spawned++;
      const g = { id: p.id, want: p.want(), t0: performance.now(), life: 15000 + (p.want().length - 1) * 4000, el: el('button', 'cf-guest') };
      g.el.type = 'button'; g.el.dataset.id = g.id;
      g.el.innerHTML = `<div class="cf-face">${face(p.id)}</div><div class="cf-bubble"></div><div class="cf-pat"><i></i></div><b class="cf-name"></b>`;
      g.el.querySelector('.cf-name').textContent = tx(GAME.CHAR[p.id].short || GAME.CHAR[p.id].name);
      const bub = () => { g.el.querySelector('.cf-bubble').innerHTML = g.want.map(k => `<span>${ITEMS[k].i}</span>`).join(''); g.el.dataset.want = g.want.join(','); };
      bub(); g.bub = bub; queue.appendChild(g.el); guests.push(g); blip(1200, 0.04, 0.05);
      g.el.addEventListener('click', ev => { ev.stopPropagation(); serve(g); });
    };
    const leave = (g, happy) => {
      const i = guests.indexOf(g); if (i < 0) return; guests.splice(i, 1);
      g.el.classList.add(happy ? 'happy' : 'cross'); setTimeout(() => g.el.remove(), 600);
      if (happy) { served++; blip(784, 0.12, 0.12, 'triangle'); setTimeout(() => blip(1046, 0.12, 0.1, 'triangle'), 90); } else { gone++; blip(160, 0.25, 0.12, 'sawtooth'); }
      count(); if (served + gone >= total) end(); else setTimeout(spawn, 700);
    };
    function serve(g) {
      if (over) return;
      if (!held.length) { f.hint(T('Your tray is empty.', 'الصينية فاضية.')); return; }
      let gave = false;
      held = held.filter(k => { const i = g.want.indexOf(k); if (i >= 0) { g.want.splice(i, 1); gave = true; return false; } return true; });
      drawTray(); g.bub();
      if (!gave) { g.el.classList.remove('frown'); void g.el.offsetWidth; g.el.classList.add('frown'); f.hint(pickOne([T('"That\'s not what I asked for."', '«مو هذا اللي طلبته.»'), T('"Do I look like I want that?"', '«شكلي أبي هذا؟»')])); blip(200, 0.15, 0.1, 'sawtooth'); return; }
      if (!g.want.length) leave(g, true);
    }
    function end() { if (over) return; over = true; cancelAnimationFrame(raf); const score = Math.round(served / total * size);
      f.hint(served === total ? T('Everyone served. Marco is wiping a tear with a tea towel.', 'خدمت الكل. ماركو يمسح دمعة بفوطة الصحون.') : T('The rush is over.', 'خلصت الزحمة.'));
      setTimeout(() => sh.finish(score), 1300); }
    const tick = now => {
      if (over || sh.isOver()) return;
      for (const g of guests.slice()) { const k = Math.max(0, 1 - (now - g.t0) / g.life); g.el.querySelector('.cf-pat i').style.width = (k * 100) + '%'; g.el.classList.toggle('late', k < 0.3); if (k <= 0) leave(g, false); }
      raf = requestAnimationFrame(tick);
    };
    spawn(); setTimeout(spawn, 2500); raf = requestAnimationFrame(tick);
    const fin0 = sh.finish; sh.finish = r => { over = true; cancelAnimationFrame(raf); fin0(r); };
  };

  /* ================= Marco's own story ================= */
  GAME.TOPICS.marco = GAME.TOPICS.marco || [];
  GAME.TOPICS.marco.push({ id: 'mcFear', once: true, label: T('Ask why he never takes the mic himself', '{تسأله|تسألينه} ليش عمره ما مسك الميكروفون'), if: s => (s.f.shifts || 0) >= 2 && s.loc === 'cafe', run: s => [
    M('neutral', 'Me? I\'m the host. The host hosts. The host doesn\'t... perform.', 'أنا؟ أنا المضيف. المضيف يضيّف. المضيف ما... يقدّم.'),
    N1('He wipes the same clean cup for a long time.', 'يمسح نفس الكوب النظيف وقت طويل.'),
    M('sad', 'My nonna built this place so people had somewhere to be funny. She\'d stand on that chair and do twenty minutes on the fishermen. They adored her.', 'جدتي بنت هالمكان عشان يكون للناس مكان يضحكون فيه. كانت توقف على ذاك الكرسي وتسوي عشرين دقيقة على الصيادين. وكانوا يموتون فيها.'),
    M('sad', 'The one time I tried, at sixteen, I forgot everything. Every single word. She laughed so kindly I wanted to die. Twelve years. I write a joke every day. I\'ve never said one into that microphone.', 'المرة الوحيدة اللي جربت، كان عمري ستطعش، نسيت كل شي. كل كلمة. ضحكت علي بحنان لدرجة تمنيت أموت. اثنعش سنة. أكتب نكتة كل يوم. وعمري ما قلت وحدة في ذاك الميكروفون.'),
    { menu: [
      { t: T('"This Thursday. I\'ll be right there."', '«هالخميس. وأنا بكون موجود.»'), cls: 'main', then: [st => { st.f.mcNight = true; return null; }, M('shock', '...This Thursday? That\'s... in no time at all. Fine. FINE. If I die, tell the fish it was personal.', '...هالخميس؟ هذا... ما بقى شي. خلاص. خلاص! إذا مت، {قل|قولي} للسمك إنها كانت شخصية.')] },
      { t: T('"You don\'t have to."', '«مو لازم.»'), then: [M('neutral', 'No. I don\'t. That\'s the problem with it.', 'لا. مو لازم. وهذي هي المشكلة.')] }
    ] }
  ] });
  /* Thursday evening: Marco's turn. You're backstage (the corridor to the kitchen). */
  GAME.SCRIPTS.marcoNight = s => {
    s.f.mcDone = true; const ingrid = !!s.f.ingridSang;
    return [
      { show: [{ id: 'marco', e: 'shock' }] },
      N1('The café is full. Somebody has written MARCO on the menu board in chalk and drawn a fish wearing a crown next to it. Marco is in the kitchen corridor, the colour of cold porridge.', 'المقهى مليان. أحد كاتب «ماركو» على لوحة القائمة بالطباشير ورسم جنبها سمكة لابسة تاج. وماركو في ممر المطبخ، لونه مثل الشوفان البارد.'),
      M('shock', 'I have four jokes. Which one do I open with? Quick, before I emigrate.', 'عندي أربع نكت. بأي وحدة أبدأ؟ بسرعة، قبل لا أهاجر.'),
      { menu: [
        { t: T('"The fish one. They\'re scared of the NET."', '«حقت السمك. خايفين من الشبكة.»'), then: [st => { st.f.mcOpen = 'fish'; return null; }] },
        { t: T('"Your real name. Marcello."', '«اسمك الحقيقي. مارتشيلو.»'), then: [st => { st.f.mcOpen = 'name'; return null; }] },
        { t: T('"Your nonna. Tell them about her."', '«جدتك. قل لهم عنها.»'), then: [st => { st.f.mcOpen = 'nonna'; return null; }] }
      ] },
      st => { VIEW.bgOver = { cafe: 'cafe_stage' }; return null; }, { show: [] },
      N1('He walks out. The microphone squeals. Eleven seconds of silence, which is longer than it sounds.', 'يطلع. الميكروفون يصفّر. إحدى عشر ثانية سكوت، وهذا أطول مما يبان.'),
      st => st.f.mcOpen === 'fish' ? [N1('"Why don\'t fish play basketball?" A groan rolls round the room like weather. Then Gregor laughs, a huge laugh, and it catches.', '«ليش السمك ما يلعب كرة سلة؟» تأوه يمشي في الغرفة مثل الطقس. وبعدين غريغور يضحك، ضحكة كبيرة، وتنتقل للكل.')]
        : st.f.mcOpen === 'name' ? [N1('"My name is Marcello. My nonna named me after a film star. I am five foot six and I own a café that smells of soup." The laugh is instant and warm.', '«اسمي مارتشيلو. جدتي سمتني على اسم نجم أفلام. وطولي متر وسبعين إلا شوي وعندي مقهى ريحته شوربة.» الضحكة تجي على طول، ودافية.')]
        : [N1('He tells them about his nonna standing on the three-legged chair. Half the room knew her. The laughs come, and with them something softer. Somebody at the back says "Rosa!" like a toast.', 'يحكي لهم عن جدته وهي واقفة على الكرسي أبو ثلاث رجول. نص الغرفة كانوا يعرفونها. الضحكات تجي، ومعها شي أنعم. واحد ورا يقول «روزا!» كأنه يرفع كاسه.')],
      N1('Then, halfway through the second joke, he stops. You can see it happen: the words just leave him. His mouth opens. Nothing.', 'وبعدين، بنص النكتة الثانية، يوقف. {تشوف|تشوفين} اللحظة: الكلام يطير منه. فمه ينفتح. ولا شي.'),
      { menu: [
        { t: T('Hold up an apple pie from the kitchen door', '{ترفع|ترفعين} فطيرة تفاح من باب المطبخ'), then: [N1('He sees the pie. He sees you. And he remembers the chair, and you in the pie display, and he starts to laugh, and the room laughs with him, and the words come back.', 'يشوف الفطيرة. ويشوفك. ويتذكر الكرسي، {وأنت|وأنتِ} طايح في الفطاير، ويبدأ يضحك، والغرفة تضحك معه، والكلام يرجع.'), st => { st.f.mcSave = 'pie'; return null; }] },
        { t: T('Start the fish joke for him, loudly', '{تبدأ|تبدئين} له نكتة السمك، بصوت عالي'), then: [N1('"WHY DON\'T FISH PLAY BASKETBALL?" you shout. Thirty people shout "THE NET!" back. It turns out the whole town knows it. Marco is laughing so hard he has to hold the mic stand.', '«ليش السمك ما يلعب كرة سلة؟» {تصارخ|تصارخين}. ثلاثين واحد يصارخون «الشبكة!». طلع البلد كله يعرفها. وماركو يضحك لين يمسك حامل الميكروفون.'), st => { st.f.mcSave = 'shout'; return null; }] },
        { t: T('Do nothing. Wait with him.', '{لا تسوي|لا تسوين} شي. {انتظر|انتظري} معه.'), then: [N1('Nobody moves. Nobody heckles. The whole room waits for him, the way you\'d wait for a friend tying a shoe. After a while he says, "Sorry. I forgot. I always forget." And somehow that is the biggest laugh of the night.', 'محد يتحرك. محد يعلّق. الغرفة كلها تنتظره، مثل ما تنتظر صديق يربط جزمته. بعد شوي يقول: «آسف. نسيت. دايم أنسى.» وبطريقة ما، هذي أكبر ضحكة الليلة.'), st => { st.f.mcSave = 'wait'; return null; }] }
      ] },
      ...(ingrid ? [{ show: [{ id: 'ingrid', e: 'smile' }] }, N1('When he finishes, Ingrid stands up without being asked and sings the last song, the sailor one, and Marco sits on the edge of the little stage and listens with his eyes shut.', 'لما يخلص، إنغريد تقوم بدون ما أحد يطلب وتغني آخر أغنية، حقت البحّار، وماركو يجلس على طرف المسرح الصغير ويسمع وعيونه مسكرة.')] : []),
      st => { VIEW.bgOver = null; return null; },
      { show: [{ id: 'marco', e: 'smile' }] },
      M('smile', 'Twelve years. Twelve! And it was a pie. It was always going to be a pie, wasn\'t it.', 'اثنعش سنة. اثنعش! وطلعت فطيرة. كان مكتوب إنها فطيرة، صح؟'),
      M('neutral', 'Same time next Thursday. Don\'t tell anyone I said that. Tell everyone.', 'نفس الوقت الخميس الجاي. لا {تقول|تقولين} لأحد إني قلتها. {قل|قولي} للكل.'),
      st => { addMood(2); return null; }, { show: null }
    ];
  };
  GAME.EVENTS.push({ id: 'marcoNight', once: true, when: s => s.f.mcNight && !s.f.mcDone && weekday(s.day) === 4 && s.slot === 3 && s.loc === 'cafe' && !RUN, run: s => GAME.SCRIPTS.marcoNight(s) });
  /* the town talks about it */
  const say = (who, line) => { const c = GAME.CHAR[who]; if (c && Array.isArray(c.chat)) c.chat.unshift(line); };
  say('marco', { if: s => !!s.f.mcDone, e: 'smile', t: T('I\'ve written eleven new jokes since Thursday. Nine are about pie. I regret nothing.', 'كتبت إحدى عشر نكتة جديدة من الخميس. تسع منها عن الفطيرة. وما ندمت على شي.') });
  say('marco', { if: s => !!s.f.mcNight && !s.f.mcDone, e: 'shock', t: T('Thursday. I am fine. I am completely fine. Why is my eye doing that.', 'الخميس. أنا بخير. بخير تماماً. ليش عيني تسوي كذا.') });
  say('gregor', { if: s => !!s.f.mcDone, e: 'smile', t: T('Marco\'s fish joke. I laughed so hard I had to lie down in a grave. Professionally, it was very comfortable.', 'نكتة السمك حقت ماركو. ضحكت لين انسدحت في قبر. ومن ناحية مهنية، كان مريح مرة.') });
  say('sami', { if: s => !!s.f.mcDone, e: 'smile', t: T('Marco came in for flour this morning and told me a joke at the till. I gave him a discount so he\'d stop.', 'ماركو جاني الصبح يشتري طحين وقال لي نكتة عند الكاشير. عطيته خصم عشان يوقف.') });
})();
