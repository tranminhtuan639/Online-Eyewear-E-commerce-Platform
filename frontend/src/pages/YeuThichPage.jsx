import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { listYeuThich } from '../api/yeuThich'
import { useAuth } from '../context/AuthContext'

import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'

const SO_DONG_MOI_TRANG = 8

export default function YeuThichPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }

    let huy = false
    setLoading(true)

    listYeuThich({ page, limit: SO_DONG_MOI_TRANG })
      .then(res => {
        if (huy) return
        const data = res.data?.data || {}
        setProducts(data.items || [])
        setTotalPages(data.phan_trang?.tong_so_trang || 1)
      })
      .catch(error => {
        if (huy) return
        console.error('Lỗi tải danh sách yêu thích:', error)
        setProducts([])
      })
      .finally(() => {
        if (!huy) setLoading(false)
      })

    return () => {
      huy = true
    }
  }, [user, authLoading, page])

  // Sản phẩm vừa bị bỏ yêu thích (bấm ♥ ngay trên card) -> ẩn khỏi danh sách này luôn
  // cho trực quan, khỏi phải load lại cả trang.
  const handleProductUnfavorited = (sanPhamId) => {
    setProducts(current =>
      current.filter(p => p.id !== sanPhamId)
    )
  }

  if (authLoading) return null

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-gray-700">Chưa đăng nhập</h2>
        <p className="text-gray-400 mt-2 mb-6">Vui lòng đăng nhập để xem sản phẩm yêu thích</p>
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Sản phẩm yêu thích
      </h1>

      {loading ? (
        <div className="loading-state">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🤍</div>
          <p className="text-gray-500">Bạn chưa yêu thích sản phẩm nào</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition"
          >
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onUnfavorited={handleProductUnfavorited}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
