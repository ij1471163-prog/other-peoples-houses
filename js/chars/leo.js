/* =====================================================================
   Leo — 19. Draws. Delivers food. Owes rent. Doesn't ask questions.
   Everything that is Leo's own: profile, where Leo is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (leo.js).
   ===================================================================== */
'use strict';
(function () {
  /* who Leo is and Leo's daily routine (Chapter 2, Leo) */
  GAME.CHAR.leo = {
    name: T('Leo', 'ليو'), role: T('19. Draws. Delivers food. Owes rent. Doesn\'t ask questions.', '١٩ سنة. يرسم. يوصّل أكل. عليه إيجار. وما يسأل أسئلة.'), host: true, art: true,
    where: s => {
      if (!s.f.metLeo || s.f.leoEnded) return null;
      if (s.f.restDayLeo === s.day) return 'boathouse';
      if (s.day % 7 === 0) return ['loft', 'dock', 'dock', 'dock', 'boathouse'][s.slot];
      return ['loft', s.day % 2 ? 'bh_bath' : 'boathouse', 'street', 'dock', 'boathouse'][s.slot];
    },
    doing: s => {
      const w = GAME.CHAR.leo.where(s);
      if (s.f.restDayLeo === s.day) return T('Leo is on the sofa with his wrist strapped, pretending not to be in pain.', 'ليو على الكنب ويده مربوطة، ويسوي نفسه ما يتوجع.');
      return ({ loft: T('Leo is asleep in the loft. Loudly.', 'ليو نايم فوق. بصوت عالي.'), boathouse: s.slot === NIGHT ? T('Leo is losing at a video game and blaming the controller.', 'ليو يخسر في لعبة ويلوم اليد.') : T('Leo is eating cereal out of a saucepan.', 'ليو ياكل كورن فليكس من قِدر.'), street: T('Leo is checking his delivery app, helmet under his arm.', 'ليو يطالع تطبيق التوصيل، والخوذة تحت ذراعه.'), dock: T('Leo is drawing the sea like it owes him money.', 'ليو يرسم البحر كأنه مديون له.') })[w] || null;
    },
    greet: s => {
      if ((s.susp.leo || 0) >= 1 && (s.trust.leo || 0) < 5) return { e: 'angry', t: T('What.', 'وشو.') };
      if ((s.trust.leo || 0) >= 6) return { e: 'smile', t: T('There\'s my favourite lodger. My only lodger. Still counts.', 'هذا ساكني المفضل. الوحيد. بس يحسب.') };
      return { e: 'neutral', t: T('Yo.', 'هلا.') };
    }
  };
  /* things to talk about (Chapter 2, Leo) */
  GAME.TOPICS.leo = [
    { id: 'deliver', label: T('Ride along on deliveries', 'تركب معه بالتوصيل'), if: s => s.loc === 'street' && !doneToday('deliver') && s.f.restDayLeo !== s.day, cls: 'main', run: [{ jump: 'deliveries' }] },
    { id: 'draw', label: T('Draw with him', 'ترسم معه'), if: s => s.loc === 'dock' && !doneToday('draw'), cls: 'main', run: [{ jump: 'drawing' }] },
    { id: 'games', label: T('Play video games', 'تلعبون بلايستيشن'), if: s => s.loc === 'boathouse' && s.slot === NIGHT && !doneToday('games'), cls: 'main', run: [{ jump: 'games' }] },
    { id: 'cook', label: T('Cook him a real dinner', 'تطبخ له عشا صدق'), if: s => s.loc === 'boathouse' && has('groceries') && !doneToday('cookLeo'), cls: 'main', run: [{ jump: 'cookLeo' }] },
    { id: 'art', once: true, label: T('Ask about his art', 'تسأله عن رسمه'), run: s => { addTrust('leo', 1); return [L_('smile', 'I want to draw for a living. Comics, games, whatever pays. Mostly I want to never fix a car again.', 'أبي أعيش من الرسم. قصص مصورة، ألعاب، أي شي يجيب فلوس. وأهم شي ما أصلّح سيارة مرة ثانية.')]; } },
    { id: 'father', once: true, label: T('Ask about his father', 'تسأله عن أبوه'), need: s => (s.trust.leo || 0) >= 3, why: T('He changes the subject. Spend more time with him.', 'يغير الموضوع. اقعد معه أكثر.'), run: s => { s.f.knowsFather = true; quest('q_father', 'active'); return [L_('sad', 'Frank. Frank\'s Motors. Big hands, small words.', 'فرانك. كراج فرانك. أيدين كبيرة، وكلام قليل.'), L_('sad', 'He burned my sketchbooks in the yard. He said drawing was for kids and I start at the garage Monday. I left Sunday.', 'أحرق دفاتري في الحوش. قال الرسم لعب عيال وإني أبدأ في الكراج يوم الإثنين. وطلعت يوم الأحد.')]; } },
    { id: 'mother', once: true, label: T('Ask about his mother', 'تسأله عن أمه'), need: s => (s.trust.leo || 0) >= 4, why: T('Not yet.', 'مو الحين.'), run: s => { s.f.knowsMother = true; return [L_('sad', 'She texts every day: "Did you eat?" I always say yes. Even when I didn\'t.', 'ترسل كل يوم: «أكلت؟» ودايم أقول إيه. حتى لو ما أكلت.'), L_('sad', 'Because if I say no, she\'ll cry. And then I\'ll go home. And then I\'ll be fixing cars till I die.', 'لأني لو قلت لا، بتبكي. وبرجع البيت. وبصلّح سيارات لين أموت.')]; } },
    { id: 'you', once: true, label: T('Tell him why you\'re really here', 'تقول له ليش أنت هنا فعلاً'), need: s => s.mood >= 4, why: T('You can\'t say it yet.', 'ما تقدر تقولها للحين.'), run: s => { addTrust('leo', 2); return [N_('You tell him. The last train. The phone you keep face down. Elias.', 'تقول له. آخر قطار. والجوال اللي تقلبه على وجهه. وإلياس.'), L_('sad', 'So we\'re both running. You\'re just running from yourself. That one\'s harder. You can\'t lose yourself on a bike.', 'يعني الاثنين هاربين. بس أنت هارب من نفسك. وهذي أصعب. ما تقدر تضيّع نفسك على دراجة.')]; } },
    { id: 'rent', once: true, label: T('Ask about the rent', 'تسأله عن الإيجار'), if: s => s.f.knowsDebt, run: [L_('angry', 'Victor bought every boathouse on the harbor. Tripled the rent. Smiled the whole time. The guy smiles like a shark that went to business school.', 'فيكتور اشترى كل بيوت القوارب في الميناء. وضاعف الإيجار ثلاث مرات. وهو يبتسم طول الوقت. يبتسم مثل قرش درس إدارة أعمال.')] },
    { id: 'daniel', once: true, label: T('Ask him about Daniel', 'تسأله عن دانيال'), if: s => s.f.sawSketchbook || s.f.sawCrashSketch, need: s => (s.trust.leo || 0) >= 5, why: T('If you ask now, he\'ll shut down. He needs to trust you more.', 'لو سألت الحين، بيقفل. يحتاج يثق فيك أكثر.'), run: s => { s.f.knowsDaniel = true; quest('q_secret2', 'done'); return [
      { c: 'leo', e: 'shock', t: T('How do you know that name.', 'من وين تعرف هالاسم.') },
      L_('sad', 'Daniel was my best friend. Two years ago we drove to a concert in the city. He was driving. I was doing the music. And I kept saying "faster, we\'ll miss the start". As a joke.', 'دانيال كان أعز أصحابي. قبل سنتين رحنا لحفلة في المدينة. هو يسوق، وأنا ماسك الأغاني. وكنت أقول «أسرع، بتفوتنا البداية». كنت أمزح.'),
      L_('sad', 'The road was wet. I walked away with a cut on my head. He didn\'t walk away.', 'الطريق كان مبلول. أنا طلعت بجرح في راسي. وهو ما طلع.'),
      L_('sad', 'His mum lives in the white house on Cliff Road. Margaret. She doesn\'t know I said that. Nobody knows. I can\'t even walk past her house.', 'أمه ساكنة في البيت الأبيض بشارع الجرف. مارغريت. ما تدري إني قلت كذا. محد يدري. ما أقدر حتى أمر قدام بيتها.')]; } }
  ];
  /* how Leo looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.leo = { sex: 'm', skin: '#e8bd98', hair: '#2a1c16', eye: '#5a4632', brow: '#2a1c16', hairStyle: 'messy', age: 19, sw: 92, ww: 70, hw: 74, pose: ['pocket', 'pocket'], fit: { top: 'hoodie', c1: '#e0a42a', jacket: '#d23f34', bottom: 'jeans', b: '#2a2c34', headphones: true, tag: 'EATS' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.leo.height = 1.02;
})();
