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

// Chỉ chủ đơn hàng mới được yêu cầu hoàn trả, admin không thay mặt khách làm việc này
if ($donHang['nguoidung_id'] !== $currentUser['id']) {
    Response::error('Bạn không có quyền yêu cầu hoàn trả đơn hàng này', 403);
}

if ($donHang['trang_thai'] !== 'hoan_thanh') {
    Response::error('Chỉ có thể yêu cầu hoàn trả khi đơn hàng đã hoàn thành', 409);
}

$input = json_decode(file_get_contents('php://input'), true);

$lyDo          = trim($input['ly_do_hoan_tra'] ?? '');
$tenNganHang   = trim($input['ten_ngan_hang'] ?? '');
$soTaiKhoan    = trim($input['so_tai_khoan'] ?? '');
$tenChuTaiKhoan = trim($input['ten_chu_tai_khoan'] ?? '');

if ($lyDo === '' || $tenNganHang === '' || $soTaiKhoan === '' || $tenChuTaiKhoan === '') {
    Response::error('Vui lòng nhập đầy đủ lý do hoàn trả và thông tin ngân hàng nhận tiền');
}

$stmt = $pdo->prepare(
    'UPDATE donhang
     SET trang_thai = :trang_thai, ly_do_hoan_tra = :ly_do,
         ten_ngan_hang = :ngan_hang, so_tai_khoan = :so_tk, ten_chu_tai_khoan = :chu_tk,
         ly_do_tu_choi = NULL
     WHERE id = :id'
);
$stmt->execute([
    'trang_thai' => 'yeu_cau_hoan_tra',
    'ly_do'      => $lyDo,
    'ngan_hang'  => $tenNganHang,
    'so_tk'      => $soTaiKhoan,
    'chu_tk'     => $tenChuTaiKhoan,
    'id'         => $id,
]);

Response::success('Gửi yêu cầu hoàn trả thành công, vui lòng chờ admin duyệt');
