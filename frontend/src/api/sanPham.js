import api from './axios'

// params: { page, limit, loai, search }
export const listSanPham = (params = {}) =>
  api.get('/sanpham/list.php', { params })

export const getSanPhamById = (id) =>
  api.get('/sanpham/detail.php', { params: { id } })

/**
 * formData phải là đối tượng FormData (vì có upload ảnh), gồm các field:
 * ten, loai, gia, so_luong_ton, mo_ta, và nhiều 'hinh_anh' (append từng file)
 */
export const createSanPham = (formData) =>
  api.post('/sanpham/create.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

/**
 * formData thêm field 'id', và có thể có 'xoa_anh_ids' (nhiều lần append id ảnh cần xoá)
 * Lưu ý: dùng POST (không phải PUT) vì PHP không tự đọc được $_FILES khi method là PUT.
 */
export const updateSanPham = (id, formData) => {
  formData.append('id', id)
  return api.post('/sanpham/update.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { id },
  })
}

export const deleteSanPham = (id) =>
  api.delete('/sanpham/delete.php', { params: { id } })
