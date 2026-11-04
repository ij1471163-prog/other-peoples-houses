/* =====================================================================
   Carol — about 50. Leo's mother. Lives in the big house with the wide
   garden and the lemon tree. Tips in lemons. Leaves the porch light on.
   She is only met in Leo's chapter: at her door on a delivery
   (js/leo-more.js) and in her own house (js/houses.js), so she has no
   daily routine of her own.
   ===================================================================== */
'use strict';
(function () {
  GAME.CHAR.carol = {
    name: T('Carol', 'كارول'),
    role: T('About fifty. Leo\'s mother. Tips in lemons.', 'في الخمسين تقريباً. أم ليو. تعطي بقشيش ليمون.'),
    art: true,
    where: s => null
  };
  GAME.CHAR.carol.height = 0.92;
  if (typeof PEOPLE !== 'undefined' && PEOPLE.SPEC) PEOPLE.SPEC.carol = { sex: 'f', skin: '#f0d0b8', hair: '#5a3a26', eye: '#6a4a2a', brow: '#4a3020', hairStyle: 'wavy', age: 50, sw: 90, ww: 78, hw: 88, pose: ['hold', 'pocket'], item: 'flower', fit: { top: 'cardigan', c1: '#e8dcc6', c2: '#4a6aa0', bottom: 'skirt', b: '#2e2830' } };
})();
