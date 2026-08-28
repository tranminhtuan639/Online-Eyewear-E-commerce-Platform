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

$id = $_GET['id'] ?? '';
if ($id === '') {
    Response::error('Thiếu id');
}

$pdo = getDbConnection();
$stmt = $pdo->prepare(
    'SELECT id, email, ho_ten, vai_tro, tao_luc, cap_nhat_luc FROM nguoidung WHERE id = :id'
);
$stmt->execute(['id' => $id]);
$user = $stmt->fetch();

if (!$user) {
    Response::error('Không tìm thấy người dùng', 404);
}

Response::success('OK', $user);
