// ── NỘI DUNG THÔNG TIN (chỉnh ở đây) ─────────────────────────
var INFO = {
  title: 'Chánh Điện',
  body:  'Chánh điện được thiết kế theo kiến trúc 8 mái,...'
  // Muốn xuống dòng trong popup: dùng \n
};

// ── CẤU HÌNH ─────────────────────────────────────────────────
var PITCH_MIN = -60;
var PITCH_MAX = 20;
var SENS_ROT  = 0.4;
var YAW_DIR   = 1;      // -1 nếu vuốt ngang bị ngược
var PITCH_DIR = 1;      // -1 nếu vuốt dọc bị ngược
var AXIS_LOCK = true;
var LOCK_PX   = 8;
var ZOOM_MIN  = 0.4;
var ZOOM_MAX  = 3;

// Hiệu ứng xuất hiện
var INTRO_MS        = 2200;
var INTRO_SPIN      = 180;
var INTRO_CLIP      = true;
var INTRO_REPLAY    = true;
var REPLAY_AFTER_MS = 2000;

// Chấm sáng (hotspot)
var HOTSPOT_SIZE   = 0.2;
var HOTSPOT_OFFSET = { x: 0, y: 0.02, z: 0 };
var HOTSPOT_POS    = null;
var HIT_PX         = 52;

// Thẻ thông tin trong AR
var CARD_W         = 0.9;
var CARD_H         = CARD_W / 2;
var CARD_GAP       = 0.1;
var CARD_MAX_LINES = 4;
var CARD_ANIM_MS   = 350;

var D2R = Math.PI / 180;

// ── Giao diện ────────────────────────────────────────────────
var ua = navigator.userAgent;
document.getElementById('platform-info').textContent =
    /iPhone|iPad|iPod/.test(ua) ? '🍎 iOS — Dùng Safari'
  : /Android/.test(ua)          ? '🤖 Android — Dùng Chrome'
  : '💻 Desktop — Cần webcam';

document.getElementById('panel-title').textContent = INFO.title;
document.getElementById('panel-body').textContent  = INFO.body;

document.getElementById('start-btn').addEventListener('click', function () {
  document.getElementById('splash').style.display = 'none';
  document.getElementById('hud').style.display    = 'block';
  document.getElementById('reset-btn').style.display = 'block';
  document.getElementById('info-btn').style.display  = 'block';
});

var panel    = document.getElementById('info-panel');
var overlay  = document.getElementById('info-overlay');
var panelOpen = false;

function setPanel(open) {
  panelOpen = open;
  panel.classList.toggle('open', open);
  overlay.style.display = open ? 'block' : 'none';
}

document.getElementById('info-btn').addEventListener('click', function () { setPanel(!panelOpen); });
document.getElementById('close-panel-btn').addEventListener('click', function () { setPanel(false); });
overlay.addEventListener('click', function () { setPanel(false); });

// ── Trạng thái chung ─────────────────────────────────────────
var sceneEl = document.querySelector('a-scene');
var baseEl  = document.getElementById('base');
var cardEl  = document.getElementById('card');
var pivot   = document.getElementById('pivot');

var yaw = 0, pitch = 0, zoom = 1;
var halfH = 0;
var modelReady   = false;
var mats         = [];
var clipOn       = false;
var clipPlane    = new THREE.Plane();
var intro        = { t: INTRO_MS };
var markerVisible = false;
var lostAt       = 0;
var hasPlayed    = false;

var cardOpen = false, cardT = 0;
var cardMesh = null, cardMat = null, cardTruncated = false;
var lineObj = null, lineGeo = null;
var hot = null, dotMesh = null, ringMeshes = [];
var topPoint = null;

var qCam = new THREE.Quaternion();
var qTmp = new THREE.Quaternion();
var vBase = new THREE.Vector3();
var vUp   = new THREE.Vector3();
var vEnd  = new THREE.Vector3();
var vHot  = new THREE.Vector3();
var ray   = new THREE.Raycaster();
var ndc   = new THREE.Vector2();

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function easeOut(t)      { return 1 - Math.pow(1 - t, 3); }

// ── Marker ───────────────────────────────────────────────────
var marker   = document.getElementById('hiro-marker');
var statusEl = document.getElementById('marker-status');

marker.addEventListener('markerFound', function () {
  markerVisible = true;
  statusEl.textContent = '✅ Marker đã nhận diện!';
  statusEl.className   = 'status status-found';
  if (!hasPlayed || (INTRO_REPLAY && Date.now() - lostAt > REPLAY_AFTER_MS)) startIntro();
});
marker.addEventListener('markerLost', function () {
  markerVisible = false;
  lostAt = Date.now();
  statusEl.textContent = '🔍 Đang tìm marker...';
  statusEl.className   = 'status status-searching';
});

// ── Canvas helpers ────────────────────────────────────────────
function makeTex(c) {
  var t = new THREE.CanvasTexture(c);
  if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

function wrapLines(ctx, text, maxW) {
  var words = text.replace(/\s+/g, ' ').trim().split(' ');
  var lines = [], line = '';
  words.forEach(function (w) {
    var t = line ? line + ' ' + w : w;
    if (line && ctx.measureText(t).width > maxW) { lines.push(line); line = w; }
    else line = t;
  });
  if (line) lines.push(line);
  return lines;
}

// ── Vẽ thẻ AR ────────────────────────────────────────────────
function buildCard() {
  var W = 1024, H = 512, PAD = 48;
  var FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  var c = document.createElement('canvas');
  c.width = W; c.height = H;
  var ctx = c.getContext('2d');

  // Nền trắng
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  roundRect(ctx, 0, 0, W, H, 44);
  ctx.fill();

  // Tiêu đề (không có tag)
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '700 68px ' + FONT;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(INFO.title, PAD, 100);

  // Đường kẻ ngang
  ctx.fillStyle = '#e6e6e6';
  ctx.fillRect(PAD, 128, W - 2 * PAD, 2);

  // Nội dung
  ctx.font = '400 32px ' + FONT;
  ctx.fillStyle = '#444';
  var maxW = W - 2 * PAD;
  var lines = wrapLines(ctx, INFO.body, maxW);
  cardTruncated = lines.length > CARD_MAX_LINES;
  if (cardTruncated) {
    lines = lines.slice(0, CARD_MAX_LINES);
    var last = lines[CARD_MAX_LINES - 1];
    while (last && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1);
    lines[CARD_MAX_LINES - 1] = last.replace(/[\s,.;:]+$/, '') + '…';
  }
  lines.forEach(function (l, i) { ctx.fillText(l, PAD, 186 + i * 52); });

  if (cardTruncated) {
    ctx.font = '600 28px ' + FONT;
    ctx.fillStyle = '#0077b6';
    ctx.textAlign = 'right';
    ctx.fillText('Chạm để xem thêm ›', W - PAD, 478);
  }

  cardMat  = new THREE.MeshBasicMaterial({
    map: makeTex(c), transparent: true, opacity: 0,
    depthTest: false, depthWrite: false, toneMapped: false
  });
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H), cardMat);
  cardMesh.renderOrder = 1001;
  cardMesh.visible = false;
  cardEl.setObject3D('mesh', cardMesh);

  lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  lineObj = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x00b4d8, depthTest: false }));
  lineObj.renderOrder = 1000;
  lineObj.frustumCulled = false;
  lineObj.visible = false;
  baseEl.object3D.add(lineObj);
}

// ── Chấm sáng ────────────────────────────────────────────────
function buildHotspot() {
  var S = 128;

  var c1 = document.createElement('canvas');
  c1.width = c1.height = S;
  var g1  = c1.getContext('2d');
  var grd = g1.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0,    'rgba(255,255,255,1)');
  grd.addColorStop(0.17, 'rgba(255,255,255,1)');
  grd.addColorStop(0.20, 'rgba(0,180,216,1)');
  grd.addColorStop(0.30, 'rgba(0,180,216,0.9)');
  grd.addColorStop(0.55, 'rgba(0,180,216,0.28)');
  grd.addColorStop(1,    'rgba(0,180,216,0)');
  g1.fillStyle = grd;
  g1.fillRect(0, 0, S, S);

  var c2 = document.createElement('canvas');
  c2.width = c2.height = S;
  var g2 = c2.getContext('2d');
  g2.strokeStyle = 'rgba(0,180,216,1)';
  g2.lineWidth   = 6;
  g2.shadowColor = 'rgba(0,180,216,1)';
  g2.shadowBlur  = 8;
  g2.beginPath();
  g2.arc(64, 64, 52, 0, Math.PI * 2);
  g2.stroke();

  function mat(tex) {
    return new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0,
      depthTest: false, depthWrite: false, toneMapped: false
    });
  }

  var geo = new THREE.PlaneGeometry(HOTSPOT_SIZE, HOTSPOT_SIZE);
  hot = new THREE.Group();

  var ringTex = makeTex(c2);
  for (var i = 0; i < 2; i++) {
    var r = new THREE.Mesh(geo, mat(ringTex));
    r.renderOrder = 999;
    ringMeshes.push(r);
    hot.add(r);
  }
  dotMesh = new THREE.Mesh(geo, mat(makeTex(c1)));
  dotMesh.renderOrder = 1000;
  hot.add(dotMesh);

  hot.visible = false;
  pivot.object3D.add(hot);
  placeHotspot();
}

function placeHotspot() {
  if (!hot || !topPoint) return;
  var b = HOTSPOT_POS || topPoint;
  hot.position.set(b.x + HOTSPOT_OFFSET.x, b.y + HOTSPOT_OFFSET.y, b.z + HOTSPOT_OFFSET.z);
}

// ── Hiệu ứng xuất hiện ───────────────────────────────────────
function startIntro() {
  hasPlayed = true;
  intro.t   = 0;
  cardOpen  = false;
  cardT     = 0;
  apply();
}

function collectMaterials() {
  var mesh = document.getElementById('model').getObject3D('mesh');
  mats = [];
  if (!mesh) return;
  mesh.traverse(function (o) {
    if (!o.isMesh) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
      if (!m) return;
      if (mats.every(function (e) { return e.m !== m; }))
        mats.push({ m: m, transparent: m.transparent, opacity: m.opacity });
    });
  });
}

function setClip(on) {
  if (on === clipOn) return;
  clipOn = on;
  if (on) sceneEl.renderer.localClippingEnabled = true;
  mats.forEach(function (e) {
    e.m.clippingPlanes = on ? [clipPlane] : null;
    e.m.needsUpdate = true;
  });
}

function updateClipPlane() {
  var o = baseEl.object3D;
  o.updateWorldMatrix(true, false);
  var n = new THREE.Vector3(0, 1, 0).transformDirection(o.matrixWorld);
  var p = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
  clipPlane.setFromNormalAndCoplanarPoint(n, p);
}

function setModelAlpha(a) {
  mats.forEach(function (e) {
    var t = a < 1 ? true : e.transparent;
    if (e.m.transparent !== t) { e.m.transparent = t; e.m.needsUpdate = true; }
    e.m.opacity = a < 1 ? e.opacity * a : e.opacity;
  });
}

function updateModelVisuals(prog) {
  if (!modelReady) return;
  setClip(INTRO_CLIP && prog < 1);
  if (clipOn) updateClipPlane();
  setModelAlpha(clamp(prog / 0.6, 0, 1));
}

function apply() {
  pitch = clamp(pitch, PITCH_MIN, PITCH_MAX);
  zoom  = clamp(zoom,  ZOOM_MIN,  ZOOM_MAX);

  var prog = clamp(intro.t / INTRO_MS, 0, 1);
  var ease = easeOut(prog);

  var o = pivot.object3D;
  o.rotation.set(pitch * D2R, (yaw + INTRO_SPIN * (1 - ease)) * D2R, 0);
  o.scale.setScalar(zoom);
  o.position.set(0, halfH * zoom - (2 * halfH * zoom + 0.08) * (1 - ease), 0);

  updateModelVisuals(prog);
}

// ── Chấm sáng + thẻ: mỗi frame ──────────────────────────────
function updateOverlay(dt) {
  if (!hot || !cardMesh) return;

  var prog = clamp(intro.t / INTRO_MS, 0, 1);
  var a    = clamp((prog - 0.85) / 0.15, 0, 1);
  hot.visible = a > 0.01;
  if (!hot.visible || !markerVisible) {
    cardMesh.visible = false;
    lineObj.visible  = false;
    return;
  }

  var cam = sceneEl.camera;
  if (!cam) return;
  cam.getWorldQuaternion(qCam);

  pivot.object3D.getWorldQuaternion(qTmp);
  hot.quaternion.copy(qTmp).invert().multiply(qCam);
  hot.scale.setScalar(1 / zoom);

  cardT = clamp(cardT + (cardOpen ? dt : -dt) / CARD_ANIM_MS, 0, 1);
  var s = easeOut(cardT);

  var t = performance.now() / 1000;
  dotMesh.material.opacity = a;
  dotMesh.scale.setScalar(1 + 0.08 * Math.sin(t * 4));
  ringMeshes.forEach(function (r, i) {
    var p = (t / 1.8 + i * 0.5) % 1;
    r.scale.setScalar(0.3 + p * 1.1);
    r.material.opacity = Math.pow(1 - p, 1.3) * 0.9 * a * (1 - s);
  });

  cardMat.opacity  = s;
  cardMesh.visible = s > 0.01;
  if (!cardMesh.visible) { lineObj.visible = false; return; }

  hot.getWorldPosition(vBase);
  baseEl.object3D.worldToLocal(vBase);
  baseEl.object3D.getWorldQuaternion(qTmp);

  var obj = cardEl.object3D;
  obj.quaternion.copy(qTmp).invert().multiply(qCam);
  obj.scale.setScalar(s);
  vUp.set(0, 1, 0).applyQuaternion(obj.quaternion);
  obj.position.copy(vBase).addScaledVector(vUp, (CARD_GAP + CARD_H / 2) * s);

  vEnd.copy(vBase).addScaledVector(vUp, CARD_GAP * s);
  var pos = lineGeo.attributes.position;
  pos.setXYZ(0, vBase.x, vBase.y, vBase.z);
  pos.setXYZ(1, vEnd.x,  vEnd.y,  vEnd.z);
  pos.needsUpdate = true;
  lineObj.visible = s > 0.3;
}

window.onFrame = function (dt) {
  dt = Math.min(dt, 50);
  if (modelReady && markerVisible && intro.t < INTRO_MS) {
    intro.t = Math.min(INTRO_MS, intro.t + dt);
    apply();
  }
  updateOverlay(dt);
};

document.addEventListener('model-fitted', function (e) {
  halfH    = e.detail.halfHeight;
  topPoint = e.detail.top;
  placeHotspot();
  collectMaterials();
  modelReady = true;
  apply();
});

document.getElementById('reset-btn').addEventListener('click', function () {
  yaw = 0; pitch = 0; zoom = 1;
  startIntro();
});

// ── Chạm: bật/tắt thẻ, mở popup ─────────────────────────────
function handleTap(x, y) {
  if (panelOpen || !markerVisible || !hot || !hot.visible) return;
  var cam = sceneEl.camera;
  var cv  = sceneEl.canvas;
  if (!cam || !cv) return;
  var r = cv.getBoundingClientRect();

  hot.getWorldPosition(vHot);
  vHot.project(cam);
  var sx = r.left + (vHot.x * 0.5 + 0.5) * r.width;
  var sy = r.top  + (-vHot.y * 0.5 + 0.5) * r.height;
  if (Math.hypot(x - sx, y - sy) <= HIT_PX) {
    var now = Date.now();
    if (now - lastToggleAt > 300) { cardOpen = !cardOpen; lastToggleAt = now; }
    return;
  }

  if (cardOpen && cardMesh.visible) {
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    ray.setFromCamera(ndc, cam);
    if (ray.intersectObject(cardMesh, false).length) {
      if (cardTruncated) setPanel(true);
      else cardOpen = false;
    }
  }
}

// ── Kéo (cảm ứng + chuột) ────────────────────────────────────
var drag        = null;
var lastTouchAt = 0;
var lastToggleAt = 0;

function recentTouch() { return Date.now() - lastTouchAt < 1000; }

function ignoreEvent(e) {
  return panelOpen || (e.target && e.target.closest && e.target.closest('button'));
}

function dragStart(x, y, noTap) {
  drag = { x: x, y: y, sx: x, sy: y, t: Date.now(), moved: 0, noTap: !!noTap, ax: 0, ay: 0, lock: null };
}

function dragMove(x, y) {
  if (!drag) return;
  var dx = x - drag.x;
  var dy = y - drag.y;
  drag.x = x; drag.y = y;
  drag.moved = Math.max(drag.moved, Math.hypot(x - drag.sx, y - drag.sy));

  if (AXIS_LOCK && !drag.lock) {
    drag.ax += dx; drag.ay += dy;
    if (Math.abs(drag.ax) < LOCK_PX && Math.abs(drag.ay) < LOCK_PX) return;
    drag.lock = Math.abs(drag.ax) >= Math.abs(drag.ay) ? 'x' : 'y';
    dx = drag.ax; dy = drag.ay;
  }

  if (!AXIS_LOCK || drag.lock === 'x') yaw   += dx * SENS_ROT * YAW_DIR;
  if (!AXIS_LOCK || drag.lock === 'y') pitch += dy * SENS_ROT * PITCH_DIR;
  apply();
}

function dragEnd() {
  var d = drag; drag = null;
  if (d && !d.noTap && d.moved < 18 && Date.now() - d.t < 600) handleTap(d.sx, d.sy);
}

function dragCancel() { drag = null; }

var lastPinch = null;

function pinchDist(t) {
  var dx = t[0].clientX - t[1].clientX;
  var dy = t[0].clientY - t[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

document.addEventListener('touchstart', function (e) {
  lastTouchAt = Date.now();
  if (ignoreEvent(e)) return;
  if (e.touches.length === 1) {
    lastPinch = null;
    dragStart(e.touches[0].clientX, e.touches[0].clientY);
  } else if (e.touches.length === 2) {
    dragCancel();
    lastPinch = pinchDist(e.touches);
  }
}, { passive: true });

document.addEventListener('touchmove', function (e) {
  lastTouchAt = Date.now();
  if (panelOpen) return;
  if (e.touches.length === 2) {
    var d = pinchDist(e.touches);
    if (lastPinch) { zoom *= d / lastPinch; apply(); }
    lastPinch = d;
    return;
  }
  if (e.touches.length === 1) dragMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

document.addEventListener('touchend', function (e) {
  lastTouchAt = Date.now();
  lastPinch   = null;
  if (e.touches.length === 1 && !panelOpen) {
    dragStart(e.touches[0].clientX, e.touches[0].clientY, true);
  } else if (e.touches.length === 0) {
    dragEnd();
  } else {
    dragCancel();
  }
}, { passive: true });

document.addEventListener('touchcancel', function () {
  lastTouchAt = Date.now();
  lastPinch   = null;
  dragCancel();
}, { passive: true });

document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

document.addEventListener('mousedown', function (e) {
  if (recentTouch() || ignoreEvent(e)) return;
  dragStart(e.clientX, e.clientY);
});
document.addEventListener('mousemove', function (e) { if (!recentTouch()) dragMove(e.clientX, e.clientY); });
document.addEventListener('mouseup',   function ()  { if (!recentTouch()) dragEnd(); });

document.addEventListener('wheel', function (e) {
  if (panelOpen) return;
  zoom *= Math.exp(-e.deltaY * 0.001);
  apply();
}, { passive: true });

// ── Khởi động ────────────────────────────────────────────────
function buildOverlay() {
  buildCard();
  buildHotspot();
  apply();
}

if (sceneEl.hasLoaded) buildOverlay();
else sceneEl.addEventListener('loaded', buildOverlay);
