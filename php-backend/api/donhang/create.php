<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Uuid.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();
$currentUser = Auth::requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$hoTenNguoiNhan = trim($input['ho_ten_nguoi_nhan'] ?? '');
$soDienThoai    = trim($input['so_dien_thoai'] ?? '');
$diaChi         = trim($input['dia_chi'] ?? '');
$chiTiet        = $input['chi_tiet'] ?? [];

if ($hoTenNguoiNhan === '' || $soDienThoai === '' || $diaChi === '') {
    Response::error('Vui lòng nhập đầy đủ họ tên người nhận, số điện thoại và địa chỉ giao hàng');
}
if (!is_array($chiTiet) || count($chiTiet) === 0) {
    Response::error('Giỏ hàng đang trống');
}

$pdo = getDbConnection();
$pdo->beginTransaction();

try {
    $tongTien = 0;
    $chiTietDaXuLy = [];

    foreach ($chiTiet as $item) {
        $sanPhamId = $item['sanpham_id'] ?? '';
        $soLuong   = (int)($item['so_luong'] ?? 0);
        $donKinhId = $item['don_kinh_id'] ?? null;

        if ($sanPhamId === '' || $soLuong <= 0) {
            throw new Exception('Dữ liệu sản phẩm trong giỏ hàng không hợp lệ');
        }

        // SELECT ... FOR UPDATE để khoá dòng, tránh 2 người đặt hàng cùng lúc
        // làm âm tồn kho (race condition) khi cùng mua sản phẩm sắp hết hàng.
        $stmt = $pdo->prepare('SELECT id, ten, gia, so_luong_ton FROM sanpham WHERE id = :id FOR UPDATE');
        $stmt->execute(['id' => $sanPhamId]);
        $sanPham = $stmt->fetch();

        if (!$sanPham) {
            throw new Exception("Sản phẩm không tồn tại: $sanPhamId");
        }
        if ($sanPham['so_luong_ton'] < $soLuong) {
            throw new Exception("Sản phẩm \"{$sanPham['ten']}\" chỉ còn {$sanPham['so_luong_ton']} trong kho");
        }

        // Nếu có chọn đơn kính, kiểm tra đơn kính đó có đúng là của người đang đặt hàng không
        if ($donKinhId) {
            $dkStmt = $pdo->prepare('SELECT id FROM don_kinh WHERE id = :id AND nguoidung_id = :uid');
            $dkStmt->execute(['id' => $donKinhId, 'uid' => $currentUser['id']]);
            if (!$dkStmt->fetch()) {
                throw new Exception('Đơn kính không hợp lệ');
            }
        }

        $giaBan = $sanPham['gia'];
        $tongTien += $giaBan * $soLuong;

        // Trừ tồn kho ngay khi đặt hàng
        $updateStmt = $pdo->prepare(
            'UPDATE sanpham SET so_luong_ton = so_luong_ton - :sl WHERE id = :id'
        );
        $updateStmt->execute(['sl' => $soLuong, 'id' => $sanPhamId]);

        $chiTietDaXuLy[] = [
            'sanpham_id'  => $sanPhamId,
            'don_kinh_id' => $donKinhId,
            'so_luong'    => $soLuong,
            'gia_ban'     => $giaBan,
        ];
    }

    $donHangId = Uuid::v4();
    $stmt = $pdo->prepare(
        'INSERT INTO donhang (id, nguoidung_id, trang_thai, tong_tien, ho_ten_nguoi_nhan, so_dien_thoai, dia_chi)
         VALUES (:id, :nguoidung_id, :trang_thai, :tong_tien, :ho_ten, :sdt, :dia_chi)'
    );
    $stmt->execute([
        'id'           => $donHangId,
        'nguoidung_id' => $currentUser['id'],
        // Web chỉ hỗ trợ thanh toán khi nhận hàng (COD) nên không có bước "chờ thanh toán" thật sự.
        // Đơn mới tạo vào thẳng "cho_xac_nhan" (shop tra cứu thông tin người đặt rồi mới chuyển sang xử lý).
        'trang_thai'   => 'cho_xac_nhan',
        'tong_tien'    => $tongTien,
        'ho_ten'       => $hoTenNguoiNhan,
        'sdt'          => $soDienThoai,
        'dia_chi'      => $diaChi,
    ]);

    $ctStmt = $pdo->prepare(
        'INSERT INTO donhang_chitiet (id, donhang_id, sanpham_id, don_kinh_id, so_luong, gia_ban)
         VALUES (:id, :donhang_id, :sanpham_id, :don_kinh_id, :so_luong, :gia_ban)'
    );
    foreach ($chiTietDaXuLy as $ct) {
        $ctStmt->execute([
            'id'          => Uuid::v4(),
            'donhang_id'  => $donHangId,
            'sanpham_id'  => $ct['sanpham_id'],
            'don_kinh_id' => $ct['don_kinh_id'],
            'so_luong'    => $ct['so_luong'],
            'gia_ban'     => $ct['gia_ban'],
        ]);
    }

    $pdo->commit();

    Response::success('Đặt hàng thành công', [
        'id' => $donHangId,
        'tong_tien' => $tongTien,
        'trang_thai' => 'cho_xac_nhan',
    ], 201);
} catch (Exception $e) {
    $pdo->rollBack();
    Response::error('Đặt hàng thất bại: ' . $e->getMessage(), 400);
}
