/* =====================================================================
   Playing again goes fast: the game remembers, on this device, every
   line you have already read. When a line you have read comes up, a
   "Skip read ⏩" button sits next to Continue. Tapping it races through
   lines you have read and stops at the first new line, any choice, a
   mini-game or the end of the scene. Nothing in the story changes.
   ===================================================================== */
'use strict';
(function () {
  const KEY = 'oph.read';
  const L = { skip: T('Skip read ⏩', '{تخطّ|تخطّي} المقروء ⏩') };
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
  let READ = new Set();
  try { (localStorage.getItem(KEY) || '').split(',').forEach(x => x && READ.add(x)); } catch (e) { /* private window */ }
  let saveT = 0;
  const store = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, [...READ].join(',')); } catch (e) { /* full or blocked */ } }, 800); };
  const keyOf = st => { const t = st.t || st.n; const en = t && typeof t === 'object' ? (t.en || '') : String(t || ''); return hash((st.c || '') + '|' + en); };

  let skipping = false;
  const rl0 = renderLine;
  renderLine = function (st) {
    const k = keyOf(st), seen = READ.has(k);
    if (skipping && seen && RUN) { READ.add(k); setTimeout(() => { if (skipping && RUN) next(); }, 35); return; }
    skipping = false;
    const r = rl0.apply(this, arguments);
    READ.add(k); store();
    if (seen) {
      const panel = $('panel'), tap = panel && panel.querySelector('.tap');
      if (tap) {
        const b = el('button', 'tap skipread', tx(L.skip)); b.type = 'button';
        b.onclick = ev => { ev.stopPropagation(); if (!tapOk(ev)) return; skipping = true; next(); };
        const row = el('div', 'tap-row'); tap.parentNode.insertBefore(row, tap); row.appendChild(b); row.appendChild(tap);
      }
    }
    return r;
  };
  /* a choice, a mini-game or an ending always stops the race */
  const rm0 = renderMenu; renderMenu = function () { skipping = false; return rm0.apply(this, arguments); };
  if (typeof renderMini === 'function') { const mi0 = renderMini; renderMini = function () { skipping = false; return mi0.apply(this, arguments); }; }
  if (typeof showEnding === 'function') { const se0 = showEnding; showEnding = function () { skipping = false; return se0.apply(this, arguments); }; }
  const as0 = afterScript; afterScript = function () { skipping = false; return as0.apply(this, arguments); };
})();
