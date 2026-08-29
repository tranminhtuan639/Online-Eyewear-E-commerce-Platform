import { Link } from 'react-router-dom'

/* =========================================================
   FOOTER
========================================================= */

export default function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-grid">

        {/* BRAND */}
        <div className="footer-brand-column">

          <Link to="/" className="footer-brand">
  <img src="/logo.jpg" alt="RTV" className="brand-logo" />
  <span>RTV</span>
</Link>

          <p className="footer-description">
            Chuyên trang mua sắm kính mắt
            uy tín hàng đầu Việt Nam.
            Chính hãng – Giá tốt –
            Dịch vụ tận tâm.
          </p>

        </div>


        {/* POLICY */}

<FooterColumn
  title="Chính sách"
  items={[
    { label: 'Chính sách bảo hành, đổi trả', to: '/chinh-sach-bao-hanh' },
    { label: 'Chính sách vận chuyển', to: '/chinh-sach-van-chuyen' },
    { label: 'Chính sách thanh toán', to: '/chinh-sach-thanh-toan' },
    { label: 'Chính sách bảo mật', to: '/chinh-sach-bao-mat' },
  ]}
/>

{/* CONTACT */}
<div className="footer-contact-info">

  <div className="contact-item">
    <span className="contact-icon">◷</span>

    <div>
      <h3>Thời gian làm việc</h3>
      <p>Thứ 2 – Thứ 7: 9:00 – 21:00</p>
    </div>
  </div>


  <div className="contact-item">
    <span className="contact-icon">✆</span>

    <div>
      <h3>Hotline</h3>
      <p>09xx xxx xxx - 09xx xxx xxx</p>
    </div>
  </div>


  <div className="contact-item">
    <span className="contact-icon">✉</span>

    <div>
      <h3>Email</h3>
      <p>matkinh@RTV.com</p>
    </div>
  </div>
</div>

      </div>


      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">

        <span>
          © 2025 RTV – Mọi quyền được bảo lưu.
        </span>

        <span>
          WEB CHƯA HỖ TRỢ THANH TOÁN TRỰC TUYẾN. KÍNH MONG QUÝ KHÁCH THÔNG CẢM!
        </span>

      </div>

    </footer>
  )
}


/* =========================================================
   FOOTER COLUMN
========================================================= */

function FooterColumn({ title, items }) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>

      {items.map((item) => {
        const label = typeof item === 'string' ? item : item.label
        const to = typeof item === 'string' ? null : item.to

        if (to) {
          return (
            <p key={label}>
              <Link to={to} className="footer-policy-link">
                {label}
              </Link>
            </p>
          )
        }

        return <p key={label}>{label}</p>
      })}
    </div>
  )
}