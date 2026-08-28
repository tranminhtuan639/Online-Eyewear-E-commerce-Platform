import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { listNguoiDung } from '../../api/nguoiDung'

export default function AdminKhachHangPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Backend chưa có filter theo vai_tro nên lấy nhiều rồi lọc lại ở client (đủ dùng cho quy mô đồ án).
    listNguoiDung({ limit: 100, search })
      .then(res => setList(res.data.data.items.filter(u => u.vai_tro === 'khachhang')))
      .finally(() => setLoading(false))
  }, [search])

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Khách hàng</h1>
        <span className="text-sm text-gray-500">{list.length} khách hàng</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Họ tên</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-gray-400">Không có khách hàng</td>
                </tr>
              ) : list.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{u.ho_ten}</td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {u.tao_luc ? new Date(u.tao_luc).toLocaleDateString('vi-VN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
