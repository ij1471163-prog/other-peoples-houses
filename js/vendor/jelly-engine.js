/* The jelly engine, from the user's own project "صورة حيّة" (netlify-v40, js/engine.js), unchanged.
   Loaded only when an animal close-up opens (js/jelly-pet.js). One change for the game: the option
   noGrab (a drag on the body strokes it instead of picking it up), marked "the game" below. */
/* The jelly engine: a WebGL textured mesh driven by a small soft-body simulation.
 *
 *   var engine = JellyEngine.create({ canvas, stage, say, sound, onFirstTouch, onFrame, onSleep, onPower, onQuality });
 *   engine.setSource(canvasOrImage, width, height, { round: true });   // round:false = a cut-out
 *   engine.setSoftness(0..1)  engine.setStrength(0..1)  engine.setRelief(0..1.2)
 *   engine.setGravity(bool)   engine.setAlive(bool)     engine.set3D(bool)    engine.setFree(bool)
 *   engine.setQuality('auto' | 'low' | 'medium' | 'high')
 *   engine.reset()            engine.exportImage({ scale, transparent, crop }) -> canvas
 *   engine.setManual(true); engine.advance(dt)        // step by hand (tools/make_video.py)
 *   Recording / replay hooks (used by js/recorder.js): see "recording hooks" near the end.
 *
 * Two kinds of motion, kept apart:
 *   1. Placement of the whole body (where it is, its angle and size). In the normal mode it is
 *      physics: gravity, a soft pull back to the middle, walls, throws. In free mode js/freemove.js
 *      owns it completely (your fingers, then momentum and friction; nothing else).
 *   2. Deformation of the picture, relative to that placement. The picture is a grid of points;
 *      each is pulled back to its place (KS), shares motion with its neighbours (KN, so ripples
 *      travel), is damped (CD), and a pressure term (KP) keeps the area, so squashing one side makes
 *      the rest bulge. Touch forces are local: they fade out with distance from the finger.
 *
 * Look: a height map is built from the picture (a dome for a cut-out, a bevelled card otherwise,
 * plus relief from the picture's own tones). It gives every pixel a normal for soft lighting and
 * every vertex a height, so tilting shows parallax. It is a 2.5D effect on a flat picture, not a
 * 3D model: there is no GLB / glTF support.
 */
(function () {
  'use strict';

  var VS = [
    'attribute vec2 a_pos;',
    'attribute vec2 a_uv;',
    'attribute float a_shade;',
    'attribute float a_h;',
    'attribute vec2 a_fold;',                                              // material: squeeze along x / y
    'uniform vec2 u_res;',
    'uniform vec2 u_off;',
    'uniform float u_flat;',
    'uniform vec2 u_c;',
    'uniform vec2 u_tilt;',
    'uniform float u_depth;',
    'uniform float u_f;',
    'uniform float u_hs;',
    'uniform float u_zoff;',
    'uniform float u_floor;',
    'uniform vec2 u_sh;',
    'varying vec2 v_uv;',
    'varying float v_shade;',
    'varying vec2 v_fold;',
    'void main() {',
    '  vec2 p;',
    '  if (u_flat > 0.5) {',
    '    p = vec2(u_c.x + (a_pos.x - u_c.x) * u_sh.x, u_floor + (a_pos.y - u_c.y) * u_sh.y) + u_off;',
    '  } else {',
    '    vec2 rel = a_pos - u_c;',
    '    float z = (a_h + a_shade * 0.6) * u_depth * u_hs + u_zoff;',
    '    float cy = cos(u_tilt.y); float sy = sin(u_tilt.y);',
    '    float cx = cos(u_tilt.x); float sx = sin(u_tilt.x);',
    '    float x1 = rel.x * cy + z * sy;',
    '    float z1 = -rel.x * sy + z * cy;',
    '    float y1 = rel.y * cx - z1 * sx;',
    '    float z2 = rel.y * sx + z1 * cx;',
    '    float k = u_f / max(u_f - z2, 1.0);',
    '    p = u_c + vec2(x1, y1) * k + u_off;',
    '  }',
    '  gl_Position = vec4(p.x / u_res.x * 2.0 - 1.0, 1.0 - p.y / u_res.y * 2.0, 0.0, 1.0);',
    '  v_uv = a_uv;',
    '  v_shade = a_shade;',
    '  v_fold = a_fold;',
    '}'
  ].join('\n');

  var FS = [
    'precision mediump float;',
    'varying vec2 v_uv;',
    'varying float v_shade;',
    'uniform sampler2D u_tex;',
    'uniform sampler2D u_height;',
    'uniform vec2 u_texel;',
    'uniform float u_mode;',
    'uniform float u_aspect;',
    'uniform float u_round;',
    'uniform float u_shadow;',
    'uniform float u_nscale;',
    'uniform float u_ang;',
    'uniform vec2 u_tiltF;',
    'uniform float u_gloss;',
    'uniform float u_q;',
    'uniform float u_dm;',
    'uniform float u_paint;',
    'uniform sampler2D u_kmap;',
    'varying vec2 v_fold;',
    'uniform vec3 u_L;',                                                   // the light's direction (setLight)
    'uniform float u_matOn;',                                              // a material (skin.js) is on
    'uniform vec4 u_mat;',                                                 // translucency, folds, skin tone, dent light
    'uniform vec4 u_spotA[6];',                                            // dents: u, v, depth, radius (px)
    'uniform vec4 u_spotB[6];',                                            // dents: blanch, flush, rim
    'uniform float u_spotN;',
    'uniform vec2 u_bodyPx;',                                              // the picture's size on screen (px)
    'vec2 gSlope; float gDepth; float gTone;',
    'float roundMask(vec2 uv) {',
    '  vec2 hs = vec2(u_aspect, 1.0) * 0.5;',
    '  vec2 p = (uv - 0.5) * vec2(u_aspect, 1.0);',
    '  vec2 q = abs(p) - hs + u_round;',
    '  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - u_round;',
    '  return 1.0 - smoothstep(-0.003, 0.003, d);',
    '}',
    'float hs(vec2 uv) { return texture2D(u_height, uv).r; }',
    // turn a normal from picture space into view space (body angle, then the 3D tilt)
    'vec3 orient(vec3 n) {',
    '  float ca = cos(u_ang); float sa = sin(u_ang);',
    '  n = vec3(n.x * ca - n.y * sa, n.x * sa + n.y * ca, n.z);',
    '  float cy = cos(u_tiltF.y); float sy = sin(u_tiltF.y);',
    '  float cx = cos(u_tiltF.x); float sx = sin(u_tiltF.x);',
    '  vec3 n1 = vec3(n.x * cy + n.z * sy, n.y, -n.x * sy + n.z * cy);',
    '  return vec3(n1.x, n1.y * cx - n1.z * sx, n1.y * sx + n1.z * cx);',
    '}',
    // soft wrap light + rim + sky + highlight; k darkens the diffuse part (cavities, edges, squash)
    'vec3 lightC(vec3 n2, vec3 bu, float k) {',
    '  vec3 L = u_L;',
    '  float wrap = clamp(dot(n2, L) * 0.55 + 0.45, 0.0, 1.0);',
    '  wrap = wrap * wrap * (3.0 - 2.0 * wrap);',
    '  vec3 shadowCol = mix(bu * 0.62, bu * bu, 0.45);',
    '  vec3 litCol = bu * 1.06 + 0.02;',
    '  vec3 c = mix(shadowCol, litCol, wrap) * k;',
    '  c += bu * vec3(0.22, 0.07, 0.04) * u_mat.x * (1.0 - wrap) * 0.6;', // light passing through skin / silicone
    '  float rimF = pow(1.0 - clamp(n2.z, 0.0, 1.0), 3.0);',
    '  c += bu * rimF * 0.12;',
    '  vec3 R = reflect(vec3(0.0, 0.0, -1.0), n2);',
    '  float sky = clamp(0.5 - R.y * 0.5, 0.0, 1.0);',
    '  c += mix(vec3(0.1), vec3(0.95, 0.97, 1.0), sky) * rimF * 0.3 * u_gloss;',
    '  vec3 Hh = normalize(L + vec3(0.0, 0.0, 1.0));',
    '  float nh = max(dot(n2, Hh), 0.0);',
    '  c += vec3(pow(nh, 40.0) * 0.32 + pow(nh, 8.0) * 0.04) * u_gloss;',
    '  return c;',
    '}',
    // how much a colour looks like skin (light or dark): warm, red over green over blue, not grey
    'float skinW(vec3 c) {',
    '  if (c.r < 0.16 || c.r <= c.g || c.g < c.b * 0.92) return 0.0;',
    '  float mx = max(c.r, max(c.g, c.b)); float mn = min(c.r, min(c.g, c.b));',
    '  float sat = (mx - mn) / mx; float rg = (c.r - c.g) / c.r;',
    '  if (c.r - c.b < 0.05 || rg > 0.55 || sat < 0.12 || sat > 0.75) return 0.0;',
    '  return clamp(rg / 0.06, 0.0, 1.0) * clamp((sat - 0.12) / 0.08, 0.0, 1.0);',
    '}',
    // every dent, per pixel: a fingertip-sized dip with a slight raised ring; its slope, depth and skin tone
    'void spots(vec2 uv) {',
    '  gSlope = vec2(0.0); gDepth = 0.0; gTone = 0.0;',
    '  for (int i = 0; i < 6; i++) {',
    '    if (float(i) >= u_spotN) break;',
    '    vec4 A = u_spotA[i]; vec4 B = u_spotB[i];',
    '    vec2 dp = (uv - A.xy) * u_bodyPx;',
    '    float R = A.w, R2 = R * R, r2 = dot(dp, dp) / R2;',
    '    if (r2 > 9.0) continue;',
    '    float g1 = exp(-2.3 * r2), g2 = exp(-2.3 * r2 / 3.61);',
    '    gDepth += A.z * (g1 - B.z * g2 * (1.0 - g1));',
    '    vec2 dg1 = g1 * (-4.6 / R2) * dp, dg2 = g2 * (-4.6 / (3.61 * R2)) * dp;',
    '    gSlope += A.z * 0.26 * R * (dg1 - B.z * (dg2 * (1.0 - g1) - g2 * dg1));', // depth in px = 0.26 R per unit
    '    float bl = B.x * g1;',
    '    gTone += B.y * exp(-2.3 * r2 / 1.8) * (1.0 - bl) * 0.9 - bl * 0.8;',
    '  }',
    '}',
    // the dents' slope and the folds of a squeezed surface, added to a picture-space normal
    'vec3 matNormal(vec3 n) {',
    '  n += vec3(gSlope.x, gSlope.y, 0.0) * u_mat.w;',                       // height = -depth, so +slope of depth
    '  float fx = smoothstep(0.08, 0.35, v_fold.x) * u_mat.y, fy = smoothstep(0.08, 0.35, v_fold.y) * u_mat.y;',
    '  if (fx + fy > 0.001) {',
    '    float F = 190.0;',
    '    n.x += cos(v_uv.x * F * u_aspect + sin(v_uv.y * 11.0) * 1.4) * fx * 0.26;',
    '    n.y += cos(v_uv.y * F + sin(v_uv.x * 11.0) * 1.4) * fy * 0.26;',
    '  }',
    '  return normalize(n);',
    '}',
    // the light change the dents and folds make, on top of the picture's own light: a wall turned away from
    // the light darkens warmly (light passes through skin, so its shadow is reddish, not grey), a wall
    // turned toward it brightens, and glossy materials get a small highlight on it
    'vec3 dentShade(vec3 c, vec3 n2, vec3 nd) {',
    '  vec3 L = u_L;',
    '  float d = dot(nd, L) - dot(n2, L);',
    '  c *= 1.0 + d * (d < 0.0 ? vec3(0.22, 0.36, 0.44) : vec3(0.3));',
    '  vec3 Hh = normalize(L + vec3(0.0, 0.0, 1.0));',
    '  float sp = pow(max(dot(nd, Hh), 0.0), 24.0) - pow(max(dot(n2, Hh), 0.0), 24.0);',
    '  return c + vec3(max(sp, 0.0) * 0.3 * u_gloss);',
    '}',
    // skin goes pale where it is pressed and pink after; only where the picture looks like skin
    'vec3 matTone(vec3 c, vec3 bu) {',
    '  c *= 1.0 - clamp(gDepth, 0.0, 1.0) * vec3(0.02, 0.035, 0.045) * u_mat.w;',  // the bottom of a dimple: a touch darker, warm
    '  float tw = clamp(gTone, -1.0, 1.0) * u_mat.z;',
    '  if (abs(tw) > 0.002) {',
    '    tw *= skinW(bu);',
    // blanched skin: the blood is pushed out, so it turns lighter and less red (toward white, not grey or yellow)
    '    vec3 pale = min(c * vec3(1.03, 1.06, 1.04) + vec3(0.07, 0.07, 0.05), vec3(1.0));',
    '    vec3 pink = c * vec3(1.05, 0.83, 0.82) + vec3(0.06, 0.0, 0.005);',
    '    c = tw < 0.0 ? mix(c, pale, -tw) : mix(c, pink, tw);',
    '  }',
    '  return c;',
    '}',
    'void main() {',
    '  vec2 uv = v_uv;',
    '  if (u_dm > 0.5 && u_mode < 0.5) {',                                // experimental depth: shift the picture with height (parallax)
    '    float h1 = texture2D(u_height, uv).r;',
    '    uv += vec2(-u_tiltF.y, u_tiltF.x) * (h1 - 0.35) * 0.05;',
    '    float h2 = texture2D(u_height, uv).r;',
    '    uv = v_uv + vec2(-u_tiltF.y, u_tiltF.x) * ((h1 + h2) * 0.5 - 0.35) * 0.05;',
    '  }',
    '  float m = roundMask(v_uv);',
    '  vec4 t = texture2D(u_tex, uv);',
    '  if (u_mode > 0.5 && u_mode < 1.5) {',
    '    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) * (u_shadow * m * t.a);',
    '    return;',
    '  }',
    '  vec3 bu = t.rgb / max(t.a, 0.001);',
    '  gSlope = vec2(0.0); gDepth = 0.0; gTone = 0.0;',
    '  if (u_matOn > 0.5 && u_spotN > 0.5) spots(v_uv);',
    '  if (u_mode > 1.5) {',
    '    gl_FragColor = vec4(bu * 0.62 * t.a, t.a) * m;',
    '    return;',
    '  }',
    '  if (u_nscale < 0.01 && u_paint <= 0.0) {',
    '    if (u_matOn < 0.5) { gl_FragColor = t * m; return; }',
    // 3D off but a material on: the flat picture plus only the light change the dent and folds make
    '    vec3 cf = dentShade(bu, orient(vec3(0.0, 0.0, 1.0)), orient(matNormal(vec3(0.0, 0.0, 1.0))));',
    '    gl_FragColor = vec4(clamp(matTone(cf, bu), 0.0, 1.0) * t.a, t.a) * m;',
    '    return;',
    '  }',
    '  vec2 e = u_texel * 1.5;',
    '  float gx = hs(uv + vec2(e.x, 0.0)) - hs(uv - vec2(e.x, 0.0));',
    '  float gy = hs(uv + vec2(0.0, e.y)) - hs(uv - vec2(0.0, e.y));',
    '  vec3 n = normalize(vec3(-gx * u_nscale, -gy * u_nscale, 1.0));',
    '  vec3 n2 = orient(n);',
    '  float h0 = hs(v_uv);',
    '  float cav = 0.0;',
    '  if (u_q > 0.5) {',
    '    vec2 r6 = u_texel * 6.0;',
    '    float hb = (hs(v_uv + vec2(r6.x, 0.0)) + hs(v_uv - vec2(r6.x, 0.0)) + hs(v_uv + vec2(0.0, r6.y)) + hs(v_uv - vec2(0.0, r6.y))) * 0.25;',
    '    cav = clamp((hb - h0) * u_nscale * 0.22, 0.0, 0.32);',
    '  }',
    '  float edgeAO = mix(0.86, 1.0, smoothstep(0.0, 0.25, h0));',
    '  vec3 c = lightC(n2, bu, (1.0 - cav) * edgeAO * (1.0 + v_shade * 0.35));',
    '  c += vec3(max(v_shade, 0.0) * 0.06);',
    '  if (u_matOn > 0.5) c = matTone(dentShade(c, n2, orient(matNormal(n))), bu);',
    '  if (u_paint > 0.0) {',                                             // showing the softness map while painting it
    '    float kk = texture2D(u_kmap, v_uv).r * 4.0;',
    '    vec3 tint = kk < 1.0 ? vec3(0.1, 0.85, 0.55) : (kk > 3.0 ? vec3(0.95, 0.15, 0.2) : vec3(1.0, 0.55, 0.1));',
    '    float amt = kk < 1.0 ? (1.0 - kk) / 0.7 : min(1.0, (kk - 1.0) / 2.0);',
    '    c = mix(c, tint, clamp(amt, 0.0, 1.0) * 0.55 * u_paint);',
    '  }',
    '  gl_FragColor = vec4(min(c, vec3(1.0)) * t.a, t.a) * m;',
    '}'
  ].join('\n');

  // quality levels: grid density, pixel ratio cap, thickness layers, height map size, extra shading
  var QUALITY = {
    low: { grid: 14, rigGrid: 40, dpr: 1, layers: 0, hm: 96, q: 0 },
    medium: { grid: 20, rigGrid: 54, dpr: 1.5, layers: 2, hm: 128, q: 1 },
    high: { grid: 26, rigGrid: 66, dpr: 2, layers: 3, hm: 160, q: 1 }
  };
  var ORDER = ['low', 'medium', 'high'];

  function autoQuality() {
    var cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4;
    if (cores <= 2 || mem <= 2) return 'low';
    if (cores <= 4 || mem <= 4) return 'medium';
    return 'high';
  }

  // small seeded random generator, so a recorded motion replays the same "alive" twitches
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function create(opts) {
    var canvas = opts.canvas, stage = opts.stage;
    var say = opts.say || function () {};
    var snd = opts.sound || null;
    var gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: true, alpha: true });
    if (!gl) return null;

    var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mqDark = matchMedia('(prefers-color-scheme: dark)');

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        say('جهازك ما قدر يجهّز العرض ثلاثي الأبعاد');
      }
      return s;
    }
    // version 26: everything on the graphics card is made here, so a phone that drops the card (webglcontextlost)
    // gets it all back when the card returns (see 'context lost' below)
    var prog, U, posBuf, uvBuf, shBuf, hBuf, idxBuf, fdBuf, tex, hmTex, kTex;
    function initGL() {
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
      gl.bindAttribLocation(prog, 0, 'a_pos');
      gl.bindAttribLocation(prog, 1, 'a_uv');
      gl.bindAttribLocation(prog, 2, 'a_shade');
      gl.bindAttribLocation(prog, 3, 'a_h');
      gl.bindAttribLocation(prog, 5, 'a_fold');
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      U = {};
      ['u_res', 'u_off', 'u_flat', 'u_c', 'u_tilt', 'u_depth', 'u_f', 'u_floor', 'u_sh',
        'u_tex', 'u_height', 'u_texel', 'u_mode', 'u_aspect', 'u_round', 'u_shadow', 'u_nscale',
        'u_ang', 'u_tiltF', 'u_hs', 'u_zoff', 'u_gloss', 'u_q', 'u_dm', 'u_paint', 'u_kmap', 'u_matOn', 'u_mat', 'u_spotA', 'u_spotB', 'u_spotN', 'u_bodyPx', 'u_L'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      posBuf = gl.createBuffer(); uvBuf = gl.createBuffer(); shBuf = gl.createBuffer();
      hBuf = gl.createBuffer(); idxBuf = gl.createBuffer(); fdBuf = gl.createBuffer();
      tex = gl.createTexture(); hmTex = gl.createTexture(); kTex = gl.createTexture();
    }
    initGL();

    /* ---------- state ---------- */
    var W = 0, H = 0, AH = 0, dpr = 1;
    var aspect = 1, bw = 200, bh = 200, roundness = 0.07;
    var nx = 0, ny = 0, count = 0, idxLen = 0;
    var regions = [], faceTaps = [], softT = 0, shakeT = 0;
    var headW = null, head = null;             // per-vertex weight of the head (only when a face was found)
    var hAng = 0, hVel = 0;                    // the head's own small rotation around the chin
    var free = false, uS = 1, gloss = 0.35, strength = 0.5, softness = 0.6;
    var px, py, vx, vy, lx, ly, ax, ay, dxA, dyA, rx, ry, pos, shade, hArr, boundary = [];
    var cx = 0, cy = 0, cvx = 0, cvy = 0, ang = 0, avel = 0, homeX = 0, homeY = 0;
    var tiltX = 0, tiltY = 0, tvX = 0, tvY = 0;
    var gravityOn = true, alive = !reduceMotion, on3d = true;
    var gScale = 1;
    var time = 0, pr = 100, lifeT = 3;
    var KS = 250, CD = 4.1;
    var depthAmp = 0.24, nscale = 4.5, relief = 0.45, isCard = true;
    var manual = false, vclock = 0;
    var qualityPref = 'auto', quality = autoQuality(), Q = QUALITY[quality];
    var rand = mulberry32(12345);
    // sleep / power
    var raf = 0, sleeping = false, idleT = 0, wakeTimer = 0, lowPower = false, skipFrame = false, keepAwake = false;
    var maxDev2 = 0, maxVel2 = 0, sleepEnabled = true, paused = false;
    // smart sleep: a move or dance playing with nobody touching the phone for napAfter seconds stops the loop (it
    // goes on from there at the next touch); halfRate: a moving loop drawn at 30 fps (physics is the same)
    var napAfter = 0, lastInput = 0, napping = false, halfRate = false, halfSkip = false;
    // recording hooks
    var stepsDone = 0, inputSink = null, stepHook = null, replaying = false, tBase = 0, virt = null;
    // physics revision: 3 = current. 1 = how the engine behaved before 19 Oct 2026; kept so motions
    // saved then still replay exactly the same (their files say version 1). 2 = the same as 3 except the
    // skeleton's body mask (made by the browser's scaler); skeleton recordings from the first build use it.
    // 4 = 3 + hands resting on the body stay there; 5 = 4 + the limbs are stiffer (RIG_K_VIDEO) in a dance read from a video
    // 6 (version 30) = 5 + a body that moves (a skeleton move, a dance, "واقف حي" / "جالس حي") is solid: it follows its
    // bones without the jelly's lag and wobble; only the skin under a finger still gives (SOLID_KEEP below)
    // 7 (version 37) = 6 + a livelier skeleton: each bone follows its move on a spring (a little behind, a little past,
    // then settles); the back bends along its length (the chest the most, the hips the least), the neck bends under
    // the head; a joint's skin turns around the joint itself (an elbow or a knee keeps its thickness when it bends);
    // the hand lags a little behind the forearm; the foot stays level with the floor while the shin swings
    var rev = 7;
    var SOLID_KEEP = 0.25;      // TUNE: rev 6, a moving body: how much of its jelly offset a point keeps each step (120 per s)
    var damping = 0.5, mass = 0.5, dampMul = 1, massMul = 1;      // "تخميد" and "ثقل" sliders
    var anchorX = 0, anchorY = 0;                                   // where the body rests (normal mode)
    // softness map painted by the user: a 24 x 24 grid over the picture, 1 = normal, <1 softer, >1 stiffer
    var KGN = 24, kGrid = new Float32Array(KGN * KGN).fill(1), kPaint = null, kv = null;
    var paintMode = null, brush = 0.12, paintView = 0;
    // character moves (animator.js)
    var anim = { clip: 'none', auto: false, speed: 1, amount: 0.6 };
    var picSize = 1;                           // version 28: "حجم الصورة" (1 = as before; a person standing gets more)
    var aClip = 'none', aT = 0, aPrev = null, aPrevT = 0, aMixT = 1, aW = 0, autoLeft = 0, lastLand = -1;
    var AD = { ox: 0, oy: 0, rot: 0, sx: 1, sy: 1, head: 0, tx: 0, ty: 0, land: 0 }, lookX = 0, lookY = 0, lookOn = 0;
    // look
    var depthMode = 0, gyroOn = false, gyro = { x: 0, y: 0, bx: null, by: null };
    // skeleton (rig.js, pose.js, clips-rig.js). rig = the saved settings { joints, clip, amount, speed } or null
    var rigContact = { L: null, R: null };     // hands resting on the body (Rig.contacts): kept on their spot
    // an arm drawn as its own layer (setLimbLayer): the body under it is filled in and does not follow it
    var limbs = { L: null, R: null };          // per side: { tex, mesh, bufs }
    var rigRelative = false;                    // rev 4: the picture is not a plain stand: real dances are added to its pose
    var rigEdges = null, rigMoved = null, rigChecked = null, preEdit = null, rig = null, skel = null, rbind = null, rigMask = null, rigTr = null, rigRaise = null, rigT = 0, rigBlend = 0, editing = false;
    // material (skin.js): MAT = the preset's numbers, or null for "classic" (then nothing below changes anything)
    var skinName = 'classic', MAT = null, fld = null, cmX = null, cmY = null, fdAttr = null;
    var spotA = new Float32Array(24), spotB = new Float32Array(24);
    var ikW = { L: 0, R: 0 }, ikRaise = { L: null, R: null };
    var jW = { legL: 0, legR: 0, head: 0 }, jRaise = { legL: null, legR: null, head: null };   // rev 7: a finger on a foot or the head
    // rev 7: the skeleton's springs (per bone: its angle and speed), the hands' lag, and each body point's place along
    // the torso, the neck, the forearm and the shin (rest, 0 = the bone's start, 1 = its end)
    var sprCur = null, sprVel = null, sprTg = null, sprOn = false, handLag = { L: [0, 0], R: [0, 0] }, flexT = null, flexH = null, flexF = null, flexS = null;
    var SPR_Z = 1, SPR_OM = { torso: 10, head: 8, upperArmL: 12, upperArmR: 12, forearmL: 11, forearmR: 11, thighL: 13, thighR: 13, shinL: 13, shinR: 13 };   // TUNE
    var SPR_VMAX = 12, SPR_FF = 0.5, HAND_OM = 9, HAND_Z = 1, HAND_MAX = 0.35;           // TUNE: the hand's lag behind the forearm (rad/s, damping, most)
    var absB = new Float64Array(16);
    // "alive 3D" for a picture with a face (portrait.js): life = the settings or null, PM = the head model
    var life = null, PM = null, pW = null, pZ = null, pT = null;
    var pyaw = 0, pyawV = 0, ppit = 0, ppitV = 0, pbreath = 0;
    var lightAz = -2.256;
    // health, for the app's watchdog: steps since it last asked, steps where the skeleton's strain limit
    // could not settle, and how many times the safety net had to reset an invalid shape
    var hSteps = 0, hSat = 0, hNan = 0, hPin = 0, hPinN = 0;      // where the light comes from (radians around the picture); -2.256 = top left (the original)   // dragging a hand: how much IK overrides the clip
    var RIG_K = 2.0;            // limbs are stiffer than jelly, so they do not melt, but still lag and wobble
    var RIG_K_VIDEO = 8.0;      // rev 5, a dance read from a video: fast real moves; 2 lets a limb lag up to a quarter of its length (measured)
    var RIG_MAX_SIDE = 80, RIG_MAX_POINTS = 4200;   // perf budget: outside points are cheap (kinematic), body points are not

    var FB = 66;         // floor inset: the shelf of pictures sits below the playable area
    var G = 1100;        // gravity, px/s^2
    var KHOME = 22;      // spring that pulls the whole body back to the middle (normal mode)
    var CB = 3.2;        // body damping
    var REST = 0.42;     // wall bounce (0.55 in rev 1)
    var KN = 1400;       // neighbour coupling, carries the ripples
    var CN = 14;         // neighbour velocity damping
    var KP = 14;         // volume pressure: squash one side and the rest bulges
    var KT = 55;         // 3D tilt spring
    var CT = 4.2;        // 3D tilt damping
    var PRESS = 7000;    // dent force while a finger is held down
    var VMAX = 4200;
    var KG = 260;        // how tightly a finger holding the body pulls it (normal mode)
    var CG = 22;
    var KA = 1.3;        // local stretch toward a holding finger, as a multiple of KS (rev 1; rev 2 uses KA2)
    var KA2 = 6, CF = 9; // rev 2: the held spot follows the finger closely, with matching velocity
    var FLICK_MIN = 450; // swipe speed (px/s) above which a swipe hits the body
    var K_FLICK = 0.2;   // how hard a swipe throws the body
    var STEP = 1 / 120;
    // version 38: an earthquake: the ground moves under the whole picture (the background with it); the soft body lags
    // behind on its springs, so it wobbles. Counted in fixed steps from the moment it starts: a replay gets the same.
    var QUAKE_S = 4, quakeN = 0, quakeTotal = 0, quakeAmp = 0, quakeX = 0, quakeY = 0;
    function quakeStep() {
      if (quakeN >= quakeTotal) { quakeX = quakeY = 0; return; }
      var t = quakeN * STEP, T = quakeTotal * STEP, env = Math.min(1, t / 0.25) * Math.min(1, Math.max(0, (T - t) / 1.4));
      env = env * env * (3 - 2 * env);
      var A = 0.045 * Math.max(bw, bh) * uS * (0.4 + 0.6 * quakeAmp) * env, P2 = Math.PI * 2;   // TUNE: how far the ground moves
      quakeX = A * (Math.sin(P2 * 4.1 * t) + 0.6 * Math.sin(P2 * 6.7 * t + 1.3) + 0.35 * Math.sin(P2 * 11.3 * t + 0.4)) / 1.95;
      quakeY = A * 0.4 * (Math.sin(P2 * 5.3 * t + 0.7) + 0.5 * Math.sin(P2 * 9.1 * t + 2.1)) / 1.5;
      quakeN++;
    }

    function isDark() { return mqDark.matches; }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function power() { return 0.6 + 0.8 * strength; }
    // version 28: "واقف حي" (Animator 'stand') is a person standing: a touch does not ripple it like jelly, it pushes
    // the body, which leans away with its feet on the floor and sways back (two springs: the hips and the upper
    // body). A drag leans the body the way you pull, and lets go like a person pushed. Only with that move, so
    // older recordings replay as they were.
    var nH = 0, nHv = 0, nL = 0, nLv = 0, nHt = 0, nLt = 0;
    var NUDGE_K = 38, NUDGE_C = 4.2, NUDGE_TAP = 0.25, NUDGE_MAX = 0.045;   // TUNE: spring, damping (a few swings), a tap, the most a drag leans (x the height)
    function human() { return (anim.clip === 'stand' || anim.clip === 'sit') && !free; }
    function nudgeShare(y) {                // a push high on the body leans it; at the hips it shifts the hips
      var top = cy - bh * uS / 2, v = clamp((top + bh * uS - y) / (bh * uS), 0, 1);
      if (anim.clip === 'sit') return { hip: 0, lean: smooth01((v - 0.4) / 0.45) };   // sitting: the legs stay, the upper body is pushed
      return { hip: clamp(1 - Math.abs(v - 0.45) / 0.35, 0, 1) * 0.6, lean: smooth01((v - 0.35) / 0.5) };
    }      // "قوة اللمس": 0.6x .. 1.4x
    function r2d(v) { return Math.round(v * 100) / 100; }

    /* ---------- sound + haptics (the sounds themselves live in sound.js) ---------- */
    function noop() {}
    var S = snd || { tap: noop, release: noop, impact: noop, voice: noop, gel: noop, unlock: noop, sleep: noop, wake: noop, setPitch: noop, setMuted: noop };
    var haptics = !reduceMotion;
    function buzz(ms) {
      if (replaying || !haptics) return;
      try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* optional */ }
    }
    function hitFx(p) { S.impact(p); buzz(Math.round(10 + p * 30)); }

    /* ---------- free move (placement owned by freemove.js) ---------- */
    var fm = window.FreeMove ? FreeMove.create({ bounds: freeBounds, maxScale: freeMaxScale }) : null;
    function freeMaxScale(a) {        // the biggest size that still leaves room to move around
      var c = Math.abs(Math.cos(a || 0)), n = Math.abs(Math.sin(a || 0));
      return Math.max(0.6, Math.min(W / ((c * bw + n * bh) * 1.12), AH / ((n * bw + c * bh) * 1.12)));
    }
    function freeBounds(s, a) {
      var c = Math.abs(Math.cos(a)), n = Math.abs(Math.sin(a));
      var hx = (c * bw + n * bh) * s / 2, hy = (n * bw + c * bh) * s / 2;
      var b = { minX: hx, maxX: W - hx, minY: hy, maxY: AH - hy };
      if (b.minX > b.maxX) b.minX = b.maxX = W / 2;
      if (b.minY > b.maxY) b.minY = b.maxY = AH / 2;
      return b;
    }

    /* ---------- height map (the 3D shape) ---------- */
    var hmW = 2, hmH = 2, hmData = null, hmCanvas = null;

    function boxBlur(src, w, h, r) {
      var tmp = new Float32Array(w * h), out = new Float32Array(w * h), x, y, k, s, c;
      for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
          s = 0; c = 0;
          for (k = -r; k <= r; k++) { var xx = x + k; if (xx >= 0 && xx < w) { s += src[y * w + xx]; c++; } }
          tmp[y * w + x] = s / c;
        }
      }
      for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
          s = 0; c = 0;
          for (k = -r; k <= r; k++) { var yy = y + k; if (yy >= 0 && yy < h) { s += tmp[yy * w + x]; c++; } }
          out[y * w + x] = s / c;
        }
      }
      return out;
    }

    function distanceField(mask, w, h) {
      var INF = 1e9, d = new Float32Array(w * h), x, y, i, v;
      for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
          i = y * w + x;
          d[i] = mask[i] ? ((x === 0 || y === 0 || x === w - 1 || y === h - 1) ? 1 : INF) : 0;
        }
      }
      for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
          i = y * w + x;
          if (!mask[i]) continue;
          v = d[i];
          if (x > 0) v = Math.min(v, d[i - 1] + 1);
          if (y > 0) {
            v = Math.min(v, d[i - w] + 1);
            if (x > 0) v = Math.min(v, d[i - w - 1] + 1.414);
            if (x < w - 1) v = Math.min(v, d[i - w + 1] + 1.414);
          }
          d[i] = v;
        }
      }
      for (y = h - 1; y >= 0; y--) {
        for (x = w - 1; x >= 0; x--) {
          i = y * w + x;
          if (!mask[i]) continue;
          v = d[i];
          if (x < w - 1) v = Math.min(v, d[i + 1] + 1);
          if (y < h - 1) {
            v = Math.min(v, d[i + w] + 1);
            if (x < w - 1) v = Math.min(v, d[i + w + 1] + 1.414);
            if (x > 0) v = Math.min(v, d[i + w - 1] + 1.414);
          }
          d[i] = v;
        }
      }
      return d;
    }

    // card = the whole picture (bevelled slab); otherwise a cut-out (rounded, like an inflated shape)
    function buildHeight(card) {
      isCard = card;
      var s = Q.hm / Math.max(tc.width, tc.height);
      hmW = Math.max(8, Math.round(tc.width * s));
      hmH = Math.max(8, Math.round(tc.height * s));
      hmCanvas = hmCanvas || document.createElement('canvas');
      hmCanvas.width = hmW; hmCanvas.height = hmH;
      var hx = hmCanvas.getContext('2d', { willReadFrequently: true });
      hx.clearRect(0, 0, hmW, hmH);
      hx.drawImage(tc, 0, 0, hmW, hmH);
      var data = hx.getImageData(0, 0, hmW, hmH).data;
      var n = hmW * hmH, Hh = new Float32Array(n), i, x, y, t;
      var blurR = Math.max(1, Math.round(2 * hmW / 128));
      if (card) {
        var R = 0.16 * Math.min(hmW, hmH);
        for (y = 0; y < hmH; y++) {
          for (x = 0; x < hmW; x++) {
            var dd = Math.min(x + 0.5, y + 0.5, hmW - x - 0.5, hmH - y - 0.5);
            t = Math.min(dd / R, 1);
            Hh[y * hmW + x] = Math.sqrt(1 - (1 - t) * (1 - t));
          }
        }
        depthAmp = 0.08;
      } else {
        var mask = new Uint8Array(n);
        for (i = 0; i < n; i++) mask[i] = data[4 * i + 3] > 128 ? 1 : 0;
        var d = distanceField(mask, hmW, hmH), dmax = 1;
        for (i = 0; i < n; i++) if (d[i] > dmax && d[i] < 1e8) dmax = d[i];
        var R2 = Math.max(4, dmax * 0.9);
        for (i = 0; i < n; i++) {
          if (!mask[i]) { Hh[i] = 0; continue; }
          t = Math.min(d[i] / R2, 1);
          Hh[i] = Math.pow(1 - (1 - t) * (1 - t), 0.6);   // gentle shoulder, flatter top: rounded, not a balloon
        }
        depthAmp = 0.22;
      }
      Hh = boxBlur(boxBlur(Hh, hmW, hmH, blurR), hmW, hmH, blurR);

      // "Stamp" relief: the picture's own tones become relief. Dark lines and features (eyes, mouth,
      // creases, folds) sink in; bright areas swell a little. Mixed with the silhouette shape.
      if (relief > 0.001) {
        var L = new Float32Array(n), alpha = new Float32Array(n);
        for (i = 0; i < n; i++) {
          alpha[i] = data[4 * i + 3] / 255;
          L[i] = (0.299 * data[4 * i] + 0.587 * data[4 * i + 1] + 0.114 * data[4 * i + 2]) / 255;
        }
        var fine = boxBlur(L, hmW, hmH, 1);
        var cR = Math.max(3, Math.round(5 * hmW / 128));
        var coarse = boxBlur(boxBlur(L, hmW, hmH, cR), hmW, hmH, cR);
        var mean = 0, cnt = 0;
        for (i = 0; i < n; i++) if (alpha[i] > 0.5) { mean += coarse[i]; cnt++; }
        mean = cnt ? mean / cnt : 0.5;
        for (i = 0; i < n; i++) {
          if (alpha[i] < 0.5) continue;
          var edgeFade = Math.min(Hh[i] * 3, 1);            // keep the rim clean
          var detail = clamp(fine[i] - coarse[i], -0.3, 0.3);
          var swell = clamp(coarse[i] - mean, -0.5, 0.5);
          Hh[i] = clamp(Hh[i] * (1 - 0.2 * relief) + edgeFade * relief * (0.9 * detail + 0.22 * swell), 0, 1);
        }
        Hh = boxBlur(Hh, hmW, hmH, 1);
      }
      hmData = Hh;

      var bytes = new Uint8Array(n * 4);
      for (i = 0; i < n; i++) {
        bytes[4 * i] = Math.round(clamp(Hh[i], 0, 1) * 255);
        bytes[4 * i + 3] = 255;
      }
      gl.bindTexture(gl.TEXTURE_2D, hmTex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, hmW, hmH, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    function refreshHeights() {
      if (!count) return;
      var stride = nx + 1;
      for (var j = 0; j <= ny; j++) for (var i = 0; i <= nx; i++) hArr[j * stride + i] = sampleH(i / nx, j / ny);
      gl.bindBuffer(gl.ARRAY_BUFFER, hBuf);
      gl.bufferData(gl.ARRAY_BUFFER, hArr, gl.STATIC_DRAW);
    }

    function sampleH(u, v) {
      if (!hmData) return 0;
      var fx = clamp(u, 0, 1) * (hmW - 1), fy = clamp(v, 0, 1) * (hmH - 1);
      var x0 = Math.floor(fx), y0 = Math.floor(fy);
      var x1 = Math.min(x0 + 1, hmW - 1), y1 = Math.min(y0 + 1, hmH - 1);
      var ax_ = fx - x0, ay_ = fy - y0;
      var a = hmData[y0 * hmW + x0], b = hmData[y0 * hmW + x1];
      var c = hmData[y1 * hmW + x0], d = hmData[y1 * hmW + x1];
      return (a * (1 - ax_) + b * ax_) * (1 - ay_) + (c * (1 - ax_) + d * ax_) * ay_;
    }

    /* ---------- mesh ---------- */
    // keepPose: rebuild (new size / quality) without sending the body back to the middle
    function build(keepPose) {
      if (W < 10 || H < 10) return;
      var pose = keepPose && count ? { x: cx, y: cy, ang: ang, scale: uS } : null;
      AH = H - FB;
      var maxW = Math.min(W * 0.94, W * 0.58 * picSize), maxH = Math.min(AH * 0.94, AH * 0.6 * picSize);   // version 28: the picture's size
      var w = maxW, h = w / aspect;
      if (h > maxH) { h = maxH; w = h * aspect; }
      bw = w; bh = h;
      pr = Math.max(60, Math.min(140, Math.min(bw, bh) * 0.3));

      // a material shows its dimples and folds on a finer mesh (MAT.grid x)
      // finer for a material (dimples, folds) and for a living portrait (the face turns smoothly)
      var gf = Math.max(MAT ? MAT.grid : 1, life ? 1.7 : 1);
      var g = gf > 1 ? Math.round(Q.grid * gf) : Q.grid, gmax = gf > 1 ? 56 : 34;
      nx = clamp(aspect >= 1 ? g : Math.round(g * aspect), 8, gmax);
      ny = clamp(aspect >= 1 ? Math.round(g / aspect) : g, 8, gmax);
      if (rigOn()) {
        // a person needs a finer mesh (thin arms), and the cells are sized to the BODY, not the picture:
        // Q.rigGrid square cells along the body's height, capped at RIG_MAX_SIDE per side and RIG_MAX_POINTS
        if (!rigMask) rigMask = makeRigMask();
        var bb = rigMask.bbox, fh = bb ? (bb.y1 - bb.y0 + 1) / rigMask.h : 1;
        var cell = Math.max(1e-3, fh * bh / Q.rigGrid);
        var gx = Math.ceil(bw / cell), gy = Math.ceil(bh / cell);
        var sc = Math.min(1, RIG_MAX_SIDE / Math.max(gx, gy), Math.sqrt(RIG_MAX_POINTS / ((gx + 1) * (gy + 1))));
        nx = clamp(Math.round(gx * sc), 8, RIG_MAX_SIDE); ny = clamp(Math.round(gy * sc), 8, RIG_MAX_SIDE);
      }
      var stride = nx + 1;
      count = stride * (ny + 1);

      px = new Float32Array(count); py = new Float32Array(count);
      vx = new Float32Array(count); vy = new Float32Array(count);
      lx = new Float32Array(count); ly = new Float32Array(count);
      ax = new Float32Array(count); ay = new Float32Array(count);
      dxA = new Float32Array(count); dyA = new Float32Array(count);
      rx = new Float32Array(count); ry = new Float32Array(count);
      pos = new Float32Array(count * 2);
      shade = new Float32Array(count);
      hArr = new Float32Array(count);
      if (!fld && window.Skin) fld = new Skin.Spots();
      if (fld) fld.reset();
      cmX = new Float32Array(count); cmY = new Float32Array(count);
      fdAttr = new Float32Array(count * 2);
      var uvs = new Float32Array(count * 2);
      var idx = new Uint16Array(nx * ny * 6);

      var i, j, k;
      for (j = 0; j <= ny; j++) {
        for (i = 0; i <= nx; i++) {
          k = j * stride + i;
          lx[k] = (i / nx - 0.5) * bw;
          ly[k] = (j / ny - 0.5) * bh;
          uvs[2 * k] = i / nx;
          uvs[2 * k + 1] = j / ny;
          hArr[k] = sampleH(i / nx, j / ny);
        }
      }
      // outline of the grid, in order, for the volume (area) calculation
      boundary = [];
      for (i = 0; i < nx; i++) boundary.push(i);
      for (j = 0; j < ny; j++) boundary.push(j * stride + nx);
      for (i = nx; i > 0; i--) boundary.push(ny * stride + i);
      for (j = ny; j > 0; j--) boundary.push(j * stride);

      // With a skeleton the mesh is fine and the picture is mostly empty background: cells with no
      // visible pixel at all (alpha > 4, one mask cell of margin) are not drawn. Saves fill rate on phones.
      var vis = null;
      if (rigOn() && !noCull) {
        vis = Pose.mask(tc, 128, 4);
        var VW = vis.w, VH = vis.h, VD = vis.data;
        var cellAny = function (ci, cj) {
          var x0 = Math.max(0, Math.floor(ci / nx * (VW - 1)) - 1), x1 = Math.min(VW - 1, Math.ceil((ci + 1) / nx * (VW - 1)) + 1);
          var y0 = Math.max(0, Math.floor(cj / ny * (VH - 1)) - 1), y1 = Math.min(VH - 1, Math.ceil((cj + 1) / ny * (VH - 1)) + 1);
          for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) if (VD[yy * VW + xx]) return true;
          return false;
        };
      }
      var q = 0;
      for (j = 0; j < ny; j++) {
        for (i = 0; i < nx; i++) {
          if (vis && !cellAny(i, j)) continue;
          var a = j * stride + i, b = a + 1, c = a + stride, d = c + 1;
          idx[q++] = a; idx[q++] = b; idx[q++] = c;
          idx[q++] = b; idx[q++] = d; idx[q++] = c;
        }
      }
      if (q < idx.length) idx = idx.slice(0, q);
      idxLen = idx.length;
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, hBuf);
      gl.bufferData(gl.ARRAY_BUFFER, hArr, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      computeHead();
      computePortrait();
      computeKV();
      bindRig();
      if (pose) { setAnchor(anchorX || W / 2, anchorY || AH / 2); restPose(pose, true); } else resetBody();
      paintScene();
    }

    // Normal mode rests at an anchor. Rev 2: the anchor is the middle after "رجّعها", or wherever the body
    // was when you switched gravity or free move, so switching never sends it somewhere else by itself.
    function setHome() {
      var ax0 = rev >= 2 ? anchorX : W / 2, ay0 = rev >= 2 ? anchorY : AH / 2;
      homeX = ax0;
      homeY = ay0 - (gravityOn ? G * gScale : 0) / KHOME;
    }
    function setAnchor(x, y) {
      var hx = bw / 2, hy = bh / 2;
      anchorX = clamp(x, Math.min(hx, W / 2), Math.max(W - hx, W / 2));
      anchorY = clamp(y, Math.min(hy, AH / 2), Math.max(AH - hy, AH / 2));
      setHome();
    }

    // every point back at its place around a placement, nothing moving
    function restPose(tr, soft) {
      if (!count) return;
      cx = tr.x; cy = tr.y; ang = tr.ang || 0; uS = tr.scale || 1;
      cvx = cvy = avel = 0;
      hAng = hVel = 0;
      if (!soft) { tiltX = tiltY = tvX = tvY = 0; }
      var cs = Math.cos(ang), sn = Math.sin(ang);
      for (var k = 0; k < count; k++) {
        var a = lx[k] * uS, b = ly[k] * uS;
        px[k] = cx + a * cs - b * sn;
        py[k] = cy + a * sn + b * cs;
        vx[k] = 0; vy[k] = 0;
      }
      if (free && fm) fm.start({ x: cx, y: cy, ang: ang, scale: uS });
      setHome();
    }

    function resetBody() {
      if (!count) return;
      softT = shakeT = 0;
      lifeT = 2.5;
      anchorX = W / 2; anchorY = AH / 2;
      restPose({ x: W / 2, y: AH / 2, ang: 0, scale: 1 });
    }

    /* ---------- still background ("الخلفية ثابتة") ----------
     * The picture the character was cut from (its place filled in) drawn behind the moving body, so the
     * character moves inside its own picture instead of the whole picture moving as a card.
     * Drawing only: it never touches the physics, so recordings replay to the same checksum with or
     * without it. It sits where the character rests in the middle (the cut's box lines up with the body). */
    var scene = null, sceneCv = null, sceneKey = '';
    function okBox(b) {
      return !!b && typeof b === 'object' && [b.x, b.y, b.w, b.h].every(function (v) { return typeof v === 'number' && isFinite(v); }) &&
        b.w >= 0.02 && b.w <= 1.05 && b.h >= 0.02 && b.h <= 1.05 && b.x >= -0.05 && b.x <= 1 && b.y >= -0.05 && b.y <= 1;
    }
    function setScene(img, box) {
      var iw = img ? (img.naturalWidth || img.width) : 0, ih = img ? (img.naturalHeight || img.height) : 0;
      scene = img && iw > 1 && ih > 1 && okBox(box) ? { img: img, box: { x: box.x, y: box.y, w: box.w, h: box.h } } : null;
      paintScene();
      wake();
      return !!scene;
    }
    function sceneRect() {
      if (!scene || !count) return null;
      var b = scene.box, pw = bw / b.w, ph = bh / b.h;
      return { x: W / 2 - bw / 2 - b.x * pw, y: AH / 2 - bh / 2 - b.y * ph, w: pw, h: ph };
    }
    function paintScene() {
      var r = scene && !editing ? sceneRect() : null;
      if (!r && !sceneCv) return;
      if (!sceneCv) {
        sceneCv = document.createElement('canvas');
        sceneCv.className = 'scene';
        sceneCv.setAttribute('aria-hidden', 'true');
        stage.insertBefore(sceneCv, canvas);
      }
      ['width', 'height', 'inset', 'left', 'top', 'transform', 'transformOrigin'].forEach(function (p) { sceneCv.style[p] = canvas.style[p]; });
      if (r && (quakeX || quakeY)) { r.x += quakeX; r.y += quakeY; }
      var key = r ? [r.x, r.y, r.w, r.h].map(function (v) { return Math.round(v * 4); }).join(',') + ',' + canvas.width + 'x' + canvas.height : '';
      if (key === sceneKey) return;
      sceneKey = key;
      sceneCv.style.visibility = r ? 'visible' : 'hidden';
      if (sceneCv.width !== canvas.width || sceneCv.height !== canvas.height) { sceneCv.width = canvas.width; sceneCv.height = canvas.height; }
      var x2 = sceneCv.getContext('2d');
      x2.clearRect(0, 0, sceneCv.width, sceneCv.height);
      if (!r) return;
      var k = canvas.width / Math.max(1, W);
      x2.imageSmoothingEnabled = true;
      try { x2.imageSmoothingQuality = 'high'; } catch (e) { /* optional */ }
      x2.drawImage(scene.img, r.x * k, r.y * k, r.w * k, r.h * k);
    }

    /* ---------- picture ---------- */
    var tc = document.createElement('canvas');
    function setSource(src, sw, sh, o) {
      o = o || {};
      rigMask = null;
      clearLimbs();                                                          // a layer belongs to the picture it was cut from
      var s = Math.min(1, 1024 / Math.max(sw, sh));
      tc.width = Math.max(2, Math.round(sw * s));
      tc.height = Math.max(2, Math.round(sh * s));
      var tx = tc.getContext('2d', { willReadFrequently: true });   // the director and the skeleton read its pixels
      tx.clearRect(0, 0, tc.width, tc.height);
      tx.drawImage(src, 0, 0, tc.width, tc.height);
      uploadTex();
      aspect = tc.width / tc.height;
      roundness = o.round === false ? 0 : 0.07;
      lastRound = o.round !== false;
      buildHeight(lastRound);
      build(false);
    }
    var lastRound = true;
    /* version 40: a playing video as the picture (the interactive video): every new frame goes straight into the same
     * texture, so the soft body, the material, the sound, the earthquake and the rest all work on the video. The
     * mesh and its heights stay those of the frame given to setSource, so nothing else changes. null = a still
     * picture again (exactly as before). */
    var liveVideo = null, liveT = -1, frameHook = null, noCull = false;
    function setVideo(v) { liveVideo = v || null; liveT = -1; if (liveVideo) wake(); }
    // the video like a picture (videolive.js): each new frame can be made into something else before it is drawn
    // (the person cut out of it, the background behind drawn as the scene). fn(video, time) -> a canvas, or null =
    // the frame as it is. And a skeleton's mesh is drawn whole (not only where the frame it was built on shows the
    // body), because the person moves inside the video.
    function setFrameHook(fn) { frameHook = typeof fn === 'function' ? fn : null; liveT = -1; wake(); }
    function videoPlaying() { return !!(liveVideo && !liveVideo.paused && !liveVideo.ended); }
    function pumpVideo() {
      var v = liveVideo;
      if (!v || v.readyState < 2 || !v.videoWidth || glLost) return;
      var t = v.currentTime;
      if (t === liveT) return;                                  // the same frame: nothing to send
      liveT = t;
      var src = v;
      if (frameHook) {
        var made = null;
        try { made = frameHook(v, t); } catch (e) { made = null; }
        if (made) src = made;
        if (scene) { sceneKey = ''; paintScene(); }            // the scene may be this frame's background
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); } catch (e) { /* a frame the browser can't give yet */ }
    }
    function uploadTex() {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    /* ---------- painted softness map ---------- */
    function sampleGrid(g, u, v) {
      var fx = clamp(u, 0, 1) * (KGN - 1), fy = clamp(v, 0, 1) * (KGN - 1);
      var x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(x0 + 1, KGN - 1), y1 = Math.min(y0 + 1, KGN - 1);
      var a = fx - x0, b = fy - y0;
      return (g[y0 * KGN + x0] * (1 - a) + g[y0 * KGN + x1] * a) * (1 - b) + (g[y1 * KGN + x0] * (1 - a) + g[y1 * KGN + x1] * a) * b;
    }
    function computeKV() {
      if (!count) return;
      uploadK(kGrid);
      var plain = true;
      for (var q = 0; q < kGrid.length; q++) if (kGrid[q] !== 1) { plain = false; break; }
      if (plain) { kv = null; return; }       // nothing painted: exactly the unpainted physics (bit for bit)
      kv = new Float32Array(count);
      var stride = nx + 1;
      for (var j = 0; j <= ny; j++) for (var i = 0; i <= nx; i++) kv[j * stride + i] = sampleGrid(kGrid, i / nx, j / ny);
      uploadK(kGrid);
    }
    function uploadK(g) {
      var bytes = new Uint8Array(KGN * KGN * 4);
      for (var i = 0; i < KGN * KGN; i++) { bytes[4 * i] = Math.round(clamp(g[i] / 4, 0, 1) * 255); bytes[4 * i + 3] = 255; }
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, kTex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, KGN, KGN, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.activeTexture(gl.TEXTURE0);
    }
    // a brush stroke changes a preview copy; the physics gets it when the finger lifts (one recorded change)
    function paintAt(x, y) {
      if (!kPaint) kPaint = new Float32Array(kGrid);
      var l = toLocal(x, y), u = l.x / bw + 0.5, v = l.y / bh + 0.5;
      var r = brush;
      for (var j = 0; j < KGN; j++) {
        for (var i = 0; i < KGN; i++) {
          var du = i / (KGN - 1) - u, dv = (j / (KGN - 1) - v) * (bh / bw);
          var d = Math.sqrt(du * du + dv * dv);
          if (d > r) continue;
          var w = 1 - d / r; w = w * w * (3 - 2 * w) * 0.35;
          var q = j * KGN + i, k0 = kPaint[q];
          var target = paintMode === 'soft' ? 0.3 : paintMode === 'stiff' ? 2.2 : paintMode === 'lock' ? 4 : 1;
          kPaint[q] = k0 + (target - k0) * w;
        }
      }
      uploadK(kPaint);
    }

    /* ---------- skeleton ---------- */
    function rigOn() { return !!(rig && window.Rig); }
    // rev 3: our own box filter (same in every browser). rev 2 (skeleton files from the first build): the
    // browser's scaler, kept so those recordings still replay to the same checksum.
    function makeRigMask() { return rev >= 3 ? Pose.boxMask(tc, 128) : Pose.mask(tc, 128); }
    function bindRig() {
      skel = rbind = null;
      if (!rigOn() || !count) return;
      if (!rigMask) rigMask = makeRigMask();
      skel = Rig.build(rig.joints, bw, bh);
      var skip = {};
      ['L', 'R'].forEach(function (sd) { if (limbs[sd]) { skip[Rig.BONE['upperArm' + sd]] = true; skip[Rig.BONE['forearm' + sd]] = true; } });
      rbind = Rig.bind(skel, rigMask, nx, ny, bw, bh, { skip: skip });
      headWt = new Float32Array(count);
      for (var hk = 0; hk < count; hk++) for (var hq = 0; hq < 3; hq++) if (rbind.bone[hk * 3 + hq] === Rig.BONE.head) headWt[hk] += rbind.weight[hk * 3 + hq];
      // the body's edges for the strain limiter, in grid order: [a, b, vertical?] ...
      var st = nx + 1, list = [];
      for (var j = 0; j <= ny; j++) for (var i = 0; i <= nx; i++) {
        var k = j * st + i, cb = rbind.conn[k];
        if ((cb & 1) && i < nx) list.push(k, k + 1, 0);
        if ((cb & 2) && j < ny) list.push(k, k + st, 1);
      }
      rigEdges = new Int32Array(list);
      rigMoved = new Int32Array(count); rigChecked = new Int32Array(rigEdges.length / 3);
      rigTr = new Float64Array(Rig.BONES.length * 6);
      rigRaise = new Float64Array(Rig.BONES.length);
      sprCur = new Float64Array(Rig.BONES.length); sprVel = new Float64Array(Rig.BONES.length); sprTg = new Float64Array(Rig.BONES.length); sprOn = false;
      // rev 7: where each body point lies along the torso (pelvis -> neck), the head (neck -> head), the forearm and the shin
      var along = function (bn, k2) { var dx = bn.ex - bn.sx, dy = bn.ey - bn.sy, L2 = dx * dx + dy * dy || 1e-9; return ((lx[k2] - bn.sx) * dx + (ly[k2] - bn.sy) * dy) / L2; };
      flexT = new Float32Array(count); flexH = new Float32Array(count); flexF = new Float32Array(count * 2); flexS = new Float32Array(count * 2);
      var bT = skel.bones[Rig.BONE.torso], bH = skel.bones[Rig.BONE.head];
      for (var fk = 0; fk < count; fk++) {
        flexT[fk] = along(bT, fk); flexH[fk] = along(bH, fk);
        flexF[2 * fk] = along(skel.bones[Rig.BONE.forearmL], fk); flexF[2 * fk + 1] = along(skel.bones[Rig.BONE.forearmR], fk);
        flexS[2 * fk] = along(skel.bones[Rig.BONE.shinL], fk); flexS[2 * fk + 1] = along(skel.bones[Rig.BONE.shinR], fk);
      }
      Rig.pose(skel, rigRaise, 0, 0, rigTr);
      setRelative();
      ['L', 'R'].forEach(function (sd) { if (limbs[sd]) limbs[sd].mesh = buildLimbMesh(sd, limbs[sd]); });
    }
    var rigHead = null, headWt = null;
    function gesturePoint(JP, hd) {
      var I = Rig.JOINT, nk = JP[I.neck], hdj = JP[I.head], pv = JP[I.pelvis];
      if (!nk || !hdj || !pv) return null;
      var T = Math.hypot(nk[0] - pv[0], nk[1] - pv[1]) || 1, base;
      switch (hd.at) {
        case 'mouth': base = [nk[0] + (hdj[0] - nk[0]) * 0.32, nk[1] + (hdj[1] - nk[1]) * 0.32]; break;
        case 'chin': base = [nk[0] + (hdj[0] - nk[0]) * 0.18, nk[1] + (hdj[1] - nk[1]) * 0.18]; break;
        case 'chest': base = [nk[0] + (pv[0] - nk[0]) * 0.3, nk[1] + (pv[1] - nk[1]) * 0.3]; break;
        case 'belly': base = [nk[0] + (pv[0] - nk[0]) * 0.75, nk[1] + (pv[1] - nk[1]) * 0.75]; break;
        default: return null;
      }
      var P0 = [base[0] + (hd.dx || 0) * T, base[1] + (hd.dy || 0) * T];
      if (hd.to && typeof hd.u === 'number' && hd.u > 0) {      // on the way from one place to another (u 0..1)
        var P1 = gesturePoint(JP, { at: hd.to, dx: hd.tdx, dy: hd.tdy });
        if (P1) { var uu = clamp(hd.u, 0, 1); return [P0[0] + (P1[0] - P0[0]) * uu, P0[1] + (P1[1] - P0[1]) * uu]; }
      }
      return P0;
    }
    // rev 4: hands resting on a knee / the hips, and whether the pose is a plain stand (legs about straight
    // down, no resting hand). Both come from the joints only, so a replay gets the same.
    var RELATIVE_BEND = 0.35;                   // TUNE: a thigh or shin this far (rad) from straight down = not a plain stand
    var RELATIVE_LEGS = 0.5, RELATIVE_SHIN_IN = -0.15;   // TUNE: on such a pose, how much of a dancer's leg moves, how far a shin turns in
    function setRelative() {
      rigContact = rev >= 4 && skel ? Rig.contacts(skel) : { L: null, R: null };
      rigRelative = false;
      if (rev < 4 || !skel) return;
      if (rigContact.L || rigContact.R) { rigRelative = true; return; }
      ['thighL', 'shinL', 'thighR', 'shinR'].forEach(function (n) {
        var b = skel.bones[Rig.BONE[n]];
        if (Math.abs(wrapPi(Math.atan2(b.ey - b.sy, b.ex - b.sx) - Math.PI / 2)) > RELATIVE_BEND) rigRelative = true;
      });
    }
    // the clip's target angles for this step (fades in/out, and relaxes while a finger is down)
    // rev 5: a dance read from a video, and the gestures marked crisp (clap, eat, think...): stiffer limbs, the
    // elbow folds the hand in to the chest; the gestures also bring the upper arm in to the body. Old moves and
    // older recordings keep their limits and stiffness.
    function smooth01(u) { u = u < 0 ? 0 : u > 1 ? 1 : u; return u * u * (3 - 2 * u); }
    function rigClip() { return rig && window.RigClips && Object.prototype.hasOwnProperty.call(RigClips.CLIPS, rig.clip) ? RigClips.CLIPS[rig.clip] : null; }
    function crispRig() { if (rev < 5 || !rig) return false; if (rig.clip === 'video') return true; var c = rigClip(); return !!(c && c.crisp); }
    var UPPER_IN_GESTURE = -0.6;                // TUNE: how far a gesture brings the upper arm in from the picture's pose
    function updateRig(dt, touching) {
      if (skel) {
        var crisp = crispRig(), gesture = crisp && rig.clip !== 'video';
        var fold = crisp ? Rig.FOREARM_FOLD_VIDEO : Rig.LIMITS.forearmL[0], ulo = gesture ? UPPER_IN_GESTURE : Rig.LIMITS.upperArmL[0];
        skel.bones[Rig.BONE.forearmL].lo = fold; skel.bones[Rig.BONE.forearmR].lo = fold;
        skel.bones[Rig.BONE.upperArmL].lo = ulo; skel.bones[Rig.BONE.upperArmR].lo = ulo;
      }
      rigHead = null;
      var want = rig && rig.clip !== 'none' ? (touching ? 0.3 : 1) : 0;
      rigBlend += (want - rigBlend) * Math.min(1, dt * 3);
      if (rig) rigT += dt * rig.speed;
      var smp = (rig && window.RigClips) ? RigClips.sample(rig.clip, rigT, rig.amount) : null;
      for (var i = 0; i < rigRaise.length; i++) rigRaise[i] = 0;
      var rx0 = 0, ry0 = 0;
      if (smp && rigBlend > 0.0005) {
        if (smp.abs) absToRaise(smp.abs, smp.amount == null ? 1 : smp.amount, rigRaise);
        else for (var nm in smp.raise) {
          if (Object.prototype.hasOwnProperty.call(Rig.BONE, nm)) rigRaise[Rig.BONE[nm]] = smp.raise[nm];
        }
        for (var bi = 0; bi < rigRaise.length; bi++) rigRaise[bi] *= rigBlend;
        rx0 = (smp.rootX || 0) * bh * rigBlend; ry0 = (smp.rootY || 0) * bh * rigBlend;
      }
      Rig.pose(skel, rigRaise, rx0, ry0, rigTr);
      // a gesture's hands: where the wrist should be (by the mouth, the chin, in front of the chest...), placed
      // from this body's own joints, reached by IK (the joint limits still apply)
      if (smp && smp.hands && rigBlend > 0.0005) {
        var JP = Rig.jointPositions(skel, rigTr), amt = smp.amount == null ? 1 : smp.amount, didIK = false;
        ['L', 'R'].forEach(function (sd) {
          var hd = smp.hands[sd];
          if (!hd || !(hd.w > 0)) return;
          var tgt = gesturePoint(JP, hd);
          if (!tgt) return;
          var r = Rig.ik(skel, rigRaise, sd, tgt, skel.bones[Rig.BONE['forearm' + sd]].len, rigTr);
          if (!r) return;
          var w = clamp(hd.w, 0, 1) * amt * rigBlend, ui3 = Rig.BONE['upperArm' + sd], fi3 = Rig.BONE['forearm' + sd];
          rigRaise[ui3] += (r.upper - rigRaise[ui3]) * w; rigRaise[fi3] += (r.fore - rigRaise[fi3]) * w; didIK = true;
        });
        if (didIK) Rig.pose(skel, rigRaise, rx0, ry0, rigTr);
      }
      // a gesture's head: a nod or a "no" (a turn), shown by squashing and shifting the head in its own frame
      if (smp && smp.head && rigBlend > 0.0005) {
        var amH = (smp.amount == null ? 1 : smp.amount) * rigBlend, hs = smp.head;
        rigHead = { sx: 1 + ((hs.sx == null ? 1 : hs.sx) - 1) * amH, sy: 1 + ((hs.sy == null ? 1 : hs.sy) - 1) * amH, dx: (hs.dx || 0) * amH, dy: (hs.dy || 0) * amH };
      }
      // a hand resting on the body stays on its spot: the spot moves with its bone (the knee bends, the
      // hand goes with it) and IK aims the arm at it. A finger holding that hand still wins (below).
      var pinned = false;
      ['L', 'R'].forEach(function (sd) {
        var c = rigContact[sd];
        if (!c) return;
        var o = c.bone * 6, qx = c.p[0] - rigTr[o + 2], qy = c.p[1] - rigTr[o + 3];
        var tx = rigTr[o] * qx - rigTr[o + 1] * qy + rigTr[o + 4], ty = rigTr[o + 1] * qx + rigTr[o] * qy + rigTr[o + 5];
        var r = Rig.ik(skel, rigRaise, sd, [tx, ty], skel.bones[Rig.BONE['forearm' + sd]].len, rigTr);
        // A dance may lift the hand off for a moment (smp.free[side] 0..1) only when that arm is its own
        // layer: in a flat picture the hand covers part of the knee, and lifting it tears the knee along.
        var fr = limbs[sd] && smp && smp.free && typeof smp.free[sd] === 'number' && isFinite(smp.free[sd]) ? clamp(smp.free[sd], 0, 1) * rigBlend : 0;
        if (r) {
          var ui2 = Rig.BONE['upperArm' + sd], fi2 = Rig.BONE['forearm' + sd];
          rigRaise[ui2] += (r.upper - rigRaise[ui2]) * (1 - fr); rigRaise[fi2] += (r.fore - rigRaise[fi2]) * (1 - fr); pinned = true;
        }
      });
      if (pinned) Rig.pose(skel, rigRaise, rx0, ry0, rigTr);
      // a finger holding a hand: 2-bone IK pulls that arm toward it (limits still apply); let go and the
      // arm eases back to the clip
      var held = { L: null, R: null };
      ptrs.forEach(function (o) { if (o.down && o.mode === 'ik' && o.ik && !o.ik.kind && !held[o.ik.side]) held[o.ik.side] = o; });
      var changed = false;
      ['L', 'R'].forEach(function (sd) {
        var o = held[sd];
        if (o) {
          var l = toLocal(o.x, o.y);
          var r = Rig.ik(skel, rigRaise, sd, [l.x - o.ik.gx, l.y - o.ik.gy], o.ik.reach, rigTr);
          if (r) ikRaise[sd] = r;
        }
        ikW[sd] += ((o && ikRaise[sd] ? 1 : 0) - ikW[sd]) * Math.min(1, dt * (o ? 14 : 4));
        if (ikW[sd] < 0.002 && !o) { ikW[sd] = 0; ikRaise[sd] = null; }
        if (ikW[sd] > 0 && ikRaise[sd]) {
          var ui = Rig.BONE['upperArm' + sd], fi = Rig.BONE['forearm' + sd], w = ikW[sd];
          rigRaise[ui] += (ikRaise[sd].upper - rigRaise[ui]) * w;
          rigRaise[fi] += (ikRaise[sd].fore - rigRaise[fi]) * w;
          changed = true;
        }
      });
      if (changed) Rig.pose(skel, rigRaise, rx0, ry0, rigTr);
      if (rev >= 7 && holdJoints(dt)) Rig.pose(skel, rigRaise, rx0, ry0, rigTr);
      // version 26: from one gesture (or the video dance) to another, the body moves over CLIP_FADE s from where it was
      if (fadeFrom) {
        fadeU += dt / CLIP_FADE;
        var fu = fadeU >= 1 ? 1 : fadeU * fadeU * (3 - 2 * fadeU);
        for (var fi4 = 0; fi4 < rigRaise.length; fi4++) rigRaise[fi4] = fadeFrom[fi4] + (rigRaise[fi4] - fadeFrom[fi4]) * fu;
        rx0 = fadeRoot[0] + (rx0 - fadeRoot[0]) * fu; ry0 = fadeRoot[1] + (ry0 - fadeRoot[1]) * fu;
        Rig.pose(skel, rigRaise, rx0, ry0, rigTr);
        if (fadeU >= 1) fadeFrom = null;
      }
      if (rev >= 7 && skel) springRig(dt, rx0, ry0);
      lastRoot[0] = rx0; lastRoot[1] = ry0;
    }
    // rev 7: a finger holding a foot moves the leg (2-bone IK: hip, knee, ankle); holding the head turns it toward the
    // finger and the back leans a quarter of that. Limits still apply; let go and it eases back to the move.
    function holdJoints(dt) {
      var held = { legL: null, legR: null, head: null }, B = Rig.BONE, changed = false;
      ptrs.forEach(function (o) { if (o.down && o.mode === 'ik' && o.ik && o.ik.kind && !held[o.ik.kind]) held[o.ik.kind] = o; });
      ['legL', 'legR', 'head'].forEach(function (kd) {
        var o = held[kd];
        if (o) {
          var l = toLocal(o.x, o.y), tx = l.x - o.ik.gx, ty = l.y - o.ik.gy, r = null;
          if (kd === 'head') {
            var hb = skel.bones[B.head], ho = B.head * 6, to = B.torso * 6;
            var dx = tx - rigTr[ho + 4], dy = ty - rigTr[ho + 5];
            if (dx * dx + dy * dy > 1) {
              var want = wrapPi(Math.atan2(dy, dx) - o.ik.off - Math.atan2(hb.ey - hb.sy, hb.ex - hb.sx));   // the head's whole turn from rest
              var lean = clamp(want * 0.25, skel.bones[B.torso].lo, skel.bones[B.torso].hi);
              r = { torso: lean, head: want - lean };
            }
          } else {
            var sd = kd.slice(3);
            r = Rig.ik2(skel, rigRaise, B['thigh' + sd], B['shin' + sd], [tx, ty], o.ik.reach, rigTr);
          }
          if (r && isFinite(r.torso === undefined ? r.upper + r.fore : r.torso + r.head)) jRaise[kd] = r;
        }
        jW[kd] += ((o && jRaise[kd] ? 1 : 0) - jW[kd]) * Math.min(1, dt * (o ? 14 : 4));
        if (jW[kd] < 0.002 && !o) { jW[kd] = 0; jRaise[kd] = null; }
        if (jW[kd] > 0 && jRaise[kd]) {
          var w = jW[kd], q = jRaise[kd];
          if (kd === 'head') { rigRaise[B.torso] += (q.torso - rigRaise[B.torso]) * w; rigRaise[B.head] += (q.head - rigRaise[B.head]) * w; }
          else { var s2 = kd.slice(3); rigRaise[B['thigh' + s2]] += (q.upper - rigRaise[B['thigh' + s2]]) * w; rigRaise[B['shin' + s2]] += (q.fore - rigRaise[B['shin' + s2]]) * w; }
          changed = true;
        }
      });
      return changed;
    }
    // rev 7: soft joint limits: the last part of each joint's range slows the bone down (no hard knock at the end)
    // (only past where the move itself wants the bone: a move that asks for the end of the range still gets there)
    function softLim(v, lo, hi, tg) {
      var m = Math.min(0.2, (hi - lo) * 0.15), a = Math.max(hi - m, Math.min(tg, hi)), b = Math.min(lo + m, Math.max(tg, lo));
      if (v > a) { var mh = hi - a; return mh > 1e-6 ? a + mh * Math.tanh((v - a) / mh) : hi; }
      if (v < b) { var ml = b - lo; return ml > 1e-6 ? b - ml * Math.tanh((b - v) / ml) : lo; }
      return v;
    }
    // rev 7: every bone follows the move's angle on a spring (fixed steps: a replay gets the same). An arm held by a
    // finger or resting on the body goes exactly where it is put (no spring: it must stay on its spot).
    function springRig(dt, rx0, ry0) {
      // half the move's own speed is fed forward (measured best: smooth and close); a dance from a video all of it (it must
      // stay on the dancer)
      var nb = rigRaise.length, B = Rig.BONE, ff = rig && rig.clip === 'video' ? 1 : SPR_FF;
      if (!sprOn) { sprCur.set(rigRaise); sprTg.set(rigRaise); sprVel.fill(0); sprOn = true; }
      var exact = {};
      ['L', 'R'].forEach(function (sd) { if (rigContact[sd] || ikW[sd] > 0) { exact[B['upperArm' + sd]] = 1; exact[B['forearm' + sd]] = 1; } });
      for (var i = 0; i < nb; i++) {
        var tg = rigRaise[i];
        var tv = clamp((tg - sprTg[i]) / dt, -SPR_VMAX, SPR_VMAX) * ff; sprTg[i] = tg;   // the move's own speed: followed without lag
        if (exact[i]) { sprCur[i] = tg; sprVel[i] = tv; continue; }
        var om = SPR_OM[Rig.BONES[i].name] || 11;
        sprVel[i] += (om * om * (tg - sprCur[i]) + 2 * SPR_Z * om * (tv - sprVel[i])) * dt;   // a jump in the move is eased
        sprCur[i] += sprVel[i] * dt;
        rigRaise[i] = softLim(sprCur[i], skel.bones[i].lo, skel.bones[i].hi, tg);
      }
      Rig.pose(skel, rigRaise, rx0, ry0, rigTr);
      for (i = 0; i < nb; i++) {                       // a hard limit stops the spring there (the soft one keeps it inside)
        var lo7 = skel.bones[i].lo, hi7 = skel.bones[i].hi;
        if (sprCur[i] > hi7) { sprCur[i] = hi7; if (sprVel[i] > 0) sprVel[i] = 0; } else if (sprCur[i] < lo7) { sprCur[i] = lo7; if (sprVel[i] < 0) sprVel[i] = 0; }
      }
      // the hand: a spring on the forearm's direction; its lag behind the forearm turns the hand a little
      ['L', 'R'].forEach(function (sd) {
        var o = B['forearm' + sd] * 6, a = Math.atan2(rigTr[o + 1], rigTr[o]), h = handLag[sd];
        var d = wrapPi(a - h[0]); h[0] = a - d;                       // keep the spring's angle next to the forearm's
        h[1] += (HAND_OM * HAND_OM * (a - h[0]) - 2 * HAND_Z * HAND_OM * h[1]) * dt; h[0] += h[1] * dt;
      });
    }
    /* rev 7 skinning. Each bone's turn for this point (with the bends below), then: two bones that meet at a joint
       (parent and child) turn the point around that joint by the blend of their angles, which keeps the joint's
       thickness (blending their two positions instead pulls the inside of a bent elbow in); other blends as before. */
    var SK7 = [0, 0], TFa = [0, 0, 0, 0, 0], TFb = [0, 0, 0, 0, 0], TFc = [0, 0, 0, 0, 0], TFj = [0, 0, 0, 0, 0];
    function sstep(u) { u = u < 0 ? 0 : u > 1 ? 1 : u; return u * u * (3 - 2 * u); }
    // the back: the hips turn 78 % of the torso's turn, the chest (near the top) all of it (more bends the clothes:
    // measured, 25 % changed the shirt's squares' area 5 %); the neck: from the
    // neck joint 0 % to all of the head's own turn at 40 % of the way to the head
    function tf7(bi, k, TR, out) {
      var B = Rig.BONE, o = bi * 6, th = absB[bi], rx0 = TR[o + 2], ry0 = TR[o + 3], px0 = TR[o + 4], py0 = TR[o + 5], bn = skel.bones[bi];
      if (bi === B.torso) th = absB[bi] * (0.78 + 0.22 * sstep((flexT[k] - 0.05) / 0.9));
      else if (bi === B.head) { var tt = absB[B.torso]; th = tt + wrapPi(absB[bi] - tt) * sstep(flexH[k] / 0.4); }
      else if (bi === B.forearmL || bi === B.forearmR) {
        var fa = flexF[2 * k + (bi === B.forearmR ? 1 : 0)];
        if (fa > 1) {                       // the hand: around the wrist, by its lag
          var g = sstep((fa - 1) / 0.12), c = Math.cos(th), sn = Math.sin(th), qx = bn.ex - rx0, qy = bn.ey - ry0;
          px0 = c * qx - sn * qy + px0; py0 = sn * qx + c * qy + py0; rx0 = bn.ex; ry0 = bn.ey; th += handExtra(bi === B.forearmR ? 'R' : 'L') * g;
        }
      } else if (bi === B.shinL || bi === B.shinR) {
        var fs = flexS[2 * k + (bi === B.shinR ? 1 : 0)];
        if (fs > 1) {                       // the foot: around the ankle, turned back to level as the shin swings
          var g2 = sstep((fs - 1) / 0.12), c2 = Math.cos(th), s2 = Math.sin(th), qx2 = bn.ex - rx0, qy2 = bn.ey - ry0;
          px0 = c2 * qx2 - s2 * qy2 + px0; py0 = s2 * qx2 + c2 * qy2 + py0; rx0 = bn.ex; ry0 = bn.ey; th -= th * g2;
        }
      }
      out[0] = th; out[1] = rx0; out[2] = ry0; out[3] = px0; out[4] = py0;
    }
    function apply7(t, a, b, w) { var c = Math.cos(t[0]), s = Math.sin(t[0]), qx = a - t[1], qy = b - t[2]; SK7[0] += w * (c * qx - s * qy + t[3]); SK7[1] += w * (s * qx + c * qy + t[4]); }
    function skin7(k, a, b, BI, BW, TR) {
      var k3 = k * 3, n = 0, ids = skin7.ids || (skin7.ids = [0, 0, 0]), ws = skin7.ws || (skin7.ws = [0, 0, 0]), T3 = [TFa, TFb, TFc];
      for (var q = 0; q < 3; q++) if (BW[k3 + q] > 0) { ids[n] = BI[k3 + q]; ws[n] = BW[k3 + q]; n++; }
      SK7[0] = 0; SK7[1] = 0;
      if (!n) { SK7[0] = a; SK7[1] = b; return; }
      for (q = 0; q < n; q++) tf7(ids[q], k, TR, T3[q]);
      // a joint: the first pair that are parent and child
      var pi = -1, ci = -1;
      for (q = 0; q < n && pi < 0; q++) for (var r = 0; r < n; r++) if (r !== q && Rig.BONES[ids[r]].parent === ids[q]) { pi = q; ci = r; break; }
      if (pi < 0) { for (q = 0; q < n; q++) apply7(T3[q], a, b, ws[q]); return; }
      var wp = ws[pi], wc = ws[ci], wpc = wp + wc, tp = T3[pi][0], tcn = tp + wrapPi(T3[ci][0] - tp), o = ids[ci] * 6;
      var J = TFj;
      J[0] = tp + (tcn - tp) * (wc / wpc); J[1] = TR[o + 2]; J[2] = TR[o + 3]; J[3] = TR[o + 4]; J[4] = TR[o + 5];
      if (n === 3) { var oth = 3 - pi - ci; apply7(T3[oth], a, b, ws[oth]); }   // the third bone keeps its share
      apply7(J, a, b, wpc);
    }
    function handExtra(sd) { if (rev < 7 || !rigTr) return 0; var o = Rig.BONE['forearm' + sd] * 6, a = Math.atan2(rigTr[o + 1], rigTr[o]); return clamp(wrapPi(handLag[sd][0] - a), -HAND_MAX, HAND_MAX); }
    var CLIP_FADE = 0.45, fadeFrom = null, fadeU = 0, fadeRoot = [0, 0], lastRoot = [0, 0];
    function fadeClip(from, to) {               // which clip changes blend (old moves: never)
      if (rev < 5 || !window.RigClips || replaying || inputSink) return false;   // live only: recordings replay as they were
      var C = RigClips.CLIPS, f = function (n) { return n === 'video' || !!(C[n] && C[n].gesture); };
      return f(from) || f(to);
    }
    // A dance from motion capture says where each bone should POINT (its direction on screen), not how
    // far to turn it: so it fits whatever pose the picture has (an arm already raised in the photo goes to
    // the same place as one hanging down). Bone by bone, parents first: the turn from this picture's own
    // rest direction, minus what the parent already turned, then the joint's limits; a child is aimed
    // from where its parent really ended up. amount: 0 = the picture's pose, 1 = the dancer's.
    function wrapPi(a) { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; }
    var absRot = new Float64Array(16);
    /* ---------- an arm as its own layer ----------
     * The picture is one flat layer: where a hand lies on a knee, its pixels and the knee's are the same
     * pixels, so lifting the arm dragged the knee along (a torn "fan" of skin). With a layer, the arm is
     * cut out (Analyze.limbLayer), the body under it filled in, the body does not hold on to the arm's
     * bones, and the arm is drawn on top: a ribbon of triangles along shoulder -> elbow -> wrist -> hand,
     * moved by the arm's two bones (blended at the elbow), following the body's lag at the shoulder. */
    function clearLimbs() {
      ['L', 'R'].forEach(function (sd) { if (limbs[sd]) { gl.deleteTexture(limbs[sd].tex); limbs[sd] = null; } });
    }
    // side 'L' | 'R' with a canvas (the arm alone, the size of the picture), or (side, null) to remove that
    // layer, or (null) to remove both
    function setLimbLayer(side, cnv) {
      if (side !== 'L' && side !== 'R') { clearLimbs(); if (rigOn() && count) bindRig(); wake(); return false; }
      if (limbs[side]) { gl.deleteTexture(limbs[side].tex); limbs[side] = null; }
      if (cnv && cnv.width > 1 && cnv.height > 1) {
        var c2 = document.createElement('canvas'); c2.width = tc.width; c2.height = tc.height;   // the same size as the body's texture
        c2.getContext('2d').drawImage(cnv, 0, 0, c2.width, c2.height);
        var t = limbTex(c2);
        limbs[side] = { tex: t, mesh: null, bufs: null, src: c2 };
      }
      if (rigOn() && count) bindRig();
      wake();
      return !!limbs[side];
    }
    function limbTex(c2) {
        var t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        return t;
    }
    var LIMB_ALONG = 56, LIMB_ACROSS = 7;
    function buildLimbMesh(sd, L) {
      if (!skel) return null;
      var J = skel.joints, S = J[Rig.JOINT['shoulder' + sd]], E = J[Rig.JOINT['elbow' + sd]], Wr = J[Rig.JOINT['wrist' + sd]];
      var P = [[S[0] - (E[0] - S[0]) * 0.5, S[1] - (E[1] - S[1]) * 0.5], S, E, Wr, [Wr[0] + (Wr[0] - E[0]) * 0.8, Wr[1] + (Wr[1] - E[1]) * 0.8]];
      var segL = [], tot = 0;
      for (var q = 0; q < 4; q++) { var L0 = Math.hypot(P[q + 1][0] - P[q][0], P[q + 1][1] - P[q][1]) || 1e-6; segL.push(L0); tot += L0; }
      var sE = segL[0] + segL[1], hw = 0.55 * Math.max(segL[1], segL[2]);
      var nA = LIMB_ALONG, nC = LIMB_ACROSS, nv = nA * nC;
      var rest = new Float32Array(nv * 2), uv = new Float32Array(nv * 2), wf = new Float32Array(nv), wh = new Float32Array(nv), sW = segL[0] + segL[1] + segL[2];
      for (var i = 0; i < nA; i++) {
        var sArc = tot * i / (nA - 1), a = 0, acc = 0;
        while (a < 3 && acc + segL[a] < sArc) { acc += segL[a]; a++; }
        var f = clamp((sArc - acc) / segL[a], 0, 1);
        var cxp = P[a][0] + (P[a + 1][0] - P[a][0]) * f, cyp = P[a][1] + (P[a + 1][1] - P[a][1]) * f;
        // direction: the segment's, eased into the next one near a joint (no fold in the ribbon)
        var tx0 = (P[a + 1][0] - P[a][0]) / segL[a], ty0 = (P[a + 1][1] - P[a][1]) / segL[a];
        var nb2 = Math.min(3, a + 1), tx1 = (P[nb2 + 1][0] - P[nb2][0]) / segL[nb2], ty1 = (P[nb2 + 1][1] - P[nb2][1]) / segL[nb2];
        var mix = f > 0.8 && a < 3 ? (f - 0.8) / 0.4 : 0;
        var tx = tx0 * (1 - mix) + tx1 * mix, ty = ty0 * (1 - mix) + ty1 * mix, tl = Math.hypot(tx, ty) || 1;
        tx /= tl; ty /= tl;
        var wfo = clamp((sArc - (sE - 0.07 * tot)) / (0.14 * tot), 0, 1); wfo = wfo * wfo * (3 - 2 * wfo);
        for (var j = 0; j < nC; j++) {
          var off = (j / (nC - 1) * 2 - 1) * hw, v = i * nC + j;
          rest[2 * v] = cxp - ty * off; rest[2 * v + 1] = cyp + tx * off;
          uv[2 * v] = rest[2 * v] / bw + 0.5; uv[2 * v + 1] = rest[2 * v + 1] / bh + 0.5;
          wf[v] = wfo;
          var hwo = clamp((sArc - sW) / (0.06 * tot), 0, 1); wh[v] = hwo * hwo * (3 - 2 * hwo);   // rev 7: the hand (past the wrist)
        }
      }
      var idxA = new Uint16Array((nA - 1) * (nC - 1) * 6), q2 = 0;
      for (i = 0; i < nA - 1; i++) for (j = 0; j < nC - 1; j++) {
        var a0 = i * nC + j, b0 = a0 + 1, c0 = a0 + nC, d0 = c0 + 1;
        idxA[q2++] = a0; idxA[q2++] = b0; idxA[q2++] = c0; idxA[q2++] = b0; idxA[q2++] = d0; idxA[q2++] = c0;
      }
      // the body point nearest the shoulder: the arm follows its lag
      var kS = -1, bd = 1e18;
      for (var k = 0; k < count; k++) {
        if (rbind && !rbind.act[k]) continue;
        var dd = (lx[k] - S[0]) * (lx[k] - S[0]) + (ly[k] - S[1]) * (ly[k] - S[1]);
        if (dd < bd) { bd = dd; kS = k; }
      }
      var bufs = L.bufs || (L.bufs = { pos: gl.createBuffer(), uv: gl.createBuffer(), zero: gl.createBuffer(), idx: gl.createBuffer() });
      gl.bindBuffer(gl.ARRAY_BUFFER, bufs.uv); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufs.zero); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nv), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufs.idx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxA, gl.STATIC_DRAW);
      return { rest: rest, wf: wf, wh: wh, Wr: [Wr[0], Wr[1]], n: nv, nIdx: idxA.length, kS: kS, S: [S[0], S[1]], world: new Float32Array(nv * 2) };
    }
    function drawLimbs() { drawLimb('L'); drawLimb('R'); }
    function drawLimb(sd, shadow) {         // shadow (v38): { ring, rings, rr }: drawn into the floor's shadow instead
      var Lb = limbs[sd];
      if (!Lb || !Lb.mesh || !rigTr || !count) return;
      var M = Lb.mesh, limbBufs = Lb.bufs, ui = Rig.BONE['upperArm' + sd] * 6, fi = Rig.BONE['forearm' + sd] * 6, ti = Rig.BONE.torso * 6, T = rigTr;
      var cs = Math.cos(ang), sn = Math.sin(ang);
      function world(x, y) { return [cx + (x * cs - y * sn) * uS, cy + (x * sn + y * cs) * uS]; }
      // the body's lag at the shoulder: where the body point is, minus where the skeleton alone puts it
      var ox = 0, oy = 0;
      if (M.kS >= 0) {
        var qx0 = lx[M.kS] - T[ti + 2], qy0 = ly[M.kS] - T[ti + 3];
        var sk = world(T[ti] * qx0 - T[ti + 1] * qy0 + T[ti + 4], T[ti + 1] * qx0 + T[ti] * qy0 + T[ti + 5]);
        ox = px[M.kS] - sk[0]; oy = py[M.kS] - sk[1];
      }
      // rev 7: around the elbow by the blend of the two angles (the elbow keeps its thickness); the hand by its lag
      var r7 = rev >= 7, aU = Math.atan2(T[ui + 1], T[ui]), aF = aU + wrapPi(Math.atan2(T[fi + 1], T[fi]) - aU), hx = r7 ? handExtra(sd) : 0;
      var wqx = M.Wr ? M.Wr[0] - T[fi + 2] : 0, wqy = M.Wr ? M.Wr[1] - T[fi + 3] : 0, wpx = T[fi] * wqx - T[fi + 1] * wqy + T[fi + 4], wpy = T[fi + 1] * wqx + T[fi] * wqy + T[fi + 5];
      for (var v = 0; v < M.n; v++) {
        var rx0 = M.rest[2 * v], ry0 = M.rest[2 * v + 1], w = M.wf[v], X, Y;
        if (r7) {
          var ang7 = aU + (aF - aU) * w, c7 = Math.cos(ang7), s7 = Math.sin(ang7), ex0 = rx0 - T[fi + 2], ey0 = ry0 - T[fi + 3];
          X = c7 * ex0 - s7 * ey0 + T[fi + 4]; Y = s7 * ex0 + c7 * ey0 + T[fi + 5];
          var hw7 = M.wh ? M.wh[v] * hx : 0;
          if (hw7) { var ch = Math.cos(hw7), shh = Math.sin(hw7), qx7 = X - wpx, qy7 = Y - wpy; X = wpx + ch * qx7 - shh * qy7; Y = wpy + shh * qx7 + ch * qy7; }
        } else {
          var ax0 = rx0 - T[ui + 2], ay0 = ry0 - T[ui + 3], bx0 = rx0 - T[fi + 2], by0 = ry0 - T[fi + 3];
          X = (T[ui] * ax0 - T[ui + 1] * ay0 + T[ui + 4]) * (1 - w) + (T[fi] * bx0 - T[fi + 1] * by0 + T[fi + 4]) * w;
          Y = (T[ui + 1] * ax0 + T[ui] * ay0 + T[ui + 5]) * (1 - w) + (T[fi + 1] * bx0 + T[fi] * by0 + T[fi + 5]) * w;
        }
        var p = world(X, Y);
        M.world[2 * v] = p[0] + ox; M.world[2 * v + 1] = p[1] + oy;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, limbBufs.pos); gl.bufferData(gl.ARRAY_BUFFER, M.world, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, limbBufs.uv); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, limbBufs.zero); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
      gl.disableVertexAttribArray(5); gl.vertexAttrib2f(5, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, limbBufs.idx);
      if (shadow) {                         // version 38: a raised arm casts its shadow on the floor too
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, Lb.tex);
        gl.uniform2f(U.u_off, 0, 0); gl.drawElements(gl.TRIANGLES, M.nIdx, gl.UNSIGNED_SHORT, 0);
        for (var rg2 = 1; rg2 <= shadow.rings; rg2++) for (var q3 = 0; q3 < shadow.ring; q3++) {
          var an2 = (q3 + rg2 * 0.5) / shadow.ring * Math.PI * 2, rd2 = shadow.rr * rg2 / shadow.rings;
          gl.uniform2f(U.u_off, Math.cos(an2) * rd2, Math.sin(an2) * rd2 * 0.45); gl.drawElements(gl.TRIANGLES, M.nIdx, gl.UNSIGNED_SHORT, 0);
        }
        gl.bindTexture(gl.TEXTURE_2D, tex);
        return;
      }
      gl.uniform1f(U.u_matOn, 0); gl.uniform1f(U.u_spotN, 0); gl.uniform1f(U.u_paint, 0);
      gl.uniform1f(U.u_mode, 0); gl.uniform1f(U.u_flat, 0); gl.uniform1f(U.u_round, 0);
      // the body's relief and light come from the body's own height map, which has no arm in it any more (the arm
      // was cut out): read at the arm, it lit the arm as a flat, washed-out sheet. The arm keeps its own photo's light.
      gl.uniform1f(U.u_nscale, 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, Lb.tex);
      gl.drawElements(gl.TRIANGLES, M.nIdx, gl.UNSIGNED_SHORT, 0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1f(U.u_round, roundness);
    }

    // a dancer standing straight, seen from the front (screen angles, y down): torso and head up, arms and
    // legs down. Used when the picture's own pose is not a plain stand (see rigRelative).
    var CANON = { torso: -Math.PI / 2, head: -Math.PI / 2, upperArmL: Math.PI / 2, forearmL: Math.PI / 2, upperArmR: Math.PI / 2,
      forearmR: Math.PI / 2, thighL: Math.PI / 2, shinL: Math.PI / 2, thighR: Math.PI / 2, shinR: Math.PI / 2 };
    function absToRaise(abs, amount, out) {
      var bones = skel.bones;
      amount = clamp(typeof amount === 'number' && isFinite(amount) ? amount : 1, 0, 1);
      if (rigRelative) {
        // the picture is squatting, or a hand rests on a knee: aiming at a standing dancer's directions would
        // stand it up. Instead each bone turns by how much the dancer's bone turns away from standing
        // straight (relative to its parent), on top of the picture's own pose: a squat stays a squat.
        for (var k = 0; k < bones.length; k++) {
          var b2 = bones[k], n2 = Rig.BONES[k].name, t2 = Object.prototype.hasOwnProperty.call(abs, n2) ? abs[n2] : null;
          if (typeof t2 !== 'number' || !isFinite(t2)) { out[k] = 0; continue; }
          var pn = b2.parent >= 0 ? Rig.BONES[b2.parent].name : null, pt = pn ? abs[pn] : 0;
          if (pn && (typeof pt !== 'number' || !isFinite(pt))) pt = CANON[pn];
          var th2 = wrapPi(wrapPi(t2 - (pn ? pt : 0)) - wrapPi(CANON[n2] - (pn ? CANON[pn] : 0))) * amount;
          var leg = /^(thigh|shin)/.test(n2);
          if (leg) th2 *= RELATIVE_LEGS;                          // bent legs take big steps badly: half of them
          var r2 = clamp(b2.side ? -b2.side * th2 : th2, b2.lo, b2.hi);
          if (leg && n2.charAt(0) === 's') r2 = Math.max(r2, RELATIVE_SHIN_IN);   // and the shins do not cross
          out[k] = r2;
        }
        return;
      }
      for (var i = 0; i < bones.length; i++) {
        var bn = bones[i], nm = Rig.BONES[i].name, prot = bn.parent >= 0 ? absRot[bn.parent] : 0;
        var tg = Object.prototype.hasOwnProperty.call(abs, nm) ? abs[nm] : null;
        var want = (typeof tg === 'number' && isFinite(tg)) ? amount * wrapPi(tg - Math.atan2(bn.ey - bn.sy, bn.ex - bn.sx)) : prot;
        var th = wrapPi(want - prot), r = bn.side ? -bn.side * th : th;
        r = clamp(r, bn.lo, bn.hi);
        out[i] = r;
        absRot[i] = prot + (bn.side ? -bn.side * r : r);
      }
    }

    // is (x, y) on a hand of the skeleton? -> { side, reach (elbow to the held point along the forearm),
    // gx, gy (finger minus that point, so the hand does not jump to the finger) } or null
    function handAt(x, y) {
      if (!rigOn() || !skel || !rigTr || free) return null;
      var P = Rig.jointPositions(skel, rigTr), l = toLocal(x, y), best = null, bd = 1e9;
      ['L', 'R'].forEach(function (sd) {
        var e = P[Rig.JOINT['elbow' + sd]], w = P[Rig.JOINT['wrist' + sd]];
        var fx = w[0] - e[0], fy = w[1] - e[1], L = Math.sqrt(fx * fx + fy * fy) || 1;
        var hx = w[0] + fx * 0.25, hy = w[1] + fy * 0.25;                // the middle of the hand
        var d = Math.hypot(l.x - hx, l.y - hy);
        var lim = Math.max(30 / uS, L * 0.6);
        if (d < lim && d < bd) {
          var tproj = ((l.x - e[0]) * fx + (l.y - e[1]) * fy) / L;       // along the forearm
          var reach = clamp(tproj, L * 0.6, L * 1.5);
          var px0 = e[0] + fx / L * reach, py0 = e[1] + fy / L * reach;
          bd = d; best = { side: sd, reach: reach, gx: l.x - px0, gy: l.y - py0 };
        }
      });
      return best;
    }

    // rev 7: is (x, y) on a foot or the head? -> { kind: 'legL' | 'legR' | 'head', ... } or null
    function jointAt(x, y) {
      if (rev < 7 || !rigOn() || !skel || !rigTr || free) return null;
      var P = Rig.jointPositions(skel, rigTr), l = toLocal(x, y), best = null, bd = 1e9, J = Rig.JOINT;
      ['L', 'R'].forEach(function (sd) {
        var k = P[J['knee' + sd]], a = P[J['ankle' + sd]], fx = a[0] - k[0], fy = a[1] - k[1], L = Math.sqrt(fx * fx + fy * fy) || 1;
        var d = Math.hypot(l.x - a[0], l.y - a[1]), lim = Math.max(30 / uS, L * 0.35);
        if (d < lim && d < bd) {
          var reach = clamp(((l.x - k[0]) * fx + (l.y - k[1]) * fy) / L, L * 0.6, L * 1.3);
          bd = d; best = { kind: 'leg' + sd, reach: reach, gx: l.x - (k[0] + fx / L * reach), gy: l.y - (k[1] + fy / L * reach) };
        }
      });
      var n = P[J.neck], h = P[J.head], hl = Math.hypot(h[0] - n[0], h[1] - n[1]) || 1, dh = Math.hypot(l.x - h[0], l.y - h[1]);
      if (dh < Math.max(30 / uS, hl * 0.7) && dh < bd && Math.hypot(l.x - n[0], l.y - n[1]) > hl * 0.35) {
        var ho = Rig.BONE.head * 6;
        best = { kind: 'head', gx: 0, gy: 0, off: wrapPi(Math.atan2(l.y - rigTr[ho + 5], l.x - rigTr[ho + 4]) - Math.atan2(h[1] - n[1], h[0] - n[0])) };
      }
      return best;
    }

    // the material's slow parts: creep memory (how much of a deformation it holds for a while) and the
    // dent field under the fingers (depth, rim, refill, skin flush). Fixed step, no randomness.
    function stepMaterial(dt, ACT, CON) {
      var g = MAT.creepG, r = Math.min(1, dt / MAT.creepT), k;
      if (g > 0) {
        for (k = 0; k < count; k++) {
          if (ACT && !ACT[k]) { cmX[k] = 0; cmY[k] = 0; continue; }
          cmX[k] += (g * (px[k] - rx[k]) - cmX[k]) * r;
          cmY[k] += (g * (py[k] - ry[k]) - cmY[k]) * r;
        }
      }
      if (!fld) return;
      var fingers = [];
      ptrs.forEach(function (o, id) {
        if (!o.down || !o.inb) return;
        var gain;
        if (o.mode === 'press') gain = (rev >= 2 && o.hasP) ? (0.35 + 1.15 * o.p) : (0.45 + 0.55 * Math.min(o.age / 0.35, 1));
        else if (o.mode === 'grab' || o.mode === 'ik') gain = 0.45;   // dragging: the finger still presses a little
        else return;
        var uv = uvAt(o.x, o.y, ACT);
        if (!uv) return;
        fingers.push({ id: id, u: uv.u, v: uv.v, rad: MAT.dentR * o.cr, depth: MAT.dent * gain * (0.7 + 0.6 * strength) });
      });
      fld.step(dt, MAT, fingers);
    }
    // the picture point (u, v) under a screen point, on the mesh as it is now (deformed, posed, rotated):
    // the nearest mesh point, then the offset inside its cell from the cell's two edge vectors
    function uvAt(x, y, ACT) {
      var best = -1, bd = 1e18, k;
      for (k = 0; k < count; k++) {
        if (ACT && !ACT[k]) continue;
        var dx = px[k] - x, dy = py[k] - y, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = k; }
      }
      if (best < 0) return null;
      var st = nx + 1, i = best % st, j = (best - i) / st;
      var ki = i < nx ? best + 1 : best - 1, kj = j < ny ? best + st : best - st, si = i < nx ? 1 : -1, sj = j < ny ? 1 : -1;
      var ax_ = px[ki] - px[best], ay_ = py[ki] - py[best], bx_ = px[kj] - px[best], by_ = py[kj] - py[best];
      var det = ax_ * by_ - ay_ * bx_, ox = x - px[best], oy = y - py[best], a = 0, b = 0;
      if (Math.abs(det) > 1e-6) { a = (ox * by_ - oy * bx_) / det; b = (ax_ * oy - ay_ * ox) / det; }
      a = clamp(a, -1, 1); b = clamp(b, -1, 1);
      return { u: clamp((i + a * si) / nx, 0, 1), v: clamp((j + b * sj) / ny, 0, 1) };
    }

    // Points just outside the body follow the bones exactly, points inside lag (physics). A triangle that
    // has one of each shears, and the outline turns into a saw. So an outside point that touches the body
    // takes the average lag of its body neighbours. Only body values are read: the order does not matter.
    function followEdge(A) {
      var stride = nx + 1;
      for (var j = 0; j <= ny; j++) {
        for (var i = 0; i <= nx; i++) {
          var k = j * stride + i;
          if (A[k]) continue;
          var ox = 0, oy = 0, n = 0, m;
          if (i > 0 && A[m = k - 1]) { ox += px[m] - rx[m]; oy += py[m] - ry[m]; n++; }
          if (i < nx && A[m = k + 1]) { ox += px[m] - rx[m]; oy += py[m] - ry[m]; n++; }
          if (j > 0 && A[m = k - stride]) { ox += px[m] - rx[m]; oy += py[m] - ry[m]; n++; }
          if (j < ny && A[m = k + stride]) { ox += px[m] - rx[m]; oy += py[m] - ry[m]; n++; }
          if (n) { px[k] = rx[k] + ox / n; py[k] = ry[k] + oy / n; }
        }
      }
    }

    /* ---------- the head (only when a face was found in the picture) ---------- */
    // We only know a face box, not a skeleton. So "head" = the face area plus a soft margin, and it
    // pivots around a point just under the face (roughly the chin / neck). Nothing more is claimed.
    function computeHead() {
      headW = null; head = null;
      if (!count || !regions.length || rigOn()) return;      // with a skeleton, the head is a bone
      var r = regions[0];
      var fcx = (r.u - 0.5) * bw, fcy = (r.v - 0.5) * bh, frx = r.ru * bw, fry = r.rv * bh;
      head = { cx: fcx, cy: fcy, rx: frx, ry: fry, pvx: fcx, pvy: fcy + fry * 1.05 };
      headW = new Float32Array(count);
      for (var k = 0; k < count; k++) {
        var ex = (lx[k] - fcx) / (frx * 1.2), ey = (ly[k] - fcy) / (fry * 1.2);
        var e = Math.sqrt(ex * ex + ey * ey);
        var w = e <= 1 ? 1 : Math.max(0, 1 - (e - 1) / 0.45);
        if (ly[k] > head.pvy) w *= Math.max(0, 1 - (ly[k] - head.pvy) / (fry * 0.5));   // below the chin: barely moves
        headW[k] = w * w * (3 - 2 * w);
      }
    }
    function headPivot() {
      var cs = Math.cos(ang), sn = Math.sin(ang), a = head.pvx * uS, b = head.pvy * uS;
      return { x: cx + a * cs - b * sn, y: cy + a * sn + b * cs };
    }
    // the head is a small joint: an angle with a spring back to straight. The head's resting places
    // rotate with it, and the soft points follow, so the head turns while the body stays.
    function headSpin(omega) { if (headW) hVel += omega; }

    /* ---------- alive 3D (portrait.js): a head that turns in 3D, a chest that breathes ---------- */
    function computePortrait() {
      PM = null;
      if (!life || !count || !regions.length || rigOn() || !window.Portrait) return;
      PM = Portrait.model(regions[0], bw, bh);
      pW = new Float32Array(count); pZ = new Float32Array(count); pT = new Float32Array(count);
      Portrait.weights(PM, lx, ly, { w: pW, z: pZ, t: pT });
    }
    // where the head wants to look: at a finger (or a hovering mouse) that is not on the head itself,
    // otherwise its own slow movements. Springs give it a human pace.
    function updatePortrait(dt) {
      var tY, tP, look = null;
      ptrs.forEach(function (o) { if (!look && (o.down || o.mode === 'hover')) look = o; });
      if (look && life.look > 0) {
        var l = toLocal(look.x, look.y);
        var ex = (l.x - PM.hx) / PM.rx, ey = (l.y - PM.hy) / PM.ry;
        if (ex * ex + ey * ey < 1) look = null;            // on the head: a tap tilts it (see personTouch)
        else {
          tY = clamp((l.x - PM.hx) / (bw * 0.5), -1, 1) * Portrait.MAX_YAW * life.look;
          tP = clamp((l.y - PM.hy) / (bh * 0.45), -1, 1) * Portrait.MAX_PITCH * life.look;
        }
      } else look = null;
      if (!look) {
        var id = Portrait.idle(time, reduceMotion ? 0 : life.head);
        tY = id.yaw; tP = id.pitch;
      }
      pyawV += (38 * (tY - pyaw) - 10.5 * pyawV) * dt; pyaw += pyawV * dt;
      ppitV += (38 * (tP - ppit) - 10.5 * ppitV) * dt; ppit += ppitV * dt;
      pyaw = clamp(pyaw, -Portrait.MAX_YAW, Portrait.MAX_YAW); ppit = clamp(ppit, -Portrait.MAX_PITCH, Portrait.MAX_PITCH);
      // breathing: in a little slower than out, about 15 breaths a minute
      var ph = (time / 4.2) % 1;
      pbreath = reduceMotion ? 0 : life.breath * (0.5 - 0.5 * Math.cos(Math.PI * 2 * (ph < 0.45 ? ph / 0.9 : 0.5 + (ph - 0.45) / 1.1)));
    }

    /* ---------- physics ---------- */
    function wallHit(axis, side, s) {
      // The body bounces; the face away from the wall keeps moving in, so it squashes.
      var half = (axis === 'x' ? bw : bh) * uS / 2;
      var delta = -(1 + REST) * side * s;
      for (var k = 0; k < count; k++) {
        var l = (axis === 'x' ? lx[k] : ly[k]) * uS;
        var f = side < 0 ? (l + half) / (2 * half) : (half - l) / (2 * half);
        var dv = delta + side * s * 0.8 * f;
        if (axis === 'x') vx[k] += dv; else vy[k] += dv;
      }
      avel *= 0.8;
      if (s > 260) hitFx(Math.min(1, s / 2200));
    }

    var pressed = [];
    var ptrs = new Map();

    function lifeAct() {
      var r = rand();
      var atHome = Math.hypot(cx - (rev >= 2 ? anchorX : W / 2), cy - (rev >= 2 ? anchorY : AH / 2)) < 30 && Math.hypot(cvx, cvy) < 40;
      var k;
      if (r < 0.2 && atHome) {
        var hop = gravityOn ? 640 * Math.sqrt(gScale) : 220;
        var hh = bh / 2;
        cvy -= hop;
        for (k = 0; k < count; k++) vy[k] -= hop * (0.75 + 0.5 * (hh - ly[k]) / bh);
        return;
      }
      if (headW && r < 0.45) { headSpin((rand() - 0.5) * 1.6); return; }   // a little head tilt
      var k0 = (rand() * count) | 0;
      var x0 = px[k0], y0 = py[k0];
      var a = rand() * Math.PI * 2;
      var dirx = Math.cos(a), diry = Math.sin(a);
      var rr = pr * 0.9;
      for (k = 0; k < count; k++) {
        var ddx = px[k] - x0, ddy = py[k] - y0;
        var d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d >= rr) continue;
        var t = 1 - d / rr;
        vx[k] += dirx * 260 * t * t;
        vy[k] += diry * 260 * t * t;
      }
      tvX += (rand() - 0.5) * 1.2;
      tvY += (rand() - 0.5) * 1.2;
    }

    function step(dt) {
      if (stepHook && stepHook(stepsDone) === false) return;   // a replay that reached its end
      stepsDone++;
      hSteps++;
      time += dt;
      if (quakeTotal) quakeStep();
      maxDev2 = 0; maxVel2 = 0;
      var KSe = KS * (softT > 0 ? 0.6 : 1) / massMul, CDe = CD * dampMul / massMul, KNe = KN / massMul;
      if (MAT) { KSe *= MAT.ks; CDe *= MAT.damp; KNe *= MAT.ripple; }
      if (softT > 0) softT -= dt;
      var g = (gravityOn && !free) ? G * gScale : 0;
      var k, i, j;

      updateAnim(dt);
      if (alive && !free && !ptrs.size && aW < 0.05) {
        lifeT -= dt;
        if (lifeT <= 0) { lifeT = 2.2 + rand() * 4; lifeAct(); }
      }

      /* 1. placement of the whole body */
      var bax, bay;
      if (free && fm) {
        var tr = fm.update(dt);
        var ovx = cvx, ovy = cvy;
        var kvel = Math.min(1, dt * 25);
        cvx += (tr.vx - cvx) * kvel; cvy += (tr.vy - cvy) * kvel;
        // the points get most (not all) of the body's acceleration, so fast moves stretch it a little
        bax = clamp((cvx - ovx) / dt, -30000, 30000) * 0.75;
        bay = clamp((cvy - ovy) / dt, -30000, 30000) * 0.75;
        cx = tr.x; cy = tr.y; ang = tr.ang; uS = tr.scale; avel = 0;
        if (tr.bump > 160) { hitFx(Math.min(1, tr.bump / 2000) * 0.7); jiggle(tr.bump * 0.25); }
      } else {
        bax = KHOME * (homeX - cx) - CB * cvx;
        bay = g + KHOME * (homeY - cy) - CB * cvy;
        var gr = null;
        ptrs.forEach(function (o) { if (o.down && o.mode === 'grab') gr = o; });
        nHt = 0; nLt = 0;
        if (gr && human()) {                 // a person stays on its feet: the drag leans it (springs, below)
          var shg = nudgeShare(gr.sy), dl = clamp((gr.x - gr.sx) / (bh * uS), -1, 1);
          nHt = clamp(dl * shg.hip, -NUDGE_MAX, NUDGE_MAX) * 0.7; nLt = clamp(dl * shg.lean, -NUDGE_MAX, NUDGE_MAX);
          gr = null;
        }
        if (gr) {
          var kg = rev >= 2 ? 700 : KG, cg = rev >= 2 ? 48 : CG;      // rev 2: the body keeps up with your finger
          bax = kg * (gr.x + gr.gx - cx) - cg * cvx;
          bay = kg * (gr.y + gr.gy - cy) - cg * cvy;
        }
        cvx += bax * dt; cvy += bay * dt;
        cx += cvx * dt; cy += cvy * dt;
        avel += (-30 * ang - 4 * avel) * dt;
        uS += (1 - uS) * Math.min(1, dt * 5);
        ang += avel * dt;

        var hw0 = bw * uS / 2, hh0 = bh * uS / 2, s;
        if (cx < hw0) { cx = hw0; if (cvx < -30) { s = -cvx; wallHit('x', -1, s); cvx = s * REST; } else if (cvx < 0) cvx = 0; }
        else if (cx > W - hw0) { cx = W - hw0; if (cvx > 30) { s = cvx; wallHit('x', 1, s); cvx = -s * REST; } else if (cvx > 0) cvx = 0; }
        if (cy < hh0) { cy = hh0; if (cvy < -30) { s = -cvy; wallHit('y', -1, s); cvy = s * REST; } else if (cvy < 0) cvy = 0; }
        else if (cy > AH - hh0) { cy = AH - hh0; if (cvy > 30) { s = cvy; wallHit('y', 1, s); cvy = -s * REST; } else if (cvy > 0) cvy = 0; }
      }
      var hw = bw * uS / 2, hh = bh * uS / 2;

      /* 2. deformation relative to the placement */
      var cs = Math.cos(ang), sn = Math.sin(ang);
      var br = (reduceMotion || free || !alive) ? 1 : 1 + 0.012 * Math.sin(time * 1.8) + 0.004 * Math.sin(time * 4.3);
      if (headW) {
        var torque = -40 * (hAng - AD.head) - 5 * hVel;
        if (shakeT > 0) { shakeT -= dt; torque += Math.sin(time * 13) * 36 * (shakeT / 0.9); }   // shaking its head
        hVel += torque * dt;
        hAng = clamp(hAng + hVel * dt, -0.5, 0.5);
      }
      var useA = aW > 0.001, hb = bh / 2, acr = Math.cos(AD.rot), asr = Math.sin(AD.rot);
      if (human() || nH || nL || nHv || nLv) {  // the push springs (version 28)
        if (!human()) { nHt = nLt = 0; }
        nHv += (-NUDGE_K * (nH - nHt) - NUDGE_C * nHv) * dt; nLv += (-NUDGE_K * (nL - nLt) - NUDGE_C * nLv) * dt;
        nH = clamp(nH + nHv * dt, -0.08, 0.08); nL = clamp(nL + nLv * dt, -0.1, 0.1);
        if (Math.abs(nH) + Math.abs(nL) + Math.abs(nHv) + Math.abs(nLv) < 1e-5 && !nHt && !nLt) nH = nL = nHv = nLv = 0;
      }
      var hipE = (AD.hip || 0) + nH, leanE = (AD.lean || 0) + nL;
      if ((nH || nL) && !useA) useA = true;
      var LP = PM && life && !rbind;
      if (LP) updatePortrait(dt);
      var cyw = LP ? Math.cos(pyaw) : 1, syw = LP ? Math.sin(pyaw) : 0, cpt = LP ? Math.cos(ppit) : 1, spt = LP ? Math.sin(ppit) : 0;
      var R = rbind, BI = R ? R.bone : null, BW = R ? R.weight : null, TR = rigTr;
      var RK = crispRig() ? RIG_K_VIDEO : RIG_K;
      if (R) {
        br = 1;
        var held = false;
        ptrs.forEach(function (o) { if (o.down) held = true; });
        updateRig(dt, held);
      }
      var sumX = 0, sumY = 0, R7 = R && rev >= 7 && flexT;
      if (R7) for (var ab = 0; ab < rigRaise.length; ab++) absB[ab] = Math.atan2(TR[ab * 6 + 1], TR[ab * 6]);
      for (k = 0; k < count; k++) {
        var a = lx[k] * br, b = ly[k] * br;
        if (R7) { skin7(k, a, b, BI, BW, TR); a = SK7[0]; b = SK7[1]; }
        else if (R) {                       // skinning: blend of up to three bone transforms
          var sa = 0, sb = 0, k3 = k * 3;
          for (var q = 0; q < 3; q++) {
            var wq = BW[k3 + q];
            if (wq <= 0) continue;
            var o6 = BI[k3 + q] * 6, qa = a - TR[o6 + 2], qb = b - TR[o6 + 3];
            sa += wq * (TR[o6] * qa - TR[o6 + 1] * qb + TR[o6 + 4]);
            sb += wq * (TR[o6 + 1] * qa + TR[o6] * qb + TR[o6 + 5]);
          }
          a = sa; b = sb;
        }
        if (R) {
          if (rigHead && headWt[k] > 0) {              // the head's own nod / shake (both revs)
            var ho = Rig.BONE.head * 6, hb0 = skel.bones[Rig.BONE.head], hL = hb0.len;
            var ux = Math.atan2(hb0.ey - hb0.sy, hb0.ex - hb0.sx) + Math.atan2(TR[ho + 1], TR[ho]);
            var upx = Math.cos(ux), upy = Math.sin(ux), sdx = -upy, sdy = upx;           // along the head, across it
            var hx = a - TR[ho + 4], hy = b - TR[ho + 5], hs1 = hx * sdx + hy * sdy, hu1 = hx * upx + hy * upy;
            var hs2 = hs1 * rigHead.sx + rigHead.dx * hL, hu2 = hu1 * rigHead.sy + rigHead.dy * hL, ww = headWt[k];
            a += (TR[ho + 4] + hs2 * sdx + hu2 * upx - a) * ww; b += (TR[ho + 5] + hs2 * sdy + hu2 * upy - b) * ww;
          }
        }
        if (LP) {                           // the head turns in 3D around the neck; the chest breathes
          var hw_ = pW[k], tw_ = pT[k];
          if (hw_ > 0) {
            var zz = pZ[k] * life.depth, qx_ = a - PM.px, qy_ = b - PM.py;
            a += (PM.px + qx_ * cyw + zz * syw - a) * hw_;
            b += (PM.py + qy_ * cpt + zz * spt - b) * hw_;
          }
          if (tw_ > 0 || hw_ > 0) {
            a += (a - PM.chest.x) * pbreath * 0.022 * tw_;
            b -= pbreath * PM.ry * 0.1 * (tw_ + hw_ * 0.7);
          }
        }
        if (useA) {                         // the character move: squash from the floor, lean around the feet, shift
          if (hipE || leanE || AD.breath) {        // version 28: a standing body bends by height, the feet stay put
            var vh = clamp((hb - b) / (2 * hb), 0, 1), up = smooth01((vh - 0.42) / 0.4);
            var hipW = Math.pow(Math.min(1, vh / 0.45), 1.7);      // the knees move less than the hips, the ankles hardly
            a += 2 * hb * (hipE * hipW + leanE * up * up);
            b -= 2 * hb * 0.006 * (AD.breath || 0) * smooth01((vh - 0.4) / 0.3);
          }
          a *= AD.sx; b = (b - hb) * AD.sy;
          var a2 = a * acr - b * asr, b2 = a * asr + b * acr;
          a = a2 + AD.ox; b = b2 + hb + AD.oy;
        }
        if (headW && hAng && headW[k] > 0) {
          var th = hAng * headW[k], c2 = Math.cos(th), s2 = Math.sin(th), qx = a - head.pvx, qy = b - head.pvy;
          a = head.pvx + qx * c2 - qy * s2; b = head.pvy + qx * s2 + qy * c2;
        }
        a *= uS; b *= uS;
        rx[k] = cx + quakeX + a * cs - b * sn;
        ry[k] = cy + quakeY + a * sn + b * cs;
        dxA[k] = px[k] - rx[k];
        dyA[k] = py[k] - ry[k];
        var dv2 = dxA[k] * dxA[k] + dyA[k] * dyA[k];
        if (dv2 > maxDev2) maxDev2 = dv2;
        sumX += px[k]; sumY += py[k];
      }
      var cmx = sumX / count, cmy = sumY / count;

      // volume: how much has the outline been squashed (+) or stretched (-)?
      var area = 0, bl = boundary.length;
      for (i = 0; i < bl; i++) {
        var p0 = boundary[i], p1 = boundary[(i + 1) % bl];
        area += px[p0] * py[p1] - px[p1] * py[p0];
      }
      area = Math.abs(area) * 0.5;
      var squash = (area > 1 && !rbind) ? clamp(bw * bh * uS * uS * br * br / area - 1, -0.5, 0.8) : 0;   // no volume push on a skeleton

      pressed.length = 0;
      var grabs = [];
      ptrs.forEach(function (o) {
        if (!o.down) return;
        if (o.mode === 'press') { o.age += dt; pressed.push(o); }
        else if (o.mode === 'grab') grabs.push(o);
      });

      // 3D tilt: a finger pushes its side away; moving fast leans into the motion
      var tgX = 0, tgY = 0;
      ptrs.forEach(function (o) {            // a hovering mouse: it leans toward you, curious
        if (o.down) return;
        var hx = (o.x - cx) / hw, hy = (o.y - cy) / hh;
        if (Math.abs(hx) < 1.8 && Math.abs(hy) < 1.8) { tgY -= clamp(hx, -1, 1) * 0.1; tgX += clamp(hy, -1, 1) * 0.1; }
      });
      for (i = 0; i < pressed.length; i++) {
        var ox = (pressed[i].x - cx) / hw, oy = (pressed[i].y - cy) / hh;
        if (Math.abs(ox) < 1.3 && Math.abs(oy) < 1.3) {
          var depth = 0.12 + 0.16 * Math.min(pressed[i].age / 0.4, 1);
          tgY += clamp(ox, -1, 1) * depth;
          tgX -= clamp(oy, -1, 1) * depth;
        }
      }
      tgX += AD.tx; tgY += AD.ty;
      if (gyroOn && !replaying && !inputSink) { tgX += gyro.x; tgY += gyro.y; }   // tilting the phone (not recorded)
      tgY += -cvx * 0.00015;
      tgX += cvy * 0.00015;
      tgX = clamp(tgX, -0.55, 0.55); tgY = clamp(tgY, -0.55, 0.55);
      tvX += (-KT * (tiltX - tgX) - CT * tvX) * dt;
      tvY += (-KT * (tiltY - tgY) - CT * tvY) * dt;
      tiltX += tvX * dt; tiltY += tvY * dt;
      tiltX = clamp(tiltX, -0.8, 0.8); tiltY = clamp(tiltY, -0.8, 0.8);

      // holding fingers (normal mode): the spot you hold is pulled toward your finger, the rest follows
      var anchors = [];
      for (i = 0; i < grabs.length; i++) {
        var o2 = grabs[i];
        var aa = o2.alx * uS, ab = o2.aly * uS;
        var awx = cx + aa * cs - ab * sn, awy = cy + aa * sn + ab * cs;
        var lgx = o2.x - awx, lgy = o2.y - awy, lg = Math.hypot(lgx, lgy);
        var lgCap = human() ? pr * 0.25 : pr;            // a person: the skin under the finger gives a little, the body leans
        if (lg > lgCap) { lgx *= lgCap / lg; lgy *= lgCap / lg; }
        anchors.push({ lx: o2.alx, ly: o2.aly, gx: lgx, gy: lgy, vx: clamp(o2.vx, -3000, 3000), vy: clamp(o2.vy, -3000, 3000) });
      }
      var Rg = pr * 1.4;


      var stride = nx + 1;
      var pw = power();
      var ACT = R ? R.act : null, CON = R ? R.conn : null;
      for (j = 0; j <= ny; j++) {
        for (i = 0; i <= nx; i++) {
          k = j * stride + i;
          if (ACT && !ACT[k]) { ax[k] = 0; ay[k] = 0; continue; }   // outside the body: follows the bones exactly
          var sdx = 0, sdy = 0, svx = 0, svy = 0, n = 0, m;
          if (CON) {                        // only neighbours joined through the body (not across the armpit gap)
            if (i > 0 && (CON[k - 1] & 1)) { m = k - 1; sdx += dxA[m]; sdy += dyA[m]; svx += vx[m]; svy += vy[m]; n++; }
            if (i < nx && (CON[k] & 1)) { m = k + 1; sdx += dxA[m]; sdy += dyA[m]; svx += vx[m]; svy += vy[m]; n++; }
            if (j > 0 && (CON[k - stride] & 2)) { m = k - stride; sdx += dxA[m]; sdy += dyA[m]; svx += vx[m]; svy += vy[m]; n++; }
            if (j < ny && (CON[k] & 2)) { m = k + stride; sdx += dxA[m]; sdy += dyA[m]; svx += vx[m]; svy += vy[m]; n++; }
            if (!n) { sdx = dxA[k]; sdy = dyA[k]; svx = vx[k]; svy = vy[k]; n = 1; }
          } else {
            if (i > 0) { m = k - 1; sdx += dxA[m]; sdy += dyA[m]; svx += vx[m]; svy += vy[m]; n++; }
            if (i < nx) { m = k + 1; sdx += dxA[m]; sdy += dyA[m]; svx += vx[m]; svy += vy[m]; n++; }
            if (j > 0) { m = k - stride; sdx += dxA[m]; sdy += dyA[m]; svx += vx[m]; svy += vy[m]; n++; }
            if (j < ny) { m = k + stride; sdx += dxA[m]; sdy += dyA[m]; svx += vx[m]; svy += vy[m]; n++; }
          }
          var inv = 1 / n;
          var kk = (kv ? kv[k] : 1) * (R ? RK : 1);
          // a material springs back toward its slow memory (creep), not straight to rest: it comes back slowly
          var ex = MAT ? dxA[k] - cmX[k] : dxA[k], ey = MAT ? dyA[k] - cmY[k] : dyA[k];
          var aX = -KSe * kk * ex - CDe * (vx[k] - cvx) + KNe * (sdx * inv - dxA[k]) + CN * (svx * inv - vx[k]);
          var aY = -KSe * kk * ey - CDe * (vy[k] - cvy) + KNe * (sdy * inv - dyA[k]) + CN * (svy * inv - vy[k]);
          aX += KP * squash * (px[k] - cmx);
          aY += KP * squash * (py[k] - cmy);

          for (var p = 0; p < pressed.length; p++) {
            var o = pressed[p];
            var ddx = px[k] - o.x, ddy = py[k] - o.y;
            var d2 = ddx * ddx + ddy * ddy;
            var rad = pr * o.cr;
            if (d2 < rad * rad) {
              var d = Math.max(6, Math.sqrt(d2));
              var t = 1 - d / rad;
              // sinks in the longer you hold; with a real pressure reading, it follows how hard you press
              var gain = (rev >= 2 && o.hasP) ? (0.35 + 1.15 * o.p) : (0.45 + 0.95 * Math.min(o.age / 0.4, 1));
              var f = PRESS * pw * gain * t * t / d / (rev >= 2 ? massMul * Math.sqrt(kk) : 1);
              if (MAT) f *= MAT.spread;      // a finger presses INTO skin; it barely pushes the picture sideways
              aX += ddx * f; aY += ddy * f;
            }
          }
          for (p = 0; p < anchors.length; p++) {
            var an = anchors[p];
            var dl = Math.hypot(lx[k] - an.lx, ly[k] - an.ly) * uS;
            if (dl < Rg) {
              var wl = 1 - dl / Rg; wl *= wl;
              if (rev >= 2) {                  // the held spot tracks the finger: position pull + matching speed
                var stk = MAT ? MAT.stick : 1;   // skin sticks to the finger, jelly slides under it
                aX += KA2 * stk * KSe * wl * (an.gx - dxA[k]) + CF * wl * (an.vx - vx[k]);   // toward the finger, not past it
                aY += KA2 * stk * KSe * wl * (an.gy - dyA[k]) + CF * wl * (an.vy - vy[k]);
              } else { aX += KA * KSe * wl * an.gx; aY += KA * KSe * wl * an.gy; }
            }
          }
          ax[k] = aX + bax;
          ay[k] = aY + bay;
        }
      }

      // rev 6: a body that is moving as a person (bones, a dance, standing / sitting alive) is solid, not jelly
      var solid = rev >= 6 && !free && ((R && rig && rig.clip !== 'none') || human()), fing = null;
      if (solid) {
        fing = [];
        ptrs.forEach(function (o) { if (o.down && o.inb) fing.push(o.x, o.y, pr * (o.cr || 1) * 1.2); });
      }
      for (k = 0; k < count; k++) {
        if (ACT && !ACT[k]) { px[k] = rx[k]; py[k] = ry[k]; vx[k] = cvx; vy[k] = cvy; continue; }
        var p0x = px[k], p0y = py[k];
        vx[k] += ax[k] * dt;
        vy[k] += ay[k] * dt;
        var sp = vx[k] * vx[k] + vy[k] * vy[k];
        if (sp > maxVel2) maxVel2 = sp;
        if (sp > VMAX * VMAX) {
          var sc = VMAX / Math.sqrt(sp);
          vx[k] *= sc; vy[k] *= sc;
        }
        px[k] += vx[k] * dt;
        py[k] += vy[k] * dt;
        if (px[k] < 0) { px[k] = 0; if (vx[k] < 0) vx[k] = 0; }
        else if (px[k] > W) { px[k] = W; if (vx[k] > 0) vx[k] = 0; }
        if (py[k] < 0) { py[k] = 0; if (vy[k] < 0) vy[k] = 0; }
        else if (py[k] > H) { py[k] = H; if (vy[k] > 0) vy[k] = 0; }
        if (solid) {
          var soft = false;
          for (var fq = 0; fq < fing.length; fq += 3) { var fdx = px[k] - fing[fq], fdy = py[k] - fing[fq + 1]; if (fdx * fdx + fdy * fdy < fing[fq + 2] * fing[fq + 2]) { soft = true; break; } }
          if (!soft) {                       // the skin under a finger still gives; the rest follows its bones
            px[k] = rx[k] + (px[k] - rx[k]) * SOLID_KEEP; py[k] = ry[k] + (py[k] - ry[k]) * SOLID_KEEP;
            vx[k] = (px[k] - p0x) / dt; vy[k] = (py[k] - p0y) / dt;
          }
        }
      }
      if (rev >= 2) limitStrain();
      if (ACT) followEdge(ACT);
      if (MAT) stepMaterial(dt, ACT, CON);
      // safety net: if anything ever produced NaN (bad input, a bug), put the body back instead of vanishing
      if (px[0] !== px[0] || py[count - 1] !== py[count - 1] || cx !== cx || cy !== cy) {
        console.warn('living-image: physics reset after an invalid value');
        hNan++;
        if (!(cx === cx && cy === cy)) { cx = W / 2; cy = AH / 2; }
        restPose({ x: cx, y: cy, ang: ang === ang ? ang : 0, scale: uS === uS ? uS : 1 });
      }
    }

    /* ---------- character moves ---------- */
    function profile() { return { hasFace: !!headW, soft: softness, heavy: gScale > 1.2 }; }
    function switchClip(n) {
      if (n === aClip) return;
      aPrev = aClip !== 'none' ? aClip : null; aPrevT = aT;
      aClip = n; aT = 0; aMixT = 0;
    }
    function updateAnim(dt) {
      var A = window.Animator;
      var active = !!A && (anim.clip !== 'none' || anim.auto);
      var touching = false;
      ptrs.forEach(function (o) { if (o.down) touching = true; });
      aW += ((active ? (touching ? 0.2 : 1) : 0) - aW) * Math.min(1, dt * 3);   // fades out while you touch it
      if (!active && aW < 0.002) { aW = 0; if (AD.sx !== 1 || AD.land) AD = A ? A.rest() : AD; return; }
      if (anim.auto) {
        autoLeft -= dt;
        if (aClip === 'none' || autoLeft <= 0) {
          var n = A.pick(profile(), rand, aClip);
          switchClip(n);
          autoLeft = Math.max(4, A.CLIPS[n].loop * 3);
        }
      }
      // where is the finger or the mouse? (for "curious")
      var tx = 0, ty = 0, has = false;
      ptrs.forEach(function (o) {
        if (has && !o.down) return;
        tx = clamp((o.x - cx) / (bw * uS * 0.8), -1, 1); ty = clamp((o.y - cy) / (bh * uS * 0.8), -1, 1); has = true;
      });
      lookOn += ((has ? 1 : 0) - lookOn) * Math.min(1, dt * 2);
      lookX += (tx - lookX) * Math.min(1, dt * 4); lookY += (ty - lookY) * Math.min(1, dt * 4);
      var ctx = { hasFace: !!headW, look: lookOn > 0.05 ? { x: lookX * lookOn, y: lookY * lookOn } : null, h: bh };
      aT += dt * anim.speed; aMixT += dt;
      var cur = A.sample(aClip, aT, anim.amount, ctx);
      if (aPrev && aMixT < 0.6) cur = A.mix(A.sample(aPrev, aPrevT + aMixT * anim.speed, anim.amount, ctx), cur, (function (u) { return u * u * (3 - 2 * u); })(aMixT / 0.6));
      AD = A.mix(A.rest(), cur, aW);
      if (AD.land > 0.2 && time - lastLand > 0.35) { lastLand = time; S.tap(0.12 + 0.2 * AD.land); }
    }

    // rev 2: no tearing and no rubber-band look. An edge between neighbours may stretch to 1.6x or
    // squeeze to 0.55x its resting length; beyond that both ends are moved back (three quick passes).
    var fixed = 0;
    function limitStrain() {
      var stride = nx + 1, cw = bw / nx * uS, ch = bh / ny * uS;
      if (rbind) { limitStrainRig(cw, ch); return; }
      for (var it = 0; it < 8; it++) {          // usually done after one or two passes
        fixed = 0;
        for (var j = 0; j <= ny; j++) {
          for (var i = 0; i <= nx; i++) {
            var k = j * stride + i;
            if (i < nx) fixEdge(k, k + 1, cw);
            if (j < ny) fixEdge(k, k + stride, ch);
          }
        }
        if (!fixed) break;
      }
    }
    // Skeleton: only the edges inside the body (the air between limbs may stretch), from a list made at
    // bind time. Same edges, same order and same arithmetic as scanning the grid with fixEdge(), so the
    // result is bit for bit the same, just without visiting ~4x more empty grid points 24 times a step.
    // A skeleton pulls long chains (shoulder, hip), so it gets up to 24 passes (rev 2) or 48 (rev 3) instead of 8;
    // the loop stops as soon as a pass fixes nothing.
    function limitStrainRig(cw, ch) {
      var E = rigEdges, ne = E.length, loW = 0.55 * cw, hiW = 1.6 * cw, loH = 0.55 * ch, hiH = 1.6 * ch;
      // rev 3: every second pass walks the list backwards (symmetric Gauss-Seidel). A stretched chain,
      // like the side of the chest under a raised arm, then settles in a few passes instead of creeping
      // one edge per pass. rev 2 keeps the forward-only order of the first skeleton build.
      var both = rev >= 3, passes = both ? 48 : 24;      // rev 3 also gets enough passes to fully settle
      // Skip work, not results: an edge that was within its limits when last looked at, and whose two
      // points have not moved since, would be left alone again. So after the first pass only edges next
      // to a moved point are measured. Same output as measuring every edge every pass (stamps reset each step).
      var mv = rigMoved, ck = rigChecked, tick = 1;
      mv.fill(0); ck.fill(0);
      for (var it = 0; it < passes; it++) {
        fixed = 0;
        var back = both && (it & 1);
        for (var q = 0; q < ne; q += 3) {
          var e = back ? ne - 3 - q : q;
          var a = E[e], b = E[e + 1], ei = e / 3, lo, hi;
          if (it > 0 && ck[ei] > mv[a] && ck[ei] > mv[b]) continue;
          ck[ei] = ++tick;
          if (E[e + 2]) { lo = loH; hi = hiH; } else { lo = loW; hi = hiW; }
          var dx = px[b] - px[a], dy = py[b] - py[a], d = Math.sqrt(dx * dx + dy * dy) || 1e-6, tgt;
          if (d > hi * 1.001) tgt = hi; else if (d < lo * 0.999) tgt = lo; else continue;
          fixed++;
          var c = (d - tgt) / d * 0.5;
          px[a] += dx * c; py[a] += dy * c; px[b] -= dx * c; py[b] -= dy * c;
          mv[a] = mv[b] = tick;            // not newer than ck[ei]: this edge itself is measured again next pass
        }
        if (!fixed) break;
      }
      if (fixed) hSat++;                    // still not settled after every pass: the pose asks too much
      // every 8th step: how many body edges sit at the stretch limit (a pose that tears the body open)
      if ((stepsDone & 7) === 0 && ne) {
        var pin = 0;
        for (var q2 = 0; q2 < ne; q2 += 3) {
          var a2 = E[q2], b2 = E[q2 + 1], hi2 = E[q2 + 2] ? hiH : hiW;
          var ddx = px[b2] - px[a2], ddy = py[b2] - py[a2];
          if (ddx * ddx + ddy * ddy > hi2 * hi2 * 0.98) pin++;
        }
        hPin += pin / (ne / 3); hPinN++;
      }
    }
    function fixEdge(a, b, L) {
      var dx = px[b] - px[a], dy = py[b] - py[a], d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
      var lo = 0.55 * L, hi = 1.6 * L, tgt;
      if (d > hi * 1.001) tgt = hi; else if (d < lo * 0.999) tgt = lo; else return;
      fixed++;
      var c = (d - tgt) / d * 0.5;
      px[a] += dx * c; py[a] += dy * c; px[b] -= dx * c; py[b] -= dy * c;
    }

    // a small wobble of the whole surface (used when a free-moving body slides into the edge)
    function jiggle(amount) {
      for (var k = 0; k < count; k++) {
        vx[k] += (lx[k] / bw) * amount * 0.6;
        vy[k] -= (ly[k] / bh) * amount * 0.6;
      }
    }

    /* ---------- touch: local responses ---------- */
    function inside(x, y) {
      var cs = Math.cos(ang), sn = Math.sin(ang);
      var dx = x - cx, dy = y - cy;
      var a = dx * cs + dy * sn;
      var b = -dx * sn + dy * cs;
      return Math.abs(a) < bw * uS / 2 + 16 && Math.abs(b) < bh * uS / 2 + 16;
    }
    function toLocal(x, y) {
      var cs = Math.cos(ang), sn = Math.sin(ang), dx = x - cx, dy = y - cy;
      return { x: (dx * cs + dy * sn) / uS, y: (-dx * sn + dy * cs) / uS };
    }

    // a finger sliding across the surface drags the points under it a little
    function touchField(x, y, mvx, mvy, tvx, tvy, down) {
      var r2 = pr * pr;
      var posGain = down ? 0.45 : 0.18;
      var velGain = down ? 0.28 : 0.1;
      for (var k = 0; k < count; k++) {
        var ddx = px[k] - x, ddy = py[k] - y;
        var d2 = ddx * ddx + ddy * ddy;
        if (d2 >= r2) continue;
        var t = 1 - Math.sqrt(d2) / pr;
        var w = t * t;
        px[k] += mvx * w * posGain;
        py[k] += mvy * w * posGain;
        vx[k] += (tvx - vx[k]) * w * velGain;
        vy[k] += (tvy - vy[k]) * w * velGain;
      }
    }

    function regionAt(x, y) {
      var l = toLocal(x, y);
      var u = l.x / bw + 0.5, v = l.y / bh + 0.5;
      for (var i = 0; i < regions.length; i++) {
        var r = regions[i];
        var a = (u - r.u) / r.ru, b = (v - r.v) / r.rv;
        if (a * a + b * b <= 1) return r;
      }
      return null;
    }

    // a picture with a face: touching the face tips the head away from the finger (around the
    // chin), the cheek gives; four quick pokes make it shake its head. Elsewhere it sways a little.
    function personTouch(x, y) {
      if (!regions.length) return false;
      var r = regionAt(x, y), k;
      if (r && headW) {
        var l = toLocal(x, y);
        var side = clamp((l.x - head.cx) / head.rx, -1, 1);
        faceTaps.push(time);
        faceTaps = faceTaps.filter(function (t) { return time - t < 2.2; });
        if (faceTaps.length >= 4) { shakeT = 0.9; faceTaps.length = 0; }
        headSpin(-side * 2.4 * power());
        softT = 0.45;
        var rr = pr * 1.1;
        for (k = 0; k < count; k++) {
          var ddx = px[k] - x, ddy = py[k] - y, d = Math.max(8, Math.sqrt(ddx * ddx + ddy * ddy));
          if (d > rr) continue;
          var t = 1 - d / rr;
          vx[k] += (ddx / d) * 340 * power() * t * t; vy[k] += (ddy / d) * 340 * power() * t * t;
        }
        tvY += side * 0.5;
        S.voice('face', 0.5 + 0.4 * strength);
      } else {
        var sd = clamp((x - cx) / (bw * uS / 2), -1, 1);
        if (!free) avel += sd * 0.45;
        S.voice('body', 0.4);
      }
      return true;
    }

    // a hit at one point: the body gets the push; points near the hit get a bit more (a local dent),
    // far points get almost the same as the body, so the picture does not smear as a whole
    function kick(dvx, dvy, x, y) {
      if (!free) {
        cvx += dvx; cvy += dvy;
        var sp = Math.hypot(cvx, cvy);
        if (sp > 2600) { cvx *= 2600 / sp; cvy *= 2600 / sp; }
        avel += ((x - cx) * dvy - (y - cy) * dvx) * 0.0004;
        avel = Math.max(-9, Math.min(9, avel));
      }
      tvY += -dvx * 0.002;
      tvX += dvy * 0.002;
      var rr = pr * 1.6, base = free ? 0 : 0.85;
      for (var k = 0; k < count; k++) {
        var ddx = px[k] - x, ddy = py[k] - y;
        var d = Math.sqrt(ddx * ddx + ddy * ddy);
        var t = Math.max(0, 1 - d / rr);
        var w = base + 0.5 * t * t;
        vx[k] += dvx * w;
        vy[k] += dvy * w;
      }
    }

    /* ---------- input: one path for live touches and for replays ---------- */
    // e = { k: 'down'|'move'|'up'|'cancel'|'leave'|'clear', id, x, y, t (ms), w, h, pt: 'touch'|'mouse'|'pen' }
    var KINDS = { down: 1, move: 1, up: 1, cancel: 1, leave: 1, clear: 1 };
    function input(e) {
      // ignore anything that is not a proper event (a broken file, a strange device)
      if (!isObj(e) || !Object.prototype.hasOwnProperty.call(KINDS, e.k) || !isFinite(e.x) || !isFinite(e.y) || !isFinite(e.t)) return;
      if (!isFinite(e.w)) e.w = 0;
      if (!isFinite(e.h)) e.h = 0;
      if (!isFinite(e.p)) e.p = 0;
      if (paintMode && !replaying) { paintInput(e); return; }   // painting the softness map: not a touch on the body
      if (inputSink) inputSink({ type: 'input', e: e }, stepsDone);
      if (e.k === 'down') onDown(e);
      else if (e.k === 'move') onMove(e);
      else if (e.k === 'up' || e.k === 'cancel') onUp(e);
      else if (e.k === 'leave') { var o = ptrs.get(e.id); if (o && !o.down) ptrs.delete(e.id); }
      else if (e.k === 'clear') { ptrs.forEach(function (q, id) { if (free && fm) fm.up(id, e.t); }); ptrs.clear(); }
    }

    var painting = {};
    function paintInput(e) {
      if (e.k === 'down') { painting[e.id] = true; paintAt(e.x, e.y); }
      else if (e.k === 'move' && painting[e.id]) paintAt(e.x, e.y);
      else if (e.k === 'up' || e.k === 'cancel' || e.k === 'clear') {
        delete painting[e.id];
        if (kPaint) {
          var arr = Array.prototype.map.call(kPaint, function (v) { return Math.round(v * 100) / 100; });
          kPaint = null;
          set('kgrid', arr);
          if (opts.onPaint) opts.onPaint(arr);
        }
      }
    }

    function onDown(e) {
      lastInput = performance.now(); napping = false;
      var inb = inside(e.x, e.y);
      var cr = clamp(Math.max(e.w || 0, e.h || 0) / 34, 0.85, 1.5);   // a bigger fingertip presses a bigger patch
      var pp = +e.p || 0;
      var hasP = e.pt !== 'mouse' && pp > 0 && pp !== 0.5 && pp !== 1;   // a real pressure reading (pen, some phones)
      var o = { x: e.x, y: e.y, t: e.t, vx: 0, vy: 0, down: true, sx: e.x, sy: e.y, inb: inb, mode: 'press', age: 0, cr: cr, gx: 0, gy: 0, alx: 0, aly: 0, p: pp, hasP: hasP };
      ptrs.set(e.id, o);
      if (free && fm) fm.down(e.id, e.x, e.y, e.t);
      if (!inb) { o.mode = free ? 'move' : 'swipe'; return; }
      o.ik = handAt(e.x, e.y) || jointAt(e.x, e.y);   // on a skeleton's hand (or, rev 7, a foot or the head): dragging moves it (IK), not the body
      var pw = power() * (rev >= 2 && hasP ? 0.6 + 0.8 * pp : 1);
      if (MAT) pw *= MAT.kick;               // skin and dough barely jump when touched; rubber and jelly do
      if (human()) {                          // a person: pushed away from the finger, a light dent where it touched
        var dirX = clamp((cx - e.x) / (bw * uS / 2), -1, 1), sh = nudgeShare(e.y);
        if (Math.abs(dirX) < 0.25) dirX = dirX < 0 ? -0.25 : 0.25;                 // the middle: a small push still
        var pwN = power() * (rev >= 2 && hasP ? 0.6 + 0.8 * pp : 1);           // not the material's kick (skin barely jumps; a body still sways)
        nHv += dirX * NUDGE_TAP * sh.hip * pwN; nLv += dirX * NUDGE_TAP * sh.lean * pwN;
        pw *= 0.25;
      }
      var dx = cx - e.x, dy = cy - e.y;
      var d = Math.hypot(dx, dy) || 1;
      kick((dx / d) * 22 * pw, (dy / d) * 22 * pw, e.x, e.y);
      // a tap on one side tips that side away
      var tipK = human() ? 0.25 : 0.8;
      tvY += clamp((e.x - cx) / (bw * uS / 2), -1, 1) * tipK;
      tvX -= clamp((e.y - cy) / (bh * uS / 2), -1, 1) * tipK;
      var r2 = pr * pr * cr * cr, rad = pr * cr;
      for (var k = 0; k < count; k++) {
        var ddx = px[k] - e.x, ddy = py[k] - e.y;
        var d2 = ddx * ddx + ddy * ddy;
        if (d2 >= r2) continue;
        var dd = Math.max(6, Math.sqrt(d2));
        var t = 1 - dd / rad;
        vx[k] += (ddx / dd) * 360 * pw * t * t;
        vy[k] += (ddy / dd) * 360 * pw * t * t;
      }
      if (personTouch(e.x, e.y)) buzz(12); else { S.tap(0.3 + 0.4 * strength); buzz(MAT ? MAT.buzz : 8); }
    }

    function onMove(e) {
      var o = ptrs.get(e.id);
      if (!o) {
        if (e.pt === 'touch') return;
        o = { x: e.x, y: e.y, t: e.t, vx: 0, vy: 0, down: false, mode: 'hover', age: 0, cr: 1 };
        ptrs.set(e.id, o);
        return;
      }
      if (o.hasP && e.p > 0) o.p = +e.p;
      var dt = Math.max(0.004, (e.t - o.t) / 1000);
      var mx = e.x - o.x, my = e.y - o.y;
      if (mx === 0 && my === 0) return;
      o.vx = o.vx * 0.35 + (mx / dt) * 0.65;
      o.vy = o.vy * 0.35 + (my / dt) * 0.65;
      o.x = e.x; o.y = e.y; o.t = e.t;

      if (free && fm && o.down) {
        fm.move(e.id, e.x, e.y, e.t);
        if (o.mode === 'press' && Math.hypot(e.x - o.sx, e.y - o.sy) > 10) o.mode = 'move';
        return;
      }
      if (o.down && o.mode === 'press' && o.ik && Math.hypot(e.x - o.sx, e.y - o.sy) > 10) { o.mode = 'ik'; return; }
      if (o.mode === 'ik') return;
      if (opts.noGrab && o.down && o.mode === 'press' && Math.hypot(e.x - o.sx, e.y - o.sy) > 10) o.mode = 'stroke';   /* the game: stroking, never picking up */
      if (o.down && o.mode === 'press' && Math.hypot(e.x - o.sx, e.y - o.sy) > 10) {
        o.mode = 'grab';                     // dragged from on the body: pick it up at that spot
        o.gx = cx - e.x; o.gy = cy - e.y;
        var l = toLocal(e.x, e.y);
        o.alx = l.x; o.aly = l.y;
      }
      if (o.mode === 'grab' || o.mode === 'press') return;
      touchField(e.x, e.y, mx, my, o.vx * 0.9, o.vy * 0.9, o.down);

      var sp = Math.hypot(o.vx, o.vy);
      if (sp > FLICK_MIN && inside(e.x, e.y)) {
        var ex = sp - FLICK_MIN;
        var sc = (o.down ? 1 : 0.55) * power();
        kick((o.vx / sp) * ex * K_FLICK * sc, (o.vy / sp) * ex * K_FLICK * sc, e.x, e.y);
        if (ex > 400) hitFx(Math.min(1, ex / 2400));
      }
    }

    function onUp(e) {
      var o = ptrs.get(e.id);
      ptrs.delete(e.id);
      if (!o) return;
      if (free && fm) fm.up(e.id, e.t);
      if (o.down && o.mode === 'press' && o.age > 0.25) {          // let go of a long press: it springs back
        var rd = pr * o.cr, pw = Math.min(o.age, 0.9) * power() * (human() ? 0.25 : 1);
        for (var k = 0; k < count; k++) {
          var ex = px[k] - o.x, ey = py[k] - o.y, de = Math.max(8, Math.sqrt(ex * ex + ey * ey));
          if (de > rd) continue;
          var te = 1 - de / rd;
          var popK = (rev >= 2 ? 250 : 400) * (MAT ? MAT.pop : 1);   // rev 2: gentler; skin and dough: almost none
          vx[k] += (ex / de) * popK * pw * te * te; vy[k] += (ey / de) * popK * pw * te * te;
        }
        S.release(0.2 + 0.5 * Math.min(1, o.age));
      }
      if (o.mode === 'grab' && !free && !human()) {
        var fresh = e.t - o.t < 90;   // finger was still moving when it let go: throw it
        var tx = fresh ? o.vx : 0, ty = fresh ? o.vy : 0;
        var sp = Math.hypot(tx, ty);
        if (sp > 200) {
          var m = Math.min(sp, 2800) / sp;
          var thr = rev >= 2 ? 0.7 : 0.8;
          cvx = tx * m * thr; cvy = ty * m * thr;
        }
        tvY += -cvx * 0.001; tvX += cvy * 0.001;
      }
      if (anim.auto && o.down && o.inb && window.Animator) { switchClip('curious'); autoLeft = 3; }   // reacts: looks at you
    }

    // DOM -> normalised input events (rounded, so a replay feeds exactly the same numbers)
    function localPos(ev) {
      var r = canvas.getBoundingClientRect();
      var sx = r.width ? W / r.width : 1, sy = r.height ? H / r.height : 1;   // a scaled canvas (replay view)
      return { x: (ev.clientX - r.left) * sx, y: (ev.clientY - r.top) * sy };
    }
    function domEvent(k, ev) {
      var p = localPos(ev);
      var t = manual ? vclock : ev.timeStamp - tBase;
      return { k: k, id: ev.pointerId, x: r2d(p.x), y: r2d(p.y), t: r2d(t), w: r2d(ev.width || 0), h: r2d(ev.height || 0), pt: ev.pointerType || 'mouse', p: r2d(ev.pressure || 0) };
    }

    canvas.addEventListener('pointerdown', function (ev) {
      if (replaying) return;
      wake();
      S.unlock();
      if (opts.onFirstTouch) opts.onFirstTouch();
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
      input(domEvent('down', ev));
    });
    canvas.addEventListener('pointermove', function (ev) {
      if (replaying) return;
      if (ev.pointerType !== 'touch' || ptrs.has(ev.pointerId)) wake();
      var list = (!manual && ev.getCoalescedEvents && ev.getCoalescedEvents()) || [];
      if (list.length) list.forEach(function (e) { input(domEvent('move', e)); });
      else input(domEvent('move', ev));
    });
    canvas.addEventListener('pointerup', function (ev) { if (!replaying) input(domEvent('up', ev)); });
    canvas.addEventListener('pointercancel', function (ev) { if (!replaying) input(domEvent('cancel', ev)); });
    canvas.addEventListener('pointerleave', function (ev) { if (!replaying) input(domEvent('leave', ev)); });
    canvas.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
    window.addEventListener('blur', function () {
      if (!replaying && ptrs.size) input({ k: 'clear', id: 0, x: 0, y: 0, t: r2d(performance.now() - tBase), w: 0, h: 0, pt: '' });
    });

    /* ---------- render ---------- */
    var sceneQuaked = false;
    function draw() {
      if (liveVideo) pumpVideo();                           // version 40: the video's newest frame (nothing without a video)
      if (scene && (quakeX || quakeY || sceneQuaked)) { paintScene(); sceneQuaked = !!(quakeX || quakeY); }   // v38: the background shakes too
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!count) return;

      var stride = nx + 1;
      var cw = bw / nx, ch = bh / ny;
      for (var j = 0; j <= ny; j++) {
        for (var i = 0; i <= nx; i++) {
          var k = j * stride + i;
          pos[2 * k] = px[k];
          pos[2 * k + 1] = py[k];
          var kr = i < nx ? k + 1 : k - 1;
          var kd = j < ny ? k + stride : k - stride;
          var lr = Math.hypot(px[kr] - px[k], py[kr] - py[k]) / (cw * uS);
          var ld = Math.hypot(px[kd] - px[k], py[kd] - py[k]) / (ch * uS);
          var s = -((lr - 1) + (ld - 1)) * 0.7;
          shade[k] = s > 0.25 ? 0.25 : (s < -0.25 ? -0.25 : s);
          if (MAT) {
            fdAttr[2 * k] = lr < 1 ? 1 - lr : 0;                                    // squeezed along x / y: folds
            fdAttr[2 * k + 1] = ld < 1 ? 1 - ld : 0;
          }
        }
      }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, shBuf);
      gl.bufferData(gl.ARRAY_BUFFER, shade, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, hBuf);
      gl.enableVertexAttribArray(3);
      gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
      if (MAT) {
        gl.bindBuffer(gl.ARRAY_BUFFER, fdBuf);
        gl.bufferData(gl.ARRAY_BUFFER, fdAttr, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(5);
        gl.vertexAttribPointer(5, 2, gl.FLOAT, false, 0, 0);
      } else {                               // classic: no folds
        gl.disableVertexAttribArray(5); gl.vertexAttrib2f(5, 0, 0);
      }
      var nSpots = MAT && fld ? fld.pack(MAT, spotA, spotB) : 0;
      gl.uniform1f(U.u_matOn, MAT ? 1 : 0);
      gl.uniform4f(U.u_mat, MAT ? MAT.sss : 0, MAT ? MAT.folds : 0, MAT ? MAT.tone : 0, MAT ? MAT.dentLight : 0);
      gl.uniform1f(U.u_spotN, nSpots);
      if (nSpots) { gl.uniform4fv(U.u_spotA, spotA); gl.uniform4fv(U.u_spotB, spotB); }
      gl.uniform2f(U.u_bodyPx, bw * uS, bh * uS);
      gl.uniform3f(U.u_L, 0.7025 * Math.cos(lightAz), 0.7025 * Math.sin(lightAz), 0.7117);   // default = the original top-left light
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, hmTex);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(U.u_tex, 0);
      gl.uniform1i(U.u_height, 1);
      gl.uniform2f(U.u_texel, 1 / hmW, 1 / hmH);
      gl.uniform2f(U.u_res, W, H);
      gl.uniform1f(U.u_aspect, aspect);
      gl.uniform1f(U.u_round, roundness);
      gl.uniform2f(U.u_c, cx, cy);
      gl.uniform1f(U.u_f, Math.max(900, 2.4 * Math.max(bw, bh) * uS));
      gl.uniform1f(U.u_ang, ang);
      gl.uniform1f(U.u_q, Q.q);
      gl.uniform1f(U.u_dm, on3d ? depthMode : 0);
      gl.uniform1f(U.u_paint, 0);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, kTex);
      gl.uniform1i(U.u_kmap, 2);
      gl.activeTexture(gl.TEXTURE0);

      // soft contact shadow on the floor: fainter and wider the higher the body is
      var air = clamp((AH - bh * uS / 2 - cy - AD.oy * uS) / 280, 0, 1);
      var sa = (isDark() ? 0.5 : 0.26) * (1 - 0.65 * air);
      gl.uniform1f(U.u_flat, 1);
      gl.uniform1f(U.u_hs, 1);
      gl.uniform1f(U.u_zoff, 0);
      gl.uniform1f(U.u_mode, 1);
      gl.uniform1f(U.u_floor, AH - 2);
      gl.uniform2f(U.u_sh, 1 - 0.12 * air, 0.17);
      // a soft blur made of copies: one in the middle and rings around it (no hard double edge when it is high)
      var ring = Q.q ? 6 : 4, rings = Q.q ? 2 : 1, taps = 1 + ring * rings;
      gl.uniform1f(U.u_shadow, sa / taps);
      var rr = 3 + 12 * air;
      gl.uniform2f(U.u_off, 0, 0);
      gl.drawElements(gl.TRIANGLES, idxLen, gl.UNSIGNED_SHORT, 0);
      for (var rg = 1; rg <= rings; rg++) {
        for (var q = 0; q < ring; q++) {
          var an = (q + rg * 0.5) / ring * Math.PI * 2, rad2 = rr * rg / rings;
          gl.uniform2f(U.u_off, Math.cos(an) * rad2, Math.sin(an) * rad2 * 0.45);
          gl.drawElements(gl.TRIANGLES, idxLen, gl.UNSIGNED_SHORT, 0);
        }
      }
      if (limbs.L || limbs.R) {
        ['L', 'R'].forEach(function (sd) { drawLimb(sd, { ring: ring, rings: rings, rr: rr }); });
        // back to the body's own buffers for the rest of the frame
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, shBuf); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, hBuf); gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
        if (MAT) { gl.bindBuffer(gl.ARRAY_BUFFER, fdBuf); gl.enableVertexAttribArray(5); gl.vertexAttribPointer(5, 2, gl.FLOAT, false, 0, 0); }
        else { gl.disableVertexAttribArray(5); gl.vertexAttrib2f(5, 0, 0); }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      }

      gl.uniform1f(U.u_flat, 0);
      gl.uniform2f(U.u_off, 0, 0);
      var d3 = on3d && !editing;
      gl.uniform2f(U.u_tilt, d3 ? tiltX : 0, d3 ? tiltY : 0);
      gl.uniform2f(U.u_tiltF, d3 ? tiltX : 0, d3 ? tiltY : 0);
      gl.uniform1f(U.u_depth, d3 ? depthAmp * (depthMode ? 1.5 : 1) * Math.min(bw, bh) * uS : 0);
      gl.uniform1f(U.u_nscale, on3d ? nscale * (depthMode ? 1.25 : 1) : 0);
      gl.uniform1f(U.u_gloss, gloss * (MAT ? MAT.gloss : 1));
      // a thin edge: a couple of copies stacked just behind. Straight on they hide; tilted, a slim side shows.
      var layers = lowPower ? Math.min(1, Q.layers) : Q.layers;
      if (on3d && layers) {
        var thick = Math.min(bw, bh) * uS * 0.03;
        gl.uniform1f(U.u_hs, 0);
        gl.uniform1f(U.u_mode, 2);
        for (var ly2 = layers; ly2 >= 1; ly2--) {
          gl.uniform1f(U.u_zoff, -thick * ly2 / layers);
          gl.drawElements(gl.TRIANGLES, idxLen, gl.UNSIGNED_SHORT, 0);
        }
      }
      gl.uniform1f(U.u_hs, 1);
      gl.uniform1f(U.u_zoff, 0);
      gl.uniform1f(U.u_mode, 0);
      gl.uniform1f(U.u_paint, paintMode ? 1 : paintView);
      gl.drawElements(gl.TRIANGLES, idxLen, gl.UNSIGNED_SHORT, 0);
      drawLimbs();
    }

    /* ---------- export: photo, and frames for the video recorder ---------- */
    function paintBackground(x2, w, h, scale, offX, offY) {
      x2.fillStyle = getComputedStyle(stage).backgroundColor || '#FAF9FC';
      x2.fillRect(0, 0, w, h);
      x2.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--dot').trim() || '#cccccc';
      var st = 24 * scale;
      var x0 = 12 * scale - ((offX * scale) % st), y0 = 12 * scale - ((offY * scale) % st);
      for (var yy = y0; yy < h; yy += st) {
        for (var xx = x0; xx < w; xx += st) {
          x2.beginPath(); x2.arc(xx, yy, 1.2 * scale, 0, Math.PI * 2); x2.fill();
        }
      }
      var r = !editing ? sceneRect() : null;
      if (r) x2.drawImage(scene.img, (r.x + quakeX - offX) * scale, (r.y + quakeY - offY) * scale, r.w * scale, r.h * scale);
    }

    // a still picture of the current moment, sharper than the screen. opts:
    //   scale (pixels per screen point, default 3), transparent (PNG without background),
    //   crop (just the character with a margin, instead of the whole stage)
    function exportImage(o) {
      o = o || {};
      var maxDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) || [4096, 4096];
      var limit = Math.min(maxDims[0], maxDims[1], 4096);
      var sc = Math.min(o.scale || 3, limit / Math.max(W, H));
      var oldW = canvas.width, oldH = canvas.height;
      canvas.width = Math.round(W * sc);
      canvas.height = Math.round(H * sc);
      draw();
      var sx = 0, sy = 0, sw = W, sh = H;
      if (o.crop && count) {
        var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
        for (var k = 0; k < count; k++) {
          if (px[k] < minX) minX = px[k];
          if (px[k] > maxX) maxX = px[k];
          if (py[k] < minY) minY = py[k];
          if (py[k] > maxY) maxY = py[k];
        }
        var mg = 0.12 * Math.max(maxX - minX, maxY - minY) + 10;
        sx = Math.max(0, minX - mg); sy = Math.max(0, minY - mg);
        sw = Math.min(W, maxX + mg) - sx;
        sh = Math.min(H, Math.max(maxY + mg, AH + 8)) - sy;
      }
      var out = document.createElement('canvas');
      out.width = Math.max(1, Math.round(sw * sc));
      out.height = Math.max(1, Math.round(sh * sc));
      var x2 = out.getContext('2d');
      if (!o.transparent) paintBackground(x2, out.width, out.height, sc, sx, sy);
      x2.drawImage(canvas, sx * sc, sy * sc, sw * sc, sh * sc, 0, 0, out.width, out.height);
      canvas.width = oldW; canvas.height = oldH;
      draw();
      return out;
    }

    var recCanvas = null, rctx = null, bgCv = null;
    function prepCapture() {
      recCanvas = recCanvas || document.createElement('canvas');
      recCanvas.width = canvas.width;
      recCanvas.height = canvas.height;
      rctx = recCanvas.getContext('2d');
      bgCv = bgCv || document.createElement('canvas');
      bgCv.width = canvas.width;
      bgCv.height = canvas.height;
      paintBackground(bgCv.getContext('2d'), bgCv.width, bgCv.height, canvas.width / Math.max(1, W), 0, 0);
      return recCanvas;
    }
    function compositeFrame() {
      if (!rctx) return;
      rctx.drawImage(bgCv, 0, 0, recCanvas.width, recCanvas.height);
      rctx.drawImage(canvas, 0, 0, recCanvas.width, recCanvas.height);
    }
    function snapshot() {
      prepCapture();
      draw();
      compositeFrame();
      return recCanvas;
    }

    /* ---------- loop, sleep, quality ---------- */
    var perfOn = false, perfLast = 0, perfFps = 60, perfStep = 0, perfDraw = 0, perfFrame = 0, perfDrop = 0;
    var last = performance.now(), acc = 0, frameAvg = 1 / 60, slowT = 0, qualityCool = 0, qualityLocked = false;
    function schedule() { if (!raf) raf = requestAnimationFrame(frame); }

    function wake() {
      idleT = 0;
      clearTimeout(wakeTimer);
      if (sleeping) {
        sleeping = false;
        S.wake();
        if (opts.onSleep) opts.onSleep(false);
      }
      last = performance.now(); acc = 0;
      schedule();
    }

    function settled() {
      var held = false;
      ptrs.forEach(function (o) { if (o.down) held = true; });
      if (held) return false;
      if (free && fm && fm.moving()) return false;
      if (quakeN < quakeTotal) return false;
      return maxVel2 < 64 && maxDev2 < 6 &&
        Math.abs(cvx) < 6 && Math.abs(cvy) < 6 && Math.abs(avel) < 0.02 &&
        Math.abs(tvX) < 0.02 && Math.abs(tvY) < 0.02 &&
        Math.abs(tiltX) < 0.01 && Math.abs(tiltY) < 0.01 && (free || Math.abs(ang) < 0.01) &&
        Math.abs(hVel) < 0.02 && Math.abs(hAng) < 0.005 && aW < 0.002 && anim.clip === 'none' && !anim.auto &&
        !(MAT && fld && fld.active()) && !(PM && life && !rbind && !reduceMotion);
    }

    // Nothing is moving: stop the loop completely (no CPU, no GPU, audio suspended). A touch, a
    // resize, a new picture, a setting or the next "alive" twitch wakes it up again.
    function sleepNow() {
      sleeping = true;
      S.gel(0);
      S.sleep();
      if (opts.onSleep) opts.onSleep(true);
      if (alive && !free) wakeTimer = setTimeout(function () { lifeT = 0; wake(); }, Math.max(400, lifeT * 1000));
    }

    // context lost (version 26): phones drop the graphics card when memory is short or the app goes to the
    // back. Wait (no drawing, no errors), then rebuild every texture and buffer from what the engine kept on the
    // CPU (the picture, the heights, the arm layers) and carry on from the same pose.
    var glLost = false;
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();                                   // tells the browser we want the card back
      glLost = true;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      say('الشاشة فصلت لحظة… ترجع لحالها', 6000);
    });
    canvas.addEventListener('webglcontextrestored', function () {
      try {
        initGL();
        if (tc.width > 2) {
          uploadTex();
          buildHeight(lastRound);
          ['L', 'R'].forEach(function (sd) {
            var L = limbs[sd];
            if (L && L.src) { L.tex = limbTex(L.src); L.mesh = null; L.bufs = null; }
          });
          build(true);
        }
        glLost = false;
        say('رجعت الشاشة', 2500);
      } catch (err) { console.error(err); glLost = false; }
      wake();
    });

    // continuous squish sound: louder the deeper the press or the faster the drag
    function updateGel(now) {
      var lvl = 0, tone = 0.3;
      ptrs.forEach(function (o) {
        if (!o.down) return;
        if (o.lastX !== o.x || o.lastY !== o.y) { o.seen = now; o.lastX = o.x; o.lastY = o.y; }
        if (o.mode === 'press' && o.inb) lvl = Math.max(lvl, Math.min(1, o.age / 0.5) * (0.35 + 0.4 * strength));
        else if (o.mode === 'grab' || o.mode === 'move' || o.mode === 'ik') {
          var sp = Math.min(1, Math.hypot(o.vx, o.vy) / 1600);
          if (now - (o.seen || 0) > 120) sp = 0;
          lvl = Math.max(lvl, sp * 0.7); tone = 0.3 + sp * 0.5;
        }
      });
      var wob = Math.min(1, Math.max(0, Math.sqrt(maxDev2) - 6) / 40) * 0.35;   // small wobbles stay silent
      S.gel(Math.max(lvl, wob), Math.max(tone, lvl));
    }

    function frame(now) {
      raf = 0;
      if (glLost) return;                                   // the card is gone: wait for webglcontextrestored
      if (manual) { last = now; schedule(); return; }
      if (document.hidden) { sleeping = true; S.sleep(); return; }   // visibilitychange wakes it
      if (lowPower) { skipFrame = !skipFrame; if (skipFrame) { schedule(); return; } }   // 30 fps
      var looping = (rig && rig.clip !== 'none') || anim.clip !== 'none' || anim.auto;
      if (halfRate && looping && !ptrs.size && !lowPower) { halfSkip = !halfSkip; if (halfSkip) { schedule(); return; } }
      if (napAfter > 0 && looping && !replaying && !ptrs.size && lastInput && now - lastInput > napAfter * 1000) {
        napping = true; sleepNow(); return;                 // smart sleep: nobody is watching it dance
      }
      var dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05;
      var n = 0, t0 = perfOn ? performance.now() : 0;
      if (!paused && !editing) {
        acc += dt;
        while (acc >= STEP && n < 6) {
          if (count) step(STEP);
          acc -= STEP; n++;
        }
        if (n === 6) { acc = 0; perfDrop++; }
      }
      var t1 = perfOn ? performance.now() : 0;
      draw();
      if (perfOn) {                       // the on-screen performance meter (measured on your own device)
        var t2 = performance.now(), rawDt = (now - (perfLast || now)) / 1000;
        perfLast = now;
        if (rawDt > 0) perfFps += (1 / rawDt - perfFps) * 0.1;
        perfStep += ((n ? (t1 - t0) / n : 0) - perfStep) * 0.1;
        perfDraw += ((t2 - t1) - perfDraw) * 0.1;
        perfFrame += ((t2 - t0) - perfFrame) * 0.1;
      }
      updateGel(now);
      if (opts.onFrame) opts.onFrame();
      adaptQuality(dt);
      if (paused || editing) { S.gel(0); return; }   // replay paused or joints being edited: hold the frame
      if (sleepEnabled && !keepAwake && !reduceMotion && count && n > 0 && settled() && !videoPlaying()) {   // a playing video keeps it drawing
        idleT += dt;
        if (idleT > 1.2) { sleepNow(); return; }
      } else idleT = 0;
      schedule();
    }

    // automatic quality: if frames stay slow for 3 seconds, step down one level (never up by itself)
    function adaptQuality(dt) {
      if (qualityPref !== 'auto' || qualityLocked || quality === 'low') return;
      frameAvg += (dt - frameAvg) * 0.05;
      qualityCool -= dt;
      if (frameAvg > 1 / 40) slowT += dt; else slowT = Math.max(0, slowT - dt);
      if (slowT > 3 && qualityCool <= 0) {
        slowT = 0; qualityCool = 6;
        applyQuality(ORDER[ORDER.indexOf(quality) - 1]);
        if (opts.onQuality) opts.onQuality(quality, true);
      }
    }
    function applyQuality(level) {
      if (!QUALITY[level]) return;
      quality = level; Q = QUALITY[level];
      resize(true, true);
      if (tc.width > 2) { buildHeight(isCard); build(true); }
    }

    document.addEventListener('visibilitychange', function () { if (!document.hidden) wake(); });

    // tilting the phone tilts the character (Android: works straight away; iPhone: asks for permission)
    function onOrient(ev) {
      if (ev.beta == null || ev.gamma == null) return;
      if (gyro.bx === null) { gyro.bx = ev.beta; gyro.by = ev.gamma; }
      gyro.x = clamp((ev.beta - gyro.bx) / 45, -1, 1) * 0.35;
      gyro.y = clamp((ev.gamma - gyro.by) / 45, -1, 1) * 0.35;
      wake();
    }
    function setGyro(on) {
      gyroOn = !!on; gyro.bx = gyro.by = null; gyro.x = gyro.y = 0;
      if (gyroOn) window.addEventListener('deviceorientation', onOrient);
      else window.removeEventListener('deviceorientation', onOrient);
      wake();
    }

    // low battery: lighter rendering and 30 fps (the browser may not expose the battery; then nothing changes)
    function applyPower(low) {
      if (low === lowPower) return;
      lowPower = low;
      resize(true);
      if (opts.onPower) opts.onPower(low);
      wake();
    }
    try {
      if (navigator.getBattery) {
        navigator.getBattery().then(function (bat) {
          var check = function () { applyPower(!bat.charging && bat.level <= 0.2); };
          bat.addEventListener('levelchange', check);
          bat.addEventListener('chargingchange', check);
          check();
        }).catch(function () { /* optional */ });
      }
    } catch (e) { /* optional */ }

    function resize(force, noRebuild) {
      dpr = Math.min(window.devicePixelRatio || 1, Q.dpr, lowPower ? 1 : 3);
      var w, h;
      if (virt) {
        w = virt.w; h = virt.h;
        var f = Math.min(stage.clientWidth / w, stage.clientHeight / h);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        canvas.style.inset = 'auto';
        canvas.style.left = ((stage.clientWidth - w * f) / 2) + 'px';
        canvas.style.top = ((stage.clientHeight - h * f) / 2) + 'px';
        canvas.style.transformOrigin = '0 0';
        canvas.style.transform = 'scale(' + f + ')';
      } else {
        w = stage.clientWidth; h = stage.clientHeight;
      }
      if (force !== true && w === W && h === H && canvas.width === Math.round(w * dpr)) return;
      W = w; H = h;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      if (tc.width > 2 && !noRebuild) build(true);          // keep where the body is; the walls bring it inside
      paintScene();
      wake();
    }
    function setVirtualSize(v) {
      virt = v ? { w: v.w, h: v.h } : null;
      if (!virt) {
        ['width', 'height', 'inset', 'left', 'top', 'transform', 'transformOrigin'].forEach(function (p) { canvas.style[p] = ''; });
      }
      resize(true);
    }

    resize();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(function () { resize(); }).observe(stage);
    else window.addEventListener('resize', function () { resize(); });
    schedule();

    /* ---------- settings (every change goes through set(), so a recording can replay it) ---------- */
    // values can come from a motion file, so every one is checked: a missing or bad value means
    // "keep a safe default", never an exception inside the physics loop
    function num(v, lo, hi, def) { return (typeof v === 'number' && isFinite(v)) ? clamp(v, lo, hi) : def; }
    function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
    function cleanRegions(v) {
      if (!Array.isArray(v)) return [];
      return v.slice(0, 4).filter(function (r) {
        return isObj(r) && [r.u, r.v, r.ru, r.rv].every(function (x) { return typeof x === 'number' && isFinite(x); }) &&
          r.u >= 0 && r.u <= 1 && r.v >= 0 && r.v <= 1 && r.ru > 0.01 && r.ru <= 1 && r.rv > 0.01 && r.rv <= 1;
      }).map(function (r) { return { u: r.u, v: r.v, ru: r.ru, rv: r.rv }; });
    }
    // a skeleton from a file or the UI: 15 joints in picture units, a known clip, sane numbers; anything else = no skeleton
    function cleanRig(v) {
      try { return cleanRig0(v); } catch (e) { return null; }      // a getter that throws, a proxy...: no rig
    }
    function cleanRig0(v) {
      if (!isObj(v) || !window.Rig || !Array.isArray(v.joints) || v.joints.length !== Rig.JOINTS.length) return null;
      var joints = [];
      for (var i = 0; i < v.joints.length; i++) {
        var p = v.joints[i];
        if (!Array.isArray(p) || p.length !== 2) return null;
        var u = num(p[0], -0.25, 1.25, NaN), w = num(p[1], -0.25, 1.25, NaN);
        if (u !== p[0] || w !== p[1]) return null;
        joints.push([Math.round(u * 10000) / 10000, Math.round(w * 10000) / 10000]);
      }
      var clip = (typeof v.clip === 'string' && window.RigClips && Object.prototype.hasOwnProperty.call(RigClips.CLIPS, v.clip)) ? v.clip : 'none';
      return { joints: joints, clip: clip, amount: num(v.amount, 0, 1, 0.8), speed: num(v.speed, 0.25, 2.5, 1) };
    }
    function applySetting(key, v) {
      switch (key) {
        case 'gravity':
          gravityOn = !!v;
          if (rev >= 2 && !free) setAnchor(cx, cy);        // stays where it is; gravity changes how it moves, not where
          setHome();
          break;
        case 'alive': alive = !!v; lifeT = 1; break;
        case 'quake': quakeAmp = clamp(+v || 0, 0, 1); quakeN = 0; quakeTotal = quakeAmp > 0 ? Math.round(QUAKE_S / STEP) : 0; wake(); break;
        case 'threeD': on3d = !!v; break;
        case 'free':
          free = !!v;
          if (free && fm) { fm.start({ x: cx, y: cy, ang: ang, scale: uS }); cvx = cvy = 0; }
          if (!free && rev >= 2) { setAnchor(cx, cy); cvx = cvy = 0; }    // back to normal: rests where you left it
          ptrs.forEach(function (o) { if (o.down) o.mode = free ? 'move' : 'swipe'; });
          break;
        case 'relief': relief = num(v, 0, 1.2, relief); if (tc.width > 2) { buildHeight(isCard); refreshHeights(); } break;
        case 'softness':
          softness = num(v, 0, 1, softness);
          KS = 420 - 340 * softness;
          CD = 6.4 - 4.6 * softness;
          KN = 900 + 700 * (1 - softness);
          gloss = 0.16 + 0.3 * softness;               // softer = a little wetter, never mirror-like
          break;
        case 'strength': strength = num(v, 0, 1, strength); break;
        case 'material':
          if (!isObj(v)) break;
          gScale = num(v.gScale, 0.3, 3, gScale);
          if (v.pitch != null) S.setPitch(num(v.pitch, 0.5, 1.8, 1));
          setHome();
          break;
        case 'regions': regions = cleanRegions(v); faceTaps = []; computeHead(); computePortrait(); break;
        case 'rev': {
          var oldRev = rev;
          rev = v === 1 ? 1 : (v === 3 ? 3 : (v === 4 ? 4 : (v === 5 ? 5 : (v === 6 ? 6 : (v === 7 ? 7 : 2)))));   // 3 = 2 + the skeleton mask without the browser's scaler; 4 = 3 + hands resting on the body stay there
          REST = rev >= 2 ? 0.42 : 0.55; if (rev < 2) { dampMul = massMul = 1; } setHome();
          if (oldRev !== rev && (oldRev >= 3) !== (rev >= 3) && rigOn() && count) { rigMask = null; build(true); }
          else if (oldRev !== rev && (oldRev >= 4) !== (rev >= 4) && skel) setRelative();
          break;
        }
        case 'damping': damping = num(v, 0, 1, 0.5); dampMul = 0.4 + 1.2 * damping; break;    // 0.5 = 1x
        case 'mass': mass = num(v, 0, 1, 0.5); massMul = 0.5 + mass; break;                    // 0.5 = 1x
        case 'kgrid':
          kGrid = new Float32Array(KGN * KGN).fill(1);
          if (Array.isArray(v) && v.length === KGN * KGN) for (var gi = 0; gi < v.length; gi++) kGrid[gi] = num(v[gi], 0.2, 4, 1);
          computeKV();
          break;
        case 'anim':
          if (!isObj(v)) v = {};
          var known = window.Animator && typeof v.clip === 'string' && Object.prototype.hasOwnProperty.call(Animator.CLIPS, v.clip);
          anim = { clip: known ? v.clip : 'none', auto: !!v.auto && !!window.Animator, speed: num(v.speed, 0.25, 2.5, 1), amount: num(v.amount, 0, 1, 0.6) };
          if (anim.auto) { autoLeft = 0; if (anim.clip !== 'none') switchClip(anim.clip); }
          else switchClip(anim.clip);
          break;
        case 'depth': depthMode = v ? 1 : 0; break;
        case 'size': {                         // version 28: the picture's size on the stage (rebuilds the mesh, keeps its place)
          var ns = num(v, 0.6, 1.6, 1);
          if (ns !== picSize) { picSize = ns; if (count) build(true); }
          break;
        }
        case 'rig': {
          var cr = cleanRig(v);
          if (JSON.stringify(cr) === JSON.stringify(rig)) break;
          var clipChanged = !cr || !rig || cr.clip !== rig.clip;
          var structural = !cr || !rig || JSON.stringify(cr.joints) !== JSON.stringify(rig.joints);
          if (clipChanged && !structural && cr && rig && rigRaise && fadeClip(rig.clip, cr.clip)) {
            fadeFrom = Float64Array.from(rigRaise); fadeU = 0; fadeRoot = [lastRoot[0], lastRoot[1]];
          } else if (clipChanged) fadeFrom = null;
          rig = cr;
          if (clipChanged) rigT = 0;
          if (structural) { faceTaps = []; build(true); }       // a new mesh density and a new binding
          break;
        }
        case 'life': {                         // alive 3D (portrait.js); anything odd = off
          var lv = window.Portrait ? Portrait.clean(v) : null;
          if (JSON.stringify(lv) === JSON.stringify(life)) break;
          var onChanged = !lv !== !life;
          life = lv;
          if (onChanged) { pyaw = pyawV = ppit = ppitV = pbreath = 0; if (!rigOn()) build(true); else computePortrait(); }
          break;
        }
        case 'skin': {                         // what the body is made of (skin.js); anything unknown = classic
          var nm = (typeof v === 'string' && window.Skin && Skin.has(v)) ? v : 'classic';
          if (nm === skinName) break;
          var oldGrid = MAT ? MAT.grid : 1;
          skinName = nm; MAT = window.Skin ? Skin.get(nm) : null;
          if (S.setMaterial) S.setMaterial(MAT ? MAT.sound : null);
          if ((MAT ? MAT.grid : 1) !== oldGrid && !rigOn()) build(true);      // finer mesh for dimples and folds
          else { if (fld) fld.reset(); if (cmX) { cmX.fill(0); cmY.fill(0); } }
          break;
        }
        case 'anchor': if (isObj(v) && num(v.x, -1e5, 1e5, NaN) === v.x && num(v.y, -1e5, 1e5, NaN) === v.y) setAnchor(v.x, v.y); break;
        case 'reset':
          if (free && fm) { fm.home({ x: W / 2, y: AH / 2 }, 0.45); tvX = tvY = 0; }
          else resetBody();
          break;
        case 'dummy': break;
      }
      wake();
    }
    function set(key, v) {
      if (inputSink) inputSink({ type: 'set', key: key, v: v }, stepsDone);
      applySetting(key, v);
    }

    function settings() {
      return {
        gravity: gravityOn, alive: alive, threeD: on3d, free: free, relief: relief,
        softness: softness, strength: strength, material: { gScale: gScale },
        regions: regions, quality: quality, reduceMotion: reduceMotion,
        rev: rev, damping: damping, mass: mass, depth: depthMode, size: picSize,
        kgrid: Array.prototype.map.call(kGrid, function (v) { return Math.round(v * 100) / 100; }),
        anim: { clip: anim.clip, auto: anim.auto, speed: anim.speed, amount: anim.amount },
        anchor: { x: anchorX, y: anchorY },
        rig: rig ? JSON.parse(JSON.stringify(rig)) : null,
        skin: skinName,
        life: life ? JSON.parse(JSON.stringify(life)) : null
      };
    }
    function checksum() {
      var s = 0;
      for (var k = 0; k < count; k++) s += px[k] * ((k % 7) + 1) + py[k] * ((k % 5) + 1);
      return s.toFixed(3) + '|' + cx.toFixed(3) + '|' + cy.toFixed(3);
    }

    return {
      canvas: canvas,
      setSource: function (a, b, c, d) { setSource(a, b, c, d); wake(); },
      sourceCanvas: function () { return tc; },
      setLimbLayer: setLimbLayer,
      limbInfo: function () { var o = {}; ['L', 'R'].forEach(function (sd) { o[sd] = limbs[sd] ? { mesh: !!limbs[sd].mesh, vertices: limbs[sd].mesh ? limbs[sd].mesh.n : 0 } : null; }); return o; },
      setScene: setScene,
      getScene: function () { return scene ? { img: scene.img, box: { x: scene.box.x, y: scene.box.y, w: scene.box.w, h: scene.box.h } } : null; },
      sceneRect: function () { var r = sceneRect(); return r && !editing ? r : null; },
      sourceRound: function () { return roundness > 0; },
      reset: function () { set('reset', true); },
      setGravity: function (on) { set('gravity', !!on); },
      quake: function (v) { set('quake', v == null ? 1 : clamp(+v || 0, 0, 1)); },   // v38: an earthquake (4 s)
      quaking: function () { return quakeN < quakeTotal; },
      setSound: function (on) { S.setMuted(!on); },
      setAlive: function (on) { set('alive', !!on); },
      isAlive: function () { return alive; },
      set3D: function (on) { set('threeD', !!on); },
      setFree: function (on) { set('free', !!on); },
      isFree: function () { return free; },
      setRegions: function (list) { set('regions', list || []); },
      hasPerson: function () { return regions.length > 0; },
      setRelief: function (v) { set('relief', v); },
      setSoftness: function (s) { set('softness', s); },
      setStrength: function (s) { set('strength', s); },
      setMaterial: function (m) { set('material', { gScale: m.gScale, pitch: m.pitch }); },
      setHaptics: function (on) { haptics = !!on; },
      // skeleton: { joints: [[u, v] x 15], clip: 'none' | 'wave', amount, speed } or null to remove it
      setRig: function (v) { set('rig', v); return !!rig; },
      // material: 'skin' | 'silicone' | 'rubber' | 'jelly' | 'dough' | 'classic' (recorded with a motion)
      setSkin: function (n) { set('skin', n); return skinName; },
      // alive 3D: { on: true, breath, head, look, depth } (0..1) or null; recorded with a motion
      setLife: function (v) { set('life', v); return life ? JSON.parse(JSON.stringify(life)) : null; },
      getLife: function () { return life ? JSON.parse(JSON.stringify(life)) : null; },
      // the watchdog's reading since the last call (then the counters start again)
      health: function () {
        var h = { steps: hSteps, strainStuck: hSat, resets: hNan, pinned: hPinN ? hPin / hPinN : 0, rig: !!rbind, life: !!(PM && life && !rbind) };
        hSteps = hSat = hNan = 0; hPin = 0; hPinN = 0;
        return h;
      },
      lifeInfo: function () { return { on: !!(PM && life && !rbind), yaw: pyaw, pitch: ppit, breath: pbreath, model: PM ? { hx: PM.hx, hy: PM.hy, rx: PM.rx, ry: PM.ry, px: PM.px, py: PM.py } : null }; },
      // the light's direction for the shading, 0..1 around the picture (0.5 = top left, as before). Only the look:
      // not recorded, nothing in the physics changes
      setLight: function (v) { lightAz = -2.256 + (num(v, 0, 1, 0.5) - 0.5) * Math.PI * 2; draw(); },
      getSkin: function () { return skinName; },
      skinInfo: function () {
        var o = { name: skinName, on: !!MAT, grid: [nx, ny], spots: [], maxDepth: 0, minDepth: 0, blanch: 0, flush: 0, active: false, creep: 0 };
        for (var k = 0; k < count; k++) { var c = Math.abs(cmX[k]) + Math.abs(cmY[k]); if (c > o.creep) o.creep = c; }
        if (!fld) return o;
        fld.list.forEach(function (sp) {
          o.spots.push({ u: sp.u, v: sp.v, z: sp.z, rad: sp.rad, held: sp.held, acc: sp.acc });
          if (sp.z > o.maxDepth) o.maxDepth = sp.z; if (sp.z < o.minDepth) o.minDepth = sp.z;
          o.blanch = Math.max(o.blanch, Math.min(1, sp.press * 1.3)); o.flush = Math.max(o.flush, sp.acc);
        });
        o.active = fld.active();
        return o;
      },
      getRig: function () { return rig ? JSON.parse(JSON.stringify(rig)) : null; },
      rigInfo: function () {
        if (!rbind) return null;
        var tops = {};
        for (var k = 0; k < count; k++) if (rbind.act[k]) { var t = Rig.BONES[rbind.top[k]].name; tops[t] = (tops[t] || 0) + 1; }
        return { points: count, active: rbind.active, grid: [nx, ny], perBone: tops, raise: Array.from(rigRaise),
          contacts: { L: rigContact.L ? Rig.BONES[rigContact.L.bone].name : null, R: rigContact.R ? Rig.BONES[rigContact.R.bone].name : null }, relative: rigRelative,
          joints: Rig.jointPositions(skel, rigTr), lims: skel.bones.map(function (b) { return [b.lo, b.hi]; }), bone: Array.from(rbind.bone), weight: Array.from(rbind.weight), act: Array.from(rbind.act), conn: Array.from(rbind.conn), nx: nx, ny: ny };
      },
      // version 37: with the arms as their own layers the texture has no arms; the silhouette is the whole figure
      silhouette: function () {
        if (!limbs.L && !limbs.R) return Pose.boxMask(tc, 128);
        var c = document.createElement('canvas'); c.width = tc.width; c.height = tc.height;
        var x = c.getContext('2d'); x.drawImage(tc, 0, 0);
        ['L', 'R'].forEach(function (sd) { if (limbs[sd] && limbs[sd].src) x.drawImage(limbs[sd].src, 0, 0); });
        return Pose.boxMask(c, 128);
      },
      // joint editing: the body is frozen straight in the middle (no physics, no 3D shift)
      // and zoomed so the body (not the whole picture) fills the stage: the dots are easier to place
      // bottomInset: CSS px at the bottom covered by the editing bar (the body is fitted above it)
      setEditing: function (on, bottomInset) {
        on = !!on;
        if (on === editing || !count) { editing = on && !!count; return; }
        editing = on;
        if (editing) {
          preEdit = { x: cx, y: cy, ang: ang, scale: uS };
          var m = Pose.mask(tc, 128), b = m.bbox, s = 1, fu = 0.5, fv = 0.5;
          if (b) {
            var fw = (b.x1 - b.x0 + 1) / m.w, fh = (b.y1 - b.y0 + 1) / m.h;
            fu = (b.x0 + b.x1 + 1) / 2 / m.w; fv = (b.y0 + b.y1 + 1) / 2 / m.h;
            var room = Math.max(H * 0.4, H - clamp(num(bottomInset, 0, H, 0), 0, H * 0.6));   // the shelf is hidden while editing
            s = clamp(Math.min(W * 0.86 / (fw * bw), room * 0.9 / (fh * bh)), 0.6, 3.5);
          }
          var midY = Math.max(H * 0.4, H - clamp(num(bottomInset, 0, H, 0), 0, H * 0.6)) / 2;
          restPose({ x: W / 2 - (fu - 0.5) * bw * s, y: midY - (fv - 0.5) * bh * s, ang: 0, scale: s });
          tiltX = tiltY = tvX = tvY = 0; draw();
        } else if (preEdit) {
          restPose({ x: preEdit.x, y: preEdit.y, ang: preEdit.ang, scale: preEdit.scale }); preEdit = null; draw();
        }
        paintScene();
        wake();
      },
      // picture units -> position on the canvas (CSS px), valid while editing
      uvToScreen: function (u, v) { return { x: cx + (u - 0.5) * bw * uS, y: cy + (v - 0.5) * bh * uS }; },
      screenToUv: function (x, y) { return { u: (x - cx) / (bw * uS) + 0.5, v: (y - cy) / (bh * uS) + 0.5 }; },
      setPerf: function (on) { perfOn = !!on; perfLast = 0; perfDrop = 0; wake(); },
      perf: function () {
        return { fps: perfFps, stepMs: perfStep, drawMs: perfDraw, frameMs: perfFrame, dropped: perfDrop,
          points: count, quality: quality, dpr: dpr, px: canvas.width + '×' + canvas.height, sleeping: sleeping };
      },
      setDamping: function (v) { set('damping', v); },
      setMass: function (v) { set('mass', v); },
      setAnim: function (o) { set('anim', { clip: o.clip, auto: !!o.auto, speed: o.speed, amount: o.amount }); },
      setSize: function (v) { set('size', v); wake(); },
      getSize: function () { return picSize; },
      getAnim: function () { return { clip: anim.clip, auto: anim.auto, speed: anim.speed, amount: anim.amount, playing: aClip }; },
      suggestMoves: function () { return window.Animator ? Animator.suggest(profile()) : []; },
      setDepthMode: function (on) { set('depth', on ? 1 : 0); },
      setGyro: function (on) { setGyro(on); },
      // painting the softness map: mode 'soft' | 'stiff' | 'lock' | 'erase' | null (off)
      setPaintMode: function (m) { paintMode = m || null; painting = {}; kPaint = null; uploadK(kGrid); wake(); },
      setBrush: function (r) { brush = clamp(r, 0.04, 0.4); },
      clearPaint: function () { set('kgrid', null); },
      showPaint: function (on) { paintView = on ? 1 : 0; wake(); },
      paintStats: function () { var lo = 0, hi = 0; for (var i = 0; i < kGrid.length; i++) { if (kGrid[i] < 0.95) lo++; else if (kGrid[i] > 1.05) hi++; } return { softer: lo, stiffer: hi }; },
      setQuality: function (level) {
        qualityPref = level;
        applyQuality(level === 'auto' ? autoQuality() : level);
        return quality;
      },
      getQuality: function () { return { pref: qualityPref, level: quality }; },
      // manual stepping: pointer speeds then use this virtual clock instead of the real one
      setManual: function (on) { manual = !!on; vclock = 0; acc = 0; },
      advance: function (dt, doDraw) {
        vclock += dt * 1000;
        acc += dt;
        var n = 0;
        while (acc >= STEP && n < 40) { if (count) step(STEP); acc -= STEP; n++; }
        if (doDraw !== false) draw();
      },
      setKeepAwake: function (on) { keepAwake = !!on; wake(); },
      // version 40: the interactive video: a <video> whose frames become the picture (null = a still picture again)
      setVideo: setVideo,
      setFrameHook: setFrameHook,
      setNoCull: function (on) { noCull = !!on; },
      hasVideo: function () { return !!liveVideo; },
      setSleepEnabled: function (on) { sleepEnabled = !!on; wake(); },
      // smart sleep (app): seconds without a touch before a playing move pauses (0 = never); 30 fps while one plays
      setNap: function (sec) { napAfter = sec > 0 ? sec : 0; lastInput = performance.now(); },
      poke: function () { lastInput = performance.now(); if (napping) { napping = false; wake(); } },
      isNapping: function () { return napping; },
      setHalfRate: function (on) { halfRate = !!on; },
      isSleeping: function () { return sleeping; },
      state: function () {
        return { uS: uS, ang: ang, free: free, sleeping: sleeping, lowPower: lowPower, cx: cx, cy: cy, W: W, H: H, AH: AH,
          bw: bw, bh: bh, tiltX: tiltX, tiltY: tiltY, quality: quality, steps: stepsDone, count: count, headAng: hAng, nudge: [nH, nL] };
      },
      // for tests: how far each point is from its resting place
      deviations: function () {
        var out = [];
        for (var k = 0; k < count; k++) out.push([rx[k], ry[k], Math.hypot(dxA[k], dyA[k])]);
        return out;
      },
      exportImage: exportImage,
      prepCapture: prepCapture,
      compositeFrame: compositeFrame,
      snapshot: snapshot,

      /* ---------- recording hooks (js/recorder.js) ---------- */
      rec: {
        STEP: STEP,
        settings: settings,
        applySetting: applySetting,
        input: input,
        checksum: checksum,
        points: function () { return { nx: nx, ny: ny, bw: bw, bh: bh, uS: uS, px: Array.from(px), py: Array.from(py) }; },
        debugState: function () {
          var sp = 0, sv = 0;
          for (var k = 0; k < count; k++) { sp += px[k] + py[k] * 3; sv += vx[k] + vy[k] * 3; }
          return { W: W, H: H, AH: AH, bw: bw, bh: bh, pr: pr, count: count, nx: nx, ny: ny, KS: KS, CD: CD, KN: KN, gScale: gScale,
            strength: strength, softness: softness, gravity: gravityOn, alive: alive, free: free, homeX: homeX, homeY: homeY,
            cx: cx, cy: cy, ang: ang, uS: uS, cvx: cvx, cvy: cvy, tilt: [tiltX, tiltY, tvX, tvY], time: time, steps: stepsDone,
            sp: sp, sv: sv, rev: rev, dampMul: dampMul, massMul: massMul, kvNull: !kv, AD: AD, aW: aW, ptrModes: Array.from(ptrs.values()).map(function (o) { return [o.mode, o.age, o.cr, o.p, o.hasP]; }), regions: regions.length, headW: !!headW, hAng: hAng, lifeT: lifeT, ptrs: ptrs.size, softT: softT, aspect: aspect };
        },
        steps: function () { return stepsDone; },
        pose: function () { return { x: cx, y: cy, ang: ang, scale: uS }; },
        size: function () { return { w: W, h: H }; },
        // start from a clean, repeatable state: points at rest, no fingers, fresh random sequence
        begin: function (seed, pose) {
          ptrs.clear(); faceTaps = []; softT = shakeT = 0;
          time = 0; lifeT = 2.5; stepsDone = 0; acc = 0;
          // character moves start from a known phase
          aT = 0; aPrev = null; aMixT = 1; autoLeft = 0; lastLand = -1;
          aClip = anim.auto ? 'none' : anim.clip; aW = (anim.auto || anim.clip !== 'none') ? 1 : 0;
          lookX = lookY = lookOn = 0;
          if (window.Animator) AD = Animator.rest();
          rigT = 0; rigBlend = (rig && rig.clip !== 'none') ? 1 : 0;    // the skeleton clip starts from a known phase
          fadeFrom = null; lastRoot = [0, 0];
          nH = nHv = nL = nLv = nHt = nLt = 0;                          // version 28: no push left from before
          ikW = { L: 0, R: 0 }; ikRaise = { L: null, R: null };
          jW = { legL: 0, legR: 0, head: 0 }; jRaise = { legL: null, legR: null, head: null };         // no hand held
          sprOn = false; handLag = { L: [0, 0], R: [0, 0] };            // rev 7: the springs start where the move is
          pyaw = pyawV = ppit = ppitV = pbreath = 0;                     // alive 3D: the head starts straight
          if (fld) fld.reset();                                          // material: no dents left from before
          if (cmX) { cmX.fill(0); cmY.fill(0); }                         // ... and no slow memory of an old squeeze
          rand = mulberry32(seed);
          restPose(pose || { x: cx, y: cy, ang: ang, scale: uS });
        },
        setSink: function (fn) { inputSink = fn; tBase = fn ? performance.now() : 0; },
        setStepHook: function (fn) { stepHook = fn; },
        setReplaying: function (on) { replaying = !!on; if (on) ptrs.clear(); },
        setPaused: function (on) { paused = !!on; if (!on) wake(); },
        lockQuality: function (on) { qualityLocked = !!on; },
        forceQuality: function (level) { if (QUALITY[level] && level !== quality) applyQuality(level); },
        setVirtualSize: setVirtualSize,
        setReduceMotion: function (on) { reduceMotion = !!on; },
        realReduceMotion: function () { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
      }
    };
  }

  window.JellyEngine = { create: create };
})();
