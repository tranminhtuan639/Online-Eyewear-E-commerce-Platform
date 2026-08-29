<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Upload.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();
$currentUser = Auth::requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ', 405);
}

// Dùng multipart/form-data (không phải JSON) vì có upload file, giống hệt lý do
// bên sanpham/update.php: PHP không tự đọc được $_FILES khi method là PUT,
// nên endpoint riêng này luôn nhận POST dù về mặt ý nghĩa là "cập nhật".
// Input name="anh_dai_dien", chỉ 1 file (khác sanpham dùng mảng hinh_anh[] vì 1 người chỉ có 1 avatar).
if (empty($_FILES['anh_dai_dien'])) {
    Response::error('Vui lòng chọn ảnh để tải lên');
}

$pdo = getDbConnection();

// Lấy đường dẫn avatar cũ (nếu có) để xoá sau khi lưu avatar mới thành công,
// tránh rác file tích tụ trên server qua mỗi lần đổi avatar.
$stmt = $pdo->prepare('SELECT anh_dai_dien FROM nguoidung WHERE id = :id');
$stmt->execute(['id' => $currentUser['id']]);
$anhCu = $stmt->fetchColumn();

try {
    $path = Upload::saveImage($_FILES['anh_dai_dien'], 'nguoidung');

    $updateStmt = $pdo->prepare('UPDATE nguoidung SET anh_dai_dien = :anh WHERE id = :id');
    $updateStmt->execute(['anh' => $path, 'id' => $currentUser['id']]);

    // Chỉ xoá file cũ SAU KHI đã cập nhật DB thành công, tránh trường hợp
    // update DB lỗi mà ảnh cũ đã bị xoá mất, làm mất luôn avatar của người dùng.
    if ($anhCu) {
        Upload::deleteFile($anhCu);
    }

    // Cập nhật lại session cho khớp dữ liệu mới, đồng bộ với cách profile.php đang làm.
    $currentUser['anh_dai_dien'] = $path;
    Auth::login($currentUser);

    Response::success('Cập nhật ảnh đại diện thành công', ['anh_dai_dien' => $path]);
} catch (Exception $e) {
    Response::error('Tải ảnh lên thất bại: ' . $e->getMessage(), 400);
}
