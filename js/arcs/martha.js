/* =====================================================================
   Martha's story: "Ada's fish pie"  (docs/STORY.md §5)
   Ada was a terrible cook (Martha says so). She made one thing: a fish
   pie, burnt on top, every Sunday for forty years, and Elias said it was
   the best thing in Saltmere. Since the spring he has stopped eating
   properly. Martha's pie comes out nice, and that is the problem.
   Only while you live with Elias (Chapter 1), before his ending.
     1. Martha, after you've helped her once      (topic)
     2. A biscuit tin in Elias's kitchen          (spot)
     3. Give Martha the card                      (topic)
     4. That night, the pie                       (event)
   ===================================================================== */
'use strict';
(function () {
  const say = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const M = s => s.f.mArc || 0;
  const atElias = s => s.host === 'elias' && !s.f.ended && houseOf(s.loc) === 'elias';

  GAME.QUESTS.q_pie = { title: T('Ada\'s fish pie', 'فطيرة سمك آدا'),
    hint: T('Ada kept her recipes on cards in a biscuit tin. Somewhere in Elias\'s kitchen.', 'آدا كانت تحفظ وصفاتها على كروت في علبة بسكويت. في مكان ما بمطبخ إلياس.') };
  GAME.ITEMS.adaCard = { name: T('Ada\'s recipe card', 'كرت وصفة آدا'),
    desc: T('ADA\'S FISH PIE. Underlined twice: "Leave it in ten minutes too long. He likes it like that. (He says.)"', 'فطيرة سمك آدا. وتحتها خطين: «خلها في الفرن عشر دقايق زيادة. هو يحبها كذا. (يقول.)»') };

  /* 1. Martha */
  GAME.TOPICS.martha.push({ id: 'pie', once: true, label: T('"Does he eat what you bring?"', '«ياكل اللي تجيبينه؟»'),
    if: s => M(s) === 0 && atElias(s) && (s.f.marthaHelp || 0) >= 1,
    run: [
      say('martha', 'sad', 'Not properly. I bring soup, he says "lovely", and it\'s still there on Friday.', 'مو زين. أجيب شوربة، يقول «حلوة»، وتبقى مكانها لين الجمعة.'),
      say('martha', 'neutral', 'Ada made one thing. A fish pie. Burnt on top, every single time. He ate it every Sunday for forty years and called it the best thing in Saltmere.', 'آدا كانت تسوي شي واحد. فطيرة سمك. محروقة من فوق، كل مرة. وهو ياكلها كل أحد أربعين سنة، ويقول إنها أحسن شي في سولتمير.'),
      say('martha', 'sad', 'I\'ve tried. Mine comes out nice. That\'s the trouble. It isn\'t hers.', 'جربت. حقتي تطلع حلوة. وهنا المشكلة. مو حقتها.'),
      say('martha', 'neutral', 'She wrote her recipes on cards and kept them in a biscuit tin. Lord knows where he\'s put it.', 'كانت تكتب وصفاتها على كروت، وتحطها في علبة بسكويت. الله أعلم وين حطها.'),
      s => { s.f.mArc = 1; quest('q_pie', 'active'); return null; }] });

  /* 2. the tin */
  GAME.LOC.kitchen.spots.push({ x: 42, y: 30, label: T('A biscuit tin, behind the flour', 'علبة بسكويت ورا الطحين'),
    if: s => M(s) === 1 && !s.f.ended,
    run: s => [
      N_('Inside: buttons, a spare key, and a stack of recipe cards in big round handwriting. Every spelling mistake has been corrected in pencil, in a second, neater hand. Elias.',
        'داخلها: أزرار، ومفتاح احتياط، وكومة كروت وصفات بخط كبير مدوّر. وكل غلطة إملائية مصححة بالرصاص، بخط ثاني أرتب. خط إلياس.'),
      N_('ADA\'S FISH PIE. At the bottom, underlined twice: "Leave it in ten minutes too long. He likes it like that. (He says.)"',
        'فطيرة سمك آدا. وتحت، وعليها خطين: «خلها في الفرن عشر دقايق زيادة. هو يحبها كذا. (يقول.)»'),
      N_('Next to "He says", in pencil, Elias has written: "I do."', 'وجنب «يقول»، بالرصاص، إلياس كاتب: «إيه، أحبها كذا.»'),
      st => { give('adaCard'); st.f.mArc = 2; return null; }] });

  /* 3. give Martha the card */
  GAME.TOPICS.martha.push({ id: 'pieCard', once: true, label: T('Show her Ada\'s card', '{توريها|تورينها} كرت آدا'), cls: 'main',
    if: s => M(s) === 2 && atElias(s) && has('adaCard'),
    run: [
      N_('Martha reads it. She laughs, loud, and then she has to sit down.', 'مارثا تقراه. تضحك، بصوت عالي، وبعدين تضطر تجلس.'),
      say('martha', 'sad', 'Ten minutes too long. Forty years I thought she just forgot it every week. It was on purpose.', 'عشر دقايق زيادة. أربعين سنة وأنا أحسبها تنساها كل أسبوع. وطلعت بقصد.'),
      say('martha', 'smile', 'Tonight. I\'ll make it and burn it properly. You keep him out of the kitchen.', 'الليلة. بسويها وبحرقها صح. {وأنت|وأنتِ} {خله|خليه} برا المطبخ.'),
      N_('She tucks the card into her apron. "I\'ll put it back in the tin after. He\'d notice."', 'تدخل الكرت في مريولها. «برجعه للعلبة بعدين. بيلاحظ.»'),
      st => { take('adaCard'); st.f.mArc = 3; st.f.pieDay = st.day; return null; }] });

  /* 4. that night */
  const pie = { id: 'adaPie', once: true,
    when: s => M(s) === 3 && s.day >= s.f.pieDay && s.slot === NIGHT && s.loc === 'living' && s.host === 'elias' && !s.f.ended && GAME.CHAR.elias.where(s) === 'living' && !RUN,
    run: [{ show: [{ id: 'elias', e: 'neutral' }] },
      N_('The house smells of burnt pastry. On the table, a fish pie with a black lid, and a note in Martha\'s writing: "Ten minutes. As ordered."',
        'البيت ريحته عجين محروق. وعلى الطاولة، فطيرة سمك غطاها أسود، وورقة بخط مارثا: «عشر دقايق. حسب الطلب.»'),
      N_('Elias stands looking at it for a long time. Then he sits down and eats. All of it. He doesn\'t say a word until the dish is clean.',
        'إلياس يوقف يطالعها وقت طويل. وبعدين يجلس وياكل. كلها. وما يقول ولا كلمة لين الصحن يخلص.'),
      say('elias', 'sad', 'She always burnt the top. Always. Forty years, I told her it was perfect.', 'دايم كانت تحرق الوجه. دايم. أربعين سنة وأنا أقول لها إنها مضبوطة.'),
      say('elias', 'neutral', 'It was.', 'وكانت.'),
      s => { s.f.mArc = 4; addTrust('elias', 1); addTrust('martha', 1); addMood(1); quest('q_pie', 'done'); return null; }] };
  /* it must come before Elias's last night (the 'finale' event), or a Friday pie would never be eaten */
  { const i = GAME.EVENTS.findIndex(e => e.id === 'finale'); if (i < 0) GAME.EVENTS.push(pie); else GAME.EVENTS.splice(i, 0, pie); }
  /* if Chapter 1 ends before the pie, the errand quietly leaves the phone instead of staying open forever */
  GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
  GAME.ENTER_HOOKS.push(s => { if (s.f.ended && M(s) > 0 && M(s) < 4 && s.quests.q_pie === 'active') delete s.quests.q_pie; return null; });
})();
