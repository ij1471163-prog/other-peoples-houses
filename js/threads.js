/* =====================================================================
   Threads: the things you do with your hands now matter to the story.
   (Elias's chapter only. No trust, suspicion or ending changes.)

   1. Bottles from the sea are Nell's.
      Three bottles, three notes, written at 9, at 14, and on the night
      she rowed out. Each comes up on your line once the story is ready
      for it (or washes up on the beach a day later if you don't fish).
      The second tells you her way home through the rocks; the last one
      is what she wanted the man on the pier to know. Both change what
      happens when you light the lantern for her.
   2. Elias's chess fades with his memory (js/elias-games.js: after the
      night he forgets whose turn it is, you find the move for him).
   3. The squall: one evening the wind turns and the Ada's net is
      tearing loose. If your hands know the knot (🛠 2, from mending nets
      with him), you can mend it in the storm yourself. If not, you hold
      the torch, and watch his hands.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const ch1 = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !(s.done && s.done.elias);
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const s = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (s.master || 0.8) * (s.sfx || 0.7) * k)); };
  const rec = (name, k, rate) => { if (!on()) return; try { const a = new Audio('img/snd/' + name + '.mp3'); a.volume = vol(k); if (rate) { a.preservesPitch = false; a.playbackRate = rate; } a.play().catch(() => {}); } catch (e) { /* none */ } };
  const handsLv = () => (GAME.SKILLS && GAME.SKILLS.hands ? GAME.SKILLS.hands.level() : 1);

  /* ================= 1. Nell's bottles ================= */
  const got = s => s.f.bottlesGot || (s.f.gotBottle ? 1 : 0);
  const read = s => s.f.notesRead || (s.f.bottleRead ? 1 : 0);
  /* is the next bottle ready to be found? */
  const ready = s => { const g = got(s); if (g === 0) return s.day >= 2; if (!ch1(s)) return false;
    return g === 1 ? !!s.f.nellSeen : g === 2 ? !!s.f.nellPage : false; };
  GAME.bottleDue = (s, lv) => {
    const g = got(s);
    if (g >= 3 || !ready(s) || (has('bottle') && read(s) < g)) return 0;   /* read the one you have first */
    return g === 0 ? 0.08 + lv * 0.02 : 0.3 + lv * 0.05;
  };
  GAME.onBottle = s => { s.f.bottlesGot = got(s) + 1; s.f.gotBottle = true; s.f.bottleDueDay = null; };
  /* note when the next one became due, so the sea can bring it in if you never fish */
  const clock = s => { if (s && ch1(s) && got(s) >= 1 && s.f.bottleDueDay == null && GAME.bottleDue(s, 1) > 0) s.f.bottleDueDay = s.day; return false; };
  GAME.EVENTS.unshift({ id: 'bottleClock', when: clock });   /* never fires; it only notes the day */

  const NOTES = [
    [N1('The cork comes out with a sigh. Inside, rolled tight, a page from a child\'s exercise book.', 'الفلّينة تطلع مع تنهيدة. داخلها، ملفوفة بقوة، ورقة من دفتر مدرسة.'),
     N1('In pencil, very neat: "To whoever finds this. My name is Nell. I am 9. When I grow up I will row all the way to the lighthouse by myself. Write back."', 'بالرصاص، بخط مرتب مرة: «للي يلقى هذي. اسمي نيل. عمري ٩. لما أكبر بجدّف لين المنارة لحالي. {رد|ردّي} علي.»'),
     N1('The paper is very old. The ink of the date has run: 197-.', 'الورقة قديمة مرة. حبر التاريخ ساح: ١٩٧-.')],
    [N1('Another green bottle. The same cork, the same tight roll of paper. The handwriting has grown up.', 'قارورة خضرا ثانية. نفس الفلّينة، ونفس لفّة الورق. بس الخط كبر.'),
     N1('"Nell again. 14 now. I did it: the lighthouse and back, by myself. Dad shouted for an hour, then he bought me chips."', '«نيل مرة ثانية. عمري ١٤ الحين. سويتها: لين المنارة ورجعت، لحالي. أبوي صرخ ساعة كاملة، وبعدين اشترى لي بطاطس.»'),
     N1('"Dad says the north rocks have eaten nine boats. But there is a way through. Keep the church light over your left shoulder and count forty strokes. I will never tell anyone. Except you."', '«أبوي يقول الصخور الشمالية أكلت تسع قوارب. بس فيه طريق من بينها. {خل|خلي} ضو الكنيسة فوق كتفك اليسار {وعد|وعدي} أربعين جدفة. ما راح أقول لأحد أبد. إلا لك.»'),
     N1('So she knew the way through the rocks. She wasn\'t lost out there. She was looking for someone.', 'يعني كانت تعرف الطريق بين الصخور. ما كانت ضايعة هناك. كانت تدور أحد.')],
    [N1('The third bottle is different. Brown glass, a medicine bottle, the cork pushed in hard and sealed with candle wax. The paper inside has been wet once and dried.', 'القارورة الثالثة غير. زجاج بني، قارورة دوا، الفلّينة مدفوعة بقوة ومختومة بشمع. والورقة اللي داخلها انبلت مرة ونشفت.'),
     N1('The writing is fast, in pencil, the letters jumping as if the hand was moving with the sea.', 'الخط مستعجل، بالرصاص، الحروف تنط كأن اليد كانت تتحرك مع البحر.'),
     N1('"2 March 1981. In the dinghy. Throwing this in case. Dad\'s still out past the rocks and I\'m going for him. I have the lantern."', '«٢ مارس ١٩٨١. في القارب الصغير. أرميها احتياط. أبوي لسا برا ورا الصخور وأنا رايحة له. معي الفانوس.»'),
     N1('"If I don\'t come back, it is nobody\'s fault. Not Dad\'s. Not whoever is on the pier tonight. I chose it. The sea is very big. I am not afraid. Nell."', '«إذا ما رجعت، ما هي غلطة أحد. لا أبوي. ولا اللي على الرصيف الليلة. أنا اخترت. البحر كبير مرة. وأنا مو خايفة. نيل.»'),
     N1('You read the last lines three times. Not whoever is on the pier tonight.', '{تقرا|تقرين} آخر سطرين ثلاث مرات. ولا اللي على الرصيف الليلة.')]
  ];
  const push = (loc, spot) => { if (GAME.LOC[loc]) GAME.LOC[loc].spots.push(spot); };
  push('your_room', { x: 50, y: 78, label: T('Open the bottle from the sea', '{افتح|افتحي} القارورة اللي من البحر'), if: s => has('bottle') && read(s) < got(s), cls: 'main', run: s => {
    const i = Math.min(2, read(s)); s.f.notesRead = i + 1; s.f.bottleRead = true; take('bottle');
    return NOTES[i].slice();
  } });
  /* the sea brings it in anyway, a day later */
  push('beach', { x: 70, y: 82, label: T('Something green at the tide line', 'شي أخضر عند خط الموج'), if: s => ch1(s) && s.f.bottleDueDay != null && s.day > s.f.bottleDueDay && GAME.bottleDue(s, 1) > 0, run: s => {
    give('bottle'); GAME.onBottle(s);
    return [N1('Half buried in the wet sand, a bottle. Corked. Something rolled up inside. The tide brought it in this morning, as if it had been looking for you.', 'نصها مدفونة بالرمل المبلول، قارورة. مسدودة. وفيها شي ملفوف. الموج جابها الصبح، كأنها كانت تدورك.')];
  } });

  /* Elias, when you show him the notes */
  GAME.TOPICS.elias = GAME.TOPICS.elias || [];
  GAME.TOPICS.elias.push(
    { id: 'note1', label: T('Show him the note from the bottle', '{وره|وريه} الورقة اللي في القارورة'), if: s => ch1(s) && read(s) >= 1 && !s.f.note1Shown, run: s => { s.f.note1Shown = true; return [
      E('neutral', 'Nell. Joe Farrow\'s girl.', 'نيل. بنت جو فارو.'),
      E('smile', 'She did it, you know. Rowed to the lighthouse on her own, at fourteen. Joe nearly died. The whole harbour stood on the pier and cheered her in.', 'سوتها، تدري. جدّفت لين المنارة لحالها، وعمرها أربعطعش. جو كان بيموت. والميناء كله وقف على الرصيف يصفق لها وهي راجعة.'),
      E('sad', 'I was on the pier that day too.', 'وأنا كنت على الرصيف ذاك اليوم بعد.')]; } },
    { id: 'note2', label: T('Show him the second note', '{وره|وريه} الورقة الثانية'), if: s => ch1(s) && read(s) >= 2 && s.f.note1Shown && !s.f.note2Shown, run: s => { s.f.note2Shown = true; return [
      N1('He reads it twice. At "the church light over your left shoulder" his mouth moves, saying it along with her.', 'يقراها مرتين. عند «ضو الكنيسة فوق كتفك اليسار» شفايفه تتحرك، يقولها معها.'),
      E('neutral', 'That\'s the old way through. My grandfather\'s way. Only the old men know it.', 'هذا الطريق القديم. طريق جدي. ما يعرفه إلا الشيبان.'),
      E('sad', 'So she knew. She wasn\'t lost in the rocks.', 'يعني كانت تعرف. ما ضاعت بين الصخور.'),
      N1('He folds the note very small and gives it back, and doesn\'t look at you for a while.', 'يطوي الورقة صغيرة مرة ويرجعها لك، وما يطالعك فترة.')]; } },
    { id: 'note3', label: T('Give him Nell\'s last note', '{أعطه|أعطيه} آخر ورقة من نيل'), cls: 'main', if: s => ch1(s) && read(s) >= 3 && s.f.nellTold && !s.f.note3Shown && !s.f.note3Lantern, run: s => { s.f.note3Shown = true; addMood(1); return [
      N1('He reads it standing up. Then he sits down, without looking for the chair, and reads it again.', 'يقراها وهو واقف. وبعدين يجلس، بدون ما يدور الكرسي، ويقراها مرة ثانية.'),
      E('sad', '"Not whoever is on the pier tonight."', '«ولا اللي على الرصيف الليلة.»'),
      E('sad', 'She knew somebody was there. And she let him off. That same night. Before it even happened.', 'كانت تدري إن فيه أحد هناك. وسامحته. نفس الليلة. قبل لا يصير شي حتى.'),
      E('neutral', 'Forty-five years I\'ve been waiting for somebody to say that. It never crossed my mind it would be her.', 'خمسة وأربعين سنة وأنا أنتظر أحد يقولها. وعمرها ما جت في بالي إنها بتكون هي.'),
      s.f.nellRest ? E('neutral', 'I\'ll keep this. If you don\'t mind.', 'بخليها عندي. إذا ما عندك مانع.')
        : E('neutral', 'Take it with you, with the lantern. She should know it arrived.', '{خذها|خذيها} معك، مع الفانوس. لازم تدري إنها وصلت.')]; } }
  );

  /* the lantern scene knows what you have read */
  const SC = window.__nell && window.__nell.SC;
  if (SC && SC.lantern) {
    const lan0 = SC.lantern;
    SC.lantern = s => {
      const steps = lan0(s), withHim = !!s.f.nellWith;
      const find = start => steps.findIndex(x => x && x.n && x.n.en && x.n.en.startsWith(start));
      const hang = find('You walk to the end of the pier');
      if (read(s) >= 2 && hang >= 0) steps.splice(hang + 1, 0,
        N1('You turn it the way her note said: the church light over your left shoulder. The way through the rocks. Her way home.', '{تلفه|تلفينه} مثل ما قالت ورقتها: ضو الكنيسة فوق الكتف اليسار. الطريق بين الصخور. طريقها للبيت.'));
      const turn = find('For a long moment she does not move');
      if (read(s) >= 3 && turn >= 0) {
        s.f.note3Lantern = true;
        steps.splice(turn, 0, ...(withHim ? [
          N1('You give Elias her last note. He reads it out loud, by the lantern, very slowly, the way you read to someone who is falling asleep.', '{تعطي|تعطين} إلياس آخر ورقة منها. يقراها بصوت عالي، على ضو الفانوس، شوي شوي، مثل ما تقرا لأحد بينام.'),
          { c: 'elias', e: 'sad', t: T('"...Not whoever is on the pier tonight. I chose it. I am not afraid."', '«...ولا اللي على الرصيف الليلة. أنا اخترت. وأنا مو خايفة.»') },
          E('sad', 'You weren\'t. I was. I\'m not any more.', 'أنتِ ما كنتِ خايفة. أنا اللي كنت. وما عدت.')
        ] : [
          N1('You unfold her last note and read it to her. Her own words, back to her, across forty-five years.', '{تفتح|تفتحين} آخر ورقة منها {وتقراها|وتقرينها} لها. كلامها هي، يرجع لها، بعد خمسة وأربعين سنة.')
        ]), N1('Something in her face changes. She was never waiting for him to be sorry. She was waiting to know her bottle arrived.', 'شي في وجهها يتغير. ما كانت تنتظره يتأسف. كانت تنتظر تدري إن قارورتها وصلت.'));
      }
      return steps;
    };
  }

  /* ================= 3. the squall ================= */
  let wind = null;
  function stormFx(onOff) {
    const st = $('stage'); if (st) st.classList.toggle('storming', !!onOff);
    if (onOff) {
      rec('wave1', 0.55); setTimeout(() => rec('wave2', 0.5), 1800);
      clearInterval(stormFx.th); setTimeout(() => { rec('hit2', 0.3, 0.45); }, 1500);
      stormFx.th = setInterval(() => { if (!document.querySelector('#stage.storming')) { clearInterval(stormFx.th); return; } rec('hit2', 0.3, 0.45); setTimeout(() => rec('wave' + (1 + (Math.random() * 2 | 0)), 0.4), 900); }, 7300);
      try { if (on() && !wind) {
        const c = new (window.AudioContext || window.webkitAudioContext)(), b = c.createBuffer(1, c.sampleRate * 3, c.sampleRate), d = b.getChannelData(0);
        let last = 0; for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
        const src = c.createBufferSource(); src.buffer = b; src.loop = true;
        const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 520; f.Q.value = 0.7;
        const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.18; lg.gain.value = 260; lfo.connect(lg).connect(f.frequency); lfo.start();
        const g = c.createGain(); g.gain.value = vol(0.5); src.connect(f).connect(g).connect(c.destination); src.start();
        wind = { c, src, lfo };
      } } catch (e) { wind = null; }
    } else { clearInterval(stormFx.th); }
    if (!onOff && wind) { try { wind.src.stop(); wind.lfo.stop(); wind.c.close(); } catch (e) { /* closed */ } wind = null; }
    return null;
  }
  window.__stormFx = stormFx;
  GAME.SCRIPTS.squall = s => [
    stormFx.bind(null, true),
    N1('The wind turns in the time it takes to drink a cup of tea. The windows begin to hum. Somewhere a gate bangs, and bangs, and bangs.', 'الريح تنقلب بوقت ما تشرب كوب شاهي. الشبابيك تبدأ تطن. وفي مكان، باب حوش يطق، ويطق، ويطق.'),
    { show: [{ id: 'elias', e: 'shock' }] },
    N1('The front door flies open. Elias, out of breath, rain running off his cap.', 'باب البيت ينفتح بقوة. إلياس، نفسه مقطوع، والمطر ينزل من كابه.'),
    E('shock', 'The Ada. I left the big net out on her rail to dry. If the sea takes it, that\'s the season gone.', '«آدا». خليت الشبكة الكبيرة على حافتها تنشف. إذا البحر أخذها، راح الموسم كله.'),
    { go: 'harbor' }, { show: [{ id: 'elias', e: 'shock' }] },
    N1('The harbour is all noise. The Ada bucks at her mooring. The net hangs half over the side with a long tear down it, and every wave pulls it a little further.', 'الميناء كله ضجيج. «آدا» تنط على حبالها. والشبكة معلقة نصها برا الحافة وفيها شق طويل، وكل موجة تسحبها شوي زيادة.'),
    { menu: [
      { t: T('"I\'ll mend it. You hold her steady."', '«أنا أصلحها. {أنت امسك|أنتِ امسكي} القارب ثابت.»'), cls: 'main', need: s2 => handsLv() >= 2, why: T('🛠 Hands 2: mend the nets with Elias first', '🛠 شغل اليد ٢: {صلّح|صلّحي} الشباك مع إلياس قبل'),
        fx: s2 => { s2.f.stormMine = true; }, then: [
          E('shock', 'You? ...Go on, then. Quick!', '{أنت|أنتِ}؟ ...يلا، أجل. بسرعة!'),
          { mini: 'knot', storm: true, then: r => {
            if (r && r.ok) { S().f.storm = 'saved'; addMood(1); return [
              N1('The last knot bites. The tear is closed. Elias hauls the net in over the rail in one long pull, and it comes, all of it, heavy and whole.', 'آخر عقدة تمسك. الشق انسكر. إلياس يسحب الشبكة فوق الحافة بسحبة وحدة طويلة، وتجي، كلها، ثقيلة وكاملة.'),
              E('shock', 'Where did you learn to... oh. In my shed. From me.', 'وين {تعلمت|تعلمتي}... آه. في مخزني. مني.'),
              E('smile', 'Well. At least I taught one thing right.', 'طيب. على الأقل علّمت شي واحد صح.')]; }
            if (r && r.ok === false) { S().f.storm = 'lost'; return [
              N1('A wave lifts the Ada and the net slides off the rail like a living thing. You grab for it. Elias grabs you.', 'موجة ترفع «آدا» والشبكة تنزلق من الحافة كأنها حية. {تمد|تمدين} يدك لها. وإلياس يمسكك أنت.'),
              E('angry', 'Let it go! LET IT GO.', '{خلها|خليها}! {خلها|خليها} تروح!'),
              E('sad', 'Nets are rope. You\'re not.', 'الشباك حبال. {وأنت|وأنتِ} لا.')]; }
            S().f.storm = 'half'; return [N1('Elias takes the twine out of your hands and finishes it himself, slowly, while the sea takes the corner he can\'t reach.', 'إلياس ياخذ الخيط من يدك ويكمله بنفسه، على مهله، والبحر ياخذ الطرف اللي ما يوصله.')];
          } }
        ] },
      { t: T('"Tell me what to do."', '«{قل لي|قولي لي} وش أسوي.»'), then: [
        E('neutral', 'Hold the torch. On my hands. Don\'t move it.', '{امسك|امسكي} الكشاف. على يديني. {لا تحركه|لا تحركينه}.'),
        N1('He kneels on the wet deck and starts on the tear, the twine flying through his fingers the way it has for sixty years.', 'يجلس على ركبه على السطح المبلول ويبدا في الشق، والخيط يطير بين أصابعه مثل ما يطير من ستين سنة.'),
        N1('Then, halfway through a knot, his hands stop. He stares at them in the torchlight as if they belong to somebody else.', 'وبعدين، بنص عقدة، يدينه توقف. يطالعها على ضو الكشاف كأنها لأحد غيره.'),
        N1('Three seconds. Five. A wave comes over the rail. He starts again, from the beginning of the knot.', 'ثلاث ثواني. خمس. موجة تدخل فوق الحافة. ويبدا من جديد، من أول العقدة.'),
        st => { st.f.storm = 'half'; st.f.noticed = true; return null; },
        N1('He saves most of it. The sea takes the rest. On the walk home neither of you mentions his hands.', 'يلحق أغلبها. والبحر ياخذ الباقي. وأنتم راجعين، ولا واحد فيكم يجيب طاري يدينه.'),
        st => (handsLv() < 2 ? [N1('If your own hands had known the knot, you could have done it for him.', 'لو يدك كانت تعرف العقدة، كان {سويتها|سويتيها} عنه.')] : null)
      ] }
    ] },
    { go: 'living' }, { show: [{ id: 'elias', e: 'neutral' }] },
    N1('Back home, soaked to the bone. Elias puts the kettle on with shaking hands and two towels on the chair, one for each of you.', 'رجعتوا البيت، مبلولين لين العظم. إلياس يحط الغلاية بيدين ترجف، وفوطتين على الكرسي، وحدة لكل واحد.'),
    stormFx.bind(null, false),
    { show: null }
  ];
  GAME.EVENTS.push({ id: 'squall', once: true, when: s => ch1(s) && !s.f.fallDone && s.day >= 2 && s.slot === 3 && ['living', 'kitchen', 'your_room', 'shed', 'elias_ext', 'bath'].includes(s.loc) && s.f.nellNight !== s.day && (s.day >= 3 || roll(0.5)),
    run: s => GAME.SCRIPTS.squall(s) });

  /* the harbour remembers the storm */
  const say = (who, line) => { const c = GAME.CHAR[who]; if (c && Array.isArray(c.chat)) c.chat.unshift(line); };
  say('marco', { if: s => s.f.storm === 'saved', e: 'shock', t: T('They\'re saying you mended Elias\'s net on the Ada, in that wind, on your own. He\'s telling everybody. He\'s never told anybody anything.', 'يقولون {إنك صلّحت|إنك صلّحتي} شبكة إلياس على «آدا»، في ذيك الريح، لحالك. وهو يقول للكل. وهو عمره ما قال لأحد شي.') });
  say('marco', { if: s => s.f.storm === 'half' && s.f.stormMine !== true, e: 'sad', t: T('Elias came in this morning with his hands in his pockets the whole time. Even to drink his coffee. You noticed it too, didn\'t you?', 'إلياس جا الصبح ويدينه في جيوبه طول الوقت. حتى وهو يشرب قهوته. {انتبهت|انتبهتي} أنت بعد، صح؟') });
  say('sami', { if: s => !!s.f.storm, e: 'neutral', t: T('Some squall the other night. Half the harbour lost gear. Elias came in for twine first thing, and bought twice what he needed.', 'عاصفة قوية ذيك الليلة. نص الميناء ضاع عليهم عدّة. إلياس جاني أول الصبح يشتري خيط، واشترى ضعف اللي يحتاجه.') });
  say('marco', { if: s => (s.f.chessHelped || 0) >= 1, e: 'sad', t: T('He told me you found a move he couldn\'t. He said it like a joke. He didn\'t laugh.', 'قال لي {إنك لقيت|إنك لقيتي} نقلة هو ما لقاها. قالها كأنها نكتة. وما ضحك.') });
})();
