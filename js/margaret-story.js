/* =====================================================================
   Margaret, when Elias throws you out.
   If Elias's chapter ends with him throwing you out (ELIAS_KICK), you
   don't go to Leo next. You sit on the bench in the rain, and Margaret,
   shy, hesitant, comes back for you. Her chapter comes second, Leo's
   third. Every other ending of Elias's goes to Leo as before.

   Living with her goes round in a circle, and the circle gets tighter:
     warmth → worry → she sees Daniel in you → she breaks → she forgives
   After she breaks, you choose: stay with her through it, or walk out.
   Staying wears you out and slowly helps her. Walking out breaks her a
   little more, and the next time is worse.
   And the house is full of small things that happen when they happen:
   a bang on the wall, her laughing at you for running; her sitting on
   the end of your bed at night; your things in Daniel's wardrobe.

   It uses Margaret's own chapter, her own endings and their conditions
   as they are. It only adds scenes, a few trust points for being kind
   (the same way her other scenes do), and its own flags (mc*, mt).
   ===================================================================== */
'use strict';
(function () {
  const M = (e, en, ar) => ({ c: 'margaret', e, t: T(en, ar) });
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const inM = s => s.host === 'margaret';
  const dM = s => s.day - (s.f.margDay || 0);
  const home = s => inM(s) && houseOf(s.loc) === 'margaret';
  const tense = s => s.f.mt || 0;                   /* 0 calm … 4 at breaking point */
  const tenseUp = (s, n = 1) => { s.f.mt = Math.max(0, Math.min(4, tense(s) + n)); };
  const kind = (s, k) => { if (!s.f['mcK_' + k]) { s.f['mcK_' + k] = true; addTrust('margaret', 1); } };

  /* ---------- 1. the way in: thrown out by Elias, then Margaret ---------- */
  if (GAME.END.ELIAS_KICK) {
    GAME.END.ELIAS_KICK.next = 'margKicked';
    GAME.END.ELIAS_KICK.after = T('Chapter 1 complete. It\'s raining, and you have nowhere to go.', 'خلص الفصل الأول. الدنيا تمطر، وما عندك مكان تروح له.');
  }
  GAME.SCRIPTS.margKicked = s => [
    st => { st.f.ended = true; st.f.margFirst = true; st.slot = NIGHT; return null; },
    { go: 'street' }, { show: [] },
    N1('The bench outside Sami\'s. The shop is dark. It has started to rain, the thin, sideways kind that gets in everywhere.', 'الكرسي اللي قدام بقالة سامي. المحل مطفي. وبدأ المطر، المطر الرفيع المايل اللي يدخل في كل مكان.'),
    N1('You have been sitting here long enough that you have stopped noticing you are wet.', 'صار لك جالس هنا وقت طويل لدرجة إنك بطّلت تنتبه إنك مبلول.'),
    N1('Footsteps. A woman with an umbrella and a bag of shopping walks past. Slows down. Walks on. Stops. Comes back halfway, and stands there, as if she has forgotten why.', 'خطوات. امرأة معها شمسية وكيس مقاضي تمر. تبطّي. تكمل. توقف. وترجع نص الطريق، وتوقف هناك، كأنها نست ليش رجعت.'),
    { show: [{ id: 'margaret', e: 'worry' }] },
    M('worry', 'I\'m sorry. It isn\'t my business. I know it isn\'t.', 'آسفة. مو شغلي. أدري إنه مو شغلي.'),
    M('neutral', 'I\'m Margaret. Hart. The white house, up on Cliff Road. I\'ve seen you around. With Elias.', 'أنا مارغريت. هارت. البيت الأبيض، فوق في شارع الجرف. شفتك قبل. مع إلياس.'),
    N1('She looks at you a moment too long. Her hand tightens on the umbrella.', 'تطالعك لحظة أطول من اللازم. يدها تشتد على الشمسية.'),
    M('worry', 'I have a room. It\'s empty. It\'s... it\'s been empty a while. Just until you find somewhere. You can\'t sit out here all night, love.', 'عندي غرفة. فاضية. هي... صار لها فترة فاضية. بس لين تلقى مكان. ما {تقدر|تقدرين} {تجلس|تجلسين} هنا الليل كله، يا عمري.'),
    { c: 'margaret', e: 'worry', menu: [
      { t: T('"Thank you. I\'d like that."', '«شكراً. ودي.»'), cls: 'main', then: [M('smile', 'Good. Good. Come on, then. I\'ll put the kettle on. I always put the kettle on.', 'زين. زين. {تعال|تعالي} أجل. بحط الإبريق. أنا دايم أحط الإبريق.')] },
      { t: T('"Why would you do that for a stranger?"', '«ليش تسوين كذا لواحد ما تعرفينه؟»'), then: [M('sad', 'Because somebody should have done it for my son. And nobody did.', 'لأن كان لازم أحد يسويها لولدي. ومحد سواها.'), N1('She says it very quietly. Then she holds the umbrella over you, and doesn\'t say anything else.', 'تقولها بهدوء مرة. وبعدين تحط الشمسية فوقك، وما تقول شي ثاني.')] }
    ] },
    { go: 'cliff_road' },
    N1('Cliff Road. A white house with every curtain closed. She unlocks the door: three locks, one after another.', 'شارع الجرف. بيت أبيض وكل ستايره مسكّرة. تفتح الباب: ثلاث أقفال، واحد ورا الثاني.'),
    st => { st.host = 'margaret'; st.f.metMarg = true; st.met.margaret = true; st.f.margDay = st.day; st.trust.margaret = st.trust.margaret || 0; st.susp.margaret = 0; st.ch = Math.max(st.ch, 3); quest('q_m_room', 'active'); quest('q_m_garden', 'active'); return null; },
    { go: 'marg_living' }, { show: [{ id: 'margaret', e: 'smile' }] },
    N1('Inside it\'s spotless and dim. A clock stopped at seven. A portrait of a grinning boy over the fireplace, about your age.', 'داخل نظيف مرة ومعتم. ساعة واقفة على سبعة. وصورة ولد يضحك فوق المدفأة، تقريباً بعمرك.'),
    M('neutral', 'The rent is one thing only. You eat dinner with me. Seven o\'clock. The house is too quiet at seven.', 'الإيجار شي واحد بس. {تتعشى|تتعشين} معي. الساعة سبعة. البيت ساكت مرة الساعة سبعة.'),
    M('smile', 'Towels are in the cupboard. Knock if you need anything. Knock on everything. I startle.', 'الفوط في الدولاب. {طق|طقي} إذا احتجت شي. {طق|طقي} على كل شي. أنا أنفجع بسرعة.'),
    { go: 'marg_guest' }, { show: [] },
    N1('The guest room is cold and very tidy. Through the wall, you hear her say goodnight. Then, a little later, she says it again, to someone else.', 'غرفة الضيوف باردة ومرتبة مرة. من ورا الجدار، {تسمعها|تسمعينها} تقول تصبح على خير. وبعدين، بعد شوي، تقولها مرة ثانية، لأحد ثاني.')
  ];

  /* her chapter is open while she comes first */
  const cliff = GAME.LOC.street.exits.find(x => x.to === 'cliff_road');
  if (cliff && cliff.if) { const i0 = cliff.if; cliff.if = s => i0(s) || (!!s.f.margFirst && (inM(s) || !!s.done.margaret)); }
  (GAME.MAP || []).filter(p => p.to === 'cliff_road').forEach(p => { const i0 = p.if || (() => true); p.if = s => i0(s) || (!!s.f.margFirst && inM(s)); });

  /* after her, Leo (his chapter, as it was); after Leo, the doors that are left */
  const afterHost0 = GAME.SCRIPTS.afterHost;
  GAME.SCRIPTS.afterHost = s => {
    if (s.f.margFirst && s.done.margaret && !s.f.leoEnded && s.ch < 4 && !s.f.leoStarted) { s.f.leoStarted = true; s.ch = 2; return GAME.SCRIPTS.ch2start(s); }
    return afterHost0(s);
  };
  const ch2 = GAME.SCRIPTS.ch2start;
  GAME.SCRIPTS.ch2start = s => {
    const steps = ch2(s);
    if (s.f.margFirst && s.done.margaret) {
      const i = steps.findIndex(st => st && st.n && /Two nights on the bench/.test(st.n.en));
      if (i >= 0) steps[i] = N1('You leave Cliff Road with your bag and whatever Margaret pressed into your hands at the door. You walk down to the harbor, because your legs know the way.', '{تطلع|تطلعين} من شارع الجرف ومعك شنطتك وأي شي حطته مارغريت في يدك عند الباب. {وتنزل|وتنزلين} للميناء، لأن رجولك تعرف الطريق.');
    }
    return steps;
  };
  const afterLeo0 = GAME.SCRIPTS.afterLeo;
  GAME.SCRIPTS.afterLeo = s => (s.done.margaret ? GAME.SCRIPTS.afterHost(Object.assign(s, { host: null })) : afterLeo0(s));
  const truth0 = GAME.SCRIPTS.margStartTruth;
  GAME.SCRIPTS.margStartTruth = s => (s.done.margaret ? GAME.SCRIPTS.afterLeo(s) : truth0(s));

  /* ---------- 2. the circle ---------- */
  const SC = {
    warm: s => [{ show: [{ id: 'margaret', e: 'smile' }] },
      N1('Margaret has made breakfast. Too much breakfast. Eggs, toast, beans, a pot of tea, a jar of marmalade she apologises for.', 'مارغريت سوت فطور. فطور كثير. بيض، وتوست، وفاصوليا، وإبريق شاي، ومربى برتقال تعتذر عنه.'),
      M('smile', 'I didn\'t know what you liked. So I made all of it. That\'s silly. Sorry.', 'ما كنت أدري وش تحب. فسويت كل شي. سخيف. آسفة.'),
      { menu: [
        { t: T('"It\'s perfect."', '«ممتاز.»'), then: [N1('She goes pink and busies herself with the teapot. When she thinks you aren\'t looking, she smiles at the table.', 'وجهها يحمر وتنشغل بالإبريق. ولما تحسب إنك ما {تطالع|تطالعين}، تبتسم للطاولة.'), st => { kind(st, 'warm'); addMood(1); return null; }] },
        { t: T('Eat, and ask about her', '{كُل|كلي}، {واسألها|واسأليها} عنها'), then: [M('neutral', 'Me? Oh, there isn\'t much. I used to teach. Piano. I don\'t, now. The piano\'s still there. I dust it.', 'أنا؟ ما فيه شي. كنت أدرّس. بيانو. الحين لا. البيانو لسا موجود. أنفضه.'), st => { kind(st, 'warm'); return null; }] }
      ] }],
    worry: s => [{ show: [{ id: 'margaret', e: 'worry' }] },
      N1('You come back in and Margaret is standing in the hall, still in her coat, as if she has been about to go out for a long time.', '{ترجع|ترجعين} للبيت ومارغريت واقفة في الممر، لابسة كوتها، كأنها من زمان على وشك تطلع.'),
      M('worry', 'Where were you? No. Sorry. You don\'t have to tell me. It\'s only the cliff road, at night, the cars come round that bend so fast.', 'وين {كنت|كنتي}؟ لا. آسفة. مو لازم {تقول|تقولين} لي. بس شارع الجرف، بالليل، السيارات تلف ذاك المنعطف بسرعة.'),
      N1('Behind you she locks the door. Unlocks it. Locks it again. Checks it. Three times.', 'وراك تقفل الباب. تفتحه. تقفله مرة ثانية. تتأكد منه. ثلاث مرات.'),
      { menu: [
        { t: T('"I\'m sorry. I\'ll tell you next time."', '«{آسف|آسفة}. المرة الجاية بقول لك.»'), then: [M('smile', 'Would you? Just a text. "Back at six." That\'s all. I know it\'s silly.', 'صدق؟ بس رسالة. «راجع الساعة ست.» بس كذا. أدري إنه سخيف.'), st => { kind(st, 'worry'); return null; }] },
        { t: T('"I\'m an adult, Margaret."', '«أنا {كبير|كبيرة} يا مارغريت.»'), then: [M('sad', 'Yes. Yes, of course you are. He was too.', 'إيه. أكيد. وهو بعد كان كبير.'), st => { tenseUp(st); return null; }] }
      ] }],
    seeing: s => [{ show: [{ id: 'margaret', e: 'blank' }] },
      N1('Margaret puts a mug of tea in front of you. A blue mug with a chipped handle and a football club badge. Everybody else\'s mugs in this house are white.', 'مارغريت تحط قدامك كوب شاي. كوب أزرق يده مكسورة شوي وعليه شعار نادي كورة. كل الأكواب الثانية في البيت بيضا.'),
      M('blank', 'Two sugars. You always...', 'ملعقتين سكر. {أنت دايم|أنتِ دايم}...'),
      N1('She stops. You don\'t take sugar. You have never told her you don\'t take sugar.', 'توقف. {أنت ما تاخذ|أنتِ ما تاخذين} سكر. وعمرك ما قلت لها إنك ما {تاخذ|تاخذين} سكر.'),
      { show: [{ id: 'margaret', e: 'worry' }] },
      M('worry', 'I\'ll get you another mug.', 'بجيب لك كوب ثاني.'),
      { menu: [
        { t: T('"This one\'s fine."', '«هذا زين.»'), then: [N1('You drink from Daniel\'s mug. She watches every sip, and her eyes fill, and she doesn\'t look away.', '{تشرب|تشربين} من كوب دانيال. تطالع كل رشفة، وعيونها تدمع، وما تشيل عيونها.'), st => { st.f.mcMug = true; kind(st, 'seeing'); return null; }] },
        { t: T('"Another one, please."', '«ثاني لو سمحتي.»'), then: [N1('She takes the blue mug back very carefully, as if it might break, and puts it on the top shelf, at the back.', 'تاخذ الكوب الأزرق بحذر مرة، كأنه بينكسر، وتحطه في الرف اللي فوق، ورا.')] }
      ] }],
    break: s => {
      const big = (s.f.mcLeft || 0) > 0;
      return [{ show: [{ id: 'margaret', e: 'angry' }] },
        N1(big ? 'You hear it from the stairs: a plate, then another. When you reach the kitchen she has her back to the wall and her hands over her ears.' : 'You laugh at something on your phone, at dinner. Just a laugh. Margaret puts her fork down.', big ? '{تسمعها|تسمعينها} من الدرج: صحن، وبعدين صحن ثاني. ولما توصل المطبخ تلقاها ظهرها على الجدار ويدينها على أذونها.' : '{تضحك|تضحكين} على شي في جوالك، على العشا. بس ضحكة. مارغريت تحط الشوكة.'),
        M('shock', big ? 'Don\'t. Don\'t come near me. You don\'t get to walk out and walk back in. HE didn\'t get to!' : 'Don\'t laugh like that. Don\'t you DARE laugh like that. That\'s HIS laugh.', big ? 'لا. لا {تقرب|تقربين} مني. ما يحق لك {تطلع|تطلعين} {وترجع|وترجعين}. هو ما رجع!' : 'لا {تضحك|تضحكين} كذا. إياك {تضحك|تضحكين} كذا. هذي ضحكته هو.'),
        M('angry', 'You\'re not him. You\'re in his house and his chair and you\'re NOT him!', '{أنت مو هو|أنتِ مو هو}. {أنت|أنتِ} في بيته وعلى كرسيه {وأنت|وأنتِ} مو هو!'),
        N1('She runs upstairs. A door slams. A key turns. Then, through the floor, the sound of someone trying very hard not to make a sound.', 'تركض فوق. باب يتصفق. مفتاح يلف. وبعدين، من الأرض، صوت أحد يحاول بكل قوته ما يطلع صوت.'),
        { show: [] },
        { menu: [
          { t: T('Sit on the floor outside her door, and stay', '{اجلس|اجلسي} على الأرض قدام بابها، {واقعد|واقعدي}'), cls: 'main', then: [
            N1('You sit with your back against her door. You don\'t say anything clever. After a long time, from the other side, very close, as if she is sitting against it too:', '{تجلس|تجلسين} وظهرك على بابها. ما {تقول|تقولين} شي ذكي. بعد وقت طويل، من الجهة الثانية، قريب مرة، كأنها جالسة على الباب بعد:'),
            M('sad', '...He used to sit there. When he was little and I was cross. Right where you are.', '...كان يجلس هناك. لما كان صغير وأنا زعلانة. بالضبط مكانك.'),
            st => { st.f.mcStayed = (st.f.mcStayed || 0) + 1; tenseUp(st, -1); kind(st, 'stay' + st.f.mcStayed); rest(-15); return null; }] },
          { t: T('Take your coat and go out for the night', '{خذ|خذي} كوتك {واطلع|واطلعي} الليلة'), then: [
            N1('You go out. You walk to the harbor and back twice. When you come in, every light in the house is on, and she is sitting in the hall in her coat, waiting, and she doesn\'t look at you.', '{تطلع|تطلعين}. {تمشي|تمشين} للميناء {وترجع|وترجعين} مرتين. ولما {تدخل|تدخلين}، كل أنوار البيت شغالة، وهي جالسة في الممر بكوتها، تنتظر، وما تطالعك.'),
            st => { st.f.mcLeft = (st.f.mcLeft || 0) + 1; tenseUp(st, 2); addMood(-1); return null; }] }
        ] }];
    },
    sorry: s => [{ show: [{ id: 'margaret', e: 'sad' }] },
      N1('A knock. Margaret, at your door, eyes red, holding a tray: tea, toast, a boiled egg in a cup with a knitted hat on it.', 'طق. مارغريت، عند بابك، عيونها حمرا، ماسكة صينية: شاي، وتوست، وبيضة مسلوقة في كوب عليها طاقية صوف.'),
      M('sad', 'I\'m sorry. I\'m so sorry. That wasn\'t you. None of that was you.', 'آسفة. آسفة مرة. ما كان أنت. ولا شي منه كان أنت.'),
      M('worry', 'If you want to go, I\'ll understand. I\'ll help you carry your things. I just didn\'t want you to go hungry.', 'إذا {تبي تروح|تبين تروحين}، بفهم. بساعدك {تشيل|تشيلين} أغراضك. بس ما بغيتك {تروح جوعان|تروحين جوعانة}.'),
      { menu: [
        { t: T('Take the tray. "I\'m not going anywhere."', '{خذ|خذي} الصينية. «ما راح أروح مكان.»'), cls: 'main', then: [{ mini: 'cg', src: 'img/fx/marg_hug2.webp', cap: T('"Thank you," she says, into your shoulder. "Thank you for staying."', '«شكراً،» تقولها على كتفك. «شكراً إنك {بقيت|بقيتي}.»') }, N1('She sits on the end of the bed while you eat. She doesn\'t talk. For the first time since you came, she looks like she is breathing all the way in.', 'تجلس على طرف السرير وأنت {تاكل|تاكلين}. ما تتكلم. ولأول مرة من جيت، تبان كأنها تتنفس للآخر.'), st => { kind(st, 'sorry'); tenseUp(st, -1); return null; }] },
        { t: T('Take the tray, and say nothing', '{خذ|خذي} الصينية، ولا {تقول|تقولين} شي'), then: [N1('She waits. You eat. She goes. The door stays a little open behind her, the way you\'d leave it for a child.', 'تنتظر. {تاكل|تاكلين}. تروح. والباب يبقى مفتوح شوي وراها، مثل ما تخليه لطفل.')] }
      ] }]
  };
  const STEP = ['warm', 'worry', 'seeing', 'break', 'sorry'];
  /* the circle starts again after "sorry", tighter each time it was left: the next break comes sooner */
  GAME.EVENTS.push({ id: 'mCircle', when: s => {
    if (!inM(s) || RUN || s.f.mFinaleDone || !home(s) || s.f.mcDay === s.day + ':' + s.slot) return false;
    const i = s.f.mcI || 0, k = STEP[i % STEP.length], lap = Math.floor(i / STEP.length);
    if (lap >= 2) return false;
    const gap = (s.f.mcLeft || 0) > 0 ? 0 : 1;
    if (s.f.mcLast != null && s.day - s.f.mcLast < (k === 'sorry' ? 1 : gap)) return false;
    const fits = { warm: s.slot <= 1 && s.loc === 'marg_kitchen', worry: s.slot >= 2 && s.slot <= 3, seeing: s.slot <= 2, break: s.slot === 3 && s.loc === 'marg_kitchen', sorry: s.slot === 0 && s.loc === 'marg_guest' }[k];
    return !!fits;
  }, run: s => { const i = s.f.mcI || 0; s.f.mcI = i + 1; s.f.mcLast = s.day; s.f.mcDay = s.day + ':' + s.slot; return SC[STEP[i % STEP.length]](s); } });
  /* "sorry" is the morning after "break" wherever you wake */
  GAME.EVENTS.push({ id: 'mSorryWake', when: s => inM(s) && !RUN && STEP[(s.f.mcI || 0) % STEP.length] === 'sorry' && s.slot === 0 && s.day > (s.f.mcLast || 0) && s.loc !== 'marg_guest' && home(s), run: s => { s.loc = 'marg_guest'; return [{ go: 'marg_guest' }]; } });

  /* ---------- 3. things that happen in her house ---------- */
  const EV = [
    /* calm */
    { id: 'thud', mood: [0, 1], slot: [0, 1, 2], run: s => [
      st => { try { if (typeof AUDIO !== 'undefined') AUDIO.sfx('door'); } catch (e) { /* none */ } return null; },
      N1('BANG. Something heavy, upstairs, against the wall. Then nothing.', 'طق! شي ثقيل، فوق، على الجدار. وبعدين ولا شي.'),
      { menu: [
        { t: T('Run up the stairs', '{اركض|اركضي} فوق'), cls: 'main', then: [{ show: [{ id: 'margaret', e: 'smile' }] },
          N1('You take the stairs two at a time. Margaret is on the landing with a hammer in one hand and a picture hook in her mouth.', '{تطلع|تطلعين} الدرج درجتين درجتين. مارغريت على الدرج ومعها مطرقة في يد ومسمار صورة في فمها.'),
          M('smile', 'Did I frighten you? Oh, your face. Come here, hold this straight. You\'re taller than me.', 'خوفتك؟ يا وجهك. {تعال|تعالي}، {امسك|امسكي} هذي معدولة. {أنت أطول|أنتِ أطول} مني.'),
          N1('You hold the picture while she hammers. It\'s a seascape. She hangs it crooked anyway, and laughs, and leaves it.', '{تمسك|تمسكين} الصورة وهي تدق. لوحة بحر. تعلقها عوجا على كل حال، وتضحك، وتخليها.'),
          st => { kind(st, 'thud'); addMood(1); return null; }] },
        { t: T('Call out, "Margaret? Are you okay?"', '{نادِ|نادي}: «مارغريت؟ أنتِ بخير؟»'), then: [M('smile', 'Fine, love! Just me and a hammer! Neither of us knows what we\'re doing!', 'بخير يا عمري! بس أنا ومطرقة! ولا وحدة فينا تدري وش تسوي!')] }
      ] }] },
    { id: 'sing', mood: [0, 1], slot: [0, 1, 3], run: s => [{ show: [{ id: 'margaret', e: 'smile' }] },
      N1('From the kitchen: Margaret, singing along to the radio. Badly, and with feeling. The moment she sees you in the doorway she stops dead and goes the colour of the tomatoes.', 'من المطبخ: مارغريت، تغني مع الراديو. غلط، وبإحساس. وأول ما {تشوفك|تشوفك} عند الباب توقف فجأة ووجهها يصير بلون الطماط.'),
      M('smile', 'You didn\'t hear that.', 'ما {سمعت|سمعتي} شي.'),
      { menu: [
        { t: T('Sing the next line', '{غنّ|غنّي} اللي بعده'), then: [N1('You sing the next line, worse than her. She stares at you, then laughs so hard she has to hold on to the sink.', '{تغني|تغنين} اللي بعده، أسوأ منها. تطالعك، وبعدين تضحك لين تمسك المغسلة.'), st => { kind(st, 'sing'); addMood(1); return null; }] },
        { t: T('"Hear what?"', '«أسمع وش؟»'), then: [M('smile', 'Exactly. Good. Exactly.', 'بالضبط. زين. بالضبط.')] }
      ] }] },
    { id: 'jar', mood: [0, 1, 2], slot: [0, 1, 2, 3], run: s => [{ show: [{ id: 'margaret', e: 'worry' }] },
      M('worry', 'Could you... sorry. This jar. I\'ve been fighting it for ten minutes. It\'s winning.', 'ممكن... آسفة. هالمرطبان. لي عشر دقايق أتهاوش معه. وهو الفايز.'),
      N1('It doesn\'t open for you either. You pass it back and forth, banging it on the counter, running it under the hot tap, until it gives with a pop and you both cheer like it\'s a goal.', 'ولا معك ينفتح. {تتبادلونه|تتبادلونه}، {وتدقونه|وتدقونه} على الكاونتر، وتحطونه تحت الموية الحارة، لين ينفتح بطقة {وتهللون|وتهللون} كأنه قول.'),
      st => { kind(st, 'jar'); addMood(1); return null; }] },
    { id: 'note', mood: [0, 1, 2], slot: [0, 1, 2], run: s => [
      N1('A note stuck to your door in careful handwriting: "Made a cake. Don\'t eat all of it. (You can eat all of it.) M."', 'ورقة لاصقة على بابك بخط مرتب: «سويت كيكة. لا {تاكلها|تاكلينها} كلها. (عادي {تاكلها|تاكلينها} كلها.) م.»'),
      st => { feed(15); addMood(1); return null; }] },
    /* strange */
    { id: 'bedside', mood: [1, 2, 3], slot: [4], run: s => [{ show: [{ id: 'margaret', e: 'blank' }] },
      N1('You wake up and don\'t know why. Then you see her: Margaret, sitting very still on the end of your bed in the dark, watching you.', '{تصحى|تصحين} وما {تدري|تدرين} ليش. وبعدين {تشوفها|تشوفينها}: مارغريت، جالسة ثابتة مرة على طرف سريرك في الظلام، تطالعك.'),
      M('blank', 'I was just making sure you were breathing. Go back to sleep, Danny.', 'كنت بس أتأكد إنك تتنفس. {ارجع|ارجعي} {نام|نامي}، يا داني.'),
      { menu: [
        { t: T('"It\'s me, Margaret. Not Danny."', '«هذا أنا يا مارغريت. مو داني.»'), then: [{ show: [{ id: 'margaret', e: 'worry' }] }, M('worry', 'I know. I know it is. I\'m sorry. I know.', 'أدري. أدري إنه أنت. آسفة. أدري.'), N1('She goes. She leaves the door open a crack. You don\'t sleep again.', 'تروح. وتخلي الباب مفتوح شوي. وما {تنام|تنامين} بعدها.'), st => { kind(st, 'bedside'); return null; }] },
        { t: T('Pretend to be asleep', '{سوّ|سوّي} نفسك {نايم|نايمة}'), then: [N1('You lie still. After a long time she stands, tucks the blanket in around your feet, very tight, the way you do for a small child, and goes.', '{تتمدد|تتمددين} بدون حركة. بعد وقت طويل توقف، وتدخل البطانية حول رجولك، مشدودة مرة، مثل ما تسوي لطفل صغير، وتروح.'), st => { tenseUp(st); return null; }] }
      ] }, { show: null }] },
    { id: 'phone', mood: [1, 2, 3], slot: [0, 1, 2, 3], run: s => [
      N1('Your phone isn\'t where you left it. You find it in the kitchen drawer, under the tea towels, switched off.', 'جوالك مو مكان ما {خليته|خليتيه}. {تلقاه|تلقينه} في درج المطبخ، تحت الفوط، مطفي.'),
      N1('When you turn it on there\'s a message, unsent, in the box: "Mum I\'m fine I\'m at home". You didn\'t write it.', 'ولما {تشغله|تشغلينه} فيه رسالة، ما انرسلت، في الخانة: «يمه أنا بخير أنا في البيت». ما {كتبتها|كتبتيها} {أنت|أنتِ}.'),
      st => { tenseUp(st); return null; }] },
    { id: 'talking', mood: [1, 2, 3], slot: [2, 3, 4], run: s => [{ show: [{ id: 'margaret', e: 'sit' }] },
      N1('Margaret\'s voice, from the sitting room: low, warm, the voice you use with someone you love. "...and then Leo said, and you said..." A pause, as if for an answer. A laugh.', 'صوت مارغريت، من الصالة: واطي، ودافي، الصوت اللي تتكلم فيه مع أحد تحبه. «...وبعدين ليو قال، {وأنت|وأنت} قلت...» وسكتة، كأنها تنتظر رد. وضحكة.'),
      N1('You look round the door. She\'s alone, holding his photo to her chest, looking at the empty armchair.', '{تطل|تطلين} من الباب. هي لحالها، ضامّة صورته على صدرها، وتطالع الكرسي الفاضي.'),
      { menu: [
        { t: T('Go in and sit in the other chair', '{ادخل|ادخلي} {واجلس|واجلسي} على الكرسي الثاني'), then: [M('sit', 'Oh. Sorry. I talk to him. I know he isn\'t there. It\'s just, if I stop, it\'s so quiet.', 'أوه. آسفة. أكلمه. أدري إنه مو هنا. بس، إذا وقفت، يصير هادي مرة.'), st => { kind(st, 'talking'); return null; }] },
        { t: T('Back away quietly', '{ارجع|ارجعي} بهدوء'), then: [N1('You back away. Behind you, she carries on the conversation. She sounds happy.', '{ترجع|ترجعين}. ووراك، تكمل السالفة. صوتها مبسوط.')] }
      ] }, { show: null }] },
    /* frightening */
    { id: 'wardrobe', mood: [2, 3, 4], slot: [1, 2, 3], run: s => [
      N1('Your room. Your bag is gone. Your clothes are gone. The drawers are empty.', 'غرفتك. شنطتك مو موجودة. ملابسك مو موجودة. الأدراج فاضية.'),
      N1('You find them across the landing, in Daniel\'s wardrobe, folded and hung between his shirts, as if they had always been there.', '{تلقاها|تلقينها} في الجهة الثانية من الدرج، في دولاب دانيال، مطوية ومعلقة بين قمصانه، كأنها من زمان هناك.'),
      { show: [{ id: 'margaret', e: 'blank' }] },
      M('blank', 'There was more room in there. That\'s all. More room.', 'كان فيه مكان أكثر هناك. بس كذا. مكان أكثر.'),
      { menu: [
        { t: T('Carry them back, one armful at a time, without a word', '{رجّعها|رجّعيها}، شيلة شيلة، بدون ولا كلمة'), then: [N1('She watches you do it. Halfway through, she starts helping.', 'تطالعك {وأنت تسويها|وأنتِ تسوينها}. وبالنص، تبدأ تساعدك.'), st => { kind(st, 'wardrobe'); tenseUp(st, -1); return null; }] },
        { t: T('"You can\'t do this, Margaret."', '«ما يصير تسوين كذا يا مارغريت.»'), then: [M('angry', 'I can do what I like. It\'s my house. It\'s HIS house.', 'أسوي اللي أبي. هذا بيتي. هذا بيته هو.'), st => { tenseUp(st); return null; }] }
      ] }, { show: null }] },
    { id: 'notebook', mood: [2, 3, 4], slot: [2, 3], run: s => [{ show: [{ id: 'margaret', e: 'blank' }] },
      N1('Margaret is sitting on your bed with your notebook open on her knees. She doesn\'t jump when you come in. She turns a page.', 'مارغريت جالسة على سريرك ودفترك مفتوح على ركبها. ما تنفجع لما {تدخل|تدخلين}. تقلب صفحة.'),
      M('blank', 'You write about me. "She checks the door three times." Is that what I do?', '{تكتب|تكتبين} عني. «تتأكد من الباب ثلاث مرات.» هذا اللي أسويه؟'),
      { menu: [
        { t: T('"Yes. And I worry about you."', '«إيه. وأنا {قلقان|قلقانة} عليك.»'), then: [{ show: [{ id: 'margaret', e: 'sad' }] }, M('sad', 'Nobody\'s worried about me in two years. They worry about the house.', 'محد قلق علي من سنتين. يقلقون على البيت.'), st => { kind(st, 'notebook'); return null; }] },
        { t: T('Take it out of her hands', '{خذه|خذيه} من يدها'), then: [N1('She lets go of it at once, as if it burned her, and leaves without a word.', 'تفلته على طول، كأنه حرقها، وتطلع بدون ولا كلمة.'), st => { tenseUp(st); return null; }] }
      ] }, { show: null }] },
    { id: 'bathroom', mood: [2, 3, 4], slot: [0, 3, 4], run: s => [
      N1('You open the bathroom door and Margaret is right there, on the other side of it, standing very close, as if she has been there the whole time.', '{تفتح|تفتحين} باب الحمام ومارغريت قدامك بالضبط، من الجهة الثانية، واقفة قريب مرة، كأنها كانت هناك طول الوقت.'),
      { show: [{ id: 'margaret', e: 'worry' }] },
      M('worry', 'You were a long time. He was a long time, too. The last morning.', '{طولت|طولتي}. هو بعد طوّل. آخر صبح.'),
      st => { tenseUp(st); return null; }, { show: null }] },
    { id: 'thud2', mood: [3, 4], slot: [3, 4], run: s => [
      st => { try { if (typeof AUDIO !== 'undefined') AUDIO.sfx('door'); } catch (e) { /* none */ } return null; },
      N1('BANG. Upstairs. Against the wall. The same sound as the hammer, that first week.', 'طق! فوق. على الجدار. نفس صوت المطرقة، ذاك الأسبوع الأول.'),
      N1('You run up the stairs two at a time. Margaret is on the landing. There is no hammer. Her forehead is against the wall, and she is very still.', '{تطلع|تطلعين} الدرج درجتين درجتين. مارغريت على الدرج. ما فيه مطرقة. جبهتها على الجدار، وهي ثابتة مرة.'),
      { show: [{ id: 'margaret', e: 'blank' }] },
      M('blank', 'It\'s alright. I just wanted it to be quiet in here for a second.', 'عادي. بس كنت أبي يسكت اللي هنا ثانية.'),
      { menu: [
        { t: T('Put your hand on her shoulder, and stay with her', '{حط|حطي} يدك على كتفها، {واقعد|واقعدي} معها'), cls: 'main', then: [N1('She leans into it. You stand on the landing together until the light in the window changes.', 'تميل عليها. {توقفون|توقفون} على الدرج مع بعض لين يتغير الضو في الشباك.'), st => { kind(st, 'thud2'); tenseUp(st, -2); return null; }] },
        { t: T('Phone Dr. Irene', '{اتصل|اتصلي} بالدكتورة إيرين'), then: [N1('Irene comes within the hour, with her bag and without a fuss. She sits with Margaret in the kitchen for a long time. On her way out she squeezes your arm: "You did right."', 'إيرين تجي خلال ساعة، معها شنطتها وبدون شوشرة. تجلس مع مارغريت في المطبخ وقت طويل. وهي طالعة تضغط على ذراعك: «{سويت|سويتي} الصح.»'), st => { st.f.mcIrene = true; tenseUp(st, -1); return null; }] }
      ] }, { show: null }] }
  ];
  GAME.EVENTS.push({ id: 'mHouse', when: s => {
    if (!inM(s) || RUN || s.f.mFinaleDone || !home(s)) return false;
    if (s.f.mhDay === s.day) return false;                       /* one a day */
    if (s.f.mcDay === s.day + ':' + s.slot) return false;
    const t = tense(s), pool = EV.filter(e => e.mood.includes(t) && e.slot.includes(s.slot) && !s.f['mh_' + e.id]);
    if (!pool.length) return false;
    const r = ((s.day * 31 + s.slot * 7) % 10) / 10; if (r < 0.45) return false;
    s.f.mhPick = pool[(s.day + s.slot) % pool.length].id; return true;
  }, run: s => { const e = EV.find(x => x.id === s.f.mhPick); s.f['mh_' + e.id] = true; s.f.mhDay = s.day; return e.run(s); } });

  /* at night in Daniel's room she holds his photo (picture: margaret-sit) */
  const night0 = GAME.SCRIPTS.margNightRoom;
  if (night0) GAME.SCRIPTS.margNightRoom = s => night0(s).map(st => {
    if (st && st.show && st.show[0] && st.show[0].id === 'margaret' && st.show[0].e === 'sad') return { show: [{ id: 'margaret', e: 'sit' }] };
    if (st && st.c === 'margaret' && st.e === 'sad') return Object.assign({}, st, { e: 'sit' });
    return st;
  });

  window.__margStory = { SC, EV, STEP };
})();
