# AR 3D Viewer

Ứng dụng AR trên nền web — hiển thị mô hình 3D từ Blender qua camera điện thoại.

## 🚀 Cách deploy

### GitHub Pages (Khuyến nghị)

1. Tạo repository trên GitHub
2. Push toàn bộ project lên:
   ```bash
   git init
   git add .
   git commit -m "AR project"
   git branch -M main
   git remote add origin https://github.com/<USERNAME>/<REPO>.git
   git push -u origin main
   ```
3. Vào **Settings → Pages → Source: main branch → Save**
4. Đợi 1-2 phút → truy cập: `https://<USERNAME>.github.io/<REPO>/`

### Test local

```bash
npx http-server -p 8080
# Mở http://localhost:8080 trên trình duyệt
```

## 📱 Sử dụng

1. Mở trang `qr.html` trên máy tính → nhập URL đã deploy → tạo QR
2. Quét QR bằng điện thoại
3. Nhấn "Bắt đầu AR" rồi hướng camera vào marker tương ứng trong sổ tay. Có thể mở các ảnh mẫu sau để quét:
   - [Chánh Điện](marker/pattern_chanh_dien.png)
   - [Lầu Trống](marker/pattern_lau.png)
   - [Tượng Phật hoàng](marker/pattern_tuong.png)

## 📁 Cấu trúc

```
ar_project/
├── index.html          # Trang AR chính
├── qr.html             # Trang tạo QR code
├── models/
│   └── model.glb       # Mô hình 3D (xuất từ Blender)
└── README.md
```
