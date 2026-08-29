import Footer from '../components/Footer'

export default function ChinhSachBaoMatPage() {
  return (
    <>
      <div className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">Chính sách bảo mật</h1>

          <section className="policy-section">
            <h2>1. Mục đích thu thập thông tin cá nhân</h2>
            <p className="policy-text">
              Mục đích của việc thu thập thông tin khách hàng nhằm liên quan đến các vấn đề như:
            </p>
            <ul className="policy-list">
              <li>Hỗ trợ khách hàng: mua hàng, thanh toán, giao hàng.</li>
              <li>Cung cấp thông tin sản phẩm, các dịch vụ và hỗ trợ theo yêu cầu của khách hàng.</li>
              <li>Gửi thông báo các chương trình, sản phẩm mới nhất của chúng tôi.</li>
              <li>Giải quyết vấn đề phát sinh khi mua hàng.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>2. Phạm vi thu thập thông tin</h2>
            <p className="policy-text">
              Chúng tôi thu thập thông tin cá nhân của khách hàng khi tiến hành đặt hàng trên website:
            </p>
            <ul className="policy-list">
              <li>Họ tên</li>
              <li>Địa chỉ email</li>
              <li>Số điện thoại</li>
              <li>Địa chỉ</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Thời gian lưu trữ thông tin</h2>
            <p className="policy-text">
              Dữ liệu cá nhân của Thành viên sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ hoặc tự thành viên đăng nhập và thực hiện hủy bỏ. Còn lại trong mọi trường hợp thông tin cá nhân thành viên sẽ được bảo mật trên máy chủ của RTV.
            </p>
          </section>

          <section className="policy-section">
            <h2>4. Những người hoặc tổ chức có thể được tiếp cận với thông tin đó</h2>
            <ul className="policy-list">
              <li>
                Đối với các bên vận chuyển, sẽ cung cấp các thông tin để phục vụ cho việc giao nhận hàng hóa như Tên, địa chỉ và số điện thoại.
              </li>
              <li>
                Đối với nhân viên công ty sẽ có các bộ phận chuyên trách để phục vụ việc chăm sóc khách hàng trong quá trình sử dụng sản phẩm.
              </li>
              <li>
                Các chương trình có tính liên kết, đồng thực hiện, thuê ngoài cho các mục đích được nêu tại Mục 1 và luôn áp dụng các yêu cầu bảo mật thông tin cá nhân.
              </li>
              <li>
                Yêu cầu pháp lý: Chúng tôi có thể tiết lộ các thông tin cá nhân nếu điều đó do luật pháp yêu cầu và việc tiết lộ như vậy là cần thiết một cách hợp lý để tuân thủ các quy trình pháp lý.
              </li>
              <li>
                Chuyển giao kinh doanh (nếu có): trong trường hợp sáp nhập, hợp nhất toàn bộ hoặc một phần với công ty khác, người mua sẽ có quyền truy cập thông tin được chúng tôi lưu trữ, duy trì trong đó bao gồm cả thông tin cá nhân.
              </li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Phương thức và công cụ để người dùng tiếp cận và chỉnh sửa dữ liệu</h2>
            <p className="policy-text">
              Nếu quý khách có bất cứ yêu cầu nào về việc tiếp cận và chỉnh sửa thông tin cá nhân đã cung cấp, quý khách có thể:
            </p>
            <ul className="policy-list">
              <li>Gọi điện trực tiếp về số điện thoại: <strong>09xx xxx xxx</strong></li>
              <li>Gửi mail: <strong>matkinh@RTV.com</strong></li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>
              6. Cơ chế tiếp nhận và giải quyết khiếu nại của người tiêu dùng liên quan đến việc thông tin cá nhân bị sử dụng sai mục đích hoặc phạm vi đã thông báo
            </h2>
            <p className="policy-text">
              Đối với chúng tôi, việc bảo vệ thông tin cá nhân của bạn là rất quan trọng, bạn được đảm bảo rằng thông tin cung cấp cho chúng tôi sẽ được cam kết không chia sẻ, bán hoặc cho thuê thông tin cá nhân của bạn cho bất kỳ người nào khác. RTV cam kết chỉ sử dụng các thông tin của bạn vào các trường hợp sau:
            </p>
            <ul className="policy-list">
              <li>Nâng cao chất lượng dịch vụ dành cho khách hàng</li>
              <li>Giải quyết các tranh chấp, khiếu nại</li>
              <li>Khi cơ quan pháp luật có yêu cầu</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}