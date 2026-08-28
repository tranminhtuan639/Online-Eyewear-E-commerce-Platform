<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Phương thức không hợp lệ', 405);
}

$pdo = getDbConnection();

// ----- Phân trang -----
$page   = max(1, (int)($_GET['page'] ?? 1));
$limit  = max(1, min(100, (int)($_GET['limit'] ?? 12)));
$offset = ($page - 1) * $limit;

// ----- Lọc & tìm kiếm -----
$conditions = [];
$params = [];

$loai = $_GET['loai'] ?? '';
if (in_array($loai, ['gong', 'trong', 'phukien'], true)) {
    $conditions[] = 'loai = :loai';
    $params['loai'] = $loai;
}

$search = trim($_GET['search'] ?? '');
if ($search !== '') {
    $conditions[] = 'ten LIKE :search';
    $params['search'] = '%' . $search . '%';
}

$where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

$countStmt = $pdo->prepare("SELECT COUNT(*) AS tong FROM sanpham $where");
$countStmt->execute($params);
$tong = (int)$countStmt->fetch()['tong'];

$stmt = $pdo->prepare(
    "SELECT id, ten, loai, gia, so_luong_ton, tao_luc
     FROM sanpham
     $where
     ORDER BY tao_luc DESC
     LIMIT :limit OFFSET :offset"
);
foreach ($params as $key => $value) {
    $stmt->bindValue(':' . $key, $value);
}
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$sanPhams = $stmt->fetchAll();

// Lấy 2 ảnh đầu tiên (thu_tu = 0 và 1) cho từng sản phẩm trong 1 query duy nhất,
// tránh N+1 query khi danh sách dài.
// anh_a = ảnh mặc định hiển thị, anh_b = ảnh hiện ra khi hover (frontend tự xử lý hiệu ứng).
if ($sanPhams) {
    $ids = array_column($sanPhams, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
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
        $sp['anh_a'] = $anhCuaSp[0] ?? null; // ảnh mặc định
        $sp['anh_b'] = $anhCuaSp[1] ?? null; // ảnh khi hover, null nếu sản phẩm chỉ có 1 ảnh
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
