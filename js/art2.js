/* =====================================================================
   Chapter 2 backgrounds: Leo's boathouse, the loft, the dock, the tiny
   bathroom, and Frank's garage. Same outlined, shaded style as art.js.
   ===================================================================== */
'use strict';
(function () {
  const { svg, OUT, win, planks, wallGrad, glowDef, glow, skyRect, shade, hi, hangLamp, streetLamp, lit, INK, SEA, NS, nextId } = ART.H;
  const W = 1600, H = 900;
  const bulbs = (y, t) => Array.from({ length: 14 }, (_, i) => `<circle cx="${60 + i * 110}" cy="${y + Math.sin(i * 0.9) * 18}" r="9" fill="${lit(t) ? ['#ffd25a', '#ff8a7a', '#8ad0ff', '#a8f0a0'][i % 4] : '#d8d0c0'}" stroke="${INK}" stroke-width="3"/>`).join('') + `<path d="M0 ${y} ${Array.from({ length: 15 }, (_, i) => `L${i * 110 + 60} ${y + Math.sin(i * 0.9) * 18}`).join(' ')}" stroke="${INK}" stroke-width="3" fill="none"/>`;
  Object.assign(ART.BGS, {
    boathouse: t => { const g = 'g' + nextId(); return svg(wallGrad('#8a6448', '#6e4e38', 640) +
      Array.from({ length: 17 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="640" stroke="#5e4230" stroke-width="4"/>`).join('') + OUT(`
      <rect x="560" y="70" width="560" height="300" rx="10" fill="#2f5a7a"/>
      <path d="M600 330 q120 -160 240 -40 q90 -120 240 -10 v50 h-480z" fill="#3f8ab0"/>
      <path d="M640 150 l30 18 l30 -18 M760 120 l26 16 l26 -16 M900 170 l30 18 l30 -18 M1000 110 l24 14 l24 -14" stroke-width="7" fill="none"/>
      <circle cx="1040" cy="150" r="40" fill="#ffd25a"/>
      <rect x="80" y="430" width="520" height="150" rx="30" fill="#e2783c"/><rect x="60" y="380" width="80" height="210" rx="26" fill="#d2682c"/><rect x="540" y="380" width="80" height="210" rx="26" fill="#d2682c"/><rect x="120" y="400" width="440" height="80" rx="24" fill="#ea8a4a"/>
      <rect x="160" y="580" width="20" height="50" fill="#5a3a26"/><rect x="500" y="580" width="20" height="50" fill="#5a3a26"/>
      <rect x="700" y="470" width="300" height="150" fill="#5a4030"/><rect x="730" y="350" width="240" height="140" rx="8" fill="#1a1a22"/><rect x="745" y="365" width="210" height="110" fill="${lit(t) ? '#4a7ad0' : '#2a3a5a'}"/><rect x="770" y="560" width="110" height="36" rx="8" fill="#222"/>
      <path d="M1180 640 L1250 260 L1290 260 L1220 640Z" fill="#9a7a5a"/><path d="M1300 640 L1250 260" fill="none"/><rect x="1196" y="300" width="130" height="190" fill="#fbf7ec"/><path d="M1210 420 q30 -60 60 -10 q20 -30 40 0" stroke="#d23f34" stroke-width="6" fill="none"/><circle cx="1290" cy="340" r="16" fill="#ffd25a"/>
      <rect x="1400" y="120" width="26" height="520" fill="#8a6a4a"/><rect x="1500" y="120" width="26" height="520" fill="#8a6a4a"/>${Array.from({ length: 6 }, (_, i) => `<rect x="1400" y="${170 + i * 80}" width="126" height="16" fill="#8a6a4a"/>`).join('')}
      <rect x="1060" y="560" width="70" height="80" rx="6" fill="#4a7ad0"/><rect x="1090" y="530" width="54" height="110" rx="6" fill="#e2483c"/>`) +
      planks(640, '#6a4c36', '#58402c') + bulbs(40, t) + (lit(t) ? glow(g, 800, 60, 520) : ''), glowDef(g)); },
    loft: t => { const g = 'g' + nextId(); return svg(`<rect width="${W}" height="${H}" fill="#6a4c38"/>` + OUT(`
      <path d="M0 0 L800 0 L0 520Z" fill="#4e3626"/><path d="M1600 0 L800 0 L1600 520Z" fill="#4e3626"/>
      ${[200, 400, 600].map(x => `<path d="M${x} 0 L0 ${520 - x * 0.65}" stroke-width="10" fill="none" stroke="#3a281c"/>`).join('')}
      <circle cx="800" cy="240" r="110" fill="#5a3e2c"/><circle cx="800" cy="240" r="86" fill="${({ morning: '#ffe2b0', noon: '#cfeaff', afternoon: '#ffe6c4', evening: '#ff9a6a', night: '#1c2a58' })[t]}"/><path d="M714 240 h172 M800 154 v172" stroke-width="8"/>
      <rect x="220" y="560" width="620" height="120" rx="20" fill="#e8e0d0"/><rect x="250" y="530" width="180" height="60" rx="22" fill="#f6f0e4"/><path d="M430 560 q200 -30 410 0 v110 h-410z" fill="#4a6aa0"/>
      ${Array.from({ length: 6 }, (_, i) => `<rect x="${980 + (i % 2) * 12}" y="${620 - i * 26}" width="200" height="24" rx="3" fill="${['#e2483c', '#3a8ad0', '#f2c445', '#3aa86a', '#9a5ad0', '#ff8a3a'][i]}"/>`).join('')}
      <rect x="1260" y="520" width="200" height="160" fill="#7a5a40"/><rect x="1300" y="470" width="24" height="60" fill="#2a2a32"/><path d="M1290 470 l50 -30 l20 20z" fill="#ffd25a"/>
      <path d="M100 700 q40 -40 120 -20 q30 30 -10 40z" fill="#3a5a8a"/><path d="M880 690 q30 -30 90 -10 q10 20 -20 30z" fill="#d9a234"/>`) +
      (lit(t) ? glow(g, 1340, 470, 280) : '') + planks(680, '#5a4030', '#4a3424', 4), glowDef(g)); },
    bh_bath: t => svg(wallGrad('#cfe0d8', '#b8ccc4', 650) + OUT(`
      <rect x="160" y="80" width="420" height="580" fill="#d8e6ea"/><path d="M180 100 h380 v540 h-380z" fill="#e8f2f4"/><circle cx="370" cy="140" r="26" fill="#9aa8ae"/><path d="M370 166 v30" stroke-width="5"/>
      <rect x="900" y="160" width="300" height="240" rx="12" fill="#cfe8ee"/>${[[930, 190, '#ff8a7a'], [1130, 200, '#8ad0ff'], [960, 350, '#ffd25a'], [1150, 340, '#a8f0a0']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="20" fill="${c}"/>`).join('')}
      <rect x="920" y="440" width="260" height="60" rx="12" fill="#fff"/><rect x="990" y="500" width="120" height="160" fill="#f2f6f6"/>
      <rect x="1320" y="300" width="100" height="220" rx="8" fill="#3a8ad0"/>`) + hi('M920 180 l60 0 l-60 110z', .5) + planks(660, '#a8b8b2', '#98a8a2', 4)),
    dock: t => { const g = 'g' + nextId(); return svg(skyRect(t) + `<rect x="0" y="400" width="${W}" height="500" fill="${SEA[t]}"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 200 - 40} ${460 + (i % 3) * 70} q40 -16 80 0 t80 0" stroke="#fff" stroke-width="5" fill="none" opacity=".35"/>`).join('') + OUT(`
      <rect x="0" y="560" width="1100" height="60" fill="#9a6a44"/>${Array.from({ length: 11 }, (_, i) => `<rect x="${i * 100 + 30}" y="620" width="20" height="280" fill="#6a4434"/>`).join('')}
      <rect x="1100" y="160" width="500" height="480" fill="#8a6a50"/><polygon points="1080,162 1350,60 1620,162" fill="#4a3a32"/><rect x="1140" y="360" width="150" height="210" fill="#3a2a22"/>
      <rect x="460" y="480" width="90" height="80" fill="#b08a5a"/><rect x="560" y="400" width="18" height="160" fill="#7a5a40"/><rect x="530" y="380" width="120" height="90" fill="#fbf7ec"/>`) +
      `<path d="M545 440 q20 -30 40 0 q14 -14 28 0" stroke="#3a8ad0" stroke-width="5" fill="none"/>` + streetLamp(900, 400, t, g) + shade('M1480 160 h120 v480 h-120z', .16), glowDef(g)); },
    garage: t => { const g = 'g' + nextId(); return svg(wallGrad('#c8ccd2', '#a8aeb6', 640) + OUT(`
      <rect x="0" y="0" width="${W}" height="70" fill="#2f4a72"/>
      <rect x="1180" y="140" width="340" height="220" fill="#7a8088"/><rect x="1200" y="160" width="300" height="180" fill="${lit(t) ? '#ffe2a0' : '#cfe0ea'}"/>
      <rect x="80" y="140" width="460" height="300" fill="#8a8e96"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${100 + (i % 5) * 86}" y="${170 + Math.floor(i / 5) * 120}" width="60" height="${40 + (i % 3) * 20}" rx="4" fill="${['#e2483c', '#2a2a32', '#f2c445', '#3a8ad0', '#9aa0a8'][i % 5]}"/>`).join('')}
      <rect x="560" y="560" width="560" height="30" fill="#e6c440"/><rect x="600" y="400" width="30" height="160" fill="#5a5e66"/><rect x="1050" y="400" width="30" height="160" fill="#5a5e66"/>
      <path d="M600 400 q20 -110 180 -120 h200 q100 10 120 120z" fill="#c23a34"/><rect x="660" y="300" width="300" height="70" rx="10" fill="#9fd0ea"/><circle cx="680" cy="420" r="44" fill="#2a2a32"/><circle cx="1010" cy="420" r="44" fill="#2a2a32"/><circle cx="680" cy="420" r="18" fill="#9aa0a8"/><circle cx="1010" cy="420" r="18" fill="#9aa0a8"/>
      ${[0, 1, 2].map(i => `<circle cx="${1260 + i * 30}" cy="${600 - i * 20}" r="44" fill="#2a2a32"/><circle cx="${1260 + i * 30}" cy="${600 - i * 20}" r="20" fill="#5a5e66"/>`).join('')}`) +
      `<text x="800" y="50" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="600" font-size="40" letter-spacing="8" fill="#fff4dc">FRANK'S MOTORS</text>` +
      planks(640, '#7a7e86', '#6a6e76', 5) + `<path d="M700 700 q60 -20 120 0 q-60 24 -120 0z" fill="#141418" opacity=".35"/>` + hangLamp(800, 120, t, g), glowDef(g)); }
  });
})();
