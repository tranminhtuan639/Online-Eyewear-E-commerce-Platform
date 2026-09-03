// Chuyển tên sản phẩm thành slug URL: bỏ dấu tiếng Việt, viết thường,
// thay khoảng trắng/ký tự đặc biệt bằng dấu gạch ngang.
// VD: "Gọng Kính Titan Cao Cấp" -> "gong-kinh-titan-cao-cap"
export function taoSlug(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu (huyền, sắc, hỏi, ngã, nặng...)
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // ký tự không phải chữ/số -> gạch ngang
    .replace(/^-+|-+$/g, '') // bỏ gạch ngang thừa ở đầu/cuối
}

// Tạo đường dẫn trang chi tiết sản phẩm dạng thân thiện SEO, giống Shopee:
// /san-pham/gong-kinh-titan-cao-cap-i.cd8e065d-5cdb-4ab6-8e51-6f10daa16d46
export function duongDanSanPham(sanPham) {
  const slug = taoSlug(sanPham?.ten) || 'san-pham'
  return `/san-pham/${slug}-i.${sanPham.id}`
}

// Lấy lại id thật từ tham số URL (phần sau "-i." cuối cùng).
// Vẫn hỗ trợ link cũ chỉ có id trần (không có "-i.") để không bị vỡ link đã chia sẻ trước đó.
export function layIdTuSlug(slugParam = '') {
  const idx = slugParam.lastIndexOf('-i.')
  return idx === -1 ? slugParam : slugParam.slice(idx + 3)
}
