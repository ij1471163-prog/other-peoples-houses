/* =====================================================================
   Olivia — 26. Runs the "Save Fisher's Row" petition. Has a clipboard and isn't afraid to use it.
   Everything that is Olivia's own: profile, where Olivia is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (town.js).
   ===================================================================== */
'use strict';
(function () {
  { const { on } = GAME.H.town;
    /* who Olivia is and Olivia's daily routine (the town) */
    GAME.CHAR.olivia = { name: T('Olivia', 'أوليفيا'), role: T('26. Runs the "Save Fisher\'s Row" petition. Has a clipboard and isn\'t afraid to use it.', '٢٦ سنة. تدير عريضة «أنقذوا شارع الصيادين». عندها ورق مشبك وما تخاف تستخدمه.'), art: true,
      where: s => (!on(s) ? null : ['street', 'cafe', 'street', null, null][s.slot]),
      doing: s => (s.loc === 'cafe' ? T('Olivia is writing letters to the council with three different coloured pens.', 'أوليفيا تكتب خطابات للمجلس بثلاث أقلام ألوان مختلفة.') : T('Olivia is at a folding table with a petition and a sign: "FISHER\'S ROW IS NOT FOR SALE."', 'أوليفيا عند طاولة مطوية فيها عريضة ولوحة: «شارع الصيادين مو للبيع».')),
      greet: s => ({ e: 'smile', t: s.f.oliviaAlly ? T('Comrade! How many signatures today?', 'يا رفيق! كم توقيع اليوم؟') : T('Hi! Have you got one minute for your town? It\'s a quick minute. Mostly.', 'هلا! عندك دقيقة لبلدتك؟ دقيقة سريعة. غالباً.') }) };
  }
  { const { C } = GAME.H.town;
    /* things to talk about (the town) */
    GAME.TOPICS.olivia = [
      { id: 'petition', once: true, label: T('Ask about the petition', 'تسألها عن العريضة'), run: s => { s.met.olivia = true; quest('q_petition', 'active'); return [C('olivia', 'neutral', 'Victor wants to knock down Fisher\'s Row for a "spa village". Forty families. The council votes soon. If I can show them the whole town says no, they\'ll have to listen. Probably. Possibly.', 'فيكتور يبي يهد شارع الصيادين عشان «قرية سبا». أربعين عايلة. والمجلس بيصوّت قريب. لو أوريهم إن البلدة كلها تقول لا، بيضطرون يسمعون. غالباً. يمكن.'), C('olivia', 'smile', 'Get me five more names from people who matter round here and I\'ll love you forever. Professionally.', 'جيب لي خمس أسماء من ناس لهم وزن هنا وبحبك للأبد. بشكل مهني.')]; } },
      { id: 'evidence', label: T('Tell her what you\'ve found on Victor', 'تقول لها وش لقيت عن فيكتور'), if: s => s.host === 'victor' && GAME.VIC && GAME.VIC.evidence(s) >= 1, run: s => { s.met.olivia = true; s.f.oliviaAlly = true; const n = GAME.VIC.evidence(s); return [C('olivia', n >= 3 ? 'shock' : 'neutral', n >= 3 ? 'That\'s enough. That\'s more than enough. When you\'re ready, I\'ll fill the ballroom. The whole town. All you have to do is stand up.' : 'It\'s a start. One thread. A judge needs a rope. Find me more: papers, people who\'ll speak, anything.', n >= 3 ? 'هذا يكفي. هذا أكثر من كفاية. لما تكون جاهز، بعبّي القاعة. البلدة كلها. كل اللي عليك إنك تقوم.' : 'هذي بداية. خيط واحد. والقاضي يحتاج حبل. جيب لي أكثر: أوراق، ناس بيتكلمون، أي شي.'), N_('Proof so far: ' + n + ' / 3', 'الأدلة للحين: ' + n + ' / ٣')]; } }
    ];
  }
  /* things to talk about (Victor's chapter) */
  GAME.TOPICS.olivia.push(
    { id: 'photos', label: T('Take photos of the petition signers (for Victor)', 'تصوّر الموقّعين على العريضة (لفيكتور)'), if: s => s.f.vPhotoTask && !s.f.vPhotoDone, run: s => [N_('Olivia is talking to Martha. Nobody is looking at you.', 'أوليفيا تكلم مارثا. محد يطالعك.'), { menu: [
        { t: T('Take clear photos', 'تصوّر صور واضحة'), cls: 'risk', then: [st => { st.f.vPhotoDone = 'real'; return null; }, N_('Click. Sami, signing with his tongue out. Click. Martha. Click. Stella from the florist. You feel like you\'re photographing them through a gun sight.', 'كليك. سامي، يوقّع ولسانه طالع. كليك. مارثا. كليك. ستيلا بياعة الورد. وتحس إنك تصوّرهم من منظار سلاح.')] },
        { t: T('Take blurry photos on purpose', 'تصوّر صور مغبشة بقصد'), then: [st => { st.f.vPhotoDone = 'blur'; return null; }, N_('You shake the phone a little each time. Ghosts at a table. Olivia sees you and waves. You wave back and feel terrible anyway.', 'تهز الجوال شوي كل مرة. أشباح عند طاولة. أوليفيا تشوفك وتأشر لك. وتأشر لها وتحس بشعور سيء على كل حال.')] },
        { t: T('Tell Olivia what Victor asked', 'تقول لأوليفيا وش طلب فيكتور'), cls: 'main', then: [st => { st.f.vPhotoDone = 'blur'; st.f.oliviaAlly = true; addTrust('olivia', 2); return null; }, { c: 'olivia', e: 'angry', t: T('He wants a list? Fine. Take a photo of THIS.', 'يبي قائمة؟ طيب. صوّر هذا.') }, N_('She holds up the petition: three hundred and twelve names. "Tell him it\'s growing."', 'ترفع العريضة: ثلاث مية واثنعش اسم. «قل له إنها تكبر.»')] }
      ] }] }
  );
  /* how Olivia looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.olivia = { sex: 'f', skin: '#6a4430', hair: '#141014', eye: '#3a2216', brow: '#141014', hairStyle: 'afro', age: 26, sw: 90, ww: 70, hw: 86, pose: ['hold', 'down'], item: 'clipboard', fit: { top: 'hoodie', c1: '#f2c445', bottom: 'jeans', b: '#2a3a5a', pins: true } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.olivia.height = 0.88;
})();
