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

$id = $_GET['id'] ?? '';
if ($id === '') {
    Response::error('Thiếu id');
}

$pdo = getDbConnection();

$stmt = $pdo->prepare('SELECT sanpham_id, nguoidung_id FROM sanpham_danhgia WHERE id = :id');
$stmt->execute(['id' => $id]);
$danhGia = $stmt->fetch();

if (!$danhGia) {
    Response::error('Không tìm thấy đánh giá', 404);
}

// Chỉ chủ đánh giá hoặc quản lý mới được xoá
Auth::requireOwnerOrRole($danhGia['nguoidung_id']);

$deleteStmt = $pdo->prepare('DELETE FROM sanpham_danhgia WHERE id = :id');
$deleteStmt->execute(['id' => $id]);

$tongKetStmt = $pdo->prepare(
    'SELECT COUNT(*) AS tong, COALESCE(AVG(so_sao), 0) AS trung_binh
     FROM sanpham_danhgia WHERE sanpham_id = :sanpham_id'
);
$tongKetStmt->execute(['sanpham_id' => $danhGia['sanpham_id']]);
$tongKet = $tongKetStmt->fetch();

Response::success('Đã xoá đánh giá', [
    'tong_so_danh_gia' => (int)$tongKet['tong'],
    'diem_trung_binh'  => round((float)$tongKet['trung_binh'], 1),
]);
