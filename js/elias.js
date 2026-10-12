/* =====================================================================
   Chapter 1 — Elias
   Prologue, Elias's house, his topics, events and five endings.
   ===================================================================== */
'use strict';
const E = (e, en, ar) => ({ c: 'elias', e, t: T(en, ar) });
const N_ = (en, ar) => ({ n: T(en, ar) });
const pickOne = a => a[Math.floor(Math.random() * a.length)];
const NEXT_DOORS = T('Chapter 1 complete. Next door: Leo\'s boathouse on the harbor.', 'خلص الفصل الأول. الباب الجاي: بيت القوارب حق ليو في الميناء.');

GAME.END = {
  ELIAS_STAY: { who: 'elias', title: T('He stays', 'يضل معك'), after: NEXT_DOORS, next: 'ch2start' },
  ELIAS_LETTER: { who: 'elias', title: T('He dies, after writing', 'يموت، بعد ما كتب'), after: NEXT_DOORS, next: 'ch2start' },
  ELIAS_PEACE: { who: 'elias', title: T('He dies quietly', 'يموت بهدوء'), after: NEXT_DOORS, next: 'ch2start' },
  ELIAS_KICK: { who: 'elias', title: T('He throws you out', 'يطردك'), after: NEXT_DOORS, next: 'ch2start' },
  ELIAS_GO: { who: 'elias', title: T('He sends you home', 'يرجّعك لحياتك'), after: NEXT_DOORS, next: 'ch2start' }
};

/* ---------------- scripts ---------------- */
GAME.SCRIPTS = {
  intro: [
    { go: 'station' },
    N_('The last train. The line ends here.', 'آخر قطار. الخط ينتهي هنا.'),
    /* why you are here (docs/STORY.md §2) */
    N_('A month ago you came home from a trip and your key didn\'t fit the door. A family you\'d never seen was eating dinner in your kitchen.', 'قبل شهر رجعت من سفرة، والمفتاح ما ركب في الباب. عايلة عمرك ما شفتها كانت تتعشى في مطبخكم.'),
    N_('Your things were in boxes by the gate. Your mother had sold the house to pay debts your father hid until the day he died. She hadn\'t found the words to tell you.', 'أغراضك كانت في كراتين عند البوابة. أمك باعت البيت عشان تسدد ديون خبّاها أبوك لين يوم مات. وما لقت الكلام اللي تقوله لك.'),
    N_('In one of the boxes, a postcard of a harbor you\'d never seen. SALTMERE. Your father\'s handwriting: "V. — I saw the hotel today. You did it, like you always said you would. I\'ll pay you back, every cent. I\'m sorry. — J." Dated 7 March. Never posted.', 'في واحد من الكراتين، كرت بريدي لميناء عمرك ما شفته. سولتمير. بخط أبوك: «ف. — شفت الفندق اليوم. سويتها مثل ما كنت تقول دايم. برجّع لك كل شي، كل سنت. آسف. — ج.» مكتوب عليه ٧ مارس. وما انرسل.'),
    N_('Your father never once said the word Saltmere. So you got on the last train, to find out who "V." was.', 'أبوك عمره ما قال كلمة سولتمير. فركبت آخر قطار، عشان تعرف مين «ف.».'),
    N_('One bag. Three dollars. A phone you keep face down.', 'شنطة وحدة. ثلاث دولارات. وجوال تقلبه على وجهه.'),
    s => { give('postcard'); return null; },
    { go: 'motel' },
    N_('Harbor Motel, room 6. You paid for three weeks. That was three weeks ago.', 'موتيل الميناء، غرفة ٦. دفعت ثلاث أسابيع. وهذا كان قبل ثلاث أسابيع.'),
    N_('Three weeks, and you haven\'t asked anyone a single question. The postcard stays in your pocket. Some days you don\'t leave the room.', 'ثلاث أسابيع، وما سألت أحد ولا سؤال. الكرت باقي في جيبك. وفيه أيام ما تطلع من الغرفة أبداً.'),
    N_('A note on the door: "Checkout tomorrow, noon. No exceptions."', 'ورقة على الباب: «الخروج بكرة الظهر. بدون استثناء.»'),
    s => { quest('q_bed', 'active'); quest('q_postcard', 'active'); return null; }
  ],
  meet: [
    N_('You walk until the street runs out of light, and sit on the bench across from a small grocery.', 'تمشي لين ينتهي الضو في الشارع، وتجلس على كرسي قدام بقالة صغيرة.'),
    { c: 'sami', e: 'neutral', t: T('We\'re closed, friend.', 'مسكّرين يا صديقي.') },
    { c: 'sami', e: 'sad', t: T('...Here. Water. On the house. You look like you need it more than the shelf does.', '...خذ. ماي. على حسابي. شكلك محتاجه أكثر من الرف.') },
    s => { give('water'); s.met.sami = true; return null; },
    { show: [] },
    N_('The shutter comes down. A minute later, an old man in a knit cap walks up from the harbor with a paper bag of bread, and sits at the other end of your bench.', 'الباب ينقفل. بعد دقيقة، رجل عجوز بطاقية صوف يطلع من جهة الميناء، معه كيس خبز ورق، ويجلس على طرف الكرسي الثاني.'),
    { show: [{ id: 'elias' }] },
    N_('He tears a loaf in two and holds out half. He doesn\'t ask.', 'يقسم خبزة نصين ويمد لك النص. ما يسأل.'),
    { c: 'elias', e: 'neutral', q: null, menu: [
      { t: T('Take it', 'تاخذها'), fx: s => { addMood(1); }, then: [] },
      { t: T('"I\'m fine."', '«أنا بخير.»'), then: [N_('He sets it on the bench between you and keeps eating. After a while, you pick it up. He doesn\'t say anything.', 'يحطها على الكرسي بينكم ويكمل أكل. بعد شوي، تاخذها. هو ما يعلق.')] }
    ] },
    E('neutral', 'When did you last eat?', 'متى آخر مرة أكلت؟'),
    N_('"A while ago."', '«من زمان.»'),
    E('neutral', 'Got somewhere to sleep?', 'عندك مكان تنام فيه؟'),
    N_('You think of the note on the motel door.', 'تتذكر الورقة على باب الموتيل.'),
    E('sad', 'My house has a room nobody\'s slept in for years. It\'s yours for tonight. Decide about tomorrow tomorrow.', 'بيتي فيه غرفة ما نام فيها أحد من سنين. لك الليلة. وبكرة قرر عن بكرة.'),
    { c: 'elias', e: 'neutral', menu: [
      { t: T('Go with him', 'تروح معه'), then: [] },
      { t: T('"Why would you do that?"', '«ليش تسوي كذا؟»'), then: [E('sad', 'Because I know that look. I see it in the mirror.', 'لأني أعرف هالنظرة. أشوفها بالمراية.')] }
    ] },
    { go: 'living' },
    N_('A stone cottage at the end of Fisher\'s Row. It smells of salt, old wood and tea.', 'بيت حجر في آخر شارع الصيادين. ريحته ملح، وخشب قديم، وشاي.'),
    { go: 'your_room' },
    E('neutral', 'My son\'s room. Thomas. He lives in the city.', 'غرفة ولدي. توماس. ساكن في المدينة.'),
    E('neutral', 'House rules. Tea at six. And knock before you open a closed door. That\'s all.', 'قوانين البيت: الشاي الساعة ست. وتطق قبل ما تفتح باب مسكّر. بس.'),
    s => { s.f.prologue = false; s.f.metElias = true; s.met.elias = true; s.trust.elias = 0; quest('q_bed', 'done'); quest('q_money', 'active'); return null; },
    { show: [] },
    N_('He leaves. The bed is made, as if it\'s been waiting for someone. You can sleep here.', 'يطلع. السرير مرتب، كأنه ينتظر أحد. تقدر تنام هنا.')
  ],

  wake1: [
    N_('A knock, before dawn.', 'طق على الباب، قبل الفجر.'),
    E('neutral', 'Boat leaves in ten minutes. Coming?', 'القارب يطلع بعد عشر دقايق. جاي؟'),
    { menu: [
      { t: T('Get up', 'تقوم'), fx: s => addMood(1), then: [{ go: 'harbor' }, { jump: 'fishing' }] },
      { t: T('Pull the blanket over your head', 'تتغطى'), then: [N_('He waits a moment. Then the front door closes, softly.', 'ينتظر لحظة. وبعدين باب البيت يتسكر، بهدوء.'), s => { quest('q_dawn', 'active'); return null; }] }
    ] }
  ],
  fishing: s => {
    const first = !s.f.fished;
    s.f.fished = (s.f.fished || 0) + 1; onceToday('fish');
    addTrust('elias', first ? 2 : ((s.f.fished <= 3) ? 1 : 0)); addMood(1); give('fish'); quest('q_dawn', 'done');
    const steps = first ? [
      N_('Grey water, cold hands. Elias barely talks. He shows you once how to coil the line, then lets you get it wrong.', 'موج رمادي، وأيدين باردة. إلياس بالكاد يتكلم. يوريك مرة وحدة كيف تلف الخيط، وبعدين يخليك تغلط.'),
      N_('You catch nothing. He catches four. He gives you one anyway.', 'ما تصيد شي. هو يصيد أربع. ويعطيك وحدة على كل حال.'),
      E('smile', 'Beginner\'s share.', 'نصيب المبتدئ.'),
      E('neutral', 'Afternoons, I mend the nets out back. If you\'ve nothing better to do.', 'وقت الظهر أصلّح الشباك ورا البيت. إذا ما عندك شي أحسن.'),
      E('neutral', 'And evenings, I lose at chess to Marco. Well. He loses to me.', 'والمغرب ألعب شطرنج مع ماركو. يعني، هو يخسر قدامي.'),
      st => { quest('q_nets', 'active'); quest('q_chess', 'active'); return null; }
    ] : [pickOne([
      N_('The sea is flat as a plate. Elias hums something under his breath. Neither of you needs to talk.', 'البحر مسطح مثل الصحن. إلياس يدندن شي بصوت واطي. ولا واحد فيكم يحتاج يتكلم.'),
      N_('A gull steals your bait twice. Elias laughs so hard he has to sit down. You laugh too, and it surprises you.', 'نورس يسرق طُعمك مرتين. إلياس يضحك لين يجلس. وأنت تضحك معه، وتستغرب من نفسك.'),
      N_('He lets you steer on the way back. "Left. My left. Your other left."', 'يخليك تسوق القارب وأنتم راجعين. «يسار. يساري أنا. يسارك الثاني.»')
    ])];
    steps.push({ time: 1 });
    return steps;
  },
  nets: s => {
    s.f.netsCount = (s.f.netsCount || 0) + 1; onceToday('nets');
    const first = s.f.netsCount === 1;
    addTrust('elias', s.f.netsCount <= 2 ? 1 : 0); addMood(1); quest('q_nets', 'done'); s.f.netsLearned = true;
    return (first ? [
      N_('He teaches you the knot. Over, under, through, pull. Your fingers are stupid at first.', 'يعلّمك العقدة. فوق، تحت، من خلال، اسحب. أصابعك غبية بالبداية.'),
      E('neutral', 'Hands that work don\'t have time to think. That\'s the whole trick.', 'الأيدين اللي تشتغل ما عندها وقت تفكر. هذي كل الحيلة.'),
      N_('By the end of the afternoon you\'ve mended one hole. He checks it, grunts, and doesn\'t redo it. That\'s a compliment.', 'لين آخر الظهر صلّحت فتحة وحدة. يفحصها، ويهمهم، وما يعيدها. وهذا مدح.')
    ] : [pickOne([
      N_('You work side by side. The radio from the house drifts out. He sings the wrong words on purpose to see if you\'ll correct him.', 'تشتغلون جنب بعض. صوت الراديو من البيت يوصل. يغني الكلمات غلط بقصد، يشوف هل بتصححه.'),
      N_('He stops halfway through a knot and stares at his hands for a long moment. Then he carries on, like nothing happened.', 'يوقف بنص عقدة ويطالع يدينه وقت طويل. وبعدين يكمل، كأن ما صار شي.'),
      N_('"Thomas never had the patience for this," he says, to the net, not to you.', '«توماس ما كان عنده صبر على هذا،» يقولها للشبكة، مو لك.')
    ])]).concat([{ time: 1 }]);
  },
  chess: s => {
    s.f.chessCount = (s.f.chessCount || 0) + 1; onceToday('chess'); quest('q_chess', 'done');
    if (s.f.chessCount === 1) { addTrust('elias', 1); return [
      N_('Marco brings the board and stays to watch, narrating like a sports commentator. Elias beats you in twelve moves.', 'ماركو يجيب اللوحة ويوقف يتفرج، ويعلق كأنه معلق مباراة. إلياس يغلبك في اثنعش نقلة.'),
      E('smile', 'Thomas taught me this game. He was nine. He cheated.', 'توماس علّمني هاللعبة. كان عمره تسع. وكان يغش.'),
      E('neutral', 'I let him.', 'وكنت أخليه.'),
      { time: 1 }
    ]; }
    s.f.forgot = true; quest('q_secret', 'active');
    return [
      N_('Halfway through, Elias forgets whose turn it is. Then he forgets which colour he is.', 'بنص اللعبة، إلياس ينسى دور مين. وبعدين ينسى أي لون هو.'),
      { c: 'marco', e: 'sad', t: T('Your move, Elias.', 'دورك يا إلياس.') },
      E('smile', 'I know, I know. Just testing you both.', 'أدري، أدري. بس أختبركم.'),
      N_('Marco catches your eye over the board. Neither of you laughs.', 'ماركو يطالعك من فوق اللوحة. ولا واحد فيكم يضحك.'),
      { time: 1 }
    ];
  },
  bed: s => {
    if (s.slot === NIGHT) { sleepToMorning(); return [N_('You sleep. For once, it\'s actual sleep.', 'تنام. ولأول مرة من زمان، نوم حقيقي.')]; }
    advance(1);
    return [N_(s.mood <= 3 ? 'You lie down and stare at the ceiling. The light moves across it. Time passes without asking you.' : 'You lie down for a bit. The house creaks around you, the way old houses do.', s.mood <= 3 ? 'تتمدد وتطالع السقف. الضو يمشي عليه. والوقت يمر بدون ما يستأذنك.' : 'تتمدد شوي. البيت يطقطق حولك، مثل كل البيوت القديمة.')];
  },

  /* ----- snooping ----- */
  caught: s => {
    addSusp('elias', 1); addTrust('elias', -1);
    const n = s.susp.elias || 0;
    if (n >= 3) return [{ jump: 'endKickSnoop' }];
    if (s.f.caughtBy === 'martha') { s.f.caughtBy = null; return [{ c: 'martha', e: 'angry', t: T('I\'ll be telling him. Don\'t think I won\'t.', 'بقول له. لا تحسب إني ما راح أقول.') }, { go: 'living' }, { show: [] }, N_(n === 1 ? 'That evening Elias says nothing about it. He just looks at you a beat too long.' : 'Elias has heard. "Martha says you\'re in my things. Again. Once more and you\'re out."', n === 1 ? 'ذاك المساء إلياس ما يقول شي. بس يطالعك أطول من العادة.' : 'إلياس سمع. «مارثا تقول إنك في أغراضي. مرة ثانية. مرة ثالثة وتطلع.»')]; }
    s.f.caughtBy = null;
    if (n === 1) return [E('angry', 'That\'s my room. In this house, closed doors stay closed.', 'هذي غرفتي. في هالبيت، الأبواب المسكّرة تبقى مسكّرة.'), N_('He waits until you leave.', 'ينتظر لين تطلع.'), { go: 'living' }];
    return [E('angry', 'Twice. I gave you a bed, and you go through my things?', 'مرتين. عطيتك سرير، وأنت تفتش أغراضي؟'), E('angry', 'Once more, and you\'re out. I mean it.', 'مرة ثانية، وتطلع. وأنا أقصدها.'), { go: 'living' }];
  },
  enterPrivate: s => {
    const r = GAME.SCRIPTS.riskOf(s);
    if (roll(r.p)) return [N_('The floorboard by the door creaks. Someone is behind you.', 'خشبة الأرض عند الباب تطق. أحد وراك.')].concat(GAME.SCRIPTS.caughtBy(r.who));
    if (!s.f.enteredBed) { s.f.enteredBed = true; return [N_('His room. Neat in the way of someone who has nobody to be neat for.', 'غرفته. مرتبة بطريقة واحد ما عنده أحد يرتب له.')]; }
    return null;
  },
  drawer: s => {
    const r = GAME.SCRIPTS.riskOf(s, 0.1);
    if (roll(r.p)) return [N_('The drawer sticks, then bangs. Footsteps in the hall.', 'الدرج يعلق، وبعدين ينفتح بقوة. خطوات في الممر.')].concat(GAME.SCRIPTS.caughtBy(r.who));
    s.f.letters = true; s.f.knowsSon = true; s.f.knowsIllness = true; quest('q_secret', 'done'); quest('q_thomas', 'active');
    return [
      N_('Letters. Dozens. All addressed to Thomas. None of them sent.', 'رسايل. عشرات. كلها لتوماس. ولا وحدة انرسلت.'),
      N_('The oldest is eight years old: "Thomas. I\'m sorry about what I said. I\'m not sorry. I don\'t know."', 'أقدمها عمرها ثمان سنين: «توماس. آسف على اللي قلته. مو آسف. ما أدري.»'),
      N_('Under them, a letter from a city hospital: "Chronic kidney disease, stage five. Dialysis strongly recommended. Patient declined."', 'وتحتها خطاب من مستشفى بالمدينة: «فشل كلوي مزمن، المرحلة الخامسة. ننصح بشدة بالغسيل. المريض رفض.»'),
      N_('You put everything back exactly as it was. Your hands are shaking.', 'ترجع كل شي مثل ما كان بالضبط. يدينك ترجف.')
    ];
  },
  cupboard: s => {
    if (s.f.meds) return [N_('The pill boxes. Still untouched.', 'علب الدواء. لسا ما انلمست.')];
    const r = GAME.SCRIPTS.riskOf(s, -0.15);
    if (roll(r.p)) return [N_('A voice behind you: "Looking for something?"', 'صوت من وراك: «تدور شي؟»')].concat(GAME.SCRIPTS.caughtBy(r.who));
    s.f.meds = true; quest('q_secret', 'active');
    return [N_('Behind the tea: pill boxes, a lot of them, with long names. A schedule in shaky handwriting. Half the boxes have never been opened.', 'ورا الشاي: علب دوا كثيرة، أسماءها طويلة. وجدول مكتوب بخط يرجف. نص العلب ما انفتحت أبداً.')];
  },
  phoneSpot: s => {
    if (s.slot !== NIGHT || !s.f.knowsSon || s.f.sentSneak) return [N_('An old landline. A number is taped next to it: "T." The tape is yellow with age.', 'هاتف أرضي قديم. جنبه رقم ملصوق: «T.» الشريط صاير أصفر من القدم.')];
    return [
      N_('Elias is asleep in his armchair. The number taped by the phone: "T." You could call. Or you could leave a message, in his name.', 'إلياس نايم على كرسيه. الرقم الملصوق جنب الهاتف: «T.» تقدر تتصل. أو تترك رسالة، باسمه.'),
      { menu: [
        { t: T('Leave Thomas a message behind his back', 'تترك لتوماس رسالة من وراه'), cls: 'risk', then: [s2 => roll(0.45) ? [N_('Halfway through your message, the armchair creaks.', 'بنص رسالتك، الكرسي يطقطق.'), { show: [{ id: 'elias', e: 'angry' }] }, { jump: 'endKickSneak' }] : [N_('You whisper: "Thomas, your father is sick. He won\'t tell you. Please come." You hang up. Elias snores on.', 'تهمس: «توماس، أبوك مريض. ما راح يقول لك. تكفى تعال.» وتسكّر. إلياس يكمل نومه.'), st => { st.f.sentSneak = true; st.conscience = (st.conscience || 0) - 1; return null; }]] },
        { t: T('Leave it', 'تتركه'), then: [] }
      ] }
    ];
  },

  /* ----- events ----- */
  fall: where => [
    where === 'harbor' ? N_('Elias reaches for the mooring rope, misses it, and goes down hard on the deck.', 'إلياس يمد يده للحبل، يغلط، ويطيح بقوة على سطح القارب.') : N_('A crash from the kitchen. Elias is on the floor by the kettle, grey in the face.', 'صوت طيحة من المطبخ. إلياس على الأرض جنب الغلاية، وجهه رمادي.'),
    { show: [{ id: 'elias', e: 'sad' }] },
    E('sad', 'I\'m fine. I\'m fine. No hospital.', 'أنا بخير. بخير. بدون مستشفى.'),
    { menu: [
      { t: T('Call an ambulance anyway', 'تتصل بالإسعاف على كل حال'), then: [
        s => { s.f.ambulance = true; s.f.knowsIllness = true; addTrust('elias', -1); return null; },
        { go: 'clinic' }, { show: [{ id: 'irene', e: 'sad' }] },
        { c: 'irene', e: 'sad', t: T('Kidney failure. Advanced. He\'s needed dialysis for months. He knows, he\'s known all along.', 'فشل كلوي. متقدم. يحتاج غسيل من شهور. وهو يدري، يدري من أول.') },
        { c: 'irene', e: 'neutral', t: T('I can\'t make him come in. Nobody can. He needs a reason to want to.', 'ما أقدر أجبره يجي. ولا أحد يقدر. يحتاج سبب يخليه يبي.') },
        { go: 'living' }, { show: [{ id: 'elias', e: 'angry' }] },
        N_('He doesn\'t speak to you on the way home. He sits in his armchair and stares at the cold fireplace.', 'ما يكلمك طول الطريق للبيت. يجلس على كرسيه ويطالع الدفاية الباردة.'),
        s => { quest('q_secret', 'done'); return null; }
      ] },
      { t: T('Help him up and say nothing', 'تساعده يقوم وتسكت'), then: [
        s => { addTrust('elias', 1); return null; },
        { go: 'living' },
        N_('You get him to his armchair. He breathes slowly for a long time.', 'توصله لكرسيه. يتنفس ببطء وقت طويل.'),
        E('sad', 'Thank you. Don\'t tell anyone.', 'شكراً. لا تقول لأحد.')
      ] }
    ] },
    s => { s.f.fallDone = true; s.f.fallDay = s.day; s.f.restDay = s.day; if (s.slot === 0) advance(1); quest('q_final', 'active'); return null; }
  ],

  finale: s => {
    s.f.finaleDone = true;
    const steps = [{ go: 'living' }, { show: [{ id: 'elias', e: 'sad' }] },
      N_('Elias is weaker tonight. He didn\'t go out at all. When you come in he points at the other chair.', 'إلياس أتعب الليلة. ما طلع أبداً. أول ما تدخل يأشر على الكرسي الثاني.'),
      E('neutral', 'Sit. I want to hear what you think.', 'اجلس. أبي أسمع رايك.')];
    if (s.f.sentSneak) return steps.concat([
      E('angry', 'Thomas called today. He said I left him a message. I didn\'t.', 'توماس اتصل اليوم. يقول إني تركت له رسالة. وأنا ما تركت.'),
      (s.trust.elias || 0) >= 5 ? { jump: 'endLetterSneak' } : { jump: 'endKickSneakLate' }
    ]);
    return steps.concat([{ c: 'elias', e: 'sad', menu: [
      { t: T('Talk him into treatment', 'تقنعه يتعالج'), need: st => st.mood >= 5 && st.f.knowsIllness, why: T('You\'d need to know what\'s wrong with him, and be steady enough yourself.', 'تحتاج تعرف وش فيه، وتكون أنت ثابت كفاية.'),
        then: [st => roll(0.25 + 0.07 * (st.trust.elias || 0)) ? [{ jump: 'endStay' }] : [E('sad', 'I\'m tired, {lad|lass}. Let me be tired.', 'تعبت يا {ولدي|بنتي}. خلني أتعب.'), { jump: 'endPeace' }]] },
      { t: T('Write to Thomas, together', 'تكتبون لتوماس، مع بعض'), need: st => st.f.knowsSon && (st.trust.elias || 0) >= 6, why: T('You\'re not that close yet. Or you don\'t know enough.', 'ما وصلتوا لهالقرب. أو ما تعرف كفاية.'), then: [{ jump: 'endLetter' }] },
      { t: T('Message Thomas behind his back', 'تراسل توماس من وراه'), cls: 'risk', hide: st => !st.f.knowsSon, then: [st => roll(0.5) ? [{ jump: 'endKickSneakLate' }] : [{ jump: 'endLetter' }]] },
      { t: T('Just sit with him', 'تجلس معه وبس'), then: [st => (st.f.motherTalk && st.mood >= 6) ? [{ jump: 'endGo' }] : [{ jump: 'endPeace' }]] }
    ] }]);
  },

  /* ----- endings ----- */
  endStay: [{ go: 'clinic' }, { show: [{ id: 'elias', e: 'smile' }] },
    E('neutral', 'Fine. The machine. On one condition.', 'طيب. الجهاز. بشرط واحد.'),
    E('smile', 'You come with me every time. And you have tea with me after, even when it\'s bad tea.', 'تجي معي كل مرة. وتشرب معي شاي بعدها، حتى لو كان شاي سيء.'),
    N_('Three times a week, four hours. You sit beside him and read the newspaper out loud. He corrects your pronunciation of every fish.', 'ثلاث مرات بالأسبوع، أربع ساعات. تجلس جنبه وتقرا له الجريدة بصوت عالي. وهو يصحح نطقك لاسم كل سمكة.'),
    N_('Two months later, he knocks on your door before dawn. You\'re already awake.', 'بعد شهرين، يطق بابك قبل الفجر. وأنت صاحي من قبل.'),
    { end: 'ELIAS_STAY' }],
  endLetter: [{ show: [{ id: 'elias', e: 'sad' }] },
    N_('You write the letter together. It takes three hours to write four lines.', 'تكتبون الرسالة مع بعض. ثلاث ساعات عشان أربع أسطر.'),
    E('sad', '"Thomas. I was wrong. Come if you can. If you can\'t, I understand."', '«توماس. أنا غلطت. تعال إذا تقدر. وإذا ما تقدر، أنا فاهم.»'),
    N_('Thomas answers two days later: "I\'m coming."', 'توماس يرد بعد يومين: «جاي.»'),
    { show: [] },
    N_('Elias doesn\'t make it. He dies the night before the train arrives.', 'إلياس ما يلحق. يموت الليلة اللي قبل وصول القطار.'),
    N_('At the cemetery, a man in his twenties stands beside you. "You\'re the one who was with him?" You nod.', 'في المقبرة، شاب في العشرينات يوقف جنبك. «أنت اللي كان معه؟» تهز راسك.'),
    N_('"Thank you for not letting him be alone."', '«شكراً إنك ما خليته لحاله.»'),
    { end: 'ELIAS_LETTER' }],
  endLetterSneak: [
    E('sad', 'I should be angry. I am angry.', 'المفروض أكون زعلان. وأنا زعلان.'),
    E('sad', 'He\'s coming on Saturday. First time in eight years. Because of you.', 'جاي يوم السبت. أول مرة من ثمان سنين. بسببك.'),
    { show: [] },
    N_('Elias dies on Friday night, in his armchair, with the radio on.', 'إلياس يموت ليلة الجمعة، على كرسيه، والراديو شغال.'),
    N_('Thomas arrives the next morning and finds you sitting on the doorstep. He sits down next to you and doesn\'t say anything for a long time.', 'توماس يوصل الصبح، ويلقاك جالس على عتبة الباب. يجلس جنبك وما يقول شي وقت طويل.'),
    { end: 'ELIAS_LETTER' }],
  endPeace: [{ show: [{ id: 'elias', e: 'neutral' }] },
    N_('You don\'t do anything big. You sit with him.', 'ما تسوي شي كبير. تجلس معه.'),
    N_('You make tea. You go down to the boat. You listen to the radio play songs older than you.', 'تسوي شاي. تنزلون للقارب. تسمعون الراديو يشغل أغاني أقدم منك.'),
    { show: [] },
    N_('A week later, you wake up to a different kind of silence. No knock.', 'بعد أسبوع، تصحى على نوع ثاني من الصمت. ما فيه طق.'),
    N_('In his drawer, the letters he never sent. On top, a new one, to you: "Post these. And don\'t stay anywhere with nobody in it."', 'في درجه، الرسايل اللي ما أرسلها. وفوقها وحدة جديدة، لك: «أرسلها. ولا تقعد في مكان ما فيه أحد.»'),
    { end: 'ELIAS_PEACE' }],
  endKickSnoop: [{ show: [{ id: 'elias', e: 'angry' }] },
    E('angry', 'Three times.', 'ثلاث مرات.'),
    E('angry', 'I opened my house to you. And you keep opening everything else.', 'فتحت لك بيتي. وأنت تفتح كل شي غيره.'),
    N_('He puts your bag by the door himself, and locks it behind you.', 'يحط شنطتك عند الباب بنفسه، ويقفل وراك.'),
    { go: 'street' }, { show: [] },
    N_('Main Street. Night. Same bench. Same nothing.', 'الشارع الرئيسي. الليل. نفس الكرسي. ونفس اللاشي.'),
    { end: 'ELIAS_KICK' }],
  endKickSneak: [
    E('angry', 'Who are you talking to.', 'مع مين تتكلم.'),
    E('angry', 'That\'s my son. That\'s my phone. That\'s my house. Get out of it.', 'هذا ولدي. وهذا هاتفي. وهذا بيتي. اطلع منه.'),
    { go: 'street' }, { show: [] },
    N_('The door shuts behind you. You don\'t even have your bag.', 'الباب يتسكر وراك. حتى شنطتك ما معك.'),
    { end: 'ELIAS_KICK' }],
  endKickSneakLate: [{ show: [{ id: 'elias', e: 'angry' }] },
    E('angry', 'You went behind my back. In my own house.', 'رحت من وراي. في بيتي.'),
    E('angry', 'Maybe you meant well. I don\'t care. Go.', 'يمكن قصدك خير. ما يهمني. اطلع.'),
    { go: 'street' }, { show: [] },
    N_('You hear later that Thomas came. That they talked. That Elias died a week after, in the city, with his son beside him. Nobody tells you whether he forgave you.', 'تسمع بعدين إن توماس جا. وإنهم تكلموا. وإن إلياس مات بعدها بأسبوع، في المدينة، وولده جنبه. ولا أحد يقول لك هل سامحك.'),
    { end: 'ELIAS_KICK' }],
  endGo: [{ show: [{ id: 'elias', e: 'smile' }] },
    E('neutral', 'I know what\'s wrong with me. And I know what\'s wrong with you.', 'أنا أعرف وش فيني. وأعرف وش فيك.'),
    E('sad', 'But you\'re at the start of the road. You didn\'t come here to stay. You came to remember that you can get up.', 'بس أنت بأول الطريق. ما جيت هنا عشان تقعد. جيت عشان تتذكر إنك تقدر تقوم.'),
    N_('He takes your phone out of your pocket and puts it in your hand.', 'ياخذ جوالك من جيبك ويحطه في يدك.'),
    E('smile', 'Your mother. Now. And after that, you only come back here to visit.', 'أمك. الحين. وبعدها ما ترجع هنا إلا زيارة.'),
    N_('It rings twice. "...Hello?" You can\'t speak. She understands. "It\'s alright. Just stay on the line."', 'يرن مرتين. «...ألو؟» ما تقدر تتكلم. هي تفهم. «خلاص. بس خلك على الخط.»'),
    { end: 'ELIAS_GO' }]
};

/* ---------------- talk topics ---------------- */
const inHouse = s => houseOf(s.loc) === 'elias';

/* ---------------- events (checked in order after every scene) ---------------- */
GAME.EVENTS = [
  { id: 'kick', when: s => !s.f.ended && (s.susp.elias || 0) >= 3, run: [{ jump: 'endKickSnoop' }] },
  { id: 'meet', once: true, when: s => s.f.prologue && s.loc === 'street', run: [{ jump: 'meet' }] },
  { id: 'wake', when: s => s.f.newDay && s.f.metElias && !s.f.ended, run: s => {
      s.f.newDay = false; s.loc = 'your_room';
      if (s.day >= 5 && !s.f.fallDone) return [{ go: 'kitchen' }].concat(GAME.SCRIPTS.fall('home'));
      if (s.day === 1) { quest('q_care', 'active'); return GAME.SCRIPTS.wake1; }
      const lines = [N_('You hear the front door close before dawn. Elias is already out.', 'تسمع باب البيت يتسكر قبل الفجر. إلياس طلع من بدري.'), N_('Gulls. Wind. The house is quiet.', 'نوارس. هوا. البيت هادي.')];
      if ((s.trust.elias || 0) >= 3) lines.push(N_('The kettle is still warm. A cup has been left out for you.', 'الغلاية لسا دافية. وفيه كوب متروك لك.'));
      const out = [pickOne(lines)];
      if (s.mood <= 3) out.push(N_('Getting up feels like lifting the whole house. You do it anyway.', 'القومة تحس كأنك تشيل البيت كله. وتقوم على كل حال.'));
      return out;
    } },
  { id: 'fallHarbor', once: true, when: s => s.f.metElias && !s.f.ended && !s.f.fallDone && s.day >= 4 && s.slot === 0 && s.loc === 'harbor', run: s => GAME.SCRIPTS.fall('harbor') },
  { id: 'noticed', once: true, when: s => s.f.metElias && !s.f.ended && s.day >= 1 && s.slot === NIGHT && s.loc === 'living' && !s.f.fallDone, run: [
      { show: [{ id: 'elias', e: 'sad' }] },
      N_('Elias has dozed off in his armchair with the radio on. He\'s breathing hard, one hand pressed to his side even in his sleep.', 'إلياس غفى على كرسيه والراديو شغال. يتنفس بصعوبة، ويده على جنبه حتى وهو نايم.'),
      { menu: [
        { t: T('Wake him and ask', 'تصحيه وتسأله'), fx: s => { s.f.noticed = true; quest('q_secret', 'active'); }, then: [E('sad', 'Just tired. Getting old. Don\'t fuss.', 'تعبان بس. كبرت. لا تكبّرها.'), N_('His eyes say something else.', 'عيونه تقول شي ثاني.')] },
        { t: T('Cover him with a blanket and turn off the radio', 'تغطيه وتطفي الراديو'), fx: s => { s.f.noticed = true; addTrust('elias', 1); quest('q_secret', 'active'); }, then: [N_('In his sleep, he says: "Thomas?"', 'وهو نايم، يقول: «توماس؟»')] }
      ] }] },
  { id: 'phoneRing', once: true, when: s => s.f.metElias && !s.f.ended && s.day >= 3 && s.slot === NIGHT && s.loc === 'living', run: [
      { show: [{ id: 'elias', e: 'neutral' }] },
      N_('The landline rings. Elias looks at the little screen for a long time. Then he turns it face down.', 'الهاتف الأرضي يرن. إلياس يطالع الشاشة الصغيرة وقت طويل. وبعدين يقلبه على وجهه.'),
      N_('You know that move. You\'ve done it a thousand times.', 'تعرف هالحركة. سويتها ألف مرة.'),
      { menu: [
        { t: T('"Answer it."', '«رد عليه.»'), fx: s => addTrust('elias', -1), then: [E('angry', 'Don\'t.', 'لا.'), N_('He goes to his room and shuts the door.', 'يدخل غرفته ويسكّر الباب.')] },
        { t: T('Turn your own phone face down too', 'تقلب جوالك أنت بعد على وجهه'), fx: s => addTrust('elias', 1), then: [E('smile', 'The pair of us. Look at that.', 'إحنا الاثنين. شف.')] }
      ] }] },
  { id: 'finale', when: s => !s.f.ended && s.f.fallDone && !s.f.finaleDone && s.day > s.f.fallDay && s.slot === NIGHT, run: s => (houseOf(s.loc) === 'elias' || s.loc === 'elias_ext') ? GAME.SCRIPTS.finale(s) : [N_('Your phone buzzes. A landline number. Elias\'s voice, tired: "Come home, {lad|lass}. I want to talk."', 'جوالك يهتز. رقم هاتف أرضي. صوت إلياس، تعبان: «تعال البيت يا {ولدي|بنتي}. أبي أتكلم معك.»'), { go: 'living' }].concat(GAME.SCRIPTS.finale(s)) }
];

/* ---------------- v2: living house, risk, self-care, Martha ---------------- */
Object.assign(GAME.SCRIPTS, {
  /* chance of being caught snooping right now, and by whom */
  riskOf: (s, extra = 0) => {
    const w = GAME.CHAR.elias.where(s); const eliasIn = !!w && houseOf(w) === 'elias';
    let p = eliasIn ? ({ bath: 0.12, kitchen: 0.3, shed: 0.25, living: 0.35 })[w] ?? 0.3 : 0.08;
    let who = 'elias';
    if (GAME.CHAR.martha.where(s)) { p += 0.22; if (!eliasIn || roll(0.5)) who = 'martha'; }
    return { p: clamp(p + extra, 0.02, 0.85), who };
  },
  caughtBy: who => who === 'martha'
    ? [{ show: [{ id: 'martha', e: 'shock' }] }, { c: 'martha', e: 'angry', t: T('And what do we think we\'re doing in there?', 'وش قاعد تسوي هناك إن شاء الله؟') }, { c: 'martha', e: 'angry', t: T('Twenty years I\'ve cleaned this house. I don\'t open his drawers, and neither do you.', 'عشرين سنة أنظف هالبيت. أنا ما أفتح أدراجه، ولا أنت.') }, s => { s.f.caughtBy = 'martha'; return null; }, { jump: 'caught' }]
    : [{ show: [{ id: 'elias', e: 'angry' }] }, { jump: 'caught' }],
  bathLock: s => {
    const o = bathOccupant(s); if (!o) return null;
    if (o === 'elias') return [N_('The door is locked. Water running, and Elias singing a sea shanty, badly, with the wrong words.', 'الباب مقفول. صوت موية، وإلياس يغني أغنية بحارة، غلط، وبكلمات خطأ.'), { menu: [
      { t: T('Knock', 'تطق'), then: [{ c: 'elias', e: 'shock', t: T('OCCUPIED. Seventy-two years old and nobody lets me sing in peace.', 'مشغول! اثنين وسبعين سنة وما أحد يخليني أغني بسلام.') }] },
      { t: T('Come back later', 'ترجع بعدين'), then: [] }] }];
    return [N_('Locked. Martha\'s voice through the door: "Five minutes, love! This tub has seen things."', 'مقفول. صوت مارثا من ورا الباب: «خمس دقايق يا عمري! هالبانيو شاف أشياء.»')];
  },
  shower: s => {
    if (s.f.lastShower === s.day) return [N_('You already showered today. The towel is still damp.', 'تروشت اليوم. المنشفة لسا رطبة.')];
    const gap = s.f.lastShower == null ? 99 : s.day - s.f.lastShower;
    s.f.lastShower = s.day; addMood(gap >= 2 ? 2 : 1); s.f.showers = (s.f.showers || 0) + 1;
    if (s.f.showers >= 2 && s.f.ate >= 2) quest('q_care', 'done');
    if (s.slot < NIGHT) advance(1);
    return [gap >= 2 ? N_('Hot water. You stand under it longer than you need to. You forgot this was something you could just do.', 'موية حارة. توقف تحتها أطول من اللازم. نسيت إن هذا شي تقدر تسويه وخلاص.') : N_('A quick shower. The pipes bang like they\'re applauding.', 'ترويشة سريعة. البايبات تطق كأنها تصفق.')];
  },
  eat: s => {
    if (doneToday('ate')) return [N_('You\'ve eaten today. That counts.', 'أكلت اليوم. وهذا يحسب.')];
    onceToday('ate'); s.f.ate = (s.f.ate || 0) + 1;
    if (s.f.showers >= 2 && s.f.ate >= 2) quest('q_care', 'done');
    if ((s.f.pantry || 0) > 0) { s.f.pantry--; addMood(1); return [N_('Leftovers from the burnt dinner. Somehow better cold.', 'بقايا العشا المحروق. بطريقة ما، أحسن وهو بارد.')]; }
    if (has('bread')) { take('bread'); addMood(1); return [N_('You eat some of the bread standing at the counter. Your body says thank you before you do.', 'تاكل من الخبز وأنت واقف عند الكاونتر. جسمك يقول شكراً قبلك.')]; }
    return [N_('Crackers and tea. It\'s something. Tomorrow, maybe real food.', 'بسكوت مالح وشاي. أحسن من لا شي. بكرة، يمكن أكل صدق.')];
  }
});

GAME.EVENTS.push(
  { id: 'meetMartha', once: true, when: s => !!GAME.CHAR.martha.where(s) && GAME.CHAR.martha.where(s) === s.loc, run: s => { s.met.martha = true; return [
    { show: [{ id: 'martha', e: 'smile' }] },
    N_('A small woman in a flowered headscarf and yellow rubber gloves is attacking the room with a feather duster.', 'امرأة قصيرة بطرحة مورّدة وجوانتي مطاط أصفر، تهاجم الغرفة بمنفضة ريش.'),
    { c: 'martha', e: 'smile', t: T('You must be the lodger! I\'m Martha. Tuesdays and Fridays. I clean, I gossip, I see everything.', 'أكيد أنت الساكن! أنا مارثا. الثلاثاء والجمعة. أنظف، وأسولف، وأشوف كل شي.') },
    { c: 'martha', e: 'neutral', t: T('Everything.', 'كل شي.') }]; } }
);
