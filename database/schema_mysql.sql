-- =====================================================
-- SCHEMA MYSQL (chuyển đổi từ PostgreSQL/Supabase)
-- Lưu ý: KHÔNG còn Row Level Security (RLS).
-- Toàn bộ phân quyền "user chỉ xem dữ liệu của mình"
-- phải được kiểm tra thủ công trong code PHP.
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================
-- BẢNG NGƯỜI DÙNG
-- =====================
CREATE TABLE nguoidung (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  mat_khau_hash VARCHAR(255) NOT NULL,          -- thay cho Supabase Auth: dùng password_hash()/password_verify() trong PHP
  ho_ten        VARCHAR(100) NOT NULL,
  vai_tro       ENUM('khachhang','quanly') NOT NULL DEFAULT 'khachhang',
  tao_luc       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG SẢN PHẨM
-- =====================
CREATE TABLE sanpham (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  ten           VARCHAR(255) NOT NULL,
  loai          ENUM('gong','trong','phukien') NOT NULL,
  gia           DECIMAL(12,2) NOT NULL CHECK (gia >= 0),
  so_luong_ton  INT NOT NULL DEFAULT 0 CHECK (so_luong_ton >= 0),
  mo_ta         TEXT,  -- nội dung HTML từ TinyMCE/CKEditor, đã được lọc trước khi lưu (xem helpers/Sanitize.php)
  tao_luc       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tách bảng ảnh riêng thay vì 2 cột hinh_anh_a/hinh_anh_b cố định,
-- để 1 sản phẩm có thể có bao nhiêu ảnh cũng được (đúng yêu cầu "upload nhiều ảnh").
CREATE TABLE sanpham_hinhanh (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  sanpham_id  CHAR(36) NOT NULL,
  duong_dan   VARCHAR(500) NOT NULL,   -- đường dẫn tương đối, vd: uploads/sanpham/abc.jpg
  thu_tu      INT NOT NULL DEFAULT 0,  -- thứ tự hiển thị, ảnh đầu tiên = ảnh đại diện
  tao_luc     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hinhanh_sanpham FOREIGN KEY (sanpham_id)
    REFERENCES sanpham (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG ĐƠN KÍNH (thông số đo mắt kính)
-- =====================
CREATE TABLE don_kinh (
  id              CHAR(36) NOT NULL PRIMARY KEY,
  nguoidung_id    CHAR(36) NOT NULL,
  od_cau          DECIMAL(5,2),
  os_cau          DECIMAL(5,2),
  khoang_dong_tu  DECIMAL(5,2),
  file_url        TEXT,
  ghi_chu         TEXT,
  tao_luc         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_donkinh_nguoidung FOREIGN KEY (nguoidung_id)
    REFERENCES nguoidung (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG ĐƠN HÀNG
-- =====================
CREATE TABLE donhang (
  id                    CHAR(36) NOT NULL PRIMARY KEY,
  nguoidung_id          CHAR(36) NOT NULL,
  trang_thai ENUM(
    'cho_thanh_toan',
    'cho_xac_nhan',
    'dang_xu_ly',
    'dang_giao',
    'hoan_thanh',
    'da_huy',
    'yeu_cau_hoan_tra',
    'cho_duyet_tra_hang',
    'dang_hoan_hang',
    'da_tra_hang_hoan_tien',
    'tu_choi_hoan_tra'
  ) NOT NULL DEFAULT 'cho_thanh_toan',
  tong_tien             DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (tong_tien >= 0),
  ho_ten_nguoi_nhan     VARCHAR(100),
  so_dien_thoai         VARCHAR(20),
  dia_chi               TEXT,
  ly_do_hoan_tra        TEXT,
  ten_ngan_hang         VARCHAR(100),
  so_tai_khoan          VARCHAR(50),
  ten_chu_tai_khoan     VARCHAR(100),
  ly_do_tu_choi         TEXT,
  tao_luc               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_donhang_nguoidung FOREIGN KEY (nguoidung_id)
    REFERENCES nguoidung (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG CHI TIẾT ĐƠN HÀNG
-- =====================
CREATE TABLE donhang_chitiet (
  id            CHAR(36) NOT NULL PRIMARY KEY,
  donhang_id    CHAR(36) NOT NULL,
  sanpham_id    CHAR(36) NOT NULL,
  don_kinh_id   CHAR(36),
  so_luong      INT NOT NULL CHECK (so_luong > 0),
  gia_ban       DECIMAL(12,2) NOT NULL CHECK (gia_ban >= 0),
  tao_luc       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ct_donhang FOREIGN KEY (donhang_id)
    REFERENCES donhang (id) ON DELETE CASCADE,
  CONSTRAINT fk_ct_sanpham FOREIGN KEY (sanpham_id)
    REFERENCES sanpham (id) ON DELETE RESTRICT,
  CONSTRAINT fk_ct_donkinh FOREIGN KEY (don_kinh_id)
    REFERENCES don_kinh (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_donhang_nguoidung ON donhang (nguoidung_id);
CREATE INDEX idx_donhang_trangthai ON donhang (trang_thai);
CREATE INDEX idx_donkinh_nguoidung ON don_kinh (nguoidung_id);
CREATE INDEX idx_ct_donhang ON donhang_chitiet (donhang_id);
CREATE INDEX idx_ct_sanpham ON donhang_chitiet (sanpham_id);
CREATE INDEX idx_hinhanh_sanpham ON sanpham_hinhanh (sanpham_id);

SET FOREIGN_KEY_CHECKS = 1;