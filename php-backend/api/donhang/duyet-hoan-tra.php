<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();
Auth::requireRole(['quanly']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ', 405);
}

$id = $_GET['id'] ?? '';
if ($id === '') {
    Response::error('Thiếu id');
}

$pdo = getDbConnection();
$stmt = $pdo->prepare('SELECT trang_thai FROM donhang WHERE id = :id');
$stmt->execute(['id' => $id]);
$donHang = $stmt->fetch();

if (!$donHang) {
    Response::error('Không tìm thấy đơn hàng', 404);
}
if ($donHang['trang_thai'] !== 'yeu_cau_hoan_tra') {
    Response::error('Đơn hàng không ở trạng thái chờ duyệt yêu cầu hoàn trả', 409);
}

$stmt = $pdo->prepare('UPDATE donhang SET trang_thai = :trang_thai WHERE id = :id');
$stmt->execute(['trang_thai' => 'cho_duyet_tra_hang', 'id' => $id]);

Response::success('Đã duyệt yêu cầu hoàn trả, chờ khách gửi hàng về');
