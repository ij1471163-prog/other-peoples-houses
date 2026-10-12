/* =====================================================================
   Evelyn — 38. Lives at the lighthouse. Names the gulls. Sleeps by day.
   Everything that is Evelyn's own: profile, where Evelyn is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (evelyn.js).
   ===================================================================== */
'use strict';
(function () {
  { const { byDay, inE } = GAME.H.evelyn;
    /* who Evelyn is and Evelyn's daily routine (Evelyn's chapter) */
    GAME.CHAR.evelyn = {
      name: T('Evelyn', 'إيفلين'), role: T('38. Lives at the lighthouse. Names the gulls. Sleeps by day.', '٣٨ سنة. ساكنة في المنارة. تسمّي النوارس. تنام بالنهار.'), host: true, art: true,
      where: s => {
        if (!inE(s)) return (['EVE_PEACE', 'EVE_STAY'].includes(s.done.evelyn) && s.slot === 0 && weekday(s.day) === 6) ? 'harbor' : null;
        if (!s.f.metEve) return null;
        if (s.f.eStormDay === s.day && s.slot >= 3) return 'lh_tower';
        return ['lh_kitchen', 'lh_room', s.day % 2 ? 'lh_bath' : 'lh_ext', 'lh_kitchen', 'lh_tower'][s.slot];
      },
      doing: s => {
        const w = GAME.CHAR.evelyn.where(s);
        if (w === 'harbor') return T('Evelyn is buying fish and arguing with a gull about it.', 'إيفلين تشتري سمك وتتجادل مع نورس بخصوصه.');
        return ({
          lh_kitchen: s.slot === 0 ? byDay(s, [T('Evelyn is eating cereal with a fork, "to make it last".', 'إيفلين تاكل كورن فليكس بالشوكة، «عشان يطوّل».'), T('Evelyn is having her "dinner": toast, at 8 a.m., with great ceremony.', 'إيفلين تتعشى: توست، الساعة ٨ الصبح، باحتفال كبير.')]) : byDay(s, [T('Evelyn is making soup. Something in it is purple. She seems pleased about this.', 'إيفلين تسوي شوربة. فيها شي بنفسجي. وشكلها مبسوطة بهذا.'), T('Evelyn is reading a cookbook upside down "for a new perspective".', 'إيفلين تقرا كتاب طبخ بالمقلوب «عشان منظور جديد».'), T('Evelyn is frying eggs and singing sea shanties at them.', 'إيفلين تقلي بيض وتغني لهم أغاني بحّارة.')]),
          lh_room: T('Evelyn\'s door is shut. A sign on it: "ASLEEP. UNLESS FIRE. EVEN THEN, KNOCK."', 'باب إيفلين مسكّر. عليه ورقة: «نايمة. إلا إذا فيه حريق. وحتى لو، اطرق.»'),
          lh_bath: T('Behind the bathroom door: a long bath, a radio playing the shipping forecast, and Evelyn reading it along like poetry.', 'ورا باب الحمام: حمام طويل، وراديو يذيع نشرة الطقس البحري، وإيفلين تقراها معه كأنها شعر.'),
          lh_ext: T('Evelyn is feeding the gulls and introducing them to you by name.', 'إيفلين تأكّل النوارس وتعرّفك عليهم بالاسم.'),
          lh_tower: T('Up in the lantern room, Evelyn is polishing glass that doesn\'t need it.', 'فوق في غرفة الفانوس، إيفلين تلمّع زجاج ما يحتاج.')
        })[w] || null;
      },
      greet: s => {
        if ((s.susp.evelyn || 0) >= 1 && (s.trust.evelyn || 0) < 5) return { e: 'angry', t: T('Did you touch my things? Gerald says you did. Gerald is a gull, but he\'s rarely wrong.', 'لمست أغراضي؟ جيرالد يقول إيه. جيرالد نورس، بس نادراً يغلط.') };
        if ((s.fear || 0) >= 6) return { e: 'sad', t: T('You look like I look. Did you hear it too, last night? Of course you did.', 'شكلك مثل شكلي. سمعته بعد أمس؟ أكيد سمعته.') };
        if ((s.trust.evelyn || 0) >= 6) return { e: 'smile', t: T('My assistant keeper! My second-in-command! My only crew!', 'مساعدي في الحراسة! نائبي! طاقمي الوحيد!') };
        return { e: 'smile', t: T('Ahoy. Mind the third stair, it bites.', 'أهلين. انتبه للدرجة الثالثة، تعض.') };
      }
    };
  }
  { const { E, fear, inE } = GAME.H.evelyn;
    /* things to talk about (Evelyn's chapter) */
    GAME.TOPICS.evelyn = [
      { id: 'lens', label: T('Help polish the lens', 'تساعدها تلمّع العدسة'), if: s => inE(s) && s.loc === 'lh_tower' && s.slot >= 3 && !doneToday('eLens') && !s.f.eStormNow, cls: 'main', run: [{ jump: 'eveLens' }] },
      { id: 'soup', label: T('Try her soup', 'تجرب شوربتها'), if: s => inE(s) && s.loc === 'lh_kitchen' && s.slot === 3 && !doneToday('eSoup'), cls: 'main', run: [{ jump: 'eveSoup' }] },
      { id: 'acc', label: T('Ask her to play the accordion', 'تطلب منها تعزف أكورديون'), if: s => inE(s) && s.slot === 0 && !doneToday('eAccP'), run: s => { onceToday('eAccP'); addMood(1); return [{ n: fresh('eAccL', [T('She plays a sea shanty with enormous passion and roughly a third of the right notes. You both sing the chorus, which is mostly shouting "HEAVE".', 'تعزف أغنية بحّارة بحماس ضخم وتقريباً ثلث النوتات صح. وتغنون الكورس مع بعض، وأغلبه صراخ «اسحب!».'), T('A waltz. She makes you dance it in the kitchen. You step on her foot six times. She says it\'s the best waltz this lighthouse has seen since 1971.', 'فالس. تخليك ترقصه في المطبخ. تدوس على رجلها ست مرات. وتقول إنه أحسن فالس شافته المنارة من ١٩٧١.'), T('Something slow and sad that her gran used to hum. Halfway through she stops and says "anyway", and plays something stupid to cover it.', 'شي بطيء وحزين كانت جدتها تدندنه. بالنص توقف وتقول «المهم»، وتعزف شي سخيف تغطي فيه.')]) }]; } },
      { id: 'night', once: true, label: T('Ask why she sleeps by day', 'تسألها ليش تنام بالنهار'), if: s => inE(s), run: [E('neutral', 'Because at night someone has to be awake. That\'s what Grandad said. The lamp doesn\'t need me. But somebody should be awake at 3:07. I don\'t know why. I just know.', 'لأن بالليل لازم أحد يكون صاحي. هذا اللي كان يقوله جدي. الفانوس ما يحتاجني. بس لازم أحد يكون صاحي الساعة ٣:٠٧. ما أدري ليش. بس أدري.')] },
      { id: 'laugh', once: true, label: T('Ask about the laughing', 'تسألها عن الضحك'), if: s => inE(s) && (s.f.eLaugh || 0) >= 1, need: s => (s.trust.evelyn || 0) >= 3, why: T('She laughs it off and changes the subject to Kevin.', 'تضحك وتغير الموضوع لكيفن.'), run: s => { fear(s, -1); return [E('sad', 'Every night of my life. When I was little, Gran said it was the sea. When I was twelve, she said it was "family". She made me promise never to go up.', 'كل ليلة في حياتي. لما كنت صغيرة، جدتي قالت إنه البحر. ولما صار عمري اثنعش، قالت إنه «العيلة». وخلتني أوعدها ما أطلع أبداً.'), E('neutral', 'It never hurts anyone. It just... laughs. Do you know how lonely it is, to be the only person who hears something?', 'عمره ما أذى أحد. بس... يضحك. تدري كم هو شي وحيد، إنك الوحيد اللي يسمع شي؟')]; } },
      { id: 'tobias', once: true, label: T('Ask her about 1958', 'تسألها عن ١٩٥٨'), if: s => inE(s) && (s.f.eLog || s.f.eGrave), need: s => (s.trust.evelyn || 0) >= 4, why: T('If you ask now, she\'ll know you\'ve been reading things you shouldn\'t. Earn it first.', 'لو سألت الحين، بتعرف إنك تقرا أشياء مو المفروض. استاهلها أول.'), run: s => { s.f.eTobias = true; quest('q_e_1958', 'done'); addTrust('evelyn', 1); return [E('sad', 'Tobias. Grandad\'s little brother. Nine. He drowned in a storm in 1958. That\'s all anyone would ever tell me.', 'توبياس. أخو جدي الصغير. عمره تسع. غرق في عاصفة سنة ١٩٥٨. هذا كل اللي أحد رضى يقوله لي.'), E('sad', 'Grandad didn\'t sleep at night for fifty years. Gran said he was "keeping watch". I thought it was romantic. Now I think it was the loneliest thing I ever heard.', 'جدي ما نام بالليل خمسين سنة. جدتي قالت إنه «يحرس». حسبتها شي رومانسي. الحين أحس إنها أوحش شي سمعته بحياتي.')]; } },
      { id: 'marble', once: true, label: T('Show her the red marble', 'توريها البلية الحمرا'), if: s => inE(s) && has('marble'), run: s => { fear(s, 1); return [E('shock', 'Where... That\'s from the attic. That\'s from the trunk. Grandad kept a bag of these. Nobody\'s been up there since he died.', 'من وين... هذي من العلية. من الصندوق. جدي كان عنده كيس منها. ومحد طلع هناك من يوم مات.'), E('sad', 'Keep it. I don\'t want it. No. Give it back. No. Keep it.', 'خلها عندك. ما أبيها. لا. رجعها. لا. خلها عندك.')]; } }
    ];
  }
  /* how Evelyn looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.evelyn = { sex: 'f', skin: '#f4d2b8', hair: '#d0a258', eye: '#3a8a9a', brow: '#a8803a', hairStyle: 'braid', age: 38, sw: 90, ww: 72, hw: 84, pose: ['hip', 'down'], fit: { top: 'sweater', c1: '#2f4a72', knit: true, bottom: 'pants', b: '#5a4a3a', scarf: '#d2382e' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.evelyn.height = 1.04;
})();

/* Evelyn's day: what Evelyn is doing in each place (shown by js/life.js) */
if (GAME.CHAR.evelyn) GAME.CHAR.evelyn.life = { lh_kitchen: 'cook', lh_room: 'sleep', lh_bath: 'bath', lh_ext: 'gulls', lh_tower: 'watch', harbor: 'walk' };
