<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../middleware/Auth.php';

// Auth::start() để biết user hiện tại (nếu có) và trả về da_yeu_thich đúng cho họ.
// KHÔNG bắt buộc đăng nhập - khách vãng lai vẫn xem được danh sách sản phẩm bình thường.
Auth::start();

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
    $conditions[] = 'sp.loai = :loai';
    $params['loai'] = $loai;
}

$search = trim($_GET['search'] ?? '');
if ($search !== '') {
    $conditions[] = 'sp.ten LIKE :search';
    $params['search'] = '%' . $search . '%';
}

$where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

// ----- Sắp xếp -----
// yeu_thich: dùng cho mục "SẢN PHẨM ĐƯỢC YÊU THÍCH NHẤT" ở trang chủ.
// moi_nhat (mặc định), gia_tang, gia_giam: dùng cho mục "SẢN PHẨM" có phân trang.
$sapXep = $_GET['sap_xep'] ?? 'moi_nhat';
switch ($sapXep) {
    case 'gia_tang':
        $orderBy = 'sp.gia ASC';
        break;
    case 'gia_giam':
        $orderBy = 'sp.gia DESC';
        break;
    case 'yeu_thich':
        $orderBy = 'luot_yeu_thich DESC, sp.tao_luc DESC';
        break;
    case 'moi_nhat':
    default:
        $orderBy = 'sp.tao_luc DESC';
        break;
}

// ----- Đếm tổng -----
$countStmt = $pdo->prepare("SELECT COUNT(*) AS tong FROM sanpham sp $where");
$countStmt->execute($params);
$tong = (int)$countStmt->fetch()['tong'];

// ----- Lấy danh sách, kèm số lượt yêu thích (đếm qua bảng sanpham_yeuthich) -----
$stmt = $pdo->prepare(
    "SELECT sp.id, sp.ten, sp.loai, sp.gia, sp.gia_cu, sp.so_luong_ton, sp.tao_luc,
            COALESCE(yt.so_luot, 0) AS luot_yeu_thich
     FROM sanpham sp
     LEFT JOIN (
         SELECT sanpham_id, COUNT(*) AS so_luot
         FROM sanpham_yeuthich
         GROUP BY sanpham_id
     ) yt ON yt.sanpham_id = sp.id
     $where
     ORDER BY $orderBy
     LIMIT :limit OFFSET :offset"
);
foreach ($params as $key => $value) {
    $stmt->bindValue(':' . $key, $value);
}
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$sanPhams = $stmt->fetchAll();

if ($sanPhams) {
    $ids = array_column($sanPhams, 'id');

    // ----- 2 ảnh đầu tiên cho mỗi sản phẩm (giữ nguyên logic cũ) -----
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

    // ----- Sản phẩm mà user hiện tại (nếu có đăng nhập) đã yêu thích -----
    $daYeuThichIds = [];
    $currentUser = Auth::user();
    if ($currentUser) {
        $ytStmt = $pdo->prepare(
            "SELECT sanpham_id FROM sanpham_yeuthich
             WHERE nguoidung_id = ? AND sanpham_id IN ($placeholders)"
        );
        $ytStmt->execute(array_merge([$currentUser['id']], $ids));
        $daYeuThichIds = array_column($ytStmt->fetchAll(), 'sanpham_id');
    }

    // ----- Top sản phẩm bán chạy toàn hệ thống (dùng để gắn badge "Bán chạy") -----
    // Chỉ tính đơn hàng không bị huỷ / không bị từ chối hoàn trả.
    $topBanChayStmt = $pdo->query(
        "SELECT dc.sanpham_id
         FROM donhang_chitiet dc
         INNER JOIN donhang dh ON dh.id = dc.donhang_id
         WHERE dh.trang_thai NOT IN ('da_huy', 'tu_choi_hoan_tra')
         GROUP BY dc.sanpham_id
         ORDER BY SUM(dc.so_luong) DESC
         LIMIT 10"
    );
    $topBanChayIds = array_column($topBanChayStmt->fetchAll(), 'sanpham_id');

    foreach ($sanPhams as &$sp) {
        $anhCuaSp = $anhMap[$sp['id']] ?? [];
        $sp['anh_a'] = $anhCuaSp[0] ?? null;
        $sp['anh_b'] = $anhCuaSp[1] ?? null;

        $sp['luot_yeu_thich'] = (int)$sp['luot_yeu_thich'];
        $sp['da_yeu_thich']   = in_array($sp['id'], $daYeuThichIds, true);
        $sp['badge']          = tinhBadgeSanPham($sp, $topBanChayIds);
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

/**
 * Tính badge hiển thị cho 1 sản phẩm. Mỗi sản phẩm chỉ hiện TỐI ĐA 1 badge,
 * theo thứ tự ưu tiên: Sale% > Mới > Bán chạy.
 *
 * - Sale%: có gia_cu và gia_cu > gia (đang giảm giá thật sự)
 * - Mới: được tạo trong vòng 14 ngày gần đây
 * - Bán chạy: nằm trong top 10 sản phẩm bán ra nhiều nhất (đơn không bị huỷ/từ chối hoàn trả)
 *
 * @return array{loai:string,nhan:string}|null
 */
function tinhBadgeSanPham(array $sp, array $topBanChayIds): ?array
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

    if (in_array($sp['id'], $topBanChayIds, true)) {
        return [
            'loai' => 'ban_chay',
            'nhan' => 'Bán chạy',
        ];
    }

    return null;
}
