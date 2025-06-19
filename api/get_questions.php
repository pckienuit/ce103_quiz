<?php
header('Content-Type: application/json; charset=utf-8');

$filePath = 'questions.json';

if (!file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'Tệp dữ liệu không tồn tại.']);
    exit;
}

$json_data = file_get_contents($filePath);

if ($json_data === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Không thể đọc tệp dữ liệu.']);
    exit;
}

// Không cần decode và encode lại, chỉ cần echo trực tiếp
echo $json_data;
?>