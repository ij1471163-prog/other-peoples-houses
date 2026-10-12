/* =====================================================================
   Kai's story: "Ten minutes"  (docs/STORY.md §5)
   Kai is never sad for more than ten minutes because he never stops
   long enough to be. Every Sunday afternoon his mum calls, and he tells
   her about lectures he stopped going to a year ago. It mirrors your own
   phone, face down. Nothing here changes an ending.
     1. A Sunday afternoon on the beach: you overhear the call   (event)
     2. Ask him about it, a day later or more                    (topic)
     3. The next Sunday afternoon he tells her, with you there   (event)
   ===================================================================== */
'use strict';
(function () {
  const say = (e, en, ar) => ({ c: 'kai', e, t: T(en, ar) });
  const K = s => s.f.kaiArc || 0;
  const callTime = s => weekday(s.day) === 0 && s.slot === 2 && s.loc === 'beach' && GAME.CHAR.kai.where(s) === 'beach' && !RUN;

  GAME.QUESTS.q_kai = { title: T('Ten minutes', 'عشر دقايق'),
    hint: T('Kai lies to his mum every Sunday afternoon. He might stop, if someone sits with him on the beach.', 'كاي يكذب على أمه كل أحد العصر. يمكن يوقف، لو أحد جلس معه على الشاطئ.') };

  /* on Sunday afternoons Kai is on the phone, not on his board */
  const life = GAME.CHAR.kai.life, surf = life.beach;
  life.beach = s => (weekday(s.day) === 0 && s.slot === 2 && K(s) < 3 ? 'phone' : (typeof surf === 'function' ? surf(s) : surf));

  /* 1. you overhear him */
  GAME.EVENTS.push({ id: 'kaiCall', once: true, when: s => K(s) === 0 && s.day >= 3 && callTime(s),
    run: [{ show: [{ id: 'kai', e: 'sad' }] },
      N_('Kai is sitting on his board in the sand with his back to you, phone to his ear. His voice is one you haven\'t heard before: small and careful.',
        'كاي جالس على لوحه في الرمل وظهره لك، والجوال على إذنه. صوته غير عن كل مرة {سمعته|سمعتيه}: صغير وحذر.'),
      say('neutral', 'Yeah, Mum. Lectures are good. ...Marine biology, yeah. Fish and that. ...No, I\'m eating. Love you too.',
        'إيه يمه. المحاضرات زينة. ...أحياء بحرية، إيه. سمك وكذا. ...لا، آكل. وأنا بعد أحبك.'),
      N_('He hangs up and sits there, looking at the phone. Then he sees you, and the grin snaps back on like a light.',
        'يسكّر ويقعد يطالع الجوال. وبعدين يشوفك، والابتسامة ترجع فجأة مثل لمبة انولعت.'),
      say('smile', 'Legend! How long have you been there? Doesn\'t matter. Look at that wave. Terrible. Beautiful.',
        '{يا بطل|يا بطلة}! من متى {وأنت|وأنتِ} هنا؟ مو مهم. {شف|شوفي} هالموجة. فظيعة. حلوة.'),
      s => { s.f.kaiArc = 1; s.f.kaiDay = s.day; quest('q_kai', 'active'); return null; }] });

  /* 2. ask him */
  GAME.TOPICS.kai.push({ id: 'kaiTruth', once: true, label: T('Ask about the phone call', '{تسأله|تسألينه} عن المكالمة'),
    if: s => K(s) === 1 && s.day > (s.f.kaiDay || 0),
    run: [
      say('neutral', 'Ah. You heard that.', 'آه. {سمعت|سمعتي}.'),
      say('sad', 'I left uni a year ago. Didn\'t fail. I just... stopped going. One morning I got on a bus to the sea instead, and I never went back.',
        'تركت الجامعة من سنة. ما رسبت. بس... وقفت أروح. صباح من الصباحات ركبت باص للبحر بدالها، وما رجعت.'),
      say('sad', 'Every Sunday she asks about lectures and I describe a documentary I watched. I\'m very good at documentaries now.',
        'كل أحد تسألني عن المحاضرات، وأنا أوصف لها وثائقي شفته. صرت شاطر مرة بالوثائقيات.'),
      say('neutral', 'Ten minutes, remember? I never stay in the sad bit long enough to fix it. That\'s the trick. Turns out it\'s also the problem.',
        'عشر دقايق، {تذكر|تذكرين}؟ ما أقعد في الجزء الحزين وقت كافي عشان أصلحه. هذي الحيلة. وطلعت هي المشكلة بعد.'),
      { menu: [
        { t: T('"Just tell her."', '«بس قل لها.»'),
          then: [say('neutral', '"Just." You say it like it\'s a small word.', '«بس.» {تقولها|تقولينها} كأنها كلمة صغيرة.')] },
        { t: T('"My phone\'s been face down for weeks."', '«جوالي مقلوب على وجهه من أسابيع.»'), hide: s => !!s.f.calledMother,
          then: [N_('Kai looks at your pocket, then at you. For once, he doesn\'t make a joke.', 'كاي يطالع جيبك، وبعدين يطالعك. وهالمرة، ما يمزح.'),
            say('neutral', 'Huh. So we\'re the same kind of stupid.', 'هه. يعني إحنا نفس نوع الغباء.')] },
        { t: T('"I called my mum. It was awful. Then it wasn\'t."', '«اتصلت بأمي. كان شي فظيع. وبعدين ما صار فظيع.»'), hide: s => !s.f.calledMother,
          then: [say('shock', 'You did? ...Okay. Okay. That\'s annoying, because now I\'ve got no excuse.', '{سويتها|سويتيها}؟ ...طيب. طيب. هذا يقهر، لأن الحين ما عندي عذر.')] }
      ] },
      say('neutral', 'Next Sunday afternoon. If you\'re on the beach, I\'ll do it. If you\'re not, I\'ll describe a documentary.',
        'الأحد الجاي العصر. لو {كنت|كنتي} على الشاطئ، بسويها. ولو ما {كنت|كنتي}، بوصف لها وثائقي.'),
      s => { s.f.kaiArc = 2; s.f.kaiDay = s.day; return null; }] });

  /* 3. he tells her */
  GAME.EVENTS.push({ id: 'kaiTells', once: true, when: s => K(s) === 2 && s.day > (s.f.kaiDay || 0) && callTime(s),
    run: s => [{ show: [{ id: 'kai', e: 'neutral' }] },
      N_('Kai is waiting on his board, phone in both hands. He pats the sand next to him. You sit.',
        'كاي ينتظر على لوحه، والجوال في يدينه الثنتين. يطق الرمل اللي جنبه. {وتجلس|وتجلسين}.'),
      say('neutral', 'Mum? It\'s me. No, everything\'s fine. No, it isn\'t. I need to tell you something, and I need you not to talk for ten minutes.',
        'يمه؟ أنا. لا، كل شي تمام. لا، مو تمام. أبي أقولك شي، وأبيك ما تتكلمين عشر دقايق.'),
      N_('It takes longer than ten minutes. You watch the waves. Twice his voice goes, and he waits for it to come back.',
        'تاخذ أكثر من عشر دقايق. {تطالع|تطالعين} الموج. مرتين صوته يروح، وينتظره لين يرجع.'),
      N_('Then he laughs: a real one, wet and surprised.', 'وبعدين يضحك: ضحكة حقيقية، فيها دموع ومفاجأة.'),
      say('smile', 'She knew. Since New Year. The uni sent a letter. She was waiting for me to say it. She said she\'d rather have a son who surfs badly than one who lies well.',
        'كانت تدري. من رأس السنة. الجامعة أرسلت خطاب. وكانت تنتظرني أقولها. قالت تبي ولد يتزلج بشكل سيء، أحسن من ولد يكذب زين.'),
      s.f.calledMother
        ? say('smile', 'You already did yours, didn\'t you. Show-off.', '{أنت|أنتِ} {سويت|سويتي} حقك من قبل، صح؟ {شايف|شايفة} نفسك.')
        : say('neutral', 'Your phone\'s still face down, legend. Just saying. Ten minutes. I\'ll sit with you.', 'جوالك لسا مقلوب، {يا بطل|يا بطلة}. بس أقول. عشر دقايق. وأنا بجلس معك.'),
      st => { st.f.kaiArc = 3; addTrust('kai', 2); addMood(1); quest('q_kai', 'done'); return null; }] });

  /* a hint, before it starts */
  GAME.CHAR.kai.chat.push({ if: s => K(s) === 0, e: 'neutral', t: T('Sundays after lunch I\'m on the phone. Don\'t ask.', 'الأحد بعد الغدا أكون على الجوال. {لا تسأل|لا تسألين}.') });

  /* afterwards, he talks about it */
  GAME.CHAR.kai.chat.push({ if: s => K(s) === 3, e: 'smile',
    t: T('Mum sends me surf videos now. Of other people. "For ideas," she says. Brutal. I love her.', 'أمي صارت ترسل لي مقاطع تزلج. لناس ثانيين. تقول «عشان تاخذ أفكار». قاسية. أحبها.') });
})();
