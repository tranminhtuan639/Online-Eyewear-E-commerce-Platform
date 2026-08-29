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

// Đây là danh sách yêu thích CỦA RIÊNG người dùng đang đăng nhập,
// nên bắt buộc phải đăng nhập (khác với sanpham/list.php là API công khai).
$currentUser = Auth::requireLogin();

$pdo = getDbConnection();

// ----- Phân trang -----
$page   = max(1, (int)($_GET['page'] ?? 1));
$limit  = max(1, min(100, (int)($_GET['limit'] ?? 12)));
$offset = ($page - 1) * $limit;

// ----- Đếm tổng -----
$countStmt = $pdo->prepare(
    'SELECT COUNT(*) AS tong FROM sanpham_yeuthich WHERE nguoidung_id = :nguoidung_id'
);
$countStmt->execute(['nguoidung_id' => $currentUser['id']]);
$tong = (int)$countStmt->fetch()['tong'];

// ----- Lấy danh sách sản phẩm đã yêu thích, mới thích gần đây lên đầu -----
$stmt = $pdo->prepare(
    "SELECT sp.id, sp.ten, sp.loai, sp.gia, sp.gia_cu, sp.so_luong_ton, sp.tao_luc,
            yt.tao_luc AS yeu_thich_luc,
            COALESCE(dem.so_luot, 0) AS luot_yeu_thich
     FROM sanpham_yeuthich yt
     INNER JOIN sanpham sp ON sp.id = yt.sanpham_id
     LEFT JOIN (
         SELECT sanpham_id, COUNT(*) AS so_luot
         FROM sanpham_yeuthich
         GROUP BY sanpham_id
     ) dem ON dem.sanpham_id = sp.id
     WHERE yt.nguoidung_id = :nguoidung_id
     ORDER BY yt.tao_luc DESC
     LIMIT :limit OFFSET :offset"
);
$stmt->bindValue(':nguoidung_id', $currentUser['id']);
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$sanPhams = $stmt->fetchAll();

if ($sanPhams) {
    $ids = array_column($sanPhams, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    // 2 ảnh đầu tiên cho mỗi sản phẩm (giống logic ở sanpham/list.php)
    $imgStmt = $pdo->prepare(
        "SELECT sanpham_id, duong_dan, thu_tu
         FROM (
             SELECT sanpham_id, duong_dan, thu_tu,
                    ROW_NUMBER() OVER (PARTITION BY sanpham_id ORDER BY thu_tu ASC) AS rn
             FROM sanpham_hinhanh
             WHERE sanpham_id IN ($placeholders)
         ) t
         WHERE rn <= 2"
    );
    $imgStmt->execute($ids);
    $anhMap = [];
    foreach ($imgStmt->fetchAll() as $row) {
        $anhMap[$row['sanpham_id']][] = $row['duong_dan'];
    }

    foreach ($sanPhams as &$sp) {
        $anhCuaSp = $anhMap[$sp['id']] ?? [];
        $sp['anh_a'] = $anhCuaSp[0] ?? null;
        $sp['anh_b'] = $anhCuaSp[1] ?? null;

        $sp['luot_yeu_thich'] = (int)$sp['luot_yeu_thich'];

        // Trang này chỉ liệt kê sản phẩm đã thích -> luôn true, khỏi cần join thêm lần nữa.
        $sp['da_yeu_thich'] = true;

        // Badge sale đơn giản (không tính "bán chạy" ở màn này để đỡ query thêm bảng đơn hàng).
        $sp['badge'] = null;
        if ($sp['gia_cu'] !== null && (float)$sp['gia_cu'] > (float)$sp['gia']) {
            $phanTram = (int)round((($sp['gia_cu'] - $sp['gia']) / $sp['gia_cu']) * 100);
            $sp['badge'] = ['loai' => 'sale', 'nhan' => "-{$phanTram}%"];
        }
    }
    unset($sp);
}

Response::success('OK', [
    'items' => $sanPhams,
    'phan_trang' => [
        'trang_hien_tai' => $page,
        'so_dong_moi_trang' => $limit,
        'tong_so_dong' => $tong,
        'tong_so_trang' => (int)ceil($tong / $limit),
    ],
]);