<?php
require_once __DIR__ . '/config.php';

/**
 * Trả về kết nối PDO dùng chung (singleton).
 */
function getDbConnection(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST
            . ';port=' . DB_PORT
            . ';dbname=' . DB_NAME
            . ';charset=' . DB_CHARSET;

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');

            $message = 'Không kết nối được database';
            if (defined('APP_DEBUG') && APP_DEBUG) {
                $message .= ': ' . $e->getMessage();
            }

            echo json_encode([
                'success' => false,
                'message' => $message,
            ]);

            exit;
        }
    }

    return $pdo;
}