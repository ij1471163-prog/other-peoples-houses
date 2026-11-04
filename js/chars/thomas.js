/* =====================================================================
   Thomas — 26. Elias's son. Left for university at eighteen, eight years
   ago, and has not spoken to his father since. Lives in the city.
   He is only seen in the endings of Elias's chapter (js/elias.js) and at
   the start of chapter 2 (js/leo.js); on the phone he is only a voice
   (js/thomas-call.js). So he has no daily routine of his own.
   ===================================================================== */
'use strict';
(function () {
  GAME.CHAR.thomas = {
    name: T('Thomas', 'توماس'),
    role: T('26. Elias\'s son. Lives in the city.', '٢٦ سنة. ولد إلياس. ساكن في المدينة.'),
    art: true,
    where: s => null
  };
  GAME.CHAR.thomas.height = 1.0;
  if (typeof PEOPLE !== 'undefined' && PEOPLE.SPEC) PEOPLE.SPEC.thomas = { sex: 'm', skin: '#ecc8a8', hair: '#3a2a20', eye: '#7a8a9a', brow: '#3a2a20', hairStyle: 'short', age: 26, sw: 100, ww: 84, hw: 82, pose: ['pocket', 'pocket'], fit: { top: 'coat', c1: '#1e2540', c2: '#7a7a7a', bottom: 'pants', b: '#22242c' } };
})();
