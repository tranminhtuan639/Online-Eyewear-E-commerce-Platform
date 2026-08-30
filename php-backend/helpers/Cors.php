<?php

require_once __DIR__ . '/EnvLoader.php';

class Cors
{
    // Domain local luôn được phép. Production thêm qua CORS_ALLOWED_ORIGINS trên Railway.
    private const LOCAL_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5500',
        'http://localhost',
        'http://localhost:8080',
    ];

    /**
     * Gọi hàm này ở DÒNG ĐẦU TIÊN của mọi file api/*.php,
     * trước cả khi require database hay bất cứ thứ gì khác,
     * vì header() phải được gửi trước khi có bất kỳ output nào.
     */
    public static function handle(): void
    {
        loadEnv(__DIR__ . '/../.env');

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Vì dùng session (cookie) để xác thực, KHÔNG được để Access-Control-Allow-Origin: *
        // (trình duyệt chặn cookie cross-origin nếu dùng dấu *), phải trả đúng origin gọi tới
        // và bật Allow-Credentials để cookie session được gửi kèm.
        if ($origin !== '' && in_array($origin, self::allowedOrigins(), true)) {
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Credentials: true');
            header('Vary: Origin');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        // Trình duyệt gửi request OPTIONS "dò đường" (preflight) trước mỗi request
        // GET/POST/PUT/DELETE thật sự khi có custom header hoặc method khác GET/POST đơn giản.
        // Chỉ cần trả 200 rỗng ở đây, không cần chạy tiếp logic API.
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    private static function allowedOrigins(): array
    {
        $fromEnv = env('CORS_ALLOWED_ORIGINS', '');
        $extra = [];

        if (is_string($fromEnv) && trim($fromEnv) !== '') {
            $extra = array_filter(array_map('trim', explode(',', $fromEnv)));
        }

        return array_values(array_unique(array_merge(self::LOCAL_ORIGINS, $extra)));
    }
}
