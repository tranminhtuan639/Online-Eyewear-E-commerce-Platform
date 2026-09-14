<?php

class Upload
{
    private const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];
    private const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB mỗi ảnh

    private const CLOUDINARY_UPLOAD_URL  = 'https://api.cloudinary.com/v1_1/%s/image/upload';
    private const CLOUDINARY_DESTROY_URL = 'https://api.cloudinary.com/v1_1/%s/image/destroy';

    /**
     * Lưu 1 file ảnh đã upload.
     * - Nếu có đủ cấu hình CLOUDINARY_* trong .env -> upload lên Cloudinary,
     *   trả về URL đầy đủ (dùng cho môi trường production/Railway).
     * - Nếu KHÔNG có cấu hình Cloudinary -> lưu local vào /uploads/{subfolder}/
     *   như cách cũ, trả về path tương đối (dùng cho local dev, đỡ phải tạo
     *   tài khoản Cloudinary khi chỉ chạy thử trên máy).
     *
     * @throws Exception nếu file không hợp lệ hoặc upload thất bại
     */
    public static function saveImage(array $file, string $subfolder): string
    {
        self::validateFile($file);

        $credentials = self::getCredentials();

        return $credentials !== null
            ? self::saveToCloudinary($file, $subfolder, $credentials)
            : self::saveToLocalDisk($file, $subfolder);
    }

    /**
     * Xoá ảnh. Tự nhận diện dựa trên định dạng lưu:
     * - URL tuyệt đối (Cloudinary) -> gọi API xoá trên Cloudinary
     * - Path tương đối (local, dev hoặc ảnh cũ trước khi đổi) -> unlink() trực tiếp
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

    // ================== LOCAL (dev, không có Cloudinary) ==================

    private static function saveToLocalDisk(array $file, string $subfolder): string
    {
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        $targetDir = __DIR__ . '/../uploads/' . $subfolder . '/';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $fileName = uniqid($subfolder . '_', true) . '.' . $ext;
        $targetPath = $targetDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception('Không thể lưu file lên server');
        }

        return 'uploads/' . $subfolder . '/' . $fileName;
    }

    // ================== CLOUDINARY (production) ==================

    private static function saveToCloudinary(array $file, string $subfolder, array $credentials): string
    {
        [$cloudName, $apiKey, $apiSecret] = $credentials;

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

        return $result['secure_url'];
    }

    private static function deleteFromCloudinary(string $url): void
    {
        $publicId = self::extractPublicId($url);
        if ($publicId === null) {
            return; // không parse được public_id thì bỏ qua, không chặn luồng chính
        }

        $credentials = self::getCredentials();
        if ($credentials === null) {
            return; // môi trường hiện tại không cấu hình Cloudinary, không xoá được
        }

        [$cloudName, $apiKey, $apiSecret] = $credentials;

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

    // ================== DÙNG CHUNG ==================

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
     * Trả về [cloudName, apiKey, apiSecret] nếu có ĐỦ cả 3 biến CLOUDINARY_*
     * trong .env, ngược lại trả về null (báo hiệu dùng local disk thay thế).
     *
     * @return array{0:string,1:string,2:string}|null
     */
    private static function getCredentials(): ?array
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME', '');
        $apiKey    = env('CLOUDINARY_API_KEY', '');
        $apiSecret = env('CLOUDINARY_API_SECRET', '');

        if ($cloudName === '' || $apiKey === '' || $apiSecret === '') {
            return null;
        }

        return [$cloudName, $apiKey, $apiSecret];
    }

    private static function isAbsoluteUrl(string $value): bool
    {
        return str_starts_with($value, 'http://') || str_starts_with($value, 'https://');
    }
}