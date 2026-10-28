/* =====================================================================
   Thomas's treasure hunt (Elias's chapter, from the second day).
   When Thomas was eight he made a treasure hunt for his dad: five notes
   in a child's pencil, hidden round the house and down to the boat.
   Elias never found the first one. You do, in the room you sleep in.
     · each note is a riddle; you choose where to look
     · right: the next note is there
     · wrong: you find something else; two wrong guesses on the same
       note and you lose the thread for today (come back tomorrow)
     · each note has a small number in its corner; the last riddle needs
       them all
   The tin at the end goes to Elias. No trust or ending changes.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const ch1 = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !(s.done && s.done.elias);
  Object.assign(GAME.ITEMS, {
    thnote: { name: T('Thomas\'s notes', 'أوراق توماس'), desc: T('A child\'s treasure hunt, in pencil, from thirty-three years ago.', 'لعبة كنز طفل، بالرصاص، من ثلاث وثلاثين سنة.') },
    thbox: { name: T('Thomas\'s tin', 'علبة توماس'), desc: T('A biscuit tin, rusty at the corners. Inside: a drawing and a promise.', 'علبة بسكويت، صدية من الزوايا. داخلها: رسمة ووعد.') }
  });
  GAME.QUESTS.q_hunt = { title: T('A treasure hunt for Dad', 'لعبة كنز لبابا'), hint: T('Thomas left his dad a trail of riddles. Read the last note again (in your room) and work out where the next one is.', 'توماس ترك لأبوه ألغاز. {اقرا|اقري} آخر ورقة مرة ثانية (في غرفتك) {وفكر|وفكري} وين الجاية.') };
  if (GAME.QUEST_OWNER) GAME.QUEST_OWNER.q_hunt = 'elias';

  /* the riddles: what the note says, its corner number, and where you could look */
  const R = [
    { t: T('TREASURE HUNT FOR DAD!!\nClue 1: I have a mouth but I never eat. I whisper all night. You fall asleep in front of me.', 'لعبة كنز لبابا!!\nاللغز ١: عندي فم بس ما آكل. أوشوش طول الليل. وأنت تنام قدامي.'), n: 3,
      o: [{ id: 'radio', t: T('The radio', 'الراديو'), go: 'living', ok: true, find: T('Behind the old radio, taped to the back, a folded square of paper.', 'ورا الراديو القديم، ملزقة على ظهره، ورقة مطوية مربعة.') },
        { id: 'fire', t: T('The fireplace', 'المدفأة'), go: 'living', find: T('Ash, an old match, warmth. No paper. Paper and fireplaces, you think, would be a short game.', 'رماد، وعود كبريت قديم، ودفا. ولا ورقة. ورقة ومدفأة، {تفكر|تفكرين}، لعبة قصيرة.') },
        { id: 'kettle', t: T('The kettle', 'الغلاية'), go: 'kitchen', find: T('Inside the kettle: water, and a lump of limescale shaped exactly like Scotland.', 'داخل الغلاية: موية، وحبة كلس شكلها بالضبط مثل خريطة اسكتلندا.') }] },
    { t: T('Clue 2: I am full of holes but I still hold things. You fix me every afternoon.', 'اللغز ٢: كلي فتحات بس أشيل أشياء. وأنت تصلحني كل عصر.'), n: 1,
      o: [{ id: 'colander', t: T('The colander', 'المصفاة'), go: 'kitchen', find: T('Just a colander. It has seen a lot of pasta. It has nothing to say to you.', 'مصفاة بس. شافت مكرونة كثير. وما عندها شي تقوله لك.') },
        { id: 'pots', t: T('The lobster pots', 'أقفاص الكركند'), go: 'yard', find: T('A crab, very surprised to see you, and very offended about it.', 'سلطعون، متفاجئ مرة يشوفك، وزعلان مرة من هالشي.') },
        { id: 'nets', t: T('The nets in the shed', 'الشباك في المخزن'), go: 'shed', ok: true, find: T('Knotted into the oldest net, right in the corner where nobody mends anything, a twist of paper.', 'معقودة في أقدم شبكة، في الزاوية اللي محد يصلح فيها شي، ورقة ملفوفة.') }] },
    { t: T('Clue 3: Every Monday I wave at the sea but I have no hands.', 'اللغز ٣: كل اثنين أأشّر للبحر بس ما عندي يدين.'), n: 4,
      o: [{ id: 'line', t: T('The washing line', 'حبل الغسيل'), go: 'yard', ok: true, find: T('On the washing line post, behind the peg bag, a paper folded into a tiny boat.', 'على عمود حبل الغسيل، ورا كيس المشابك، ورقة مطوية على شكل قارب صغير.') },
        { id: 'flag', t: T('The flag at the harbour', 'العلم في الميناء'), go: 'harbor', find: T('The flag snaps in the wind. Nothing tied to it but the wind.', 'العلم يرفرف مع الريح. وما فيه شي مربوط فيه غير الريح.') },
        { id: 'lh', t: T('The lighthouse', 'المنارة'), go: null, find: T('You start up the cliff path and stop. Thomas was eight. He wasn\'t allowed this far. He\'d have hidden it closer.', '{تبدأ|تبدئين} تطلع طريق الجرف {وتوقف|وتوقفين}. توماس كان عمره ثمان. ما كان مسموح له يروح لهالبعد. أكيد خباها أقرب.') }] },
    { t: T('Clue 4: I have a lady\'s name but I smell of fish. You love me more than me. (Joke.)', 'اللغز ٤: اسمي اسم بنت بس ريحتي سمك. وتحبني أكثر مني. (أمزح.)'), n: 2,
      o: [{ id: 'martha', t: T('Martha', 'مارثا'), go: null, find: T('You think about asking Martha if she smells of fish. You decide you would like to live.', '{تفكر|تفكرين} تسأل مارثا إذا ريحتها سمك. {وتقرر|وتقررين} إنك {تبي تعيش|تبين تعيشين}.') },
        { id: 'ada', t: T('The Ada, his boat', '«آدا»، قاربه'), go: 'harbor', ok: true, find: T('Under the Ada\'s seat, wedged in the gap where the wood has shrunk, the last folded paper. This one is bigger.', 'تحت كرسي «آدا»، محشورة في الفتحة اللي انكمش فيها الخشب، آخر ورقة مطوية. هذي أكبر.') },
        { id: 'fishmonger', t: T('The fishmonger', 'بياع السمك'), go: 'street', find: T('There is no fishmonger in Saltmere. Sami tells you so, proudly, as if he personally saw them off.', 'ما فيه بياع سمك في سولتمير. سامي يقولها لك بفخر، كأنه هو اللي طردهم.') }] },
    { t: T('LAST ONE!! Add up the numbers in my corners. Count that many boards back from the end of the pier and look under it. If you find it you have to do what it says.', 'آخر واحد!! {اجمع|اجمعي} الأرقام اللي في زواياي. {عد|عدي} كذا خشبة من آخر الرصيف {وطالع|وطالعي} تحتها. وإذا لقيته لازم تسوي اللي مكتوب.'), n: 0,
      o: [{ id: 'b7', t: T('The 7th board', 'الخشبة السابعة'), go: 'harbor', find: T('Under the seventh board: the sea, and a lot of it, and one confused fish.', 'تحت الخشبة السابعة: البحر، وكثير منه، وسمكة محتارة.') },
        { id: 'b10', t: T('The 10th board', 'الخشبة العاشرة'), go: 'harbor', ok: true, find: T('The tenth board is loose. Under it, tied to the beam with fishing line gone white with age, a biscuit tin.', 'الخشبة العاشرة مفكوكة. وتحتها، مربوطة في العمود بخيط صيد صار أبيض من القدم، علبة بسكويت.') },
        { id: 'b12', t: T('The 12th board', 'الخشبة الثانية عشر'), go: 'harbor', find: T('The twelfth board is nailed down so hard you hurt your thumb. Nothing.', 'الخشبة الثانية عشر مسمرة بقوة لين عورت إبهامك. ولا شي.') }] }
  ];

  /* the note itself, on screen: lined paper, a child's pencil, the number in its corner */
  GAME.MINI.thnote = function (panel, done, st) {
    panel.innerHTML = '';
    const i = st.i, lost = !!st.lost, r = R[i];
    const box = el('div', 'cp th-note'); box.innerHTML = `<div class="th-paper${lost ? ' lost' : ''}"><b class="th-n">${r.n ? tx(T(String(r.n), '٠١٢٣٤٥٦٧٨٩'[r.n])) : '?'}</b><p></p><small></small></div>`;
    box.querySelector('p').textContent = tx(r.t);
    box.querySelector('small').textContent = tx(T('(tap to fold it away)', '({اضغط|اضغطي} عشان {تطويها|تطوينها})'));
    $('stage').appendChild(box);
    const alt = el('button', 'opt main cp-alt', tx(T('Fold it', '{اطوها|اطويها}'))); alt.type = 'button'; panel.appendChild(alt);
    let over = false;
    const fin = ev => { if (ev) ev.stopPropagation(); if (over) return; over = true; alt.remove(); box.classList.add('out'); setTimeout(() => box.remove(), 300); done(1); };
    setTimeout(() => box.addEventListener('click', fin), 400); alt.onclick = fin;
    try { if (window.AUDIO && AUDIO.on) { const a = new Audio('img/snd/wood2.mp3'); a.volume = 0.25; a.playbackRate = 1.6; a.play().catch(() => {}); } } catch (e) { /* quiet */ }
  };

  const step = s => s.f.thStep || 0;
  const lostToday = s => s.f.thLost === s.day;
  /* the riddle, then: where do you look? */
  function riddle(s, i) {
    const r = R[i];
    return [{ mini: 'thnote', i },
      { menu: r.o.map(o => ({ t: T('Look: ' + o.t.en.charAt(0).toLowerCase() + o.t.en.slice(1), '{دوّر|دوّري}: ' + o.t.ar), then: [st => look(st, i, o)] }))
        .concat([{ t: T('Not now', 'مو الحين'), then: [N1('You fold the note into your pocket. It will keep. It has kept for thirty-three years.', '{تطوي|تطوين} الورقة في جيبك. بتصبر. صبرت ثلاث وثلاثين سنة.')] }]) }];
  }
  function look(s, i, o) {
    const out = [];
    if (o.go) out.push({ go: o.go }, { show: [] });
    out.push({ n: o.find });
    if (o.ok) {
      s.f.thWrong = 0;
      if (i + 1 < R.length) { s.f.thStep = i + 2; out.push(...riddle(s, i + 1)); }
      else {
        s.f.thStep = 6; s.f.thDone = true; take('thnote'); give('thbox'); quest('q_hunt', 'done'); addMood(1);
        out.push(N1('Inside the tin: a crayon drawing of a big man and a small boy in a boat, both with enormous fish, both smiling with every tooth they have.', 'داخل العلبة: رسمة بالألوان لرجال كبير وولد صغير في قارب، الاثنين ماسكين سمك ضخم، والاثنين يبتسمون بكل سن عندهم.'),
          N1('And a note: "YOU FOUND IT!!! Now you have to take me fishing. Just us. A whole day. You PROMISED. Love, Thomas, 8."', 'وورقة: «لقيتها!!! الحين لازم تاخذني صيد. بس أنا وأنت. يوم كامل. أنت وعدت. أحبك، توماس، ٨ سنين.»'),
          N1('The date in the corner is from the summer Elias was out on the boat every day, from before dawn until dark.', 'التاريخ في الزاوية من الصيف اللي كان إلياس فيه يطلع بالقارب كل يوم، من قبل الفجر لين الظلام.'));
      }
    } else {
      s.f.thWrong = (s.f.thWrong || 0) + 1;
      if (s.f.thWrong >= 2) { s.f.thLost = s.day; s.f.thWrong = 0;
        out.push(N1('You unfold the note again. The pencil swims in front of your eyes. Every word could mean anywhere. You\'ve lost the thread. Tomorrow, with fresh eyes.', '{تفتح|تفتحين} الورقة مرة ثانية. الرصاص يسبح قدام عيونك. كل كلمة ممكن تعني أي مكان. {ضعت|ضعتي}. بكرة، بعيون جديدة.')); }
      else out.push(N1('Not here. You read the note again.', 'مو هنا. {تقرا|تقرين} الورقة مرة ثانية.'), ...riddle(s, i));
    }
    return out;
  }

  /* Elias's chapter over before the hunt was: the task and the notes leave quietly (his house is closed) */
  GAME.EVENTS.unshift({ id: 'huntTidy', when: s => { if (s && s.done && s.done.elias && s.quests && s.quests.q_hunt === 'active') { delete s.quests.q_hunt; if (has('thnote')) take('thnote', 99); } return false; } });
  const push = (loc, spot) => { if (GAME.LOC[loc]) GAME.LOC[loc].spots.push(spot); };
  /* the first note: in the desk drawer of the room you sleep in */
  push('your_room', { x: 40, y: 62, label: T('The desk drawer sticks', 'درج المكتب يعلق'), if: s => ch1(s) && s.day >= 2 && !step(s), run: s => {
    s.f.thStep = 1; give('thnote'); quest('q_hunt', 'active');
    return [N1('The drawer sticks, then gives all at once. Under the old lining paper, flat and yellow, a page torn from a school exercise book. A child\'s pencil, pressing hard.', 'الدرج يعلق، وبعدين ينفتح مرة وحدة. تحت ورق التبطين القديم، مسطحة وصفرا، ورقة مقطوعة من دفتر مدرسة. بخط رصاص طفل، ضاغط بقوة.')].concat(riddle(s, 0));
  } });
  /* reading the last note again */
  push('your_room', { x: 56, y: 70, label: T('Read Thomas\'s note again', '{اقرا|اقري} ورقة توماس مرة ثانية'), cls: 'main', if: s => ch1(s) && step(s) >= 1 && step(s) <= 5, run: s => lostToday(s)
    ? [N1('You look at it, and the words won\'t settle. Not today. Tomorrow.', '{تطالعها|تطالعينها}، والكلمات ما تثبت. مو اليوم. بكرة.')]
    : riddle(s, step(s) - 1) });

  /* Elias, and the tin */
  GAME.TOPICS.elias = GAME.TOPICS.elias || [];
  GAME.TOPICS.elias.push({ id: 'thbox', once: true, cls: 'main', label: T('Give him Thomas\'s tin', '{أعطه|أعطيه} علبة توماس'), if: s => has('thbox'), run: s => [
    { show: [{ id: 'elias', e: 'shock' }] },
    N1('He knows the tin before he opens it. His hands know it.', 'يعرف العلبة قبل لا يفتحها. يدينه تعرفها.'),
    E('shock', 'Where... the drawer? The drawer in his room?', 'من وين... الدرج؟ درج غرفته؟'),
    N1('He looks at the drawing for a long time. Then he reads the note, and his mouth moves on "You PROMISED".', 'يطالع الرسمة وقت طويل. وبعدين يقرا الورقة، وشفايفه تتحرك عند «أنت وعدت».'),
    E('sad', 'Every Sunday I hid things for him, and he found them. That one summer he hid them for me. I was on the boat every day. I never found the first one.', 'كل أحد كنت أخبي له أشياء، ويلقاها. وذاك الصيف بس، هو اللي خبا لي. وأنا كنت بالقارب كل يوم. وما لقيت ولا أول وحدة.'),
    E('sad', 'I never looked.', 'ما دوّرت أصلاً.'),
    E('neutral', 'He was eight. He\'s forty-one now. That\'s a long time to wait for a day\'s fishing.', 'كان عمره ثمان. الحين واحد وأربعين. هذا وقت طويل ينتظر فيه يوم صيد.'),
    N1('He puts the drawing on the mantelpiece, next to the clock, and straightens it twice.', 'يحط الرسمة على رف المدفأة، جنب الساعة، ويعدلها مرتين.'),
    st => { addMood(1); st.f.thGiven = true; return null; },
    { show: null }
  ] });
  /* the living room remembers */
  push('living', { x: 50, y: 30, label: T('A child\'s drawing on the mantelpiece', 'رسمة طفل على رف المدفأة'), if: s => !!s.f.thGiven, run: s => [N1('A big man and a small boy in a boat, both holding enormous fish. Elias has put it where he can see it from his chair.', 'رجال كبير وولد صغير في قارب، الاثنين ماسكين سمك ضخم. إلياس حطها في مكان يشوفها من كرسيه.')] });
})();
