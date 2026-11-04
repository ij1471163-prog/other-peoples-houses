/* =====================================================================
   Margaret throws you out, and then comes to take you back.
   The first time she catches you snooping for the third time, she
   screams you out of the house (as before), but it is not the end of her
   chapter any more: the next day she comes looking for you, wet hair,
   no coat, and asks you to come home. If you do, she has changed:
   she goes through your bag, she texts at 7:02, she sits outside your
   door at night. She is kinder and more frightened, both at once.
   Get caught again (twice more) and she throws you out for good:
   the old ending, MARG_KICK, unchanged.
   Flags: mKicked (day), mSeek 'kicked' | 'kickwait', mChanged (day).
   ===================================================================== */
'use strict';
(function () {
  if (!GAME.SCRIPTS.endMargKick || !GAME.LOC.cliff_road) return;
  const M = (e, en, ar) => ({ c: 'margaret', e, t: T(en, ar) });
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const inM = s => s.host === 'margaret';
  const home = s => inM(s) && houseOf(s.loc) === 'margaret';
  const TOWN = ['street', 'harbor'];
  const atYours = s => s.host ? houseOf(s.loc) === s.host : (TOWN.includes(s.loc) || s.loc === 'cliff_road');

  /* ---------- the first time: out, but not the end ---------- */
  const forGood = GAME.SCRIPTS.endMargKick;
  GAME.SCRIPTS.endMargKick = s => {
    if (s.f.mKicked) return forGood.slice();
    return [
      M('scream', 'Out. Get out of my house. Get out of HIS house.', '{اطلع|اطلعي}. {اطلع|اطلعي} من بيتي. {اطلع|اطلعي} من بيته هو.'),
      N1('She stands at the door while you pack, holding the brass key so tight it marks her palm. The three locks go behind you, one after another.', 'توقف عند الباب {وأنت تجمع|وأنتِ تجمعين} أغراضك، ماسكة المفتاح النحاس بقوة لدرجة إنه يعلّم كفها. والأقفال الثلاثة تتسكّر وراك، واحد ورا الثاني.'),
      st => { st.host = null; st.f.mKicked = st.day; st.f.mLeft = st.day; st.f.mSeek = 'kicked'; st.susp.margaret = 0; addMood(-2); return null; },
      { go: 'cliff_road' }, { show: [] },
      N1('It has started to rain. Through the door, very faintly, you hear her crying. Or laughing. With Margaret it is hard to tell.', 'بدا المطر. ومن ورا الباب، بصوت خفيف مرة، {تسمعها|تسمعينها} تبكي. أو تضحك. مع مارغريت صعب {تفرق|تفرقين}.')
    ];
  };

  /* ---------- her door stays shut until she comes for you ---------- */
  const lock1 = GAME.LOC.cliff_road.exits[0].lock;
  GAME.LOC.cliff_road.exits[0].lock = s => (!inM(s) && s.f.mSeek === 'kicked')
    ? T('Three locks. Nobody comes. A curtain upstairs moves, and then is still.', 'ثلاث أقفال. محد يجي. ستارة فوق تتحرك، وبعدين توقف.')
    : lock1(s);

  /* ---------- the next day: she comes to take you back ---------- */
  GAME.EVENTS.push({ id: 'mKickBack',
    when: s => !RUN && !inM(s) && s.f.mSeek === 'kicked' && !(s.done && s.done.margaret) && s.day > s.f.mKicked && s.slot < NIGHT && atYours(s),
    run: s => [{ show: [{ id: 'margaret', e: 'worry' }] },
      N1('Margaret. No coat, hair wet from the rain, her cardigan buttoned wrong. She looks as if she has not slept, and as if she has walked here very fast and then stood outside for a long time.', 'مارغريت. بدون معطف، شعرها مبلول من المطر، وأزرار الكارديغان مقفلة غلط. شكلها ما نامت، وكأنها مشت لهنا بسرعة مرة وبعدين وقفت برا وقت طويل.'),
      M('sad', 'I shouldn\'t have screamed. I don\'t scream. I haven\'t screamed since the hospital.', 'ما كان لازم أصارخ. أنا ما أصارخ. ما صرخت من يوم المستشفى.'),
      M('worry', 'Come home. Please. The house is so loud without you in it. ...But there will be rules now. You understand. There have to be rules.', '{ارجع|ارجعي} البيت. {تكفى|تكفين}. البيت صوته عالي مرة بدونك. ...بس بيصير فيه قوانين الحين. {فاهم|فاهمة}. لازم يكون فيه قوانين.'),
      { c: 'margaret', e: 'worry', menu: [
        { t: T('Go home with her', '{ارجع|ارجعي} معها'), cls: 'main', hide: st => !!st.host, then: [
          st => { st.host = 'margaret'; st.f.mLeft = null; st.f.mSeek = 0; st.f.mChanged = st.day; st.susp.margaret = 1; return null; },
          { show: [{ id: 'margaret', e: 'smile' }] },
          N1('She holds your arm all the way up Cliff Road. Not like someone helping you. Like someone who thinks you might run.', 'ماسكة يدك طول طريق شارع الجرف. مو مثل أحد يساعدك. مثل أحد يحسب إنك بتهرب.'),
          { go: 'marg_living' },
          M('smile', 'There. Home. Shoes off. I\'ve made up your bed again.', 'خلاص. البيت. {فك|فكي} جزمتك. رتبت سريرك من جديد.'),
          { show: [] }] },
        { t: T('"Not yet. I need a few days."', '«مو الحين. أحتاج كم يوم.»'), then: [
          M('sad', 'Yes. Of course. A few days. The door is... I\'ll leave it unlocked. One lock. Just the one.', 'إيه. أكيد. كم يوم. الباب... بخليه مفتوح. قفل واحد. واحد بس.'),
          N1('She walks away in the rain without hurrying, as if being wet is something she has decided to deserve.', 'تمشي في المطر بدون ما تستعجل، كأن البلل شي قررت إنها تستاهله.'),
          st => { st.f.mSeek = 'kickwait'; return null; }, { show: [] }] }
      ] }]
  });

  /* coming back on your own after "a few days" counts the same */
  const back0 = GAME.SCRIPTS.margBack;
  if (back0) GAME.SCRIPTS.margBack = s => back0(s).concat(s.f.mKicked && !s.f.mChanged ? [st => { st.f.mChanged = st.day; st.susp.margaret = Math.max(st.susp.margaret || 0, 1); return null; }] : []);

  /* ---------- she has changed ---------- */
  const changed = s => home(s) && !!s.f.mChanged && !s.f.mFinaleDone && !RUN;
  GAME.EVENTS.push({ id: 'mChBag', once: true,
    when: s => changed(s) && s.day > s.f.mChanged && s.slot === 0,
    run: s => [{ show: [] },
      N1('Your bag is on the bed, open. Everything in it has been taken out and folded back, neater than you ever folded it.', 'شنطتك على السرير، مفتوحة. كل شي فيها انطلع وانطوى ورجع، أرتب من ما عمرك {طويته|طويتيه}.'),
      N1('Your phone is on top. Moved. Face up, the way she likes it.', 'وجوالك فوق. متحرك من مكانه. ووجهه لفوق، مثل ما تحبه.'),
      { show: [{ id: 'margaret', e: 'smile' }] },
      M('smile', 'I did a wash. You\'re welcome, love.', 'غسلت الملابس. العفو يا عمري.')]
  });
  GAME.EVENTS.push({ id: 'mChText', once: true,
    when: s => !RUN && inM(s) && !!s.f.mChanged && !s.f.mFinaleDone && s.slot === 3 && houseOf(s.loc) !== 'margaret',
    run: s => [
      N1('Your phone. Margaret: "It\'s 7:02."', 'جوالك. مارغريت: «الساعة ٧:٠٢.»'),
      N1('Then: "Are you coming?" Then: "Sorry. Take your time." Then: "It\'s 7:04."', 'وبعدها: «{بتجي|بتجين}؟» وبعدها: «آسفة. على راحتك.» وبعدها: «الساعة ٧:٠٤.»')]
  });
  GAME.EVENTS.push({ id: 'mChDoor', once: true,
    when: s => changed(s) && s.day > s.f.mChanged + 1 && s.slot === NIGHT && s.loc === 'marg_guest',
    run: s => [{ show: [] },
      N1('A floorboard outside your door. Then nothing. Then, after a long time, her voice, very low, through the wood:', 'خشبة تطقطق برا بابك. وبعدين ولا شي. وبعدين، بعد وقت طويل، صوتها، واطي مرة، من ورا الخشب:'),
      M('sad', 'I\'m not coming in. I\'m just sitting here. I just want to know you\'re still there.', 'ما راح أدخل. بس جالسة هنا. بس أبي أعرف إنك لسا هنا.'),
      { menu: [
        { t: T('"I\'m still here, Margaret."', '«أنا لسا هنا يا مارغريت.»'), then: [N1('"Good." The floorboard again. She doesn\'t go. You fall asleep to the sound of her breathing on the other side of the door.', '«زين.» الخشبة مرة ثانية. ما تمشي. {وتنام|وتنامين} على صوت نفسها من الجهة الثانية للباب.'), st => { addTrust('margaret', 1); return null; }] },
        { t: T('Say nothing', 'ما {تقول|تقولين} شي'), then: [N1('She waits. Then the door handle turns, very slowly, just far enough to check it isn\'t locked, and turns back.', 'تنتظر. وبعدين مقبض الباب يلف، بشويش مرة، بس لين تتأكد إنه مو مقفول، ويرجع.'), st => { addMood(-1); return null; }] }
      ] }]
  });

  /* the way she says hello, once she has had you back */
  const greet0 = GAME.CHAR.margaret.greet;
  GAME.CHAR.margaret.greet = s => {
    if (inM(s) && s.f.mChanged && !s.f.mFinaleDone && (s.susp.margaret || 0) < 2) return [
      { e: 'worry', t: T('Where were you? ...Sorry. Sorry. You don\'t have to tell me. Where were you?', 'وين {كنت|كنتي}؟ ...آسفة. آسفة. مو لازم {تقول|تقولين}. وين {كنت|كنتي}؟') },
      { e: 'smile', t: T('You\'re not going anywhere today, are you? No. Good.', 'ما {أنت رايح|أنتِ رايحة} مكان اليوم، صح؟ لا. زين.') },
      { e: 'smile', t: T('There you are. I counted the plates twice this morning. Silly.', 'هذا {أنت|أنتِ}. عدّيت الصحون مرتين الصبح. سخافة.') }
    ][s.day % 3];
    return greet0(s);
  };
})();
