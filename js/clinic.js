/* =====================================================================
   Dr. Irene's clinic: things to do with her, not just to hear.
   (Any chapter. No trust, suspicion or ending changes: her own bond,
   s.f.irBond, only opens her own scenes.)

     · Help out at the clinic (mornings to afternoons, once a day, pays):
       an examination. The patient is someone from the story when the
       story is ready (Elias, Leo, Margaret), otherwise someone from town.
       Use real tools on them (stethoscope, light, thermometer, your
       hands), ask questions, write down what you find, and say what it is.
     · As you help, she talks:
         bond 2: lunch on the back step, why she stayed nineteen years.
         bond 4: one evening her car stops beside you: "Get in. I need
                 hands." A cut hand at the boathouse, and you hold the
                 needle (stitching game).
         bond 5: her old stethoscope.
     Skill: 🩺 Care (more time, steadier hands).
   ===================================================================== */
'use strict';
(function () {
  const K = window.MINIKIT; if (!K || !GAME.CHAR.irene) return;
  const { card, shell, skillOf, gain, blip, rec, wait } = K;
  const say = (e, en, ar) => ({ c: 'irene', e, t: T(en, ar) });
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const bond = s => s.f.irBond || 0;
  GAME.SKILLS.care = { icon: '🩺', name: T('Care', 'التمريض'), level: () => skillOf('skCare'), xp: () => S().f.skCare || 0, next: lv => 4 * lv * lv };
  const careUp = n => gain('skCare', n, GAME.SKILLS.care);

  /* ================= the examination =================
     The patient sits in front of you. Pick a tool (or drag it) and use
     it on them: the places it works on light up. The stethoscope plays
     what you would really hear (a heart, fast or slow or stumbling,
     crackling lungs, a wheeze). Ask questions. Every finding goes in the
     notebook; Irene says what she thinks of it. When you are ready,
     say what it is.
     The patients are the town's people, and what you find is their
     story: Elias's kidneys, Leo's panic, Margaret's pills. */
  const ZONES = { head: T('Head', 'الراس'), eyes: T('Eyes', 'العيون'), mouth: T('Mouth', 'الفم'), chest: T('Chest', 'الصدر'), belly: T('Belly', 'البطن'), hands: T('Hands', 'اليدين') };
  /* where those are on each person's picture (percent; the pictures are head to hips) */
  const ZPOS = {
    elias: { head: [50, 8], eyes: [50, 19], mouth: [52, 26], chest: [50, 45], belly: [50, 68], hands: [22, 93] },
    leo: { head: [48, 5], eyes: [46, 16], mouth: [46, 24], chest: [40, 46], belly: [42, 68], hands: [20, 78] },
    margaret: { head: [50, 6], eyes: [48, 17], mouth: [48, 25], chest: [50, 45], belly: [50, 64], hands: [55, 90] },
    kai: { head: [50, 5], eyes: [50, 13], mouth: [52, 19], chest: [50, 40], belly: [50, 60], hands: [12, 82] },
    rex: { head: [50, 5], eyes: [48, 17], mouth: [48, 22], chest: [48, 42], belly: [48, 62], hands: [10, 94] }
  };
  const TOOLS = [
    { id: 'steth', i: '🩺', t: T('Stethoscope', 'السماعة'), z: ['chest', 'belly'] },
    { id: 'light', i: '🔦', t: T('Light', 'الكشاف'), z: ['eyes', 'mouth'] },
    { id: 'thermo', i: '🌡️', t: T('Thermometer', 'الحرارة'), z: ['mouth'] },
    { id: 'hand', i: '✋', t: T('Feel', 'الجس'), z: ['head', 'chest', 'belly', 'hands'] }
  ];
  const NORMAL = {
    steth: [T('Heart steady, lungs clear.', 'القلب منتظم، والرئة صافية.'), 'normal'],
    light: [T('Nothing unusual.', 'ما فيه شي غريب.')],
    thermo: [T('36.8°. No fever.', '٣٦٫٨. ما فيه حرارة.')],
    hand: [T('Nothing there.', 'ما فيه شي هنا.')]
  };
  const F = (en, ar, key, snd) => ({ t: T(en, ar), key: !!key, snd });
  const CASES = {
    elias: { who: 'elias', e: 'sad', when: s => s.host === 'elias' && s.f.metElias && s.day >= 2 && !s.f.ended && !(s.done && s.done.elias),
      intro: [N1('Elias is on the examination couch with his cap in his hands, because Irene rang him and said "today, or I come to the house".', 'إلياس على سرير الكشف وكابه في يده، لأن إيرين اتصلت وقالت «اليوم، أو أجي البيت».'),
        { c: 'elias', e: 'angry', t: T('I\'m fine. Tell her I\'m fine.', 'أنا بخير. {قل|قولي} لها إني بخير.') },
        say('neutral', 'You examine him. He might let you. He won\'t let me.', '{أنت اكشف|أنتِ اكشفي} عليه. يمكن يخليك. أنا ما يخليني.')],
      find: {
        'steth:chest': F('At the bottom of both lungs, a faint crackle. Like someone crumpling paper. Fluid.', 'تحت الرئتين الثنتين، طقطقة خفيفة. كأن أحد يجعّد ورق. موية.', 1, 'crackle'),
        'light:eyes': F('The inside of his eyelids is pale. Much too pale.', 'داخل جفونه باهت. باهت مرة.', 1),
        'light:mouth': F('His mouth is dry, and his breath has a sour smell, like ammonia.', 'فمه ناشف، ونفسه فيه ريحة حامضة، مثل النشادر.', 1),
        'hand:hands': F('His fingers are puffy. You press the back of his hand with your thumb, and the dent stays after you let go.', 'أصابعه منفوخة. {تضغط|تضغطين} على ظهر يده بإبهامك، والغمزة تظل مكانها بعد ما {تشيل|تشيلين} إصبعك.', 1),
        'hand:chest': F('Under his collar, his skin is covered in fine scratches. "Itches," he says. "Old age."', 'تحت ياقته، جلده مليان خدوش صغيرة. «تحكني،» يقول. «كبر.»', 1),
        'hand:belly': F('He flinches when you press near his back. "Don\'t."', 'ينتفض لما {تضغط|تضغطين} قريب من ظهره. «لا.»')
      },
      ask: [{ q: T('"How are you sleeping?"', '«كيف نومك؟»'), a: F('"I\'m not. Up three, four times a night."', '«ما أنام. أقوم ثلاث أربع مرات بالليل.»') },
        { q: T('"Are you eating?"', '«تاكل؟»'), a: F('"Everything tastes of tin. Like sucking a spoon."', '«كل شي طعمه حديد. كأني أمص ملعقة.»', 1) }],
      dx: [['tired', T('Old age. He\'s just tired.', 'كبر سن. بس تعبان.')], ['heart', T('A weak heart', 'قلب ضعيف')], ['kidney', T('His kidneys are failing', 'الكلى تفشل')], ['sugar', T('Diabetes', 'السكر')]], ok: 'kidney',
      win: [say('sad', '...I can\'t talk about my patients. But you didn\'t need me to, did you.', '...ما أقدر أتكلم عن مرضاي. بس ما {احتجت|احتجتي} لي، صح.'),
        { c: 'elias', e: 'sad', t: T('Not here. Not in front of her. At home.', 'مو هنا. مو قدامها. في البيت.') },
        N1('He puts his cap on, and on the way out he touches your shoulder, once, the way you\'d touch a boat\'s rail for luck.', 'يلبس كابه، وهو طالع يلمس كتفك، مرة وحدة، مثل ما تلمس حافة القارب للحظ.')],
      lose: [say('neutral', 'Look at his hands again, and his eyes, and think about what cleans the blood. Then don\'t say it out loud. He knows.', '{طالع|طالعي} يدينه مرة ثانية، وعيونه، {وفكر|وفكري} وش اللي ينظف الدم. وبعدين لا {تقوله|تقولينه} بصوت عالي. هو يدري.')] },
    leo: { who: 'leo', e: 'sad', when: s => typeof ch2 === 'function' && ch2(s) && s.f.crashDone,
      intro: [N1('Leo is back, his wrist in a sling, sitting on his good hand so it won\'t shake. "It\'s happening again," he says, to the floor.', 'ليو رجع، يده في رباط، وقاعد على يده الثانية عشان ما ترجف. «تصير لي مرة ثانية،» يقولها للأرض.'),
        say('neutral', 'Go on. Same as I taught you.', 'يلا. مثل ما علمتك.')],
      find: {
        'steth:chest': F('His heart is racing, 130 at least. But the lungs are completely clear. No wheeze at all.', 'قلبه يركض، ١٣٠ على الأقل. بس الرئة صافية تماماً. ولا أي صفير.', 1, 'fast'),
        'hand:hands': F('His fingers are cold. "They tingle," he says. "Like pins."', 'أصابعه باردة. «تنمّل،» يقول. «مثل الدبابيس.»', 1),
        'light:eyes': F('Pupils fine. His eyes keep going to the window.', 'البؤبؤ طبيعي. بس عيونه تروح للشباك كل شوي.')
      },
      ask: [{ q: T('"When did it start?"', '«متى بدت؟»'), a: F('"A siren. Outside. Then I couldn\'t breathe, like the air was too thick to get in."', '«صفارة. برا. وبعدين ما قدرت أتنفس، كأن الهوا ثقيل ما يدخل.»', 1) },
        { q: T('"Has this happened before?"', '«صارت لك قبل؟»'), a: F('"Since... a night two years ago. A car. I don\'t want to talk about the car."', '«من... ليلة قبل سنتين. سيارة. ما أبي أتكلم عن السيارة.»', 1) }],
      dx: [['asthma', T('Asthma', 'ربو')], ['panic', T('A panic attack', 'نوبة هلع')], ['heart', T('A heart problem', 'مشكلة في القلب')], ['allergy', T('An allergy', 'حساسية')]], ok: 'panic',
      win: [say('sad', 'His lungs are perfect. It\'s what he\'s carrying. I can\'t stitch that.', 'رئته ممتازة. اللي فيه هو اللي شايله. وهذا ما أقدر أخيطه.'),
        say('neutral', 'Breathe with him. In for four, hold, out for six. It works better than anything I\'ve got in a bottle.', '{تنفس|تنفسي} معه. شهيق لأربع، {اكتم|اكتمي}، زفير لست. أنفع من أي شي عندي في علبة.'),
        N1('You breathe with him. In for four. Out for six. Somewhere around the tenth breath, his hand stops shaking.', '{تتنفس|تتنفسين} معه. شهيق لأربع. زفير لست. وعند النفس العاشر تقريباً، يده توقف رجفة.')],
      lose: [say('neutral', 'Clear lungs, fast heart, tingling hands, and a siren. That\'s not his chest. That\'s fear.', 'رئة صافية، قلب سريع، أيدين تنمّل، وصفارة. هذا مو صدره. هذا خوف.')] },
    margaret: { who: 'margaret', e: 'sad', when: s => s.host === 'margaret' && (has('pillsM') || s.f.mPills) && !(s.done && s.done.margaret),
      intro: [N1('Margaret Hart, in her good coat, sitting very straight. She came "for her knee". She has not mentioned her knee once.', 'مارغريت هارت، بكوتها الزين، قاعدة معتدلة مرة. جت «عشان ركبتها». وما جابت طاري ركبتها ولا مرة.'),
        say('neutral', 'Have a look at her. Gently.', '{شوف|شوفي} حالتها. بلطف.')],
      find: {
        'light:eyes': F('Her eyes follow the light late, as if they have to be told twice.', 'عيونها تلحق الضو متأخر، كأنها تحتاج أحد يقول لها مرتين.', 1),
        'steth:chest': F('Heart slow. Very slow. Fifty-two.', 'القلب بطيء. بطيء مرة. اثنين وخمسين.', 1, 'slow'),
        'light:mouth': F('Her mouth is very dry. She keeps licking her lips.', 'فمها ناشف مرة. وتبلل شفايفها كل شوي.', 1),
        'hand:hands': F('A small tremor in her fingers that stops the moment she notices you noticing.', 'رجفة صغيرة في أصابعها توقف أول ما تنتبه إنك {انتبهت|انتبهتي}.')
      },
      ask: [{ q: T('"How are you sleeping?"', '«كيف نومك؟»'), a: F('"Like the dead. And I dream of Daniel, every night. So clearly. As if he\'s in the room."', '«مثل الميت. وأحلم بدانيال، كل ليلة. واضح مرة. كأنه في الغرفة.»', 1) },
        { q: T('"Are you taking anything?"', '«تاخذين شي؟»'), a: F('"Only what Dr. Irene gives me." She doesn\'t look at Irene.', '«بس اللي تعطيني الدكتورة إيرين.» وما تطالع إيرين.', 1) }],
      dx: [['grief', T('Just grief', 'حزن بس')], ['sedative', T('Too much of a strong sedative', 'مهدئ قوي، وكثير')], ['flu', T('The flu', 'إنفلونزا')], ['memory', T('Early memory loss', 'بداية نسيان')]], ok: 'sedative',
      win: [say('angry', 'Slow heart, slow eyes, dry mouth, and dreams that feel real. That isn\'t what I gave her.', 'قلب بطيء، وعيون بطيئة، وفم ناشف، وأحلام كأنها حقيقة. هذا مو اللي أعطيتها.'),
        say('sad', 'Get her to stop. Gently. And find out who\'s selling them.', '{خلها|خليها} توقف. بلطف. {وشوف|وشوفي} مين يبيعها.')],
      lose: [say('neutral', 'Grief doesn\'t slow your heart to fifty-two. Something in a bottle does.', 'الحزن ما يبطّي القلب لاثنين وخمسين. شي في علبة يسويها.')] },
    kai: { who: 'kai', e: 'sad', when: () => true,
      intro: [N1('Kai, wet hair, holding a bag of frozen peas to the back of his head, grinning like this is a fun story.', 'كاي، شعره مبلول، ماسك كيس بازلاء مجمدة على ورا راسه، ويبتسم كأنها سالفة حلوة.'), say('neutral', 'Surfer. Check him properly. They always say they\'re fine.', 'متزلج موج. {اكشف|اكشفي} عليه زين. دايم يقولون إنهم بخير.')],
      find: {
        'light:eyes': F('One pupil is bigger than the other. It doesn\'t shrink in the light like the other one.', 'بؤبؤ أكبر من الثاني. وما يصغر مع الضو مثل الثاني.', 1),
        'hand:head': F('A lump on the back of his head, the size of an egg.', 'ورم ورا راسه، كبر البيضة.', 1),
        'thermo:mouth': F('36.4°. A bit cold from the sea. Nothing else.', '٣٦٫٤. بارد شوي من البحر. بس.')
      },
      ask: [{ q: T('"What happened?"', '«وش صار؟»'), a: F('"Board hit me. Or I hit the board. We hit each other, honestly."', '«اللوح ضربني. أو أنا ضربت اللوح. ضربنا بعض، بصراحة.»', 1) },
        { q: T('"What day is it?"', '«اليوم وش؟»'), a: F('"Thursday. ...No. Tuesday? Hang on. Is it still today?"', '«الخميس. ...لا. الثلاثاء؟ لحظة. لسا اليوم اليوم؟»', 1) }],
      dx: [['sun', T('Too much sun', 'شمس كثير')], ['concussion', T('A concussion', 'ارتجاج في المخ')], ['sea', T('Seasick', 'دوار بحر')], ['hungover', T('Hungover', 'سهران')]], ok: 'concussion',
      win: [say('smile', 'Concussion. Nobody lets him sleep tonight, and nobody lets him surf for a week.', 'ارتجاج. محد يخليه ينام الليلة، ومحد يخليه يتزلج أسبوع.'), { c: 'kai', e: 'shock', t: T('A WEEK?', 'أسبوع؟!') }],
      lose: [say('neutral', 'Uneven pupils and he doesn\'t know what day it is. That\'s his brain, not his stomach.', 'بؤبؤ مو متساوي وما يدري اليوم وش. هذا مخه، مو بطنه.')] },
    rex: { who: 'rex', e: 'neutral', when: () => true,
      intro: [N1('Officer Rex, in uniform, sitting on the edge of the couch with one knee going up and down like a sewing machine.', 'الضابط ريكس، باللبس الرسمي، قاعد على طرف السرير ورجله تطلع وتنزل مثل مكينة الخياطة.'), say('neutral', 'Says his heart\'s "doing a thing". Listen to it.', 'يقول قلبه «يسوي حركات». {اسمعه|اسمعيه}.')],
      find: {
        'steth:chest': F('Fast and fluttery. A hundred and ten, sitting still.', 'سريع ويرفرف. مية وعشرة، وهو قاعد.', 1, 'fast'),
        'hand:hands': F('A fine tremor. His fingers are drumming on his knee. He hasn\'t noticed.', 'رجفة خفيفة. أصابعه تطبل على ركبته. وما انتبه.', 1),
        'light:eyes': F('Red-rimmed. Tired eyes, nothing worse.', 'حمرا من الأطراف. عيون تعبانة، بس.')
      },
      ask: [{ q: T('"How much coffee today?"', '«كم كوب قهوة اليوم؟»'), a: F('"Today? Seven. Eight. Marco does a large. Is that a lot?"', '«اليوم؟ سبعة. ثمانية. ماركو يسوي كبير. هذا كثير؟»', 1) },
        { q: T('"How are you sleeping?"', '«كيف نومك؟»'), a: F('"I don\'t, really. Paperwork."', '«ما أنام، يعني. أوراق.»', 1) }],
      dx: [['heart', T('A heart condition', 'مرض في القلب')], ['coffee', T('Too much coffee, too little sleep', 'قهوة كثير، ونوم قليل')], ['fever', T('A fever', 'حرارة')], ['food', T('Food poisoning', 'تسمم أكل')]], ok: 'coffee',
      win: [say('smile', 'Prescription: water, a bed, and Marco is not to serve you anything larger than a thimble.', 'الوصفة: موية، وسرير، وماركو ممنوع يعطيك شي أكبر من كشتبان.'), { c: 'rex', e: 'sad', t: T('This is the worst day of my career.', 'هذا أسوأ يوم في حياتي المهنية.') }],
      lose: [say('neutral', 'Ask a policeman how much coffee he drinks. Always ask.', '{اسأل|اسألي} الشرطي كم يشرب قهوة. دايم {اسأل|اسألي}.')] }
  };
  const pickCase = s => {
    for (const id of ['elias', 'leo', 'margaret']) { const c = CASES[id]; if (!s.f['ex_' + id] && c.when(s) && GAME.CHAR[id]) return id; }
    const gen = ['kai', 'rex'].filter(id => GAME.CHAR[id]);
    const fresh = gen.filter(id => !s.f['ex_' + id]);
    return (fresh.length ? fresh : gen)[(s.f.irShifts || 0) % (fresh.length || gen.length)];
  };

  /* what you hear through the stethoscope, made in the browser */
  function listen(kind, secs) {
    const c = (() => { try { if (typeof AUDIO !== 'undefined' && !AUDIO.on) return null; return new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } })();
    if (!c) return () => {};
    const out = c.createGain(); out.gain.value = 0.9; out.connect(c.destination);
    const t0 = c.currentTime + 0.05, end = t0 + secs;
    const thump = (t, f, k) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.12); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(k, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16); o.connect(g).connect(out); o.start(t); o.stop(t + 0.2); };
    const noise = (t, d, f, q, k) => { const b = c.createBuffer(1, Math.ceil(c.sampleRate * d), c.sampleRate), x = b.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(k, t + d * 0.3); g.gain.linearRampToValueAtTime(0.0001, t + d); s.connect(bp).connect(g).connect(out); s.start(t); };
    const bpm = { normal: 72, fast: 128, slow: 52, crackle: 84 }[kind] || 72;
    for (let t = t0; t < end; t += 60 / bpm * (kind === 'irregular' ? 0.6 + Math.random() * 0.8 : 1)) { thump(t, 62, 0.9); thump(t + 0.14 * (bpm < 100 ? 1 : 0.7), 52, 0.6); }
    /* breathing under it: in for 2s, out for 2s */
    for (let t = t0; t < end; t += 4) {
      noise(t, 1.8, 500, 0.6, 0.06); noise(t + 2, 1.9, 380, 0.6, 0.05);
      if (kind === 'crackle') for (let k = 0; k < 14; k++) { const tt = t + 1.2 + Math.random() * 0.8; noise(tt, 0.012, 2400, 2, 0.35); }
      if (kind === 'wheeze') { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(720, t + 2); o.frequency.linearRampToValueAtTime(640, t + 3.8); g.gain.setValueAtTime(0.0001, t + 2); g.gain.linearRampToValueAtTime(0.05, t + 2.5); g.gain.linearRampToValueAtTime(0.0001, t + 3.9); o.connect(g).connect(out); o.start(t + 2); o.stop(t + 4); }
    }
    let shut = false; const stop = () => { if (shut) return; shut = true; try { c.close().catch(() => {}); } catch (e) { /* closed */ } };
    setTimeout(stop, secs * 1000 + 400); return stop;
  }

  GAME.MINI.exam = function (panel, done, stp) {
    panel.innerHTML = '';
    const s = S(), id = (stp && stp.caseId) || pickCase(s), C = CASES[id], lv = skillOf('skCare');
    const f = card('cp-clinic cp-exam', T('Examination', 'الكشف'), T('Pick a tool, then touch the patient where it works. Ask questions. Then say what it is.', '{اختر|اختاري} أداة، وبعدين {المس|المسي} المريض في المكان اللي تشتغل فيه. {اسأل|اسألي}. وبعدين {قل|قولي} وش فيه.'));
    const sh = shell(f, done, 1);
    f.box.dataset.case = id;
    f.q('.g-skill').textContent = '🩺 ' + lv;
    f.area.innerHTML = `<div class="ex-pat"><div class="ex-fig"><img src="img/chars/${C.who}-${C.e}.webp" alt=""></div><div class="ex-wave"><i></i><i></i><i></i></div></div>
      <div class="ex-side"><div class="ex-ire"><img src="img/chars/irene-neutral.webp" alt=""><p></p></div><ol class="ex-notes"></ol><div class="ex-ask"></div></div>
      <div class="ex-tray"></div><div class="ex-dx" hidden><p></p><div class="ex-dxb"></div></div>`;
    const q = f.q, fig = q('.ex-fig'), notes = q('.ex-notes'), tray = q('.ex-tray');
    const ire = (t, e) => { q('.ex-ire p').textContent = tx(t); q('.ex-ire img').src = `img/chars/irene-${e || 'neutral'}.webp`; q('.ex-ire').classList.remove('pop'); void q('.ex-ire').offsetWidth; q('.ex-ire').classList.add('pop'); };
    ire(T('Take your time. Look before you guess.', 'على مهلك. {طالع|طالعي} قبل لا {تخمن|تخمنين}.'));
    /* the places on the person */
    const zp = ZPOS[C.who] || ZPOS.elias;
    Object.entries(ZONES).forEach(([z, Z]) => { const d = el('button', 'ex-zone'); d.type = 'button'; d.dataset.z = z; d.style.left = zp[z][0] + '%'; d.style.top = zp[z][1] + '%'; d.title = tx(Z); fig.appendChild(d); });
    TOOLS.forEach(t => { const b = el('button', 'ex-tool'); b.type = 'button'; b.dataset.t = t.id; b.innerHTML = `<i>${t.i}</i><span>${tx(t.t)}</span>`; tray.appendChild(b); });
    const dxBtn = el('button', 'ex-go'); dxBtn.type = 'button'; dxBtn.textContent = tx(T('What is it?', 'وش فيه؟')); tray.appendChild(dxBtn);
    C.ask.forEach((a, i) => { const b = el('button', 'ex-q'); b.type = 'button'; b.dataset.i = i; b.textContent = tx(a.q); q('.ex-ask').appendChild(b); });
    let tool = null, keys = 0, seen = new Set(), stopSound = null;
    const setTool = t => { tool = t; tray.querySelectorAll('.ex-tool').forEach(b => b.classList.toggle('on', b.dataset.t === t)); const ok = t ? TOOLS.find(x => x.id === t).z : []; fig.querySelectorAll('.ex-zone').forEach(d => d.classList.toggle('live', ok.includes(d.dataset.z))); f.box.dataset.tool = t || ''; };
    const note = (fd, icon, already) => {
      if (already) { ire(T('You\'ve already looked there.', 'هذا {شفته|شفتيه} قبل.')); return; }
      const li = el('li', fd.key ? 'k' : ''); li.innerHTML = `<i>${icon}</i><span></span>`; li.querySelector('span').textContent = tx(fd.t); notes.appendChild(li); notes.scrollTop = notes.scrollHeight;
      if (fd.key) { keys++; careUp(1); ire(pickOne([T('Hm. Write that down.', 'همم. {اكتبها|اكتبيها}.'), T('That\'s not nothing.', 'هذا مو ولا شي.'), T('Good. Remember that.', 'زين. {تذكرها|تذكريها}.'), T('Now we\'re getting somewhere.', 'الحين بدينا نوصل.')]), 'neutral'); }
      else ire(pickOne([T('Normal. That\'s useful too.', 'طبيعي. وهذا مفيد بعد.'), T('Fine. Keep looking.', 'تمام. {كمّل|كمّلي} تدوير.'), T('Nothing there. Good.', 'ما فيه شي. زين.')]));
      f.q('.g-count').textContent = tx(T(`Notes: ${notes.children.length}`, `الملاحظات: ${notes.children.length}`));
      dxBtn.classList.toggle('ready', notes.children.length >= 3);
    };
    const use = z => {
      if (!tool || sh.isOver()) return;
      const T0 = TOOLS.find(x => x.id === tool); if (!T0.z.includes(z)) { ire(T('Not with that.', 'مو بهذي.')); return; }
      const k = tool + ':' + z, fd = C.find[k] || (tool === 'steth' ? F(NORMAL.steth[0].en, NORMAL.steth[0].ar, 0, 'normal') : { t: NORMAL[tool][0], key: false });
      const already = seen.has(k); seen.add(k);
      const zd = fig.querySelector(`.ex-zone[data-z="${z}"]`); zd.classList.add('hit'); setTimeout(() => zd.classList.remove('hit'), 700);
      if (tool === 'steth') { if (stopSound) stopSound(); stopSound = listen(fd.snd || 'normal', 4.2); q('.ex-wave').className = 'ex-wave on ' + (fd.snd || 'normal'); setTimeout(() => { q('.ex-wave').className = 'ex-wave'; }, 4200); }
      else if (tool === 'thermo') { blip(1900, 0.06, 0.08, 'square'); setTimeout(() => blip(1900, 0.06, 0.08, 'square'), 160); }
      else if (tool === 'light') blip(1200, 0.03, 0.06, 'square');
      else blip(240, 0.08, 0.08);
      note(fd, T0.i, already);
    };
    tray.addEventListener('click', ev => { const b = ev.target.closest('.ex-tool'); if (b) { ev.stopPropagation(); setTool(tool === b.dataset.t ? null : b.dataset.t); blip(900, 0.03, 0.05); } });
    fig.addEventListener('click', ev => { const d = ev.target.closest('.ex-zone'); if (d) { ev.stopPropagation(); use(d.dataset.z); } });
    /* or drag a tool straight onto the person */
    let drag = null;
    tray.addEventListener('pointerdown', ev => { const b = ev.target.closest('.ex-tool'); if (!b) return; drag = { t: b.dataset.t, x: ev.clientX, y: ev.clientY, g: null }; });
    const mv = ev => { if (!drag) return; if (!f.box.isConnected) { drag = null; return; } if (!drag.g && Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) > 12) { setTool(drag.t); drag.g = el('div', 'ex-ghost', TOOLS.find(x => x.id === drag.t).i); document.body.appendChild(drag.g); } if (drag.g) { drag.g.style.left = ev.clientX + 'px'; drag.g.style.top = ev.clientY + 'px'; } };
    const upH = ev => { if (!drag) return; const d = drag; drag = null; if (!d.g) return; d.g.remove(); const tgt = document.elementFromPoint(ev.clientX, ev.clientY); const z = tgt && tgt.closest && tgt.closest('.ex-zone'); if (z) use(z.dataset.z); };
    window.addEventListener('pointermove', mv, true); window.addEventListener('pointerup', upH, true); window.addEventListener('pointercancel', upH, true);
    const unhook = () => { window.removeEventListener('pointermove', mv, true); window.removeEventListener('pointerup', upH, true); window.removeEventListener('pointercancel', upH, true); document.querySelectorAll('.ex-ghost').forEach(g => g.remove()); if (stopSound) stopSound(); };
    const fin0 = sh.finish; sh.finish = r => { unhook(); fin0(r); };
    f.q('.cp-skip').addEventListener('click', unhook);
    { const altB = document.querySelector('#panel .cp-alt'); if (altB) altB.addEventListener('click', unhook); }
    q('.ex-ask').addEventListener('click', ev => { const b = ev.target.closest('.ex-q'); if (!b || b.disabled) return; ev.stopPropagation(); b.disabled = true; note(C.ask[+b.dataset.i].a, '💬', false); });
    dxBtn.addEventListener('click', ev => {
      ev.stopPropagation(); if (notes.children.length < 2) { ire(T('You haven\'t looked at anything yet.', 'ما {شفت|شفتي} شي للحين.'), 'angry'); return; }
      if (stopSound) stopSound(); setTool(null);
      const box = q('.ex-dx'); box.hidden = false; box.querySelector('p').textContent = tx(T('So. What is it?', 'طيب. وش فيه؟'));
      const bb = box.querySelector('.ex-dxb'); bb.innerHTML = '';
      C.dx.forEach(([k, t]) => { const b = el('button', 'ex-d'); b.type = 'button'; b.dataset.k = k; b.textContent = tx(t); bb.appendChild(b); });
      const back = el('button', 'ex-d back'); back.type = 'button'; back.textContent = tx(T('Look again', 'أرجع أشوف')); bb.appendChild(back);
      bb.onclick = e2 => { const b = e2.target.closest('.ex-d'); if (!b) return; e2.stopPropagation();
        if (b.classList.contains('back')) { box.hidden = true; return; }
        const ok = b.dataset.k === C.ok; b.classList.add(ok ? 'ok' : 'no'); bb.querySelectorAll('.ex-d').forEach(x => { x.disabled = true; if (x.dataset.k === C.ok) x.classList.add('ok'); });
        blip(ok ? 784 : 180, 0.2, 0.15, ok ? 'triangle' : 'sawtooth'); if (ok) careUp(3);
        setTimeout(() => sh.finish({ id, ok, keys, notes: notes.children.length }), 1500); };
    });
  };
  window.__examCases = CASES;
  /* ================= stitches (the night call) ================= */
  GAME.MINI.stitch = function (panel, done) {
    panel.innerHTML = '';
    const lv = skillOf('skCare');
    const f = card('cp-clinic cp-stitch', T('Hold the needle', '{امسك|امسكي} الإبرة'), T('Draw each stitch across the cut, from dot to dot. Steady.', '{ارسم|ارسمي} كل غرزة عبر الجرح، من نقطة لنقطة. بثبات.'));
    const sh = shell(f, done, 5);
    f.q('.g-skill').textContent = '🩺 ' + lv;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 400 200'); svg.setAttribute('class', 'st-svg'); f.area.appendChild(svg);
    /* a palm seen from above, clean and simple; a straight cut across it */
    const skin = 'fill="#f1c9a5" stroke="#b98a67" stroke-width="3"';
    svg.innerHTML = `<rect width="400" height="200" fill="#e9eef1"/>
      <rect x="0" y="62" width="70" height="84" rx="10" fill="#7a9db0"/>
      <g ${skin}><rect x="282" y="34" width="96" height="26" rx="13"/><rect x="290" y="64" width="104" height="26" rx="13"/><rect x="288" y="94" width="98" height="26" rx="13"/><rect x="280" y="124" width="82" height="24" rx="12"/>
      <path d="M150 152 C120 170 92 168 86 150 C82 136 108 128 130 132 Z"/>
      <path d="M60 70 C120 52 250 38 300 52 C312 92 312 120 296 150 C230 168 120 160 60 140 Z"/></g>
      <path d="M150 112 C180 109 225 106 268 108" stroke="#c0574a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g class="st-done"></g><g class="st-dots"></g><path class="st-line" d="" fill="none"/>`;
    const N = 5, pts = []; for (let k = 0; k < N; k++) { const x = 162 + k * 24, y = 111 - k * 0.8; pts.push({ a: { x: x - 3, y: y - 17 }, b: { x: x + 3, y: y + 17 } }); }
    const dots = svg.querySelector('.st-dots'), line = svg.querySelector('.st-line'), doneG = svg.querySelector('.st-done');
    let k = 0, from = null, wobble = 0, good = 0;
    const draw = () => { dots.innerHTML = ''; if (k >= N) return; const p = pts[k]; dots.innerHTML = `<circle cx="${p.a.x}" cy="${p.a.y}" r="6" class="st-a"/><circle cx="${p.b.x}" cy="${p.b.y}" r="6" class="st-b"/><line x1="${p.a.x}" y1="${p.a.y}" x2="${p.b.x}" y2="${p.b.y}" class="st-guide"/>`; f.q('.g-count').textContent = tx(T(`Stitch ${k + 1} / ${N}`, `الغرزة ${k + 1} / ${N}`)); f.box.dataset.k = k; };
    const pt = ev => { const m = svg.getScreenCTM(); const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; const r = p.matrixTransform(m.inverse()); return { x: r.x, y: r.y }; };
    const dist = (p, q2) => Math.hypot(p.x - q2.x, p.y - q2.y);
    svg.addEventListener('pointerdown', ev => { if (sh.isOver() || k >= N) return; ev.preventDefault(); const p = pt(ev); if (dist(p, pts[k].a) < 18) { from = p; wobble = 0; try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* none */ } } });
    svg.addEventListener('pointermove', ev => {
      if (!from || k >= N) return; const p = pt(ev), A = pts[k].a, B = pts[k].b;
      line.setAttribute('d', `M${A.x} ${A.y} L${p.x} ${p.y}`);
      const vx = B.x - A.x, vy = B.y - A.y, l = Math.hypot(vx, vy), off = Math.abs((p.x - A.x) * vy - (p.y - A.y) * vx) / l; wobble = Math.max(wobble, off);
      if (off > 14 + lv * 2) { from = null; line.setAttribute('d', ''); f.hint(T('"Steady. Start that one again."', '«بثبات. {ابدأ|ابدئي} هذي من جديد.»')); blip(180, 0.15, 0.12, 'sawtooth'); return; }
      if (dist(p, B) < 12) {
        from = null; line.setAttribute('d', ''); if (wobble < 7 + lv) good++;
        doneG.insertAdjacentHTML('beforeend', `<path d="M${A.x} ${A.y} L${B.x} ${B.y} M${A.x - 5} ${A.y + 2} L${A.x + 5} ${A.y - 2} M${B.x - 5} ${B.y + 2} L${B.x + 5} ${B.y - 2}" class="st-st"/>`);
        blip(700 + k * 60, 0.08, 0.1, 'triangle'); careUp(1); k++;
        if (k >= N) { f.hint(T('"Done. You didn\'t faint. I\'m impressed."', '«خلصنا. وما {أغمى عليك|أغمى عليكِ}. انبهرت.»')); setTimeout(() => sh.finish({ good, total: N }), 1300); }
        else f.hint(pickOne([T('"Good. Next."', '«زين. اللي بعدها.»'), T('"Nice and even."', '«مرتبة ومتساوية.»'), T('"Keep going."', '«{كمّل|كمّلي}.»')]));
        draw();
      }
    });
    svg.addEventListener('pointerup', () => { if (from) { from = null; line.setAttribute('d', ''); } });
    draw();
  };

  /* ================= in the story ================= */
  const offToday = s => (s.f.irArc || 0) >= 2 && weekday(s.day) === 0 && s.slot === 2;
  GAME.TOPICS.irene.unshift({ id: 'shift', cls: 'main', label: T('Help out at the clinic (a shift, paid)', '{تساعد|تساعدين} في العيادة (دوام، بفلوس)'),
    if: s => s.loc === 'clinic' && s.slot <= 2 && !offToday(s) && !doneToday('irShift'),
    run: s => {
      onceToday('irShift'); s.f.irShifts = (s.f.irShifts || 0) + 1; const n = s.f.irShifts;
      const intro = n === 1 ? [say('neutral', 'You want to help? Can you read? Can you count? Can you not faint?', '{تبي|تبين} {تساعد|تساعدين}؟ {تعرف|تعرفين} تقرا؟ {تعرف|تعرفين} تحسب؟ {تقدر|تقدرين} ما {يغمى عليك|يغمى عليكِ}؟'), say('smile', 'Good enough. Coat\'s on the hook.', 'يكفي. البالطو على الشماعة.')]
        : [{ c: 'irene', e: 'neutral', t: pickOne([T('Coat\'s on the hook. Waiting room\'s full.', 'البالطو على الشماعة. غرفة الانتظار مليانة.'), T('Ah, my unpaid... my underpaid assistant.', 'آه، {مساعدي|مساعدتي} اللي بدون راتب... بالراتب القليل.'), T('Good, you\'re here. Mrs Okafor is here too. Brace yourself.', 'زين إنك جيت. السيدة أوكافور جت بعد. {استعد|استعدي}.')]) }];
      const cid = pickCase(s), C = CASES[cid];
      return intro.concat([{ show: [{ id: C.who, e: C.e }, { id: 'irene', e: 'neutral' }] }], C.intro, [{ mini: 'exam', caseId: cid, then: (r, st) => {
        const ok = !!(r && r.ok), pay = r ? (ok ? 8 : 4) + Math.min(3, r.keys || 0) : 3;
        st.money += pay; advance(1); if (r) st.f['ex_' + cid] = ok ? 'ok' : 'miss';
        const was = bond(st); st.f.irBond = was + 1;
        const out = (r ? (ok ? C.win : C.lose) : []).slice();
        out.push(N1(`She counts out $${pay} from the petty cash tin, and writes it down, because she writes everything down.`, `تعد لك ${pay}$ من علبة الفكة، وتكتبها، لأنها تكتب كل شي.`));
        if (r && ok) out.push(say('smile', 'You\'re good at this. Don\'t let it go to your head. Let it go to your hands.', '{أنت زين|أنتِ زينة} في هذا. لا {تخليه|تخلينه} يروح لراسك. {خله|خليه} يروح ليدينك.'));
        if (was < 2 && st.f.irBond >= 2) out.push(N1('On your way out she says, without looking up: "I eat at one. Back step. If you\'re hungry."', 'وأنت {طالع|طالعة} تقول، بدون ما ترفع راسها: «أتغدى الساعة وحدة. على الدرج اللي ورا. إذا {جوعان|جوعانة}.»'));
        if (was < 4 && st.f.irBond >= 4) out.push(N1('She gives you her mobile number on the back of a prescription pad. "In case. You never know, in this town."', 'تعطيك رقم جوالها على ظهر ورقة وصفة. «احتياط. ما تدري، في هالبلد.»'));
        out.push({ show: null });
        return out;
      } }]);
    } });

  /* bond 2: lunch on the back step */
  GAME.TOPICS.irene.push({ id: 'irLunch', once: true, label: T('Eat lunch with her on the back step', '{تتغدى|تتغدين} معها على الدرج اللي ورا'), if: s => s.loc === 'clinic' && bond(s) >= 2 && s.slot === 1, run: s => { needs().food = clamp(needs().food + 15, 0, 100); return [
    N1('The back step of the clinic looks at the bins, and past the bins, the sea. She has two sandwiches. She has always had two sandwiches, she says, in case.', 'الدرج اللي ورا العيادة يطالع على الزبالة، وورا الزبالة، البحر. معها سندويشتين. وتقول إنها دايم معها سندويشتين، احتياط.'),
    say('neutral', 'I came for one summer. Nineteen years ago. The old doctor, Dr. Wren, needed a locum for August.', 'جيت صيف واحد. قبل تسعطعش سنة. الدكتور القديم، دكتور رين، كان يبي بديل لشهر أغسطس.'),
    say('sad', 'He died in my second week. Heart. In that chair in there. I said I\'d stay until they found someone.', 'مات في ثاني أسبوع لي. قلبه. على ذاك الكرسي اللي داخل. قلت بقعد لين يلقون أحد.'),
    say('smile', 'Nobody looked. Neither did I.', 'محد دوّر. ولا أنا.'),
    say('neutral', 'Some nights I still think about the surgeon I was going to be. Then somebody\'s grandmother rings at three in the morning, and I get up.', 'بعض الليالي لسا أفكر في الجرّاحة اللي كنت بصيرها. وبعدين جدة أحد تتصل الساعة ثلاث الفجر، وأقوم.'),
    { menu: [
      { t: T('"Do you regret it?"', '«ندمانة؟»'), then: [say('neutral', 'Every Tuesday. Never on a Wednesday. I don\'t know why.', 'كل ثلاثاء. وعمري ما ندمت يوم أربعاء. ما أدري ليش.')] },
      { t: T('"The town\'s lucky."', '«البلد محظوظة فيك.»'), then: [say('smile', 'Tell that to Mrs Okafor. She thinks I\'m the receptionist.', '{قلها|قوليها} للسيدة أوكافور. تحسبني موظفة الاستقبال.')] }
    ] },
    s2 => { s2.f.irLunchDone = true; addMood(1); return null; }
  ]; } });

  /* bond 4: the night call */
  GAME.EVENTS.push({ id: 'irNight', once: true,
    when: s => !RUN && bond(s) >= 4 && s.slot === 3 && s.loc === 'street' && !s.f.prologue && !s.f.ended,
    run: [
      N1('Headlights. A small dented car stops beside you with its window already down.', 'أنوار سيارة. سيارة صغيرة معفوسة توقف جنبك والشباك نازل من قبل.'),
      { show: [{ id: 'irene', e: 'shock' }] },
      say('shock', 'Get in. I need hands. Steady ones. Yours will do.', '{اركب|اركبي}. أحتاج أيدين. ثابتة. يدينك تمشي.'),
      { go: 'harbor' }, { show: [{ id: 'irene', e: 'neutral' }] },
      N1('A young fisherman sits on an upturned crate, white as paper, holding a rag round his hand. A gutting knife slipped. His mates are pretending not to look.', 'صياد صغير قاعد على صندوق مقلوب، وجهه أبيض مثل الورق، ماسك خرقة على يده. سكين التنظيف زلقت. وربعه يسوون نفسهم ما يطالعون.'),
      say('neutral', 'Clean cut. Five stitches. My hands are shaking from coffee. You do it, I\'ll talk you through.', 'جرح نظيف. خمس غرز. يديني ترجف من القهوة. {سوّها أنت|سوّيها أنتِ}، وأنا أقول لك.'),
      { mini: 'stitch', then: (r, st) => { st.f.irNightDone = true; st.f.irBond = bond(st) + 1; st.money += 10;
        return [r && r.good >= 4 ? say('smile', 'Look at that. Neater than mine. Don\'t tell anyone.', '{شف|شوفي}. أرتب من غرزي. لا {تقول|تقولين} لأحد.') : say('neutral', 'They\'ll hold. He\'ll have a scar to show off. Fishermen like scars.', 'بتمسك. وبيصير عنده ندبة يتفشخر فيها. الصيادين يحبون الندبات.'),
          N1('The fisherman shakes your hand with his good one and presses a ten-dollar note into it. "For the doctor\'s helper."', 'الصياد يصافحك بيده الثانية ويحط في يدك عشرة دولار. «لمساعد الدكتورة.»'),
          say('neutral', 'I\'ll drive you back. You did well. I don\'t say that. Write it down.', 'بوصلك. {سويتها|سويتيها} زين. وأنا ما أقولها. {اكتبها|اكتبيها}.')]; } },
      { show: null }
    ] });

  /* bond 5: her old stethoscope */
  Object.assign(GAME.ITEMS, { scope: { name: T('Dr. Wren\'s stethoscope', 'سماعة دكتور رين'), desc: T('Old, heavy, perfectly kept. Irene used it for nineteen years.', 'قديمة، وثقيلة، ومحفوظة تمام. إيرين استخدمتها تسعطعش سنة.') } });
  GAME.TOPICS.irene.push({ id: 'irGift', once: true, label: T('She has something for you', 'عندها لك شي'), cls: 'main', if: s => s.loc === 'clinic' && bond(s) >= 5 && s.f.irNightDone && !has('scope'), run: s => { give('scope'); addMood(1); return [
    say('neutral', 'This was Dr. Wren\'s. He gave it to me the first day, because mine was "a toy".', 'هذي كانت لدكتور رين. عطاني إياها أول يوم، لأن حقتي كانت «لعبة».'),
    say('smile', 'I bought a new one years ago and kept using this. Take it. Somebody should be listening to this town besides me.', 'شريت وحدة جديدة من سنين وظليت أستخدم هذي. {خذها|خذيها}. لازم أحد غيري يسمع لهالبلد.')]; } });

  /* she talks about you */
  const c = GAME.CHAR.irene; c.chat = c.chat || [];
  c.chat.unshift({ if: s => bond(s) >= 3, e: 'smile', t: T('Mrs Okafor asked if you were my new nurse. I said yes. You\'re not paid enough to be my nurse.', 'السيدة أوكافور سألت إذا {أنت ممرضي|أنتِ ممرضتي} الجديدة. قلت إيه. وما تنصرف لك فلوس كفاية عشان تصير كذا.') });
  if (GAME.CHAR.marco && Array.isArray(GAME.CHAR.marco.chat)) GAME.CHAR.marco.chat.unshift({ if: s => !!s.f.irNightDone, e: 'shock', t: T('You stitched up the Doyle boy? On the dock? At night? Irene let someone else hold a needle? The world is ending.', '{خيطت|خيطتي} جرح ولد دويل؟ على الرصيف؟ بالليل؟ إيرين خلت أحد غيرها يمسك إبرة؟ الدنيا بتخلص.') });
})();
