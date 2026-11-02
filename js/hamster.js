/* =====================================================================
   Biscuit, Daniel's hamster (Margaret's house).
   In the sunroom, among the plants, a small cage with a note in a boy's
   handwriting: "BISCUIT — NO CHOCOLATE!! — D." Daniel's Biscuit died last
   spring. This one is tiny and new: Margaret bought him "so the cage
   wouldn't be empty", and gave him the same name. She keeps him the way
   she keeps the sunroom: alive, on purpose.
     · the first time: Margaret finds you at the cage and tells you whose
       he was (and smiles, for the first time);
     · once a day you can look after him: seeds, fresh water, or hold him
       in your hand; each time she tells you one small thing about Daniel;
     · one morning the cage is open and he is gone, and she is frightened;
       you find him asleep in the toe of Daniel's old trainer.
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

  /* what Margaret tells you, one a day, while you look after him */
  const TELLS = [
    [M('smile', 'Daniel bought the first Biscuit with his own pocket money. Fifteen. Stood in the kitchen and said "Don\'t worry, Mum, he won\'t sleep in my room." He slept in his room every night for two years.', 'دانيال شرى بسكوت الأول بمصروفه. كان عمره خمستعش. وقف في المطبخ وقال «لا تخافين يمه، ما راح ينام في غرفتي.» ونام في غرفته كل ليلة سنتين.')],
    [M('neutral', 'Daniel used to talk to him at night, when he thought I was asleep. About school. About a girl. Mostly about the girl.', 'دانيال كان يكلمه بالليل، لما يحسبني نايمة. عن المدرسة. وعن بنت. أغلب الكلام عن البنت.')],
    [M('smile', 'Daniel taught the first one to come out of the cage and go back in when he whistled. Didn\'t tell me for a month. I found out because Biscuit was in my slipper.', 'دانيال علّم الأول يطلع من القفص ويرجع لما يصفر. وما قال لي إلا بعد شهر. عرفت لأني لقيت بسكوت في نعالي.')],
    [M('sad', 'After the funeral I didn\'t feed the old one for a day. I forgot he existed. Then I heard the wheel at three in the morning, and I sat on the floor by the cage until it was light.', 'بعد الجنازة ما أكّلت القديم يوم كامل. نسيت إنه موجود. وبعدين سمعت العجلة الساعة ثلاث الفجر، وجلست على الأرض جنب القفص لين طلع النور.')],
    [M('smile', 'This one bit me the first day. Daniel\'s never bit anyone. I said "well, you\'re your own hamster, then", and I think that\'s when I started to like him.', 'هذا عضني أول يوم. حق دانيال عمره ما عض أحد. قلت له «طيب، أنت همستر لحالك»، وأظن من يومها بديت أحبه.')],
    [M('smile', 'Thank you for looking after him. He likes you. He hides his seeds in your sleeve. That\'s how you know.', 'مشكور{|ة} إنك {تهتم|تهتمين} فيه. هو يحبك. يخبي بذوره في كمك. هذي الطريقة اللي تعرف فيها.')]
  ];

  L.marg_garden.spots.push({ x: 74, y: 52, label: T('A small cage among the plants', 'قفص صغير بين الزرع'),
    if: s => inHouse(s),
    run: s => {
      /* the first time */
      if (!s.f.bisSeen) {
        s.f.bisSeen = s.day;
        const out = [
          N1('A small cage among the hydrangeas, cleaner than anything else in the house. In the bedding, a tiny gold-and-white hamster, no bigger than a walnut, is asleep, breathing very fast. Taped to the bars, in a boy\'s capitals: "BISCUIT — NO CHOCOLATE!! — D."', 'قفص صغير بين الهيدرانجيا، أنظف من أي شي ثاني في البيت. وفي النشارة، همستر صغير ذهبي وأبيض، مو أكبر من جوزة، نايم ويتنفس بسرعة. وملصوق على القضبان، بحروف ولد كبيرة: «بسكوت — لا تعطونه شوكولاتة!! — د.»')
        ];
        if (home(s)) out.push({ show: [{ id: 'margaret', e: 'neutral' }] },
          M('neutral', 'That\'s Biscuit. Well. Biscuit the second. Daniel\'s Biscuit died last spring. I couldn\'t stand the empty cage.', 'هذا بسكوت. يعني، بسكوت الثاني. بسكوت حق دانيال مات الربيع اللي فات. وما قدرت أتحمل القفص فاضي.'),
          M('smile', 'Don\'t wake him. He\'s three months old and he thinks he owns the house. He might be right.', 'لا {تصحيه|تصحينه}. عمره ثلاث شهور ويحسب إنه يملك البيت. يمكن معه حق.'),
          N1('It\'s the first time you have seen her smile. It doesn\'t last, but it was there.', 'هذي أول مرة {تشوفها|تشوفينها} تبتسم. ما طوّلت، بس كانت موجودة.'));
        return out;
      }
      /* the morning he gets out */
      if (!s.f.bisScare && (s.f.bisCare || 0) >= 3 && home(s) && s.slot <= 1) {
        s.f.bisScare = s.day; s.f.bisWell = true;
        return [{ show: [{ id: 'margaret', e: 'worry' }] },
          N1('The cage door is open. The bedding is empty. Margaret is on her knees looking under the plant pots, very fast, very quietly.', 'باب القفص مفتوح. والنشارة فاضية. ومارغريت على ركبها تدور تحت الأحواض، بسرعة، وبهدوء مرة.'),
          M('sad', 'I left it open. I left it open. He\'s so small, he could be anywhere, he could be in the walls—', 'تركته مفتوح. تركته مفتوح. هو صغير مرة، ممكن يكون في أي مكان، ممكن يكون داخل الجدران—'),
          { menu: [
            { t: T('Look under the wicker chair', '{تدور|تدورين} تحت كرسي الخيزران'), then: [N1('Nothing but a seed husk. He was here, though.', 'ما فيه إلا قشرة بذرة. بس كان هنا.')] },
            { t: T('Follow the seed husks', '{تتبع|تتبعين} قشور البذور'), then: [] }
          ] },
          N1('A trail of tiny seed husks goes across the floor, out of the sunroom, through the sitting room, to the shoe rack by the door. In the toe of an old trainer, much too big for anyone in this house now, there is a small warm ball of hamster, fast asleep.', 'خط قشور بذور صغيرة يمشي على الأرض، من غرفة الزرع، ويقطع الصالة، لين رف الجزم عند الباب. وفي مقدمة جزمة رياضية قديمة، كبيرة على أي أحد في البيت الحين، فيه كورة همستر صغيرة ودافية، نايمة بعمق.'),
          { show: [{ id: 'margaret', e: 'cry' }] },
          M('sad', 'That\'s Daniel\'s. That was Daniel\'s shoe.', 'هذي حق دانيال. هذي جزمة دانيال.'),
          N1('She doesn\'t take him out. She sits down on the floor next to the shoe rack and laughs and cries at the same time, and you sit down with her, and Biscuit sleeps through all of it.', 'ما تطلعه. تجلس على الأرض جنب رف الجزم، وتضحك وتبكي بنفس الوقت، {وتجلس|وتجلسين} معها، وبسكوت نايم وما درى بشي.'),
          st => { addMood(1); return null; }];
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
