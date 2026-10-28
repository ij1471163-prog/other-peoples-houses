/* =====================================================================
   Moving pictures for the big moments ("motion comic"): the game's own
   pictures, in layers, with a camera, light, particles and sound.
   No video files. Reduced motion: a plain fade.
     · CINE.fall: Elias falls in the kitchen (chapter 1). The mug slips,
       the room tilts, his heart, the floor.
   ===================================================================== */
'use strict';
(function () {
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const s = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (s.master || 0.8) * (s.sfx || 0.7) * k)); };
  const rec = (name, k, rate) => { if (!on()) return; try { const a = new Audio('img/snd/' + name + '.mp3'); a.volume = vol(k); if (rate) { a.preservesPitch = false; a.playbackRate = rate; } a.play().catch(() => {}); } catch (e) { /* none */ } };
  let AC = null;
  const ac = () => { if (!on()) return null; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } };
  /* a heartbeat: two low thumps */
  function beat(k) { const c = ac(); if (!c) return; const t = c.currentTime;
    [[0, 58], [0.18, 50]].forEach(([d, f]) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(f, t + d); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + d + 0.15); g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(vol(k), t + d + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.22); o.connect(g).connect(c.destination); o.start(t + d); o.stop(t + d + 0.25); }); }
  /* a ringing in the ears */
  function ring(sec) { const c = ac(); if (!c) return; const t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.frequency.value = 3800; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol(0.05), t + 0.6); g.gain.linearRampToValueAtTime(0.0001, t + sec); o.connect(g).connect(c.destination); o.start(t); o.stop(t + sec + 0.05); }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const anim = (el, kf, opt) => el.animate(kf, Object.assign({ fill: 'forwards', easing: 'ease-in-out' }, opt));

  const imgOf = (id, e) => { try { const c = PEOPLE.IMG.chars[id]; return c && (c[e] || c.neutral); } catch (e2) { return null; } };
  const bgOf = id => { try { return PEOPLE.IMG.bg[id] || ('img/bg/' + id + '.jpg'); } catch (e) { return 'img/bg/' + id + '.jpg'; } };

  async function fall() {
    const st = $('stage'); if (!st) return;
    const box = el('div', 'cine'); st.appendChild(box);
    const elImg = imgOf('elias', 'rest') || imgOf('elias', 'sad');
    box.innerHTML = `<div class="cn-cam"><img class="cn-bg" src="${bgOf('kitchen')}" alt=""><div class="cn-man"><img src="${elImg}" alt=""><img class="cn-ghost" src="${elImg}" alt=""><div class="cn-mug"><canvas></canvas></div></div></div>
      <div class="cn-tint"></div><div class="cn-vig"></div><div class="cn-bars"><i></i><i></i></div><div class="cn-black"></div>`;
    const q = s => box.querySelector(s), cam = q('.cn-cam'), man = q('.cn-man'), ghost = q('.cn-ghost'), mug = q('.cn-mug'), vig = q('.cn-vig'), tint = q('.cn-tint'), black = q('.cn-black');
    document.body.classList.add('cine-on');
    if (REDUCED()) { await wait(1200); anim(black, [{ opacity: 0 }, { opacity: 1 }], { duration: 600 }); await wait(900); box.remove(); document.body.classList.remove('cine-on'); return; }
    /* the mug, cut from his own picture so it can fall on its own */
    const im = man.querySelector('img');
    await new Promise(r => (im.complete && im.naturalWidth ? r() : im.addEventListener('load', r, { once: true })));
    const M = [0.185, 0.325, 0.16, 0.15], cv = mug.querySelector('canvas'), W = im.naturalWidth, H = im.naturalHeight;
    cv.width = Math.round(W * M[2]); cv.height = Math.round(H * M[3]);
    cv.getContext('2d').drawImage(im, W * M[0], H * M[1], W * M[2], H * M[3], 0, 0, cv.width, cv.height);
    Object.assign(mug.style, { left: M[0] * 100 + '%', top: M[1] * 100 + '%', width: M[2] * 100 + '%', height: M[3] * 100 + '%' });
    /* his picture without the mug, ready for the moment he lets go */
    const base = document.createElement('canvas'); base.width = W; base.height = H; const bx = base.getContext('2d'); bx.drawImage(im, 0, 0); bx.clearRect(W * M[0], H * M[1], W * M[2], H * M[3]);
    const swapMug = () => { try { const u = base.toDataURL(); man.querySelector('img').src = u; ghost.src = u; } catch (e) { /* a local file: the drawn mug stays, the falling one is a copy */ } };
    /* 1. an ordinary morning: the camera drifts in, the kettle */
    anim(q('.cn-bars'), [{ opacity: 0 }, { opacity: 1 }], { duration: 700 });
    anim(cam, [{ transform: 'scale(1)' }, { transform: 'scale(1.06) translate(0,-1%)' }], { duration: 2600, easing: 'ease-out' });
    rec('wood2', 0.25, 1.4);
    await wait(1700);
    /* 2. the room goes wrong: his heart, the colour drains, the picture doubles */
    beat(0.7); ring(5);
    anim(tint, [{ opacity: 0 }, { opacity: 1 }], { duration: 1600 });
    anim(vig, [{ opacity: 0 }, { opacity: .6 }, { opacity: .25 }, { opacity: .8 }, { opacity: .45 }], { duration: 1600 });
    anim(ghost, [{ opacity: 0, transform: 'translate(0,0)' }, { opacity: .35, transform: 'translate(2.5%,0.6%)' }, { opacity: .2, transform: 'translate(-1.5%,-0.4%)' }, { opacity: .4, transform: 'translate(3%,1%)' }], { duration: 1600 });
    anim(man, [{ transform: 'translateX(-50%) rotate(0)' }, { transform: 'translateX(-50%) rotate(-1.5deg)' }, { transform: 'translateX(-50%) rotate(1.2deg)' }, { transform: 'translateX(-50%) rotate(-2.5deg)' }], { duration: 1600 });
    anim(cam, [{ transform: 'scale(1.06) translate(0,-1%)', filter: 'blur(0)' }, { transform: 'scale(1.09) translate(-1%,-1%) rotate(-1deg)', filter: 'blur(1.2px)' }, { transform: 'scale(1.08) translate(1%,0) rotate(1.5deg)', filter: 'blur(.4px)' }], { duration: 1600 });
    await wait(800); beat(0.8); await wait(800);
    /* 3. the mug goes, in slow motion */
    beat(0.9);
    const r0 = mug.getBoundingClientRect(), rs = st.getBoundingClientRect();
    swapMug(); box.appendChild(mug); Object.assign(mug.style, { left: (r0.left - rs.left) + 'px', top: (r0.top - rs.top) + 'px', width: r0.width + 'px', height: r0.height + 'px' });
    const drop = rs.height * 0.95 - (r0.top - rs.top) - r0.height;
    anim(mug, [{ transform: 'translateY(0) rotate(0)' }, { transform: `translateY(${drop * 0.35}px) rotate(35deg)`, offset: .45 }, { transform: `translateY(${drop}px) rotate(110deg)` }], { duration: 1100, easing: 'cubic-bezier(.4,0,.9,.6)' });
    await wait(1050);
    /* the mug hits the floor: the splash, the crash */
    rec('hit1', 0.9, 1.25); rec('wood3', 0.6, 1.6);
    mug.remove();
    const sx = r0.left - rs.left + r0.width / 2, sy = rs.height * 0.95;
    for (let i = 0; i < 16; i++) { const p = el('i', 'cn-drop'); p.style.left = sx + 'px'; p.style.top = sy + 'px'; box.appendChild(p);
      const a = Math.PI + Math.random() * Math.PI, d = 30 + Math.random() * 90;
      anim(p, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d * 0.7}px) scale(.4)`, opacity: 0 }], { duration: 500 + Math.random() * 300, easing: 'ease-out' }); }
    for (let i = 0; i < 4; i++) { const sh = el('i', 'cn-shard'); sh.style.left = sx + 'px'; sh.style.top = (sy - 6) + 'px'; box.appendChild(sh);
      const dx = (Math.random() - 0.5) * 140; anim(sh, [{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${dx}px,${-10 - Math.random() * 20}px) rotate(${Math.random() * 400}deg)`, offset: .5 }, { transform: `translate(${dx * 1.3}px,0) rotate(${Math.random() * 600}deg)` }], { duration: 600, easing: 'ease-out' }); }
    /* 4. he goes down */
    await wait(250);
    anim(man, [{ transform: 'translateX(-50%) rotate(-2.5deg)', filter: 'none' }, { transform: 'translateX(-46%) translateY(6%) rotate(-6deg)', offset: .35 }, { transform: 'translateX(-38%) translateY(48%) rotate(-38deg)', filter: 'blur(1.5px)' }], { duration: 650, easing: 'cubic-bezier(.5,0,.9,.4)' });
    anim(ghost, [{ opacity: .4 }, { opacity: 0 }], { duration: 300 });
    await wait(600);
    rec('hit2', 1, 0.7); try { if (navigator.vibrate) navigator.vibrate([120]); } catch (e) { /* none */ }
    anim(cam, [{ transform: 'scale(1.09) translate(0,0)' }, { transform: 'scale(1.12) translate(-2%,2%) rotate(-3deg)' }, { transform: 'scale(1.1) translate(1.5%,-1%) rotate(2deg)' }, { transform: 'scale(1.11) translate(0,1%) rotate(-1deg)' }], { duration: 380, easing: 'linear' });
    /* 5. everything goes quiet and dark, except his heart */
    await wait(500); beat(0.5);
    anim(black, [{ opacity: 0 }, { opacity: 1 }], { duration: 1400, easing: 'ease-in' });
    await wait(900); beat(0.3); await wait(900);
    document.body.classList.remove('cine-on');
    anim(box, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }); await wait(420); box.remove();
  }
  window.CINE = { fall };

  /* in the story: a mini step that plays it and moves on */
  GAME.MINI.cine = function (panel, done, st) {
    panel.innerHTML = '';
    const alt = el('button', 'opt main cp-alt', tx(T('Skip', 'تخطّي'))); alt.type = 'button'; panel.appendChild(alt);
    let over = false; const fin = () => { if (over) return; over = true; alt.remove(); const b = document.querySelector('#stage .cine'); if (b) b.remove(); document.body.classList.remove('cine-on'); done(1); };
    alt.onclick = fin;
    (CINE[st.name] ? CINE[st.name]() : Promise.resolve()).then(fin, fin);
  };
  const fall0 = GAME.SCRIPTS.fall;
  GAME.SCRIPTS.fall = where => { const steps = fall0(where); if (where === 'home') steps.unshift({ go: 'kitchen' }, { show: [] }, { mini: 'cine', name: 'fall' }); return steps; };
})();
