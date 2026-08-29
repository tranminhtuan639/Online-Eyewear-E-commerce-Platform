import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getImageUrl } from '../api/axios'


/* =========================================================
   ROUTES
   Nếu project của mày dùng route khác thì chỉ cần sửa ở đây
========================================================= */

const ROUTES = {
  home: '/',
  orders: '/don-hang',
  cart: '/gio-hang',
  favorites: '/yeu-thich',
  account: '/tai-khoan',
  admin: '/admin',
  login: '/dang-nhap',
}


export default function Header() {

  const navigate = useNavigate()

  const { cartItems } = useCart()

  const { user, logout } = useAuth()


  /* =======================================================
     USER DROPDOWN
  ======================================================= */

  const [isMenuOpen, setIsMenuOpen] =
    useState(false)

  const menuRef = useRef(null)


  /* =======================================================
     CART COUNT
  ======================================================= */

  const tongSoLuong = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.soLuong || 0),
    0
  )


  /* =======================================================
     ROLE
  ======================================================= */

  const role =
    user?.vai_tro ||
    user?.role ||
    ''


  /*
   * Chỉ role "quanly" được thấy
   * "Quản trị hệ thống"
   */

  const isQuanLy =
    role === 'quanly'


  /* =======================================================
     USER NAME
  ======================================================= */

  const displayName =
    user?.ho_ten ||
    user?.name ||
    user?.ten ||
    'Tài khoản'


  const avatarText =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase()


  /* =======================================================
     CLICK OUTSIDE DROPDOWN
  ======================================================= */

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setIsMenuOpen(false)
      }

    }


    document.addEventListener(
      'mousedown',
      handleClickOutside
    )


    return () => {

      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )

    }

  }, [])


  /* =======================================================
     ESC ĐỂ ĐÓNG DROPDOWN
  ======================================================= */

  useEffect(() => {

    const handleEscape = (event) => {

      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }

    }


    document.addEventListener(
      'keydown',
      handleEscape
    )


    return () => {

      document.removeEventListener(
        'keydown',
        handleEscape
      )

    }

  }, [])


  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = (event) => {

    if (event.key !== 'Enter') {
      return
    }


    const keyword =
      event.currentTarget.value.trim()


    if (!keyword) {

      navigate(
        ROUTES.home
      )

      return

    }


    navigate(
      `${ROUTES.home}?search=${encodeURIComponent(keyword)}`
    )

  }


  /* =======================================================
     NAVIGATE + CLOSE MENU
  ======================================================= */

  const goTo = (path) => {

    setIsMenuOpen(false)

    navigate(path)

  }


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {

    setIsMenuOpen(false)

    try {

      await logout()

      navigate(
        ROUTES.home
      )

    } catch (error) {

      console.error(
        'Lỗi đăng xuất:',
        error
      )

    }

  }


  return (
    <header className="site-header">

      <div className="header-inner">


        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="header-left">


          {/* =========================
              LOGO
          ========================= */}

          <Link
  to={ROUTES.home}
  className="brand"
  aria-label="RTV - Reinforce the Vision"
>
  <img
    src="/logo.svg"
    alt="RTV"
    className="brand-logo"
  />
  <span className="brand-name">
    RTV
  </span>
</Link>


          {/* =========================
              SEARCH
          ========================= */}

          <div className="header-search">

            <SearchIcon />

            <input
              type="search"
              placeholder="Tìm kính theo tên, thương hiệu..."
              onKeyDown={handleSearch}
              aria-label="Tìm kiếm sản phẩm"
            />

          </div>

        </div>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <nav
          className="header-right"
          aria-label="Điều hướng chính"
        >


          {/* =================================================
              YÊU THÍCH
          ================================================= */}

          <button
            type="button"
            className="header-link-button"
            onClick={() =>
              goTo(ROUTES.favorites)
            }
          >

            <HeartIcon />

            <span>
              Yêu thích
            </span>

          </button>


          {/* =================================================
              ĐƠN HÀNG
          ================================================= */}

          <button
            type="button"
            className="header-link-button"
            onClick={() =>
              goTo(ROUTES.orders)
            }
          >

            <OrderIcon />

            <span>
              Đơn hàng
            </span>

          </button>


          {/* =================================================
              GIỎ HÀNG
          ================================================= */}

          <button
            type="button"
            className="header-link-button cart-header-button"
            onClick={() =>
              goTo(ROUTES.cart)
            }
          >

            <CartIcon />

            <span>
              Giỏ hàng
            </span>


            {/* CART BADGE */}

            {tongSoLuong > 0 && (

              <span className="cart-badge">

                {tongSoLuong > 99
                  ? '99+'
                  : tongSoLuong}

              </span>

            )}

          </button>


          {/* =================================================
              USER
          ================================================= */}

          <div
            className="user-menu-wrapper"
            ref={menuRef}
          >


            {/* USER BUTTON */}

            <button
              type="button"
              className={
                `user-menu-button ${
                  isMenuOpen
                    ? 'active'
                    : ''
                }`
              }
              onClick={() =>
                setIsMenuOpen(
                  current => !current
                )
              }
              aria-expanded={
                isMenuOpen
              }
              aria-haspopup="menu"
            >

              <span className="user-avatar">
                {user?.anh_dai_dien
                  ? <img src={getImageUrl(user.anh_dai_dien)} alt="" className="user-avatar-img" />
                  : (user ? avatarText : 'A')}
              </span>


              <span className="user-name">
                {user
                  ? displayName
                  : 'Đăng nhập'}
              </span>


              <ChevronDownIcon
                className={
                  isMenuOpen
                    ? 'rotate'
                    : ''
                }
              />

            </button>


            {/* =================================================
                DROPDOWN MENU
            ================================================= */}

            {isMenuOpen && (

              <div
                className="user-dropdown"
                role="menu"
              >


                {/* ===============================
                    USER INFO
                =============================== */}

                <div className="dropdown-user-info">

                  <span className="dropdown-avatar">
                    {user?.anh_dai_dien
                      ? <img src={getImageUrl(user.anh_dai_dien)} alt="" className="user-avatar-img" />
                      : (user ? avatarText : 'A')}
                  </span>

                  <div>

                    <strong>
                      {user
                        ? displayName
                        : 'Khách'}
                    </strong>

                    <span>
                      {user
                        ? (
                          user.email ||
                          'Tài khoản'
                        )
                        : 'Vui lòng đăng nhập'}
                    </span>

                  </div>

                </div>


                <div className="dropdown-divider" />


                {/* =================================================
                    QUẢN TRỊ HỆ THỐNG
                    CHỈ ROLE QUANLY
                ================================================= */}

                {isQuanLy && (

                  <button
                    type="button"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() =>
                      goTo(ROUTES.admin)
                    }
                  >

                    <span className="dropdown-icon">
                      <SettingsIcon />
                    </span>

                    <span>
                      Quản trị hệ thống
                    </span>

                  </button>

                )}


                {/* =================================================
                    THÔNG TIN TÀI KHOẢN
                ================================================= */}

                <button
                  type="button"
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() =>
                    goTo(ROUTES.account)
                  }
                >

                  <span className="dropdown-icon">
                    <UserIcon />
                  </span>

                  <span>
                    Thông tin tài khoản
                  </span>

                </button>


                {/* =================================================
                    YÊU THÍCH
                ================================================= */}

                <button
                  type="button"
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() =>
                    goTo(ROUTES.favorites)
                  }
                >

                  <span className="dropdown-icon">
                    <HeartIcon />
                  </span>

                  <span>
                    Yêu thích
                  </span>

                </button>


                {/* =================================================
                    ĐƠN HÀNG
                ================================================= */}

                <button
                  type="button"
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() =>
                    goTo(ROUTES.orders)
                  }
                >

                  <span className="dropdown-icon">
                    <OrderIcon />
                  </span>

                  <span>
                    Đơn hàng
                  </span>

                </button>


                {/* =================================================
                    GIỎ HÀNG
                ================================================= */}

                <button
                  type="button"
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() =>
                    goTo(ROUTES.cart)
                  }
                >

                  <span className="dropdown-icon">
                    <CartIcon />
                  </span>

                  <span>
                    Giỏ hàng
                  </span>


                  {tongSoLuong > 0 && (

                    <span className="dropdown-cart-count">
                      {tongSoLuong}
                    </span>

                  )}

                </button>


                <div className="dropdown-divider" />


                {/* =================================================
                    ĐĂNG XUẤT
                ================================================= */}

                {user ? (

                  <button
                    type="button"
                    className="dropdown-item logout-item"
                    role="menuitem"
                    onClick={handleLogout}
                  >

                    <span className="dropdown-icon">
                      <LogoutIcon />
                    </span>

                    <span>
                      Đăng xuất
                    </span>

                  </button>

                ) : (

                  <button
                    type="button"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() =>
                      goTo(ROUTES.login)
                    }
                  >

                    <span className="dropdown-icon">
                      <LoginIcon />
                    </span>

                    <span>
                      Đăng nhập
                    </span>

                  </button>

                )}

              </div>

            )}

          </div>

        </nav>

      </div>

    </header>
  )
}


/* =========================================================
   SVG ICONS
========================================================= */


function SearchIcon() {

  return (
    <svg
      className="header-svg-icon search-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >

      <circle
        cx="11"
        cy="11"
        r="6.5"
      />

      <path
        d="m16 16 4.2 4.2"
        strokeLinecap="round"
      />

    </svg>
  )
}


function HeartIcon() {

  return (
    <svg
      className="header-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >

      <path
        d="M12 20.2s-7.2-4.4-9.6-9A5.3 5.3 0 0 1 12 6.4a5.3 5.3 0 0 1 9.6 4.8c-2.4 4.6-9.6 9-9.6 9Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

    </svg>
  )
}


function CartIcon() {

  return (
    <svg
      className="header-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >

      <path
        d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="10"
        cy="20"
        r="1.2"
      />

      <circle
        cx="18"
        cy="20"
        r="1.2"
      />

    </svg>
  )
}


function OrderIcon() {

  return (
    <svg
      className="header-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >

      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
      />

      <path
        d="M9 7h6"
        strokeLinecap="round"
      />

      <path
        d="m9 11 1.2 1.2L12.5 10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13.5 11H16"
        strokeLinecap="round"
      />

      <path
        d="m9 15 1.2 1.2L12.5 14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13.5 15H16"
        strokeLinecap="round"
      />

    </svg>
  )
}


function UserIcon() {

  return (
    <svg
      className="header-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >

      <circle
        cx="12"
        cy="8"
        r="3.5"
      />

      <path
        d="M5 20a7 7 0 0 1 14 0"
        strokeLinecap="round"
      />

    </svg>
  )
}


function SettingsIcon() {

  return (
    <svg
      className="header-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >

      <circle
        cx="12"
        cy="12"
        r="3"
      />

      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4h2.6v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.6h-.1a1.7 1.7 0 0 0-1.6 1Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

    </svg>
  )
}


function LogoutIcon() {

  return (
    <svg
      className="header-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >

      <path
        d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"
        strokeLinecap="round"
      />

      <path
        d="M14 8l4 4-4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M9 12h9"
        strokeLinecap="round"
      />

    </svg>
  )
}


function LoginIcon() {

  return (
    <svg
      className="header-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >

      <path
        d="M14 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4"
        strokeLinecap="round"
      />

      <path
        d="M10 8l-4 4 4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6 12h9"
        strokeLinecap="round"
      />

    </svg>
  )
}


function ChevronDownIcon({
  className = '',
}) {

  return (
    <svg
      className={
        `chevron-icon ${className}`
      }
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >

      <path
        d="m6 9 6 6 6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

    </svg>
  )
}