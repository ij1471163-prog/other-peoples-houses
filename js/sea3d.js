/* =====================================================================
   The sea in 3D, for fishing: real moving water under the same game.
   The fishing rules stay in js/fishing.js; this draws a 3D sea behind
   them and a float that rides the waves where the 2D float would be.
   Without WebGL (or if anything fails) the old flat sea stays.
   ===================================================================== */
'use strict';
(function () {
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const webgl = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { return false; } };
  let loading = null;
  const loadThree = () => loading || (loading = new Promise((res, rej) => {
    if (window.THREE) return res(window.THREE);
    const s = document.createElement('script'); s.src = 'js/vendor/three.min.js';
    s.onload = () => (window.THREE ? res(window.THREE) : rej()); s.onerror = rej; document.head.appendChild(s);
  }));

  /* the waves: the same sum of sines on the GPU (to draw) and here (to float things on it) */
  const WAVES = [[0.9, 0.35, 0.55, 0.22], [-0.4, 1, 0.9, 0.12], [0.7, -0.6, 1.6, 0.06], [-0.9, -0.3, 2.3, 0.035]];   /* dir x, dir z, frequency, height */
  const height = (x, z, t) => { let h = 0; for (const [dx, dz, f, a] of WAVES) h += a * Math.sin((dx * x + dz * z) * f + t * (0.8 + f * 0.9)); return h; };
  const VS = `uniform float uT; varying float vH; varying vec3 vW; varying vec3 vN;
    float wave(vec2 p){ float h=0.0;
      ${WAVES.map(([dx, dz, f, a]) => `h += ${a.toFixed(3)} * sin(dot(vec2(${dx.toFixed(2)},${dz.toFixed(2)}), p) * ${f.toFixed(2)} + uT * ${(0.8 + f * 0.9).toFixed(3)});`).join('\n')}
      return h; }
    void main(){ vec3 p = position; vec4 w = modelMatrix * vec4(p,1.0);
      float h = wave(w.xz); w.y += h; vH = h;
      float e = 0.08; vec3 dx = vec3(e, wave(w.xz+vec2(e,0.0))-h, 0.0); vec3 dz = vec3(0.0, wave(w.xz+vec2(0.0,e))-h, e);
      vN = normalize(cross(dz, dx)); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
  const FS = `uniform vec3 uCam; uniform vec3 uSun; uniform float uT; varying float vH; varying vec3 vW; varying vec3 vN;
    void main(){ vec3 n = normalize(vN); vec3 v = normalize(uCam - vW);
      vec3 deep = vec3(0.07,0.21,0.29), mid = vec3(0.16,0.40,0.50), sky = vec3(0.80,0.88,0.90);
      float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
      float lit = clamp(dot(n, normalize(uSun)) * 0.5 + 0.5, 0.0, 1.0);
      /* comic look: the light comes in three flat steps */
      float band = lit > 0.78 ? 1.0 : lit > 0.55 ? 0.66 : 0.33;
      vec3 col = mix(deep, mid, band);
      col = mix(col, sky, fres * 0.75);
      /* sun glint on the water */
      vec3 r = reflect(-normalize(uSun), n); float g = pow(max(dot(r, v), 0.0), 220.0);
      col += vec3(1.0,0.93,0.75) * smoothstep(0.55, 0.8, g) * 0.6 * smoothstep(10.0, 22.0, length(uCam.xz - vW.xz));
      /* white foam on the crests */
      float fn = sin(vW.x * 1.7 + uT * 0.6) * sin(vW.z * 1.3 - uT * 0.4) * 0.7 + sin(vW.x * 3.1 - vW.z * 2.3 + uT * 0.7) * 0.3;
      float foam = smoothstep(0.27, 0.36, vH + 0.07 * fn) * smoothstep(-0.2, 0.6, fn);
      col = mix(col, vec3(0.93,0.97,0.98), foam * 0.7);
      /* the far sea fades into the haze at the horizon */
      float d = length(uCam.xz - vW.xz); col = mix(col, vec3(0.72,0.84,0.87), smoothstep(18.0, 46.0, d));
      gl_FragColor = vec4(col, 1.0); }`;

  function mount(T, card) {
    const area = card.querySelector('.fs-sea'); if (!area || area.querySelector('.sea3d')) return;
    const wrap = document.createElement('div'); wrap.className = 'sea3d'; area.insertBefore(wrap, area.firstChild); area.classList.add('has3d');
    const R = new T.WebGLRenderer({ antialias: true, alpha: false }); R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.outputColorSpace = T.SRGBColorSpace;
    let slow = false; try { const g = R.getContext(), x = g.getExtension('WEBGL_debug_renderer_info'); slow = /swiftshader|llvmpipe|software/i.test(x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : ''); } catch (e) { /* unknown */ }
    if (slow) R.setPixelRatio(1);
    wrap.appendChild(R.domElement);
    const scene = new T.Scene();
    scene.background = new T.Color(0xcfe3e6);
    const cam = new T.PerspectiveCamera(50, 1, 0.1, 200);
    cam.position.set(0, 2.2, 6); cam.lookAt(0, 0.6, -10);
    /* the sky: a big dome with a gradient, a soft sun, far hills and the lighthouse */
    const skyMat = new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, uniforms: {}, vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 top = vec3(0.45,0.66,0.80), hor = vec3(0.85,0.91,0.90); vec3 c = mix(hor, top, smoothstep(0.0, 0.45, h)); vec3 s = normalize(vec3(0.6,0.18,-1.0)); float d = max(dot(normalize(vP), s), 0.0); c += vec3(1.0,0.9,0.7) * (pow(d, 300.0) * 1.2 + pow(d, 12.0) * 0.18); gl_FragColor = vec4(c,1.0); }' });
    scene.add(new T.Mesh(new T.SphereGeometry(90, 24, 16), skyMat));
    const hills = new T.Shape(); hills.moveTo(-80, 0); [[-60, 3], [-44, 5.5], [-30, 3.5], [-18, 6.5], [-6, 4], [6, 2.5], [20, 5], [34, 3], [50, 6], [80, 2], [80, 0]].forEach(([x, y]) => hills.lineTo(x, y));
    const hm = new T.Mesh(new T.ShapeGeometry(hills), new T.MeshBasicMaterial({ color: 0x7e9aa0 })); hm.position.set(0, -0.2, -60); scene.add(hm);
    const lh = new T.Group(); const tower = new T.Mesh(new T.CylinderGeometry(0.35, 0.55, 4, 12), new T.MeshBasicMaterial({ color: 0xe8e2d6 })); tower.position.y = 2; lh.add(tower);
    const band = new T.Mesh(new T.CylinderGeometry(0.42, 0.46, 0.7, 12), new T.MeshBasicMaterial({ color: 0xb8433a })); band.position.y = 2.6; lh.add(band);
    const top = new T.Mesh(new T.ConeGeometry(0.45, 0.6, 12), new T.MeshBasicMaterial({ color: 0x2b2b2b })); top.position.y = 4.3; lh.add(top);
    lh.position.set(14, 3.2, -52); scene.add(lh);
    /* the water */
    const uni = { uT: { value: 0 }, uCam: { value: cam.position }, uSun: { value: new T.Vector3(0.6, 0.55, -1).normalize() } };
    const sea = new T.Mesh(new T.PlaneGeometry(120, 90, slow ? 90 : 160, slow ? 70 : 120), new T.ShaderMaterial({ uniforms: uni, vertexShader: VS, fragmentShader: FS }));
    sea.rotation.x = -Math.PI / 2; sea.position.z = -30; scene.add(sea);
    /* the float: red and white, with a ring of ripples */
    const flt = new T.Group();
    const top3 = new T.Mesh(new T.SphereGeometry(0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshBasicMaterial({ color: 0xe8473c })); flt.add(top3);
    const bot3 = new T.Mesh(new T.SphereGeometry(0.16, 16, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new T.MeshBasicMaterial({ color: 0xf4f1ea })); flt.add(bot3);
    const stick = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 0.32, 6), new T.MeshBasicMaterial({ color: 0x1b2228 })); stick.position.y = 0.26; flt.add(stick);
    const outline = new T.Mesh(new T.SphereGeometry(0.18, 16, 12), new T.MeshBasicMaterial({ color: 0x1b2228, side: T.BackSide })); flt.add(outline);
    flt.visible = false; scene.add(flt);
    const rings = [0, 1, 2].map(i => { const m = new T.Mesh(new T.RingGeometry(0.2, 0.26, 32), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: T.DoubleSide })); m.rotation.x = -Math.PI / 2; scene.add(m); return m; });
    /* where the 2D float is, on the 3D water */
    const domF = area.querySelector('.fs-float');
    const ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), hit = new T.Vector3(), ndc = new T.Vector2();
    const toWater = () => { const ra = area.getBoundingClientRect(), rf = domF.getBoundingClientRect(); if (!ra.width) return null;
      ndc.set(((rf.left + rf.width / 2 - ra.left) / ra.width) * 2 - 1, -((rf.top + rf.height * 0.7 - ra.top) / ra.height) * 2 + 1);
      ray.setFromCamera(ndc, cam); return ray.ray.intersectPlane(plane, hit) ? hit.clone() : null; };
    let landed = 0, wasShown = false, dipK = 0;
    const size = () => { const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    let last = performance.now(), t = 0;
    const loop = now => {
      if (!card.isConnected) { R.dispose(); try { R.forceContextLoss(); } catch (e) { /* gone */ } return; }
      requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += REDUCED() ? dt * 0.2 : dt;
      uni.uT.value = t;
      /* the camera breathes with the boat */
      cam.position.y = 2.2 + Math.sin(t * 0.7) * 0.06; cam.rotation.z = Math.sin(t * 0.5) * 0.012;
      const shown = domF && getComputedStyle(domF).display !== 'none';
      if (shown) {
        const p = toWater();
        if (p) {
          if (!wasShown) { landed = t; }
          const h = height(p.x, p.z, t), dip = domF.classList.contains('dip');
          dipK += ((dip ? 1 : 0) - dipK) * Math.min(1, dt * 12);
          flt.position.set(p.x, h - dipK * (0.18 + 0.08 * Math.sin(t * 28)), p.z);
          const e = 0.15; flt.rotation.z = -(height(p.x + e, p.z, t) - h) / e * 0.6; flt.rotation.x = (height(p.x, p.z + e, t) - h) / e * 0.6;
          flt.visible = true;
          rings.forEach((m, i) => { const k = ((t - landed) * 0.8 + i / 3 + (dip ? t * 2 : 0)) % 1; m.position.set(p.x, h + 0.01, p.z); m.scale.setScalar(0.6 + k * (dip ? 5 : 3)); m.material.opacity = (1 - k) * (dip ? 0.75 : 0.35); });
        }
      } else { flt.visible = false; rings.forEach(m => { m.material.opacity = 0; }); }
      wasShown = shown;
      if (wrap.clientWidth !== Math.round(R.domElement.width / R.getPixelRatio())) size();
      R.render(scene, cam);
    };
    size(); requestAnimationFrame(loop);
  }

  const f0 = GAME.MINI.fish;
  GAME.MINI.fish = function (panel, done, st) {
    f0(panel, done, st);
    const card = document.querySelector('#stage .cp-fishing'); if (!card || !webgl() || window.__no3d) return;
    loadThree().then(T => { try { mount(T, card); } catch (e) { console.error(e); } }, () => { /* flat sea it is */ });
  };
  window.__sea3d = { height };
})();
