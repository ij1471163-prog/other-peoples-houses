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
