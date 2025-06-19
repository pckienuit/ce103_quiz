document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('flashcard');
    const cardCounter = document.getElementById('card-counter');
    const cardQuestion = document.getElementById('card-question');
    const cardAnswerTitle = document.getElementById('card-answer-title');
    const cardExplanation = document.getElementById('card-explanation');

    const prevBtn = document.getElementById('prev-card-btn');
    const flipBtn = document.getElementById('flip-card-btn');
    const nextBtn = document.getElementById('next-card-btn');    let allQuestions = [];
    let currentCardIndex = 0;

    // Hàm format code trong text (tương tự như trong quiz.js)
    function formatCodeInText(text) {
        // Kiểm tra xem có chứa assembly code không
        const hasAssemblyCode = /\b(MOV|JMP|ADD|SUB|MUL|DIV|SETB|CLR|MOVC|PUSH|POP|CALL|RET)\s+/i.test(text);
        
        if (hasAssemblyCode) {
            // Tìm và format các câu chứa từ "đoạn mã" hoặc "đoạn chương trình"
            if (/đoạn\s+(mã|chương\s+trình)/i.test(text)) {
                // Tách phần mô tả và phần code
                const colonIndex = text.indexOf(':');
                if (colonIndex !== -1) {
                    const description = text.substring(0, colonIndex + 1).trim();
                    const codeText = text.substring(colonIndex + 1).trim();
                    
                    // Làm sạch và tách các lệnh assembly
                    let cleanCode = codeText
                        .replace(/\s*\.\s*$/, '') // Loại bỏ dấu chấm cuối
                        .replace(/\s*(Hãy|Giá trị|Lệnh).*$/, '') // Loại bỏ phần câu hỏi
                        .trim();
                    
                    // Tách các lệnh bằng dấu ; và format
                    const instructions = cleanCode.split(';')
                        .map(inst => inst.trim())
                        .filter(inst => inst && /\b(MOV|JMP|ADD|SUB|MUL|DIV|SETB|CLR|MOVC|PUSH|POP|CALL|RET)\s+/i.test(inst));
                    
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
            // Nếu có code nhưng không theo format "đoạn mã:", highlight inline
            else {
                return text.replace(
                    /\b(MOV|JMP|ADD|SUB|MUL|DIV|SETB|CLR|MOVC|PUSH|POP|CALL|RET)\s+[^.,;]*[;]?/gi,
                    '<code class="language-assembler inline-code">$&</code>'
                );
            }
        }
        
        return text;
    }

    async function fetchQuestions() {
        try {
            const response = await fetch('api/get_questions.php');
            allQuestions = await response.json();
            displayCard();
        } catch (error) {
            cardQuestion.textContent = 'Lỗi tải thẻ học.';
        }
    }    function displayCard() {
        if (allQuestions.length === 0) return;
        
        const questionData = allQuestions[currentCardIndex];
        
        // Format câu hỏi với code highlighting
        const formattedQuestion = formatCodeInText(questionData.question);
        cardQuestion.innerHTML = formattedQuestion;
        
        cardAnswerTitle.innerHTML = `Đáp án: ${questionData.answer}`;
        
        // Format explanation với code highlighting
        const formattedExplanation = formatCodeInText(questionData.explanation);
        cardExplanation.innerHTML = formattedExplanation;

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