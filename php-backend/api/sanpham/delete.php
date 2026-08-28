<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Upload.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    Response::error('Phương thức không hợp lệ', 405);
}

Auth::requireRole(['quanly']);

$id = $_GET['id'] ?? '';
if ($id === '') {
    Response::error('Thiếu id');
}

$pdo = getDbConnection();

$stmt = $pdo->prepare('SELECT id FROM sanpham WHERE id = :id');
$stmt->execute(['id' => $id]);
if (!$stmt->fetch()) {
    Response::error('Không tìm thấy sản phẩm', 404);
}

// Lấy danh sách ảnh trước để xoá file vật lý sau khi xoá DB thành công
$imgStmt = $pdo->prepare('SELECT duong_dan FROM sanpham_hinhanh WHERE sanpham_id = :id');
$imgStmt->execute(['id' => $id]);
$anhList = $imgStmt->fetchAll();

try {
    // sanpham_hinhanh tự động bị xoá theo nhờ ON DELETE CASCADE
    $stmt = $pdo->prepare('DELETE FROM sanpham WHERE id = :id');
    $stmt->execute(['id' => $id]);
} catch (PDOException $e) {
    // FK ON DELETE RESTRICT từ donhang_chitiet: sản phẩm đã từng được đặt hàng thì không cho xoá
    Response::error('Không thể xoá sản phẩm này vì đã có trong đơn hàng. Hãy đặt số lượng tồn về 0 thay vì xoá.', 409);
}

foreach ($anhList as $anh) {
    Upload::deleteFile($anh['duong_dan']);
}

Response::success('Xoá sản phẩm thành công');
