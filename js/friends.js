/* =====================================================================
   Friendships that grow.
   Six people in town can become your friends: Marco, Olivia, Kai,
   Stella, Maya and Sami. It goes in three steps:
     · talk to them on different days (one point a day, the first
       time you talk about anything)
     · then they ask you to spend time with them: a small outing, a
       story of theirs, and a chance to tell them something of yours
     · after the third outing they are close friends, and give you
       something to keep
   What you tell them about yourself (why you came, the house, your
   father, your mother) they remember, and bring up later.
   Only its own flags (s.f.fr, s.f.told, fr_*). Nothing here reads or
   changes trust, suspicion or any ending.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const say = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const FR = ['marco', 'olivia', 'kai', 'stella', 'maya', 'sami'];
  const NEED = [2, 5, 9];          /* points needed before outing 1, 2, 3 */
  const LV = [T('', ''), T('getting to know each other', 'تتعرفون على بعض'), T('friends', 'أصحاب'), T('close friends', 'أصحاب قريبين')];

  const fr = s => (s.f.fr = s.f.fr || {});
  const pts = (s, id) => fr(s)[id] || 0;
  const outs = (s, id) => (s.f['fr_' + id + '_h3'] ? 3 : s.f['fr_' + id + '_h2'] ? 2 : s.f['fr_' + id + '_h1'] ? 1 : 0);
  GAME.friendLevel = (id, s = S()) => outs(s, id);
  function bump(s, id, n) {
    fr(s)[id] = pts(s, id) + n;
  }

  /* ---------- telling them about yourself ---------- */
  const TELL = {
    why: { t: T('Tell them why you really came', '{تحكي|تحكين} ليش {جيت|جيتي} فعلاً'),
      you: T('"My dad had a postcard of this harbour in a box. He never once said the name of this town. I wanted to know why."', '«أبوي كان عنده كرت بريدي لهالميناء في كرتون. وعمره ما قال اسم هالبلد. بغيت أعرف ليش.»') },
    house: { t: T('Tell them about the house', '{تحكي|تحكين} عن البيت'),
      you: T('"I came home from a trip and my key didn\'t fit. A family I\'d never met was eating dinner in my kitchen."', '«رجعت من سفرة والمفتاح ما ركب. عايلة عمري ما شفتها كانت تتعشى في مطبخي.»') },
    dad: { t: T('Tell them about your dad', '{تحكي|تحكين} عن أبوك'),
      you: T('"My dad died in the spring. He left debts nobody knew about. Not Mum. Not me."', '«أبوي توفى في الربيع. وخلّى ديون محد كان يدري عنها. لا أمي. ولا أنا.»') },
    mum: { t: T('Tell them about your mum', '{تحكي|تحكين} عن أمك'),
      you: T('"My mum has texted me every day for a month. I haven\'t answered once."', '«أمي ترسل لي كل يوم من شهر. وما رديت ولا مرة.»') }
  };
  /* what each of them says back */
  const R = {
    marco: {
      why: ['shock', 'A postcard? Of THIS harbour? Nobody has sold that postcard since the nineties. Your father had taste. Terrible taste. In harbours.', 'كرت؟ لهالميناء بالذات؟ محد باع هالكرت من التسعينات. أبوك كان عنده ذوق. ذوق سيئ. في الموانئ.'],
      house: ['sad', 'In your kitchen. Eating. Madonna. I would have sat down and asked for a plate. ...No. I would have cried. I am a crier.', 'في مطبخك. ياكلون. يا ساتر. أنا كنت بجلس وأطلب صحن. ...لا. كنت ببكي. أنا من النوع اللي يبكي.'],
      dad: ['sad', 'My nonna left me a café and a recipe. Nobody told me what else she left: her loans, her feuds, a cousin in Naples. People leave more than they say.', 'جدتي خلت لي مقهى ووصفة. ومحد قال لي وش خلت بعد: ديونها، وعداواتها، وولد عم في نابولي. الناس يخلّون أكثر من اللي يقولونه.'],
      mum: ['neutral', 'One text. Not a whole conversation. Just "I\'m alive, the coffee here is excellent." She will know it\'s true because I will be in it.', 'رسالة وحدة. مو سالفة كاملة. بس «أنا عايش، والقهوة هنا ممتازة.» وبتعرف إنها صادقة لأني أنا فيها.']
    },
    olivia: {
      why: ['shock', 'A postcard from before the sea wall? That\'s evidence. That\'s history. Can I photograph it for the petition? ...Sorry. You were having a moment. Have your moment.', 'كرت من قبل الحاجز؟ هذا دليل. هذا تاريخ. أقدر أصوره للعريضة؟ ...آسفة. كانت عندك لحظة. {خذ|خذي} لحظتك.'],
      house: ['angry', 'They just... moved in? With your things by the gate? That\'s what they want to do to the whole Row. Box it up and leave it by the gate.', 'دخلوا كذا؟ وأغراضك عند البوابة؟ هذا اللي يبون يسوونه بالشارع كله. يعبونه في كراتين ويحطونه عند البوابة.'],
      dad: ['sad', 'I\'m sorry. Really. I talk so much about houses, I forget they\'re only about the people in them.', 'آسفة. صدق. أتكلم كثير عن البيوت لدرجة إني أنسى إن الموضوع كله عن الناس اللي فيها.'],
      mum: ['neutral', 'Write it like a letter to the council. Short. Polite. One clear request: "Please give me a bit more time." Councils hate it. Mums don\'t.', '{اكتبها|اكتبيها} مثل رسالة للمجلس. قصيرة. مؤدبة. طلب واحد واضح: «{عطيني|عطيني} وقت شوي بعد.» المجلس يكرهها. الأمهات لا.']
    },
    kai: {
      why: ['smile', 'That\'s the best reason anyone\'s ever had for coming here. Most people come for the chips.', 'هذا أحسن سبب أحد جاء هنا عشانه. أغلب الناس يجون عشان البطاطس.'],
      house: ['shock', 'Whoa. That\'s like paddling back in and the beach is gone. ...You can share my board. As a house. It\'s a terrible house.', 'واو. كأنك {ترجع|ترجعين} للشط وتلقى الشاطئ اختفى. ...{تقدر|تقدرين} {تشاركني|تشاركيني} لوحي. كبيت. بيت سيئ مرة.'],
      dad: ['sad', 'Mine didn\'t die. He just went. I don\'t know which is worse. I think yours, because you can\'t be angry at him properly.', 'أبوي ما مات. بس راح. ما أدري أيهم أسوأ. أظن حقك، لأنك ما {تقدر|تقدرين} {تزعل|تزعلين} عليه صح.'],
      mum: ['neutral', 'Ten minutes of sad, then you text her. That\'s the rule. I\'ll time you.', 'عشر دقايق حزن، وبعدها {ترسل|ترسلين} لها. هذي القاعدة. أنا بحسب لك.']
    },
    stella: {
      why: ['smile', 'Like a seed in someone\'s coat. You get carried somewhere you never chose and then, well. You find out if you grow.', 'مثل بذرة في جيب أحد. تنشال لمكان ما اخترته، وبعدين، يعني. {تعرف|تعرفين} إذا بتطلع ولا لا.'],
      house: ['sad', 'Oh, love. A house is just a big pot. You can be repotted. It hurts. The roots don\'t like it. But they take.', 'يا قلبي. البيت مجرد قصيصة كبيرة. {تقدر|تقدرين} تنزرع في وحدة ثانية. يوجع. الجذور ما تحب كذا. بس تمسك.'],
      dad: ['sad', 'Lilies, then. No. You hate lilies, I can see it. Something that keeps coming back. Bulbs. Grief is a bulb.', 'زنبق إذن. لا. {تكره|تكرهين} الزنبق، باين عليك. شي يرجع كل سنة. بصيلات. الحزن بصيلة.'],
      mum: ['neutral', 'My mum and I didn\'t talk for two years. Then she sent me a cutting of her geranium, no note. I sent her a photo of it in flower. That was the whole conversation. It was enough.', 'أنا وأمي ما تكلمنا سنتين. وبعدين أرسلت لي عود من الجيرانيوم حقها، بدون ورقة. وأرسلت لها صورته وهو مزهّر. هذي كانت السالفة كلها. وكفّت.']
    },
    maya: {
      why: ['neutral', 'The old harbour. My grandad\'s boat would be on that card somewhere. Everybody\'s was. Before the wall, before the Grand.', 'الميناء القديم. قارب جدي أكيد في الكرت في مكان ما. قارب الكل كان فيه. قبل الحاجز، قبل الغراند.'],
      house: ['angry', 'They took my boat in the night and painted over her name. I know what it is to come back and find your life repainted.', 'أخذوا قاربي بالليل وصبغوا اسمها. أعرف وش يعني {ترجع|ترجعين} {وتلقى|وتلقين} حياتك مصبوغة.'],
      dad: ['neutral', 'Debts. Aye. The sea gives you fish and the bank gives you a letter. My dad had a drawer of those letters. He never opened one.', 'ديون. إيه. البحر يعطيك سمك والبنك يعطيك رسالة. أبوي كان عنده درج كامل من هالرسايل. عمره ما فتح وحدة.'],
      mum: ['neutral', 'Ring her. Don\'t text. A voice tells her more than words do, and she\'s been reading words for a month.', '{اتصل|اتصلي} عليها. لا {ترسل|ترسلين}. الصوت يقول لها أكثر من الكلام، وهي لها شهر تقرا كلام.']
    },
    sami: {
      why: ['neutral', 'Lot of people end up here with a piece of paper and a question. The paper is easy. The question takes longer. You can sit on the bench outside as long as it takes. It\'s a good bench.', 'ناس كثير يوصلون هنا ومعهم ورقة وسؤال. الورقة سهلة. السؤال ياخذ وقت. {تقدر|تقدرين} {تجلس|تجلسين} على الكرسي اللي برا قد ما تبي. كرسي زين.'],
      house: ['sad', 'I gave a family credit for nine years once. When they lost their house, they paid me first. People are better than their luck.', 'مرة عطيت عايلة دين تسع سنين. ولما راح بيتهم، أول واحد سددوه أنا. الناس أحسن من حظهم.'],
      dad: ['sad', 'Hidden debts. Mm. Men hide them to protect you, and it\'s the hiding that hurts you. I\'m sorry, friend.', 'ديون مخبّاة. همم. الرجال يخبونها عشان يحمونك، والتخبية هي اللي توجعك. الله يرحمه يا {صديقي|صديقتي}.'],
      mum: ['neutral', 'My phone is behind the counter. Long distance, free. I won\'t listen. I\'ll stack tins very loudly.', 'تلفوني ورا الكاونتر. دولي، ببلاش. ما راح أسمع. برص العلب بصوت عالي مرة.']
    }
  };
  const told = s => (s.f.told = s.f.told || {});
  function shareMenu(id) {
    return st => {
      const tl = told(st), opts = Object.keys(TELL).filter(k => !(tl[k] || []).includes(id)).map(k => ({
        t: TELL[k].t,
        then: [{ n: TELL[k].you }, say(id, R[id][k][0], R[id][k][1], R[id][k][2]),
          s2 => { const t2 = told(s2); t2[k] = (t2[k] || []).concat(id); addMood(1); return null; }]
      }));
      opts.push({ t: T('Keep it to yourself', '{خلها|خليها} في نفسك'), then: [N1('You shrug and say something about the weather. They let you. That is its own kind of kindness.', '{تهز|تهزين} كتوفك {وتقول|وتقولين} شي عن الجو. ويتركك على راحتك. وهذا نوع من اللطف بعد.')] });
      return opts.length > 1 ? [{ menu: opts }] : null;
    };
  }

  /* ---------- the keepsakes ---------- */
  Object.assign(GAME.ITEMS, {
    frMug: { name: T('A mug with your name on it', 'كوب عليه اسمك'), desc: T('From the shelf behind Marco\'s counter. Your name in marker. Spelled nearly right.', 'من الرف اللي ورا كاونتر ماركو. اسمك بالقلم. مكتوب صح تقريباً.') },
    frBadge: { name: T('"SAVE FISHER\'S ROW" badge', 'بروش «أنقذوا شارع الصيادين»'), desc: T('Olivia only made twenty. "For the people who stayed."', 'أوليفيا سوت عشرين بس. «للي جلسوا.»') },
    frShell: { name: T('A shell on a string', 'صدفة في خيط'), desc: T('Kai found it the day he stopped screaming at the sea.', 'كاي لقاها اليوم اللي بطّل فيه يصرخ على البحر.') },
    frFlower: { name: T('A pressed forget-me-not', 'وردة «لا تنساني» مكبوسة'), desc: T('Between two squares of wax paper. Stella\'s handwriting on the edge: "obviously".', 'بين ورقتين شمع. وبخط ستيلا على الطرف: «طبعاً».') },
    frKnot: { name: T('A rope bracelet', 'سوار حبل'), desc: T('Maya tied it on your wrist with a knot you\'ll never undo. That was the point.', 'مايا ربطته على يدك بعقدة عمرك ما بتفكها. وهذا كان القصد.') },
    frTea: { name: T('A tin of Sami\'s tea', 'علبة شاي سامي'), desc: T('His mother\'s blend. Not for sale. Never has been.', 'خلطة أمه. مو للبيع. عمرها ما كانت.') }
  });

  /* ---------- the outings ---------- */
  const OUT = {
    marco: [
      { label: T('Stay after closing and help Marco stack chairs', '{اجلس|اجلسي} بعد التسكير {وساعد|وساعدي} ماركو يرص الكراسي'), steps: [
        N1('The last customer leaves. Marco turns the sign to CLOSED and hands you a chair without asking. You stack them together.', 'آخر زبون يطلع. ماركو يقلب اللوحة على «مسكّر» ويعطيك كرسي بدون ما يسأل. وترصونها مع بعض.'),
        say('marco', 'smile', 'You know what a café is at night? A theatre with no audience. Best place in the world to try new material.', '{تدري|تدرين} وش المقهى بالليل؟ مسرح بدون جمهور. أحسن مكان في الدنيا تجرب فيه نكت جديدة.'),
        say('marco', 'neutral', 'Okay. Why did the seagull cross the harbour? ...I haven\'t got an ending. I never have an ending. That\'s my whole problem.', 'طيب. ليش النورس قطع الميناء؟ ...ما عندي نهاية. عمري ما يكون عندي نهاية. هذي كل مشكلتي.'),
        { menu: [
          { t: T('"Because the other side had chips."', '«لأن الجهة الثانية فيها بطاطس.»'), then: [say('marco', 'shock', 'That\'s... that\'s GOOD. Can I have it? I\'m having it. You get ten percent.', 'هذي... هذي حلوة! أقدر آخذها؟ بآخذها. لك عشرة بالمية.')] },
          { t: T('"Maybe it doesn\'t need an ending."', '«يمكن ما تحتاج نهاية.»'), then: [say('marco', 'sad', 'Says you. You\'ve never stood up there with a microphone and a silence.', 'هذا كلامك. {أنت|أنتِ} عمرك ما {وقفت|وقفتي} هناك ومعك ميكروفون وسكوت.')] }
        ] },
        say('marco', 'neutral', 'Your turn. Nobody comes to Saltmere in the off season on purpose. What brought you?', 'دورك. محد يجي سولتمير برا الموسم بقصد. وش جابك؟')
      ], end: N1('He walks you to the door and leaves the light on until you turn the corner.', 'يوصلك للباب ويخلي النور مشغّل لين {تلف|تلفين} الزاوية.') },
      { label: T('Go up on the café roof with Marco', '{اطلع|اطلعي} مع ماركو لسطح المقهى'), steps: [
        N1('A ladder behind the kitchen, a hatch, and then the whole harbour under you. Marco has put two kitchen chairs up here, and a blanket.', 'سلّم ورا المطبخ، وفتحة، وبعدين الميناء كله تحتك. ماركو حاط هنا كرسيين من المطبخ، وبطانية.'),
        say('marco', 'neutral', 'My nonna used to sit up here. She said the café was too loud for thinking and the sky was free.', 'جدتي كانت تجلس هنا. تقول المقهى صاخب على التفكير، والسما ببلاش.'),
        say('marco', 'sad', 'She left me the café. Everyone thinks I should be grateful. I am. I also wanted to be in Rome, being funny in front of strangers.', 'خلت لي المقهى. الكل يحسب إني لازم أكون ممتن. وأنا ممتن. وبعد كنت أبي أكون في روما، أضحّك ناس ما أعرفهم.'),
        { menu: [
          { t: T('"You can be both. Grateful and stuck."', '«تقدر تكون الاثنين. ممتن وعالق.»'), then: [say('marco', 'smile', 'Grateful and stuck. Yes. The Italian national condition.', 'ممتن وعالق. إيه. هذي الحالة الوطنية الإيطالية.')] },
          { t: T('"You still could. Go to Rome."', '«لسا تقدر. روح روما.»'), then: [say('marco', 'shock', 'And leave Elias to lose at chess to nobody? ...Maybe. One day. Don\'t say it again or I\'ll start believing it.', 'وأخلي إلياس يخسر شطرنج قدام ولا أحد؟ ...يمكن. يوم من الأيام. لا {تعيدها|تعيدينها} وإلا بصدقها.')] }
        ] },
        say('marco', 'neutral', 'I told you about Rome. Nobody knows about Rome. Tell me something real.', 'قلت لك عن روما. محد يدري عن روما. {قل|قولي} لي شي حقيقي.')
      ], end: N1('You stay up there until the harbour lights come on, one by one, like someone counting.', 'تجلسون فوق لين أنوار الميناء تشتغل، وحدة وحدة، كأن أحد قاعد يعد.') },
      { label: T('Marco is cooking his nonna\'s sauce. For you.', 'ماركو يطبخ صلصة جدته. عشانك.'), steps: [
        N1('Marco shuts the café early, which he has never done, and cooks. The whole street smells of garlic. He sets two plates. Then, after a moment, a third, for nobody.', 'ماركو يسكّر المقهى بدري، وعمره ما سواها، ويطبخ. الشارع كله ريحته ثوم. يحط صحنين. وبعدين، بعد لحظة، صحن ثالث، لأحد مو موجود.'),
        say('marco', 'smile', 'Nonna\'s sauce. Six hours. If you say it needs salt, you are banned for life.', 'صلصة جدتي. ست ساعات. إذا {قلت|قلتي} {تبي|تبين} ملح، {ممنوع|ممنوعة} مدى الحياة.'),
        say('marco', 'neutral', 'The third plate is for her. Don\'t make it weird. ...It\'s a bit weird.', 'الصحن الثالث لها. لا {تخليها|تخلينها} غريبة. ...هي غريبة شوي.'),
        N1('You eat until you can\'t. He watches you eat the way only people who cook watch.', '{تاكل|تاكلين} لين ما {تقدر|تقدرين}. ويطالعك وأنت {تاكل|تاكلين} مثل ما يطالع بس اللي يطبخون.'),
        say('marco', 'smile', 'Here. From the shelf. Now it has your name on it, so nobody else can use it. You\'re not a customer any more. Customers pay.', '{خذ|خذي}. من الرف. الحين عليه اسمك، فمحد غيرك يقدر يستخدمه. {أنت|أنتِ} مو زبون بعد الحين. الزبون يدفع.'),
        st => { give('frMug'); return null; }
      ], end: N1('Walking home, you realise you\'re humming. Badly. His song.', 'وأنت {راجع|راجعة} البيت، {تنتبه|تنتبهين} إنك {تدندن|تدندنين}. غلط. أغنيته.') }
    ],
    olivia: [
      { label: T('Help Olivia hand out leaflets', '{ساعد|ساعدي} أوليفيا توزع منشورات'), steps: [
        N1('Olivia gives you half a stack of leaflets: SAVE FISHER\'S ROW, in a font she clearly chose very carefully. "Smile," she says. "Not like that. Like you believe it."', 'أوليفيا تعطيك نص كومة منشورات: «أنقذوا شارع الصيادين»، بخط واضح إنها اختارته بعناية. «{ابتسم|ابتسمي}،» تقول. «مو كذا. كأنك {مصدق|مصدقة}.»'),
        N1('Twelve people take one. Four read it. One man folds his into a boat and gives it to a child. Olivia counts that as a win.', 'اثنعش واحد ياخذون. أربعة يقرونها. رجال يطوي حقته قارب ويعطيها لطفل. أوليفيا تحسبها فوز.'),
        say('olivia', 'smile', 'People think petitions are about signatures. They\'re about getting people to stop walking for four seconds. Four seconds is a lot, in this town.', 'الناس يحسبون العرايض عن التواقيع. هي عن إنك {توقف|توقفين} الناس عن المشي أربع ثواني. وأربع ثواني كثير، في هالبلد.'),
        say('olivia', 'neutral', 'You walk around like you\'re carrying something. Everyone here does. But you carry yours like it\'s new.', '{تمشي|تمشين} كأنك {شايل|شايلة} شي. الكل هنا كذا. بس {أنت شايله|أنتِ شايلته} كأنه جديد.')
      ], end: N1('She gives you the last leaflet to keep. "For your wall," she says. You haven\'t got a wall. She knows.', 'تعطيك آخر منشور {تخليه|تخلينه} عندك. «لجدارك،» تقول. ما عندك جدار. وهي تدري.') },
      { label: T('Stay with Olivia at the notice board after dark', '{اجلس|اجلسي} مع أوليفيا عند لوحة الإعلانات بعد المغرب'), steps: [
        N1('Olivia is pinning a new notice over an old one: planning permission, in very small print, to demolish numbers 3 to 11, Fisher\'s Row.', 'أوليفيا تثبت إعلان جديد فوق قديم: تصريح، بخط صغير مرة، لهدم البيوت من ٣ لين ١١، شارع الصيادين.'),
        say('olivia', 'angry', 'They put these up at night in tiny writing, so that technically, legally, they told us.', 'يعلقونها بالليل بخط صغير، عشان يقولون رسمياً وقانونياً إنهم قالوا لنا.'),
        say('olivia', 'sad', 'My gran lived on the Row. Every summer of my life was in her kitchen. She thought if she kept the window boxes nice, they wouldn\'t dare.', 'جدتي كانت ساكنة في الشارع. كل صيف في حياتي كان في مطبخها. كانت تحسب إذا خلت أحواض الشبابيك حلوة، ما بيتجرؤون.'),
        say('olivia', 'neutral', 'That\'s why I\'m like this. Loud. Somebody in our family has to be.', 'عشان كذا أنا كذا. صوتي عالي. لازم أحد في عايلتنا يكون كذا.'),
        { menu: [
          { t: T('"Loud is good. Loud works."', '«الصوت العالي زين. الصوت العالي يشتغل.»'), then: [say('olivia', 'smile', 'Write that down. No, I\'ll write it down. On a leaflet.', '{اكتبها|اكتبيها}. لا، أنا بكتبها. على منشور.')] },
          { t: T('"Your gran would be proud."', '«جدتك كانت بتفتخر فيك.»'), then: [say('olivia', 'sad', 'She\'d tell me to stop shouting and come and eat. ...Then she\'d sign it twice.', 'كانت بتقول لي بطّلي صراخ وتعالي كلي. ...وبعدين كانت بتوقع مرتين.')] }
        ] }
      ], end: N1('You hold the pins while she covers the tiny print with a big one: NOT WITHOUT A FIGHT.', '{تمسك|تمسكين} الدبابيس وهي تغطي الخط الصغير بخط كبير: «مو بدون معركة.»') },
      { label: T('Be first in line at the council with Olivia', '{كن|كوني} {أول واحد|أول وحدة} في الطابور عند المجلس مع أوليفيا'), steps: [
        N1('Six in the morning, the steps of the town hall. Olivia has two coffees, a folder as thick as a brick, and a speech.', 'الساعة ست الصبح، درج البلدية. أوليفيا معها قهوتين، وملف سمكه مثل الطوبة، وخطاب.'),
        say('olivia', 'neutral', 'If we\'re first in, we get the front row. If we get the front row, they have to look at us.', 'إذا كنا أول ناس، ناخذ الصف الأول. وإذا أخذنا الصف الأول، لازم يطالعون فينا.'),
        N1('She rehearses her speech at you four times. It gets better each time. By the fourth it makes you want to stand up.', 'تتمرن على خطابها قدامك أربع مرات. كل مرة يصير أحسن. وبالرابعة {تحس|تحسين} {تبي|تبين} {توقف|توقفين}.'),
        say('olivia', 'smile', 'Here. I only made twenty. They\'re for the people who stayed.', '{خذ|خذي}. سويت عشرين بس. هي للي جلسوا.'),
        st => { give('frBadge'); return null; }
      ], end: N1('At nine the doors open. You\'re first in. They have to look at you.', 'الساعة تسع تنفتح الأبواب. أنتم أول ناس. ولازم يطالعون فيكم.') }
    ],
    kai: [
      { label: T('Sit on the sand with Kai', '{اجلس|اجلسي} على الرمل مع كاي'), steps: [
        N1('Kai doesn\'t surf. He sits on his board on the sand like it\'s a sofa and pats the space next to him.', 'كاي ما يركب موج. يجلس على لوحه فوق الرمل كأنه كنبة ويطق على المكان اللي جنبه.'),
        say('kai', 'smile', 'People think surfing is about the waves. It\'s mostly the waiting. I\'m incredible at the waiting.', 'الناس يحسبون ركوب الموج عن الموج. أغلبه انتظار. وأنا خطير في الانتظار.'),
        say('kai', 'neutral', 'So what\'s your deal? You\'ve got the face of someone waiting for a wave that already went.', 'طيب وش سالفتك؟ وجهك وجه أحد ينتظر موجة راحت خلاص.')
      ], end: N1('A wave comes in. Neither of you gets up for it. That seems fine.', 'موجة تجي. ولا واحد فيكم يقوم لها. وعادي.') },
      { label: T('Let Kai show you his secret cove', '{خل|خلي} كاي يوريك خليجه السري'), steps: [
        N1('Past the rocks, along a path that is mostly a rumour, a cove the size of a living room. Nobody else is there. Nobody has ever been there, by the look of it.', 'ورا الصخور، في طريق أغلبه إشاعة، خليج صغير قد الصالة. ما فيه أحد. وواضح إن محد جاه أبد.'),
        say('kai', 'neutral', 'I found this when my dad left. I was twelve. I came here every day for a year and screamed at the sea.', 'لقيته لما أبوي راح. كان عمري اثنعش. جيته كل يوم لمدة سنة وصرخت على البحر.'),
        say('kai', 'smile', 'Then one day I didn\'t feel like screaming. So I learned to surf instead. Badly. Ten minutes of sad, max. The sea taught me that.', 'وبعدين يوم من الأيام ما حسيت إني أبي أصرخ. فتعلمت أركب موج بدال. بشكل سيئ. عشر دقايق حزن، بالكثير. البحر علمني كذا.'),
        { menu: [
          { t: T('"Can I scream at it?"', '«أقدر أصرخ عليه؟»'), then: [N1('You do. It is much louder than you expected. The sea doesn\'t mind.', '{تصرخ|تصرخين}. أعلى بكثير مما {توقعت|توقعتي}. والبحر ما يمانع.'), say('kai', 'shock', 'Whoa. Okay. You needed that.', 'واو. طيب. كنت {محتاجها|محتاجتها}.'), st => { addMood(1); return null; }] },
          { t: T('"Does it work, the ten minutes?"', '«تشتغل، العشر دقايق؟»'), then: [say('kai', 'neutral', 'Mostly. Some days it\'s eleven.', 'غالباً. بعض الأيام تصير إحدعش.')] }
        ] }
      ], end: N1('On the way back he walks in front, so you can wipe your face without him seeing. He\'s smarter than he lets on.', 'وأنتم راجعين يمشي قدام، عشان {تمسح|تمسحين} وجهك بدون ما يشوف. أذكى مما يبين.') },
      { label: T('Kai wants to show you something on the water', 'كاي يبي يوريك شي في البحر'), steps: [
        N1('Dusk. Kai pushes his board into the shallows and tells you to put your hand in. The water lights up around your fingers, green and blue, like you\'re stirring stars.', 'المغرب. كاي يدف لوحه في الموية الضحلة ويقول لك {حط|حطي} يدك. الموية تنور حول أصابعك، أخضر وأزرق، كأنك {تحرك|تحركين} نجوم.'),
        say('kai', 'smile', 'Plankton. Tiny little guys. They only light up when something moves them. Bit like people.', 'عوالق. كائنات صغيرة. تنور بس لما شي يحركها. شوي مثل الناس.'),
        say('kai', 'neutral', 'Here. I found it the day I stopped screaming. I\'ve been waiting to give it to someone who needed it more. That\'s you. Sorry. It\'s you.', '{خذ|خذي}. لقيتها اليوم اللي بطلت فيه أصرخ. كنت أنتظر أعطيها لأحد محتاجها أكثر مني. وهذا {أنت|أنتِ}. آسف. {أنت|أنتِ}.'),
        st => { give('frShell'); return null; }
      ], end: N1('You stay until the water goes dark again. Kai narrates the plankton\'s inner lives the whole time. You let him.', 'تجلسون لين الموية تظلم مرة ثانية. وكاي يعلق على حياة العوالق الداخلية طول الوقت. {وتخليه|وتخلينه}.') }
    ],
    stella: [
      { label: T('Help Stella with the morning deliveries', '{ساعد|ساعدي} ستيلا في توصيلات الصبح'), steps: [
        N1('A bicycle with a basket so full of flowers you can\'t see the front wheel. Stella pushes, you carry. The clinic, the café, a grave, a birthday.', 'دراجة سلتها مليانة ورد لدرجة ما يبان الكفر الأمامي. ستيلا تدف وأنت {تشيل|تشيلين}. العيادة، والمقهى، وقبر، وعيد ميلاد.'),
        say('stella', 'smile', 'Flowers are just messages people are too shy to say. I\'m a postwoman, really. A very damp postwoman.', 'الورد مجرد رسايل الناس يستحون يقولونها. أنا ساعية بريد، صدق. ساعية بريد مبلولة مرة.'),
        say('stella', 'neutral', 'You\'ve been here a while and nobody\'s sent you any. That\'s not a comment. Well. It\'s a small comment.', '{صار لك|صار لك} هنا فترة ومحد أرسل لك ولا وردة. هذا مو تعليق. يعني. تعليق صغير.')
      ], end: N1('At the end she gives you the one bloom left in the basket. "Undelivered," she says. "Happens. Now it\'s yours."', 'في الأخير تعطيك آخر وردة باقية في السلة. «ما توصّلت،» تقول. «تصير. الحين حقتك.»') },
      { label: T('Sit with Stella in the back of the shop', '{اجلس|اجلسي} مع ستيلا ورا المحل'), steps: [
        N1('Behind the shop there\'s a glass lean-to so full of plants it feels like being inside a lung. One pot, on its own, has nothing in it but soil.', 'ورا المحل فيه غرفة زجاج مليانة نباتات لدرجة تحس إنك داخل رئة. وفيه قصيصة وحدة، بروحها، ما فيها إلا تراب.'),
        say('stella', 'neutral', 'That\'s my oldest plant. It\'s a bulb. It hasn\'t come up in three years. Everyone says throw it out.', 'هذي أقدم نبتة عندي. بصيلة. ما طلعت من ثلاث سنين. الكل يقول ارميها.'),
        say('stella', 'sad', 'I water it on Sundays. Not because I think it\'ll come up. Because what if it does, and nobody was there.', 'أسقيها كل أحد. مو لأني أحسبها بتطلع. بس لأن تخيل تطلع، ومحد موجود.'),
        { menu: [
          { t: T('"I\'ll water it, if you\'re ever away."', '«أنا أسقيها إذا سافرتي يوم.»'), then: [say('stella', 'smile', 'Sundays. Just a little. And talk to it. It likes gossip.', 'كل أحد. شوي بس. {وكلمها|وكلميها}. تحب السوالف.')] },
          { t: T('"Maybe it\'s just resting."', '«يمكن بس قاعدة ترتاح.»'), then: [say('stella', 'smile', 'That\'s what I tell people about me.', 'هذا اللي أقوله للناس عني.')] }
        ] }
      ], end: N1('When you leave, the shop smells of you a bit, and you smell of the shop. Stella says that\'s how it starts.', 'لما {تطلع|تطلعين}، المحل فيه ريحتك شوي، وأنت فيك ريحة المحل. ستيلا تقول كذا تبدأ.') },
      { label: T('Stella has something for you', 'ستيلا عندها لك شي'), steps: [
        N1('Stella is standing in the doorway, holding a flat square of wax paper very carefully, as if it might fly off.', 'ستيلا واقفة عند الباب، ماسكة مربع ورق شمع بحذر مرة، كأنه بيطير.'),
        say('stella', 'smile', 'Forget-me-not. Pressed. I don\'t give these to customers. Customers get roses and a receipt.', 'لا تنساني. مكبوسة. ما أعطيها للزباين. الزباين ياخذون ورد جوري وفاتورة.'),
        say('stella', 'neutral', 'You\'ll leave one day. People do. This is so you don\'t. Forget, I mean. Not leave. You can leave. Oh, I\'ve ruined it.', 'بتمشي يوم. الناس يمشون. هذي عشان ما {تنسى|تنسين}. يعني. مو عشان ما {تمشي|تمشين}. {تقدر|تقدرين} {تمشي|تمشين}. أوه، خربتها.'),
        st => { give('frFlower'); return null; }
      ], end: N1('You haven\'t ruined anything, you tell her. She cries a little, and blames the pollen.', '{تقول|تقولين} لها إنها ما خربت شي. تبكي شوي، وتلوم حبوب اللقاح.') }
    ],
    maya: [
      { label: T('Help Maya mend lobster pots', '{ساعد|ساعدي} مايا تصلّح أقفاص السلطعون'), steps: [
        N1('A pile of broken lobster pots on the quay and a roll of wire. Maya shows you once, then watches you do it wrong, then shows you again without saying anything.', 'كومة أقفاص سلطعون مكسورة على الرصيف ولفة سلك. مايا توريك مرة، وبعدين تطالعك {تغلط|تغلطين}، وبعدين توريك مرة ثانية بدون ما تقول شي.'),
        say('maya', 'neutral', 'You learn like Elias teaches. Hands first, mouth shut. Good. Most people want it explained.', '{تتعلم|تتعلمين} مثل ما إلياس يعلّم. اليدين أول، والفم مسكّر. زين. أغلب الناس يبون شرح.'),
        say('maya', 'neutral', 'What do you do, when you\'re not here? You look like someone who used to have a different life.', 'وش {تسوي|تسوين} لما {ما تكون|ما تكونين} هنا؟ شكلك أحد كانت عنده حياة ثانية.')
      ], end: N1('By the time the light goes, you\'ve mended three. She checks them, grunts, and stacks them with hers.', 'لين يروح الضو {صلّحت|صلّحتي} ثلاثة. تفحصها، وتهمهم، وترصها مع حقتها.') },
      { label: T('Go out in the borrowed boat with Maya', '{اطلع|اطلعي} مع مايا في القارب المستلف'), steps: [
        N1('It\'s not her boat. She makes sure you know that, twice. But she handles it like she was born in it, which, she says, she nearly was.', 'مو قاربها. وتتأكد إنك {تدري|تدرين}، مرتين. بس تسوقه كأنها انولدت فيه، وتقول إنها تقريباً كذا.'),
        say('maya', 'neutral', 'My grandad named his boat after my nan. My dad named his after my mum. I named mine after nobody. Gull\'s Luck. I thought I\'d be lucky.', 'جدي سمى قاربه على اسم جدتي. وأبوي سمى قاربه على اسم أمي. وأنا سميت حقي على ولا أحد. «حظ النورس». حسبت بيكون عندي حظ.'),
        say('maya', 'sad', 'Somewhere out there someone\'s painted over her name and is using her to make money for the Grand. I can feel it. Like a tooth that\'s gone.', 'في مكان ما برا فيه أحد صبغ اسمها وقاعد يستخدمها يجيب فلوس للغراند. أحس فيها. مثل ضرس راح.'),
        { menu: [
          { t: T('"We\'ll find her."', '«بنلقاها.»'), then: [say('maya', 'neutral', '"We." Huh. All right. We.', '«بنلقاها». همم. طيب. احنا.')] },
          { t: T('Say nothing. Just sit with her.', 'لا {تقول|تقولين} شي. بس {اجلس|اجلسي} معها.'), then: [N1('The engine putters. She doesn\'t need you to fix it. She needed someone else in the boat.', 'المكينة تطقطق. ما تحتاجك {تصلح|تصلحين} شي. كانت تحتاج أحد ثاني في القارب.')] }
        ] }
      ], end: N1('She lets you tie up at the end. Your knot holds. She doesn\'t say anything, which, from Maya, is a speech.', 'تخليك {تربط|تربطين} القارب في الأخير. عقدتك تمسك. ما تقول شي، وهذا، من مايا، خطاب.') },
      { label: T('Maya wants to see your hands', 'مايا تبي تشوف يدينك'), steps: [
        say('maya', 'neutral', 'Give me your wrist. No, the left one. The left one is the one you look at.', '{عطني|عطيني} معصمك. لا، اليسار. اليسار هو اللي تطالعه.'),
        N1('She ties a bracelet of thin blue rope around it, with a knot so small and tight it looks like it grew there.', 'تربط عليه سوار حبل أزرق رفيع، بعقدة صغيرة ومشدودة لدرجة تبين كأنها نبتت هناك.'),
        say('maya', 'smile', 'Fisherman\'s knot. You can\'t untie it. You\'d have to cut it. So don\'t.', 'عقدة صياد. ما تنفك. لازم تقصها. فلا {تقصها|تقصينها}.'),
        st => { give('frKnot'); return null; }
      ], end: N1('She goes back to her nets without another word. You keep turning your wrist to look at it.', 'ترجع لشباكها بدون ولا كلمة. وأنت {تقلب|تقلبين} معصمك عشان {تطالعه|تطالعينه}.') }
    ],
    sami: [
      { label: T('Help Sami close the shop', '{ساعد|ساعدي} سامي يسكّر المحل'), steps: [
        N1('Sami pulls the shutter halfway down, which in Saltmere means "closed, unless it\'s you". You face the tins so their labels point outward. He says it matters.', 'سامي ينزّل الباب لنصه، وهذا في سولتمير معناه «مسكّر، إلا إذا {كنت أنت|كنتِ أنتِ}». {ترتب|ترتبين} العلب عشان الأسماء تطالع لبرا. يقول إنها مهمة.'),
        say('sami', 'neutral', 'When a shelf looks after itself, people trust the shop. When people trust the shop, they come in when they\'re sad. That\'s half my business. Sad people buying biscuits.', 'لما الرف يكون مرتب، الناس يثقون في المحل. ولما يثقون، يجون لما يكونون زعلانين. وهذا نص شغلي. ناس زعلانين يشترون بسكوت.'),
        say('sami', 'neutral', 'You came in sad, the first night. I gave you water. Now you\'re facing my tins. That\'s a good story so far.', '{جيت زعلان|جيتي زعلانة} أول ليلة. عطيتك ماي. والحين {ترتب|ترتبين} علبي. هذي سالفة حلوة لين الحين.')
      ], end: N1('He gives you a biscuit from an open packet, "staff discount". You\'re staff now, apparently.', 'يعطيك بسكوتة من باكيت مفتوح، «خصم الموظفين». واضح إنك صرت {موظف|موظفة}.') },
      { label: T('Have tea with Sami in the back room', '{اشرب|اشربي} شاي مع سامي في الغرفة اللي ورا'), steps: [
        N1('The back room is boxes and one armchair and a kettle older than you. On the wall, a school exercise book hangs from a nail. Sami\'s credit book.', 'الغرفة اللي ورا كراتين وكرسي واحد وغلاية أقدم منك. وعلى الجدار، دفتر مدرسة معلق على مسمار. دفتر ديون سامي.'),
        say('sami', 'neutral', 'Everybody in this book owes me something. Most of them I\'ll never ask. Some of them are dead. I keep them in the book anyway.', 'كل اللي في هالدفتر يطلبوني شي. أغلبهم عمري ما بطالبهم. وبعضهم ماتوا. وأخليهم في الدفتر على كل حال.'),
        say('sami', 'sad', 'My father kept a book like this. When he died, my mother burned it. Every page. She said, "Now nobody owes us anything, and we owe nobody." I\'ve never been so proud of anyone.', 'أبوي كان عنده دفتر مثل هذا. لما مات، أمي حرقته. كل صفحة. قالت: «الحين محد يطلبنا شي، واحنا ما نطلب أحد.» عمري ما افتخرت بأحد كذا.'),
        { menu: [
          { t: T('"Is my name in it?"', '«اسمي فيه؟»'), then: [say('sami', 'smile', 'Water, the first night. I crossed it out. You paid it back facing tins.', 'ماي، أول ليلة. شطبته. {سددته|سددتيه} وأنت {ترتب|ترتبين} العلب.')] },
          { t: T('"Would you ever burn yours?"', '«بتحرق دفترك يوم؟»'), then: [say('sami', 'neutral', 'When I\'m old. On the beach. With everyone in it watching. And a lot of biscuits.', 'لما أكبر. على الشاطئ. وكل اللي فيه يتفرجون. ومعنا بسكوت كثير.')] }
        ] }
      ], end: N1('The kettle clicks off. He pours, and you drink, and for a while neither of you is in anybody\'s book.', 'الغلاية تطفي. يصب، {وتشرب|وتشربين}، وشوي، ولا واحد فيكم في دفتر أحد.') },
      { label: T('Sami is waiting for you with a tin', 'سامي ينتظرك ومعه علبة'), steps: [
        N1('A small square tin, dented, no label, on the counter with your name on a sticky note.', 'علبة مربعة صغيرة، مطعوجة، بدون اسم، على الكاونتر وعليها ورقة لاصقة باسمك.'),
        say('sami', 'smile', 'My mother\'s tea. Not for sale. Never has been. I give it to people who stay long enough to be bored of me.', 'شاي أمي. مو للبيع. عمره ما كان. أعطيه للي يجلسون لين يملّون مني.'),
        say('sami', 'neutral', 'One spoon, not two. Two is for funerals.', 'ملعقة وحدة، مو ثنتين. الثنتين للعزاء.'),
        st => { give('frTea'); return null; }
      ], end: N1('You put it in your bag carefully, next to the postcard. It seems like the right place.', '{تحطها|تحطينها} في شنطتك بحذر، جنب الكرت. يبان إنه المكان الصح.') }
    ]
  };

  /* ---------- wiring ---------- */
  const ok = s => s && !s.f.prologue && !!s.f.metElias && s.slot < NIGHT;
  FR.forEach(id => {
    if (!GAME.CHAR[id]) return;
    GAME.TOPICS[id] = GAME.TOPICS[id] || [];
    /* talking to them about anything, once a day, is a point */
    GAME.TOPICS[id].forEach(t => {
      const r = t.run;
      t.run = s => { if (s.f['frDay_' + id] !== s.day) { s.f['frDay_' + id] = s.day; bump(s, id, 1); } return typeof r === 'function' ? r(s) : r; };
    });
    OUT[id].forEach((o, i) => {
      const k = i + 1;
      GAME.TOPICS[id].unshift({ id: 'frOut' + k, label: o.label, cls: 'main',
        if: s => ok(s) && outs(s, id) === i && pts(s, id) >= NEED[i] && s.f['frLast_' + id] !== s.day && !doneToday('frOut'),
        run: s => [{ show: [{ id }] }].concat(o.steps, [shareMenu(id), o.end, { show: null }, st => {
          st.f['fr_' + id + '_h' + k] = st.day; st.f['frLast_' + id] = st.day; onceToday('frOut'); bump(st, id, 2); addMood(1);
          toast('♥ ' + tx(GAME.CHAR[id].short || GAME.CHAR[id].name) + ' · ' + tx(LV[k]));
          return null; }, { time: 1 }]) });
    });
  });

  /* they remember what you told them */
  const chat = (who, line) => { const c = GAME.CHAR[who]; if (c) { c.chat = c.chat || []; c.chat.unshift(line); } };
  const toldTo = (s, k, id) => ((s.f.told || {})[k] || []).includes(id);
  chat('marco', { if: s => toldTo(s, 'mum', 'marco') && !s.f.jCall, e: 'neutral', t: T('Did you text her? Your mother. Don\'t look at me like that, I have a mother too. Text her.', '{رسلت|رسلتي} لها؟ أمك. لا {تطالعني|تطالعيني} كذا، أنا بعد عندي أم. {رسل|رسلي} لها.') });
  chat('kai', { if: s => toldTo(s, 'mum', 'kai') && !s.f.jCall, e: 'smile', t: T('Ten minutes are up, legend. Text your mum.', 'خلصت العشر دقايق يا أسطورة. {رسل|رسلي} لأمك.') });
  chat('olivia', { if: s => toldTo(s, 'house', 'olivia'), e: 'neutral', t: T('I put a line in the petition: "No family should come home to find their life in boxes by the gate." I hope that\'s okay. I didn\'t use your name.', 'حطيت سطر في العريضة: «ما لازم أي عايلة ترجع وتلقى حياتها في كراتين عند البوابة.» أتمنى عادي. ما حطيت اسمك.') });
  chat('stella', { if: s => toldTo(s, 'dad', 'stella'), e: 'smile', t: T('I planted bulbs on the bank by the station. Your dad\'s ones. Don\'t ask me which. All of them.', 'زرعت بصيلات على الطرف اللي جنب المحطة. حقت أبوك. لا {تسألني|تسأليني} أي وحدة. كلها.') });
  chat('maya', { if: s => toldTo(s, 'why', 'maya'), e: 'neutral', t: T('Found my grandad\'s boat on an old card in the café window. Front left. If your dad\'s card is the same one, he\'s looking at it too.', 'لقيت قارب جدي في كرت قديم في شباك المقهى. قدام يسار. إذا كرت أبوك نفسه، فهو بعد كان يطالعه.') });
  chat('sami', { if: s => toldTo(s, 'dad', 'sami'), e: 'neutral', t: T('I lit a candle in the back for your father. Don\'t worry. I light one for everyone. He\'s got a good spot. Near the biscuits.', 'شغلت شمعة ورا عشان أبوك. لا {تشيل|تشيلين} هم. أشغل لكل أحد. ومكانه زين. جنب البسكوت.') });
  ['marco', 'olivia', 'kai', 'stella', 'maya', 'sami'].forEach(id => chat(id, { if: s => outs(s, id) >= 3 && s.f['fr_' + id + '_h3'] !== s.day, e: 'smile', t: pickLine(id) }));
  function pickLine(id) {
    return ({
      marco: T('There\'s my favourite customer. My only non-paying one. Sit, sit.', 'هذا زبوني المفضل. الوحيد اللي ما يدفع. {اجلس|اجلسي}، {اجلس|اجلسي}.'),
      olivia: T('You\'re wearing the badge! ...You\'re not. Wear the badge.', '{لابس|لابسة} البروش! ...لا {مو لابسه|مو لابسته}. {البسه|البسيه}.'),
      kai: T('My favourite plankton.', 'العوالق المفضلة حقتي.'),
      stella: T('There you are. The shop was asking.', 'هذا {أنت|أنتِ}. المحل كان يسأل عنك.'),
      maya: T('Still got the knot? Good.', 'لسا العقدة معك؟ زين.'),
      sami: T('Staff. Good. Face the tins.', '{الموظف|الموظفة}. زين. {رتب|رتبي} العلب.')
    })[id];
  }
  window.__friends = { OUT, R, pts, outs };
})();
