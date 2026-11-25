// ══════════════════════════════════════════════════════════════
//  AR 3D Viewer — nhiều marker, nhiều lớp mô hình, TẤT CẢ trong 1 trang
// ══════════════════════════════════════════════════════════════

// ── NỘI DUNG & CẤU TRÚC (chỉnh ở đây) ────────────────────────
// Mỗi phần tử của SCENES = 1 marker.
//   id     : khớp với id trong index.html (marker-<id>, <id>-base, <id>-model ...)
//   stages : các lớp mô hình, theo thứ tự đi sâu vào bên trong
// Mỗi stage:
//   model  : đường dẫn file .glb (phân biệt HOA/thường nếu host trên GitHub Pages)
//   title/body : nội dung thông tin (\n = xuống dòng)
//   dot    : vị trí chấm sáng dẫn sang LỚP KẾ TIẾP, dạng tỉ lệ 0..1 trong hộp bao mô hình
//            fx: trái→phải | fy: dưới→trên | fz: sau→trước
//            Muốn lấy số chính xác: mở trang với ?calib=1 rồi chạm lên mô hình.
//   cardAt : (tuỳ chọn) vị trí gắn thẻ thông tin, cùng dạng với dot.
//            Bỏ trống = đỉnh cao nhất của mô hình (như ở Chánh Điện).
var SCENES = [
  {
    id: 'chanh-dien',
    stages: [
      {
        id: 'chanh_dien',
        model: 'models/chanh_dien.glb',
        title: 'Chánh Điện',
        body:  'Chánh điện mang đậm phong cách kiến trúc thuần Việt thời Trần với kết cấu 8 mái lợp ngói đỏ trầm mặc. Hệ thống khung kèo và cột trụ lớn được chế tác từ gỗ lim Nam Phi. Công trình không chỉ hội tụ tinh hoa điêu khắc gỗ truyền thống qua hệ thống bao lam, hoành phi sơn son thếp vàng mà còn là trung tâm sinh hoạt văn hóa, tâm linh lớn nhất vùng Tây Nam Bộ.'
      }
    ]
  },
  {
    id: 'lau-trong',
    stages: [
      {
        id: 'lau_trong',
        model: 'models/lau_trong.glb',
        title: 'Lầu Trống',
        body:  'Lầu chuông và Lầu trống được bố trí đăng đối hai bên sân trước Chánh điện, mô phỏng nguyên mẫu tháp chuông cổ của Chùa Keo (Thái Bình) với kết cấu 3 tầng mái cong bằng gỗ lim. Hai hạng mục này tạo nên sự giao thoa độc đáo giữa kiến trúc cổ truyền Bắc Bộ và không gian sông nước phương Nam.',
        dot:   { fx: 0.976, fy: 0.554, fz: 0.915 }  // chóp mái tầng 1 ở góc trước bên phải
      },
      {
        id: 'mai_dao',
        model: 'models/mai_dao.glb',
        title: 'Mái Đao',
        body:  'Định hình từ thời Lý – Trần, kiến trúc mái đao nổi bật với phần góc mái uốn cong vút mềm mại như mũi thuyền rẽ sóng kết hợp cùng hệ thống đắp nổi linh vật truyền thống. Dáng mái cong này mang đậm hơi thở văn minh sông nước, biểu trưng cho tinh thần thanh cao và khát vọng hướng thượng của người Việt.',
        dot:   { fx: 0.408, fy: 0.303, fz: 0.709 }  // trên mặt viên ngói vảy cá
      },
      {
        id: 'gach_ngoi',
        model: 'models/gach_ngoi.glb',
        title: 'Ngói Cánh Sen',
        body:  'Kế thừa dòng ngói đất nung truyền thống xuất hiện từ thời Đinh – Tiền Lê và đạt đỉnh cao nghệ thuật vào thời Lý – Trần, ngói cánh sen có bản dẹt với phần mũi được vuốt nhọn, uốn cong nhẹ mô phỏng cánh hoa sen nở. Trong văn hóa Phật giáo, lớp ngói này không chỉ tạo sự đồng bộ cho kiến trúc cổ truyền mà còn gửi gắm triết lý về sự thanh tịnh, thuần khiết và giác ngộ.'
      }
    ]
  },
  {
    id: 'tuong-phat-hoang',
    loadOnSight: true,
    stages: [
      {
        id: 'tuong_phat_hoang',
        model: 'models/tuong_phat_hoang.glb?v=3',
        title: 'Tượng Phật hoàng',
        body: 'Tôn tượng tại Thiền viện Trúc Lâm Phương Nam được khánh thành năm 2026 bằng công nghệ phục dựng 3D hiện đại. Tác phẩm nhằm tưởng niệm Vua Trần Nhân Tông (1258–1308) – vị anh hùng hai lần đánh thắng giặc Nguyên Mông và sau khi xuất gia năm 1299 đã sáng lập Thiền phái Trúc Lâm Yên Tử thuần Việt.'
      }
    ]
  }
];

var HISTORY_TOPICS = {
  thienPhai: {
    title: 'Thiền phái Trúc Lâm Yên Tử',
    body: 'Thiền phái Trúc Lâm hình thành vào thời Trần. Năm 1299, Trần Nhân Tông lên núi Yên Tử tu hành. Ông được tôn là Sơ tổ của thiền phái. Sau ông, Pháp Loa và Huyền Quang tiếp nối, hợp thành Trúc Lâm Tam tổ.\n\nTư tưởng Trúc Lâm gắn việc tu tập với đời sống hằng ngày. Tinh thần ấy được thể hiện trong tác phẩm Cư trần lạc đạo phú của Trần Nhân Tông.'
  },
  vuaTran: {
    title: 'Vua Trần Nhân Tông',
    body: 'Trần Nhân Tông (1258–1308), tên húy Trần Khâm, lên ngôi năm 1278. Dưới thời ông, quân dân Đại Việt đánh bại hai cuộc xâm lược của quân Nguyên vào năm 1285 và giai đoạn 1287–1288.\n\nNăm 1293, ông nhường ngôi cho con là Trần Anh Tông và trở thành Thái thượng hoàng. Về sau, ông xuất gia tu hành tại Yên Tử và được biết đến với danh xưng Phật hoàng.'
  }
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

// Hiệu ứng xuất hiện / chuyển lớp
var INTRO_MS        = 2200;
var INTRO_SPIN      = 180;
var INTRO_CLIP      = true;
var INTRO_REPLAY    = true;
var REPLAY_AFTER_MS = 2000;
var OUTRO_MS        = 450;    // thời gian mô hình cũ chìm xuống trước khi nạp lớp mới

// Chấm sáng dẫn sang lớp kế tiếp
var HOTSPOT_SIZE = 0.2;
var HIT_PX       = 52;

// Thẻ thông tin trong AR (hiện khi chạm vào mô hình, nằm phía trên đỉnh mô hình)
var CARD_OFFSET    = { x: 0, y: 0.02, z: 0 };
var CARD_W         = 1.0;
var CARD_GAP       = 0.1;
var CARD_ANIM_MS   = 140;
var CARD_FONT      = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
var CARD_PAD       = 48;
var CARD_BODY_Y    = 190;
var CARD_LINE_H    = 54;
var CARD_BUTTON_H  = 84;
var CARD_LISTEN_W  = 420;

var CALIB = /[?&]calib=1/.test(location.search);
var D2R   = Math.PI / 180;

THREE.Cache.enabled = true;

// ── Tiện ích ─────────────────────────────────────────────────
function $(id)           { return document.getElementById(id); }
function clamp(v, a, b)  { return Math.max(a, Math.min(b, v)); }
function easeOut(t)      { return 1 - Math.pow(1 - t, 3); }

var sceneEl  = document.querySelector('a-scene');
var calibBox = $('calib-box');

var qCam = new THREE.Quaternion();
var qTmp = new THREE.Quaternion();
var vBase = new THREE.Vector3();
var vUp   = new THREE.Vector3();
var vEnd  = new THREE.Vector3();
var cardCenter = new THREE.Vector3();
var cardCorner = new THREE.Vector3();
var cardProjection = new THREE.Matrix4();
var vHot  = new THREE.Vector3();
var ray   = new THREE.Raycaster();
var ndc   = new THREE.Vector2();
var cardViewport;

function updateCardViewport() {
  if (!sceneEl.canvas) return;
  var rect = sceneEl.canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  var topInset = Math.min(56, window.innerHeight * 0.12);
  var bottomInset = Math.min(82, window.innerHeight * 0.16);
  cardViewport = {
    left: 2 * (Math.max(rect.left, 0) + 12 - rect.left) / rect.width - 1,
    right: 2 * (Math.min(rect.right, window.innerWidth) - 12 - rect.left) / rect.width - 1,
    top: 1 - 2 * (Math.max(rect.top, topInset) - rect.top) / rect.height,
    bottom: 1 - 2 * (Math.min(rect.bottom, window.innerHeight - bottomInset) - rect.top) / rect.height,
    minWidth: 2 * Math.min(175, window.innerWidth * 0.55) / rect.width,
    readWidth: 2 * Math.min(280, window.innerWidth * 0.82) / rect.width,
    gap: 16 / rect.height
  };
}

window.addEventListener('resize', function () { requestAnimationFrame(updateCardViewport); });

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

// ── Giao diện chung ──────────────────────────────────────────
var historyTopics = $('history-topics');
var started       = false;

var speech = window.speechSynthesis;
var canListen = !!(speech && window.SpeechSynthesisUtterance);
var narration = null;

function finishNarration(message) {
  var update = narration.update;
  narration = null;
  update(false, message || '');
}

function stopNarration(viewer) {
  if (!narration || (viewer && narration.viewer !== viewer)) return;
  finishNarration();
  speech.cancel();
}

function toggleNarration(viewer, content, update) {
  if (narration && narration.viewer === viewer) { stopNarration(viewer); return; }
  if (!canListen) {
    update(false, 'Trình duyệt chưa hỗ trợ giọng đọc.');
    return;
  }
  stopNarration();

  var voices = speech.getVoices();
  var voice = voices.find(function (v) { return v.lang.toLowerCase() === 'vi-vn'; }) ||
              voices.find(function (v) { return /^vi(?:-|$)/i.test(v.lang); });
  if (voices.length && !voice) {
    update(false, 'Thiết bị chưa có giọng đọc tiếng Việt.');
    return;
  }

  var text = content.title + '. ' + content.body.replace(/(\d)–(\d)/g, '$1 đến $2');
  var utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  if (voice) utterance.voice = voice;
  var reading = { viewer: viewer, utterance: utterance, update: update };
  utterance.onend = function () {
    if (narration === reading) finishNarration();
  };
  utterance.onerror = function (event) {
    if (narration !== reading) return;
    var unavailable = event.error === 'language-unavailable' || event.error === 'voice-unavailable';
    finishNarration(unavailable ? 'Thiết bị chưa có giọng đọc tiếng Việt.' : 'Không phát được. Chạm để thử lại.');
  };

  narration = reading;
  update(true, '');
  speech.speak(utterance);
}

$('start-btn').addEventListener('click', function () {
  $('splash').style.display    = 'none';
  $('hud').style.display       = 'block';
  $('reset-btn').style.display = 'block';
  started = true;
});

historyTopics.addEventListener('click', function (e) {
  var button = e.target.closest('button[data-topic]');
  var viewer = target();
  if (button && viewer && viewer.id === 'tuong-phat-hoang') viewer.showCard(HISTORY_TOPICS[button.dataset.topic]);
});

$('reset-btn').addEventListener('click', function () { if (current) current.reset(); });
$('back-btn').addEventListener('click',  function () { if (current) current.goTo(current.stageIdx - 1); });
$('calib-next').addEventListener('click', function () { if (current) current.goTo(current.stageIdx + 1); });

// ══════════════════════════════════════════════════════════════
//  Viewer: 1 marker = 1 viewer, tự quản lý chuỗi lớp mô hình
// ══════════════════════════════════════════════════════════════
var viewers = [];
var current = null;     // viewer của marker vừa nhận diện gần nhất

function createViewer(cfg, onFirstSettled) {
  var stages   = cfg.stages;
  var markerEl = $('marker-' + cfg.id);
  var baseEl   = $(cfg.id + '-base');
  var pivot    = $(cfg.id + '-pivot');
  var modelEl  = $(cfg.id + '-model');
  var cardEl   = $(cfg.id + '-card');

  var v = {
    id: cfg.id,
    markerVisible: false, lostAt: 0,
    stageIdx: 0, count: stages.length,
    phase: cfg.loadOnSight ? 'waiting' : 'loading',
    error: ''
  };

  var yaw = 0, pitch = 0, zoom = 1;
  var halfH = 0, box = null, topPoint = null;
  var modelReady = false, mats = [], clipOn = false, clipPlane = new THREE.Plane();
  var intro = { t: INTRO_MS };
  var hasPlayed = false, pendingIdx = 0, firstSettled = false;
  var hasDot = false;

  var overlayBuilt = false;
  var cardCanvas, cardCtx, cardTex, cardMat, cardMesh;
  var cardOpen = false, cardT = 0;
  var cardContent, cardLines, cardHeight = 0;
  var cardListenY = 0, cardPixelHeight = 0;
  var cardReading = false, cardStatus = '';
  var modelCorners = [];
  var cardBelowModel = false;
  var lineObj, lineGeo, anchor;
  var hot, dotMesh, ringMeshes = [], calibDot = null;

  v.stage     = function () { return stages[v.stageIdx]; };
  v.prevTitle = function () { return v.stageIdx > 0 ? stages[v.stageIdx - 1].title : ''; };

  function settleFirst() {
    if (firstSettled || cfg.loadOnSight) return;
    firstSettled = true;
    onFirstSettled();
  }

  // ── Marker ─────────────────────────────────────────────────
  v.isTracked = function () {
    // AR.js 3.4.5 giữ anchor hiển thị thêm một lúc sau khi tracker mất marker.
    var component = markerEl.components['arjs-anchor'];
    var anchor = component && component._arAnchor;
    return !!anchor && anchor.controls.object3d.visible;
  };

  markerEl.addEventListener('markerFound', function () {
    v.markerVisible = true;
    if (current && current !== v) current.closeCard();
    current = v;
    if (v.phase === 'waiting') {
      if (overlayBuilt) loadStage(0);
    } else if (!hasPlayed || (INTRO_REPLAY && Date.now() - v.lostAt > REPLAY_AFTER_MS)) {
      startIntro();
    }
  });
  markerEl.addEventListener('markerLost', function () {
    v.markerVisible = false;
    v.closeCard();
    v.lostAt = Date.now();
    if (current === v) {
      var other = viewers.filter(function (x) { return x.markerVisible; })[0];
      if (other) current = other;
    }
  });

  // ── Vẽ thẻ thông tin ───────────────────────────────────────
  function drawCard() {
    var W = cardCanvas.width, H = cardPixelHeight, PAD = CARD_PAD;
    var ctx = cardCtx;

    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = '#fff8ec';
    roundRect(ctx, 0, 0, W, H, 44);
    ctx.fill();

    ctx.fillStyle = '#873e32';
    ctx.font = '700 74px ' + CARD_FONT;
    ctx.fillText(cardContent.title, PAD, 104, W - 2 * PAD - CARD_BUTTON_H - 16);
    ctx.font = '600 56px ' + CARD_FONT;
    ctx.textAlign = 'center';
    ctx.fillText('×', W - PAD - CARD_BUTTON_H / 2, 100);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#c49a60';
    ctx.fillRect(PAD, 128, W - 2 * PAD, 2);

    ctx.font = '400 44px ' + CARD_FONT;
    ctx.fillStyle = '#3d3026';
    cardLines.forEach(function (line, i) {
      ctx.fillText(line, PAD, CARD_BODY_Y + i * CARD_LINE_H);
    });

    ctx.font = '400 30px ' + CARD_FONT;
    ctx.fillStyle = '#873e32';
    if (cardStatus) ctx.fillText(cardStatus, PAD, cardListenY - 14, W - 2 * PAD);
    roundRect(ctx, PAD, cardListenY, CARD_LISTEN_W, CARD_BUTTON_H, 16);
    ctx.fill();
    ctx.font = '600 36px ' + CARD_FONT;
    ctx.fillStyle = '#fff8ec';
    ctx.textAlign = 'center';
    ctx.fillText(cardReading ? 'Dừng nghe' : 'Nghe thuyết minh', PAD + CARD_LISTEN_W / 2, cardListenY + 54);
    cardTex.needsUpdate = true;
  }

  function prepareCard(content) {
    if (cardContent === content && !cardStatus) return;
    cardContent = content;
    cardCtx.font = '400 44px ' + CARD_FONT;
    cardLines = wrapLines(cardCtx, content.body, cardCanvas.width - 2 * CARD_PAD);
    cardListenY = CARD_BODY_Y + (cardLines.length - 1) * CARD_LINE_H + 66;
    cardPixelHeight = cardListenY + CARD_BUTTON_H + 24;
    if (cardCanvas.height < cardPixelHeight) {
      cardTex.dispose();
      cardCanvas.height = THREE.MathUtils.ceilPowerOfTwo(cardPixelHeight);
    }
    cardTex.repeat.y = cardPixelHeight / cardCanvas.height;
    cardTex.offset.y = 1 - cardTex.repeat.y;
    cardHeight = CARD_W * cardPixelHeight / cardCanvas.width;
    cardMesh.scale.y = cardHeight;
    cardReading = false;
    cardStatus = '';
    drawCard();
  }

  v.showCard = function (content) {
    if (!overlayBuilt || !modelReady || !v.markerVisible || v.phase === 'outro') return;
    stopNarration(v);
    prepareCard(content);
    updateCardViewport();
    if (!cardOpen) cardBelowModel = false;
    cardOpen = true;
  };

  v.closeCard = function () {
    cardOpen = false;
    v.cardNeedsSpace = false;
    stopNarration(v);
  };

  function handleCardTap(uv) {
    var x = uv.x * cardCanvas.width;
    var y = (1 - uv.y) * cardPixelHeight;
    var closeX = cardCanvas.width - CARD_PAD - CARD_BUTTON_H;
    if (x >= closeX && x <= closeX + CARD_BUTTON_H && y >= 30 && y <= 30 + CARD_BUTTON_H) {
      v.closeCard();
    } else if (x >= CARD_PAD && x <= CARD_PAD + CARD_LISTEN_W &&
               y >= cardListenY && y <= cardListenY + CARD_BUTTON_H) {
      toggleNarration(v, cardContent, function (reading, status) {
        cardReading = reading;
        cardStatus = status;
        drawCard();
      });
    }
  }

  // ── Chấm sáng ──────────────────────────────────────────────
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
  }

  function buildOverlay() {
    cardCanvas = document.createElement('canvas');
    cardCanvas.width = 1024; cardCanvas.height = 1024;
    cardCtx = cardCanvas.getContext('2d');
    cardTex = makeTex(cardCanvas);
    cardTex.generateMipmaps = false;
    cardTex.minFilter = THREE.LinearFilter;

    cardMat = new THREE.MeshBasicMaterial({
      map: cardTex, transparent: true, opacity: 0,
      depthTest: false, depthWrite: false, toneMapped: false
    });
    cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, 1), cardMat);
    cardMesh.renderOrder = 1001;
    cardMesh.visible = false;
    cardEl.setObject3D('mesh', cardMesh);

    lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    lineObj = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x00b4d8, depthTest: false }));
    lineObj.renderOrder = 1000;
    lineObj.frustumCulled = false;
    lineObj.visible = false;
    baseEl.object3D.add(lineObj);

    // Điểm neo của thẻ (con của pivot nên đi theo xoay/zoom của mô hình)
    anchor = new THREE.Object3D();
    pivot.object3D.add(anchor);

    buildHotspot();

    if (CALIB) {
      calibDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xff00ff, depthTest: false })
      );
      calibDot.renderOrder = 1002;
      calibDot.visible = false;
      pivot.object3D.add(calibDot);
    }
    overlayBuilt = true;
  }

  function frac(f) {
    return {
      x: box.min.x + f.fx * (box.max.x - box.min.x),
      y: box.min.y + f.fy * (box.max.y - box.min.y),
      z: box.min.z + f.fz * (box.max.z - box.min.z)
    };
  }

  function placeOverlay() {
    var st = v.stage();

    var a = st.cardAt ? frac(st.cardAt) : topPoint;
    anchor.position.set(a.x + CARD_OFFSET.x, a.y + CARD_OFFSET.y, a.z + CARD_OFFSET.z);

    hasDot = v.stageIdx < stages.length - 1;
    if (hasDot) {
      var d = frac(st.dot || { fx: 0.5, fy: 0.5, fz: 0.5 });
      hot.position.set(d.x, d.y, d.z);
    }
    if (calibDot) calibDot.visible = false;
  }

  // ── Vật liệu, clip, độ mờ ──────────────────────────────────
  function collectMaterials() {
    var mesh = modelEl.getObject3D('mesh');
    mats = [];
    if (!mesh) return;
    mesh.traverse(function (o) {
      if (!o.isMesh) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
        if (!m || mats.some(function (e) { return e.m === m; })) return;
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
    if (!modelReady) return;
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

  // ── Hiệu ứng xuất hiện ─────────────────────────────────────
  function startIntro() {
    if (!modelReady || v.phase === 'outro') return;
    hasPlayed = true;
    v.phase   = 'intro';
    intro.t   = 0;
    v.closeCard();
    cardT     = 0;
    apply();
  }

  // ── Nạp 1 lớp mô hình ──────────────────────────────────────
  function loadStage(idx) {
    v.stageIdx = idx;
    v.phase    = 'loading';
    v.error    = '';
    modelReady = false;
    yaw = 0; pitch = 0; zoom = 1;
    v.closeCard();
    cardT = 0;
    if (overlayBuilt) {
      hot.visible = false;
      cardMesh.visible = false;
      lineObj.visible  = false;
      if (calibDot) calibDot.visible = false;
    }
    modelEl.setAttribute('gltf-model', stages[idx].model);
  }

  document.addEventListener('model-fitted', function (e) {
    if (e.detail.el !== modelEl) return;
    halfH    = e.detail.halfHeight;
    topPoint = e.detail.top;
    box      = e.detail.box;
    modelCorners = [];
    [box.min.x, box.max.x].forEach(function (x) {
      [box.min.y, box.max.y].forEach(function (y) {
        modelCorners.push(new THREE.Vector3(x, y, box.min.z), new THREE.Vector3(x, y, box.max.z));
      });
    });

    clipOn = false;           // vật liệu của model mới chưa có clip plane
    collectMaterials();
    modelReady = true;

    intro.t   = 0;
    v.phase   = 'intro';
    hasPlayed = v.markerVisible;

    placeOverlay();
    prepareCard(v.stage());
    sceneEl.renderer.initTexture(cardTex);
    apply();
    settleFirst();
  });

  modelEl.addEventListener('model-error', function () {
    v.phase = 'error';
    v.error = stages[v.stageIdx].model;
    console.error('Không tải được mô hình:', v.error);
    settleFirst();
  });

  // ── Điều hướng giữa các lớp ────────────────────────────────
  v.goTo = function (idx) {
    if (idx < 0 || idx >= stages.length || idx === v.stageIdx) return;
    if (v.phase === 'error') { loadStage(idx); return; }
    if (!modelReady || (v.phase !== 'idle' && v.phase !== 'intro')) return;
    pendingIdx = idx;
    v.closeCard();
    v.phase    = 'outro';
  };

  v.reset = function () {
    if (!modelReady || v.phase === 'outro') return;
    yaw = 0; pitch = 0; zoom = 1;
    startIntro();
  };

  v.rotate = function (dYaw, dPitch) { yaw += dYaw; pitch += dPitch; apply(); };
  v.zoomBy = function (f)            { zoom *= f; apply(); };

  // ── Mỗi khung hình ─────────────────────────────────────────
  function placeCardBesideModel(obj, cam) {
    var view = cardViewport;
    if (!view || view.right <= view.left) return false;
    obj.position.copy(vBase).addScaledVector(vUp, CARD_GAP);
    obj.scale.setScalar(1);
    obj.getWorldPosition(cardCenter).project(cam);
    obj.localToWorld(cardCorner.set(CARD_W / 2, cardHeight, 0)).project(cam);
    var halfW = Math.abs(cardCorner.x - cardCenter.x);
    var height = cardCorner.y - cardCenter.y;
    if (!(halfW > 0 && height > 0)) return false;

    // Đặt thẻ ngoài hình chiếu của mô hình, ưu tiên vị trí phía trên.
    cardProjection.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).multiply(pivot.object3D.matrixWorld);
    var modelTop = -Infinity, modelBottom = Infinity;
    for (var i = 0; i < modelCorners.length; i++) {
      cardCorner.copy(modelCorners[i]).applyMatrix4(cardProjection);
      modelTop = Math.max(modelTop, cardCorner.y);
      modelBottom = Math.min(modelBottom, cardCorner.y);
    }
    var aboveEdge = Math.max(cardCenter.y, modelTop + view.gap, view.bottom);
    var belowEdge = Math.min(modelBottom - view.gap, view.top);
    var aboveSpace = (view.top - aboveEdge) / height;
    var belowSpace = (belowEdge - view.bottom) / height;
    var minScale = view.minWidth / (2 * halfW);
    cardBelowModel = belowSpace >= minScale && (cardBelowModel || aboveSpace < minScale);
    var scale = Math.min(Math.max(1, view.readWidth / (2 * halfW)),
                         (view.right - view.left) / (2 * halfW), cardBelowModel ? belowSpace : aboveSpace);
    if (scale < minScale) return false;

    obj.scale.setScalar(scale);
    halfW *= scale;
    cardCenter.x = clamp(cardCenter.x, view.left + halfW, view.right - halfW);
    cardCenter.y = cardBelowModel ? belowEdge : aboveEdge;
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    baseEl.object3D.worldToLocal(cardCenter.unproject(cam));
    vEnd.copy(cardCenter);
    obj.position.copy(vEnd).addScaledVector(vUp, cardHeight * scale * (cardBelowModel ? -0.5 : 0.5));
    return true;
  }

  function updateOverlay(dt) {
    if (!overlayBuilt) return;
    if (!modelReady || v.phase === 'loading' || v.phase === 'error' || !v.markerVisible) {
      hot.visible = false;
      cardMesh.visible = false;
      lineObj.visible  = false;
      return;
    }
    var cam = sceneEl.camera;
    if (!cam || !sceneEl.canvas) return;
    cam.getWorldQuaternion(qCam);

    var prog = clamp(intro.t / INTRO_MS, 0, 1);
    var a    = clamp((prog - 0.85) / 0.15, 0, 1);
    var t    = performance.now() / 1000;

    // Chấm sáng dẫn sang lớp kế tiếp
    hot.visible = hasDot && a > 0.01;
    if (hot.visible) {
      pivot.object3D.getWorldQuaternion(qTmp);
      hot.quaternion.copy(qTmp).invert().multiply(qCam);
      hot.scale.setScalar(1 / zoom);

      dotMesh.material.opacity = a;
      dotMesh.scale.setScalar(1 + 0.08 * Math.sin(t * 4));
      ringMeshes.forEach(function (r, i) {
        var p = (t / 1.8 + i * 0.5) % 1;
        r.scale.setScalar(0.3 + p * 1.1);
        r.material.opacity = Math.pow(1 - p, 1.3) * 0.9 * a;
      });
    }

    // Thẻ thông tin (bật/tắt khi chạm vào mô hình)
    cardT = clamp(cardT + (cardOpen ? dt : -dt) / CARD_ANIM_MS, 0, 1);
    var s = easeOut(cardT);
    if (s <= 0.01) {
      cardMesh.visible = lineObj.visible = false;
      return;
    }

    anchor.getWorldPosition(vBase);
    baseEl.object3D.worldToLocal(vBase);
    baseEl.object3D.getWorldQuaternion(qTmp);

    var obj = cardEl.object3D;
    obj.quaternion.copy(qTmp).invert().multiply(qCam);
    vUp.set(0, 1, 0).applyQuaternion(obj.quaternion);
    cardMesh.visible = placeCardBesideModel(obj, cam);
    v.cardNeedsSpace = cardOpen && !cardMesh.visible;
    lineObj.visible = cardMesh.visible && !cardBelowModel && s > 0.3;
    if (!cardMesh.visible) return;
    cardMat.opacity = s;
    var pos = lineGeo.attributes.position;
    pos.setXYZ(0, vBase.x, vBase.y, vBase.z);
    pos.setXYZ(1, vEnd.x,  vEnd.y,  vEnd.z);
    pos.needsUpdate = true;
  }

  v.onFrame = function (dt, showContent) {
    baseEl.object3D.visible = showContent;
    if (v.phase === 'outro') {
      intro.t -= dt * (INTRO_MS / OUTRO_MS);
      if (intro.t <= 0) {
        intro.t = 0;
        apply();
        loadStage(pendingIdx);
      } else {
        apply();
      }
    } else if (v.phase === 'intro' && modelReady && v.markerVisible) {
      intro.t = Math.min(INTRO_MS, intro.t + dt);
      apply();
      if (intro.t >= INTRO_MS) v.phase = 'idle';
    }
    updateOverlay(dt);
  };

  // ── Chế độ calib: in toạ độ chấm sáng tại điểm chạm ────────
  function calibReport(pointWorld) {
    var p  = pivot.object3D.worldToLocal(pointWorld.clone());
    var sx = (box.max.x - box.min.x) || 1;
    var sy = (box.max.y - box.min.y) || 1;
    var sz = (box.max.z - box.min.z) || 1;
    var txt = 'dot: { fx: ' + ((p.x - box.min.x) / sx).toFixed(2) +
              ', fy: '      + ((p.y - box.min.y) / sy).toFixed(2) +
              ', fz: '      + ((p.z - box.min.z) / sz).toFixed(2) + ' }';
    calibDot.position.copy(p);
    calibDot.scale.setScalar(1 / zoom);
    calibDot.visible = true;
    calibBox.textContent   = 'stage: ' + v.stage().id + '\n' + txt;
    calibBox.style.display = 'block';
    console.log('[calib] ' + v.stage().id + '  ' + txt);
  }

  // ── Chạm ───────────────────────────────────────────────────
  v.handleTap = function (x, y) {
    if (!v.markerVisible || v.phase !== 'idle' || !overlayBuilt) return;
    var cam = sceneEl.camera;
    var cv  = sceneEl.canvas;
    if (!cam || !cv) return;
    var r = cv.getBoundingClientRect();

    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    ray.setFromCamera(ndc, cam);

    // Thẻ hiển thị trên cùng nên nhận thao tác trước chấm sáng và mô hình.
    if (cardOpen && cardMesh.visible) {
      var cardHit = ray.intersectObject(cardMesh, false)[0];
      if (cardHit) { handleCardTap(cardHit.uv); return; }
    }

    // Chạm chấm sáng → sang lớp kế tiếp
    if (hot.visible) {
      hot.getWorldPosition(vHot);
      vHot.project(cam);
      var sx = r.left + (vHot.x * 0.5 + 0.5) * r.width;
      var sy = r.top  + (-vHot.y * 0.5 + 0.5) * r.height;
      if (Math.hypot(x - sx, y - sy) <= HIT_PX) { v.goTo(v.stageIdx + 1); return; }
    }

    // Chạm vào mô hình → bật/tắt thẻ thông tin (hoặc lấy toạ độ nếu đang calib)
    var model = modelEl.getObject3D('mesh');
    var hits  = model ? ray.intersectObject(model, true) : [];
    if (hits.length) {
      if (CALIB) calibReport(hits[0].point);
      else if (cardOpen && cardContent === v.stage()) v.closeCard();
      else v.showCard(v.stage());
      return;
    }

    v.closeCard();
  };

  v.init = function () {
    buildOverlay();
    if (!cfg.loadOnSight || v.markerVisible) loadStage(0);
  };

  return v;
}

// ── Nạp sẵn các lớp sâu hơn sau khi các mô hình khởi động đã xong ──
var initialModelsPending = SCENES.filter(function (cfg) { return !cfg.loadOnSight; }).length;
function onFirstSettled() {
  if (--initialModelsPending > 0) return;
  var urls = [];
  SCENES.forEach(function (s) {
    s.stages.slice(1).forEach(function (st) { urls.push(st.model); });
  });
  (function next() {
    var u = urls.shift();
    if (!u) return;
    var l = new THREE.FileLoader();
    l.setResponseType('arraybuffer');
    l.load(u, next, undefined, next);
  })();
}

SCENES.forEach(function (cfg) { viewers.push(createViewer(cfg, onFirstSettled)); });

// ── HUD / nút theo trạng thái ────────────────────────────────
var statusEl = $('marker-status');
var hintEl   = document.querySelector('#hud .hint');
var backBtn  = $('back-btn');
var calibNext = $('calib-next');
var uiCache  = {};

function uiSet(key, val, fn) {
  if (uiCache[key] === val) return;
  uiCache[key] = val;
  fn(val);
}

function updateUI() {
  if (!started) return;
  var cur  = current;
  var now  = Date.now();
  var anyVisible = viewers.some(function (v) { return v.markerVisible; });
  var patternGate = sceneEl.components['wait-for-patterns'];

  var text, cls;
  if (patternGate && patternGate.status === 'loading') {
    text = '⏳ Đang tải bộ marker…';
    cls  = 'status status-searching';
  } else if (patternGate && patternGate.status === 'error') {
    text = '⚠️ Chưa tải đủ bộ marker. Kiểm tra kết nối hoặc tải lại trang.';
    cls  = 'status status-error';
  } else if (cur && cur.phase === 'error') {
    text = '⚠️ Không tải được ' + cur.error;
    cls  = 'status status-error';
  } else if (cur && cur.markerVisible && cur.phase === 'loading') {
    text = '⏳ Đang tải mô hình...';
    cls  = 'status status-searching';
  } else if (anyVisible) {
    text = '✅ Marker đã nhận diện!';
    cls  = 'status status-found';
  } else {
    text = '🔍 Đang tìm marker...';
    cls  = 'status status-searching';
  }
  uiSet('status', text + '|' + cls, function () { statusEl.textContent = text; statusEl.className = cls; });

  var hint;
  if (!cur || !cur.markerVisible) hint = '📌 Hướng camera vào marker trong sổ tay';
  else if (CALIB)                 hint = '🎯 CALIB: chạm lên mô hình để lấy toạ độ chấm sáng';
  else if (cur.cardNeedsSpace)     hint = 'Lùi camera hoặc đưa marker xuống thấp để chừa chỗ cho thẻ.';
  else if (cur.stageIdx < cur.count - 1)
    hint = '👆 Chạm vào mô hình để xem thông tin · chạm chấm sáng để xem chi tiết hơn';
  else
    hint = '👆 Chạm vào mô hình để xem thông tin';
  uiSet('hint', hint, function (t) { hintEl.textContent = t; });

  var showBack = !!cur && cur.stageIdx > 0 && (cur.markerVisible || now - cur.lostAt < 1500);
  uiSet('back', showBack ? '‹ ' + cur.prevTitle() : '', function (t) {
    backBtn.style.display = t ? 'block' : 'none';
    backBtn.textContent   = t;
  });

  uiSet('history', !!cur && cur.markerVisible && cur.phase === 'idle' && cur.id === 'tuong-phat-hoang', function (on) {
    historyTopics.hidden = !on;
  });

  uiSet('calib', CALIB && !!cur && cur.stageIdx < cur.count - 1, function (on) {
    calibNext.style.display = on ? 'block' : 'none';
  });
}

window.onFrame = function (dt) {
  dt = Math.min(dt, 50);
  var tracked = viewers.filter(function (v) { return v.isTracked(); });
  viewers.forEach(function (v) {
    // Giữ độ trễ khi mất dấu, nhưng ẩn mẫu cũ khi camera đã nhận ra marker khác.
    v.onFrame(dt, tracked.length === 0 || tracked.includes(v));
  });
  updateUI();
};

// ── Kéo / chạm (cảm ứng + chuột) → tác động lên marker đang xem ──
function target() { return current && current.markerVisible ? current : null; }

var drag         = null;
var lastTouchAt  = 0;
var lastTapAt    = 0;

function recentTouch() { return Date.now() - lastTouchAt < 1000; }

function ignoreEvent(e) {
  return e.target && e.target.closest && e.target.closest('button');
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

  var t = target();
  if (!t) return;
  var dYaw = 0, dPitch = 0;
  if (!AXIS_LOCK || drag.lock === 'x') dYaw   = dx * SENS_ROT * YAW_DIR;
  if (!AXIS_LOCK || drag.lock === 'y') dPitch = dy * SENS_ROT * PITCH_DIR;
  t.rotate(dYaw, dPitch);
}

function dragEnd() {
  var d = drag; drag = null;
  if (!d || d.noTap || d.moved >= 18 || Date.now() - d.t >= 600) return;
  var now = Date.now();
  if (now - lastTapAt < 300) return;
  lastTapAt = now;
  var t = target();
  if (t) t.handleTap(d.sx, d.sy);
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
  if (e.touches.length === 2) {
    var d = pinchDist(e.touches);
    var t = target();
    if (lastPinch && t) t.zoomBy(d / lastPinch);
    lastPinch = d;
    return;
  }
  if (e.touches.length === 1) dragMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

document.addEventListener('touchend', function (e) {
  lastTouchAt = Date.now();
  lastPinch   = null;
  if (e.touches.length === 1) {
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
  var t = target();
  if (t) t.zoomBy(Math.exp(-e.deltaY * 0.001));
}, { passive: true });

// ── Khởi động ────────────────────────────────────────────────
function startAll() {
  viewers.forEach(function (v) { v.init(); });
}

if (sceneEl.hasLoaded) startAll();
else sceneEl.addEventListener('loaded', startAll);
