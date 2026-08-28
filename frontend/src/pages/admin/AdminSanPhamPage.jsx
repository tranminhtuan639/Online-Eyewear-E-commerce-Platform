import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { listSanPham, getSanPhamById, createSanPham, updateSanPham, deleteSanPham } from '../../api/sanPham'
import { getImageUrl } from '../../api/axios'
import Pagination from '../../components/Pagination'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

// Chỉ cho phép các nút định dạng cơ bản, tránh nội dung phức tạp không cần thiết
// cho mô tả sản phẩm (không cần chèn ảnh trong editor vì đã có ô upload ảnh riêng).
const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
}

const LIMIT = 10

const loaiOptions = [
  { value: 'gong', label: 'Gọng kính' },
  { value: 'trong', label: 'Tròng kính' },
  { value: 'phukien', label: 'Phụ kiện' },
]

const loaiColor = {
  gong: 'bg-blue-100 text-blue-700',
  trong: 'bg-green-100 text-green-700',
  phukien: 'bg-purple-100 text-purple-700',
}

const emptyForm = { ten: '', mo_ta: '', loai: 'gong', gia: '', so_luong_ton: '' }

export default function AdminSanPhamPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [existingImages, setExistingImages] = useState([]) // ảnh đã có sẵn khi sửa: [{id, duong_dan}]
  const [xoaAnhIds, setXoaAnhIds] = useState([])            // id các ảnh cũ đánh dấu xoá
  const [newFiles, setNewFiles] = useState([])              // File[] mới chọn thêm
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const fetchProducts = () => {
    setLoading(true)
    listSanPham({ page, limit: LIMIT, search })
      .then(res => {
        setProducts(res.data.data.items)
        setTotalPages(res.data.data.phan_trang.tong_so_trang)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [page, search])
  useEffect(() => { setPage(1) }, [search])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setExistingImages([])
    setXoaAnhIds([])
    setNewFiles([])
    setError('')
    setShowModal(true)
  }

  const openEdit = async (product) => {
    setError('')
    // list.php không trả mo_ta/ảnh đầy đủ, phải gọi detail.php để lấy đủ dữ liệu
    const res = await getSanPhamById(product.id)
    const p = res.data.data
    setEditingId(p.id)
    setForm({
      ten: p.ten,
      mo_ta: p.mo_ta || '',
      loai: p.loai,
      gia: String(p.gia),
      so_luong_ton: String(p.so_luong_ton),
    })
    setExistingImages(p.hinh_anh || [])
    setXoaAnhIds([])
    setNewFiles([])
    setShowModal(true)
  }

  const toggleXoaAnh = (anhId) => {
    setXoaAnhIds(prev =>
      prev.includes(anhId) ? prev.filter(id => id !== anhId) : [...prev, anhId]
    )
  }

  const handleSave = async () => {
    if (!form.ten || !form.gia || form.so_luong_ton === '') {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('ten', form.ten)
      // Quill để trống vẫn trả về "<p><br></p>" chứ không phải chuỗi rỗng, cần lọc lại trước khi gửi
      const moTaSach = form.mo_ta.trim() === '<p><br></p>' ? '' : form.mo_ta
      fd.append('mo_ta', moTaSach)
      fd.append('loai', form.loai)
      fd.append('gia', form.gia)
      fd.append('so_luong_ton', form.so_luong_ton)
      // PHP chỉ nhận đúng thành mảng $_FILES khi tên field có "[]"
      newFiles.forEach(file => fd.append('hinh_anh[]', file))

      if (editingId) {
        xoaAnhIds.forEach(id => fd.append('xoa_anh_ids[]', id))
        await updateSanPham(editingId, fd)
      } else {
        await createSanPham(fd)
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteSanPham(id)
      setConfirmDeleteId(null)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại')
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          + Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
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
                <th className="px-5 py-3 text-left">Ảnh</th>
                <th className="px-5 py-3 text-left">Tên sản phẩm</th>
                <th className="px-5 py-3 text-left">Loại</th>
                <th className="px-5 py-3 text-right">Giá</th>
                <th className="px-5 py-3 text-right">Tồn kho</th>
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Không có sản phẩm</td>
                </tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {p.anh_a ? (
                        <img src={getImageUrl(p.anh_a)} className="w-full h-full object-cover" />
                      ) : <span className="text-xl">👓</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{p.ten}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${loaiColor[p.loai]}`}>
                      {loaiOptions.find(o => o.value === p.loai)?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium">{Number(p.gia).toLocaleString('vi-VN')}₫</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={p.so_luong_ton === 0 ? 'text-red-500 font-medium' : 'text-gray-700'}>
                      {p.so_luong_ton}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-600 text-gray-600 px-3 py-1.5 rounded-lg transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(p.id)}
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

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Tên sản phẩm</label>
                <input
                  value={form.ten}
                  onChange={e => setForm(p => ({ ...p, ten: e.target.value }))}
                  placeholder="Gọng kính titan..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Mô tả</label>
                <ReactQuill
                  theme="snow"
                  value={form.mo_ta}
                  onChange={value => setForm(p => ({ ...p, mo_ta: value }))}
                  modules={quillModules}
                  placeholder="Mô tả sản phẩm..."
                  className="bg-white rounded-xl [&_.ql-container]:rounded-b-xl [&_.ql-toolbar]:rounded-t-xl"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Loại</label>
                <select
                  value={form.loai}
                  onChange={e => setForm(p => ({ ...p, loai: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {loaiOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Giá (₫)</label>
                  <input
                    type="number"
                    value={form.gia}
                    onChange={e => setForm(p => ({ ...p, gia: e.target.value }))}
                    placeholder="350000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Tồn kho</label>
                  <input
                    type="number"
                    value={form.so_luong_ton}
                    onChange={e => setForm(p => ({ ...p, so_luong_ton: e.target.value }))}
                    placeholder="20"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              {/* Ảnh đã có sẵn (chỉ hiện khi sửa sản phẩm) */}
              {editingId && existingImages.length > 0 && (
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Ảnh hiện có (bấm để đánh dấu xoá)</label>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map(anh => {
                      const daDanhDauXoa = xoaAnhIds.includes(anh.id)
                      return (
                        <div
                          key={anh.id}
                          onClick={() => toggleXoaAnh(anh.id)}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                            daDanhDauXoa ? 'border-red-400 opacity-40' : 'border-transparent'
                          }`}
                        >
                          <img src={getImageUrl(anh.duong_dan)} className="w-full h-full object-cover" />
                          {daDanhDauXoa && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs font-bold">
                              Xoá
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  {editingId ? 'Thêm ảnh mới' : 'Ảnh sản phẩm'} (ảnh đầu tiên = ảnh mặc định, ảnh thứ 2 = ảnh khi hover)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={e => setNewFiles(Array.from(e.target.files))}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:text-sm file:font-medium hover:file:bg-blue-100"
                />
                {newFiles.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{newFiles.length} ảnh đã chọn</p>
                )}
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa</h2>
            <p className="text-sm text-gray-500 mb-5">Sản phẩm sẽ bị xóa vĩnh viễn, không thể khôi phục.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}