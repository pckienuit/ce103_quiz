<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['text']) || empty($input['text'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Text is required']);
    exit;
}

$text = $input['text'];
$apiKey = 'AIzaSyDGzOrar6l7VTm0M-lwnE9qjRGqOfqoBp4';

// Tạo prompt cho Gemini AI
$prompt = "Analyze this text for computer engineering content and identify elements that should be highlighted with <code></code> tags. Focus on:

1. Assembly instructions (MOV, JMP, ADD, SUB, etc.) with proper arguments
2. Technical terms (ROM, RAM, CPU, UART, etc.) when used as standalone terms
3. Hexadecimal numbers (0xFF, 4000H, etc.)
4. Binary numbers (11010110B, etc.)
5. Register names (ACC, DPTR, PSW, etc.)
6. Memory addresses and technical values

IMPORTANT RULES:
- Do NOT highlight these elements if they appear inside Vietnamese words
- Do NOT highlight partial matches (e.g., 'ch' in 'chỉ')
- Only highlight when the term is clearly a technical component
- Preserve existing backticks and LaTeX formulas as-is
- Return ONLY the text with appropriate <code></code> tags added

Text to analyze:
\"$text\"

Return the highlighted text:";

$data = [
    'contents' => [
        [
            'parts' => [
                ['text' => $prompt]
            ]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.1,
        'topK' => 1,
        'topP' => 0.8,
        'maxOutputTokens' => 2048
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" . $apiKey);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    $error = curl_error($ch);
    curl_close($ch);
    http_response_code(500);
    echo json_encode(['error' => 'CURL Error: ' . $error]);
    exit;
}

curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Gemini API Error', 'http_code' => $httpCode, 'response' => $response]);
    exit;
}

$geminiResponse = json_decode($response, true);

if (!isset($geminiResponse['candidates'][0]['content']['parts'][0]['text'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid Gemini response format', 'response' => $geminiResponse]);
    exit;
}

$highlightedText = $geminiResponse['candidates'][0]['content']['parts'][0]['text'];

// Clean up the response (remove any extra quotes or formatting)
$highlightedText = trim($highlightedText, '"\'');

echo json_encode([
    'success' => true,
    'original_text' => $text,
    'highlighted_text' => $highlightedText,
    'api_usage' => [
        'model' => 'gemini-2.5-flash-preview-05-20',
        'timestamp' => date('Y-m-d H:i:s')
    ]
]);
?>
