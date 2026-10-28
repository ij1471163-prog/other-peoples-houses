/* =====================================================================
   Moments you do with your own hand: frames cut from a short video,
   and your finger moves them. Drag, and the stone lifts with you; let
   go too soon, and it settles back. Reach the end, and it's done.
     { mini: 'scrub', dir: 'img/fx/step/', frames: 44, ext: 'jpg', drag: 'up',
       hint: T(...), snd: 'step-lift', ratio: 900 / 290, then: (r, s) => [...] }
   ===================================================================== */
'use strict';
(function () {
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const s = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (s.master || 0.8) * (s.sfx || 0.7) * k)); };
  GAME.MINI.scrub = function (panel, done, st) {
    panel.innerHTML = '';
    const n = st.frames, up = (st.drag || 'up') === 'up';
    const box = el('div', 'cp sc-wrap'), cv = el('canvas', 'sc-cv'), hint = el('div', 'sc-hint', tx(st.hint || T('Drag', '{اسحب|اسحبي}')));
    hint.insertAdjacentHTML('afterbegin', `<i class="sc-arrow ${up ? 'up' : 'right'}"></i>`);
    box.append(cv, hint); $('stage').appendChild(box);
    const alt = el('button', 'opt main cp-alt', tx(T('Do it', '{سوها|سويها}'))); alt.type = 'button'; panel.appendChild(alt);
    const imgs = []; for (let i = 0; i < n; i++) { const im = new Image(); im.src = st.dir + String(i).padStart(2, '0') + '.' + (st.ext || 'jpg'); imgs.push(im); }
    const ctx = cv.getContext('2d');
    const size = () => { const r = box.getBoundingClientRect(), k = Math.min(r.width / st.ratio, r.height * 0.86); cv.width = Math.round(k * st.ratio * devicePixelRatio); cv.height = Math.round(k * devicePixelRatio); cv.style.width = k * st.ratio + 'px'; cv.style.height = k + 'px'; draw(true); };
    let p = 0, last = -1, over = false;
    function draw(force) {
      const i = Math.max(0, Math.min(n - 1, Math.round(p * (n - 1))));
      if (i === last && !force) return; const im = imgs[i];
      if (!im.complete) { im.onload = () => draw(true); return; }
      last = i; ctx.drawImage(im, 0, 0, cv.width, cv.height);
    }
    /* the clip's own sound, a little at a time, as you move */
    const snd = st.snd && on() ? new Audio('img/snd/' + st.snd + '.mp3') : null; let sT = 0, sAt = 0;
    if (snd) snd.volume = vol(0.9);
    const rub = () => { if (!snd || !isFinite(snd.duration)) return; if (Math.abs(p - sAt) < 0.04) return; sAt = p; try { snd.currentTime = 0.4 + p * (snd.duration - 0.6); snd.play().catch(() => {}); clearTimeout(sT); sT = setTimeout(() => snd.pause(), 220); } catch (e) { /* none */ } };
    let y0 = 0, x0 = 0, p0 = 0, drag = false, back = 0;
    const span = () => (up ? box.clientHeight * 0.55 : box.clientWidth * 0.5);
    const down = ev => { if (over) return; drag = true; cancelAnimationFrame(back); y0 = ev.clientY; x0 = ev.clientX; p0 = p; box.setPointerCapture && box.setPointerCapture(ev.pointerId); hint.classList.add('gone'); };
    const move = ev => { if (!drag || over) return; const d = up ? (y0 - ev.clientY) : (ev.clientX - x0); p = Math.max(0, Math.min(1, p0 + d / span())); draw(); rub(); if (p >= 0.985) finish(); };
    const upEv = () => { if (!drag || over) return; drag = false;
      /* too soon: it settles back, slowly, under its own weight */
      const fall = () => { p = Math.max(0, p - 0.035); draw(); if (p > 0) back = requestAnimationFrame(fall); else hint.classList.remove('gone'); };
      if (p > 0) back = requestAnimationFrame(fall); };
    function finish(skip) {
      if (over) return; over = true; drag = false; p = 1; draw(true);
      if (snd && !skip) { try { snd.currentTime = Math.max(0, snd.duration - 1.2); snd.play().catch(() => {}); } catch (e) { /* none */ } }
      setTimeout(() => { alt.remove(); box.classList.add('out'); setTimeout(() => { box.remove(); if (snd) snd.pause(); }, 400); done(1); }, skip ? 50 : 1100);
    }
    box.addEventListener('pointerdown', down); box.addEventListener('pointermove', move);
    box.addEventListener('pointerup', upEv); box.addEventListener('pointercancel', upEv);
    alt.onclick = () => finish(true);
    requestAnimationFrame(size); addEventListener('resize', size, { once: true });
  };
})();
