/* =====================================================================
   Your own story: what your father never said.
   Your mother is the thread. She has been writing for weeks; you have
   not answered. Once a chapter your phone buzzes. Each time she has
   found something in Jonah's things that turns what you thought you
   knew upside down, and each time someone in Saltmere can tell you
   the rest.
     1. (Elias's house) Her messages. If you answer: an old photo.
        Two boys on a cemetery wall, "J. + V., 1989".
        → Gregor knows the wall. Elias knows the boys, and one more
          thing: who paid for Jonah's train ticket in 1991.
     2. (Leo's chapter) Bank statements. Money did not go out to "V."
        for twenty-five years. It came IN, from Saltmere Grand Holdings.
        → Frank gets the same letters, the other way round.
     3. (the next chapter) A letter Jonah wrote and never sent, folded
        inside his wallet: why he stood in the rain outside the hotel
        and never went in.
     4. Once you know who "V." is: you call her, and decide how much of
        it to tell her.
   Only its own flags. Nothing here reads or changes an ending, and it
   never sets the flags endings look at (calledMother stays the attic
   phone's).
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const say = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const MOM = T('Mum', 'أمي');
  Object.assign(GAME.ITEMS, {
    jphoto: { name: T('Photo: "J. + V., 1989"', 'صورة: «ج. + ف.، ١٩٨٩»'), desc: T('Two boys on a wall by a graveyard, too far away to see their faces.', 'ولدين على سور جنب مقبرة، بعيدين ما تبان وجيههم.') },
    jletter: { name: T('Dad\'s unsent letter', 'رسالة أبوك اللي ما انرسلت'), desc: T('Folded small enough to live in a wallet for years.', 'مطوية صغيرة لدرجة إنها عاشت في محفظة سنين.') }
  });
  GAME.QUESTS.q_jonah = { title: T('What Dad never said', 'اللي ما قاله أبوي'),
    hint: T('Mum keeps finding things in Dad\'s boxes. Show them to people who knew Saltmere in 1989.', 'أمي كل شوي تلقى شي في كراتين أبوي. {ورها|وريها} للي كانوا يعرفون سولتمير سنة ١٩٨٩.') };

  /* the photo, on screen: the cemetery wall in sepia, two tiny boys on it */
  GAME.MINI.photo = function (panel, done, st) {
    panel.innerHTML = '';
    const box = el('div', 'cp jn-photo-wrap');
    let bg = 'img/bg/cemetery.jpg'; try { bg = PEOPLE.IMG.bg.cemetery || bg; } catch (e) { /* default */ }
    box.innerHTML = `<div class="jn-photo"><div class="jn-pic" style="background-image:url('${bg}')"><i class="jn-boy a"></i><i class="jn-boy b"></i></div><p></p></div>`;
    box.querySelector('p').textContent = tx(T('J. + V. — Gregor\'s wall, 1989. "Out of here by 18!"', 'ج. + ف. — سور غريغور، ١٩٨٩. «برا هالبلد قبل الـ١٨!»'));
    $('stage').appendChild(box);
    const alt = el('button', 'opt main cp-alt', tx(T('Put it away', '{خبها|خبيها}'))); alt.type = 'button'; panel.appendChild(alt);
    let over = false; const fin = ev => { if (ev) ev.stopPropagation(); if (over) return; over = true; alt.remove(); box.classList.add('out'); setTimeout(() => box.remove(), 300); done(1); };
    setTimeout(() => box.addEventListener('click', fin), 500); alt.onclick = fin;
  };

  const texts = (msgs, sub) => ({ mini: 'texts', who: MOM, sub: sub || T('mobile', 'جوال'), msgs });
  const step = s => s.f.jm || 0;
  const busy = s => !s || RUN || s.f.prologue || s.f.ended && !s.host;
  const quiet = s => s.slot >= 3;   /* evenings and nights: when people write to you */

  /* ---------- 1. the first answer, and the photo ---------- */
  GAME.SCRIPTS.jonah1 = s => [
    N1('Your phone buzzes against your leg. Then again. You know who it is without looking. You look anyway.', 'جوالك يهتز على رجلك. ومرة ثانية. {تعرف|تعرفين} مين بدون ما {تطالع|تطالعين}. {وتطالع|وتطالعين} على كل حال.'),
    texts([
      { t: T('Are you eating?', '{تاكل|تاكلين}؟'), time: T('3 weeks ago', 'قبل ٣ أسابيع') },
      { t: T('I\'m not angry. I promise I\'m not angry.', 'أنا مو زعلانة. والله مو زعلانة.'), time: T('2 weeks ago', 'قبل أسبوعين') },
      { t: T('I should have told you about the house. I didn\'t know how. I still don\'t.', 'كان لازم أقول لك عن البيت. ما عرفت كيف. وللحين ما أعرف.'), time: T('last week', 'الأسبوع اللي فات') },
      { t: T('Just one word so I know you\'re alive.', 'بس كلمة وحدة عشان أعرف إنك {حي|حية}.'), time: T('today', 'اليوم') }
    ], T('47 unread', '٤٧ رسالة ما انقرت')),
    { menu: [
      { t: T('Answer her', '{رد|ردي} عليها'), cls: 'main', then: [
        st => { st.f.jm = 1; st.f.jmDay = st.day; quest('q_jonah', 'active'); give('jphoto'); return null; },
        texts([
          { t: T('Just one word so I know you\'re alive.', 'بس كلمة وحدة عشان أعرف إنك {حي|حية}.'), time: T('today', 'اليوم') },
          { me: true, type: true, drafts: [T('I\'m fine', 'أنا بخير'), T('Why didn\'t you tell me', 'ليش ما قلتي لي')], t: T('Alive. In Saltmere. Dad grew up here. Did you know?', '{حي|حية}. في سولتمير. أبوي تربى هنا. كنتي تدرين؟') },
          { t: T('...', '...'), wait: 2400 },
          { t: T('No. He never said that name. Not once in 26 years.', 'لا. عمره ما قال هالاسم. ولا مرة في ٢٦ سنة.') },
          { t: T('Wait. There\'s a box of his I never opened. Hold on.', 'لحظة. فيه كرتون حقه عمري ما فتحته. {انتظر|انتظري}.'), wait: 2600 },
          { t: T('[photo]', '[صورة]') },
          { t: T('Is this him? Who is the other boy?', 'هذا هو؟ ومين الولد الثاني؟') }
        ]),
        { mini: 'photo' },
        N1('Two boys on a stone wall by a graveyard, legs dangling, the sea behind them. Too far away to see their faces. On the back, in pencil: "J. + V. — Gregor\'s wall, 1989. Out of here by 18!"', 'ولدين على سور حجر جنب مقبرة، رجولهم معلقة، والبحر وراهم. بعيدين ما تبان وجيههم. وورا الصورة، بالرصاص: «ج. + ف. — سور غريغور، ١٩٨٩. برا هالبلد قبل الـ١٨!»'),
        N1('V. Same letter as the postcard.', 'ف. نفس الحرف اللي في الكرت.')] },
      { t: T('Turn it face down again', '{اقلبه|اقلبيه} على وجهه مرة ثانية'), then: [st => { st.f.jmLater = st.day; return null; }, N1('Forty-eight unread.', 'ثمان وأربعين ما انقرت.')] }
    ] }
  ];
  GAME.EVENTS.push({ id: 'jonah1', when: s => !busy(s) && step(s) === 0 && s.host && s.day >= 2 && quiet(s) && s.f.jmLater !== s.day && ['your_room', 'sami_attic', 'loft', 'lh_room', 'marg_guest', 'hotel_suite', 'living'].includes(s.loc), run: s => GAME.SCRIPTS.jonah1(s) });

  /* the photo, to people who were there */
  GAME.TOPICS.gregor = GAME.TOPICS.gregor || [];
  GAME.TOPICS.gregor.push({ id: 'jphoto', once: true, label: T('Show him the photo of the two boys', '{وره|وريه} صورة الولدين'), if: s => has('jphoto'), run: [
    say('gregor', 'smile', 'My wall! That\'s my wall, the bit by the yew. They sat there every evening for three summers and planned their great escape. Loudly.', 'سوري! هذا سوري، الجزء اللي جنب الشجرة. قعدوا عليه كل مغرب ثلاث صيوف يخططون هروبهم العظيم. وبصوت عالي.'),
    say('gregor', 'neutral', 'The skinny one with the ears is Victor. Number 3. The other one, I\'d know anywhere, he used to help me rake the paths for sweets. Jonah. Number 9.', 'النحيف أبو الأذان هو فيكتور. رقم ٣. والثاني أعرفه من أي مكان، كان يساعدني أكنس الممرات مقابل حلاو. جونا. رقم ٩.'),
    say('gregor', 'sad', 'Only one of them made it out by eighteen. You\'d think it was the one who got rich. It wasn\'t.', 'واحد بس منهم طلع قبل الـ١٨. {تحسب|تحسبين} إنه اللي صار غني. لا.'),
    s => { s.f.knowV = true; s.f.jGregor = true; quest('q_postcard', 'done'); return null; }
  ] });
  GAME.TOPICS.elias = GAME.TOPICS.elias || [];
  GAME.TOPICS.elias.push({ id: 'jticket', once: true, label: T('Ask how Jonah could afford to leave', '{تسأله|تسألينه} كيف جونا قدر يطلع'), if: s => has('jphoto') && (s.f.knowJonah || s.f.jGregor), run: [
    N1('Elias looks at the photo for a long time. Then he gets up and puts the kettle on, which is what he does instead of answering.', 'إلياس يطالع الصورة وقت طويل. وبعدين يقوم ويحط الغلاية، وهذا اللي يسويه بدال ما يجاوب.'),
    say('elias', 'neutral', 'Jonah\'s father drank the boat money. There was no ticket. There was no city. There was going to be gutting fish at number 9 until he died, like his father.', 'أبو جونا شرب فلوس القارب. ما كان فيه تذكرة. ولا مدينة. كان بيظل ينظف سمك في رقم ٩ لين يموت، مثل أبوه.'),
    say('elias', 'sad', 'Then one morning the outboard motor off the Gascoigne boat was gone. Victor\'s father\'s boat. Sold in the next town for the price of a train ticket and a month\'s rent.', 'وبعدين صباح من الأيام، مكينة القارب حق عيلة غاسكوين اختفت. قارب أبو فيكتور. انباعت في البلد اللي جنبنا بسعر تذكرة قطار وإيجار شهر.'),
    say('elias', 'sad', 'Victor took the beating for it. A bad one. He never said where the money went. I only know because I saw him put an envelope in Jonah\'s coat at the station, and walk away before the train came.', 'فيكتور أكل الضرب عليها. ضرب شين. وعمره ما قال وين راحت الفلوس. وأنا ما أعرف إلا لأني شفته يحط ظرف في كوت جونا في المحطة، ويمشي قبل لا يجي القطار.'),
    say('elias', 'neutral', 'He was seventeen. He stayed so your father could go.', 'كان عمره سبعطعش. قعد عشان أبوك يقدر يروح.'),
    s => { s.f.jTicket = true; addMood(-1); return null; }
  ] });

  /* ---------- 2. the bank statements ---------- */
  GAME.SCRIPTS.jonah2 = s => [
    N1('Your phone. Mum again. She writes in bursts now, like someone who has been holding her breath.', 'جوالك. أمي مرة ثانية. صارت تكتب دفعات، مثل أحد كان حابس نفسه.'),
    texts([
      { t: T('I went through his bank papers. All of them. I couldn\'t sleep.', 'فتشت أوراق البنك حقته. كلها. ما قدرت أنام.') },
      { t: T('I always thought he was paying someone back. Every month, the money just disappeared.', 'كنت دايم أحسبه يسدد لأحد. كل شهر، الفلوس تختفي.') },
      { t: T('It wasn\'t going OUT.', 'ما كانت تطلع.'), wait: 1800 },
      { t: T('It was coming IN. Every time we were short. 25 years. From something called Saltmere Grand Holdings.', 'كانت تدخل. كل مرة كنا ناقصين. ٢٥ سنة. من شي اسمه سولتمير غراند القابضة.') },
      { t: T('Your school trip. The roof. My operation. It\'s all there. Who ARE these people?', 'رحلة مدرستك. السقف. عمليتي. كلها هنا. مين هالناس؟') }
    ]),
    { menu: [
      { t: T('"The man who owns the hotel. Dad\'s best friend."', '«الرجال اللي يملك الفندق. أعز صديق لأبوي.»'), hide: s2 => !(s2.f.knowV || s2.f.jGregor), then: [texts([{ me: true, t: T('The man who owns the hotel here. He was Dad\'s best friend.', 'الرجال اللي يملك الفندق هنا. كان أعز صديق لأبوي.') }, { t: T('Then why did his company take our house?', 'أجل ليش شركته أخذت بيتنا؟'), wait: 2000 }])] },
      { t: T('"I don\'t know yet. I\'ll find out."', '«ما أدري للحين. بعرف.»'), then: [texts([{ me: true, t: T('I don\'t know yet. I\'m going to find out.', 'ما أدري للحين. بعرف.') }, { t: T('Be careful. People who give you money for 25 years want something.', '{انتبه|انتبهي}. اللي يعطيك فلوس ٢٥ سنة يبي شي.') }])] }
    ] },
    N1('So it was never one debt. It was twenty-five years of somebody quietly catching your family every time it fell. And then, the moment Dad died, the same hand closing.', 'يعني ما كان دين واحد. كان خمسة وعشرين سنة أحد يلقف عيلتكم بهدوء كل ما طاحت. وبعدين، لحظة ما مات أبوك، نفس اليد تتسكر.'),
    s2 => { s2.f.jm = 2; s2.f.jmDay = s2.day; return null; }
  ];
  GAME.EVENTS.push({ id: 'jonah2', when: s => !busy(s) && step(s) === 1 && s.ch >= 2 && s.day > (s.f.jmDay || 0) && quiet(s) && s.host, run: s => GAME.SCRIPTS.jonah2(s) });
  GAME.TOPICS.frank = GAME.TOPICS.frank || [];
  GAME.TOPICS.frank.push({ id: 'jsgh', once: true, label: T('Ask about Saltmere Grand Holdings', '{تسأله|تسألينه} عن سولتمير غراند القابضة'), if: s => step(s) >= 2 && !!s.f.metFrank, run: [
    say('frank', 'neutral', 'Grand Holdings? They own my loan. Polite letters. Every month.', 'غراند القابضة؟ هم يملكون قرضي. رسايل مؤدبة. كل شهر.'),
    N1('You tell him about your father\'s statements. Money coming in, for twenty-five years, from the same name.', '{تقول له|تقولين له} عن كشوفات أبوك. فلوس تدخل، خمسة وعشرين سنة، من نفس الاسم.'),
    say('frank', 'shock', 'In? From Victor? ...Victor doesn\'t give anybody anything. Victor buys things.', 'تدخل؟ من فيكتور؟ ...فيكتور ما يعطي أحد شي. فيكتور يشتري.'),
    say('frank', 'sad', 'Unless it wasn\'t buying. Unless it was the one thing he never had to pay for. Huh. Maybe he had a friend once, then.', 'إلا إذا ما كان شراء. إلا إذا كان الشي الوحيد اللي عمره ما دفع فيه. همم. يمكن كان عنده صديق مرة، أجل.')
  ] });

  /* ---------- 3. the letter in the wallet ---------- */
  GAME.SCRIPTS.jonah3 = s => [
    N1('A parcel is waiting for you, sent care of Sami\'s shop. Your mother\'s handwriting on the label, very careful. Inside: your father\'s old wallet, and a note.', 'فيه طرد ينتظرك، مرسول على عنوان بقالة سامي. خط أمك على الورقة، مرتب مرة. داخله: محفظة أبوك القديمة، وورقة.'),
    N1('"This was in his wallet behind his driving licence. It\'s not to me. I think it\'s to the man who owns that hotel. I think you should read it first. — Mum"', '«هذي كانت في محفظته ورا الرخصة. مو لي. أحسها للرجال اللي يملك ذاك الفندق. أحس لازم {تقراها أنت|تقرينها أنتِ} أول. — أمك»'),
    st => { give('jletter'); st.f.jm = 3; st.f.jmDay = st.day; return null; },
    { mini: 'paper', kind: 'letter', body: T('V.,\nI stood across from your hotel today for an hour. You did it. You actually did it. I wanted to come in and say so, and I couldn\'t.\nBecause if I walk into that lobby I have to say it out loud: that the boy who was going to get out was you. That you sold your dad\'s engine and took the beating and put me on the train, and I let you. And then I wrote to you for money every time I failed, for twenty-five years, and you never once said no, and I never once said thank you.\nI\'m going to pay you back. Every cent. Then I\'ll come in.\nJ.', 'ف.،\nوقفت قدام فندقك اليوم ساعة. سويتها. سويتها صدق. كنت أبي أدخل وأقولها لك، وما قدرت.\nلأني لو دخلت ذاك اللوبي لازم أقولها بصوت عالي: إن الولد اللي كان بيطلع هو أنت. إنك بعت مكينة أبوك وأكلت الضرب وركبتني القطار، وأنا خليتك. وبعدين كتبت لك أطلب فلوس كل ما فشلت، خمسة وعشرين سنة، وأنت ولا مرة قلت لا، وأنا ولا مرة قلت شكراً.\nبرجّع لك. كل سنت. وبعدين بدخل.\nج.') },
    N1('He never came in. He never paid it back. And the man upstairs read his name on a file and signed anyway.', 'ما دخل أبد. وما رجّع شي. والرجال اللي فوق قرا اسمه على ملف ووقّع على كل حال.'),
    N1('You fold it small again, the way he kept it.', '{تطويها|تطوينها} صغيرة مرة ثانية، مثل ما كان يحفظها.')
  ];
  GAME.EVENTS.push({ id: 'jonah3', when: s => !busy(s) && step(s) === 2 && s.ch >= 3 && s.day > (s.f.jmDay || 0) && s.loc === 'grocery' && s.slot < 4, run: s => GAME.SCRIPTS.jonah3(s) });
  /* Sami hints, so you know to come by */
  if (GAME.CHAR.sami) { GAME.CHAR.sami.chat = GAME.CHAR.sami.chat || []; GAME.CHAR.sami.chat.unshift({ if: s => step(s) === 2 && s.ch >= 3, e: 'neutral', t: T('There\'s a parcel here for you. City postmark. Your mum writes very neatly.', 'فيه طرد لك هنا. ختم المدينة. أمك خطها مرتب مرة.') }); }
  /* Victor, if you put the letter in front of him */
  GAME.TOPICS.victor = GAME.TOPICS.victor || [];
  GAME.TOPICS.victor.push({ id: 'jletter', once: true, label: T('Give him your father\'s letter', '{أعطه|أعطيه} رسالة أبوك'), if: s => has('jletter') && (GAME.H && GAME.H.victor ? GAME.H.victor.inV(s) : s.host === 'victor'), run: [
    N1('Victor reads it standing at the window, the same window. He reads it twice. Halfway through the second time he takes his glasses off and doesn\'t put them back on.', 'فيكتور يقراها وهو واقف عند الشباك، نفس الشباك. يقراها مرتين. وبنص المرة الثانية يشيل نظارته وما يرجعها.'),
    say('victor', 'sad', '"And I never once said thank you." He never had to. That was the point. That was the whole point.', '«وأنا ولا مرة قلت شكراً.» عمره ما احتاج. هذا كان القصد. هذا كان كل القصد.'),
    say('victor', 'angry', 'I signed the file because I was angry. Twenty-five years and he never came in. I thought he was ashamed of me. Of what I\'d become.', 'وقعت الملف لأني كنت معصب. خمسة وعشرين سنة وعمره ما دخل. حسبته مستحي مني. من اللي صرت عليه.'),
    say('victor', 'sad', 'He was ashamed of himself. For me. Idiot. Both of us. Idiots.', 'كان مستحي من نفسه. عشاني. غبي. الاثنين. أغبياء.'),
    s => { take('jletter'); s.f.jLetterV = true; return null; }
  ] });

  /* ---------- 4. the call ---------- */
  GAME.SCRIPTS.jonah4 = s => [
    N1('You call her. It rings once.', '{تتصل|تتصلين} عليها. يرن مرة وحدة.'),
    N1('"...Hi." Her voice is smaller than you remember. "You called."', '«...هلا.» صوتها أصغر مما {تتذكر|تتذكرين}. «{اتصلت|اتصلتي}.»'),
    N1('She waits. She has learned to wait.', 'تنتظر. تعلمت تنتظر.'),
    { menu: [
      { t: T('Tell her everything. The wall, the engine, the money, the file.', '{قل|قولي} لها كل شي. السور، والمكينة، والفلوس، والملف.'), then: [
        N1('It takes an hour. She stops you only once, at the engine. "He never told me," she says. "He let me think he did it all himself." Then: "That\'s so like him I could scream."', 'ياخذ ساعة. توقفك مرة وحدة بس، عند المكينة. «عمره ما قال لي،» تقول. «خلاني أحسب إنه سواها كلها بنفسه.» وبعدين: «هذا يشبهه لدرجة أبي أصارخ.»'),
        N1('"I\'m not angry at him," she says at the end, surprised. "I\'m angry I never got to meet the other boy."', '«مو زعلانة منه،» تقول في الأخير، متفاجئة. «زعلانة إني ما قابلت الولد الثاني أبد.»'),
        st => { st.f.jCall = 'all'; addMood(2); return null; }] },
      { t: T('Tell her about Dad as a boy. Leave out the hotel.', '{قل|قولي} لها عن أبوي وهو صغير. {وخل|وخلي} الفندق.'), then: [
        N1('You tell her about number 9, and the nets, and a boy with clumsy hands who came down every morning before school. She laughs for the first time in a month. You keep the rest. Some of it is yours to carry.', '{تقول|تقولين} لها عن رقم ٩، والشباك، وولد يدينه ثقيلة ينزل كل صبح قبل المدرسة. تضحك لأول مرة من شهر. {وتخلي|وتخلين} الباقي. بعضه حقك {أنت تشيله|أنتِ تشيلينه}.'),
        st => { st.f.jCall = 'boy'; addMood(1); return null; }] },
      { t: T('Ask her about him instead. What was he like, at home?', '{اسألها|اسأليها} عنه هي. كيف كان في البيت؟'), then: [
        N1('She tells you about the pancakes he burned every Sunday, on purpose, "so you\'d appreciate the good ones". About the night he drove four hours because you had a fever. You realise she has been waiting a month for someone to ask.', 'تحكي لك عن البانكيك اللي كان يحرقه كل أحد، بقصد، «عشان تقدّر الزينة». وعن الليلة اللي ساق فيها أربع ساعات لأن عندك حرارة. {وتنتبه|وتنتبهين} إنها كانت تنتظر شهر أحد يسألها.'),
        st => { st.f.jCall = 'her'; addMood(2); return null; }] }
    ] },
    N1('Before she hangs up: "Come home when you\'re ready. Not before. I\'ll be here." This time you believe her.', 'قبل لا تسكّر: «{تعال|تعالي} البيت لما تكون {جاهز|جاهزة}. مو قبل. أنا هنا.» وهالمرة {تصدقها|تصدقينها}.'),
    st => { st.f.jm = 4; quest('q_jonah', 'done'); return null; }
  ];
  const callSpot = { x: 50, y: 50, label: T('Call Mum', '{اتصل|اتصلي} على أمي'), cls: 'main', if: s => step(s) >= 1 && step(s) < 4 && !!(s.f.vJonah || s.f.jLetterV || (s.f.jTicket && step(s) >= 2)) && s.slot >= 3, run: s => GAME.SCRIPTS.jonah4(s) };
  ['your_room', 'sami_attic', 'loft', 'lh_room', 'marg_guest', 'hotel_suite'].forEach(l => { if (GAME.LOC[l]) GAME.LOC[l].spots.push(Object.assign({}, callSpot)); });

  /* people notice */
  const chat = (who, line) => { const c = GAME.CHAR[who]; if (c) { c.chat = c.chat || []; c.chat.unshift(line); } };
  chat('elias', { if: s => !!s.f.jTicket, e: 'neutral', t: T('Victor came past on the harbour this morning. Looked at the Ada for a long time. First time in thirty years he\'s looked at anything down here that wasn\'t for sale.', 'فيكتور مر من الميناء الصبح. طالع «آدا» وقت طويل. أول مرة من ثلاثين سنة يطالع شي هنا مو للبيع.') });
  chat('gregor', { if: s => !!s.f.jGregor, e: 'smile', t: T('I scrubbed their initials off that wall in 1992. Somebody painted them back in 1993. Never found out who. I\'ve a good guess.', 'مسحت حروفهم من السور سنة ٩٢. وأحد رجع رسمها سنة ٩٣. وعمري ما عرفت مين. بس عندي فكرة.') });
  chat('marco', { if: s => !!s.f.jCall, e: 'smile', t: T('You look lighter. Like someone took a rock out of your coat. Coffee\'s on me.', 'شكلك أخف. كأن أحد طلّع حجر من كوتك. القهوة علي.') });
})();
