import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { listSanPham } from '../api/sanPham'

import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'
import FavoriteProductsSection from '../components/FavoriteProductsSection'
import Footer from '../components/Footer'

import banner1 from '../assets/banner-1.webp'
import banner2 from '../assets/banner-2.webp'
import banner3 from '../assets/banner-3.avif'


const LIMIT = 8


/* =========================================================
   LOẠI SẢN PHẨM
========================================================= */

const loaiOptions = [
  {
    value: '',
    label: 'Tất cả',
  },
  {
    value: 'gong',
    label: 'Gọng kính',
  },
  {
    value: 'trong',
    label: 'Tròng kính',
  },
  {
    value: 'phukien',
    label: 'Phụ kiện',
  },
]



/* =========================================================
   SẮP XẾP
========================================================= */

const sapXepOptions = [
  { value: 'moi_nhat', label: 'Mới nhất' },
  { value: 'gia_tang', label: 'Giá tăng dần' },
  { value: 'gia_giam', label: 'Giá giảm dần' },
]


/* =========================================================
   HERO SLIDES
========================================================= */

const slides = [
  {
    image: banner1,
    eyebrow: 'KÍNH MẮT RTV',
    title: (
      <>
        Nhìn rõ hơn.
        <br />
        Tự tin hơn.
      </>
    ),
    description:
      'Hàng chính hãng – giá hợp lý – đổi trả dễ dàng. Chọn kính vừa mắt, vừa phong cách.',
    button: 'Xem sản phẩm',
  },
  {
  image: banner2,

  eyebrow: 'PHONG CÁCH',

  title: (
    <>
      Gọng kính
      <br />
      cho mọi dáng mặt
    </>
  ),

  description:
    'Từ gọng thanh mảnh đến cá tính – chọn mẫu hợp khuôn mặt và outfit hàng ngày.',

  button: 'Khám phá gọng kính',

  filterLoai: 'gong',   // ← chỉ slide này có
},
  {
    image: banner3,
    eyebrow: 'ĐA DẠNG MẪU MÃ',
    title: (
      <>
        Hàng trăm mẫu kính
        <br />
        chờ bạn chọn
      </>
    ),
    description:
      'Gọng – tròng – phụ kiện. Đo mắt & tư vấn miễn phí tại hệ thống RTV.',
    button: 'Xem tất cả',
  },
]


export default function HomePage() {

  /* =======================================================
     SEARCH
  ======================================================= */

  const [searchParams] =
    useSearchParams()

  const search =
    searchParams.get('search') || ''


  /* =======================================================
     PRODUCTS ("SẢN PHẨM" - có phân trang)
  ======================================================= */

  const [products, setProducts] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [loai, setLoai] =
    useState('')

  const [sapXep, setSapXep] =
    useState('moi_nhat')

  const [currentPage, setCurrentPage] =
    useState(1)

  const [totalPages, setTotalPages] =
    useState(1)

  const [tongSoDong, setTongSoDong] =
    useState(0)


  /* =======================================================
     HERO
  ======================================================= */

  const [slide, setSlide] =
    useState(0)


  /* =======================================================
     AUTO SLIDE
     5 GIÂY
  ======================================================= */

  useEffect(() => {

    const timer =
      window.setInterval(() => {

        setSlide(
          current =>
            (current + 1) %
            slides.length
        )

      }, 5000)

    return () =>
      window.clearInterval(timer)

  }, [])


  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {

    const timer =
      window.setTimeout(() => {

        setLoading(true)

        listSanPham({
          page: currentPage,
          limit: LIMIT,
          loai,
          search,
          sap_xep: sapXep,
        })

          .then(res => {

            const data =
              res.data?.data || {}

            const items =
              data.items || []

            const phanTrang =
              data.phan_trang || {}

            setProducts(items)

            setTotalPages(
              phanTrang.tong_so_trang || 1
            )

            setTongSoDong(
              phanTrang.tong_so_dong || 0
            )

          })

          .catch(error => {

            console.error(
              'Lỗi tải sản phẩm:',
              error
            )

            setProducts([])

          })

          .finally(() => {

            setLoading(false)

          })

      }, 180)

    return () =>
      window.clearTimeout(timer)

  }, [
    currentPage,
    loai,
    search,
    sapXep,
  ])


  /* =======================================================
     FILTER
  ======================================================= */

  const handleLoaiChange = (
    value
  ) => {

    setLoai(value)

    setCurrentPage(1)
  }


  const handleSapXepChange = (
    event
  ) => {

    setSapXep(event.target.value)

    setCurrentPage(1)
  }


  /* =======================================================
     SLIDER
  ======================================================= */

  const previousSlide = () => {

    setSlide(
      current =>
        (
          current -
          1 +
          slides.length
        ) %
        slides.length
    )
  }


  const nextSlide = () => {

    setSlide(
      current =>
        (
          current +
          1
        ) %
        slides.length
    )
  }


  const scrollToProducts = () => {
  document
    .getElementById('products')
    ?.scrollIntoView({ behavior: 'smooth' })
}

const handleSlideCta = (item) => {
  // Chỉ khi slide có filterLoai thì mới đổi filter
  if (item.filterLoai != null) {
    setLoai(item.filterLoai)   // → 'gong'
    setCurrentPage(1)
  }
  scrollToProducts()
}


  return (
    <div className="storefront">


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="hero-slider"
        aria-label="Khuyến mãi nổi bật"
      >

        {slides.map(
          (item, index) => (

            <article
              key={index}
              className={
                `hero-slide ${
                  index === slide
                    ? 'active'
                    : ''
                }`
              }
              style={{
                backgroundImage: `
                  linear-gradient(
                    90deg,
                    rgba(25,22,18,.74) 0%,
                    rgba(25,22,18,.42) 44%,
                    rgba(25,22,18,.10) 78%
                  ),
                  url(${item.image})
                `,
              }}
            >

              <div className="hero-copy">

                <span className="hero-eyebrow">
                  {item.eyebrow}
                </span>


                <h1>
                  {item.title}
                </h1>


                <p>
                  {item.description}
                </p>


                <button
  type="button"
  onClick={() => handleSlideCta(item)}
>
  {item.button}
  {' →'}
</button>

              </div>

            </article>

          )
        )}


        {/* PREVIOUS */}

        <button
          type="button"
          className="slider-arrow left"
          onClick={previousSlide}
          aria-label="Ảnh trước"
        >
          ‹
        </button>


        {/* NEXT */}

        <button
          type="button"
          className="slider-arrow right"
          onClick={nextSlide}
          aria-label="Ảnh tiếp theo"
        >
          ›
        </button>


        {/* DOTS */}

        <div className="slider-dots">

          {slides.map(
            (_, index) => (

              <button
                type="button"
                key={index}
                className={
                  index === slide
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setSlide(index)
                }
                aria-label={
                  `Slide ${index + 1}`
                }
              />

            )
          )}

        </div>

      </section>


      {/* =====================================================
          BENEFITS
      ===================================================== */}

      <section className="benefits">

        <Benefit
          icon="▣"
          title="Đổi trả 7 ngày"
          text="Không vừa ý hoàn toàn hoàn tiền, không tính thêm điều kiện"
        />

        <Benefit
          icon="⇥"
          title="Giao hàng hỏa tốc"
          text="Nội thành TP.HCM và Hà Nội nhận hàng trong 2–4 giờ"
        />

        <Benefit
          icon="♢"
          title="Thời gian bảo hành lên đến 120 ngày"
          text="Gọng và tròng kính được bảo hành chính hãng tại tất cả cửa hàng"
        />

      </section>


      {/* =====================================================
          SẢN PHẨM ĐƯỢC YÊU THÍCH NHẤT
          (component riêng, tự quản lý state + fetch)
      ===================================================== */}

      <main className="home-content">

        <FavoriteProductsSection />


        {/* =================================================
            SẢN PHẨM (đóng khung riêng)
        ================================================= */}

        <section className="products-section section-frame" id="products">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                DANH MỤC
              </span>

              <h2>
                Sản phẩm
              </h2>

            </div>

          </div>


          {/* =================================================
              FILTER
          ================================================= */}

          <div className="filter-bar">

            <div className="filter-inner">

              {loaiOptions.map(
                option => (

                  <button
                    type="button"
                    key={option.value}
                    className={
                      `filter-pill ${
                        loai === option.value
                          ? 'active'
                          : ''
                      }`
                    }
                    onClick={() =>
                      handleLoaiChange(
                        option.value
                      )
                    }
                  >
                    {option.label}
                  </button>

                )
              )}


              <span className="price-label">
                Sắp xếp:
              </span>


              <select
                className="price-select"
                value={sapXep}
                onChange={handleSapXepChange}
              >

                {sapXepOptions.map(
                  option => (

                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>

                  )
                )}

              </select>

            </div>

          </div>


          {/* SEARCH */}

          {search && (

            <div className="search-summary">

              Đang tìm kiếm:

              {' '}

              <strong>
                “{search}”
              </strong>

              {' · '}

              {tongSoDong}
              {' sản phẩm'}

            </div>

          )}


          {/* LOADING */}

          {loading ? (

            <div className="loading-state">
              Đang tải sản phẩm...
            </div>

          ) : products.length === 0 ? (

            <div className="empty-state">
              Không tìm thấy sản phẩm nào.
            </div>

          ) : (

            <>

              <div
                className="products-grid"
                id="products-grid"
              >

                {products.map(
                  product => (

                    <ProductCard
                      key={product.id}
                      product={product}
                    />

                  )
                )}

              </div>


              <Pagination
                currentPage={
                  currentPage
                }
                totalPages={
                  totalPages
                }
                onPageChange={
                  setCurrentPage
                }
              />

            </>

          )}

        </section>


        {/* =================================================
            CONSULTATION BANNER
        ================================================= */}

        <section
          className="consult-banner"
        >

          <div>

            <span>
              DỊCH VỤ ĐẶC BIỆT
            </span>


            <h2>
              Đo mắt & tư vấn kính
              <br />
              miễn phí tại nhà
            </h2>


            <p>
              Optometrist chuyên nghiệp
              đến tận nơi, kiểm tra mắt
              và tư vấn chọn kính phù hợp
              không mất thêm chi phí.
            </p>

          </div>


          <Link
  to="/do-mat-tu-van"
  className="consult-banner-btn"
>
  Đặt lịch ngay →
</Link>


          <i
            className="bubble bubble-one"
          />

          <i
            className="bubble bubble-two"
          />

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />

    </div>
  )
}


/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
  icon,
  title,
  text,
}) {
  return (
    <div className="benefit">

      <span className="benefit-icon">
        {icon}
      </span>

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>

      </div>

    </div>
  )
}