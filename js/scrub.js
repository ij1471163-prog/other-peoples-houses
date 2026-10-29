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
    box.append(cv, el('i', 'sc-vig'), hint); $('stage').appendChild(box);
    /* the camera leans in to the spot in the scene, then the moment takes over */
    const scene = document.querySelector('#stage .scene');
    if (st.zoom && scene && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scene.style.transformOrigin = st.zoom.x + '% ' + st.zoom.y + '%'; scene.style.transition = 'transform .85s cubic-bezier(.5,0,.7,1), filter .85s';
      requestAnimationFrame(() => { scene.style.transform = 'scale(2.6)'; scene.style.filter = 'blur(2px)'; });
      setTimeout(() => box.classList.add('in'), 700);
    } else box.classList.add('in');
    const unzoom = () => { if (!scene || !st.zoom) return; scene.style.transition = 'transform .6s ease-out, filter .6s'; scene.style.transform = ''; scene.style.filter = ''; setTimeout(() => { scene.style.transition = ''; scene.style.transformOrigin = ''; }, 700); };
    const alt = el('button', 'opt main cp-alt', tx(T('Do it', '{سوها|سويها}'))); alt.type = 'button'; panel.appendChild(alt);
    const imgs = []; for (let i = 0; i < n; i++) { const im = new Image(); im.src = st.dir + String(i).padStart(2, '0') + '.' + (st.ext || 'jpg'); imgs.push(im); }
    const ctx = cv.getContext('2d');
    /* it fills the whole stage, like the scene itself (cover) */
    const size = () => { const r = box.getBoundingClientRect(); cv.width = Math.round(r.width * devicePixelRatio); cv.height = Math.round(r.height * devicePixelRatio); draw(true); };
    let p = 0, last = -1, over = false;
    function draw(force) {
      const i = Math.max(0, Math.min(n - 1, Math.round(p * (n - 1))));
      if (i === last && !force) return; const im = imgs[i];
      if (!im.complete) { im.onload = () => draw(true); return; }
      last = i; const W = cv.width, H = cv.height, iw = im.naturalWidth, ih = im.naturalHeight;
      /* behind: the same frame, enlarged, blurred and dark, filling the screen */
      const kc = Math.max(W / iw, H / ih), sw = W / kc, sh = H / kc;
      ctx.filter = 'blur(' + Math.round(14 * devicePixelRatio) + 'px) brightness(.45)'; ctx.drawImage(im, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, W, H); ctx.filter = 'none';
      /* in front: the whole frame, edge to edge, so nothing in it is cut */
      const kf = Math.min(W / iw, H / ih), dw = iw * kf, dh = ih * kf, dy = (H - dh) * (st.anchorY == null ? 0.5 : st.anchorY);
      ctx.drawImage(im, (W - dw) / 2, dy, dw, dh);
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
      const close = () => { alt.remove(); box.classList.add('out'); unzoom(); setTimeout(() => { box.remove(); if (snd) snd.pause(); }, 400); done(1); };
      if (skip) close(); else setTimeout(close, 1100);   /* the skip button finishes at once (nothing waits on a timer) */
    }
    box.addEventListener('pointerdown', down); box.addEventListener('pointermove', move);
    box.addEventListener('pointerup', upEv); box.addEventListener('pointercancel', upEv);
    alt.onclick = () => finish(true);
    requestAnimationFrame(size); addEventListener('resize', size, { once: true });
  };
})();
