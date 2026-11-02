/* =====================================================================
   Biscuit, Daniel's hamster (Margaret's house).
   In the sunroom, among the plants, a small cage with a note in a boy's
   handwriting: "BISCUIT — NO CHOCOLATE!! — D." He was Daniel's. He is
   old now, for a hamster, and he is the last living thing in the house
   that was Daniel's. Margaret keeps him the way she keeps the sunroom:
   alive, on purpose.
     · the first time: Margaret finds you at the cage and tells you whose
       he was (and smiles, for the first time);
     · once a day you can look after him: seeds, fresh water, or hold him
       in your hand; each time she tells you one small thing about Daniel;
     · one morning he won't eat, and she is frightened; the next day he
       eats again. He does not die in this story.
     · at night, from the sitting room, you can hear his wheel.
   Its own flags (s.f.bis*); mood only. No trust, suspicion, quest or
   ending changes.
   ===================================================================== */
'use strict';
(function () {
  const L = GAME.LOC; if (!L.marg_garden) return;
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const M = (e, en, ar) => ({ c: 'margaret', e, t: T(en, ar) });
  const inHouse = s => s && s.host === 'margaret';
  const home = s => GAME.CHAR.margaret && GAME.CHAR.margaret.where && !!GAME.CHAR.margaret.where(s);
  const sick = s => s.f.bisSick === s.day;

  /* what Margaret tells you, one a day, while you look after him */
  const TELLS = [
    [M('smile', 'He bought him with his own pocket money. Fifteen. Stood in the kitchen and said "Don\'t worry, Mum, he won\'t sleep in my room." He slept in his room every night for two years.', 'شراه بمصروفه. كان عمره خمستعش. وقف في المطبخ وقال «لا تخافين يمه، ما راح ينام في غرفتي.» ونام في غرفته كل ليلة سنتين.')],
    [M('neutral', 'Daniel used to talk to him at night, when he thought I was asleep. About school. About a girl. Mostly about the girl.', 'دانيال كان يكلمه بالليل، لما يحسبني نايمة. عن المدرسة. وعن بنت. أغلب الكلام عن البنت.')],
    [M('smile', 'He taught him to come out of the cage and go back in when he whistled. Didn\'t tell me for a month. I found out because Biscuit was in my slipper.', 'علّمه يطلع من القفص ويرجع لما يصفر. وما قال لي إلا بعد شهر. عرفت لأني لقيت بسكوت في نعالي.')],
    [M('sad', 'After the funeral I didn\'t feed him for a day. I forgot he existed. Then I heard the wheel at three in the morning, and I sat on the floor by the cage until it was light.', 'بعد الجنازة ما أكّلته يوم كامل. نسيت إنه موجود. وبعدين سمعت العجلة الساعة ثلاث الفجر، وجلست على الأرض جنب القفص لين طلع النور.')],
    [M('neutral', 'The vet says he\'s very old now. Two and a half. I keep a calendar. I don\'t know why. As if knowing the date would help.', 'البيطري يقول إنه كبير مرة الحين. سنتين ونص. وأنا أحسب الأيام في تقويم. ما أدري ليش. كأن معرفة التاريخ بتساعد.')],
    [M('smile', 'Thank you for looking after him. He likes you. He hides his seeds in your sleeve. That\'s how you know.', 'مشكور{|ة} إنك {تهتم|تهتمين} فيه. هو يحبك. يخبي بذوره في كمك. هذي الطريقة اللي تعرف فيها.')]
  ];

  L.marg_garden.spots.push({ x: 74, y: 52, label: T('A small cage among the plants', 'قفص صغير بين الزرع'),
    if: s => inHouse(s),
    run: s => {
      /* the first time */
      if (!s.f.bisSeen) {
        s.f.bisSeen = s.day;
        const out = [
          N1('A small cage among the hydrangeas, cleaner than anything else in the house. In the bedding, a round gold-and-white hamster is asleep, breathing very fast. Taped to the bars, in a boy\'s capitals: "BISCUIT — NO CHOCOLATE!! — D."', 'قفص صغير بين الهيدرانجيا، أنظف من أي شي ثاني في البيت. وفي النشارة، همستر مدوّر ذهبي وأبيض نايم، يتنفس بسرعة. وملصوق على القضبان، بحروف ولد كبيرة: «بسكوت — لا تعطونه شوكولاتة!! — د.»')
        ];
        if (home(s)) out.push({ show: [{ id: 'margaret', e: 'neutral' }] },
          M('neutral', 'That\'s Biscuit. He was Daniel\'s.', 'هذا بسكوت. كان حق دانيال.'),
          M('smile', 'Don\'t wake him. He\'s seventy in hamster. He\'s earned it.', 'لا {تصحيه|تصحينه}. عمره سبعين بحساب الهمستر. ويستاهل ينام.'),
          N1('It\'s the first time you have seen her smile. It doesn\'t last, but it was there.', 'هذي أول مرة {تشوفها|تشوفينها} تبتسم. ما طوّلت، بس كانت موجودة.'));
        return out;
      }
      /* the morning he won't eat */
      if (!s.f.bisScare && (s.f.bisCare || 0) >= 3 && home(s) && s.slot <= 1) {
        s.f.bisScare = s.day; s.f.bisSick = s.day;
        return [{ show: [{ id: 'margaret', e: 'worry' }] },
          N1('Margaret is kneeling by the cage with a seed on her open palm. Biscuit is in the corner, awake, not moving towards it.', 'مارغريت راكعة جنب القفص وبذرة في كفها المفتوح. بسكوت في الزاوية، صاحي، وما يتحرك لها.'),
          M('sad', 'He won\'t eat. Since last night. No. Not now. Not him as well.', 'ما ياكل. من أمس بالليل. لا. مو الحين. مو هو بعد.'),
          { menu: [
            { t: T('Sit down next to her', '{تجلس|تجلسين} جنبها'), then: [N1('You sit on the floor beside her. Neither of you says anything. After a long time, she leans her shoulder against yours, very slightly, as if by accident.', '{تجلس|تجلسين} على الأرض جنبها. ولا واحد فيكم يقول شي. وبعد وقت طويل، تميل بكتفها على كتفك، شوي، كأنها صدفة.')] },
            { t: T('"Old animals have bad days too."', '«الحيوانات الكبيرة بعد تجيها أيام سيئة.»'), then: [M('sad', 'I know. I know. I\'m being stupid.', 'أدري. أدري. أنا أسوي نفسي غبية.'), N1('She isn\'t. You both know she isn\'t.', 'وهي مو غبية. وأنتم الاثنين تدرون إنها مو غبية.')] }
          ] }];
      }
      if (sick(s)) return [N1('Biscuit is curled in the corner. The seed is still where she left it.', 'بسكوت متكوّر في الزاوية. والبذرة لسا مكانها.')];
      /* the day after: he eats again */
      if (s.f.bisScare && !s.f.bisWell && s.day > s.f.bisScare) {
        s.f.bisWell = true; addMood(1);
        const out = [N1('Biscuit is sitting up on his back legs, stuffing seeds into his cheeks until his face is twice its size, as if yesterday never happened.', 'بسكوت واقف على رجوله ورا، يحشي البذور في خدوده لين صار وجهه ضعفين، كأن أمس ما صار.')];
        if (home(s)) out.push({ show: [{ id: 'margaret', e: 'smile' }] }, M('smile', 'I know he\'ll go one day. I know. Just not this week.', 'أدري إنه بيروح يوم. أدري. بس مو هالأسبوع.'));
        return out;
      }
      /* once a day: look after him */
      if (doneToday('bisCare')) return [N1(...fresh('bisZ', [
        ['He\'s asleep again, in a heap of bedding with one foot sticking out.', 'نايم مرة ثانية، في كومة نشارة ورجل وحدة طالعة.'],
        ['He is running on his wheel with total commitment and going nowhere. You know the feeling.', 'يركض على عجلته بكل جدية وما يوصل لأي مكان. {تعرف|تعرفين} هالإحساس.']]))];
      return [{ q: T('Biscuit is awake and looking at you, whiskers going.', 'بسكوت صاحي ويطالعك، وشواربه تتحرك.'), menu: [
        { t: T('Give him some seeds', '{تعطيه|تعطينه} بذور'), then: [N1('He takes each seed in both hands, turns it, and pushes it into his cheek. Then the next. Then the next. He is now mostly cheek.', 'ياخذ كل بذرة بيدينه الثنتين، ويلفها، ويدفها في خده. وبعدين اللي بعدها. واللي بعدها. والحين أغلبه خدود.'), st => care(st)] },
        { t: T('Change his water', '{تغير|تغيرين} مويته'), then: [N1('Fresh water in the little bottle. He comes over at once and drinks with tiny, serious clicks.', 'موية جديدة في القارورة الصغيرة. يجي على طول ويشرب بطقطقات صغيرة وجدية.'), st => care(st)] },
        { t: T('Hold him', '{تمسكه|تمسكينه} بيدك'), then: [N1('He walks onto your palm like he\'s checking the ground, then sits. He is warm and weighs nothing. His heart is going like a little clock.', 'يمشي على كفك كأنه يتأكد من الأرض، وبعدين يجلس. دافي وما له وزن. وقلبه يدق مثل ساعة صغيرة.'), st => care(st)] },
        { t: T('Let him sleep', '{خله|خليه} ينام'), then: [] }
      ] }];
    } });

  function care(s) {
    onceToday('bisCare'); addMood(1);
    const n = s.f.bisCare = (s.f.bisCare || 0) + 1;
    if (!home(s) || n > TELLS.length) return null;
    return [{ show: [{ id: 'margaret', e: TELLS[n - 1][0].e }] }].concat(TELLS[n - 1]);
  }

  /* at night, from the sitting room: his wheel */
  if (L.marg_living) L.marg_living.spots.push({ x: 84, y: 40, label: T('A tiny squeaking, from the sunroom', 'صرير صغير، من غرفة الزرع'),
    if: s => inHouse(s) && s.slot === NIGHT && !doneToday('bisWheel'),
    run: s => { onceToday('bisWheel'); return [N1(...(s.f.bisSeen
      ? ['Biscuit, on his wheel, at full speed, in the dark. It\'s the only thing in the house that sounds busy.', 'بسكوت على عجلته، بأقصى سرعة، في الظلام. هو الشي الوحيد في البيت اللي صوته مشغول.']
      : ['Squeak, squeak, squeak, very fast and very small, from the sunroom. Something in this house is alive and in a hurry.', 'صرير، صرير، صرير، سريع مرة وصغير مرة، من غرفة الزرع. فيه شي في هالبيت حي ومستعجل.']))]; } });
})();
