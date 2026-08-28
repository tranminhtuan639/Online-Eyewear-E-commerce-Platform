import api from './axios'

// ----- Auth (dùng session, không cần token) -----
export const login = (email, mat_khau) =>
  api.post('/auth/login.php', { email, mat_khau })

export const register = (email, mat_khau, ho_ten) =>
  api.post('/auth/register.php', { email, mat_khau, ho_ten })

export const logout = () => api.post('/auth/logout.php')

export const getMe = () => api.get('/auth/me.php')

// ----- Tự quản lý thông tin của chính mình -----
export const getProfile = () => api.get('/nguoidung/profile.php')
export const updateProfile = (ho_ten) => api.put('/nguoidung/profile.php', { ho_ten })
export const doiMatKhau = (mat_khau_cu, mat_khau_moi) =>
  api.post('/nguoidung/doi-mat-khau.php', { mat_khau_cu, mat_khau_moi })

// ----- Admin quản lý user -----
export const listNguoiDung = (params = {}) =>
  api.get('/nguoidung/list.php', { params })

export const getNguoiDungById = (id) =>
  api.get('/nguoidung/detail.php', { params: { id } })

export const createNguoiDungAdmin = (data) =>
  api.post('/nguoidung/create.php', data)

export const updateNguoiDungAdmin = (id, data) =>
  api.put('/nguoidung/update.php', data, { params: { id } })

export const deleteNguoiDungAdmin = (id) =>
  api.delete('/nguoidung/delete.php', { params: { id } })
