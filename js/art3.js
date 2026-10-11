/* =====================================================================
   v4 backgrounds: a small prop-based room builder, then Margaret's house,
   the lighthouse, the Grand Hotel, Sami's attic and the new town places.
   Same outlined, cel-shaded style as art.js.
   ===================================================================== */
'use strict';
(function () {
  const { svg, OUT, win, planks, wallGrad, glowDef, glow, skyRect, shade, hi, hangLamp, streetLamp, lit, INK, SEA, WIN, NS, nextId } = ART.H;
  const W = 1600, H = 900;
  const id = () => 'a' + nextId();

  /* ---------- wall & floor ---------- */
  const paper = (kind, c, y = 640) => {
    if (kind === 'stripes') return Array.from({ length: 20 }, (_, i) => `<rect x="${i * 80}" y="0" width="34" height="${y}" fill="${c}" opacity=".35"/>`).join('');
    if (kind === 'dots') return Array.from({ length: 120 }, (_, i) => `<circle cx="${(i % 15) * 110 + ((i / 15 | 0) % 2) * 55 + 30}" cy="${(i / 15 | 0) * 80 + 40}" r="7" fill="${c}" opacity=".45"/>`).join('').replace(/cy="(\d+)"/g, (m, v) => (+v > y - 20 ? 'cy="-99"' : m));
    if (kind === 'wains') return `<rect x="0" y="${y - 220}" width="${W}" height="220" fill="${c}"/><rect x="0" y="${y - 232}" width="${W}" height="16" fill="${c}" stroke="${INK}" stroke-width="4"/>` + Array.from({ length: 10 }, (_, i) => `<rect x="${i * 160 + 20}" y="${y - 190}" width="120" height="150" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="4"/>`).join('');
    if (kind === 'stone') return Array.from({ length: 48 }, (_, i) => `<rect x="${(i % 8) * 200 + ((i / 8 | 0) % 2) * 100 - 50}" y="${(i / 8 | 0) * 110}" width="196" height="106" rx="14" fill="${c}" opacity=".35" stroke="#000" stroke-opacity=".12" stroke-width="4"/>`).join('');
    if (kind === 'tiles') return Array.from({ length: 160 }, (_, i) => `<rect x="${(i % 20) * 80}" y="${(i / 20 | 0) * 80}" width="80" height="80" fill="${i % 2 ? c : 'none'}" opacity=".25" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`).join('');
    if (kind === 'planks') return Array.from({ length: 17 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="${y}" stroke="${c}" stroke-width="4"/>`).join('');
    return '';
  };
  const room = (o, t, inner, after = '') => {
    const g = id(), y = o.floorY || 640;
    return svg(wallGrad(o.wall[0], o.wall[1], y) + paper(o.paper, o.pc || '#fff', y) + (o.back ? OUT(o.back) : '') +
      planks(y, o.floor[0], o.floor[1], o.fn || 6) + OUT(inner) + after +
      (o.lamp ? hangLamp(o.lamp, 110, t, g) : '') + (o.lampAt && lit(t) ? glow(g, o.lampAt[0], o.lampAt[1], o.lampAt[2] || 300) : '') +
      shade(`M0 0 h${W} v40 h-${W}z`, .12) + shade(`M${W - 120} 0 h120 v${y} h-120z`, .08), glowDef(g));
  };

  /* ---------- props (drawn inside OUT) ---------- */
  const P = {
    door: (x, y, w = 150, h = 290, c = '#7a5236') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/><rect x="${x + 18}" y="${y + 20}" width="${w - 36}" height="${h * .4}" fill="none" stroke-width="4"/><rect x="${x + 18}" y="${y + h * .5}" width="${w - 36}" height="${h * .42}" fill="none" stroke-width="4"/><circle cx="${x + w - 24}" cy="${y + h * .5}" r="8" fill="#e2c07a"/>`,
    frame: (x, y, w, h, c = '#cfe2ea', inner = '') => `<rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" fill="#8a6a40"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>${inner}`,
    portrait: (x, y, w, h, skin = '#f0c8a8', hair = '#5a3a2a', bg = '#a8c8d8') => P.frame(x, y, w, h, bg, `<path d="M${x + w * .2} ${y + h} q${w * .3} -${h * .45} ${w * .6} 0z" fill="#3a5a8a"/><circle cx="${x + w / 2}" cy="${y + h * .42}" r="${w * .2}" fill="${skin}"/><path d="M${x + w * .3} ${y + h * .38} q${w * .2} -${h * .3} ${w * .4} 0" fill="${hair}"/>`),
    shelf: (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="16" fill="#8a6440"/>` + Array.from({ length: Math.floor(w / 26) }, (_, i) => `<rect x="${x + 6 + i * 26}" y="${y - 50 - (i * 7) % 20}" width="20" height="${50 + (i * 7) % 20}" fill="${['#c23a34', '#3a6a9a', '#e2b030', '#3a8a5a', '#7a4a8a', '#e27a3a'][i % 6]}"/>`).join(''),
    bookcase: (x, y, w = 260, h = 380) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#7a5236"/>` + [0, 1, 2, 3].map(r => `<rect x="${x + 14}" y="${y + 14 + r * (h - 20) / 4}" width="${w - 28}" height="${(h - 20) / 4 - 14}" fill="#4a3020"/>` + Array.from({ length: Math.floor((w - 40) / 22) }, (_, i) => `<rect x="${x + 20 + i * 22}" y="${y + 24 + r * (h - 20) / 4 + (i * 5 + r * 3) % 14}" width="18" height="${(h - 20) / 4 - 34 - (i * 5 + r * 3) % 14}" fill="${['#c23a34', '#3a6a9a', '#e2b030', '#3a8a5a', '#efe6d4', '#7a4a8a'][(i + r) % 6]}" stroke-width="2.5"/>`).join('')).join(''),
    bed: (x, y, w = 520, sheet = '#f2eee4', blanket = '#4a6aa0', made = true) => `<rect x="${x}" y="${y - 120}" width="40" height="230" rx="8" fill="#7a5236"/><rect x="${x + w - 30}" y="${y - 40}" width="30" height="150" rx="8" fill="#7a5236"/><rect x="${x + 20}" y="${y}" width="${w - 30}" height="90" rx="14" fill="${sheet}"/><rect x="${x + 50}" y="${y - 30}" width="150" height="50" rx="20" fill="#fbf8f0"/>` + (made ? `<path d="M${x + 210} ${y - 6} h${w - 230} v96 h-${w - 230}z" fill="${blanket}"/><path d="M${x + 210} ${y + 20} h${w - 230}" stroke="#fff" stroke-opacity=".4" stroke-width="6"/>` : `<path d="M${x + 180} ${y + 10} q${(w - 200) / 2} -50 ${w - 200} 20 v60 h-${w - 200}z" fill="${blanket}"/>`),
    table: (x, y, w = 360, c = '#9a6a44') => `<rect x="${x}" y="${y}" width="${w}" height="24" rx="4" fill="${c}"/><rect x="${x + 20}" y="${y + 24}" width="18" height="${640 - y - 24 + 20}" fill="${c}"/><rect x="${x + w - 38}" y="${y + 24}" width="18" height="${640 - y - 24 + 20}" fill="${c}"/>`,
    cloth: (x, y, w, c = '#f6f2ea') => `<path d="M${x - 10} ${y - 2} h${w + 20} l-6 60 h-${w + 8}z" fill="${c}"/>`,
    plate: (x, y) => `<ellipse cx="${x}" cy="${y}" rx="34" ry="10" fill="#fbfbf7"/><ellipse cx="${x}" cy="${y - 2}" rx="18" ry="5" fill="#e8e0d0"/>`,
    chair: (x, y, c = '#8a5a3a', back = 'l') => `<rect x="${x}" y="${y}" width="80" height="16" fill="${c}"/><rect x="${back === 'l' ? x : x + 66}" y="${y - 110}" width="14" height="${110 + 76}" fill="${c}"/><rect x="${back === 'l' ? x + 66 : x}" y="${y + 16}" width="14" height="60" fill="${c}"/>`,
    sofa: (x, y, w = 460, c = '#7a5a8a') => `<rect x="${x}" y="${y - 100}" width="${w}" height="110" rx="26" fill="${c}"/><rect x="${x - 20}" y="${y - 40}" width="60" height="120" rx="20" fill="${c}"/><rect x="${x + w - 40}" y="${y - 40}" width="60" height="120" rx="20" fill="${c}"/><rect x="${x + 30}" y="${y}" width="${w - 60}" height="56" rx="14" fill="${c}"/><path d="M${x + w / 2} ${y + 4} v50" stroke-width="3"/>`,
    armchair: (x, y, c = '#8a4a3a') => `<rect x="${x}" y="${y - 120}" width="180" height="140" rx="30" fill="${c}"/><rect x="${x - 16}" y="${y - 40}" width="50" height="110" rx="18" fill="${c}"/><rect x="${x + 146}" y="${y - 40}" width="50" height="110" rx="18" fill="${c}"/><rect x="${x + 24}" y="${y}" width="132" height="50" rx="12" fill="${c}"/>`,
    stove: (x, y = 450) => `<rect x="${x}" y="${y}" width="200" height="${640 - y + 10}" fill="#e8e4dc"/><rect x="${x + 24}" y="${y + 60}" width="152" height="100" rx="6" fill="#2a2a32"/><rect x="${x}" y="${y - 12}" width="200" height="16" fill="#3a3a42"/>` + [x + 50, x + 150].map(cx => `<ellipse cx="${cx}" cy="${y - 14}" rx="34" ry="8" fill="#2a2a32"/>`).join('') + [0, 1, 2, 3].map(i => `<circle cx="${x + 40 + i * 40}" cy="${y + 30}" r="8" fill="#9aa0a8"/>`).join(''),
    pot: (x, y, steam) => `<rect x="${x - 50}" y="${y - 50}" width="100" height="56" rx="10" fill="#9aa0a8"/><rect x="${x - 66}" y="${y - 40}" width="20" height="10" rx="4" fill="#5a5e66"/><rect x="${x + 46}" y="${y - 40}" width="20" height="10" rx="4" fill="#5a5e66"/>` + (steam ? `<path d="M${x - 20} ${y - 60} q-14 -30 4 -60 M${x + 14} ${y - 60} q14 -30 -4 -60" stroke="#fff" stroke-opacity=".7" stroke-width="6" fill="none"/>` : ''),
    fridge: (x, y = 280, c = '#eef2f2') => `<rect x="${x}" y="${y}" width="170" height="${640 - y + 10}" rx="12" fill="${c}"/><path d="M${x} ${y + 140} h170" stroke-width="4"/><rect x="${x + 140}" y="${y + 40}" width="10" height="70" rx="4" fill="#9aa0a8"/><rect x="${x + 140}" y="${y + 170}" width="10" height="90" rx="4" fill="#9aa0a8"/>`,
    counter: (x, y, w, c = '#c8a878', top = '#e8e0cc') => `<rect x="${x}" y="${y}" width="${w}" height="${640 - y + 10}" fill="${c}"/><rect x="${x - 8}" y="${y - 16}" width="${w + 16}" height="20" fill="${top}"/>` + Array.from({ length: Math.floor(w / 140) }, (_, i) => `<rect x="${x + 14 + i * 140}" y="${y + 24}" width="116" height="${640 - y - 40}" fill="none" stroke-width="3"/><rect x="${x + 64 + i * 140}" y="${y + 40}" width="16" height="6" fill="#5a4a3a"/>`).join(''),
    cupboards: (x, y, w, c = '#c8a878') => Array.from({ length: Math.floor(w / 130) }, (_, i) => `<rect x="${x + i * 130}" y="${y}" width="126" height="150" fill="${c}"/><rect x="${x + 56 + i * 130}" y="${y + 120}" width="14" height="6" fill="#5a4a3a"/>`).join(''),
    sinkK: (x, y) => `<rect x="${x}" y="${y - 6}" width="140" height="18" rx="4" fill="#cfd6da"/><path d="M${x + 60} ${y - 6} v-50 q0 -16 20 -16 h20" stroke="#9aa0a8" stroke-width="8" fill="none"/>`,
    tub: (x, y, w = 420, water) => `<path d="M${x} ${y} h${w} v60 q0 90 -90 90 h-${w - 180} q-90 0 -90 -90z" fill="#f6f8f8"/><rect x="${x - 10}" y="${y - 14}" width="${w + 20}" height="20" rx="8" fill="#fff"/><path d="M${x + w - 60} ${y - 14} v-100 h-40" stroke="#9aa0a8" stroke-width="10" fill="none"/>` + (water ? `<path d="M${x + 10} ${y + 4} h${w - 20}" stroke="#8ad0e8" stroke-width="10"/>` + Array.from({ length: 7 }, (_, i) => `<circle cx="${x + 40 + i * 50}" cy="${y - 4 - (i % 3) * 10}" r="${14 + (i % 2) * 6}" fill="#fff"/>`).join('') : ''),
    showerC: (x, y, w = 280, c = '#f2f6f6', curtain = '#8ab8c8', closed) => `<rect x="${x}" y="${y}" width="${w}" height="${640 - y + 20}" fill="#d8e6ea"/><path d="M${x + w / 2} ${y + 30} v40 l-40 20 h80z" fill="#9aa0a8"/><path d="M${x - 20} ${y - 10} h${w + 40}" stroke-width="8"/>` + (closed ? `<path d="M${x - 10} ${y - 6} h${w + 20} v${640 - y} q-${(w + 20) / 4} 20 -${(w + 20) / 2} 0 q-${(w + 20) / 4} -20 -${(w + 20) / 2} 0z" fill="${curtain}"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M${x + i * w / 5} ${y} v${640 - y - 20}" stroke-opacity=".3" stroke-width="3"/>`).join('') : `<path d="M${x - 10} ${y - 6} h70 q-20 ${(640 - y) / 2} 10 ${640 - y} h-80z" fill="${curtain}"/>`),
    basin: (x, y, mirror = true) => (mirror ? `<rect x="${x - 70}" y="${y - 260}" width="140" height="180" rx="10" fill="#cfe8ee"/>` + `<path d="M${x - 50} ${y - 240} l40 0 l-40 70z" fill="#fff" opacity=".5" stroke="none"/>` : '') + `<path d="M${x - 80} ${y} h160 q0 50 -50 60 h-60 q-50 -10 -50 -60z" fill="#fbfbfb"/><rect x="${x - 20}" y="${y + 60}" width="40" height="${640 - y - 50}" fill="#f2f2f0"/><path d="M${x} ${y} v-30 h18" stroke="#9aa0a8" stroke-width="6" fill="none"/>`,
    loo: (x, y) => `<rect x="${x}" y="${y - 140}" width="100" height="110" rx="10" fill="#fbfbfb"/><path d="M${x - 10} ${y - 30} h120 q0 60 -40 70 v30 h-40 v-30 q-40 -10 -40 -70z" fill="#fbfbfb"/><rect x="${x - 14}" y="${y - 36}" width="128" height="14" rx="6" fill="#efefef"/>`,
    towel: (x, y, c = '#e2783c') => `<path d="M${x} ${y} h120" stroke-width="8"/><rect x="${x + 14}" y="${y}" width="90" height="140" rx="6" fill="${c}"/><path d="M${x + 14} ${y + 110} h90" stroke="#fff" stroke-opacity=".5" stroke-width="6"/>`,
    wardrobe: (x, y = 220, w = 240, c = '#7a5236') => `<rect x="${x}" y="${y}" width="${w}" height="${640 - y + 10}" fill="${c}"/><path d="M${x + w / 2} ${y} v${640 - y + 10}" stroke-width="4"/><circle cx="${x + w / 2 - 14}" cy="${y + 200}" r="7" fill="#e2c07a"/><circle cx="${x + w / 2 + 14}" cy="${y + 200}" r="7" fill="#e2c07a"/><rect x="${x - 10}" y="${y - 16}" width="${w + 20}" height="18" fill="${c}"/>`,
    desk: (x, y = 470, w = 320, c = '#8a6440') => `<rect x="${x}" y="${y}" width="${w}" height="22" fill="${c}"/><rect x="${x + 10}" y="${y + 22}" width="110" height="${640 - y - 2}" fill="${c}"/><rect x="${x + w - 26}" y="${y + 22}" width="16" height="${640 - y - 2}" fill="${c}"/><rect x="${x + 20}" y="${y + 40}" width="90" height="40" fill="none" stroke-width="3"/>`,
    lamp: (x, y, t) => `<rect x="${x - 4}" y="${y}" width="8" height="${640 - y + 10}" fill="#3a3a42"/><path d="M${x - 50} ${y} l20 -70 h60 l20 70z" fill="${lit(t) ? '#ffe2a0' : '#e8d8b0'}"/>`,
    rug: (x, y, w, c = '#a83a3a') => `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="40" fill="${c}"/><ellipse cx="${x}" cy="${y}" rx="${w / 2 - 30}" ry="26" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="5"/>`,
    plant: (x, y, c = '#3a8a5a') => `<path d="M${x - 40} ${y} h80 l-12 70 h-56z" fill="#c2683a"/><path d="M${x} ${y} q-60 -60 -40 -130 q30 40 40 130 q0 -110 20 -150 q30 60 -20 150 q50 -70 70 -90 q0 70 -70 90z" fill="${c}"/>`,
    clock: (x, y, h = '3:07') => { const [hh, mm] = h.split(':').map(Number); const a1 = (hh % 12 + mm / 60) * 30 * Math.PI / 180, a2 = mm * 6 * Math.PI / 180; return `<circle cx="${x}" cy="${y}" r="46" fill="#fbf6e8"/><path d="M${x} ${y} L${x + Math.sin(a1) * 24} ${y - Math.cos(a1) * 24} M${x} ${y} L${x + Math.sin(a2) * 36} ${y - Math.cos(a2) * 36}" stroke-width="5"/>`; },
    tallclock: (x, y = 200) => `<rect x="${x}" y="${y}" width="120" height="${640 - y + 10}" fill="#6a4228"/><circle cx="${x + 60}" cy="${y + 70}" r="44" fill="#fbf6e8"/><path d="M${x + 60} ${y + 70} l24 18 M${x + 60} ${y + 70} l-4 -36" stroke-width="5"/><rect x="${x + 30}" y="${y + 150}" width="60" height="220" fill="#4a2c18"/><path d="M${x + 60} ${y + 160} v150" stroke="#e2c07a" stroke-width="4"/><circle cx="${x + 60}" cy="${y + 320}" r="16" fill="#e2c07a"/>`,
    fireplace: (x, t) => `<rect x="${x}" y="360" width="320" height="290" fill="#b8b0a4"/><rect x="${x - 20}" y="340" width="360" height="30" fill="#8a8278"/><path d="M${x + 60} 650 v-170 q100 -80 200 0 v170z" fill="#2a2228"/>` + `<path d="M${x + 110} 640 q20 -60 50 -80 q30 30 40 80z" fill="${lit(t) ? '#ff9a3a' : '#5a4a44'}"/>` + (lit(t) ? `<path d="M${x + 140} 640 q8 -30 20 -40 q14 16 16 40z" fill="#ffe27a"/>` : ''),
    ironing: (x, y = 520) => `<path d="M${x} ${y} h300 q40 0 50 14 l-50 14 h-300z" fill="#e8eef2"/><path d="M${x + 80} ${y + 26} L${x + 220} 650 M${x + 220} ${y + 26} L${x + 80} 650" stroke-width="7"/><path d="M${x + 200} ${y - 6} l60 0 q20 -30 -20 -40 h-40z" fill="#9aa0a8"/><path d="M${x + 20} ${y - 2} q40 -40 120 -30 l20 30z" fill="#fbfbf7"/>`,
    shirtHang: (x, y, c = '#fbfbf7') => `<path d="M${x - 30} ${y} q30 -24 60 0" stroke-width="4" fill="none"/><path d="M${x - 50} ${y + 10} l50 -10 l50 10 l10 50 l-20 4 v110 h-80 v-110 l-20 -4z" fill="${c}"/><path d="M${x} ${y} v170" stroke-opacity=".4" stroke-width="3"/>`,
    poster: (x, y, w, h, c = '#3a6a9a', label = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>${label}`,
    chandelier: (x, t, g) => `<line x1="${x}" y1="0" x2="${x}" y2="80" stroke="${INK}" stroke-width="5"/><path d="M${x - 120} 120 q120 -60 240 0 q-120 40 -240 0z" fill="#e2c07a"/>` + Array.from({ length: 7 }, (_, i) => `<path d="M${x - 108 + i * 36} 126 v30" stroke="#e2c07a" stroke-width="4"/><circle cx="${x - 108 + i * 36}" cy="162" r="7" fill="${lit(t) ? '#fff6c0' : '#f2f2f2'}"/>`).join('')
  };

  /* ---------- exteriors helpers ---------- */
  const grass = (y, c = '#7aa85a') => `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="${c}"/>` + Array.from({ length: 40 }, (_, i) => `<path d="M${(i * 41) % W} ${y + 30 + (i * 37) % (H - y - 40)} l6 -18 l6 18" stroke="${'#5a8a3a'}" stroke-width="3" fill="none"/>`).join('');
  const sea = (t, y = 420) => `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="${SEA[t]}"/>` + Array.from({ length: 10 }, (_, i) => `<path d="M${i * 170 - 30} ${y + 40 + (i % 3) * 50} q40 -14 80 0 t80 0" stroke="#fff" stroke-width="5" fill="none" opacity=".35"/>`).join('');
  const curtainsClosed = (x, y, w, h, c) => `<rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" rx="4" fill="#6a4c36"/><path d="M${x} ${y} h${w / 2} q-10 ${h / 2} 0 ${h} h-${w / 2}z M${x + w} ${y} h-${w / 2} q10 ${h / 2} 0 ${h} h${w / 2}z" fill="${c}"/><path d="M${x + w * .2} ${y + 6} v${h - 12} M${x + w * .8} ${y + 6} v${h - 12}" stroke-opacity=".3" stroke-width="3"/>`;

  Object.assign(ART.BGS, {
    /* ===== Sami's attic ===== */
    sami_attic: t => room({ wall: ['#d8c8a8', '#bca888'], floor: ['#8a6a4a', '#74583c'], paper: 'planks', pc: '#a89070', lamp: 1150,
      back: `<path d="M0 0 L520 0 L0 380Z" fill="#9a8466"/><path d="M1600 0 L1080 0 L1600 380Z" fill="#9a8466"/>` + win(700, 120, 220, 200, t, '#3f8a62') + P.shelf(980, 300, 220) + P.frame(300, 300, 120, 90, '#f2e6c8', `<path d="M300 380 q60 -60 120 0" stroke="#3a8ad0" stroke-width="5" fill="none"/>`) + `<rect x="110" y="200" width="140" height="440" fill="#cfd6da"/><path d="M180 230 v40 l-30 14 h60z" fill="#9aa0a8"/><path d="M100 194 h160" stroke-width="7"/><path d="M110 198 h40 q-14 200 6 440 h-46z" fill="#3f8a62"/>` },
      t, P.bed(1020, 520, 480, '#f2eee4', '#d2683c', false) + P.counter(380, 480, 280, '#a8906a') + `<rect x="420" y="430" width="60" height="40" rx="6" fill="#e2483c"/><rect x="520" y="440" width="44" height="28" rx="4" fill="#fbfbf7"/>` + P.rug(800, 700, 420, '#3f8a62') + P.chair(700, 520, '#8a5a3a', 'l')),

    /* ===== Margaret's house ===== */
    cliff_road: t => { const g = id(); return svg(skyRect(t) + sea(t, 470) + OUT(`
      <path d="M0 520 Q400 470 900 520 L1600 520 L1600 900 L0 900Z" fill="#8ab06a"/>
      <path d="M760 900 L980 560 L1060 560 L1000 900Z" fill="#cfc4b0"/>
      <rect x="320" y="200" width="620" height="380" fill="#f6f4ee"/><polygon points="290,206 630,70 970,206" fill="#5a4a6a"/><rect x="740" y="90" width="50" height="90" fill="#8a7a8a"/>
      ${curtainsClosed(370, 260, 140, 110, '#c8b8d0')}${curtainsClosed(750, 260, 140, 110, '#c8b8d0')}${curtainsClosed(370, 420, 140, 110, '#c8b8d0')}
      <rect x="560" y="400" width="140" height="180" fill="#3a4a6a"/><circle cx="676" cy="490" r="8" fill="#e2c07a"/><rect x="540" y="580" width="180" height="20" fill="#cfc4b0"/>
      <path d="M520 104 q20 -6 30 20 v60 h-60 v-60 q10 -26 30 -20z" fill="#f2f2ec"/>
      ${P.shirtHang(830, 380, '#fbfbf7')}
      <rect x="1060" y="520" width="16" height="100" fill="#5a4030"/><rect x="1030" y="470" width="76" height="60" rx="4" fill="#fbf7ec"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${130 + i * 26}" cy="${600 + (i % 2) * 16}" r="18" fill="${['#d84a6a', '#f2c445', '#fbfbf7'][i % 3]}"/>`).join('')}
      <rect x="0" y="620" width="300" height="20" fill="#fbfbf7"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 30 + 6}" y="580" width="14" height="60" fill="#fbfbf7"/>`).join('')}`) +
      `<text x="1068" y="508" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="600" font-size="26" fill="#3a4a6a">7</text>` + streetLamp(1300, 380, t, g) + shade('M780 206 h160 v374 h-160z', .1), glowDef(g)); },
    marg_living: t => room({ wall: ['#ece2d6', '#d8cbbb'], floor: ['#a88a6a', '#94785a'], paper: 'stripes', pc: '#c8b8d0', lampAt: [300, 300, 260],
      back: curtainsClosed(620, 120, 360, 260, '#b8a4c8') + P.portrait(220, 150, 150, 190, '#f0c8a8', '#4a3020') + P.frame(1120, 170, 120, 90, '#cfe2ea', `<path d="M1120 260 q30 -50 60 -10 q30 -40 60 10" stroke="#3a6a9a" stroke-width="4" fill="none"/>`) + P.clock(1380, 200, '7:00') + P.shelf(1080, 330, 280) },
      t, P.lamp(300, 360, t) + P.sofa(450, 560, 520, '#9a86b0') + P.armchair(1100, 580, '#7a6a8a') + P.ironing(1260, 540) + P.rug(760, 720, 600, '#7a5a8a') + `<rect x="1380" y="380" width="50" height="160" fill="#fbfbf7" stroke-width="3"/><rect x="1440" y="380" width="50" height="160" fill="#cfe0ea" stroke-width="3"/>`),
    marg_kitchen: t => room({ wall: ['#f2ead8', '#e0d4bc'], floor: ['#c8c2b4', '#b4ad9e'], paper: 'tiles', pc: '#9ab8c8', lamp: 820, fn: 5,
      back: P.cupboards(80, 140, 520, '#e8e0cc') + win(760, 150, 240, 200, t, '#b8a4c8') + P.clock(1200, 180, '7:00') + P.shelf(1140, 330, 300) },
      t, P.counter(60, 470, 560, '#d8ccb4') + P.sinkK(260, 470) + P.stove(640, 460) + P.pot(690, 448, lit(t)) + P.fridge(1380, 280, '#f2f6f6') + P.table(880, 520, 420, '#9a6a44') + P.cloth(880, 520, 420) + P.plate(960, 516) + P.plate(1090, 516) + P.plate(1220, 516) + P.chair(870, 540) + P.chair(1240, 540, '#8a5a3a', 'r')),
    marg_guest: t => room({ wall: ['#e8eef0', '#d0dade'], floor: ['#a88a6a', '#94785a'], paper: 'dots', pc: '#8ab8c8', lampAt: [1340, 360, 220],
      back: win(640, 130, 240, 220, t, '#9ab8d8') + P.frame(1060, 180, 140, 100, '#f2e6c8', `<circle cx="1130" cy="230" r="26" fill="#f2c445"/>`) },
      t, P.bed(140, 520, 500, '#f6f6f2', '#8aa8c8', true) + `<path d="M380 470 l50 -10 l50 10 l8 40 h-116z" fill="#fbfbf7"/>` + P.wardrobe(900, 240, 240, '#c8b8a0') + P.desk(1220, 480, 260, '#c8b8a0') + P.lamp(1340, 380, t) + P.rug(560, 720, 380, '#8ab8c8')),
    marg_bed: t => room({ wall: ['#e2d6e6', '#ccbcd2'], floor: ['#94785a', '#80664a'], paper: 'stripes', pc: '#fff', lampAt: [300, 380, 220],
      back: curtainsClosed(700, 130, 260, 220, '#9a86b0') + P.portrait(1180, 160, 120, 150, '#f0c8a8', '#4a3020') + P.portrait(1330, 180, 100, 120, '#e8c0a0', '#2a2a2a', '#d8c8a8') },
      t, P.bed(560, 520, 560, '#f6f2ec', '#6a5a8a', true) + P.desk(140, 480, 300, '#8a6a50') + `<rect x="200" y="420" width="140" height="60" fill="#fbfbf7"/><rect x="190" y="440" width="34" height="40" rx="6" fill="#e8e0d0"/>` + P.lamp(300, 400, t) + P.wardrobe(1240, 240, 220, '#8a6a50') + `<rect x="1150" y="430" width="70" height="90" fill="#8a6a50"/><rect x="1162" y="400" width="18" height="30" rx="4" fill="#fbfbf7"/><rect x="1186" y="406" width="16" height="24" rx="4" fill="#e2b030"/>`),
    dan_room: t => room({ wall: ['#3a4a6a', '#2a3854'], floor: ['#7a6a5a', '#6a5a4a'], paper: '', lampAt: [300, 420, 200],
      back: P.poster(160, 120, 180, 240, '#d2483c', `<circle cx="250" cy="220" r="50" fill="#f2c445" stroke-width="4"/><path d="M200 320 h100" stroke="#fff" stroke-width="10"/>`) + P.poster(400, 160, 140, 180, '#2a2a32', `<path d="M420 300 l50 -100 l50 100z" fill="#3ab0b8" stroke-width="4"/>`) + curtainsClosed(760, 130, 220, 200, '#2a3a5a') + P.shelf(1100, 280, 320) + `<path d="M1110 200 l40 -40 l40 40" stroke="#f2c445" stroke-width="6" fill="none"/>` },
      t, P.bed(1020, 520, 480, '#e8eef2', '#d2483c', true) + P.desk(120, 480, 380, '#5a4a3a') + `<rect x="190" y="400" width="160" height="80" rx="6" fill="#1a1a22"/><rect x="380" y="430" width="60" height="50" fill="#fbfbf7"/>` + P.lamp(300, 420, t) + P.chair(260, 520, '#3a3a42') + `<rect x="620" y="560" width="200" height="90" rx="10" fill="#4a6a3a"/><circle cx="660" cy="560" r="30" fill="#fff" stroke-width="4"/>` + `<path d="M880 640 l60 -200 l20 4 l-50 196z" fill="#c8a060"/><ellipse cx="940" cy="430" rx="40" ry="50" fill="#c8a060"/>` + P.shirtHang(1450, 300, '#fbfbf7')),
    marg_bath: t => room({ wall: ['#e6eef0', '#d0dce0'], floor: ['#c8d2d6', '#b4c0c4'], paper: 'tiles', pc: '#9ab8c8', fn: 5 },
      t, P.tub(120, 470, 440, false) + P.showerC(160, 160, 340, '#e8eef0', '#c8b8d0', false) + P.basin(900, 470) + `<rect x="1020" y="250" width="90" height="140" fill="#e8e0d0"/><path d="M1020 250 v140" stroke-width="4"/>` + P.loo(1240, 640) + P.towel(620, 280, '#9a86b0')),

    /* ===== The lighthouse ===== */
    lh_ext: t => { const g = id(); return svg(skyRect(t) + sea(t, 520) + OUT(`
      <path d="M700 900 Q760 560 1100 520 Q1500 500 1600 560 V900Z" fill="#8a8a78"/><path d="M800 900 Q840 640 1100 600 Q1450 580 1600 620 V900Z" fill="#9aa07a"/>
      <path d="M1030 560 L1070 120 H1190 L1230 560Z" fill="#f4f2ec"/><path d="M1044 420 H1216 L1206 330 H1054Z M1062 230 H1198 L1192 170 H1068Z" fill="#c23a34"/>
      <rect x="1060" y="60" width="140" height="60" fill="${lit(t) ? '#fff2a8' : '#cfe8f0'}"/><path d="M1040 60 L1130 10 L1220 60Z" fill="#2a2a36"/><rect x="1040" y="116" width="180" height="14" fill="#2a2a36"/>
      <rect x="760" y="360" width="300" height="220" fill="#e8e2d2"/><polygon points="740,366 910,270 1080,366" fill="#3a4a5a"/><rect x="870" y="460" width="80" height="120" fill="#2f5a7a"/>
      <rect x="790" y="400" width="60" height="50" fill="${lit(t) ? '#ffd27a' : '#bfe2f2'}"/><rect x="980" y="400" width="60" height="50" fill="${lit(t) ? '#ffd27a' : '#bfe2f2'}"/><rect x="900" y="300" width="40" height="34" fill="#2a2a36"/>
      <path d="M560 640 h120 v14 h-120z" fill="#7a5236"/><rect x="570" y="654" width="10" height="40" fill="#5a3a26"/><rect x="660" y="654" width="10" height="40" fill="#5a3a26"/>`) +
      (t === 'night' ? `<path d="M1130 90 L0 0 L0 260Z" fill="#fff6c0" opacity=".16"/>` : '') + shade('M1160 120 h70 v440 h-70z', .12), glowDef(g)); },
    lh_living: t => room({ wall: ['#cfd8d4', '#b4c0ba'], floor: ['#7a6248', '#68523a'], paper: 'stone', pc: '#e8e2d2', lampAt: [1120, 300, 260],
      back: win(560, 130, 200, 200, t, '#2f4a6a') + P.portrait(220, 140, 140, 180, '#e8c0a0', '#eee', '#9ab8c8') + `<path d="M920 140 h300 v200 h-300z" fill="#f2e6c8"/><path d="M940 320 q60 -120 130 -40 q40 -60 130 -20" stroke="#3a6a9a" stroke-width="5" fill="none"/><path d="M1040 160 l20 80 l20 -80" stroke="#c23a34" stroke-width="5" fill="none"/>` + P.tallclock(1400, 180) },
      t, P.fireplace(80, t) + P.armchair(500, 600, '#7a3a3a') + P.sofa(860, 580, 380, '#3a5a6a') + `<rect x="880" y="590" width="340" height="40" rx="10" fill="#e8e2d2"/>` + P.lamp(1300, 380, t) + P.rug(760, 740, 640, '#2f4a6a') + `<path d="M680 650 q30 -60 80 -40 q40 20 20 60z" fill="#8a3a2a"/><rect x="710" y="560" width="60" height="40" rx="8" fill="#5a5a5a"/>`),
    lh_kitchen: t => room({ wall: ['#e8e2c8', '#d4ccae'], floor: ['#9a8a6a', '#887858'], paper: 'tiles', pc: '#c2683a', lamp: 700, fn: 5,
      back: P.cupboards(100, 160, 390, '#5a8a9a') + win(900, 140, 220, 200, t, '#c2683a') + P.shelf(1200, 260, 300) + `<path d="M1220 210 l30 -20 l30 20 M1300 200 q20 -16 40 0" stroke-width="4" fill="none"/>` },
      t, P.counter(80, 470, 420, '#5a8a9a') + P.stove(540, 460) + P.pot(600, 448, true) + P.pot(700, 448, false) + P.table(860, 520, 380, '#7a5a3a') + P.plate(940, 516) + P.plate(1120, 516) + P.chair(850, 540) + P.chair(1180, 540, '#7a5a3a', 'r') + `<path d="M1320 640 q20 -140 80 -170 q60 30 80 170z" fill="#3a3a3a"/><circle cx="1400" cy="520" r="30" fill="#e2c07a"/>`),
    lh_room: t => room({ wall: ['#d8d0e0', '#c0b6cc'], floor: ['#7a6248', '#68523a'], paper: 'stripes', pc: '#fff', lampAt: [340, 380, 220],
      back: win(700, 120, 200, 220, t, '#2f4a6a') + P.frame(1100, 160, 160, 110, '#f2e6c8', `<path d="M1110 260 l60 -80 l60 80" stroke="#2a2a36" stroke-width="5" fill="none"/>`) + P.bookcase(1300, 240, 240, 400) },
      t, P.bed(140, 540, 480, '#f2eee4', '#c23a34', false) + P.desk(780, 480, 380, '#7a5a3a') + `<rect x="840" y="440" width="140" height="40" fill="#e8d8b0"/><path d="M850 446 h120 M850 458 h100 M850 470 h110" stroke-width="2"/>` + P.lamp(340, 400, t) + `<path d="M1000 470 q20 -80 80 -60 q10 30 -10 60z" fill="#3a6a3a"/>` + P.rug(560, 730, 400, '#c23a34')),
    lh_bath: t => room({ wall: ['#d8e8e8', '#c0d4d4'], floor: ['#a8b8b8', '#98a8a8'], paper: 'tiles', pc: '#2f6a8a', fn: 5 },
      t, P.tub(200, 470, 480, true) + `<rect x="760" y="380" width="80" height="60" rx="10" fill="#c23a34"/><circle cx="782" cy="410" r="14" fill="#2a2a32"/><path d="M800 380 l20 -40" stroke-width="4"/>` + P.basin(1060, 470) + P.loo(1320, 640) + P.towel(860, 260, '#f2c445')),
    lh_tower: t => { const g = id(); return svg(skyRect(t) + sea(t, 560) + OUT(`
      <rect x="0" y="0" width="${W}" height="70" fill="#2a2a36"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${i * 300 + 40}" y="70" width="18" height="560" fill="#2a2a36"/>`).join('')}
      <rect x="0" y="620" width="${W}" height="280" fill="#3a3a44"/><path d="M0 620 h${W}" stroke-width="10"/>
      <ellipse cx="800" cy="380" rx="240" ry="260" fill="${lit(t) ? '#fff6c0' : '#cfe8f0'}" fill-opacity="${lit(t) ? .95 : .7}"/>${Array.from({ length: 7 }, (_, i) => `<path d="M${590 + i * 70} 140 q-30 240 0 480" stroke-opacity=".4" stroke-width="5" fill="none"/>`).join('')}
      <rect x="640" y="620" width="320" height="40" fill="#5a5e66"/><path d="M200 900 h300 l-40 -160 h-220z" fill="#5a5e66"/>
      <rect x="1220" y="460" width="160" height="160" fill="#7a5236"/><rect x="1240" y="400" width="120" height="60" fill="#e8d8b0"/>`) +
      (lit(t) ? glow(g, 800, 380, 700) : '') + `<path d="M0 700 h${W}" stroke="#c23a34" stroke-width="14"/>`, glowDef(g)); },
    lh_attic: t => { const g = id(); return svg(`<rect width="${W}" height="${H}" fill="#3a3028"/>` + OUT(`
      <path d="M0 0 L800 0 L0 600Z" fill="#2a221c"/><path d="M1600 0 L800 0 L1600 600Z" fill="#2a221c"/>
      <rect x="720" y="160" width="160" height="160" fill="${t === 'night' ? '#0f1838' : '#7a9ab0'}"/><path d="M800 160 v160 M720 240 h160" stroke-width="8"/>
      <rect x="260" y="480" width="320" height="140" fill="#5a4030"/><path d="M260 480 q160 -60 320 0" fill="#6a4c38"/>
      <rect x="1000" y="500" width="200" height="120" rx="10" fill="#8a6a50"/><circle cx="1060" cy="480" r="28" fill="#e8d0b0"/><path d="M1040 470 q20 -20 40 0" stroke-width="4" fill="none"/><path d="M1086 500 l40 -50" stroke-width="5"/>
      <rect x="1300" y="380" width="140" height="240" fill="#4a3424"/><circle cx="1370" cy="440" r="40" fill="#fbf6e8"/><path d="M1370 440 l10 -30 M1370 440 l26 14" stroke-width="5"/>
      <path d="M600 640 l60 -30 l60 30 l-60 30z" fill="#c23a34"/>`) + planks(640, '#4a3a2c', '#3a2c20', 4) +
      `<text x="1370" y="500" text-anchor="middle" font-family="Spectral, serif" font-size="22" fill="#e8d8b0">3:07</text>` + (t === 'night' ? `<rect width="${W}" height="${H}" fill="#000" opacity=".25"/>` : ''), glowDef(g)); },

    /* ===== The Grand Hotel ===== */
    hotel_lobby: t => { const g = id(); return svg(wallGrad('#f2ead6', '#dccfb0', 640) + `<g opacity=".5">${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 180 + 30}" y="60" width="120" height="560" fill="none" stroke="#c8a860" stroke-width="5"/>`).join('')}</g>` + OUT(`
      <rect x="560" y="140" width="480" height="300" rx="14" fill="#c8a860"/><rect x="580" y="160" width="440" height="260" rx="10" fill="#fbf6e8"/>
      <rect x="160" y="160" width="180" height="480" fill="#e8dcc0"/><rect x="1260" y="160" width="180" height="480" fill="#e8dcc0"/>
      <rect x="560" y="460" width="480" height="180" fill="#7a2a3a"/><rect x="540" y="440" width="520" height="26" fill="#c8a860"/>
      <rect x="1100" y="420" width="120" height="220" fill="#c8a860"/>${[0, 1, 2].map(i => `<rect x="${1110 + i * 36}" y="400" width="28" height="20" fill="#e2c07a"/>`).join('')}`) +
      planks(640, '#d8c8a8', '#c8b898', 3) + `<rect x="0" y="640" width="${W}" height="260" fill="#7a2a3a" opacity=".35"/>` + `<text x="800" y="300" text-anchor="middle" font-family="Spectral, serif" font-size="46" font-style="italic" fill="#7a2a3a">The Saltmere Grand</text><text x="800" y="360" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-size="20" letter-spacing="6" fill="#a88a40">EVERYONE IS WELCOME</text>` +
      OUT(P.plant(250, 570, '#2f6a4a') + P.plant(1350, 570, '#2f6a4a') + P.chandelier(800, t, g)) + (lit(t) ? glow(g, 800, 160, 520) : ''), glowDef(g)); },
    hotel_suite: t => room({ wall: ['#f2ead6', '#e0d2b4'], floor: ['#7a2a3a', '#6a2232'], paper: 'wains', pc: '#e8dcc0', lampAt: [1340, 380, 240], fn: 3,
      back: win(560, 100, 420, 280, t, '#7a2a3a') + P.frame(160, 180, 220, 150, '#cfe2ea', `<path d="M160 330 q110 -100 220 0" fill="#3a8ad0" stroke-width="3"/>`) + `<path d="M1120 120 h240 v200 h-240z" fill="#c8a860"/><rect x="1136" y="136" width="208" height="168" fill="#e8f2f4"/>` },
      t, P.bed(120, 530, 640, '#fbfbf7', '#c8a860', true) + P.sofa(980, 590, 300, '#2a3a5a') + P.lamp(1340, 400, t) + `<rect x="840" y="560" width="110" height="80" fill="#c8a860"/><path d="M860 560 v-40 h70 v40" fill="#e8e0cc"/><rect x="1440" y="300" width="160" height="350" fill="#e8dcc0"/><rect x="1460" y="320" width="120" height="290" fill="#cfe2ea"/>` + P.rug(560, 760, 680, '#c8a860')),
    hotel_office: t => room({ wall: ['#4a3a32', '#3a2c24'], floor: ['#5a2a2a', '#4a2020'], paper: 'wains', pc: '#5a4030', lampAt: [560, 420, 240], fn: 3,
      back: P.portrait(640, 100, 220, 260, '#e8c0a0', '#1c1a1e', '#7a2a3a') + P.bookcase(80, 220, 300, 420) + `<rect x="1180" y="160" width="260" height="200" fill="#e8dcc0"/><path d="M1200 340 h40 v-60 h40 v-40 h40 v-20 h40 v-40 h40" stroke="#3a8a5a" stroke-width="6" fill="none"/>` },
      t, `<rect x="440" y="470" width="720" height="40" fill="#5a3a26"/><rect x="460" y="510" width="200" height="140" fill="#5a3a26"/><rect x="940" y="510" width="200" height="140" fill="#5a3a26"/><rect x="480" y="530" width="160" height="40" fill="none" stroke-width="3"/><rect x="480" y="590" width="160" height="40" fill="none" stroke-width="3"/>` + `<rect x="700" y="430" width="120" height="40" fill="#e8e0cc"/><rect x="880" y="420" width="100" height="50" rx="6" fill="#2a2a32"/>` + P.lamp(560, 420, t) + `<rect x="1300" y="420" width="200" height="220" fill="#3a3a42"/><circle cx="1400" cy="530" r="44" fill="#5a5e66"/><path d="M1400 500 v60 M1370 530 h60" stroke-width="4"/>` + P.armchair(700, 640, '#5a2a2a')),
    hotel_staff: t => room({ wall: ['#c8ccc4', '#aeb4aa'], floor: ['#8a8e86', '#7a7e76'], paper: 'tiles', pc: '#9aa09a', lamp: 800, fn: 4,
      back: `<rect x="80" y="120" width="1440" height="40" fill="#5a5e66"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M${140 + i * 170} 160 v80" stroke-width="3"/><path d="M${100 + i * 170} 240 h80 l10 140 h-100z" fill="${['#fbfbf7', '#e8e0cc', '#cfe0ea', '#fbfbf7'][i % 4]}"/>`).join('') },
      t, `<rect x="120" y="440" width="260" height="210" rx="10" fill="#e8ecec"/><circle cx="250" cy="540" r="70" fill="#9ab8c8"/><circle cx="250" cy="540" r="50" fill="#cfe0ea"/><rect x="420" y="440" width="260" height="210" rx="10" fill="#e8ecec"/><circle cx="550" cy="540" r="70" fill="#9ab8c8"/>` + P.table(800, 500, 360, '#9a9e96') + `<rect x="830" y="440" width="300" height="60" fill="#fbfbf7"/><path d="M840 470 h280" stroke-opacity=".3" stroke-width="3"/>` + `<rect x="1260" y="300" width="240" height="350" fill="#7a8088"/>${[0, 1, 2].map(i => `<rect x="${1270 + i * 78}" y="310" width="70" height="330" fill="#9aa0a8"/><rect x="${1290 + i * 78}" y="340" width="30" height="6" fill="#2a2a32"/>`).join('')}` + `<rect x="900" y="560" width="160" height="90" rx="8" fill="#5a8ab0"/>`),

    /* ===== Town ===== */
    beach: t => { const g = id(); return svg(skyRect(t) + sea(t, 400) + OUT(`
      <path d="M0 560 Q500 500 900 560 T1600 540 V900 H0Z" fill="#ead9a6"/><path d="M0 560 Q500 500 900 560 T1600 540" stroke="#fff" stroke-width="8" fill="none" opacity=".7"/>
      <path d="M200 760 l60 -260 l20 0 l-50 260z" fill="#7a5236"/><path d="M110 520 q160 -90 320 0z" fill="#e2483c"/><path d="M190 500 q80 -60 160 0" fill="#fbfbf7"/>
      <rect x="1100" y="600" width="260" height="20" rx="6" fill="#3ab0b8"/><path d="M1100 610 q-30 -60 10 -90 h250 q40 30 0 90z" fill="#3ab0b8"/>
      <path d="M700 700 q60 -30 120 0 q-60 20 -120 0z" fill="#d8c08a"/><rect x="760" y="640" width="12" height="60" fill="#5a3a26"/><path d="M740 640 h60 v30 h-60z" fill="#fbfbf7"/>
      <path d="M1400 470 l60 -30 l60 30 l-60 20z" fill="#fbfbf7"/>`) + `<text x="770" y="662" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-size="18" font-weight="600" fill="#c23a34">NO DIVING</text>` + shade('M0 760 H1600 V900 H0Z', .08), glowDef(g)); },
    cemetery: t => { const g = id(); return svg(skyRect(t) + OUT(`
      <path d="M0 460 Q400 420 800 460 T1600 450 V900 H0Z" fill="#7a9a6a"/>
      <path d="M1100 460 v-200 l60 -60 l60 60 v200z" fill="#bab4a6"/><path d="M1160 200 v-60 M1140 160 h40" stroke-width="8"/>
      ${[[120, 600, 1], [300, 560, .9], [480, 620, 1.1], [700, 580, .9], [900, 640, 1], [1300, 600, 1], [1460, 560, .8]].map(([x, y, k]) => `<path d="M${x - 40 * k} ${y} v-${100 * k} q${40 * k} -40 ${80 * k} 0 v${100 * k}z" fill="#9a968e"/>`).join('')}
      <path d="M560 760 h200 v-150 q-100 -80 -200 0z" fill="#d8d4cc"/><path d="M610 680 h100 M630 710 h60" stroke-width="4"/>
      <circle cx="640" cy="770" r="14" fill="#d84a6a"/><circle cx="670" cy="776" r="14" fill="#f2c445"/>
      <path d="M1000 900 l40 -260 l20 0 l-20 260z" fill="#5a4030"/><path d="M1000 640 h100 v20 h-100z" fill="#9aa0a8"/>
      <path d="M0 470 h1600" stroke="#3a3a32" stroke-width="6" stroke-dasharray="4 30"/>`) + `<text x="660" y="660" text-anchor="middle" font-family="Spectral, serif" font-size="22" fill="#3a3a32">DANIEL</text>` + (t === 'night' ? `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".25"/>` : ''), glowDef(g)); },
    florist: t => room({ wall: ['#f6e8ea', '#e8d0d6'], floor: ['#c8b8a0', '#b8a890'], paper: 'stripes', pc: '#fff', lamp: 760,
      back: win(560, 120, 480, 260, t, '#5a8a4a') + P.shelf(120, 300, 360) + P.shelf(1140, 300, 360) },
      t, P.counter(560, 480, 480, '#7a5a3a') + [140, 300, 1180, 1360].map((x, i) => `<rect x="${x}" y="480" width="120" height="170" fill="#9a7a5a"/>` + Array.from({ length: 6 }, (_, k) => `<circle cx="${x + 20 + (k % 3) * 40}" cy="${470 - (k / 3 | 0) * 40}" r="22" fill="${['#d84a6a', '#f2c445', '#fbfbf7', '#9a5ad0', '#ff8a3a'][(i + k) % 5]}"/>`).join('') + `<path d="M${x + 30} 480 v-40 M${x + 90} 480 v-40" stroke="#3a8a5a" stroke-width="5"/>`).join('') + `<rect x="760" y="430" width="70" height="50" fill="#fbf6e8"/><path d="M1000 470 q20 -30 40 0 q-20 10 -40 0z" fill="#e2783c"/><circle cx="1032" cy="452" r="12" fill="#e2783c"/>`),
    police: t => room({ wall: ['#d8dee4', '#c0c8d0'], floor: ['#8a8e96', '#7a7e86'], paper: 'wains', pc: '#9aa8b8', lamp: 900, fn: 4,
      back: `<rect x="120" y="140" width="360" height="240" fill="#c8a878"/>` + Array.from({ length: 8 }, (_, i) => `<rect x="${140 + (i % 4) * 84}" y="${160 + (i / 4 | 0) * 110}" width="64" height="84" fill="${['#fbfbf7', '#f2c445', '#cfe0ea', '#fbfbf7'][i % 4]}"/>`).join('') + win(640, 140, 260, 200, t, '#2a3a5a') + P.clock(1100, 200, '3:07') },
      t, P.desk(560, 480, 460, '#7a6a5a') + `<rect x="620" y="420" width="120" height="60" rx="6" fill="#2a2a32"/><rect x="800" y="440" width="80" height="40" fill="#fbfbf7"/>` + P.chair(680, 520, '#3a3a42') + `<rect x="1200" y="260" width="320" height="390" fill="#5a5e66"/>${Array.from({ length: 7 }, (_, i) => `<path d="M${1230 + i * 44} 260 v390" stroke-width="6"/>`).join('')}` + `<rect x="80" y="520" width="300" height="20" fill="#7a5a3a"/><rect x="100" y="540" width="14" height="100" fill="#7a5a3a"/><rect x="346" y="540" width="14" height="100" fill="#7a5a3a"/>`)
  });

  /* tint: the new exteriors behave like outdoors */
  const t0 = ART.tint;
  ART.tint = (bg, t) => (['cliff_road', 'lh_ext', 'beach', 'cemetery', 'lh_tower'].includes(bg) ? (t === 'night' ? 'rgba(6,8,30,.22)' : t === 'evening' ? 'rgba(255,110,60,.12)' : 'transparent') : t0(bg, t));

  /* map: new places */
  Object.assign(ART.PLACES, { florist: [20, 31], police: [74, 28], cemetery: [7, 38], beach: [27, 74], cliff_road: [28, 44], lh_ext: [91, 75], hotel_lobby: [78, 55] });
  const m0 = ART.map;
  ART.map = s => m0(s).replace(/<rect width="1600" height="900" fill="#0a1030"|<rect width="1600" height="900" fill="#ff7a3a"|<text x="800" y="880"/, m => {
    const t = (GAME.S && typeof slotName === 'function') ? slotName() : 'noon', L = lit(t) ? '#ffd27a' : '#bfe2f2';
    const px = k => [ART.PLACES[k][0] * 16, ART.PLACES[k][1] * 9];
    const [fx, fy] = px('florist'), [px2, py2] = px('police'), [cx, cy] = px('cemetery'), [bx, by] = px('beach');
    return OUT(`<rect x="${fx - 56}" y="${fy - 10}" width="112" height="60" fill="#f6e8ea"/><polygon points="${fx - 66},${fy - 8} ${fx},${fy - 50} ${fx + 66},${fy - 8}" fill="#d84a6a"/>${[0, 1, 2].map(i => `<circle cx="${fx - 30 + i * 30}" cy="${fy + 36}" r="10" fill="${['#f2c445', '#fbfbf7', '#9a5ad0'][i]}"/>`).join('')}
      <rect x="${px2 - 60}" y="${py2 - 10}" width="120" height="62" fill="#d8dee4"/><rect x="${px2 - 66}" y="${py2 - 26}" width="132" height="18" fill="#2a3a5a"/><rect x="${px2 - 16}" y="${py2 + 14}" width="32" height="38" fill="${L}"/>
      ${[0, 1, 2, 3, 4].map(i => `<path d="M${cx - 60 + i * 30} ${cy + 30} v-26 q12 -12 24 0 v26z" fill="#bab4a6"/>`).join('')}<path d="M${cx - 70} ${cy + 34} h150" stroke-width="3"/>
      <path d="M${bx - 30} ${by + 10} l12 -50 l4 0 l-8 50z" fill="#7a5236"/><path d="M${bx - 60} ${by - 36} q40 -26 80 0z" fill="#e2483c"/>`, 4) + m;
  });
})();

/* v5: room lighting pass — ambient occlusion in the corners, a ceiling edge, warm key light, and
   window light for interiors. Drawn on top, semi-transparent, so every room gains depth. */
(function () {
  const OUTSIDE = ['station', 'street', 'harbor', 'elias_ext', 'dock', 'delivery', 'cliff_road', 'lh_ext', 'beach', 'cemetery', 'lh_tower', 'black'];
  const B = ART.BGS; let n = 0;
  const light = t => {
    const id = 'rl' + (++n), warm = t === 'evening' || t === 'night';
    return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"><defs>
      <linearGradient id="${id}l" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset=".16" stop-color="#000" stop-opacity="0"/><stop offset=".84" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>
      <linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".34"/><stop offset=".14" stop-color="#000" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id}k" cx=".42" cy=".32" r=".7"><stop offset="0" stop-color="${warm ? '#ffcf8a' : '#fff6e0'}" stop-opacity="${warm ? .22 : .16}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <rect width="1600" height="900" fill="url(#${id}k)"/><rect width="1600" height="900" fill="url(#${id}l)"/><rect width="1600" height="900" fill="url(#${id}t)"/>
      </svg>`;
  };
  const bg0 = ART.bg;
  ART.bg = (id, t) => { const out = bg0(id, t); if (OUTSIDE.includes(id) || out.startsWith('<img')) return out; return out + light(t); };
})();
