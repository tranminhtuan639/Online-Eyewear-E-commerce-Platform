<?php

class Upload
{
    private const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];
    private const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB mỗi ảnh

    /**
     * Lưu 1 file ảnh đã upload vào thư mục /uploads/{subfolder}/
     * Trả về đường dẫn tương đối (để lưu vào DB), vd: uploads/sanpham/abc123.jpg
     *
     * @throws Exception nếu file không hợp lệ
     */
    public static function saveImage(array $file, string $subfolder): string
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

        $targetDir = __DIR__ . '/../uploads/' . $subfolder . '/';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $fileName = uniqid($subfolder . '_', true) . '.' . $ext;
        $targetPath = $targetDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception('Không thể lưu file lên server');
        }

        // Đường dẫn tương đối trả về để lưu DB / trả về frontend
        return 'uploads/' . $subfolder . '/' . $fileName;
    }

    /**
     * Xoá file vật lý trên đĩa dựa theo đường dẫn tương đối đã lưu trong DB.
     */
    public static function deleteFile(string $relativePath): void
    {
        $fullPath = __DIR__ . '/../' . $relativePath;
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}
