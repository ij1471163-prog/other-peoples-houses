/* =====================================================================
   Chapter 1 mystery: "The light on the water" (q_nell)
   A drowned girl rises out of the water by the pier at night. In 1981, on the
   night of a storm, nineteen-year-old Nell Farrow rowed out with a storm
   lantern to look for her father. Young Elias was on watch on the pier.
   He saw her light, and when the harbour asked, he said he saw nothing.
   She was never found. He tore that page out of his logbook.

   How it plays (Elias's house only, chapter 1, all of it optional):
     1. Night, the harbour: you see her at the end of the pier.
     2. Night, Elias's shed: his 1981 logbook lies open and wet. One page
        is torn out.
     3. Night, the living room: the radio hisses. Turn the dial yourself
        until you find a voice: a 1981 call, and Elias's young voice
        saying "I see nothing."
     4. That night the cemetery gate is open. Her stone has no body under
        it. A hand comes up out of the earth, and leaves the torn page.
     5. Show Elias the page. He tells you everything, and asks you to
        light his storm lantern at the end of the pier.
     6. Night, the harbour: light it. She comes one last time, and goes.
   Nothing here changes trust, suspicion, endings or their conditions.
   Playing again, a few things notice that you have been here before.
   ===================================================================== */
'use strict';
(function () {
  const NELL = 'nell';
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const ch1 = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !(s.done && s.done.elias);
  const replay = () => { try { return seenEnds().length > 0; } catch (e) { return false; } };
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const s = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (s.master || 0.8) * (s.sfx || 0.7) * k)); };
  const rec = (name, k, rate) => { if (!on()) return; try { const a = new Audio('img/snd/' + name + '.mp3'); a.volume = vol(k); if (rate) { a.preservesPitch = false; a.playbackRate = rate; } a.play().catch(() => {}); } catch (e) { /* none */ } };
  const pickOf = (base, n) => base + (1 + (Math.random() * n | 0));

  /* ---------- who she is, what you can carry, the task ---------- */
  GAME.CHAR[NELL] = { name: T('Nell', 'نيل'), role: T('?', '؟'), art: false, ghost: true, where: () => null };
  if (typeof PEOPLE !== 'undefined' && PEOPLE.SPEC) PEOPLE.SPEC[NELL] = PEOPLE.SPEC[NELL] || { sex: 'f' };
  Object.assign(GAME.ITEMS, {
    nellpage: { name: T('A torn logbook page', 'ورقة ممزوعة من دفتر'), desc: T('Dry after forty-five years. Elias\'s handwriting.', 'ناشفة بعد خمسة وأربعين سنة. بخط إلياس.') },
    lantern: { name: T('Elias\'s storm lantern', 'فانوس إلياس'), desc: T('Brass, dented, full of oil.', 'نحاس، معفوس، ومليان زيت.') }
  });
  GAME.QUESTS.q_nell = { title: T('The light on the water', 'ضو على الموية'),
    hint: T('A drowned girl stands at the end of the pier at night. Something in this house remembers her: look around at night.', 'بنت غرقانة توقف آخر الرصيف بالليل. فيه شي في هالبيت يتذكرها: {دوّر|دوّري} بالليل.') };
  if (GAME.QUEST_OWNER) GAME.QUEST_OWNER.q_nell = 'elias';

  /* ---------- her, on the screen ---------- */
  function ghost(kind) {   /* 'far': small at the end of the pier; 'near': close, at the edge of the light */
    const st = $('stage'); if (!st) return;
    gone(true);
    const g = el('div', 'nell-ghost ' + kind);
    g.innerHTML = '<div class="ng-body"><img src="img/fx/nell.webp" alt=""></div><div class="ng-refl"><img src="img/fx/nell.webp" alt=""></div><i class="ng-glow"></i><i class="ng-ring"></i><i class="ng-ring r2"></i><i class="ng-ring r3"></i>';
    rec('wave2', 0.35, 0.7);
    st.appendChild(g);
  }
  function gone(now) {
    const g = document.querySelector('#stage .nell-ghost'); if (!g) return;
    if (now) { g.remove(); return; }
    g.classList.add('sink', 'out'); setTimeout(() => g.remove(), 1800);   /* she goes back down into the water */
  }
  function walkAway() { const g = document.querySelector('#stage .nell-ghost'); if (g) { g.classList.add('away'); setTimeout(() => g.remove(), 4200); } }
  /* her face, all at once (only with jump scares on; otherwise a cold whisper) */
  function face() {
    if (!SCARES.on) { rec(pickOf('whisper', 5), 0.6); return; }
    const st = $('stage'); if (!st) return;
    const f = el('div', 'nell-face'); f.innerHTML = '<img src="img/fx/nell_face.webp" alt="">'; st.appendChild(f);
    rec(pickOf('hit', 2), 0.9); rec('scream', 0.5);
    try { if (navigator.vibrate) navigator.vibrate([60, 40, 160]); } catch (e) { /* no buzz */ }
    if (window.QUAKE) QUAKE('thud');
    setTimeout(() => f.remove(), 900);
  }

  /* ---------- the radio (a mini-game: turn the dial yourself) ---------- */
  GAME.MINI.radio = function (panel, done) {
    panel.innerHTML = '';
    const card = el('div', 'radio-card');
    card.appendChild(el('p', 'line narr', tx(T('Turn the dial slowly. Somewhere under the hiss, someone is talking.', '{لف|لفي} المؤشر شوي شوي. في مكان تحت التشويش، أحد يتكلم.'))));
    const dial = el('input', 'radio-dial'); dial.type = 'range'; dial.min = 0; dial.max = 100; dial.value = 4; dial.setAttribute('aria-label', tx(T('Radio dial', 'مؤشر الراديو')));
    const meter = el('div', 'radio-meter'); const bar = el('i'); meter.appendChild(bar);
    const scale = el('div', 'radio-scale'); scale.innerHTML = '<span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span>';
    card.appendChild(scale); card.appendChild(dial); card.appendChild(meter);
    const leave = el('button', 'opt', tx(T('Turn it off', '{طفّه|طفّيه}'))); leave.type = 'button';
    card.appendChild(leave); panel.appendChild(card);
    const target = 22 + Math.random() * 60;
    /* the hiss: made in the browser, louder the further you are from her voice */
    let c = null, noiseG = null, src = null;
    try {
      if (on()) {
        c = new (window.AudioContext || window.webkitAudioContext)();
        const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        src = c.createBufferSource(); src.buffer = b; src.loop = true;
        const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.6;
        noiseG = c.createGain(); noiseG.gain.value = vol(0.25);
        src.connect(f).connect(noiseG).connect(c.destination); src.start();
      }
    } catch (e) { c = null; }
    let held = 0, last = performance.now(), finished = false, voiceAt = 0;
    const stop = () => { finished = true; try { src && src.stop(); c && c.close(); } catch (e) { /* closed */ } };
    function tick(now) {
      if (finished || !card.isConnected) { stop(); return; }
      const dist = Math.abs(dial.value - target), sig = Math.max(0, 1 - dist / 14);
      bar.style.width = Math.round(sig * 100) + '%';
      card.classList.toggle('near', sig > 0.6);
      if (noiseG) noiseG.gain.value = vol(0.25 * (1 - sig * 0.85));
      if (sig > 0.45 && now - voiceAt > 3200) { voiceAt = now; rec(pickOf('whisper', 5), 0.25 + sig * 0.4, 0.9); }
      if (dist < 3.2) held += now - last; else held = Math.max(0, held - (now - last) * 2);
      last = now;
      if (held > 1100) { stop(); done('tuned'); return; }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    leave.onclick = ev => { if (!tapOk(ev)) return; stop(); done('off'); };
  };

  /* ---------- the scenes ---------- */
  const SC = {
    /* 1. the harbour at night */
    pier: s => [
      st => { ghost('far'); rec(pickOf('whisper', 5), 0.35); return null; },
      N1('Past the end of the pier, out on the black water, the surface breaks. Something is coming up. A girl. Rising out of the sea slowly, as if she were climbing stairs.', 'ورا آخر الرصيف، على الموية السودا، السطح ينشق. فيه شي طالع. بنت. تطلع من البحر شوي شوي، كأنها تطلع درج.'),
      N1('Barefoot, soaked through, standing on the water as if it were a floor. She isn\'t looking at the town. She is looking at you.', 'حافية، مبلولة كلها، واقفة على الموية كأنها أرض. ما تطالع البلد. تطالعك أنت.'),
      st => replay() ? [N1('For a second you could swear she knows you. As if she has watched you walk down this pier before.', 'لثانية {تحلف|تحلفين} إنها تعرفك. كأنها شافتك تمشي على هالرصيف قبل.')] : null,
      st => { gone(); rec('wave1', 0.5); return null; },
      N1('The lamp flickers, and she goes back down into the sea, without a ripple. On the last boards of the pier there are wet footprints, leading to the edge. None come back.', 'اللمبة ترمش، وهي ترجع تنزل في البحر، بدون ولا موجة. وعلى آخر خشب الرصيف فيه آثار رجول مبلولة، رايحة للحافة. وولا وحدة راجعة.'),
      st => { st.f.nellSeen = true; quest('q_nell', 'active'); return null; }
    ],
    /* 2. the shed at night */
    log: s => [
      st => { rec('creak2', 0.5, 0.8); return null; },
      N1('One of Elias\'s old logbooks lies open on the workbench, under the lantern. You are sure it wasn\'t there this afternoon. The pages are wet.', 'واحد من دفاتر إلياس القديمة مفتوح على الطاولة، تحت الفانوس. {متأكد|متأكدة} إنه ما كان هنا العصر. الصفحات مبلولة.'),
      N1('THE ADA, 1981. Weather, catch, hours. Then, 2 March: "Storm coming in. Joe Farrow still out. On watch at the pier tonight."', '«آدا»، ١٩٨١. الطقس، والصيد، والساعات. وبعدين، ٢ مارس: «عاصفة جاية. جو فارو لسا برا. عليّ حراسة الرصيف الليلة.»'),
      N1('The next page has been torn out, close to the spine. Whoever did it did it carefully.', 'الصفحة اللي بعدها ممزوعة، من قريب الكعب. اللي مزعها، مزعها بعناية.'),
      st => { rec('creak1', 0.6, 0.6); return null; },
      N1('Behind you, a rope creaks on its hook. Slowly. As if something heavy has only just let go of it.', 'وراك، حبل يصر على الخطاف. شوي شوي. كأن شي ثقيل توه فلته.'),
      st => { st.f.nellLog = true; return null; }
    ],
    /* 3. the radio, late at night */
    radio: s => [
      { show: [] },
      N1('The radio is on, very low. It isn\'t playing music. It is hissing. In the armchair, Elias is asleep.', 'الراديو شغال، واطي مرة. ما يشغل أغاني. يوشوش. وإلياس نايم على كرسيه.'),
      { mini: 'radio', then: (r, st) => r === 'tuned' ? [
        N1('A voice comes up out of the hiss, thin and far away, like a call from the bottom of a well.', 'صوت يطلع من تحت التشويش، رفيع وبعيد، كأنه نداء من قاع بير.'),
        N1('"...Harbour to pier. Harbour to pier. Joe Farrow\'s girl has taken the dinghy out to look for him. She has a lantern. Do you see a light past the north rocks? Over."', '«...الميناء ينادي الرصيف. الميناء ينادي الرصيف. بنت جو فارو طلعت بالقارب الصغير تدور أبوها. معها فانوس. {تشوف|تشوفين} ضو ورا الصخور الشمالية؟ حوّل.»'),
        N1('Static. Then a young man\'s voice. You know it. It is Elias\'s voice, forty-five years younger.', 'تشويش. وبعدين صوت شاب. {تعرفه|تعرفينه}. هذا صوت إلياس، أصغر بخمسة وأربعين سنة.'),
        N1('"...Pier to harbour. No. I see nothing. Over."', '«...الرصيف ينادي الميناء. لا. ما أشوف شي. حوّل.»'),
        st2 => { face(); return null; },
        N1('The radio goes dead. In the armchair, Elias murmurs in his sleep: "I see nothing. I see nothing."', 'الراديو ينطفي. وإلياس يتمتم وهو نايم: «ما أشوف شي. ما أشوف شي.»'),
        N1('Outside, very faintly, from the direction of the church, someone is whispering.', 'برا، خفيف مرة، من جهة الكنيسة، أحد يهمس.'),
        st2 => { st2.f.nellRadio = true; st2.f.nellNight = st2.day; rec(pickOf('whisper', 5), 0.45); return null; },
        N1('The cemetery gate is never open at night. Tonight, you somehow know it is.', 'بوابة المقبرة عمرها ما تنفتح بالليل. الليلة، ما {تدري|تدرين} كيف، بس {تعرف|تعرفين} إنها مفتوحة.'),
        { show: null }
      ] : [N1('You turn it off. The hiss goes on for a second longer than it should.', '{تطفيه|تطفينه}. والتشويش يكمل ثانية زيادة عن اللازم.'), { show: null }] }
    ],
    /* 4. the cemetery, that night */
    grave: s => [
      st => { rec(pickOf('whisper', 5), 0.4); return null; },
      N1('The gate is open. The fog lies low between the stones.', 'البوابة مفتوحة. والضباب نايم بين الحجارة.'),
      N1('At the back, a small stone with no flowers: NELL FARROW · 1962–1981 · THE SEA KEEPS HER. There is no one under it. Everyone in Saltmere knows that.', 'في الخلف، حجر صغير بدون ورد: نيل فارو · ١٩٦٢–١٩٨١ · البحر محتفظ فيها. ما تحته أحد. وكل سولتمير تعرف هالشي.'),
      st => { if (window.__cdHand) window.__cdHand(); return null; },
      N1('The earth in front of it splits open.', 'التراب اللي قدامه ينشق.'),
      N1('A hand. Grey and wet, clawing at the air, as if it is still trying to reach the surface.', 'يد. رمادية ومبلولة، تخرمش الهوا، كأنها للحين تحاول توصل للسطح.'),
      st => { if (window.__cdSink) window.__cdSink(); return null; },
      N1('Then it is dragged down, all at once. Where it was, something lies on the soil: a scrap of oilcloth, folded tight.', 'وبعدين تنسحب تحت، مرة وحدة. ومكانها، فيه شي على التراب: قطعة قماش مشمّع، مطوية بقوة.'),
      st => { give('nellpage'); st.f.nellPage = true; return null; },
      N1('Inside, dry after forty-five years, the missing page. "2 March. 02:10. A small light going out past the north rocks. Harbour asked if I saw it. I said no. The sea was too big. I was afraid. God forgive me. E."', 'داخلها، ناشفة بعد خمسة وأربعين سنة، الصفحة الناقصة. «٢ مارس. ٠٢:١٠. ضو صغير يبعد ورا الصخور الشمالية. الميناء سألني إذا شفته. قلت لا. البحر كان كبير. كنت خايف. الله يسامحني. إ.»')
    ],
    /* 6. the lantern, at the end of the pier */
    lantern: s => {
      const withHim = !!s.f.nellWith;
      return [
        withHim ? { show: [{ id: 'elias', e: 'sad' }] } : { show: [] },
        N1('You walk to the end of the pier and hang the storm lantern on the last post. The wick takes on the second match.', '{تمشي|تمشين} لآخر الرصيف {وتعلق|وتعلقين} الفانوس على آخر عمود. الفتيلة تولع مع ثاني عود كبريت.'),
        st => { ghost('near'); rec(pickOf('moan', 3), 0.3, 0.8); return null; },
        N1('At the edge of the light, she is there. Close enough to touch. Water runs out of her hair and does not stop.', 'على طرف الضو، هي هناك. قريبة لدرجة {تقدر تلمسها|تقدرين تلمسينها}. الموية تنزل من شعرها وما توقف.'),
        withHim ? { c: 'elias', e: 'sad', t: T('Nell. It was me on the pier. I saw your light. I said I didn\'t.', 'نيل. كنت أنا على الرصيف. شفت ضوك. وقلت ما شفته.') } : N1('You say it for him, because he can\'t: "He saw your light. He was afraid. He has been sorry every day since."', '{تقولها عنه|تقولينها عنه}، لأنه ما يقدر: «شاف ضوك. كان خايف. وهو متأسف كل يوم من وقتها.»'),
        withHim ? { c: 'elias', e: 'sad', t: T('I\'m sorry. I\'m so sorry, girl.', 'آسف. آسف مرة، يا بنتي.') } : null,
        N1('For a long moment she does not move. Then she turns to the light, the way you turn towards a fire on a cold night.', 'لحظة طويلة ما تتحرك. وبعدين تلتفت للضو، مثل ما تلتفت لنار في ليلة باردة.'),
        st => { walkAway(); return null; },
        N1('And she walks out into the fog, and the fog closes behind her like a door.', 'وتمشي للضباب، والضباب يتسكر وراها مثل الباب.'),
        st => { take('lantern'); take('nellpage'); st.f.nellRest = true; quest('q_nell', 'done'); addMood(1); return null; },
        withHim ? N1('Elias stays until the lantern burns out at dawn. On the way home he leans on you, and says nothing, and doesn\'t need to.', 'إلياس يقعد لين ينطفي الفانوس مع الفجر. وهو راجع يتسند عليك، وما يقول شي، وما يحتاج يقول.')
          : N1('The lantern burns until morning. Nobody in Saltmere sees her on the pier again.', 'الفانوس يظل مولّع لين الصبح. ومحد في سولتمير يشوفها على الرصيف مرة ثانية.'),
        { show: null }
      ].filter(Boolean);
    }
  };

  /* ---------- 5. Elias, when you show him the page ---------- */
  GAME.TOPICS.elias = GAME.TOPICS.elias || [];
  GAME.TOPICS.elias.push({ id: 'nellpage', once: true, label: T('Show him the torn page', '{توريه|تورينه} الورقة الممزوعة'), if: s => has('nellpage') && !s.f.nellTold, cls: 'main', run: s => [
    E('shock', 'Where did you get that.', 'من وين {جبت|جبتي} هذي.'),
    N1('You tell him. The pier. The logbook. The radio. The grave. He doesn\'t call you a liar. For a long time, he doesn\'t say anything at all.', '{تقول له|تقولين له}. الرصيف. والدفتر. والراديو. والقبر. ما يقول عنك {كذاب|كذابة}. ووقت طويل، ما يقول ولا شي.'),
    E('sad', 'Nell Farrow. Joe\'s girl. Nineteen. She rowed out to find her father with a storm lantern, in a dinghy you wouldn\'t take across a bath.', 'نيل فارو. بنت جو. عمرها تسعطعش. طلعت تدور أبوها بفانوس عاصفة، في قارب صغير ما {تقطع|تقطعين} فيه بانيو.'),
    E('sad', 'I was on the pier. I saw her light. The harbour asked me, and I said no. If I\'d said yes, they\'d have sent me out. In that sea.', 'كنت على الرصيف. شفت ضوها. والميناء سألني، وقلت لا. لو قلت إيه، كانوا بيرسلوني أنا. في ذاك البحر.'),
    E('neutral', 'Joe came home at dawn. She didn\'t. Forty-five years I\'ve told myself nobody could have reached her. Some nights I even believe it.', 'جو رجع مع الفجر. وهي ما رجعت. خمسة وأربعين سنة وأنا أقول لنفسي محد كان بيوصلها. وبعض الليالي حتى أصدق.'),
    E('sad', 'She comes in the cold months. End of the pier. I stopped walking down there at night.', 'تجي في الشهور الباردة. آخر الرصيف. وأنا وقفت أنزل هناك بالليل.'),
    E('neutral', 'There\'s a storm lantern in the shed. Would you take it to the end of the pier tonight and light it? So she has one light that answers.', 'فيه فانوس عاصفة في المخزن. {تقدر تاخذه|تقدرين تاخذينه} لآخر الرصيف الليلة {وتولعه|وتولعينه}؟ عشان يكون لها ضو واحد يرد عليها.'),
    { menu: [
      { t: T('"I\'ll do it."', '«أنا أسويها.»'), then: [st => { st.f.nellTold = true; give('lantern'); return null; }, E('sad', 'Thank you. Don\'t tell me how it goes. Or do. I don\'t know.', 'مشكور. لا {تقول|تقولين} لي وش صار. أو {قل|قولي}. ما أدري.')] },
      { t: T('"Come with me. She should hear it from you."', '«{تعال|تعالي} معي. لازم تسمعها منك.»'), then: [st => { st.f.nellTold = true; st.f.nellWith = true; give('lantern'); return null; }, E('sad', '...Help me with my coat, then. And walk slowly.', '...{ساعدني|ساعديني} بالكوت، أجل. {وامش|وامشي} على مهلك.')] }
    ] }
  ] });

  /* ---------- the places ---------- */
  const night = s => s.slot === NIGHT;
  GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
  GAME.ENTER_HOOKS.unshift(s => {
    if (!s || RUN || s.f.prologue) return null;
    /* the task belongs to Elias's chapter: once that is over, an unfinished one quietly goes away */
    if (s.quests.q_nell === 'active' && s.done && s.done.elias) { delete s.quests.q_nell; return null; }
    if (!ch1(s) || !night(s)) return null;
    if (s.loc === 'harbor' && !s.f.nellSeen && s.day >= 1 && (window.__nellForce || s.day >= 3 || roll(0.6))) return SC.pier(s);
    if (s.loc === 'cemetery' && s.f.nellRadio && !s.f.nellPage) return SC.grave(s);
    return null;
  });
  /* the cemetery is open only on the night of the radio */
  const cem = (GAME.MAP || []).find(p => p.to === 'cemetery');
  if (cem && cem.lock) { const l0 = cem.lock; cem.lock = s => (ch1(s) && s.f.nellRadio && !s.f.nellPage && s.f.nellNight === s.day) ? false : l0(s); }
  /* things to tap */
  const push = (loc, spot) => { if (GAME.LOC[loc]) GAME.LOC[loc].spots.push(spot); };
  push('shed', { x: 44, y: 54, label: T('The logbook, open on the bench', 'الدفتر، مفتوح على الطاولة'), if: s => ch1(s) && night(s) && s.f.nellSeen && !s.f.nellLog, cls: 'main', run: s => SC.log(s) });
  push('living', { x: 64, y: 44, label: T('The radio is hissing', 'الراديو يوشوش'), if: s => ch1(s) && night(s) && s.f.nellLog && !s.f.nellRadio, cls: 'main', run: s => SC.radio(s) });
  push('cemetery', { x: 24, y: 60, label: T('A stone with no flowers', 'حجر بدون ورد'), if: s => !!s.f.nellPage, run: s => [s.f.nellRest
    ? N1('NELL FARROW · 1962–1981 · THE SEA KEEPS HER. Somebody has left flowers, and a dented brass lantern, cold now.', 'نيل فارو · ١٩٦٢–١٩٨١ · البحر محتفظ فيها. أحد حط ورد، وفانوس نحاس معفوس، بارد الحين.')
    : N1('NELL FARROW · 1962–1981 · THE SEA KEEPS HER. The earth in front of it is smooth, as if nothing ever broke it.', 'نيل فارو · ١٩٦٢–١٩٨١ · البحر محتفظ فيها. التراب اللي قدامه ناعم، كأن ما شي كسره أبد.')] });
  push('harbor', { x: 58, y: 62, label: T('Light the lantern at the end of the pier', '{ولّع|ولّعي} الفانوس آخر الرصيف'), if: s => ch1(s) && night(s) && has('lantern') && s.f.nellTold && !s.f.nellRest, cls: 'main', run: s => SC.lantern(s) });

  /* ---------- people who notice ---------- */
  if (GAME.CHAR.gregor && Array.isArray(GAME.CHAR.gregor.chat)) {
    GAME.CHAR.gregor.chat.unshift({ if: s => !!s.f.nellRest, e: 'neutral', t: T('Somebody left flowers on the Farrow stone. And a lantern. First flowers on it in forty-five years. I\'ll not ask who.', 'أحد حط ورد على حجر فارو. وفانوس. أول ورد ينحط عليه من خمسة وأربعين سنة. وما راح أسأل مين.') });
    GAME.CHAR.gregor.chat.unshift({ if: s => !!s.f.nellPage && !s.f.nellRest, e: 'sad', t: T('The Farrow girl\'s stone. My father dug that grave, and put nothing in it. He said it was the hardest one he ever dug.', 'حجر بنت فارو. أبوي حفر ذاك القبر، وما حط فيه شي. قال إنه أصعب قبر حفره بحياته.') });
  }

  /* ---------- playing again: the town half-remembers you ---------- */
  const g0 = GAME.CHAR.elias && GAME.CHAR.elias.greet;
  if (g0) GAME.CHAR.elias.greet = s => {
    if (replay() && !s.f.rmElias && s.f.metElias) { s.f.rmElias = true; return { e: 'neutral', t: T('Have we... no. Never mind. You\'ve just got one of those faces.', 'التقينا قبل...؟ لا. ولا شي. بس عندك وجه من هالوجيه.') }; }
    return g0(s);
  };
  GAME.ENTER_HOOKS.push(s => {
    if (!s || RUN || !replay() || s.f.rmMotel || s.loc !== 'motel' || s.f.prologue) return null;
    s.f.rmMotel = true;
    return [N1('Room 6. You have the strangest feeling you have stood here before, holding this same postcard, deciding something.', 'غرفة ٦. عندك إحساس غريب إنك وقفت هنا قبل، {ماسك|ماسكة} نفس الكرت، {تقرر|تقررين} شي.')];
  });

  window.__nell = { SC, ghost, gone, face };   /* for tests */
})();
