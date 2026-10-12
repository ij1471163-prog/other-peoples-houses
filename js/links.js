/* =====================================================================
   Links between the stories (docs/STORY.md §3).
   The player's father, Jonah, grew up at number 9 Fisher's Row, learned
   the nets from Elias, and was Victor's best friend. He left at seventeen,
   borrowed from Victor for twenty-five years, and died owing it. After his
   death Victor's company called the debt in and the family house was sold.
   The player came to Saltmere with his unposted postcard to "V.".

   Everything here is optional talk: none of it changes when or how any
   chapter ends. It only gives the existing endings more meaning.
   Small lines added inside existing scenes are marked "links.js" in
   elias.js, margaret.js, evelyn.js, victor.js and systems.js.
   ===================================================================== */
'use strict';
(function () {
  const say = (c, e, en, ar) => ({ c, e, t: T(en, ar) });

  /* ---------- Elias: the boy from number 9 ---------- */
  GAME.TOPICS.elias.push({ id: 'postcard', once: true, label: T('Show him your father\'s postcard', 'توريه كرت أبوك'),
    if: s => has('postcard') && !!s.f.metElias, need: s => (s.trust.elias || 0) >= 4,
    why: T('You\'re not ready to show anyone yet.', 'مو جاهز توريه لأحد للحين.'),
    run: s => [
      N_('You put the postcard on the table. Elias puts his glasses on, which he never does.', 'تحط الكرت على الطاولة. وإلياس يلبس نظارته، وهو عمره ما يلبسها.'),
      say('elias', 'neutral', 'That\'s the old harbor. Before the sea wall. Nobody\'s sold that card in thirty years.', 'هذا الميناء القديم. قبل الحاجز. ما أحد باع هالكرت من ثلاثين سنة.'),
      say('elias', 'sad', '"J."... There was a boy at number 9. Jonah. Came down every morning before school to learn the nets. Clumsy hands. Good heart. Him and the boy from number 3, never apart.', '«ج.»... كان فيه ولد في رقم ٩. جونا. ينزل كل صبح قبل المدرسة يتعلم الشباك. يدينه خرقا. وقلبه طيب. هو وولد رقم ٣، ما يتفارقون.'),
      say('elias', 'neutral', 'He left on the last train when he was seventeen. Never wrote. I always thought he\'d done well for himself, somewhere.', 'طلع بآخر قطار وعمره سبعطعش. وما كتب أبداً. كنت دايم أحسب إنه صار له شأن، في مكان ما.'),
      N_('He looks at you for a long time.', 'يطالعك وقت طويل.'),
      say('elias', 'sad', 'You have his eyes. I thought so on the bench, the first night. I didn\'t want to say. Old men see ghosts everywhere.', 'عيونك عيونه. حسيت كذا على الكرسي، أول ليلة. وما بغيت أقول. الشياب يشوفون أشباح في كل مكان.'),
      st => { st.f.knowJonah = true; addTrust('elias', 1); return null; }] });

  /* ---------- Gregor, the town's historian: who "V." was ---------- */
  GAME.TOPICS.gregor.push({ id: 'postcard', once: true, label: T('Show him your father\'s postcard', 'توريه كرت أبوك'),
    if: s => has('postcard'),
    run: s => [
      say('gregor', 'neutral', 'Let\'s see. Old harbor, before the wall. Late eighties. I collect these, you know. Nobody else does.', 'خلني أشوف. الميناء القديم، قبل الحاجز. آخر الثمانينات. أنا أجمع هالكروت، تدري. ما أحد غيري يجمعها.'),
      say('gregor', 'sad', '"V."... On Fisher\'s Row, in those years, there was only one V. Victor, from number 3. Before he was Mr Grand. Before he was anything.', '«ف.»... في شارع الصيادين، بذيك السنين، ما كان فيه إلا «ف.» واحد. فيكتور، من رقم ٣. قبل لا يصير مستر غراند. قبل لا يصير أي شي.'),
      say('gregor', 'neutral', 'He had one friend. The two of them used to sit on my cemetery wall and plan how they\'d leave. One of them did.', 'كان عنده صديق واحد. الاثنين كانوا يجلسون على سور مقبرتي ويخططون كيف بيطلعون. واحد منهم طلع.'),
      st => { st.f.knowV = true; return null; }] });

  /* ---------- Leo draws the house you lost (this is "the drawing of the house" in his endings) ---------- */
  GAME.TOPICS.leo.push({ id: 'yourhouse', once: true, label: T('Tell him about your house', 'تحكي له عن بيتكم'),
    if: s => has('postcard') && !!s.f.metLeo, need: s => (s.trust.leo || 0) >= 3,
    why: T('He\'s not in the mood to draw for anyone.', 'مو رايق يرسم لأحد.'),
    run: s => [
      N_('Leo asks what your house looked like. Nobody has asked you that. You tell him: the blue door that sticks, the lemon tree, your window over the garage.', 'ليو يسألك كيف كان شكل بيتكم. ما أحد سألك هالسؤال. تقول له: الباب الأزرق اللي يعلق، وشجرة الليمون، وشباكك اللي فوق الكراج.'),
      N_('He draws while you talk and doesn\'t look up. When he turns the page round, it\'s your house. Exactly your house. And a small figure standing outside the door.', 'يرسم وأنت تتكلم وما يرفع راسه. ولما يلف الورقة، هو بيتكم. بيتكم بالضبط. وشخص صغير واقف برا الباب.'),
      say('leo', 'neutral', 'That\'s you, right? You can\'t get in.', 'هذا أنت، صح؟ ما تقدر تدخل.'),
      say('leo', 'sad', 'I\'ll keep it till it\'s finished. Shading takes ages.', 'بخليه عندي لين أخلصه. التظليل ياخذ وقت.'),
      st => { st.f.leoHouse = true; return null; }] });

  /* ---------- Frank: the same company holds his debt ---------- */
  GAME.TOPICS.frank.push({ id: 'calendar', once: true, label: T('Ask about the old calendar in the office', 'تسأله عن الرزنامة القديمة في المكتب'),
    if: s => !!s.f.sawOffice && !!s.f.metFrank,
    run: s => [
      say('frank', 'sad', 'The calendar? That\'s the month I took a loan to keep this place open. A year later a company called Grand Holdings bought the loan. Nice letters. Very polite. Every month.', 'الرزنامة؟ هذا الشهر اللي أخذت فيه قرض عشان يبقى المحل مفتوح. بعد سنة، شركة اسمها غراند القابضة اشترت القرض. رسايل حلوة. مؤدبة مرة. كل شهر.'),
      say('frank', 'neutral', 'I stopped turning the pages. Stupid, I know. As long as it\'s still that month, I still own the garage.', 'وقفت أقلب الصفحات. غباء، أدري. دام إنه لسا نفس الشهر، فالكراج لسا حقي.'),
      N_('Your father must have had letters like that. You never saw a single one.', 'أكيد أبوك كانت تجيه رسايل مثلها. وأنت عمرك ما شفت وحدة.')] });

  /* ---------- Victor: the truth ---------- */
  const { inV } = GAME.H.victor;
  GAME.TOPICS.victor.push({ id: 'postcard', once: true, label: T('Put your father\'s postcard on his desk', 'تحط كرت أبوك على مكتبه'),
    if: s => inV(s) && has('postcard'),
    run: s => [
      N_('You put the postcard on his desk. Victor looks at it and doesn\'t touch it, as if it might be hot.', 'تحط الكرت على مكتبه. فيكتور يطالعه وما يلمسه، كأنه حار.'),
      say('victor', 'shock', 'Where did you get this?', 'من وين جبت هذا؟'),
      N_('You tell him. The key that didn\'t fit. The boxes by the gate.', 'تقول له. المفتاح اللي ما ركب. والكراتين عند البوابة.'),
      say('victor', 'neutral', 'Jonah. Number 9. He could gut a fish faster than his father, and he hated every second of it. We swore we\'d both get out of Fisher\'s Row.', 'جونا. رقم ٩. كان ينظف السمكة أسرع من أبوه، ويكره كل ثانية فيها. حلفنا إننا الاثنين بنطلع من شارع الصيادين.'),
      say('victor', 'sad', 'He got out first. I stayed, and got rich. Every time he was in trouble, he wrote. Every time, I sent money. Twenty-five years. He never paid back a cent, and I never asked him to.', 'هو طلع أول. وأنا قعدت، وصرت غني. كل ما ضاقت عليه، كتب لي. وكل مرة، أرسلت له فلوس. خمس وعشرين سنة. ما رجّع ولا سنت، وأنا ما طلبت.'),
      say('victor', 'neutral', 'He came the day I bought this place. 7 March. Stood across the street in the rain for an hour and never came in. I watched him from that window. I didn\'t go down either.', 'جا يوم اشتريت المكان. ٧ مارس. وقف قدام الشارع تحت المطر ساعة كاملة وما دخل. وأنا كنت أطالعه من هالشباك. وما نزلت بعد.'),
      say('victor', 'angry', 'When he died, the lawyers found the file. Grand Holdings collects its debts. I read the name. I signed anyway. I told myself it was business.', 'لما مات، المحامين لقوا الملف. وغراند القابضة تحصّل ديونها. قريت الاسم. ووقعت. وقلت لنفسي إنه شغل.'),
      say('victor', 'sad', 'You walked into my lobby with his face. Why do you think the suite was free?', 'دخلت الاستقبال حقي بوجهه. ليش تحسب الجناح كان ببلاش؟'),
      N_('He slides the postcard back across the desk. "Keep it. It was never posted. It was never mine."', 'يرجّع لك الكرت على المكتب. «خله عندك. ما انرسل أصلاً. وعمره ما كان لي.»'),
      st => { st.f.vJonah = true; quest('q_postcard', 'done'); return null; }] });
})();
