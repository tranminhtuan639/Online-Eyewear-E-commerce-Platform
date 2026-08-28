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
$stmt = $pdo->prepare('SELECT * FROM don_kinh WHERE id = :id');
$stmt->execute(['id' => $id]);
$donKinh = $stmt->fetch();

if (!$donKinh) {
    Response::error('Không tìm thấy đơn kính', 404);
}

Auth::requireOwnerOrRole($donKinh['nguoidung_id']);

Response::success('OK', $donKinh);
