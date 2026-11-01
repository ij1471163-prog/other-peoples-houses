/* =====================================================================
   Doing his day with him gives you a little more of him.
   Elias's day is already one you can share: the boat at dawn, cooking
   at noon, the nets in the afternoon, the radio at night. The first
   time each is its own scene; after that it used to be one of a few
   short lines. Now every time you come back, he also tells you one
   small thing from his life that he hasn't told you before (Ada, his
   father, Thomas as a boy, the row), until he runs out.
   Flavour only: its own flag (s.f.eMemo). Nothing he says here gives
   away a secret the story keeps for later.
   ===================================================================== */
'use strict';
(function () {
  const ch1 = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !(s.done && s.done.elias);
  const M = (e, en, ar) => ({ e, t: T(en, ar) });
  const POOL = {
    fish: [
      M('neutral', 'My father said the sea only gives you what you\'re not looking for. I\'ve been not looking for forty years.', 'أبوي كان يقول البحر ما يعطيك إلا اللي ما تدور عليه. وأنا لي أربعين سنة ما أدور.'),
      M('smile', 'Ada came out with me once. Once. Sick over the side before we\'d left the harbour, then sat there laughing at herself, green as a bottle. I married her the next spring.', 'آدا طلعت معي مرة. مرة وحدة. استفرغت من طرف القارب قبل لا نطلع من الميناء، وبعدين جلست تضحك على نفسها، وجهها أخضر مثل القزاز. وتزوجتها الربيع اللي بعده.'),
      M('smile', 'See the three gulls on that rock? Same three every morning. I named them after the council. That one\'s the mayor. He steals.', '{تشوف|تشوفين} الثلاث نوارس اللي على الصخرة؟ نفس الثلاثة كل صبح. سميتهم على أعضاء المجلس. هذاك العمدة. حرامي.'),
      M('sad', 'First fish I ever caught, I cried and put it back. Seven years old. My father didn\'t say a word. Just baited my hook again.', 'أول سمكة صدتها بحياتي، بكيت ورجعتها للبحر. كان عمري سبع. أبوي ما قال ولا كلمة. بس حط لي طعم جديد.'),
      M('smile', 'When Thomas was small he slept in the bottom of the boat, on the old sail. Best bed in Saltmere, he said. He was right.', 'لما كان توماس صغير، كان ينام في قاع القارب على الشراع القديم. يقول أحسن سرير في سولتمير. وكان صادق.')
    ],
    cook: [
      M('smile', 'Ada\'s rule: burn the toast, you eat the toast. Forty-one years of burnt toast. I\'d eat it again.', 'قانون آدا: اللي يحرق التوست، ياكله. إحدى وأربعين سنة توست محروق. وأرجع آكله لو أقدر.'),
      M('neutral', 'My mother fried fish with the window open, so the whole row knew it was Friday.', 'أمي كانت تقلي السمك والشباك مفتوح، عشان الشارع كله يعرف إن اليوم جمعة.'),
      M('smile', 'At eleven Thomas wanted to be a chef. Made us soup out of everything in the cupboard. There was jam in it. We ate every drop.', 'توماس وهو عمره احدعش كان يبي يصير طباخ. سوى لنا شوربة من كل شي في الدولاب. وكان فيها مربى. وشربناها لآخر نقطة.'),
      M('neutral', 'Salt, butter, lemon. Everything else is people showing off.', 'ملح، وزبدة، وليمون. والباقي كله ناس يستعرضون.'),
      M('sad', 'Sundays this kitchen had eight people in it. Ada\'s sisters. Too many elbows. I miss the elbows.', 'أيام الأحد كان هالمطبخ فيه ثمان أنفار. خوات آدا. أكواع كثير. وأشتاق للأكواع.')
    ],
    nets: [
      M('neutral', 'This net\'s older than you. Every knot in it, somebody tied on a bad day. That\'s why it holds.', 'هالشبكة أكبر منك. كل عقدة فيها، أحد ربطها في يوم سيئ. وعشان كذا ماسكة.'),
      M('neutral', 'The storm of \'87 took three boats off this row. Not mine. I\'d tied her twice. Ada said it was the only time my stubbornness ever paid.', 'عاصفة ٨٧ شالت ثلاث قوارب من هالشارع. مو قاربي. كنت رابطه مرتين. آدا قالت هذي المرة الوحيدة اللي عنادي جاب فايدة.'),
      M('sad', 'My father mended nets in this shed. His pipe\'s still on that shelf. I don\'t smoke. I just like it there.', 'أبوي كان يصلّح الشباك في هالمخزن. غليونه لسا على الرف. أنا ما أدخن. بس أحبه هناك.'),
      M('smile', 'You\'re quicker than I was. Don\'t tell anyone I said that.', '{أنت أسرع|أنتِ أسرع} مني يوم كنت بعمرك. لا {تقول|تقولين} لأحد إني قلت كذا.'),
      M('smile', 'Ada used to bring tea out here and pretend she wasn\'t checking on me.', 'آدا كانت تجيب الشاي هنا وتسوي نفسها ما تتطمن علي.')
    ],
    sit: [
      M('smile', 'This song was playing the night Thomas was born. Ada said if I sang along she\'d divorce me. I sang along.', 'هالأغنية كانت شغالة الليلة اللي انولد فيها توماس. آدا قالت لو غنيت معها بتطلقني. وغنيت.'),
      M('sad', 'I talk to her sometimes. Ada. Don\'t look at me like that. She never answered when she was alive either.', 'أكلمها أحياناً. آدا. لا {تطالعني|تطالعيني} كذا. حتى وهي عايشة ما كانت ترد.'),
      M('neutral', 'Seventy-two years and I\'ve never seen the city at night. Thomas says the lights are so bright you can\'t see the stars. Sounds like a bad trade.', 'اثنين وسبعين سنة وعمري ما شفت المدينة بالليل. توماس يقول الأنوار قوية لدرجة ما تشوف النجوم. شكلها صفقة خسرانة.'),
      M('sad', 'When you\'re old the nights get longer and the years get shorter. Nobody warns you.', 'لما تكبر، الليالي تطول والسنين تقصر. ومحد يحذرك.'),
      M('smile', 'It\'s nice. Somebody in the other chair. I\'d forgotten it creaks when someone sits in it.', 'حلو. أحد جالس على الكرسي الثاني. كنت ناسي إنه يطقطق لما أحد يجلس عليه.')
    ]
  };
  /* the next thing he hasn't told you yet, from this part of his day */
  function memo(s, k) {
    if (!ch1(s)) return null;
    s.f.eMemo = s.f.eMemo || {};
    const i = s.f.eMemo[k] || 0, list = POOL[k];
    if (i >= list.length) return null;
    s.f.eMemo[k] = i + 1;
    return { c: 'elias', e: list[i].e, t: list[i].t };
  }
  /* add it before the time passes (if the scene ends with that) */
  const add = (out, m) => {
    if (!m || !Array.isArray(out)) return out;
    const j = out.findIndex(x => x && typeof x === 'object' && x.time);
    if (j >= 0) out.splice(j, 0, m); else out.push(m);
    return out;
  };
  const SC = GAME.SCRIPTS;
  /* the boat and the nets: from the second time on (the first time is its own scene) */
  [['fishing', 'fish', s => (s.f.fished || 0) >= 2], ['nets', 'nets', s => (s.f.netsCount || 0) >= 2]].forEach(([id, k, ok]) => {
    const f0 = SC[id]; if (typeof f0 !== 'function') return;
    SC[id] = function (s) { const out = f0.apply(this, arguments); try { return ok(s) ? add(out, memo(s, k)) : out; } catch (e) { console.error(e); return out; } };
  });
  /* cooking with him, and sitting with him at night */
  [['cook', 'cook', s => (s.f.cooked || 0) >= 2], ['sit', 'sit', () => true]].forEach(([id, k, ok]) => {
    const t = (GAME.TOPICS.elias || []).find(x => x.id === id); if (!t || typeof t.run !== 'function') return;
    const r0 = t.run;
    t.run = s => { const out = r0(s); try { return ok(s) ? add(Array.isArray(out) ? out : out ? [out] : [], memo(s, k)) : out; } catch (e) { console.error(e); return out; } };
  });
})();
