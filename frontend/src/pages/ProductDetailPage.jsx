import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getSanPhamById, listSanPham } from '../api/sanPham'
import { toggleYeuThich } from '../api/yeuThich'
import { listDanhGia, guiDanhGia, xoaDanhGia } from '../api/danhGia'
import { getImageUrl } from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'

const loaiLabel = {
  gong: 'Gọng kính',
  trong: 'Tròng kính',
  phukien: 'Phụ kiện',
}

// Hiển thị 5 sao dựa trên điểm trung bình (làm tròn tới 0.5), dùng cho cả điểm tổng
// và điểm của từng đánh giá riêng lẻ.
function renderStars(diem) {
  return (
    <span className="pd-stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(diem) ? 'filled' : ''}>★</span>
      ))}
    </span>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [soLuong, setSoLuong] = useState(1)
  const [added, setAdded] = useState(false)
  const [tab, setTab] = useState('mo_ta')
  const [similar, setSimilar] = useState([])

  const [daYeuThich, setDaYeuThich] = useState(false)
  const [luotYeuThich, setLuotYeuThich] = useState(0)
  const [dangXuLyYeuThich, setDangXuLyYeuThich] = useState(false)

  // ----- Đánh giá sản phẩm -----
  const [reviews, setReviews] = useState({
    items: [],
    tong_so_danh_gia: 0,
    diem_trung_binh: 0,
    danh_gia_cua_toi: null,
  })
  const [formSoSao, setFormSoSao] = useState(0)
  const [formHoverSao, setFormHoverSao] = useState(0)
  const [formNoiDung, setFormNoiDung] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  // Tải chi tiết sản phẩm mỗi khi id thay đổi
  useEffect(() => {
    setLoading(true)
    setActiveImg(0)
    setSoLuong(1)
    setTab('mo_ta')

    getSanPhamById(id)
      .then(res => {
        const data = res.data.data
        setProduct(data)
        setDaYeuThich(Boolean(data.da_yeu_thich))
        setLuotYeuThich(Number(data.luot_yeu_thich || 0))
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  // Sản phẩm tương tự: cùng loại, bỏ chính nó ra
  useEffect(() => {
    if (!product) return
    listSanPham({ loai: product.loai, limit: 5 })
      .then(res => {
        const items = (res.data.data.items || []).filter(sp => sp.id !== product.id)
        setSimilar(items.slice(0, 4))
      })
      .catch(() => setSimilar([]))
  }, [product?.id, product?.loai])

  // Tải danh sách đánh giá cùng lúc với sản phẩm
  useEffect(() => {
    if (!product?.id) return
    listDanhGia(product.id)
      .then(res => {
        const data = res.data.data
        setReviews(data)
        setFormSoSao(data.danh_gia_cua_toi?.so_sao || 0)
        setFormNoiDung(data.danh_gia_cua_toi?.noi_dung || '')
      })
      .catch(() => {})
  }, [product?.id])

  const handleSubmitReview = async (event) => {
    event.preventDefault()
    if (!user) {
      navigate('/dang-nhap')
      return
    }
    if (formSoSao < 1) {
      setReviewError('Vui lòng chọn số sao trước khi gửi')
      return
    }

    setSubmittingReview(true)
    setReviewError('')
    try {
      await guiDanhGia({ sanPhamId: product.id, soSao: formSoSao, noiDung: formNoiDung.trim() })
      const res = await listDanhGia(product.id)
      setReviews(res.data.data)
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!reviews.danh_gia_cua_toi) return
    if (!window.confirm('Xoá đánh giá của bạn cho sản phẩm này?')) return

    try {
      await xoaDanhGia(reviews.danh_gia_cua_toi.id)
      const res = await listDanhGia(product.id)
      setReviews(res.data.data)
      setFormSoSao(0)
      setFormNoiDung('')
    } catch (error) {
      console.error('Lỗi khi xoá đánh giá:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/dang-nhap')
      return
    }
    if (dangXuLyYeuThich) return

    const truoc = daYeuThich
    const luotTruoc = luotYeuThich

    setDaYeuThich(!truoc)
    setLuotYeuThich(truoc ? Math.max(0, luotTruoc - 1) : luotTruoc + 1)
    setDangXuLyYeuThich(true)

    try {
      const res = await toggleYeuThich(product.id)
      const data = res.data?.data || {}
      setDaYeuThich(Boolean(data.da_yeu_thich))
      setLuotYeuThich(typeof data.luot_yeu_thich === 'number' ? data.luot_yeu_thich : luotTruoc)
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu thích:', error)
      setDaYeuThich(truoc)
      setLuotYeuThich(luotTruoc)
    } finally {
      setDangXuLyYeuThich(false)
    }
  }

  const handleAddToCart = () => {
    for (let i = 0; i < soLuong; i++) addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    for (let i = 0; i < soLuong; i++) addToCart(product)
    navigate('/gio-hang')
  }

  if (loading) return <div className="loading-state">Đang tải...</div>
  if (!product) return null

  const anhList = product.hinh_anh || []
  const anhHienTai = anhList[activeImg] ? getImageUrl(anhList[activeImg].duong_dan) : null
  const gia = Number(product.gia || 0)
  const giaCu = product.gia_cu ? Number(product.gia_cu) : 0
  const dangSale = giaCu > gia
  const phanTramGiam = dangSale ? Math.round(((giaCu - gia) / giaCu) * 100) : 0
  const hetHang = product.so_luong_ton === 0
  const con = product.so_luong_ton || 0

  const prevImg = () => setActiveImg(i => (i - 1 + anhList.length) % anhList.length)
  const nextImg = () => setActiveImg(i => (i + 1) % anhList.length)

  return (
    <div>
      <div className="pd-container">

        {/* BREADCRUMB */}
        <nav className="pd-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>›</span>
          <Link to={`/?loai=${product.loai}`}>{loaiLabel[product.loai]}</Link>
          <span>›</span>
          <span className="pd-breadcrumb-current">{product.ten}</span>
        </nav>

        <div className="pd-main">

          {/* GALLERY */}
          <div className="pd-gallery">
            <div className="pd-main-image">
              {dangSale && <span className="pd-discount-tag">-{phanTramGiam}%</span>}

              <button
                type="button"
                className={`pd-fav-btn ${daYeuThich ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                disabled={dangXuLyYeuThich}
                aria-label={daYeuThich ? 'Bỏ yêu thích' : 'Yêu thích'}
              >
                {daYeuThich ? '♥' : '♡'}
              </button>

              {anhList.length > 1 && (
                <>
                  <button type="button" className="pd-arrow pd-arrow-left" onClick={prevImg} aria-label="Ảnh trước">‹</button>
                  <button type="button" className="pd-arrow pd-arrow-right" onClick={nextImg} aria-label="Ảnh sau">›</button>
                </>
              )}

              {anhHienTai ? (
                <img key={activeImg} src={anhHienTai} alt={product.ten} className="pd-fade-img" />
              ) : (
                <span className="product-placeholder">👓</span>
              )}

              {anhList.length > 1 && (
                <div className="pd-dots">
                  {anhList.map((anh, idx) => (
                    <span key={anh.id} className={idx === activeImg ? 'active' : ''} />
                  ))}
                </div>
              )}
            </div>

            {anhList.length > 1 && (
              <div className="pd-thumbs">
                {anhList.map((anh, idx) => (
                  <button
                    type="button"
                    key={anh.id}
                    className={`pd-thumb ${idx === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(idx)}
                  >
                    <img src={getImageUrl(anh.duong_dan)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="pd-info">
            <div className="pd-pills">
              <span className="pd-pill pd-pill-category">{loaiLabel[product.loai]}</span>
              {product.badge?.loai === 'ban_chay' && (
                <span className="pd-pill pd-pill-bestseller">Bestseller</span>
              )}
              {product.badge?.loai === 'moi' && (
                <span className="pd-pill pd-pill-new">Mới về</span>
              )}
              {dangSale && <span className="pd-pill pd-pill-sale">Đang giảm giá</span>}
            </div>

            <h1 className="pd-title">{product.ten}</h1>

            {product.tong_so_danh_gia > 0 && (
              <div className="pd-rating-row">
                {renderStars(product.diem_trung_binh)}
                <span className="pd-rating-value">{product.diem_trung_binh}</span>
                <span className="pd-rating-count">({product.tong_so_danh_gia} đánh giá)</span>
              </div>
            )}

            <div className="pd-price-row">
              <strong>{gia.toLocaleString('vi-VN')}₫</strong>
              {dangSale && (
                <>
                  <del>{giaCu.toLocaleString('vi-VN')}₫</del>
                  <span className="pd-discount-label">-{phanTramGiam}%</span>
                </>
              )}
            </div>

            <p className={`pd-stock ${hetHang ? 'out' : ''}`}>
              <span className="pd-stock-dot" />
              {hetHang ? 'Hết hàng' : `Còn ${con} sản phẩm trong kho`}
            </p>

            <div className="pd-qty-row">
              <span className="pd-qty-label">Số lượng</span>
              <div className="pd-qty-control">
                <button
                  type="button"
                  onClick={() => setSoLuong(q => Math.max(1, q - 1))}
                  disabled={soLuong <= 1}
                >
                  −
                </button>
                <span>{soLuong}</span>
                <button
                  type="button"
                  onClick={() => setSoLuong(q => Math.min(con, q + 1))}
                  disabled={hetHang || soLuong >= con}
                >
                  +
                </button>
              </div>
            </div>

            <div className="pd-actions">
              <button type="button" className="pd-btn-outline" onClick={handleAddToCart} disabled={hetHang}>
                {added ? '✓ Đã thêm!' : 'Thêm vào giỏ hàng'}
              </button>
              <button type="button" className="pd-btn-primary" onClick={handleBuyNow} disabled={hetHang}>
                Mua ngay
              </button>
            </div>

            <div className="pd-info-boxes">
              <div className="pd-info-box">
                <span className="pd-info-icon">⇥</span>
                <div>
                  <strong>Giao hỏa tốc</strong>
                  <p>2–4 giờ nội thành</p>
                </div>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-icon">▣</span>
                <div>
                  <strong>Đổi trả 7 ngày</strong>
                  <p>Miễn phí hoàn toàn</p>
                </div>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-icon">♢</span>
                <div>
                  <strong>Bảo hành lên đến 120 ngày</strong>
                  <p>Chính hãng toàn quốc</p>
                </div>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-icon">✦</span>
                <div>
                  <strong>Tư vấn phong cách</strong>
                  <p>Miễn phí 1-1</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="pd-tabs-card">
          <div className="pd-tabs-nav">
            <button
              type="button"
              className={tab === 'mo_ta' ? 'active' : ''}
              onClick={() => setTab('mo_ta')}
            >
              Mô tả sản phẩm
            </button>
            <button
              type="button"
              className={tab === 'danh_gia' ? 'active' : ''}
              onClick={() => setTab('danh_gia')}
            >
              Đánh giá{reviews.tong_so_danh_gia > 0 ? ` (${reviews.tong_so_danh_gia})` : ''}
            </button>
          </div>

          <div className="pd-tabs-body">
            {tab === 'mo_ta' && (
              product.mo_ta ? (
                // mo_ta là HTML từ editor ở trang admin, đã được backend lọc trước khi lưu
                <div className="pd-desc" dangerouslySetInnerHTML={{ __html: product.mo_ta }} />
              ) : (
                <p className="pd-empty">Chưa có mô tả cho sản phẩm này.</p>
              )
            )}

            {tab === 'danh_gia' && (
              <div className="pd-reviews">

                {/* FORM GỬI / SỬA ĐÁNH GIÁ */}
                {user ? (
                  <form className="pd-review-form" onSubmit={handleSubmitReview}>
                    <strong>
                      {reviews.danh_gia_cua_toi ? 'Sửa đánh giá của bạn' : 'Viết đánh giá'}
                    </strong>

                    <div className="pd-star-picker">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button
                          type="button"
                          key={i}
                          className={i <= (formHoverSao || formSoSao) ? 'filled' : ''}
                          onMouseEnter={() => setFormHoverSao(i)}
                          onMouseLeave={() => setFormHoverSao(0)}
                          onClick={() => setFormSoSao(i)}
                          aria-label={`${i} sao`}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <textarea
                      placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này (không bắt buộc)"
                      value={formNoiDung}
                      onChange={e => setFormNoiDung(e.target.value)}
                      maxLength={2000}
                      rows={3}
                    />

                    {reviewError && <p className="pd-review-error">{reviewError}</p>}

                    <div className="pd-review-form-actions">
                      <button type="submit" className="pd-btn-primary" disabled={submittingReview}>
                        {submittingReview
                          ? 'Đang gửi...'
                          : reviews.danh_gia_cua_toi ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                      </button>
                      {reviews.danh_gia_cua_toi && (
                        <button
                          type="button"
                          className="pd-review-delete"
                          onClick={handleDeleteReview}
                        >
                          Xoá đánh giá
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <p className="pd-review-login-prompt">
                    <Link to="/dang-nhap">Đăng nhập</Link> để viết đánh giá cho sản phẩm này.
                  </p>
                )}

                {/* DANH SÁCH ĐÁNH GIÁ */}
                {reviews.items.length > 0 ? (
                  <ul className="pd-review-list">
                    {reviews.items.map(dg => (
                      <li key={dg.id} className="pd-review-item">
                        <div className="pd-review-avatar">
                          {(dg.ho_ten || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="pd-review-body">
                          <div className="pd-review-head">
                            <strong>{dg.ho_ten}</strong>
                            <span>{new Date(dg.tao_luc).toLocaleDateString('vi-VN')}</span>
                          </div>
                          {renderStars(dg.so_sao)}
                          {dg.noi_dung && <p>{dg.noi_dung}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pd-empty">
                    Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SẢN PHẨM TƯƠNG TỰ */}
        {similar.length > 0 && (
          <div className="pd-similar">
            <h2>Sản phẩm tương tự</h2>
            <div className="pd-similar-grid">
              {similar.map(sp => (
                <Link to={`/san-pham/${sp.id}`} key={sp.id} className="pd-similar-card">
                  <div className="pd-similar-image">
                    {sp.anh_a ? (
                      <img src={getImageUrl(sp.anh_a)} alt={sp.ten} />
                    ) : (
                      <span className="product-placeholder">👓</span>
                    )}
                  </div>
                  <div className="pd-similar-body">
                    <h3>{sp.ten}</h3>
                    <strong>{Number(sp.gia).toLocaleString('vi-VN')}₫</strong>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  )
}
