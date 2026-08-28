<?php

class Sanitize
{
    // Danh sách thẻ HTML được phép giữ lại từ nội dung editor (TinyMCE/CKEditor).
    // Cố tình KHÔNG cho phép <script>, <iframe>, <style>, <form>...
    private const ALLOWED_TAGS = '<p><br><b><strong><i><em><u><s><ul><ol><li><a><img><h1><h2><h3><h4><blockquote><span><div><table><thead><tbody><tr><td><th>';

    /**
     * Lọc HTML thô từ rich text editor trước khi lưu DB:
     * 1. Bỏ hết các thẻ không nằm trong danh sách cho phép (strip_tags)
     * 2. Bỏ các thuộc tính onXxx="..." (onerror, onclick, onload...) - nguồn XSS phổ biến nhất
     * 3. Bỏ href/src bắt đầu bằng "javascript:"
     *
     * Lưu ý: đây là lọc cơ bản đủ dùng cho đồ án. Nếu làm sản phẩm thật,
     * nên dùng thư viện chuyên dụng như HTMLPurifier để lọc kỹ hơn.
     */
    public static function cleanHtml(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        $clean = strip_tags($html, self::ALLOWED_TAGS);

        // Bỏ thuộc tính on... (onerror=, onclick=, onload=...)
        $clean = preg_replace('/\s+on\w+\s*=\s*("[^"]*"|\'[^\']*\')/i', '', $clean);

        // Bỏ href/src dạng javascript:...
        $clean = preg_replace('/(href|src)\s*=\s*("|\')\s*javascript:[^"\']*("|\')/i', '$1=""', $clean);

        return $clean;
    }
}
