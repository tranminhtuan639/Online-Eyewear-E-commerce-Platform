import api from './axios'

// Bấm 1 lần: nếu chưa thích -> thêm vào yêu thích, nếu đã thích -> bỏ yêu thích.
// Bắt buộc phải đăng nhập (backend sẽ trả lỗi 401 nếu chưa đăng nhập).
export const toggleYeuThich = (sanPhamId) =>
  api.post('/yeuthich/toggle.php', { sanpham_id: sanPhamId })

// Danh sách sản phẩm mà NGƯỜI ĐANG ĐĂNG NHẬP đã yêu thích (trang "Yêu thích của tôi").
// params: { page, limit } - backend tự lấy user từ session, không cần truyền nguoidung_id.
export const listYeuThich = (params = {}) =>
  api.get('/yeuthich/list.php', { params })
