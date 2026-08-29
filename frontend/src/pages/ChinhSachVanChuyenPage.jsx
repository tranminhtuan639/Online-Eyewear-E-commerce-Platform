import Footer from '../components/Footer'

export default function ChinhSachVanChuyenPage() {
  return (
    <>
      <div className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">Chính sách vận chuyển</h1>

          <section className="policy-section">
            <h2>I. CƯỚC PHÍ VẬN CHUYỂN</h2>
            <p className="policy-text">
              Giao hàng thông thường qua đơn vị vận chuyển, tùy thuộc vào khoảng cách vị trí và trọng lượng đơn hàng sau đóng gói.
            </p>

            <h3 className="policy-subtitle">Hà Nội</h3>
            <ul className="policy-list">
              <li>Từ 0 – 2kg: <strong>16,500đ</strong></li>
              <li>Từ 2kg trở lên: <strong>24,000đ</strong></li>
              <li>Từ 5kg trở lên: <strong>32,000đ</strong></li>
              <li>Từ 8kg trở lên: <strong>45,000đ</strong></li>
              <li>Từ 10kg trở lên: <strong>60,000đ</strong></li>
              <li>Từ 12kg trở lên: <strong>100,000đ</strong></li>
              <li>Từ 15kg trở lên: <strong>150,000đ</strong></li>
            </ul>

            <h3 className="policy-subtitle">Hồ Chí Minh</h3>
            <ul className="policy-list">
              <li>Từ 0 – 2kg: <strong>40,000đ</strong></li>
              <li>Từ 2kg trở lên: <strong>60,000đ</strong></li>
              <li>Từ 5kg trở lên: <strong>80,000đ</strong></li>
              <li>Từ 8kg trở lên: <strong>100,000đ</strong></li>
              <li>Từ 10kg trở lên: <strong>120,000đ</strong></li>
              <li>Từ 12kg trở lên: <strong>150,000đ</strong></li>
              <li>Từ 15kg trở lên: <strong>200,000đ</strong></li>
            </ul>

            <h3 className="policy-subtitle">Tỉnh/thành phố còn lại</h3>
            <ul className="policy-list">
              <li>Từ 0 – 2kg: <strong>35,000đ</strong></li>
              <li>Từ 2kg trở lên: <strong>45,000đ</strong></li>
              <li>Từ 5kg trở lên: <strong>75,000đ</strong></li>
              <li>Từ 8kg trở lên: <strong>90,000đ</strong></li>
              <li>Từ 10kg trở lên: <strong>110,000đ</strong></li>
              <li>Từ 12kg trở lên: <strong>140,000đ</strong></li>
              <li>Từ 15kg trở lên: <strong>180,000đ</strong></li>
            </ul>

            <div className="policy-highlight">
              <p className="policy-text" style={{ margin: 0 }}>
                <strong>Giao hàng hỏa tốc nội thành Hà Nội</strong> (nhận trong ngày): liên hệ <strong>09xx xxx xxx</strong>{' '}
                để biết cước phí vận chuyển chính xác (Ahamove, Grab).
                Đối với đơn hàng hỏa tốc khách hàng cần thanh toán chuyển khoản trước tiền hàng,
                cước phí vận chuyển sẽ được thanh toán trực tiếp cho shipper khi nhận hàng.
              </p>
            </div>
          </section>

          <section className="policy-section">
            <h2>II. THỜI GIAN VÀ ĐƠN VỊ VẬN CHUYỂN</h2>

            <h3 className="policy-subtitle">a) Thời gian giao hàng</h3>
            <ul className="policy-list">
              <li>Thời gian giao hàng dao động từ <strong>2–4 ngày</strong> đối với đơn gọng kính, <strong>3–5 ngày làm việc</strong> đối với đơn cắt cận.</li>
              <li>Thời gian giao hàng không tính thứ 7, Chủ Nhật và các ngày lễ.</li>
              <li>
                Thời gian vận chuyển thực tế có thể nhanh hoặc chậm hơn so với thời gian dự kiến – phụ thuộc vào tình hình sản xuất hoặc các sự kiện bất khả kháng khác (mưa lũ, thiên tai, dịch bệnh).
              </li>
              <li>Kính mắt RTV sẽ thông báo cho khách hàng nếu thời gian này dài hơn 5 ngày làm việc.</li>
            </ul>

            <div className="policy-note">
              <p>
                <strong>Lưu ý:</strong> Đơn hàng được giao tối đa 3 lần. Nếu lần 1 đơn hàng giao không thành công, nhân viên vận chuyển sẽ liên hệ lại bạn lần 2 sau 1–2 ngày làm việc kế tiếp. Sau 3 lần giao hàng không thành công, đơn hàng sẽ hủy và hoàn lại Kính mắt RTV.
              </p>
            </div>

            <h3 className="policy-subtitle">b) Đơn vị vận chuyển</h3>
            <ul className="policy-list">
              <li>Việc lựa chọn sử dụng đơn vị vận chuyển nào sẽ do bên Kính mắt RTV quyết định.</li>
              <li>
                Đối với các đơn hàng nội thành Hà Nội, nếu khách hàng có nhu cầu nhận đơn hàng gấp vui lòng ghi chú rõ trong đơn hàng hoặc liên hệ trực tiếp với chúng tôi qua <strong>09xx xxx xxx</strong>.
              </li>
              <li>
                Mức phí giao hàng có thể thay đổi đối với một số hàng hóa cồng kềnh. Kính mắt RTV sẽ liên hệ lại Quý khách hàng để thông báo về mức phí vận chuyển cho những hàng hóa này.
              </li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>III. KIỂM TRA TRẠNG THÁI ĐƠN HÀNG</h2>
            <p className="policy-text">
              Để kiểm tra tình trạng đơn hàng bạn vui lòng liên hệ <strong>09xx xxx xxx</strong> để nhận thông tin trạng thái đơn hàng.
            </p>
          </section>

          <section className="policy-section">
            <h2>IV. ĐỒNG KIỂM TRƯỚC KHI THANH TOÁN</h2>
            <ul className="policy-list">
              <li>Trước khi nhận hàng và thanh toán, Quý Khách được quyền kiểm tra sản phẩm.</li>
              <li>Quý Khách vui lòng mở gói hàng kiểm tra để đảm bảo đơn hàng được giao đúng mẫu mã, số lượng như đơn hàng đã đặt.</li>
              <li>
                Sau khi đồng ý với món hàng được giao đến, Quý Khách thanh toán với nhân viên giao hàng (trường hợp đơn hàng được ship COD) và nhận hàng.
              </li>
              <li>
                Trường hợp Quý Khách không ưng ý với sản phẩm, Quý Khách có thể từ chối nhận hàng. Tại đây, Kính mắt RTV sẽ thu thêm chi phí hoàn hàng, tương đương với phí ship của đơn hàng Quý khách đã đặt.
              </li>
            </ul>

            <div className="policy-note">
              <p><strong>Lưu ý:</strong></p>
              <ul className="policy-list" style={{ marginTop: 8 }}>
                <li>
                  Khi Quý Khách kiểm tra đơn hàng, nhân viên giao nhận buộc phải đợi Quý Khách kiểm tra hàng hóa bên trong gói hàng. Trường hợp nhân viên từ chối cho Quý Khách kiểm tra hàng hóa, Quý Khách vui lòng liên hệ qua <strong>09xx xxx xxx</strong>  để được hỗ trợ.
                </li>
                <li>
                  Quý Khách tránh dùng vật sắc nhọn để mở gói hàng để tránh gây hư hỏng cho sản phẩm bên trong. Đối với những trường hợp sản phẩm bị hư hỏng do lỗi từ phía Khách hàng, Kính mắt RTV rất tiếc không thể hỗ trợ Quý Khách đổi/trả/bảo hành sản phẩm.
                </li>
              </ul>
            </div>
          </section>

          <section className="policy-section">
            <h2>V. PHÂN ĐỊNH TRÁCH NHIỆM</h2>

            <h3 className="policy-subtitle">1. Nghĩa vụ của bên vận chuyển</h3>
            <ul className="policy-list">
              <li>Bảo đảm vận chuyển tài sản đầy đủ, an toàn đến địa điểm đã định, theo đúng thời hạn.</li>
              <li>Giao tài sản cho người có quyền nhận.</li>
              <li>Chịu chi phí liên quan đến việc chuyên chở tài sản, trừ trường hợp có thỏa thuận khác.</li>
              <li>
                Bồi thường thiệt hại cho bên thuê vận chuyển trong trường hợp bên vận chuyển để mất, hư hỏng tài sản, trừ trường hợp có thỏa thuận khác hoặc pháp luật có quy định khác.
              </li>
            </ul>

            <h3 className="policy-subtitle">2. Quyền của bên vận chuyển</h3>
            <ul className="policy-list">
              <li>Kiểm tra sự xác thực của tài sản, của vận đơn hoặc chứng từ vận chuyển tương đương khác.</li>
              <li>Từ chối vận chuyển tài sản không đúng với loại tài sản đã thỏa thuận trong hợp đồng.</li>
              <li>Yêu cầu bên thuê vận chuyển thanh toán đủ cước phí vận chuyển đúng thời hạn.</li>
              <li>
                Từ chối vận chuyển tài sản cấm giao dịch, tài sản có tính chất nguy hiểm, độc hại, nếu bên vận chuyển không được thông báo đầy đủ.
              </li>
            </ul>

            <h3 className="policy-subtitle">3. Nghĩa vụ của bên thuê vận chuyển</h3>
            <ul className="policy-list">
              <li>Trả đủ tiền cước phí vận chuyển cho bên vận chuyển theo đúng thời hạn, phương thức đã thỏa thuận.</li>
              <li>Cung cấp thông tin cần thiết liên quan đến tài sản vận chuyển để bảo đảm an toàn cho tài sản vận chuyển.</li>
            </ul>

            <h3 className="policy-subtitle">4. Quyền của bên thuê vận chuyển</h3>
            <ul className="policy-list">
              <li>Yêu cầu bên vận chuyển chuyên chở tài sản đến đúng địa điểm, thời điểm đã thỏa thuận.</li>
              <li>Trực tiếp hoặc chỉ định người thứ ba nhận lại tài sản đã thuê vận chuyển.</li>
            </ul>

            <h3 className="policy-subtitle">5. Trách nhiệm bồi thường thiệt hại</h3>
            <ul className="policy-list">
              <li>Bên vận chuyển phải bồi thường thiệt hại cho bên thuê vận chuyển nếu để tài sản bị mất hoặc hư hỏng.</li>
              <li>
                Bên thuê vận chuyển phải bồi thường thiệt hại cho bên vận chuyển và người thứ ba về thiệt hại do tài sản vận chuyển có tính chất nguy hiểm, độc hại mà không có biện pháp đóng gói, bảo đảm an toàn trong quá trình vận chuyển.
              </li>
              <li>
                Trường hợp bất khả kháng dẫn đến tài sản vận chuyển bị mất, hư hỏng hoặc bị hủy hoại trong quá trình vận chuyển thì bên vận chuyển không phải chịu trách nhiệm bồi thường thiệt hại, trừ trường hợp có thỏa thuận khác hoặc pháp luật có quy định khác.
              </li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}