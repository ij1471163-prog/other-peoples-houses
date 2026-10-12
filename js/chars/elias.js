/* =====================================================================
   Elias — The old fisherman who took you in
   Everything that is Elias's own: profile, where Elias is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (elias.js).
   ===================================================================== */
'use strict';
(function () {
  /* who Elias is and Elias's daily routine (Chapter 1, Elias) */
  GAME.CHAR.elias = {
    name: T('Elias', 'إلياس'), role: T('The old fisherman who took you in', 'الصياد العجوز اللي آواك'), host: true, art: true,
    where: s => {
      if (!s.f.metElias || s.f.ended || s.f.prologue) return null;
      if (s.f.restDay === s.day) return 'living';
      const sunday = s.day % 7 === 0;
      return [sunday ? 'living' : 'harbor', s.day % 2 ? 'bath' : 'kitchen', 'shed', sunday ? 'living' : 'cafe', 'living'][s.slot];
    },
    doing: s => {
      const w = GAME.CHAR.elias.where(s);
      if (s.f.restDay === s.day) return T('Elias is resting in his armchair, grey and quiet.', 'إلياس مرتاح على كرسيه، رمادي الوجه وساكت.');
      return ({ harbor: T('Elias is untangling a line on the Ada.', 'إلياس يفك خيط صيد على القارب «آدا».'), kitchen: T('Elias is frying fish and burning the toast.', 'إلياس يقلي سمك ويحرق التوست.'), shed: T('Elias is mending nets, lips moving as he counts knots.', 'إلياس يصلّح الشباك، ويعد العقد بشفايفه.'), cafe: T('Elias is bent over the chessboard.', 'إلياس منحني على لوحة الشطرنج.'), living: s.slot === NIGHT ? T('Elias is dozing in his armchair, radio on.', 'إلياس غافي على كرسيه، والراديو شغال.') : T('It\'s his day off the boat. Elias is reading yesterday\'s paper.', 'اليوم إجازة من القارب. إلياس يقرا جريدة أمس.') })[w] || null;
    },
    greet: s => {
      if (s.day >= 2 && s.day - (s.f.lastShower ?? -1) >= 2 && onceToday('eliasSmell')) return { e: 'neutral', t: T('There\'s hot water in this house, {lad|lass}. Use it. Not for me. For you.', 'فيه ماي حار بهالبيت يا {ولدي|بنتي}. استخدمه. مو عشاني. عشانك.') };
      if ((s.susp.elias || 0) >= 1 && (s.trust.elias || 0) < 5) return { e: 'angry', t: T('Hm.', 'همم.') };
      if ((s.trust.elias || 0) >= 5) return { e: 'smile', t: T('There {he is|she is}.', 'هذا {أنت|أنتِ}.') };
      if (s.slot === NIGHT) return { e: 'sad', t: T('Late, {lad|lass}.', 'تأخر الوقت يا {ولدي|بنتي}.') };
      return { e: 'neutral', t: T('Mm.', 'ممم.') };
    }
  };
  /* things to talk about (Chapter 1, Elias) */
  GAME.TOPICS.elias = [
    { id: 'boat', once: true, label: T('Ask about his boat', 'تسأله عن قاربه'), run: s => { addTrust('elias', 1); return [
      E('smile', 'Ada. After my wife. She hated boats. Got seasick in the bath.', 'آدا. على اسم زوجتي. كانت تكره القوارب. يجيها دوار حتى في البانيو.'),
      E('sad', 'Ten years she\'s gone. I repaint the name every spring. The rest of the boat can fall apart, it\'s fine.', 'عشر سنين من راحت. أصبغ الاسم كل ربيع. والباقي من القارب يتفكك عادي.')]; } },
    { id: 'town', once: true, label: T('Ask about the town', 'تسأله عن البلدة'), run: [
      E('neutral', 'Saltmere\'s fine. Small. Everyone knows your business, which is useful if you\'ve forgotten it.', 'سولتمير زينة. صغيرة. الكل يعرف وش عندك، وهذا مفيد إذا نسيت.'),
      E('angry', 'That Victor from number 3 wants our whole street for his hotel. Offered me money twice. I told him the house comes with me in it.', 'فيكتور ذاك اللي من رقم ٣ يبي شارعنا كله عشان فندقه. عرض علي فلوس مرتين. قلت له البيت يجي وأنا داخله.')] },
    { id: 'thomas', once: true, label: T('Ask about Thomas', 'تسأله عن توماس'), if: s => !s.f.knowsSonTalk, need: s => (s.trust.elias || 0) >= 3, why: T('He\'s not ready to talk about that. Spend more time with him.', 'مو جاهز يتكلم عن هذا. اقعد معه أكثر.'), run: s => { s.f.knowsSon = true; s.f.knowsSonTalk = true; quest('q_thomas', 'active'); addTrust('elias', 1); return [
      E('sad', 'He wanted to study the sea. Properly, in the city, at a university. I told him: you go, you don\'t come back.', 'كان يبي يدرس البحر. صح، في المدينة، في جامعة. قلت له: تروح، ما ترجع.'),
      E('neutral', 'He went. He studied. He didn\'t come back. Turns out I was right.', 'راح. ودرس. وما رجع. طلعت صادق، شف.'),
      E('sad', 'Eight years. He calls on my birthday. I don\'t pick up. Don\'t look at me like that.', 'ثمان سنين. يتصل يوم عيد ميلادي. وما أرد. لا تطالعني كذا.')]; } },
    { id: 'mother', once: true, label: T('Tell him about your mother', 'تكلّمه عن أمك'), need: s => (s.trust.elias || 0) >= 4 && s.mood >= 4, why: T('You can\'t find the words yet.', 'ما تلقى الكلام للحين.'), run: s => { s.f.motherTalk = true; addMood(1); return [
      N_('You tell him about the 47 messages. About the calls you don\'t answer. You didn\'t know you were going to.', 'تقول له عن الـ ٤٧ رسالة. وعن المكالمات اللي ما ترد عليها. ما كنت تدري إنك بتقول.'),
      E('sad', 'Call her. Don\'t do what I did.', 'اتصل فيها. لا تسوي مثلي.'),
      E('neutral', 'You think staying silent protects you. It just eats time you don\'t get back.', 'تحسب إن السكوت يحميك. هو بس ياكل وقت ما يرجع.')]; } },
    { id: 'sick', label: T('Ask if he\'s ill', 'تسأله إذا هو مريض'), if: s => (s.f.meds || s.f.noticed || s.f.forgot) && !s.f.knowsIllnessTalk, run: s => {
      if ((s.trust.elias || 0) >= 5 || s.f.knowsIllness) { s.f.knowsIllness = true; s.f.knowsIllnessTalk = true; quest('q_secret', 'done'); return [
        E('sad', 'Kidneys. The doctor wants me on a machine, three times a week, four hours each.', 'الكلى. الدكتورة تبيني على جهاز، ثلاث مرات بالأسبوع، أربع ساعات كل مرة.'),
        E('neutral', 'I said no. I\'ve had a good run. Ada\'s waiting. Don\'t make that face.', 'قلت لا. عشت زين. وآدا تنتظر. لا تسوي هالوجه.')]; }
      return [E('angry', 'Old. That\'s all I am. Don\'t fuss.', 'كبرت. هذا كل اللي فيني. لا تكبّرها.')]; } },
    { id: 'fish', label: T('Go out on the boat with him', 'تطلع معه بالقارب'), if: s => s.loc === 'harbor' && s.slot === 0 && !doneToday('fish'), cls: 'main', run: [{ jump: 'fishing' }] },
    { id: 'nets', label: T('Help mend the nets', 'تساعده بالشباك'), if: s => s.loc === 'shed' && !doneToday('nets'), cls: 'main', run: [{ jump: 'nets' }] },
    { id: 'cook', label: T('Help him cook', 'تساعده بالطبخ'), if: s => s.loc === 'kitchen' && !doneToday('cook'), cls: 'main', run: s => { onceToday('cook'); addMood(1); s.f.cooked = (s.f.cooked || 0) + 1; if (s.f.cooked <= 2) addTrust('elias', 1); s.f.pantry = (s.f.pantry || 0) + 1; return s.f.cooked === 1 ? [
      E('neutral', 'You can cook?', 'تعرف تطبخ؟'), N_('You can\'t. You chop onions badly while he fries the fish. He eats your burnt toast without comment, which is generous.', 'ما تعرف. تقطع البصل غلط وهو يقلي السمك. وياكل التوست المحروق حقك بدون تعليق، وهذا كرم منه.'),
      E('smile', 'Ada cooked. I burned things. Now I burn things alone. Today, we burned them together.', 'آدا كانت تطبخ. وأنا أحرق الأشياء. الحين أحرقها لحالي. واليوم، حرقناها مع بعض.')] : [pickOne([
      N_('He shows you how to clean a fish. You almost faint. He almost laughs.', 'يوريك كيف تنظف سمكة. تقريباً يغمى عليك. وهو تقريباً يضحك.'),
      N_('You make soup. It\'s mostly water. He calls it "honest soup" and has two bowls.', 'تسوون شوربة. أغلبها موية. يسميها «شوربة صادقة» وياكل صحنين.')])]; } },
    { id: 'chess', label: T('Play chess with him', 'تلعب معه شطرنج'), if: s => s.loc === 'cafe' && s.slot === 3 && !doneToday('chess'), cls: 'main', run: [{ jump: 'chess' }] },
    { id: 'sit', label: T('Sit with him a while', 'تجلس معه شوي'), if: s => s.loc === 'living' && s.slot === NIGHT && !doneToday('sit'), run: s => { onceToday('sit'); addMood(1); s.f.sits = (s.f.sits || 0) + 1; if (s.f.sits <= 2) addTrust('elias', 1); return [pickOne([
      N_('The radio plays something old. He hums along with the wrong words. You don\'t correct him.', 'الراديو يشغل شي قديم. يدندن معه بكلمات غلط. وأنت ما تصححه.'),
      N_('Neither of you says anything for an hour. It\'s the most comfortable hour you\'ve had in months.', 'ولا واحد فيكم يقول شي لمدة ساعة. أريح ساعة مرت عليك من شهور.'),
      E('smile', 'You know what Ada used to say? "The trick is to be bored together." I never understood it till now.', 'تدري وش كانت تقول آدا؟ «السر إنكم تطفشون مع بعض.» ما فهمتها لين الحين.')])]; } },
    { id: 'bread', label: T('Give him the bread', 'تعطيه الخبز'), if: s => has('bread'), run: s => { take('bread'); quest('q_bread', 'done'); s.f.breadGiven = (s.f.breadGiven || 0) + 1; if (s.f.breadGiven <= 2) addTrust('elias', 1); return [E('smile', 'Bread. Huh. You noticed.', 'خبز. همم. انتبهت.'), N_('He doesn\'t say thank you. He makes you a sandwich instead, which is the same thing.', 'ما يقول شكراً. يسوي لك سندويشة بدالها، وهي نفس الشي.')]; } },
    { id: 'beans', once: true, label: T('Give him the good coffee', 'تعطيه القهوة الفاخرة'), if: s => has('beans'), run: s => { take('beans'); addTrust('elias', 1); addMood(1); return [E('smile', 'Real coffee. I haven\'t had real coffee since... well.', 'قهوة صدق. ما شربت قهوة صدق من... يعني.'), E('sad', 'Ada bought this kind. Every Saturday.', 'آدا كانت تشتري هالنوع. كل سبت.')]; } }
  ];
  /* cooking with Elias also feeds you (daily needs) */
  { const ck = GAME.TOPICS.elias.find(t => t.id === 'cook'); if (ck) { const f = ck.run; ck.run = s => { feed(40); return f(s); }; } }
  /* how Elias looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.elias = { sex: 'm', skin: '#dba27c', hair: '#ece9e3', eye: '#4f7fa8', brow: '#e2ddd4', hairStyle: 'beanie', beard: 'full', age: 72, sw: 100, ww: 86, hw: 84, pose: ['down', 'pocket'], fit: { top: 'coat', c1: '#e9a92a', c2: '#e8dcc0', knit: true, bottom: 'pants', b: '#4a4e5a' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.elias.height = 0.97;
})();

/* Elias's day: what Elias is doing in each place (shown by js/life.js) */
if (GAME.CHAR.elias) GAME.CHAR.elias.life = { harbor: 'fish', bath: 'shower', kitchen: 'cook', shed: 'mend', cafe: 'chess', living: s => (s.slot === NIGHT && s.f.restDay !== s.day ? 'radio' : 'rest') };
