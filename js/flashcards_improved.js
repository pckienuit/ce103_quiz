document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('flashcard');
    const cardCounter = document.getElementById('card-counter');
    const cardQuestion = document.getElementById('card-question');
    const cardAnswerTitle = document.getElementById('card-answer-title');
    const cardExplanation = document.getElementById('card-explanation');

    const prevBtn = document.getElementById('prev-card-btn');
    const flipBtn = document.getElementById('flip-card-btn');
    const nextBtn = document.getElementById('next-card-btn');

    let allQuestions = [];
    let currentCardIndex = 0;

    // Hàm format code trong text với logic cải tiến và an toàn hơn
    function formatCodeInText(text) {
        let formattedText = text;
        
        // 1. Bảo vệ nội dung trong backticks và math formulas
        const protectedContent = [];
        
        // Bảo vệ backticks
        formattedText = formattedText.replace(/`([^`]+)`/g, function(match, content, offset) {
            const placeholder = `__PROTECTED_${protectedContent.length}__`;
            protectedContent.push(`<code class="inline-code-bright">${content}</code>`);
            return placeholder;
        });
        
        // Bảo vệ công thức LaTeX (Math formulas)
        formattedText = formattedText.replace(/\$\$[^$]+\$\$|\$[^$]+\$/g, function(match, offset) {
            const placeholder = `__PROTECTED_${protectedContent.length}__`;
            protectedContent.push(match);
            return placeholder;
        });
        
        // 2. Xử lý assembly code blocks (đoạn mã hoàn chỉnh)
        if (/đoạn\s+(mã|chương\s+trình)/i.test(formattedText)) {
            const colonIndex = formattedText.indexOf(':');
            if (colonIndex !== -1) {
                const description = formattedText.substring(0, colonIndex + 1).trim();
                const afterColon = formattedText.substring(colonIndex + 1);
                
                // Tìm phần code assembly
                const codeMatch = afterColon.match(/^[^.!?]*?(?=\.|$)/);
                if (codeMatch) {
                    const codeText = codeMatch[0].trim();
                    const remainingText = afterColon.substring(codeMatch[0].length).trim();
                    
                    // Kiểm tra có chứa lệnh assembly không
                    if (/\b(MOV|JMP|ADD|SUB|MUL|DIV|SETB|CLR|MOVC|PUSH|POP|CALL|RET|DJNZ|CJNE|JZ|JNZ|JC|JNC)\s+/i.test(codeText)) {
                        let cleanCode = codeText
                            .replace(/\s*[.!?]\s*$/, '')
                            .replace(/^\s*[:;,]\s*/, '')
                            .trim();
                        
                        const instructions = cleanCode.split(/[;,]/)
                            .map(inst => inst.trim())
                            .filter(inst => inst && /\b(MOV|JMP|ADD|SUB|MUL|DIV|SETB|CLR|MOVC|PUSH|POP|CALL|RET|DJNZ|CJNE|JZ|JNZ|JC|JNC)\s+/i.test(inst));
                        
                        if (instructions.length > 0) {
                            const formattedCode = instructions.join(';\n');
                            formattedText = `
                                <div class="question-with-code">
                                    <p>${description}</p>
                                    <div class="code-label">Assembly Code</div>
                                    <div class="code-block">
                                        <pre><code class="language-assembler">${formattedCode}</code></pre>
                                    </div>
                                    ${remainingText ? `<p>${remainingText}</p>` : ''}
                                </div>
                            `;
                            // Khôi phục nội dung đã bảo vệ và return
                            return restoreProtectedContent(formattedText, protectedContent);
                        }
                    }
                }
            }
        }
          // 3. Highlight assembly instructions riêng lẻ - CHỈ khi chắc chắn là lệnh assembly
        formattedText = formattedText.replace(
            /(?:^|[\s\.,;:!?\(\)\[\]])(MOV|JMP|ADD|SUB|MUL|DIV|SETB|CLR|MOVC|PUSH|POP|CALL|RET|DJNZ|CJNE|JZ|JNZ|JC|JNC)\s+([A-Z0-9#@,\+\-\[\]\s]+?)(?=[\s\.,;:!?\(\)\[\]]|$)/gi,
            function(match, instruction, args, offset) {
                // Kiểm tra toàn bộ từ chứa instruction để đảm bảo không phải từ tiếng Việt
                const fullText = formattedText;
                const matchStart = offset;
                const matchEnd = offset + match.length;
                
                // Lấy context rộng hơn để kiểm tra
                const contextBefore = fullText.substring(Math.max(0, matchStart - 20), matchStart);
                const contextAfter = fullText.substring(matchEnd, Math.min(fullText.length, matchEnd + 20));
                
                // Kiểm tra từ hoàn chỉnh chứa instruction
                const wordBoundaryBefore = /\s|^|[\.,;:!?\(\)\[\]]/.test(fullText.charAt(matchStart - 1) || ' ');
                const wordBoundaryAfter = /\s|$|[\.,;:!?\(\)\[\]]/.test(fullText.charAt(matchEnd) || ' ');
                
                // Không highlight nếu không có word boundary rõ ràng
                if (!wordBoundaryBefore || !wordBoundaryAfter) {
                    return match;
                }
                
                // Kiểm tra có phải trong từ tiếng Việt không
                const vietnamesePattern = /[a-zàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỹỵỷđ]/i;
                
                // Kiểm tra ký tự trước instruction
                const charBeforeInstruction = fullText.charAt(matchStart - 1);
                if (charBeforeInstruction && vietnamesePattern.test(charBeforeInstruction)) {
                    return match;
                }
                
                // Kiểm tra trong context có từ tiếng Việt chứa instruction không
                const beforeWords = contextBefore.split(/\s+/).filter(w => w.length > 0);
                const afterWords = contextAfter.split(/\s+/).filter(w => w.length > 0);
                
                // Kiểm tra từ cuối trong context trước
                if (beforeWords.length > 0) {
                    const lastWord = beforeWords[beforeWords.length - 1];
                    if (lastWord.toLowerCase().includes(instruction.toLowerCase()) && vietnamesePattern.test(lastWord)) {
                        return match;
                    }
                }
                
                // Kiểm tra từ đầu trong context sau
                if (afterWords.length > 0) {
                    const firstWord = afterWords[0];
                    if (firstWord.toLowerCase().includes(instruction.toLowerCase()) && vietnamesePattern.test(firstWord)) {
                        return match;
                    }
                }
                
                // Kiểm tra args có hợp lệ không
                if (!args.trim() || args.trim().length === 0) {
                    return match;
                }
                
                // Kiểm tra args có format assembly đúng không
                const validAssemblyArgs = /^[A-Z0-9#@,\+\-\[\]\s\.]+$/i.test(args.trim());
                if (!validAssemblyArgs) {
                    return match;
                }
                
                // Tách start character nếu có
                const startChar = match.charAt(0);
                const instructionPart = `${instruction} ${args.trim()}`;
                
                // Chỉ highlight nếu tất cả điều kiện đều thỏa mãn
                if (!/[a-zA-Z]/.test(startChar) || /[\s\.,;:!?\(\)\[\]]/.test(startChar)) {
                    return `${startChar === instruction.charAt(0) ? '' : startChar}<code class="language-assembler inline-code-bright">${instructionPart}</code>`;
                }
                
                return match;
            }
        );
        
        // 4. Highlight các thuật ngữ kỹ thuật - CHỈ khi là từ riêng biệt và không phải tiếng Việt
        formattedText = formattedText.replace(
            /\b(ROM|RAM|EEPROM|UART|SPI|I2C|PWM|ADC|DAC|CPU|ALU|PC|SP|DPTR|ACC|PSW|IE|IP|TCON|TMOD|SCON|SBUF|TH0|TL0|TH1|TL1)\b/g,
            function(match, p1, offset) {
                // Kiểm tra context để tránh highlight sai
                const beforeChar = offset > 0 ? formattedText[offset - 1] : ' ';
                const afterChar = offset + match.length < formattedText.length ? formattedText[offset + match.length] : ' ';
                
                // Không highlight nếu nằm trong từ tiếng Việt
                if (/[a-zàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỹỵỷđ]/i.test(beforeChar) ||
                    /[a-zàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỹỵỷđ]/i.test(afterChar)) {
                    return match;
                }
                
                return `<span class="tech-term">${match}</span>`;
            }
        );
        
        // 5. Highlight các số hex và binary - an toàn hơn với pattern chính xác
        formattedText = formattedText.replace(
            /\b(0x[0-9A-Fa-f]{1,8}|[0-9A-Fa-f]{1,4}[Hh]|[01]{4,16}[Bb])\b/g,
            '<span class="number-highlight">$1</span>'
        );
        
        // 6. Highlight biến công thức - CHỈ khi không trong context toán học
        formattedText = formattedText.replace(
            /\b(T_machine|f_osc|T_cycle|N_instructions)\b/g,
            function(match, p1, offset) {
                // Kiểm tra có trong công thức toán học không
                const context = formattedText.substring(Math.max(0, offset - 30), Math.min(formattedText.length, offset + match.length + 30));
                
                // Không highlight nếu có dấu toán học xung quanh hoặc trong protected content
                if (/[=+\-*/]/.test(context) || /__PROTECTED_\d+__/.test(context)) {
                    return match;
                }
                
                return `<span class="formula-var">${match}</span>`;
            }
        );
        
        // 7. Khôi phục nội dung đã bảo vệ
        return restoreProtectedContent(formattedText, protectedContent);
    }
    
    // Hàm khôi phục nội dung đã bảo vệ
    function restoreProtectedContent(text, protectedContent) {
        protectedContent.forEach((replacement, index) => {
            text = text.replace(`__PROTECTED_${index}__`, replacement);
        });
        return text;
    }

    // Fetch flashcards từ API
    async function fetchQuestions() {
        try {
            const response = await fetch('api/flashcards.json');
            allQuestions = await response.json();
            displayCard();
        } catch (error) {
            cardQuestion.textContent = 'Lỗi tải thẻ học.';
        }
    }

    // Hiển thị flashcard hiện tại
    function displayCard() {
        if (allQuestions.length === 0) return;
        
        const cardData = allQuestions[currentCardIndex];
        
        // Format term với code highlighting cải tiến
        const formattedTerm = formatCodeInText(cardData.term);
        cardQuestion.innerHTML = formattedTerm;
        
        // Hiển thị topic và term
        cardAnswerTitle.innerHTML = `<strong>Chủ đề:</strong> ${cardData.topic}`;
        
        // Format definition với code highlighting cải tiến
        const formattedDefinition = formatCodeInText(cardData.definition);
        cardExplanation.innerHTML = formattedDefinition;

        cardCounter.textContent = `${currentCardIndex + 1} / ${allQuestions.length}`;
        card.classList.remove('is-flipped');
        
        // Render code highlighting với Prism.js
        if (window.Prism) {
            Prism.highlightAllUnder(cardQuestion);
            Prism.highlightAllUnder(cardExplanation);
        }

        // Render lại các công thức toán học với MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([cardQuestion, cardExplanation]).catch(function (err) {
                console.log('MathJax error: ' + err.message);
            });
        }
    }

    // Lật thẻ
    function flipCard() {
        card.classList.toggle('is-flipped');
    }

    // Chuyển tới thẻ tiếp theo
    function nextCard() {
        currentCardIndex = (currentCardIndex + 1) % allQuestions.length;
        displayCard();
    }

    // Quay về thẻ trước
    function prevCard() {
        currentCardIndex = (currentCardIndex - 1 + allQuestions.length) % allQuestions.length;
        displayCard();
    }

    // Gán sự kiện
    card.addEventListener('click', flipCard);
    flipBtn.addEventListener('click', flipCard);
    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);

    // Khởi tạo
    fetchQuestions();
});
