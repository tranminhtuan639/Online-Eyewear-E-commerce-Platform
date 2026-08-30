<?php

/**
 * Đọc file .env đơn giản và nạp vào biến môi trường ($_ENV / getenv()).
 * Không dùng thư viện ngoài (vlucas/phpdotenv) để tránh phụ thuộc Composer,
 * phù hợp cho đồ án chỉ cần chạy trên PHP thuần (XAMPP/Laragon...).
 *
 * Hỗ trợ:
 *  - Dòng dạng KEY=VALUE
 *  - Bỏ qua dòng trống và dòng bắt đầu bằng # (comment)
 *  - Bỏ dấu ngoặc kép quanh giá trị nếu có, vd: DB_PASS="abc123" -> abc123
 */
function loadEnv(string $path): void
{
    if (!is_file($path)) {
        // Không có .env cũng không sao, coi như dùng giá trị mặc định ở nơi gọi
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        if (!str_contains($line, '=')) {
            continue; // dòng không đúng định dạng, bỏ qua thay vì crash
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        // Bỏ dấu ngoặc kép/đơn bao quanh giá trị nếu có
        if (strlen($value) >= 2) {
            $first = $value[0];
            $last = $value[strlen($value) - 1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, -1);
            }
        }

        if ($key === '') {
            continue;
        }

        // Không ghi đè biến đã có (Railway/Docker inject sẵn DB_HOST, APP_DEBUG...).
        if (array_key_exists($key, $_ENV) || getenv($key) !== false) {
            continue;
        }

        putenv("$key=$value");
        $_ENV[$key] = $value;
    }
}

/**
 * Lấy giá trị biến môi trường, có giá trị mặc định nếu không tồn tại.
 */
function env(string $key, $default = null)
{
    if (array_key_exists($key, $_ENV)) {
        return $_ENV[$key];
    }

    $fromGetenv = getenv($key);
    if ($fromGetenv !== false) {
        return $fromGetenv;
    }

    if (array_key_exists($key, $_SERVER) && is_string($_SERVER[$key])) {
        return $_SERVER[$key];
    }

    return $default;
}
