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

// Lưu ý: dùng POST thay vì PUT vì PHP không tự parse được $_FILES
// khi method là PUT với multipart/form-data. Đây là hạn chế của PHP, không phải lỗi thiết kế.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ, dùng POST', 405);
}

Auth::requireRole(['quanly']);

$id = $_GET['id'] ?? $_POST['id'] ?? '';
if ($id === '') {
    Response::error('Thiếu id');
}

$pdo = getDbConnection();

$stmt = $pdo->prepare('SELECT id FROM sanpham WHERE id = :id');
$stmt->execute(['id' => $id]);
if (!$stmt->fetch()) {
    Response::error('Không tìm thấy sản phẩm', 404);
}

$ten        = trim($_POST['ten'] ?? '');
$loai       = $_POST['loai'] ?? '';
$gia        = $_POST['gia'] ?? '';
$soLuongTon = $_POST['so_luong_ton'] ?? null;
$moTa       = Sanitize::cleanHtml($_POST['mo_ta'] ?? null);

if ($ten === '' || $loai === '' || $gia === '' || $soLuongTon === null) {
    Response::error('Vui lòng nhập đầy đủ tên, loại, giá và số lượng tồn');
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

$pdo->beginTransaction();
$newlySaved = [];

try {
    $stmt = $pdo->prepare(
        'UPDATE sanpham SET ten = :ten, loai = :loai, gia = :gia, so_luong_ton = :so_luong_ton, mo_ta = :mo_ta WHERE id = :id'
    );
    $stmt->execute([
        'ten'          => $ten,
        'loai'         => $loai,
        'gia'          => $gia,
        'so_luong_ton' => $soLuongTon,
        'mo_ta'        => $moTa,
        'id'           => $id,
    ]);

    // ----- Xoá ảnh cũ theo danh sách id được gửi lên: xoa_anh_ids[]=xxx&xoa_anh_ids[]=yyy -----
    if (!empty($_POST['xoa_anh_ids']) && is_array($_POST['xoa_anh_ids'])) {
        $placeholders = implode(',', array_fill(0, count($_POST['xoa_anh_ids']), '?'));
        $selectStmt = $pdo->prepare(
            "SELECT id, duong_dan FROM sanpham_hinhanh WHERE sanpham_id = ? AND id IN ($placeholders)"
        );
        $selectStmt->execute(array_merge([$id], $_POST['xoa_anh_ids']));
        $anhCanXoa = $selectStmt->fetchAll();

        $deleteStmt = $pdo->prepare('DELETE FROM sanpham_hinhanh WHERE id = :id');
        foreach ($anhCanXoa as $anh) {
            $deleteStmt->execute(['id' => $anh['id']]);
            Upload::deleteFile($anh['duong_dan']); // xoá file vật lý sau khi đã chắc chắn xoá DB thành công
        }
    }

    // ----- Thêm ảnh mới (nếu có) -----
    if (!empty($_FILES['hinh_anh']) && is_array($_FILES['hinh_anh']['name'])) {
        // Lấy thu_tu lớn nhất hiện tại để ảnh mới nối tiếp phía sau, không đè lên ảnh cũ
        $maxStmt = $pdo->prepare('SELECT COALESCE(MAX(thu_tu), -1) AS max_tt FROM sanpham_hinhanh WHERE sanpham_id = :id');
        $maxStmt->execute(['id' => $id]);
        $thuTu = (int)$maxStmt->fetch()['max_tt'] + 1;

        $imgStmt = $pdo->prepare(
            'INSERT INTO sanpham_hinhanh (id, sanpham_id, duong_dan, thu_tu) VALUES (:id, :sanpham_id, :duong_dan, :thu_tu)'
        );
        $fileCount = count($_FILES['hinh_anh']['name']);
        for ($i = 0; $i < $fileCount; $i++) {
            if ($_FILES['hinh_anh']['error'][$i] === UPLOAD_ERR_NO_FILE) {
                continue;
            }
            $file = [
                'name'     => $_FILES['hinh_anh']['name'][$i],
                'type'     => $_FILES['hinh_anh']['type'][$i],
                'tmp_name' => $_FILES['hinh_anh']['tmp_name'][$i],
                'error'    => $_FILES['hinh_anh']['error'][$i],
                'size'     => $_FILES['hinh_anh']['size'][$i],
            ];
            $path = Upload::saveImage($file, 'sanpham');
            $newlySaved[] = $path;
            $imgStmt->execute([
                'id'         => Uuid::v4(),
                'sanpham_id' => $id,
                'duong_dan'  => $path,
                'thu_tu'     => $thuTu++,
            ]);
        }
    }

    $pdo->commit();
    Response::success('Cập nhật sản phẩm thành công');
} catch (Exception $e) {
    $pdo->rollBack();
    foreach ($newlySaved as $path) {
        Upload::deleteFile($path);
    }
    Response::error('Lỗi khi cập nhật sản phẩm: ' . $e->getMessage(), 400);
}
