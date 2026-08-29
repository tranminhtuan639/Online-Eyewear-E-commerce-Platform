import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { listNguoiDung, updateNguoiDungAdmin, deleteNguoiDungAdmin } from '../../api/nguoiDung'

export default function AdminKhachHangPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [doiMatKhauUser, setDoiMatKhauUser] = useState(null) // user đang thao tác đổi mật khẩu
  const [matKhauMoi, setMatKhauMoi] = useState('')
  const [savingMatKhau, setSavingMatKhau] = useState(false)
  const [errorMatKhau, setErrorMatKhau] = useState('')

  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null) // user đang thao tác xoá
  const [deleting, setDeleting] = useState(false)

  const fetchList = () => {
    setLoading(true)
    // Backend chưa có filter theo vai_tro nên lấy nhiều rồi lọc lại ở client (đủ dùng cho quy mô đồ án).
    listNguoiDung({ limit: 100, search })
      .then(res => setList(res.data.data.items.filter(u => u.vai_tro === 'khachhang')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [search])

  const openDoiMatKhau = (user) => {
    setDoiMatKhauUser(user)
    setMatKhauMoi('')
    setErrorMatKhau('')
  }

  const handleDoiMatKhau = async () => {
    if (!matKhauMoi || matKhauMoi.length < 6) {
      setErrorMatKhau('Mật khẩu mới cần ít nhất 6 ký tự')
      return
    }
    setSavingMatKhau(true)
    setErrorMatKhau('')
    try {
      // Admin đổi thay khách (khách quên mật khẩu) nên không cần mật khẩu cũ
      await updateNguoiDungAdmin(doiMatKhauUser.id, { mat_khau: matKhauMoi })
      setDoiMatKhauUser(null)
    } catch (err) {
      setErrorMatKhau(err.response?.data?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setSavingMatKhau(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteNguoiDungAdmin(confirmDeleteUser.id)
      setConfirmDeleteUser(null)
      fetchList()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa tài khoản thất bại')
    } finally {
      setDeleting(false)
    }
  }

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
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">Không có khách hàng</td>
                </tr>
              ) : list.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{u.ho_ten}</td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {u.tao_luc ? new Date(u.tao_luc).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openDoiMatKhau(u)}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition"
                      >
                        Đổi mật khẩu
                      </button>
                      <button
                        onClick={() => setConfirmDeleteUser(u)}
                        className="text-xs bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 px-3 py-1.5 rounded-lg transition"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal đổi mật khẩu — admin đổi thay khách quên mật khẩu, không cần mật khẩu cũ */}
      {doiMatKhauUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Đổi mật khẩu khách hàng</h2>
            <p className="text-sm text-gray-500 mb-4">
              Đặt mật khẩu mới cho <span className="font-medium text-gray-700">{doiMatKhauUser.ho_ten}</span> ({doiMatKhauUser.email})
            </p>
            <label className="text-sm text-gray-600 mb-1 block">Mật khẩu mới</label>
            <input
              type="text"
              value={matKhauMoi}
              onChange={e => setMatKhauMoi(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {errorMatKhau && <p className="mt-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{errorMatKhau}</p>}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDoiMatKhauUser(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDoiMatKhau}
                disabled={savingMatKhau}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                {savingMatKhau ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xoá tài khoản */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa tài khoản</h2>
            <p className="text-sm text-gray-500 mb-5">
              Tài khoản <span className="font-medium text-gray-700">{confirmDeleteUser.ho_ten}</span> ({confirmDeleteUser.email}) sẽ bị xóa vĩnh viễn, không thể khôi phục.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteUser(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition disabled:opacity-60"
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
