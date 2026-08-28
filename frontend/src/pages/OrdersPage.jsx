import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { listDonHang } from '../api/donHang'
import { useAuth } from '../context/AuthContext'

const trangThaiLabel = {
  cho_thanh_toan: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700' },
  cho_xac_nhan: { label: 'Chờ xác nhận', color: 'bg-blue-100 text-blue-700' },
  dang_xu_ly: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-700' },
  dang_giao: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  hoan_thanh: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  da_huy: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    // Không cần truyền id - backend tự trả đơn của người đang đăng nhập
    listDonHang({ limit: 50 })
      .then(res => setOrders(res.data.data.items))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [user, authLoading])

  if (authLoading) return null

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-gray-700">Chưa đăng nhập</h2>
        <p className="text-gray-400 mt-2 mb-6">Vui lòng đăng nhập để xem đơn hàng</p>
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
      {location.state?.success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Đặt hàng thành công! Chúng tôi sẽ liên hệ xác nhận sớm.
        </div>
      )}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h1>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500">Chưa có đơn hàng nào</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition"
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const tt = trangThaiLabel[order.trang_thai] || { label: order.trang_thai, color: 'bg-gray-100 text-gray-700' }
            return (
              <div
                key={order.id}
                onClick={() => navigate(`/don-hang/${order.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Mã đơn hàng</p>
                    <p className="font-mono text-sm text-gray-700">{order.id.slice(0, 8).toUpperCase()}...</p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${tt.color}`}>
                    {tt.label}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(order.tao_luc).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="font-bold text-blue-600">
                    {Number(order.tong_tien).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
