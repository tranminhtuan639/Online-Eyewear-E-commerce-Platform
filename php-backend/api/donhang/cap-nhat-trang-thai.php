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
$trangThaiMoi = $input['trang_thai'] ?? '';

// Bản đồ các bước chuyển hợp lệ: trạng thái hiện tại => [các trạng thái được phép chuyển tới].
// Không cho phép nhảy cóc (vd: đang "cho_xac_nhan" mà nhảy thẳng lên "hoan_thanh").
// Các bước liên quan tới hoàn trả có endpoint riêng (yeu-cau-hoan-tra, duyet-hoan-tra, tu-choi-hoan-tra)
// vì cần thêm dữ liệu (lý do, thông tin ngân hàng) nên không xử lý ở đây.
$luongHopLe = [
    'cho_thanh_toan'     => ['cho_xac_nhan', 'da_huy'],
    'cho_xac_nhan'       => ['dang_xu_ly', 'da_huy'],
    'dang_xu_ly'         => ['dang_giao', 'da_huy'],
    'dang_giao'          => ['hoan_thanh'],
    'cho_duyet_tra_hang' => ['dang_hoan_hang'],
    'dang_hoan_hang'     => ['da_tra_hang_hoan_tien'],
];

$pdo = getDbConnection();
$stmt = $pdo->prepare('SELECT * FROM donhang WHERE id = :id');
$stmt->execute(['id' => $id]);
$donHang = $stmt->fetch();

if (!$donHang) {
    Response::error('Không tìm thấy đơn hàng', 404);
}

$trangThaiHienTai = $donHang['trang_thai'];
$duocPhepChuyenToi = $luongHopLe[$trangThaiHienTai] ?? [];

if (!in_array($trangThaiMoi, $duocPhepChuyenToi, true)) {
    Response::error(
        "Không thể chuyển từ trạng thái \"$trangThaiHienTai\" sang \"$trangThaiMoi\". " .
        'Các trạng thái hợp lệ tiếp theo: ' . (empty($duocPhepChuyenToi) ? '(không có)' : implode(', ', $duocPhepChuyenToi)),
        409
    );
}

$pdo->beginTransaction();
try {
    // Nếu admin huỷ đơn ở bước dang_xu_ly, phải hoàn lại tồn kho giống như huy.php
    if ($trangThaiMoi === 'da_huy') {
        $ctStmt = $pdo->prepare('SELECT sanpham_id, so_luong FROM donhang_chitiet WHERE donhang_id = :id');
        $ctStmt->execute(['id' => $id]);
        $restoreStmt = $pdo->prepare('UPDATE sanpham SET so_luong_ton = so_luong_ton + :sl WHERE id = :id');
        foreach ($ctStmt->fetchAll() as $ct) {
            $restoreStmt->execute(['sl' => $ct['so_luong'], 'id' => $ct['sanpham_id']]);
        }
    }

    $updateStmt = $pdo->prepare('UPDATE donhang SET trang_thai = :trang_thai WHERE id = :id');
    $updateStmt->execute(['trang_thai' => $trangThaiMoi, 'id' => $id]);

    $pdo->commit();
    Response::success('Cập nhật trạng thái thành công', ['trang_thai' => $trangThaiMoi]);
} catch (Exception $e) {
    $pdo->rollBack();
    Response::error('Cập nhật trạng thái thất bại: ' . $e->getMessage(), 500);
}
