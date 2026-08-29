<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();
$currentUser = Auth::requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Phương thức không hợp lệ', 405);
}

$pdo = getDbConnection();

$page   = max(1, (int)($_GET['page'] ?? 1));
$limit  = max(1, min(100, (int)($_GET['limit'] ?? 10)));
$offset = ($page - 1) * $limit;

$conditions = [];
$params = [];

// Trang /admin/don-hang phải chủ động gửi xem_tat_ca=1 mới được xem toàn bộ đơn hàng hệ thống.
// Nếu không có cờ này (vd: quản lý tự vào /don-hang xem đơn của chính mình),
// dù là vai trò quanly cũng CHỈ thấy đơn của bản thân — tránh lộ đơn của người khác.
$xemTatCa = ($_GET['xem_tat_ca'] ?? '') === '1';

if ($currentUser['vai_tro'] === 'quanly' && $xemTatCa) {
    // Admin có thể lọc theo trạng thái và/hoặc theo 1 khách hàng cụ thể
    $trangThai = $_GET['trang_thai'] ?? '';
    if ($trangThai !== '') {
        $conditions[] = 'trang_thai = :trang_thai';
        $params['trang_thai'] = $trangThai;
    }
    $nguoidungId = $_GET['nguoidung_id'] ?? '';
    if ($nguoidungId !== '') {
        $conditions[] = 'nguoidung_id = :nguoidung_id';
        $params['nguoidung_id'] = $nguoidungId;
    }
} else {
    // Mặc định: chỉ xem được đơn của chính mình (thay thế RLS đã bỏ).
    // Áp dụng cho MỌI vai trò, kể cả quanly, khi không có cờ xem_tat_ca.
    $conditions[] = 'nguoidung_id = :nguoidung_id';
    $params['nguoidung_id'] = $currentUser['id'];

    $trangThai = $_GET['trang_thai'] ?? '';
    if ($trangThai !== '') {
        $conditions[] = 'trang_thai = :trang_thai';
        $params['trang_thai'] = $trangThai;
    }
}

$where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

$countStmt = $pdo->prepare("SELECT COUNT(*) AS tong FROM donhang $where");
$countStmt->execute($params);
$tong = (int)$countStmt->fetch()['tong'];

$stmt = $pdo->prepare(
    "SELECT id, nguoidung_id, trang_thai, tong_tien, ho_ten_nguoi_nhan, so_dien_thoai, dia_chi, tao_luc
     FROM donhang
     $where
     ORDER BY tao_luc DESC
     LIMIT :limit OFFSET :offset"
);
foreach ($params as $key => $value) {
    $stmt->bindValue(':' . $key, $value);
}
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();

Response::success('OK', [
    'items' => $stmt->fetchAll(),
    'phan_trang' => [
        'trang_hien_tai' => $page,
        'so_dong_moi_trang' => $limit,
        'tong_so_dong' => $tong,
        'tong_so_trang' => (int)ceil($tong / $limit),
    ],
]);
