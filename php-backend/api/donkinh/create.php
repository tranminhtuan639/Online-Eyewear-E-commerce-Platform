<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Uuid.php';
require_once __DIR__ . '/../../helpers/Upload.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();
$currentUser = Auth::requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ', 405);
}

// Dùng multipart/form-data vì có thể kèm ảnh toa kính (file_url), không dùng JSON body
$odCau         = $_POST['od_cau'] ?? null;
$osCau         = $_POST['os_cau'] ?? null;
$khoangDongTu  = $_POST['khoang_dong_tu'] ?? null;
$ghiChu        = trim($_POST['ghi_chu'] ?? '');

foreach (['od_cau' => $odCau, 'os_cau' => $osCau, 'khoang_dong_tu' => $khoangDongTu] as $ten => $giaTri) {
    if ($giaTri !== null && $giaTri !== '' && !is_numeric($giaTri)) {
        Response::error("Giá trị $ten không hợp lệ");
    }
}

$fileUrl = null;
if (!empty($_FILES['file']) && $_FILES['file']['error'] !== UPLOAD_ERR_NO_FILE) {
    try {
        $fileUrl = Upload::saveImage($_FILES['file'], 'donkinh');
    } catch (Exception $e) {
        Response::error('Lỗi upload file toa kính: ' . $e->getMessage());
    }
}

$pdo = getDbConnection();
$id = Uuid::v4();

$stmt = $pdo->prepare(
    'INSERT INTO don_kinh (id, nguoidung_id, od_cau, os_cau, khoang_dong_tu, file_url, ghi_chu)
     VALUES (:id, :nguoidung_id, :od_cau, :os_cau, :khoang_dong_tu, :file_url, :ghi_chu)'
);
$stmt->execute([
    'id'             => $id,
    'nguoidung_id'   => $currentUser['id'],
    'od_cau'         => $odCau ?: null,
    'os_cau'         => $osCau ?: null,
    'khoang_dong_tu' => $khoangDongTu ?: null,
    'file_url'       => $fileUrl,
    'ghi_chu'        => $ghiChu ?: null,
]);

Response::success('Tạo đơn kính thành công', ['id' => $id, 'file_url' => $fileUrl], 201);
