<?php
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/EnvLoader.php';
require_once __DIR__ . '/../helpers/Jwt.php';

class Auth
{
    // Đăng nhập duy trì 30 ngày, khớp yêu cầu "giữ đăng nhập tới khi xoá dữ liệu
    // trình duyệt hoặc chủ động đăng xuất" thay vì bị hết hạn sau ít phút như session cũ.
    private const TOKEN_LIFETIME_SECONDS = 30 * 24 * 60 * 60;

    // Lưu user đã giải mã từ token cho request hiện tại, thay thế $_SESSION cũ.
    // Vì mỗi request PHP chạy độc lập (không như session lưu qua các request),
    // biến static này chỉ tồn tại trong đúng 1 lần gọi API, không rò rỉ giữa các user.
    private static ?array $currentUser = null;
    private static bool $started = false;

    /**
     * Đọc token từ header "Authorization: Bearer <token>", giải mã và lưu lại
     * user hiện tại cho request này. Gọi hàm này ở đầu mọi file api/*.php
     * y hệt cách cũ (Auth::start()) — không cần sửa các file API khác.
     */
    public static function start(): void
    {
        if (self::$started) {
            return;
        }
        self::$started = true;

        $token = self::getBearerToken();
        if ($token === null) {
            return;
        }

        try {
            $payload = Jwt::decode($token, self::secretKey());
            self::$currentUser = $payload['user'] ?? null;
        } catch (\Throwable $e) {
            // Token hết hạn / sai chữ ký / bị sửa -> coi như chưa đăng nhập,
            // không throw lỗi 500 để tránh vỡ toàn bộ trang.
            self::$currentUser = null;
        }
    }

    /**
     * Tạo JWT chứa thông tin user, gọi ngay sau khi login/register thành công.
     * QUAN TRỌNG: khác với bản session cũ, hàm này giờ TRẢ VỀ chuỗi token,
     * file gọi (login.php, register.php) phải lấy giá trị này và gửi kèm
     * trong response về cho client, vì không còn cookie tự động gửi nữa.
     */
    public static function login(array $user): string
    {
        self::$currentUser = $user;

        $payload = [
            'iat'  => time(),
            'exp'  => time() + self::TOKEN_LIFETIME_SECONDS,
            'user' => $user,
        ];

        return Jwt::encode($payload, self::secretKey());
    }

    /**
     * JWT là stateless (server không lưu token nào cả), nên "đăng xuất" thực chất
     * chỉ cần frontend xoá token khỏi localStorage. Hàm này giữ lại để logout.php
     * không cần sửa gì, nhưng phía server không còn việc gì để làm nữa.
     */
    public static function logout(): void
    {
        self::$currentUser = null;
    }

    public static function user(): ?array
    {
        return self::$currentUser;
    }

    public static function check(): bool
    {
        return self::$currentUser !== null;
    }

    /**
     * Chặn request nếu chưa đăng nhập. Dùng ở đầu các API cần login.
     */
    public static function requireLogin(): array
    {
        if (!self::check()) {
            Response::error('Bạn cần đăng nhập để thực hiện thao tác này', 401);
        }
        return self::user();
    }

    /**
     * Chặn request nếu chưa đăng nhập HOẶC không đúng vai trò yêu cầu.
     */
    public static function requireRole(array $allowedRoles): array
    {
        $user = self::requireLogin();
        if (!in_array($user['vai_tro'], $allowedRoles, true)) {
            Response::error('Bạn không có quyền thực hiện thao tác này', 403);
        }
        return $user;
    }

    /**
     * Dùng khi user chỉ được thao tác trên dữ liệu của chính mình,
     * trừ khi là nhân viên/quản lý thì được thao tác trên dữ liệu người khác.
     */
    public static function requireOwnerOrRole(string $ownerId, array $allowedRoles = ['quanly']): array
    {
        $user = self::requireLogin();
        if ($user['id'] !== $ownerId && !in_array($user['vai_tro'], $allowedRoles, true)) {
            Response::error('Bạn không có quyền truy cập dữ liệu này', 403);
        }
        return $user;
    }

    private static function getBearerToken(): ?string
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;

        // Một số cấu hình server (Apache + PHP-FPM/CGI) không tự điền HTTP_AUTHORIZATION
        // vào $_SERVER, phải lấy thủ công qua các hàm dưới để tránh mất token trên các host này.
        if (!$authHeader && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        }
        if (!$authHeader && function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        }

        if (!$authHeader || stripos($authHeader, 'Bearer ') !== 0) {
            return null;
        }

        return trim(substr($authHeader, 7));
    }

    private static function secretKey(): string
    {
        loadEnv(__DIR__ . '/../.env');
        $secret = env('JWT_SECRET', '');
        if ($secret === '') {
            // Không được để trống JWT_SECRET, nếu không ai cũng giả được token hợp lệ.
            throw new \RuntimeException('JWT_SECRET chưa được cấu hình trong .env');
        }
        return $secret;
    }
}