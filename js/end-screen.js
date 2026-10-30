/* =====================================================================
   Endings get a moment of their own (UI only; no ending, condition or
   text changes).
   When an ending is reached, the screen goes dark, then a full-screen
   picture fades in (a place from the story, graded for that ending),
   then the ending's name. Tap to continue to the usual ending card.
   If a video exists for that ending (VIDEO below, files in img/end/),
   it plays instead of the picture, whole, without cuts.
   ===================================================================== */
'use strict';
(function () {
  /* ending -> [picture, grade]. grades: dawn, warm, grey, night, rain, dark, fire */
  const PIC = {
    ELIAS_STAY: ['bg/harbor', 'dawn'], ELIAS_LETTER: ['bg/elias_bed', 'grey'], ELIAS_PEACE: ['bg/living', 'grey'],
    ELIAS_KICK: ['bg/street_night', 'rain'], ELIAS_GO: ['bg/station', 'dawn'],
    LEO_HOME: ['bg/garage', 'warm'], LEO_STAY: ['bg/dock', 'warm'], LEO_RUN: ['bg/station', 'grey'], LEO_KICK: ['bg/harbor_night', 'rain'], LEO_TRUTH: ['bg/cliff_road', 'dawn'],
    MARG_OPEN: ['fx/marg_hug1', 'warm'], MARG_LEO: ['bg/cliff_road', 'warm'], MARG_NORA: ['bg/cliff_road', 'grey'], MARG_DANIEL: ['fx/marg_hug2', 'warm'], MARG_KICK: ['bg/cliff_road', 'rain'],
    EVE_PEACE: ['bg/lh_tower', 'dawn'], EVE_STAY: ['bg/lh_ext', 'warm'], EVE_FLEE: ['bg/beach', 'grey'], EVE_DEATH: ['bg/harbor_storm', 'dark'], EVE_KICK: ['bg/lh_ext', 'night'],
    VIC_DARK: ['bg/hotel_office', 'dark'], VIC_EXPOSE: ['bg/street', 'warm'], VIC_ANA: ['bg/station', 'dawn'], VIC_KICK: ['bg/hotel_lobby', 'grey'], VIC_FIRE: ['bg/hotel_lobby', 'fire'],
    END_HOST: ['bg/street', 'warm'], END_HOME: ['bg/station', 'dawn'], END_PASS: ['bg/harbor', 'grey'], END_LOST: ['bg/street_night', 'grey'], END_DARK: ['bg/hotel_office', 'dark']
  };
  /* ending -> video file in img/end/ (added as the videos come in) */
  const VIDEO = {};

  let open = null;
  function close() {
    if (!open) return; const o = open; open = null;
    o.classList.add('out'); setTimeout(() => o.remove(), 900);
    const v = o.querySelector('video'); if (v) try { v.pause(); } catch (e) {}
  }
  function show(id) {
    const e = GAME.END[id], st = $('stage'); if (!e || !st) return;
    const p = PIC[id] || ['bg/harbor', 'grey'];
    const o = el('div', 'endcine g-' + p[1]); o.setAttribute('role', 'dialog');
    const media = el('div', 'ec-media');
    if (VIDEO[id]) {
      const v = document.createElement('video');
      v.src = 'img/end/' + VIDEO[id]; v.muted = true; v.playsInline = true; v.autoplay = true; v.setAttribute('playsinline', '');
      v.onerror = () => { v.remove(); media.style.backgroundImage = 'url(img/' + p[0] + '.jpg)'; media.classList.add('still'); };
      v.onended = () => o.classList.add('done');
      media.appendChild(v);
    } else { media.style.backgroundImage = 'url(img/' + p[0] + '.jpg)'; media.classList.add('still'); }
    o.appendChild(media);
    if (p[1] === 'rain') o.appendChild(el('div', 'ec-rain'));
    o.appendChild(el('div', 'ec-vig'));
    const txt = el('div', 'ec-text');
    txt.appendChild(el('small', '', UI('ending') + (e.who ? ' · ' + tx(GAME.CHAR[e.who].name) : '')));
    txt.appendChild(el('strong', '', tx(e.title)));
    o.appendChild(txt);
    const hint = el('div', 'ec-tap', '›'); o.appendChild(hint);
    const t0 = Date.now();
    o.addEventListener('click', ev => { ev.stopPropagation(); if (Date.now() - t0 > 2600) close(); });
    st.appendChild(o); open = o;
  }
  const se0 = showEnding;
  showEnding = function (id) {
    const r = se0.apply(this, arguments);
    try { show(id); } catch (e) { console.error(e); }
    return r;
  };
  /* anything that moves the game on (title screen, next chapter) closes it */
  const ts0 = titleScreen; titleScreen = function () { close(); return ts0.apply(this, arguments); };
  const pl0 = play; play = function () { close(); return pl0.apply(this, arguments); };
})();
