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

$input = json_decode(file_get_contents('php://input'), true);

$email   = trim($input['email'] ?? '');
$matKhau = $input['mat_khau'] ?? '';
$hoTen   = trim($input['ho_ten'] ?? '');

// ----- Validate -----
if ($email === '' || $matKhau === '' || $hoTen === '') {
    Response::error('Vui lòng nhập đầy đủ email, mật khẩu và họ tên');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error('Email không hợp lệ');
}
if (strlen($matKhau) < 6) {
    Response::error('Mật khẩu phải có ít nhất 6 ký tự');
}

$pdo = getDbConnection();

// Kiểm tra email đã tồn tại chưa
$stmt = $pdo->prepare('SELECT id FROM nguoidung WHERE email = :email');
$stmt->execute(['email' => $email]);
if ($stmt->fetch()) {
    Response::error('Email đã được sử dụng', 409);
}

// Vai trò mặc định luôn là khachhang khi tự đăng ký.
// Không cho phép client tự chọn vai_tro ở đây để tránh tự phong admin cho mình.
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
    'vai_tro' => 'khachhang',
]);

$user = [
    'id'      => $id,
    'email'   => $email,
    'ho_ten'  => $hoTen,
    'vai_tro' => 'khachhang',
];

// Tự đăng nhập luôn sau khi đăng ký thành công
Auth::login($user);

Response::success('Đăng ký thành công', $user, 201);
