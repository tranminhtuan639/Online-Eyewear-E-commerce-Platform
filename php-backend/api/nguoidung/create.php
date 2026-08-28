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

Auth::requireRole(['quanly']);

$input = json_decode(file_get_contents('php://input'), true);

$email   = trim($input['email'] ?? '');
$matKhau = $input['mat_khau'] ?? '';
$hoTen   = trim($input['ho_ten'] ?? '');
$vaiTro  = $input['vai_tro'] ?? 'khachhang';

if ($email === '' || $matKhau === '' || $hoTen === '') {
    Response::error('Vui lòng nhập đầy đủ email, mật khẩu và họ tên');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error('Email không hợp lệ');
}
if (strlen($matKhau) < 6) {
    Response::error('Mật khẩu phải có ít nhất 6 ký tự');
}
if (!in_array($vaiTro, ['khachhang', 'quanly'], true)) {
    Response::error('Vai trò không hợp lệ');
}

$pdo = getDbConnection();

$stmt = $pdo->prepare('SELECT id FROM nguoidung WHERE email = :email');
$stmt->execute(['email' => $email]);
if ($stmt->fetch()) {
    Response::error('Email đã được sử dụng', 409);
}

$id = Uuid::v4();
$hash = password_hash($matKhau, PASSWORD_DEFAULT);

$stmt = $pdo->prepare(
    'INSERT INTO nguoidung (id, email, mat_khau_hash, ho_ten, vai_tro)
     VALUES (:id, :email, :hash, :ho_ten, :vai_tro)'
);
$stmt->execute([
    'id'      => $id,
    'email'   => $email,
    'hash'    => $hash,
    'ho_ten'  => $hoTen,
    'vai_tro' => $vaiTro,
]);

Response::success('Tạo người dùng thành công', [
    'id'      => $id,
    'email'   => $email,
    'ho_ten'  => $hoTen,
    'vai_tro' => $vaiTro,
], 201);
