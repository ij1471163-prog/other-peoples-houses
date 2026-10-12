/* =====================================================================
   Irene's story: "Sitting down"  (docs/STORY.md §5)
   "Fourteen-hour days. I eat standing up." The only doctor between here
   and the city has not had an afternoon off in years. One afternoon you
   find her asleep at her desk. Later, she takes Sunday afternoons off,
   and you find her on a bench at the harbor, sitting down, eating.
     1. An afternoon at the clinic: asleep at her desk     (event)
     2. Ask when she last had a day off, a day later       (topic)
     3. A later Sunday afternoon, at the harbor            (event)
   Her clinic hours are unchanged except those Sunday afternoons.
   ===================================================================== */
'use strict';
(function () {
  const say = (e, en, ar) => ({ c: 'irene', e, t: T(en, ar) });
  const A = s => s.f.irArc || 0;
  const offNow = s => A(s) >= 2 && s.day > (s.f.irDay || 0) && weekday(s.day) === 0 && s.slot === 2;

  GAME.QUESTS.q_irene = { title: T('Doctor\'s orders', 'أوامر الطبيبة'),
    hint: T('Irene promised to take Sunday afternoons off. See if she keeps it.', 'إيرين وعدت تاخذ العصر يوم الأحد إجازة. {شف|شوفي} إذا بتوفي.') };

  /* on her afternoon off she sits on the harbor bench instead of the clinic */
  { const w = GAME.CHAR.irene.where; GAME.CHAR.irene.where = s => (offNow(s) && !s.f.prologue ? 'harbor' : w(s)); }
  if (GAME.CHAR.irene.life) GAME.CHAR.irene.life.harbor = 'eat';

  /* 1. asleep at the desk */
  GAME.EVENTS.push({ id: 'ireneAsleep', once: true,
    when: s => A(s) === 0 && s.day >= 4 && s.slot === 2 && s.loc === 'clinic' && GAME.CHAR.irene.where(s) === 'clinic' && !RUN,
    run: [{ show: [{ id: 'irene', e: 'sad' }] },
      N_('The waiting room is empty. Dr. Irene is asleep at her desk, upright, pen still in her hand, as if she might sign something in her sleep.',
        'غرفة الانتظار فاضية. الدكتورة إيرين نايمة على مكتبها، قاعدة، والقلم لسا في يدها، كأنها بتوقّع شي وهي نايمة.'),
      N_('The phone on the desk starts to ring.', 'التلفون اللي على المكتب يبدأ يرن.'),
      { menu: [
        { t: T('Answer it quietly', '{ترد|تردين} بهدوء'), cls: 'main', fx: s => { s.f.irLet = true; addTrust('irene', 1); },
          then: [N_('"Clinic. She\'s with someone. Can I take a message?" Mrs Okafor\'s knee. Tomorrow is fine. You write it on her notepad and leave it by her hand.',
            '«العيادة. هي مع أحد. تبين تتركين رسالة؟» ركبة السيدة أوكافور. بكرة يمشي. {تكتبها|تكتبينها} في دفترها {وتحطها|وتحطينها} جنب يدها.'),
            N_('She sleeps for forty minutes. When she wakes, she reads the note twice, and doesn\'t say anything. She doesn\'t have to.',
              'تنام أربعين دقيقة. ولما تصحى، تقرا الورقة مرتين، وما تقول شي. وما تحتاج تقول.')] },
        { t: T('Wake her', '{تصحّيها|تصحّينها}'),
          then: [say('shock', 'I wasn\'t asleep. I was resting my eyes on my notes. It\'s a medical technique.', 'ما كنت نايمة. كنت أريّح عيوني على ملاحظاتي. هذي طريقة طبية.'),
            say('neutral', '...Thank you. Hello? Clinic.', '...شكراً. ألو؟ العيادة.')] }
      ] },
      s => { s.f.irArc = 1; s.f.irDay = s.day; return null; }] });

  /* 2. the day off */
  GAME.TOPICS.irene.push({ id: 'irRest', once: true, label: T('Ask when she last had a day off', '{تسألها|تسألينها} متى آخر مرة أخذت إجازة'),
    if: s => A(s) === 1 && s.day > (s.f.irDay || 0),
    run: [
      say('neutral', 'A day off? I\'m the only doctor between here and the city. If I take a day off, somebody\'s grandmother waits.', 'إجازة؟ أنا الطبيبة الوحيدة بين هنا والمدينة. لو أخذت يوم، جدة أحد بتنتظر.'),
      { menu: [
        { t: T('"An afternoon, then. One a week. Put a sign up."', '«طيب عصرية. وحدة بالأسبوع. حطي لوحة.»'),
          then: [say('neutral', 'And when someone falls off a roof on a Sunday?', 'ولو أحد طاح من سطح يوم الأحد؟'),
            say('neutral', '...They\'ll ring my mobile. They always do anyway.', '...بيتصلون على جوالي. هم دايم يتصلون على كل حال.')] },
        { hide: s => !s.f.tp_irene_sleep307, t: T('"You told me to eat before bed. Do you?"', '«قلتي لي آكل قبل النوم. وأنتِ تاكلين؟»'),
          then: [say('shock', 'That\'s a dirty trick, using a doctor\'s advice on a doctor.', 'هذي حركة وصخة، {تستخدم|تستخدمين} نصيحة الطبيبة على الطبيبة.')] }
      ] },
      say('neutral', 'Fine. Sunday afternoons. If anyone dies, I\'m blaming you.', 'خلاص. العصر يوم الأحد. ولو أحد مات، بلومك {أنت|أنتِ}.'),
      s => { s.f.irArc = 2; s.f.irDay = s.day; quest('q_irene', 'active'); return null; }] });

  /* 3. sitting down */
  GAME.EVENTS.push({ id: 'ireneOff', once: true,
    when: s => A(s) === 2 && offNow(s) && s.loc === 'harbor' && !RUN,
    run: [{ show: [{ id: 'irene', e: 'smile' }] },
      N_('Dr. Irene is on a bench at the harbor, sitting down, eating a sandwich and looking at nothing in particular. You have never seen her sit.',
        'الدكتورة إيرين على كرسي في الميناء، جالسة، تاكل سندويشة وتطالع ولا شي بالتحديد. عمرك ما {شفتها|شفتيها} جالسة.'),
      say('smile', 'Doctor\'s orders. Mine. Turns out I\'m very bossy.', 'أوامر الطبيبة. أوامري أنا. طلعت متسلطة مرة.'),
      N_('She tears the sandwich in two and holds out half, without asking.', 'تقسم السندويشة نصين وتمد لك النص، بدون ما تسأل.'),
      say('neutral', 'Someone did that for you once, I heard. On a bench. Small town.', 'سمعت إن أحد سوّاها معك مرة. على كرسي. بلدة صغيرة.'),
      s => { s.f.irArc = 3; needs().food = clamp(needs().food + 20, 0, 100); addTrust('irene', 1); addMood(1); quest('q_irene', 'done'); return null; }] });

  GAME.CHAR.irene.chat = GAME.CHAR.irene.chat || [];
  GAME.CHAR.irene.chat.push({ if: s => A(s) === 3, e: 'smile',
    t: T('I sat down for lunch yesterday. Nobody died. One man did ring to ask if I was dead. I said not yet.', 'أمس جلست وأنا أتغدى. وما أحد مات. واحد بس اتصل يسأل إذا أنا ميتة. قلت له مو للحين.') });
})();
