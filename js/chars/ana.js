/* =====================================================================
   Ana — Housekeeping at the Grand. Sends money home. Smiles at work because she has to.
   Everything that is Ana's own: profile, where Ana is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (victor.js).
   ===================================================================== */
'use strict';
(function () {
  { const { inV } = GAME.H.victor;
    /* who Ana is and Ana's daily routine (Victor's chapter) */
    GAME.CHAR.ana = {
      name: T('Ana', 'آنا'), role: T('Housekeeping at the Grand. Sends money home. Smiles at work because she has to.', 'تنظيف الغرف في الغراند. ترسل فلوس لأهلها. تبتسم في الشغل لأنها مجبورة.'), art: true,
      where: s => (inV(s) && s.slot < NIGHT ? (s.slot === 1 ? 'hotel_suite' : 'hotel_staff') : null),
      doing: s => (s.slot === 1 ? T('Ana is making your bed with hospital corners, very fast, apologising for being in your room.', 'آنا ترتب سريرك ترتيب مستشفى، بسرعة مرة، وتعتذر إنها في غرفتك.') : [T('Ana is folding towels into swans for guests who will unfold them in a second.', 'آنا تطوي المناشف على شكل بجع لضيوف بيفكونها بثانية.'), T('Ana is eating rice from a tub on her break, standing up, between the washing machines.', 'آنا تاكل رز من علبة في استراحتها، واقفة، بين الغسالات.'), T('Ana is on the phone in a language you don\'t know, laughing, then not.', 'آنا على الجوال بلغة ما تعرفها، تضحك، وبعدين لا.')][s.slot % 3]),
      greet: s => ({ e: (s.trust.ana || 0) >= 3 ? 'smile' : 'neutral', t: (s.trust.ana || 0) >= 3 ? T('Ah, my friend. You want towel swan? I make you one. Special.', 'آه يا صاحبي. تبي بجعة منشفة؟ أسوي لك وحدة. خاصة.') : T('Sorry, sorry. I finish quickly.', 'آسفة، آسفة. أخلّص بسرعة.') })
    };
  }
  { const { A } = GAME.H.victor;
    /* things to talk about (Victor's chapter) */
    GAME.TOPICS.ana = [
      { id: 'home', once: true, label: T('Ask about home', 'تسألها عن بلدها'), need: s => (s.trust.ana || 0) >= 2, why: T('She smiles and says she must finish. Help her a few times first.', 'تبتسم وتقول لازم تخلّص. ساعدها كم مرة أول.'), run: s => { quest('q_v_ana', 'active'); return [A('sad', 'Mr Victor keeps my passport. For safety, he says. I owe the agency four thousand dollars. I make forty a week after "room and food". You do the sum.', 'السيد فيكتور يحتفظ بجوازي. عشان الأمان، يقول. علي للوكالة أربعة آلاف دولار. وأطلع أربعين بالأسبوع بعد «السكن والأكل». احسبها أنت.'), A('sad', 'One hundred weeks. If nothing breaks. Something always breaks.', 'مية أسبوع. إذا ما انكسر شي. ودايم ينكسر شي.')]; } },
      { id: 'swan', label: T('Ask for a towel swan', 'تطلب بجعة منشفة'), if: s => (s.trust.ana || 0) >= 3 && !doneToday('swan'), run: s => { onceToday('swan'); addMood(1); return [{ c: 'ana', e: 'smile', t: fresh('swanL', [T('A swan. With a tiny hat. Because you are special guest.', 'بجعة. بطاقية صغيرة. لأنك ضيف خاص.'), T('Today: a swan is angry. See his eyebrows? Is Mr Victor swan.', 'اليوم: البجعة معصبة. تشوف حواجبه؟ هذي بجعة السيد فيكتور.'), T('Two swans, kissing. Bella says is unprofessional. Bella is jealous.', 'بجعتين، يتباوسون. بيلا تقول مو احترافي. بيلا غيرانة.')]) }]; } },
      { id: 'pp', label: T('Give Ana her passport', 'تعطي آنا جوازها'), if: s => has('passport') && !s.f.vFinaleDone, run: s => [A('shock', 'This is... how? No. If he knows it\'s gone, he will know it was me.', 'هذا... كيف؟ لا. لو عرف إنه راح، بيعرف إنها أنا.'), A('sad', 'Keep it for me. Until the right day. Then, the morning train.', 'خله عندك لي. لين اليوم المناسب. وبعدين، قطار الصبح.')] }
    ];
  }
  /* how Ana looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.ana = { sex: 'f', skin: '#c99068', hair: '#1e1614', eye: '#3a2618', brow: '#1e1614', hairStyle: 'bun', age: 31, sw: 88, ww: 70, hw: 84, pose: ['clasp', 'clasp'], fit: { top: 'dress', c1: '#34485e', apron: '#f6f4ee', collar: '#f6f4ee' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.ana.height = 0.87;
})();
