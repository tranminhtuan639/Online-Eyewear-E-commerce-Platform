# 👓 Online Eyewear E-commerce Platform

Hệ thống bán mắt kính trực tuyến — bao gồm **Frontend** (React + Vite) và **Backend** (PHP thuần + MySQL).

🔗 **Demo Online:** [rtv-eyewear-web.vercel.app](https://rtv-eyewear-web.vercel.app)

## 📌 Tính năng chính

### 👤 Khách hàng

- **Tài khoản:** Đăng ký / Đăng nhập (hỗ trợ đăng nhập qua Google), quản lý hồ sơ cá nhân.
- **Sản phẩm:** Duyệt & tìm kiếm sản phẩm (lọc theo tiêu chí, sắp xếp, phân trang), xem đánh giá, thêm vào danh sách yêu thích.
- **Đơn hàng:** Giỏ hàng & thanh toán trực tuyến, quản lý đơn hàng (theo dõi trạng thái, hủy đơn, gửi yêu cầu hoàn trả).

### 🛠️ Quản trị viên (Admin)

- **Dashboard:** Thống kê doanh thu, đơn hàng bằng biểu đồ trực quan.
- **Quản lý:** Quản lý danh mục sản phẩm, đơn hàng, khách hàng và duyệt các yêu cầu hoàn trả.

## 🛠️ Công nghệ sử dụng

### Frontend

- **Core:** React 19 + Vite 8
- **Routing:** React Router DOM 7 (Client-side routing)
- **Styling & UI:** Tailwind CSS 4
- **State & Data:** React Context API, Axios
- **Libraries:** Recharts (Biểu đồ thống kê Admin), React Quill New (Soạn thảo Rich Text)

### Backend

- **Core:** PHP 8.2+ (PHP thuần, không dùng framework)
- **Database:** MySQL (Kết nối qua PDO, áp dụng Prepared Statement chống SQL Injection)
- **Authentication:** Stateless JWT — Token gửi qua Header `Authorization: Bearer <token>` ở mỗi request (tránh bị chặn cookie cross-domain trên trình duyệt mobile/iOS)

### Hạ tầng & Deploy

- **Frontend:** Vercel
- **Backend & Database:** Railway

## 📂 Cấu trúc thư mục

```
├── database/
│   └── schema_mysql.sql        # Schema database MySQL
├── frontend/                   # Source code React + Vite
│   ├── public/                 # Ảnh tĩnh, favicon, logo
│   ├── src/
│   │   ├── api/                # Module gọi API (Axios)
│   │   ├── assets/             # Banner, tài nguyên hình ảnh
│   │   ├── components/         # Component tái sử dụng (Header, Footer, ProductCard...)
│   │   │   └── admin/          # Component riêng cho trang quản trị
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── pages/               # Trang phía người dùng
│   │   │   └── admin/           # Trang quản trị (Dashboard, Đơn hàng, Sản phẩm...)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.production          # Biến môi trường cho production
│   ├── vercel.json               # Rewrite rule cho SPA routing (Fix lỗi 404 khi F5)
│   └── vite.config.js            # Cấu hình dev proxy tới backend local
│
├── php-backend/                 # Source code API PHP
│   ├── api/                     # Các endpoint (auth, sanpham, donhang...)
│   ├── config/                  # Cấu hình DB, App
│   ├── helpers/                 # EnvLoader, Cors...
│   ├── middleware/               # Auth middleware (Kiểm tra JWT)
│   ├── composer.json
│   └── index.php                 # Health check endpoint
│
├── docker-compose.yml            # Container MySQL + phpMyAdmin local
└── start.ps1                     # Script tự động bật MySQL + Backend + Frontend (Windows)
```

## 🚀 Hướng dẫn chạy dự án ở Local

### Yêu cầu môi trường

- **Docker Desktop** (Đang hoạt động)
- **PHP >= 8.2** (Đã thêm vào biến môi trường PATH)
- **Node.js & npm**

### Cách 1: Chạy tự động bằng Script (Khuyên dùng trên Windows)

Thực thi file `start.ps1` tại thư mục gốc bằng PowerShell:

```powershell
.\start.ps1
```

**Kịch bản tự động:**

1. Khởi động container MySQL (`matkinhDb`) qua Docker Compose.
2. Chờ MySQL sẵn sàng (tối đa 60s).
3. Tự động mở 2 cửa sổ terminal riêng biệt:
   - **Backend:** Running at http://localhost:8000 (PHP built-in server)
   - **Frontend:** Running at http://localhost:5173 (npm run dev)

### Cách 2: Chạy thủ công từng phần

#### 1. Backend & Database

```bash
# 1. Khởi động MySQL local
docker compose up -d mysql

# 2. Di chuyển vào thư mục backend & khởi chạy server
cd php-backend
php -S localhost:8000
```

> Lưu ý: Tạo file `.env` trong thư mục `php-backend/` (dựa trên `.env.example`) để cấu hình thông tin kết nối MySQL local và các biến môi trường trước khi chạy.

#### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite sẽ tự động proxy các request `/api` và `/uploads` sang `http://localhost:8000` (đã cấu hình sẵn trong `vite.config.js`).

## 🔑 Biến môi trường (Environment Variables)

### Frontend (`frontend/.env.production`)

| Biến | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | URL gốc của API Backend khi build production | `https://reinforcevision.up.railway.app` |

### Backend (Cấu hình trong file `php-backend/.env` hoặc trên Railway)

| Biến | Mô tả | Bắt buộc / Mặc định |
| :--- | :--- | :--- |
| `DB_HOST` | Địa chỉ máy chủ cơ sở dữ liệu MySQL | Bắt buộc (vd: `localhost`) |
| `DB_PORT` | Cổng kết nối MySQL (mặc định MySQL là 3306; dùng 3308 nếu máy đã có MySQL local chiếm port 3306) | Bắt buộc (vd: `3308`) |
| `DB_NAME` | Tên cơ sở dữ liệu MySQL | Bắt buộc (vd: `matkinh`) |
| `DB_USER` | Tài khoản truy cập cơ sở dữ liệu | Bắt buộc (vd: `matkinh`) |
| `DB_PASS` | Mật khẩu truy cập cơ sở dữ liệu | Bắt buộc |
| `APP_DEBUG` | Bật/tắt hiện chi tiết lỗi khi debug (`true` / `false`) | Mặc định: `true` (Production nên đặt `false`) |
| `CORS_ALLOWED_ORIGINS` | Danh sách domain Frontend được phép gọi API (cách nhau bởi dấu phẩy) | Bắt buộc (vd: `http://localhost:5173` hoặc domain Vercel) |
| `JWT_SECRET` | Khóa bí mật dùng để ký và xác thực JWT token | Bắt buộc |
| `GOOGLE_CLIENT_ID` | OAuth Client ID để xác thực "Đăng nhập bằng Google" | Tùy chọn |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret dùng kèm `GOOGLE_CLIENT_ID` để xác thực token phía server | Tùy chọn (kiểm tra lại: cần nếu backend verify token qua Google server-side) |
| `ALLOWED_GOOGLE_DOMAIN` | Lọc domain email được phép đăng nhập Google (để trống = không giới hạn) | Tùy chọn |
| `CLOUDINARY_CLOUD_NAME` | Tên cloud trên Cloudinary để lưu trữ ảnh online | Tùy chọn (Nếu trống sẽ lưu local vào `/uploads`) |
| `CLOUDINARY_API_KEY` | API Key tích hợp Cloudinary | Tùy chọn |
| `CLOUDINARY_API_SECRET` | API Secret tích hợp Cloudinary | Tùy chọn |

## 🧪 Tài khoản thử nghiệm (Local Seed Data)

> ⚠️ **Cảnh báo:** Các tài khoản bên dưới chỉ áp dụng khi test trên môi trường Local sau khi import file `database/matkinh_ready_for_local.sql`. **Nên đổi mật khẩu admin** trước khi đưa vào môi trường thực tế — không dùng lại các mật khẩu mẫu này ở production.

| Email | Mật khẩu | Vai trò |
| :--- | :--- | :--- |
| admin@matkinh.com | `<đổi mật khẩu mặc định trong seed data>` | **Quản trị viên (Admin)** |
| testvannguyen234@gmail.com | *(trùng với email)* | Khách hàng |
| test639@gmail.com | *(trùng với email)* | Khách hàng |
| fthosejbro@gmail.com | *(trùng với email)* | Khách hàng |

## 🌐 Cấu hình Deploy

- **Frontend (Vercel):** Connect repo GitHub → Root Directory: `frontend` → Thêm Environment Variable `VITE_API_BASE_URL` trỏ về domain Railway → Production Branch: **`<kiểm tra lại tên branch — "advanced" có vẻ chưa đúng>`**.
- **Backend & DB (Railway):** Deploy trực tiếp từ repo → Cập nhật các biến môi trường Backend trong tab Variables, đặc biệt là `CORS_ALLOWED_ORIGINS` trùng khớp với domain của Vercel để tránh lỗi CORS.