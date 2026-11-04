/* =====================================================================
   A chapter card: a full-screen picture that is alive for a moment
   (slow push-in, rain, rings on the water, one piece of paper rocking),
   the story lines as captions over it, then the chapter's title.
     { mini: 'chapterCard', img, float: [left, top, width, height] (% of the picture),
       lines: [T(..), ..], kicker: T(..), title: T(..), sub: T(..) }
   Tap (or "Go on") to move on. Used at the end of Elias's chapter (js/marks.js).
   ===================================================================== */
'use strict';
(function () {
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  GAME.MINI.chapterCard = function (panel, done, st) {
    panel.innerHTML = '';
    const src = (typeof IMG_MANIFEST !== 'undefined' && IMG_MANIFEST.bg && IMG_MANIFEST.bg[st.img]) || ('img/bg/' + st.img + '.jpg');
    const box = el('div', 'chc');
    const bg = el('div', 'chc-bg'); bg.style.backgroundImage = `url("${src}")`; box.appendChild(bg);
    const pic = el('div', 'chc-pic'); pic.style.backgroundImage = `url("${src}")`; box.appendChild(pic);
    const AR = st.ar || (1672 / 941);
    /* the whole picture always shows (it is fitted, not cropped), so the floating piece stays on its paper */
    const fit = () => { const W = box.clientWidth, H = box.clientHeight; let w = W, h = W / AR; if (h > H) { h = H; w = H * AR; } Object.assign(pic.style, { width: w + 'px', height: h + 'px', left: (W - w) / 2 + 'px', top: (H - h) / 2 + 'px' }); };
    window.addEventListener('resize', fit);
    if (st.float && !REDUCED()) {
      const [l, t, w, h] = st.float;
      const f = el('div', 'chc-float');
      Object.assign(f.style, { left: l + '%', top: t + '%', width: w + '%', height: h + '%', backgroundImage: `url("${src}")`, backgroundSize: (10000 / w) + '% ' + (10000 / h) + '%', backgroundPosition: (l / (100 - w) * 100) + '% ' + (t / (100 - h) * 100) + '%' });
      pic.appendChild(f);
      for (let i = 0; i < 3; i++) { const r = el('i', 'chc-ring'); r.style.left = (l + w / 2) + '%'; r.style.top = (t + h * 0.72) + '%'; r.style.animationDelay = (i * 1.1) + 's'; pic.appendChild(r); }
    }
    if (!REDUCED()) box.appendChild(el('div', 'chc-rain'));
    const cap = el('p', 'chc-cap'); box.appendChild(cap);
    box.dir = GAME.lang === 'ar' ? 'rtl' : 'ltr';
    const card = el('div', 'chc-title');
    card.innerHTML = '<small></small><b></b><span></span>';
    card.querySelector('small').textContent = tx(st.kicker || '');
    card.querySelector('b').textContent = tx(st.title || '');
    card.querySelector('span').textContent = tx(st.sub || '');
    box.appendChild(card);
    $('stage').appendChild(box); fit(); requestAnimationFrame(() => box.classList.add('on'));

    const lines = (st.lines || []).map(l => tx(l));
    let i = -1, over = false;
    const alt = el('button', 'opt main cp-alt', tx(T('Go on', '{كمل|كملي}'))); alt.type = 'button'; panel.appendChild(alt);
    const next = ev => {
      if (ev) ev.stopPropagation();
      if (over) return;
      i++;
      if (i < lines.length) { cap.classList.remove('on'); setTimeout(() => { cap.textContent = lines[i]; cap.classList.add('on'); }, i ? 260 : 0); return; }
      if (i === lines.length) { cap.classList.remove('on'); box.classList.add('dark'); return; }
      over = true; alt.remove(); window.removeEventListener('resize', fit); box.classList.add('out'); setTimeout(() => box.remove(), 600); done(1);   /* the story goes on at once; the card fades away on top */
    };
    setTimeout(next, 900);
    setTimeout(() => box.addEventListener('click', next), 1000); alt.onclick = next;
  };
})();
