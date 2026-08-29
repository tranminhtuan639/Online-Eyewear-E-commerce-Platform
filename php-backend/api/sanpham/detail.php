<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Phương thức không hợp lệ', 405);
}

$id = $_GET['id'] ?? '';
if ($id === '') {
    Response::error('Thiếu id');
}

$pdo = getDbConnection();

$stmt = $pdo->prepare('SELECT * FROM sanpham WHERE id = :id');
$stmt->execute(['id' => $id]);
$sanPham = $stmt->fetch();

if (!$sanPham) {
    Response::error('Không tìm thấy sản phẩm', 404);
}

$imgStmt = $pdo->prepare(
    'SELECT id, duong_dan, thu_tu FROM sanpham_hinhanh WHERE sanpham_id = :id ORDER BY thu_tu ASC'
);
$imgStmt->execute(['id' => $id]);
$sanPham['hinh_anh'] = $imgStmt->fetchAll();

// ----- Số lượt yêu thích -----
$countStmt = $pdo->prepare('SELECT COUNT(*) AS so_luot FROM sanpham_yeuthich WHERE sanpham_id = :id');
$countStmt->execute(['id' => $id]);
$sanPham['luot_yeu_thich'] = (int)$countStmt->fetch()['so_luot'];

// ----- Điểm đánh giá trung bình & tổng số đánh giá -----
$danhGiaStmt = $pdo->prepare(
    'SELECT COUNT(*) AS tong, COALESCE(AVG(so_sao), 0) AS trung_binh
     FROM sanpham_danhgia WHERE sanpham_id = :id'
);
$danhGiaStmt->execute(['id' => $id]);
$danhGiaTongKet = $danhGiaStmt->fetch();
$sanPham['tong_so_danh_gia'] = (int)$danhGiaTongKet['tong'];
$sanPham['diem_trung_binh']  = round((float)$danhGiaTongKet['trung_binh'], 1);

// ----- User hiện tại đã yêu thích sản phẩm này chưa -----
$currentUser = Auth::user();
$sanPham['da_yeu_thich'] = false;
if ($currentUser) {
    $checkStmt = $pdo->prepare(
        'SELECT 1 FROM sanpham_yeuthich WHERE sanpham_id = :sanpham_id AND nguoidung_id = :nguoidung_id'
    );
    $checkStmt->execute([
        'sanpham_id'   => $id,
        'nguoidung_id' => $currentUser['id'],
    ]);
    $sanPham['da_yeu_thich'] = (bool)$checkStmt->fetch();
}

// ----- Badge (đồng bộ logic với api/sanpham/list.php) -----
// Sale% > Mới > Bán chạy, mỗi sản phẩm chỉ 1 badge.
$sanPham['badge'] = tinhBadgeSanPham($pdo, $sanPham);

Response::success('OK', $sanPham);

/**
 * @return array{loai:string,nhan:string}|null
 */
function tinhBadgeSanPham(PDO $pdo, array $sp): ?array
{
    if ($sp['gia_cu'] !== null && (float)$sp['gia_cu'] > (float)$sp['gia']) {
        $phanTram = (int)round((($sp['gia_cu'] - $sp['gia']) / $sp['gia_cu']) * 100);
        return [
            'loai' => 'sale',
            'nhan' => "-{$phanTram}%",
        ];
    }

    $taoLucTs = strtotime($sp['tao_luc']);
    if ($taoLucTs !== false && $taoLucTs >= strtotime('-14 days')) {
        return [
            'loai' => 'moi',
            'nhan' => 'Mới',
        ];
    }

    // Kiểm tra sản phẩm này có nằm trong top 10 bán chạy toàn hệ thống không.
    $topAllStmt = $pdo->query(
        "SELECT dc.sanpham_id
         FROM donhang_chitiet dc
         INNER JOIN donhang dh ON dh.id = dc.donhang_id
         WHERE dh.trang_thai NOT IN ('da_huy', 'tu_choi_hoan_tra')
         GROUP BY dc.sanpham_id
         ORDER BY SUM(dc.so_luong) DESC
         LIMIT 10"
    );
    $topIds = array_column($topAllStmt->fetchAll(), 'sanpham_id');
    if (in_array($sp['id'], $topIds, true)) {
        return [
            'loai' => 'ban_chay',
            'nhan' => 'Bán chạy',
        ];
    }

    return null;
}
