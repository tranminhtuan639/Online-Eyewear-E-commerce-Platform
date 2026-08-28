<?php
require_once __DIR__ . '/../helpers/Response.php';

class Auth
{
    /**
     * Gọi hàm này ở đầu MỌI file api/*.php trước khi dùng session.
     */
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            // Cookie session an toàn hơn: httponly chống JS đọc cookie (XSS),
            // samesite=Lax chống CSRF cơ bản.
            session_set_cookie_params([
                'lifetime' => 0,
                'path'     => '/',
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            session_start();
        }
    }

    /**
     * Lưu thông tin user vào session sau khi đăng nhập thành công.
     */
    public static function login(array $user): void
    {
        $_SESSION['user'] = [
            'id'      => $user['id'],
            'email'   => $user['email'],
            'ho_ten'  => $user['ho_ten'],
            'vai_tro' => $user['vai_tro'],
        ];
    }

    public static function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie('PHPSESSID', '', time() - 42000, $params['path']);
        }
        session_destroy();
    }

    public static function user(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    public static function check(): bool
    {
        return isset($_SESSION['user']);
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
     * Ví dụ: Auth::requireRole(['quanly']) cho các API chỉ admin được dùng.
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
     * Đây là phần thay thế cho Row Level Security của Supabase đã bỏ.
     */
    public static function requireOwnerOrRole(string $ownerId, array $allowedRoles = ['quanly']): array
    {
        $user = self::requireLogin();
        if ($user['id'] !== $ownerId && !in_array($user['vai_tro'], $allowedRoles, true)) {
            Response::error('Bạn không có quyền truy cập dữ liệu này', 403);
        }
        return $user;
    }
}
