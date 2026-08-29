import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createDonHang } from '../api/donHang'
import { listDonKinh, createDonKinh } from '../api/donKinh'
import { getImageUrl } from '../api/axios'

export default function CheckoutPage() {
  const { cartItems, tongTien, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [donKinhList, setDonKinhList] = useState([])
  const [selectedDonKinhId, setSelectedDonKinhId] = useState('')
  const [showTaoDonKinh, setShowTaoDonKinh] = useState(false)
  const [donKinhForm, setDonKinhForm] = useState({
    od_cau: '', os_cau: '', khoang_dong_tu: '', ghi_chu: ''
  })
  const [form, setForm] = useState({
    hoTen: user?.ho_ten || '',
    diaChi: '',
    soDienThoai: ''
  })
  // Web chỉ hỗ trợ COD, thanh toán online chưa triển khai nên khoá cứng ở đây
  const [phuongThucThanhToan] = useState('cod')

  const coTrongKinh = cartItems.some(item => item.loai === 'trong')

  useEffect(() => {
    // Không cần truyền id, backend tự lấy đơn kính của người đang đăng nhập
    if (user && coTrongKinh) {
      listDonKinh({ limit: 100 })
        .then(res => setDonKinhList(res.data.data.items))
        .catch(() => {})
    }
  }, [user])

  const handleTaoDonKinh = async () => {
    if (!user) return
    try {
      const res = await createDonKinh(donKinhForm)
      const newId = res.data.data.id
      setDonKinhList(prev => [...prev, { ...donKinhForm, id: newId }])
      setSelectedDonKinhId(newId)
      setShowTaoDonKinh(false)
    } catch {
      setError('Không thể tạo đơn kính')
    }
  }

  const handleSubmit = async () => {
    if (!user) { navigate('/dang-nhap'); return }
    if (!form.hoTen || !form.diaChi || !form.soDienThoai) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }
    if (cartItems.length === 0) { setError('Giỏ hàng trống'); return }
    if (coTrongKinh && !selectedDonKinhId) {
      setError('Vui lòng chọn hoặc tạo đơn kính cho tròng kính')
      return
    }

    setLoading(true)
    setError('')
    try {
      await createDonHang({
        ho_ten_nguoi_nhan: form.hoTen,
        so_dien_thoai: form.soDienThoai,
        dia_chi: form.diaChi,
        chi_tiet: cartItems.map(item => ({
          sanpham_id: item.id,
          so_luong: item.soLuong,
          don_kinh_id: item.loai === 'trong' && selectedDonKinhId ? selectedDonKinhId : null,
        })),
      })

      clearCart()
      navigate('/don-hang', { state: { success: true } })
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <p className="text-gray-600 mb-4">Vui lòng đăng nhập để đặt hàng</p>
        <button
          onClick={() => navigate('/dang-nhap')}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition"
        >
          Đăng nhập
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Thông tin giao hàng</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Họ và tên</label>
                <input
                  name="hoTen"
                  value={form.hoTen}
                  onChange={e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Email</label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Số điện thoại</label>
                  <input
                    name="soDienThoai"
                    value={form.soDienThoai}
                    onChange={e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    placeholder="0901234567"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Địa chỉ</label>
                <input
                  name="diaChi"
                  value={form.diaChi}
                  onChange={e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                  placeholder="123 Đường ABC, Phường/Xã, Tỉnh/Thành"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          {coTrongKinh && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-1">Đơn kính (Prescription)</h2>
              <p className="text-xs text-gray-400 mb-4">Giỏ hàng có tròng kính, cần chọn đơn kính</p>

              {donKinhList.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {donKinhList.map(dk => (
                    <label key={dk.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedDonKinhId === dk.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="donKinh"
                        value={dk.id}
                        checked={selectedDonKinhId === dk.id}
                        onChange={() => setSelectedDonKinhId(dk.id)}
                        className="mt-0.5"
                      />
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">OD: {dk.od_cau ?? '—'} | OS: {dk.os_cau ?? '—'} | PD: {dk.khoang_dong_tu ?? '—'}</p>
                        {dk.ghi_chu && <p className="text-gray-400 text-xs mt-0.5">{dk.ghi_chu}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowTaoDonKinh(!showTaoDonKinh)}
                className="text-sm text-blue-600 hover:underline"
              >
                + Tạo đơn kính mới
              </button>

              {showTaoDonKinh && (
                <div className="mt-3 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'od_cau', label: 'OD (Mắt phải)' },
                      { name: 'os_cau', label: 'OS (Mắt trái)' },
                      { name: 'khoang_dong_tu', label: 'PD (mm)' },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                        <input
                          type="number"
                          step="0.25"
                          value={donKinhForm[f.name]}
                          onChange={e => setDonKinhForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ghi chú</label>
                    <input
                      value={donKinhForm.ghi_chu}
                      onChange={e => setDonKinhForm(prev => ({ ...prev, ghi_chu: e.target.value }))}
                      placeholder="Ví dụ: cận nhẹ, loạn thị..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <button
                    onClick={handleTaoDonKinh}
                    className="bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Lưu đơn kính
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Phương thức thanh toán</h2>
            <div className="border border-blue-400 bg-blue-50/40 rounded-xl overflow-hidden">
              <label className="flex items-center gap-3 p-4 cursor-pointer">
                <input type="radio" checked={phuongThucThanhToan === 'cod'} readOnly className="accent-blue-600" />
                <span className="text-sm font-medium text-gray-800">Thanh toán khi giao hàng (COD)</span>
              </label>
              <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500 border-t border-blue-100">
                Bạn kiểm tra hàng trước khi thanh toán cho shipper.
              </div>
            </div>

            <label className="mt-3 flex items-center gap-3 p-4 rounded-xl border border-gray-200 opacity-60 cursor-not-allowed">
              <input type="radio" disabled className="accent-gray-400" />
              <span className="text-sm text-gray-500">Web chưa hỗ trợ thanh toán trực tuyến</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
          <h2 className="font-semibold text-gray-800 mb-4">Đơn hàng của bạn</h2>
          <div className="flex flex-col gap-3 mb-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.anh_a ? (
                    <img src={getImageUrl(item.anh_a)} alt={item.ten} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">👓</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{item.ten}</p>
                  <p className="text-xs text-gray-400">x{item.soLuong}</p>
                </div>
                <span className="text-sm font-medium text-gray-800">{(Number(item.gia) * item.soLuong).toLocaleString('vi-VN')}₫</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-gray-800">
            <span>Tổng cộng</span>
            <span className="text-blue-600 text-lg">{tongTien.toLocaleString('vi-VN')}₫</span>
          </div>

          {error && <p className="mt-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

          <div className="mt-4 flex items-center justify-between">
            <Link to="/gio-hang" className="text-sm text-blue-600 hover:underline">Giỏ hàng</Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? 'Đang đặt hàng...' : 'Hoàn tất đơn hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
