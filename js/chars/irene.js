/* =====================================================================
   Dr. Irene — The only doctor between here and the city.
   Everything that is Dr. Irene's own: profile, where Dr. Irene is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (elias.js and every later chapter).
   ===================================================================== */
'use strict';
(function () {
  /* who Dr. Irene is and Dr. Irene's daily routine (Chapter 1, Elias) */
  GAME.CHAR.irene = {
    name: T('Dr. Irene', 'الدكتورة إيرين'), short: T('Irene', 'إيرين'), role: T('The only doctor between here and the city.', 'الطبيبة الوحيدة بين هنا والمدينة.'), art: true,
    where: s => (!s.f.prologue && s.slot <= 2 ? 'clinic' : null),
    doing: s => T('Dr. Irene is writing notes standing up.', 'الدكتورة إيرين تكتب ملاحظات وهي واقفة.'),
    greet: s => ({ e: 'neutral', t: T('Make it quick, I have a waiting room.', 'بسرعة لو {سمحت|سمحتي}، عندي ناس ينتظرون.') })
  };
  /* things to talk about (Chapter 1, Elias) */
  GAME.TOPICS.irene = [
    { id: 'self', once: true, label: T('Ask how she is', '{تسألها|تسألينها} عن حالها'), run: [
      { c: 'irene', e: 'neutral', t: T('How I am? Fourteen-hour days. Only doctor between here and the city. I eat standing up. Next question.', 'حالي؟ أربعطعش ساعة باليوم. الطبيبة الوحيدة بين هنا والمدينة. آكل وأنا واقفة. السؤال الجاي.') },
      { c: 'irene', e: 'sad', t: T('...Nobody asks that. Thank you.', '...محد يسأل هالسؤال. شكراً.') }] },
    { id: 'elias', once: true, label: T('Ask about Elias', '{تسألها|تسألينها} عن إلياس'), if: s => s.f.metElias, run: s => s.f.ambulance || s.f.knowsIllness ? [
      { c: 'irene', e: 'sad', t: T('His kidneys are failing. Dialysis would give him years. He\'s refused it twice.', 'كلاه تفشل. الغسيل يعطيه سنين. ورفضه مرتين.') },
      { c: 'irene', e: 'neutral', t: T('I can treat a body. I can\'t give a man a reason. That part\'s not medicine.', 'أقدر أعالج جسم. ما أقدر أعطي رجل سبب. هذا الجزء مو طب.') },
      st => { st.f.knowsIllness = true; return null; }] : [
      { c: 'irene', e: 'neutral', t: T('I can\'t talk about my patients. ...But if you live with him, make sure he eats. And watch his breathing.', 'ما أقدر أتكلم عن مرضاي. ...بس إذا {ساكن|ساكنة} معه، {تأكد|تأكدي} إنه ياكل. {وانتبه|وانتبهي} لتنفسه.') }] }
  ];
  /* things to talk about (Margaret's chapter) */
  GAME.TOPICS.irene.push(
    { id: 'gpills', label: T('Show her the gold "G" pills', '{توريها|تورينها} حبوب «G» الذهبية'), if: s => has('pillsM') && !s.f.pillsIrene, cls: 'main', run: s => { s.f.pillsIrene = true; if (!(s.done || {}).margaret) quest('q_m_pills', 'active'); return [
      { c: 'irene', e: 'angry', t: T('Where did you get these? No, don\'t tell me. Margaret Hart. I prescribed her something gentle and she barely touches it.', 'من وين {جبتها|جبتيها}؟ لا، {لا تقول|لا تقولين}. مارغريت هارت. وصفت لها شي خفيف وبالكاد تلمسه.') },
      { c: 'irene', e: 'angry', t: T('This isn\'t from any pharmacy. A strong sedative, cut with something that causes vivid dreams. Hallucinations, in some people. Grief plus this is a very bad night waiting to happen.', 'هذي مو من أي صيدلية. منوّم قوي، مخلوط بشي يسبب أحلام واضحة. وهلوسة، عند بعض الناس. حزن مع هذا يعني ليلة سيئة مرة تنتظر.') },
      { c: 'irene', e: 'sad', t: T('Get her to stop. Gently. And if you find out who\'s selling them, I want a name.', '{خلها|خليها} توقف. بلطف. ولو {عرفت|عرفتي} مين يبيعها، أبي اسم.') }]; } }
  );
  { const { fear } = GAME.H.evelyn;
    /* things to talk about (Evelyn's chapter) */
    GAME.TOPICS.irene.push(
      { id: 'sleep307', once: true, label: T('Ask about waking at 3:07 every night', '{تسألها|تسألينها} عن الصحيان الساعة ٣:٠٧ كل ليلة'), if: s => s.host === 'evelyn' && (s.fear || 0) >= 3, run: s => { fear(s, -1); return [{ c: 'irene', e: 'neutral', t: T('Fear wakes you at the same time every night if you expect it to. The body is very obedient that way. Sleep somewhere with a light on. Talk to someone at 3:07 instead of lying there. And eat something before bed.', 'الخوف يصحّيك نفس الوقت كل ليلة إذا {كنت متوقعه|كنتي متوقعته}. الجسم مطيع بهالشكل. {نام|نامي} في مكان فيه ضو. {وكلّم|وكلّمي} أحد الساعة ٣:٠٧ بدال ما {تتمدد|تتمددين}. {وكل|وكلي} شي قبل النوم.') }, { c: 'irene', e: 'sad', t: T('The lighthouse? Ah. Arthur Wren was my patient. He never slept. I never found out why.', 'المنارة؟ آه. آرثر رن كان مريضي. عمره ما نام. وما عرفت ليش أبداً.') }]; } }
    );
  }
  /* things to talk about (Victor's chapter) */
  GAME.TOPICS.irene.push(
    { id: 'gpack', label: T('Give her the "G" parcel', '{تعطيها|تعطينها} طرد «G»'), if: s => has('gpack'), cls: 'main', run: s => { take('gpack'); s.f.vPackDone = 'irene'; s.f.vPills = true; return [{ c: 'irene', e: 'angry', t: T('A whole box. I\'ll keep this somewhere very safe. When someone finally asks, I\'ll have the label, the pills and the lab report. Thank you.', 'علبة كاملة. بحطها في مكان آمن مرة. ولما أحد أخيراً يسأل، بيكون عندي الملصق، والحبوب، وتقرير المختبر. شكراً.') }]; } }
  );
  /* how Dr. Irene looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.irene = { sex: 'f', skin: '#f2c6a3', hair: '#9a3a1c', eye: '#3c7a6a', brow: '#6e2e18', hairStyle: 'bun', glasses: true, age: 45, sw: 88, ww: 68, hw: 84, pose: ['hold', 'down'], item: 'clipboard', fit: { top: 'labcoat', c1: '#fbfbf9', c2: '#2fa898', bottom: 'pants', b: '#2fa898', steth: true } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.irene.height = 1.04;
})();

/* Irene's day: what Irene is doing in each place (shown by js/life.js) */
if (GAME.CHAR.irene) GAME.CHAR.irene.life = { clinic: 'doctor' };

/* small talk: what Irene says when you just chat (js/chatter.js picks one a day) */
if (GAME.CHAR.irene) GAME.CHAR.irene.chat = [
  { e: 'neutral', t: T("Make it quick, I have a waiting room. ...Actually, sit. The waiting room is Mrs Pike's cat.", "{خلّها|خليها} سريعة، عندي غرفة انتظار. ...لا، {اجلس|اجلسي}. غرفة الانتظار فيها قطوة مدام بايك بس.") },
  { if: s => s.host === 'elias', e: 'sad', t: T("How is he eating? Don't lie for him. He lies enough for himself.", "كيف أكله؟ {لا تكذب|لا تكذبين} عنه. هو يكذب عن نفسه كفاية.") },
  { if: s => s.host === 'leo', e: 'neutral', t: T("If the boy in the boathouse can't breathe again, you call me. Not the internet. Me.", "لو الولد اللي في بيت القوارب ضاق نفَسه مرة ثانية، {كلمني|كلميني} أنا. مو الإنترنت. أنا.") },
  { if: s => s.host === 'margaret', e: 'sad', t: T("Margaret Hart stopped coming to me two years ago. If she starts again, I'll know you did something.", "مارغريت هارت وقفت تجيني من سنتين. لو رجعت، بعرف إنك {سويت|سويتي} شي.") },
  { if: s => s.host === 'evelyn', e: 'smile', t: T("Tell Evelyn I still have her prescription. It says “sleep”. Underlined twice.", "{قل|قولي} لإيفلين إن وصفتها لسا عندي. مكتوب فيها «نوم». وتحتها خطين.") },
  { if: s => s.host === 'victor', e: 'angry', t: T("Your host's spa sends me patients. I send them home with water and a bill I never post.", "سبا مضيفك يرسل لي مرضى. وأرجعهم بيوتهم بماي وفاتورة عمري ما أرسلها.") },
  { e: 'neutral', t: T("I wanted to be a surgeon in a big city. Then I came here for one summer. That was nineteen summers ago.", "كنت أبي أصير جرّاحة في مدينة كبيرة. وبعدين جيت هنا صيف واحد. وهذا كان قبل تسعطعش صيف.") },
  { if: s => s.mood <= 3, e: 'sad', t: T("You look like you're carrying a piano. Sleep, eat, walk by the sea. Doctor's orders. They're free.", "شكلك {شايل|شايلة} بيانو. {نام، كل، وامش|نامي، كلي، وامشي} جنب البحر. أوامر الدكتورة. ومجانية.") },
  /* reacts to what happened (phase 2) */ { if: s => !!s.f.irLet, e: 'smile', t: T("Mrs Okafor says the new receptionist has a lovely voice. I didn't correct her. Thank you for those forty minutes.", "السيدة أوكافور تقول إن {موظف الاستقبال الجديد صوته|موظفة الاستقبال الجديدة صوتها} حلو. ما صححت لها. شكراً على الأربعين دقيقة.") },
  /* reacts to what happened (phase 2) */ { if: s => !!s.f.pillsDone, e: 'neutral', t: T("Margaret Hart takes my prescription now. I don't know what you said to her. Keep saying it.", "مارغريت هارت صارت تاخذ دواي. ما أدري وش {قلت|قلتي} لها. {كمّل|كمّلي} تقوله.") }
];

/* a quick check-up, once a day at the clinic: she looks at how you really are (food, sleep, washing) */
GAME.TOPICS.irene = GAME.TOPICS.irene || [];
GAME.TOPICS.irene.push({ id: 'checkup', label: T('Ask for a quick check-up', '{تطلب|تطلبين} منها كشف سريع'),
  if: s => s.loc === 'clinic' && !doneToday('checkup'),
  run: s => {
    onceToday('checkup');
    const nd = needs(), out = [{ n: T('She listens to your chest, looks in your eyes, and writes nothing down.', 'تسمع صدرك، وتطالع في عيونك، وما تكتب ولا شي.') }];
    const say = (e, en, ar) => out.push({ c: 'irene', e, t: T(en, ar) });
    if (nd.food < 35) say('angry', 'When did you last eat a real meal? Not coffee. A meal. Go to Sami, today.', 'متى آخر مرة {أكلت|أكلتي} وجبة صدق؟ مو قهوة. وجبة. {روح|روحي} لسامي، اليوم.');
    if (nd.energy < 35) say('sad', 'You\'re running on nothing. Sleep tonight. Not “later”. Tonight.', '{أنت شغّال|أنتِ شغّالة} على الفاضي. {نام|نامي} الليلة. مو «بعدين». الليلة.');
    if (nd.clean < 35) say('neutral', 'And a shower. Medically speaking. Also socially speaking.', '{وتروّش|وتروّشين}. من الناحية الطبية. ومن الناحية الاجتماعية بعد.');
    if (s.mood <= 3) say('sad', 'The heavy feeling has a name, and it isn\'t “lazy”. Come back and talk to me. I mean it.', 'الثقل اللي {تحسه|تحسينه} له اسم، ومو «كسل». {ارجع وكلمني|ارجعي وكلميني}. أقولها جد.');
    if (out.length === 1) say('smile', 'You\'re fine. Annoyingly fine. Go and be fine somewhere else, I have a waiting room.', '{أنت|أنتِ} بخير. بخير لدرجة مزعجة. {روح كن|روحي كوني} بخير في مكان ثاني، عندي غرفة انتظار.');
    out.push(st => { addMood(1); return null; });
    return out;
  } });
