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

$ctStmt = $pdo->prepare(
    'SELECT ct.id, ct.sanpham_id, sp.ten AS ten_sanpham, ct.don_kinh_id, ct.so_luong, ct.gia_ban
     FROM donhang_chitiet ct
     JOIN sanpham sp ON sp.id = ct.sanpham_id
     WHERE ct.donhang_id = :id'
);
$ctStmt->execute(['id' => $id]);
$donHang['chi_tiet'] = $ctStmt->fetchAll();

Response::success('OK', $donHang);
