/* =====================================================================
   Margaret's house gets an upstairs landing (img/bg/marg_hall.jpg).
   Before, every room opened straight off the sitting room. Now:
     · the sitting room: the front door, the kitchen, the stairs up;
     · the landing: your room, the bathroom, Margaret's room, and at the
       end of the corridor, facing you every time you come up, Daniel's
       door with the light under it;
     · every room upstairs goes back out to the landing.
   The doors keep their own rules (locks, risks) exactly as they were;
   only where they are changes. Nothing else in the story changes.
   ===================================================================== */
'use strict';
(function () {
  const L = GAME.LOC, liv = L.marg_living; if (!liv || L.marg_hall) return;
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const UP = ['marg_guest', 'marg_bath', 'marg_bed', 'dan_room'];
  /* where each door is on the landing picture */
  const AT = { marg_guest: [51, 54], dan_room: [68, 40], marg_bath: [80, 40], marg_bed: [94, 56] };
  const moved = liv.exits.filter(e => UP.includes(e.to));
  liv.exits = liv.exits.filter(e => !UP.includes(e.to));
  liv.exits.push({ to: 'marg_hall', x: 50, y: 14, label: T('Upstairs', 'الدرج لفوق') });
  L.marg_hall = {
    name: T('The landing', 'الممر فوق'), bg: 'marg_hall', house: 'margaret', canWait: liv.canWait,
    exits: [{ to: 'marg_living', x: 16, y: 84, label: T('Downstairs', 'الدرج لتحت') }]
      .concat(moved.map(e => Object.assign({}, e, { x: AT[e.to][0], y: AT[e.to][1] }))),
    spots: [
      { x: 20, y: 22, label: T('Photographs on the wall', 'صور على الجدار'), run: s => [
        N1('A row of photographs of the same boy: a baby, a gap-toothed five-year-old, a boy in a striped jumper, a teenager trying not to smile.', 'صف صور لنفس الولد: رضيع، وطفل عمره خمس بسنون ناقصة، وولد بكنزة مخططة، ومراهق يحاول ما يبتسم.'),
        N1('After the last one, a nail with nothing on it. The wallpaper around it is a shade darker, the shape of a frame that was never hung.', 'بعد آخر صورة، مسمار ما عليه شي. ورق الجدار حوله أغمق شوي، بشكل برواز عمره ما تعلّق.')] },
      { x: 37, y: 58, label: T('Dried flowers', 'ورد ناشف'), run: s => [N1('Hydrangeas, dried a long time ago, still in their water. The water has gone. Nobody has moved the vase.', 'هيدرانجيا، ناشفة من زمان، لسا في مويتها. الموية راحت. ومحد حرّك المزهرية.')] }
    ]
  };
  /* the rooms upstairs go back out to the landing */
  UP.forEach(id => { const r = L[id]; if (!r || !r.exits) return; r.exits.forEach(e => { if (e.to === 'marg_living') { e.to = 'marg_hall'; e.label = T('The landing', 'الممر'); } }); });
})();
/* the sunroom at the back (img/bg/marg_garden.jpg, and its own night picture):
   the one room in the house she keeps alive. Flavour only, and a place to sit. */
(function () {
  const L = GAME.LOC, liv = L.marg_living; if (!liv || L.marg_garden) return;
  const N1 = (en, ar) => ({ n: T(en, ar) });
  liv.exits.push({ to: 'marg_garden', x: 94, y: 46, label: T('The sunroom', 'غرفة الزرع') });
  L.marg_garden = {
    name: T('The sunroom', 'غرفة الزرع'), bg: 'marg_garden', house: 'margaret', canWait: true,
    exits: [{ to: 'marg_living', x: 6, y: 48, label: T('Back inside', '{ارجع|ارجعي} داخل') }],
    spots: [
      { x: 18, y: 64, label: T('A wicker chair', 'كرسي خيزران'), run: s => {
        if (doneToday('mSun')) return [N1('You sit a while longer. The fountain doesn\'t need you to say anything.', '{تجلس|تجلسين} شوي زيادة. النافورة ما تحتاجك {تقول|تقولين} شي.')];
        onceToday('mSun'); addMood(1); rest(10);
        return [N1(...[
          ['Her chair. A cup of tea on the little table, gone cold, a book face down beside it. You sit. The fountain ticks and trickles. For ten minutes the house is not sad.', 'كرسيها. كوب شاي على الطاولة الصغيرة، برد، وكتاب مقلوب جنبه. {تجلس|تجلسين}. النافورة تقطر. عشر دقايق، البيت ما يكون حزين.'],
          ['You sit in the wicker chair and it creaks exactly the way it must have creaked under her for years. The hydrangeas lean towards the glass.', '{تجلس|تجلسين} على كرسي الخيزران ويصر بنفس الطريقة اللي أكيد صر فيها تحتها سنين. والهيدرانجيا مايلة على الزجاج.']][s.day % 2])];
      } },
      { x: 58, y: 60, label: T('The little fountain', 'النافورة الصغيرة'), run: s => [N1('A stone fountain, three tiers, the water so clean you can see coins at the bottom. Two of them are very old. One is shiny and new, from this week.', 'نافورة حجر، ثلاث طبقات، الموية صافية لدرجة تشوف الفكة اللي بقاعها. اثنين منها قديمة مرة. وحدة لامعة وجديدة، من هالأسبوع.')] },
      { x: 26, y: 30, label: T('A painted boat', 'لوحة قارب'), run: s => [N1('A small sailing boat on a blue sea. In the corner, in a child\'s careful letters: "for mum, from D, age 8".', 'قارب شراعي صغير على بحر أزرق. وفي الزاوية، بحروف طفل مرتبة: «لماما، من د، عمري ٨».')] },
      { x: 88, y: 66, label: T('Hydrangeas', 'هيدرانجيا'), run: s => [N1('Pink, and so heavy they bow. Everything in this room has been watered today. Everything in the rest of the house has been dusted. Nothing in the rest of the house is alive.', 'وردي، وثقيلة لدرجة إنها منحنية. كل شي في هالغرفة انسقى اليوم. وكل شي في باقي البيت انمسح. ولا شي في باقي البيت حي.')] }
    ]
  };
})();
