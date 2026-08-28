import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { listDonHang, getDonHangById, capNhatTrangThaiDonHang, duyetHoanTra, tuChoiHoanTra } from '../../api/donHang'
import { getNguoiDungById } from '../../api/nguoiDung'

const trangThaiOptions = [
  { value: 'cho_thanh_toan',        label: 'Chờ thanh toán',      color: 'bg-amber-100 text-amber-700' },
  { value: 'cho_xac_nhan',          label: 'Chờ xác nhận',       color: 'bg-blue-100 text-blue-700' },
  { value: 'dang_xu_ly',            label: 'Đang xử lý',          color: 'bg-indigo-100 text-indigo-700' },
  { value: 'dang_giao',             label: 'Đang giao',            color: 'bg-purple-100 text-purple-700' },
  { value: 'hoan_thanh',            label: 'Hoàn thành',           color: 'bg-green-100 text-green-700' },
  { value: 'da_huy',                label: 'Đã hủy',               color: 'bg-red-100 text-red-700' },
  { value: 'yeu_cau_hoan_tra',      label: 'Yêu cầu hoàn trả',    color: 'bg-orange-100 text-orange-700' },
  { value: 'cho_duyet_tra_hang',    label: 'Chờ duyệt trả hàng',  color: 'bg-yellow-100 text-yellow-700' },
  { value: 'dang_hoan_hang',        label: 'Đang hoàn hàng',       color: 'bg-pink-100 text-pink-700' },
  { value: 'da_tra_hang_hoan_tien', label: 'Đã hoàn tiền',         color: 'bg-teal-100 text-teal-700' },
  { value: 'tu_choi_hoan_tra',      label: 'Từ chối hoàn trả',     color: 'bg-gray-100 text-gray-600' },
]

// Khớp đúng bản đồ $luongHopLe trong api/donhang/cap-nhat-trang-thai.php.
// Riêng bước yeu_cau_hoan_tra -> cho_duyet_tra_hang / tu_choi_hoan_tra dùng 2 endpoint riêng (duyệt/từ chối),
// không đi qua cap-nhat-trang-thai.php.
const buocTiepTheo = {
  cho_thanh_toan:        ['cho_xac_nhan', 'da_huy'],
  cho_xac_nhan:          ['dang_xu_ly', 'da_huy'],
  dang_xu_ly:            ['dang_giao', 'da_huy'],
  dang_giao:             ['hoan_thanh'],
  hoan_thanh:            [],
  da_huy:                [],
  yeu_cau_hoan_tra:      [],
  cho_duyet_tra_hang:    ['dang_hoan_hang'],
  dang_hoan_hang:        ['da_tra_hang_hoan_tien'],
  da_tra_hang_hoan_tien: [],
  tu_choi_hoan_tra:      [],
}

export default function AdminDonHangPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTrangThai, setFilterTrangThai] = useState('')
  const [searchOrderCode, setSearchOrderCode] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [khachHang, setKhachHang] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [showTuChoiModal, setShowTuChoiModal] = useState(false)
  const [lyDoTuChoi, setLyDoTuChoi] = useState('')
  const [tuChoiError, setTuChoiError] = useState('')

  const fetchOrders = () => {
    setLoading(true)
    // Chưa có API thống kê/phân trang riêng cho trang này, tạm lấy tối đa 1000 đơn gần nhất.
    listDonHang({ limit: 1000 })
      .then(res => setOrders(res.data.data.items))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const openDetail = async (order) => {
    setLoadingDetail(true)
    setKhachHang(null)
    try {
      const orderRes = await getDonHangById(order.id)
      setSelectedOrder(orderRes.data.data)
      // Backend không join sẵn tên/email khách hàng vào đơn hàng, phải gọi thêm API riêng
      const ndRes = await getNguoiDungById(order.nguoidung_id)
      setKhachHang(ndRes.data.data)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleCapNhatTrangThai = async (orderId, trangThai) => {
    setUpdatingId(orderId)
    try {
      await capNhatTrangThaiDonHang(orderId, trangThai)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trang_thai: trangThai } : o))
      setSelectedOrder(prev => ({ ...prev, trang_thai: trangThai }))
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDuyetHoanTra = async () => {
    setUpdatingId(selectedOrder.id)
    try {
      await duyetHoanTra(selectedOrder.id)
      const trangThaiMoi = 'cho_duyet_tra_hang'
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, trang_thai: trangThaiMoi } : o))
      setSelectedOrder(prev => ({ ...prev, trang_thai: trangThaiMoi }))
    } catch (err) {
      alert(err.response?.data?.message || 'Duyệt hoàn trả thất bại')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleTuChoi = async () => {
    if (!lyDoTuChoi.trim()) { setTuChoiError('Vui lòng nhập lý do từ chối'); return }
    setUpdatingId(selectedOrder.id)
    setTuChoiError('')
    try {
      await tuChoiHoanTra(selectedOrder.id, lyDoTuChoi)
      const trangThaiMoi = 'tu_choi_hoan_tra'
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, trang_thai: trangThaiMoi } : o))
      setSelectedOrder(prev => ({ ...prev, trang_thai: trangThaiMoi, ly_do_tu_choi: lyDoTuChoi }))
      setShowTuChoiModal(false)
      setLyDoTuChoi('')
    } catch (err) {
      setTuChoiError(err?.response?.data?.message || 'Từ chối thất bại, thử lại')
    } finally {
      setUpdatingId(null)
    }
  }

  const getTrangThai = (value) =>
    trangThaiOptions.find(t => t.value === value) || { label: value, color: 'bg-gray-100 text-gray-700' }

  const filtered = orders.filter(o => {
    const matchTrangThai = filterTrangThai ? o.trang_thai === filterTrangThai : true
    const shortCode = (o.id || '').slice(0, 8).toLowerCase()
    const fullCode = (o.id || '').toLowerCase()
    const keyword = searchOrderCode.trim().toLowerCase()
    const matchCode = !keyword || shortCode.includes(keyword) || fullCode.includes(keyword)
    return matchTrangThai && matchCode
  })
  const nextSteps = selectedOrder ? (buocTiepTheo[selectedOrder?.trang_thai] ?? []) : []

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Quản lý đơn hàng</h1>
        <span className="text-sm text-gray-500">{filtered.length} đơn hàng</span>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchOrderCode}
          onChange={e => setSearchOrderCode(e.target.value)}
          placeholder="Tìm theo mã đơn (8 ký tự đầu hoặc full UUID)..."
          className="w-full md:w-96 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilterTrangThai('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${filterTrangThai === '' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Tất cả ({orders.length})
        </button>
        {trangThaiOptions.map(tt => (
          <button key={tt.value} onClick={() => setFilterTrangThai(tt.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${filterTrangThai === tt.value ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {tt.label} ({orders.filter(o => o.trang_thai === tt.value).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? <div className="text-center py-16 text-gray-400">Đang tải...</div>
            : filtered.length === 0 ? <div className="text-center py-16 text-gray-400">Không có đơn hàng</div>
            : (
              <div className="divide-y divide-gray-50">
                {filtered.map(order => {
                  const tt = getTrangThai(order.trang_thai)
                  const isSelected = selectedOrder?.id === order.id
                  return (
                    <div key={order.id} onClick={() => openDetail(order)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-mono text-sm font-semibold text-gray-700">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tt.color}`}>{tt.label}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{new Date(order.tao_luc).toLocaleDateString('vi-VN')}</span>
                        <span className="font-bold text-gray-700">{Number(order.tong_tien).toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-y-auto max-h-[80vh]">
          {!selectedOrder ? (
            <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-2">📋</div><p className="text-sm">Chọn đơn hàng để xem chi tiết</p></div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400">Mã đơn</p>
                  <p className="font-mono font-bold text-gray-800">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(selectedOrder.tao_luc).toLocaleString('vi-VN')}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getTrangThai(selectedOrder.trang_thai).color}`}>
                  {getTrangThai(selectedOrder.trang_thai).label}
                </span>
              </div>

              {khachHang && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Khách hàng</p>
                  <p className="text-sm font-semibold text-gray-800">{khachHang.ho_ten}</p>
                  <p className="text-xs text-gray-500">{khachHang.email}</p>
                </div>
              )}

              {(selectedOrder.ho_ten_nguoi_nhan || selectedOrder.so_dien_thoai || selectedOrder.dia_chi) && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-500 font-medium mb-2">Thông tin giao hàng</p>
                  <div className="flex flex-col gap-1 text-xs">
                    {selectedOrder.ho_ten_nguoi_nhan && <div className="flex gap-2"><span className="text-gray-400 w-20">Người nhận</span><span className="font-medium text-gray-700">{selectedOrder.ho_ten_nguoi_nhan}</span></div>}
                    {selectedOrder.so_dien_thoai && <div className="flex gap-2"><span className="text-gray-400 w-20">Điện thoại</span><span className="font-medium text-gray-700">{selectedOrder.so_dien_thoai}</span></div>}
                    {selectedOrder.dia_chi && <div className="flex gap-2"><span className="text-gray-400 w-20">Địa chỉ</span><span className="font-medium text-gray-700">{selectedOrder.dia_chi}</span></div>}
                  </div>
                </div>
              )}

              {selectedOrder.ly_do_hoan_tra && (
                <div className="bg-orange-50 rounded-xl p-3 mb-3 border border-orange-100">
                  <p className="text-xs text-orange-600 font-medium mb-2">Yêu cầu hoàn trả của khách</p>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex gap-2"><span className="text-gray-400 w-24">Lý do</span><span className="font-medium text-gray-700">{selectedOrder.ly_do_hoan_tra}</span></div>
                    {selectedOrder.ten_ngan_hang && <div className="flex gap-2"><span className="text-gray-400 w-24">Ngân hàng</span><span className="font-medium text-gray-700">{selectedOrder.ten_ngan_hang}</span></div>}
                    {selectedOrder.so_tai_khoan && <div className="flex gap-2"><span className="text-gray-400 w-24">Số TK</span><span className="font-medium text-gray-700">{selectedOrder.so_tai_khoan}</span></div>}
                    {selectedOrder.ten_chu_tai_khoan && <div className="flex gap-2"><span className="text-gray-400 w-24">Chủ TK</span><span className="font-medium text-gray-700">{selectedOrder.ten_chu_tai_khoan}</span></div>}
                  </div>
                </div>
              )}

              {selectedOrder.ly_do_tu_choi && (
                <div className="bg-gray-100 rounded-xl p-3 mb-3 border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-1">Lý do từ chối</p>
                  <p className="text-xs text-gray-700">{selectedOrder.ly_do_tu_choi}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">Cập nhật trạng thái</p>

                {selectedOrder.trang_thai === 'yeu_cau_hoan_tra' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleDuyetHoanTra}
                      disabled={updatingId === selectedOrder.id}
                      className="flex-1 text-xs py-2 px-3 rounded-xl border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition disabled:opacity-50"
                    >
                      ✓ Duyệt hoàn trả
                    </button>
                    <button
                      onClick={() => { setLyDoTuChoi(''); setTuChoiError(''); setShowTuChoiModal(true) }}
                      disabled={updatingId === selectedOrder.id}
                      className="flex-1 text-xs py-2 px-3 rounded-xl border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      ✗ Từ chối
                    </button>
                  </div>
                ) : nextSteps.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {nextSteps.map(step => (
                      <button key={step}
                        onClick={() => handleCapNhatTrangThai(selectedOrder.id, step)}
                        disabled={updatingId === selectedOrder.id}
                        className="text-xs py-2 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        {updatingId === selectedOrder.id ? '...' : `→ ${getTrangThai(step).label}`}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Đơn này đã kết thúc.</p>
                )}
              </div>

              {/* Chi tiết đơn: backend đã trả sẵn trong detail.php (JOIN sẵn tên sản phẩm), không cần gọi thêm API */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-3 font-medium">Sản phẩm trong đơn</p>
                {loadingDetail ? <p className="text-center text-gray-400 text-sm py-4">Đang tải...</p> : (
                  <div className="flex flex-col gap-2">
                    {(selectedOrder.chi_tiet || []).map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👓</span>
                          <div>
                            <p className="font-medium text-gray-800">{item.ten_sanpham}</p>
                            <p className="text-xs text-gray-400">x{item.so_luong}</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-700">{(Number(item.gia_ban) * item.so_luong).toLocaleString('vi-VN')}₫</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between font-bold text-gray-800">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{Number(selectedOrder.tong_tien).toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showTuChoiModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Từ chối yêu cầu hoàn trả</h2>
            <p className="text-xs text-gray-400 mb-4">Khách hàng sẽ thấy lý do này.</p>
            <textarea
              value={lyDoTuChoi}
              onChange={e => setLyDoTuChoi(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            {tuChoiError && <p className="mt-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{tuChoiError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowTuChoiModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">Hủy</button>
              <button onClick={handleTuChoi} disabled={updatingId === selectedOrder?.id}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition disabled:opacity-60">
                {updatingId === selectedOrder?.id ? '...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
