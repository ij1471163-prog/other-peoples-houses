/* =====================================================================
   Chess in 3D: Elias's old wooden board, on the café table.
   The puzzle itself is still js/elias-games.js (the flat board stays in
   the page, hidden, and keeps the rules); this file only shows it in 3D
   and turns a tap on the 3D board into a tap on the flat one.
     · drag sideways to turn the board, tap a piece, tap a square
     · the piece hops across, a captured piece topples over
   three.js (MIT) is loaded only when a game of chess opens. Without
   WebGL, or if it fails, you get the flat board as before.
   ===================================================================== */
'use strict';
(function () {
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let loading = null;
  const loadThree = () => loading || (loading = new Promise((res, rej) => {
    if (window.THREE) return res(window.THREE);
    const s = document.createElement('script'); s.src = 'js/vendor/three.min.js';
    s.onload = () => (window.THREE ? res(window.THREE) : rej()); s.onerror = rej; document.head.appendChild(s);
  }));
  const webgl = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { return false; } };

  const KIND = { '♔': 'K', '♕': 'Q', '♖': 'R', '♗': 'B', '♘': 'N', '♙': 'P', '♚': 'K', '♛': 'Q', '♜': 'R', '♝': 'B', '♞': 'N', '♟': 'P' };
  const FILES = 'abcdefgh';

  function pieceGeo(T, k) {
    /* turned pieces: a profile spun round (like a real lathe), plus a few extra parts */
    const L = pts => new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), 28);
    const base = [[0, 0], [0.36, 0], [0.37, 0.05], [0.33, 0.09], [0.26, 0.12], [0.22, 0.16]];
    const g = new T.Group();
    const add = (geo, y) => { const m = new T.Mesh(geo); m.position.y = y || 0; g.add(m); return m; };
    if (k === 'P') add(L(base.concat([[0.16, 0.34], [0.12, 0.44], [0.17, 0.47], [0.12, 0.5]]))), add(new T.SphereGeometry(0.15, 20, 16), 0.6);
    if (k === 'R') { add(L(base.concat([[0.2, 0.46], [0.27, 0.52], [0.27, 0.66], [0.17, 0.66], [0.17, 0.62], [0, 0.62]]))); for (let i = 0; i < 4; i++) { const m = add(new T.BoxGeometry(0.1, 0.1, 0.1), 0.71); const a = i * Math.PI / 2 + Math.PI / 4; m.position.x = Math.cos(a) * 0.21; m.position.z = Math.sin(a) * 0.21; m.rotation.y = -a; } }
    if (k === 'B') { add(L(base.concat([[0.15, 0.5], [0.11, 0.6], [0.17, 0.63], [0.12, 0.66]]))); const h = add(new T.SphereGeometry(0.15, 20, 16), 0.8); h.scale.set(1, 1.35, 1); add(new T.SphereGeometry(0.045, 10, 8), 1.02); }
    if (k === 'Q') { add(L(base.concat([[0.16, 0.62], [0.12, 0.74], [0.22, 0.8], [0.18, 0.9], [0, 0.92]]))); add(new T.SphereGeometry(0.06, 12, 10), 0.97); }
    if (k === 'K') { add(L(base.concat([[0.17, 0.66], [0.13, 0.78], [0.22, 0.84], [0.18, 0.96], [0, 0.98]]))); add(new T.BoxGeometry(0.06, 0.22, 0.06), 1.08); add(new T.BoxGeometry(0.18, 0.06, 0.06), 1.1); }
    if (k === 'N') {
      add(L(base.concat([[0.2, 0.3], [0, 0.3]])));
      const s = new T.Shape(); [[-0.2, 0], [0.2, 0], [0.2, 0.35], [0.28, 0.5], [0.26, 0.62], [0.1, 0.78], [-0.08, 0.8], [-0.18, 0.68], [-0.26, 0.52], [-0.16, 0.48], [-0.05, 0.52], [-0.2, 0.25]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
      const head = new T.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }); head.translate(0, 0, -0.11);
      const m = add(head, 0.28); m.rotation.y = -Math.PI / 2;
    }
    return g;
  }

  function mount(T, card) {
    const board = card.querySelector('.ch-board'); if (!board) return;
    const wrap = document.createElement('div'); wrap.className = 'ch3d';
    board.parentNode.insertBefore(wrap, board); board.classList.add('ch-flat');
    const R = new T.WebGLRenderer({ antialias: true, alpha: true }); R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    /* a slow (software) graphics chip gets no shadows and a smaller picture */
    let slow = false; try { const g = R.getContext(), x = g.getExtension('WEBGL_debug_renderer_info'); slow = /swiftshader|llvmpipe|software/i.test(x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : ''); } catch (e) { /* unknown */ }
    if (slow) R.setPixelRatio(1);
    R.shadowMap.enabled = !slow; R.shadowMap.type = T.PCFSoftShadowMap; R.outputColorSpace = T.SRGBColorSpace;
    wrap.appendChild(R.domElement);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(34, 1, 0.1, 100);
    scene.add(new T.HemisphereLight(0xfff2dc, 0x3a2a1e, 0.9));
    const sun = new T.DirectionalLight(0xffe2b8, 1.6); sun.position.set(-4, 9, 5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); scene.add(sun);
    const rim = new T.DirectionalLight(0x9fc4ff, 0.35); rim.position.set(5, 4, -6); scene.add(rim);
    /* the table and the board */
    const table = new T.Mesh(new T.CylinderGeometry(9, 9, 0.4, 48), new T.MeshStandardMaterial({ color: 0x5a3a24, roughness: 0.8 })); table.position.y = -0.45; table.receiveShadow = true; scene.add(table);
    const frame = new T.Mesh(new T.BoxGeometry(9.2, 0.35, 9.2), new T.MeshStandardMaterial({ color: 0x3b2414, roughness: 0.55 })); frame.position.y = -0.18; frame.castShadow = frame.receiveShadow = true; scene.add(frame);
    /* wood grain, drawn once in a small canvas */
    const grain = (a, b) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = a; x.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 40; i++) { x.strokeStyle = b; x.globalAlpha = 0.08 + Math.random() * 0.12; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); const y = Math.random() * 128; x.moveTo(0, y); x.bezierCurveTo(40, y + Math.random() * 8 - 4, 90, y + Math.random() * 8 - 4, 128, y + Math.random() * 6 - 3); x.stroke(); }
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; };
    const sqs = {}, light = new T.MeshStandardMaterial({ map: grain('#ecd3a4', '#9a7444'), roughness: 0.55 }), dark = new T.MeshStandardMaterial({ map: grain('#8e5c34', '#3e2410'), roughness: 0.55 });
    frame.material.map = grain('#4a2c18', '#1a0d05'); table.material.map = grain('#5e3d26', '#2a170a');
    const sqGeo = new T.BoxGeometry(1, 0.1, 1);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const name = FILES[c] + (8 - r), m = new T.Mesh(sqGeo, ((r + c) % 2 ? dark : light).clone());
      m.position.set(c - 3.5, 0, r - 3.5); m.receiveShadow = true; m.userData.sq = name; m.userData.base = m.material.color.clone(); scene.add(m); sqs[name] = m;
    }
    const mats = { w: new T.MeshStandardMaterial({ color: 0xf3e7cf, roughness: 0.35, metalness: 0.05 }), b: new T.MeshStandardMaterial({ color: 0x2a1a12, roughness: 0.3, metalness: 0.1 }) };
    const geoCache = {};
    const makePiece = (k, side) => { const g = (geoCache[k] = geoCache[k] || pieceGeo(T, k)).clone(); g.scale.setScalar(1.3); g.traverse(o => { if (o.isMesh) { o.material = mats[side]; o.castShadow = true; } }); if (k === 'N' && side === 'b') g.rotation.y = Math.PI; return g; };
    let pieces = {};   /* square -> { obj, glyph } */
    const at = name => { const c = FILES.indexOf(name[0]), r = 8 - Number(name[1]); return new T.Vector3(c - 3.5, 0.05, r - 3.5); };
    const anims = [];
    const tween = (dur, fn, done) => anims.push({ t0: performance.now(), dur: REDUCED() ? 1 : dur, fn, done });
    function read() { const o = {}; board.querySelectorAll('.ch-sq').forEach(b => { const t = (b.textContent || '').replace('︎', '').trim(); o[b.dataset.sq] = { g: t, cls: b.className }; }); return o; }
    function sync(first) {
      const now = read();
      /* a move: one square emptied, another changed; let that piece hop across */
      const gone = Object.keys(pieces).filter(s => !now[s] || now[s].g !== pieces[s].glyph);
      const came = Object.keys(now).filter(s => now[s].g && (!pieces[s] || pieces[s].glyph !== now[s].g));
      if (!first && gone.length && came.length === 1) {
        const to = came[0], from = gone.find(s => pieces[s].glyph === now[to].g && s !== to);
        if (from) {
          const p = pieces[from], victim = pieces[to] && pieces[to] !== p ? pieces[to] : null; delete pieces[from];
          const A = at(from), B = at(to);
          tween(520, k => { const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; p.obj.position.lerpVectors(A, B, e); p.obj.position.y = 0.05 + Math.sin(k * Math.PI) * 0.9; }, () => {
            if (victim) tween(600, k => { victim.obj.rotation.z = k * 1.45; victim.obj.position.y = 0.05 - k * 0.1; victim.obj.position.x = B.x + k * 0.55; }, () => scene.remove(victim.obj));
            try { if (window.AUDIO && AUDIO.on) { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = 180; g.gain.setValueAtTime(0.25, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.13); setTimeout(() => c.close(), 300); } } catch (e) { /* quiet */ }
          });
          pieces[to] = p;
        }
      }
      /* anything else: just make the board match */
      Object.keys(pieces).forEach(s => { if (!now[s] || !now[s].g || now[s].g !== pieces[s].glyph) { if (!anims.length) { scene.remove(pieces[s].obj); delete pieces[s]; } } });
      Object.keys(now).forEach(s => { const g = now[s].g; if (g && KIND[g] && !pieces[s]) { const side = '♔♕♖♗♘♙'.includes(g) ? 'w' : 'b'; const obj = makePiece(KIND[g], side); obj.position.copy(at(s)); scene.add(obj); pieces[s] = { obj, glyph: g }; } });
      /* the highlights the flat board uses: selected, the winning square, a wrong one */
      Object.entries(sqs).forEach(([s, m]) => { const cls = now[s] ? now[s].cls : ''; m.material.color.copy(m.userData.base); m.material.emissive = new T.Color(cls.includes('mate') ? 0x2f9a55 : cls.includes('no') ? 0x9a2a20 : cls.includes('sel') ? 0x8a6a10 : 0x000000); m.material.emissiveIntensity = cls.match(/mate|no|sel/) ? 0.9 : 0; });
    }
    sync(true);
    const mo = new MutationObserver(() => sync(false)); mo.observe(board, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    /* the camera: behind White, looking down; drag sideways to walk round the table a little */
    let yaw = 0, yawT = 0, dragging = null, moved = 0;
    const place = () => { const d = 11.2, el = 0.74; cam.position.set(Math.sin(yaw) * d * Math.cos(el), d * Math.sin(el), Math.cos(yaw) * d * Math.cos(el)); cam.lookAt(0, -0.2, 0.55); };
    const size = () => { const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    const ray = new T.Raycaster(), ndc = new T.Vector2();
    const pick = ev => { const r = R.domElement.getBoundingClientRect(); ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, cam);
      const hits = ray.intersectObjects(Object.values(pieces).map(p => p.obj).concat(Object.values(sqs)), true);
      for (const h of hits) { for (let o = h.object; o; o = o.parent) { const s = Object.keys(pieces).find(k => pieces[k].obj === o); if (s) return s; if (o.userData.sq) return o.userData.sq; } }
      return null; };
    R.domElement.addEventListener('pointerdown', ev => { dragging = { x: ev.clientX, y0: yawT }; moved = 0; try { R.domElement.setPointerCapture(ev.pointerId); } catch (e) { /* none */ } });
    R.domElement.addEventListener('pointermove', ev => { if (!dragging) return; const dx = ev.clientX - dragging.x; moved = Math.max(moved, Math.abs(dx)); yawT = Math.max(-0.9, Math.min(0.9, dragging.y0 - dx / 160)); });
    R.domElement.addEventListener('pointerup', ev => { const d = dragging; dragging = null; if (!d || moved > 8) return; const s = pick(ev); if (s) { const b = board.querySelector(`.ch-sq[data-sq="${s}"]`); if (b) b.click(); } });
    let raf = 0, last = performance.now();
    const loop = now => {
      if (!card.isConnected) { mo.disconnect(); R.dispose(); try { R.forceContextLoss(); } catch (e) { /* gone */ } return; }
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      yaw += (yawT - yaw) * Math.min(1, dt * 8); place();
      for (let i = anims.length - 1; i >= 0; i--) { const a = anims[i], k = Math.min(1, (now - a.t0) / a.dur); a.fn(k); if (k >= 1) { anims.splice(i, 1); if (a.done) a.done(); } }
      if (wrap.clientWidth !== R.domElement.width / R.getPixelRatio()) size();
      R.render(scene, cam);
    };
    size(); place(); raf = requestAnimationFrame(loop);
    window.__ch3d = { pos: q => { const v = at(q).clone().project(cam), r = R.domElement.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; } };   /* for tests */
    /* opening: the camera settles in */
    if (!REDUCED()) { yaw = -0.6; }
    card.classList.add('is3d');
  }

  const cp0 = GAME.MINI.chessPuzzle;
  GAME.MINI.chessPuzzle = function (panel, done, stp) {
    cp0(panel, done, stp);
    const card = document.querySelector('#stage .cp-chess'); if (!card || !webgl() || window.__no3d) return;
    loadThree().then(T => { try { mount(T, card); } catch (e) { console.error(e); } }, () => { /* flat board it is */ });
  };
})();
