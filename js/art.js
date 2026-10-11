/* =====================================================================
   Other People's Houses — art (v2)
   Outlined, cel-shaded cartoon style. Every background, sprite, the
   town map, UI icons and the app icon are drawn here as SVG.
   ===================================================================== */
'use strict';
const ART = (() => {
  const W = 1600, H = 900, INK = '#241f2b';
  const SKY = { morning: ['#ffd29a', '#9ec9ea'], noon: ['#a9d8f5', '#5fa8e0'], afternoon: ['#ffe0a8', '#7fb6e2'], evening: ['#ff9a5c', '#4a3a78'], night: ['#0b1230', '#202c55'] };
  const SEA = { morning: '#4f9cc0', noon: '#2f8fc4', afternoon: '#3a8ab4', evening: '#5a4a80', night: '#0f1a38' };
  const WIN = { morning: '#ffe6b8', noon: '#d6f0ff', afternoon: '#ffeccc', evening: '#ffb27a', night: '#1c2a58' };
  const lit = t => t === 'evening' || t === 'night';
  let uid = 0;
  const OUT = (s, w = 5) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${s}</g>`;
  const NS = 'stroke="none"';
  const shade = (d, o = .16) => `<path d="${d}" fill="#000" opacity="${o}" ${NS}/>`;
  const hi = (d, o = .22) => `<path d="${d}" fill="#fff" opacity="${o}" ${NS}/>`;
  const glowDef = id => `<radialGradient id="${id}"><stop offset="0" stop-color="#ffd27a" stop-opacity=".6"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>`;
  const svg = (inner, defs = '') => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${inner}</svg>`;
  function skyRect(t) {
    const id = 'sk' + (++uid);
    let s = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY[t][1]}"/><stop offset="1" stop-color="${SKY[t][0]}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
    if (t === 'night') s += [[120, 80], [380, 140], [640, 60], [900, 120], [1180, 70], [1420, 150], [260, 230], [1040, 210], [760, 30], [520, 200]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity=".8"/>`).join('') + `<circle cx="1320" cy="140" r="44" fill="#f6efd6"/><circle cx="1304" cy="128" r="9" fill="#e2d9bc"/>`;
    if (t === 'morning') s += `<circle cx="280" cy="320" r="80" fill="#fff0c4" opacity=".9"/>`;
    if (t === 'noon') s += `<circle cx="1300" cy="110" r="64" fill="#fff8d6"/>`;
    if (t === 'afternoon') s += `<circle cx="1180" cy="230" r="70" fill="#ffefbf"/>`;
    if (t === 'evening') s += `<circle cx="1250" cy="400" r="96" fill="#ffc27a" opacity=".95"/>`;
    s += (t !== 'night' ? `<g fill="#fff" opacity=".75">${[[200, 120, 1], [900, 170, 1.3], [1380, 90, .9]].map(([x, y, k]) => `<ellipse cx="${x}" cy="${y}" rx="${70 * k}" ry="${22 * k}"/><ellipse cx="${x + 40 * k}" cy="${y - 14 * k}" rx="${46 * k}" ry="${20 * k}"/>`).join('')}</g>` : '');
    return s;
  }
  const glow = (id, x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>`;
  const win = (x, y, w, h, t, curtain) => `<rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" rx="4" fill="#6a4c36"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${WIN[t]}"/>` +
    (t === 'night' ? `<circle cx="${x + w * .7}" cy="${y + h * .3}" r="12" fill="#f4ecd2" ${NS}/>` : hi(`M${x + 8} ${y + h - 8} l${w * .35} -${h * .8} h${w * .12} l-${w * .35} ${h * .8}z`, .35)) +
    `<rect x="${x + w / 2 - 5}" y="${y}" width="10" height="${h}" fill="#6a4c36"/><rect x="${x}" y="${y + h / 2 - 5}" width="${w}" height="10" fill="#6a4c36"/>` +
    (curtain ? `<path d="M${x - 18} ${y - 18} h${w * .3} q-26 ${h * .5} 12 ${h + 36} h-${w * .3 - 12}z" fill="${curtain}"/><path d="M${x + w + 18} ${y - 18} h-${w * .3} q26 ${h * .5} -12 ${h + 36} h${w * .3 - 12}z" fill="${curtain}"/>` + shade(`M${x + w + 18} ${y - 18} h-${w * .12} q16 ${h * .5} -6 ${h + 36} h${w * .12}z`, .2) : '');
  /* perspective floor: boards converge to a vanishing point, rows get wider toward the viewer, baseboard + soft contact shadow */
  const planks = (y, c1, c2, n = 8) => { const vp = 800, h = H - y, id = 'fl' + (++uid);
    let o = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".06"/></linearGradient></defs><rect x="0" y="${y}" width="${W}" height="${h}" fill="${c1}"/>`;
    for (let i = -14; i <= 14; i++) o += `<line x1="${vp + i * 70}" y1="${y}" x2="${vp + i * 230}" y2="${H}" stroke="${c2}" stroke-width="3"/>`;
    for (let k = 1; k <= Math.max(3, n - 2); k++) { const t = Math.pow(k / Math.max(3, n - 2), 1.6); const yy = y + h * t; o += `<line x1="0" y1="${yy}" x2="${W}" y2="${yy}" stroke="${c2}" stroke-width="${2 + t * 2}" opacity=".8"/>`; }
    return o + `<rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#${id})"/><rect x="0" y="${y - 14}" width="${W}" height="16" fill="${c2}" stroke="${INK}" stroke-width="3"/>` + shade(`M0 ${y + 2} h${W} v20 h-${W}z`, .16); };
  const wallGrad = (c1, c2, h = 640) => { const id = 'wg' + (++uid); return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="${W}" height="${h}" fill="url(#${id})"/>`; };
  const hangLamp = (x, y, t, id) => `<line x1="${x}" y1="0" x2="${x}" y2="${y - 30}" stroke="${INK}" stroke-width="5"/>` + OUT(`<path d="M${x - 44} ${y} q44 -60 88 0z" fill="#e7b25e"/>`) + (lit(t) ? `<circle cx="${x}" cy="${y + 6}" r="14" fill="#fff3c4" ${NS}/>` + glow(id, x, y + 40, 330) : '');
  const streetLamp = (x, y, t, id) => OUT(`<rect x="${x - 6}" y="${y}" width="12" height="${560 - y}" fill="#3a3a48"/><path d="M${x - 30} ${y} h60 l-12 -40 h-36z" fill="#2e2e3a"/>`) + (lit(t) ? `<rect x="${x - 18}" y="${y - 32}" width="36" height="26" fill="#ffe7a0" ${NS}/>` + glow(id, x, y, 280) : `<rect x="${x - 18}" y="${y - 32}" width="36" height="26" fill="#cfd7dc" ${NS}/>`);

  const BG = {
    station: t => { const g = 'g' + (++uid); return svg(skyRect(t) + OUT(`
      <rect x="0" y="420" width="${W}" height="90" fill="#2c3040"/>
      <rect x="40" y="240" width="1000" height="240" rx="22" fill="#a33b3b"/><rect x="40" y="240" width="1000" height="46" rx="18" fill="#c24a48"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${90 + i * 152}" y="306" width="112" height="84" rx="10" fill="${lit(t) ? '#ffd88a' : '#9fd0ea'}"/>`).join('')}
      <rect x="0" y="510" width="${W}" height="390" fill="#4a4e5c"/><rect x="0" y="510" width="${W}" height="20" fill="#e6c440"/>
      <rect x="1180" y="170" width="320" height="86" rx="8" fill="#1f4a5e"/>
      <rect x="1334" y="256" width="12" height="254" fill="#2c2c38"/>
      <rect x="1060" y="580" width="240" height="30" rx="6" fill="#8a5a3a"/><rect x="1074" y="610" width="14" height="64" fill="#5a3a26"/><rect x="1272" y="610" width="14" height="64" fill="#5a3a26"/>`) +
      `<text x="1340" y="228" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="600" font-size="48" letter-spacing="8" fill="#fff4dc">SALTMERE</text>` + shade('M40 400 h1000 v80 h-1000z', .18) + streetLamp(720, 300, t, g) + streetLamp(1520, 300, t, g), glowDef(g)); },
    motel: t => { const g = 'g' + (++uid); return svg(wallGrad('#6e5f7a', '#4f4560') + OUT(`
      ${win(980, 140, 380, 300, t, '#a8455a')}
      <rect x="120" y="470" width="640" height="210" rx="12" fill="#8f7aa0"/><rect x="130" y="424" width="170" height="74" rx="20" fill="#efe6f2"/><path d="M300 470 q220 -46 460 0 v60 h-460z" fill="#a690b8"/>
      <rect x="790" y="530" width="130" height="150" fill="#6a4c36"/><rect x="812" y="514" width="72" height="18" rx="4" fill="#20242c"/>
      <rect x="1430" y="150" width="140" height="500" fill="#5a4440"/><circle cx="1452" cy="420" r="9" fill="#e2c07a"/>`) + planks(640, '#4a3f48', '#3d343c') +
      (lit(t) ? `<rect x="990" y="150" width="360" height="280" fill="#ff4f6a" opacity=".2"/>` + glow(g, 848, 470, 220) : '') + `<rect x="820" y="517" width="56" height="12" rx="2" fill="#5a8ae0" ${NS}/>`, glowDef(g)); },
    street: t => { const g = 'g' + (++uid); return svg(skyRect(t) + OUT(`
      <rect x="600" y="400" width="400" height="170" fill="${SEA[t]}"/>
      <rect x="0" y="560" width="${W}" height="340" fill="#9a958e"/><path d="M560 560 L1040 560 L1600 900 L0 900z" fill="#77736e"/>
      <rect x="0" y="220" width="440" height="340" fill="#e3cfa8"/><polygon points="-10,224 220,120 450,224" fill="#b05a44"/>
      <rect x="54" y="378" width="320" height="182" fill="#2f6a52"/><rect x="76" y="398" width="276" height="124" fill="${lit(t) ? '#ffd88a' : '#bfe3da'}"/>
      <path d="M36 380 h360 l-24 -54 h-312z" fill="#3f8a62"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${60 + i * 55} 380 l27 -54" stroke-width="3"/>`).join('')}
      <rect x="1160" y="200" width="440" height="360" fill="#d9b49a"/><polygon points="1150,204 1385,110 1610,204" fill="#7a4a4a"/>
      <rect x="1214" y="372" width="330" height="188" fill="#6a3e30"/><rect x="1236" y="392" width="286" height="130" fill="${lit(t) ? '#ffe3a0' : '#d8ecf0'}"/>
      <path d="M1194 372 h370 l-28 -56 h-314z" fill="#d2483c"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${1216 + i * 58} 372 l28 -56" stroke-width="3"/>`).join('')}
      <rect x="460" y="290" width="130" height="270" fill="#efe6d4"/><rect x="1020" y="310" width="140" height="250" fill="#e2d4bc"/>
      <rect x="490" y="330" width="70" height="60" fill="${WIN[t]}"/><rect x="1050" y="350" width="80" height="60" fill="${WIN[t]}"/>
      <rect x="690" y="606" width="220" height="24" rx="6" fill="#8a5a3a"/><rect x="704" y="630" width="12" height="44" fill="#5a3a26"/><rect x="884" y="630" width="12" height="44" fill="#5a3a26"/>
      <rect x="940" y="462" width="96" height="120" rx="4" fill="#f4ecdc"/><rect x="950" y="474" width="76" height="46" fill="#d2483c"/>`) +
      `<text x="214" y="364" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="600" font-size="30" letter-spacing="3" fill="#fff4dc">SAMI'S GROCERY</text><text x="1380" y="356" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="600" font-size="34" letter-spacing="4" fill="#fff4dc">MARCO'S</text>` +
      shade('M0 220 h120 v340 h-120z', .12) + shade('M1480 200 h120 v360 h-120z', .14) + streetLamp(530, 330, t, g) + streetLamp(1100, 340, t, g), glowDef(g)); },
    grocery: t => { const g = 'g' + (++uid); return svg(wallGrad('#f0e2c2', '#dccaa4') + OUT(`
      ${[0, 1, 2].map(r => `<rect x="60" y="${176 + r * 150}" width="640" height="16" fill="#8a5a3a"/>` + Array.from({ length: 9 }, (_, i) => `<rect x="${78 + i * 68}" y="${104 + r * 150}" width="50" height="72" rx="5" fill="${['#e2553f', '#3f9a6a', '#f2c445', '#4a7ad0', '#f08a3a'][(i + r) % 5]}"/>`).join('')).join('')}
      <rect x="60" y="590" width="640" height="70" fill="#8a5a3a"/>
      ${win(990, 120, 420, 280, t)}
      <rect x="860" y="486" width="720" height="190" fill="#9a6a44"/><rect x="850" y="470" width="740" height="24" fill="#c08a5a"/>
      <rect x="1360" y="408" width="130" height="66" rx="6" fill="#2c3036"/><rect x="900" y="420" width="170" height="54" rx="8" fill="#e6b45a"/>
      ${[0, 1, 2, 3].map(i => `<ellipse cx="${1120 + i * 52}" cy="456" rx="24" ry="14" fill="#d9944a"/>`).join('')}`) + planks(660, '#a8865e', '#937350') +
      shade('M860 560 h720 v116 h-720z', .14) + (lit(t) ? glow(g, 800, 110, 460) : ''), glowDef(g)); },
    cafe: t => { const g = 'g' + (++uid); return svg(wallGrad('#7a4a3a', '#5a382c') + OUT(`
      ${win(110, 120, 380, 300, t, '#b8382e')}
      <rect x="780" y="380" width="780" height="280" fill="#8a5a40"/><rect x="760" y="356" width="820" height="32" fill="#b07a52"/>
      <rect x="1180" y="226" width="210" height="134" rx="12" fill="#c8c8cc"/><rect x="1206" y="252" width="158" height="42" rx="8" fill="#4a4a52"/>
      <rect x="820" y="136" width="330" height="176" rx="6" fill="#26201c"/>
      <rect x="150" y="560" width="320" height="22" rx="8" fill="#b07a52"/><rect x="298" y="582" width="22" height="120" fill="#6a4434"/>
      <rect x="230" y="536" width="150" height="26" fill="#f4ecdc"/>
      <rect x="1420" y="400" width="110" height="140" rx="6" fill="#f2e2c8"/>${[0, 1, 2].map(i => `<circle cx="${1446 + i * 30}" cy="${440 + (i % 2) * 40}" r="16" fill="#d9944a"/>`).join('')}`) +
      Array.from({ length: 8 }, (_, i) => `<rect x="${230 + i * 18.75}" y="536" width="9.4" height="26" fill="#2a2a2a" opacity="${i % 2 ? .9 : 0}" ${NS}/>`).join('') +
      `<text x="985" y="200" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-size="34" fill="#f4ecdc">ESPRESSO 2 · TEA 1</text><text x="985" y="252" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-size="34" fill="#f4ecdc">PIE 3 · SMILES FREE</text>` +
      planks(640, '#6a4434', '#58382a') + hangLamp(300, 100, t, g) + hangLamp(985, 90, t, g), glowDef(g)); },
    harbor: t => { const g = 'g' + (++uid); return svg(skyRect(t) + `<rect x="0" y="420" width="${W}" height="480" fill="${SEA[t]}"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 200 - 40} ${470 + (i % 3) * 60} q40 -16 80 0 t80 0" stroke="#fff" stroke-width="5" fill="none" opacity=".35"/>`).join('') + OUT(`
      <rect x="0" y="616" width="920" height="44" fill="#9a6a44"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 102 + 20}" y="660" width="18" height="240" fill="#6a4434"/>`).join('')}
      <path d="M500 598 q200 64 420 0 l-46 78 h-330z" fill="#2f78b0"/><rect x="620" y="508" width="14" height="100" fill="#f2ead6"/><path d="M634 514 l100 66 h-100z" fill="#f8f2e2"/>
      <rect x="1080" y="290" width="430" height="340" fill="#8a6a50"/><polygon points="1056,292 1295,186 1534,292" fill="#4a3a32"/>
      <rect x="1214" y="436" width="166" height="194" fill="#3a2a22"/>
      <rect x="1000" y="630" width="600" height="270" fill="#a8a29a"/>
      <rect x="1420" y="560" width="60" height="70" rx="6" fill="#e2483c"/>`) +
      `<text x="712" y="650" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="600" font-size="32" letter-spacing="4" fill="#fff4dc">ADA</text>` +
      `<path d="M1236 470 l22 -14 l22 14 M1306 494 l20 -12 l20 12" stroke="#f4ecdc" stroke-width="6" fill="none"/><text x="1296" y="412" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-size="44" fill="#ffc25a">L.</text>` +
      (t !== 'night' ? `<path d="M300 220 l16 12 l16 -12 M430 176 l14 10 l14 -10 M1000 150 l16 12 l16 -12" stroke="${INK}" stroke-width="5" fill="none"/>` : '') +
      shade('M1400 290 h110 v340 h-110z', .16) + streetLamp(980, 520, t, g), glowDef(g)); },
    elias_ext: t => { const g = 'g' + (++uid); return svg(skyRect(t) + OUT(`
      <rect x="0" y="600" width="${W}" height="300" fill="#7fa45a"/><path d="M640 900 L760 604 L860 604 L980 900z" fill="#d8c8a2"/>
      <rect x="380" y="286" width="840" height="324" fill="#d8cfbd"/>
      <polygon points="346,298 800,112 1254,298" fill="#4a5a78"/><rect x="980" y="140" width="76" height="118" fill="#7a6a5a"/>
      <rect x="742" y="414" width="116" height="196" rx="8" fill="#3a78b8"/>
      ${win(470, 396, 170, 130, t)}${win(960, 396, 170, 130, t)}
      <rect x="1300" y="426" width="210" height="184" fill="#8a6a4a"/><polygon points="1288,428 1405,364 1522,428" fill="#6a4a3a"/>
      <path d="M150 600 q-34 -170 22 -276 q56 106 22 276z" fill="#4f8a44"/><path d="M234 600 q-24 -130 32 -214 q34 98 12 214z" fill="#5f9a4a"/>`) +
      Array.from({ length: 20 }, (_, i) => `<rect x="${396 + (i % 10) * 82}" y="${306 + Math.floor(i / 10) * 150 + (i % 2) * 44}" width="62" height="26" rx="7" fill="#c4b9a4" ${NS}/>`).join('') +
      `<circle cx="836" cy="516" r="8" fill="#ffd25a" ${NS}/>` + Array.from({ length: 6 }, (_, i) => `<line x1="${1238 + i * 12}" y1="${370 + i * 8}" x2="${1296 + i * 10}" y2="${600 - i * 6}" stroke="#bfb6a0" stroke-width="3"/>`).join('') +
      shade('M1100 286 h120 v324 h-120z', .14) + (lit(t) ? `<rect x="470" y="396" width="170" height="130" fill="#ffc870" opacity=".85"/>` + glow(g, 555, 462, 220) : ''), glowDef(g)); },
    living: t => { const g = 'g' + (++uid); return svg(wallGrad('#b49a78', '#9c8262', 600) + OUT(`
      ${win(1060, 126, 300, 250, t, '#6a8a4a')}
      <rect x="140" y="246" width="390" height="364" fill="#9a8270"/><rect x="200" y="398" width="270" height="212" fill="#2a2420"/>
      <rect x="120" y="226" width="430" height="32" fill="#6a4c36"/>
      <rect x="158" y="152" width="76" height="76" fill="#efe4c8"/><rect x="170" y="164" width="52" height="52" fill="#9fc0d0"/><rect x="416" y="142" width="86" height="86" fill="#efe4c8"/><rect x="428" y="154" width="62" height="62" fill="#d8a888"/>
      <path d="M680 470 q0 -116 116 -116 h112 q116 0 116 116 v164 h-344z" fill="#a8483a"/><rect x="656" y="560" width="392" height="96" rx="24" fill="#bf5844"/>
      <rect x="1116" y="498" width="210" height="104" fill="#6a4c36"/><rect x="1146" y="456" width="150" height="46" rx="10" fill="#3a3a44"/>
      <rect x="1356" y="516" width="90" height="86" fill="#6a4c36"/><rect x="1366" y="484" width="56" height="36" rx="8" fill="#2a2a32"/>`) +
      `<circle cx="1178" cy="479" r="12" fill="#e2c07a" ${NS}/>` + planks(600, '#7a5a40', '#694c34') + shade('M1024 470 q0 -116 -40 -116 v280 h40z', .18) +
      ((lit(t) || t === 'morning') ? OUT(`<path d="M236 610 q40 -126 72 -40 q30 -116 72 0 q32 -64 52 40z" fill="#ff8a3a"/>`, 3) + glow(g, 335, 540, 300) : ''), glowDef(g)); },
    kitchen: t => { const g = 'g' + (++uid); return svg(wallGrad('#e8dcb8', '#d6c79e') + OUT(`
      ${win(640, 136, 320, 240, t, '#d6e0c4')}
      <rect x="80" y="430" width="1440" height="226" fill="#5f9a86"/><rect x="66" y="408" width="1468" height="32" fill="#efe4c8"/>
      <rect x="120" y="114" width="390" height="206" fill="#5f9a86"/><rect x="1096" y="106" width="390" height="214" fill="#5f9a86"/>
      <rect x="1176" y="344" width="96" height="66" rx="22" fill="#e2483c"/>
      <rect x="556" y="556" width="490" height="22" fill="#9a6a44"/><rect x="576" y="578" width="20" height="200" fill="#6a4434"/><rect x="1006" y="578" width="20" height="200" fill="#6a4434"/>`) +
      `<line x1="314" y1="114" x2="314" y2="320" stroke="${INK}" stroke-width="4"/><path d="M1272 368 q34 0 34 22" stroke="${INK}" stroke-width="10" fill="none"/>` +
      shade('M80 600 h1440 v56 h-1440z', .12) + planks(656, '#9a7450', '#86643f') + (lit(t) ? glow(g, 800, 96, 460) : ''), glowDef(g)); },
    elias_bed: t => { const g = 'g' + (++uid); return svg(wallGrad('#8a92a8', '#6e7690', 620) + OUT(`
      ${win(1150, 136, 260, 220, t, '#3a5a8a')}
      <rect x="180" y="326" width="44" height="354" fill="#6a4c36"/><rect x="200" y="456" width="660" height="224" rx="10" fill="#efe6d6"/><rect x="224" y="424" width="210" height="64" rx="20" fill="#fff8ee"/>
      <path d="M430 466 q210 -34 430 0 v210 h-430z" fill="#4a6aa0"/>
      <rect x="926" y="426" width="210" height="254" fill="#8a6244"/><rect x="942" y="478" width="178" height="74" fill="#6a4a34"/><rect x="942" y="570" width="178" height="74" fill="#6a4a34"/>
      <rect x="972" y="346" width="86" height="86" fill="#efe4c8"/><rect x="984" y="358" width="62" height="62" fill="#d8a8a0"/>
      <circle cx="700" cy="216" r="50" fill="#f4ecdc"/>`) +
      `<circle cx="1031" cy="515" r="7" fill="#e2c07a" ${NS}/><circle cx="1031" cy="607" r="7" fill="#e2c07a" ${NS}/><line x1="700" y1="216" x2="700" y2="184" stroke="${INK}" stroke-width="5"/><line x1="700" y1="216" x2="724" y2="228" stroke="${INK}" stroke-width="5"/>` +
      planks(620, '#5a4434', '#4a382a') + (lit(t) ? glow(g, 1030, 420, 240) : ''), glowDef(g)); },
    your_room: t => { const g = 'g' + (++uid); return svg(wallGrad('#7aa0ae', '#5e8694', 620) + OUT(`
      ${win(640, 136, 280, 230, t, '#e2cfb0')}
      <rect x="1496" y="356" width="44" height="324" fill="#6a4c36"/><rect x="1050" y="466" width="490" height="206" rx="10" fill="#ece4d4"/><rect x="1290" y="436" width="196" height="58" rx="20" fill="#fff8ee"/>
      <path d="M1050 488 q210 -32 450 0 v184 h-450z" fill="#a8483a"/><rect x="1120" y="672" width="210" height="42" fill="#4a3428"/>
      <rect x="118" y="466" width="372" height="26" fill="#8a6244"/><rect x="138" y="492" width="20" height="184" fill="#6a4c36"/><rect x="450" y="492" width="20" height="184" fill="#6a4c36"/>
      <path d="M196 466 q64 -64 128 -6 l42 -64 l10 70z" fill="#f2ead6"/><rect x="248" y="436" width="126" height="32" fill="#9a6a44"/>
      <rect x="156" y="146" width="210" height="270" fill="#e27a5a"/><rect x="392" y="186" width="166" height="206" fill="#5a8ab0"/>`) +
      `<path d="M190 200 h140 M190 240 h110 M420 240 h110" stroke="#fff" stroke-width="10" opacity=".5"/>` + planks(620, '#7a5a40', '#694c34') + (lit(t) ? glow(g, 300, 420, 220) : ''), glowDef(g)); },
    bath: t => { const g = 'g' + (++uid); return svg(wallGrad('#d8eef0', '#bfdfe2', 640) +
      Array.from({ length: 13 }, (_, i) => `<line x1="${i * 130}" y1="0" x2="${i * 130}" y2="640" stroke="#a8cdd2" stroke-width="3"/>`).join('') + Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${i * 110}" x2="${W}" y2="${i * 110}" stroke="#a8cdd2" stroke-width="3"/>`).join('') + OUT(`
      <rect x="140" y="440" width="640" height="220" rx="30" fill="#f8fbfb"/><rect x="120" y="420" width="680" height="40" rx="18" fill="#ffffff"/>
      <rect x="150" y="90" width="12" height="340" fill="#9aa8ae"/><path d="M162 100 h330 q-30 160 0 330 h-330z" fill="#ffd25a"/>${Array.from({ length: 5 }, (_, i) => `<path d="M${200 + i * 60} 104 q-12 160 0 322" fill="none" stroke-width="3"/>`).join('')}
      <rect x="1040" y="420" width="260" height="60" rx="12" fill="#ffffff"/><rect x="1110" y="480" width="120" height="180" fill="#f2f6f6"/>
      <rect x="1060" y="150" width="220" height="250" rx="16" fill="#cfe8ee"/>
      <rect x="1360" y="300" width="22" height="200" fill="#9aa8ae"/><rect x="1330" y="330" width="90" height="190" rx="8" fill="#e2483c"/>`) +
      hi('M1080 170 l60 0 l-60 120z', .5) + planks(660, '#cfd8da', '#bcc6c8', 5) + (lit(t) ? glow(g, 800, 90, 420) : ''), glowDef(g)); },
    shed: t => { const g = 'g' + (++uid); return svg(`<rect width="${W}" height="${H}" fill="#7a6048"/>` + Array.from({ length: 16 }, (_, i) => `<rect x="${i * 100}" y="0" width="96" height="640" fill="#8a6c50" stroke="${INK}" stroke-width="3"/>`).join('') + OUT(`
      <rect x="160" y="466" width="780" height="42" fill="#9a6a44"/><rect x="190" y="508" width="26" height="200" fill="#6a4434"/><rect x="884" y="508" width="26" height="200" fill="#6a4434"/>
      <rect x="198" y="186" width="640" height="18" fill="#6a4c36"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${220 + i * 124}" y="204" width="18" height="${120 + (i % 2) * 44}" fill="#a8a8b0"/>`).join('')}
      <rect x="556" y="404" width="68" height="64" rx="6" fill="#ffc85a"/>`) +
      Array.from({ length: 12 }, (_, i) => `<line x1="${1000 + i * 40}" y1="120" x2="${980 + i * 46}" y2="620" stroke="#d8caa4" stroke-width="4"/>`).join('') + Array.from({ length: 10 }, (_, i) => `<line x1="990" y1="${140 + i * 48}" x2="1520" y2="${150 + i * 48}" stroke="#d8caa4" stroke-width="4"/>`).join('') +
      planks(640, '#5a4a3a', '#4a3c2e', 6) + glow(g, 590, 432, lit(t) ? 320 : 160), glowDef(g)); },
    clinic: t => svg(wallGrad('#e8f2ee', '#d4e4de', 620) + OUT(`
      ${win(1100, 126, 320, 240, t, '#b8d0c8')}
      <rect x="200" y="476" width="650" height="136" rx="14" fill="#ffffff"/><rect x="200" y="436" width="210" height="62" rx="20" fill="#ffffff"/><rect x="230" y="612" width="18" height="120" fill="#8a9a96"/><rect x="800" y="612" width="18" height="120" fill="#8a9a96"/>
      <rect x="896" y="226" width="180" height="136" rx="10" fill="#1e2a2a"/><rect x="978" y="362" width="12" height="300" fill="#8a9a96"/>
      <rect x="300" y="120" width="200" height="200" rx="10" fill="#3aa89a"/>`) +
      `<path d="M912 300 h40 l12 -40 l18 82 l14 -42 h74" stroke="#6fe0a8" stroke-width="5" fill="none"/><path d="M380 160 h40 v40 h40 v40 h-40 v40 h-40 v-40 h-40 v-40 h40z" fill="#fff" ${NS}/>` + planks(620, '#b8c8c2', '#a8b8b2', 6)),
    black: () => svg(`<rect width="${W}" height="${H}" fill="#050608"/>`)
  };

  /* ===================== sprites (320 x 600) ===================== */
  const C = {
    elias: { skin: '#e2ae86', eye: '#4a7aa0', brow: '#e8e4dc', age: 3 },
    sami: { skin: '#c8895a', eye: '#4a2e1e', brow: '#1f1a17', age: 0 },
    marco: { skin: '#eab88e', eye: '#3a6a3a', brow: '#4a3020', age: 0 },
    irene: { skin: '#f4c9a6', eye: '#3a7a6a', brow: '#7a3a22', age: 1, fem: true },
    martha: { skin: '#f0c0a0', eye: '#6a4a3a', brow: '#8a8a8a', age: 2, fem: true }
  };
  function eyes(c, expr) {
    const y = 152, L = 134, R = 186;
    if (expr === 'smile') return `<path d="M${L - 13} ${y + 4} q13 -14 26 0 M${R - 13} ${y + 4} q13 -14 26 0" fill="none" stroke-width="5"/>` + (c.fem ? `<path d="M${L - 13} ${y + 2} l-6 -4 M${R + 13} ${y + 2} l6 -4" stroke-width="3"/>` : '');
    const ry = expr === 'shock' ? 12 : 9.5;
    const one = x => `<ellipse cx="${x}" cy="${y}" rx="13" ry="${ry}" fill="#fff" stroke-width="3"/><circle cx="${x}" cy="${y + 1}" r="7.5" fill="${c.eye}" ${NS}/><circle cx="${x}" cy="${y + 1}" r="3.6" fill="#141018" ${NS}/><circle cx="${x + 3}" cy="${y - 3}" r="2.4" fill="#fff" ${NS}/>`;
    let s = one(L) + one(R);
    s += `<path d="M${L - 14} ${y - 4} q14 -${ry + 2} 28 0 M${R - 14} ${y - 4} q14 -${ry + 2} 28 0" fill="none" stroke-width="${c.fem ? 5 : 4}"/>`;
    if (c.fem) s += `<path d="M${L - 14} ${y - 5} l-7 -5 M${R + 14} ${y - 5} l7 -5" stroke-width="3"/>`;
    if (expr === 'sad') s += `<path d="M${L - 15} ${y - 6} q15 4 30 -2 M${R - 15} ${y - 8} q15 6 30 2" fill="${c.skin}" stroke="none"/>`;
    if (expr === 'angry') s += `<path d="M${L - 15} ${y - 9} l30 6 v-12 h-30z M${R - 15} ${y - 3} l30 -6 v-6 h-30z" fill="${c.skin}" stroke="none"/>`;
    return s;
  }
  function brows(c, expr) {
    const B = { neutral: 'M118 130 q16 -7 32 0 M170 130 q16 -7 32 0', smile: 'M118 126 q16 -12 32 -2 M170 124 q16 -10 32 2', sad: 'M118 134 q14 -2 30 -16 M172 118 q16 14 30 16', angry: 'M118 120 q14 6 32 18 M170 138 q16 -12 32 -18', shock: 'M118 118 q16 -14 32 -2 M170 116 q16 -12 32 2' };
    return `<path d="${B[expr] || B.neutral}" fill="none" stroke="${c.brow}" stroke-width="${8 + c.age}"/>`;
  }
  function mouth(expr, y = 210) {
    const M = {
      neutral: `<path d="M144 ${y} q16 5 32 0" fill="none" stroke-width="5"/>`,
      smile: `<path d="M134 ${y - 6} q26 30 52 0 z" fill="#8a2e2a" stroke-width="4"/><path d="M140 ${y - 4} q20 8 40 0" fill="#fff" stroke="none"/>`,
      sad: `<path d="M140 ${y + 6} q20 -14 40 0" fill="none" stroke-width="5"/>`,
      angry: `<path d="M138 ${y + 4} q22 -9 44 0" fill="none" stroke-width="6"/>`,
      shock: `<ellipse cx="160" cy="${y + 4}" rx="12" ry="15" fill="#5a1e1e" stroke-width="4"/>`
    };
    return M[expr] || M.neutral;
  }
  const faceShape = (c) => `<ellipse cx="98" cy="160" rx="12" ry="20" fill="${c.skin}"/><ellipse cx="222" cy="160" rx="12" ry="20" fill="${c.skin}"/><path d="M100 128 Q100 62 160 60 Q220 62 220 128 L217 172 Q210 230 160 244 Q110 230 103 172 Z" fill="${c.skin}"/>` +
    `<path d="M188 72 Q220 90 218 150 L214 180 Q206 226 170 240 Q200 200 196 150 Q194 104 188 72Z" fill="#000" opacity=".1" stroke="none"/>`;
  const nose = c => `<path d="M160 160 q-12 26 -4 34 q10 4 18 -2" fill="none" stroke-width="4"/>` + (c.fem ? '' : '');
  const blush = c => c.fem || c.age === 0 ? `<ellipse cx="122" cy="184" rx="14" ry="7" fill="#ff7a7a" opacity=".25" stroke="none"/><ellipse cx="198" cy="184" rx="14" ry="7" fill="#ff7a7a" opacity=".25" stroke="none"/>` : '';
  const neck = c => `<path d="M136 226 v40 q24 14 48 0 v-40z" fill="${c.skin}"/><path d="M136 236 q24 20 48 0 v12 q-24 18 -48 0z" fill="#000" opacity=".15" stroke="none"/>`;
  const arm = (side, sleeve, skin, sleeveEnd = 520) => side < 0
    ? `<path d="M74 322 Q44 380 46 ${sleeveEnd} L84 ${sleeveEnd + 2} Q88 420 100 360 Z" fill="${sleeve}"/><ellipse cx="64" cy="${sleeveEnd + 18}" rx="19" ry="23" fill="${skin}"/>`
    : `<path d="M246 322 Q276 380 274 ${sleeveEnd} L236 ${sleeveEnd + 2} Q232 420 220 360 Z" fill="${sleeve}"/><ellipse cx="256" cy="${sleeveEnd + 18}" rx="19" ry="23" fill="${skin}"/>`;
  const torso = (fill, wide = 0) => `<path d="M${68 - wide} 600 L${74 - wide} 330 Q88 262 160 252 Q232 262 ${246 + wide} 330 L${252 + wide} 600 Z" fill="${fill}"/>`;
  const torsoShade = (wide = 0) => `<path d="M200 262 Q238 280 ${246 + wide} 330 L${252 + wide} 600 L206 600 Q222 420 200 262Z" fill="#000" opacity=".14" stroke="none"/>`;

  const SPR = {
    elias: (e) => { const c = C.elias; return OUT(
      torso('#efe4c8') + `<g stroke="#cbbd98" stroke-width="6" fill="none">${[110, 140, 180, 210].map(x => `<path d="M${x} 600 q-8 -40 0 -80 q8 -40 0 -80 q-8 -40 0 -80"/>`).join('')}</g>` +
      `<path d="M60 600 L66 322 Q74 266 128 256 L148 300 L138 600 Z" fill="#f0b832"/><path d="M260 600 L254 322 Q246 266 192 256 L172 300 L182 600 Z" fill="#f0b832"/>` +
      arm(-1, '#f0b832', c.skin, 516) + arm(1, '#e2a822', c.skin, 516) + torsoShade() +
      `<path d="M118 262 Q160 294 202 262 Q198 236 160 242 Q122 236 118 262Z" fill="#e2d6b8"/>` + neck(c) +
      `<path d="M96 168 q-6 -40 10 -56 M224 168 q6 -40 -10 -56" fill="#f2efe8" stroke-width="4"/>` + faceShape(c) +
      `<path d="M112 118 q48 -14 96 0" fill="none" stroke="#c0906a" stroke-width="3"/><path d="M110 166 l-10 4 M210 166 l10 4 M112 174 l-10 8 M208 174 l10 8" stroke="#c0906a" stroke-width="3"/>` +
      eyes(c, e) + brows(c, e) + nose(c) +
      `<path d="M104 172 Q100 256 160 292 Q220 256 216 172 Q204 210 182 214 Q160 204 138 214 Q116 210 104 172Z" fill="#f2efe8"/><path d="M126 204 Q160 186 194 204 Q160 216 126 204Z" fill="#e6e2da"/>` +
      mouth(e, 218) +
      `<path d="M96 124 Q96 34 160 30 Q224 34 224 124 Z" fill="#2e5486"/><rect x="92" y="104" width="136" height="28" rx="12" fill="#244470"/><path d="M118 104 q42 -40 84 0" fill="none" stroke="#4a72a8" stroke-width="4"/>`, 4); },
    sami: (e) => { const c = C.sami; return OUT(
      torso('#f6f2ea') + arm(-1, '#f6f2ea', c.skin, 420) + arm(1, '#f6f2ea', c.skin, 420) +
      `<path d="M46 420 Q42 480 50 520 L80 524 Q84 470 84 424Z" fill="${c.skin}"/><path d="M274 420 Q278 480 270 520 L240 524 Q236 470 236 424Z" fill="${c.skin}"/>` +
      `<path d="M104 600 L108 330 Q160 316 212 330 L216 600Z" fill="#3f9a6a"/><path d="M108 330 L120 262 M212 330 L200 262" fill="none" stroke="#3f9a6a" stroke-width="8"/><rect x="132" y="400" width="56" height="44" rx="6" fill="#36885c"/><rect x="170" y="384" width="6" height="40" fill="#2a64c0"/>` + torsoShade() +
      neck(c) + faceShape(c) + eyes(c, e) + brows(c, e) + nose(c) +
      `<path d="M102 172 Q106 240 160 254 Q214 240 218 172 Q206 218 160 226 Q114 218 102 172Z" fill="#2a2320" opacity=".92"/><path d="M134 204 Q160 194 186 204 Q160 210 134 204Z" fill="#2a2320"/>` + mouth(e, 214) +
      `<path d="M100 120 Q98 56 160 52 Q222 56 220 120 Q214 92 196 84 Q160 98 124 84 Q106 92 100 120Z" fill="#1f1a17"/>`, 4); },
    marco: (e) => { const c = C.marco; return OUT(
      torso('#2f5a8a') + `<g stroke="#e8e0cc" stroke-width="6" opacity=".7">${[96, 128, 160, 192, 224].map(x => `<line x1="${x}" y1="270" x2="${x}" y2="600"/>`).join('')}</g>` +
      arm(-1, '#2f5a8a', c.skin, 430) + arm(1, '#2f5a8a', c.skin, 430) +
      `<path d="M46 428 Q42 482 50 520 L80 524 Q84 470 84 432Z" fill="${c.skin}"/><path d="M274 428 Q278 482 270 520 L240 524 Q236 470 236 432Z" fill="${c.skin}"/>` +
      `<path d="M102 600 L106 360 Q160 346 214 360 L218 600Z" fill="#1f1f24"/><path d="M200 262 Q250 270 252 340 L232 346 Q226 290 196 282Z" fill="#fff"/><path d="M214 268 l14 70" stroke="#d2483c" stroke-width="6"/>` + torsoShade() +
      neck(c) + faceShape(c) + eyes(c, e) + brows(c, e) + nose(c) + blush(c) +
      `<path d="M126 200 Q144 188 160 198 Q176 188 194 200 Q198 212 186 210 Q172 202 160 208 Q148 202 134 210 Q122 212 126 200Z" fill="#4a3020"/>` + mouth(e, 218) +
      Array.from({ length: 10 }, (_, i) => `<circle cx="${98 + i * 13.5}" cy="${88 + Math.sin(i * 1.3) * 10}" r="22" fill="#5a3a24"/>`).join('') + `<circle cx="100" cy="128" r="18" fill="#5a3a24"/><circle cx="220" cy="128" r="18" fill="#5a3a24"/>`, 4); },
    irene: (e) => { const c = C.irene; return OUT(
      `<path d="M96 200 Q86 80 160 66 Q234 80 224 200 Q222 120 160 108 Q98 120 96 200Z" fill="#8a3a22"/><circle cx="160" cy="54" r="34" fill="#8a3a22"/>` +
      torso('#3aa89a') + `<path d="M60 600 L66 322 Q76 264 130 256 L160 330 L146 600 Z" fill="#fbfbf9"/><path d="M260 600 L254 322 Q244 264 190 256 L160 330 L174 600 Z" fill="#fbfbf9"/>` +
      arm(-1, '#fbfbf9', c.skin, 516) + arm(1, '#f0f0ec', c.skin, 516) + torsoShade() +
      `<path d="M128 262 L160 312 L192 262" fill="#3aa89a"/><path d="M118 270 q-10 70 30 92 M202 270 q10 70 -30 92" fill="none" stroke="#5a5a64" stroke-width="5"/><circle cx="148" cy="364" r="10" fill="#9aa0a8"/>` +
      neck(c) + faceShape(c) + eyes(c, e) + brows(c, e) + nose(c) + blush(c) + mouth(e, 212) +
      `<circle cx="134" cy="152" r="21" fill="none" stroke-width="5"/><circle cx="186" cy="152" r="21" fill="none" stroke-width="5"/><line x1="155" y1="150" x2="165" y2="150" stroke-width="5"/>` +
      `<path d="M100 126 Q104 66 160 64 Q216 66 220 126 Q196 92 160 90 Q124 92 100 126Z" fill="#9a4428"/><circle cx="98" cy="186" r="5" fill="#e2c07a"/><circle cx="222" cy="186" r="5" fill="#e2c07a"/>`, 4); },
    martha: (e) => { const c = C.martha; return OUT(
      torso('#e88aa8', 18) + arm(-1, '#e88aa8', '#ffd23a', 506) + arm(1, '#d6789a', '#ffd23a', 506) +
      `<path d="M96 600 L100 340 Q160 324 220 340 L224 600Z" fill="#fff8ee"/>${[[120, 380], [180, 400], [140, 460], [196, 500], [118, 540], [170, 560]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#e2483c" stroke-width="2"/>`).join('')}` + torsoShade(18) +
      neck(c) + `<circle cx="100" cy="150" r="20" fill="#bdbdbd"/><circle cx="220" cy="150" r="20" fill="#bdbdbd"/>` + faceShape(c) +
      `<path d="M112 176 q8 8 6 18 M208 176 q-8 8 -6 18" fill="none" stroke="#c89070" stroke-width="3"/>` +
      eyes(c, e) + brows(c, e) + nose(c) + `<ellipse cx="120" cy="186" rx="16" ry="8" fill="#ff6a6a" opacity=".35" stroke="none"/><ellipse cx="200" cy="186" rx="16" ry="8" fill="#ff6a6a" opacity=".35" stroke="none"/>` + mouth(e, 212) +
      `<path d="M94 136 Q88 50 160 44 Q232 50 226 136 Q214 100 160 96 Q106 100 94 136Z" fill="#4a8ad0"/>${[[120, 70], [160, 58], [200, 72], [140, 92], [184, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#ffd23a" stroke-width="2"/>`).join('')}<path d="M210 110 l34 -6 l-8 22z" fill="#4a8ad0"/>`, 4); }
  };
  function portrait(id, expr = 'neutral') {
    const f = SPR[id]; if (!f) return '';
    return `<svg viewBox="0 0 320 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">${f(expr)}</svg>`;
  }

  /* ===================== town map (top-down, illustrated) ===================== */
  const PLACES = {
    station: [9, 15], motel: [31, 21], clinic: [84, 20], grocery: [40, 35], street: [52, 47], cafe: [64, 35],
    margaret: [28, 44], elias_ext: [13, 57], hotel: [78, 55], harbor: [46, 77], lighthouse: [91, 75]
  };
  function house(x, y, w, h, wall, roof, t, extra = '') {
    return OUT(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wall}"/><polygon points="${x - 10},${y + 2} ${x + w / 2},${y - h * .55} ${x + w + 10},${y + 2}" fill="${roof}"/>
      <rect x="${x + w / 2 - 12}" y="${y + h - 34}" width="24" height="34" fill="#5a3a2a"/>
      <rect x="${x + 10}" y="${y + 14}" width="22" height="18" fill="${lit(t) ? '#ffd27a' : '#bfe2f2'}"/><rect x="${x + w - 32}" y="${y + 14}" width="22" height="18" fill="${lit(t) ? '#ffd27a' : '#bfe2f2'}"/>${extra}`, 4) + shade(`M${x + w * .65} ${y} h${w * .35} v${h} h-${w * .35}z`, .14);
  }
  function map(s) {
    const t = s && typeof slotName === 'function' ? slotName() : 'noon';
    const px = k => [PLACES[k][0] * 16, PLACES[k][1] * 9];
    let o = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="900" fill="#a9c98a"/>
      ${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 397) % 1600}" cy="${(i * 211) % 600}" r="${10 + (i % 4) * 4}" fill="#94b878"/>`).join('')}
      <path d="M0 640 q300 -54 560 0 t600 -16 t440 26 v250 h-1600z" fill="#ead9a6"/>
      <path d="M0 690 q300 -54 560 0 t600 -16 t440 26 v200 h-1600z" fill="${SEA[t]}"/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 170} ${760 + (i % 3) * 40} q30 -12 60 0 t60 0" stroke="#fff" stroke-width="4" fill="none" opacity=".4"/>`).join('')}
      <g stroke="#e8e2d2" stroke-linecap="round" fill="none"><path d="M60 420 H1500" stroke-width="54"/><path d="M830 120 V660" stroke-width="46"/><path d="M200 420 V200 M1340 420 V180 M300 420 V560 M1250 420 V520 M740 660 H1500" stroke-width="34"/></g>
      <g stroke="#fff" stroke-dasharray="26 22" stroke-width="4" fill="none" opacity=".8"><path d="M60 420 H1500"/><path d="M830 120 V660"/></g>
      <path d="M40 150 H560" stroke="#4a4a52" stroke-width="12"/><path d="M40 150 H560" stroke="#c8b48a" stroke-width="4" stroke-dasharray="14 14"/>`;
    const [stx, sty] = px('station'); o += house(stx - 70, sty - 20, 140, 70, '#c24a48', '#5a3a3a', t);
    const [mox, moy] = px('motel'); o += house(mox - 60, moy - 10, 120, 70, '#8a6aa8', '#4a3a5a', t, `<rect x="${mox - 40}" y="${moy - 30}" width="80" height="16" fill="#ff4f6a"/>`);
    const [clx, cly] = px('clinic'); o += house(clx - 70, cly - 10, 140, 76, '#f4f8f6', '#3aa89a', t, `<rect x="${clx - 8}" y="${cly + 8}" width="16" height="40" fill="#3aa89a" stroke="none"/><rect x="${clx - 20}" y="${cly + 20}" width="40" height="16" fill="#3aa89a" stroke="none"/>`);
    const [grx, gry] = px('grocery'); o += house(grx - 60, gry - 10, 120, 70, '#e3cfa8', '#3f8a62', t);
    const [cax, cay] = px('cafe'); o += house(cax - 60, cay - 10, 120, 70, '#d9b49a', '#d2483c', t);
    const [stx2, sty2] = px('street'); o += OUT(`<circle cx="${stx2}" cy="${sty2 - 6}" r="40" fill="#cfd8dc"/><circle cx="${stx2}" cy="${sty2 - 6}" r="22" fill="#6ab0e0"/>`, 4);
    const [mgx, mgy] = px('margaret'); o += house(mgx - 60, mgy - 10, 120, 72, '#f2e6c8', '#6a4a7a', t);
    const [elx, ely] = px('elias_ext'); o += house(elx - 64, ely - 10, 128, 70, '#d8cfbd', '#4a5a78', t, `<rect x="${elx - 10}" y="${ely + 26}" width="20" height="34" fill="#3a78b8"/>`);
    const [hox, hoy] = px('hotel'); o += house(hox - 110, hoy - 60, 220, 120, '#f2ead6', '#2a2a36', t, Array.from({ length: 8 }, (_, i) => `<rect x="${hox - 96 + (i % 4) * 52}" y="${hoy - 40 + Math.floor(i / 4) * 36}" width="30" height="22" fill="${lit(t) ? '#ffd27a' : '#bfe2f2'}"/>`).join(''));
    const [hax, hay] = px('harbor'); o += OUT(`<rect x="${hax - 150}" y="${hay - 10}" width="300" height="26" fill="#9a6a44"/><path d="M${hax - 120} ${hay + 30} q50 20 100 0 l-10 22 h-80z" fill="#2f78b0"/><path d="M${hax + 40} ${hay + 34} q40 16 80 0 l-8 18 h-64z" fill="#e2483c"/>`, 4) + house(hax + 120, hay - 70, 100, 56, '#8a6a50', '#4a3a32', t);
    const [lhx, lhy] = px('lighthouse'); o += OUT(`<path d="M${lhx - 26} ${lhy + 40} L${lhx - 16} ${lhy - 110} H${lhx + 16} L${lhx + 26} ${lhy + 40}Z" fill="#f4f2ec"/><path d="M${lhx - 22} ${lhy - 10} H${lhx + 22} L${lhx + 20} ${lhy - 40} H${lhx - 20}Z" fill="#d2483c"/><rect x="${lhx - 20}" y="${lhy - 140}" width="40" height="30" fill="${lit(t) ? '#fff2a8' : '#cfe8f0'}"/><path d="M${lhx - 26} ${lhy - 140} L${lhx} ${lhy - 166} L${lhx + 26} ${lhy - 140}Z" fill="#2a2a36"/>`, 4) + (t === 'night' ? `<path d="M${lhx} ${lhy - 126} L${lhx - 400} ${lhy - 220} L${lhx - 400} ${lhy - 60}Z" fill="#fff6c0" opacity=".18"/>` : '');
    if (t === 'night') o += `<rect width="1600" height="900" fill="#0a1030" opacity=".35"/>`; else if (t === 'evening') o += `<rect width="1600" height="900" fill="#ff7a3a" opacity=".1"/>`;
    o += `<text x="800" y="880" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="600" font-size="40" letter-spacing="14" fill="#fff" opacity=".9">SALTMERE</text></svg>`;
    return o;
  }

  /* ===================== UI icons ===================== */
  const ICON = {
    wait: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 21h12M7 3c0 5 10 7 10 9s-10 4-10 9M17 3c0 5-10 7-10 9s10 4 10 9"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10 18h4"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="#ffc25a" stroke="#ffc25a" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="#d8dcf2"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5z"/></svg>',
    dusk: '<svg viewBox="0 0 24 24" fill="#ff9a5c" stroke="#ff9a5c" stroke-width="2" stroke-linecap="round"><path d="M5 17a7 7 0 0 1 14 0z"/><path d="M2 20h20M12 6v2.5M4.5 9.5l1.7 1.7M19.5 9.5l-1.7 1.7"/></svg>'
  };

  function appIcon() {
    return `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><rect width="1024" height="1024" fill="#16233a"/>
      <circle cx="770" cy="230" r="70" fill="#f6efd6"/><circle cx="745" cy="210" r="14" fill="#e2d9bc"/>
      <path d="M0 800 q260 -50 512 0 t512 0 v224 h-1024z" fill="#0f1a38"/>
      ${OUT(`<rect x="262" y="430" width="500" height="380" fill="#d8cfbd"/><polygon points="226,440 512,236 798,440" fill="#4a5a78"/><rect x="430" y="560" width="164" height="250" rx="10" fill="#2a4a78"/><rect x="300" y="500" width="100" height="90" fill="#ffd27a"/><rect x="624" y="500" width="100" height="90" fill="#ffd27a"/>`, 14)}
      <path d="M594 560 L680 590 L680 840 L594 810Z" fill="#ffd27a" stroke="${INK}" stroke-width="10"/><path d="M594 810 L430 1024 H760 L680 840Z" fill="#ffd27a" opacity=".35"/></svg>`;
  }
  function tint(bg, t) {
    const interior = !['station', 'street', 'harbor', 'elias_ext', 'dock', 'delivery'].includes(bg);
    if (t === 'night') return interior ? 'rgba(10,12,40,.36)' : 'rgba(6,8,30,.22)';
    if (t === 'evening') return 'rgba(255,110,60,.12)';
    if (t === 'morning') return 'rgba(255,215,170,.08)';
    if (t === 'afternoon') return 'rgba(255,200,120,.06)';
    return 'transparent';
  }
  return { bg: (id, t) => (BG[id] || BG.black)(t), portrait, map, tint, ICON, PLACES, appIcon, BGS: BG,
    H: { svg, OUT, win, planks, wallGrad, glowDef, glow, skyRect, shade, hi, hangLamp, streetLamp, lit, INK, SEA, WIN, NS, nextId: () => ++uid } };
})();
