document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('flashcard');
    const cardCounter = document.getElementById('card-counter');
    const cardQuestion = document.getElementById('card-question');
    const cardAnswerTitle = document.getElementById('card-answer-title');
    const cardExplanation = document.getElementById('card-explanation');

    const prevBtn = document.getElementById('prev-card-btn');
    const flipBtn = document.getElementById('flip-card-btn');
    const nextBtn = document.getElementById('next-card-btn');    let allQuestions = [];
    let currentCardIndex = 0;    // Hàm format code trong text (cải thiện cho flashcards)
    function formatCodeInText(text) {
        let formattedText = text;
        
        // 1. Xử lý code trong backticks (`) - ưu tiên cao nhất
        formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="inline-code-bright">$1</code>');
        
        // 2. Kiểm tra và xử lý assembly code blocks
        const hasAssemblyCode = /\b(MOV|JMP|ADD|SUB|MUL|DIV|SETB|CLR|MOVC|PUSH|POP|CALL|RET|DJNZ|CJNE|JZ|JNZ|JC|JNC)\s+/i.test(text);
        
        if (hasAssemblyCode) {
            // Tìm và format các câu chứa từ "đoạn mã" hoặc "đoạn chương trình"
            if (/đoạn\s+(mã|chương\s+trình)/i.test(text)) {
                const colonIndex = text.indexOf(':');
                if (colonIndex !== -1) {
                    const description = text.substring(0, colonIndex + 1).trim();
                    const codeText = text.substring(colonIndex + 1).trim();
                    
                    let cleanCode = codeText
                        .replace(/\s*\.\s*$/, '')
                        .replace(/\s*(Hãy|Giá trị|Lệnh).*$/, '')
                        .trim();
                    
                    const instructions = cleanCode.split(';')
                        .map(inst => inst.trim())
                        .filter(inst => inst && /\b(MOV|JMP|ADD|SUB|MUL|DIV|SETB|CLR|MOVC|PUSH|POP|CALL|RET|DJNZ|CJNE|JZ|JNZ|JC|JNC)\s+/i.test(inst));
                    
                    if (instructions.length > 0) {
                        const formattedCode = instructions.join(';\n');
                        return `
                            <div class="question-with-code">
                                <p>${description}</p>
                                <div class="code-label">Assembly Code</div>
                                <div class="code-block">
                                    <pre><code class="language-assembler">${formattedCode}</code></pre>
                                </div>
                                <p>${text.substring(description.length + cleanCode.length + 1).trim()}</p>
                            </div>
                        `;
                    }
                }
            }
            // 3. Highlight assembly instructions không trong backticks
            else {
                formattedText = formattedText.replace(
                    /\b(MOV|JMP|ADD|SUB|MUL|DIV|SETB|CLR|MOVC|PUSH|POP|CALL|RET|DJNZ|CJNE|JZ|JNZ|JC|JNC)\s+[^.,;`]*[;]?/gi,
                    '<code class="language-assembler inline-code-bright">$&</code>'
                );
            }
        }
        
        // 4. Highlight các thuật ngữ kỹ thuật và tên thanh ghi
        formattedText = formattedText.replace(
            /\b(ROM|RAM|EEPROM|UART|SPI|I2C|PWM|ADC|DAC|CPU|ALU|PC|SP|DPTR|ACC|PSW|IE|IP|TCON|TMOD|SCON|SBUF|TH0|TL0|TH1|TL1)\b/g,
            '<span class="tech-term">$&</span>'
        );
        
        // 5. Highlight các số hex và binary
        formattedText = formattedText.replace(
            /\b(0x[0-9A-Fa-f]+|[0-9A-Fa-f]+[Hh]|[01]+[Bb])\b/g,
            '<span class="number-highlight">$&</span>'
        );
        
        // 6. Highlight các công thức và biến
        formattedText = formattedText.replace(
            /\b(T_machine|f_osc|T_cycle|N_instructions)\b/g,
            '<span class="formula-var">$&</span>'
        );
        
        return formattedText;
    }async function fetchQuestions() {
        try {
            const response = await fetch('api/flashcards.json');
            allQuestions = await response.json();
            displayCard();
        } catch (error) {
            cardQuestion.textContent = 'Lỗi tải thẻ học.';
        }
    }    function displayCard() {
        if (allQuestions.length === 0) return;
        
        const cardData = allQuestions[currentCardIndex];
        
        // Format term với code highlighting
        const formattedTerm = formatCodeInText(cardData.term);
        cardQuestion.innerHTML = formattedTerm;
        
        // Hiển thị topic và term
        cardAnswerTitle.innerHTML = `<strong>Chủ đề:</strong> ${cardData.topic}`;
        
        // Format definition với code highlighting
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

    function flipCard() {
        card.classList.toggle('is-flipped');
    }

    function nextCard() {
        currentCardIndex = (currentCardIndex + 1) % allQuestions.length;
        displayCard();
    }

    function prevCard() {
        currentCardIndex = (currentCardIndex - 1 + allQuestions.length) % allQuestions.length;
        displayCard();
    }

    card.addEventListener('click', flipCard);
    flipBtn.addEventListener('click', flipCard);
    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);

    fetchQuestions();
});