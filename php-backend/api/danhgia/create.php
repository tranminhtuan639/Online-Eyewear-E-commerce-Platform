<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Uuid.php';
require_once __DIR__ . '/../../helpers/Sanitize.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ', 405);
}

// Bắt buộc đăng nhập mới được đánh giá sản phẩm.
$currentUser = Auth::requireLogin();

$input = json_decode(file_get_contents('php://input'), true);
$sanPhamId = trim($input['sanpham_id'] ?? '');
$soSao     = $input['so_sao'] ?? null;
$noiDung   = trim($input['noi_dung'] ?? '');

if ($sanPhamId === '') {
    Response::error('Thiếu sanpham_id');
}

if (!is_numeric($soSao) || (int)$soSao < 1 || (int)$soSao > 5) {
    Response::error('Số sao phải từ 1 đến 5');
}
$soSao = (int)$soSao;

if (mb_strlen($noiDung) > 2000) {
    Response::error('Nội dung đánh giá quá dài (tối đa 2000 ký tự)');
}
// Nội dung đánh giá chỉ là text người dùng gõ (không phải HTML từ editor),
// nhưng vẫn lọc thẻ HTML để chặn XSS nếu ai đó cố chèn <script>.
$noiDung = Sanitize::cleanHtml($noiDung);

$pdo = getDbConnection();

// Kiểm tra sản phẩm tồn tại
$stmt = $pdo->prepare('SELECT id FROM sanpham WHERE id = :id');
$stmt->execute(['id' => $sanPhamId]);
if (!$stmt->fetch()) {
    Response::error('Không tìm thấy sản phẩm', 404);
}

// Đã đánh giá sản phẩm này chưa -> có thì UPDATE, chưa thì INSERT (mỗi user 1 đánh giá/sản phẩm)
$checkStmt = $pdo->prepare(
    'SELECT id FROM sanpham_danhgia WHERE sanpham_id = :sanpham_id AND nguoidung_id = :nguoidung_id'
);
$checkStmt->execute([
    'sanpham_id'   => $sanPhamId,
    'nguoidung_id' => $currentUser['id'],
]);
$daDanhGia = $checkStmt->fetch();

if ($daDanhGia) {
    $updateStmt = $pdo->prepare(
        'UPDATE sanpham_danhgia SET so_sao = :so_sao, noi_dung = :noi_dung WHERE id = :id'
    );
    $updateStmt->execute([
        'so_sao'   => $soSao,
        'noi_dung' => $noiDung ?: null,
        'id'       => $daDanhGia['id'],
    ]);
    $id = $daDanhGia['id'];
    $message = 'Đã cập nhật đánh giá của bạn';
} else {
    $id = Uuid::v4();
    $insertStmt = $pdo->prepare(
        'INSERT INTO sanpham_danhgia (id, sanpham_id, nguoidung_id, so_sao, noi_dung)
         VALUES (:id, :sanpham_id, :nguoidung_id, :so_sao, :noi_dung)'
    );
    $insertStmt->execute([
        'id'           => $id,
        'sanpham_id'   => $sanPhamId,
        'nguoidung_id' => $currentUser['id'],
        'so_sao'       => $soSao,
        'noi_dung'     => $noiDung ?: null,
    ]);
    $message = 'Đã gửi đánh giá của bạn';
}

// Trả về điểm trung bình & tổng số mới nhất để frontend cập nhật ngay
$tongKetStmt = $pdo->prepare(
    'SELECT COUNT(*) AS tong, COALESCE(AVG(so_sao), 0) AS trung_binh
     FROM sanpham_danhgia WHERE sanpham_id = :sanpham_id'
);
$tongKetStmt->execute(['sanpham_id' => $sanPhamId]);
$tongKet = $tongKetStmt->fetch();

Response::success($message, [
    'id'               => $id,
    'so_sao'           => $soSao,
    'noi_dung'         => $noiDung,
    'tong_so_danh_gia' => (int)$tongKet['tong'],
    'diem_trung_binh'  => round((float)$tongKet['trung_binh'], 1),
], $daDanhGia ? 200 : 201);
