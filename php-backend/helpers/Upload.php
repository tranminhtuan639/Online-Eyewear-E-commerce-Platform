<?php

class Upload
{
    private const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];
    private const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB mỗi ảnh

    private const CLOUDINARY_UPLOAD_URL  = 'https://api.cloudinary.com/v1_1/%s/image/upload';
    private const CLOUDINARY_DESTROY_URL = 'https://api.cloudinary.com/v1_1/%s/image/destroy';

    /**
     * Upload 1 file ảnh lên Cloudinary, vào thư mục con "rtv/{subfolder}".
     * Trả về URL ảnh (secure_url) để lưu vào DB / trả về frontend.
     *
     * @throws Exception nếu file không hợp lệ hoặc upload thất bại
     */
    public static function saveImage(array $file, string $subfolder): string
    {
        self::validateFile($file);

        [$cloudName, $apiKey, $apiSecret] = self::getCredentials();

        $timestamp = time();
        $folder    = 'rtv/' . $subfolder;

        // Chỉ ký các tham số thật sự gửi lên (không gồm file, api_key, cloud_name)
        $signature = self::generateSignature([
            'folder'    => $folder,
            'timestamp' => $timestamp,
        ], $apiSecret);

        $ch = curl_init(sprintf(self::CLOUDINARY_UPLOAD_URL, $cloudName));
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 20,
            CURLOPT_POSTFIELDS     => [
                'file'      => new CURLFile($file['tmp_name'], $file['type'] ?: 'application/octet-stream', $file['name']),
                'api_key'   => $apiKey,
                'timestamp' => $timestamp,
                'folder'    => $folder,
                'signature' => $signature,
            ],
        ]);

        $response  = curl_exec($ch);
        $curlError = curl_error($ch);
        $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false) {
            throw new Exception('Không kết nối được tới Cloudinary: ' . $curlError);
        }

        $result = json_decode($response, true);

        if ($httpCode !== 200 || !isset($result['secure_url'])) {
            $message = $result['error']['message'] ?? 'Upload ảnh lên Cloudinary thất bại';
            throw new Exception($message);
        }

        // Lưu thẳng URL đầy đủ vào DB, không cần ghép domain nữa
        return $result['secure_url'];
    }

    /**
     * Xoá ảnh. Hỗ trợ cả 2 dạng để không phá ảnh cũ trong DB:
     * - URL Cloudinary đầy đủ (ảnh upload SAU khi đổi sang Cloudinary)
     * - Đường dẫn tương đối kiểu cũ "uploads/sanpham/abc.jpg" (ảnh có từ TRƯỚC
     *   khi đổi, vẫn còn nằm trên đĩa local — giữ lại logic xoá cũ cho chúng)
     */
    public static function deleteFile(string $imagePathOrUrl): void
    {
        if (self::isAbsoluteUrl($imagePathOrUrl)) {
            self::deleteFromCloudinary($imagePathOrUrl);
            return;
        }

        $fullPath = __DIR__ . '/../' . $imagePathOrUrl;
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }

    private static function validateFile(array $file): void
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Lỗi khi upload file (mã lỗi: ' . $file['error'] . ')');
        }

        if ($file['size'] > self::MAX_SIZE_BYTES) {
            throw new Exception('Ảnh "' . $file['name'] . '" vượt quá 5MB');
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, self::ALLOWED_EXT, true)) {
            throw new Exception('Định dạng ảnh không hợp lệ, chỉ nhận: ' . implode(', ', self::ALLOWED_EXT));
        }

        // Kiểm tra thật sự là ảnh (không chỉ dựa vào đuôi file, tránh upload file giả mạo)
        $imageInfo = @getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            throw new Exception('File "' . $file['name'] . '" không phải là ảnh hợp lệ');
        }
    }

    /**
     * @return array{0:string,1:string,2:string} [cloudName, apiKey, apiSecret]
     * @throws Exception nếu thiếu cấu hình
     */
    private static function getCredentials(): array
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME', '');
        $apiKey    = env('CLOUDINARY_API_KEY', '');
        $apiSecret = env('CLOUDINARY_API_SECRET', '');

        if ($cloudName === '' || $apiKey === '' || $apiSecret === '') {
            throw new Exception('Chưa cấu hình Cloudinary (thiếu CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET trong .env)');
        }

        return [$cloudName, $apiKey, $apiSecret];
    }

    private static function isAbsoluteUrl(string $value): bool
    {
        return str_starts_with($value, 'http://') || str_starts_with($value, 'https://');
    }

    private static function deleteFromCloudinary(string $url): void
    {
        $publicId = self::extractPublicId($url);
        if ($publicId === null) {
            return; // không parse được public_id thì bỏ qua, không chặn luồng chính
        }

        try {
            [$cloudName, $apiKey, $apiSecret] = self::getCredentials();
        } catch (Exception $e) {
            return; // thiếu config thì thôi, xoá ảnh không phải luồng bắt buộc phải thành công
        }

        $timestamp = time();
        $signature = self::generateSignature([
            'public_id' => $publicId,
            'timestamp' => $timestamp,
        ], $apiSecret);

        $ch = curl_init(sprintf(self::CLOUDINARY_DESTROY_URL, $cloudName));
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_POSTFIELDS     => [
                'public_id' => $publicId,
                'api_key'   => $apiKey,
                'timestamp' => $timestamp,
                'signature' => $signature,
            ],
        ]);

        curl_exec($ch); // best-effort, lỗi xoá không nên làm fail request chính
        curl_close($ch);
    }

    /**
     * Từ URL dạng:
     *   https://res.cloudinary.com/{cloud}/image/upload/v169.../rtv/sanpham/abc123.jpg
     * suy ra public_id: rtv/sanpham/abc123 (bỏ version, bỏ đuôi file)
     */
    private static function extractPublicId(string $url): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (!$path) {
            return null;
        }

        $marker = '/upload/';
        $pos = strpos($path, $marker);
        if ($pos === false) {
            return null;
        }

        $afterUpload = substr($path, $pos + strlen($marker));
        $afterUpload = preg_replace('#^v\d+/#', '', $afterUpload);
        $publicId = preg_replace('/\.[a-zA-Z0-9]+$/', '', $afterUpload);

        return $publicId !== '' ? $publicId : null;
    }

    private static function generateSignature(array $params, string $apiSecret): string
    {
        ksort($params);

        $pairs = [];
        foreach ($params as $key => $value) {
            $pairs[] = $key . '=' . $value;
        }

        return sha1(implode('&', $pairs) . $apiSecret);
    }
}