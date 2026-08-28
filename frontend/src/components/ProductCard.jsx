import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageUrl } from '../api/axios'

const loaiLabel = {
  gong: 'Gọng kính',
  trong: 'Tròng kính',
  phukien: 'Phụ kiện',
}

const loaiColor = {
  gong: 'bg-blue-100 text-blue-700',
  trong: 'bg-green-100 text-green-700',
  phukien: 'bg-purple-100 text-purple-700',
}

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [hovered, setHovered] = useState(false)

  const imageA = getImageUrl(product.anh_a)
  const imageB = getImageUrl(product.anh_b)
  const currentImage = hovered && imageB ? imageB : imageA

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden group">
      <div
        className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={() => navigate(`/san-pham/${product.id}`)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {currentImage ? (
          <img
            src={currentImage}
            alt={product.ten}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {hovered ? '🕶️' : '👓'}
          </span>
        )}
      </div>

      <div className="p-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${loaiColor[product.loai]}`}>
          {loaiLabel[product.loai]}
        </span>
        <h3
          className="mt-2 font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition line-clamp-2"
          onClick={() => navigate(`/san-pham/${product.id}`)}
        >
          {product.ten}
        </h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">
            {Number(product.gia).toLocaleString('vi-VN')}₫
          </span>
          <span className="text-xs text-gray-400">Còn {product.so_luong_ton}</span>
        </div>
        <button
          onClick={() => addToCart(product)}
          disabled={product.so_luong_ton === 0}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {product.so_luong_ton === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  )
}
