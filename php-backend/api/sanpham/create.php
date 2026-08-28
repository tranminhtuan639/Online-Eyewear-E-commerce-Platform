<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Uuid.php';
require_once __DIR__ . '/../../helpers/Upload.php';
require_once __DIR__ . '/../../helpers/Sanitize.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ', 405);
}

Auth::requireRole(['quanly']);

// Vì có upload file nên dùng multipart/form-data (không phải JSON),
// dữ liệu chữ nằm ở $_POST, ảnh nằm ở $_FILES.
$ten         = trim($_POST['ten'] ?? '');
$loai        = $_POST['loai'] ?? '';
$gia         = $_POST['gia'] ?? '';
$soLuongTon  = $_POST['so_luong_ton'] ?? 0;
$moTa        = Sanitize::cleanHtml($_POST['mo_ta'] ?? null);

if ($ten === '' || $loai === '' || $gia === '') {
    Response::error('Vui lòng nhập đầy đủ tên, loại và giá sản phẩm');
}
if (!in_array($loai, ['gong', 'trong', 'phukien'], true)) {
    Response::error('Loại sản phẩm không hợp lệ');
}
if (!is_numeric($gia) || (float)$gia < 0) {
    Response::error('Giá sản phẩm không hợp lệ');
}
if (!is_numeric($soLuongTon) || (int)$soLuongTon < 0) {
    Response::error('Số lượng tồn không hợp lệ');
}

$pdo = getDbConnection();
$pdo->beginTransaction();

try {
    $id = Uuid::v4();
    $stmt = $pdo->prepare(
        'INSERT INTO sanpham (id, ten, loai, gia, so_luong_ton, mo_ta) VALUES (:id, :ten, :loai, :gia, :so_luong_ton, :mo_ta)'
    );
    $stmt->execute([
        'id'           => $id,
        'ten'          => $ten,
        'loai'         => $loai,
        'gia'          => $gia,
        'so_luong_ton' => $soLuongTon,
        'mo_ta'        => $moTa,
    ]);

    // Upload nhiều ảnh: input name="hinh_anh[]" multiple
    $savedPaths = [];
    if (!empty($_FILES['hinh_anh']) && is_array($_FILES['hinh_anh']['name'])) {
        $fileCount = count($_FILES['hinh_anh']['name']);
        $imgStmt = $pdo->prepare(
            'INSERT INTO sanpham_hinhanh (id, sanpham_id, duong_dan, thu_tu) VALUES (:id, :sanpham_id, :duong_dan, :thu_tu)'
        );
        for ($i = 0; $i < $fileCount; $i++) {
            if ($_FILES['hinh_anh']['error'][$i] === UPLOAD_ERR_NO_FILE) {
                continue; // input để trống, bỏ qua thay vì báo lỗi
            }
            $file = [
                'name'     => $_FILES['hinh_anh']['name'][$i],
                'type'     => $_FILES['hinh_anh']['type'][$i],
                'tmp_name' => $_FILES['hinh_anh']['tmp_name'][$i],
                'error'    => $_FILES['hinh_anh']['error'][$i],
                'size'     => $_FILES['hinh_anh']['size'][$i],
            ];
            $path = Upload::saveImage($file, 'sanpham');
            $savedPaths[] = $path;
            $imgStmt->execute([
                'id'         => Uuid::v4(),
                'sanpham_id' => $id,
                'duong_dan'  => $path,
                'thu_tu'     => $i,
            ]);
        }
    }

    $pdo->commit();

    Response::success('Tạo sản phẩm thành công', [
        'id' => $id,
        'ten' => $ten,
        'loai' => $loai,
        'gia' => $gia,
        'so_luong_ton' => $soLuongTon,
        'hinh_anh' => $savedPaths,
    ], 201);
} catch (Exception $e) {
    $pdo->rollBack();
    // Nếu lỗi xảy ra sau khi đã lưu vài ảnh lên đĩa, dọn lại cho sạch
    foreach ($savedPaths ?? [] as $path) {
        Upload::deleteFile($path);
    }
    Response::error('Lỗi khi tạo sản phẩm: ' . $e->getMessage(), 400);
}
