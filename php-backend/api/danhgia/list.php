<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

// Auth::start() để biết ai đang xem, dùng trả về "danh_gia_cua_toi" nếu họ đã đánh giá.
// KHÔNG bắt buộc đăng nhập - khách vãng lai vẫn xem được đánh giá bình thường.
Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Phương thức không hợp lệ', 405);
}

$sanPhamId = trim($_GET['sanpham_id'] ?? '');
if ($sanPhamId === '') {
    Response::error('Thiếu sanpham_id');
}

$pdo = getDbConnection();

// ----- Danh sách đánh giá, kèm tên người đánh giá -----
$stmt = $pdo->prepare(
    'SELECT dg.id, dg.so_sao, dg.noi_dung, dg.tao_luc, nd.ho_ten
     FROM sanpham_danhgia dg
     INNER JOIN nguoidung nd ON nd.id = dg.nguoidung_id
     WHERE dg.sanpham_id = :sanpham_id
     ORDER BY dg.tao_luc DESC
     LIMIT 100'
);
$stmt->execute(['sanpham_id' => $sanPhamId]);
$items = $stmt->fetchAll();

// ----- Điểm trung bình & tổng số đánh giá -----
$tongKetStmt = $pdo->prepare(
    'SELECT COUNT(*) AS tong, COALESCE(AVG(so_sao), 0) AS trung_binh
     FROM sanpham_danhgia
     WHERE sanpham_id = :sanpham_id'
);
$tongKetStmt->execute(['sanpham_id' => $sanPhamId]);
$tongKet = $tongKetStmt->fetch();

// ----- Đánh giá của chính user hiện tại (nếu có đăng nhập & đã từng đánh giá) -----
$danhGiaCuaToi = null;
$currentUser = Auth::user();
if ($currentUser) {
    $cuaToiStmt = $pdo->prepare(
        'SELECT id, so_sao, noi_dung, tao_luc
         FROM sanpham_danhgia
         WHERE sanpham_id = :sanpham_id AND nguoidung_id = :nguoidung_id'
    );
    $cuaToiStmt->execute([
        'sanpham_id'   => $sanPhamId,
        'nguoidung_id' => $currentUser['id'],
    ]);
    $danhGiaCuaToi = $cuaToiStmt->fetch() ?: null;
}

Response::success('OK', [
    'items'            => $items,
    'tong_so_danh_gia' => (int)$tongKet['tong'],
    'diem_trung_binh'  => round((float)$tongKet['trung_binh'], 1),
    'danh_gia_cua_toi' => $danhGiaCuaToi,
]);
