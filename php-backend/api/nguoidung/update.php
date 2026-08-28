<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Response::error('Phương thức không hợp lệ', 405);
}

$currentAdmin = Auth::requireRole(['quanly']);

$id = $_GET['id'] ?? '';
if ($id === '') {
    Response::error('Thiếu id');
}

$pdo = getDbConnection();
$stmt = $pdo->prepare('SELECT id, vai_tro FROM nguoidung WHERE id = :id');
$stmt->execute(['id' => $id]);
$target = $stmt->fetch();

if (!$target) {
    Response::error('Không tìm thấy người dùng', 404);
}

$input = json_decode(file_get_contents('php://input'), true);

$hoTen  = trim($input['ho_ten'] ?? '');
$vaiTro = $input['vai_tro'] ?? $target['vai_tro'];

if ($hoTen === '') {
    Response::error('Họ tên không được để trống');
}
if (!in_array($vaiTro, ['khachhang', 'quanly'], true)) {
    Response::error('Vai trò không hợp lệ');
}

// Chặn admin tự hạ quyền chính mình xuống khachhang -> tránh tự khoá quyền admin cuối cùng
if ($id === $currentAdmin['id'] && $vaiTro !== 'quanly') {
    Response::error('Không thể tự thay đổi vai trò của chính mình');
}

$sql = 'UPDATE nguoidung SET ho_ten = :ho_ten, vai_tro = :vai_tro WHERE id = :id';
$params = ['ho_ten' => $hoTen, 'vai_tro' => $vaiTro, 'id' => $id];

// Admin có thể reset mật khẩu người khác mà không cần biết mật khẩu cũ
if (!empty($input['mat_khau_moi'])) {
    if (strlen($input['mat_khau_moi']) < 6) {
        Response::error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    $sql = 'UPDATE nguoidung SET ho_ten = :ho_ten, vai_tro = :vai_tro, mat_khau_hash = :hash WHERE id = :id';
    $params['hash'] = password_hash($input['mat_khau_moi'], PASSWORD_DEFAULT);
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

Response::success('Cập nhật thành công');
