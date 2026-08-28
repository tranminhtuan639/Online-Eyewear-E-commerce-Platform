import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { listDonHang } from '../../api/donHang'

const trangThaiOptions = [
  { value: 'cho_thanh_toan', label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'cho_xac_nhan', label: 'Chờ xác nhận', color: 'bg-blue-100 text-blue-700' },
  { value: 'dang_xu_ly', label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'dang_giao', label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  { value: 'hoan_thanh', label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  { value: 'da_huy', label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  { value: 'yeu_cau_hoan_tra', label: 'Yêu cầu hoàn trả', color: 'bg-orange-100 text-orange-700' },
  { value: 'cho_duyet_tra_hang', label: 'Chờ duyệt trả hàng', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'dang_hoan_hang', label: 'Đang hoàn hàng', color: 'bg-pink-100 text-pink-700' },
  { value: 'tu_choi_hoan_tra', label: 'Từ chối hoàn trả', color: 'bg-gray-100 text-gray-600' },
  { value: 'da_tra_hang_hoan_tien', label: 'Đã hoàn tiền', color: 'bg-teal-100 text-teal-700' },
]

export default function AdminDoanhThuPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Chưa có API thống kê riêng, tạm lấy tối đa 1000 đơn gần nhất để tính (đủ dùng cho đồ án).
    listDonHang({ limit: 1000 })
      .then(res => setOrders(res.data.data.items))
      .finally(() => setLoading(false))
  }, [])

  const doanhThuHoanThanh = orders
    .filter(o => o.trang_thai === 'hoan_thanh')
    .reduce((sum, o) => sum + Number(o.tong_tien), 0)

  const tongDonHang = orders.length

  const thongKeTheoTrangThai = trangThaiOptions
    .map(tt => ({
      ...tt,
      count: orders.filter(o => o.trang_thai === tt.value).length,
      tong: orders
        .filter(o => o.trang_thai === tt.value)
        .reduce((sum, o) => sum + Number(o.tong_tien), 0),
    }))
    .filter(tt => tt.count > 0) // chỉ hiện trạng thái nào thực sự có đơn, tránh bảng dài lê thê

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Doanh thu</h1>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl mb-3">
                💰
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {doanhThuHoanThanh.toLocaleString('vi-VN')}₫
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Doanh thu thực (đơn hoàn thành)</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-3">
                📦
              </div>
              <p className="text-2xl font-bold text-gray-800">{tongDonHang}</p>
              <p className="text-sm text-gray-500 mt-0.5">Tổng đơn hàng</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-700 text-sm">Thống kê theo trạng thái</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Số đơn</th>
                  <th className="px-5 py-3 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {thongKeTheoTrangThai.map(tt => (
                  <tr key={tt.value} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tt.color}`}>
                        {tt.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-700 font-medium">{tt.count}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-gray-800">
                      {tt.tong.toLocaleString('vi-VN')}₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
