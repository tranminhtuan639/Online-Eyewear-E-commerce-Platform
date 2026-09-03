import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import YeuThichPage from './pages/YeuThichPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSanPhamPage from './pages/admin/AdminSanPhamPage'
import AdminDonHangPage from './pages/admin/AdminDonHangPage'
import AdminKhachHangPage from './pages/admin/AdminKhachHangPage'
import AdminDoanhThuPage from './pages/admin/AdminDoanhThuPage'
import ChinhSachBaoHanhPage from './pages/ChinhSachBaoHanhPage'
import ChinhSachVanChuyenPage from './pages/ChinhSachVanChuyenPage'
import ChinhSachThanhToanPage from './pages/ChinhSachThanhToanPage'
import ChinhSachBaoMatPage from './pages/ChinhSachBaoMatPage'
import DoMatTuVanPage from './pages/DoMatTuVanPage'
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/dang-nhap" element={<LoginPage />} />
            <Route path="/dang-ky" element={<RegisterPage />} />

            {/* Admin routes — chỉ quanly */}
            <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/san-pham" element={<ProtectedAdminRoute><AdminSanPhamPage /></ProtectedAdminRoute>} />
            <Route path="/admin/don-hang" element={<ProtectedAdminRoute><AdminDonHangPage /></ProtectedAdminRoute>} />
            <Route path="/admin/khach-hang" element={<ProtectedAdminRoute><AdminKhachHangPage /></ProtectedAdminRoute>} />
            <Route path="/admin/doanh-thu" element={<ProtectedAdminRoute><AdminDoanhThuPage /></ProtectedAdminRoute>} />

            {/* Customer routes */}
            <Route path="*" element={
              <>
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
                    <Route path="/gio-hang" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/don-hang" element={<OrdersPage />} />
                    <Route path="/don-hang/:id" element={<OrderDetailPage />} />
                    <Route path="/tai-khoan" element={<ProfilePage />} />
                    <Route path="/yeu-thich" element={<YeuThichPage />} />
                    <Route path="/chinh-sach-bao-hanh" element={<ChinhSachBaoHanhPage />} />
                    <Route path="/chinh-sach-van-chuyen" element={<ChinhSachVanChuyenPage />} />
                    <Route path="/chinh-sach-thanh-toan" element={<ChinhSachThanhToanPage />} />
                    <Route path="/chinh-sach-bao-mat" element={<ChinhSachBaoMatPage />} />
                    <Route path="/do-mat-tu-van" element={<DoMatTuVanPage />} />
                  </Routes>
                </main>
              </>
            } />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
