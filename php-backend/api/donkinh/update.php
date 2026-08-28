<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Upload.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();

// Dùng POST thay vì PUT vì có thể kèm file upload (giống lý do ở module SanPham)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ, dùng POST', 405);
}

$id = $_GET['id'] ?? $_POST['id'] ?? '';
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

$odCau        = $_POST['od_cau'] ?? $donKinh['od_cau'];
$osCau        = $_POST['os_cau'] ?? $donKinh['os_cau'];
$khoangDongTu = $_POST['khoang_dong_tu'] ?? $donKinh['khoang_dong_tu'];
$ghiChu       = array_key_exists('ghi_chu', $_POST) ? trim($_POST['ghi_chu']) : $donKinh['ghi_chu'];

foreach (['od_cau' => $odCau, 'os_cau' => $osCau, 'khoang_dong_tu' => $khoangDongTu] as $ten => $giaTri) {
    if ($giaTri !== null && $giaTri !== '' && !is_numeric($giaTri)) {
        Response::error("Giá trị $ten không hợp lệ");
    }
}

$fileUrl = $donKinh['file_url'];
if (!empty($_FILES['file']) && $_FILES['file']['error'] !== UPLOAD_ERR_NO_FILE) {
    try {
        $newFileUrl = Upload::saveImage($_FILES['file'], 'donkinh');
    } catch (Exception $e) {
        Response::error('Lỗi upload file toa kính: ' . $e->getMessage());
    }
    // Xoá file cũ sau khi upload file mới thành công
    if ($fileUrl) {
        Upload::deleteFile($fileUrl);
    }
    $fileUrl = $newFileUrl;
}

$stmt = $pdo->prepare(
    'UPDATE don_kinh
     SET od_cau = :od_cau, os_cau = :os_cau, khoang_dong_tu = :khoang_dong_tu,
         file_url = :file_url, ghi_chu = :ghi_chu
     WHERE id = :id'
);
$stmt->execute([
    'od_cau'         => $odCau ?: null,
    'os_cau'         => $osCau ?: null,
    'khoang_dong_tu' => $khoangDongTu ?: null,
    'file_url'       => $fileUrl,
    'ghi_chu'        => $ghiChu ?: null,
    'id'             => $id,
]);

Response::success('Cập nhật đơn kính thành công', ['file_url' => $fileUrl]);
