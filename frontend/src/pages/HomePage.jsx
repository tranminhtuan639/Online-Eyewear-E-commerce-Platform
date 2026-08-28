import { useEffect, useState } from 'react'
import { listSanPham } from '../api/sanPham'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'

const LIMIT = 8

const loaiOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'gong', label: 'Gọng kính' },
  { value: 'trong', label: 'Tròng kính' },
  { value: 'phukien', label: 'Phụ kiện' },
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loai, setLoai] = useState('')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [tongSoDong, setTongSoDong] = useState(0)

  useEffect(() => {
    setLoading(true)
    listSanPham({ page: currentPage, limit: LIMIT, loai, search })
      .then(res => {
        const { items, phan_trang } = res.data.data
        setProducts(items)
        setTotalPages(phan_trang.tong_so_trang)
        setTongSoDong(phan_trang.tong_so_dong)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [currentPage, loai, search])

  // reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [loai, search])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Sản phẩm kính mắt</h1>
        <p className="text-gray-500 mt-2">Chọn kính phù hợp với phong cách của bạn</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <div className="flex gap-2 flex-wrap">
          {loaiOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setLoai(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                loai === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải sản phẩm...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Không tìm thấy sản phẩm nào</div>
      ) : (
        <>
          <div className="text-sm text-gray-400 mb-4">
            Hiển thị {(currentPage - 1) * LIMIT + 1}–{Math.min(currentPage * LIMIT, tongSoDong)} / {tongSoDong} sản phẩm
          </div>

          <div className="grid grid-cols-4 gap-5">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  )
}
