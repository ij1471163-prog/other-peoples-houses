/* =====================================================================
   Other People's Houses — people (v5)
   Cartoon life-sim sprites: big expressive eyes, glossy hair, hard
   cel-shading, clean variable lines, and real poses (hand on hip,
   arms crossed, hands in pockets, waving, holding things).
   Overrides ART.portrait. A PNG in img/chars/<id>-<expr>.png wins.
   ===================================================================== */
'use strict';
const PEOPLE = (() => {
  const INK = '#2a1f2b', CX = 200;
  let uid = 0;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (h, k) => toHex(hex(h).map(v => (k > 0 ? v + (255 - v) * k : v * (1 + k))));
  /* kept for compatibility: soft gradient (used sparingly now) */
  function grad(base, defs, dir = 'h') {
    const id = 'pg' + (++uid);
    defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="${dir === 'h' ? 1 : 0}" y2="${dir === 'h' ? 0 : 1}"><stop offset="0" stop-color="${mix(base, .12)}"/><stop offset=".5" stop-color="${base}"/><stop offset="1" stop-color="${mix(base, -.12)}"/></linearGradient>`);
    return `url(#${id})`;
  }
  const X = (x, side) => (side < 0 ? x : 2 * CX - x);

  /* cel-shaded filled shape: flat base, hard shadow on the right, a thin rim light on the left, clean outline */
  function cel(d, base, defs, o = {}) {
    const id = 'pc' + (++uid);
    const sp = o.split ?? 38, dark = mix(base, o.dk ?? -.2), lite = mix(base, .22);
    defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
    return `<path d="${d}" fill="${base}" stroke="none"/>` +
      `<g clip-path="url(#${id})" stroke="none">` +
      `<path d="M${CX + sp} -10 C${CX + sp - 22} 260 ${CX + sp + 26} 520 ${CX + sp - 6} 920 L420 920 L420 -10Z" fill="${dark}"/>` +
      (o.under !== false ? `<path d="M-10 ${o.uy ?? 560} C120 ${(o.uy ?? 560) - 18} 280 ${(o.uy ?? 560) - 18} 420 ${o.uy ?? 560} L420 920 L-10 920Z" fill="#000" opacity=".1"/>` : '') +
      `<path d="M0 -10 L${CX - (o.rim ?? 82)} -10 C${CX - (o.rim ?? 82) - 10} 300 ${CX - (o.rim ?? 82) + 6} 600 ${CX - (o.rim ?? 82) - 4} 920 L0 920Z" fill="${lite}" opacity=".55"/>` +
      (o.extra || '') + `</g><path d="${d}" fill="none" stroke="${INK}" stroke-width="${o.w ?? 3.8}"/>`;
  }
  /* a limb as a thick outlined stroke with a cel shadow along its outer edge */
  function limb(pts, w, color, side, cap = 'round') {
    const d = 'M' + pts.map(p => p.join(' ')).join(' L');
    const dk = mix(color, -.22);
    return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="${cap}" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="${dk}" stroke-width="${w * .36}" stroke-linecap="${cap}" stroke-linejoin="round" transform="translate(${side * w * .26} 0)"/>`;
  }
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  const SPEC = {} /* each character's look lives in js/chars/<id>.js (PEOPLE.SPEC.<id>) */;

  const SY = 262;
  function torsoPath(p, hem = 610) {
    const { sw, ww, hw } = p; const f = p.sex === 'f';
    const wy = f ? 455 : 470, wi = f ? ww - 4 : ww;
    return `M${CX - sw} ${SY + 6} C${CX - sw - 6} ${SY + 70} ${CX - wi - 8} ${wy - 70} ${CX - wi} ${wy} C${CX - wi - 2} ${wy + 50} ${CX - hw} 540 ${CX - hw} ${hem} L${CX + hw} ${hem} C${CX + hw} 540 ${CX + wi + 2} ${wy + 50} ${CX + wi} ${wy} C${CX + wi + 8} ${wy - 70} ${CX + sw + 6} ${SY + 70} ${CX + sw} ${SY + 6} C${CX + sw - 20} ${SY - 18} ${CX + 44} ${SY - 26} ${CX} ${SY - 24} C${CX - 44} ${SY - 26} ${CX - sw + 20} ${SY - 18} ${CX - sw} ${SY + 6}Z`;
  }
  function legsPath(p, top = 540, bottom = 940) {
    const hw = p.hw;
    return `M${CX - hw} ${top} L${CX - hw + 10} ${bottom} L${CX - 10} ${bottom} L${CX - 4} 670 Q${CX} 650 ${CX + 4} 670 L${CX + 10} ${bottom} L${CX + hw - 10} ${bottom} L${CX + hw} ${top}Z`;
  }
  /* ---------- hair & beards ---------- */
  function hairBack(p) {
    const h = p.hair;
    if (p.hairStyle === 'braid') return `<path d="M232 150 C250 200 246 250 238 300 C234 340 240 380 236 410" stroke="${h}" stroke-width="26" fill="none"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M${226 + (i % 2) * 6} ${180 + i * 30} q12 8 22 0" stroke="${mix(h, -.25)}" stroke-width="3" fill="none"/>`).join('') + `<circle cx="236" cy="418" r="9" fill="#c23a34"/>`;
    if (p.hairStyle === 'ponytail') return `<path d="M236 92 C292 110 290 220 262 300 C256 250 250 180 230 120Z" fill="${h}"/>`;
    if (p.hairStyle === 'wavy') return `<path d="M146 120 C120 200 130 300 150 330 C170 340 190 320 200 300 C210 320 230 340 250 330 C270 300 280 200 254 120Z" fill="${h}"/>`;
    if (p.hairStyle === 'bob') return `<path d="M144 130 C138 190 140 236 150 246 L250 246 C260 236 262 190 256 130Z" fill="${h}"/>`;
    if (p.hairStyle === 'surfer') return `<path d="M146 120 C134 190 140 250 156 262 L244 262 C260 250 266 190 254 120Z" fill="${h}"/>`;
    if (p.hairStyle === 'afro') return `<circle cx="200" cy="112" r="82" fill="${h}"/>` + Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return `<circle cx="${200 + Math.cos(a) * 74}" cy="${112 + Math.sin(a) * 70}" r="18" fill="${h}"/>`; }).join('');
    if (p.hairStyle === 'hijab') return `<path d="M136 120 C130 40 270 40 264 120 L272 250 Q290 300 260 316 L140 316 Q110 300 128 250Z" fill="${mix(p.veil, -.12)}"/>`;
    if (p.hairStyle === 'bun') return `<circle cx="200" cy="58" r="28" fill="${p.hair}"/><path d="M150 176 C138 120 146 74 200 70 C254 74 262 120 250 176 C246 140 240 110 200 104 C160 110 154 140 150 176Z" fill="${p.hair}"/>`;
    return '';
  }
  function hairFront(p) {
    const h = p.hair, hd = mix(h, -.25), hl = mix(h, .25);
    switch (p.hairStyle) {
      case 'beanie': return `<path d="M156 150 q-6 -18 0 -30 l10 4 q-6 12 -2 26z M244 150 q6 -18 0 -30 l-10 4 q6 12 2 26z" fill="${h}"/>` +
        `<path d="M146 122 C138 30 262 30 254 122 Z" fill="#2e5486"/><path d="M142 110 C176 100 224 100 258 110 L258 134 C224 124 176 124 142 134Z" fill="#26466e"/>` +
        Array.from({ length: 7 }, (_, i) => `<path d="M${160 + i * 14} 106 L${158 + i * 14} 128" stroke="#1e3a5c" stroke-width="2"/>`).join('') + `<path d="M170 60 q30 -18 60 0" stroke="#4a72a8" stroke-width="4" fill="none"/>`;
      case 'fade': return `<path d="M150 132 C146 66 254 66 250 132 C244 104 234 92 222 88 C206 96 188 96 170 88 C160 94 154 108 150 132Z" fill="${h}"/><path d="M150 132 C150 120 152 112 156 106 L158 140Z M250 132 C250 120 248 112 244 106 L242 140Z" fill="${mix(h, .15)}" opacity=".7"/>` +
        `<path d="M176 80 q24 -8 48 0" stroke="${hl}" stroke-width="2" fill="none" opacity=".5"/>`;
      case 'curly': return Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (1.05 + i * 0.075); return `<circle cx="${200 + Math.cos(a) * 54}" cy="${112 + Math.sin(a) * 50}" r="17" fill="${i % 2 ? h : mix(h, .08)}"/>`; }).join('') +
        `<circle cx="180" cy="74" r="18" fill="${h}"/><circle cx="214" cy="70" r="18" fill="${mix(h, .08)}"/><circle cx="196" cy="94" r="16" fill="${h}"/><circle cx="154" cy="136" r="12" fill="${h}"/><circle cx="246" cy="136" r="12" fill="${h}"/>`;
      case 'bun': return `<path d="M150 140 C144 70 256 70 250 140 C240 108 224 96 200 96 C176 96 160 108 150 140Z" fill="${h}"/><path d="M152 136 C150 160 152 180 156 196 M248 136 C250 160 248 180 244 196" stroke="${h}" stroke-width="7" fill="none"/>` +
        `<path d="M170 84 q30 -14 60 0 M168 96 q20 -8 30 -4" stroke="${hl}" stroke-width="2" fill="none" opacity=".6"/><circle cx="151" cy="186" r="4" fill="#e2c07a"/><circle cx="249" cy="186" r="4" fill="#e2c07a"/>`;
      case 'scarf': return `<path d="M154 150 q-8 -12 -4 -26 q6 2 10 6z M246 150 q8 -12 4 -26 q-6 2 -10 6z" fill="${h}"/><path d="M144 132 C136 46 264 46 256 132 C240 108 222 100 200 100 C178 100 160 108 144 132Z" fill="#3f7fc8"/>` +
        [[172, 74], [200, 62], [228, 76], [186, 92], [218, 90], [160, 104], [240, 106]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#ffd23a" stroke="none"/>`).join('') + `<path d="M252 112 l30 -4 l-6 22 l-18 -6z M254 118 l26 18 l-14 8z" fill="#3f7fc8"/>`;
      case 'messy': return `<path d="M148 138 C136 72 186 46 230 58 C268 70 262 112 254 140 C250 118 242 104 232 100 L238 126 C226 108 212 100 200 102 L202 130 C190 112 176 106 166 110 C156 116 152 126 148 138Z" fill="${h}"/>` +
        `<path d="M170 64 q24 -12 52 -2 M180 76 q10 10 6 26 M214 70 q14 12 12 30" stroke="${hl}" stroke-width="2" fill="none" opacity=".5"/>`;
      case 'bob': return `<path d="M146 150 C136 70 264 70 254 150 C246 112 228 98 210 96 C196 112 172 120 152 124 C150 132 148 140 146 150Z" fill="${h}"/><path d="M146 150 C146 190 148 220 152 240 M254 150 C254 190 252 220 248 240" stroke="${h}" stroke-width="10" fill="none"/><path d="M176 86 q30 -12 60 2" stroke="${hl}" stroke-width="2" fill="none" opacity=".6"/>`;
      case 'pixie': return `<path d="M150 140 C142 70 258 64 252 132 C246 108 234 96 222 94 C214 106 196 112 176 108 C164 114 156 124 150 140Z" fill="${h}"/><path d="M150 140 l-4 22 M252 132 l2 20" stroke="${h}" stroke-width="8"/><path d="M190 80 q20 -6 40 4" stroke="${hl}" stroke-width="2" fill="none" opacity=".5"/>`;
      case 'braid': return `<path d="M148 146 C138 70 262 70 252 146 C246 116 232 100 200 98 C176 100 158 112 148 146Z" fill="${h}"/><path d="M200 98 C196 110 188 118 176 124 M200 98 C206 110 216 118 228 122" stroke="${hd}" stroke-width="2" fill="none"/><path d="M168 84 q32 -14 64 0" stroke="${hl}" stroke-width="2" fill="none" opacity=".6"/>`;
      case 'ponytail': return `<path d="M148 140 C140 70 260 70 252 140 C248 116 236 102 200 100 C164 102 152 116 148 140Z" fill="${h}"/><path d="M200 100 C188 104 172 112 162 126" stroke="${hd}" stroke-width="2" fill="none"/><rect x="232" y="94" width="14" height="12" rx="4" fill="#c23a34"/><path d="M174 82 q26 -12 54 0" stroke="${hl}" stroke-width="2" fill="none" opacity=".6"/>`;
      case 'wavy': return `<path d="M146 160 C130 70 270 70 254 160 C246 120 232 104 214 100 C204 118 180 128 160 128 C154 138 150 148 146 160Z" fill="${h}"/><path d="M146 160 q-10 30 4 60 q-12 30 4 60 M254 160 q10 30 -4 60 q12 30 -4 60" stroke="${h}" stroke-width="14" fill="none"/><path d="M180 86 q30 -14 56 0" stroke="${hl}" stroke-width="2" fill="none" opacity=".6"/>`;
      case 'slick': return `<path d="M150 134 C144 64 256 62 250 132 C246 104 236 90 200 88 C172 88 158 100 150 134Z" fill="${h}"/><path d="M164 96 q30 -14 74 4 M168 106 q30 -12 70 4" stroke="${hl}" stroke-width="2.4" fill="none" opacity=".7"/><path d="M150 134 L152 150 M250 132 L248 148" stroke="${mix(h, .3)}" stroke-width="5"/>`;
      case 'buzz': return `<path d="M152 128 C148 70 252 70 248 128 C240 106 226 96 200 96 C174 96 160 106 152 128Z" fill="${h}" opacity=".85"/>`;
      case 'surfer': return `<path d="M144 150 C130 66 270 60 256 150 C248 112 236 98 220 96 C210 114 190 116 172 108 C160 118 150 130 144 150Z" fill="${h}"/><path d="M144 150 C140 180 142 210 150 236 M256 150 C260 180 258 210 250 236" stroke="${h}" stroke-width="12" fill="none"/><path d="M196 80 q14 20 -8 34 M224 84 q8 14 -2 26" stroke="${hd}" stroke-width="2" fill="none"/>`;
      case 'afro': return `<path d="M150 132 C146 96 170 84 200 84 C230 84 254 96 250 132 C238 112 220 106 200 106 C180 106 162 112 150 132Z" fill="${h}"/><circle cx="252" cy="98" r="10" fill="#f2c445"/>`;
      case 'hijab': { const v = p.veil, vd = mix(v, -.2); return `<path fill-rule="evenodd" d="M134 132 C128 30 272 30 266 132 L270 240 Q264 282 200 292 Q136 282 130 240Z M160 122 C162 84 238 84 240 122 L240 168 C238 204 222 226 200 230 C178 226 162 204 160 168Z" fill="${v}"/><path d="M162 112 C176 92 224 92 238 112" stroke="${vd}" stroke-width="3" fill="none"/><path d="M134 132 C150 60 250 60 266 132" stroke="${mix(v, .2)}" stroke-width="3" fill="none" opacity=".6"/><path d="M170 250 q30 18 60 0" stroke="${vd}" stroke-width="2.4" fill="none"/>`; }
      case 'bald': return `<path d="M152 150 C148 128 152 116 158 110 L160 146Z M248 150 C252 128 248 116 242 110 L240 146Z" fill="${h}"/><path d="M176 80 q20 -10 44 -2" stroke="#fff" stroke-width="5" fill="none" opacity=".35"/>`;
      case 'receding': return `<path d="M150 156 C146 116 156 94 170 88 L172 120 C164 128 156 140 150 156Z M250 156 C254 116 244 94 230 88 L228 120 C236 128 244 140 250 156Z" fill="${h}"/><path d="M184 84 q16 -5 32 0" stroke="${h}" stroke-width="4" fill="none" opacity=".8"/>`;
    }
    return '';
  }
  function beard(p) {
    switch (p.beard) {
      case 'full': return `<path d="M150 168 C150 246 180 270 200 274 C220 270 250 246 250 168 C244 200 232 216 214 214 C208 206 192 206 186 214 C168 216 156 200 150 168Z" fill="${p.hair}"/><path d="M178 202 C188 194 196 198 200 200 C204 198 212 194 222 202 C226 210 212 208 200 208 C188 208 174 210 178 202Z" fill="${mix(p.hair, -.06)}"/>` +
        `<path d="M170 230 q6 16 14 24 M200 240 v26 M230 230 q-6 16 -14 24" stroke="${mix(p.hair, -.15)}" stroke-width="2" fill="none"/>`;
      case 'short': return `<path d="M152 172 C154 236 182 250 200 252 C218 250 246 236 248 172 C240 204 226 220 200 222 C174 220 160 204 152 172Z" fill="${p.hair}" opacity=".88"/><path d="M182 200 C192 196 208 196 218 200 C210 204 190 204 182 200Z" fill="${p.hair}"/>`;
      case 'mustache': return `<path d="M182 202 C190 194 198 198 200 200 C202 198 210 194 218 202 C222 208 210 206 200 206 C190 206 178 208 182 202Z" fill="${p.hair}"/>`;
      case 'bigMustache': return `<path d="M176 204 C186 192 198 196 200 198 C202 196 214 192 224 204 C230 214 214 210 200 208 C186 210 170 214 176 204Z" fill="${mix(p.hair, -.1)}"/><path d="M160 196 q10 30 40 34 q30 -4 40 -34" fill="#000" opacity=".08" stroke="none"/>`;
    }
    return '';
  }

  /* ---------- outfits ---------- */

  /* ---------- arms & poses ---------- */
  function armGeo(p, side, type) {
    const S = [CX + side * (p.sw - 18), 286];
    const G = {
      down: [[CX + side * (p.sw + 10), 440], [CX + side * (p.sw - 2), 588]],
      hip: [[CX + side * (p.sw + 50), 418], [CX + side * (p.ww + 8), 500]],
      pocket: [[CX + side * (p.sw + 14), 446], [CX + side * (p.hw - 8), 566]],
      hold: [[CX + side * (p.sw + 8), 458], [CX + side * (p.sw - 52), 392]],
      wave: [[CX + side * (p.sw + 56), 236], [CX + side * (p.sw + 46), 112]],
      cross: [[CX + side * (p.sw + 8), 432], [CX - side * 46, side < 0 ? 418 : 404]],
      clasp: [[CX + side * (p.sw + 6), 442], [CX + side * 10, 524]]
    }[type] || [[CX + side * (p.sw + 10), 440], [CX + side * (p.sw - 2), 588]];
    return { S, E: G[0], H: G[1] };
  }
  function handAt(H, E, u, skin, type, side) {
    const a = Math.atan2(H[1] - E[1], H[0] - E[0]) * 180 / Math.PI - 90;
    if (type === 'pocket') return `<path d="M${H[0] - 18} ${H[1] - 4} q18 8 36 0" stroke="${INK}" stroke-width="3" fill="none"/>`;
    const rx = u * .44, ry = u * .54, dk = mix(skin, -.2);
    if (type === 'wave') return `<g transform="translate(${H[0]} ${H[1]}) rotate(${a})"><ellipse cx="0" cy="6" rx="${rx + 2}" ry="${ry}" fill="${skin}" stroke="${INK}" stroke-width="3.4"/>` + [-1, -.35, .3, .95].map(k => `<path d="M${k * rx * .8} ${ry * .5} l${k * 3} ${ry * .75}" stroke="${INK}" stroke-width="${u * .26}" stroke-linecap="round"/><path d="M${k * rx * .8} ${ry * .5} l${k * 3} ${ry * .75}" stroke="${skin}" stroke-width="${u * .26 - 6}" stroke-linecap="round"/>`).join('') + `<ellipse cx="${-side * rx}" cy="0" rx="${rx * .38}" ry="${ry * .5}" fill="${skin}" stroke="${INK}" stroke-width="3" transform="rotate(${side * 30})"/></g>`;
    return `<g transform="translate(${H[0]} ${H[1]}) rotate(${a})"><ellipse cx="0" cy="4" rx="${rx}" ry="${ry}" fill="${skin}" stroke="${INK}" stroke-width="3.4"/><path d="M${-rx * .5} ${ry * .55} v${ry * .3} M0 ${ry * .62} v${ry * .3} M${rx * .5} ${ry * .55} v${ry * .3}" stroke="${dk}" stroke-width="2" fill="none"/><ellipse cx="${-side * rx * .9}" cy="${-ry * .1}" rx="${rx * .36}" ry="${ry * .52}" fill="${skin}" stroke="${INK}" stroke-width="3" transform="rotate(${-side * 18})"/><path d="M${rx * .25} ${-ry * .6} q${rx * .5} ${ry * .4} ${rx * .55} ${ry}" stroke="${dk}" stroke-width="3" fill="none" opacity=".6"/></g>`;
  }
  function item(kind, H) {
    const [x, y] = H;
    switch (kind) {
      case 'cup': return `<path d="M${x - 20} ${y - 46} h40 l-5 50 h-30z" fill="#fbf7ef" stroke="${INK}" stroke-width="3.4"/><path d="M${x - 19} ${y - 30} h38" stroke="#c23a34" stroke-width="7"/><path d="M${x - 6} ${y - 56} q-8 -14 2 -26 M${x + 8} ${y - 56} q8 -14 -2 -26" stroke="#fff" stroke-width="3.4" fill="none" opacity=".75"/>`;
      case 'clipboard': return `<g transform="rotate(-12 ${x} ${y})"><rect x="${x - 34}" y="${y - 70}" width="68" height="92" rx="5" fill="#b8865a" stroke="${INK}" stroke-width="3.4"/><rect x="${x - 26}" y="${y - 60}" width="52" height="74" fill="#fbfbf7" stroke="none"/><rect x="${x - 14}" y="${y - 76}" width="28" height="14" rx="3" fill="#9aa0a8" stroke="${INK}" stroke-width="2.6"/><path d="M${x - 20} ${y - 44} h40 M${x - 20} ${y - 32} h34 M${x - 20} ${y - 20} h38 M${x - 20} ${y - 8} h26" stroke="#7a8a9a" stroke-width="2.4"/></g>`;
      case 'pen': return `<path d="M${x - 4} ${y - 58} l8 0 l2 50 l-6 10 l-6 -10z" fill="#e2b030" stroke="${INK}" stroke-width="3"/>`;
      case 'flower': return [[-16, -70, '#f2c445'], [6, -84, '#ff6a8a'], [20, -64, '#fbfbf7'], [-2, -60, '#9a5ad0']].map(([dx, dy, c]) => `<path d="M${x} ${y - 8} L${x + dx} ${y + dy + 14}" stroke="#3a8a4a" stroke-width="4"/><circle cx="${x + dx}" cy="${y + dy}" r="13" fill="${c}" stroke="${INK}" stroke-width="2.6"/><circle cx="${x + dx}" cy="${y + dy}" r="4" fill="#e2a030" stroke="none"/>`).join('') + `<path d="M${x - 14} ${y - 12} l28 0 l-6 22 h-16z" fill="#7ab86a" stroke="${INK}" stroke-width="2.6"/>`;
      case 'spade': return `<path d="M${x} ${y - 90} L${x + 4} 760" stroke="${INK}" stroke-width="13"/><path d="M${x} ${y - 90} L${x + 4} 760" stroke="#8a6440" stroke-width="7"/><rect x="${x - 18}" y="${y - 104}" width="36" height="14" rx="5" fill="#5a4030" stroke="${INK}" stroke-width="3"/>`;
    }
    return '';
  }
  function arms(p, o, defs, skin) {
    const pose = p.pose || ['down', 'down'];
    const u = 34 + (p.sw - 86) * .45;
    const top = o.top;
    const sleeve = o.jacket || (['cardigan', 'coat', 'suit', 'labcoat'].includes(top) ? o.c1 : o.c1);
    const mode = top === 'tee' && !o.jacket ? 'short' : o.rolled ? 'rolled' : top === 'dress' ? 'three' : 'long';
    const handSkin = o.gloves || skin;
    const one = (side, type) => {
      const { S, E, H } = armGeo(p, side, type);
      let s = '';
      if (type === 'hold' && p.item) s += item(p.item, H);
      if (mode !== 'long') s += limb([S, E, H], u - 4, skin, side);
      if (mode === 'long') s += limb([S, E, lerp(E, H, .86)], u + 2, sleeve, side) + limb([lerp(E, H, .74), lerp(E, H, .86)], u + 6, mix(sleeve, -.12), side);
      else if (mode === 'short') s += limb([S, lerp(S, E, .58)], u + 8, sleeve, side);
      else if (mode === 'rolled') s += limb([S, E, lerp(E, H, .14)], u + 2, sleeve, side) + limb([lerp(E, H, .06), lerp(E, H, .2)], u + 9, mix(sleeve, .18), side);
      else s += limb([S, E, lerp(E, H, .5)], u + 4, sleeve, side) + limb([lerp(E, H, .42), lerp(E, H, .52)], u + 8, mix(sleeve, -.1), side);
      if (type === 'pocket') { const pc = o.jacket || (['coat', 'suit', 'cardigan', 'labcoat'].includes(top) ? o.c1 : (top === 'hoodie' ? o.c1 : o.b)); s = s.replace(limb([S, E, lerp(E, H, .86)], u + 2, sleeve, side), limb([S, E, H], u + 2, sleeve, side)); s += `<rect x="${H[0] - u * .75}" y="${H[1] - 6}" width="${u * 1.5}" height="40" rx="8" fill="${mix(pc, -.06)}" stroke="${INK}" stroke-width="3.4"/><path d="M${H[0] - u * .6} ${H[1] + 2} h${u * 1.2}" stroke="${mix(pc, -.3)}" stroke-width="3"/>`; }
      else s += handAt(H, E, u, handSkin, type, side);
      if (type === 'hold' && p.item === 'cup') s += `<path d="M${H[0] + 16} ${H[1] - 40} q16 4 0 22" stroke="${INK}" stroke-width="5" fill="none"/>`;
      return s;
    };
    if (pose[0] === 'cross' && pose[1] === 'cross') return one(1, 'cross') + one(-1, 'cross');
    return one(-1, pose[0]) + one(1, pose[1]);
  }

  /* ---------- clothes ---------- */
  function outfit(p, defs) {
    const o = p.fit || {}, skin = p.skin, sd = mix(skin, -.2);
    const sp = Math.round(p.sw * .34);
    let s = '';
    // legs / bottoms
    const skinLegs = () => cel(`M${CX - 46} 740 L${CX - 44} 940 L${CX - 12} 940 L${CX - 14} 740Z M${CX + 46} 740 L${CX + 44} 940 L${CX + 12} 940 L${CX + 14} 740Z`, mix(skin, -.05), defs, { split: 26, under: false });
    if (o.top === 'dress') s += skinLegs();
    else if (o.bottom === 'skirt') s += skinLegs() + cel(`M${CX - p.hw} 530 L${CX - p.hw - 18} 792 Q${CX} 806 ${CX + p.hw + 18} 792 L${CX + p.hw} 530Z`, o.b, defs, { split: sp - 10, uy: 760, extra: `<path d="M${CX - 34} 560 L${CX - 44} 800 M${CX + 30} 560 L${CX + 40} 800" stroke="${mix(o.b, -.3)}" stroke-width="3" fill="none"/>` });
    else if (o.bottom === 'shorts') s += cel(legsPath(p), mix(skin, -.04), defs, { split: 6, under: false }) + cel(`M${CX - p.hw} 530 L${CX - p.hw + 2} 712 L${CX - 6} 712 L${CX - 4} 666 Q${CX} 648 ${CX + 4} 666 L${CX + 6} 712 L${CX + p.hw - 2} 712 L${CX + p.hw} 530Z`, o.b, defs, { split: 8, extra: `<path d="M${CX - p.hw + 10} 700 h${p.hw - 18} M${CX + 8} 700 h${p.hw - 18}" stroke="#fff" stroke-width="6" opacity=".8" fill="none"/>` });
    else s += cel(legsPath(p), o.b, defs, { split: 8, under: false, extra: o.bottom === 'jeans' ? `<path d="M${CX - p.hw + 30} 556 q6 70 0 150 M${CX + p.hw - 30} 556 q-6 70 0 150" stroke="${mix(o.b, .35)}" stroke-width="2.4" fill="none" stroke-dasharray="6 5"/>` : `<path d="M${CX - p.hw / 2} 560 L${CX - p.hw / 2 + 4} 940 M${CX + p.hw / 2} 560 L${CX + p.hw / 2 - 4} 940" stroke="${mix(o.b, -.3)}" stroke-width="2.4" fill="none"/>` });
    if (o.overalls) s += cel(legsPath(p), o.overalls, defs, { split: 8, under: false });
    // hood behind
    if (o.top === 'hoodie') s += cel(`M156 258 Q200 222 244 258 Q240 306 200 310 Q160 306 156 258Z`, mix(o.c1, -.12), defs, { split: 30, under: false });
    // neck
    const nw = p.sex === 'f' ? 19 : 25;
    s += `<path d="M${200 - nw} 214 L${200 - nw} 272 Q200 288 ${200 + nw} 272 L${200 + nw} 214Z" fill="${skin}"/><path d="M${200 - nw} 230 Q200 264 ${200 + nw} 230 L${200 + nw} 256 Q200 278 ${200 - nw} 256Z" fill="${sd}" stroke="none"/><path d="M${200 + nw * .3} 240 L${200 + nw} 232 L${200 + nw} 272 L${200 + nw * .4} 276Z" fill="${sd}" stroke="none" opacity=".6"/>`;
    const T = torsoPath(p, o.top === 'coat' || o.top === 'labcoat' ? 600 : 612);
    const panels = (fill, hem, lap) => cel(`M${CX - p.sw - 4} ${SY + 6} C${CX - p.sw - 10} 400 ${CX - p.hw - 12} 560 ${CX - p.hw - 12} ${hem} L${CX - 30} ${hem} L${CX - 22} 380 L${CX - 38} ${SY - 18}Z`, fill, defs, { split: sp, uy: hem - 120 }) +
      cel(`M${CX + p.sw + 4} ${SY + 6} C${CX + p.sw + 10} 400 ${CX + p.hw + 12} 560 ${CX + p.hw + 12} ${hem} L${CX + 30} ${hem} L${CX + 22} 380 L${CX + 38} ${SY - 18}Z`, fill, defs, { split: sp, uy: hem - 120 }) +
      (lap ? `<path d="M${CX - 38} ${SY - 18} L${CX - 58} 320 L${CX - 24} 372Z M${CX + 38} ${SY - 18} L${CX + 58} 320 L${CX + 24} 372Z" fill="${mix(fill, lap)}"/>` : '');
    const knit = (c) => Array.from({ length: 6 }, (_, i) => `<path d="M${136 + i * 26} 300 q-8 30 0 60 q8 30 0 60 q-8 30 0 60 q8 30 0 60" stroke="${mix(c, .16)}" stroke-width="5" fill="none"/>`).join('');
    switch (o.top) {
      case 'tee':
        s += cel(T, o.c1, defs, { split: sp, extra: `<path d="M150 470 q50 18 100 0 M160 520 q40 12 80 0" stroke="${mix(o.c1, -.25)}" stroke-width="2.4" fill="none" opacity=".6"/>` + (o.print ? `<path d="M164 364 q36 -46 72 0 q-36 34 -72 0z" fill="${o.print}"/><circle cx="200" cy="360" r="12" fill="${mix(o.c1, -.35)}"/>` : '') });
        s += `<path d="M172 256 Q200 290 228 256" stroke="${mix(o.c1, -.3)}" stroke-width="6" fill="none"/>`;
        break;
      case 'shirt':
        s += cel(T, o.c1, defs, { split: sp, extra: o.stripes ? Array.from({ length: 9 }, (_, i) => `<path d="M${112 + i * 22} 250 L${110 + i * 22} 620" stroke="${o.stripes}" stroke-width="3.4" opacity=".5"/>`).join('') : '' });
        s += `<path d="M182 252 L200 290 L174 282Z M218 252 L200 290 L226 282Z" fill="${mix(o.c1, .3)}"/><path d="M200 290 V600" stroke="${mix(o.c1, -.35)}" stroke-width="3"/>` + [330, 390, 450].map(y => `<circle cx="206" cy="${y}" r="3.5" fill="#fff"/>`).join('');
        break;
      case 'sweater':
        s += cel(T, o.c1, defs, { split: sp, extra: o.knit ? knit(o.c1) : '' }) + `<path d="M168 260 Q200 292 232 260 Q228 238 200 242 Q172 238 168 260Z" fill="${mix(o.c1, -.15)}"/><path d="M${CX - p.hw} 598 h${p.hw * 2}" stroke="${mix(o.c1, -.25)}" stroke-width="16"/>`;
        break;
      case 'hoodie':
        s += cel(T, o.c1, defs, { split: sp }) + `<path d="M186 282 v60 M214 282 v60" stroke="#f4ecdc" stroke-width="3.4"/><circle cx="186" cy="344" r="4" fill="#f4ecdc"/><circle cx="214" cy="344" r="4" fill="#f4ecdc"/><path d="M146 500 h108 l12 76 h-132z" fill="${mix(o.c1, -.12)}"/><path d="M${CX - p.hw} 606 h${p.hw * 2}" stroke="${mix(o.c1, -.25)}" stroke-width="14"/>`;
        break;
      case 'cardigan':
        s += cel(T, o.c2, defs, { split: sp }) + `<path d="M182 262 L200 302 L218 262" fill="none" stroke="${mix(o.c2, -.25)}" stroke-width="3"/>` + panels(o.c1, 640) + [380, 440, 500, 560].map(y => `<circle cx="${CX - 30}" cy="${y}" r="5.5" fill="${mix(o.c1, -.35)}"/>`).join('');
        break;
      case 'coat':
        s += cel(T, o.c2, defs, { split: sp, extra: o.knit ? knit(o.c2) : '' }) + panels(o.c1, 790, -.14) + `<path d="M${CX - p.hw - 4} 560 h56 M${CX + p.hw + 4} 560 h-56" stroke="${mix(o.c1, -.35)}" stroke-width="4"/><rect x="${CX - p.hw + 2}" y="560" width="56" height="44" rx="5" fill="${mix(o.c1, -.08)}"/><rect x="${CX + p.hw - 58}" y="560" width="56" height="44" rx="5" fill="${mix(o.c1, -.18)}"/>`;
        break;
      case 'suit':
        s += cel(T, o.c2, defs, { split: sp }) + (o.tie ? `<path d="M193 266 L207 266 L213 298 L205 430 L200 444 L195 430 L187 298Z" fill="${o.tie}"/><path d="M193 266 L207 266 L204 282 L196 282Z" fill="${mix(o.tie, -.25)}"/>` : `<path d="M182 260 L200 300 L218 260" fill="none" stroke="${mix(o.c2, -.3)}" stroke-width="3"/>`) + panels(o.c1, 660, .14) + `<circle cx="${CX - 30}" cy="520" r="6" fill="${mix(o.c1, -.45)}"/>` + (o.pocket ? `<path d="M${CX + 48} 362 l16 -14 l8 18z" fill="${o.pocket}"/>` : '');
        break;
      case 'labcoat':
        s += cel(T, o.c2, defs, { split: sp }) + `<path d="M180 266 L200 316 L220 266" fill="none" stroke="${mix(o.c2, -.3)}" stroke-width="4"/>` + panels(o.c1, 830, -.06) + `<rect x="${CX + 34}" y="400" width="44" height="50" rx="4" fill="${mix(o.c1, -.06)}"/><path d="M${CX + 44} 400 v-16 M${CX + 58} 400 v-20" stroke="#3a6aa0" stroke-width="5"/>`;
        break;
      case 'dress':
        s += cel(`M${CX - p.sw} ${SY + 6} C${CX - p.sw - 4} 330 ${CX - p.ww - 6} 400 ${CX - p.ww} 470 L${CX - p.hw - 32} 792 Q${CX} 808 ${CX + p.hw + 32} 792 L${CX + p.ww} 470 C${CX + p.ww + 6} 400 ${CX + p.sw + 4} 330 ${CX + p.sw} ${SY + 6} C${CX + p.sw - 20} ${SY - 18} ${CX + 44} ${SY - 26} ${CX} ${SY - 24} C${CX - 44} ${SY - 26} ${CX - p.sw + 20} ${SY - 18} ${CX - p.sw} ${SY + 6}Z`, o.c1, defs, { split: sp, uy: 740 }) + (o.collar ? `<path d="M174 258 L200 294 L226 258 L214 252 L200 274 L186 252Z" fill="${o.collar}"/>` : '');
        break;
      case 'uniform':
        s += cel(T, o.c1, defs, { split: sp }) + `<path d="M182 260 L200 296 L218 260" fill="none" stroke="${mix(o.c1, -.35)}" stroke-width="4"/><path d="M200 296 V600" stroke="${mix(o.c1, -.35)}" stroke-width="3"/><rect x="${CX - 72}" y="330" width="46" height="42" rx="5" fill="${mix(o.c1, .1)}"/><rect x="${CX + 26}" y="330" width="46" height="42" rx="5" fill="${mix(o.c1, -.1)}"/><path d="M${CX - p.sw + 6} ${SY + 8} h44 M${CX + p.sw - 6} ${SY + 8} h-44" stroke="${mix(o.c1, -.35)}" stroke-width="10"/><rect x="${CX - p.hw}" y="536" width="${p.hw * 2}" height="24" fill="#18181e"/><rect x="${CX - 15}" y="538" width="30" height="20" rx="3" fill="#c8c8c0"/>`;
        break;
      default: s += cel(T, o.c1 || '#777', defs, { split: sp });
    }
    if (o.jacket) s += panels(o.jacket, 646, -.1);
    if (o.overalls) s += cel(`M${CX - 70} 330 L${CX + 70} 330 L${CX + p.hw} 540 L${CX - p.hw} 540Z`, o.overalls, defs, { split: sp, under: false }) + `<path d="M${CX - 70} 334 L${CX - 46} 262 M${CX + 70} 334 L${CX + 46} 262" stroke="${o.overalls}" stroke-width="14"/><circle cx="${CX - 62}" cy="338" r="6" fill="#e2c07a"/><circle cx="${CX + 62}" cy="338" r="6" fill="#e2c07a"/><path d="M${CX - 70} 330 L${CX + 70} 330 L${CX + p.hw} 540 L${CX - p.hw} 540Z" fill="none"/>`;
    if (o.apron) s += cel(`M${CX - 66} ${o.top === 'dress' ? 420 : 338} L${CX + 66} ${o.top === 'dress' ? 420 : 338} L${CX + 80} 790 L${CX - 80} 790Z`, o.apron, defs, { split: sp - 6, uy: 740, extra: o.floral ? [[176, 400], [222, 440], [190, 500], [236, 560], [166, 610], [214, 670], [180, 730], [228, 760]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#e2483c" stroke="none"/><circle cx="${x + 10}" cy="${y + 5}" r="4.5" fill="#4a9a5a" stroke="none"/>`).join('') : '' }) + (o.top === 'dress' ? '' : `<path d="M${CX - 66} 340 L${CX - 30} 262 M${CX + 66} 340 L${CX + 30} 262" stroke="${o.apron}" stroke-width="9"/>`) + `<rect x="${CX - 38}" y="482" width="76" height="56" rx="7" fill="${mix(o.apron, -.08)}"/>` + (o.pen ? `<rect x="${CX + 14}" y="464" width="8" height="46" rx="2" fill="#2a64c0"/>` : '');
    if (o.apronWaist) s += cel(`M${CX - p.hw - 4} 500 L${CX + p.hw + 4} 500 L${CX + p.hw - 2} 840 L${CX - p.hw + 2} 840Z`, o.apronWaist, defs, { split: sp, under: false }) + `<path d="M${CX - p.hw - 8} 498 h${p.hw * 2 + 16}" stroke="#111" stroke-width="11"/>`;
    if (o.scarf) s += `<path d="M162 250 Q200 294 238 250 L242 276 Q200 318 158 276Z" fill="${o.scarf}"/><path d="M214 282 L232 390 L208 394 L202 292Z" fill="${mix(o.scarf, -.15)}"/><path d="M212 340 l18 -3 M214 362 l18 -3" stroke="${mix(o.scarf, .3)}" stroke-width="3"/>`;
    if (o.towel) s += `<path d="M${CX + 36} 258 Q${CX + p.sw + 14} 258 ${CX + p.sw + 8} 344 L${CX + p.sw - 22} 350 Q${CX + p.sw - 24} 296 ${CX + 30} 282Z" fill="#fbfbf7"/><path d="M${CX + p.sw - 8} 270 l12 72" stroke="#d2483c" stroke-width="5"/>`;
    if (o.steth) s += `<path d="M176 266 C166 330 184 376 204 382 M224 266 C236 330 222 376 204 382" stroke="#3a3a44" stroke-width="5" fill="none"/><circle cx="204" cy="388" r="11" fill="#b8bec6"/>`;
    if (o.headphones) s += `<path d="M160 254 C146 240 148 212 156 204 M240 254 C254 240 252 212 244 204" stroke="#2a2a30" stroke-width="7" fill="none"/><ellipse cx="158" cy="252" rx="13" ry="17" fill="#2a2a30"/><ellipse cx="242" cy="252" rx="13" ry="17" fill="#2a2a30"/>`;
    if (o.brooch) s += `<circle cx="${CX - 48}" cy="332" r="10" fill="${o.brooch}"/><circle cx="${CX - 51}" cy="329" r="3" fill="#fff" stroke="none"/>`;
    if (o.badge) s += `<path d="M${CX + 40} 340 l11 -9 l11 9 l-2 15 l-9 7 l-9 -7z" fill="#e2c07a"/>`;
    if (o.pins) s += `<circle cx="${CX - 44}" cy="340" r="10" fill="#3aa86a"/><circle cx="${CX - 22}" cy="358" r="9" fill="#e2483c"/><circle cx="${CX + 40}" cy="352" r="10" fill="#3a8ad0"/>`;
    if (o.tag) s += `<rect x="${CX + (o.overalls ? -48 : 42)}" y="${o.overalls ? 380 : 350}" width="${o.tag.length * 10 + 14}" height="26" rx="5" fill="#fbfbf7"/><text x="${CX + (o.overalls ? -48 : 42) + (o.tag.length * 10 + 14) / 2}" y="${o.overalls ? 399 : 369}" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="17" fill="${o.overalls || '#d23f34'}" stroke="none">${o.tag}</text>`;
    s += arms(p, o, defs, skin);
    return s;
  }

  /* ---------- the face ---------- */
  function head(p, e, defs) {
    const f = p.sex === 'f', skin = p.skin, sd = mix(skin, -.2), deep = mix(skin, -.36);
    const lip = f ? mix('#d0606a', 0) : mix(skin, -.3);
    const F = f ? 'M150 118 C148 60 252 60 250 118 C252 166 238 212 200 232 C162 212 148 166 150 118Z' : 'M148 116 C147 58 253 58 252 116 C254 168 242 210 216 230 L200 238 L184 230 C158 210 146 168 148 116Z';
    let s = '';
    [[-1, 151], [1, 249]].forEach(([sg, x]) => { s += `<ellipse cx="${x}" cy="160" rx="${f ? 8 : 10}" ry="${f ? 15 : 17}" fill="${sg > 0 ? sd : skin}"/><path d="M${x - sg * 2} 152 q${sg * 5} 8 0 16" stroke="${deep}" stroke-width="2" fill="none"/>`; });
    s += cel(F, skin, defs, { split: 30, under: false, rim: 44, dk: -.13, w: 3.6, extra: `<path d="M140 50 L262 50 L262 112 C232 98 168 98 140 114Z" fill="#000" opacity=".1"/><path d="M150 196 C170 236 230 236 252 196 L252 260 L150 260Z" fill="${sd}" opacity=".5"/>` });
    if (p.age >= 45) s += `<path d="M170 102 q30 -8 60 0" stroke="${sd}" stroke-width="2" fill="none" opacity=".75"/><path d="M180 196 q-7 12 -4 22 M220 196 q7 12 4 22" stroke="${sd}" stroke-width="2" fill="none" opacity=".75"/>`;
    if (p.age >= 60) s += `<path d="M164 92 q36 -10 72 0 M158 156 l-8 4 M242 156 l8 4 M160 163 l-8 6 M240 163 l8 6" stroke="${sd}" stroke-width="2" fill="none" opacity=".85"/>`;
    s += `<ellipse cx="170" cy="186" rx="15" ry="8" fill="#ff6a6a" opacity="${f ? .26 : .1}" stroke="none"/><ellipse cx="230" cy="186" rx="15" ry="8" fill="#ff6a6a" opacity="${f ? .26 : .1}" stroke="none"/>`;
    const P = { neutral: [11, 7, 0, 0], smile: [10, 3, 1, 0], sad: [9, 7, -5, 3], angry: [7, 6, 6, -1], shock: [14, 11, 0, 0] }[e] || [11, 7, 0, 0];
    const eye = (cx, side) => {
      const dir = side, yc = 152, xo = cx + dir * 16, xi = cx - dir * 14, yo = yc - (f ? 2.5 : 1), yi = yc + 1;
      const [top, bot, tin, tout] = P;
      const topD = `M${xi} ${yi} C${xi + dir * 7} ${yc - top + tin} ${xo - dir * 6} ${yc - top + tout} ${xo} ${yo}`;
      const d = topD + ` C${xo - dir * 6} ${yc + bot} ${xi + dir * 7} ${yc + bot} ${xi} ${yi}Z`;
      const id = 'pe' + (++uid); defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
      const r = e === 'shock' ? 7.5 : 9.6, ix = cx + dir * .5, iy = yc + 1;
      let o = `<path d="${d}" fill="#fdfaf6" stroke="none"/><g clip-path="url(#${id})" stroke="none">` +
        `<circle cx="${ix}" cy="${iy}" r="${r}" fill="${p.eye}"/><circle cx="${ix}" cy="${iy + r * .35}" r="${r * .62}" fill="${mix(p.eye, .4)}" opacity=".6"/>` +
        `<circle cx="${ix}" cy="${iy}" r="${r}" fill="none" stroke="${mix(p.eye, -.45)}" stroke-width="1.8"/><circle cx="${ix}" cy="${iy}" r="${r * .44}" fill="#120c12"/>` +
        `<circle cx="${ix + 3.4}" cy="${iy - 3.6}" r="3.2" fill="#fff"/><circle cx="${ix - 3.2}" cy="${iy + 3.8}" r="1.5" fill="#fff" opacity=".9"/>` +
        `<path d="${topD}" stroke="${sd}" stroke-width="5" fill="none" opacity=".45"/></g>`;
      o += `<path d="${topD}" stroke="${INK}" stroke-width="${f ? 4.8 : 4}" fill="none" stroke-linecap="round"/>`;
      if (f) o += `<path d="M${xo} ${yo} l${dir * 7} -5 M${xo - dir * 4} ${yo - 4} l${dir * 5} -6" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>`;
      o += `<path d="M${xo - dir * 2} ${yo + 2} C${xo - dir * 6} ${yc + bot} ${cx} ${yc + bot + .5} ${xi + dir * 4} ${yi + 1}" stroke="${e === 'smile' ? INK : sd}" stroke-width="${e === 'smile' ? 2.4 : 1.8}" fill="none"/>`;
      if (e !== 'angry') o += `<path d="M${xi + dir * 3} ${yc - top - 4 + tin * .6} Q${cx} ${yc - top - 10} ${xo - dir * 2} ${yc - top - 3 + tout * .6}" stroke="${sd}" stroke-width="1.8" fill="none"/>`;
      return o;
    };
    s += eye(176, -1) + eye(224, 1);
    const B = { neutral: [134, 128, 133], smile: [131, 125, 131], sad: [126, 128, 137], angry: [140, 131, 128], shock: [124, 118, 126] }[e] || [134, 128, 133];
    [[176, -1], [224, 1]].forEach(([cx, dir]) => { s += `<path d="M${cx - dir * 13} ${B[0]} Q${cx + dir * 2} ${B[1] - 3} ${cx + dir * 18} ${B[2]}" stroke="${p.brow}" stroke-width="${f ? 4.6 : 6.6}" fill="none" stroke-linecap="round"/><path d="M${cx - dir * 13} ${B[0]} Q${cx - dir * 6} ${B[0] - 2} ${cx} ${B[1] - 1}" stroke="${p.brow}" stroke-width="${f ? 6 : 8}" fill="none" stroke-linecap="round"/>`; });
    s += `<path d="M203 162 C206 174 210 184 205 191" stroke="${sd}" stroke-width="${f ? 2.4 : 3}" fill="none"/><path d="M192 191 q4 4 8 1 M206 192 q-3 2 -6 0" stroke="${deep}" stroke-width="2.2" fill="none"/><ellipse cx="198" cy="183" rx="3" ry="4" fill="#fff" opacity=".35" stroke="none"/>`;
    const M = {
      neutral: f ? `<path d="M185 207 Q192 201 200 204 Q208 201 215 207 Q200 210 185 207Z" fill="${lip}" stroke="none"/><path d="M187 208 Q200 219 213 208 Q200 211 187 208Z" fill="${mix(lip, .12)}" stroke="none"/><path d="M185 207 Q200 211 215 207" stroke="${mix(lip, -.4)}" stroke-width="2.2" fill="none"/><ellipse cx="203" cy="213" rx="4" ry="1.6" fill="#fff" opacity=".45" stroke="none"/>` : `<path d="M187 208 Q200 211 213 207" stroke="${deep}" stroke-width="2.8" fill="none"/><path d="M194 217 q6 2 12 0" stroke="${sd}" stroke-width="2" fill="none"/>`,
      smile: `<path d="M181 202 Q200 207 219 202 Q215 224 200 226 Q185 224 181 202Z" fill="#6a1e26" stroke="${INK}" stroke-width="2.6"/><path d="M184 204 Q200 208 216 204 L214 211 Q200 214 186 211Z" fill="#fff" stroke="none"/><ellipse cx="200" cy="220" rx="8" ry="3.4" fill="#e0606c" stroke="none"/><path d="M176 199 q-3 5 1 9 M224 199 q3 5 -1 9" stroke="${sd}" stroke-width="2.2" fill="none"/>` + (f ? `<path d="M181 202 Q200 207 219 202" stroke="${lip}" stroke-width="2.4" fill="none"/>` : ''),
      sad: `<path d="M187 214 Q200 205 213 214" stroke="${f ? mix(lip, -.3) : deep}" stroke-width="3.2" fill="none"/>` + (f ? `<path d="M190 216 Q200 211 210 216" stroke="${lip}" stroke-width="2.6" fill="none"/>` : ''),
      angry: `<path d="M184 208 Q200 203 216 208 L214 215 Q200 212 186 215Z" fill="#fff" stroke="${INK}" stroke-width="2.6"/><path d="M186 211.5 h28" stroke="#c8c0c0" stroke-width="1.6"/><path d="M180 196 q-5 9 -2 18 M220 196 q5 9 2 18" stroke="${sd}" stroke-width="2.2" fill="none"/>`,
      shock: `<ellipse cx="200" cy="214" rx="9" ry="11.5" fill="#5a1820" stroke="${INK}" stroke-width="2.6"/><ellipse cx="200" cy="221" rx="5.5" ry="3" fill="#d8606a" stroke="none"/>`
    };
    s += M[e] || M.neutral;
    if (p.glasses) s += `<rect x="157" y="136" width="38" height="30" rx="10" fill="#fff" fill-opacity=".14" stroke="#2a2a30" stroke-width="3.2"/><rect x="205" y="136" width="38" height="30" rx="10" fill="#fff" fill-opacity=".14" stroke="#2a2a30" stroke-width="3.2"/><path d="M195 148 h10 M157 146 l-8 -2 M243 146 l8 -2" stroke="#2a2a30" stroke-width="3"/><path d="M162 142 l10 0 l-10 14z M210 142 l10 0 l-10 14z" fill="#fff" opacity=".35" stroke="none"/>`;
    return s;
  }
  /* glossy hair: a highlight band and a cel shadow clipped to the hair shapes */
  function hairShine(p, front, defs) {
    if (['beanie', 'scarf', 'hijab', 'bald'].includes(p.hairStyle) || !front) return '';
    const id = 'ph' + (++uid);
    const shapes = front.replace(/<path[^>]*fill="none"[^>]*\/>/g, '').replace(/ stroke(-width)?="[^"]*"/g, '');
    defs.push(`<clipPath id="${id}">${shapes}</clipPath>`);
    const hl = mix(p.hair, p.hair === '#efede8' || p.hair === '#ece9e3' ? -.1 : .34);
    return `<g clip-path="url(#${id})" stroke="none"><path d="M210 40 L300 40 L300 300 L222 300 C236 200 230 120 210 40Z" fill="#000" opacity=".16"/><path d="M158 96 Q200 64 242 96" stroke="${hl}" stroke-width="6" fill="none" opacity=".5"/><path d="M166 108 Q200 84 234 108" stroke="${hl}" stroke-width="2.6" fill="none" opacity=".45"/><path d="M170 90 q8 20 4 40 M196 84 q6 22 2 44 M222 88 q6 20 2 40" stroke="${mix(p.hair, -.3)}" stroke-width="2.2" fill="none" opacity=".55"/></g>`;
  }

  function draw(id, expr = 'neutral') {
    const p = SPEC[id]; if (!p) return '';
    const defs = [];
    const body = outfit(p, defs);
    const capless = ['beanie', 'scarf', 'hijab', 'bald'].includes(p.hairStyle);
    const skull = capless ? '' : `<path d="M145 136 C136 34 264 34 255 136 C244 112 224 100 200 99 C176 100 156 112 145 136Z" fill="${p.hair}" opacity="${p.hairStyle === 'buzz' ? .9 : 1}"/>`;
    const hf = skull + hairFront(p);
    const h = head(p, expr, defs);
    const shine = hairShine(p, hf, defs);
    const hs = `translate(200 268) scale(1.17) translate(-200 -268)`;
    const shadow = `<ellipse cx="200" cy="716" rx="${p.hw + 40}" ry="14" fill="#000" opacity=".18"/>`;
    return `<svg viewBox="0 2 400 716" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet"><defs>${defs.join('')}</defs>` + shadow +
      `<g stroke="${INK}" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"><g transform="${hs}">${hairBack(p)}</g>${body}<g transform="${hs}">${h}${beard(p)}${hf}${shine}</g></g></svg>`;
  }

  /* ---------- optional real images: img/chars/<id>-<expr>.png, img/bg/<id>.jpg|png ---------- */
  const IMG = { chars: {}, bg: {} };
  function probe(url, onok) { return new Promise(res => { const im = new Image(); im.onload = () => { onok(url); res(); }; im.onerror = () => res(); im.src = url; }); }
  /* looks for real pictures; resolves when every probe has answered (or after a short timeout) */
  function scan(charIds, bgIds) {
    const exprs = ['neutral', 'smile', 'sad', 'angry', 'shock'], jobs = [];
    charIds.forEach(id => exprs.forEach(e => jobs.push(probe(`img/chars/${id}-${e}.png`, u => { (IMG.chars[id] = IMG.chars[id] || {})[e] = u; }))));
    bgIds.forEach(id => ['jpg', 'png', 'webp'].forEach(ext => jobs.push(probe(`img/bg/${id}.${ext}`, u => { IMG.bg[id] = u; }))));
    return Promise.race([Promise.all(jobs), new Promise(r => setTimeout(r, 2500))]);
  }
  return { draw, SPEC, IMG, scan };
})();

/* hook into ART */
(function () {
  const svgBg = ART.bg;
  ART.portrait = (id, e = 'neutral') => {
    const im = PEOPLE.IMG.chars[id];
    if (im && (im[e] || im.neutral)) return `<img src="${im[e] || im.neutral}" alt="" style="width:100%;height:100%;object-fit:contain;object-position:bottom">`;
    return PEOPLE.draw(id, e);
  };
  ART.bg = (id, t) => {
    const u = PEOPLE.IMG.bg[id];
    if (u) return `<img src="${u}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`;
    return svgBg(id, t);
  };
})();
