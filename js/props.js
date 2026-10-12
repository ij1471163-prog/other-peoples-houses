/* =====================================================================
   Props: small drawings that show what a character is doing, drawn in
   code (no AI pictures needed). The activity comes from the character's
   `life` table (js/chars/<id>.js, see js/life.js).

   Three places, so nothing floats in mid-air:
     front — in the foreground at the bottom of the picture, as if they
             stand at a counter (a pan, a cup, a book, a bowl…)
     side  — leaning next to them (a broom, a surfboard, a rod…)
     head  — near the head (Zzz while asleep, gulls, a phone)
   Characters whose picture already holds the thing (Marco's cup, Irene's
   tablet, Gregor's shovel, Olivia's clipboard, Stella's flowers) get none.
   Steam and Zzz move gently, and stop when the phone is idle (power.js).
   ===================================================================== */
'use strict';
const PROPS = (() => {
  const O = 'stroke="#2a2320" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  const steam = (x, y) => `<g class="steam" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75">
    <path d="M${x} ${y} q-6 -10 0 -20 q6 -10 0 -20"/><path d="M${x + 14} ${y + 2} q-6 -10 0 -20 q6 -10 0 -20"/><path d="M${x - 14} ${y + 2} q-6 -10 0 -20 q6 -10 0 -20"/></g>`;
  const ART = {
    /* ---------- in front (foreground, bottom of the picture) ---------- */
    cook: ['front', `<svg viewBox="0 0 200 120">${steam(80, 46)}
      <path d="M128 70 L196 58 L198 68 L132 82 Z" fill="#3b2a20" ${O}/>
      <ellipse cx="80" cy="74" rx="62" ry="18" fill="#4a4f57" ${O}/><ellipse cx="80" cy="70" rx="52" ry="12" fill="#2f3339"/>
      <ellipse cx="66" cy="69" rx="13" ry="7" fill="#fff6dc"/><circle cx="66" cy="69" r="5" fill="#f5b400"/>
      <ellipse cx="96" cy="70" rx="13" ry="7" fill="#fff6dc"/><circle cx="96" cy="70" r="5" fill="#f5b400"/>
      <path d="M18 76 q62 40 124 0 l0 8 q-62 40 -124 0 z" fill="#3a3e45" ${O}/></svg>`],
    tea: ['front', `<svg viewBox="0 0 120 120">${steam(56, 40)}
      <path d="M86 64 q24 0 24 16 q0 16 -26 14" fill="none" stroke="#2a2320" stroke-width="9"/><path d="M86 64 q24 0 24 16 q0 16 -26 14" fill="none" stroke="#e9e2d0" stroke-width="4"/>
      <path d="M24 52 h66 l-6 52 q-2 10 -12 10 h-30 q-10 0 -12 -10 z" fill="#e9e2d0" ${O}/><ellipse cx="57" cy="52" rx="33" ry="7" fill="#7a4a2a" ${O}/>
      <path d="M30 76 h54" stroke="#3f6a8a" stroke-width="6"/></svg>`],
    eat: ['front', `<svg viewBox="0 0 160 110">
      <path d="M104 18 L128 70" stroke="#2a2320" stroke-width="9" stroke-linecap="round"/><path d="M104 18 L128 70" stroke="#c9ccd2" stroke-width="5" stroke-linecap="round"/>
      <path d="M20 54 h120 q-4 46 -60 46 q-56 0 -60 -46 z" fill="#e9604a" ${O}/><ellipse cx="80" cy="54" rx="60" ry="12" fill="#f6e7c0" ${O}/>
      <g fill="#d99a3c"><circle cx="60" cy="52" r="5"/><circle cx="78" cy="50" r="5"/><circle cx="96" cy="53" r="5"/><circle cx="70" cy="57" r="4"/><circle cx="88" cy="57" r="4"/></g></svg>`],
    read: ['front', `<svg viewBox="0 0 180 110">
      <path d="M90 30 q-40 -14 -80 0 v66 q40 -14 80 0 z" fill="#f4ecd8" ${O}/><path d="M90 30 q40 -14 80 0 v66 q-40 -14 -80 0 z" fill="#efe5cc" ${O}/>
      <g stroke="#9a8f78" stroke-width="3"><path d="M24 44 q30 -8 56 0M24 56 q30 -8 56 0M24 68 q30 -8 56 0M100 44 q30 -8 56 0M100 56 q30 -8 56 0M100 68 q30 -8 56 0"/></g>
      <path d="M90 30 v66" stroke="#2a2320" stroke-width="3"/></svg>`],
    draw: ['front', `<svg viewBox="0 0 180 120">
      <rect x="20" y="20" width="120" height="90" rx="4" fill="#f7f3ea" ${O}/><path d="M20 30 h120" stroke="#2a2320" stroke-width="3"/>
      <g stroke="#6d6a66" stroke-width="2.5" fill="none"><path d="M36 92 q24 -40 46 -16 q18 18 40 -30"/><circle cx="104" cy="56" r="8"/><path d="M40 86 l20 -6"/></g>
      <path d="M150 20 L120 92" stroke="#2a2320" stroke-width="10" stroke-linecap="round"/><path d="M150 20 L120 92" stroke="#f2c230" stroke-width="6" stroke-linecap="round"/>
      <path d="M124 84 l-6 14 l10 -10 z" fill="#2a2320"/></svg>`],
    game: ['front', `<svg viewBox="0 0 160 100">
      <path d="M30 34 q50 -14 100 0 q26 8 22 40 q-4 26 -24 20 q-14 -4 -22 -18 h-52 q-8 14 -22 18 q-20 6 -24 -20 q-4 -32 22 -40 z" fill="#2f3440" ${O}/>
      <path d="M44 46 v20 M34 56 h20" stroke="#cfd3dc" stroke-width="6" stroke-linecap="round"/>
      <circle cx="112" cy="48" r="6" fill="#e9604a"/><circle cx="124" cy="60" r="6" fill="#5fb3a8"/><circle cx="100" cy="60" r="6" fill="#f2c230"/></svg>`],
    mend: ['front', `<svg viewBox="0 0 200 110">
      <path d="M14 96 q30 -70 90 -76 q66 -4 86 76 z" fill="#c9b27a" ${O}/>
      <g stroke="#7a6438" stroke-width="2.5" fill="none"><path d="M30 90 q40 -60 90 -66M50 94 q40 -54 90 -60M70 96 q34 -40 90 -46M40 60 q60 20 140 36M60 42 q60 18 120 40M90 30 q50 14 80 30"/></g>
      <circle cx="150" cy="40" r="7" fill="#e9604a" ${O}/></svg>`],
    shop: ['front', `<svg viewBox="0 0 180 120">
      <circle cx="56" cy="38" r="20" fill="#e9604a" ${O}/><circle cx="96" cy="32" r="18" fill="#f2c230" ${O}/><path d="M118 40 q20 -30 36 -6 q-14 20 -36 6 z" fill="#6aa84f" ${O}/>
      <rect x="20" y="46" width="140" height="66" rx="4" fill="#c88f52" ${O}/><path d="M20 70 h140 M20 92 h140" stroke="#2a2320" stroke-width="3"/></svg>`],
    laundry: ['front', `<svg viewBox="0 0 180 120">
      <path d="M30 40 q30 -26 60 -10 q30 -20 60 6 l4 10 h-128 z" fill="#f4f4f4" ${O}/>
      <path d="M18 44 h144 l-10 66 q-2 8 -10 8 h-104 q-8 0 -10 -8 z" fill="#b98a55" ${O}/>
      <g stroke="#7a5630" stroke-width="3"><path d="M40 58 v48M64 58 v52M90 58 v52M116 58 v52M140 58 v48"/></g></svg>`],
    /* ---------- leaning beside them ---------- */
    clean: ['side', `<svg viewBox="0 0 80 300">
      <path d="M46 6 L36 210" stroke="#2a2320" stroke-width="11" stroke-linecap="round"/><path d="M46 6 L36 210" stroke="#b07a46" stroke-width="7" stroke-linecap="round"/>
      <path d="M14 206 h44 l12 88 h-68 z" fill="#d9b25a" ${O}/><g stroke="#9a7a30" stroke-width="2.5"><path d="M20 230 l-6 60M32 230 l-2 60M44 230 l2 60M56 230 l6 60"/></g>
      <rect x="12" y="200" width="48" height="14" rx="3" fill="#c0392b" ${O}/></svg>`],
    surf: ['side', `<svg viewBox="0 0 90 320"><path d="M45 6 q40 70 36 170 q-4 100 -36 138 q-32 -38 -36 -138 q-4 -100 36 -170 z" fill="#f5f0e1" ${O}/>
      <path d="M45 20 q20 80 16 160 q-4 80 -16 120" fill="none" stroke="#e9604a" stroke-width="7"/><path d="M45 20 q-20 80 -16 160 q4 80 16 120" fill="none" stroke="#5fb3a8" stroke-width="7"/></svg>`],
    fish: ['side', `<svg viewBox="0 0 120 320">
      <path d="M22 312 L96 10" stroke="#2a2320" stroke-width="15" stroke-linecap="round"/><path d="M22 312 L96 10" stroke="#a8713a" stroke-width="9" stroke-linecap="round"/>
      <path d="M96 10 q20 60 6 150" fill="none" stroke="#fff" stroke-width="3"/><circle cx="102" cy="164" r="9" fill="#e9604a" ${O}/>
      <circle cx="34" cy="262" r="18" fill="#4a4f57" ${O}/><circle cx="34" cy="262" r="6" fill="#c9ccd2"/></svg>`],
    deliver: ['side', `<svg viewBox="0 0 120 120"><path d="M14 80 q0 -62 52 -62 q46 0 50 54 z" fill="#e9604a" ${O}/>
      <path d="M30 50 q30 -24 70 0" stroke="#fff" stroke-width="5" fill="none"/><path d="M10 82 h108 v12 h-108 z" fill="#2f3440" ${O}/></svg>`],
    /* ---------- near the head ---------- */
    sleep: ['head', `<svg viewBox="0 0 120 120"><g class="zzz" fill="#fff" stroke="#2a2320" stroke-width="2.5" font-family="Barlow Condensed,sans-serif" font-weight="700">
      <text x="10" y="100" font-size="34">z</text><text x="40" y="70" font-size="44">z</text><text x="76" y="38" font-size="56">Z</text></g></svg>`],
    gulls: ['head', `<svg viewBox="0 0 160 100"><g class="gulls" fill="none" stroke="#2a2320" stroke-width="5" stroke-linecap="round">
      <path d="M10 50 q16 -18 30 0 q14 -18 30 0"/><path d="M90 26 q12 -14 24 0 q12 -14 24 0"/><path d="M80 80 q10 -12 20 0 q10 -12 20 0"/></g></svg>`],
    phone: ['head', `<svg viewBox="0 0 100 100"><rect x="36" y="20" width="30" height="56" rx="6" fill="#2f3440" ${O}/><rect x="41" y="27" width="20" height="38" rx="2" fill="#9ad0ff"/>
      <g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" class="ring"><path d="M76 34 q10 14 0 28"/><path d="M86 26 q18 22 0 44"/></g></svg>`],
    watch: ['head', `<svg viewBox="0 0 100 120"><circle cx="50" cy="66" r="44" fill="#ffe7a0" opacity=".35" class="glow"/>
      <path d="M38 20 h24 v10 h-24 z" fill="#3a3e45" ${O}/><path d="M32 30 h36 l-4 60 h-28 z" fill="#ffd36b" ${O}/><path d="M30 90 h40 v10 h-40 z" fill="#3a3e45" ${O}/></svg>`]
  };
  /* who already holds their thing in the picture itself */
  const HOLDS = { marco: 1, irene: 1, gregor: 1, olivia: 1, stella: 1 };
  /* aliases: resting with the radio on looks like resting with a mug */
  const ALIAS = { rest: 'tea', radio: 'tea', table: 'eat', serve: 'tea' };

  /* the markup for a character's prop right now, or '' */
  function html(id, s) {
    if (HOLDS[id] || typeof LIFE === 'undefined') return '';
    const a = LIFE.act(id, s); if (!a) return '';
    const k = ART[a.key] ? a.key : ALIAS[a.key]; if (!k || !ART[k]) return '';
    const [place, svg] = ART[k];
    return `<div class="prop prop-${place} prop-${k}" aria-hidden="true">${svg}</div>`;
  }
  return { html, ART };
})();
