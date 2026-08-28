<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();
$currentUser = Auth::requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ', 405);
}

$id = $_GET['id'] ?? '';
if ($id === '') {
    Response::error('Thiếu id');
}

$pdo = getDbConnection();
$stmt = $pdo->prepare('SELECT * FROM donhang WHERE id = :id');
$stmt->execute(['id' => $id]);
$donHang = $stmt->fetch();

if (!$donHang) {
    Response::error('Không tìm thấy đơn hàng', 404);
}

Auth::requireOwnerOrRole($donHang['nguoidung_id']);

// Khách chỉ huỷ được khi đơn còn sớm (chưa xử lý/giao).
// Admin (quanly) được huỷ rộng hơn, tới trước khi hàng đang giao.
$trangThaiChoPhepHuy = $currentUser['vai_tro'] === 'quanly'
    ? ['cho_thanh_toan', 'cho_xac_nhan', 'dang_xu_ly']
    : ['cho_thanh_toan', 'cho_xac_nhan'];

if (!in_array($donHang['trang_thai'], $trangThaiChoPhepHuy, true)) {
    Response::error('Đơn hàng ở trạng thái hiện tại không thể huỷ', 409);
}

$pdo->beginTransaction();
try {
    $ctStmt = $pdo->prepare('SELECT sanpham_id, so_luong FROM donhang_chitiet WHERE donhang_id = :id');
    $ctStmt->execute(['id' => $id]);
    $chiTiet = $ctStmt->fetchAll();

    // Hoàn lại tồn kho cho từng sản phẩm trong đơn bị huỷ
    $restoreStmt = $pdo->prepare('UPDATE sanpham SET so_luong_ton = so_luong_ton + :sl WHERE id = :id');
    foreach ($chiTiet as $ct) {
        $restoreStmt->execute(['sl' => $ct['so_luong'], 'id' => $ct['sanpham_id']]);
    }

    $updateStmt = $pdo->prepare('UPDATE donhang SET trang_thai = :trang_thai WHERE id = :id');
    $updateStmt->execute(['trang_thai' => 'da_huy', 'id' => $id]);

    $pdo->commit();
    Response::success('Huỷ đơn hàng thành công');
} catch (Exception $e) {
    $pdo->rollBack();
    Response::error('Huỷ đơn hàng thất bại: ' . $e->getMessage(), 500);
}
