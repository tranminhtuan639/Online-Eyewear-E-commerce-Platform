import api from './axios'

export const listDanhGia = (sanPhamId) =>
  api.get('/danhgia/list.php', { params: { sanpham_id: sanPhamId } })

// { sanpham_id, so_sao, noi_dung } - gọi lại lần 2 với sanpham_id đã đánh giá
// sẽ CẬP NHẬT đánh giá cũ (backend làm upsert), không tạo dòng mới.
export const guiDanhGia = ({ sanPhamId, soSao, noiDung }) =>
  api.post('/danhgia/create.php', {
    sanpham_id: sanPhamId,
    so_sao: soSao,
    noi_dung: noiDung,
  })

export const xoaDanhGia = (id) =>
  api.delete('/danhgia/delete.php', { params: { id } })
