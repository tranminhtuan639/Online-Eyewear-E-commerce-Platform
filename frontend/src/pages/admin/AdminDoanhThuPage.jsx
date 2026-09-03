import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { listDonHang } from '../../api/donHang'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

const trangThaiOptions = [
  { value: 'cho_xac_nhan',          label: 'Chờ xác nhận',        color: 'bg-blue-100 text-blue-700',     hex: '#3b82f6' },
  { value: 'dang_xu_ly',            label: 'Đang xử lý',          color: 'bg-indigo-100 text-indigo-700', hex: '#6366f1' },
  { value: 'dang_giao',             label: 'Đang giao',           color: 'bg-purple-100 text-purple-700', hex: '#a855f7' },
  { value: 'hoan_thanh',            label: 'Hoàn thành',          color: 'bg-green-100 text-green-700',   hex: '#22c55e' },
  { value: 'da_huy',                label: 'Đã hủy',              color: 'bg-red-100 text-red-700',       hex: '#ef4444' },
  { value: 'yeu_cau_hoan_tra',      label: 'Yêu cầu hoàn trả',    color: 'bg-orange-100 text-orange-700', hex: '#f97316' },
  { value: 'cho_duyet_tra_hang',    label: 'Chờ duyệt trả hàng',  color: 'bg-yellow-100 text-yellow-700', hex: '#facc15' },
  { value: 'dang_hoan_hang',        label: 'Đang hoàn hàng',      color: 'bg-pink-100 text-pink-700',     hex: '#ec4899' },
  { value: 'da_tra_hang_hoan_tien', label: 'Đã hoàn tiền',        color: 'bg-teal-100 text-teal-700',     hex: '#14b8a6' },
  { value: 'tu_choi_hoan_tra',      label: 'Từ chối hoàn trả',    color: 'bg-gray-100 text-gray-600',     hex: '#9ca3af' },
]

const khoangThoiGianOptions = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: 'month', label: 'Tháng này' },
  { value: 'custom', label: 'Tùy chọn' },
]

// Trả về [start, end] (Date, bao trọn cả ngày) theo lựa chọn khoảng thời gian
function tinhKhoangNgay(timeFilter, customFrom, customTo) {
  const now = new Date()
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  if (timeFilter === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    return [start, endOfToday]
  }
  if (timeFilter === '7d') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0)
    return [start, endOfToday]
  }
  if (timeFilter === '30d') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0)
    return [start, endOfToday]
  }
  if (timeFilter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    return [start, endOfToday]
  }
  // custom
  const start = customFrom ? new Date(`${customFrom}T00:00:00`) : new Date(0)
  const end = customTo ? new Date(`${customTo}T23:59:59.999`) : endOfToday
  return [start, end]
}

function formatNgay(d) {
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
function formatThang(d) {
  return `Th${d.getMonth() + 1}/${d.getFullYear()}`
}

function SortHeader({ label: labelText, sortKey, align = 'right', sortConfig, onSort }) {
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`px-5 py-3 cursor-pointer select-none hover:text-gray-700 transition ${
        align === 'left' ? 'text-left' : 'text-right'
      }`}
    >
      {labelText} {sortConfig.key === sortKey && (sortConfig.dir === 'asc' ? '↑' : '↓')}
    </th>
  )
}

export default function AdminDoanhThuPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [timeFilter, setTimeFilter] = useState('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const [sortConfig, setSortConfig] = useState({ key: 'tong', dir: 'desc' })
  const [tableTrangThaiFilter, setTableTrangThaiFilter] = useState('')

  useEffect(() => {
    let cancelled = false
    // Chưa có API thống kê riêng, tạm lấy tối đa 1000 đơn gần nhất để tính (đủ dùng cho đồ án).
    // xem_tat_ca: 1 bắt buộc để admin thấy đơn của TẤT CẢ khách hàng, không chỉ đơn của chính admin.
    listDonHang({ limit: 1000, xem_tat_ca: 1 })
      .then(res => { if (!cancelled) setOrders(res.data.data.items) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const [rangeStart, rangeEnd] = useMemo(
    () => tinhKhoangNgay(timeFilter, customFrom, customTo),
    [timeFilter, customFrom, customTo]
  )

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const d = new Date(o.tao_luc)
      return d >= rangeStart && d <= rangeEnd
    })
  }, [orders, rangeStart, rangeEnd])

  // ----- KPI -----
  const donHoanThanh = useMemo(
    () => filteredOrders.filter(o => o.trang_thai === 'hoan_thanh'),
    [filteredOrders]
  )
  const doanhThuThuc = donHoanThanh.reduce((sum, o) => sum + Number(o.tong_tien), 0)
  const tongDonTrongKhoang = filteredOrders.length
  const tyLeHoanThanh = tongDonTrongKhoang > 0 ? (donHoanThanh.length / tongDonTrongKhoang) * 100 : 0
  const giaTriTBDon = donHoanThanh.length > 0 ? doanhThuThuc / donHoanThanh.length : 0

  // ----- Biểu đồ doanh thu theo thời gian (nhóm theo ngày, hoặc theo tháng nếu khoảng > 60 ngày) -----
  const soNgayTrongKhoang = Math.max(1, Math.round((rangeEnd - rangeStart) / 86400000))
  const nhomTheoThang = soNgayTrongKhoang > 60

  const revenueTimelineData = useMemo(() => {
    const map = new Map()
    donHoanThanh.forEach(o => {
      const d = new Date(o.tao_luc)
      const key = nhomTheoThang
        ? `${d.getFullYear()}-${d.getMonth()}`
        : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      const label = nhomTheoThang ? formatThang(d) : formatNgay(d)
      const sortKey = nhomTheoThang
        ? d.getFullYear() * 100 + d.getMonth()
        : Math.floor(d.getTime() / 86400000)
      if (!map.has(key)) map.set(key, { key, label, sortKey, doanhThu: 0 })
      map.get(key).doanhThu += Number(o.tong_tien)
    })
    return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey)
  }, [donHoanThanh, nhomTheoThang])

  // ----- Thống kê theo trạng thái (dùng chung cho bar chart, pie chart, bảng) -----
  const thongKeTheoTrangThai = trangThaiOptions
    .map(tt => ({
      ...tt,
      count: filteredOrders.filter(o => o.trang_thai === tt.value).length,
      tong: filteredOrders
        .filter(o => o.trang_thai === tt.value)
        .reduce((sum, o) => sum + Number(o.tong_tien), 0),
    }))
    .filter(tt => tt.count > 0) // chỉ hiện trạng thái nào thực sự có đơn, tránh biểu đồ/bảng dài lê thê

  const bangHienThi = thongKeTheoTrangThai
    .filter(tt => !tableTrangThaiFilter || tt.value === tableTrangThaiFilter)
    .sort((a, b) => {
      const dir = sortConfig.dir === 'asc' ? 1 : -1
      if (sortConfig.key === 'label') return a.label.localeCompare(b.label) * dir
      return (a[sortConfig.key] - b[sortConfig.key]) * dir
    })

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }
    )
  }

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Doanh thu</h1>

      {/* Bộ lọc thời gian */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {khoangThoiGianOptions.map(o => (
            <button
              key={o.value}
              onClick={() => setTimeFilter(o.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                timeFilter === o.value
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {timeFilter === 'custom' && (
          <div className="flex items-center gap-2 text-sm">
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <span className="text-gray-400">→</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl mb-3">💰</div>
              <p className="text-xl font-bold text-gray-800">{doanhThuThuc.toLocaleString('vi-VN')}₫</p>
              <p className="text-sm text-gray-500 mt-0.5">Doanh thu thực</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-3">📦</div>
              <p className="text-xl font-bold text-gray-800">{donHoanThanh.length}</p>
              <p className="text-sm text-gray-500 mt-0.5">Đơn hoàn thành</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-3">📊</div>
              <p className="text-xl font-bold text-gray-800">{tyLeHoanThanh.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 mt-0.5">Đơn hoàn thành %</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-3">🧾</div>
              <p className="text-xl font-bold text-gray-800">{Math.round(giaTriTBDon).toLocaleString('vi-VN')}₫</p>
              <p className="text-sm text-gray-500 mt-0.5">Giá trị TB/đơn</p>
            </div>
          </div>

          {/* Biểu đồ doanh thu theo thời gian */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <p className="font-semibold text-gray-700 text-sm mb-4">
              Doanh thu theo {nhomTheoThang ? 'tháng' : 'ngày'}
            </p>
            {revenueTimelineData.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">Không có dữ liệu trong khoảng thời gian này</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(0)}tr` : v.toLocaleString('vi-VN')}
                  />
                  <Tooltip formatter={v => `${Number(v).toLocaleString('vi-VN')}₫`} />
                  <Line type="monotone" dataKey="doanhThu" name="Doanh thu" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Doanh thu theo trạng thái + tỷ lệ trạng thái đơn */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="font-semibold text-gray-700 text-sm mb-4">Doanh thu theo trạng thái</p>
              {thongKeTheoTrangThai.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">Không có dữ liệu</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={thongKeTheoTrangThai} margin={{ left: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-20} textAnchor="end" height={60} />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(0)}tr` : v.toLocaleString('vi-VN')}
                    />
                    <Tooltip formatter={v => `${Number(v).toLocaleString('vi-VN')}₫`} />
                    <Bar dataKey="tong" name="Tổng tiền" radius={[6, 6, 0, 0]}>
                      {thongKeTheoTrangThai.map(tt => <Cell key={tt.value} fill={tt.hex} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="font-semibold text-gray-700 text-sm mb-4">Tỷ lệ trạng thái đơn</p>
              {thongKeTheoTrangThai.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">Không có dữ liệu</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={thongKeTheoTrangThai}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {thongKeTheoTrangThai.map(tt => <Cell key={tt.value} fill={tt.hex} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} đơn`, n]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bảng chi tiết theo trạng thái, có filter + sort */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-gray-700 text-sm">Thống kê theo trạng thái</p>
              <select
                value={tableTrangThaiFilter}
                onChange={e => setTableTrangThaiFilter(e.target.value)}
                className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Tất cả trạng thái</option>
                {trangThaiOptions.map(tt => (
                  <option key={tt.value} value={tt.value}>{tt.label}</option>
                ))}
              </select>
            </div>

            {/* Mobile: dạng danh sách card, hiện số đơn + tổng tiền cho từng trạng thái */}
            <div className="sm:hidden divide-y divide-gray-50">
              {bangHienThi.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">Không có dữ liệu trong khoảng thời gian này</div>
              ) : bangHienThi.map(tt => (
                <div key={tt.value} className="px-4 py-3.5 flex items-center justify-between gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${tt.color}`}>
                    {tt.label}
                  </span>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-600">{tt.count} đơn</p>
                    <p className="text-sm font-bold text-gray-800">{tt.tong.toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / tablet: bảng đầy đủ với sort */}
            <table className="w-full text-sm hidden sm:table">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <SortHeader label="Trạng thái" sortKey="label" align="left" sortConfig={sortConfig} onSort={handleSort} />
                  <SortHeader label="Số đơn" sortKey="count" sortConfig={sortConfig} onSort={handleSort} />
                  <SortHeader label="Tổng tiền" sortKey="tong" sortConfig={sortConfig} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bangHienThi.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-gray-400">Không có dữ liệu trong khoảng thời gian này</td>
                  </tr>
                ) : bangHienThi.map(tt => (
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
