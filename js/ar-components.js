// ══════════════════════════════════════════════════════════════
//  A-Frame components dùng chung
//   - frame-tick : gọi window.onFrame(dt) mỗi khung hình
//   - auto-fit   : co/căn mô hình về đúng kích thước, gốc ở GIỮA hộp bao,
//                  rồi phát sự kiện 'model-fitted' (chạy lại mỗi lần đổi model)
// ══════════════════════════════════════════════════════════════

AFRAME.registerComponent('frame-tick', {
  tick: function (time, dt) {
    if (window.onFrame) window.onFrame(dt);
  }
});

AFRAME.registerComponent('auto-fit', {
  schema: { size: { type: 'number', default: 1 } },

  init: function () {
    this.onLoaded = this.fit.bind(this);
    this.el.addEventListener('model-loaded', this.onLoaded);
  },

  remove: function () {
    this.el.removeEventListener('model-loaded', this.onLoaded);
  },

  fit: function () {
    var el   = this.el;
    var root = el.getObject3D('mesh');
    if (!root) return;

    var obj = el.object3D;
    obj.position.set(0, 0, 0);
    obj.scale.set(1, 1, 1);
    obj.updateWorldMatrix(true, true);

    // Hộp bao trong hệ toạ độ của chính entity (không phụ thuộc xoay/zoom của pivot)
    var inv = new THREE.Matrix4().copy(obj.matrixWorld).invert();
    var rel = new THREE.Matrix4();
    var tmp = new THREE.Box3();
    var box = new THREE.Box3();
    var meshes = [];

    root.traverse(function (o) {
      if (!o.isMesh || !o.geometry) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      rel.multiplyMatrices(inv, o.matrixWorld);
      tmp.copy(o.geometry.boundingBox).applyMatrix4(rel);
      box.union(tmp);
      meshes.push({ geo: o.geometry, m: rel.clone() });
    });
    if (box.isEmpty()) return;

    var size   = new THREE.Vector3();
    var center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    var s = this.data.size / Math.max(size.x, size.y, size.z, 1e-6);
    obj.scale.setScalar(s);
    obj.position.copy(center).multiplyScalar(-s);

    // Điểm cao nhất của mô hình (đỉnh mái): trung bình các đỉnh nằm sát độ cao max
    var v = new THREE.Vector3();
    var best = -Infinity;
    meshes.forEach(function (e) {
      var pos = e.geo.attributes.position;
      if (!pos) return;
      for (var i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(e.m);
        if (v.y > best) best = v.y;
      }
    });
    var eps = size.y * 0.01, sx = 0, sz = 0, n = 0;
    meshes.forEach(function (e) {
      var pos = e.geo.attributes.position;
      if (!pos) return;
      for (var i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(e.m);
        if (v.y >= best - eps) { sx += v.x; sz += v.z; n++; }
      }
    });
    if (!n) { n = 1; sx = center.x; sz = center.z; }

    function toPivot(x, y, z) {
      return { x: (x - center.x) * s, y: (y - center.y) * s, z: (z - center.z) * s };
    }

    document.dispatchEvent(new CustomEvent('model-fitted', {
      detail: {
        el:         el,
        halfHeight: size.y * s / 2,
        top:        toPivot(sx / n, best, sz / n),
        box:        { min: toPivot(box.min.x, box.min.y, box.min.z),
                      max: toPivot(box.max.x, box.max.y, box.max.z) }
      }
    }));
  }
});
