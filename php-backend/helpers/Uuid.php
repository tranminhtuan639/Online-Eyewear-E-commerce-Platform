<?php

class Uuid
{
    /**
     * Sinh UUID v4, dùng làm id cho các bảng (thay cho gen_random_uuid() của Postgres).
     */
    public static function v4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // version 4
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // variant

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
