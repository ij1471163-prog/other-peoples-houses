/* =====================================================================
   Number 9, Fisher's Row: the house your father grew up in.
   Sold, boarded up, on the Grand's demolition list (numbers 3 to 11,
   which includes Victor's own childhood house, number 3).
   Opens once you know your father lived here.
     · the sign, the window, the view down the row to number 3
     · under the loose front step: a tin Jonah left for Victor on the
       morning of the last train, in 1991. Victor never found it.
     · Elias knows what the step was. Gregor knows which wall "same
       wall" means. Victor, in his chapter, can be given the tin.
     · at night, once you know who V. is: a man in a good coat at the gate.
   Only its own flags (n9*). Nothing here reads or changes trust,
   suspicion or any ending.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const say = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const open9 = s => !!(s.f.knowJonah || s.f.knowV || (s.f.jm || 0) >= 1);

  GAME.ITEMS.n9tin = { name: T('A rusted tin from number 9', 'علبة صدية من رقم ٩'), desc: T('A marble, a ticket stub from the 1991 summer fair, a photo-booth strip of two boys pulling faces, and a note to "V.".', 'بلية، وتذكرة من مهرجان صيف ١٩٩١، وشريط صور لولدين يسوون وجيه، وورقة لـ«ف.».') };

  GAME.LOC.no9 = {
    name: T('No. 9, Fisher\'s Row', 'رقم ٩، شارع الصيادين'), mapName: T('No. 9', 'رقم ٩'), bg: 'no9', canWait: true,
    exits: [back('elias_ext')],
    spots: [
      { x: 64, y: 70, label: T('The sign', 'اللوحة'), run: s => [
        N1('SOLD. Saltmere Grand Holdings. Underneath, a smaller notice in a plastic sleeve: numbers 3 to 11, Fisher\'s Row, scheduled for demolition.', 'مباع. شركة سولتمير غراند القابضة. وتحتها، إعلان أصغر في كيس بلاستيك: البيوت من ٣ لين ١١، شارع الصيادين، مقرر هدمها.'),
        st => (st.quests.q_petition === 'done' || st.f.tp_olivia_petition ? [N1('Someone has stuck one of Olivia\'s leaflets over the word DEMOLITION. It has been there long enough to go soft in the rain.', 'أحد لصق واحد من منشورات أوليفيا فوق كلمة «هدم». صار له فترة لين لان من المطر.')] : null)
      ] },
      { x: 73, y: 46, label: T('The boarded window', 'الشباك المسكّر بالخشب'), run: s => [
        N1('Through a gap between the boards: an empty room. Wallpaper with little blue boats on it, faded everywhere except a pale square where a picture used to hang.', 'من فتحة بين الألواح: غرفة فاضية. ورق جدران عليه قوارب زرقا صغيرة، باهت في كل مكان إلا مربع فاتح كان معلق فيه صورة.'),
        N1('On the sill inside, a small wooden boat with a J cut into the bottom, the kind a boy carves with a knife he isn\'t supposed to have.', 'على حافة الشباك من جوا، قارب خشب صغير محفور تحته حرف ج، من النوع اللي يحفره ولد بسكين المفروض ما تكون معه.'),
        st => { st.f.n9Window = true; return null; }
      ] },
      { x: 52, y: 80, label: T('The front step', 'عتبة الباب'), if: s => !s.f.n9Tin, run: s => [
        N1('The bottom step rocks under your foot. It has been rocking for a long time; the moss around it is broken in a neat line, like a lid.', 'العتبة اللي تحت تتحرك تحت رجلك. صار لها زمان تتحرك. والطحلب حواليها مقطوع بخط مرتب، كأنه غطا.'),
        { menu: [
          { t: T('Lift it', '{ارفعها|ارفعيها}'), cls: 'main', then: [
            { mini: 'scrub', dir: 'img/fx/step/', frames: 44, ext: 'jpg', drag: 'up', zoom: { x: 52, y: 80 }, anchorY: 0.5, snd: 'step-lift', hint: T('Drag up to lift the stone', '{اسحب|اسحبي} لفوق عشان {ترفع|ترفعين} الحجر') },
            N1('Underneath, in a hollow somebody dug on purpose: a biscuit tin, rusted shut at one corner. It takes both thumbs.', 'تحتها، في حفرة أحد حفرها بقصد: علبة بسكوت، صدية ومقفلة من زاوية. تحتاج الإبهامين.'),
            N1('A glass marble. A ticket stub: Saltmere Summer Fair, 1991, admit two. A photo-booth strip: two boys, maybe seventeen, pulling faces, then laughing, then, in the last square, not laughing.', 'بلية زجاج. تذكرة: مهرجان صيف سولتمير، ١٩٩١، شخصين. شريط صور من الكشك: ولدين، يمكن عمرهم سبعطعش، يسوون وجيه، وبعدين يضحكون، وبعدين، في آخر مربع، ما يضحكون.'),
            N1('And a note, on paper torn from a school book.', 'وورقة، مقطوعة من دفتر مدرسة.'),
            { mini: 'paper', kind: 'letter', body: T('V. — Writing this the night before, in case I can\'t say it at the station. I know what you did with the engine. I\'ll pay you back every cent, and then some. Same wall, when I come home. Keep my marble till then. — J.', 'ف. — أكتبها الليلة اللي قبل، احتياط لو ما قدرت أقولها في المحطة. أدري وش سويت بالمكينة. برجّع لك كل قرش، وزيادة. نفس السور، لما أرجع. خل البلية عندك لين ذاك الوقت. — ج.') },
            N1('He wrote "when I come home". He never did. The tin waited for a boy who never came to lift the step.', 'كتب «لما أرجع». وما رجع أبد. والعلبة انتظرت ولد ما جا يرفع العتبة.'),
            st => { st.f.n9Tin = true; give('n9tin'); addMood(1); return null; }
          ] },
          { t: T('Leave it', '{خلها|خليها}'), then: [N1('Not yet. You press it back down with your heel. It rocks, waiting.', 'مو الحين. {ترجعها|ترجعينها} بكعبك. تتحرك، تنتظر.')] }
        ] }
      ] },
      { x: 20, y: 62, label: T('Down the row', 'آخر الشارع'), run: s => [
        N1('Down the row, past numbers 7 and 5, number 3: the same stone, the same boarded windows, the same SOLD sign.', 'آخر الشارع، بعد رقم ٧ ورقم ٥، رقم ٣: نفس الحجر، ونفس الشبابيك المسكّرة، ونفس لوحة «مباع».'),
        st => (st.f.knowV ? [N1('Victor\'s house. The Grand is going to knock down the house its owner grew up in. You wonder if anyone has told him, or if he signed it without reading the numbers.', 'بيت فيكتور. الغراند بيهدم البيت اللي تربى فيه صاحبه. {وتتساءل|وتتساءلين} إذا أحد قال له، ولا وقّع بدون ما يقرا الأرقام.')] : [N1('Number 3. Somebody grew up in that one too.', 'رقم ٣. أحد تربّى فيه بعد.')])
      ] }
    ]
  };
  /* the way in: from Fisher's Row, once you know */
  if (GAME.LOC.elias_ext) GAME.LOC.elias_ext.exits.push({ to: 'no9', x: 39, y: 62, label: T('Number 9, further down the row', 'رقم ٩، آخر الشارع'), if: s => open9(s) });

  /* the first time you stand there */
  GAME.EVENTS.push({ id: 'n9first', once: true, when: s => s.loc === 'no9' && !RUN, run: [
    N1('Number 9 is smaller than you pictured. You had pictured it, you realise. All your life, without knowing what you were picturing.', 'رقم ٩ أصغر مما {تخيلت|تخيلتي}. {وتنتبه|وتنتبهين} إنك كنت {متخيله|متخيلته}. طول عمرك، بدون ما {تدري|تدرين} وش {تتخيل|تتخيلين}.'),
    N1('Your father walked out of this door every morning before school, down to the harbour, to learn the nets. Then one morning he walked out and didn\'t come back.', 'أبوك كان يطلع من هالباب كل صبح قبل المدرسة، ينزل للميناء، يتعلم الشباك. وبعدين صبح من الأيام طلع وما رجع.')
  ] });

  /* at night, once you know who V. is */
  GAME.EVENTS.push({ id: 'n9night', once: true, when: s => s.loc === 'no9' && s.slot === NIGHT && !!s.f.knowV && !RUN, run: [
    N1('A car at the end of the row, lights off. A man in a good coat is standing at the gate of number 9. He doesn\'t see you.', 'سيارة في آخر الشارع، أنوارها طافية. رجال بكوت فاخر واقف عند بوابة رقم ٩. ما يشوفك.'),
    { show: [{ id: 'victor', e: 'sad' }] },
    N1('Victor. He puts his hand on the gate, once, the way you\'d put a hand on someone\'s shoulder. Then he walks back to the car, and it is a long time before the engine starts.', 'فيكتور. يحط يده على البوابة، مرة وحدة، مثل ما تحط يدك على كتف أحد. وبعدين يرجع للسيارة، ويطول الوقت قبل لا تشتغل المكينة.'),
    { show: null },
    st => { st.f.n9Victor = true; return null; }
  ] });

  /* who can tell you more */
  const topic = (id, t) => { GAME.TOPICS[id] = GAME.TOPICS[id] || []; GAME.TOPICS[id].push(t); };
  topic('elias', { id: 'n9tin', once: true, label: T('Show him the tin from number 9', '{وره|وريه} العلبة من رقم ٩'), if: s => has('n9tin') && s.f.metElias && !s.f.ended, run: [
    N1('Elias turns the fair ticket over in his fingers like it might still be warm.', 'إلياس يقلب تذكرة المهرجان بأصابعه كأنها لسا دافية.'),
    say('elias', 'sad', 'The step. Of course. That was their post office. Notes under the step, back and forth, every day for years. Their mothers never knew.', 'العتبة. أكيد. كانت بريدهم. أوراق تحت العتبة، رايحة جاية، كل يوم سنين. وأمهاتهم ما دروا.'),
    say('elias', 'neutral', 'Victor never went back to that step. After the train, after his father found out about the engine, he didn\'t walk down this row for a year.', 'فيكتور عمره ما رجع لهالعتبة. بعد القطار، وبعد ما أبوه درى عن المكينة، ما مشى في هالشارع سنة كاملة.'),
    say('elias', 'sad', 'So it waited for him. Thirty years. And it\'s you who lifted it. That\'s the sea for you. It brings things back to the wrong person at the right time.', 'فانتظرته. ثلاثين سنة. {وأنت|وأنتِ} اللي {رفعتها|رفعتيها}. هذا البحر. يرجّع الأشياء للشخص الغلط في الوقت الصح.')
  ] });
  topic('gregor', { id: 'n9wall', once: true, label: T('"Same wall, when I come home." Which wall?', '«نفس السور، لما أرجع.» أي سور؟'), if: s => has('n9tin'), run: [
    say('gregor', 'smile', 'Mine. The cemetery wall. The low bit by the yew, where you can see the whole bay. They sat there every evening, three summers running, and made plans out loud. Loud plans.', 'سوري أنا. سور المقبرة. الجزء الواطي جنب شجرة الطقسوس، اللي تشوف منه الخليج كله. كانوا يجلسون هناك كل مساء، ثلاث صيوف ورا بعض، ويخططون بصوت عالي. خطط عالية.'),
    say('gregor', 'neutral', 'Go and sit there. It\'s a good wall for it.', '{روح|روحي} {اجلس|اجلسي} هناك. سور زين لهالشي.'),
    st => { st.f.n9Wall = true; return null; }
  ] });
  if (GAME.LOC.cemetery) GAME.LOC.cemetery.spots.push({ x: 72, y: 62, label: T('The low wall by the yew', 'السور الواطي جنب الشجرة'), if: s => !!s.f.n9Wall && !s.f.n9Sat, run: s => [
    N1('You sit on the low wall by the yew. The whole bay is below you, and the hotel on its hill, and the row of small stone houses, very small from here.', '{تجلس|تجلسين} على السور الواطي جنب الشجرة. الخليج كله تحتك، والفندق على تلته، وصف البيوت الحجر الصغيرة، صغيرة مرة من هنا.'),
    N1('You take the marble out of the tin and hold it up. The bay turns upside down inside it.', '{تطلّع|تطلّعين} البلية من العلبة {وترفعها|وترفعينها}. الخليج ينقلب جواها.'),
    N1('Same wall. He meant to come back. You are the closest thing to him coming back that there will ever be.', 'نفس السور. كان ناوي يرجع. {وأنت|وأنتِ} أقرب شي لرجعته ممكن يصير.'),
    st => { st.f.n9Sat = true; addMood(2); return null; }
  ] });
  const inV = s => (GAME.H && GAME.H.victor ? GAME.H.victor.inV(s) : s.host === 'victor');
  topic('victor', { id: 'n9tin', once: true, label: T('Give him the tin from under the step', '{عطه|عطيه} العلبة اللي تحت العتبة'), if: s => has('n9tin') && inV(s), run: [
    N1('Victor knows the tin before you open it. He sits down, which you have never seen him do in front of anyone.', 'فيكتور يعرف العلبة قبل لا {تفتحها|تفتحينها}. يجلس، وعمرك ما {شفته|شفتيه} يجلس قدام أحد.'),
    say('victor', 'sad', 'I never lifted it. For a year I couldn\'t walk down this row. After that I walked past that step every day for thirty years, and I never once lifted it. I was so angry he went. I thought if I didn\'t look, he hadn\'t left anything.', 'عمري ما رفعتها. سنة كاملة ما قدرت أمشي في هالشارع. وبعدها مريت جنب هالعتبة كل يوم ثلاثين سنة، وعمري ما رفعتها. كنت معصب مرة إنه راح. حسبت إذا ما طالعت، يعني ما خلّى شي.'),
    N1('He holds the marble for a long time. "He was terrible at marbles," he says. "I let him win this one."', 'يمسك البلية وقت طويل. «كان سيئ مرة في البلي،» يقول. «خليته يفوز بهذي.»'),
    say('victor', 'neutral', 'Number 3 and number 9 are on my list. I signed it in a meeting. I didn\'t read the numbers. ...I will read them now.', 'رقم ٣ ورقم ٩ في قايمتي. وقعتها في اجتماع. ما قريت الأرقام. ...بقراها الحين.'),
    st => { take('n9tin'); st.f.n9V = true; return null; }
  ] });

  /* people notice */
  const chat = (who, line) => { const c = GAME.CHAR[who]; if (c) { c.chat = c.chat || []; c.chat.unshift(line); } };
  chat('olivia', { if: s => !!s.f.n9Window, e: 'neutral', t: T('Number 9 is first on their list. They always start with the empty ones. Then the street looks "abandoned" and they do the rest.', 'رقم ٩ أول واحد في قايمتهم. دايم يبدون بالفاضية. وبعدين الشارع يبان «مهجور» ويكملون الباقي.') });
  chat('elias', { if: s => !!s.f.n9Sat, e: 'smile', t: T('Gregor says you sat on the wall. Good. Somebody should.', 'غريغور يقول إنك {جلست|جلستي} على السور. زين. لازم أحد يجلس.') });
})();
