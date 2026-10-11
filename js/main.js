/* Boot. GAME.REPO is used for the "Download the Android app" link when the game
   isn't running on GitHub Pages (on Pages it's detected from the address). */
GAME.REPO = 'ij1471163-prog/other-peoples-houses';
(function () {
  let started = false; const go = () => { if (!started) { started = true; boot(); } };
  try { PEOPLE.scan(Object.keys(GAME.CHAR), Object.keys(ART.BGS)).then(go, go); } catch (e) { go(); }
  setTimeout(go, 3000);
})();
