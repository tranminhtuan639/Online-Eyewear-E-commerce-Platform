<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();
$currentUser = Auth::requireLogin();

$pdo = getDbConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare(
        'SELECT id, email, ho_ten, vai_tro, anh_dai_dien, tao_luc FROM nguoidung WHERE id = :id'
    );
    $stmt->execute(['id' => $currentUser['id']]);
    Response::success('OK', $stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $hoTen = trim($input['ho_ten'] ?? '');

    if ($hoTen === '') {
        Response::error('Họ tên không được để trống');
    }

    // Cố tình KHÔNG cho phép sửa email/vai_tro ở đây.
    // Đổi email cần xác thực lại (không nằm trong yêu cầu đồ án), đổi vai_tro chỉ admin được làm.
    $stmt = $pdo->prepare('UPDATE nguoidung SET ho_ten = :ho_ten WHERE id = :id');
    $stmt->execute(['ho_ten' => $hoTen, 'id' => $currentUser['id']]);

    // Cập nhật lại session cho khớp dữ liệu mới
    $currentUser['ho_ten'] = $hoTen;
    Auth::login($currentUser);

    Response::success('Cập nhật thông tin thành công', $currentUser);
    exit;
}

Response::error('Phương thức không hợp lệ', 405);
