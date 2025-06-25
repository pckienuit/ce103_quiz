<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Đường dẫn đến file JSON
$jsonFile = 'it007_questions.json';

// Kiểm tra file có tồn tại không
if (!file_exists($jsonFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'File câu hỏi IT007 không tồn tại']);
    exit;
}

// Đọc nội dung file
$jsonContent = file_get_contents($jsonFile);

// Kiểm tra đọc file thành công
if ($jsonContent === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Không thể đọc file câu hỏi IT007']);
    exit;
}

// Decode JSON
$questions = json_decode($jsonContent, true);

// Kiểm tra JSON hợp lệ
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'File JSON IT007 không hợp lệ: ' . json_last_error_msg()]);
    exit;
}

// Kiểm tra có câu hỏi không
if (empty($questions) || !is_array($questions)) {
    http_response_code(500);
    echo json_encode(['error' => 'Không có câu hỏi IT007 trong file']);
    exit;
}

// Trả về câu hỏi với header UTF-8
echo json_encode($questions, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
