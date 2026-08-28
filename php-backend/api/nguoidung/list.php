<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Phương thức không hợp lệ', 405);
}

Auth::requireRole(['quanly']);

$pdo = getDbConnection();

// ----- Phân trang -----
$page  = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(100, (int)($_GET['limit'] ?? 10))); // chặn limit quá lớn
$offset = ($page - 1) * $limit;

// ----- Tìm kiếm theo email hoặc họ tên (tuỳ chọn) -----
$search = trim($_GET['search'] ?? '');
$where = '';
$params = [];
if ($search !== '') {
    $where = 'WHERE email LIKE :search OR ho_ten LIKE :search';
    $params['search'] = '%' . $search . '%';
}

// ----- Đếm tổng số bản ghi để frontend vẽ phân trang -----
$countStmt = $pdo->prepare("SELECT COUNT(*) AS tong FROM nguoidung $where");
$countStmt->execute($params);
$tong = (int)$countStmt->fetch()['tong'];

// ----- Lấy dữ liệu trang hiện tại -----
$sql = "SELECT id, email, ho_ten, vai_tro, tao_luc, cap_nhat_luc
        FROM nguoidung
        $where
        ORDER BY tao_luc DESC
        LIMIT :limit OFFSET :offset";
$stmt = $pdo->prepare($sql);
foreach ($params as $key => $value) {
    $stmt->bindValue(':' . $key, $value);
}
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$users = $stmt->fetchAll();

Response::success('OK', [
    'items' => $users,
    'phan_trang' => [
        'trang_hien_tai' => $page,
        'so_dong_moi_trang' => $limit,
        'tong_so_dong' => $tong,
        'tong_so_trang' => (int)ceil($tong / $limit),
    ],
]);
