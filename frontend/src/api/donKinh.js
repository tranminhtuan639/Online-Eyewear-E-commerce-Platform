import api from './axios'

/**
 * data: { od_cau, os_cau, khoang_dong_tu, ghi_chu, file (optional, đối tượng File) }
 * Luôn gửi dạng FormData vì backend dùng $_POST (để hỗ trợ kèm file toa kính khi cần).
 */
function toFormData(data) {
  const fd = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      fd.append(key, value)
    }
  })
  return fd
}

export const createDonKinh = (data) =>
  api.post('/donkinh/create.php', toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// params: { page, limit, nguoidung_id } - nguoidung_id chỉ admin dùng được, khách tự động lấy đơn của mình
export const listDonKinh = (params = {}) =>
  api.get('/donkinh/list.php', { params })

export const getDonKinhById = (id) =>
  api.get('/donkinh/detail.php', { params: { id } })

export const updateDonKinh = (id, data) =>
  api.post('/donkinh/update.php', toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { id },
  })

export const deleteDonKinh = (id) =>
  api.delete('/donkinh/delete.php', { params: { id } })
