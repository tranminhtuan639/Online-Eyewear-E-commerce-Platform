<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    Response::error('Phương thức không hợp lệ', 405);
}

$currentAdmin = Auth::requireRole(['quanly']);

$id = $_GET['id'] ?? '';
if ($id === '') {
    Response::error('Thiếu id');
}

if ($id === $currentAdmin['id']) {
    Response::error('Không thể tự xoá tài khoản của chính mình');
}

$pdo = getDbConnection();

$stmt = $pdo->prepare('SELECT id FROM nguoidung WHERE id = :id');
$stmt->execute(['id' => $id]);
if (!$stmt->fetch()) {
    Response::error('Không tìm thấy người dùng', 404);
}

try {
    $stmt = $pdo->prepare('DELETE FROM nguoidung WHERE id = :id');
    $stmt->execute(['id' => $id]);
} catch (PDOException $e) {
    // FK ON DELETE RESTRICT ở bảng donhang sẽ chặn xoá nếu user đã từng đặt hàng
    Response::error('Không thể xoá user này vì đã có đơn hàng liên quan. Hãy cân nhắc khoá tài khoản thay vì xoá.', 409);
}

Response::success('Xoá người dùng thành công');
