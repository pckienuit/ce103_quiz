/**
 * Gemini AI Integration for Smart Code Highlighting
 * Replaces string-based highlighting with intelligent AI analysis
 */

class GeminiHighlighter {
    constructor() {
        this.apiEndpoint = 'api/gemini_analyzer.php';
        this.cache = new Map(); // Cache để tránh gọi API nhiều lần cho cùng text
        this.maxCacheSize = 100;
        this.cacheHits = 0;
        this.cacheMisses = 0;
    }

    /**
     * Phân tích text với Gemini AI và trả về text đã highlight
     * @param {string} text - Text cần phân tích
     * @returns {Promise<string>} - Text đã được highlight
     */    async analyzeText(text) {
        // Kiểm tra cache trước
        const cacheKey = this.hashText(text);
        if (this.cache.has(cacheKey)) {
            this.cacheHits++;
            return this.cache.get(cacheKey);
        }

        this.cacheMisses++;
        
        // Bảo vệ backticks và LaTeX formulas trước khi gửi đến AI
        const protectedData = this.protectContent(text);
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: protectedData.protectedText
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Unknown API error');
            }

            // Khôi phục nội dung đã bảo vệ
            const finalText = this.restoreProtectedContent(
                result.highlighted_text, 
                protectedData.protectedContent
            );

            // Lưu vào cache
            this.addToCache(cacheKey, finalText);
            
            return finalText;        } catch (error) {
            console.error('Gemini AI analysis failed:', error);
            
            // Không có fallback - chỉ hiển thị error state
            throw new Error(`AI Analysis Failed: ${error.message}. Please check your internet connection or try again later.`);
        }
    }

    /**
     * Bảo vệ nội dung trong backticks và LaTeX formulas
     * @param {string} text 
     * @returns {Object} {protectedText, protectedContent}
     */
    protectContent(text) {
        const protectedContent = [];
        let protectedText = text;

        // Bảo vệ backticks
        protectedText = protectedText.replace(/`([^`]+)`/g, (match, content) => {
            const placeholder = `__PROTECTED_${protectedContent.length}__`;
            protectedContent.push(`<code class="inline-code-bright">${content}</code>`);
            return placeholder;
        });

        // Bảo vệ LaTeX formulas
        protectedText = protectedText.replace(/\$\$[^$]+\$\$|\$[^$]+\$/g, (match) => {
            const placeholder = `__PROTECTED_${protectedContent.length}__`;
            protectedContent.push(match);
            return placeholder;
        });

        return { protectedText, protectedContent };
    }

    /**
     * Khôi phục nội dung đã bảo vệ
     * @param {string} text 
     * @param {Array} protectedContent 
     * @returns {string}
     */
    restoreProtectedContent(text, protectedContent) {
        protectedContent.forEach((replacement, index) => {
            text = text.replace(`__PROTECTED_${index}__`, replacement);
        });
        return text;
    }

    /**
     * Tạo hash cho text để làm cache key
     * @param {string} text 
     * @returns {string}
     */
    hashText(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    /**
     * Thêm vào cache với giới hạn kích thước
     * @param {string} key 
     * @param {string} value 
     */
    addToCache(key, value) {
        if (this.cache.size >= this.maxCacheSize) {
            // Xóa item đầu tiên (FIFO)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }    /**
     * Xóa cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Thống kê cache
     * @returns {Object}
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
        };
    }
}

// Tạo instance global
const geminiHighlighter = new GeminiHighlighter();

/**
 * Hàm wrapper để tương thích với code hiện tại
 * @param {string} text 
 * @returns {Promise<string>}
 */
async function formatCodeInTextAI(text) {
    return await geminiHighlighter.analyzeText(text);
}

/**
 * Hàm async để format text với Gemini AI
 * Có thể được sử dụng trong các event handler
 * @param {string} text 
 * @param {Function} callback - Callback nhận kết quả (text, error)
 */
function formatCodeInTextAsync(text, callback) {
    geminiHighlighter.analyzeText(text)
        .then(result => callback(result, null))
        .catch(error => callback(text, error)); // Trả về text gốc nếu lỗi
}

/**
 * Hàm batch processing cho nhiều đoạn text
 * @param {Array<string>} texts 
 * @returns {Promise<Array<string>>}
 */
async function batchFormatTexts(texts) {
    const promises = texts.map(text => geminiHighlighter.analyzeText(text));
    return await Promise.all(promises);
}

// Export cho ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GeminiHighlighter,
        geminiHighlighter,
        formatCodeInTextAI,
        formatCodeInTextAsync,
        batchFormatTexts
    };
}
