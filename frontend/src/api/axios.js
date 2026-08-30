import axios from 'axios'

// Khi chạy "npm run dev": VITE_API_BASE_URL thường để trống -> dùng "" (rỗng),
// nên baseURL sẽ là "/api" và đi qua proxy trong vite.config.js (localhost:8000).
//
// Khi deploy thật (frontend trên Vercel/Netlify, backend PHP trên Railway):
// đặt biến môi trường VITE_API_BASE_URL = https://reinforcevision.up.railway.app
// trong file .env.production (không có dấu "/" ở cuối). Lúc đó baseURL sẽ trỏ
// thẳng sang Railway, không phụ thuộc proxy nữa.
//
// LƯU Ý: vì 2 domain khác nhau nên bắt buộc:
//  - Backend PHP phải bật CORS cho đúng domain frontend + Access-Control-Allow-Credentials: true
//  - Cookie session PHP phải set SameSite=None; Secure (yêu cầu HTTPS ở cả 2 phía)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
})

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