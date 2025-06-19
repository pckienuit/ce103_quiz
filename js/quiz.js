document.addEventListener('DOMContentLoaded', () => {    // Các biến tham chiếu đến các phần tử HTML
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const startBtn = document.getElementById('start-quiz-btn');
    const nextBtn = document.getElementById('next-question-btn');
    const restartBtn = document.getElementById('restart-quiz-btn');
    const exitBtn = document.getElementById('exit-quiz-btn');
    
    const questionCounter = document.getElementById('question-counter');
    const timerDisplay = document.getElementById('timer');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const explanationArea = document.getElementById('explanation-area');
    const explanationText = document.getElementById('explanation-text');

    const scoreDisplay = document.getElementById('score');
    const percentageDisplay = document.getElementById('percentage');
    const resultMessage = document.getElementById('result-message');

    let allQuestions = [];
    let currentQuizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timerInterval;
    const QUIZ_DURATION = 70 * 60; // 70 phút tính bằng giây
    const NUM_QUESTIONS = 40;

    // Hàm fetch câu hỏi từ backend
    async function fetchQuestions() {
        try {
            const response = await fetch('api/get_questions.php');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            allQuestions = await response.json();
        } catch (error) {
            console.error('Không thể tải câu hỏi:', error);
            questionText.textContent = 'Lỗi tải câu hỏi. Vui lòng thử lại sau.';
        }
    }

    // Hàm xáo trộn mảng (Fisher-Yates shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Hàm bắt đầu quiz
    function startQuiz() {
        startScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');

        currentQuestionIndex = 0;
        score = 0;
        shuffleArray(allQuestions);
        currentQuizQuestions = allQuestions.slice(0, NUM_QUESTIONS);

        displayQuestion();
        startTimer();
    }    // Hàm format code trong text
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

    // Hàm hiển thị câu hỏi
    function displayQuestion() {
        resetState();
        const question = currentQuizQuestions[currentQuestionIndex];
        questionCounter.textContent = `Câu ${currentQuestionIndex + 1} / ${NUM_QUESTIONS}`;
        
        // Format câu hỏi với code highlighting
        const formattedQuestion = formatCodeInText(question.question);
        questionText.innerHTML = formattedQuestion;

        for (const key in question.options) {
            const button = document.createElement('button');
            const formattedOption = formatCodeInText(question.options[key]);
            button.innerHTML = `<strong>${key}.</strong> ${formattedOption}`;
            button.classList.add('option-btn');
            button.dataset.answer = key;
            button.addEventListener('click', selectAnswer);
            optionsContainer.appendChild(button);
        }

        // Render code highlighting với Prism.js
        if (window.Prism) {
            Prism.highlightAllUnder(questionText);
            Prism.highlightAllUnder(optionsContainer);
        }

        // Render lại các công thức toán học với MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([questionText, optionsContainer]).catch(function (err) {
                console.log('MathJax error: ' + err.message);
            });
        }
    }

    // Hàm reset trạng thái trước khi hiển thị câu hỏi mới
    function resetState() {
        optionsContainer.innerHTML = '';
        explanationArea.classList.add('hidden');
        nextBtn.classList.add('hidden');
    }

    // Hàm xử lý khi chọn câu trả lời
    function selectAnswer(e) {
        const selectedBtn = e.target.closest('.option-btn');
        if (!selectedBtn) return;

        const selectedAnswer = selectedBtn.dataset.answer;
        const correctAnswer = currentQuizQuestions[currentQuestionIndex].answer;

        if (selectedAnswer === correctAnswer) {
            score++;
            selectedBtn.classList.add('correct');
        } else {
            selectedBtn.classList.add('incorrect');
        }

        // Hiển thị đáp án đúng và giải thích
        Array.from(optionsContainer.children).forEach(button => {
            if (button.dataset.answer === correctAnswer) {
                button.classList.add('correct');
            }
            button.disabled = true; // Vô hiệu hóa các lựa chọn
        });        explanationText.innerHTML = formatCodeInText(currentQuizQuestions[currentQuestionIndex].explanation);
        explanationArea.classList.remove('hidden');
        
        // Render code highlighting với Prism.js cho explanation
        if (window.Prism) {
            Prism.highlightAllUnder(explanationText);
        }
        
        // Render lại các công thức toán học với MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([explanationText]).catch(function (err) {
                console.log('MathJax error: ' + err.message);
            });
        }
        
        nextBtn.classList.remove('hidden');
    }

    // Hàm bắt đầu đếm giờ
    function startTimer() {
        let timeLeft = QUIZ_DURATION;
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `Thời gian: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showResults();
            }
        }, 1000);
    }
    
    // Hàm hiển thị kết quả
    function showResults() {
        clearInterval(timerInterval);
        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        const percentage = ((score / NUM_QUESTIONS) * 100).toFixed(2);
        scoreDisplay.textContent = score;
        percentageDisplay.textContent = percentage;

        if (percentage >= 50) {
            resultMessage.textContent = 'Chúc mừng! Bạn đã qua môn.';
            resultMessage.style.color = 'green';
        } else {
            resultMessage.textContent = 'Rất tiếc, bạn cần cố gắng hơn.';
            resultMessage.style.color = 'red';
        }
    }    // Hàm thoát quiz và quay về trang chủ
    function exitQuiz() {
        const confirmExit = confirm('Bạn có chắc chắn muốn thoát? Tiến trình làm bài sẽ bị mất.');
        if (confirmExit) {
            clearInterval(timerInterval);
            window.location.href = 'index.html';
        }
    }

    // Xử lý phím tắt (ESC để thoát)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !quizScreen.classList.contains('hidden')) {
            exitQuiz();
        }
    });

    // Gán sự kiện cho các nút
    startBtn.addEventListener('click', startQuiz);
    exitBtn.addEventListener('click', exitQuiz);
    
    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < NUM_QUESTIONS) {
            displayQuestion();
        } else {
            showResults();
        }
    });

    restartBtn.addEventListener('click', startQuiz);

    // Tải câu hỏi ngay khi trang được mở
    fetchQuestions();
});