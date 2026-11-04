/* =====================================================================
   You walk out on Margaret before her chapter is over.
   A "Pack your bag" spot in the spare room lets you leave her house in
   the middle of her chapter (s.host = null, s.f.mLeft = day). Her door
   lets you back in any time, until you live with someone else.
   If she had started to count on you (two dinners or more), she looks:
     1. the first evening after: her kitchen light, a plate, waiting;
     2. the day after: in town, asking for "Danny" (Sami tells you);
     3. the next evening she finds you, with a box of food and your
        hoodie. Go back with her / tell her you are not Danny / hide.
   Sad, never frightening: she asks, she waits, she stops.
   Flags: mLeft, mSeek (1, 2, 'back' | 'truth' | 'hid'), mSeekDay, mCameBack
   (going back with her counts as one more step on Danny's path, see danPath
   in js/margaret.js). No ending is added or changed.
   ===================================================================== */
'use strict';
(function () {
  if (!GAME.LOC.marg_guest || !GAME.LOC.cliff_road) return;
  const M = (e, en, ar) => ({ c: 'margaret', e, t: T(en, ar) });
  const SA = (e, en, ar) => ({ c: 'sami', e, t: T(en, ar) });
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const inM = s => s.host === 'margaret';
  const away = s => !!s.f.mLeft && !inM(s) && !(s.done && s.done.margaret);
  const missed = s => away(s) && (s.f.mDinners || 0) >= 2;
  const TOWN = ['street', 'harbor'];
  const outside = s => TOWN.includes(s.loc) || s.loc === 'cliff_road';
  const atYours = s => s.host ? houseOf(s.loc) === s.host : outside(s);

  /* ---------- leaving ---------- */
  GAME.LOC.marg_guest.spots.push({ x: 9, y: 64, label: T('Pack your bag', '{جهّز|جهّزي} شنطتك'),
    if: s => inM(s) && !s.f.mFinaleDone && !RUN,
    run: s => [
      N1('One bag. It takes four minutes to pack everything you own.', 'شنطة وحدة. أربع دقايق {وتكون جمعت|وتكونين جمعتي} كل شي تملكه.'),
      { menu: [
        { t: T('Leave a note on the pillow, and go', '{خل|خلي} ورقة على المخدة، {وامش|وامشي}'), cls: 'risk', then: [
          { mini: 'paper', kind: 'letter', body: T('Thank you for the dinners. I\'m sorry.\n— {name}', 'شكراً على العشا. {آسف|آسفة}.\n— {name}') },
          N1('Three locks. From the inside, they open in a second.', 'ثلاث أقفال. من داخل، تنفتح في ثانية.'),
          st => { st.host = null; st.f.mLeft = st.day; st.f.mSeek = 0; addMood(-1); return null; },
          { go: 'cliff_road' }, { show: [] }] },
        { t: T('Not yet', 'مو الحين'), then: [N1('You unpack again. Your clothes go back on the new hangers, the ones that still have the tags on.', '{ترجع ترتب|ترجعين ترتبين} أغراضك. ملابسك ترجع على العلاقات الجديدة، اللي لسا عليها السعر.')] }
      ] }]
  });

  /* ---------- her door lets you back ---------- */
  const lock0 = GAME.LOC.cliff_road.exits[0].lock;
  GAME.LOC.cliff_road.exits[0].lock = s => (away(s) && !s.host) ? [{ jump: 'margBack' }] : lock0(s);
  GAME.SCRIPTS.margBack = s => [{ show: [{ id: 'margaret', e: s.f.mSeek === 'truth' ? 'sad' : 'shock' }] },
    N1('You knock. This time the three locks come off fast, as if she was standing right behind them.', '{تطق|تطقين}. هالمرة الأقفال الثلاثة تنفتح بسرعة، كأنها كانت واقفة وراها على طول.'),
    s.f.mSeek === 'truth'
      ? M('sad', '{name}. Come in. Your room is still your room.', '{name}. {ادخل|ادخلي}. غرفتك لسا غرفتك.')
      : M('smile', 'I kept your plate warm. Every night. Silly, isn\'t it.', 'كنت أخلي صحنك دافي. كل ليلة. سخافة، صح؟'),
    st => { st.host = 'margaret'; st.f.mLeft = null; st.f.mSeek = 0; return null; },
    { go: 'marg_living' }, { show: [] }];

  /* ---------- 1. the first evening ---------- */
  GAME.EVENTS.push({ id: 'mSeek1',
    when: s => missed(s) && !RUN && s.f.mSeek === 0 && s.day > s.f.mLeft && s.slot === 3 && outside(s),
    run: s => [{ show: [] },
      N1('Seven o\'clock. Up on Cliff Road, one window in the white house is lit: the kitchen.', 'الساعة سبعة. فوق في شارع الجرف، شباك واحد في البيت الأبيض منوّر: المطبخ.'),
      N1('You can see her shape at the table. Not eating. Sitting very straight, the way you sit when you\'re listening for a door.', '{تشوف|تشوفين} خيالها على الطاولة. ما تاكل. جالسة معتدلة مرة، مثل ما يجلس اللي يسمع صوت باب.'),
      N1('And upstairs, in the room on the right, Daniel\'s light is on.', 'وفوق، في الغرفة اللي على اليمين، ضو دانيال شغال.'),
      st => { st.f.mSeek = 1; st.f.mSeekDay = st.day; return null; }]
  });

  /* ---------- 3. she finds you (shared by step 2 and the evening after) ---------- */
  const meet = s => [{ show: [{ id: 'margaret', e: 'sad' }] },
    s.host
      ? N1('A knock on the door of the place you live now. Margaret, in her good coat, holding a plastic box with both hands. Your hoodie is folded over her arm.', 'طق على باب المكان اللي {ساكن|ساكنة} فيه الحين. مارغريت، لابسة معطفها الزين، ماسكة علبة بلاستيك بيدينها الثنتين. وكنزتك مطوية على يدها.')
      : N1('Margaret, in her good coat, crossing the street towards you, holding a plastic box with both hands. Your hoodie is folded over her arm.', 'مارغريت، لابسة معطفها الزين، تقطع الشارع لك، ماسكة علبة بلاستيك بيدينها الثنتين. وكنزتك مطوية على يدها.'),
    M('neutral', 'You left this on the chair. And you haven\'t been eating, I can tell. Fish pie. It\'s still warm. I walked fast.', '{نسيتها|نسيتيها} على الكرسي. وما {تاكل|تاكلين}، باين عليك. فطيرة سمك. لسا دافية. مشيت بسرعة.'),
    M('sad', 'I\'m not angry. I just needed to see you were somewhere. That\'s all. That\'s all it is.', 'مو زعلانة. بس كنت أحتاج أشوف إنك في مكان. بس كذا. هذا كل شي.'),
    s.f.mdTray != null ? M('sad', 'Is someone looking for you too? Your mother? ...Tell her where you are. Someone should always know.', 'فيه أحد ثاني يدورك بعد؟ أمك؟ ...{قل|قولي} لها وينك. لازم دايم أحد يعرف.') : (st => null),
    { c: 'margaret', e: 'sad', menu: [
      { t: T('Go back with her', '{ارجع|ارجعي} معها'), cls: 'risk', hide: st => !!st.host, then: [
        st => { st.host = 'margaret'; st.f.mLeft = null; st.f.mSeek = 'back'; st.f.mCameBack = true; addTrust('margaret', 1); return null; },
        { show: [{ id: 'margaret', e: 'smile' }] },
        M('smile', 'Come on, then. It\'s getting cold. ...Danny.', '{يلا تعال|يلا تعالي}. البرد بدأ. ...داني.'),
        N1('She doesn\'t correct herself. You don\'t either. All the way up Cliff Road she holds the box, and you carry nothing.', 'ما تصحح نفسها. {وأنت بعد ما تصحح|وأنتِ بعد ما تصححين}. طول الطريق في شارع الجرف هي شايلة العلبة، {وأنت ما تشيل|وأنتِ ما تشيلين} شي.'),
        { go: 'marg_kitchen' },
        N1('She heats the pie up again anyway. She watches you eat every bite, and says nothing about where you were, and clears the plates herself.', 'تسخّن الفطيرة مرة ثانية برضو. {وتطالعك وأنت تاكل|وتطالعك وأنتِ تاكلين} كل لقمة، وما تقول شي عن {وين كنت|وين كنتي}، وتشيل الصحون بنفسها.'),
        st => { onceToday('mDinner'); feed(40); advance(1); return null; }, { show: [] }] },
      { t: T('"Margaret. I\'m not Danny."', '«مارغريت. أنا مو داني.»'), then: [
        { show: [{ id: 'margaret', e: 'cry' }] },
        N1('She holds on to the box. For a moment you think she\'ll drop it. She doesn\'t.', 'تمسك العلبة بقوة. لحظة {تحس|تحسين} إنها بتطيحها. بس ما تطيحها.'),
        M('cry', 'I know. I knew when I set the table tonight. I set it anyway.', 'أدري. كنت أدري وأنا أحط السفرة الليلة. وحطيتها برضو.'),
        M('sad', 'Nobody has said it to me like that. Not Nora. Not the doctor. They all say it around the edges.', 'محد قالها لي كذا. لا نورا. ولا الدكتورة. كلهم يقولونها من بعيد.'),
        N1('She puts the box and the hoodie into your hands, and walks back up the hill alone. Halfway, she stops, and says without turning round:', 'تحط العلبة والكنزة في يدك، وترجع تطلع الطلعة لحالها. وفي نص الطريق توقف، وتقول بدون ما تلتفت:'),
        M('sad', 'The door is open. Not for Danny. For you, {name}.', 'الباب مفتوح. مو لداني. لك {أنت|أنتِ}، يا {name}.'),
        st => { st.f.mSeek = 'truth'; st.f.mCorrected = (st.f.mCorrected || 0) + 1; addTrust('margaret', 1); feed(30); return null; }, { show: [] }] },
      { t: T('Don\'t let her see you', 'لا {تخليها تشوفك|تخلينها تشوفك}'), then: [
        { show: [] },
        s.host
          ? N1('You don\'t answer. Through the window you watch her wait on the step until the street lights come on.', 'ما {ترد|تردين}. من الشباك {تشوفها|تشوفينها} تنتظر على العتبة لين تشتغل أنوار الشارع.')
          : N1('You step back into Sami\'s doorway. She stands in the street, turning slowly, until the street lights come on.', '{ترجع|ترجعين} لورا عند باب بقالة سامي. وهي واقفة في الشارع، تلتفت بشويش، لين تشتغل أنوار الشارع.'),
        N1('Then she puts the box down on the step, the hoodie folded on top, and goes. On the lid, in her careful hand: "For whoever needs it."', 'وبعدين تحط العلبة على العتبة، والكنزة مطوية فوقها، وتمشي. وعلى الغطا، بخطها المرتب: «لأي أحد يحتاجها.»'),
        st => { st.f.mSeek = 'hid'; st.f.mSeekDay = st.day; addTrust('margaret', -1); addMood(-1); feed(30); return null; }] }
    ] }];

  /* ---------- 2. the day after: in town, asking ---------- */
  GAME.EVENTS.push({ id: 'mSeek2',
    when: s => missed(s) && !RUN && s.f.mSeek === 1 && s.day > s.f.mSeekDay && s.slot < 3 && TOWN.includes(s.loc),
    run: s => [{ show: [{ id: 'margaret', e: 'worry' }] },
      N1('Outside the café, Margaret is showing Marco something on her phone. A photo. Her hair isn\'t done. She looks pale in daylight, like something kept too long in a drawer.', 'قدام القهوة، مارغريت توري ماركو شي في جوالها. صورة. شعرها مو مسرّح. شكلها شاحب في ضو النهار، مثل شي انحفظ في درج زيادة عن اللزوم.'),
      M('worry', 'Have you seen Danny? ...No. Sorry. Not Danny. The {boy|girl} who stays with me. Stayed.', 'شفت داني؟ ...لا. آسفة. مو داني. {الولد اللي ساكن|البنت اللي ساكنة} عندي. {كان ساكن|كانت ساكنة}.'),
      N1('Marco shakes his head slowly. She thanks him as if he had said yes, and moves on to the next door.', 'ماركو يهز راسه بشويش. وهي تشكره كأنه قال إيه، وتروح للباب اللي بعده.'),
      { show: [{ id: 'sami', e: 'sad' }] },
      SA('sad', 'She\'s been up and down this street since yesterday. She left a plate on my counter in case you came in. A plate. With a fork.', 'لها من أمس رايحة جاية في هالشارع. وخلت صحن على كاونتري لو {جيت|جيتي}. صحن. ومعه شوكة.'),
      { c: 'sami', e: 'sad', menu: [
        { t: T('Go to her now', '{روح|روحي} لها الحين'), then: [st => { st.f.mSeek = 2; st.f.mSeekDay = st.day; return null; }, st => meet(st)] },
        { t: T('Wait until she\'s gone', '{انتظر|انتظري} لين تمشي'), then: [N1('You wait behind the shelf of tinned peas until the bell over the door has rung twice.', '{تنتظر|تنتظرين} ورا رف علب البازلاء لين الجرس اللي فوق الباب يرن مرتين.'),
          st => { st.f.mSeek = 2; st.f.mSeekDay = st.day; return null; }] }
      ] }]
  });

  /* ---------- 3. the evening after: she finds you ---------- */
  GAME.EVENTS.push({ id: 'mSeek3',
    when: s => missed(s) && !RUN && s.f.mSeek === 2 && s.day > s.f.mSeekDay && s.slot === 3 && atYours(s),
    run: s => meet(s)
  });

  /* ---------- after hiding: the grave, the next day ---------- */
  GAME.EVENTS.push({ id: 'mSeekGrave', once: true,
    when: s => missed(s) && !RUN && s.f.mSeek === 'hid' && s.day > s.f.mSeekDay && s.slot >= 2 && s.slot < NIGHT && (outside(s) || s.loc === 'cemetery'),
    run: s => [{ show: [] },
      N1('Past the cemetery wall, the white stone. Margaret is kneeling at it with her toothbrush, the way she does every day.', 'ورا سور المقبرة، الحجر الأبيض. مارغريت راكعة عنده بفرشاة الأسنان، مثل ما تسوي كل يوم.'),
      N1('She is talking to it, quietly, the way you talk to someone in the next room. In the middle of his name you hear yours.', 'تكلمه، بهدوء، مثل ما تكلم أحد في الغرفة اللي جنبك. وفي نص اسمه {تسمع|تسمعين} اسمك.'),
      N1('Then she stops looking. You can tell: she walks home without turning her head once.', 'وبعدها توقف تدور. {تعرف|تعرفين} من مشيتها: ترجع البيت وما تلتفت ولا مرة.'),
      st => { st.f.mSeek = 'gave'; return null; }]
  });
})();
