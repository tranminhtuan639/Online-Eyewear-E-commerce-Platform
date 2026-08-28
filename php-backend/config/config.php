<?php
// =====================================================
// CẤU HÌNH CHUNG - đọc từ file .env
// =====================================================

require_once __DIR__ . '/../helpers/EnvLoader.php';

loadEnv(__DIR__ . '/../.env');

define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_PORT', env('DB_PORT', '3308'));
define('DB_NAME', env('DB_NAME', 'matkinh'));
define('DB_USER', env('DB_USER', 'matkinh'));
define('DB_PASS', env('DB_PASS', ''));
define('DB_CHARSET', 'utf8mb4');

// Bật hiển thị lỗi khi đang code.
// Khi deploy/production, đổi APP_DEBUG=false trong .env
define('APP_DEBUG', env('APP_DEBUG', 'true') === 'true');

if (APP_DEBUG) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
}