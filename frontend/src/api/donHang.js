import api from './axios'

/**
 * data: {
 *   ho_ten_nguoi_nhan, so_dien_thoai, dia_chi,
 *   chi_tiet: [{ sanpham_id, so_luong, don_kinh_id }]
 * }
 * Không cần gửi nguoidung_id — backend tự lấy từ session đang đăng nhập.
 */
export const createDonHang = (data) => api.post('/donhang/create.php', data)

// params: { page, limit, trang_thai, nguoidung_id (chỉ admin dùng được) }
export const listDonHang = (params = {}) =>
  api.get('/donhang/list.php', { params })

export const getDonHangById = (id) =>
  api.get('/donhang/detail.php', { params: { id } })

export const huyDonHang = (id) =>
  api.post('/donhang/huy.php', {}, { params: { id } })

// Admin chuyển trạng thái vận chuyển: cho_xac_nhan -> dang_xu_ly -> dang_giao -> hoan_thanh
export const capNhatTrangThaiDonHang = (id, trang_thai) =>
  api.post('/donhang/cap-nhat-trang-thai.php', { trang_thai }, { params: { id } })

// data: { ly_do_hoan_tra, ten_ngan_hang, so_tai_khoan, ten_chu_tai_khoan }
export const yeuCauHoanTra = (id, data) =>
  api.post('/donhang/yeu-cau-hoan-tra.php', data, { params: { id } })

export const duyetHoanTra = (id) =>
  api.post('/donhang/duyet-hoan-tra.php', {}, { params: { id } })

export const tuChoiHoanTra = (id, ly_do_tu_choi) =>
  api.post('/donhang/tu-choi-hoan-tra.php', { ly_do_tu_choi }, { params: { id } })
