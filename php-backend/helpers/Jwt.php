<?php

/**
 * JWT tối giản (thuật toán HS256), tự viết thay vì cài thư viện ngoài
 * (project hiện chưa dùng Composer autoload, thêm package ngoài dễ gây
 * lỗi build trên Railway nếu bước "composer install" không chạy đúng).
 * Chỉ đủ dùng cho mục đích xác thực đơn giản của app này.
 */
class Jwt
{
    public static function encode(array $payload, string $secret): string
    {
        $header = ['typ' => 'JWT', 'alg' => 'HS256'];

        $segments = [
            self::base64UrlEncode(json_encode($header)),
            self::base64UrlEncode(json_encode($payload)),
        ];

        $signature = hash_hmac('sha256', implode('.', $segments), $secret, true);
        $segments[] = self::base64UrlEncode($signature);

        return implode('.', $segments);
    }

    /**
     * Trả về payload (array) nếu token hợp lệ và chưa hết hạn.
     * Ném exception nếu token sai định dạng, sai chữ ký, hoặc đã hết hạn.
     */
    public static function decode(string $token, string $secret): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new \RuntimeException('Token không hợp lệ');
        }
        [$headerB64, $payloadB64, $signatureB64] = $parts;

        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "$headerB64.$payloadB64", $secret, true)
        );

        // hash_equals thay vì === để tránh timing attack khi so sánh chữ ký
        if (!hash_equals($expectedSignature, $signatureB64)) {
            throw new \RuntimeException('Chữ ký token không hợp lệ');
        }

        $payload = json_decode(self::base64UrlDecode($payloadB64), true);
        if (!is_array($payload)) {
            throw new \RuntimeException('Token không hợp lệ');
        }

        if (isset($payload['exp']) && time() > $payload['exp']) {
            throw new \RuntimeException('Token đã hết hạn');
        }

        return $payload;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        $padded = $remainder ? str_pad($data, strlen($data) + (4 - $remainder), '=') : $data;
        return base64_decode(strtr($padded, '-_', '+/'));
    }
}