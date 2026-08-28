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

// Khách chỉ xem được đơn kính của chính mình.
// Admin (quanly) có thể xem tất cả, hoặc lọc theo 1 user cụ thể bằng ?nguoidung_id=
if ($currentUser['vai_tro'] === 'quanly') {
    $nguoidungId = $_GET['nguoidung_id'] ?? null;
    $where = $nguoidungId ? 'WHERE nguoidung_id = :nguoidung_id' : '';
    $params = $nguoidungId ? ['nguoidung_id' => $nguoidungId] : [];
} else {
    $where = 'WHERE nguoidung_id = :nguoidung_id';
    $params = ['nguoidung_id' => $currentUser['id']];
}

$countStmt = $pdo->prepare("SELECT COUNT(*) AS tong FROM don_kinh $where");
$countStmt->execute($params);
$tong = (int)$countStmt->fetch()['tong'];

$stmt = $pdo->prepare(
    "SELECT * FROM don_kinh $where ORDER BY tao_luc DESC LIMIT :limit OFFSET :offset"
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
