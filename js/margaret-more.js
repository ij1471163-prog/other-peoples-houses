/* =====================================================================
   More of Margaret's house. Three small things, each once:
     1. The playlist. Daniel made her one for her birthday and died
        before it (js/chars/margaret.js). It was never found. It is taped
        under his desk drawer. Give it to her at seven.
     2. Biscuit, after you have told her your real name: "He's not
        Daniel's." She has started to see you.
     3. The morning after, your phone on the breakfast tray, face up.
   Its own flags (s.f.mdCD, mdBis, mdTray); a little trust (as her other
   kind scenes do) and mood. No quest, ending or ending-condition changes.
   ===================================================================== */
'use strict';
(function () {
  if (!GAME.LOC.dan_room) return;
  const M = (e, en, ar) => ({ c: 'margaret', e, t: T(en, ar) });
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const inM = s => s.host === 'margaret' && !s.f.mFinaleDone;
  const home = s => inM(s) && houseOf(s.loc) === 'margaret';
  const kind = (s, k) => { if (!s.f['mdK_' + k]) { s.f['mdK_' + k] = true; addTrust('margaret', 1); } };

  GAME.ITEMS.mixcd = { name: T('A CD: "MUM 4 BDAY"', 'سي دي: «لماما بعيد ميلادها»'), desc: T('Marker on the disc: "MUM 4 BDAY. DON\'T LISTEN YET." A track list in tiny capitals.', 'مكتوب على السي دي بالقلم: «لماما بعيد ميلادها. لا تسمعينه الحين.» وقائمة أغاني بحروف صغيرة.') };

  /* ---------- 1. the playlist ---------- */
  GAME.LOC.dan_room.spots.push({ x: 27, y: 66, label: T('Under the desk drawer', 'تحت درج المكتب'),
    if: s => inM(s) && !!s.f.danLetter && !s.f.mdCD,
    run: s => { s.f.mdCD = 'found'; give('mixcd'); return [
      N1('When you close the drawer, something underneath it rattles. Taped to the bottom, where a mother would never look: a CD in a paper sleeve.', 'لما {تسكّر|تسكّرين} الدرج، شي تحته يخشخش. ملصوق تحت، في مكان ما تطالع فيه أم أبداً: سي دي في غلاف ورق.'),
      N1('"MUM 4 BDAY. DON\'T LISTEN YET." Twelve songs in tiny capitals. Number three just says: "YOUR ONE (you hum it when you cook)".', '«لماما بعيد ميلادها. لا تسمعينه الحين.» اثنعش أغنية بحروف صغيرة. ورقم ثلاثة مكتوب عليه بس: «حقتك (تدندنينها وأنتِ تطبخين)».')
    ]; } });
  GAME.TOPICS.margaret = GAME.TOPICS.margaret || [];
  GAME.TOPICS.margaret.push({ id: 'mdCD', once: true, cls: 'main', label: T('Give her the CD from under his desk', '{أعطها|أعطيها} السي دي اللي كان تحت مكتبه'),
    if: s => inM(s) && has('mixcd') && s.slot >= 3 && home(s),
    run: s => { take('mixcd'); s.f.mdCD = 'given'; return [{ show: [{ id: 'margaret', e: 'shock' }] },
      N1('She reads the sleeve without touching it. Then she takes it with both hands, the way you hold something that might still be warm.', 'تقرا الغلاف بدون ما تلمسه. وبعدين تاخذه بيدينها الثنتين، مثل ما تمسك شي يمكن لسا دافي.'),
      M('sad', 'I looked everywhere. I turned his room inside out the week after. I thought he hadn\'t finished it.', 'دورته في كل مكان. قلبت غرفته فوق تحت الأسبوع اللي بعده. حسبته ما خلّصه.'),
      N1('The old stereo in the sitting room takes it on the second try. A boy\'s voice, very close to the microphone: "Right. These are the best songs ever made, in order. No skipping. Happy birthday. Don\'t cry, it\'s embarrassing."', 'الستيريو القديم في الصالة ياخذه من ثاني محاولة. صوت ولد، قريب مرة من المايك: «طيب. هذي أحلى أغاني انسوت بالتاريخ، بالترتيب. ممنوع التقديم. كل عام وأنتِ بخير. لا تبكين، فشلة.»'),
      N1('Track three starts. You know it. It is the song from three in the morning, through the wall.', 'الأغنية الثالثة تبدأ. {تعرفها|تعرفينها}. هي نفس الأغنية اللي {تسمعها|تسمعينها} الساعة ثلاث الفجر من ورا الجدار.'),
      M('sad', 'He played it in the car all summer. I thought he just liked it. I hummed it to annoy him.', 'كان يشغلها في السيارة الصيف كله. حسبته بس يحبها. وكنت أدندنها عشان أنرفزه.'),
      M('smile', 'So that\'s what it was.', 'يعني هذا اللي كانت.'),
      N1('She doesn\'t cry. She sits on the arm of the sofa and listens to all twelve, no skipping, and when it ends she presses play again.', 'ما تبكي. تجلس على طرف الكنبة وتسمع الاثنعش كلها، بدون تقديم، ولما تخلص تضغط تشغيل مرة ثانية.'),
      st => { kind(st, 'cd'); addMood(1); return null; }
    ]; } });

  /* ---------- 2. Biscuit, after you have said your own name ---------- */
  GAME.EVENTS.push({ id: 'mdBis', once: true,
    when: s => inM(s) && !RUN && (s.f.mCorrected || 0) >= 1 && !!s.f.bisSeen && s.slot >= 3 && s.loc === 'marg_garden',
    run: s => [{ show: [{ id: 'margaret', e: 'neutral' }] },
      N1('Margaret is in the sunroom in the dark, by the cage, watching Biscuit stuff his cheeks.', 'مارغريت في الغرفة الزجاجية بالظلام، جنب القفص، تطالع بسكوت يعبّي خدوده.'),
      M('neutral', 'He\'s not Daniel\'s, you know. Daniel\'s was gentle. This one bit me the first day. Drew blood. I liked him for it.', 'تدري إنه مو حق دانيال. حق دانيال كان هادي. هذا عضني أول يوم. طلّع دم. وعجبني عشانها.'),
      M('neutral', 'I think I needed something in this house that wasn\'t pretending.', 'أحس كنت محتاجة شي في هالبيت ما يمثّل.'),
      N1('She looks up at you. Not at your hair, not at your shoulders. At you.', 'ترفع عيونها لك. مو لشعرك، ولا لأكتافك. لك {أنت|أنتِ}.'),
      M('smile', 'You don\'t take sugar. Daniel took three. I should have noticed that the first morning.', 'ما {تشرب|تشربين} سكر. دانيال كان ياخذ ثلاث. كان لازم أنتبه من أول صبح.'),
      st => { st.f.mdBis = true; kind(st, 'bis'); return null; }]
  });

  /* ---------- 3. the tray ---------- */
  GAME.EVENTS.push({ id: 'mdTray', once: true,
    when: s => inM(s) && !RUN && (s.f.mCorrected || 0) >= 1 && s.slot === 0 && home(s) && !s.f.calledMother && (s.f.jm || 0) < 4,
    run: s => [
      N1('Breakfast is on a tray outside your door. Toast, no sugar in the tea. And your phone, charged, face up.', 'الفطور على صينية قدام بابك. توست، وشاي بدون سكر. وجوالك، مشحون، ووجهه لفوق.'),
      N1('Under it, on the back of an envelope, in her careful hand: "Somebody\'s mother is waiting too. M."', 'وتحته، على ظهر ظرف، بخطها المرتب: «فيه أم ثانية تنتظر بعد. م.»'),
      st => { st.f.mdTray = st.day; addMood(1); return null; }]
  });

  /* ---------- 4. your mother rings (after the tray) ---------- */
  const V = (en, ar) => ({ n: T('📞 ' + en, '📞 ' + ar) });   /* her voice on the line */
  GAME.EVENTS.push({ id: 'mdMum', once: true,
    when: s => inM(s) && !RUN && s.f.mdTray != null && s.slot >= 1 && s.slot < NIGHT && home(s) && !s.f.calledMother,
    run: s => [{ show: [] },
      N1('Your phone buzzes on the bed. MOM. The thirteenth call. This time, before you can think about it, your thumb answers.', 'جوالك يهتز على السرير. «أمي». الاتصال الثالث عشر. وهالمرة، قبل لا {تفكر|تفكرين}، إبهامك يرد.'),
      V('A breath, as if she has been holding one for weeks. "...{name}?"', 'نفس، كأنها حابسته من أسابيع. «...{name}؟»'),
      V('"Are you alright? Are you eating? Where are you sleeping? Who are you with?"', '«{أنت بخير|أنتِ بخير}؟ {تاكل|تاكلين}؟ وين {تنام|تنامين}؟ عند مين؟»'),
      { menu: [
        { t: T('Tell her the truth: Margaret, and Danny', '{قل|قولي} لها الصدق: مارغريت، وداني'), then: [
          N1('You tell her. A woman on Cliff Road whose son died two years ago. The room, the posters, the breakfast. That for a while she called you Danny, and you let her.', '{تقول|تقولين} لها. امرأة في شارع الجرف مات ولدها قبل سنتين. الغرفة، والبوسترات، والفطور. وإنها لفترة كانت تناديك داني، {وأنت خليتها|وأنتِ خليتيها}.'),
          N1('A long silence on the line. Then the sound you have been running from for weeks: your mother, crying, trying not to.', 'سكوت طويل على الخط. وبعدين الصوت اللي {هربت|هربتي} منه أسابيع: أمك تبكي، وتحاول ما تبكي.'),
          V('"A stranger makes you breakfast. And I have a phone that rings and rings."', '«وحدة غريبة تسوي لك فطور. وأنا عندي جوال يرن ويرن.»'),
          V('"I\'m not angry. I am. I don\'t know what I am." A breath. "...Does she at least make you eat?"', '«مو زعلانة. لا، زعلانة. ما أدري وش أنا.» نفس. «...طيب، على الأقل تأكّلك؟»'),
          N1('"Every night at seven."', '«كل ليلة الساعة سبعة.»'),
          V('"Good." Very quietly. "Good."', '«زين.» بصوت واطي مرة. «زين.»'),
          { show: [{ id: 'margaret', e: 'sad' }] },
          N1('When you hang up, Margaret is in the doorway with a tea towel, not pretending she didn\'t hear.', 'لما {تسكّر|تسكّرين}، مارغريت واقفة عند الباب وفي يدها فوطة، وما تسوي نفسها ما سمعت.'),
          { c: 'margaret', e: 'sad', t: T('Was that your mother?', 'هذي أمك؟') },
          { c: 'margaret', e: 'neutral', t: T('Next time, tell her you\'re eating. Mothers need to be told that. Even when they know.', 'المرة الجاية {قل|قولي} لها إنك {تاكل|تاكلين}. الأمهات يحتاجون أحد يقول لهم كذا. حتى لو يدرون.') },
          st => { st.f.mdMum = 'truth'; addMood(1); return null; }] },
        { t: T('"With a friend. It\'s fine, Mum."', '«عند {صاحبي|صاحبتي}. كل شي تمام، يمه.»'), then: [
          V('Silence. Then: "You cough when you lie. You have done since you were four."', 'سكوت. وبعدين: «{أنت تكح|أنتِ تكحين} لما {تكذب|تكذبين}. من وعمرك أربع سنين.»'),
          V('"Fine. Fine. I\'ll stop ringing, then."', '«طيب. طيب. أجل بوقف أتصل.»'),
          N1('She hangs up first. A minute later, a text: "Fine." With a full stop. She never uses full stops.', 'هي اللي تسكّر أول. وبعد دقيقة، رسالة: «طيب.» وبعدها نقطة. وهي عمرها ما تحط نقطة.'),
          st => { st.f.mdMum = 'lie'; addMood(-1); return null; }] },
        { t: T('Say nothing', 'ما {تقول|تقولين} شي'), then: [
          N1('You can\'t. You sit on Daniel\'s bed with the phone against your ear and listen to her breathe, and she listens to you.', 'ما {تقدر|تقدرين}. {تجلس|تجلسين} على سرير دانيال والجوال على أذنك {وتسمعها|وتسمعينها} تتنفس، وهي تسمعك.'),
          V('"...I\'m here. When you want. I\'m here."', '«...أنا هنا. متى ما {بغيت|بغيتي}. أنا هنا.»'),
          N1('She hangs up so you don\'t have to.', 'هي اللي تسكّر عشان ما {تضطر|تضطرين} {أنت|أنتِ}.'),
          st => { st.f.mdMum = 'silent'; return null; }] }
      ] }]
  });

  /* ---------- 5. a parcel, a few days after you told her the truth ---------- */
  GAME.EVENTS.push({ id: 'mdParcel', once: true,
    when: s => inM(s) && !RUN && s.f.mdMum === 'truth' && s.day >= (s.f.mdTray || 0) + 2 && s.slot === 0 && home(s),
    run: s => [{ show: [{ id: 'margaret', e: 'neutral' }] },
      N1('A parcel on the doormat, addressed in your mother\'s handwriting, not to you. To "The lady at number 7, Cliff Road, Saltmere".', 'طرد على عتبة الباب، بخط أمك، بس مو لك. لـ«السيدة اللي في رقم ٧، شارع الجرف، سولتمير».'),
      N1('Margaret opens it at the kitchen table, slowly, keeping the paper. A jar of plum jam with a gingham lid, from the shelf in your mother\'s kitchen you could find in the dark. And a card.', 'مارغريت تفتحه على طاولة المطبخ، بشويش، وتحتفظ بالورق. مرطبان مربى خوخ بغطا مربعات، من الرف اللي في مطبخ أمك اللي {تقدر تلقاه|تقدرين تلقينه} بالظلام. وبطاقة.'),
      { mini: 'paper', kind: 'letter', body: T('Thank you for feeding my child.\n— {name}\'s mum', 'شكراً إنك أكّلتي {ولدي|بنتي}.\n— أم {name}') },
      { c: 'margaret', e: 'sad', t: T('Plum. Daniel hated plum.', 'خوخ. دانيال كان يكره الخوخ.') },
      N1('She reads the card again. Then she puts it in the pocket of her cardigan, not on the fridge, not in a drawer: in her pocket, where it goes everywhere with her.', 'تقرا البطاقة مرة ثانية. وبعدين تحطها في جيب الكارديغان حقها، مو على الثلاجة، ولا في درج: في جيبها، وين ما تروح تروح معها.'),
      { c: 'margaret', e: 'smile', t: T('I\'ll write back. Is that strange? I\'d like to write back.', 'بكتب لها. غريب؟ ودي أكتب لها.') },
      st => { st.f.mdParcel = true; addMood(1); return null; }]
  });
})();
