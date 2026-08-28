<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();
Auth::requireRole(['quanly']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ', 405);
}

$id = $_GET['id'] ?? '';
if ($id === '') {
    Response::error('Thiếu id');
}

$input = json_decode(file_get_contents('php://input'), true);
$lyDoTuChoi = trim($input['ly_do_tu_choi'] ?? '');

if ($lyDoTuChoi === '') {
    Response::error('Vui lòng nhập lý do từ chối để khách hàng được biết');
}

$pdo = getDbConnection();
$stmt = $pdo->prepare('SELECT trang_thai FROM donhang WHERE id = :id');
$stmt->execute(['id' => $id]);
$donHang = $stmt->fetch();

if (!$donHang) {
    Response::error('Không tìm thấy đơn hàng', 404);
}
if ($donHang['trang_thai'] !== 'yeu_cau_hoan_tra') {
    Response::error('Đơn hàng không ở trạng thái chờ duyệt yêu cầu hoàn trả', 409);
}

$stmt = $pdo->prepare(
    'UPDATE donhang SET trang_thai = :trang_thai, ly_do_tu_choi = :ly_do WHERE id = :id'
);
$stmt->execute([
    'trang_thai' => 'tu_choi_hoan_tra',
    'ly_do'      => $lyDoTuChoi,
    'id'         => $id,
]);

Response::success('Đã từ chối yêu cầu hoàn trả');
