<?php

class Cors
{
    // Danh sách domain/port của frontend được phép gọi API.
    // Thêm domain thật khi deploy lên hosting, vd: 'https://kinhmat-cuaha.com'
    private const ALLOWED_ORIGINS = [
        'http://localhost:3000',   // React/Vue dev server phổ biến
        'http://localhost:5173',   // Vite dev server
        'http://127.0.0.1:5500',   // VSCode Live Server (frontend HTML/CSS/JS thuần)
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
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Vì dùng session (cookie) để xác thực, KHÔNG được để Access-Control-Allow-Origin: *
        // (trình duyệt chặn cookie cross-origin nếu dùng dấu *), phải trả đúng origin gọi tới
        // và bật Allow-Credentials để cookie session được gửi kèm.
        if (in_array($origin, self::ALLOWED_ORIGINS, true)) {
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Credentials: true');
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
}
