import axios from 'axios'

// Không dùng URL đầy đủ (http://localhost/...) nữa — dùng đường dẫn tương đối "/api"
// để Vite proxy (xem vite.config.js) chuyển tiếp sang backend PHP.
// Nhờ vậy trình duyệt coi frontend và backend là CÙNG 1 ORIGIN, cookie session
// (SameSite=Lax) mới được gửi kèm bình thường khi gọi API bằng fetch/axios.
//
// LƯU Ý KHI DEPLOY THẬT (không còn Vite dev server):
// phải để frontend (sau khi build) và backend PHP chạy chung 1 domain/origin,
// hoặc cấu hình lại CORS + đổi cookie sang SameSite=None; Secure (bắt buộc có HTTPS).
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

/**
 * Ghép đường dẫn ảnh tương đối (backend trả về vd: "uploads/sanpham/abc.jpg")
 * thành URL dùng được với <img>. Cũng đi qua proxy "/uploads" ở vite.config.js.
 */
export function getImageUrl(relativePath) {
  if (!relativePath) return null
  return `/${relativePath}`
}

export default api