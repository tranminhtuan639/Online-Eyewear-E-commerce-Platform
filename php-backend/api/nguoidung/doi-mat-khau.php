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

$input = json_decode(file_get_contents('php://input'), true);

$matKhauCu  = $input['mat_khau_cu'] ?? '';
$matKhauMoi = $input['mat_khau_moi'] ?? '';

if ($matKhauCu === '' || $matKhauMoi === '') {
    Response::error('Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới');
}
if (strlen($matKhauMoi) < 6) {
    Response::error('Mật khẩu mới phải có ít nhất 6 ký tự');
}

$pdo = getDbConnection();
$stmt = $pdo->prepare('SELECT mat_khau_hash FROM nguoidung WHERE id = :id');
$stmt->execute(['id' => $currentUser['id']]);
$row = $stmt->fetch();

if (!$row || !password_verify($matKhauCu, $row['mat_khau_hash'])) {
    Response::error('Mật khẩu cũ không đúng', 401);
}

$hash = password_hash($matKhauMoi, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('UPDATE nguoidung SET mat_khau_hash = :hash WHERE id = :id');
$stmt->execute(['hash' => $hash, 'id' => $currentUser['id']]);

Response::success('Đổi mật khẩu thành công');
