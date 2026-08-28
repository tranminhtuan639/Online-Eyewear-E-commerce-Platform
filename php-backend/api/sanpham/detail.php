<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Phương thức không hợp lệ', 405);
}

$id = $_GET['id'] ?? '';
if ($id === '') {
    Response::error('Thiếu id');
}

$pdo = getDbConnection();

$stmt = $pdo->prepare('SELECT * FROM sanpham WHERE id = :id');
$stmt->execute(['id' => $id]);
$sanPham = $stmt->fetch();

if (!$sanPham) {
    Response::error('Không tìm thấy sản phẩm', 404);
}

$imgStmt = $pdo->prepare(
    'SELECT id, duong_dan, thu_tu FROM sanpham_hinhanh WHERE sanpham_id = :id ORDER BY thu_tu ASC'
);
$imgStmt->execute(['id' => $id]);
$sanPham['hinh_anh'] = $imgStmt->fetchAll();

Response::success('OK', $sanPham);
