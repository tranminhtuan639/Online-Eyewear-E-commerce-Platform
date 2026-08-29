-- =====================================================
-- FILE GỘP TOÀN BỘ SCHEMA + MIGRATION
-- Thứ tự: schema gốc -> them_avatar -> danhgia -> yeuthich_sale
-- Import file này 1 lần duy nhất trong phpMyAdmin (KHÔNG cần chạy
-- từng file .sql riêng lẻ nữa). Không có dòng "USE ..." vì phpMyAdmin
-- đã chọn sẵn đúng database khi bấm Import.
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================
-- BẢNG NGƯỜI DÙNG
-- =====================
CREATE TABLE nguoidung (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  mat_khau_hash VARCHAR(255) NOT NULL,
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
  mo_ta         TEXT,
  tao_luc       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sanpham_hinhanh (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  sanpham_id  CHAR(36) NOT NULL,
  duong_dan   VARCHAR(500) NOT NULL,
  thu_tu      INT NOT NULL DEFAULT 0,
  tao_luc     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hinhanh_sanpham FOREIGN KEY (sanpham_id)
    REFERENCES sanpham (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG ĐƠN KÍNH
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
-- INDEXES (schema gốc)
-- =====================
CREATE INDEX idx_donhang_nguoidung ON donhang (nguoidung_id);
CREATE INDEX idx_donhang_trangthai ON donhang (trang_thai);
CREATE INDEX idx_donkinh_nguoidung ON don_kinh (nguoidung_id);
CREATE INDEX idx_ct_donhang ON donhang_chitiet (donhang_id);
CREATE INDEX idx_ct_sanpham ON donhang_chitiet (sanpham_id);
CREATE INDEX idx_hinhanh_sanpham ON sanpham_hinhanh (sanpham_id);

-- =====================
-- MIGRATION: them_avatar
-- =====================
ALTER TABLE nguoidung ADD COLUMN anh_dai_dien VARCHAR(255) NULL;

-- =====================
-- MIGRATION: đánh giá sản phẩm
-- =====================
CREATE TABLE sanpham_danhgia (
  id            CHAR(36)  NOT NULL PRIMARY KEY,
  sanpham_id    CHAR(36)  NOT NULL,
  nguoidung_id  CHAR(36)  NOT NULL,
  so_sao        TINYINT UNSIGNED NOT NULL CHECK (so_sao BETWEEN 1 AND 5),
  noi_dung      TEXT NULL,
  tao_luc       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_danhgia_sanpham FOREIGN KEY (sanpham_id)
    REFERENCES sanpham (id) ON DELETE CASCADE,

  CONSTRAINT fk_danhgia_nguoidung FOREIGN KEY (nguoidung_id)
    REFERENCES nguoidung (id) ON DELETE CASCADE,

  CONSTRAINT uq_danhgia_sanpham_user UNIQUE (sanpham_id, nguoidung_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_danhgia_sanpham ON sanpham_danhgia (sanpham_id);
CREATE INDEX idx_danhgia_nguoidung ON sanpham_danhgia (nguoidung_id);

-- =====================
-- MIGRATION: yêu thích + giá sale
-- =====================
ALTER TABLE sanpham
  ADD COLUMN gia_cu DECIMAL(12,2) NULL DEFAULT NULL
  COMMENT 'Giá gốc trước khi giảm. NULL hoặc <= gia nghĩa là không sale.'
  AFTER gia;

CREATE TABLE sanpham_yeuthich (
  id            CHAR(36)  NOT NULL PRIMARY KEY,
  sanpham_id    CHAR(36)  NOT NULL,
  nguoidung_id  CHAR(36)  NOT NULL,
  tao_luc       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_yeuthich_sanpham FOREIGN KEY (sanpham_id)
    REFERENCES sanpham (id) ON DELETE CASCADE,

  CONSTRAINT fk_yeuthich_nguoidung FOREIGN KEY (nguoidung_id)
    REFERENCES nguoidung (id) ON DELETE CASCADE,

  CONSTRAINT uq_yeuthich_sanpham_user UNIQUE (sanpham_id, nguoidung_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_yeuthich_sanpham ON sanpham_yeuthich (sanpham_id);
CREATE INDEX idx_yeuthich_nguoidung ON sanpham_yeuthich (nguoidung_id);

SET FOREIGN_KEY_CHECKS = 1;
