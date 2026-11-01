/* =====================================================================
   Thomas, once, on the phone.
   The whole chapter is about Elias's son and he never says a word. Now,
   one morning while Elias is out on the boat, the landline rings and you
   answer it. The hospital still has Thomas down as next of kin; they rang
   him about the appointments. He asks for nothing, and asks you not to
   tell his father he called.
   Only once you know there is a son (the box of photos, the pencil
   marks, the letters, or you asked Elias about him), and never after you
   left Thomas a message behind Elias's back (that has its own call, in
   the last night). Its own flag (s.f.thCall); no trust, suspicion or
   ending changes.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const V = (en, ar) => ({ n: T('📞 ' + en, '📞 ' + ar) });   // his voice on the line
  const ch1 = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !s.f.prologue;
  const knows = s => !!(s.f.sawBox || s.f.knowsSon || s.f.tp_elias_thomas || (s.f.clue && s.f.clue.marks));
  const out = s => GAME.CHAR.elias && GAME.CHAR.elias.where && GAME.CHAR.elias.where(s) === 'harbor';

  GAME.EVENTS.push({ id: 'thCall', once: true,
    when: s => ch1(s) && !RUN && s.slot === 0 && s.day >= 2 && !s.f.fallDone && !s.f.sentSneak && knows(s) && out(s) && ['living', 'hall', 'kitchen'].includes(s.loc),
    run: s => { s.f.thCall = s.day; return [
      N1('The landline rings in the living room. Once. Twice. Elias is out on the boat. On the fifth ring, you pick it up.', 'الهاتف الأرضي يرن في الصالة. مرة. مرتين. إلياس طالع بالقارب. وفي الرنة الخامسة، {ترفعه|ترفعينه}.'),
      V('A man\'s voice, careful, like he\'s walking on ice: "Dad?"', 'صوت رجّال، حذر، كأنه يمشي على ثلج: «يبه؟»'),
      N1('"No. I\'m... staying with him. A lodger."', '«لا. أنا... {ساكن|ساكنة} عنده.»'),
      V('"A lodger." A long breath. "The hospital rang me. I\'m still down as his next of kin. They said he hasn\'t been to one appointment since March."', '«{ساكن|ساكنة} عنده.» نفس طويل. «المستشفى اتصل علي. لسا مكتوب إني أقرب أهله. قالوا ما راح ولا موعد من مارس.»'),
      { menu: [
        { t: T('"He isn\'t doing the treatment."', '«هو ما يتعالج.»'), then: [V('"No. He wouldn\'t. He\'d rather be right than alive. He always would." A pause. "Sorry. You don\'t need that."', '«لا. أكيد. يفضّل يكون على حق ولا يكون عايش. دايم كذا.» سكوت. «آسف. ما لك دخل في هذا.»')] },
        { t: T('"He\'s alright. He\'s out on the boat."', '«هو بخير. طالع بالقارب.»'), then: [V('"Of course he is." Something that is almost a laugh. "Sick as a dog, and still out on the boat."', '«أكيد طالع.» شي قريب من الضحكة. «تعبان على الآخر، ولسا طالع بالقارب.»')] }
      ] },
      V('"Does he... does he ever talk about me?"', '«هو... يجيب طاري؟»'),
      st => [{ menu: [
        st.f.clue && st.f.clue.marks
          ? { t: T('"There are pencil marks on the door frame. A line above eighteen, with no name."', '«فيه خطوط رصاص على إطار الباب. وخط فوق الثمنطعش، بدون اسم.»'), then: [V('Silence. Then: "He kept those?" His voice goes. "He painted that hall twice. He painted round them."', 'سكوت. وبعدين: «خلاها؟» صوته يتكسر. «صبغ الممر مرتين. وصبغ حولها.»')] }
          : { t: T('"Your room is just how you left it."', '«غرفتك مثل ما خليتها.»'), then: [V('Silence. Then: "The ship? The one I never finished?" His voice goes. "He was supposed to throw that out."', 'سكوت. وبعدين: «السفينة؟ اللي ما كملتها؟» صوته يتكسر. «كان المفروض يرميها.»')] },
        { t: T('"Not in words."', '«مو بالكلام.»'), then: [V('"No. That\'s him." A breath. "That\'s both of us."', '«لا. هذا هو.» نفس. «وهذا احنا الاثنين.»')] }
      ] }],
      V('"Don\'t tell him I rang. Please. If he wants me, he knows the number. He always knew the number."', '«{لا تقول|لا تقولين} له إني اتصلت. الله يخليك. إذا يبيني، يعرف الرقم. طول عمره يعرف الرقم.»'),
      N1('The line goes dead. You put the receiver down very gently, as if it could wake someone.', 'الخط ينقطع. {تحط|تحطين} السماعة بشويش، كأنها ممكن تصحّي أحد.')
    ]; } });
})();
