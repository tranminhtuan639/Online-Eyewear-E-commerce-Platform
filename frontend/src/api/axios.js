import axios from 'axios'

// Khi chạy "npm run dev": VITE_API_BASE_URL thường để trống -> dùng "" (rỗng),
// nên baseURL sẽ là "/api" và đi qua proxy trong vite.config.js (localhost:8000).
//
// Khi deploy thật (frontend trên Vercel/Netlify, backend PHP trên Railway):
// đặt biến môi trường VITE_API_BASE_URL = https://reinforcevision.up.railway.app
// trong Environment Variables của Vercel (không có dấu "/" ở cuối).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const TOKEN_STORAGE_KEY = 'auth_token'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
})

// Đăng nhập giờ dùng JWT (header Authorization: Bearer ...) thay vì cookie session,
// vì cookie cross-domain (frontend Vercel <-> backend Railway) bị Safari/iOS và
// nhiều trình duyệt mobile khác chặn mặc định (ITP), không thể fix bằng cấu hình
// SameSite/Secure thông thường. Token lưu trong localStorage, gắn vào mọi request
// qua interceptor bên dưới.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Ghép đường dẫn ảnh tương đối (backend trả về vd: "uploads/sanpham/abc.jpg")
 * thành URL dùng được với <img>.
 * - Dev: đi qua proxy "/uploads" trong vite.config.js.
 * - Production (khác domain): dùng thẳng API_BASE_URL để trỏ về Railway.
 */
export function getImageUrl(relativePath) {
  if (!relativePath) return null
  return `${API_BASE_URL}/${relativePath}`
}

export default api