<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$email   = trim($input['email'] ?? '');
$matKhau = $input['mat_khau'] ?? '';

if ($email === '' || $matKhau === '') {
    Response::error('Vui lòng nhập email và mật khẩu');
}

$pdo = getDbConnection();
$stmt = $pdo->prepare(
    'SELECT id, email, mat_khau_hash, ho_ten, vai_tro, anh_dai_dien FROM nguoidung WHERE email = :email'
);
$stmt->execute(['email' => $email]);
$row = $stmt->fetch();

// Cố ý dùng chung 1 thông báo lỗi cho cả 2 trường hợp
// (sai email / sai mật khẩu) để tránh lộ email nào đã tồn tại trong hệ thống.
if (!$row || !password_verify($matKhau, $row['mat_khau_hash'])) {
    Response::error('Email hoặc mật khẩu không đúng', 401);
}

$user = [
    'id'           => $row['id'],
    'email'        => $row['email'],
    'ho_ten'       => $row['ho_ten'],
    'vai_tro'      => $row['vai_tro'],
    'anh_dai_dien' => $row['anh_dai_dien'],
];

Auth::login($user);

Response::success('Đăng nhập thành công', $user);
