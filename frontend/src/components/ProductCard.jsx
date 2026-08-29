import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getImageUrl } from '../api/axios'
import { toggleYeuThich } from '../api/yeuThich'

const loaiLabel = {
  gong: 'Gọng kính',
  trong: 'Tròng kính',
  phukien: 'Phụ kiện',
}

export default function ProductCard({ product, onUnfavorited }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [hovered, setHovered] =
    useState(false)

  // Khởi tạo từ dữ liệu backend trả về (da_yeu_thich, luot_yeu_thich),
  // sau đó tự quản lý state riêng để bấm ♡ phản hồi ngay (optimistic update).
  const [daYeuThich, setDaYeuThich] =
    useState(Boolean(product.da_yeu_thich))

  const [luotYeuThich, setLuotYeuThich] =
    useState(Number(product.luot_yeu_thich || 0))

  const [dangXuLyYeuThich, setDangXuLyYeuThich] =
    useState(false)

  const imageA =
    getImageUrl(product.anh_a)

  const imageB =
    getImageUrl(product.anh_b)

  const currentImage =
    hovered && imageB
      ? imageB
      : imageA

  const gia =
    Number(product.gia || 0)

  const oldPrice =
    product.gia_cu
      ? Number(product.gia_cu)
      : 0

  const hetHang =
    product.so_luong_ton === 0

  // Badge ưu tiên: hết hàng > badge do backend tính sẵn (sale/mới/bán chạy).
  // Backend chỉ trả tối đa 1 badge/sản phẩm theo thứ tự Sale% > Mới > Bán chạy.
  const badge =
    hetHang
      ? { loai: 'het_hang', nhan: 'Hết hàng' }
      : product.badge || null

  const handleProductClick = () => {
    navigate(
      `/san-pham/${product.id}`
    )
  }

  const handleAddToCart = (event) => {
    event.stopPropagation()

    if (hetHang) {
      return
    }

    addToCart(product)
  }

  const handleToggleFavorite = async (event) => {
    event.stopPropagation()

    // Chưa đăng nhập -> chuyển tới trang đăng nhập thay vì gọi API (sẽ bị 401)
    if (!user) {
      navigate('/dang-nhap')
      return
    }

    if (dangXuLyYeuThich) {
      return
    }

    const trangThaiTruoc = daYeuThich
    const luotTruoc = luotYeuThich

    // Cập nhật giao diện ngay (optimistic), rollback lại nếu API lỗi
    setDaYeuThich(!trangThaiTruoc)
    setLuotYeuThich(
      trangThaiTruoc
        ? Math.max(0, luotTruoc - 1)
        : luotTruoc + 1
    )
    setDangXuLyYeuThich(true)

    try {
      const res = await toggleYeuThich(product.id)
      const data = res.data?.data || {}

      setDaYeuThich(Boolean(data.da_yeu_thich))
      setLuotYeuThich(
        typeof data.luot_yeu_thich === 'number'
          ? data.luot_yeu_thich
          : luotTruoc
      )

      // Vừa bỏ yêu thích -> báo lên component cha (vd: trang "Yêu thích")
      // để ẩn thẻ sản phẩm này khỏi danh sách ngay lập tức.
      if (!data.da_yeu_thich && onUnfavorited) {
        onUnfavorited(product.id)
      }
    } catch (error) {
      console.error(
        'Lỗi khi cập nhật yêu thích:',
        error
      )

      // Rollback về trạng thái trước khi bấm
      setDaYeuThich(trangThaiTruoc)
      setLuotYeuThich(luotTruoc)
    } finally {
      setDangXuLyYeuThich(false)
    }
  }

  return (
    <article className="product-card">

      {/* =========================
          IMAGE
      ========================= */}

      <div
        className="product-image-wrap"
        onClick={handleProductClick}
        onMouseEnter={() =>
          setHovered(true)
        }
        onMouseLeave={() =>
          setHovered(false)
        }
      >

        {/* BADGE */}

        {badge && (
          <span
            className={
              `product-badge badge-${badge.loai}`
            }
          >
            {badge.nhan}
          </span>
        )}


        {/* FAVORITE */}

        <button
          type="button"
          className={
            `favorite ${
              daYeuThich ? 'active' : ''
            }`
          }
          onClick={handleToggleFavorite}
          disabled={dangXuLyYeuThich}
          aria-label={
            daYeuThich
              ? 'Bỏ yêu thích'
              : 'Yêu thích'
          }
        >
          {daYeuThich ? '♥' : '♡'}
        </button>


        {/* PRODUCT IMAGE */}

        {currentImage ? (
          <img
            src={currentImage}
            alt={product.ten}
          />
        ) : (
          <span className="product-placeholder">
            👓
          </span>
        )}

      </div>


      {/* =========================
          PRODUCT INFO
      ========================= */}

      <div className="product-info">

        {/* BRAND */}

        <span className="product-brand">
          {product.thuong_hieu ||
            loaiLabel[product.loai] ||
            'BÁNKÍNH.VN'}
        </span>


        {/* NAME */}

        <h3
          onClick={handleProductClick}
        >
          {product.ten}
        </h3>


        {/* PRICE */}

        <div className="price-row">

          <strong>
            {gia.toLocaleString('vi-VN')}₫
          </strong>

          {oldPrice > gia && (
            <del>
              {oldPrice.toLocaleString('vi-VN')}₫
            </del>
          )}

        </div>


        {/* LƯỢT YÊU THÍCH */}

        {luotYeuThich > 0 && (
          <span className="luot-yeu-thich">
            ♥ {luotYeuThich} lượt thích
          </span>
        )}


        {/* ADD CART */}

        <button
          type="button"
          className="add-cart"
          onClick={handleAddToCart}
          disabled={hetHang}
        >
          {hetHang
            ? 'Hết hàng'
            : 'Thêm vào giỏ'}
        </button>

      </div>

    </article>
  )
}
