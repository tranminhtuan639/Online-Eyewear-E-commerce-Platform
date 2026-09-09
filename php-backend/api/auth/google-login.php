<?php
require_once __DIR__ . '/../../helpers/Cors.php';
Cors::handle();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Uuid.php';
require_once __DIR__ . '/../../middleware/Auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Phương thức không hợp lệ', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$credential = trim($input['credential'] ?? '');

if ($credential === '') {
    Response::error('Thiếu credential từ Google');
}

// ----- 1. Verify ID token với Google (không tự parse JWT bằng tay) -----
// Gọi endpoint tokeninfo của Google: Google tự kiểm tra chữ ký + hạn token,
// mình chỉ cần đối chiếu lại "aud" (client id) để chắc chắn token này
// được cấp cho đúng app của mình, tránh bị replay token của app khác.
$verifyUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential);
$context = stream_context_create(['http' => ['timeout' => 5, 'ignore_errors' => true]]);
$response = @file_get_contents($verifyUrl, false, $context);

if ($response === false) {
    Response::error('Không xác thực được với Google, thử lại sau', 502);
}

$payload = json_decode($response, true);

if (!is_array($payload) || isset($payload['error'])) {
    Response::error('Token Google không hợp lệ hoặc đã hết hạn', 401);
}

$googleClientId = env('GOOGLE_CLIENT_ID', '');
if ($googleClientId === '' || ($payload['aud'] ?? '') !== $googleClientId) {
    Response::error('Token không thuộc về ứng dụng này', 401);
}

// Chắc chắn payload này thật sự đến từ Google (đề phòng response giả mạo
// đúng định dạng tokeninfo nhưng không phải từ Google trả về).
$issuer = $payload['iss'] ?? '';
if ($issuer !== 'https://accounts.google.com' && $issuer !== 'accounts.google.com') {
    Response::error('Token Google không hợp lệ', 401);
}

if (($payload['email_verified'] ?? 'false') !== 'true') {
    Response::error('Email Google chưa được xác minh', 401);
}

$email  = strtolower(trim($payload['email'] ?? ''));
$hoTen  = trim($payload['name'] ?? $email);
$avatar = $payload['picture'] ?? null;

if ($email === '') {
    Response::error('Không lấy được email từ tài khoản Google', 401);
}

// ----- 2. Giới hạn domain email (chỉ cho phép email trường) -----
// Đổi ALLOWED_GOOGLE_DOMAIN trong .env, để trống nếu không muốn giới hạn.
$allowedDomain = trim(env('ALLOWED_GOOGLE_DOMAIN', ''));
if ($allowedDomain !== '' && !str_ends_with($email, '@' . $allowedDomain)) {
    Response::error('Chỉ tài khoản Google thuộc trường mới được đăng nhập', 403);
}

$pdo = getDbConnection();

// ----- 3. Tìm user theo email, tự tạo mới nếu chưa có -----
$stmt = $pdo->prepare(
    'SELECT id, email, ho_ten, vai_tro, anh_dai_dien FROM nguoidung WHERE email = :email'
);
$stmt->execute(['email' => $email]);
$row = $stmt->fetch();

if ($row) {
    $user = [
        'id'           => $row['id'],
        'email'        => $row['email'],
        'ho_ten'       => $row['ho_ten'],
        'vai_tro'      => $row['vai_tro'],
        'anh_dai_dien' => $row['anh_dai_dien'],
    ];
} else {
    // Tự tạo tài khoản mới với vai_tro = khachhang.
    // mat_khau_hash được gán 1 chuỗi ngẫu nhiên không ai biết,
    // vì tài khoản này chỉ đăng nhập được qua Google, không có mật khẩu.
    $id = Uuid::v4();
    $randomPassword = password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO nguoidung (id, email, mat_khau_hash, ho_ten, vai_tro, anh_dai_dien)
             VALUES (:id, :email, :hash, :ho_ten, :vai_tro, :anh_dai_dien)'
        );
        $stmt->execute([
            'id'           => $id,
            'email'        => $email,
            'hash'         => $randomPassword,
            'ho_ten'       => $hoTen,
            'vai_tro'      => 'khachhang',
            'anh_dai_dien' => $avatar,
        ]);

        $user = [
            'id'           => $id,
            'email'        => $email,
            'ho_ten'       => $hoTen,
            'vai_tro'      => 'khachhang',
            'anh_dai_dien' => $avatar,
        ];
    } catch (PDOException $e) {
        // Mã lỗi 23000 = vi phạm unique constraint. Trường hợp này xảy ra khi
        // 2 request Google login cùng email chạy gần như đồng thời (double
        // click, mở 2 tab...): request kia đã insert xong trước, request này
        // chỉ cần SELECT lại là có user, không phải báo lỗi cho người dùng.
        if ($e->getCode() !== '23000') {
            throw $e;
        }

        $stmt = $pdo->prepare(
            'SELECT id, email, ho_ten, vai_tro, anh_dai_dien FROM nguoidung WHERE email = :email'
        );
        $stmt->execute(['email' => $email]);
        $row = $stmt->fetch();

        if (!$row) {
            throw $e;
        }

        $user = [
            'id'           => $row['id'],
            'email'        => $row['email'],
            'ho_ten'       => $row['ho_ten'],
            'vai_tro'      => $row['vai_tro'],
            'anh_dai_dien' => $row['anh_dai_dien'],
        ];
    }
}

$token = Auth::login($user);

Response::success('Đăng nhập bằng Google thành công', array_merge($user, ['token' => $token]));