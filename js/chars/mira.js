/* =====================================================================
   Mira — 20. Came to Saltmere a month before you. Waits tables at
   Marco's from noon to closing.
   A friend of your own, the only person in town you don't live with.
   You meet her the first time you walk into the café while she is on
   shift. After that she is there every day, and she always wants to
   know how it's going in the house you're staying in (her lines follow
   what you have found out), and she is funny about it.
   She has her own small secret, told a little at a time: she was meant
   to start medical school in September, and got on a train going the
   other way.
   Her own flags only (s.met.mira, s.trust.mira, s.f.mira*). Nothing here
   changes another character's trust, a quest or an ending.
   ===================================================================== */
'use strict';
(function () {
  const { on } = GAME.H.town;
  const M = (e, en, ar) => ({ c: 'mira', e, t: T(en, ar) });
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const at = s => s.loc === 'cafe';

  GAME.CHAR.mira = {
    name: T('Mira', 'ميرا'),
    role: T('20. Came to Saltmere a month before you. Waits tables at Marco\'s.', '٢٠ سنة. جت سولتمير قبلك بشهر. تشتغل في مقهى ماركو.'),
    art: true,
    where: s => (!on(s) ? null : [null, 'cafe', 'cafe', 'cafe', null][s.slot]),
    doing: s => [null,
      T('Mira is writing the specials on the board and spelling "soup" two different ways.', 'ميرا تكتب أطباق اليوم على اللوحة، وكاتبة «شوربة» بطريقتين.'),
      T('Mira is carrying four cups at once and talking to all four tables.', 'ميرا شايلة أربع أكواب مرة وحدة، وتسولف مع أربع طاولات.'),
      T('Mira is wiping a table that is already clean, listening to Elias and Marco argue about chess.', 'ميرا تمسح طاولة نظيفة أصلاً، وتسمع إلياس وماركو يتهاوشون على الشطرنج.'),
      null][s.slot],
    greet: s => (!s.met.mira ? null : (s.trust.mira || 0) >= 3
      ? { e: 'smile', t: T('My favourite customer. Don\'t tell Ingrid.', 'زبوني المفضل. لا {تقول|تقولين} لإنغريد.') }
      : { e: 'neutral', t: T('Table for one? Every table is for one at this hour.', 'طاولة لشخص؟ كل الطاولات لشخص هالوقت.') })
  };
  GAME.CHAR.mira.height = 0.9;
  if (typeof PEOPLE !== 'undefined' && PEOPLE.SPEC) PEOPLE.SPEC.mira = { sex: 'f', skin: '#f3d2c0', hair: '#7a3b22', eye: '#5a3a28', brow: '#6a3220', hairStyle: 'pony', age: 20, sw: 84, ww: 70, hw: 80, pose: ['pocket', 'pocket'], fit: { top: 'hoodie', c1: '#8a4a7a', c2: '#f2ece6', bottom: 'trousers', b: '#7a4270' } };
  GAME.CHAR.mira.life = { cafe: 'serve' };

  /* ---------- the first time ---------- */
  GAME.EVENTS.push({ id: 'miraMeet', once: true, when: s => !RUN && at(s) && !s.f.prologue && GAME.CHAR.mira.where(s) === 'cafe' && !s.met.mira, run: s => { s.met.mira = true; s.trust.mira = 0; return [
    { show: [{ id: 'mira', e: 'neutral' }] },
    N1('A girl in a purple jacket three sizes too big puts a cup of tea down in front of you. You didn\'t order tea.', 'بنت لابسة جاكيت بنفسجي أكبر منها بثلاث مقاسات، تحط قدامك كوب شاي. وأنت ما {طلبت|طلبتي} شاي.'),
    M('neutral', 'On the house. You\'ve got the face. The "I got off the last train and kept walking" face. I had it for a week.', 'على حساب المحل. شكلك فيه الوجه. وجه «نزلت من آخر قطار وقعدت أمشي». أنا جلست فيه أسبوع.'),
    M('smile', 'Mira. I came a month before you, which in Saltmere makes me a local. Marco says three more years and I can have opinions.', 'ميرا. جيت قبلك بشهر، وهذا في سولتمير يخليني من أهل البلد. ماركو يقول بعد ثلاث سنين يحق لي يكون عندي رأي.'),
    { menu: [
      { t: T('"Thanks. I needed this."', '«مشكورة. كنت {محتاجه|محتاجته}.»'), then: [M('smile', 'I know. That\'s the face.', 'أدري. هذا الوجه.')] },
      { t: T('"What face?"', '«أي وجه؟»'), then: [M('neutral', 'That one. Exactly that one. Drink your tea.', 'هذا. هذا بالضبط. {اشرب|اشربي} شايك.')] }
    ] },
    M('neutral', 'Come back. I\'m here every day from noon. Nobody else here is under seventy, except Kai, and Kai only talks about waves.', '{ارجع|ارجعي}. أنا هنا كل يوم من الظهر. محد هنا عمره تحت السبعين، إلا كاي، وكاي ما يتكلم إلا عن الموج.')
  ]; } });

  /* ---------- what she says about the house you're in ---------- */
  function house(s) {
    const f = s.f, h = s.host || (s.ch === 2 && !f.leoEnded ? 'leo' : null);
    if (h === 'elias') {
      if (f.knowsIllness) return [M('sad', 'He comes in for chess and forgets whose move it is. Marco lets him win and pretends he doesn\'t. ...You knew. I can see you knew.', 'يجي يلعب شطرنج وينسى دور مين. ماركو يخليه يفوز ويسوي نفسه ما يدري. ...{كنت تدري|كنتي تدرين}. أشوف إنك {تدري|تدرين}.')];
      if (f.knowsSon || f.sawBox) return [M('neutral', 'A son? He\'s never said. He orders two biscuits sometimes and only eats one. I thought it was for later.', 'عنده ولد؟ عمره ما قال. أحياناً يطلب بسكوتتين وياكل وحدة. كنت أحسبها لبعدين.')];
      return [{ c: 'mira', e: 'smile', t: fresh('miraE', [
        T('You\'re at old Elias\'s? He tipped me once. A button. He said it was "a very good button".', '{أنت|أنتِ} عند إلياس؟ مرة عطاني بخشيش. زر. قال إنه «زر زين مرة».'),
        T('Does he still burn the toast? Marco says you can smell it from here on a north wind.', 'لسا يحرق التوست؟ ماركو يقول تشم ريحته من هنا إذا الهوا شمالي.'),
        T('He told me Saltmere is the centre of the world. I asked him if he\'d been anywhere else. He said "why would I".', 'قال لي إن سولتمير هي نص الدنيا. سألته إذا راح مكان ثاني. قال «ليش أروح».')]) }];
    }
    if (h === 'leo') return [{ c: 'mira', e: 'neutral', t: fresh('miraL', [
      T('Leo from the boathouse? He draws the customers when he thinks nobody\'s looking. He drew me once. Better than my passport photo.', 'ليو حق بيت القوارب؟ يرسم الزباين لما يحسب محد شايفه. رسمني مرة. أحلى من صورة جوازي.'),
      T('He comes in, orders the cheapest thing, and leaves exact change. Every time. Like he\'s practising being no trouble.', 'يدخل، يطلب أرخص شي، ويترك الفلوس بالضبط. كل مرة. كأنه يتمرن إنه ما يزعج أحد.')]) }];
    if (h === 'margaret') return [{ c: 'mira', e: 'sad', t: fresh('miraM', [
      T('Mrs Hart? She comes in on Fridays and orders three teas. Drinks one. Lets two go cold. Marco charges her for one.', 'مسز هارت؟ تجي يوم الجمعة وتطلب ثلاث شاهي. تشرب واحد. وتخلي اثنين يبردون. وماركو يحاسبها على واحد.'),
      T('That house is so quiet I can hear it from the road. Is she alright? Are you?', 'هالبيت هادي لدرجة أسمعه من الشارع. هي بخير؟ {وأنت|وأنتِ}؟'),
      T('She asked me once if I had a brother. I said no. She said "lucky" and then "sorry" and then left her change on the table.', 'سألتني مرة إذا عندي أخو. قلت لا. قالت «محظوظة» وبعدين «آسفة» وتركت الباقي على الطاولة.')]) }];
    if (h === 'evelyn') return [{ c: 'mira', e: 'neutral', t: fresh('miraEv', [
      T('You\'re sleeping at the LIGHTHOUSE? Kai says it laughs at three in the morning. Kai also says the moon is a lamp.', '{نايم|نايمة} في المنارة؟ كاي يقول إنها تضحك الساعة ثلاث الفجر. وكاي بعد يقول إن القمر لمبة.'),
      T('Bring me a gull feather from up there. I\'m collecting proof that I left the city.', '{جب|جيبي} لي ريشة نورس من فوق. أجمع أدلة إني طلعت من المدينة.')]) }];
    if (h === 'victor') return [{ c: 'mira', e: 'angry', t: fresh('miraV', [
      T('The Grand. Of course. Do they give you the little soaps? Bring me the little soaps.', 'الفندق. أكيد. يعطونك الصابون الصغير؟ {جب|جيبي} لي الصابون الصغير.'),
      T('Victor tipped me a fifty once. I gave it to Olivia for her petition. Best thing I\'ve bought here.', 'فيكتور عطاني بخشيش خمسين مرة. عطيتها أوليفيا لعريضتها. أحسن شي شريته هنا.')]) }];
    if (h) return [{ c: 'mira', e: 'neutral', t: T('Another house, another door. You collect them, don\'t you? Like stamps.', 'بيت ثاني، وباب ثاني. {تجمعها|تجمعينها}، صح؟ مثل الطوابع.') }];
    return [{ c: 'mira', e: 'neutral', t: T('Between houses? You can sleep in the café storeroom if it comes to that. Don\'t tell Marco. Marco knows.', 'بين بيتين؟ تقدر{|ين} {تنام|تنامين} في مخزن المقهى إذا وصلت لها. لا {تقول|تقولين} لماركو. ماركو يدري.') }];
  }

  /* ---------- things to talk about ---------- */
  GAME.TOPICS.mira = [
    { id: 'house', label: T('Tell her how it\'s going', '{تقول|تقولين} لها وش صاير معك'), if: s => at(s) && !doneToday('miraH'), run: s => { onceToday('miraH'); if (!doneToday('miraT')) { onceToday('miraT'); s.trust.mira = (s.trust.mira || 0) + 1; } addMood(1); return house(s); } },
    { id: 'break', label: T('Sit with her on her break', '{تجلس|تجلسين} معها في استراحتها'), if: s => at(s) && s.slot === 2 && !doneToday('miraB'), run: s => { onceToday('miraB'); rest(10); return [N1(...fresh('miraBk', [
      ['You sit on the back step with her and share a bag of crisps. She eats them in size order, smallest first.', '{تجلس|تجلسين} معها على عتبة الباب الخلفي وتتقاسمون كيس شيبس. تاكلها بالترتيب حسب الحجم، الأصغر أول.'],
      ['She teaches you to fold a napkin into a swan. Yours is a duck. She says ducks are underrated.', 'تعلمك تطوي منديل على شكل بجعة. حقك طلع بطة. تقول إن البط مظلوم.'],
      ['Ten minutes of nothing. The sea, two gulls fighting over a chip, her humming something off-key. It\'s the best ten minutes of your day.', 'عشر دقايق ولا شي. البحر، ونورسين يتهاوشون على بطاطس، وهي تدندن شي نشاز. أحلى عشر دقايق في يومك.']]))]; } },
    { id: 'who', once: true, label: T('"So what\'s your story?"', '«وأنتِ وش قصتك؟»'), run: [
      M('smile', 'Witness protection. From my aunt.', 'حماية شهود. من خالتي.'),
      M('neutral', 'Ask me again when I like you more. I\'m nearly there. It\'s the jacket, isn\'t it. Everyone likes the jacket.', '{اسألني|اسأليني} مرة ثانية لما أحبك أكثر. قربت. الجاكيت، صح؟ الكل يحب الجاكيت.')] },
    { id: 'train', once: true, label: T('"Ask you again: what\'s your story?"', '«أسألك مرة ثانية: وش قصتك؟»'), if: s => !!s.f.tp_mira_who, need: s => (s.trust.mira || 0) >= 3, why: T('She isn\'t ready. Keep coming back.', 'مو جاهزة. {خلك|خليك} ترجع{|ين} لها.'), run: s => { s.f.miraTrain = true; return [
      M('sad', 'I was meant to start medical school in September. My dad told the whole family. My mum had the white coat ironed.', 'كان المفروض أبدأ كلية الطب في سبتمبر. أبوي قال للعايلة كلها. وأمي كوت البالطو الأبيض.'),
      M('neutral', 'I got to the station with my suitcase, and there were two trains. I got on the other one. I don\'t know why. I still don\'t.', 'وصلت المحطة بشنطتي، وكان فيه قطارين. ركبت الثاني. ما أدري ليش. وللحين ما أدري.'),
      M('smile', 'So now I carry soup. I\'m very good at soup. Don\'t look at me like that. Drink your tea.', 'والحين أشيل شوربة. وأنا شاطرة مرة في الشوربة. لا {تطالعني|تطالعيني} كذا. {اشرب|اشربي} شايك.')]; } }
  ];

  /* ---------- small talk (js/chatter.js picks one a day) ---------- */
  GAME.CHAR.mira.chat = [
    { e: 'smile', t: T('Marco told a joke to a table of fishermen. Nobody laughed. He said they were "a tough room". It\'s a café.', 'ماركو قال نكتة لطاولة صيادين. محد ضحك. قال إنهم «جمهور صعب». هذا مقهى.') },
    { e: 'neutral', t: T('Ingrid tips in boiled sweets. I have forty. I\'m going to build something.', 'إنغريد تعطي بخشيش حلاو. عندي أربعين. بسوي فيها شي.') },
    { e: 'smile', t: T('Kai asked me out. Then he explained tides for twenty minutes. I said yes to the tides.', 'كاي طلبني نطلع. وبعدين شرح المد والجزر عشرين دقيقة. وافقت على المد والجزر.') },
    { e: 'sad', t: T('My mum sent me a photo of my room. Just the room. No message. I looked at it for an hour.', 'أمي أرسلت لي صورة غرفتي. بس الغرفة. بدون رسالة. جلست أطالعها ساعة.') },
    { if: s => !!s.f.miraTrain, e: 'neutral', t: T('I wrote to my dad. One line. "I\'m okay, I carry soup." He hasn\'t answered. That\'s fair.', 'كتبت لأبوي. سطر واحد. «أنا بخير، وأشيل شوربة.» ما رد. ومعه حق.') }
  ];
})();
