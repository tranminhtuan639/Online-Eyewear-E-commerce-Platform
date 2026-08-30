# Online Eyewear E-commerce Platform

Hệ thống bán mắt kính trực tuyến — bao gồm frontend (React + Vite) và backend (PHP + MySQL).

**Demo:** [rtv-eyewear-web.vercel.app](https://rtv-eyewear-web.vercel.app/) *(cập nhật lại domain nếu đổi)*

---

## Công nghệ sử dụng

**Frontend**
- React 19 + Vite 8
- React Router DOM 7 (client-side routing)
- Tailwind CSS 4
- Axios (gọi API)
- Recharts (biểu đồ thống kê cho trang admin)
- React Quill New (soạn nội dung rich text)

**Backend**
- PHP 8.2+ (thuần, không framework)
- MySQL (qua PDO)
- Session-based authentication (cookie)

**Hạ tầng**
- Frontend deploy trên **Vercel**
- Backend + Database deploy trên **Railway**

---

## Cấu trúc thư mục

```
├── database/
│   └── schema_mysql.sql      # Schema database MySQL
├── frontend/                  # React + Vite
│   ├── public/                 # Ảnh tĩnh, favicon, logo
│   ├── src/
│   │   ├── api/                # Các module gọi API (axios)
│   │   ├── assets/              # Ảnh, banner
│   │   ├── components/          # Component tái sử dụng (Header, Footer, ProductCard...)
│   │   │   └── admin/            # Component riêng cho trang quản trị
│   │   ├── context/             # AuthContext, CartContext (React Context API)
│   │   ├── pages/                # Các trang chính
│   │   │   └── admin/             # Các trang quản trị (dashboard, đơn hàng, sản phẩm...)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.production          # Biến môi trường khi build production
│   ├── vercel.json               # Rewrite rule cho SPA routing (fix lỗi 404 khi F5)
│   └── vite.config.js            # Cấu hình dev proxy tới backend local
│
├── php-backend/                # API backend
│   ├── api/                      # Các endpoint (auth, sanpham, donhang...)
│   ├── config/                    # Cấu hình DB, app
│   ├── helpers/                    # EnvLoader, Cors...
│   ├── middleware/                  # Auth middleware (session, cookie)
│   ├── composer.json
│   └── index.php                    # Health check endpoint
│
├── docker-compose.yml           # Chạy MySQL + phpMyAdmin local
└── start.ps1                     # Script tự động: bật MySQL, chạy backend + frontend cùng lúc (Windows)
```

---

## Chạy dự án ở local

### Yêu cầu

- Docker Desktop (đang chạy)
- PHP >= 8.2 (đã thêm vào PATH)
- Node.js + npm

### Cách 1 — Chạy tự động bằng script (Windows/PowerShell)

Đã có sẵn file `start.ps1` ở thư mục gốc, chỉ cần chạy:

```powershell
.\start.ps1
```

Script sẽ tự động:
1. Khởi động container MySQL (`matkinhDb`) qua Docker Compose.
2. Đợi MySQL sẵn sàng (tối đa 60 giây).
3. Mở 2 cửa sổ PowerShell riêng: một chạy PHP built-in server (`php -S localhost:8000`), một chạy `npm run dev` cho frontend.

Sau khi chạy xong:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

### Cách 2 — Chạy thủ công từng phần (mọi hệ điều hành)

**Backend:**
```bash
docker compose up -d mysql   # khởi động MySQL
cd php-backend
php -S localhost:8000
```
Tạo file `.env` (dựa theo `.env.example`) với thông tin kết nối MySQL local trước khi chạy.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Khi chạy `npm run dev`, Vite sẽ tự proxy các request `/api` và `/uploads` sang `http://localhost:8000` (cấu hình sẵn trong `vite.config.js`), không cần khai báo thêm biến môi trường gì.

---

## Biến môi trường

### Frontend (`frontend/.env.production`)

| Biến | Mô tả |
|---|---|
| `VITE_API_BASE_URL` | URL gốc của backend khi build production, ví dụ `https://reinforcevision.up.railway.app` |

### Backend (Railway → Variables)

| Biến | Mô tả |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Thông tin kết nối MySQL |
| `CORS_ALLOWED_ORIGINS` | Danh sách domain frontend được phép gọi API (cách nhau bằng dấu phẩy), ví dụ `https://rtv-eyewear-web.vercel.app` |

---

## Tài khoản test (dữ liệu mẫu local)

Sau khi import `database/schema_mysql.sql` (hoặc file seed data), có sẵn 4 tài khoản sau để test:

| Email | Mật khẩu | Vai trò |
|---|---|---|
| `admin@matkinh.com` | `Qq147898` | `quanly` (quản trị) |
| `testvannguyen234@gmail.com` | `testvannguyen234@gmail.com` | `khachhang` |
| `test639@gmail.com` | `test639@gmail.com` | `khachhang` |
| `fthosejbro@gmail.com` | `fthosejbro@gmail.com` | `khachhang` |

> Các tài khoản khách hàng có mật khẩu trùng với chính email của nó (dễ nhớ khi test).


---

## Deploy

- **Frontend (Vercel):** connect repo GitHub → Root Directory = `frontend` → Environment `VITE_API_BASE_URL` trỏ về domain Railway → Production Branch = `advanced`.
- **Backend + Database (Railway):** deploy trực tiếp từ repo → thêm biến `CORS_ALLOWED_ORIGINS` khớp domain Vercel hiện tại.

> Lưu ý: mỗi lần domain Vercel đổi (project mới, custom domain...), phải cập nhật lại `CORS_ALLOWED_ORIGINS` trên Railway, không thì bị lỗi CORS.

