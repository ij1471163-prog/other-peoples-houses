/* =====================================================================
   Soft animals: the user's jelly engine (js/vendor/jelly-engine.js) under
   the animal close-ups (the Admiral, Biscuit).
   The picture becomes a soft body: your finger presses into the fur and
   the body gives and wobbles back. The animal's own film (eyes closing,
   the hiss…) still plays on it: each frame goes into the same texture.
   The engine is loaded the first time a close-up opens, and one engine is
   kept and reused (it has no "destroy"). If the phone can't do WebGL, or
   the file can't load, the close-up stays exactly as it was (a picture).

     JELLY.attach(host, frames, { size, soft }) -> Promise<pet | null>
       pet.show(i)    which frame (index into frames) is drawn
       pet.rect()     where the body is on screen {left, top, width, height}
       pet.detach()   stop and take the engine back out
   ===================================================================== */
'use strict';
const JELLY = (() => {
  let loading = null, eng = null, holder = null, cvs = null;
  const FB = 66;   /* the engine keeps a floor shelf this high; the canvas reaches below the screen by as much */
  function load() {
    if (window.JellyEngine) return Promise.resolve(true);
    if (loading) return loading;
    loading = new Promise(res => {
      const sc = document.createElement('script'); sc.src = 'js/vendor/jelly-engine.js';
      sc.onload = () => res(!!window.JellyEngine); sc.onerror = () => res(false);
      document.head.appendChild(sc);
    });
    return loading;
  }
  function engine() {
    if (eng) return eng;
    holder = document.createElement('div'); holder.className = 'jelly-host';
    cvs = document.createElement('canvas'); cvs.className = 'jelly-cv'; holder.appendChild(cvs);
    try { eng = window.JellyEngine.create({ canvas: cvs, stage: holder, say: () => {}, sound: null, noGrab: true }); } catch (e) { eng = null; }
    return eng;
  }
  async function attach(host, frames, o = {}) {
    try {
      if (!(await load())) return null;
      const first = frames[0];
      if (!first.complete || !first.naturalWidth) await new Promise((r, j) => { first.onload = r; first.onerror = j; });
      const E = engine(); if (!E) return null;
      host.appendChild(holder);
      holder.style.bottom = -FB + 'px';
      /* a fake "video": the engine asks for a new frame whenever currentTime changes */
      const V = { readyState: 4, videoWidth: first.naturalWidth, videoHeight: first.naturalHeight, currentTime: 0, paused: false, ended: false };
      let cur = 0;
      E.setVideo(null); E.setFrameHook(null);
      E.setSource(first, first.naturalWidth, first.naturalHeight, { round: false });
      E.setGravity(true); E.setSize(o.size || 1.5); E.setSoftness(o.soft == null ? 0.5 : o.soft);
      E.setFrameHook(() => { const im = frames[cur]; return im && im.complete && im.naturalWidth ? im : null; });
      E.setVideo(V);
      window.dispatchEvent(new Event('resize'));
      return {
        engine: E,
        show(i) { if (i === cur) return; cur = i; V.currentTime = i + 1; },
        rect() {
          const st = E.state(), r = cvs.getBoundingClientRect(), k = r.width / Math.max(1, st.W);
          const w = st.bw * st.uS * k, h = st.bh * st.uS * k;
          return { left: r.left + st.cx * k - w / 2, top: r.top + st.cy * k - h / 2, width: w, height: h, right: r.left + st.cx * k + w / 2, bottom: r.top + st.cy * k + h / 2 };
        },
        detach() { try { V.paused = true; E.setVideo(null); E.setFrameHook(null); } catch (e) { /* none */ } if (holder.parentNode) holder.parentNode.removeChild(holder); }
      };
    } catch (e) { console.error(e); return null; }
  }
  return { attach };
})();
