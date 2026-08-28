import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSanPhamById } from '../api/sanPham'
import { getImageUrl } from '../api/axios'
import { useCart } from '../context/CartContext'

const loaiLabel = {
  gong: 'Gọng kính',
  trong: 'Tròng kính',
  phukien: 'Phụ kiện',
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    getSanPhamById(id)
      .then(res => setProduct(res.data.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Đang tải...</div>
  if (!product) return null

  const anhList = product.hinh_anh || []
  const anhHienTai = anhList[activeImg] ? getImageUrl(anhList[activeImg].duong_dan) : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1"
      >
        ← Quay lại
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div>
            <div className="h-72 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
              {anhHienTai ? (
                <img src={anhHienTai} alt={product.ten} className="w-full h-full object-cover" />
              ) : (
                <span className="text-9xl">👓</span>
              )}
            </div>
            {anhList.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {anhList.map((anh, idx) => (
                  <img
                    key={anh.id}
                    src={getImageUrl(anh.duong_dan)}
                    onClick={() => setActiveImg(idx)}
                    className={`w-14 h-14 object-cover rounded-lg cursor-pointer border-2 flex-shrink-0 ${
                      idx === activeImg ? 'border-blue-500' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {loaiLabel[product.loai]}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-gray-800">{product.ten}</h1>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {Number(product.gia).toLocaleString('vi-VN')}₫
              </p>
              {/* mo_ta là HTML lấy từ editor (TinyMCE/CKEditor) ở trang admin, đã được backend lọc trước khi lưu */}
              {product.mo_ta && (
                <div
                  className="mt-3 text-sm text-gray-500 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.mo_ta }}
                />
              )}
              <p className="mt-2 text-sm text-gray-500">
                Còn lại: <span className="font-medium text-gray-700">{product.so_luong_ton} sản phẩm</span>
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.so_luong_ton === 0}
                className={`w-full py-3 rounded-xl font-medium transition ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {added ? '✓ Đã thêm vào giỏ!' : product.so_luong_ton === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
              </button>
              <button
                onClick={() => { addToCart(product); navigate('/gio-hang') }}
                disabled={product.so_luong_ton === 0}
                className="w-full py-3 rounded-xl font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
