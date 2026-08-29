import Footer from '../components/Footer'

export default function ChinhSachThanhToanPage() {
  return (
    <>
      <div className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">Chính sách thanh toán</h1>

          <section className="policy-section">
            <h2>CHÍNH SÁCH THANH TOÁN</h2>
          </section>

          <section className="policy-section">
            <h2>I. Thanh toán khi nhận hàng (COD)</h2>
            <p className="policy-text">
              Khi mua hàng từ xa, Quý khách có thể lựa chọn hình thức thanh toán khi nhận hàng (COD) tại địa điểm giao hàng đã thỏa thuận.
            </p>
            <p className="policy-text">
              Chi phí vận chuyển sẽ được áp dụng theo chính sách vận chuyển của Kính mắt RTV hoặc theo thỏa thuận cụ thể giữa các bên.
            </p>

            <div className="policy-note">
              <p>
                <strong>Lưu ý:</strong> Quý khách có trách nhiệm thanh toán đầy đủ giá trị còn lại của đơn hàng cho nhân viên giao hàng hoặc đơn vị vận chuyển ngay sau khi kiểm tra hàng hóa và nhận hóa đơn.
              </p>
            </div>
          </section>

          <section className="policy-section">
            <h2>II. Thanh toán chuyển khoản ngân hàng</h2>
            <div className="policy-highlight">
              <p className="policy-text" style={{ margin: 0 }}>
                Hiện tại website chưa hỗ trợ thanh toán trực tuyến. Kính mong quý khách thông cảm!
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}