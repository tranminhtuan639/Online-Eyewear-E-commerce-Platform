import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDonHangById, huyDonHang, yeuCauHoanTra } from '../api/donHang'

const trangThaiLabel = {
  cho_thanh_toan:       { label: 'Chờ thanh toán',    color: 'bg-yellow-100 text-yellow-700' },
  cho_xac_nhan:         { label: 'Chờ xác nhận',      color: 'bg-blue-100 text-blue-700' },
  dang_xu_ly:           { label: 'Đang xử lý',          color: 'bg-indigo-100 text-indigo-700' },
  dang_giao:            { label: 'Đang giao',            color: 'bg-purple-100 text-purple-700' },
  hoan_thanh:           { label: 'Hoàn thành',           color: 'bg-green-100 text-green-700' },
  da_huy:               { label: 'Đã hủy',               color: 'bg-red-100 text-red-700' },
  yeu_cau_hoan_tra:     { label: 'Yêu cầu hoàn trả',    color: 'bg-orange-100 text-orange-700' },
  cho_duyet_tra_hang:   { label: 'Chờ duyệt trả hàng',  color: 'bg-yellow-100 text-yellow-700' },
  dang_hoan_hang:       { label: 'Đang hoàn hàng',       color: 'bg-pink-100 text-pink-700' },
  tu_choi_hoan_tra:     { label: 'Từ chối hoàn trả',  color: 'bg-gray-100 text-gray-600' },
  da_tra_hang_hoan_tien:{ label: 'Đã hoàn tiền',         color: 'bg-teal-100 text-teal-700' },
}

const steps = ['cho_xac_nhan', 'dang_xu_ly', 'dang_giao', 'hoan_thanh']
const stepLabels = ['Xác nhận', 'Xử lý', 'Đang giao', 'Hoàn thành']

const emptyHoanTra = { ly_do_hoan_tra: '', ten_ngan_hang: '', so_tai_khoan: '', ten_chu_tai_khoan: '' }

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [showHuyConfirm, setShowHuyConfirm] = useState(false)
  const [showHoanTraForm, setShowHoanTraForm] = useState(false)
  const [hoanTraForm, setHoanTraForm] = useState(emptyHoanTra)
  const [hoanTraError, setHoanTraError] = useState('')

  const taiLaiDonHang = () => {
    return getDonHangById(id).then(res => setOrder(res.data.data))
  }

  useEffect(() => {
    setLoading(true)
    taiLaiDonHang()
      .catch(() => navigate('/don-hang'))
      .finally(() => setLoading(false))
  }, [id])

  const handleHuy = async () => {
    setActing(true)
    try {
      await huyDonHang(id)
      await taiLaiDonHang()
      setShowHuyConfirm(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Hủy đơn thất bại')
    } finally {
      setActing(false)
    }
  }

  const handleHoanTra = async () => {
    const { ly_do_hoan_tra, ten_ngan_hang, so_tai_khoan, ten_chu_tai_khoan } = hoanTraForm
    if (!ly_do_hoan_tra || !ten_ngan_hang || !so_tai_khoan || !ten_chu_tai_khoan) {
      setHoanTraError('Vui lòng điền đầy đủ thông tin')
      return
    }
    setActing(true)
    setHoanTraError('')
    try {
      await yeuCauHoanTra(id, hoanTraForm)
      await taiLaiDonHang()
      setShowHoanTraForm(false)
      setHoanTraForm(emptyHoanTra)
    } catch (err) {
      setHoanTraError(err.response?.data?.message || 'Yêu cầu hoàn trả thất bại')
    } finally {
      setActing(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Đang tải...</div>
  if (!order) return null

  const tt = trangThaiLabel[order.trang_thai] || { label: order.trang_thai, color: 'bg-gray-100 text-gray-700' }
  const currentStep = steps.indexOf(order.trang_thai)
  const showSteps = !['da_huy', 'yeu_cau_hoan_tra', 'cho_duyet_tra_hang', 'dang_hoan_hang', 'da_tra_hang_hoan_tien', 'tu_choi_hoan_tra'].includes(order.trang_thai)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/don-hang')} className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1">
        ← Quay lại đơn hàng
      </button>

      {/* Header + tiến trình */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400">Mã đơn hàng</p>
            <p className="font-mono font-semibold text-gray-700 mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${tt.color}`}>{tt.label}</span>
        </div>

        {showSteps && (
          <div className="mt-4">
            <div className="flex items-center">
              {steps.map((step, idx) => (
                <div key={step} className="flex-1 flex items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition ${
                    idx <= currentStep ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-300'
                  }`}>
                    {idx < currentStep ? '✓' : idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 ${idx < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {stepLabels.map((label, idx) => (
                <span key={idx} className={`text-xs flex-1 text-center ${idx <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-300'}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nút hành động khách hàng - chỉ được huỷ khi còn sớm, theo đúng luồng backend */}
        <div className="mt-4 flex gap-2">
          {['cho_thanh_toan', 'cho_xac_nhan'].includes(order.trang_thai) && (
            <button onClick={() => setShowHuyConfirm(true)} className="text-sm border border-red-200 text-red-500 px-4 py-2 rounded-xl hover:bg-red-50 transition">
              Hủy đơn hàng
            </button>
          )}
          {order.trang_thai === 'hoan_thanh' && (
            <button onClick={() => setShowHoanTraForm(true)} className="text-sm border border-orange-200 text-orange-500 px-4 py-2 rounded-xl hover:bg-orange-50 transition">
              Yêu cầu hoàn trả
            </button>
          )}
        </div>
      </div>

      {/* Thông tin giao hàng */}
      {(order.ho_ten_nguoi_nhan || order.so_dien_thoai || order.dia_chi) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">Thông tin giao hàng</h2>
          <div className="text-sm text-gray-600 flex flex-col gap-1.5">
            {order.ho_ten_nguoi_nhan && <div className="flex gap-2"><span className="text-gray-400 w-24">Người nhận</span><span className="font-medium text-gray-800">{order.ho_ten_nguoi_nhan}</span></div>}
            {order.so_dien_thoai && <div className="flex gap-2"><span className="text-gray-400 w-24">Điện thoại</span><span className="font-medium text-gray-800">{order.so_dien_thoai}</span></div>}
            {order.dia_chi && <div className="flex gap-2"><span className="text-gray-400 w-24">Địa chỉ</span><span className="font-medium text-gray-800">{order.dia_chi}</span></div>}
          </div>
        </div>
      )}

      {/* Lý do từ chối */}
      {order.trang_thai === 'tu_choi_hoan_tra' && order.ly_do_tu_choi && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-4">
          <h2 className="font-semibold text-red-700 mb-2">Yêu cầu hoàn trả bị từ chối</h2>
          <p className="text-sm text-gray-700">{order.ly_do_tu_choi}</p>
        </div>
      )}

      {/* Thông tin hoàn trả đã gửi */}
      {order.ly_do_hoan_tra && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-4">
          <h2 className="font-semibold text-orange-700 mb-3">Yêu cầu hoàn trả</h2>
          <div className="text-sm flex flex-col gap-1.5">
            <div className="flex gap-2"><span className="text-gray-400 w-24">Lý do</span><span className="font-medium text-gray-700">{order.ly_do_hoan_tra}</span></div>
            {order.ten_ngan_hang && <div className="flex gap-2"><span className="text-gray-400 w-24">Ngân hàng</span><span className="font-medium text-gray-700">{order.ten_ngan_hang}</span></div>}
            {order.so_tai_khoan && <div className="flex gap-2"><span className="text-gray-400 w-24">Số TK</span><span className="font-medium text-gray-700">{order.so_tai_khoan}</span></div>}
            {order.ten_chu_tai_khoan && <div className="flex gap-2"><span className="text-gray-400 w-24">Chủ TK</span><span className="font-medium text-gray-700">{order.ten_chu_tai_khoan}</span></div>}
          </div>
        </div>
      )}

      {/* Sản phẩm - đã có sẵn trong order.chi_tiet, không cần gọi API riêng cho từng sản phẩm nữa */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">Sản phẩm đã đặt</h2>
        <div className="flex flex-col gap-4">
          {(order.chi_tiet || []).map(item => (
            <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.ten_sanpham}</p>
                <p className="text-sm text-gray-500 mt-0.5">x{item.so_luong}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{(Number(item.gia_ban) * item.so_luong).toLocaleString('vi-VN')}₫</p>
                <p className="text-xs text-gray-400">{Number(item.gia_ban).toLocaleString('vi-VN')}₫/cái</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between font-bold text-gray-800">
          <span>Tổng cộng</span>
          <span className="text-blue-600 text-lg">{Number(order.tong_tien).toLocaleString('vi-VN')}₫</span>
        </div>
      </div>

      {/* Thời gian */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-2">Thông tin</h2>
        <div className="text-sm text-gray-600 flex flex-col gap-1">
          <div className="flex justify-between"><span>Ngày đặt</span><span className="font-medium">{new Date(order.tao_luc).toLocaleDateString('vi-VN')}</span></div>
          <div className="flex justify-between"><span>Cập nhật lần cuối</span><span className="font-medium">{new Date(order.cap_nhat_luc).toLocaleDateString('vi-VN')}</span></div>
        </div>
      </div>

      {/* Modal xác nhận hủy */}
      {showHuyConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">❌</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Xác nhận hủy đơn</h2>
            <p className="text-sm text-gray-500 mb-5">Đơn hàng sẽ bị hủy và không thể khôi phục.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowHuyConfirm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">Quay lại</button>
              <button onClick={handleHuy} disabled={acting} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition disabled:opacity-60">
                {acting ? '...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal form hoàn trả */}
      {showHoanTraForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Yêu cầu hoàn trả</h2>
            <p className="text-xs text-gray-400 mb-4">Tiền sẽ được hoàn lại sau khi chúng tôi nhận được hàng và kiểm tra tình trạng sản phẩm.</p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Lý do hoàn trả</label>
                <textarea
                  value={hoanTraForm.ly_do_hoan_tra}
                  onChange={e => setHoanTraForm(p => ({ ...p, ly_do_hoan_tra: e.target.value }))}
                  placeholder="Mô tả lý do bạn muốn hoàn trả..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
              </div>
              <p className="text-xs font-medium text-gray-600">Thông tin hoàn tiền</p>
              {[
                { key: 'ten_ngan_hang', label: 'Tên ngân hàng', placeholder: 'Vietcombank, Techcombank...' },
                { key: 'so_tai_khoan', label: 'Số tài khoản', placeholder: '1234567890' },
                { key: 'ten_chu_tai_khoan', label: 'Tên chủ tài khoản', placeholder: 'NGUYEN VAN A' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm text-gray-600 mb-1 block">{f.label}</label>
                  <input
                    value={hoanTraForm[f.key]}
                    onChange={e => setHoanTraForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              ))}
            </div>

            {hoanTraError && <p className="mt-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{hoanTraError}</p>}

            <div className="flex gap-2 mt-5">
              <button onClick={() => { setShowHoanTraForm(false); setHoanTraError('') }} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">Hủy</button>
              <button onClick={handleHoanTra} disabled={acting} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition disabled:opacity-60">
                {acting ? '...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
