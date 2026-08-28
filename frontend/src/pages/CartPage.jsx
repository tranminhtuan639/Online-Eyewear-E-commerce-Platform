import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageUrl } from '../api/axios'

export default function CartPage() {
  const { cartItems, removeFromCart, updateSoLuong, tongTien } = useCart()
  const navigate = useNavigate()

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-700">Giỏ hàng trống</h2>
        <p className="text-gray-400 mt-2">Hãy thêm sản phẩm vào giỏ hàng</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition"
        >
          Xem sản phẩm
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Giỏ hàng ({cartItems.length} sản phẩm)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.anh_a ? (
                  <img
                    src={getImageUrl(item.anh_a)}
                    alt={item.ten}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-3xl">👓</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.ten}</h3>
                <p className="text-blue-600 font-bold mt-1">{Number(item.gia).toLocaleString('vi-VN')}₫</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateSoLuong(item.id, item.soLuong - 1)}
                      className="px-3 py-1 hover:bg-gray-100 transition text-lg"
                    >−</button>
                    <span className="px-3 py-1 text-sm font-medium">{item.soLuong}</span>
                    <button
                      onClick={() => updateSoLuong(item.id, item.soLuong + 1)}
                      className="px-3 py-1 hover:bg-gray-100 transition text-lg"
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm text-red-400 hover:text-red-600 transition"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">
                  {(Number(item.gia) * item.soLuong).toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
          <h2 className="font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Tạm tính</span>
            <span>{tongTien.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Phí vận chuyển</span>
            <span className="text-green-600">Miễn phí</span>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-gray-800">
            <span>Tổng cộng</span>
            <span className="text-blue-600 text-lg">{tongTien.toLocaleString('vi-VN')}₫</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Tiến hành đặt hàng
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-2 w-full text-sm text-gray-500 hover:text-blue-600 transition py-2"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  )
}
