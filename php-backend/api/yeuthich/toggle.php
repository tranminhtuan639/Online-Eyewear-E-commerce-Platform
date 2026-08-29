<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Uuid.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ', 405);
}

// Bắt buộc đăng nhập mới được yêu thích sản phẩm.
$currentUser = Auth::requireLogin();

$input = json_decode(file_get_contents('php://input'), true);
$sanPhamId = trim($input['sanpham_id'] ?? '');

if ($sanPhamId === '') {
    Response::error('Thiếu sanpham_id');
}

$pdo = getDbConnection();

// Kiểm tra sản phẩm tồn tại
$stmt = $pdo->prepare('SELECT id FROM sanpham WHERE id = :id');
$stmt->execute(['id' => $sanPhamId]);
if (!$stmt->fetch()) {
    Response::error('Không tìm thấy sản phẩm', 404);
}

// Đã yêu thích chưa?
$checkStmt = $pdo->prepare(
    'SELECT id FROM sanpham_yeuthich WHERE sanpham_id = :sanpham_id AND nguoidung_id = :nguoidung_id'
);
$checkStmt->execute([
    'sanpham_id'   => $sanPhamId,
    'nguoidung_id' => $currentUser['id'],
]);
$daYeuThich = $checkStmt->fetch();

if ($daYeuThich) {
    // Đã thích rồi -> bấm lại nghĩa là bỏ thích
    $deleteStmt = $pdo->prepare('DELETE FROM sanpham_yeuthich WHERE id = :id');
    $deleteStmt->execute(['id' => $daYeuThich['id']]);
    $daYeuThichMoi = false;
} else {
    // Chưa thích -> thêm mới
    $insertStmt = $pdo->prepare(
        'INSERT INTO sanpham_yeuthich (id, sanpham_id, nguoidung_id) VALUES (:id, :sanpham_id, :nguoidung_id)'
    );
    $insertStmt->execute([
        'id'           => Uuid::v4(),
        'sanpham_id'   => $sanPhamId,
        'nguoidung_id' => $currentUser['id'],
    ]);
    $daYeuThichMoi = true;
}

// Đếm lại tổng số lượt yêu thích mới nhất để frontend cập nhật ngay, khỏi phải gọi lại API khác.
$countStmt = $pdo->prepare('SELECT COUNT(*) AS so_luot FROM sanpham_yeuthich WHERE sanpham_id = :id');
$countStmt->execute(['id' => $sanPhamId]);
$tongLuot = (int)$countStmt->fetch()['so_luot'];

Response::success(
    $daYeuThichMoi ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích',
    [
        'da_yeu_thich'   => $daYeuThichMoi,
        'luot_yeu_thich' => $tongLuot,
    ]
);
